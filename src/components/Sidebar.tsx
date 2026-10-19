import React from 'react';
import { 
  Home, 
  FileText, 
  Bookmark, 
  Bell, 
  BarChart3, 
  PackageCheck, 
  Users, 
  LogOut, 
  X,
  ChevronRight,
  Clock,
  CircleDollarSign,
  Compass,
  Sparkles
} from 'lucide-react';
import { CashierShift } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: 'home' | 'input-nota' | 'booked' | 'out' | 'report' | 'inventory' | 'customer' | 'packages';
  onSelectTab: (tab: 'home' | 'input-nota' | 'booked' | 'out' | 'report' | 'inventory' | 'customer' | 'packages') => void;
  bookedCount: number;
  outCount: number;
  currentShift: CashierShift;
  onOpenShiftModal: () => void;
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
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-200"
        />
      )}

      {/* Slide-out Navigation Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Cashier Profile Header (Faithful to Image 2) */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            {/* Green rounded avatar 'F' */}
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-extrabold flex items-center justify-center text-lg shadow-sm">
              {currentShift.cashierName.charAt(0).toUpperCase()}
            </div>

            <div className="leading-tight">
              <div className="font-bold text-slate-800 text-base">
                {currentShift.cashierName}
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5 font-medium tabular-nums">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{currentShift.shiftHours}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Shift Pill */}
            <button
              onClick={onOpenShiftModal}
              title="Kelola Shift & Kas"
              className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              {currentShift.shiftName}
            </button>

            {/* Shift Switcher / Logout */}
            <button
              onClick={onOpenShiftModal}
              title="Tutup Kasir / Rekap Shift"
              className="p-1 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Close floating drawer button */}
            <button
              onClick={onClose}
              title="Tutup Menu"
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Items (Faithful to Image 2) */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {/* 1. Home */}
          <button
            onClick={() => {
              onSelectTab('home');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
              currentTab === 'home'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Home className="w-5 h-5 text-slate-400 shrink-0" />
            <span>Home</span>
          </button>

          {/* 2. Input Nota */}
          <button
            onClick={() => {
              onSelectTab('input-nota');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
              currentTab === 'input-nota'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <FileText className="w-5 h-5 text-slate-400 shrink-0" />
            <span>Input Nota</span>
          </button>

          {/* 2.5 Paket Hiking */}
          <button
            onClick={() => {
              onSelectTab('packages');
              onClose();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
              currentTab === 'packages'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Compass className="w-5 h-5 text-blue-500 shrink-0" />
              <span>Paket Hiking</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black">
              Hemat 35%
            </span>
          </button>

          {/* 3. Booked */}
          <button
            onClick={() => {
              onSelectTab('booked');
              onClose();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
              currentTab === 'booked'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-5 h-5 text-slate-400 shrink-0" />
              <span>Booked</span>
            </div>
            {bookedCount > 0 && (
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
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
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
              currentTab === 'out'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-slate-400 shrink-0" />
              <span>Out</span>
            </div>
            {outCount > 0 && (
              <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">
                {outCount}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="pt-2 pb-1 border-t border-slate-100 my-1">
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
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
              currentTab === 'report'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-slate-400 shrink-0" />
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
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
              currentTab === 'inventory'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <PackageCheck className="w-5 h-5 text-slate-400 shrink-0" />
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
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
              currentTab === 'customer'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Users className="w-5 h-5 text-slate-400 shrink-0" />
            <span>Customer</span>
          </button>
        </div>

        {/* In-App PWA Install in Sidebar */}
        <div className="px-3 py-2 border-t border-slate-100 bg-emerald-50/40">
          <PWAInstallButton variant="sidebar" />
        </div>

        {/* Bottom Shift Quick Status */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <button
            onClick={onOpenShiftModal}
            className="w-full flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100/80 transition-colors text-left"
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
