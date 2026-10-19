import React from 'react';
import { X, Printer, MessageCircle } from 'lucide-react';
import { RentalOrder } from '../types';
import { formatRupiah, generateWhatsAppMessage } from '../utils/formatters';

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: RentalOrder;
  receiptType?: 'initial' | 'take' | 'return';
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  receiptType = 'initial',
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendWa = () => {
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
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const receiptTitle =
    receiptType === 'initial'
      ? '1. Struk Pembayaran Awal'
      : receiptType === 'take'
      ? '2. Struk Ambil Barang & Pelunasan'
      : '3. Struk Pengembalian Barang';

  const receiptSubtitle =
    receiptType === 'initial'
      ? 'Pembayaran Sewa / DP Nota Baru'
      : receiptType === 'take'
      ? 'Serah Terima Alat & Pelunasan'
      : 'Inspeksi & Penyelesaian Selesai';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-300">
                {receiptTitle}
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-white">
                Nota #{order.orderNumber}
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

        {/* Thermal Paper View */}
        <div className="p-5 flex-1 overflow-y-auto bg-slate-100 flex justify-center">
          <div
            id="thermal-receipt"
            style={{
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontFamily: 'monospace',
              fontSize: '11px',
              lineHeight: '1.4',
              width: '100%',
              maxWidth: '300px',
              padding: '16px',
              borderTop: '8px dashed #cbd5e1',
              borderBottom: '8px dashed #cbd5e1',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Store Header */}
            <div style={{ textAlign: 'center', paddingBottom: '8px', borderBottom: '1px dashed #94a3b8' }}>
              <div
                style={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  marginBottom: '4px',
                }}
              >
                {receiptSubtitle}
              </div>
              <div style={{ fontWeight: 900, fontSize: '14px', textTransform: 'uppercase' }}>
                SUMMIT CAMP OUTDOOR
              </div>
              <div style={{ fontSize: '10px', color: '#475569' }}>
                Penyewaan Alat Gunung Terlengkap
              </div>
              <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>
                Jl. Kaliurang KM 9, Sleman, DIY · WA: 0812-3456-7890
              </div>
            </div>

            {/* Order Metadata */}
            <div style={{ padding: '8px 0', borderBottom: '1px dashed #94a3b8', fontSize: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ color: '#475569' }}>No. Nota:</span>
                <span style={{ fontWeight: 'bold' }}>#{order.orderNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ color: '#475569' }}>Waktu Cetak:</span>
                <span>{new Date().toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ color: '#475569' }}>Kasir:</span>
                <span style={{ textTransform: 'capitalize' }}>
                  {order.cashierName} ({order.shiftName})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ color: '#475569' }}>Penyewa:</span>
                <span style={{ fontWeight: 'bold' }}>{order.customerName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ color: '#475569' }}>Jaminan:</span>
                <span>
                  {order.guaranteeType} ({order.customerIdNumber})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Periode Sewa:</span>
                <span style={{ fontWeight: 'bold' }}>
                  {order.startDate} s/d {order.endDate} ({order.durationDays} hari)
                </span>
              </div>
            </div>

            {/* Items */}
            <div style={{ padding: '8px 0', borderBottom: '1px dashed #94a3b8' }}>
              <div style={{ fontWeight: 'bold', fontSize: '10px', marginBottom: '4px', color: '#334155' }}>
                DAFTAR PERALATAN DISEWA:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {order.items.map((it, idx) => (
                  <div key={idx} style={{ fontSize: '10px' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{it.gearName}</span>
                      {receiptType === 'return' && (
                        <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#475569' }}>
                          [{it.returnedCondition || 'Baik'}]
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b' }}>
                      <span>
                        {it.quantity} x {formatRupiah(it.pricePerDay)}/hr
                      </span>
                      <span style={{ fontFamily: 'monospace', color: '#0f172a', fontWeight: 600 }}>
                        {formatRupiah(it.subtotal)}
                      </span>
                    </div>
                    {it.damageFee ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#dc2626' }}>
                        <span>Denda Kerusakan ({it.returnedCondition}):</span>
                        <span>+{formatRupiah(it.damageFee)}</span>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div style={{ padding: '8px 0', borderBottom: '1px dashed #94a3b8', fontSize: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ color: '#475569' }}>Total Sewa Alat:</span>
                <span style={{ fontWeight: 'bold' }}>{formatRupiah(order.totalRentalFee)}</span>
              </div>

              {order.depositAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', color: '#475569' }}>
                  <span>Uang Jaminan/Deposit:</span>
                  <span>{formatRupiah(order.depositAmount)}</span>
                </div>
              )}

              {order.totalFine > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', color: '#dc2626', fontWeight: 'bold' }}>
                  <span>Denda Telat/Kerusakan:</span>
                  <span>{formatRupiah(order.totalFine)}</span>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '4px',
                  marginTop: '4px',
                  borderTop: '1px solid #e2e8f0',
                  fontWeight: 900,
                  fontSize: '12px',
                }}
              >
                <span>TOTAL KESELURUHAN:</span>
                <span>{formatRupiah(order.totalRentalFee + order.depositAmount + (order.totalFine || 0))}</span>
              </div>

              {receiptType === 'initial' && order.paymentStatus === 'DP' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', color: '#b45309', fontWeight: 'bold' }}>
                    <span>Uang Muka (DP) Dibayar:</span>
                    <span>{formatRupiah(order.paidAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', color: '#dc2626', fontWeight: 900 }}>
                    <span>SISA KURANG BAYAR:</span>
                    <span>{formatRupiah(Math.max(0, (order.totalRentalFee + order.depositAmount) - order.paidAmount))}</span>
                  </div>
                </>
              ) : receiptType === 'take' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', color: '#047857', fontWeight: 'bold' }}>
                    <span>Pelunasan & Pembayaran:</span>
                    <span>{formatRupiah(order.paidAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', color: '#047857', fontWeight: 900 }}>
                    <span>STATUS: LUNAS 100%</span>
                    <span>Rp 0</span>
                  </div>
                </>
              ) : receiptType === 'return' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', color: '#334155', fontWeight: 'bold' }}>
                    <span>Total Pembayaran Selesai:</span>
                    <span>{formatRupiah(order.paidAmount + (order.totalFine || 0))}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', color: '#047857', fontWeight: 900 }}>
                    <span>STATUS: PENGEMBALIAN SELESAI</span>
                    <span>✓ LUNAS</span>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', color: '#475569' }}>
                  <span>Sudah Dibayar ({order.paymentMethod}):</span>
                  <span>{formatRupiah(order.paidAmount)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', paddingTop: '3px' }}>
                <span style={{ color: '#475569' }}>Status Nota:</span>
                <span style={{ color: order.paymentStatus === 'LUNAS' ? '#047857' : '#b45309' }}>
                  {order.paymentStatus}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#475569', marginTop: '2px' }}>
                <span>Status Logistik:</span>
                <span style={{ fontWeight: 'bold' }}>{order.takenStatus || order.itemStatus}</span>
              </div>
            </div>

            {/* Footer Notice & Barcode */}
            <div style={{ paddingTop: '8px', textAlign: 'center', fontSize: '8px', color: '#64748b', lineHeight: '1.2' }}>
              <p style={{ fontWeight: 'bold', color: '#334155', marginBottom: '2px' }}>KETENTUAN:</p>
              <p>• Struk ini adalah bukti sah transaksi di Summit Camp Outdoor.</p>
              <p>• Simpan struk ini saat pengambilan maupun pengembalian alat.</p>

              {/* Barcode Mock */}
              <div style={{ paddingTop: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '24px', justifyContent: 'center' }}>
                  <div style={{ width: '2px', height: '100%', backgroundColor: '#0f172a' }} />
                  <div style={{ width: '1px', height: '100%', backgroundColor: '#0f172a' }} />
                  <div style={{ width: '3px', height: '100%', backgroundColor: '#0f172a' }} />
                  <div style={{ width: '1px', height: '100%', backgroundColor: '#0f172a' }} />
                  <div style={{ width: '2px', height: '100%', backgroundColor: '#0f172a' }} />
                  <div style={{ width: '4px', height: '100%', backgroundColor: '#0f172a' }} />
                  <div style={{ width: '1px', height: '100%', backgroundColor: '#0f172a' }} />
                  <div style={{ width: '2px', height: '100%', backgroundColor: '#0f172a' }} />
                </div>
                <span style={{ fontFamily: 'monospace', fontSize: '9px', letterSpacing: '2px', color: '#475569', marginTop: '2px' }}>
                  *{order.orderNumber}-{receiptType.toUpperCase()}*
                </span>
              </div>

              <p style={{ paddingTop: '4px', fontStyle: 'italic', fontWeight: 'bold', color: '#334155' }}>
                Salam Lestari! Terima Kasih Telah Menyewa.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2 no-print">
          <button
            type="button"
            onClick={handleSendWa}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Kirim WA</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk</span>
          </button>
        </div>
      </div>
    </div>
  );
};
