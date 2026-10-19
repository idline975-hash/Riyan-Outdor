import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Printer, 
  MessageCircle, 
  Package, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { RentalOrder, CashierShift } from '../types';
import { formatRupiah, generateWhatsAppMessage } from '../utils/formatters';

interface OutViewProps {
  orders: RentalOrder[];
  currentShift: CashierShift;
  onReturn: (order: RentalOrder) => void;
  onPrint: (order: RentalOrder) => void;
  onPayQris: (order: RentalOrder) => void;
  onSwitchToBookedView: () => void;
}

export const OutView: React.FC<OutViewProps> = ({
  orders,
  currentShift,
  onReturn,
  onPrint,
  onPayQris,
  onSwitchToBookedView,
}) => {
  const [activeTab, setActiveTab] = useState<'all_out' | 'due_today' | 'overdue' | 'returned'>('all_out');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<{ [key: string]: boolean }>({});

  // Active out rentals (takenStatus === 'Sudah Diambil' AND itemStatus !== 'Sudah Kembali')
  const activeOutOrders = orders.filter(
    (o) => o.takenStatus === 'Sudah Diambil' && o.itemStatus !== 'Sudah Kembali'
  );

  // Overdue orders
  const overdueOrders = activeOutOrders.filter((o) => o.overdueDays > 0 || o.totalFine > 0);

  // Due today (e.g. today's date match or overdueDays === 0)
  const dueTodayOrders = activeOutOrders.filter((o) => {
    // Basic heuristic: check if end date is today or soon
    const now = new Date();
    const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getFullYear()).slice(2)}`;
    return o.endDate === todayStr;
  });

  // Returned orders (completed)
  const returnedOrders = orders.filter((o) => o.itemStatus === 'Sudah Kembali');

  // Filtered list based on tab
  const filteredList = orders.filter((order) => {
    if (activeTab === 'returned') {
      if (order.itemStatus !== 'Sudah Kembali') return false;
    } else {
      // Must be out
      const isOut = order.takenStatus === 'Sudah Diambil' && order.itemStatus !== 'Sudah Kembali';
      if (!isOut) return false;

      if (activeTab === 'overdue' && order.overdueDays <= 0 && order.totalFine <= 0) return false;
      if (activeTab === 'due_today') {
        const now = new Date();
        const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getFullYear()).slice(2)}`;
        if (order.endDate !== todayStr && order.overdueDays <= 0) return false;
      }
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

  const handleWhatsAppReminder = (order: RentalOrder) => {
    const isLate = order.overdueDays > 0;
    const greeting = isLate
      ? `Halo Kak ${order.customerName}, kami dari Summit Camp Outdoor mengingatkan bahwa masa sewa peralatan gunung (Nota #${order.orderNumber}) telah melewati batas waktu pengembalian (${order.endDate}). Denda berjalan saat ini: ${formatRupiah(order.totalFine)}. Mohon segera mengembalikan peralatan ke toko. Terima kasih! 🙏`
      : `Halo Kak ${order.customerName}, kami dari Summit Camp Outdoor mengingatkan jadwal pengembalian peralatan gunung (Nota #${order.orderNumber}) jatuh tempo pada ${order.endDate}. Mohon peralatan dikembalikan dalam keadaan bersih & kering ya Kak. Terima kasih! 🏕️`;

    let phone = order.customerPhone.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    }
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(greeting)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-3.5 pb-8 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Out / Sedang Disewa
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-extrabold uppercase">
              Barang di Luar
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar barang sewa yang <strong>sudah diambil</strong> oleh penyewa dan sedang aktif dibawa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSwitchToBookedView}
            className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
          >
            ← Menu Booked
          </button>
        </div>
      </div>

      {/* 3 Metric Cards for OUT */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {/* 1. SEDANG DISEWA (Blue) */}
        <button
          type="button"
          onClick={() => setActiveTab('all_out')}
          className={`relative flex flex-col items-center justify-center p-3 rounded-2xl text-white transition-all transform active:scale-95 text-center cursor-pointer shadow-[0_8px_20px_rgba(37,99,235,0.3)] select-none hover:-translate-y-0.5 ${
            activeTab === 'all_out'
              ? 'ring-3 ring-blue-400 ring-offset-2 scale-[1.02] shadow-[0_12px_25px_rgba(37,99,235,0.45)]'
              : 'hover:brightness-105'
          }`}
          style={{
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          }}
        >
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight">
            SEDANG DISEWA
          </span>
          <span className="text-xl sm:text-2xl font-black mt-0.5 tracking-tight">
            {activeOutOrders.length}
          </span>
          {activeTab === 'all_out' && (
            <span className="absolute -bottom-1.5 w-4 h-1 bg-white rounded-full"></span>
          )}
        </button>

        {/* 2. JATUH TEMPO (Amber) */}
        <button
          type="button"
          onClick={() => setActiveTab('due_today')}
          className={`relative flex flex-col items-center justify-center p-3 rounded-2xl text-white transition-all transform active:scale-95 text-center cursor-pointer shadow-[0_8px_20px_rgba(234,140,0,0.3)] select-none hover:-translate-y-0.5 ${
            activeTab === 'due_today'
              ? 'ring-3 ring-amber-400 ring-offset-2 scale-[1.02] shadow-[0_12px_25px_rgba(234,140,0,0.45)]'
              : 'hover:brightness-105'
          }`}
          style={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          }}
        >
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight">
            TEMPO HARI INI
          </span>
          <span className="text-xl sm:text-2xl font-black mt-0.5 tracking-tight">
            {dueTodayOrders.length}
          </span>
          {activeTab === 'due_today' && (
            <span className="absolute -bottom-1.5 w-4 h-1 bg-white rounded-full"></span>
          )}
        </button>

        {/* 3. TERLAMBAT / DENDA (Rose/Red) */}
        <button
          type="button"
          onClick={() => setActiveTab('overdue')}
          className={`relative flex flex-col items-center justify-center p-3 rounded-2xl text-white transition-all transform active:scale-95 text-center cursor-pointer shadow-[0_8px_20px_rgba(225,29,72,0.3)] select-none hover:-translate-y-0.5 ${
            activeTab === 'overdue'
              ? 'ring-3 ring-rose-400 ring-offset-2 scale-[1.02] shadow-[0_12px_25px_rgba(225,29,72,0.45)]'
              : 'hover:brightness-105'
          }`}
          style={{
            background: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)',
          }}
        >
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight">
            TERLAMBAT
          </span>
          <span className="text-xl sm:text-2xl font-black mt-0.5 tracking-tight">
            {overdueOrders.length}
          </span>
          {activeTab === 'overdue' && (
            <span className="absolute -bottom-1.5 w-4 h-1 bg-white rounded-full"></span>
          )}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all_out')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'all_out'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semua Out ({activeOutOrders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('overdue')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'overdue'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Terlambat ({overdueOrders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('returned')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'returned'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Sudah Dikembalikan ({returnedOrders.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-36 sm:w-56 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Cari order out..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Explanation banner */}
      <div className="p-2.5 bg-slate-100 border border-slate-200/80 rounded-2xl text-xs text-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">📦</span>
          <span>
            {activeTab === 'returned'
              ? 'Menampilkan riwayat barang yang sudah selesai dikembalikan ke toko.'
              : 'Barang di bawah ini sedang aktif dibawa oleh pelanggan. Klik "Kembalikan (Return)" saat pelanggan mengembalikan barang.'}
          </span>
        </div>
      </div>

      {/* List */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Tidak ada data</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {searchQuery ? 'Tidak ada hasil yang cocok dengan pencarian.' : 'Tidak ada barang sewa dengan filter yang dipilih.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filteredList.map((order) => {
            const isLate = order.overdueDays > 0;
            const isReturned = order.itemStatus === 'Sudah Kembali';
            const isExpanded = !!expandedOrders[order.id];

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border shadow-[0_4px_15px_rgba(15,23,42,0.04)] overflow-hidden transition-all hover:shadow-[0_8px_25px_rgba(15,23,42,0.08)] ${
                  isLate ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200/90'
                }`}
              >
                {/* Accent bar */}
                <div
                  className={`h-1 w-full ${
                    isReturned
                      ? 'bg-emerald-500'
                      : isLate
                      ? 'bg-rose-600'
                      : 'bg-blue-600'
                  }`}
                />

                <div className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                        {order.customerName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-0.5">
                        <span className="text-slate-700">🧾 #{order.orderNumber}</span>
                        <span>·</span>
                        <span className="capitalize">{order.cashierName}</span>
                        {order.guaranteeType && (
                          <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-bold border border-amber-200">
                            🛡️ Jaminan: {order.guaranteeType}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {isReturned ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                          <CheckCircle2 className="w-3 h-3" />
                          Sudah Dikembalikan
                        </span>
                      ) : isLate ? (
                        <span className="inline-flex items-center gap-1 bg-rose-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          Terlambat {order.overdueDays} Hari
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                          <Package className="w-3 h-3" />
                          Out (Sedang Disewa)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rental Period & Due Date Box */}
                  <div className="border border-slate-200/90 bg-slate-50/70 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                        PERIODE SEWA
                      </div>
                      <div className="font-extrabold text-slate-800 mt-0.5 tabular-nums">
                        {order.startDate} - {order.endDate}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Waktu Ambil: {order.takenAt || order.orderTimestamp}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                        BATAS KEMBALI
                      </div>
                      <div className={`font-black mt-0.5 tabular-nums ${isLate ? 'text-rose-600' : 'text-slate-800'}`}>
                        {order.endDate}
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                        {isReturned ? 'Telah Kembali' : isLate ? `Telat denda ${formatRupiah(order.totalFine)}` : 'Sesuai Jadwal'}
                      </div>
                    </div>
                  </div>

                  {/* Denda Alert */}
                  {order.totalFine > 0 && (
                    <div className="border border-dashed border-rose-300 bg-rose-50/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>Denda Keterlambatan / Kerusakan:</span>
                      </div>
                      <span className="font-black text-rose-700 text-sm">
                        {formatRupiah(order.totalFine)}
                      </span>
                    </div>
                  )}

                  {/* Expand Items */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleExpand(order.id)}
                      className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-800 py-1 transition-colors border-t border-slate-100"
                    >
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {order.items.length} Alat yang Dibawa Pelanggan
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600">
                        {isExpanded ? 'Tutup Rincian' : 'Lihat Rincian'}
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="mt-2 bg-slate-50 rounded-xl p-2.5 space-y-1.5 text-xs border border-slate-100 animate-in fade-in duration-150">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-200/60 last:border-none">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center">
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

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold tabular-nums">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{order.orderTimestamp}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Print */}
                      <button
                        type="button"
                        onClick={() => onPrint(order)}
                        title="Cetak Bukti Nota"
                        className="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors active:scale-95 shadow-2xs cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* WhatsApp reminder */}
                      <button
                        type="button"
                        onClick={() => handleWhatsAppReminder(order)}
                        title="Kirim Pengingat Pengembalian via WA"
                        className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors active:scale-95 shadow-2xs cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                      </button>

                      {/* Return action button */}
                      {!isReturned ? (
                        <button
                          type="button"
                          onClick={() => onReturn(order)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Kembalikan</span>
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                          ✓ Selesai Kembali
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
