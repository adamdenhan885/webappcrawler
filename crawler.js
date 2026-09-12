// 1. Perbaikan Sintaksis Impor Pustaka Sesuai Standar Proyek
import playwright from 'playwright';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// 2. Inisialisasi Kunci API Pustaka
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

(async () => {
  // Menggunakan 'playwright.chromium' sesuai dengan 'import playwright'
  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Mengambil konfigurasi target terbaru dari Supabase...');
    
    // Ambil konfigurasi URL & Akun dari tabel form manual Lovable
    const { data: config, error: configError } = await supabase
      .from('crawler_config')
      .select('*')
      .order('id', { ascending: false })
      .single();

    if (configError || !config) {
      throw new Error('Gagal mengambil konfigurasi atau data form masih kosong di database.');
    }

    console.log(`Target ditemukan! Mencoba login ke: ${config.login_url}`);

    // Proses LOGIN Otomatis
    await page.goto(config.login_url, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"], input[name*="user"], input[name*="email"]', config.target_email);
    await page.fill('input[type="password"]', config.target_password);
    
    const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Masuk"), input[type="submit"]');
    await Promise.all([
      loginButton.first().click(),
      page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {})
    ]);
    
    console.log(`Login berhasil! Berpindah ke target dashboard: ${config.dashboard_url}`);

    // Proses CRAWLING Data Frontend & API Backend
    const dataMentah = { html: '', apis: [] };

    page.on('response', async (res) => {
      if (res.headers()['content-type']?.includes('application/json')) {
        try {
          dataMentah.apis.push({
            url: res.url(),
            status: res.status(),
            payload: await res.json()
          });
        } catch (e) {}
      }
    });

    await page.goto(config.dashboard_url, { waitUntil: 'networkidle' });
    dataMentah.html = await page.content();

    // Optimasi Data dengan Gemini AI Flash
    console.log('Mengirim ke Gemini AI untuk ekstraksi dashboard...');
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const promptGemini = `Ekstrak info esensial menjadi JSON bersih dari data mentah ini: ${JSON.stringify(dataMentah).substring(0, 40000)}`;
    const aiResponse = await model.generateContent(promptGemini);
    const dataBersih = aiResponse.response.text();

    // Kirim Hasil Akhir ke Tabel Log Supabase
    const { error: logError } = await supabase
      .from('crawler_logs')
      .insert([
        {
          timestamp: new Date(),
          target_url: config.dashboard_url,
          status_code: 200,
          data_type: 'Manual Input Run',
          raw_json: dataBersih
        }
      ]);

    if (logError) throw logError;
    console.log('Selesai! Data dari URL manual berhasil masuk ke Dashboard Lovable.');

  } catch (err) {
    console.error('Robot Error:', err.message);
  } final {
    await browser.close();
  }
})();
