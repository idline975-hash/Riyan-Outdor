import React, { useState } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  Package, 
  Check, 
  Printer, 
  MessageCircle, 
  AlertCircle, 
  Clock, 
  CreditCard,
  ChevronDown,
  ChevronUp,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Info
} from 'lucide-react';
import { RentalOrder, CashierShift } from '../types';
import { formatRupiah, generateWhatsAppMessage } from '../utils/formatters';

interface BookedViewProps {
  orders: RentalOrder[];
  currentShift: CashierShift;
  onOpenNewOrder: () => void;
  onTakeItem: (order: RentalOrder) => void;
  onPrint: (order: RentalOrder) => void;
  onPayQris: (order: RentalOrder) => void;
  onSwitchToOutView: () => void;
}

export const BookedView: React.FC<BookedViewProps> = ({
  orders,
  currentShift,
  onOpenNewOrder,
  onTakeItem,
  onPrint,
  onPayQris,
  onSwitchToOutView,
}) => {
  // Filter states
  const [activeSubFilter, setActiveSubFilter] = useState<'all' | 'dp' | 'ready' | 'taken'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<{ [key: string]: boolean }>({});

  // All booked orders (takenStatus === 'Belum Diambil' or itemStatus === 'Booked')
  const allBookedOrders = orders.filter(
    (o) => o.takenStatus === 'Belum Diambil' || (o.itemStatus === 'Booked' && o.takenStatus !== 'Sudah Diambil')
  );

  // Counts for the 3 top status summary buttons (Matching User's Photo!)
  const bayarDpCount = allBookedOrders.filter((o) => o.paymentStatus === 'DP').length;
  const siapAmbilCount = allBookedOrders.filter((o) => o.takenStatus === 'Belum Diambil').length;
  const sudahDiambilCount = orders.filter((o) => o.takenStatus === 'Sudah Diambil').length;

  // Filtered list
  const filteredList = orders.filter((order) => {
    // If viewing taken/finished from Booked screen
    if (activeSubFilter === 'taken') {
      if (order.takenStatus !== 'Sudah Diambil') return false;
    } else {
      // Must be in booked category
      const isBooked = order.takenStatus === 'Belum Diambil' || (order.itemStatus === 'Booked' && order.takenStatus !== 'Sudah Diambil');
      if (!isBooked) return false;

      if (activeSubFilter === 'dp' && order.paymentStatus !== 'DP') return false;
      if (activeSubFilter === 'ready' && order.takenStatus !== 'Belum Diambil') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.includes(q);
      const matchGear = order.items.some((i) => i.gearName.toLowerCase().includes(q));
      if (!matchName && !matchNum && !matchPhone && !matchGear) return false;
    }

    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleWhatsApp = (order: RentalOrder) => {
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

    let phone = order.customerPhone.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    }
    const url = `https://wa.me/${phone}?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-3.5 pb-8 animate-in fade-in duration-200">
      {/* Top Header Card: Booked Payment & Shift Info (Faithful to Image) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Booked Payment
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase">
              Reservasi Toko
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar barang sewa yang sudah dibooking &amp; menunggu serah terima.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Shift badge */}
          <div className="px-2.5 py-1 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{currentShift.shiftName}</span>
          </div>

          <button
            type="button"
            onClick={onOpenNewOrder}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Booking Baru</span>
          </button>
        </div>
      </div>

      {/* 3 Top Summary Buttons (Exact Match to User Photo: BAYAR DP, AMBIL, SELESAI) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {/* 1. BAYAR DP (Yellow/Amber Card) */}
        <button
          type="button"
          onClick={() => setActiveSubFilter(activeSubFilter === 'dp' ? 'all' : 'dp')}
          className={`relative flex flex-col items-center justify-center p-3 rounded-2xl text-white transition-all transform active:scale-95 text-center cursor-pointer shadow-[0_8px_20px_rgba(234,140,0,0.3)] select-none hover:-translate-y-0.5 ${
            activeSubFilter === 'dp'
              ? 'ring-3 ring-amber-400 ring-offset-2 scale-[1.02] shadow-[0_12px_25px_rgba(234,140,0,0.45)]'
              : 'hover:brightness-105'
          }`}
          style={{
            background: 'linear-gradient(135deg, #FFB020 0%, #EA8C00 100%)',
          }}
        >
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight">
            BAYAR DP
          </span>
          <span className="text-xl sm:text-2xl font-black mt-0.5 tracking-tight">
            {bayarDpCount}
          </span>
          {activeSubFilter === 'dp' && (
            <span className="absolute -bottom-1.5 w-4 h-1 bg-white rounded-full"></span>
          )}
        </button>

        {/* 2. AMBIL / SIAP DIAMBIL (Blue Card with Shadow) */}
        <button
          type="button"
          onClick={() => setActiveSubFilter(activeSubFilter === 'ready' ? 'all' : 'ready')}
          className={`relative flex flex-col items-center justify-center p-3 rounded-2xl text-white transition-all transform active:scale-95 text-center cursor-pointer shadow-[0_8px_20px_rgba(37,99,235,0.3)] select-none hover:-translate-y-0.5 ${
            activeSubFilter === 'ready'
              ? 'ring-3 ring-blue-400 ring-offset-2 scale-[1.02] shadow-[0_12px_25px_rgba(37,99,235,0.45)]'
              : 'hover:brightness-105'
          }`}
          style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
          }}
        >
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight">
            AMBIL
          </span>
          <span className="text-xl sm:text-2xl font-black mt-0.5 tracking-tight">
            {siapAmbilCount}
          </span>
          {activeSubFilter === 'ready' && (
            <span className="absolute -bottom-1.5 w-4 h-1 bg-white rounded-full"></span>
          )}
        </button>

        {/* 3. SELESAI / SUDAH DIAMBIL (Green Card with Checkmark) */}
        <button
          type="button"
          onClick={() => setActiveSubFilter(activeSubFilter === 'taken' ? 'all' : 'taken')}
          className={`relative flex flex-col items-center justify-center p-3 rounded-2xl text-white transition-all transform active:scale-95 text-center cursor-pointer shadow-[0_8px_20px_rgba(21,167,80,0.3)] select-none hover:-translate-y-0.5 ${
            activeSubFilter === 'taken'
              ? 'ring-3 ring-emerald-500 ring-offset-2 scale-[1.02] shadow-[0_12px_25px_rgba(21,167,80,0.45)]'
              : 'hover:brightness-105'
          }`}
          style={{
            background: 'linear-gradient(135deg, #2CD16D 0%, #15A750 100%)',
          }}
        >
          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-black uppercase tracking-tight">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Selesai</span>
          </div>
          <span className="text-xl sm:text-2xl font-black mt-0.5 tracking-tight">
            {sudahDiambilCount}
          </span>
          {activeSubFilter === 'taken' && (
            <span className="absolute -bottom-1.5 w-4 h-1 bg-white rounded-full"></span>
          )}
        </button>
      </div>

      {/* Sub-navigation Pill Bar (Matching Photo: [ 📅 Booking ] [ ⚗ Filter ] [ 🔍 Cari ]) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setActiveSubFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Semua Booking ({allBookedOrders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubFilter('dp')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubFilter === 'dp'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Status DP ({bayarDpCount})</span>
          </button>

          <button
            type="button"
            onClick={onSwitchToOutView}
            className="px-3 py-1.5 rounded-xl font-bold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 flex items-center gap-1 transition-all cursor-pointer"
          >
            <span>Lihat Menu Out ➔</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-36 sm:w-56 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Cari booking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Section Notice Banner: ℹ️ Take Item (Siap Ambil) (Exact Match to User Screenshot) */}
      <div className="flex items-center justify-between p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <span className="text-base">ℹ️</span>
          <div>
            <span className="font-black text-blue-950">Take Item (Siap Ambil): </span>
            <span className="text-slate-600">
              Klik &quot;Ambil Barang&quot; saat pelanggan datang untuk melunasi DP dan menyerahkan barang (status berubah jadi OUT).
            </span>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Tidak ada data booking</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {searchQuery ? 'Tidak ada hasil sesuai kata kunci pencarian.' : 'Semua reservasi booking telah diambil atau belum ada pesanan baru.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenNewOrder}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
          >
            + Buat Booking Baru
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filteredList.map((order) => {
            const isTaken = order.takenStatus === 'Sudah Diambil';
            const isDp = order.paymentStatus === 'DP';
            const isLunas = order.paymentStatus === 'LUNAS';
            const isExpanded = !!expandedOrders[order.id];
            const grandTotal = order.totalRentalFee + order.depositAmount;
            const remainingToPay = Math.max(0, grandTotal - order.paidAmount);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_15px_rgba(15,23,42,0.04)] overflow-hidden transition-all hover:shadow-[0_8px_25px_rgba(15,23,42,0.08)]"
              >
                {/* Top card bar accent */}
                <div className={`h-1 w-full ${isTaken ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-400 to-amber-600'}`} />

                <div className="p-4 space-y-3">
                  {/* Card Header (Matches Photo: Jasmin #9797 - Zidan [BOOKING]) */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                        {order.customerName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-0.5">
                        <span className="text-slate-700">🧾 #{order.orderNumber}</span>
                        <span>-</span>
                        <span className="capitalize">{order.cashierName}</span>
                        {order.guaranteeType && (
                          <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-bold border border-amber-200">
                            🛡️ {order.guaranteeType}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Booking / Out Badge */}
                    <div className="shrink-0">
                      {isTaken ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                          <CheckCircle2 className="w-3 h-3" />
                          Sudah Diambil (Out)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                          <Clock className="w-3 h-3" />
                          BOOKING
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 2-Column Info Box (Matches Photo: PERIODE SEWA & ITEMS) */}
                  <div className="border border-slate-200/90 bg-slate-50/70 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                        PERIODE SEWA
                      </div>
                      <div className="font-extrabold text-slate-800 mt-0.5 tabular-nums">
                        {order.startDate} - {order.endDate}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Durasi: {order.durationDays} Hari
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                        ITEMS
                      </div>
                      <div className="font-extrabold text-slate-800 mt-0.5">
                        {order.items.length} Jenis Alat
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {order.items.reduce((sum, it) => sum + it.quantity, 0)} Pcs Total
                      </div>
                    </div>
                  </div>

                  {/* Status Rows (Matches Photo) */}
                  <div className="space-y-1.5 text-xs pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold">Status Barang:</span>
                      <span className={`font-black px-2.5 py-0.5 rounded-full text-[11px] ${
                        isTaken
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}>
                        {order.takenStatus || 'Belum Diambil'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold">Total Biaya:</span>
                      <span className="font-black text-slate-900 text-sm">
                        {formatRupiah(grandTotal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold">Sisa Bayar:</span>
                      {isLunas ? (
                        <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-xs">
                          LUNAS
                        </span>
                      ) : isDp ? (
                        <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md text-xs">
                          DP {formatRupiah(order.paidAmount)} (Kurang {formatRupiah(remainingToPay)})
                        </span>
                      ) : (
                        <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md text-xs">
                          {formatRupiah(grandTotal)} (Belum Lunas)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expand Items List */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleExpand(order.id)}
                      className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-800 py-1 transition-colors border-t border-slate-100"
                    >
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Daftar Alat Dipesan ({order.items.length})
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600">
                        {isExpanded ? 'Tutup Rincian' : 'Lihat Daftar Alat'}
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="mt-2 bg-slate-50 rounded-xl p-2.5 space-y-1.5 text-xs border border-slate-100 animate-in fade-in duration-150">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-200/60 last:border-none">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded bg-slate-200 text-slate-800 text-[10px] font-bold flex items-center justify-center">
                                {it.quantity}x
                              </span>
                              <span className="font-medium text-slate-800">{it.gearName}</span>
                            </div>
                            <span className="font-bold text-slate-700">{formatRupiah(it.subtotal)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons Row */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold tabular-nums">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{order.orderTimestamp}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Cetak Nota */}
                      <button
                        type="button"
                        onClick={() => onPrint(order)}
                        title="Cetak Nota"
                        className="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors active:scale-95 shadow-2xs cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* WhatsApp */}
                      <button
                        type="button"
                        onClick={() => handleWhatsApp(order)}
                        title="WhatsApp Pengingat"
                        className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors active:scale-95 shadow-2xs cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                      </button>

                      {/* Action: Ambil Barang (Serah Terima) */}
                      {!isTaken ? (
                        <button
                          type="button"
                          onClick={() => onTakeItem(order)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>Ambil Barang</span>
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                          ✓ Sudah Diambil
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
