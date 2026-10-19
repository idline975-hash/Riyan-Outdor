import React, { useState } from 'react';
import { GearItem, GearCategory } from '../types';
import { formatRupiah } from '../utils/formatters';
import { Plus, Search, Edit2, Package, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw, X } from 'lucide-react';
import { playSound } from '../utils/sound';

interface InventoryViewProps {
  inventory: GearItem[];
  onUpdateInventory: (updated: GearItem[]) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  onUpdateInventory,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGear, setEditingGear] = useState<GearItem | null>(null);

  // Stats
  const totalStockCount = inventory.reduce((sum, g) => sum + g.totalStock, 0);
  const totalRentedCount = inventory.reduce((sum, g) => sum + g.rentedStock, 0);
  const totalMaintenanceCount = inventory.reduce((sum, g) => sum + g.maintenanceStock, 0);
  const totalAvailableCount = totalStockCount - totalRentedCount - totalMaintenanceCount;

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'Semua Alat' },
    { id: 'tenda', label: 'Tenda & Shelter' },
    { id: 'carrier', label: 'Tas Carrier' },
    { id: 'tidur', label: 'SB & Matras' },
    { id: 'masak', label: 'Peralatan Masak' },
    { id: 'penerangan', label: 'Headlamp & Lampu' },
    { id: 'aksesoris', label: 'Aksesoris & Trekking' },
    { id: 'footwear', label: 'Sepatu Gunung' },
    { id: 'camp_furniture', label: 'Meja & Kursi Lipat' },
  ];

  const filtered = inventory.filter((g) => {
    const matchCat = selectedCategory === 'all' || g.category === selectedCategory;
    const matchSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.code.toLowerCase().includes(search.toLowerCase()) ||
      g.brand.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSaveGear = (gear: GearItem) => {
    const exists = inventory.some((g) => g.id === gear.id);
    if (exists) {
      onUpdateInventory(inventory.map((g) => (g.id === gear.id ? gear : g)));
    } else {
      onUpdateInventory([gear, ...inventory]);
    }
    playSound('beep');
    setIsAddModalOpen(false);
    setEditingGear(null);
  };

  return (
    <div className="space-y-3.5 pb-8">
      {/* Header Banner */}
      <div className="p-3.5 sm:p-4 bg-white text-slate-800 rounded-2xl flex items-center justify-between border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-600">
              Katalog & Kontrol Stok
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900">
              Inventori Peralatan Gunung
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingGear(null);
            setIsAddModalOpen(true);
          }}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Tambah Alat</span>
        </button>
      </div>

      {/* Top Inventory Summary Metrics Floating Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 shadow-[0_8px_20px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 transition-all">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Peralatan
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 tabular-nums">
            {totalStockCount} <span className="text-xs font-normal text-slate-400">Unit</span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 shadow-[0_8px_20px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 transition-all">
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
            Stok Tersedia
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5 tabular-nums">
            {totalAvailableCount} <span className="text-xs font-normal text-slate-400">Siap Sewa</span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 shadow-[0_8px_20px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 transition-all">
          <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
            Sedang Disewa
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-600 mt-0.5 tabular-nums">
            {totalRentedCount} <span className="text-xs font-normal text-slate-400">Di Lapangan</span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 shadow-[0_8px_20px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 transition-all">
          <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
            Perawatan/Cuci
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5 tabular-nums">
            {totalMaintenanceCount} <span className="text-xs font-normal text-slate-400">Unit</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Category Tabs, Add Button Floating Panel */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-3 shadow-[0_8px_20px_rgba(15,23,42,0.06)] space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari kode (TD-01), merk, atau nama alat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Add New Gear Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Peralatan Baru</span>
          </button>
        </div>

        {/* Category Horizontal Filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gear Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((item) => {
          const available = item.totalStock - item.rentedStock - item.maintenanceStock;
          const usagePercent = Math.round((item.rentedStock / item.totalStock) * 100) || 0;

          return (
            <div
              key={item.id}
              className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_30px_rgba(15,23,42,0.1)] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-mono font-bold">
                      {item.code}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 capitalize">
                      {item.brand}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingGear(item)}
                    title="Ubah data & stok"
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="font-bold text-slate-900 text-sm mt-1.5 leading-snug">
                  {item.name}
                </h4>

                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {item.specs}
                </p>

                {/* Stock Progress Bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11px] font-medium text-slate-500">
                    <span>Tersewa: {item.rentedStock} dari {item.totalStock} unit</span>
                    <span className="font-bold text-slate-700">{usagePercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${usagePercent}%` }}
                      className="bg-blue-600 h-full rounded-full"
                    />
                  </div>
                </div>

                {/* Badges Info */}
                <div className="grid grid-cols-3 gap-1.5 mt-3 text-center text-[10px]">
                  <div className="bg-emerald-50 text-emerald-800 p-1.5 rounded-xl border border-emerald-200">
                    <div className="font-bold text-xs">{available}</div>
                    <div className="font-semibold">Tersedia</div>
                  </div>
                  <div className="bg-blue-50 text-blue-800 p-1.5 rounded-xl border border-blue-200">
                    <div className="font-bold text-xs">{item.rentedStock}</div>
                    <div className="font-semibold">Disewa</div>
                  </div>
                  <div className="bg-amber-50 text-amber-800 p-1.5 rounded-xl border border-amber-200">
                    <div className="font-bold text-xs">{item.maintenanceStock}</div>
                    <div className="font-semibold">Cuci/Servis</div>
                  </div>
                </div>
              </div>

              {/* Price & Penalty Footer */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Harga Sewa:</div>
                  <div className="font-extrabold text-blue-700">
                    {formatRupiah(item.pricePerDay)}<span className="text-[10px] text-slate-400 font-normal">/hari</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Denda Telat:</div>
                  <div className="font-bold text-rose-600">
                    {formatRupiah(item.dailyPenaltyRate)}<span className="text-[10px] text-slate-400 font-normal">/hari</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Gear Modal */}
      {(isAddModalOpen || editingGear) && (
        <GearFormModal
          isOpen={true}
          initialGear={editingGear}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingGear(null);
          }}
          onSave={handleSaveGear}
        />
      )}
    </div>
  );
};

