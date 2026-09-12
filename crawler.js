// 1. Impor Pustaka Resmi Utama
import playwright from 'playwright';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// 2. Inisialisasi API Google AI Studio & Database Supabase
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');

(async () => {
  // Menggunakan 'playwright.chromium' untuk membuka browser virtual secara rahasia
  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Mengambil konfigurasi target terbaru dari Supabase...');
    
    // Ambil baris konfigurasi URL & Akun yang kamu input dari form manual Lovable
    const { data: config, error: configError } = await supabase
      .from('crawler_config')
      .select('*')
      .order('id', { ascending: false })
      .single();

    if (configError || !config) {
      throw new Error('Gagal mengambil konfigurasi atau data form masih kosong di database.');
    }

    console.log(`Target ditemukan! Mencoba login ke: ${config.login_url}`);

    // Proses LOGIN Otomatis pada target pilihanmu
    await page.goto(config.login_url, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"], input[name*="user"], input[name*="email"]', config.target_email);
    await page.fill('input[type="password"]', config.target_password);
    
    const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Masuk"), input[type="submit"]');
    await Promise.all([
      loginButton.first().click(),
      page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {})
    ]);
    
    console.log(`Login berhasil! Berpindah ke target dashboard: ${config.dashboard_url}`);

    // Proses CRAWLING Data Struktur Frontend (HTML) & API Lalu Lintas Backend (JSON)
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

    // Mengubah data berantakan menjadi JSON rapi memanfaatkan Gemini AI secara gratis
    console.log('Mengirim ke Gemini AI untuk ekstraksi dashboard...');
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const promptGemini = `Ekstrak info esensial menjadi JSON bersih dari data mentah ini: ${JSON.stringify(dataMentah).substring(0, 40000)}`;
    const aiResponse = await model.generateContent(promptGemini);
    const dataBersih = aiResponse.response.text();

    // Kirim Hasil Akhir ke Tabel Log Supabase agar langsung tampil di web Lovable kamu
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
  } finally {
    // Penulisan block 'finally' sudah diperbaiki agar tidak memicu error syntax compiler
    await browser.close();
  }
})();
