import React, { useState } from 'react';
import { 
  RentalOrder, 
  GearItem, 
  Customer, 
  CashierShift 
} from './types';
import { 
  INITIAL_GEAR_INVENTORY, 
  INITIAL_RENTAL_ORDERS, 
  INITIAL_CUSTOMERS, 
  INITIAL_SHIFT 
} from './data/initialData';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { RentalList } from './components/RentalList';
import { InputNotaModal } from './components/InputNotaModal';
import { ReturnModal } from './components/ReturnModal';
import { QRISModal } from './components/QRISModal';
import { ThermalReceiptModal } from './components/ThermalReceiptModal';
import { InventoryView } from './components/InventoryView';
import { CustomerView } from './components/CustomerView';
import { ReportView } from './components/ReportView';
import { ShiftModal } from './components/ShiftModal';
import { PackagesView } from './components/PackagesView';
import { BookedView } from './components/BookedView';
import { OutView } from './components/OutView';
import { TakeItemModal } from './components/TakeItemModal';
import { PWAUpdateToast } from './components/PWAUpdateToast';
import { UiScaleOption } from './components/ScaleSelector';
import { HikingPackage } from './types';
import { 
  getCachedOrders, 
  getCachedInventory, 
  getCachedCustomers, 
  getCachedShift 
} from './utils/offlineStorage';
import { useRealtimeSync } from './hooks/useRealtimeSync';

