import React, { useState, useRef } from 'react';
import { Forward, Check, ExternalLink, Menu, ArrowRight } from 'lucide-react';
import { DEFAULT_CHIBI } from '../utils/assetStorage';
import { getPublicShareUrl } from '../utils/shareUtils';

interface HomeScreenProps {
  onShowToast: (message: string) => void;
  onNavigateToCollection: () => void;
  onOpenDrawer: () => void;
  onOpenOwnerPin: () => void;
  customLogo: string | null;
  customChibi: string | null;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onShowToast,
  onNavigateToCollection,
  onOpenDrawer,
  onOpenOwnerPin,
  customLogo,
  customChibi,
}) => {
  const [copied, setCopied] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleShare = async () => {
    const publicUrl = getPublicShareUrl();
    const shareData = {
      title: 'SINKI Parfums - Define your presence',
      text: 'SINKI Parfums: Aroma yang di tinggal lebih lama dari pada kesan pertama.',
      url: publicUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        onShowToast('Tautan SINKI berhasil dibagikan!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const publicUrl = getPublicShareUrl();
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    onShowToast('Tautan SINKI berhasil disalin!');
    setTimeout(() => setCopied(false), 2200);
  };

  const handleSocialClick = (platform: 'instagram' | 'tiktok') => {
    onShowToast(`Membuka ${platform === 'instagram' ? 'Instagram' : 'TikTok'} SINKI...`);
  };

  // Secret door: Tap emblem strictly 5 times to open owner PIN
  const handleEmblemClick = () => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      onOpenOwnerPin();
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 3500);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3.5 pb-20 bg-gradient-to-b from-[#181b26] via-[#141620] to-[#10121a] text-slate-100 overflow-y-auto no-scrollbar">
      {/* Pendar Cahaya Emas Halus & Sangat Tipis (Whisper-Thin Accent Glow) */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/[0.08] rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-16 -left-16 w-80 h-80 bg-amber-500/[0.05] rounded-full blur-[120px] pointer-events-none" />

      {/* TOP BAR:
          Left: Small Emblem (tap 5x for owner PIN shortcut)
          Right: 3-line hamburger menu button ("garis 3")
      */}
      <header className="relative z-10 flex items-center justify-between pt-0 pb-1 shrink-0">
        {/* Top-Left: Small Emblem */}
        <div
          onClick={handleEmblemClick}
          className="group cursor-pointer flex items-center gap-2 select-none active:scale-95 transition-transform"
          title="SINKI Parfums"
        >
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-b from-[#1e2235] to-[#141626] border border-amber-500/25 p-1 flex items-center justify-center shadow-[0_0_6px_rgba(245,186,73,0.12)] group-hover:border-amber-400/50 group-hover:shadow-[0_0_10px_rgba(245,186,73,0.2)] group-hover:scale-105 transition-all">
            {customLogo ? (
              <img
                src={customLogo}
                alt="Lambang Logo SINKI"
                className="w-full h-full object-contain filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
              />
            ) : (
              <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full filter drop-shadow-[0_1px_2px_rgba(212,163,89,0.15)]"
              >
                <defs>
                  <linearGradient id="emblemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFF5C2" />
                    <stop offset="45%" stopColor="#D4A359" />
                    <stop offset="100%" stopColor="#8A5A1B" />
                  </linearGradient>
                </defs>
                <path
                  d="M50 15C50 15 62 30 62 44C62 56 50 62 42 70C34 78 40 88 50 90C62 92 72 80 72 80C72 80 62 96 48 96C34 96 26 82 28 70C30 58 44 50 50 42C56 34 54 22 50 15Z"
                  fill="url(#emblemGrad)"
                />
                <path
                  d="M44 30C44 30 30 38 25 50C20 62 25 76 38 84C28 78 18 66 18 52C18 40 30 32 44 30Z"
                  fill="url(#emblemGrad)"
                  opacity="0.9"
                />
                <path
                  d="M56 30C56 30 70 38 75 50C80 62 75 76 62 84C72 78 82 66 82 52C82 40 70 32 56 30Z"
                  fill="url(#emblemGrad)"
                  opacity="0.9"
                />
              </svg>
            )}
          </div>
          <span className="text-[10px] font-mono tracking-widest text-amber-300 font-extrabold uppercase">
            SINKI
          </span>
        </div>

        {/* Top-Right: 3-line hamburger menu button ("Garis 3") */}
        <button
          onClick={onOpenDrawer}
          className="w-8 h-8 rounded-xl bg-gradient-to-b from-[#1e2235] to-[#141626] hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 flex items-center justify-center transition-all active:scale-90 shadow-sm"
          title="Menu Utama"
          aria-label="Menu"
        >
          <Menu size={16} className="text-amber-300" />
        </button>
      </header>

      {/* TITLE "SINKI": Positioned at the top above the Chibi */}
      <div className="text-center pt-1.5 pb-1 shrink-0 relative z-10 flex flex-col items-center justify-center select-none">
        <h1 className="font-display text-3xl font-extrabold tracking-[0.22em] -mr-[0.22em] haute-gold-title">
          SINKI
        </h1>
        <span className="font-display text-[10.5px] font-semibold tracking-[0.3em] -mr-[0.3em] uppercase mt-1 haute-gold-subtitle">
          Eau de Parfum
        </span>
      </div>

      {/* CENTER HERO: Chibi Photo Box */}
      <section className="relative z-10 flex-1 flex items-center justify-center py-2 my-auto">
        {/* Sleek Ultra-Thin Border Frame */}
        <div className="relative w-full max-w-[275px] aspect-square rounded-2xl overflow-hidden p-[1px] bg-gradient-to-b from-amber-400/40 via-white/20 to-amber-500/20 shadow-[0_15px_40px_rgba(0,0,0,0.75)] border border-white/10 transition-transform">
          <div className="relative w-full h-full rounded-[15px] overflow-hidden bg-gradient-to-b from-[#1e2235] to-[#141626] flex items-center justify-center shadow-inner">
            <img
              src={customChibi || DEFAULT_CHIBI}
              alt="Karakter Chibi SINKI Parfums"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="w-full h-full object-cover object-center filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-opacity duration-300"
            />
          </div>
        </div>
      </section>

      {/* LOWER SECTION:
          1. Story Card "Define your presence" + Icon-Only Share Button
          2. Equal-Sized Instagram & TikTok
          3. Minimalist swipe indicator
      */}
      <section className="relative z-10 space-y-2 shrink-0">
        {/* Story Box "Define your presence" with Glassmorphism Border & Crisp White Text */}
        <div className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#1e2235]/95 via-[#181a2b]/95 to-[#141626]/95 border border-amber-500/35 shadow-[0_8px_25px_rgba(0,0,0,0.55)] flex items-center justify-between gap-3 backdrop-blur-md">
          {/* Story Text */}
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-[11px] font-extrabold tracking-wider text-amber-300 uppercase leading-tight flex items-center gap-1.5">
              <span>Define your presence</span>
            </h2>
            <p className="text-[10.5px] text-white font-medium italic leading-snug mt-0.5 line-clamp-2 drop-shadow-sm">
              “Aroma yang di tinggal lebih lama dari pada kesan pertama”
            </p>
          </div>

          {/* Share Button: Curved Forward Arrow ala TikTok */}
          <button
            onClick={handleShare}
            className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-[0_4px_15px_rgba(212,163,89,0.3)] hover:brightness-110 active:scale-90 transition-all"
            title="Bagikan SINKI"
            aria-label="Bagikan"
          >
            {copied ? (
              <Check size={17} className="stroke-[2.5]" />
            ) : (
              <Forward size={17} className="stroke-[2.5]" />
            )}
          </button>
        </div>

        {/* Follow Sinki Section with Equal-Sized Logos & Glassmorphism Borders */}
        <div className="space-y-1.5">
          <span className="text-[9.5px] font-extrabold uppercase tracking-[0.2em] text-amber-300 pl-1 block drop-shadow-sm">
            Follow Sinki
          </span>

          <div className="grid grid-cols-2 gap-2">
            {/* Instagram Box */}
            <a
              href="https://www.instagram.com/sinki_official/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleSocialClick('instagram')}
              className="group flex items-center justify-between py-2 px-2.5 rounded-2xl bg-gradient-to-b from-[#1e2235]/95 to-[#141626]/95 hover:from-[#24283f] hover:to-[#171a2c] border border-pink-500/30 hover:border-pink-400/60 transition-all active:scale-98 shadow-[0_4px_15px_rgba(0,0,0,0.45)] backdrop-blur-md"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center p-1.5 shrink-0 shadow-md">
                  <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="block text-[8.5px] text-pink-300 font-bold uppercase leading-none">Instagram</span>
                  <span className="block text-[10.5px] font-bold text-white truncate">@Sinki_official</span>
                </div>
              </div>
              <ExternalLink size={11} className="text-slate-300 group-hover:text-pink-300 shrink-0 ml-1" />
            </a>

            {/* TikTok Box */}
            <a
              href="https://www.tiktok.com/@sinki_official"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleSocialClick('tiktok')}
              className="group flex items-center justify-between py-2 px-2.5 rounded-2xl bg-gradient-to-b from-[#1e2235]/95 to-[#141626]/95 hover:from-[#24283f] hover:to-[#171a2c] border border-cyan-500/35 hover:border-cyan-400/60 transition-all active:scale-98 shadow-[0_4px_15px_rgba(0,0,0,0.45)] backdrop-blur-md"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-black border border-slate-700 flex items-center justify-center p-1.5 shrink-0 shadow-md">
                  <svg viewBox="0 0 24 24" className="w-4 h-4">
                    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743 2.895 2.895 0 0 1 2.31-4.636c.31 0 .611.049.897.139V9.414A6.33 6.33 0 0 0 9.474 9.2c-3.528 0-6.388 2.859-6.388 6.387 0 3.528 2.86 6.388 6.388 6.388 3.528 0 6.387-2.86 6.387-6.388v-7.04a8.217 8.217 0 0 0 4.838 1.572V6.686z" fill="#00f2fe"/>
                    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743 2.895 2.895 0 0 1 2.31-4.636c.31 0 .611.049.897.139V9.414A6.33 6.33 0 0 0 9.474 9.2c-3.528 0-6.388 2.859-6.388 6.387 0 3.528 2.86 6.388 6.388 6.388 3.528 0 6.387-2.86 6.387-6.388v-7.04a8.217 8.217 0 0 0 4.838 1.572V6.686z" fill="#fe2c55" opacity="0.7"/>
                    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743 2.895 2.895 0 0 1 2.31-4.636c.31 0 .611.049.897.139V9.414A6.33 6.33 0 0 0 9.474 9.2c-3.528 0-6.388 2.859-6.388 6.387 0 3.528 2.86 6.388 6.388 6.388 3.528 0 6.387-2.86 6.387-6.388v-7.04a8.217 8.217 0 0 0 4.838 1.572V6.686z" fill="#ffffff" opacity="0.85"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <span className="block text-[8.5px] text-cyan-300 font-bold uppercase leading-none">TikTok</span>
                  <span className="block text-[10.5px] font-bold text-white truncate">@Sinki_official</span>
                </div>
              </div>
              <ExternalLink size={11} className="text-slate-300 group-hover:text-cyan-300 shrink-0 ml-1" />
            </a>
          </div>
        </div>

        {/* Luxury Micro-Badge Marquee Box (Replaces Swipe to Collection) */}
        <button
          onClick={onNavigateToCollection}
          aria-label="Lihat Koleksi Parfum SINKI"
          className="luxury-ticker-container w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#171927]/95 via-[#1d2238]/95 to-[#131625]/95 hover:from-[#21263d] hover:to-[#181c2f] border border-amber-500/30 hover:border-amber-400/50 flex items-center gap-2 text-slate-100 transition-all active:scale-[0.98] shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-md group overflow-hidden"
        >
          {/* Running Text Area with Mask Fade */}
          <div className="flex-1 overflow-hidden relative ticker-mask-fade py-0.5 min-w-0">
            <div className="luxury-ticker-track font-normal text-[9.5px] tracking-wide text-slate-300">
              <span className="inline-block pr-6 text-slate-200">
                ✦ Tahan 8 jam, dia aja yang gak tahan 😏
              </span>
              <span className="inline-block pr-6 text-amber-300/90 font-medium">
                ✦ Tahan 8 jam, dia aja yang gak tahan 😏
              </span>
              <span className="inline-block pr-6 text-slate-200">
                ✦ Tahan 8 jam, dia aja yang gak tahan 😏
              </span>
              <span className="inline-block pr-6 text-amber-300/90 font-medium">
                ✦ Tahan 8 jam, dia aja yang gak tahan 😏
              </span>
            </div>
          </div>

          {/* Action indicator button/arrow */}
          <div className="shrink-0 flex items-center gap-1 text-[8.5px] font-medium tracking-wider text-amber-400/90 group-hover:text-amber-300 pl-2 border-l border-white/10">
            <span className="hidden xs:inline">Koleksi</span>
            <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform text-amber-400" />
          </div>
        </button>
      </section>
    </div>
  );
};
