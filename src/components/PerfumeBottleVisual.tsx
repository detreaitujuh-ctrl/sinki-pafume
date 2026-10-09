import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { Top11Item } from '../data/top11';

interface PerfumeBottleVisualProps {
  item: Top11Item;
  customPhoto?: string | null;
  size?: 'sm' | 'md' | 'lg';
  fitMode?: 'cover' | 'contain';
}

export const PerfumeBottleVisual: React.FC<PerfumeBottleVisualProps> = ({
  item,
  customPhoto,
  fitMode = 'cover',
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const isDataUrl = Boolean(customPhoto && typeof customPhoto === 'string' && customPhoto.startsWith('data:'));
  const [imageLoaded, setImageLoaded] = useState(() => isDataUrl);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);

    if (!customPhoto) {
      setImageLoaded(false);
      return;
    }

    // Jika berupa Base64 (hasil upload galeri langsung), langsung siap tanpa delay
    if (customPhoto.startsWith('data:')) {
      setImageLoaded(true);
      return;
    }

    // Cek apakah elemen img sudah selesai dimuat oleh browser
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setImageLoaded(true);
      return;
    }

    // Probe gambar dari memori/cache browser
    const probe = new Image();
    probe.onload = () => setImageLoaded(true);
    probe.onerror = () => setImageError(true);
    probe.src = customPhoto;
    if (probe.complete && probe.naturalWidth > 0) {
      setImageLoaded(true);
      return;
    }

    // Pengaman Timeout: Maksimal 600ms, jangan pernah macet selamanya di 'MEMUAT...'
    const timer = setTimeout(() => {
      setImageLoaded(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [customPhoto]);

  const showCustom = Boolean(customPhoto) && !imageError;

  return (
    <div className="relative group w-full h-full flex items-center justify-center">
      {/* 1. Golden Boutique Spotlight Glow (Lampu Sorot Butik Paris) */}
      <div className="absolute w-44 h-44 rounded-full boutique-spotlight-glow blur-[28px] pointer-events-none scale-110" />
      {/* 2. Warm pedestal glow */}
      <div className="absolute bottom-1 w-36 h-7 rounded-[100%] bg-amber-400/30 blur-[10px] pointer-events-none" />

      {showCustom ? (
        // Custom Uploaded Bottle Photo with Instant Eager Cache & Glassmorphism Showcase Box
        <div
          className={`relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#1c1f32]/85 to-[#131522]/95 border border-amber-500/40 shadow-[0_10px_28px_rgba(0,0,0,0.65)] backdrop-blur-md flex items-center justify-center ${
            fitMode === 'cover' ? 'p-0' : 'p-2'
          }`}
        >
          {/* Skeleton Shimmer while downloading (hanya jika benar-benar belum siap) */}
          {!imageLoaded && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#131522] animate-pulse">
              <div
                className="w-16 h-24 rounded-2xl blur-lg opacity-50"
                style={{ backgroundColor: item.bottleThemeColor || '#f59e0b' }}
              />
              <span className="text-[9px] text-amber-300 font-mono tracking-widest mt-1">
                MEMUAT FOTO...
              </span>
            </div>
          )}

          <img
            ref={imgRef}
            src={customPhoto!}
            alt={`Botol ${item.name}`}
            loading="eager"
            decoding="sync"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full transition-all duration-300 group-hover:scale-105 ${
              fitMode === 'cover'
                ? 'object-cover'
                : 'object-contain filter drop-shadow-[0_10px_22px_rgba(0,0,0,0.85)]'
            } ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          />
        </div>
      ) : (
        // Default Ultra-Luxury Perfume Bottle Illustration
        <div className="relative w-full h-full flex flex-col items-center justify-center select-none py-1">
          {/* Ambient Bottle Liquid Glow */}
          <div
            className="absolute w-32 h-32 rounded-full blur-[35px] opacity-55 pointer-events-none"
            style={{ backgroundColor: item.bottleThemeColor }}
          />

          {/* Perfume Bottle Assembly */}
          <div className="relative flex flex-col items-center">
            {/* 1. Golden Spray Cap / Atomizer */}
            <div className="w-7 h-5 rounded-t-sm bg-gradient-to-r from-[#D4AF37] via-[#FFF3A8] to-[#996515] shadow-md border-b border-black/40 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950/80" />
            </div>

            {/* 2. Golden Neck Ring */}
            <div className="w-9 h-1.5 bg-gradient-to-r from-[#AA771C] via-[#FFDF73] to-[#87550B] shadow-inner" />

            {/* 3. Glass Bottle Body */}
            <div className="relative w-28 h-36 rounded-2xl bg-gradient-to-b from-white/15 via-white/5 to-white/10 backdrop-blur-md border border-white/25 shadow-[0_12px_30px_rgba(0,0,0,0.7)] flex flex-col items-center justify-between p-2 overflow-hidden">
              {/* Glass Reflection Highlight */}
              <div className="absolute top-0 left-2 w-2 h-full bg-gradient-to-b from-white/40 via-white/10 to-transparent transform -skew-x-12 pointer-events-none" />

              {/* Fragrance Liquid Inside Flask */}
              <div
                className="absolute bottom-0 inset-x-0 h-4/5 rounded-b-2xl opacity-75 bg-gradient-to-t"
                style={{
                  backgroundImage: `linear-gradient(to top, ${item.bottleThemeColor}CC, ${item.bottleThemeColor}44, transparent)`,
                }}
              />

              {/* Bottle Emblem & Label */}
              <div className="relative z-10 w-full mt-auto mb-auto bg-[#0b0d13]/85 border border-amber-400/40 rounded-xl p-2 text-center shadow-lg">
                <span className="font-mono text-[7px] tracking-[0.25em] text-amber-300 font-bold uppercase block">
                  SINKI
                </span>
                <span className="font-display text-[9px] font-extrabold text-white leading-tight block truncate mt-0.5">
                  {item.name}
                </span>
                <span className="text-[7px] text-amber-200/70 font-sans block mt-0.5">
                  {item.type}
                </span>
              </div>

              {/* Bottom Glass Base Thickness */}
              <div className="relative z-10 w-full h-2 rounded-b-xl bg-white/20 border-t border-white/20" />
            </div>

            {/* Bottle Pedestal Shadow */}
            <div className="w-24 h-2.5 rounded-[100%] bg-black/60 blur-[3px] mt-1" />
          </div>
        </div>
      )}

      {/* Luxury Sparkle Badge */}
      <div className="absolute top-2 left-2 pointer-events-none">
        <Sparkles size={13} className="text-amber-300/80 animate-pulse" />
      </div>
    </div>
  );
};
