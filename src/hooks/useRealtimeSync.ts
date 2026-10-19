import { useEffect, useRef, useState, useCallback } from 'react';
import { RentalOrder, GearItem, CashierShift } from '../types';
import { 
  getCachedOrders, 
  saveCachedOrders, 
  getCachedInventory, 
  saveCachedInventory, 
  getCachedShift, 
  saveCachedShift,
  getPendingSyncQueue,
  enqueuePendingSync,
  clearPendingSyncQueue,
  PendingSyncItem 
} from '../utils/offlineStorage';

export interface RealtimeSyncPayload {
  type: 'order:created' | 'order:updated' | 'inventory:updated' | 'shift:updated' | 'sync:init' | 'sync:pending';
  data: any;
  senderId?: string;
}

export function useRealtimeSync(
  orders: RentalOrder[],
  setOrders: React.Dispatch<React.SetStateAction<RentalOrder[]>>,
  inventory: GearItem[],
  setInventory: React.Dispatch<React.SetStateAction<GearItem[]>>,
  currentShift: CashierShift,
  setCurrentShift: React.Dispatch<React.SetStateAction<CashierShift>>
) {
  const [isOnline, setIsOnline] = useState<boolean>(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(() => getPendingSyncQueue().length);
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const clientId = useRef<string>(`client-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`);

  // Handle incoming payload centrally
  const processPayload = useCallback(
    (payload: RealtimeSyncPayload) => {
      if (payload.senderId === clientId.current) return;

      switch (payload.type) {
        case 'sync:init':
          if (payload.data.orders) {
            setOrders(payload.data.orders);
            saveCachedOrders(payload.data.orders);
          }
          if (payload.data.inventory) {
            setInventory(payload.data.inventory);
            saveCachedInventory(payload.data.inventory);
          }
          if (payload.data.shift) {
            setCurrentShift(payload.data.shift);
            saveCachedShift(payload.data.shift);
          }
          break;

        case 'order:created': {
          const newOrder = payload.data as RentalOrder;
          setOrders((prev) => {
            if (prev.some((o) => o.id === newOrder.id)) return prev;
            const next = [newOrder, ...prev];
            saveCachedOrders(next);
            return next;
          });
          break;
        }

        case 'order:updated': {
          const updated = payload.data as RentalOrder;
          setOrders((prev) => {
            const next = prev.map((o) => (o.id === updated.id ? updated : o));
            saveCachedOrders(next);
            return next;
          });
          break;
        }

        case 'inventory:updated': {
          const updatedInv = payload.data as GearItem[];
          setInventory(updatedInv);
          saveCachedInventory(updatedInv);
          break;
        }

        case 'shift:updated': {
          const updatedShift = payload.data as CashierShift;
          setCurrentShift(updatedShift);
          saveCachedShift(updatedShift);
          break;
        }

        default:
          break;
      }
    },
    [setCurrentShift, setInventory, setOrders]
  );

  // Send action via WebSocket + BroadcastChannel or queue if offline
  const broadcastAction = useCallback(
    (action: PendingSyncItem['action'], payload: any) => {
      const message: RealtimeSyncPayload = {
        type:
          action === 'create_order'
            ? 'order:created'
            : action === 'update_order'
            ? 'order:updated'
            : action === 'update_inventory'
            ? 'inventory:updated'
            : 'shift:updated',
        data: payload,
        senderId: clientId.current,
      };

      // 1. Cross-tab instant sync via BroadcastChannel
      if (broadcastChannelRef.current) {
        try {
          broadcastChannelRef.current.postMessage(message);
        } catch {
          // ignore
        }
      }

      // 2. WebSocket sync or offline queue
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && isOnline) {
        socketRef.current.send(JSON.stringify(message));
      } else {
        // Enqueue for background sync when back online
        enqueuePendingSync(action, payload);
        setPendingCount(getPendingSyncQueue().length);
      }
    },
    [isOnline]
  );

  // Sync any pending items from offline queue
  const flushPendingQueue = useCallback(async () => {
    const queue = getPendingSyncQueue();
    if (queue.length === 0) return;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      for (const item of queue) {
        const message: RealtimeSyncPayload = {
          type:
            item.action === 'create_order'
              ? 'order:created'
              : item.action === 'update_order'
              ? 'order:updated'
              : item.action === 'update_inventory'
              ? 'inventory:updated'
              : 'shift:updated',
          data: item.payload,
          senderId: clientId.current,
        };
        socketRef.current?.send(JSON.stringify(message));

        // Also post to REST for backend storage redundancy
        try {
          if (item.action === 'create_order') {
            await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item.payload),
            }).catch(() => {});
          } else if (item.action === 'update_order') {
            await fetch(`/api/orders/${item.payload.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item.payload),
            }).catch(() => {});
          }
        } catch {
          // background sync network error caught
        }
      }

      clearPendingSyncQueue();
      setPendingCount(0);
      setSyncToastMessage(`Koneksi pulih: ${queue.length} perubahan tersimpan offline berhasil disinkronkan ke server.`);
      setTimeout(() => setSyncToastMessage(null), 4000);
    }
  }, []);

  // Initialize and maintain WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        // Flush any queued offline actions on reconnect
        flushPendingQueue();
      };

      ws.onmessage = (event) => {
        try {
          const payload: RealtimeSyncPayload = JSON.parse(event.data);
          processPayload(payload);
        } catch (err) {
          console.warn('Failed to parse incoming realtime message:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Reconnect after delay
        if (navigator.onLine) {
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
        }
      };

      ws.onerror = () => {
        setIsConnected(false);
      };
    } catch (err) {
      console.warn('WebSocket connection exception:', err);
    }
  }, [flushPendingQueue, processPayload]);

  // Handle Online / Offline network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      connectWebSocket();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsConnected(false);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };

    // Initialize cross-tab BroadcastChannel
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('campgear_pos_sync');
        broadcastChannelRef.current = bc;
        bc.onmessage = (event) => {
          try {
            processPayload(event.data);
          } catch (e) {
            console.warn('BroadcastChannel error processing payload:', e);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel not supported:', err);
      }
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    connectWebSocket();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close();
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
        broadcastChannelRef.current = null;
      }
    };
  }, [connectWebSocket]);

  // Keep local cache synced on state changes
  useEffect(() => {
    saveCachedOrders(orders);
  }, [orders]);

  useEffect(() => {
    saveCachedInventory(inventory);
  }, [inventory]);

  useEffect(() => {
    saveCachedShift(currentShift);
  }, [currentShift]);

  return {
    isOnline,
    isConnected,
    pendingCount,
    syncToastMessage,
    dismissSyncToast: () => setSyncToastMessage(null),
    broadcastAction,
  };
}
