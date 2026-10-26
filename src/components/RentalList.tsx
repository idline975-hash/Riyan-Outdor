import React from 'react';
import { RentalOrder } from '../types';
import { RentalCard } from './RentalCard';
import { SummaryCards } from './SummaryCards';
import { Search, Info, X, Sparkles, Filter, Mountain, Plus, ShoppingBag, Compass } from 'lucide-react';

interface RentalListProps {
  orders: RentalOrder[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: 'all' | 'unreturned' | 'fine' | 'completed' | 'booked';
  onSelectFilter: (filter: 'all' | 'unreturned' | 'fine' | 'completed' | 'booked') => void;
  onPrint: (order: RentalOrder) => void;
  onReturn: (order: RentalOrder) => void;
  onPayQris: (order: RentalOrder) => void;
  onTakeItem?: (order: RentalOrder) => void;
  onOpenNewOrder: () => void;
  onOpenPackages?: () => void;
}

export const RentalList: React.FC<RentalListProps> = ({
  orders,
  searchQuery,
  onSearchChange,
  activeFilter,
  onSelectFilter,
  onPrint,
  onReturn,
  onPayQris,
  onTakeItem,
  onOpenNewOrder,
  onOpenPackages,
}) => {
  // Counts for the 3 top summary pills
  const unreturnedCount = orders.filter((o) => o.itemStatus === 'Belum Kembali' || o.itemStatus === 'Sebagian Kembali').length;
  const fineCount = orders.filter((o) => o.totalFine > 0 && !o.finePaid).length;
  const completedCount = orders.filter((o) => o.itemStatus === 'Sudah Kembali').length;

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (activeFilter === 'unreturned') {
      if (order.itemStatus !== 'Belum Kembali' && order.itemStatus !== 'Sebagian Kembali') return false;
    } else if (activeFilter === 'fine') {
      if (order.totalFine <= 0 || order.finePaid) return false;
    } else if (activeFilter === 'completed') {
      if (order.itemStatus !== 'Sudah Kembali') return false;
    } else if (activeFilter === 'booked') {
      if (order.itemStatus !== 'Booked') return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchOrderNum = order.orderNumber.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.includes(q);
      const matchCashier = order.cashierName.toLowerCase().includes(q);
      const matchGear = order.items.some((i) => i.gearName.toLowerCase().includes(q));
      if (!matchName && !matchOrderNum && !matchPhone && !matchCashier && !matchGear) return false;
    }

    return true;
  });

  return (
    <div className="space-y-3.5 pb-8">
      {/* 3 Top Summary Buttons (Exact match to Image 1) */}
      <SummaryCards
        unreturnedCount={unreturnedCount}
        fineCount={fineCount}
        completedCount={completedCount}
        activeFilter={activeFilter}
        onSelectFilter={onSelectFilter}
      />

      {/* Search Bar Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 z-10" />
        <input
          type="text"
          placeholder="Cari nama, no. nota #9125, alat..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-9 py-2 glass-surface rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 border border-white/80 shadow-[0_4px_20px_rgba(15,23,42,0.04)] font-medium transition-all placeholder:text-slate-400"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 z-10 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Search & Filter Active Notice Banner (Exact match to Image 1) */}
      {(searchQuery.trim() || activeFilter !== 'all') && (
        <div className="flex items-center justify-between py-1.5 px-3 glass-surface rounded-xl border border-white/70 text-xs text-slate-600 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <span>
              {searchQuery.trim() ? (
                <>Pencarian: <span className="text-slate-900 font-extrabold">&quot;{searchQuery}&quot;</span></>
              ) : activeFilter === 'unreturned' ? (
                'Filter: Belum Kembali'
              ) : activeFilter === 'fine' ? (
                'Filter: Nota Denda'
              ) : activeFilter === 'completed' ? (
                'Filter: Selesai / Sudah Kembali'
              ) : (
                'Filter: Reservasi Booked'
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              onSelectFilter('all');
            }}
            className="bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm transition-all cursor-pointer border border-white/20"
          >
            <X className="w-3 h-3 stroke-[3]" />
            <span>Reset</span>
          </button>
        </div>
      )}

      {/* Promo Paket Hiking Banner */}
      {!searchQuery && activeFilter === 'all' && onOpenPackages && (
        <div className="glass-dark rounded-2xl p-3 sm:p-3.5 text-white flex items-center justify-between gap-3 shadow-lg border border-white/15 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-transparent pointer-events-none" />
          <div className="flex items-center gap-2.5 min-w-0 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-blue-600/80 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-sm backdrop-blur-md">
              <Compass className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-300 uppercase">
                <span>Paket Hiking 2026</span>
                <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                <span className="text-emerald-400">Hemat s/d 35%</span>
              </div>
              <div className="text-xs font-bold text-white truncate">
                6 Paket Sewa Lengkap (Solo, Duo, Squad 4P, Ekspedisi, Glamping, Tektok)
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenPackages}
            className="relative z-10 px-3 py-1.5 bg-blue-600/90 hover:bg-blue-500 active:scale-95 text-white text-[11px] font-black rounded-xl transition-all shrink-0 cursor-pointer shadow-md border border-white/20 backdrop-blur-md"
          >
            Lihat Paket
          </button>
        </div>
      )}

      {/* Quick Filter Tag Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <button
          type="button"
          onClick={() => onSelectFilter('all')}
          className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer backdrop-blur-md ${
            activeFilter === 'all' && !searchQuery
              ? 'bg-slate-900 text-white shadow-sm border border-slate-700'
              : 'glass-pill text-slate-700 hover:bg-white/90 border border-white/80'
          }`}
        >
          Semua ({orders.length})
        </button>

        <button
          type="button"
          onClick={() => onSelectFilter('unreturned')}
          className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer backdrop-blur-md ${
            activeFilter === 'unreturned'
              ? 'bg-amber-500 text-white shadow-sm border border-amber-400'
              : 'glass-pill text-slate-700 hover:bg-white/90 border border-white/80'
          }`}
        >
          Belum Kembali ({unreturnedCount})
        </button>

        <button
          type="button"
          onClick={() => onSelectFilter('fine')}
          className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer backdrop-blur-md ${
            activeFilter === 'fine'
              ? 'bg-rose-500 text-white shadow-sm border border-rose-400'
              : 'glass-pill text-slate-700 hover:bg-white/90 border border-white/80'
          }`}
        >
          Nota Denda ({fineCount})
        </button>

        <button
          type="button"
          onClick={() => onSelectFilter('completed')}
          className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer backdrop-blur-md ${
            activeFilter === 'completed'
              ? 'bg-emerald-600 text-white shadow-sm border border-emerald-500'
              : 'glass-pill text-slate-700 hover:bg-white/90 border border-white/80'
          }`}
        >
          Selesai ({completedCount})
        </button>

        <button
          type="button"
          onClick={() => onSelectFilter('booked')}
          className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer backdrop-blur-md ${
            activeFilter === 'booked'
              ? 'bg-purple-600 text-white shadow-sm border border-purple-500'
              : 'glass-pill text-slate-700 hover:bg-white/90 border border-white/80'
          }`}
        >
          Booked
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="glass-surface rounded-3xl border border-white/80 p-8 text-center space-y-3 my-4 shadow-lg">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">
              {orders.length === 0 ? 'Belum Ada Transaksi Sewa' : 'Tidak Ditemukan Nota Sewa'}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 max-w-sm mx-auto">
              {orders.length === 0
                ? 'Data transaksi dan uang kasir telah dikosongkan. Klik tombol di bawah untuk membuat nota sewa pertama.'
                : 'Tidak ada nota sewa yang sesuai dengan pencarian atau filter yang Anda pilih.'}
            </p>
          </div>
          {orders.length === 0 ? (
            <button
              type="button"
              onClick={onOpenNewOrder}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm active:scale-95 inline-flex items-center gap-1.5"
            >
              <span>+ Buat Nota Sewa Baru</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onSelectFilter('all');
              }}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Hapus Semua Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filteredOrders.map((order) => (
            <RentalCard
              key={order.id}
              order={order}
              onPrint={onPrint}
              onReturn={onReturn}
              onPayQris={onPayQris}
              onTakeItem={onTakeItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};
