import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Heart, Sparkles, MessageCircle, X, ArrowLeft, Filter } from 'lucide-react';
import { PERFUMES_DATA, PerfumeCategory, PerfumeItem } from '../data/perfumes';

interface CollectionScreenProps {
  onBackToHome: () => void;
  onShowToast: (msg: string) => void;
  scrollToTopTrigger?: number;
}

export const CollectionScreen: React.FC<CollectionScreenProps> = ({
  onBackToHome,
  onShowToast,
  scrollToTopTrigger,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<PerfumeCategory | 'all'>('all');

  // Responsif jika ada trigger scroll ke paling atas
  useEffect(() => {
    if (scrollToTopTrigger) {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [scrollToTopTrigger]);

  const handleScrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sinki_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (id: string, name: string) => {
    const exists = favorites.includes(id);
    const updated = exists ? favorites.filter((item) => item !== id) : [...favorites, id];
    try {
      localStorage.setItem("sinki_favorites", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setFavorites(updated);
    onShowToast(exists ? `${name} dihapus dari favorit` : `${name} ditambahkan ke favorit ❤️`);
  };

  const filteredPerfumes = useMemo(() => {
    return PERFUMES_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.accords.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const getWhatsAppUrl = (item: PerfumeItem) => {
    const text = `Halo SINKI Parfums, saya ingin memesan varian: *${item.name}* (${item.categoryLabel}). Mohon info harga dan ketersediaannya ya. Terima kasih!`;
    return `https://wa.me/6289636824552?text=${encodeURIComponent(text)}`;
  };

  const getCategoryColor = (cat: PerfumeCategory) => {
    switch (cat) {
      case 'women':
        return {
          bg: 'bg-pink-500/10',
          border: 'border-pink-500/30',
          text: 'text-pink-300',
          badge: 'bg-pink-500/20 text-pink-300',
        };
      case 'men':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          text: 'text-blue-300',
          badge: 'bg-blue-500/20 text-blue-300',
        };
      case 'powdery':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-300',
          badge: 'bg-emerald-500/20 text-emerald-300',
        };
      case 'unisex':
      default:
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-300',
          badge: 'bg-amber-500/20 text-amber-300',
        };
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-gradient-to-b from-[#181b26] via-[#141620] to-[#10121a] text-slate-100 overflow-hidden">
      {/* Pendar Cahaya Emas Halus & Tipis */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/[0.07] rounded-full blur-[110px] pointer-events-none" />

      {/* TOP BAR / HEADER */}
      <div className="relative z-10 px-4 pt-3 pb-2.5 shrink-0 bg-[#12141a]/95 border-b border-amber-500/20 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToHome}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-200 hover:text-white transition-colors active:scale-95"
              title="Kembali ke Beranda"
            >
              <ArrowLeft size={16} />
            </button>
            <div onClick={handleScrollToTop} className="cursor-pointer select-none">
              <h2 className="font-display text-sm font-extrabold text-white tracking-wider uppercase flex items-center gap-1.5 hover:text-amber-300 transition-colors">
                Koleksi Parfum
                <span className="text-[10px] font-mono text-amber-300 font-bold px-1.5 py-0.2 rounded-md bg-amber-500/25 border border-amber-500/45 shadow-sm">
                  {PERFUMES_DATA.length} Varian
                </span>
              </h2>
            </div>
          </div>

          <span className="text-[10px] text-amber-300 font-mono tracking-widest font-black uppercase">
            SINKI
          </span>
        </div>

        {/* Live Search Bar with High Legibility */}
        <div className="relative w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari varian parfum (cth: Dior, Scandalous, Zwitsal)..."
            className="w-full py-2 pl-9 pr-8 rounded-xl bg-[#141626] border border-amber-500/40 text-xs font-semibold text-white placeholder:text-slate-300 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Filter Chips (1 baris scrollable) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5 pb-0.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`shrink-0 py-1 px-3 rounded-lg text-[10.5px] font-bold tracking-wide transition-all ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 shadow-md shadow-amber-500/35 font-extrabold'
                : 'bg-white/10 text-slate-200 hover:text-white border border-white/10'
            }`}
          >
            Semua ({PERFUMES_DATA.length})
          </button>

          <button
            onClick={() => setSelectedCategory('women')}
            className={`shrink-0 py-1 px-2.5 rounded-lg text-[10.5px] font-bold tracking-wide transition-all ${
              selectedCategory === 'women'
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/35 font-extrabold'
                : 'bg-white/10 text-slate-200 hover:text-pink-300 border border-white/10'
            }`}
          >
            Women (26)
          </button>

          <button
            onClick={() => setSelectedCategory('men')}
            className={`shrink-0 py-1 px-2.5 rounded-lg text-[10.5px] font-bold tracking-wide transition-all ${
              selectedCategory === 'men'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/35 font-extrabold'
                : 'bg-white/10 text-slate-200 hover:text-blue-300 border border-white/10'
            }`}
          >
            Men (18)
          </button>

          <button
            onClick={() => setSelectedCategory('powdery')}
            className={`shrink-0 py-1 px-2.5 rounded-lg text-[10.5px] font-bold tracking-wide transition-all ${
              selectedCategory === 'powdery'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/35 font-extrabold'
                : 'bg-white/10 text-slate-200 hover:text-emerald-300 border border-white/10'
            }`}
          >
            Powdery (8)
          </button>

          <button
            onClick={() => setSelectedCategory('unisex')}
            className={`shrink-0 py-1 px-2.5 rounded-lg text-[10.5px] font-bold tracking-wide transition-all ${
              selectedCategory === 'unisex'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/35 font-extrabold'
                : 'bg-white/10 text-slate-200 hover:text-amber-300 border border-white/10'
            }`}
          >
            Unisex (16)
          </button>
        </div>
      </div>

      {/* PARFUM GRID CONTAINER:
          Format 2x2 (1 baris isi 2 kotak), tersusun rapi dengan Glassmorphism Border & Super Terang
      */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3.5 pb-24 no-scrollbar">
        {filteredPerfumes.length === 0 ? (
          <div className="py-16 text-center text-slate-200 flex flex-col items-center justify-center">
            <Filter size={28} className="text-amber-400 mb-2" />
            <p className="text-xs font-bold text-white">Varian tidak ditemukan</p>
            <p className="text-[10.5px] text-slate-300 mt-1">
              Coba kata kunci lain atau pilih tab Semua
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {filteredPerfumes.map((perfume) => {
              const theme = getCategoryColor(perfume.category);
              const isFav = favorites.includes(perfume.id);

              return (
                <div
                  key={perfume.id}
                  className="group relative flex flex-col justify-between p-3 rounded-2xl bg-gradient-to-b from-[#1e2235]/95 to-[#141626]/95 hover:from-[#24283f] hover:to-[#171a2c] border border-amber-500/35 hover:border-amber-400/70 shadow-[0_8px_25px_rgba(0,0,0,0.55)] transition-all duration-200 backdrop-blur-md"
                >
                  {/* Top card bar: Category badge + Favorite heart */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[8.5px] font-black uppercase tracking-wider py-0.5 px-2 rounded-md ${theme.badge} shadow-sm`}
                    >
                      {perfume.categoryLabel}
                    </span>

                    <button
                      onClick={() => toggleFavorite(perfume.id, perfume.name)}
                      className="p-1 rounded-full text-slate-300 hover:text-red-400 transition-colors active:scale-90"
                      title="Simpan favorit"
                    >
                      <Heart
                        size={13}
                        className={isFav ? 'fill-red-500 text-red-500' : ''}
                      />
                    </button>
                  </div>

                  {/* Bottle Icon Silhouette & Varian Name */}
                  <div className="space-y-1.5 mb-2.5">
                    {/* Small luxury bottle accent */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-sm">
                        <Sparkles size={11} />
                      </div>
                      <span className="text-[9.5px] font-mono text-amber-300 uppercase tracking-widest font-bold">
                        Eau De Parfum
                      </span>
                    </div>

                    <h3 className="font-display text-[12.5px] sm:text-[13.5px] font-black text-white group-hover:text-amber-200 transition-colors leading-snug line-clamp-2 min-h-[34px] drop-shadow-sm">
                      {perfume.name}
                    </h3>

                    <p className="text-[10px] text-slate-100 font-medium italic line-clamp-2 leading-tight min-h-[24px] drop-shadow-sm">
                      {perfume.tagline}
                    </p>

                    {/* Accords tags with High Contrast Crisp Badges */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {perfume.accords.slice(0, 2).map((accord, idx) => (
                        <span
                          key={idx}
                          className="text-[8.5px] py-0.5 px-1.5 rounded-md bg-white/15 text-white border border-white/20 font-semibold shadow-xs"
                        >
                          {accord}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action: WhatsApp Order Button (Nomor Resmi 0896-3682-4552) */}
                  <a
                    href={getWhatsAppUrl(perfume)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      onShowToast(`Menghubungkan ke WhatsApp resmi untuk ${perfume.name}...`);
                    }}
                    className="w-full mt-auto py-1.5 px-2 rounded-xl bg-gradient-to-r from-amber-500/25 via-amber-500/35 to-amber-600/25 hover:from-amber-500 hover:to-amber-600 hover:text-slate-950 border border-amber-500/45 text-amber-300 text-[10px] font-black flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm text-center"
                  >
                    <MessageCircle size={11} className="shrink-0" />
                    <span>Pesan Varian</span>
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
