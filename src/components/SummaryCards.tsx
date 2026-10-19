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
      {/* 1. Belum Kembali (Orange/Amber) */}
      <button
        type="button"
        onClick={() => onSelectFilter(activeFilter === 'unreturned' ? 'all' : 'unreturned')}
        className={`relative flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl text-white transition-all transform active:scale-95 text-center cursor-pointer shadow-[0_6px_16px_rgba(234,140,0,0.25)] select-none hover:-translate-y-0.5 ${
          activeFilter === 'unreturned'
            ? 'ring-2 ring-amber-400 ring-offset-1 scale-[1.02] shadow-[0_8px_20px_rgba(234,140,0,0.4)]'
            : 'hover:brightness-105'
        }`}
        style={{
          background: 'linear-gradient(135deg, #FFB020 0%, #EA8C00 100%)',
        }}
      >
        <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-tight leading-tight">
          Belum Kembali
        </span>
        <span className="text-lg sm:text-xl font-black mt-0.5 tracking-tight">
          {unreturnedCount}
        </span>
        {activeFilter === 'unreturned' && (
          <span className="absolute -bottom-1 w-3.5 h-1 bg-white rounded-full"></span>
        )}
      </button>

      {/* 2. Nota Denda (Red/Coral) */}
      <button
        type="button"
        onClick={() => onSelectFilter(activeFilter === 'fine' ? 'all' : 'fine')}
        className={`relative flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl text-white transition-all transform active:scale-95 text-center cursor-pointer shadow-[0_6px_16px_rgba(230,40,70,0.25)] select-none hover:-translate-y-0.5 ${
          activeFilter === 'fine'
            ? 'ring-2 ring-rose-500 ring-offset-1 scale-[1.02] shadow-[0_8px_20px_rgba(230,40,70,0.4)]'
            : 'hover:brightness-105'
        }`}
        style={{
          background: 'linear-gradient(135deg, #FF5269 0%, #E62846 100%)',
        }}
      >
        <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-tight leading-tight">
          Nota Denda
        </span>
        <span className="text-lg sm:text-xl font-black mt-0.5 tracking-tight">
          {fineCount}
        </span>
        {activeFilter === 'fine' && (
          <span className="absolute -bottom-1 w-3.5 h-1 bg-white rounded-full"></span>
        )}
      </button>

      {/* 3. Selesai / Lunas (Green) */}
      <button
        type="button"
        onClick={() => onSelectFilter(activeFilter === 'completed' ? 'all' : 'completed')}
        className={`relative flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl text-white transition-all transform active:scale-95 text-center cursor-pointer shadow-[0_6px_16px_rgba(21,167,80,0.25)] select-none hover:-translate-y-0.5 ${
          activeFilter === 'completed'
            ? 'ring-2 ring-emerald-500 ring-offset-1 scale-[1.02] shadow-[0_8px_20px_rgba(21,167,80,0.4)]'
            : 'hover:brightness-105'
        }`}
        style={{
          background: 'linear-gradient(135deg, #2CD16D 0%, #15A750 100%)',
        }}
      >
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/25 mb-0.5">
          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
        </div>
        <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-tight leading-tight">
          Selesai ({completedCount})
        </span>
        {activeFilter === 'completed' && (
          <span className="absolute -bottom-1 w-3.5 h-1 bg-white rounded-full"></span>
        )}
      </button>
    </div>
  );
};
