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
import { CashierLoginModal } from './components/CashierLoginModal';
import { PackagesView } from './components/PackagesView';
import { SettingsView } from './components/SettingsView';
import { BookedView } from './components/BookedView';
import { OutView } from './components/OutView';
import { TakeItemModal } from './components/TakeItemModal';
import { PWAUpdateToast } from './components/PWAUpdateToast';
import { UiScaleOption } from './components/ScaleSelector';
import { HikingPackage, CashierUser } from './types';
import { 
  getCachedOrders, 
  getCachedInventory, 
  getCachedCustomers, 
  getCachedShift,
  getCachedCashiers,
  saveCachedCashiers,
  getCachedActiveCashierId,
  saveCachedActiveCashierId,
  getCachedLoginStatus,
  saveCachedLoginStatus,
  DEFAULT_CASHIERS
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
  const [currentTab, setCurrentTab] = useState<'home' | 'input-nota' | 'booked' | 'out' | 'report' | 'inventory' | 'customer' | 'packages' | 'settings'>('home');

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

  // Cashier Accounts & Authentication State
  const [cashiers, setCashiers] = useState<CashierUser[]>(() => getCachedCashiers());
  const [activeCashierId, setActiveCashierId] = useState<string>(() => getCachedActiveCashierId());
  const [isCashierLoggedIn, setIsCashierLoggedIn] = useState<boolean>(() => getCachedLoginStatus());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const activeCashier =
    cashiers.find((c) => c.id === activeCashierId) ||
    cashiers.find((c) => c.name === currentShift.cashierName) ||
    cashiers[0] ||
    DEFAULT_CASHIERS[0];

  const handleCashierLogin = (cashier: CashierUser, shiftName: string, openingCash: number) => {
    setActiveCashierId(cashier.id);
    setIsCashierLoggedIn(true);
    saveCachedActiveCashierId(cashier.id);
    saveCachedLoginStatus(true);
    setIsLoginModalOpen(false);

    const isShift1 = shiftName === 'Shift 1';
    const hours = isShift1 ? '08:00 - 16:00' : '16:00 - 23:00';

    const nowStr = 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const updatedCashiers = cashiers.map((c) =>
      c.id === cashier.id ? { ...c, lastLoginAt: nowStr } : c
    );
    setCashiers(updatedCashiers);
    saveCachedCashiers(updatedCashiers);

    setCurrentShift((prev) => {
      const nextShift: CashierShift = {
        ...prev,
        cashierName: cashier.name,
        shiftName: shiftName,
        shiftHours: hours,
        openingCash: openingCash,
      };
      broadcastAction('update_shift', nextShift);
      return nextShift;
    });
  };

  const handleCashierLogout = () => {
    setIsCashierLoggedIn(false);
    saveCachedLoginStatus(false);
    setIsLoginModalOpen(true);
  };

  const handleSaveCashiers = (updated: CashierUser[]) => {
    setCashiers(updated);
    saveCachedCashiers(updated);
  };

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
    <div className={`min-h-screen bg-slate-900/5 relative text-slate-800 flex flex-col selection:bg-blue-500 selection:text-white w-full max-w-full overflow-x-hidden app app-scale-${uiScale}`}>
      {/* Ambient background light orbs for frosted glass refraction */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute top-1/4 -right-40 w-[30rem] h-[30rem] rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute top-2/3 left-1/3 w-96 h-96 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl" />
      </div>

      {/* App Container: Automatically adapts smoothly to HP, Tablet, and Desktop with glassy aesthetic */}
      <div
        className={`w-full flex flex-col transition-all duration-300 mx-auto relative z-10 ${
          viewMode === 'phone-sim'
            ? 'max-w-md glass-surface shadow-[0_25px_60px_-15px_rgba(15,23,42,0.18)] my-3 sm:my-6 rounded-3xl border border-white/80 min-h-[92vh] overflow-hidden'
            : 'max-w-7xl bg-white/40 backdrop-blur-3xl w-full min-h-screen border-x border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.03)]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="sticky top-0 z-30 w-full px-2 sm:px-4 py-2 bg-white/40 backdrop-blur-xl border-b border-white/60">
          <TopBar
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onOpenNewOrder={() => setIsInputNotaOpen(true)}
            currentShift={currentShift}
            onOpenShiftModal={() => setIsShiftModalOpen(true)}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
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
          onOpenLoginModal={() => {
            setIsSidebarOpen(false);
            setIsLoginModalOpen(true);
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

          {currentTab === 'settings' && (
            <SettingsView
              uiScale={uiScale}
              onSetUiScale={handleSetUiScale}
              viewMode={viewMode}
              onToggleViewMode={() => setViewMode(viewMode === 'auto' ? 'phone-sim' : 'auto')}
              orders={orders}
              inventory={inventory}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
              currentShift={currentShift}
            />
          )}
        </main>

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
            onPrint={(order) => setPrintReceiptState({ order, type: 'return' })}
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

        {/* Cashier Login & Lock Screen Modal */}
        {(!isCashierLoggedIn || isLoginModalOpen) && (
          <CashierLoginModal
            isOpen={!isCashierLoggedIn || isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            cashiers={cashiers}
            activeCashier={activeCashier}
            isLoggedIn={isCashierLoggedIn}
            currentShift={currentShift}
            onLoginSuccess={handleCashierLogin}
            onLogout={handleCashierLogout}
            onSaveCashiers={handleSaveCashiers}
            isLockScreen={!isCashierLoggedIn}
          />
        )}

        {/* PWA Service Worker Automatic Background Update Toast */}
        <PWAUpdateToast />
      </div>
    </div>
  );
}
