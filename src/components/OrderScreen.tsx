import React, { useState } from 'react';
import {
  ShoppingBag,
  ArrowLeft,
  Sparkles,
  Layers,
  Crown,
  Flame,
  ChevronDown,
  ChevronUp,
  Truck,
  QrCode,
  Tag,
} from 'lucide-react';
import { TOP_11_DATA } from '../data/top11';
import { QrisPaymentCard } from './QrisPaymentCard';
import {
  PricingConfig,
  getStoredPricing,
  DEFAULT_PRICING,
} from '../utils/pricingStorage';

interface OrderScreenProps {
  onBackToHome: () => void;
  onShowToast: (msg: string) => void;
  pricing?: PricingConfig;
  customQris?: string | null;
}

// TIER DEFINITIONS
export type PerfumeTier = 'non_premium' | 'premium' | 'mykonos';

export const BOTTLE_SIZES = [10, 15, 20, 30, 50, 100] as const;
export type BottleSize = (typeof BOTTLE_SIZES)[number];

const OFFICIAL_WHATSAPP_RAW = '6289636824552';
const DISPLAY_WHATSAPP = '0896-3682-4552';

export const OrderScreen: React.FC<OrderScreenProps> = ({
  onBackToHome,
  onShowToast,
  pricing,
  customQris,
}) => {
  // Order Selection State
  const [tier, setTier] = useState<PerfumeTier>('non_premium');
  const [selectedSize, setSelectedSize] = useState<BottleSize>(30);
  const [selectedVariant, setSelectedVariant] = useState(TOP_11_DATA[0].name);
  const [customVariantName, setCustomVariantName] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Price List Visibility Toggle (Inline so it never turns black or gets blocked by transforms)
  const [showPriceList, setShowPriceList] = useState(false);

  // Show QRIS directly
  const [showQris, setShowQris] = useState(true);

  // Dynamic Active Pricing Configuration (Editable by Owner via Secret Panel)
  const activePricing = pricing || getStoredPricing();
  const currentNonPremium = activePricing.nonPremium || DEFAULT_PRICING.nonPremium;
  const currentPremiumRate = activePricing.premiumRatePerMl || 4000;
  const currentMykonosRate = activePricing.mykonosRatePerMl || 3000;
  const minFreeShipping = activePricing.minFreeShipping || 150000;

  // Calculations
  const getPriceForSize = (s: BottleSize): number => {
    if (tier === 'non_premium') {
      return currentNonPremium[s] || 39000;
    }
    if (tier === 'premium') {
      return s * currentPremiumRate;
    }
    return s * currentMykonosRate;
  };

  const unitPrice = getPriceForSize(selectedSize);
  const totalAmount = unitPrice * quantity;

  const currentVariantDisplay =
    customVariantName.trim() ? customVariantName.trim() : selectedVariant;

  const handleCheckoutWhatsApp = () => {
    const tierName =
      tier === 'non_premium'
        ? 'Non Premium (Reguler)'
        : tier === 'premium'
        ? `Premium (Rp ${currentPremiumRate.toLocaleString('id-ID')}/ml)`
        : `Mykonos (Rp ${currentMykonosRate.toLocaleString('id-ID')}/ml)`;

    const message = [
      `*PESANAN PARFUM SINKI*`,
      `------------------------------------------`,
      `• Kategori: *${tierName}*`,
      `• Varian Aroma: *${currentVariantDisplay}*`,
      `• Ukuran Botol: *${selectedSize} ml*`,
      `• Jumlah: *${quantity} botol*`,
      `• Harga Satuan: Rp ${unitPrice.toLocaleString('id-ID')}`,
      `• Pengiriman: *Gratis Ongkir Se-Jabodetabek (Min. Order Rp ${minFreeShipping.toLocaleString('id-ID')})*`,
      `------------------------------------------`,
      `*TOTAL PEMBAYARAN:* *Rp ${totalAmount.toLocaleString('id-ID')}*`,
      `------------------------------------------`,
      `Halo Admin SINKI Parfums, saya ingin memesan parfum di atas. Mohon info ketersediaan dan cara pengirimannya ya. Terima kasih!`,
    ].join('\n');

    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/${OFFICIAL_WHATSAPP_RAW}?text=${encoded}`;
    window.open(waUrl, '_blank');
    onShowToast(`Membuka WhatsApp SINKI (${DISPLAY_WHATSAPP})...`);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-gradient-to-b from-[#181b26] via-[#141620] to-[#10121a] text-slate-100 overflow-hidden">
      {/* Pendar Cahaya Emas Halus & Tipis */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/[0.07] rounded-full blur-[110px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 px-4 pt-3 pb-2.5 shrink-0 bg-[#12141a]/95 border-b border-amber-500/20 backdrop-blur-md flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToHome}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-200 hover:text-white transition-colors active:scale-95"
            title="Kembali ke Beranda"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-1.5">
            <ShoppingBag size={16} className="text-amber-400" />
            <h2 className="font-display text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 tracking-wider uppercase">
              Pemesanan SINKI
            </h2>
          </div>
        </div>

        {/* View / Hide Full Price List Button */}
        <button
          onClick={() => setShowPriceList((prev) => !prev)}
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-amber-500/25 hover:bg-amber-500/35 border border-amber-500/50 text-amber-300 text-[11px] font-bold transition-all active:scale-95 shadow-sm"
        >
          <Tag size={12} />
          <span>Daftar Harga</span>
          {showPriceList ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 pb-24 space-y-3.5">
        {/* PROMINENT BADGE: GRATIS ONGKIR SE-JABODETABEK MIN ORDER 150 RIBU */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/25 via-amber-600/20 to-amber-500/10 border border-amber-400/50 flex items-center justify-between shadow-[0_6px_22px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md shrink-0">
              <Truck size={17} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider block">
                  Promo Spesial
                </span>
                <span className="text-[9.5px] font-mono text-amber-300 font-bold bg-amber-500/25 px-1.5 py-0.2 rounded border border-amber-500/40">
                  Min. Rp {minFreeShipping.toLocaleString('id-ID')}
                </span>
              </div>
              <span className="text-xs font-display font-black text-white block drop-shadow-sm">
                Gratis Ongkir Se-Jabodetabek
              </span>
            </div>
          </div>
          {totalAmount >= minFreeShipping ? (
            <span className="text-[9.5px] font-mono text-emerald-300 bg-emerald-500/25 border border-emerald-500/40 px-2 py-0.5 rounded-full font-black">
              ✓ Tercapai
            </span>
          ) : (
            <span className="text-[9.5px] font-mono text-amber-300 bg-amber-500/20 border border-amber-500/35 px-2 py-0.5 rounded-full font-bold">
              Min. {(minFreeShipping / 1000).toFixed(0)}rb
            </span>
          )}
        </div>

        {/* INLINE EXPANDABLE DAFTAR HARGA TABLE */}
        {showPriceList && (
          <div className="p-4 rounded-3xl bg-[#141626] border border-amber-500/50 space-y-3 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <h3 className="font-display font-extrabold text-xs text-amber-300 uppercase tracking-wider">
                  Daftar Harga Lengkap SINKI
                </h3>
                <p className="text-[9.5px] text-slate-200 font-medium">
                  Pilih ukuran & kategori sesuai selera Anda
                </p>
              </div>
              <button
                onClick={() => setShowPriceList(false)}
                className="text-[10px] text-slate-200 hover:text-white bg-white/10 px-2 py-1 rounded-lg border border-white/10"
              >
                Tutup
              </button>
            </div>

            {/* Price Table 1: Non Premium */}
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                  <Sparkles size={12} /> Non Premium
                </span>
                <span className="text-[9px] font-mono text-slate-400">Paket Hemat</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[10px]">
                {BOTTLE_SIZES.map((s) => (
                  <div key={s} className="p-1 rounded bg-white/[0.03] text-center border border-white/5">
                    <span className="text-slate-400 block">{s}ml</span>
                    <span className="font-mono font-bold text-amber-300">
                      Rp {((currentNonPremium[s] || 0) / 1000).toFixed(0)}k
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Table 2: Premium */}
            <div className="p-2.5 rounded-xl bg-black/40 border border-yellow-500/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-yellow-300 flex items-center gap-1">
                  <Crown size={12} /> Premium
                </span>
                <span className="text-[10px] font-mono font-extrabold text-yellow-300 bg-yellow-500/15 px-1.5 py-0.5 rounded">
                  {currentPremiumRate.toLocaleString('id-ID')} / ml
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[10px]">
                {BOTTLE_SIZES.map((s) => (
                  <div key={s} className="p-1 rounded bg-white/[0.03] text-center border border-white/5">
                    <span className="text-slate-400 block">{s}ml</span>
                    <span className="font-mono font-bold text-yellow-300">
                      Rp {((s * currentPremiumRate) / 1000).toFixed(0)}k
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Table 3: Mykonos */}
            <div className="p-2.5 rounded-xl bg-black/40 border border-rose-500/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1">
                  <Flame size={12} /> Mykonos
                </span>
                <span className="text-[10px] font-mono font-extrabold text-rose-300 bg-rose-500/15 px-1.5 py-0.5 rounded">
                  {currentMykonosRate.toLocaleString('id-ID')} / ml
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[10px]">
                {BOTTLE_SIZES.map((s) => (
                  <div key={s} className="p-1 rounded bg-white/[0.03] text-center border border-white/5">
                    <span className="text-slate-400 block">{s}ml</span>
                    <span className="font-mono font-bold text-rose-300">
                      Rp {((s * currentMykonosRate) / 1000).toFixed(0)}k
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: PILIH KATEGORI PARFUM */}
        <div className="p-4 rounded-3xl bg-gradient-to-b from-[#1e2235]/95 via-[#181a2b]/95 to-[#131524]/95 border border-amber-500/40 space-y-3 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-md">
          <span className="text-[10.5px] font-black uppercase tracking-widest text-amber-300 flex items-center gap-1.5 drop-shadow-sm">
            <Layers size={13} /> 1. Kategori Parfum
          </span>

          <div className="grid grid-cols-3 gap-2">
            {/* Non Premium */}
            <button
              onClick={() => setTier('non_premium')}
              className={`p-2.5 rounded-2xl border text-left transition-all ${
                tier === 'non_premium'
                  ? 'bg-amber-500/30 border-amber-400 shadow-[0_0_18px_rgba(245,186,73,0.35)]'
                  : 'bg-white/5 border-white/15 hover:border-white/30'
              }`}
            >
              <div className="flex items-center gap-1 text-amber-300 mb-0.5 font-bold">
                <Sparkles size={11} />
                <span className="text-[9.5px] font-black uppercase">Reguler</span>
              </div>
              <span className="font-display font-black text-xs text-white block leading-tight">
                Non Premium
              </span>
              <span className="text-[9.5px] font-mono text-amber-300 font-bold block mt-1">
                Mulai 17rb
              </span>
            </button>

            {/* Premium */}
            <button
              onClick={() => setTier('premium')}
              className={`p-2.5 rounded-2xl border text-left transition-all ${
                tier === 'premium'
                  ? 'bg-amber-500/30 border-amber-400 shadow-[0_0_18px_rgba(245,186,73,0.35)]'
                  : 'bg-white/5 border-white/15 hover:border-white/30'
              }`}
            >
              <div className="flex items-center gap-1 text-yellow-300 mb-0.5 font-bold">
                <Crown size={11} />
                <span className="text-[9.5px] font-black uppercase">Grade A</span>
              </div>
              <span className="font-display font-black text-xs text-white block leading-tight">
                Premium
              </span>
              <span className="text-[9.5px] font-mono text-amber-300 font-bold block mt-1">
                4.000 / ml
              </span>
            </button>

            {/* Mykonos */}
            <button
              onClick={() => setTier('mykonos')}
              className={`p-2.5 rounded-2xl border text-left transition-all ${
                tier === 'mykonos'
                  ? 'bg-amber-500/30 border-amber-400 shadow-[0_0_18px_rgba(245,186,73,0.35)]'
                  : 'bg-white/5 border-white/15 hover:border-white/30'
              }`}
            >
              <div className="flex items-center gap-1 text-rose-300 mb-0.5 font-bold">
                <Flame size={11} />
                <span className="text-[9.5px] font-black uppercase">Top Tier</span>
              </div>
              <span className="font-display font-black text-xs text-white block leading-tight">
                Mykonos
              </span>
              <span className="text-[9.5px] font-mono text-amber-300 font-bold block mt-1">
                3.000 / ml
              </span>
            </button>
          </div>

          {/* STEP 2: PILIH UKURAN BOTOL */}
          <div className="pt-2">
            <span className="text-[10.5px] font-black uppercase tracking-widest text-amber-300 block mb-2 drop-shadow-sm">
              2. Pilih Ukuran Botol
            </span>

            <div className="grid grid-cols-3 gap-2">
              {BOTTLE_SIZES.map((size) => {
                const isSelected = selectedSize === size;
                const price = getPriceForSize(size);

                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`p-2 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-gradient-to-b from-amber-500/35 to-amber-600/20 border-amber-400 shadow-[0_0_15px_rgba(245,186,73,0.4)]'
                        : 'bg-white/5 border-white/15 hover:border-white/30'
                    }`}
                  >
                    <span className="font-display text-sm font-black text-white block">
                      {size} ml
                    </span>
                    <span className="text-[11.5px] font-mono font-black text-amber-300 block mt-0.5">
                      Rp {price.toLocaleString('id-ID')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: PILIH VARIAN AROMA & JUMLAH */}
          <div className="pt-2 space-y-2">
            <span className="text-[10.5px] font-black uppercase tracking-widest text-amber-300 block drop-shadow-sm">
              3. Varian Aroma
            </span>

            <div className="relative">
              <select
                value={selectedVariant}
                onChange={(e) => {
                  setSelectedVariant(e.target.value);
                  setCustomVariantName('');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#141626] border border-amber-500/50 text-amber-200 font-bold text-xs focus:outline-none focus:border-amber-400 appearance-none pr-8 cursor-pointer shadow-inner"
              >
                {TOP_11_DATA.map((item) => (
                  <option key={item.id} value={item.name} className="bg-[#141626] text-white">
                    #{item.rank}: {item.name} ({item.type})
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none"
              />
            </div>

            <input
              type="text"
              placeholder="Atau ketik nama parfum pilihan Anda..."
              value={customVariantName}
              onChange={(e) => setCustomVariantName(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-[#141626] border border-white/20 text-white font-medium text-xs focus:outline-none focus:border-amber-400 placeholder:text-slate-300 shadow-inner"
            />

            {/* Quantity */}
            <div className="pt-2 flex items-center justify-between border-t border-white/15">
              <span className="text-xs text-white font-bold">Jumlah Botol:</span>
              <div className="flex items-center gap-3 bg-[#121422] p-1 rounded-xl border border-white/15">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center active:scale-90"
                >
                  -
                </button>
                <span className="font-mono text-xs font-black text-amber-300 min-w-5 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center active:scale-90"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 4: PEMBAYARAN QRIS RESMI (HANYA SINKI, BARCODE & HARGA) */}
        <div className="p-4 rounded-3xl bg-gradient-to-b from-[#1e2235]/95 to-[#141624]/95 border border-amber-500/35 space-y-3 shadow-[0_8px_25px_rgba(0,0,0,0.55)] backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase tracking-widest text-amber-300 flex items-center gap-1.5 drop-shadow-sm">
              <QrCode size={13} /> Pembayaran QRIS SINKI
            </span>
            <button
              onClick={() => setShowQris((prev) => !prev)}
              className="text-[10.5px] text-amber-300 underline font-bold"
            >
              {showQris ? 'Sembunyikan' : 'Tampilkan QRIS'}
            </button>
          </div>

          {showQris && (
            <div className="pt-1 animate-in fade-in duration-200">
              <QrisPaymentCard
                amount={totalAmount}
                onShowToast={onShowToast}
                customQrisProp={customQris}
              />
            </div>
          )}
        </div>

        {/* STEP 5: TOTAL RINCIAN & TOMBOL WHATSAPP RESMI */}
        <div className="p-4 rounded-3xl bg-gradient-to-b from-[#1e2235]/95 to-[#141624]/95 border border-amber-400/45 space-y-3 shadow-[0_12px_35px_rgba(0,0,0,0.65)] backdrop-blur-md">
          {/* Summary */}
          <div className="space-y-1.5 text-xs text-white">
            <div className="flex justify-between font-semibold">
              <span>
                Subtotal ({quantity}x {selectedSize}ml):
              </span>
              <span className="font-mono font-black text-white">
                Rp {totalAmount.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="flex justify-between text-amber-300 font-bold">
              <span>Pengiriman:</span>
              <span className="font-bold text-[10.5px] uppercase">
                {totalAmount >= minFreeShipping ? (
                  <span className="text-emerald-400 font-black">Gratis Ongkir (Order ≥ Rp {minFreeShipping.toLocaleString('id-ID')})</span>
                ) : (
                  <span className="text-amber-300">
                    Gratis Ongkir (Min. Rp {minFreeShipping.toLocaleString('id-ID')})
                  </span>
                )}
              </span>
            </div>

            <div className="pt-2 border-t border-white/15 flex items-center justify-between">
              <div>
                <span className="text-[10.5px] text-slate-200 font-bold block">Total Akhir:</span>
                <span className="font-display text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 drop-shadow-sm">
                  Rp {totalAmount.toLocaleString('id-ID')}
                </span>
              </div>

              <span className="text-[9.5px] font-mono text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/40 font-bold">
                Pesan Cepat WA
              </span>
            </div>
          </div>

          {/* TOMBOL PESAN VIA WHATSAPP (0896-3682-4552) */}
          <div className="pt-1">
            <button
              onClick={handleCheckoutWhatsApp}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-[#25D366]/30 group"
            >
              {/* WhatsApp Official Logo */}
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.99.582 3.844 1.589 5.414L2 22l4.73-1.547a9.957 9.957 0 0 0 5.274 1.555h.004c5.524 0 10.004-4.48 10.004-10.004 0-2.673-1.041-5.186-2.932-7.077A9.94 9.94 0 0 0 12.004 2zm5.827 14.195c-.244.686-1.42 1.314-1.96 1.393-.51.074-1.176.104-3.385-.81-2.825-1.168-4.636-4.05-4.776-4.238-.14-.188-1.144-1.523-1.144-2.906 0-1.383.724-2.064.98-2.348.257-.284.56-.355.748-.355.187 0 .374.002.538.01.174.009.408-.066.638.487.234.563.8 1.947.87 2.088.07.14.117.305.023.493-.093.187-.14.305-.28.47-.14.164-.294.366-.42.492-.14.14-.287.293-.124.573.164.28 1.096 1.8 2.378 2.94 1.649 1.467 3.037 1.923 3.47 2.11.433.187.687.164.943-.117.257-.28 1.1-.1.285 1.4-.187.305-.304.585-.425.28-.12.44-.047.88-.023 1.32.023.14.07.28.163.42.093.14.28.164.444.024.164-.14.538-.492.686-.686.147-.194.29-.387.41-.53.118-.14.19-.234.33-.093.14.14.887.44 1.04.516.152.076.254.113.29.176.037.063.037.368-.207 1.054z" />
                </svg>
              </div>
              <span>Pesan via WhatsApp ({DISPLAY_WHATSAPP})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
