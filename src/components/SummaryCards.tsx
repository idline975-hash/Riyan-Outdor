import React from 'react';
import { Check } from 'lucide-react';

interface SummaryCardsProps {
  unreturnedCount: number;
  fineCount: number;
  completedCount: number;
  activeFilter: 'all' | 'unreturned' | 'fine' | 'completed' | 'booked';
  onSelectFilter: (filter: 'all' | 'unreturned' | 'fine' | 'completed' | 'booked') => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  unreturnedCount,
  fineCount,
  completedCount,
  activeFilter,
  onSelectFilter,
}) => {
  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 md:gap-3 my-2 w-full">
      {/* 1. Belum Kembali (Amber Glass) */}
      <button
        type="button"
        onClick={() => onSelectFilter(activeFilter === 'unreturned' ? 'all' : 'unreturned')}
        className={`relative overflow-hidden flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-2xl text-white transition-all active:scale-95 text-center cursor-pointer select-none backdrop-blur-md border border-white/40 ${
          activeFilter === 'unreturned'
            ? 'ring-2 ring-amber-300 ring-offset-2 ring-offset-white/80 scale-[1.03] shadow-[0_12px_28px_rgba(234,140,0,0.35)]'
            : 'shadow-[0_8px_20px_rgba(234,140,0,0.22)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(234,140,0,0.3)]'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(255,176,32,0.92) 0%, rgba(234,140,0,0.92) 100%)',
          boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.6), 0 8px 20px rgba(234, 140, 0, 0.22)',
        }}
      >
        {/* Specular gloss highlight */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl pointer-events-none" />

        <span className="relative z-10 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-tight leading-tight drop-shadow-xs">
          Belum Kembali
        </span>
        <span className="relative z-10 text-lg sm:text-xl font-black mt-0.5 tracking-tight drop-shadow-sm">
          {unreturnedCount}
        </span>
        {activeFilter === 'unreturned' && (
          <span className="relative z-10 mt-1 w-4 h-1 bg-white rounded-full shadow-xs"></span>
        )}
      </button>

      {/* 2. Nota Denda (Rose Glass) */}
      <button
        type="button"
        onClick={() => onSelectFilter(activeFilter === 'fine' ? 'all' : 'fine')}
        className={`relative overflow-hidden flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-2xl text-white transition-all active:scale-95 text-center cursor-pointer select-none backdrop-blur-md border border-white/40 ${
          activeFilter === 'fine'
            ? 'ring-2 ring-rose-400 ring-offset-2 ring-offset-white/80 scale-[1.03] shadow-[0_12px_28px_rgba(230,40,70,0.35)]'
            : 'shadow-[0_8px_20px_rgba(230,40,70,0.22)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(230,40,70,0.3)]'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(255,82,105,0.92) 0%, rgba(230,40,70,0.92) 100%)',
          boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.6), 0 8px 20px rgba(230, 40, 70, 0.22)',
        }}
      >
        {/* Specular gloss highlight */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl pointer-events-none" />

        <span className="relative z-10 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-tight leading-tight drop-shadow-xs">
          Nota Denda
        </span>
        <span className="relative z-10 text-lg sm:text-xl font-black mt-0.5 tracking-tight drop-shadow-sm">
          {fineCount}
        </span>
        {activeFilter === 'fine' && (
          <span className="relative z-10 mt-1 w-4 h-1 bg-white rounded-full shadow-xs"></span>
        )}
      </button>

      {/* 3. Selesai / Lunas (Emerald Glass) */}
      <button
        type="button"
        onClick={() => onSelectFilter(activeFilter === 'completed' ? 'all' : 'completed')}
        className={`relative overflow-hidden flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-2xl text-white transition-all active:scale-95 text-center cursor-pointer select-none backdrop-blur-md border border-white/40 ${
          activeFilter === 'completed'
            ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-white/80 scale-[1.03] shadow-[0_12px_28px_rgba(21,167,80,0.35)]'
            : 'shadow-[0_8px_20px_rgba(21,167,80,0.22)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(21,167,80,0.3)]'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(44,209,109,0.92) 0%, rgba(21,167,80,0.92) 100%)',
          boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.6), 0 8px 20px rgba(21, 167, 80, 0.22)',
        }}
      >
        {/* Specular gloss highlight */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-center w-5 h-5 rounded-full bg-white/25 mb-0.5 shadow-2xs">
          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
        </div>
        <span className="relative z-10 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-tight leading-tight drop-shadow-xs">
          Selesai ({completedCount})
        </span>
        {activeFilter === 'completed' && (
          <span className="relative z-10 mt-1 w-4 h-1 bg-white rounded-full shadow-xs"></span>
        )}
      </button>
    </div>
  );
};
