import { createClient } from '@supabase/supabase-js';
import { PricingConfig, getStoredPricing } from './pricingStorage';

// Utility to compress images and store them reliably on Supabase and in LocalStorage
const LOGO_STORAGE_KEY = 'sinki_custom_logo_data';
const CHIBI_STORAGE_KEY = 'sinki_custom_chibi_data';
const QRIS_STORAGE_KEY = 'sinki_custom_qris_data';
const TOP11_STORAGE_KEY = 'sinki_custom_top11_data';

export const SUPABASE_STORAGE_BASE = 'https://tsxclttisxnmvdkwziqx.supabase.co/storage/v1/object/public/sinki-media/';
const SUPABASE_URL = 'https://tsxclttisxnmvdkwziqx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzeGNsdHRpc3hubXZka3d6aXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTUyNTQxMiwiZXhwIjoyMTA3MTAxNDEyfQ.f-nMns4K9XMWMeeTO9PTFADoM77IXVtsAlEfvQg-Zfo';
const SUPABASE_BUCKET = 'sinki-media';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const DEFAULT_LOGO = `${SUPABASE_STORAGE_BASE}sinki_logo.png`;
export const DEFAULT_CHIBI = `${SUPABASE_STORAGE_BASE}sinki_chibi.png`;
export const DEFAULT_QRIS = `${SUPABASE_STORAGE_BASE}sinki_qris.jpg`;

export const getDefaultTop11Map = (): Record<string, string> => {
  const map: Record<string, string> = {};
  for (let i = 1; i <= 11; i++) {
    map[`top-${i}`] = `${SUPABASE_STORAGE_BASE}top11/top-${i}.jpg`;
  }
  return map;
};

// Compress image to ensure it never exceeds browser storage quotas
export const compressImage = (
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = (e) => reject(e);
      img.src = event.target?.result as string;
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

export interface ServerAssetsResponse {
  logo: string | null;
  chibi: string | null;
  qrisImage?: string | null;
  top11?: Record<string, string>;
  pricing?: PricingConfig;
}

// Upload direct to Supabase Storage with upsert: true (Metode A)
export const uploadDirectToSupabase = async (
  fileName: string,
  base64Data: string
): Promise<string | null> => {
  try {
    if (!base64Data) return null;
    if (!base64Data.startsWith('data:')) {
      return base64Data;
    }

    const matches = base64Data.match(/^data:([A-Za-z0-9\-+\/]+);base64,(.+)$/);
    if (!matches || matches.length < 3) {
      return null;
    }

    const contentType = matches[1];
    const byteCharacters = atob(matches[2]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });

    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(fileName, blob, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.warn(`[Supabase Upload Notice] (${fileName}):`, uploadError.message);
      return null;
    }

    const publicUrl = `${SUPABASE_STORAGE_BASE}${fileName}?v=${Date.now()}`;
    return publicUrl;
  } catch (err) {
    console.error('Supabase upload exception:', err);
    return null;
  }
};

// Fetch public assets from server or Supabase directly
export const fetchServerAssets = async (): Promise<ServerAssetsResponse> => {
  // 1. Try local backend route if present (e.g. dev server)
  try {
    const res = await fetch('/api/public-assets');
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data.logo) localStorage.setItem(LOGO_STORAGE_KEY, data.logo);
        if (data.chibi) localStorage.setItem(CHIBI_STORAGE_KEY, data.chibi);
        if (data.qrisImage) localStorage.setItem(QRIS_STORAGE_KEY, data.qrisImage);
        if (data.top11) localStorage.setItem(TOP11_STORAGE_KEY, JSON.stringify(data.top11));
        if (data.pricing) localStorage.setItem('sinki_custom_pricing_config', JSON.stringify(data.pricing));

        return {
          logo: data.logo || DEFAULT_LOGO,
          chibi: data.chibi || DEFAULT_CHIBI,
          qrisImage: data.qrisImage || DEFAULT_QRIS,
          top11: {
            ...getDefaultTop11Map(),
            ...(data.top11 || {}),
          },
          pricing: data.pricing || getStoredPricing(),
        };
      }
    }
  } catch {
    // Expected on static hosting like Netlify
  }

  // 2. Query Supabase directly (works seamlessly on Netlify!)
  try {
    const { data: rootFiles } = await supabase.storage.from(SUPABASE_BUCKET).list('');
    const { data: topFiles } = await supabase.storage.from(SUPABASE_BUCKET).list('top11');

    let logoUrl = DEFAULT_LOGO;
    let chibiUrl = DEFAULT_CHIBI;
    let qrisUrl = DEFAULT_QRIS;
    const top11Map = getDefaultTop11Map();

    if (rootFiles) {
      const logoFile = rootFiles.find((f) => f.name === 'sinki_logo.png');
      if (logoFile && logoFile.updated_at) {
        logoUrl = `${SUPABASE_STORAGE_BASE}sinki_logo.png?v=${new Date(logoFile.updated_at).getTime()}`;
      }
      const chibiFile = rootFiles.find((f) => f.name === 'sinki_chibi.png');
      if (chibiFile && chibiFile.updated_at) {
        chibiUrl = `${SUPABASE_STORAGE_BASE}sinki_chibi.png?v=${new Date(chibiFile.updated_at).getTime()}`;
      }
      const qrisFile = rootFiles.find((f) => f.name === 'sinki_qris.jpg');
      if (qrisFile && qrisFile.updated_at) {
        qrisUrl = `${SUPABASE_STORAGE_BASE}sinki_qris.jpg?v=${new Date(qrisFile.updated_at).getTime()}`;
      }
    }

    if (topFiles) {
      topFiles.forEach((f) => {
        const id = f.name.replace(/\.[^/.]+$/, '');
        if (f.updated_at) {
          top11Map[id] = `${SUPABASE_STORAGE_BASE}top11/${f.name}?v=${new Date(f.updated_at).getTime()}`;
        }
      });
    }

    localStorage.setItem(LOGO_STORAGE_KEY, logoUrl);
    localStorage.setItem(CHIBI_STORAGE_KEY, chibiUrl);
    localStorage.setItem(QRIS_STORAGE_KEY, qrisUrl);
    localStorage.setItem(TOP11_STORAGE_KEY, JSON.stringify(top11Map));

    return {
      logo: logoUrl,
      chibi: chibiUrl,
      qrisImage: qrisUrl,
      top11: top11Map,
      pricing: getStoredPricing(),
    };
  } catch (err) {
    console.warn('Could not query Supabase storage directly, using stored fallback:', err);
  }

  return {
    logo: getStoredLogo(),
    chibi: getStoredChibi(),
    qrisImage: getStoredQris(),
    top11: getStoredTop11(),
    pricing: getStoredPricing(),
  };
};

