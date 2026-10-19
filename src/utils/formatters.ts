/**
 * Utilities & Formatters for CampGear POS
 */

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('IDR', 'Rp');
}

export function formatDateIndo(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function generateWhatsAppMessage(order: {
  customerName: string;
  orderNumber: string;
  startDate: string;
  endDate: string;
  items: Array<{ gearName: string; quantity: number }>;
  paymentStatus: string;
  paidAmount: number;
  totalRentalFee: number;
  overdueDays: number;
  totalFine: number;
  itemStatus: string;
  storeName?: string;
}): string {
  const store = order.storeName || 'SUMMIT CAMP OUTDOOR GEAR RENTAL';
  const remainingBill = Math.max(0, order.totalRentalFee - order.paidAmount);
  
  let msg = `*KONFIRMASI SEWA ALAT GUNUNG - ${store}*\n\n`;
  msg += `Halo Kak *${order.customerName}*,\n`;
  msg += `Berikut rincian nota sewa peralatan outdoor Anda:\n\n`;
  msg += `🧾 *No. Nota:* #${order.orderNumber}\n`;
  msg += `📅 *Periode Sewa:* ${order.startDate} s/d ${order.endDate}\n`;
  msg += `📦 *Status Item:* ${order.itemStatus}\n`;
  msg += `💳 *Status Bayar:* ${order.paymentStatus}\n\n`;
  
  msg += `*Daftar Peralatan:*\n`;
  order.items.forEach((item, idx) => {
    msg += `${idx + 1}. ${item.gearName} (${item.quantity}x)\n`;
  });

  msg += `\n💵 *Total Sewa:* ${formatRupiah(order.totalRentalFee)}\n`;
  msg += `💰 *Sudah Dibayar:* ${formatRupiah(order.paidAmount)}\n`;
  
  if (remainingBill > 0) {
    msg += `⚠️ *Sisa Tagihan Sewa:* ${formatRupiah(remainingBill)}\n`;
  }

  if (order.overdueDays > 0 || order.totalFine > 0) {
    msg += `\n🚨 *INFO KETERLAMBATAN & DENDA:*\n`;
    msg += `• Keterlambatan: *${order.overdueDays} Hari*\n`;
    msg += `• Sisa Denda: *${formatRupiah(order.totalFine)}*\n`;
    msg += `Mohon segera mengembalikan peralatan ke toko kami agar denda tidak bertambah ya Kak. 🙏\n`;
  } else {
    msg += `\nHarap menjaga kebersihan dan kelengkapan peralatan. Jangan lupa batas akhir pengembalian pada tanggal *${order.endDate}*.\n`;
  }

  msg += `\n*Alamat Toko:* Jl. Kaliurang KM 9, Sleman, Yogyakarta\n`;
  msg += `*CS / Kasir:* 0812-3456-7890\n`;
  msg += `Terima kasih atas kepercayaannya & salam lestari! 🏔️✨`;

  return encodeURIComponent(msg);
}
