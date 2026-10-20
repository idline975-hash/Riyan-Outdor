import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Shield, CheckSquare, Square, Package, CreditCard, Banknote } from 'lucide-react';
import { RentalOrder, RentalOrderItem } from '../types';
import { formatRupiah } from '../utils/formatters';
import { playSound } from '../utils/sound';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: RentalOrder;
  onCompleteReturn: (updatedOrder: RentalOrder) => void;
  onOpenQrisForSettlement: (orderNumber: string, customerName: string, amount: number) => void;
  onPrint: (order: RentalOrder) => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  isOpen,
  onClose,
  order,
  onCompleteReturn,
  onOpenQrisForSettlement,
  onPrint,
}) => {
  // Track condition and fee per item
  const [itemsState, setItemsState] = useState<RentalOrderItem[]>(() =>
    order.items.map((it) => ({
      ...it,
      returned: true,
      returnedCondition: it.returnedCondition || 'Baik',
      damageFee: it.damageFee || 0,
    }))
  );

  const [paymentChoice, setPaymentChoice] = useState<'TUNAI' | 'QRIS'>('TUNAI');
  const [returnGuarantee, setReturnGuarantee] = useState(true);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  if (!isOpen) return null;

  const toggleItemReturned = (index: number) => {
    setItemsState((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, returned: !it.returned } : it))
    );
  };

  const handleConditionChange = (
    index: number,
    cond: 'Baik' | 'Kotor (Perlu Cuci)' | 'Rusak Ringan' | 'Rusak Parah' | 'Hilang'
  ) => {
    let fee = 0;
    if (cond === 'Rusak Ringan') fee = 25000;
    if (cond === 'Rusak Parah') fee = 75000;
    if (cond === 'Hilang') fee = 300000;

    setItemsState((prev) =>
      prev.map((it, idx) =>
        idx === index ? { ...it, returnedCondition: cond, damageFee: fee } : it
      )
    );
  };

  // Calculations
  const damageTotal = itemsState.reduce((sum, it) => sum + (it.damageFee || 0), 0);
  const remainingRentalFee = Math.max(0, order.totalRentalFee - order.paidAmount);
  const totalFineAndSettlement = order.overdueFine + damageTotal + remainingRentalFee;

  const getUpdatedOrder = () => {
    const updatedOrder: RentalOrder = {
      ...order,
      items: itemsState,
      itemStatus: itemsState.every((i) => i.returned) ? 'Sudah Kembali' : 'Sebagian Kembali',
      damageFine: damageTotal,
      totalFine: order.overdueFine + damageTotal,
      finePaid: true,
      paymentStatus: 'LUNAS',
      paidAmount: order.totalRentalFee,
      returnedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    return updatedOrder;
  };

  const handleFinish = () => {
    setIsConfirmDialogOpen(true);
  };

  const confirmFinish = () => {
    playSound('success');
    onCompleteReturn(getUpdatedOrder());
    setIsConfirmDialogOpen(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-300">
                Formulir Pengembalian Alat
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-white">
                Nota #{order.orderNumber} · {order.customerName}
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

        {/* Modal Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Identity & Guarantee Notice */}
          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-amber-900 text-xs">
                Jaminan Pelanggan: {order.guaranteeType} ({order.customerIdNumber})
              </div>
              <div className="text-[11px] text-amber-700 mt-0.5">
                Pastikan identitas fisik (KTP/SIM) dikembalikan setelah semua alat dan denda selesai diproses.
              </div>
              <label className="flex items-center gap-2 mt-2 font-bold text-amber-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={returnGuarantee}
                  onChange={(e) => setReturnGuarantee(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span>KTP/Jaminan Fisik telah diserahkan kembali ke customer</span>
              </label>
            </div>
          </div>

          {/* Items Checklist & Condition Inspection */}
          <div>
            <div className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-2 flex items-center justify-between">
              <span>Cek Kondisi Fisik Alat:</span>
              <span className="text-slate-400 font-normal">{itemsState.length} item</span>
            </div>

            <div className="space-y-2">
              {itemsState.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border transition-all ${
                    item.returned
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-rose-50/60 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => toggleItemReturned(idx)}
                      className="flex items-center gap-2 font-bold text-slate-900 text-left cursor-pointer"
                    >
                      {item.returned ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <span>
                        {item.gearName} ({item.quantity}x)
                      </span>
                    </button>

                    <span className="text-[11px] font-semibold text-slate-500">
                      {item.returned ? 'Kembali' : 'Belum Kembali'}
                    </span>
                  </div>

                  {item.returned && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                          Kondisi Alat:
                        </label>
                        <select
                          value={item.returnedCondition || 'Baik'}
                          onChange={(e) =>
                            handleConditionChange(
                              idx,
                              e.target.value as 'Baik' | 'Kotor (Perlu Cuci)' | 'Rusak Ringan' | 'Rusak Parah' | 'Hilang'
                            )
                          }
                          className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                        >
                          <option value="Baik">Baik & Lengkap</option>
                          <option value="Kotor (Perlu Cuci)">Kotor / Cuci</option>
                          <option value="Rusak Ringan">Sobek / Rusak Ringan (+Rp 25.000)</option>
                          <option value="Rusak Parah">Patah / Rusak Parah (+Rp 75.000)</option>
                          <option value="Hilang">Hilang (Ganti Rugi)</option>
                        </select>
                      </div>

                      <div className="text-right">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                          Biaya Kerusakan:
                        </label>
                        <div className="font-extrabold text-slate-800 pt-1">
                          {formatRupiah(item.damageFee || 0)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bill & Denda Summary */}
          <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50 space-y-2">
            <div className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-200 pb-1.5">
              Rincian Biaya & Pelunasan:
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Keterlambatan ({order.overdueDays} Hari):</span>
              <span className={`font-bold ${order.overdueDays > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {formatRupiah(order.overdueFine)}
              </span>
            </div>

            {damageTotal > 0 && (
              <div className="flex items-center justify-between text-slate-600">
                <span>Biaya Perbaikan / Cuci:</span>
                <span className="font-bold text-amber-600">{formatRupiah(damageTotal)}</span>
              </div>
            )}

            {remainingRentalFee > 0 && (
              <div className="flex items-center justify-between text-slate-600">
                <span>Sisa Biaya Sewa (Belum Lunas):</span>
                <span className="font-bold text-rose-600">{formatRupiah(remainingRentalFee)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
              <span className="font-extrabold text-slate-900">Total Wajib Bayar Sekarang:</span>
              <span className="font-black text-rose-600 text-base tabular-nums">
                {formatRupiah(totalFineAndSettlement)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector if there is an amount to pay */}
          {totalFineAndSettlement > 0 && (
            <div className="space-y-2">
              <div className="font-bold text-slate-800 text-xs">
                Metode Pembayaran Pelunasan & Denda:
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentChoice('TUNAI')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold cursor-pointer transition-all ${
                    paymentChoice === 'TUNAI'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Tunai (Cash)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentChoice('QRIS');
                    onOpenQrisForSettlement(order.orderNumber, order.customerName, totalFineAndSettlement);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold cursor-pointer transition-all ${
                    paymentChoice === 'QRIS'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Scan QRIS</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleFinish}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Selesaikan Pengembalian</span>
          </button>
        </div>
      </div>

      {isConfirmDialogOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-lg font-extrabold text-slate-900">Konfirmasi</h3>
            </div>
            <p className="text-sm text-slate-600">
              Apakah Anda yakin ingin menyelesaikan pengembalian alat ini?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsConfirmDialogOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-sm"
              >
                Tidak
              </button>
              <button
                onClick={() => {
                  onPrint(getUpdatedOrder());
                  confirmFinish();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm"
              >
                Ya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