export default function App() {
  // Primary datasets initialized with cached storage for offline resilience
  const [orders, setOrders] = useState<RentalOrder[]>(() => getCachedOrders());
  const [inventory, setInventory] = useState<GearItem[]>(() => getCachedInventory());
  const [customers, setCustomers] = useState<Customer[]>(() => getCachedCustomers());
  const [currentShift, setCurrentShift] = useState<CashierShift>(() => getCachedShift());

  // Two-way Realtime & Offline Background Sync Hook
  const {
    isOnline,
    isConnected,
    pendingCount,
    syncToastMessage,
    dismissSyncToast,
    broadcastAction,
  } = useRealtimeSync(
    orders,
    setOrders,
    inventory,
    setInventory,
    currentShift,
    setCurrentShift
  );

  // Navigation & Drawer
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<'home' | 'input-nota' | 'booked' | 'out' | 'report' | 'inventory' | 'customer' | 'packages'>('home');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unreturned' | 'fine' | 'completed' | 'booked'>('all');

  // Presentation View Mode: 'auto' (automatic responsive across HP, Tablet, PC) vs 'phone-sim' (simulated phone frame on desktop)
  const [viewMode, setViewMode] = useState<'auto' | 'phone-sim'>('auto');

  // Compact UI Scale (Default 88% - Compact)
  const [uiScale, setUiScale] = useState<UiScaleOption>(() => {
    return (localStorage.getItem('campgear_pos_scale') as UiScaleOption) || '88';
  });

  const handleSetUiScale = (scale: UiScaleOption) => {
    setUiScale(scale);
    try {
      localStorage.setItem('campgear_pos_scale', scale);
    } catch {
      // ignore
    }
  };

  // Modals
  const [isInputNotaOpen, setIsInputNotaOpen] = useState(false);
  const [selectedPackageForOrder, setSelectedPackageForOrder] = useState<HikingPackage | null>(null);
  const [printReceiptState, setPrintReceiptState] = useState<{
    order: RentalOrder;
    type: 'initial' | 'take' | 'return';
  } | null>(null);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<RentalOrder | null>(null);
  const [selectedOrderForTake, setSelectedOrderForTake] = useState<RentalOrder | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  // Digital Payment (QRIS) Modal State
  const [qrisState, setQrisState] = useState<{
    isOpen: boolean;
    orderNumber: string;
    customerName: string;
    amount: number;
    paymentType: 'sewa' | 'denda' | 'pelunasan';
  }>({
    isOpen: false,
    orderNumber: '',
    customerName: '',
    amount: 0,
    paymentType: 'sewa',
  });

  // Dynamic counts for badges:
  // Booked = Belum Diambil / Reservasi
  const bookedCount = orders.filter(
    (o) => o.takenStatus === 'Belum Diambil' || (o.itemStatus === 'Booked' && o.takenStatus !== 'Sudah Diambil')
  ).length;

  // Out = Barang Sudah Diambil dan Belum Dikembalikan
  const outCount = orders.filter(
    (o) => o.takenStatus === 'Sudah Diambil' && o.itemStatus !== 'Sudah Kembali'
  ).length;

  // Handlers
  const handleOpenQris = (order: RentalOrder) => {
    const unPaidRental = Math.max(0, order.totalRentalFee - order.paidAmount);
    const amount = order.totalFine > 0 ? order.totalFine + unPaidRental : unPaidRental || order.totalRentalFee;

    setQrisState({
      isOpen: true,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      amount,
      paymentType: order.totalFine > 0 ? 'denda' : 'sewa',
    });
  };

  const handleQrisPaymentSuccess = (refNumber: string) => {
    let updatedOrderObj: RentalOrder | null = null;
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.orderNumber === qrisState.orderNumber) {
          const updated: RentalOrder = {
            ...ord,
            paymentStatus: 'LUNAS',
            paidAmount: ord.totalRentalFee,
            totalFine: 0,
            finePaid: true,
            qrisRef: refNumber,
          };
          updatedOrderObj = updated;
          return updated;
        }
        return ord;
      })
    );

    if (updatedOrderObj) {
      broadcastAction('update_order', updatedOrderObj);
    }

    // Update shift digital intake
    setCurrentShift((prev) => {
      const nextShift = {
        ...prev,
        qrisIn: prev.qrisIn + qrisState.amount,
        totalTransactions: prev.totalTransactions + 1,
      };
      broadcastAction('update_shift', nextShift);
      return nextShift;
    });
  };

  const handleCreateOrder = (newOrder: RentalOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    broadcastAction('create_order', newOrder);

    // Auto-save or update customer database
    setCustomers((prev) => {
      const exists = prev.find(
        (c) =>
          c.name.toLowerCase() === newOrder.customerName.toLowerCase() ||
          c.phone === newOrder.customerPhone
      );
      if (exists) {
        return prev.map((c) =>
          c.id === exists.id
            ? { ...c, totalRentals: c.totalRentals + 1, lastRentalDate: newOrder.startDate }
            : c
        );
      }
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        name: newOrder.customerName,
        phone: newOrder.customerPhone,
        idType: newOrder.customerIdType as 'KTP' | 'SIM' | 'KTM',
        idNumber: newOrder.customerIdNumber,
        address: 'Yogyakarta',
        totalRentals: 1,
        status: 'Aktif',
        lastRentalDate: newOrder.startDate,
      };
      return [newCust, ...prev];
    });

    // Update inventory rented stock
    setInventory((prev) => {
      const next = prev.map((g) => {
        const orderItem = newOrder.items.find((i) => i.gearId === g.id);
        if (orderItem) {
          return {
            ...g,
            rentedStock: g.rentedStock + orderItem.quantity,
          };
        }
        return g;
      });
      broadcastAction('update_inventory', next);
      return next;
    });

    // Update shift cash/qris if paid
    if (newOrder.paidAmount > 0) {
      setCurrentShift((prev) => {
        let nextShift: CashierShift;
        if (newOrder.paymentMethod === 'TUNAI') {
          nextShift = { ...prev, cashIn: prev.cashIn + newOrder.paidAmount };
        } else if (newOrder.paymentMethod === 'QRIS') {
          nextShift = { ...prev, qrisIn: prev.qrisIn + newOrder.paidAmount };
        } else {
          nextShift = { ...prev, transferIn: prev.transferIn + newOrder.paidAmount };
        }
        broadcastAction('update_shift', nextShift);
        return nextShift;
      });
    }

    // Auto open receipt for instant thermal printing
    setPrintReceiptState({ order: newOrder, type: 'initial' });
  };

  const handleSelectPackageForRental = (pkg: HikingPackage) => {
    setSelectedPackageForOrder(pkg);
    setIsInputNotaOpen(true);
  };

  const handleCompleteReturn = (updatedOrder: RentalOrder) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === updatedOrder.id ? updatedOrder : ord))
    );
    broadcastAction('update_order', updatedOrder);

    // Return inventory stock back
    setInventory((prev) => {
      const next = prev.map((g) => {
        const item = updatedOrder.items.find((i) => i.gearId === g.id);
        if (item && item.returned) {
          const isDamaged = item.returnedCondition && item.returnedCondition !== 'Baik';
          return {
            ...g,
            rentedStock: Math.max(0, g.rentedStock - item.quantity),
            maintenanceStock: isDamaged ? g.maintenanceStock + item.quantity : g.maintenanceStock,
          };
        }
        return g;
      });
      broadcastAction('update_inventory', next);
      return next;
    });

    // Update shift income for fines or settlement
    const extraPaid = updatedOrder.totalFine;
    if (extraPaid > 0) {
      setCurrentShift((prev) => {
        const next = {
          ...prev,
          cashIn: prev.cashIn + extraPaid,
        };
        broadcastAction('update_shift', next);
        return next;
      });
    }
  };

  const handleCompleteTakeItem = (updatedOrder: RentalOrder) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === updatedOrder.id ? updatedOrder : ord))
    );
    broadcastAction('update_order', updatedOrder);

    // Increase rentedStock in inventory for items taken out
    setInventory((prev) => {
      const next = prev.map((g) => {
        const item = updatedOrder.items.find((i) => i.gearId === g.id);
        if (item) {
          return {
            ...g,
            rentedStock: g.rentedStock + item.quantity,
          };
        }
        return g;
      });
      broadcastAction('update_inventory', next);
      return next;
    });

    // If there was extra settlement payment during handover (e.g. from DP to LUNAS), add to shift income
    const previousOrder = orders.find((o) => o.id === updatedOrder.id);
    const extraPaid = updatedOrder.paidAmount - (previousOrder?.paidAmount || 0);
    if (extraPaid > 0) {
      setCurrentShift((prev) => {
        const next = {
          ...prev,
          cashIn: prev.cashIn + extraPaid,
          totalTransactions: prev.totalTransactions + 1,
        };
        broadcastAction('update_shift', next);
        return next;
      });
    }

    setPrintReceiptState({ order: updatedOrder, type: 'take' });
  };

  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers((prev) => [newCustomer, ...prev]);
  };

  const handleFilterOrdersByCustomer = (custName: string) => {
    setCurrentTab('home');
    setSearchQuery(custName);
  };

  return (
    <div className={`min-h-screen bg-slate-100 text-slate-800 flex flex-col selection:bg-blue-500 selection:text-white w-full max-w-full overflow-x-hidden app app-scale-${uiScale}`}>
      {/* App Container: Automatically adapts smoothly to HP, Tablet, and Desktop */}
      <div
        className={`w-full flex flex-col transition-all duration-300 mx-auto ${
          viewMode === 'phone-sim'
            ? 'max-w-md bg-white shadow-2xl my-3 sm:my-6 rounded-3xl border border-slate-300 min-h-[92vh]'
            : 'max-w-7xl bg-slate-50/70 w-full min-h-screen'
        }`}
      >
        {/* Top Header Bar */}
        <div className="sticky top-0 z-30 w-full px-2 sm:px-4 py-2 bg-slate-100/90 backdrop-blur-md">
          <TopBar
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onOpenNewOrder={() => setIsInputNotaOpen(true)}
            currentShift={currentShift}
            onOpenShiftModal={() => setIsShiftModalOpen(true)}
            viewMode={viewMode}
            onToggleViewMode={() => setViewMode(viewMode === 'auto' ? 'phone-sim' : 'auto')}
            isOnline={isOnline}
            isConnected={isConnected}
            pendingCount={pendingCount}
            syncToastMessage={syncToastMessage}
            onDismissToast={dismissSyncToast}
            uiScale={uiScale}
            onSetUiScale={handleSetUiScale}
          />
        </div>

        {/* Slide-out Navigation Drawer (Matches Screenshot 2) */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentTab={currentTab}
          onSelectTab={(tab) => {
            if (tab === 'input-nota') {
              setIsInputNotaOpen(true);
            } else {
              setCurrentTab(tab);
            }
          }}
          bookedCount={bookedCount}
          outCount={outCount}
          currentShift={currentShift}
          onOpenShiftModal={() => {
            setIsSidebarOpen(false);
            setIsShiftModalOpen(true);
          }}
        />

        {/* Main Content Area: Responsive auto padding */}
        <main className="flex-1 px-2.5 sm:px-4 md:px-6 py-3 sm:py-4 overflow-y-auto w-full">
          {currentTab === 'home' && (
            <RentalList
              orders={orders}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeFilter={activeFilter}
              onSelectFilter={setActiveFilter}
              onPrint={(order) => {
                const t = order.itemStatus === 'Sudah Kembali' ? 'return' : order.takenStatus === 'Sudah Diambil' ? 'take' : 'initial';
                setPrintReceiptState({ order, type: t });
              }}
              onReturn={(order) => setSelectedOrderForReturn(order)}
              onTakeItem={(order) => setSelectedOrderForTake(order)}
              onPayQris={handleOpenQris}
              onOpenNewOrder={() => setIsInputNotaOpen(true)}
              onOpenPackages={() => setCurrentTab('packages')}
            />
          )}

          {currentTab === 'booked' && (
            <BookedView
              orders={orders}
              currentShift={currentShift}
              onOpenNewOrder={() => setIsInputNotaOpen(true)}
              onTakeItem={(order) => setSelectedOrderForTake(order)}
              onPrint={(order) => {
                const t = order.itemStatus === 'Sudah Kembali' ? 'return' : order.takenStatus === 'Sudah Diambil' ? 'take' : 'initial';
                setPrintReceiptState({ order, type: t });
              }}
              onPayQris={handleOpenQris}
              onSwitchToOutView={() => setCurrentTab('out')}
            />
          )}

          {currentTab === 'out' && (
            <OutView
              orders={orders}
              currentShift={currentShift}
              onReturn={(order) => setSelectedOrderForReturn(order)}
              onPrint={(order) => {
                const t = order.itemStatus === 'Sudah Kembali' ? 'return' : order.takenStatus === 'Sudah Diambil' ? 'take' : 'initial';
                setPrintReceiptState({ order, type: t });
              }}
              onPayQris={handleOpenQris}
              onSwitchToBookedView={() => setCurrentTab('booked')}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryView
              inventory={inventory}
              onUpdateInventory={(updated) => {
                setInventory(updated);
                broadcastAction('update_inventory', updated);
              }}
            />
          )}

          {currentTab === 'customer' && (
            <CustomerView
              customers={customers}
              orders={orders}
              onAddCustomer={handleAddCustomer}
              onFilterOrdersByCustomer={handleFilterOrdersByCustomer}
            />
          )}

          {currentTab === 'report' && (
            <ReportView
              orders={orders}
              inventory={inventory}
              currentShift={currentShift}
              onOpenShiftModal={() => setIsShiftModalOpen(true)}
            />
          )}

          {currentTab === 'packages' && (
            <PackagesView
              onSelectPackageForRental={handleSelectPackageForRental}
            />
          )}
        </main>

        {/* Mobile Persistent Bottom Quick Bar */}
        <div className="sticky bottom-0 z-20 w-full px-3 sm:px-4 py-2 bg-white/95 backdrop-blur-md border-t border-slate-200 mt-auto">
          <div className="w-full max-w-md mx-auto flex items-center justify-around text-[10px] font-bold text-slate-500">
            <button
              type="button"
              onClick={() => {
                setCurrentTab('home');
                setActiveFilter('all');
              }}
              className={`flex flex-col items-center gap-0.5 cursor-pointer transition-transform active:scale-95 ${
                currentTab === 'home' ? 'text-blue-600 font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              <span className="text-base">🏠</span>
              <span>Kasir</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('booked')}
              className={`relative flex flex-col items-center gap-0.5 cursor-pointer transition-transform active:scale-95 ${
                currentTab === 'booked' ? 'text-amber-600 font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              <span className="text-base">📅</span>
              <span>Booked</span>
              {bookedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-xs">
                  {bookedCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsInputNotaOpen(true)}
              className="flex flex-col items-center -mt-5 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center text-2xl shadow-[0_8px_20px_rgba(37,99,235,0.4)] border-3 border-white hover:scale-105 active:scale-95 transition-all">
                +
              </div>
              <span className="text-blue-600 mt-0.5 font-bold">Sewa Baru</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('out')}
              className={`relative flex flex-col items-center gap-0.5 cursor-pointer transition-transform active:scale-95 ${
                currentTab === 'out' ? 'text-blue-600 font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              <span className="text-base">🚀</span>
              <span>Out</span>
              {outCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-xs">
                  {outCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('report')}
              className={`flex flex-col items-center gap-0.5 cursor-pointer transition-transform active:scale-95 ${
                currentTab === 'report' ? 'text-blue-600 font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              <span className="text-base">📊</span>
              <span>Laporan</span>
            </button>
          </div>
        </div>

        {/* New Order Modal (Input Nota) */}
        {isInputNotaOpen && (
          <InputNotaModal
            isOpen={isInputNotaOpen}
            onClose={() => {
              setIsInputNotaOpen(false);
              setSelectedPackageForOrder(null);
            }}
            inventory={inventory}
            customers={customers}
            cashierName={currentShift.cashierName}
            shiftName={currentShift.shiftName}
            initialPackage={selectedPackageForOrder}
            onCreateOrder={handleCreateOrder}
            onOpenQrisForOrder={(orderNum, name, amount) => {
              setQrisState({
                isOpen: true,
                orderNumber: orderNum,
                customerName: name,
                amount,
                paymentType: 'sewa',
              });
            }}
          />
        )}

        {/* Take Item Modal (Serah Terima Booking ke Pelanggan) */}
        {selectedOrderForTake && (
          <TakeItemModal
            isOpen={!!selectedOrderForTake}
            onClose={() => setSelectedOrderForTake(null)}
            order={selectedOrderForTake}
            onConfirmHandover={handleCompleteTakeItem}
          />
        )}

        {/* Return Checklist & Settlement Modal */}
        {selectedOrderForReturn && (
          <ReturnModal
            isOpen={!!selectedOrderForReturn}
            onClose={() => setSelectedOrderForReturn(null)}
            order={selectedOrderForReturn}
            onCompleteReturn={handleCompleteReturn}
            onOpenQrisForSettlement={(orderNum, name, amount) => {
              setQrisState({
                isOpen: true,
                orderNumber: orderNum,
                customerName: name,
                amount,
                paymentType: 'denda',
              });
            }}
          />
        )}

        {/* QRIS Digital Payment Modal & Live Simulator */}
        {qrisState.isOpen && (
          <QRISModal
            isOpen={qrisState.isOpen}
            onClose={() => setQrisState((prev) => ({ ...prev, isOpen: false }))}
            orderNumber={qrisState.orderNumber}
            customerName={qrisState.customerName}
            amount={qrisState.amount}
            paymentType={qrisState.paymentType}
            onPaymentSuccess={handleQrisPaymentSuccess}
          />
        )}

        {/* Thermal POS Receipt Modal */}
        {printReceiptState && (
          <ThermalReceiptModal
            isOpen={!!printReceiptState}
            onClose={() => setPrintReceiptState(null)}
            order={printReceiptState.order}
            receiptType={printReceiptState.type}
          />
        )}

        {/* Cashier Shift & Drawer Modal */}
        {isShiftModalOpen && (
          <ShiftModal
            isOpen={isShiftModalOpen}
            onClose={() => setIsShiftModalOpen(false)}
            currentShift={currentShift}
            onUpdateShift={(updated) => {
              setCurrentShift(updated);
              broadcastAction('update_shift', updated);
            }}
          />
        )}

        {/* PWA Service Worker Automatic Background Update Toast */}
        <PWAUpdateToast />
      </div>
    </div>
  );
}
