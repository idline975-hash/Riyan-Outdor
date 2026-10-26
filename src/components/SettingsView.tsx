import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Store, 
  Printer, 
  Clock, 
  ShieldAlert, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  Sliders, 
  Download, 
  Database,
  Smartphone,
  Monitor,
  AlertTriangle,
  UserCheck,
  KeyRound
} from 'lucide-react';
import { playSound } from '../utils/sound';
import { UiScaleOption } from './ScaleSelector';
import { RentalOrder, GearItem, CashierShift } from '../types';

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  storeAddress: string;
  storePhone: string;
  receiptFooter: string;
  paperWidth: '58mm' | '80mm';
  autoPrintReceipt: boolean;
  dailyPenaltyPercentage: number;
  returnGraceHours: number;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'CampGear Outdoor Rental',
  storeTagline: 'Penyewaan Alat Gunung & Outdoor Terlengkap',
  storeAddress: 'Jl. Kaliurang KM 9, Sleman, Yogyakarta',
  storePhone: '0812-3456-7890',
  receiptFooter: 'Harap periksa kelengkapan alat saat serah terima. Denda keterlambatan berlaku per hari.',
  paperWidth: '58mm',
  autoPrintReceipt: true,
  dailyPenaltyPercentage: 50,
  returnGraceHours: 2,
};

