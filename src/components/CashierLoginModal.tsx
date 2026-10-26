import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Unlock,
  KeyRound,
  UserCheck,
  Clock,
  Sparkles,
  LogOut,
  Eye,
  EyeOff,
  Delete,
  CheckCircle2,
  AlertCircle,
  Shield,
  BadgeCheck,
  RotateCcw,
} from 'lucide-react';
import { CashierUser, CashierShift } from '../types';
import { playSound } from '../utils/sound';

interface CashierLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashiers: CashierUser[];
  activeCashier: CashierUser;
  isLoggedIn: boolean;
  currentShift: CashierShift;
  onLoginSuccess: (cashier: CashierUser, shiftName: string, openingCash: number) => void;
  onLogout: () => void;
  onSaveCashiers: (updatedCashiers: CashierUser[]) => void;
  isLockScreen?: boolean;
}

export const CashierLoginModal: React.FC<CashierLoginModalProps> = ({
  isOpen,
  onClose,
  cashiers,
  activeCashier,
  isLoggedIn,
  currentShift,
  onLoginSuccess,
  onLogout,
  onSaveCashiers,
  isLockScreen = false,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'manage'>('login');
  const [selectedCashierId, setSelectedCashierId] = useState<string>(activeCashier.id || cashiers[0]?.id || 'cashier-utama');
  const [pinInput, setPinInput] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [selectedShift, setSelectedShift] = useState<'Shift 1' | 'Shift 2'>(
    (currentShift.shiftName as 'Shift 1' | 'Shift 2') || 'Shift 1'
  );
  const [openingCashInput, setOpeningCashInput] = useState<number>(currentShift.openingCash || 0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');

  // Change PIN state in Manage tab
  const [targetCashierIdForPin, setTargetCashierIdForPin] = useState<string>('cashier-admin');
  const [newPinInput, setNewPinInput] = useState<string>('');

  // Clock for lock screen
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync selected cashier when active changes
  useEffect(() => {
    if (activeCashier) {
      setSelectedCashierId(activeCashier.id);
      if (activeCashier.shiftDefault) {
        setSelectedShift(activeCashier.shiftDefault);
      }
    }
  }, [activeCashier]);

  if (!isOpen) return null;

  // Filter or ensure only the 2 accounts exist: Admin Toko & Kasir Utama
  const validCashiers = cashiers.filter(
    (c) => c.name === 'Admin Toko' || c.name === 'Kasir Utama'
  );
  const accountsToDisplay = validCashiers.length >= 2 ? validCashiers : cashiers.slice(0, 2);

  const selectedCashier =
    accountsToDisplay.find((c) => c.id === selectedCashierId) ||
    accountsToDisplay[0] ||
    activeCashier;

  const handleNumpadPress = (val: string) => {
    setErrorMessage('');
    if (pinInput.length < 6) {
      const nextPin = pinInput + val;
      setPinInput(nextPin);
      playSound('beep');
    }
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMessage('');
    playSound('beep');
  };

  const handleClearPin = () => {
    setPinInput('');
    setErrorMessage('');
    playSound('beep');
  };

  const handleAttemptLogin = (bypassPin = false) => {
    setErrorMessage('');

    if (!selectedCashier) {
      setErrorMessage('Pilih akun terlebih dahulu');
      return;
    }

    if (!bypassPin) {
      if (!pinInput) {
        setErrorMessage('Masukkan PIN 4 digit untuk login');
        playSound('beep');
        return;
      }

      if (pinInput !== selectedCashier.pin) {
        setErrorMessage('PIN salah! Coba lagi (Default: 1234)');
        playSound('beep');
        setPinInput('');
        return;
      }
    }

    playSound('success');
    setSuccessMessage(`Login Berhasil! Selamat bertugas, ${selectedCashier.name}`);

    setTimeout(() => {
      onLoginSuccess(selectedCashier, selectedShift, Number(openingCashInput) || 0);
      setSuccessMessage('');
      setPinInput('');
    }, 350);
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length < 4) {
      alert('PIN harus terdiri dari minimal 4 digit angka');
      return;
    }

    const updated = accountsToDisplay.map((c) =>
      c.id === targetCashierIdForPin ? { ...c, pin: newPinInput } : c
    );
    onSaveCashiers(updated);
    setNewPinInput('');
    playSound('success');
    alert(`PIN untuk ${accountsToDisplay.find((c) => c.id === targetCashierIdForPin)?.name} berhasil diperbarui!`);
  };

  const handleResetPin = (cashierId: string) => {
    const updated = accountsToDisplay.map((c) =>
      c.id === cashierId ? { ...c, pin: '1234' } : c
    );
    onSaveCashiers(updated);
    playSound('beep');
    alert('PIN berhasil dikembalikan ke standar: 1234');
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-200 ${
        isLockScreen
          ? 'bg-slate-950/80 backdrop-blur-xl'
          : 'bg-slate-950/50 backdrop-blur-md'
      }`}
    >
      <div className="glass-modal rounded-3xl max-w-lg w-full overflow-hidden shadow-[0_25px_65px_-12px_rgba(15,23,42,0.35)] border border-white/80 flex flex-col max-h-[96vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 glass-dark text-white flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-inner shrink-0 backdrop-blur-md">
              {isLoggedIn ? <KeyRound className="w-5 h-5" /> : <Lock className="w-5 h-5 text-amber-300" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-blue-400">
                  {isLockScreen ? 'SISTEM POS TERKUNCI' : 'LOGIN KASIR & ADMIN'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 font-mono border border-white/10">
                  {currentTime}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                <span>CampGear POS Outdoor</span>
              </h2>
            </div>
          </div>

          {!isLockScreen && (
            <button
              type="button"
              onClick={onClose}
              title="Tutup Modal"
              className="w-8 h-8 rounded-full bg-slate-800/80 border border-white/10 text-slate-300 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab Switcher: Login vs Kelola PIN */}
        <div className="flex items-center border-b border-white/60 bg-white/40 px-4 pt-2 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'border-blue-600 text-blue-600 bg-white/90 rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Pilih Akun & Login</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'manage'
                ? 'border-blue-600 text-blue-600 bg-white/90 rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Kelola PIN Akun</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {activeTab === 'login' ? (
            <>
              {/* Only 2 Accounts: Admin Toko & Kasir Utama */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Pilih Akun Yang Bertugas (2 Akun):
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {accountsToDisplay.map((cashier) => {
                    const isSelected = selectedCashier?.id === cashier.id;
                    const isCurrent = activeCashier?.id === cashier.id && isLoggedIn;
                    const isAdmin = cashier.name === 'Admin Toko';

                    return (
                      <button
                        key={cashier.id}
                        type="button"
                        onClick={() => {
                          setSelectedCashierId(cashier.id);
                          setErrorMessage('');
                          setPinInput('');
                          playSound('beep');
                        }}
                        className={`p-3.5 rounded-2xl text-left transition-all relative flex flex-col items-center justify-center text-center cursor-pointer ${
                          isSelected
                            ? 'border border-blue-500/80 bg-blue-500/15 backdrop-blur-md ring-2 ring-blue-500/30 shadow-md'
                            : 'glass-card hover:bg-white/90 border border-white/80'
                        }`}
                      >
                        {isCurrent && (
                          <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-300 px-1.5 py-0.5 rounded-full shadow-2xs backdrop-blur-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Aktif
                          </span>
                        )}

                        <div
                          className={`w-12 h-12 rounded-2xl font-black text-lg flex items-center justify-center shadow-xs mb-2 transition-transform ring-1 ring-white/50 ${
                            isSelected ? 'scale-110 ring-2 ring-white' : ''
                          } ${
                            isAdmin
                              ? 'bg-gradient-to-tr from-amber-600 to-amber-400 text-white shadow-amber-500/25'
                              : 'bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-emerald-500/25'
                          }`}
                        >
                          {isAdmin ? <Shield className="w-6 h-6" /> : <BadgeCheck className="w-6 h-6" />}
                        </div>

                        <div className="font-black text-slate-900 text-sm">
                          {cashier.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                          {cashier.role}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Opening Cash Input */}
              <div className="glass-surface p-3 rounded-2xl border border-white/80 shadow-2xs">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Modal Awal Laci Kas:
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">
                    Rp
                  </span>
                  <input
                    type="number"
                    step={10000}
                    value={openingCashInput || ''}
                    placeholder="0"
                    onChange={(e) => setOpeningCashInput(Number(e.target.value) || 0)}
                    className="w-full glass-input rounded-xl pl-8 pr-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              {/* PIN Input & Visual Indicators */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                    <span>PIN Keamanan {selectedCashier?.name} (Default: 1234)</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPin ? 'Sembunyikan' : 'Lihat PIN'}</span>
                  </button>
                </div>

                {/* Masked PIN display */}
                <div className="flex items-center justify-center gap-3 py-2.5 glass-surface rounded-2xl border border-white/80 shadow-inner">
                  {[0, 1, 2, 3].map((idx) => {
                    const isFilled = pinInput.length > idx;
                    const char = pinInput[idx];
                    return (
                      <div
                        key={idx}
                        className={`w-11 h-12 rounded-xl flex items-center justify-center text-lg font-black border transition-all ${
                          isFilled
                            ? 'bg-white border-blue-500 text-blue-700 shadow-sm scale-105'
                            : 'bg-white/40 border-slate-300/70 text-slate-400 backdrop-blur-xs'
                        }`}
                      >
                        {isFilled ? (showPin ? char : '●') : ''}
                      </div>
                    );
                  })}
                </div>

                {/* Feedback Alerts */}
                {errorMessage && (
                  <div className="flex items-center gap-2 p-2.5 bg-rose-50/90 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium animate-in fade-in backdrop-blur-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="flex items-center gap-2 p-2.5 bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold animate-in fade-in backdrop-blur-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Touch Numpad */}
                <div className="grid grid-cols-3 gap-1.5 max-w-xs mx-auto pt-1">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => handleNumpadPress(digit)}
                      className="h-11 glass-button hover:bg-white active:scale-95 rounded-xl font-black text-slate-800 text-base flex items-center justify-center cursor-pointer border border-white/80"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleClearPin}
                    className="h-11 glass-button hover:bg-rose-50 hover:text-rose-600 active:scale-95 rounded-xl font-bold text-slate-600 text-xs flex items-center justify-center cursor-pointer border border-white/80"
                  >
                    C
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNumpadPress('0')}
                    className="h-11 glass-button hover:bg-white active:scale-95 rounded-xl font-black text-slate-800 text-base flex items-center justify-center cursor-pointer border border-white/80"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={handleBackspace}
                    className="h-11 glass-button hover:bg-slate-200 active:scale-95 rounded-xl font-bold text-slate-700 flex items-center justify-center cursor-pointer border border-white/80"
                  >
                    <Delete className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => handleAttemptLogin(false)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Masuk Sebagai {selectedCashier?.name}</span>
                </button>

                {/* Fast Bypass Login Button */}
                <button
                  type="button"
                  onClick={() => handleAttemptLogin(true)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Masuk Cepat (Bypass PIN: 1234)</span>
                </button>

                {/* Logout / Lock Session Option */}
                {isLoggedIn && !isLockScreen && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500">
                      Sesi saat ini: <strong className="text-slate-800">{activeCashier.name}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        playSound('beep');
                      }}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Kunci Layar / Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Manage PIN Tab (Strictly for the 2 accounts: Admin Toko & Kasir Utama) */
            <div className="space-y-4">
              {/* Change PIN Form */}
              <form onSubmit={handleChangePin} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-blue-600" />
                  <span>Ubah PIN Keamanan</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Pilih Akun
                    </label>
                    <select
                      value={targetCashierIdForPin}
                      onChange={(e) => setTargetCashierIdForPin(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {accountsToDisplay.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      PIN Baru (Minimal 4 Digit)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="Contoh: 5678"
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Simpan PIN Baru</span>
                </button>
              </form>

              {/* 2 Accounts Status Card */}
              <div className="space-y-2">
                <div className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                  Daftar 2 Akun Sistem:
                </div>

                <div className="space-y-2">
                  {accountsToDisplay.map((cashier) => {
                    const isAdmin = cashier.name === 'Admin Toko';
                    return (
                      <div
                        key={cashier.id}
                        className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-2xl text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-white ${
                              isAdmin ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          >
                            {isAdmin ? <Shield className="w-5 h-5" /> : <BadgeCheck className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-800 text-sm">{cashier.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {cashier.role} · PIN: <span className="font-mono font-bold text-slate-700">{cashier.pin}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleResetPin(cashier.id)}
                          title="Kembalikan PIN ke 1234"
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-[11px] font-bold text-slate-600 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3 text-slate-400" />
                          <span>Reset ke 1234</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
