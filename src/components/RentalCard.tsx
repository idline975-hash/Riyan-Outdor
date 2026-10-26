import React, { useState } from 'react';
import { RentalOrder } from '../types';
import { formatRupiah, generateWhatsAppMessage } from '../utils/formatters';
import { Printer, MessageCircle, AlertCircle, Package, Clock, ChevronDown, ChevronUp, ShieldCheck, CreditCard } from 'lucide-react';

interface RentalCardProps {
  order: RentalOrder;
  onPrint: (order: RentalOrder) => void;
  onReturn: (order: RentalOrder) => void;
  onPayQris: (order: RentalOrder) => void;
  onTakeItem?: (order: RentalOrder) => void;
}

export const RentalCard: React.FC<RentalCardProps> = ({
  order,
  onPrint,
  onReturn,
  onPayQris,
  onTakeItem,
}) => {
  const [showItems, setShowItems] = useState(false);

  const handleWhatsApp = () => {
    const text = generateWhatsAppMessage({
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      startDate: order.startDate,
      endDate: order.endDate,
      items: order.items,
      paymentStatus: order.paymentStatus,
      paidAmount: order.paidAmount,
      totalRentalFee: order.totalRentalFee,
      overdueDays: order.overdueDays,
      totalFine: order.totalFine,
      itemStatus: order.itemStatus,
    });
    
    // Clean phone number for WhatsApp
    let phone = order.customerPhone.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    }
    const url = `https://wa.me/${phone}?text=${text}`;
    window.open(url, '_blank');
  };

  const isOverdue = order.overdueDays > 0;
  const hasFine = order.totalFine > 0;
  const isPaid = order.paymentStatus === 'LUNAS';

  return (
    <div className={`glass-card rounded-2xl border transition-all duration-300 overflow-hidden shadow-[0_8px_25px_rgba(15,23,42,0.05)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.1)] hover:-translate-y-1 relative ${
      hasFine ? 'border-rose-300/80 ring-2 ring-rose-400/20' : 'border-white/80 hover:border-white'
    }`}>
      {/* Specular glass highlight reflection on top edge */}
      <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

      {/* Top status accent */}
      {hasFine && <div className="h-1 bg-gradient-to-r from-rose-500 to-amber-500 w-full" />}
      {!hasFine && order.itemStatus === 'Sudah Kembali' && <div className="h-1 bg-emerald-500 w-full" />}

      <div className="p-3 sm:p-3.5 space-y-2 relative z-10">
        {/* Header: Customer Name & Payment Status Badge */}
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug truncate" title={order.customerName}>
              {order.customerName}
            </h3>
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-0.5 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-0.5 text-slate-600 font-mono">
                <span className="text-slate-400">#</span>{order.orderNumber}
              </span>
              <span>·</span>
              <span className="text-slate-500 capitalize">{order.cashierName}</span>
              {order.guaranteeType && (
                <>
                  <span>·</span>
                  <span className="text-amber-800 bg-amber-500/10 backdrop-blur-xs px-1.5 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-0.5 border border-amber-500/20 whitespace-nowrap">
                    <ShieldCheck className="w-2.5 h-2.5 text-amber-600 inline" />
                    {order.guaranteeType}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Payment Status Pill */}
          <div className="shrink-0">
            {order.paymentStatus === 'BELUM LUNAS' ? (
              <span className="inline-block bg-rose-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm whitespace-nowrap border border-white/20">
                Belum Lunas
              </span>
            ) : order.paymentStatus === 'DP' ? (
              <span className="inline-block bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm whitespace-nowrap border border-white/20">
                DP (Kurang {formatRupiah(order.totalRentalFee - order.paidAmount)})
              </span>
            ) : (
              <span className="inline-block bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm whitespace-nowrap border border-white/20">
                Lunas
              </span>
            )}
          </div>
        </div>

        {/* Gray Container: Periode Sewa & Keterlambatan with Glass effect */}
        <div className="border border-white/70 bg-white/50 backdrop-blur-md rounded-xl p-2 sm:p-2.5 grid grid-cols-2 gap-2 shadow-2xs">
          <div>
            <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Periode Sewa
            </div>
            <div className="text-xs font-bold text-slate-800 mt-0.5 tabular-nums">
              {order.startDate} - {order.endDate}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Keterlambatan
            </div>
            <div className={`text-xs font-extrabold mt-0.5 tabular-nums ${
              isOverdue ? 'text-rose-600' : 'text-slate-500'
            }`}>
              {order.overdueDays > 0 ? `${order.overdueDays} Hari` : '-'}
            </div>
          </div>
        </div>

        {/* Dashed Box: Sisa Denda (Shown if fine exists or customer is late) */}
        {order.totalFine > 0 ? (
          <div className="border border-dashed border-rose-300 bg-rose-50/80 backdrop-blur-md rounded-xl px-3.5 py-2.5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 text-rose-500 fill-rose-100" />
              <span>Sisa Denda</span>
            </div>
            <div className="text-base sm:text-lg font-black text-rose-600 tracking-tight tabular-nums">
              {formatRupiah(order.totalFine)}
            </div>
          </div>
        ) : null}

        {/* Status Item Row */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="text-xs font-bold text-slate-500">
            Status Barang:
          </div>
          <div>
            {order.itemStatus === 'Sudah Kembali' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                <Package className="w-3.5 h-3.5 text-emerald-600" />
                Sudah Kembali (Selesai)
              </span>
            ) : order.takenStatus === 'Belum Diambil' || (order.itemStatus === 'Booked' && order.takenStatus !== 'Sudah Diambil') ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Booking (Belum Diambil)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-300">
                <Package className="w-3.5 h-3.5 text-blue-600" />
                Out (Sedang Disewa)
              </span>
            )}
          </div>
        </div>

        {/* Expandable Gear Items List Preview */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowItems(!showItems)}
            className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-800 py-1 transition-colors border-t border-slate-100"
          >
            <span className="font-semibold text-[11px] text-slate-400 uppercase tracking-wide">
              {order.items.length} Peralatan Gunung
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-600">
              {showItems ? 'Sembunyikan' : 'Lihat Rincian'}
              {showItems ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </span>
          </button>

          {showItems && (
            <div className="mt-2 bg-slate-50/80 rounded-xl p-2.5 space-y-1.5 text-xs border border-slate-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-700 py-1 border-b border-slate-100 last:border-none">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                      {item.quantity}x
                    </span>
                    <span className="font-medium text-slate-800">{item.gearName}</span>
                  </div>
                  <span className="font-semibold text-slate-600 tabular-nums">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>
              ))}

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200">
                <span>Total Biaya Sewa ({order.durationDays} hari):</span>
                <span className="font-bold text-slate-800">{formatRupiah(order.totalRentalFee)}</span>
              </div>
              
              {order.depositAmount > 0 && (
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Uang Jaminan/Deposit:</span>
                  <span className="font-medium text-emerald-700">{formatRupiah(order.depositAmount)}</span>
                </div>
              )}

              {order.notes && (
                <div className="text-[11px] text-slate-400 italic pt-1">
                  Catatan: {order.notes}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Action Bar: Fully responsive */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap sm:flex-nowrap">
          {/* Timestamp on the left (e.g. 21/08 15:08) */}
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold tabular-nums shrink-0">
            <Clock className="w-3.5 h-3.5" />
            <span>{order.orderTimestamp}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            {/* Pay QRIS if not yet paid */}
            {!isPaid && (
              <button
                type="button"
                onClick={() => onPayQris(order)}
                title="Bayar via QRIS Digital"
                className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">QRIS</span>
              </button>
            )}

            {/* Print Icon Button */}
            <button
              type="button"
              onClick={() => onPrint(order)}
              title="Cetak Nota Struk Thermal"
              className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors active:scale-95 shadow-2xs shrink-0 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* WhatsApp Share Button */}
            <button
              type="button"
              onClick={handleWhatsApp}
              title="Kirim Nota via WhatsApp"
              className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors active:scale-95 shadow-2xs shrink-0 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
            </button>

            {/* Action Button: Ambil Barang if Booked, Kembali if Out */}
            {order.itemStatus !== 'Sudah Kembali' && (
              order.takenStatus === 'Belum Diambil' || (order.itemStatus === 'Booked' && order.takenStatus !== 'Sudah Diambil') ? (
                <button
                  type="button"
                  onClick={() => onTakeItem ? onTakeItem(order) : onReturn(order)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Ambil</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onReturn(order)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  Kembali
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