interface GearFormModalProps {
  isOpen: boolean;
  initialGear: GearItem | null;
  onClose: () => void;
  onSave: (gear: GearItem) => void;
}

const GearFormModal: React.FC<GearFormModalProps> = ({
  isOpen,
  initialGear,
  onClose,
  onSave,
}) => {
  const [code, setCode] = useState(initialGear?.code || '');
  const [name, setName] = useState(initialGear?.name || '');
  const [category, setCategory] = useState<GearCategory>(initialGear?.category || 'tenda');
  const [brand, setBrand] = useState(initialGear?.brand || '');
  const [specs, setSpecs] = useState(initialGear?.specs || '');
  const [totalStock, setTotalStock] = useState(initialGear?.totalStock || 10);
  const [rentedStock, setRentedStock] = useState(initialGear?.rentedStock || 0);
  const [maintenanceStock, setMaintenanceStock] = useState(initialGear?.maintenanceStock || 0);
  const [pricePerDay, setPricePerDay] = useState(initialGear?.pricePerDay || 30000);
  const [dailyPenaltyRate, setDailyPenaltyRate] = useState(initialGear?.dailyPenaltyRate || 20000);
  const [replacementCost, setReplacementCost] = useState(initialGear?.replacementCost || 500000);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item: GearItem = {
      id: initialGear ? initialGear.id : `gear-${Date.now()}`,
      code: code || `G-${Math.floor(10 + Math.random() * 89)}`,
      name,
      category,
      brand,
      specs,
      totalStock: Number(totalStock),
      rentedStock: Number(rentedStock),
      maintenanceStock: Number(maintenanceStock),
      pricePerDay: Number(pricePerDay),
      dailyPenaltyRate: Number(dailyPenaltyRate),
      replacementCost: Number(replacementCost),
      condition: 'Baik',
    };
    onSave(item);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-300">
                Manajemen Stok Alat
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-white">
                {initialGear ? 'Edit Detail Alat & Stok' : 'Tambah Peralatan Gunung Baru'}
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-500 uppercase block mb-1">Kode / SKU</label>
              <input
                type="text"
                required
                placeholder="Misal: TD-03"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="font-bold text-slate-500 uppercase block mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GearCategory)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-medium text-slate-900"
              >
                <option value="tenda">Tenda & Shelter</option>
                <option value="carrier">Tas Carrier</option>
                <option value="tidur">SB & Matras</option>
                <option value="masak">Peralatan Masak</option>
                <option value="penerangan">Headlamp & Lampu</option>
                <option value="aksesoris">Aksesoris & Trekking</option>
                <option value="footwear">Sepatu Gunung</option>
                <option value="camp_furniture">Meja & Kursi Lipat</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-500 uppercase block mb-1">Nama Alat Lengkap *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Tenda Naturehike Mongar 2P"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-medium text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-500 uppercase block mb-1">Merk / Brand</label>
              <input
                type="text"
                placeholder="Eiger / Consina / Naturehike"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="font-bold text-slate-500 uppercase block mb-1">Spesifikasi Singkat</label>
              <input
                type="text"
                placeholder="Frame alloy, waterproof 3000mm"
                value={specs}
                onChange={(e) => setSpecs(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Stock counters */}
          <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50 space-y-2">
            <span className="font-bold text-slate-800 uppercase tracking-wide block">
              Manajemen Stok Fisik:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Total Stok</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={totalStock}
                  onChange={(e) => setTotalStock(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Sedang Disewa</label>
                <input
                  type="number"
                  min={0}
                  max={totalStock}
                  value={rentedStock}
                  onChange={(e) => setRentedStock(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Perawatan/Cuci</label>
                <input
                  type="number"
                  min={0}
                  value={maintenanceStock}
                  onChange={(e) => setMaintenanceStock(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Financials */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-bold text-slate-500 uppercase block mb-1">Tarif Sewa/Hari</label>
              <input
                type="number"
                step={1000}
                required
                value={pricePerDay}
                onChange={(e) => setPricePerDay(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-blue-700"
              />
            </div>
            <div>
              <label className="font-bold text-slate-500 uppercase block mb-1">Denda Telat/Hari</label>
              <input
                type="number"
                step={1000}
                required
                value={dailyPenaltyRate}
                onChange={(e) => setDailyPenaltyRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-rose-600"
              />
            </div>
            <div>
              <label className="font-bold text-slate-500 uppercase block mb-1">Ganti Rugi Hilang</label>
              <input
                type="number"
                step={5000}
                required
                value={replacementCost}
                onChange={(e) => setReplacementCost(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-700"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-sm"
            >
              Simpan Data Alat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
