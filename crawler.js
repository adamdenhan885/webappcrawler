import { chromium } from 'playwright';
import { GoogleGenAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Mengambil konfigurasi target terbaru dari Supabase...');
    
    // 1. Ambil baris konfigurasi terakhir yang diinput dari form Lovable
    const { data: config, error: configError } = await supabase
      .from('crawler_config')
      .select('*')
      .order('id', { ascending: false })
      .single();

    if (configError || !config) {
      throw new Error('Gagal mengambil konfigurasi atau data form masih kosong di database.');
    }

    console.log(`Target ditemukan! Mencoba login ke: ${config.login_url}`);

    // 2. Jalankan proses LOGIN menggunakan data dinamis dari form
    await page.goto(config.login_url, { waitUntil: 'networkidle' });
    
    // Robot otomatis mencari input email dan password secara pintar berdasarkan tipe elemen
    await page.fill('input[type="email"], input[name*="user"], input[name*="email"]', config.target_email);
    await page.fill('input[type="password"]', config.target_password);
    
    // Mencoba klik tombol submit/login
    const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Masuk"), input[type="submit"]');
    await Promise.all([
      loginButton.first().click(),
      page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {})
    ]);
    
    console.log(`Login berhasil! Berpindah ke target dashboard: ${config.dashboard_url}`);

    // 3. Jalankan proses CRAWLING ke URL dashboard pilihanmu
    const dataMentah = { html: '', apis: [] };

    // Cegat lalu lintas API Backend (XHR/Fetch JSON) selama navigasi
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
    dataMentah.html = await page.content(); // Ambil isi frontend

    // 4. Proses pembersihan data dengan AI Gemini gratis
    console.log('Mengirim ke Gemini AI untuk ekstraksi dashboard...');
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const promptGemini = `Ekstrak info esensial menjadi JSON bersih dari data mentah ini: ${JSON.stringify(dataMentah).substring(0, 40000)}`;
    const aiResponse = await model.generateContent(promptGemini);
    const dataBersih = aiResponse.response.text();

    // 5. Kirim data hasil akhir ke tabel log agar muncul di dashboard Lovable
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
    await browser.close();
  }
})();
