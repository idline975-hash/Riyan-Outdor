import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Shield,
  Calendar,
  User,
  Search,
  ShoppingBag,
  Package,
  Check,
  Phone,
  Sparkles,
  Compass,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { GearItem, RentalOrder, RentalOrderItem, Customer, PaymentMethod, PaymentStatus, HikingPackage } from '../types';
import { formatRupiah } from '../utils/formatters';
import { playSound } from '../utils/sound';
import { HIKING_PACKAGES } from '../data/hikingPackages';
import { GearPickerModal } from './GearPickerModal';

interface InputNotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: GearItem[];
  customers: Customer[];
  cashierName: string;
  shiftName: string;
  initialPackage?: HikingPackage | null;
  onCreateOrder: (newOrder: RentalOrder) => void;
  onOpenQrisForOrder: (orderNumber: string, customerName: string, amount: number) => void;
}

export const InputNotaModal: React.FC<InputNotaModalProps> = ({
  isOpen,
  onClose,
  inventory,
  customers,
  cashierName,
  shiftName,
  initialPackage,
  onCreateOrder,
  onOpenQrisForOrder,
}) => {
  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [idType, setIdType] = useState<'KTP' | 'SIM' | 'KTM'>('KTP');
  const [idNumber, setIdNumber] = useState('');
  const [guaranteeType, setGuaranteeType] = useState<'KTP Asli' | 'SIM Asli' | 'Uang Jaminan' | 'KTM Asli'>('KTP Asli');
  const [notes, setNotes] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Dates
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });

  // Calculate duration
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Cart items
  const [cartItems, setCartItems] = useState<Array<{
    gear: GearItem;
    quantity: number;
  }>>([]);

  // Separate Gear Picker Modal State
  const [isGearPickerOpen, setIsGearPickerOpen] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('QRIS');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('LUNAS');
  const [customDpAmount, setCustomDpAmount] = useState<number>(0);
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [orderType, setOrderType] = useState<'BOOKING' | 'OUT'>('BOOKING');

  // Confirmation Modal & Payment Alert State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paymentWarning, setPaymentWarning] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate totals (deposit dihilangkan)
  const totalRentalFee = cartItems.reduce(
    (sum, item) => sum + item.gear.pricePerDay * durationDays * item.quantity,
    0
  );
  const totalItemCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const grandTotal = totalRentalFee;

  // Effective DP amount typed by user or defaulted
  const effectiveDp = paymentStatus === 'DP'
    ? (customDpAmount > 0 ? customDpAmount : Math.round(grandTotal * 0.5))
    : 0;
  
  // Paid amount initially
  const paidAmount = paymentStatus === 'LUNAS'
    ? grandTotal
    : paymentStatus === 'DP'
    ? effectiveDp
    : 0;

  const remainingPayment = Math.max(0, grandTotal - paidAmount);

  // Cash change & warning logic: against grandTotal if LUNAS, against effectiveDp if DP
  const paymentDueNow = paymentStatus === 'LUNAS' ? grandTotal : paymentStatus === 'DP' ? effectiveDp : 0;
  const isCashInsufficient = paymentMethod === 'TUNAI' && paymentStatus !== 'BELUM LUNAS' && cashGiven < paymentDueNow;
  const cashShortfall = Math.max(0, paymentDueNow - cashGiven);
  const changeCash = Math.max(0, cashGiven - paymentDueNow);

  // DP warning logic
  const isDpExceeded = paymentStatus === 'DP' && customDpAmount > grandTotal;

  const handleAddToCart = (gear: GearItem) => {
    const available = gear.totalStock - gear.rentedStock - gear.maintenanceStock;
    if (available <= 0) return;

    setCartItems((prev) => {
      const existing = prev.find((i) => i.gear.id === gear.id);
      if (existing) {
        if (existing.quantity >= available) return prev;
        return prev.map((i) =>
          i.gear.id === gear.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { gear, quantity: 1 }];
    });
    playSound('beep');
  };

  const handleAddPackageToCart = (pkg: HikingPackage) => {
    const packageAsGear: GearItem = {
      id: `pkg-${pkg.code}`,
      code: pkg.code,
      name: `[PAKET] ${pkg.name}`,
      category: 'tenda',
      brand: `${pkg.targetPerson} • Hemat ${pkg.discountPercent}%`,
      specs: `${pkg.includedGear.reduce((a, b) => a + b.quantity, 0)} item termasuk: ${pkg.includedGear.map((g) => `${g.quantity}x ${g.name}`).join(', ')}`,
      totalStock: 50,
      rentedStock: 0,
      maintenanceStock: 0,
      pricePerDay: pkg.pricePerDay,
      dailyPenaltyRate: Math.round(pkg.pricePerDay * 0.5),
      replacementCost: pkg.originalPricePerDay * 12,
      condition: 'Siap Pakai',
    };
    handleAddToCart(packageAsGear);
  };

  // If opened with initial package
  useEffect(() => {
    if (isOpen && initialPackage) {
      handleAddPackageToCart(initialPackage);
    }
  }, [isOpen, initialPackage]);

  const handleUpdateQty = (gearId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.gear.id === gearId) {
            const available = item.gear.totalStock - item.gear.rentedStock - item.gear.maintenanceStock;
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > available) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as Array<{ gear: GearItem; quantity: number }>
    );
  };

  const handleRemoveFromCart = (gearId: string) => {
    setCartItems((prev) => prev.filter((i) => i.gear.id !== gearId));
  };

  const handleSelectCustomer = (c: Customer) => {
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    setIdType(c.idType);
    setIdNumber(c.idNumber);
    setGuaranteeType(c.idType === 'SIM' ? 'SIM Asli' : c.idType === 'KTM' ? 'KTM Asli' : 'KTP Asli');
    setShowCustomerDropdown(false);
    setCustomerSearchQuery('');
    playSound('beep');
  };

  // 1. Validasi pembayaran & tampilkan dialog konfirmasi (Ya / Batal)
  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      setPaymentWarning('Mohon lengkapi nama penyewa terlebih dahulu.');
      playSound('beep');
      return;
    }

    if (cartItems.length === 0) {
      setPaymentWarning('Keranjang sewa masih kosong. Silakan pilih peralatan gunung terlebih dahulu.');
      playSound('beep');
      return;
    }

    // Validasi pembayaran TUNAI: uang harus cukup
    if (paymentMethod === 'TUNAI' && paymentStatus !== 'BELUM LUNAS') {
      if (cashGiven < paymentDueNow) {
        setPaymentWarning(
          `Nominal uang tunai diterima (${formatRupiah(cashGiven)}) kurang dari tagihan (${formatRupiah(paymentDueNow)}). Kurang ${formatRupiah(paymentDueNow - cashGiven)}. Harap bayar uang pas atau lebih.`
        );
        playSound('beep');
        return;
      }
    }

    // Validasi nominal DP
    if (paymentStatus === 'DP') {
      if (effectiveDp <= 0) {
        setPaymentWarning('Nominal uang muka (DP) harus lebih dari Rp 0.');
        playSound('beep');
        return;
      }
      if (customDpAmount > grandTotal) {
        setPaymentWarning(`Nominal DP (${formatRupiah(customDpAmount)}) tidak boleh melebihi total sewa (${formatRupiah(grandTotal)}).`);
        playSound('beep');
        return;
      }
    }

    // Lolos validasi -> Buka modal konfirmasi Ya / Batal
    setPaymentWarning(null);
    setShowConfirmModal(true);
    playSound('beep');
  };

  // 2. Eksekusi final simpan dan cetak nota setelah user klik 'Ya'
  const handleFinalSubmit = () => {
    setShowConfirmModal(false);

    const orderNum = Math.floor(9135 + Math.random() * 800).toString();
    const now = new Date();
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const orderTimestamp = `${dateFormatted} ${timeFormatted}`;

    const startSplit = startDate.split('-');
    const endSplit = endDate.split('-');
    const startStr = `${startSplit[2]}/${startSplit[1]}/${startSplit[0].slice(2)}`;
    const endStr = `${endSplit[2]}/${endSplit[1]}/${endSplit[0].slice(2)}`;

    const items: RentalOrderItem[] = cartItems.map((c) => ({
      gearId: c.gear.id,
      gearCode: c.gear.code,
      gearName: c.gear.name,
      quantity: c.quantity,
      pricePerDay: c.gear.pricePerDay,
      subtotal: c.gear.pricePerDay * durationDays * c.quantity,
      returned: false,
    }));

    const isBooking = orderType === 'BOOKING';
    const effectivePaid =
      paymentStatus === 'LUNAS'
        ? grandTotal
        : paymentStatus === 'DP'
        ? (customDpAmount > 0 ? customDpAmount : Math.round(grandTotal * 0.5))
        : 0;

    const remainingToPay = Math.max(0, grandTotal - effectivePaid);

    const newOrder: RentalOrder = {
      id: `ord-${orderNum}`,
      orderNumber: orderNum,
      customerName,
      customerPhone,
      customerIdType: idType,
      customerIdNumber: idNumber || `${idType}-${Date.now().toString().slice(-6)}`,
      guaranteeType,
      guaranteeNote: `${guaranteeType} an ${customerName}`,
      cashierName: cashierName.toLowerCase(),
      shiftName,
      orderTimestamp,
      orderDateIso: now.toISOString(),
      startDate: startStr,
      endDate: endStr,
      durationDays,
      items,
      totalRentalFee,
      depositAmount: 0,
      paidAmount: effectivePaid,
      dpAmount: paymentStatus === 'DP' ? effectivePaid : undefined,
      remainingAmount: remainingToPay,
      paymentStatus,
      paymentMethod,
      itemStatus: isBooking ? 'Booked' : 'Belum Kembali',
      takenStatus: isBooking ? 'Belum Diambil' : 'Sudah Diambil',
      takenAt: isBooking ? undefined : now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      overdueDays: 0,
      overdueFine: 0,
      damageFine: 0,
      totalFine: 0,
      finePaid: false,
      notes: notes ? `${notes} ${isBooking ? '[Status: Booking Belum Diambil]' : '[Status: Barang Out Langsung]'}` : (isBooking ? 'Booking - Barang Belum Diambil' : undefined),
    };

    onCreateOrder(newOrder);
    playSound('success');

    if (paymentMethod === 'QRIS' && paymentStatus !== 'BELUM LUNAS') {
      onOpenQrisForOrder(orderNum, customerName, paidAmount);
    }

    onClose();
  };

  const matchingCustomers = customers.filter(
    (c) =>
      customerSearchQuery &&
      (c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
        c.phone.includes(customerSearchQuery) ||
        c.idNumber.toLowerCase().includes(customerSearchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-3 md:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-none sm:rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl border-0 sm:border border-slate-200 flex flex-col h-full sm:h-auto max-h-screen sm:max-h-[94vh]">
        {/* Main Header */}
        <div className="px-3.5 py-2.5 sm:px-6 sm:py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5 truncate">
                <span>Kasir Transaksi Sewa</span>
                <span className="hidden sm:inline w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span className="hidden sm:inline text-slate-400 font-normal">Shift: {shiftName}</span>
              </div>
              <div className="text-xs sm:text-base font-extrabold text-white truncate">
                Input Nota Sewa Alat Gunung
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsGearPickerOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all whitespace-nowrap"
              title="Buka Pilihan Alat Gunung di Jendela Terpisah"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Alat ({totalItemCount})</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Tutup Nota"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Body: Direct Inline 2-Column POS Layout */}
        <form onSubmit={handlePromptSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden text-xs bg-slate-50/60">
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* LEFT COLUMN: Customer Info, Duration & Payment (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Card 1: Data Penyewa */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wide block">
                        Data Penyewa
                      </span>
                      <span className="text-[10px] text-slate-400">Identitas & Jaminan Resmi</span>
                    </div>
                  </div>

                  {customers.length > 0 && (
                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                      {customers.length} DB Pelanggan
                    </span>
                  )}
                </div>

                {/* Quick Customer Search / Autocomplete */}
                <div className="relative">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Cari pelanggan tersimpan (nama / no WA)..."
                      value={customerSearchQuery}
                      onChange={(e) => {
                        setCustomerSearchQuery(e.target.value);
                        setShowCustomerDropdown(true);
                      }}
                      onFocus={() => setShowCustomerDropdown(true)}
                      className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Autocomplete Dropdown */}
                  {showCustomerDropdown && matchingCustomers.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto divide-y divide-slate-100">
                      {matchingCustomers.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectCustomer(c)}
                          className="w-full text-left px-3 py-2 hover:bg-blue-50/70 transition-colors flex items-center justify-between group"
                        >
                          <div>
                            <div className="font-bold text-slate-800 text-xs group-hover:text-blue-600">
                              {c.name}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                              <span>{c.phone}</span>
                              <span>•</span>
                              <span>{c.idType}: {c.idNumber}</span>
                            </div>
                          </div>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                            Pilih
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Customer Input Fields */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama penyewa"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      No. WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="08123456789"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Jaminan Fisik *
                    </label>
                    <select
                      value={guaranteeType}
                      onChange={(e) => setGuaranteeType(e.target.value as 'KTP Asli' | 'SIM Asli' | 'Uang Jaminan' | 'KTM Asli')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-semibold"
                    >
                      <option value="KTP Asli">KTP Asli (Ditahan)</option>
                      <option value="SIM Asli">SIM Asli (Ditahan)</option>
                      <option value="KTM Asli">KTM Asli (Mahasiswa)</option>
                      <option value="Kartu Identitas Lainnya">Identitas Lain (Paspor / SIM / KTM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Nomor Identitas
                    </label>
                    <input
                      type="text"
                      placeholder="No KTP / SIM / KTM"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Periode Sewa & Catatan */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wide block">
                        Periode Sewa
                      </span>
                      <span className="text-[10px] text-slate-400">Jadwal Sewa & Durasi</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-black text-[11px]">
                    Durasi: {durationDays} Hari
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Tgl Ambil (Mulai)
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Tgl Kembali (Selesai)
                    </label>
                    <input
                      type="date"
                      required
                      min={startDate}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Catatan Tujuan / Pendakian (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Gunung Merbabu via Selo"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Dedicated Peralatan Gunung & Keranjang (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-3 flex flex-col">
              
              {/* Card: Peralatan Gunung Disewa */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wide block">
                          Peralatan Gunung Disewa
                        </span>
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.2 rounded-full">
                          Katalog Terpisah
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Pilihan alat dibuka terpisah agar leluasa mencari &amp; memilih
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-slate-900 text-xs sm:text-sm text-blue-700 block">
                      {formatRupiah(totalRentalFee)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {totalItemCount} unit ({cartItems.length} jenis)
                    </span>
                  </div>
                </div>

                {/* Prominent Action Banner to Open Separate Gear Picker */}
                <div className="p-3 bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-blue-50/90 border border-blue-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                        <span>Pilihan Peralatan Gunung (Katalog Terpisah)</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Layar pencarian luas dengan filter kategori (Tenda, Carrier, Masak, SB, dll), cek stok instan &amp; paket hemat.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsGearPickerOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{cartItems.length === 0 ? 'Buka & Pilih Alat Gunung' : '+ Tambah / Cari Alat Lagi'}</span>
                  </button>
                </div>

                {/* Cart Items List or Empty State */}
                <div className="flex-1 flex flex-col min-h-0">
                  {cartItems.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                        <Package className="w-6 h-6" />
                      </div>
                      <div className="font-extrabold text-slate-800 text-xs sm:text-sm">
                        Belum Ada Alat Gunung yang Dipilih
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                        Bagian pilihan alat gunung telah dipisahkan agar pencarian lebih leluasa. Klik tombol di bawah untuk membuka katalog dan memilih alat gunung atau paket pendakian.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsGearPickerOpen(true)}
                        className="mt-3.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs inline-flex items-center gap-2 shadow-md cursor-pointer active:scale-95 transition-all"
                      >
                        <Compass className="w-4 h-4" />
                        <span>Buka Pilihan Alat Gunung Sekarang</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 overflow-y-auto max-h-[340px] pr-1">
                      {cartItems.map((item) => (
                        <div
                          key={item.gear.id}
                          className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-blue-50/30 rounded-xl border border-slate-200 transition-all"
                        >
                          <div className="flex-1 mr-3 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.2 rounded uppercase">
                                #{item.gear.code}
                              </span>
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded capitalize">
                                {item.gear.category}
                              </span>
                              {item.gear.brand && (
                                <span className="text-[10px] text-slate-400 truncate">
                                  {item.gear.brand}
                                </span>
                              )}
                            </div>
                            <div className="font-extrabold text-slate-900 text-xs truncate">
                              {item.gear.name}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {formatRupiah(item.gear.pricePerDay)} × {durationDays} hari × {item.quantity} ={' '}
                              <span className="font-black text-blue-700 text-xs">
                                {formatRupiah(item.gear.pricePerDay * durationDays * item.quantity)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.gear.id, -1)}
                              className="w-6 h-6 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold cursor-pointer transition-colors"
                              title="Kurangi 1"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-black text-slate-900 text-xs">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.gear.id, 1)}
                              className="w-6 h-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center font-bold cursor-pointer transition-colors shadow-2xs"
                              title="Tambah 1"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(item.gear.id)}
                              className="w-6 h-6 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center ml-1 cursor-pointer transition-colors"
                              title="Hapus dari nota"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Bottom Cart Action strip */}
                      <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-[11px]">
                        <span className="text-slate-500 font-medium">
                          Total Sewa Alat ({totalItemCount} unit · {durationDays} hari): <strong className="text-blue-700">{formatRupiah(totalRentalFee)}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsGearPickerOpen(true)}
                          className="text-blue-600 hover:text-blue-700 font-extrabold flex items-center gap-1 cursor-pointer hover:underline"
                        >
                          <Search className="w-3 h-3" />
                          <span>+ Tambah / Cari Alat Lain</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BOTTOM SECTION: Card Pembayaran & Status Pengambilan (Deposit Ditiadakan) */}
            <div className="col-span-full">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
                {/* Header Card Pembayaran */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm tracking-tight">
                          Pembayaran &amp; Status Pengambilan
                        </span>
                        <span className="text-[10px] font-extrabold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                          Kasir: {cashierName} ({shiftName})
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Atur metode bayar, pelunasan/DP, dan status serah terima barang di toko.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl">
                      Transaksi Kasir Langsung
                    </span>
                  </div>
                </div>

                {/* 3-Column Responsive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Kolom 1: Metode & Status Bayar */}
                  <div className="space-y-3 p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1.5 uppercase tracking-wide">
                        1. Metode Pembayaran:
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('QRIS')}
                          className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                            paymentMethod === 'QRIS'
                              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5 mb-0.5" />
                          <span>QRIS</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('TUNAI')}
                          className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                            paymentMethod === 'TUNAI'
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <Banknote className="w-3.5 h-3.5 mb-0.5" />
                          <span>Tunai</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('TRANSFER_BANK')}
                          className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                            paymentMethod === 'TRANSFER_BANK'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <Shield className="w-3.5 h-3.5 mb-0.5" />
                          <span>Transfer</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1.5 uppercase tracking-wide">
                        2. Status Bayar:
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 text-xs">
                        {(['LUNAS', 'DP', 'BELUM LUNAS'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              setPaymentStatus(st);
                              if (st === 'DP') {
                                setOrderType('BOOKING');
                                if (customDpAmount === 0) {
                                  setCustomDpAmount(Math.round(grandTotal * 0.5));
                                }
                              }
                            }}
                            className={`py-1.5 rounded-xl border font-black uppercase transition-all cursor-pointer ${
                              paymentStatus === st
                                ? st === 'LUNAS'
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                  : st === 'DP'
                                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                  : 'bg-rose-500 text-white border-rose-500 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Kolom 2: Status Pengambilan & Input DP */}
                  <div className="space-y-3 p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1.5 uppercase tracking-wide">
                        3. Status Pengambilan Barang:
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setOrderType('BOOKING')}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-center font-bold transition-all cursor-pointer ${
                            orderType === 'BOOKING'
                              ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span className="font-black text-xs">📅 BOOKING</span>
                          <span className="text-[10px] opacity-90 font-medium">Belum Diambil</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setOrderType('OUT')}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-center font-bold transition-all cursor-pointer ${
                            orderType === 'OUT'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span className="font-black text-xs">🚀 AMBIL SEKARANG</span>
                          <span className="text-[10px] opacity-90 font-medium">Barang Out / Disewa</span>
                        </button>
                      </div>
                    </div>

                    {/* Jika Status DP: Kolom Ketik Jumlah DP */}
                    {paymentStatus === 'DP' ? (
                      <div className="p-2.5 bg-amber-50/90 rounded-xl border border-amber-200 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-900">
                          <span>Ketik Jumlah Uang Muka (DP):</span>
                          <span className="text-[9px] bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                            Bebas Ketik
                          </span>
                        </div>

                        <div className="relative">
                          <span className="absolute left-2.5 top-1.5 text-xs font-black text-amber-700">Rp</span>
                          <input
                            type="number"
                            step={5000}
                            min={0}
                            max={grandTotal}
                            value={customDpAmount || ''}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setCustomDpAmount(val >= 0 ? val : 0);
                              if (paymentWarning) setPaymentWarning(null);
                            }}
                            placeholder={`Nominal DP (contoh: ${formatRupiah(Math.round(grandTotal * 0.5))})`}
                            className={`w-full bg-white border rounded-lg pl-8 pr-2.5 py-1 text-right font-black text-xs focus:outline-none transition-all shadow-2xs ${
                              customDpAmount > grandTotal
                                ? 'border-rose-400 bg-rose-50 text-rose-900 ring-2 ring-rose-200'
                                : 'border-amber-300 text-amber-950 focus:ring-2 focus:ring-amber-500'
                            }`}
                          />
                        </div>

                        {/* Peringatan jika DP melebihi total sewa */}
                        {customDpAmount > grandTotal && (
                          <div className="flex items-center gap-1.5 text-[10px] text-rose-700 font-extrabold bg-rose-50 border border-rose-200 p-1.5 rounded-lg animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                            <span>Peringatan: DP melebihi total sewa ({formatRupiah(grandTotal)})!</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 overflow-x-auto text-[9px] font-bold no-scrollbar">
                          <button
                            type="button"
                            onClick={() => {
                              setCustomDpAmount(Math.round(grandTotal * 0.25));
                              if (paymentWarning) setPaymentWarning(null);
                            }}
                            className="px-1.5 py-0.5 bg-white border border-amber-300 text-amber-900 rounded hover:bg-amber-100 shrink-0 cursor-pointer"
                          >
                            25% ({formatRupiah(Math.round(grandTotal * 0.25))})
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCustomDpAmount(Math.round(grandTotal * 0.5));
                              if (paymentWarning) setPaymentWarning(null);
                            }}
                            className="px-1.5 py-0.5 bg-white border border-amber-300 text-amber-900 rounded hover:bg-amber-100 shrink-0 cursor-pointer"
                          >
                            50% ({formatRupiah(Math.round(grandTotal * 0.5))})
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCustomDpAmount(50000);
                              if (paymentWarning) setPaymentWarning(null);
                            }}
                            className="px-1.5 py-0.5 bg-white border border-amber-300 text-amber-900 rounded hover:bg-amber-100 shrink-0 cursor-pointer"
                          >
                            50rb
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCustomDpAmount(100000);
                              if (paymentWarning) setPaymentWarning(null);
                            }}
                            className="px-1.5 py-0.5 bg-white border border-amber-300 text-amber-900 rounded hover:bg-amber-100 shrink-0 cursor-pointer"
                          >
                            100rb
                          </button>
                        </div>

                        <div className="pt-1 border-t border-amber-200/80 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-amber-900">Sisa Pelunasan:</span>
                          <span className="font-black text-rose-600">
                            {formatRupiah(remainingPayment)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-500">
                        {paymentStatus === 'LUNAS' ? (
                          <span className="text-emerald-700 font-bold">
                            ✓ Pembayaran LUNAS 100%. Pelanggan tidak memiliki sisa tagihan.
                          </span>
                        ) : (
                          <span className="text-rose-600 font-bold">
                            ⚠️ Status BELUM LUNAS. Tagihan dibayar penuh saat serah terima barang.
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Kolom 3: Tunai Calculator & Ringkasan Total Sewa (Deposit Dihilangkan) */}
                  <div className="space-y-3 p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                    {/* Kalkulator Tunai */}
                    {paymentMethod === 'TUNAI' && paymentStatus !== 'BELUM LUNAS' ? (
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-700">
                            {paymentStatus === 'DP' ? 'Uang Tunai (DP):' : 'Uang Tunai Diterima:'}
                          </span>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1 text-[11px] font-bold text-slate-400">Rp</span>
                            <input
                              type="number"
                              step={5000}
                              value={cashGiven || ''}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setCashGiven(val >= 0 ? val : 0);
                                if (paymentWarning) setPaymentWarning(null);
                              }}
                              placeholder={paymentDueNow.toString()}
                              className={`w-32 bg-slate-50 border rounded-lg pl-7 pr-2 py-1 text-right font-black text-xs focus:outline-none transition-all ${
                                isCashInsufficient
                                  ? 'border-rose-400 bg-rose-50/50 text-rose-900 ring-2 ring-rose-200 focus:ring-rose-400'
                                  : 'border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Quick Cash Buttons */}
                        <div className="flex items-center gap-1 overflow-x-auto text-[9px] font-bold no-scrollbar">
                          <button
                            type="button"
                            onClick={() => {
                              setCashGiven(paymentDueNow);
                              if (paymentWarning) setPaymentWarning(null);
                            }}
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 shrink-0 cursor-pointer"
                          >
                            Uang Pas ({formatRupiah(paymentDueNow)})
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const rounded = paymentDueNow > 0 ? Math.ceil(paymentDueNow / 50000) * 50000 : 50000;
                              setCashGiven(rounded);
                              if (paymentWarning) setPaymentWarning(null);
                            }}
                            className="px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-200 shrink-0 cursor-pointer"
                          >
                            Bulat 50rb
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const rounded = paymentDueNow > 0 ? Math.ceil(paymentDueNow / 100000) * 100000 : 100000;
                              setCashGiven(rounded);
                              if (paymentWarning) setPaymentWarning(null);
                            }}
                            className="px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-200 shrink-0 cursor-pointer"
                          >
                            Bulat 100rb
                          </button>
                        </div>

                        {/* Peringatan Uang Kurang vs Uang Pas/Kembalian */}
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
                            <div className="text-[10px] text-rose-600 font-medium">
                              Wajib bayar minimal {formatRupiah(paymentDueNow)}. Harap terima uang pas atau lebih.
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 pt-1 border-t border-slate-100">
                            <span className="flex items-center gap-1 text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Kembalian:</span>
                            </span>
                            <span className="text-emerald-700 font-black text-xs">{formatRupiah(changeCash)}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-2 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-500">
                        Metode: <strong className="text-slate-800">{paymentMethod}</strong> (Non-tunai / QRIS / Transfer)
                      </div>
                    )}

                    {/* Ringkasan Finansial Tanpa Deposit */}
                    <div className="pt-2 border-t border-slate-200 space-y-1 text-[11px]">
                      <div className="flex justify-between text-slate-500">
                        <span>Biaya Sewa ({durationDays} hari):</span>
                        <span className="font-bold text-slate-800">{formatRupiah(totalRentalFee)}</span>
                      </div>

                      <div className="flex justify-between font-black text-xs text-slate-900 pt-1 border-t border-slate-200">
                        <span>TOTAL HARGA SEWA:</span>
                        <span className="text-blue-700 text-sm font-black">{formatRupiah(grandTotal)}</span>
                      </div>

                      {paymentStatus === 'DP' && (
                        <>
                          <div className="flex justify-between text-amber-700 font-extrabold text-[11px]">
                            <span>DP DIBAYAR SEKARANG:</span>
                            <span>{formatRupiah(effectiveDp)}</span>
                          </div>
                          <div className="flex justify-between text-rose-600 font-black text-[11px]">
                            <span>SISA DILUNASI SAAT AMBIL:</span>
                            <span>{formatRupiah(remainingPayment)}</span>
                          </div>
                        </>
                      )}

                      {paymentStatus === 'LUNAS' && (
                        <div className="flex justify-between text-emerald-700 font-extrabold text-[11px]">
                          <span>STATUS:</span>
                          <span>LUNAS 100% (Tanpa Sisa)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Banner Peringatan jika Uang Kurang atau Data Belum Lengkap */}
          {paymentWarning && (
            <div className="mx-3.5 sm:mx-5 mb-2.5 p-3 bg-rose-50 border border-rose-300 rounded-2xl flex items-center justify-between gap-2 shadow-xs text-xs text-rose-800 animate-in fade-in shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-bold truncate">{paymentWarning}</span>
              </div>
              <button
                type="button"
                onClick={() => setPaymentWarning(null)}
                className="text-rose-400 hover:text-rose-700 p-1 cursor-pointer shrink-0"
                title="Tutup Peringatan"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Sticky Form Action Footer */}
          <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 gap-3">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Total Nota ({totalItemCount} item · {durationDays} hari)
              </div>
              <div className="text-sm sm:text-base font-black text-blue-700">
                {formatRupiah(grandTotal)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={cartItems.length === 0 || !customerName}
                className="px-4 sm:px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Cetak Nota & Selesai</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Jendela Katalog Pemilihan Alat Gunung Terpisah */}
      {isGearPickerOpen && (
        <GearPickerModal
          isOpen={isGearPickerOpen}
          onClose={() => setIsGearPickerOpen(false)}
          inventory={inventory}
          cartItems={cartItems}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onAddPackage={handleAddPackageToCart}
        />
      )}

      {/* Modal Dialog Konfirmasi Simpan & Cetak Nota (Ya / Batal) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col max-h-[94vh]">
            {/* Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    Konfirmasi Cetak Nota Transaksi
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Periksa kembali ringkasan transaksi sebelum disimpan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Tutup & Batal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body Ringkasan */}
            <div className="p-4 sm:p-5 space-y-3.5 text-xs bg-slate-50/50 overflow-y-auto flex-1">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Penyewa:</span>
                  <span className="font-black text-slate-900 text-right">
                    {customerName} <span className="text-slate-400 font-normal">({customerPhone})</span>
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Jaminan Fisik:</span>
                  <span className="font-bold text-slate-800 text-right">
                    {guaranteeType} {idNumber ? `(${idNumber})` : ''}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Durasi Sewa:</span>
                  <span className="font-bold text-blue-700 text-right">
                    {durationDays} Hari ({startDate} s/d {endDate})
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Jumlah Alat:</span>
                  <span className="font-bold text-slate-800 text-right">
                    {totalItemCount} unit ({cartItems.length} jenis alat)
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Status Barang:</span>
                  <span className={`font-black px-2 py-0.5 rounded-lg text-[10px] ${
                    orderType === 'OUT' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {orderType === 'OUT' ? '🚀 AMBIL SEKARANG (OUT)' : '📅 BOOKING (Belum Diambil)'}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                  <span className="text-slate-700 font-extrabold text-xs">Total Biaya Sewa:</span>
                  <span className="font-black text-base text-blue-700">
                    {formatRupiah(grandTotal)}
                  </span>
                </div>

                {/* Status Bayar Detail */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Metode &amp; Status:</span>
                    <span className="font-bold text-slate-800 uppercase">
                      {paymentMethod} • {paymentStatus}
                    </span>
                  </div>

                  {paymentMethod === 'TUNAI' && paymentStatus !== 'BELUM LUNAS' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Uang Diterima:</span>
                        <span className="font-bold text-slate-800">{formatRupiah(cashGiven)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-extrabold">
                        <span>Kembalian Tunai:</span>
                        <span>{formatRupiah(changeCash)}</span>
                      </div>
                    </>
                  )}

                  {paymentStatus === 'DP' && (
                    <>
                      <div className="flex justify-between text-amber-700 font-bold">
                        <span>DP Dibayar Sekarang:</span>
                        <span>{formatRupiah(effectiveDp)}</span>
                      </div>
                      <div className="flex justify-between text-rose-600 font-bold">
                        <span>Sisa Pelunasan:</span>
                        <span>{formatRupiah(remainingPayment)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Confirmation Prompt */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-amber-900 text-xs">
                  <div className="font-bold">Apakah Anda yakin data transaksi ini sudah benar?</div>
                  <div className="text-[11px] text-amber-800 mt-0.5">
                    Pilih &quot;Ya&quot; untuk mencetak nota dan memperbarui status sewa alat.
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Perintah: Ya / Batal */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-extrabold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Ya, Cetak Nota &amp; Selesai</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
