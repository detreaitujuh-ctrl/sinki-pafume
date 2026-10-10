import React from 'react';
import { Home, Sparkles, Crown, ShoppingBag, Star } from 'lucide-react';

export type TabType = 'home' | 'collection' | 'top11' | 'order' | 'review';

interface BottomNavBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  orderCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  orderCount = 0,
}) => {
  const navItems = [
    {
      id: 'home' as TabType,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'collection' as TabType,
      label: 'Collection',
      icon: Sparkles,
    },
    {
      id: 'top11' as TabType,
      label: 'Top 11',
      icon: Crown,
      badge: '11',
    },
    {
      id: 'order' as TabType,
      label: 'Order',
      icon: ShoppingBag,
      count: orderCount,
    },
    {
      id: 'review' as TabType,
      label: 'Review',
      icon: Star,
    },
  ];

  return (
    <nav 
      aria-label="Navigasi Utama SINKI"
      className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto px-3 pb-safe pt-2 bg-[#141724]/95 backdrop-blur-2xl border-t border-amber-500/20 shadow-[0_-6px_25px_rgba(0,0,0,0.65)]"
    >
      <div className="grid grid-cols-5 items-center gap-1 h-14">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 group active:scale-95 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400/50`}
            >
              {/* Active Tab Glow Pill - Dibuat jauh lebih tipis & halus */}
              {isActive && (
                <span 
                  className="absolute inset-0 bg-amber-500/15 rounded-xl border border-amber-400/90 shadow-[0_2px_8px_rgba(245,186,73,0.12)] pointer-events-none"
                  aria-hidden="true"
                />
              )}

              {/* Icon Container with Badge */}
              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-colors duration-200 ${
                    isActive
                      ? 'text-amber-300 '
                      : 'text-slate-200 group-hover:text-amber-200'
                  }`}
                  strokeWidth={isActive ? 2.3 : 1.9}
                />

                {/* Badge for Top 11 */}
                {item.badge && (
                  <span className="absolute -top-1 -right-2.5 px-1 py-0.2 text-[8px] font-black text-black bg-gradient-to-r from-amber-300 to-amber-500 rounded-full leading-tight shadow-sm">
                    {item.badge}
                  </span>
                )}

                {/* Badge for Order Count */}
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-0.5 flex items-center justify-center text-[9px] font-black text-black bg-amber-400 rounded-full leading-none shadow-[0_0_6px_rgba(251,191,36,0.6)]">
                    {item.count}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10.5px] tracking-wide mt-1 transition-colors duration-200 whitespace-nowrap ${
                  isActive
                    ? 'font-bold text-amber-200'
                    : 'font-semibold text-slate-200 group-hover:text-white'
                }`}
              >
                {item.label}
              </span>

              {/* Active Golden Indicator Dot - Lebih tipis */}
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-amber-300 mt-0.5 shadow-[0_0_3px_rgba(245,158,11,0.4)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
