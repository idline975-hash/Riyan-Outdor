import React, { useState } from 'react';
import { X, Clock, Banknote, CreditCard, Shield, CheckCircle, RefreshCw } from 'lucide-react';
import { CashierShift } from '../types';
import { formatRupiah } from '../utils/formatters';
import { playSound } from '../utils/sound';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentShift: CashierShift;
  onUpdateShift: (shift: CashierShift) => void;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  onClose,
  currentShift,
  onUpdateShift,
}) => {
  const [selectedCashier, setSelectedCashier] = useState(currentShift.cashierName);
  const [selectedShift, setSelectedShift] = useState(currentShift.shiftName);
  const [openingCashInput, setOpeningCashInput] = useState(currentShift.openingCash);

  if (!isOpen) return null;

  const totalPhysicalCash = openingCashInput + currentShift.cashIn;
  const totalDigital = currentShift.qrisIn + currentShift.transferIn;

  const handleSwitchCashier = () => {
    const isShift1 = selectedShift === 'Shift 1';
    const hours = isShift1 ? '08:00 - 16:00' : '16:00 - 23:00';

    onUpdateShift({
      ...currentShift,
      cashierName: selectedCashier,
      shiftName: selectedShift,
      shiftHours: hours,
      openingCash: Number(openingCashInput) || 0,
    });
    playSound('beep');
    onClose();
  };

  const handleResetCashFlow = () => {
    onUpdateShift({
      ...currentShift,
      openingCash: 0,
      cashIn: 0,
      qrisIn: 0,
      transferIn: 0,
      totalTransactions: 0,
    });
    setOpeningCashInput(0);
    playSound('beep');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-extrabold flex items-center justify-center shrink-0 shadow-sm">
              {currentShift.cashierName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-300">
                Manajemen Shift & Laci Kas
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-white">
                {currentShift.cashierName} · {currentShift.shiftName}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Laci Kas Ringkasan */}
          <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50 space-y-2.5">
            <div className="font-bold text-slate-800 uppercase tracking-wide flex items-center justify-between">
              <span>Rekap Kas Laci Fisik</span>
              <span className="text-slate-400 font-normal">Tutup Shift</span>
            </div>

            <div className="space-y-1.5 text-slate-600">
              <div className="flex items-center justify-between">
                <span>Kas Modal Awal di Laci:</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-bold">Rp</span>
                  <input
                    type="number"
                    step={10000}
                    value={openingCashInput || 0}
                    onChange={(e) => setOpeningCashInput(Number(e.target.value))}
                    className="w-24 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-right font-bold text-slate-900"
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <span>Penerimaan Kas Tunai:</span>
                <span className="font-bold text-emerald-700">+{formatRupiah(currentShift.cashIn)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Wajib Ada di Laci Uang:</span>
                <span className="text-emerald-700 tabular-nums">{formatRupiah(totalPhysicalCash)}</span>
              </div>
            </div>
          </div>

          {/* Penerimaan Digital */}
          <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50 space-y-2">
            <div className="font-bold text-slate-800 uppercase tracking-wide">
              Penerimaan Non-Tunai (Rekening Toko)
            </div>
            <div className="space-y-1 text-slate-600">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-rose-500" />
                  QRIS Digital Masuk:
                </span>
                <span className="font-bold text-rose-600">{formatRupiah(currentShift.qrisIn)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-500" />
                  Transfer Bank / VA Masuk:
                </span>
                <span className="font-bold text-blue-700">{formatRupiah(currentShift.transferIn)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Digital:</span>
                <span>{formatRupiah(totalDigital)}</span>
              </div>
            </div>
          </div>

          {/* Switch Cashier / Shift Selector */}
          <div className="border border-slate-200 rounded-2xl p-3.5 space-y-3">
            <div className="font-bold text-slate-800 uppercase tracking-wide">
              Ganti Kasir / Oper Shift:
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Nama Kasir
                </label>
                <select
                  value={selectedCashier}
                  onChange={(e) => setSelectedCashier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-900"
                >
                  <option value="Faisal">Faisal</option>
                  <option value="Zidan">Zidan</option>
                  <option value="Andre">Andre</option>
                  <option value="Rina">Rina</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Pilihan Shift
                </label>
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-900"
                >
                  <option value="Shift 1">Shift 1 (08:00 - 16:00)</option>
                  <option value="Shift 2">Shift 2 (16:00 - 23:00)</option>
                </select>
              </div>
            </div>

            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={handleResetCashFlow}
                className="w-full py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl font-bold text-xs transition-colors cursor-pointer border border-slate-200"
              >
                Nolkan / Reset Arus Kas
              </button>

              <button
                type="button"
                onClick={handleSwitchCashier}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
