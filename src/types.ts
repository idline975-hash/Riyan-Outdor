export type GearCategory = 
  | 'tenda' 
  | 'carrier' 
  | 'tidur' 
  | 'masak' 
  | 'penerangan' 
  | 'aksesoris'
  | 'footwear'
  | 'camp_furniture';

export interface GearItem {
  id: string;
  code: string; // e.g. TD-01
  name: string;
  category: GearCategory;
  brand: string;
  specs: string;
  totalStock: number;
  rentedStock: number;
  maintenanceStock: number;
  pricePerDay: number;
  dailyPenaltyRate: number; // Denda keterlambatan per hari
  replacementCost: number; // Biaya ganti hilang/rusak
  condition: 'Baik' | 'Perlu Perawatan' | 'Siap Pakai';
}

export type PaymentStatus = 'LUNAS' | 'BELUM LUNAS' | 'DP';

export type PaymentMethod = 'QRIS' | 'TUNAI' | 'TRANSFER_BANK' | 'E_WALLET';

export type ItemRentalStatus = 'Belum Kembali' | 'Sebagian Kembali' | 'Sudah Kembali' | 'Booked';

export interface RentalOrderItem {
  gearId: string;
  gearCode: string;
  gearName: string;
  quantity: number;
  pricePerDay: number;
  subtotal: number;
  returned: boolean;
  returnedCondition?: 'Baik' | 'Kotor (Perlu Cuci)' | 'Rusak Ringan' | 'Rusak Parah' | 'Hilang';
  damageFee?: number;
}

export interface RentalOrder {
  id: string;
  orderNumber: string; // e.g. "9125"
  customerName: string;
  customerPhone: string;
  customerIdType: 'KTP' | 'SIM' | 'KTM' | 'PASPOR';
  customerIdNumber: string;
  guaranteeType: 'KTP Asli' | 'SIM Asli' | 'Uang Jaminan' | 'KTM Asli';
  guaranteeNote?: string;
  cashierName: string; // e.g. "zidan", "faisal"
  shiftName: string; // e.g. "Shift 1", "Shift 2"
  orderTimestamp: string; // e.g. "21/08 15:08"
  orderDateIso: string; // e.g. "2026-08-21T15:08:00"
  startDate: string; // e.g. "21/08/26"
  endDate: string; // e.g. "23/08/26"
  durationDays: number;
  items: RentalOrderItem[];
  totalRentalFee: number;
  depositAmount: number;
  paidAmount: number;
  dpAmount?: number;
  remainingAmount?: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  itemStatus: ItemRentalStatus;
  takenStatus?: 'Belum Diambil' | 'Sudah Diambil';
  takenAt?: string;
  overdueDays: number; // Keterlambatan dalam hari
  overdueFine: number; // Denda keterlambatan
  damageFine: number; // Denda kerusakan jika ada
  totalFine: number; // Sisa denda
  finePaid: boolean;
  notes?: string;
  qrisRef?: string;
  returnedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  idType: 'KTP' | 'SIM' | 'KTM';
  idNumber: string;
  address: string;
  totalRentals: number;
  status: 'Aktif' | 'Langganan' | 'Blacklist';
  lastRentalDate: string;
}

export interface CashierShift {
  cashierName: string;
  shiftName: string;
  shiftHours: string;
  openingCash: number;
  cashIn: number;
  qrisIn: number;
  transferIn: number;
  totalTransactions: number;
}

export type HikingPackageTier = 'hemat' | 'standar' | 'premium' | 'family';

export interface HikingPackageItem {
  gearCode: string;
  name: string;
  quantity: number;
  itemCategory: string;
}

export interface HikingPackage {
  id: string;
  code: string;
  name: string;
  categoryType: 'Solo / Ultralight' | 'Duo / Couple (2P)' | 'Squad / Rombongan (4P)' | 'Ekspedisi / Safety (Extreme)' | 'Family / Glamping' | 'Fast Hike / Tektok';
  tier: HikingPackageTier;
  targetPerson: string;
  description: string;
  badge: string;
  badgeColor: 'emerald' | 'blue' | 'amber' | 'rose' | 'purple' | 'cyan';
  pricePerDay: number;
  originalPricePerDay: number;
  discountPercent: number;
  recommendedFor: string;
  includedGear: HikingPackageItem[];
  highlightFeatures: string[];
}

