import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Package, CreditCard, Banknote, Shield, AlertCircle, AlertTriangle, Check } from 'lucide-react';
import { RentalOrder, PaymentMethod } from '../types';
import { formatRupiah } from '../utils/formatters';
import { playSound } from '../utils/sound';

interface TakeItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: RentalOrder;
  onConfirmHandover: (updatedOrder: RentalOrder) => void;
}

export const TakeItemModal: React.FC<TakeItemModalProps> = ({
  isOpen,
  onClose,
  order,
  onConfirmHandover,
}) => {
  const grandTotal = order.totalRentalFee + order.depositAmount;
  const remainingAmount = Math.max(0, grandTotal - order.paidAmount);
  const needsSettlement = order.paymentStatus === 'DP' || remainingAmount > 0;

  const [settlementMethod, setSettlementMethod] = useState<PaymentMethod>('TUNAI');
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [guaranteeConfirmed, setGuaranteeConfirmed] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>(() => {
    const initial: { [key: string]: boolean } = {};
    order.items.forEach((it, idx) => {
      initial[it.gearId || idx.toString()] = true;
    });
    return initial;
  });

  if (!isOpen) return null;

  const isCashInsufficient = needsSettlement && settlementMethod === 'TUNAI' && cashGiven < remainingAmount;
  const cashShortfall = Math.max(0, remainingAmount - cashGiven);
  const changeCash = Math.max(0, cashGiven - remainingAmount);

  const toggleItemCheck = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePromptConfirm = () => {
    if (needsSettlement && settlementMethod === 'TUNAI' && cashGiven < remainingAmount) {
      setWarningMessage(
        `Nominal uang diterima (${formatRupiah(cashGiven)}) kurang dari sisa tagihan (${formatRupiah(remainingAmount)}). Kurang ${formatRupiah(cashShortfall)}. Harap terima uang pas atau lebih.`
      );
      playSound('beep');
      return;
    }

    setWarningMessage(null);
    setShowConfirmModal(true);
    playSound('beep');
  };

  const handleFinalConfirm = () => {
    setShowConfirmModal(false);
    playSound('success');

    const now = new Date();
    const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`;

    const updatedOrder: RentalOrder = {
      ...order,
      takenStatus: 'Sudah Diambil',
      takenAt: `${dateFormatted} ${timeFormatted}`,
      itemStatus: 'Belum Kembali', // Officially active OUT rental!
      paymentStatus: 'LUNAS',
      paidAmount: grandTotal,
      remainingAmount: 0,
      notes: order.notes
        ? `${order.notes} [Barang diambil: ${dateFormatted} ${timeFormatted}]`
        : `Barang diambil: ${dateFormatted} ${timeFormatted}`,
    };

    onConfirmHandover(updatedOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header (Blue & Slate themed) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-blue-300">
                Serah Terima Barang (Take Item)
              </div>
              <div className="text-sm sm:text-base font-extrabold text-white">
                Nota #{order.orderNumber} · {order.customerName}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-slate-800">
          {/* Status Box */}
          <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200/80 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black text-blue-700 uppercase">
                Status Saat Ini:
              </div>
              <div className="text-xs font-black text-blue-950 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Booking (Belum Diambil) ➔ Akan Diubah Jadi OUT</span>
              </div>
            </div>
            <div className="text-right text-[11px] font-bold text-blue-900 tabular-nums">
              {order.startDate} s/d {order.endDate}
            </div>
          </div>

          {/* Section 1: Checklist Peralatan yang Diserahkan */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-900 uppercase tracking-wide">
                1. Checklist Alat Diserahkan ke Penyewa:
              </span>
              <span className="text-[11px] text-slate-500">
                {order.items.length} jenis alat
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden bg-slate-50/50">
              {order.items.map((it, idx) => {
                const key = it.gearId || idx.toString();
                const isChecked = checkedItems[key] !== false;
                return (
                  <div
                    key={idx}
                    onClick={() => toggleItemCheck(key)}
                    className="p-2.5 flex items-center justify-between hover:bg-slate-100/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleItemCheck(key)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 leading-tight">
                          {it.gearName}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Kode: {it.gearCode} · Durasi: {order.durationDays} hari
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-slate-800">
                      {it.quantity}x
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Jaminan Identitas */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-900">
              <span>2. Jaminan Ditahan di Toko:</span>
              <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-[10px]">
                {order.guaranteeType}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{order.guaranteeNote || `${order.guaranteeType} an ${order.customerName}`}</span>
            </div>
            <label className="flex items-center gap-2 text-[11px] text-slate-700 font-bold cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={guaranteeConfirmed}
                onChange={(e) => setGuaranteeConfirmed(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Fisik jaminan KTP/SIM telah diterima dan disimpan kasir</span>
            </label>
          </div>

          {/* Section 3: Pelunasan Pembayaran (Jika sebelumnya DP) */}
          <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-amber-950 uppercase tracking-wide">
                3. Status Pembayaran & Pelunasan:
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                needsSettlement ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
              }`}>
                {order.paymentStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-amber-200/80">
              <div>
                <span className="text-slate-500 block">Total Biaya Sewa:</span>
                <span className="font-black text-slate-800 text-xs">{formatRupiah(grandTotal)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">DP yang Sudah Dibayar:</span>
                <span className="font-black text-emerald-700 text-xs">{formatRupiah(order.paidAmount)}</span>
              </div>
            </div>

            {needsSettlement ? (
              <div className="space-y-2 pt-1 border-t border-amber-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-rose-700">
                    SISA YANG HARUS DILUNASI:
                  </span>
                  <span className="text-sm font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                    {formatRupiah(remainingAmount)}
                  </span>
                </div>

                {/* Metode Pelunasan */}
                <div className="grid grid-cols-3 gap-1.5 text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setSettlementMethod('TUNAI')}
                    className={`py-1.5 rounded-xl border font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                      settlementMethod === 'TUNAI'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Tunai</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettlementMethod('QRIS')}
                    className={`py-1.5 rounded-xl border font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                      settlementMethod === 'QRIS'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>QRIS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettlementMethod('TRANSFER_BANK')}
                    className={`py-1.5 rounded-xl border font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                      settlementMethod === 'TRANSFER_BANK'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Transfer</span>
                  </button>
                </div>

                {/* Cash calculator for settlement */}
                {settlementMethod === 'TUNAI' && (
                  <div className="bg-white p-2.5 rounded-xl border border-amber-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-600">Uang Diterima:</span>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1 text-[11px] font-bold text-slate-400">Rp</span>
                        <input
                          type="number"
                          step={5000}
                          value={cashGiven || ''}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setCashGiven(val >= 0 ? val : 0);
                            if (warningMessage) setWarningMessage(null);
                          }}
                          placeholder={remainingAmount.toString()}
                          className={`w-32 bg-amber-50/50 border rounded-lg pl-7 pr-2 py-1 text-right font-black text-xs focus:outline-none transition-all ${
                            isCashInsufficient
                              ? 'border-rose-400 bg-rose-50/60 text-rose-900 ring-2 ring-rose-200'
                              : 'border-amber-300 text-slate-900 focus:ring-2 focus:ring-amber-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Quick Uang Pas Button */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setCashGiven(remainingAmount);
                          if (warningMessage) setWarningMessage(null);
                        }}
                        className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[10px] font-bold hover:bg-amber-200 cursor-pointer"
                      >
                        Uang Pas ({formatRupiah(remainingAmount)})
                      </button>
                    </div>

                    {/* Warning if insufficient */}
                    {isCashInsufficient ? (
                      <div className="p-2 bg-rose-50 border border-rose-300 rounded-xl text-xs space-y-0.5 animate-pulse">
                        <div className="flex items-center justify-between text-rose-700 font-extrabold text-[11px]">
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>Peringatan: Uang Kurang!</span>
                          </span>
                          <span className="text-rose-800 font-black text-xs">
                            -{formatRupiah(cashShortfall)}
                          </span>
                        </div>
                        <div className="text-[10px] text-rose-600">
                          Harus bayar minimal {formatRupiah(remainingAmount)}.
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 font-bold">
                        <span className="text-slate-600">Kembalian:</span>
                        <span className="text-emerald-700 font-black">{formatRupiah(changeCash)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pesanan sudah LUNAS 100%. Pelanggan langsung serah terima barang.</span>
              </div>
            )}
          </div>
        </div>

        {/* Warning banner */}
        {warningMessage && (
          <div className="mx-4 mb-2 p-2.5 bg-rose-50 border border-rose-300 rounded-xl flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-bold">{warningMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setWarningMessage(null)}
              className="text-rose-400 hover:text-rose-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Footer Action */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handlePromptConfirm}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Konfirmasi Ambil (Barang Menjadi OUT)</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog: Ya / Batal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Konfirmasi Serah Terima Barang
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Nota <strong>#{order.orderNumber}</strong> atas nama <strong>{order.customerName}</strong>.
                </p>
              </div>

              {needsSettlement && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Pelunasan ({settlementMethod}):</span>
                    <span className="font-bold text-slate-800">{formatRupiah(remainingAmount)}</span>
                  </div>
                  {settlementMethod === 'TUNAI' && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Kembalian:</span>
                      <span>{formatRupiah(changeCash)}</span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs font-semibold text-slate-700">
                Apakah Anda yakin ingin memproses serah terima dan mengubah status barang menjadi OUT?
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleFinalConfirm}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Ya, Konfirmasi Ambil</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