// Save Home assets (Logo & Chibi) with direct Supabase upload
export const saveAssetToServer = async (
  type: 'logo' | 'chibi',
  base64Data: string,
  pin = '1995'
): Promise<boolean> => {
  try {
    const fileName = type === 'logo' ? 'sinki_logo.png' : 'sinki_chibi.png';
    const storageKey = type === 'logo' ? LOGO_STORAGE_KEY : CHIBI_STORAGE_KEY;

    // 1. Upload directly to Supabase
    const directUrl = await uploadDirectToSupabase(fileName, base64Data);
    const savedUrl = directUrl || base64Data;
    localStorage.setItem(storageKey, savedUrl);

    // 2. Also notify server if available
    try {
      await fetch('/api/owner/update-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, [type]: base64Data }),
      });
    } catch {
      // Ignored on static hosting
    }

    return true;
  } catch (err) {
    console.error('Failed to sync asset:', err);
    return true;
  }
};

// Save Top 11 bottle photo with direct Supabase upload
export const saveTop11PhotoToServer = async (
  variantId: string,
  base64Data: string,
  pin = '1995'
): Promise<boolean> => {
  try {
    const fileName = `top11/${variantId}.jpg`;

    // 1. Direct Supabase Storage upload
    const directUrl = await uploadDirectToSupabase(fileName, base64Data);
    const savedUrl = directUrl || base64Data;

    // 2. Update local storage
    const current = getStoredTop11();
    current[variantId] = savedUrl;
    localStorage.setItem(TOP11_STORAGE_KEY, JSON.stringify(current));

    // 3. Notify server if available
    try {
      await fetch('/api/owner/update-top11', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin,
          variantId,
          photoData: base64Data,
        }),
      });
    } catch {
      // Ignored on static hosting
    }

    return true;
  } catch (err) {
    console.error('Failed to save Top 11 photo:', err);
    return true;
  }
};

export const getStoredLogo = (): string => {
  try {
    return localStorage.getItem(LOGO_STORAGE_KEY) || DEFAULT_LOGO;
  } catch {
    return DEFAULT_LOGO;
  }
};

export const getStoredChibi = (): string => {
  try {
    return localStorage.getItem(CHIBI_STORAGE_KEY) || DEFAULT_CHIBI;
  } catch {
    return DEFAULT_CHIBI;
  }
};

export const getStoredTop11 = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(TOP11_STORAGE_KEY);
    return raw ? { ...getDefaultTop11Map(), ...JSON.parse(raw) } : getDefaultTop11Map();
  } catch {
    return getDefaultTop11Map();
  }
};

export const getStoredQris = (): string => {
  try {
    return localStorage.getItem(QRIS_STORAGE_KEY) || DEFAULT_QRIS;
  } catch {
    return DEFAULT_QRIS;
  }
};

export const saveQrisToServer = async (
  base64Data: string,
  pin = '1995'
): Promise<boolean> => {
  try {
    const fileName = 'sinki_qris.jpg';
    const directUrl = await uploadDirectToSupabase(fileName, base64Data);
    const savedUrl = directUrl || base64Data;
    localStorage.setItem(QRIS_STORAGE_KEY, savedUrl);

    try {
      await fetch('/api/owner/update-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, qrisImage: base64Data }),
      });
    } catch {
      // Ignored on static hosting
    }

    return true;
  } catch (err) {
    console.error('Failed to sync QRIS asset:', err);
    return true;
  }
};

export const resetStoredAssets = async (pin = '1995'): Promise<void> => {
  try {
    localStorage.removeItem(LOGO_STORAGE_KEY);
    localStorage.removeItem(CHIBI_STORAGE_KEY);
    localStorage.removeItem(QRIS_STORAGE_KEY);
    localStorage.removeItem(TOP11_STORAGE_KEY);

    try {
      await fetch('/api/owner/update-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, logo: null, chibi: null, qrisImage: null, top11: {} }),
      });
    } catch {
      // Ignored on static hosting
    }
  } catch (e) {
    console.error('Failed to reset storage', e);
  }
};
