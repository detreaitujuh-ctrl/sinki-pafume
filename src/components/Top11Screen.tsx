import React, { useState, useEffect } from 'react';
import { Crown, MessageCircle, ChevronLeft, ChevronRight, LayoutGrid, Clock, Flame, ArrowLeft, Heart, Maximize2, Minimize2 } from 'lucide-react';
import { TOP_11_DATA, Top11Item } from '../data/top11';
import { PerfumeBottleVisual } from './PerfumeBottleVisual';

interface Top11ScreenProps {
  top11Photos: Record<string, string>;
  onBackToHome: () => void;
  onShowToast: (msg: string) => void;
  isActive?: boolean;
}

export const Top11Screen: React.FC<Top11ScreenProps> = ({
  top11Photos,
  onBackToHome,
  onShowToast,
  isActive = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'spotlight' | 'grid'>('spotlight');
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>(() => {
    try {
      const saved = localStorage.getItem('sinki_bottle_fit_mode');
      return saved === 'contain' ? 'contain' : 'cover';
    } catch {
      return 'cover';
    }
  });

  const toggleFitMode = () => {
    setFitMode((prev) => {
      const next = prev === 'cover' ? 'contain' : 'cover';
      try {
        localStorage.setItem('sinki_bottle_fit_mode', next);
      } catch (e) {
        console.error(e);
      }
      onShowToast(
        next === 'cover'
          ? 'Mode Foto: Penuh (Mengisi seluruh kotak bingkai) 🖼️'
          : 'Mode Foto: Pas di Tengah (Ukuran proporsional) 🔍'
      );
      return next;
    });
  };

  // Setiap kali masuk ke halaman Top 11, otomatis kembali segar ke Juara #1
  useEffect(() => {
    if (isActive) {
      setCurrentIndex(0);
    }
  }, [isActive]);

  // Preload semua foto botol ke memori browser agar saat digeser muncul instan 0 detik
  useEffect(() => {
    Object.values(top11Photos).forEach((url) => {
      if (url && typeof url === 'string') {
        const img = new Image();
        img.src = url;
      }
    });
  }, [top11Photos]);

  // Preload foto botol saat ini, sebelum, dan sesudahnya secara prioritas tinggi
  useEffect(() => {
    const nextIdx = currentIndex < TOP_11_DATA.length - 1 ? currentIndex + 1 : 0;
    const prevIdx = currentIndex > 0 ? currentIndex - 1 : TOP_11_DATA.length - 1;
    [TOP_11_DATA[currentIndex], TOP_11_DATA[nextIdx], TOP_11_DATA[prevIdx]].forEach((item) => {
      const url = top11Photos[item.id];
      if (url) {
        const img = new Image();
        img.src = url;
      }
    });
  }, [currentIndex, top11Photos]);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sinki_top11_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const currentItem = TOP_11_DATA[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < TOP_11_DATA.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : TOP_11_DATA.length - 1));
  };

  const toggleFavorite = (id: string, name: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('sinki_top11_favorites', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      onShowToast(exists ? `${name} dihapus dari favorit` : `${name} ditambahkan ke favorit ❤️`);
      return updated;
    });
  };

  const handleOrderWhatsApp = (item: Top11Item) => {
    const text = `Halo SINKI Parfums, saya ingin memesan parfum Top #${item.rank}: *${item.name}* (${item.type}). Mohon info harga & ketersediaannya ya. Terima kasih!`;
    const url = `https://wa.me/6289636824552?text=${encodeURIComponent(text)}`;
    const win = window.open(url, '_blank');
    if (!win) {
      window.location.href = url;
    }
    onShowToast(`Menghubungkan ke WhatsApp resmi untuk Top #${item.rank} ${item.name}...`);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-gradient-to-b from-[#181b26] via-[#141620] to-[#10121a] text-slate-100 overflow-hidden">
      {/* Dynamic Ambient Background Glow - dibuat sangat tipis & halus */}
      <div
        className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-[120px] opacity-[0.09] pointer-events-none transition-colors duration-500"
        style={{
          backgroundColor:
            viewMode === 'spotlight' ? currentItem.bottleThemeColor : '#F59E0B',
        }}
      />

      {/* TOP HEADER */}
      <div className="relative z-10 px-4 pt-3 pb-2.5 shrink-0 bg-[#12141a]/95 border-b border-amber-500/20 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToHome}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-200 hover:text-white transition-colors active:scale-95"
              title="Kembali ke Beranda"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-1.5">
              <Crown size={16} className="text-amber-400" />
              <h2 className="font-display text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 tracking-wider uppercase">
                Top 11 Parfum
              </h2>
            </div>
          </div>

          {/* Toggle View Mode: Spotlight vs Grid */}
          <div className="flex items-center bg-[#141624] p-1 rounded-xl border border-amber-500/25">
            <button
              onClick={() => setViewMode('spotlight')}
              className={`py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all ${
                viewMode === 'spotlight'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 shadow-sm font-extrabold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Spotlight
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 shadow-sm font-extrabold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LayoutGrid size={11} />
              <span>Semua</span>
            </button>
          </div>
        </div>

        {/* Quick Rank Number Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5 pb-0.5">
          {TOP_11_DATA.map((item, idx) => {
            const isActive = viewMode === 'spotlight' && currentIndex === idx;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentIndex(idx);
                  setViewMode('spotlight');
                }}
                className={`shrink-0 w-7 h-7 rounded-lg text-[11px] font-bold font-mono transition-all flex items-center justify-center relative ${
                  isActive
                    ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 scale-105 shadow-md shadow-amber-500/40 font-black'
                    : 'bg-white/10 text-slate-200 hover:text-white border border-white/10 hover:border-amber-400/30'
                }`}
              >
                #{item.rank}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 pb-24">
        {viewMode === 'spotlight' ? (
          /* ==========================================
             VIEW 1: LUXURY SPOTLIGHT HERO CARD VIEW
             ========================================== */
          <div className="space-y-3.5 animate-in fade-in duration-300">
            {/* Spotlight Card with Glassmorphism Border & Deep Royal Charcoal Gradient */}
            <div className="relative rounded-3xl bg-gradient-to-b from-[#1e2235]/95 via-[#181a2b]/95 to-[#131524]/95 border border-amber-400/40 p-4 shadow-[0_15px_45px_rgba(0,0,0,0.7)] overflow-hidden backdrop-blur-md">
              {/* Top Card Bar: Rank Badge + Heart */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[9.5px] font-black uppercase tracking-widest py-1 px-2.5 rounded-full border shadow-sm ${currentItem.accentBadge}`}
                >
                  {currentItem.badge}
                </span>

                <div className="flex items-center gap-2">
                  {/* Mode Tampilan Foto Penuh / Pas Toggle Button */}
                  {top11Photos[currentItem.id] && (
                    <button
                      onClick={toggleFitMode}
                      className="px-2 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[9.5px] font-mono font-bold flex items-center gap-1 active:scale-95 transition-all shadow-sm"
                      title={fitMode === 'cover' ? 'Ubah ke Mode Pas (Tampilkan ukuran asli)' : 'Ubah ke Mode Penuh (Isi penuh kotak)'}
                    >
                      {fitMode === 'cover' ? (
                        <>
                          <Maximize2 size={11} />
                          <span>Penuh</span>
                        </>
                      ) : (
                        <>
                          <Minimize2 size={11} />
                          <span>Pas</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() =>
                      toggleFavorite(currentItem.id, currentItem.name)
                    }
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-red-400 transition-colors active:scale-90 border border-white/10"
                    title="Favorit"
                  >
                    <Heart
                      size={15}
                      className={
                        favorites.includes(currentItem.id)
                          ? 'fill-red-500 text-red-500'
                          : ''
                      }
                    />
                  </button>

                  <span className="text-[10.5px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-md border border-amber-500/40 shadow-sm">
                    {currentIndex + 1} / {TOP_11_DATA.length}
                  </span>
                </div>
              </div>

              {/* Perfume Bottle Visual with Navigation Arrows */}
              <div className="relative w-full h-56 flex items-center justify-center my-1">
                {/* Prev Arrow */}
                <button
                  onClick={handlePrev}
                  className="absolute left-1 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-amber-500 hover:text-slate-950 text-slate-100 border border-white/20 flex items-center justify-center transition-all active:scale-90 shadow-md"
                  aria-label="Sebelumnya"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Bottle Display (100% Clean) */}
                <div className="w-52 h-full">
                  <PerfumeBottleVisual
                    item={currentItem}
                    customPhoto={top11Photos[currentItem.id]}
                    size="lg"
                    fitMode={fitMode}
                  />
                </div>

                {/* Next Arrow */}
                <button
                  onClick={handleNext}
                  className="absolute right-1 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-amber-500 hover:text-slate-950 text-slate-100 border border-white/20 flex items-center justify-center transition-all active:scale-90 shadow-md"
                  aria-label="Berikutnya"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Title & Subtitle with Pure White Crisp and Radiant Gold */}
              <div className="text-center space-y-1 pt-1 pb-2">
                <span className="text-[9.5px] font-mono uppercase tracking-[0.25em] text-amber-300 font-extrabold block">
                  {currentItem.type}
                </span>
                <h3 className="font-display text-xl font-black text-white leading-tight drop-shadow-sm">
                  {currentItem.name}
                </h3>
                <p className="text-[11.5px] text-amber-300 font-bold italic">
                  “{currentItem.subtitle}”
                </p>
                <p className="text-[10.5px] text-white font-medium leading-relaxed pt-1 max-w-xs mx-auto drop-shadow-sm">
                  {currentItem.description}
                </p>
              </div>

              {/* Fragrance Pyramid Notes Breakdown with High Contrast */}
              <div className="mt-2 p-3.5 rounded-2xl bg-[#121422] border border-white/15 space-y-2 text-[10.5px] shadow-inner">
                <div className="flex items-start gap-2">
                  <span className="w-16 text-amber-300 font-bold shrink-0">
                    Top Notes:
                  </span>
                  <span className="text-white flex-1 font-semibold">
                    {currentItem.topNotes}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-16 text-amber-300 font-bold shrink-0">
                    Heart:
                  </span>
                  <span className="text-white flex-1 font-semibold">
                    {currentItem.middleNotes}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-16 text-amber-300 font-bold shrink-0">
                    Base:
                  </span>
                  <span className="text-white flex-1 font-semibold">
                    {currentItem.baseNotes}
                  </span>
                </div>

                {/* Performance Metrics */}
                <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[10.5px]">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <Clock size={13} />
                    <span>Ketahanan: {currentItem.longevity}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-orange-400 font-bold">
                    <Flame size={13} />
                    <span>Sillage: {currentItem.sillage}</span>
                  </div>
                </div>
              </div>

              {/* Order WhatsApp Button */}
              <div className="pt-3">
                <button
                  onClick={() => handleOrderWhatsApp(currentItem)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all shadow-lg shadow-amber-500/30 uppercase tracking-wide"
                >
                  <MessageCircle size={15} />
                  <span>Pesan Varian Top #{currentItem.rank} via WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ==========================================
             VIEW 2: GRID SHOWCASE 2x2 (1 BARIS 2 KOTAK)
             ========================================== */
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {TOP_11_DATA.map((item) => {
                const isFav = favorites.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className="relative flex flex-col justify-between p-3 rounded-2xl bg-gradient-to-b from-[#1c1f32] to-[#141626] hover:from-[#22263d] hover:to-[#171a2c] border border-amber-500/35 hover:border-amber-400/70 shadow-[0_8px_25px_rgba(0,0,0,0.55)] transition-all"
                  >
                    {/* Top Row: Rank Tag + Heart */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[9.5px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm">
                        #{item.rank}
                      </span>
                      <button
                        onClick={() => toggleFavorite(item.id, item.name)}
                        className="p-1 rounded-full text-slate-300 hover:text-red-400"
                      >
                        <Heart
                          size={13}
                          className={isFav ? 'fill-red-500 text-red-500' : ''}
                        />
                      </button>
                    </div>

                    {/* Bottle Visual Container (100% Clean) */}
                    <div className="w-full h-32 my-1">
                      <PerfumeBottleVisual
                        item={item}
                        customPhoto={top11Photos[item.id]}
                        size="sm"
                        fitMode={fitMode}
                      />
                    </div>

                    {/* Info */}
                    <div className="space-y-1 mb-2">
                      <span className="text-[8.5px] font-mono text-amber-300 font-bold uppercase tracking-widest block">
                        {item.type}
                      </span>
                      <h4 className="font-display text-xs font-black text-white leading-tight line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-[8.5px] text-amber-200/90 font-medium italic line-clamp-2 leading-tight">
                        {item.subtitle}
                      </p>
                    </div>

                    {/* Order Button */}
                    <button
                      onClick={() => handleOrderWhatsApp(item)}
                      className="w-full py-1.5 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/40 text-amber-300 text-[9.5px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
                    >
                      <MessageCircle size={11} />
                      <span>Pesan Varian</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
