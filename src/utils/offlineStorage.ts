import { RentalOrder, GearItem, Customer, CashierShift } from '../types';
import { INITIAL_RENTAL_ORDERS, INITIAL_GEAR_INVENTORY, INITIAL_CUSTOMERS, INITIAL_SHIFT } from '../data/initialData';

const STORAGE_KEYS = {
  ORDERS: 'campgear_pos_orders',
  INVENTORY: 'campgear_pos_inventory',
  CUSTOMERS: 'campgear_pos_customers',
  SHIFT: 'campgear_pos_shift',
  PENDING_SYNC: 'campgear_pos_pending_sync',
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
    return data ? JSON.parse(data) : INITIAL_SHIFT;
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
