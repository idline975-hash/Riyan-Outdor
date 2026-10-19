import React from 'react';
import { Menu, Smartphone, Monitor, Mountain, Plus } from 'lucide-react';
import { CashierShift } from '../types';
import { NetworkStatusIndicator } from './NetworkStatusIndicator';
import { ScaleSelector, UiScaleOption } from './ScaleSelector';

interface TopBarProps {
  onOpenSidebar: () => void;
  onOpenNewOrder: () => void;
  currentShift: CashierShift;
  onOpenShiftModal: () => void;
  viewMode: 'auto' | 'phone-sim' | 'mobile' | 'desktop';
  onToggleViewMode: () => void;
  isOnline: boolean;
  isConnected: boolean;
  pendingCount: number;
  syncToastMessage: string | null;
  onDismissToast: () => void;
  uiScale: UiScaleOption;
  onSetUiScale: (scale: UiScaleOption) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenSidebar,
  onOpenNewOrder,
  currentShift,
  onOpenShiftModal,
  viewMode,
  onToggleViewMode,
  isOnline,
  isConnected,
  pendingCount,
  syncToastMessage,
  onDismissToast,
  uiScale,
  onSetUiScale,
}) => {
  const isSimulated = viewMode === 'phone-sim' || viewMode === 'mobile';

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-[0_4px_16px_rgba(15,23,42,0.06)] px-2 sm:px-3 py-1.5 flex items-center justify-between gap-1.5 sm:gap-2 transition-all">
      <div className="w-full flex items-center justify-between gap-1.5 sm:gap-2 min-w-0">
        {/* Left: Burger Drawer Trigger + Brand */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenSidebar}
            title="Buka Menu Navigasi"
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-colors active:scale-95 cursor-pointer shadow-2xs shrink-0"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Mountain className="w-3.5 h-3.5" />
            </div>
            <span className="font-black text-slate-900 text-xs sm:text-sm tracking-tight whitespace-nowrap">
              CampGear
              <span className="hidden sm:inline text-slate-400 font-bold ml-1">POS</span>
            </span>
          </div>
        </div>

        {/* Right Actions: Fully responsive without horizontal overflow */}
        <div className="flex items-center gap-1 sm:gap-2 shrink min-w-0 py-0.5 px-0.5">
          {/* Background sync toast notification */}
          <NetworkStatusIndicator
            isOnline={isOnline}
            isConnected={isConnected}
            pendingCount={pendingCount}
            syncToastMessage={syncToastMessage}
            onDismissToast={onDismissToast}
            hidePill
          />

          {/* UI Scale / Zoom Controller */}
          <div className="shrink-0">
            <ScaleSelector currentScale={uiScale} onSelectScale={onSetUiScale} />
          </div>

          {/* View Mode Toggle: Shown on tablet/desktop to simulate phone view if desired */}
          <button
            type="button"
            onClick={onToggleViewMode}
            title={isSimulated ? 'Beralih ke Tampilan Layar Penuh Otomatis' : 'Simulasi Tampilan Bingkai HP'}
            className="hidden sm:flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-all cursor-pointer shrink-0"
          >
            {isSimulated ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-[11px]">Auto Layar</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-[11px]">Mode HP</span>
              </>
            )}
          </button>

          {/* Quick Input Nota Button */}
          <button
            type="button"
            onClick={onOpenNewOrder}
            title="Tambah Nota Sewa Baru (+)"
            className="px-2.5 sm:px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-sm transition-all cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3] shrink-0" />
            <span className="text-xs">Sewa</span>
          </button>
        </div>
      </div>
    </header>
  );
};
