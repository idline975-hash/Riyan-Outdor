import React, { useState } from 'react';
import { X, CheckCircle2, Smartphone, ShieldCheck, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatRupiah } from '../utils/formatters';
import { playSound } from '../utils/sound';

interface QRISModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  customerName: string;
  amount: number;
  paymentType: 'sewa' | 'denda' | 'pelunasan';
  onPaymentSuccess: (refNumber: string) => void;
}

export const QRISModal: React.FC<QRISModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  customerName,
  amount,
  paymentType,
  onPaymentSuccess,
}) => {
  const [selectedApp, setSelectedApp] = useState<'bca' | 'gopay' | 'dana' | 'ovo' | 'shopeepay' | 'livin'>('bca');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [copiedVa, setCopiedVa] = useState(false);

  if (!isOpen) return null;

  const vaNumber = `8808${orderNumber.padStart(6, '0')}`;
  const refCode = `QRIS-${orderNumber}-${Date.now().toString().slice(-6)}`;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      playSound('success');

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti fallback
      }

      setTimeout(() => {
        onPaymentSuccess(refCode);
        onClose();
        setIsPaid(false);
      }, 1800);
    }, 900);
  };

  const handleCopyVa = () => {
    navigator.clipboard.writeText(vaNumber);
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500 text-white font-black text-xs flex items-center justify-center tracking-tighter shrink-0 shadow-sm">
              QRIS
            </div>
            <div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-300">
                Pembayaran Digital Real-Time
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-white">
                Nota #{orderNumber} · {customerName}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* Amount Box */}
          <div className="text-center p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wide">
              {paymentType === 'denda' ? 'Total Sisa Denda' : paymentType === 'pelunasan' ? 'Pelunasan Sewa' : 'Total Pembayaran'}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums mt-0.5">
              {formatRupiah(amount)}
            </div>
          </div>

          {/* Authentic QRIS Display Container */}
          <div className="bg-white border-2 border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col items-center relative overflow-hidden">
            {/* National QRIS Header */}
            <div className="w-full flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <div className="text-xs font-black tracking-widest text-slate-900">
                QRIS
              </div>
              <div className="text-[10px] font-bold text-slate-500">
                STANDAR PEMBAYARAN NASIONAL
              </div>
            </div>

            <div className="text-center mb-2">
              <div className="text-xs font-bold text-slate-800">SUMMIT RENT OUTDOOR</div>
              <div className="text-[10px] text-slate-400 font-mono">NMID: ID102026092578901</div>
            </div>

            {/* Generated QR Code Vector Representation */}
            <div className="relative p-2 bg-white rounded-xl border border-slate-300 shadow-inner">
              <svg
                viewBox="0 0 100 100"
                className="w-44 h-44 sm:w-48 sm:h-48 text-slate-900"
                fill="currentColor"
              >
                {/* QR Positioning Markers */}
                <rect x="5" y="5" width="25" height="25" rx="3" fill="#0f172a" />
                <rect x="8" y="8" width="19" height="19" rx="2" fill="#ffffff" />
                <rect x="11" y="11" width="13" height="13" rx="1.5" fill="#0f172a" />

                <rect x="70" y="5" width="25" height="25" rx="3" fill="#0f172a" />
                <rect x="73" y="8" width="19" height="19" rx="2" fill="#ffffff" />
                <rect x="76" y="11" width="13" height="13" rx="1.5" fill="#0f172a" />

                <rect x="5" y="70" width="25" height="25" rx="3" fill="#0f172a" />
                <rect x="8" y="73" width="19" height="19" rx="2" fill="#ffffff" />
                <rect x="11" y="76" width="13" height="13" rx="1.5" fill="#0f172a" />

                {/* Simulated QR Code Data Matrix Blocks */}
                <rect x="35" y="8" width="8" height="8" fill="#0f172a" />
                <rect x="47" y="12" width="6" height="6" fill="#0f172a" />
                <rect x="57" y="6" width="7" height="7" fill="#0f172a" />
                <rect x="34" y="22" width="6" height="6" fill="#0f172a" />
                <rect x="44" y="24" width="8" height="8" fill="#0f172a" />
                <rect x="56" y="20" width="7" height="7" fill="#0f172a" />
                <rect x="8" y="36" width="7" height="7" fill="#0f172a" />
                <rect x="18" y="38" width="6" height="6" fill="#0f172a" />
                <rect x="28" y="34" width="8" height="8" fill="#0f172a" />
                <rect x="40" y="36" width="9" height="9" fill="#0f172a" />
                <rect x="54" y="34" width="6" height="6" fill="#0f172a" />
                <rect x="66" y="37" width="8" height="8" fill="#0f172a" />
                <rect x="78" y="35" width="7" height="7" fill="#0f172a" />
                <rect x="88" y="39" width="6" height="6" fill="#0f172a" />

                {/* Center QRIS logo badge */}
                <rect x="42" y="42" width="16" height="16" rx="3" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
                <rect x="45" y="45" width="10" height="10" rx="1.5" fill="#e11d48" />

                <rect x="10" y="52" width="8" height="8" fill="#0f172a" />
                <rect x="22" y="50" width="6" height="6" fill="#0f172a" />
                <rect x="32" y="54" width="7" height="7" fill="#0f172a" />
                <rect x="62" y="50" width="8" height="8" fill="#0f172a" />
                <rect x="74" y="53" width="7" height="7" fill="#0f172a" />
                <rect x="85" y="51" width="6" height="6" fill="#0f172a" />

                <rect x="36" y="66" width="8" height="8" fill="#0f172a" />
                <rect x="48" y="68" width="7" height="7" fill="#0f172a" />
                <rect x="60" y="65" width="6" height="6" fill="#0f172a" />
                <rect x="72" y="67" width="8" height="8" fill="#0f172a" />
                <rect x="84" y="69" width="7" height="7" fill="#0f172a" />

                <rect x="34" y="78" width="7" height="7" fill="#0f172a" />
                <rect x="45" y="82" width="9" height="9" fill="#0f172a" />
                <rect x="58" y="79" width="6" height="6" fill="#0f172a" />
                <rect x="68" y="81" width="8" height="8" fill="#0f172a" />
                <rect x="80" y="83" width="7" height="7" fill="#0f172a" />
              </svg>

              {isPaid && (
                <div className="absolute inset-0 bg-emerald-500/90 backdrop-blur-xs flex flex-col items-center justify-center text-white rounded-xl animate-in zoom-in-95 duration-200">
                  <CheckCircle2 className="w-12 h-12 stroke-[2.5] mb-1" />
                  <span className="font-extrabold text-sm uppercase">Lunas Terverifikasi</span>
                  <span className="text-[10px] opacity-90">{refCode}</span>
                </div>
              )}
            </div>

            {/* Supported Banks / E-Wallets */}
            <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap text-[9px] font-bold text-slate-500">
              <span className="px-1.5 py-0.5 bg-slate-100 rounded">BCA</span>
              <span className="px-1.5 py-0.5 bg-slate-100 rounded">MANDIRI</span>
              <span className="px-1.5 py-0.5 bg-slate-100 rounded">GOPAY</span>
              <span className="px-1.5 py-0.5 bg-slate-100 rounded">OVO</span>
              <span className="px-1.5 py-0.5 bg-slate-100 rounded">DANA</span>
              <span className="px-1.5 py-0.5 bg-slate-100 rounded">SHOPEEPAY</span>
            </div>
          </div>

          {/* Virtual Account Fallback Option */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">BCA Virtual Account:</div>
              <div className="font-mono font-bold text-slate-800">{vaNumber}</div>
            </div>
            <button
              type="button"
              onClick={handleCopyVa}
              className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-white border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {copiedVa ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              {copiedVa ? 'Tersalin' : 'Salin'}
            </button>
          </div>

          {/* Simulation Box for Tester / Kasir */}
          <div className="border border-blue-100 bg-blue-50/70 rounded-2xl p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>Simulasi Scan Pelanggan (Tester POS):</span>
            </div>
            
            <div className="grid grid-cols-3 gap-1 text-[11px]">
              {(['bca', 'gopay', 'dana', 'ovo', 'shopeepay', 'livin'] as const).map((app) => (
                <button
                  key={app}
                  type="button"
                  onClick={() => setSelectedApp(app)}
                  className={`py-1 px-1.5 rounded-lg border text-center font-bold uppercase transition-all ${
                    selectedApp === app
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {app}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={isProcessing || isPaid}
              onClick={handleSimulatePayment}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <span>Menghubungi Gateway...</span>
              ) : isPaid ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Berhasil Dibayar
                </span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Simulasi Bayar {formatRupiah(amount)} ({selectedApp.toUpperCase()})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
