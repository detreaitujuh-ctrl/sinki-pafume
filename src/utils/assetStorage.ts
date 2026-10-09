// Utility to compress images and store them reliably on the server and in LocalStorage

const LOGO_STORAGE_KEY = 'sinki_custom_logo_data';
const CHIBI_STORAGE_KEY = 'sinki_custom_chibi_data';
const QRIS_STORAGE_KEY = 'sinki_custom_qris_data';
const TOP11_STORAGE_KEY = 'sinki_custom_top11_data';

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

import { PricingConfig, getStoredPricing } from './pricingStorage';

export interface ServerAssetsResponse {
  logo: string | null;
  chibi: string | null;
  qrisImage?: string | null;
  top11?: Record<string, string>;
  pricing?: PricingConfig;
}

const SUPABASE_STORAGE_BASE = 'https://tsxclttisxnmvdkwziqx.supabase.co/storage/v1/object/public/sinki-media/';
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

// Fetch public assets from server (used so all shared devices see the owner's photos)
export const fetchServerAssets = async (): Promise<ServerAssetsResponse> => {
  try {
    const res = await fetch('/api/public-assets');
    if (res.ok) {
      const data = await res.json();
      if (data.logo) {
        localStorage.setItem(LOGO_STORAGE_KEY, data.logo);
      }
      if (data.chibi) {
        localStorage.setItem(CHIBI_STORAGE_KEY, data.chibi);
      }
      if (data.qrisImage) {
        localStorage.setItem(QRIS_STORAGE_KEY, data.qrisImage);
      }
      if (data.top11) {
        localStorage.setItem(TOP11_STORAGE_KEY, JSON.stringify(data.top11));
      }
      if (data.pricing) {
        localStorage.setItem('sinki_custom_pricing_config', JSON.stringify(data.pricing));
      }
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
  } catch (err) {
    console.warn('Could not fetch server assets, using cached/Supabase fallback:', err);
  }
  return {
    logo: getStoredLogo() || DEFAULT_LOGO,
    chibi: getStoredChibi() || DEFAULT_CHIBI,
    qrisImage: getStoredQris() || DEFAULT_QRIS,
    top11: {
      ...getDefaultTop11Map(),
      ...getStoredTop11(),
    },
    pricing: getStoredPricing(),
  };
};

// Save Home assets to server permanently with owner PIN 1995
export const saveAssetToServer = async (
  type: 'logo' | 'chibi',
  base64Data: string,
  pin = '1995'
): Promise<boolean> => {
  try {
    if (type === 'logo') {
      localStorage.setItem(LOGO_STORAGE_KEY, base64Data);
    } else {
      localStorage.setItem(CHIBI_STORAGE_KEY, base64Data);
    }

    const payload = {
      pin,
      [type]: base64Data,
    };

    const res = await fetch('/api/owner/update-assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to sync asset to server:', err);
    return true;
  }
};

// Save Top 11 bottle photo to server permanently
export const saveTop11PhotoToServer = async (
  variantId: string,
  base64Data: string,
  pin = '1995'
): Promise<boolean> => {
  try {
    // 1. Update local cache
    const current = getStoredTop11();
    current[variantId] = base64Data;
    localStorage.setItem(TOP11_STORAGE_KEY, JSON.stringify(current));

    // 2. Update server
    const res = await fetch('/api/owner/update-top11', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pin,
        variantId,
        photoData: base64Data,
      }),
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to save Top 11 photo to server:', err);
    return true;
  }
};

export const getStoredLogo = (): string | null => {
  try {
    return localStorage.getItem(LOGO_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const getStoredChibi = (): string | null => {
  try {
    return localStorage.getItem(CHIBI_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const getStoredTop11 = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(TOP11_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const getStoredQris = (): string | null => {
  try {
    return localStorage.getItem(QRIS_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const saveQrisToServer = async (
  base64Data: string,
  pin = '1995'
): Promise<boolean> => {
  try {
    localStorage.setItem(QRIS_STORAGE_KEY, base64Data);

    const payload = {
      pin,
      qrisImage: base64Data,
    };

    const res = await fetch('/api/owner/update-assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to sync QRIS asset to server:', err);
    return true;
  }
};

export const resetStoredAssets = async (pin = '1995'): Promise<void> => {
  try {
    localStorage.removeItem(LOGO_STORAGE_KEY);
    localStorage.removeItem(CHIBI_STORAGE_KEY);
    localStorage.removeItem(QRIS_STORAGE_KEY);
    localStorage.removeItem(TOP11_STORAGE_KEY);

    await fetch('/api/owner/update-assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, logo: null, chibi: null, qrisImage: null, top11: {} }),
    });
  } catch (e) {
    console.error('Failed to reset storage', e);
  }
};
