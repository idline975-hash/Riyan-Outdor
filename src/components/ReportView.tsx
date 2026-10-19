import React from 'react';
import { RentalOrder, GearItem, CashierShift } from '../types';
import { formatRupiah } from '../utils/formatters';
import { Download, CreditCard, Banknote, Shield, AlertCircle, TrendingUp, CheckCircle, BarChart3 } from 'lucide-react';

interface ReportViewProps {
  orders: RentalOrder[];
  inventory: GearItem[];
  currentShift: CashierShift;
  onOpenShiftModal: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  orders,
  inventory,
  currentShift,
  onOpenShiftModal,
}) => {
  // Aggregate stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paidAmount || 0), 0);
  const totalFineRevenue = orders.reduce((sum, o) => sum + (o.finePaid ? o.totalFine : 0), 0);
  const totalOutstandingFine = orders.reduce((sum, o) => sum + (!o.finePaid ? o.totalFine : 0), 0);

  // Method breakdown
  const qrisTotal = orders
    .filter((o) => o.paymentMethod === 'QRIS')
    .reduce((sum, o) => sum + o.paidAmount, 0);

  const cashTotal = orders
    .filter((o) => o.paymentMethod === 'TUNAI')
    .reduce((sum, o) => sum + o.paidAmount, 0);

  const transferTotal = orders
    .filter((o) => o.paymentMethod === 'TRANSFER_BANK')
    .reduce((sum, o) => sum + o.paidAmount, 0);

  const handleExportCsv = () => {
    let csv = 'No. Nota,Nama Penyewa,No HP,Mulai,Selesai,Durasi (Hari),Total Sewa,Status Bayar,Metode,Status Barang,Keterlambatan,Sisa Denda\n';
    orders.forEach((o) => {
      csv += `"${o.orderNumber}","${o.customerName}","${o.customerPhone}","${o.startDate}","${o.endDate}","${o.durationDays}","${o.totalRentalFee}","${o.paymentStatus}","${o.paymentMethod}","${o.itemStatus}","${o.overdueDays} Hari","${o.totalFine}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `laporan-sewa-campgear-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3.5 pb-8">
      {/* Header Banner */}
      <div className="p-3.5 sm:p-4 bg-white text-slate-800 rounded-2xl flex items-center justify-between border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-600">
              Rekapitulasi Omzet & Kasir
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900">
              Laporan Keuangan Sewa
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenShiftModal}
            className="px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer"
          >
            Rekap Shift
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span> CSV
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Omset Sewa
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
            {formatRupiah(totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Dari total {orders.length} transaksi sewa tercatat
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
              Denda Masuk (Lunas)
            </span>
            <CheckCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1 tabular-nums">
            {formatRupiah(totalFineRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Denda telat & perbaikan telah dibayar
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
              Piutang Denda Berjalan
            </span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1 tabular-nums">
            {formatRupiah(totalOutstandingFine)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Belum diselesaikan (pelanggan belum kembali)
          </div>
        </div>
      </div>

      {/* Payment Channel Breakdown */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)] space-y-3">
        <h4 className="font-extrabold text-slate-900 text-sm">
          Distribusi Metode Pembayaran
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* QRIS */}
          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                <CreditCard className="w-4 h-4" />
                <span>QRIS Digital</span>
              </div>
              <div className="text-lg font-black text-slate-900 mt-1 tabular-nums">
                {formatRupiah(qrisTotal)}
              </div>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-1 rounded-lg">
              {Math.round((qrisTotal / (totalRevenue || 1)) * 100)}%
            </span>
          </div>

          {/* Tunai */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Banknote className="w-4 h-4" />
                <span>Tunai (Cash di Laci)</span>
              </div>
              <div className="text-lg font-black text-slate-900 mt-1 tabular-nums">
                {formatRupiah(cashTotal)}
              </div>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-200 px-2 py-1 rounded-lg">
              {Math.round((cashTotal / (totalRevenue || 1)) * 100)}%
            </span>
          </div>

          {/* Transfer Bank */}
          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                <Shield className="w-4 h-4" />
                <span>Transfer Bank / VA</span>
              </div>
              <div className="text-lg font-black text-slate-900 mt-1 tabular-nums">
                {formatRupiah(transferTotal)}
              </div>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-lg">
              {Math.round((transferTotal / (totalRevenue || 1)) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Equipment Rental Utilization */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)] space-y-3">
        <h4 className="font-extrabold text-slate-900 text-sm">
          Alat Paling Sering Disewa
        </h4>

        <div className="space-y-2">
          {inventory.slice(0, 5).map((gear) => {
            const usagePercent = Math.round((gear.rentedStock / gear.totalStock) * 100) || 0;
            return (
              <div key={gear.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex-1 mr-4">
                  <div className="font-bold text-slate-800">{gear.name}</div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      style={{ width: `${usagePercent}%` }}
                      className="bg-blue-600 h-full rounded-full"
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-slate-900">{gear.rentedStock} / {gear.totalStock} Unit</div>
                  <div className="text-[10px] text-slate-400 font-semibold">{usagePercent}% terpakai</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
