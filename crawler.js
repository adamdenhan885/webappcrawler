const { chromium } = require('playwright');
const { GoogleGenAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Memulai proses login otomatis...');
    await page.goto('https://example.com', { waitUntil: 'networkidle' }); // Ganti URL ini
    
    await page.fill('input[type="email"]', 'email_bot@example.com'); // Ganti selector jika perlu
    await page.fill('input[type="password"]', 'PasswordBot123!');
    
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle' })
    ]);
    console.log('Login Berhasil!');

    // Sesi ambil data
    await page.goto('https://example.com', { waitUntil: 'networkidle' }); // Ganti URL ini
    const dashboardHtml = await page.content();

    // Kirim data ke database Supabase agar masuk ke Lovable
    const { error } = await supabase
      .from('crawler_logs') // Pastikan nama tabel ini sesuai di Supabase kamu
      .insert([{ timestamp: new Date(), target_url: page.url(), status_code: 200, data_type: 'HTML', raw_json: JSON.stringify({ html: dashboardHtml }) }]);

    if (error) throw error;
    console.log('Data masuk ke Supabase!');

  } catch (err) {
    console.error('Robot Error:', err.message);
  } finally {
    await browser.close();
  }
})();
