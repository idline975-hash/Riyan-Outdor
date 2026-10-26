import React from 'react';
import { 
  Home, 
  FileText, 
  Bookmark, 
  Bell, 
  BarChart3, 
  PackageCheck, 
  Users, 
  Settings,
  LogOut, 
  X,
  ChevronRight,
  Clock,
  CircleDollarSign,
  Compass,
  Sparkles,
  UserCheck,
  KeyRound
} from 'lucide-react';
import { CashierShift } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: 'home' | 'input-nota' | 'booked' | 'out' | 'report' | 'inventory' | 'customer' | 'packages' | 'settings';
  onSelectTab: (tab: 'home' | 'input-nota' | 'booked' | 'out' | 'report' | 'inventory' | 'customer' | 'packages' | 'settings') => void;
  bookedCount: number;
  outCount: number;
  currentShift: CashierShift;
  onOpenShiftModal: () => void;
  onOpenLoginModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  bookedCount,
  outCount,
  currentShift,
  onOpenShiftModal,
  onOpenLoginModal,
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-200"
        />
      )}

      {/* Slide-out Navigation Drawer with Glassmorphic Surface */}
      <div
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] glass-modal z-50 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.35)] flex flex-col transition-transform duration-300 ease-out border-r border-white/80 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Cashier Profile Header */}
        <div className="p-3.5 border-b border-white/60 flex items-center justify-between bg-white/40 backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              onOpenLoginModal();
              onClose();
            }}
            title="Klik untuk Login / Ganti Akun Kasir"
            className="flex items-center gap-2.5 text-left group hover:opacity-90 transition-opacity cursor-pointer min-w-0"
          >
            {/* Green rounded avatar */}
            <div className="w-10 h-10 rounded-xl bg-emerald-500 group-hover:bg-emerald-600 text-white font-extrabold flex items-center justify-center text-lg shadow-sm shrink-0 transition-colors">
              {currentShift.cashierName.charAt(0).toUpperCase()}
            </div>

            <div className="leading-tight min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-800 text-sm truncate">
                  {currentShift.cashierName}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-[11px] mt-0.5 font-medium tabular-nums">
                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{currentShift.shiftHours}</span>
              </div>
            </div>
          </button>

          <div className="flex items-center gap-1 shrink-0">
            {/* Shift Pill */}
            <button
              onClick={onOpenShiftModal}
              title="Kelola Shift & Kas"
              className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {currentShift.shiftName}
            </button>

            {/* Login / Switch Cashier Icon */}
            <button
              onClick={() => {
                onOpenLoginModal();
                onClose();
              }}
              title="Ganti / Login Akun Kasir"
              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            {/* Close floating drawer button */}
            <button
              onClick={onClose}
              title="Tutup Menu"
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {/* 1. Home */}
          <button
            onClick={() => {
              onSelectTab('home');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              currentTab === 'home'
                ? 'bg-blue-600/15 text-blue-700 font-bold border border-blue-500/20 backdrop-blur-md shadow-xs'
                : 'text-slate-700 hover:bg-white/60 hover:text-slate-900 border border-transparent'
            }`}
          >
            <Home className="w-5 h-5 text-blue-500 shrink-0" />
            <span>Home</span>
          </button>

          {/* 2. Input Nota */}
          <button
            onClick={() => {
              onSelectTab('input-nota');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              currentTab === 'input-nota'
                ? 'bg-blue-600/15 text-blue-700 font-bold border border-blue-500/20 backdrop-blur-md shadow-xs'
                : 'text-slate-700 hover:bg-white/60 hover:text-slate-900 border border-transparent'
            }`}
          >
            <FileText className="w-5 h-5 text-blue-500 shrink-0" />
            <span>Input Nota</span>
          </button>

          {/* 2.5 Paket Hiking */}
          <button
            onClick={() => {
              onSelectTab('packages');
              onClose();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              currentTab === 'packages'
                ? 'bg-blue-600/15 text-blue-700 font-bold border border-blue-500/20 backdrop-blur-md shadow-xs'
                : 'text-slate-700 hover:bg-white/60 hover:text-slate-900 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Compass className="w-5 h-5 text-indigo-500 shrink-0" />
              <span>Paket Hiking</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-blue-100/80 text-blue-700 text-[10px] font-black border border-blue-200">
              Hemat 35%
            </span>
          </button>

          {/* 3. Booked */}
          <button
            onClick={() => {
              onSelectTab('booked');
              onClose();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              currentTab === 'booked'
                ? 'bg-blue-600/15 text-blue-700 font-bold border border-blue-500/20 backdrop-blur-md shadow-xs'
                : 'text-slate-700 hover:bg-white/60 hover:text-slate-900 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-5 h-5 text-amber-500 shrink-0" />
              <span>Booked</span>
            </div>
            {bookedCount > 0 && (
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                {bookedCount}
              </span>
            )}
          </button>

          {/* 4. Out (Barang Keluar) */}
          <button
            onClick={() => {
              onSelectTab('out');
              onClose();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              currentTab === 'out'
                ? 'bg-blue-600/15 text-blue-700 font-bold border border-blue-500/20 backdrop-blur-md shadow-xs'
                : 'text-slate-700 hover:bg-white/60 hover:text-slate-900 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-rose-500 shrink-0" />
              <span>Out</span>
            </div>
            {outCount > 0 && (
              <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                {outCount}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="pt-2 pb-1 border-t border-white/60 my-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3.5">
              Manajemen Toko
            </span>
          </div>

          {/* 5. Report */}
          <button
            onClick={() => {
              onSelectTab('report');
              onClose();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              currentTab === 'report'
                ? 'bg-blue-600/15 text-blue-700 font-bold border border-blue-500/20 backdrop-blur-md shadow-xs'
                : 'text-slate-700 hover:bg-white/60 hover:text-slate-900 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-indigo-500 shrink-0" />
              <span>Report</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* 6. Inventori */}
          <button
            onClick={() => {
              onSelectTab('inventory');
              onClose();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              currentTab === 'inventory'
                ? 'bg-blue-600/15 text-blue-700 font-bold border border-blue-500/20 backdrop-blur-md shadow-xs'
                : 'text-slate-700 hover:bg-white/60 hover:text-slate-900 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <PackageCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>Inventori</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* 7. Customer */}
          <button
            onClick={() => {
              onSelectTab('customer');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              currentTab === 'customer'
                ? 'bg-blue-600/15 text-blue-700 font-bold border border-blue-500/20 backdrop-blur-md shadow-xs'
                : 'text-slate-700 hover:bg-white/60 hover:text-slate-900 border border-transparent'
            }`}
          >
            <Users className="w-5 h-5 text-teal-500 shrink-0" />
            <span>Customer</span>
          </button>

          {/* 8. Pengaturan */}
          <button
            onClick={() => {
              onSelectTab('settings');
              onClose();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-blue-600/15 text-blue-700 font-bold border border-blue-500/20 backdrop-blur-md shadow-xs'
                : 'text-slate-700 hover:bg-white/60 hover:text-slate-900 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-slate-500 shrink-0" />
              <span>Pengaturan</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* 9. Menu Login Kasir */}
          <button
            onClick={() => {
              onOpenLoginModal();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-slate-700 hover:bg-emerald-500/10 hover:text-emerald-800 cursor-pointer group border border-transparent"
          >
            <div className="flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform shrink-0" />
              <span>Login Kasir</span>
            </div>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {currentShift.cashierName}
            </span>
          </button>
        </div>

        {/* Bottom Shift Quick Status */}
        <div className="p-3 border-t border-white/60 bg-white/30 backdrop-blur-md">
          <button
            onClick={onOpenShiftModal}
            className="w-full flex items-center justify-between p-2.5 glass-card rounded-xl hover:bg-white/95 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <CircleDollarSign className="w-4 h-4 text-emerald-600" />
              <div className="text-xs">
                <div className="font-bold text-slate-800">Laci Kas & Rekap Shift</div>
                <div className="text-slate-400 text-[10px]">Cek kas masuk & digital</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </>
  );
};
