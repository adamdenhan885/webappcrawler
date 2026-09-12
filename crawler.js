// 1. Impor Pustaka Resmi Utama (Menggunakan Standar ES Modules)
import playwright from 'playwright';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// 2. Inisialisasi API Google AI Studio & Database Supabase via Environment Variables
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');

(async () => {
  // Menggunakan 'playwright.chromium' untuk membuka browser virtual secara rahasia di GitHub Actions
  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('Mengambil konfigurasi target terbaru dari Supabase...');
    
    // Ambil baris konfigurasi URL & Akun terakhir yang kamu input dari form Lovable
    const { data: config, error: configError } = await supabase
      .from('crawler_config')
      .select('*')
      .order('id', { ascending: false })
      .single();

    if (configError || !config) {
      throw new Error('Gagal mengambil konfigurasi atau data form masih kosong di database.');
    }

    console.log(`Target ditemukan! Mencoba membuka halaman login: ${config.login_url}`);

    // === PROSES LOGIN OTOMATIS (Spesifik Halaman Parlemen NasDem) ===
    await page.goto(config.login_url, { waitUntil: 'networkidle' });
    
    // Mengunci kolom input Email dan mengisi datanya
    await page.fill('input[type="email"], input[placeholder*="Email"], input[placeholder*="email"]', config.target_email);
    
    // Mengunci kolom input Kata Sandi dan mengisi datanya
    await page.fill('input[type="password"]', config.target_password);
    
    console.log('Kredensial form login terisi. Menekan tombol Masuk...');

    // Mengunci tombol biru besar bertuliskan "Masuk"
    const tombolMasuk = page.locator('button:has-text("Masuk"), div[role="button"]:has-text("Masuk"), button[type="submit"]');
    
    // Klik tombol masuk dan tunggu hingga proses autentikasi/pindah halaman selesai
    await Promise.all([
      tombolMasuk.first().click(),
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => {
        console.log('Navigasi eksplisit timeout, mencoba melanjutkan alur...');
      })
    ]);
    
    console.log(`Berhasil melewati gerbang login. Berpindah ke target dashboard data: ${config.dashboard_url}`);

    // === PROSES CRAWLING DATA STRUKTUR (FRONTEND) & LALU LINTAS API (BACKEND) ===
    const dataMentah = { html: '', apis: [] };

    // Aktifkan interceptor untuk mencegat seluruh data JSON dari API backend (Fetch/XHR)
    page.on('response', async (res) => {
      const contentType = res.headers()['content-type'] || '';
      if (contentType.includes('application/json')) {
        try {
          const resUrl = res.url();
          const resStatus = res.status();
          const resPayload = await res.json();
          
          dataMentah.apis.push({
            url: resUrl,
            status: resStatus,
            payload: resPayload
          });
          console.log(`[Backend API Terdeteksi] ${resStatus} -> ${resUrl}`);
        } catch (e) {
          // Abaikan jika payload kosong atau gagal parsing JSON
        }
      }
    });

    // Buka halaman dashboard tujuan utama untuk mulai menguras data
    await page.goto(config.dashboard_url, { waitUntil: 'networkidle' });
    
    // Ambil seluruh struktur DOM/HTML Frontend yang sudah dirender sempurna
    dataMentah.html = await page.content();
    console.log('Selesai menguras struktur Frontend HTML dan API Backend mentah.');

    // === PROSES PEMBERSIHAN & STRUKTURISASI DATA MENGGUNAKAN AI GEMINI ===
    console.log('Mengirim data berantakan ke Gemini AI untuk ekstraksi pintar...');
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const promptGemini = `
      Kamu adalah AI Data Extractor profesional. Tugasmu adalah mengekstrak informasi esensial dan metrik utama dari data gabungan HTML (Frontend) dan API (Backend) berikut menjadi struktur JSON bersih yang rapi agar bisa langsung dirender di komponen dashboard.
      
      Data Mentah: ${JSON.stringify(dataMentah).substring(0, 45000)}
    `;
    
    const aiResponse = await model.generateContent(promptGemini);
    let dataBersih = aiResponse.response.text();

    // Membersihkan format markdown bawaan AI (seperti ```json ... ```) jika ada
    dataBersih = dataBersih.replace(/```json/g, '').replace(/```/g, '').trim();

    // === KIRIM HASIL AKHIR KE TABEL LOG SUPABASE AGAR MUNCUL DI DASHBOARD LOVABLE ===
    console.log('Menyimpan data ringkasan ke database Supabase...');
    const { error: logError } = await supabase
      .from('crawler_logs')
      .insert([
        {
          timestamp: new Date(),
          target_url: config.dashboard_url,
          status_code: 200,
          data_type: 'NasDem Parlemen Run',
          raw_json: dataBersih
        }
      ]);

    if (logError) throw logError;
    console.log('Selesai! Seluruh data sukses dirayap dan langsung terintegrasi ke Dashboard Lovable.');

  } catch (err) {
    console.error('Robot Error:', err.message);
  } finally {
    // Memastikan browser virtual Chromium selalu tertutup di server GitHub Actions untuk menghemat kuota menit
    await browser.close();
  }
})();