export function getStoredSettings(): StoreSettings {
  try {
    const raw = localStorage.getItem('campgear_pos_settings');
    if (raw) {
      return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_STORE_SETTINGS;
}

interface SettingsViewProps {
  uiScale: UiScaleOption;
  onSetUiScale: (scale: UiScaleOption) => void;
  viewMode: 'auto' | 'phone-sim';
  onToggleViewMode: () => void;
  orders: RentalOrder[];
  inventory: GearItem[];
  onResetAllData?: () => void;
  onOpenLoginModal?: () => void;
  currentShift?: CashierShift;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  uiScale,
  onSetUiScale,
  viewMode,
  onToggleViewMode,
  orders,
  inventory,
  onOpenLoginModal,
  currentShift,
}) => {
  const [settings, setSettings] = useState<StoreSettings>(() => getStoredSettings());
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('campgear_pos_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('campgear_pos_settings', JSON.stringify(settings));
      playSound('success');
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch {
      // ignore
    }
  };

  const handleExportData = () => {
    const backupData = {
      appName: 'CampGear POS',
      exportDate: new Date().toISOString(),
      ordersCount: orders.length,
      inventoryCount: inventory.length,
      settings,
      orders,
      inventory,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campgear-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    playSound('beep');
  };

  const handleClearCache = () => {
    try {
      localStorage.setItem('campgear_pos_orders', JSON.stringify([]));
      localStorage.setItem('campgear_pos_customers', JSON.stringify([]));
      localStorage.setItem('campgear_pos_shift', JSON.stringify({
        shiftName: 'Shift 1',
        shiftHours: '08:00 - 16:00',
        cashierName: 'Kasir Utama',
        openingCash: 0,
        cashIn: 0,
        qrisIn: 0,
        transferIn: 0,
        totalTransactions: 0,
      }));
      // Reset rented stock in inventory to 0
      const currentInv = inventory.length > 0 ? inventory : JSON.parse(localStorage.getItem('campgear_pos_inventory') || '[]');
      const emptyInv = currentInv.map((i: GearItem) => ({
        ...i,
        rentedStock: 0,
      }));
      localStorage.setItem('campgear_pos_inventory', JSON.stringify(emptyInv));

      playSound('success');
      window.location.reload();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-8 animate-in fade-in duration-150">
      {/* Top Header Card */}
      <div className="glass-surface border border-white/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md shrink-0 ring-1 ring-white/40">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Pengaturan Toko &amp; Sistem
            </h1>
            <p className="text-xs text-slate-500">
              Kelola informasi toko pada struk, format printer thermal, dan tampilan antarmuka kasir.
            </p>
          </div>
        </div>

        {showSaveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold animate-in fade-in duration-200 backdrop-blur-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan berhasil disimpan!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Section 1: Toko & Struk Cetak */}
        <div className="glass-surface border border-white/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-white/60 pb-2.5">
            <Store className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
              Informasi Toko (Kop Struk Thermal)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Nama Toko / Rental:
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="Misal: CampGear Outdoor Rental"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Slogan / Deskripsi Singkat:
              </label>
              <input
                type="text"
                value={settings.storeTagline}
                onChange={(e) => setSettings({ ...settings, storeTagline: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="Misal: Penyewaan Alat Gunung Terlengkap"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Alamat Toko:
              </label>
              <input
                type="text"
                value={settings.storeAddress}
                onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="Alamat lengkap outlet"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                No. WhatsApp / Telepon:
              </label>
              <input
                type="text"
                value={settings.storePhone}
                onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="Contoh: 0812-3456-7890"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Catatan Kaki Struk (Footer Note):
              </label>
              <textarea
                rows={2}
                value={settings.receiptFooter}
                onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="Pesan catatan ketentuan di bawah struk cetak"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Printer Thermal & Aturan Rental */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Printer Thermal Settings */}
          <div className="glass-surface border border-white/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-white/60 pb-2.5">
              <Printer className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                Printer Thermal Struk
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1.5">
                  Lebar Kertas Printer:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, paperWidth: '58mm' })}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      settings.paperWidth === '58mm'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'glass-button text-slate-700 hover:bg-white'
                    }`}
                  >
                    <span>58mm (Standar Portabel)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, paperWidth: '80mm' })}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      settings.paperWidth === '80mm'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'glass-button text-slate-700 hover:bg-white'
                    }`}
                  >
                    <span>80mm (Desktop POS)</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-white/60">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-800 block">Cetak Otomatis Setelah Pengembalian</span>
                    <span className="text-[11px] text-slate-500">
                      Langsung membuka dialog cetak struk saat tombol Ya ditekan
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoPrintReceipt}
                    onChange={(e) => setSettings({ ...settings, autoPrintReceipt: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Aturan Denda & Waktu */}
          <div className="glass-surface border border-white/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-white/60 pb-2.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                Kebijakan Waktu &amp; Denda
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Persentase Denda Keterlambatan (% / Hari):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={settings.dailyPenaltyPercentage}
                    onChange={(e) =>
                      setSettings({ ...settings, dailyPenaltyPercentage: Number(e.target.value) || 0 })
                    }
                    className="w-24 glass-input rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-center"
                  />
                  <span className="text-slate-500 font-semibold">% dari harga sewa harian</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Toleransi Keterlambatan (Grace Period):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={12}
                    value={settings.returnGraceHours}
                    onChange={(e) =>
                      setSettings({ ...settings, returnGraceHours: Number(e.target.value) || 0 })
                    }
                    className="w-24 glass-input rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-center"
                  />
                  <span className="text-slate-500 font-semibold">Jam bebas denda saat kembali</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Akun & Login Kasir */}
        {onOpenLoginModal && currentShift && (
          <div className="glass-surface border border-white/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-white/60 pb-2.5">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                  Akun Kasir &amp; Keamanan PIN
                </h2>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded-full shadow-2xs">
                {currentShift.cashierName} Aktif
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs glass-card p-3.5 rounded-xl border border-white/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white font-black text-base flex items-center justify-center shadow-xs ring-1 ring-white/50">
                  {currentShift.cashierName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-extrabold text-slate-800 text-sm">
                    {currentShift.cashierName}
                  </div>
                  <div className="text-slate-500 text-xs">
                    {currentShift.shiftName} ({currentShift.shiftHours}) · PIN Keamanan Aktif
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenLoginModal}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-500/25 border border-white/20"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Buka Menu Login / Kelola Kasir</span>
              </button>
            </div>
          </div>
        )}

        {/* Section 3: Tampilan & Skala Antarmuka */}
        <div className="glass-surface border border-white/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-white/60 pb-2.5">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
              Tampilan Layar &amp; Skala Kasir
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1.5">
                Skala UI (Zoom / Kerapatan Informasi):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(['75', '80', '85', '88', '90', '95', '100'] as UiScaleOption[]).map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => onSetUiScale(scale)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      uiScale === scale
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'glass-button text-slate-700 hover:bg-white'
                    }`}
                  >
                    {scale}% {scale === '88' && '(Default)'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1.5">
                Mode Tampilan Perangkat:
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={viewMode === 'phone-sim' ? onToggleViewMode : undefined}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    viewMode === 'auto'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'glass-button text-slate-700 hover:bg-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Auto Responsif (PC/Tablet)</span>
                </button>

                <button
                  type="button"
                  onClick={viewMode === 'auto' ? onToggleViewMode : undefined}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    viewMode === 'phone-sim'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'glass-button text-slate-700 hover:bg-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Simulasi Bingkai HP</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Cadangan Data & Pemeliharaan */}
        <div className="glass-surface border border-white/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-white/60 pb-2.5">
            <Database className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
              Cadangan &amp; Pemeliharaan Data
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-bold text-slate-800">Ekspor Salinan Data (Backup JSON)</div>
              <div className="text-[11px] text-slate-500">
                Unduh seluruh nota ({orders.length} nota) dan data inventori ({inventory.length} alat) untuk cadangan offline.
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportData}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/25 transition-all cursor-pointer shrink-0 border border-white/20"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Cadangan JSON</span>
            </button>
          </div>

          <div className="pt-3 border-t border-white/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-bold text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Reset Cache Lokal</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Hapus data tersimpan di browser dan kembalikan ke kondisi data bawaan awal.
              </div>
            </div>

            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="px-3.5 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50/80 active:scale-95 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 glass-button"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Data...</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 glass-button text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
                >
                  Ya, Reset Sekarang
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Floating / Sticky Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 text-white rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer border border-white/20"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>Simpan Perubahan Pengaturan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
