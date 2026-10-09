import React from 'react';
import { X, Sparkles, MessageCircle, ShoppingBag, ExternalLink, Compass } from 'lucide-react';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCollection: () => void;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onClose,
  onNavigateToCollection,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[280px] max-w-[85vw] h-full bg-gradient-to-b from-[#181b26] via-[#141620] to-[#10121a] border-l border-white/10 p-5 flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.85)] animate-in slide-in-from-right duration-300 overflow-y-auto no-scrollbar">
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/15">
            <div>
              <span className="font-display font-extrabold text-lg tracking-[0.2em] text-white block">
                SINKI
              </span>
              <span className="text-[9.5px] uppercase tracking-widest text-slate-300 font-semibold">
                Eau De Parfum
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-200 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="mt-5 space-y-1.5">
            <span className="text-[9.5px] font-black uppercase tracking-widest text-amber-300 pl-1 block mb-2 drop-shadow-sm">
              Menu Navigasi
            </span>

            {/* Koleksi Parfum */}
            <button
              onClick={() => {
                onClose();
                onNavigateToCollection();
              }}
              className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/50 text-left transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles size={16} className="text-amber-400" />
                <span className="text-xs font-bold text-white group-hover:text-amber-200">
                  Koleksi Parfum
                </span>
              </div>
              <Compass size={13} className="text-slate-400 group-hover:text-amber-400" />
            </button>

            {/* WhatsApp Pemesanan */}
            <a
              href="https://wa.me/6289636824552?text=Halo%20SINKI%20Parfums%2C%20saya%20tertarik%20dengan%20koleksi%20parfumnya"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-400/50 text-left transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <MessageCircle size={16} className="text-emerald-400" />
                <span className="text-xs font-bold text-white group-hover:text-emerald-200">
                  WhatsApp Resmi
                </span>
              </div>
              <ExternalLink size={13} className="text-slate-400 group-hover:text-emerald-400" />
            </a>

            {/* Shopee Official */}
            <a
              href="https://shopee.co.id"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-orange-500/20 border border-white/10 hover:border-orange-400/50 text-left transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={16} className="text-orange-400" />
                <span className="text-xs font-bold text-white group-hover:text-orange-200">
                  Shopee Official
                </span>
              </div>
              <ExternalLink size={13} className="text-slate-400 group-hover:text-orange-400" />
            </a>
          </div>

          {/* Social Links */}
          <div className="mt-5 space-y-1.5">
            <span className="text-[9.5px] font-black uppercase tracking-widest text-amber-300 pl-1 block mb-2 drop-shadow-sm">
              Media Sosial Resmi
            </span>

            <a
              href="https://www.instagram.com/sinki_official/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-pink-500/15 border border-white/10 text-xs text-white hover:text-pink-300 transition-colors font-medium"
            >
              <span>Instagram @Sinki_official</span>
              <ExternalLink size={12} />
            </a>

            <a
              href="https://www.tiktok.com/@sinki_official"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.02] hover:bg-cyan-500/10 border border-white/5 text-xs text-slate-300 hover:text-cyan-300 transition-colors"
            >
              <span>TikTok @Sinki_official</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-4 border-t border-white/10 mt-6">
          <p className="text-[10px] text-slate-400 text-center font-mono">
            SINKI Parfums • 100% Original
          </p>
        </div>
      </div>
    </div>
  );
};
