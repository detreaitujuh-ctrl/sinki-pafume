import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '35mb' }));

const DATA_DIR = path.resolve(__dirname, 'data');
const ASSETS_FILE = path.join(DATA_DIR, 'assets.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Konfigurasi Supabase Storage (Metode A: Upsert/Overwrite Otomatis)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tsxclttisxnmvdkwziqx.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzeGNsdHRpc3hubXZka3d6aXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTUyNTQxMiwiZXhwIjoyMTA3MTAxNDEyfQ.f-nMns4K9XMWMeeTO9PTFADoM77IXVtsAlEfvQg-Zfo';
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'sinki-media';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Upload helper ke Supabase Storage dengan Metode A (upsert: true).
 * Otomatis menimpa & menghapus foto lama dengan nama file yang sama persis.
 */
async function uploadToSupabaseWithOverwrite(
  fileName: string,
  base64Data: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    if (!base64Data || !base64Data.startsWith('data:')) {
      return { success: true, url: base64Data };
    }

    const matches = base64Data.match(/^data:([A-Za-z0-9\-+\/]+);base64,(.+)$/);
    if (!matches || matches.length < 3) {
      return { success: false, error: 'Format data gambar tidak valid' };
    }

    const contentType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    // Metode A: Upload dengan opsi upsert: true
    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(fileName, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.warn(`[Supabase Upload Notice] (${fileName}):`, uploadError.message);
      return { success: false, error: uploadError.message };
    }

    // Ambil Public URL dengan timestamp cache-buster agar publik langsung melihat foto terbaru
    const { data: pubData } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(fileName);

    const finalUrl = `${pubData.publicUrl}?v=${Date.now()}`;
    console.log(`[Supabase Storage] Berhasil upload & overwrite foto: ${fileName} -> ${finalUrl}`);
    return { success: true, url: finalUrl };
  } catch (err: any) {
    console.error(`[Supabase Storage Exception] (${fileName}):`, err);
    return { success: false, error: err?.message || 'Gagal upload ke Supabase' };
  }
}

interface AssetsData {
  logo: string | null;
  chibi: string | null;
  qrisImage?: string | null;
  top11?: Record<string, string>;
  pricing?: any;
  updatedAt?: string;
}

const getAssets = (): AssetsData => {
  if (fs.existsSync(ASSETS_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(ASSETS_FILE, 'utf-8'));
      return {
        logo: parsed.logo || null,
        chibi: parsed.chibi || null,
        qrisImage: parsed.qrisImage || null,
        top11: parsed.top11 && typeof parsed.top11 === 'object' ? parsed.top11 : {},
        pricing: parsed.pricing,
        updatedAt: parsed.updatedAt,
      };
    } catch {
      return { logo: null, chibi: null, qrisImage: null, top11: {} };
    }
  }
  return { logo: null, chibi: null, qrisImage: null, top11: {} };
};

// GET public assets (used by all visitors and shared links)
app.get('/api/public-assets', (_req, res) => {
  const data = getAssets();
  return res.json(data);
});

// POST update home assets by Owner with PIN 1995
app.post('/api/owner/update-assets', async (req, res) => {
  const { pin, logo, chibi, qrisImage, top11 } = req.body;

  if (pin !== '1995') {
    return res.status(403).json({ error: 'PIN Pemilik tidak valid!' });
  }

  const existing = getAssets();
  let newLogo = existing.logo;
  let newChibi = existing.chibi;
  let newQris = existing.qrisImage || null;
  const newTop11 = { ...(existing.top11 || {}) };

  if (logo !== undefined) {
    if (logo) {
      const up = await uploadToSupabaseWithOverwrite('sinki_logo.png', logo);
      newLogo = up.success && up.url ? up.url : logo;
    } else {
      newLogo = null;
    }
  }

  if (chibi !== undefined) {
    if (chibi) {
      const up = await uploadToSupabaseWithOverwrite('sinki_chibi.png', chibi);
      newChibi = up.success && up.url ? up.url : chibi;
    } else {
      newChibi = null;
    }
  }

  if (qrisImage !== undefined) {
    if (qrisImage) {
      const up = await uploadToSupabaseWithOverwrite('sinki_qris.jpg', qrisImage);
      newQris = up.success && up.url ? up.url : qrisImage;
    } else {
      newQris = null;
    }
  }

  if (top11 !== undefined && typeof top11 === 'object') {
    for (const [vId, pData] of Object.entries(top11)) {
      if (typeof pData === 'string' && pData.startsWith('data:')) {
        const up = await uploadToSupabaseWithOverwrite(`top11/${vId}.jpg`, pData);
        newTop11[vId] = up.success && up.url ? up.url : pData;
      } else if (pData) {
        newTop11[vId] = pData as string;
      }
    }
  }

  const updatedData: AssetsData = {
    logo: newLogo,
    chibi: newChibi,
    qrisImage: newQris,
    top11: newTop11,
    pricing: existing.pricing,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(ASSETS_FILE, JSON.stringify(updatedData), 'utf-8');
  return res.json({
    success: true,
    message: 'Foto SINKI berhasil disimpan & diunggah ke Supabase!',
    data: updatedData,
  });
});

// POST update a specific Top 11 bottle photo by Owner with PIN 1995
app.post('/api/owner/update-top11', async (req, res) => {
  const { pin, variantId, photoData } = req.body;

  if (pin !== '1995') {
    return res.status(403).json({ error: 'PIN Pemilik tidak valid!' });
  }

  if (!variantId || !photoData) {
    return res.status(400).json({ error: 'Data varian atau foto tidak lengkap!' });
  }

  const existing = getAssets();
  const top11 = existing.top11 || {};

  let finalPhoto = photoData;
  if (typeof photoData === 'string' && photoData.startsWith('data:')) {
    const up = await uploadToSupabaseWithOverwrite(`top11/${variantId}.jpg`, photoData);
    if (up.success && up.url) {
      finalPhoto = up.url;
    }
  }

  top11[variantId] = finalPhoto;

  const updatedData: AssetsData = {
    ...existing,
    top11,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(ASSETS_FILE, JSON.stringify(updatedData), 'utf-8');
  return res.json({
    success: true,
    message: `Foto botol Top 11 (${variantId}) berhasil disimpan!`,
    photoUrl: finalPhoto,
  });
});

// POST update pricing configuration by Owner with PIN 1995
app.post('/api/owner/update-pricing', (req, res) => {
  const { pin, pricing } = req.body;

  if (pin !== '1995') {
    return res.status(403).json({ error: 'PIN Pemilik tidak valid!' });
  }

  if (!pricing) {
    return res.status(400).json({ error: 'Data harga tidak lengkap!' });
  }

  const existing = getAssets();
  const updatedData: AssetsData = {
    ...existing,
    pricing,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(ASSETS_FILE, JSON.stringify(updatedData), 'utf-8');
  return res.json({ success: true, message: 'Daftar harga SINKI berhasil disimpan permanen ke server!' });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server SINKI berjalan di http://localhost:${PORT}`);
  });
}

startServer();
