import { RentalOrder, GearItem, Customer, CashierShift, CashierUser } from '../types';
import { INITIAL_RENTAL_ORDERS, INITIAL_GEAR_INVENTORY, INITIAL_CUSTOMERS, INITIAL_SHIFT } from '../data/initialData';

export const DEFAULT_CASHIERS: CashierUser[] = [
  {
    id: 'cashier-admin',
    name: 'Admin Toko',
    role: 'Admin Toko',
    pin: '1234',
    avatarColor: 'amber',
    shiftDefault: 'Shift 1',
    lastLoginAt: 'Hari ini, 07:30',
  },
  {
    id: 'cashier-utama',
    name: 'Kasir Utama',
    role: 'Kasir Utama',
    pin: '1234',
    avatarColor: 'emerald',
    shiftDefault: 'Shift 1',
    lastLoginAt: 'Hari ini, 08:00',
  },
];

const STORAGE_KEYS = {
  ORDERS: 'campgear_pos_orders',
  INVENTORY: 'campgear_pos_inventory',
  CUSTOMERS: 'campgear_pos_customers',
  SHIFT: 'campgear_pos_shift',
  PENDING_SYNC: 'campgear_pos_pending_sync',
  CASHIERS: 'campgear_pos_cashiers',
  ACTIVE_CASHIER_ID: 'campgear_pos_active_cashier_id',
  IS_LOGGED_IN: 'campgear_pos_is_logged_in',
};

export interface PendingSyncItem {
  id: string;
  action: 'create_order' | 'update_order' | 'update_inventory' | 'update_shift';
  payload: any;
  timestamp: number;
}

// Read cache with fallback to initial data
export function getCachedOrders(): RentalOrder[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : INITIAL_RENTAL_ORDERS;
  } catch (err) {
    console.error('Failed to read orders from cache:', err);
    return INITIAL_RENTAL_ORDERS;
  }
}

export function saveCachedOrders(orders: RentalOrder[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (err) {
    console.error('Failed to cache orders:', err);
  }
}

export function getCachedInventory(): GearItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    return data ? JSON.parse(data) : INITIAL_GEAR_INVENTORY;
  } catch (err) {
    console.error('Failed to read inventory from cache:', err);
    return INITIAL_GEAR_INVENTORY;
  }
}

export function saveCachedInventory(inventory: GearItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  } catch (err) {
    console.error('Failed to cache inventory:', err);
  }
}

export function getCachedCustomers(): Customer[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
  } catch (err) {
    console.error('Failed to read customers from cache:', err);
    return INITIAL_CUSTOMERS;
  }
}

export function saveCachedCustomers(customers: Customer[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  } catch (err) {
    console.error('Failed to cache customers:', err);
  }
}

export function getCachedShift(): CashierShift {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SHIFT);
    if (!data) return INITIAL_SHIFT;
    const shift = JSON.parse(data) as CashierShift;
    if (shift.cashierName !== 'Admin Toko' && shift.cashierName !== 'Kasir Utama') {
      shift.cashierName = 'Kasir Utama';
      saveCachedShift(shift);
    }
    return shift;
  } catch (err) {
    console.error('Failed to read shift from cache:', err);
    return INITIAL_SHIFT;
  }
}

export function saveCachedShift(shift: CashierShift): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SHIFT, JSON.stringify(shift));
  } catch (err) {
    console.error('Failed to cache shift:', err);
  }
}

// Offline Pending Sync Queue
export function getPendingSyncQueue(): PendingSyncItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function enqueuePendingSync(action: PendingSyncItem['action'], payload: any): void {
  try {
    const queue = getPendingSyncQueue();
    const item: PendingSyncItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      payload,
      timestamp: Date.now(),
    };
    queue.push(item);
    localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to enqueue pending sync:', err);
  }
}

export function clearPendingSyncQueue(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PENDING_SYNC);
  } catch (err) {
    console.error('Failed to clear pending sync queue:', err);
  }
}

// Cashier Accounts & Session Storage (Hanya 2 Akun: Admin Toko & Kasir Utama)
export function getCachedCashiers(): CashierUser[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CASHIERS);
    if (!data) return DEFAULT_CASHIERS;
    const parsed = JSON.parse(data) as CashierUser[];

    // Cari akun Admin Toko dan Kasir Utama jika user pernah ubah PIN
    const adminAccount = parsed.find(
      (c) => c.id === 'cashier-admin' || c.name.toLowerCase().includes('admin')
    );
    const cashierAccount = parsed.find(
      (c) => c.id === 'cashier-utama' || c.name.toLowerCase().includes('kasir') || c.name === 'Faisal'
    );

    const twoAccounts: CashierUser[] = [
      {
        ...DEFAULT_CASHIERS[0],
        pin: adminAccount?.pin || '1234',
        lastLoginAt: adminAccount?.lastLoginAt || DEFAULT_CASHIERS[0].lastLoginAt,
      },
      {
        ...DEFAULT_CASHIERS[1],
        pin: cashierAccount?.pin || '1234',
        lastLoginAt: cashierAccount?.lastLoginAt || DEFAULT_CASHIERS[1].lastLoginAt,
      },
    ];

    saveCachedCashiers(twoAccounts);
    return twoAccounts;
  } catch (err) {
    console.error('Failed to read cashiers from cache:', err);
    return DEFAULT_CASHIERS;
  }
}

export function saveCachedCashiers(cashiers: CashierUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CASHIERS, JSON.stringify(cashiers));
  } catch (err) {
    console.error('Failed to cache cashiers:', err);
  }
}

export function getCachedActiveCashierId(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CASHIER_ID) || DEFAULT_CASHIERS[0].id;
  } catch {
    return DEFAULT_CASHIERS[0].id;
  }
}

export function saveCachedActiveCashierId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CASHIER_ID, id);
  } catch (err) {
    console.error('Failed to cache active cashier id:', err);
  }
}

export function getCachedLoginStatus(): boolean {
  try {
    const status = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
    return status === null ? true : status === 'true';
  } catch {
    return true;
  }
}

export function saveCachedLoginStatus(isLoggedIn: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, String(isLoggedIn));
  } catch (err) {
    console.error('Failed to cache login status:', err);
  }
}

