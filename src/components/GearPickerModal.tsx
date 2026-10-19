import React, { useState } from 'react';
import {
  X,
  Search,
  Plus,
  Minus,
  Check,
  Package,
  Sparkles,
  Tent,
  Backpack,
  Moon,
  Utensils,
  Lightbulb,
  Compass,
  AlertCircle,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { GearItem, HikingPackage } from '../types';
import { HIKING_PACKAGES } from '../data/hikingPackages';
import { formatRupiah } from '../utils/formatters';
import { playSound } from '../utils/sound';

interface GearPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: GearItem[];
  cartItems: Array<{ gear: GearItem; quantity: number }>;
  onAddToCart: (gear: GearItem) => void;
  onUpdateQty: (gearId: string, delta: number) => void;
  onAddPackage: (pkg: HikingPackage) => void;
}

export const GearPickerModal: React.FC<GearPickerModalProps> = ({
  isOpen,
  onClose,
  inventory,
  cartItems,
  onAddToCart,
  onUpdateQty,
  onAddPackage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterStockOnly, setFilterStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'stock-desc' | 'name-asc'>('default');

  if (!isOpen) return null;

  // Filter & sort regular gear
  const filteredGear = inventory
    .filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.specs.toLowerCase().includes(searchQuery.toLowerCase());

      const available = item.totalStock - item.rentedStock - item.maintenanceStock;
      const matchStock = !filterStockOnly || available > 0;

      return matchCategory && matchSearch && matchStock;
    })
    .sort((a, b) => {
      const availA = a.totalStock - a.rentedStock - a.maintenanceStock;
      const availB = b.totalStock - b.rentedStock - b.maintenanceStock;

      if (sortBy === 'price-asc') return a.pricePerDay - b.pricePerDay;
      if (sortBy === 'price-desc') return b.pricePerDay - a.pricePerDay;
      if (sortBy === 'stock-desc') return availB - availA;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return 0; // default code/original order
    });

  // Filter hiking packages
  const filteredPackages = HIKING_PACKAGES.filter((pkg) => {
    const matchSearch =
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.targetPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  const totalSelectedCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalDailyFee = cartItems.reduce(
    (sum, item) => sum + item.gear.pricePerDay * item.quantity,
    0
  );

  const getInCartQty = (gearId: string) => {
    return cartItems.find((i) => i.gear.id === gearId)?.quantity || 0;
  };

  const getInCartPackageQty = (code: string) => {
    return cartItems.find((i) => i.gear.code === code)?.quantity || 0;
  };

  const categories = [
    { id: 'all', label: 'Semua Alat', icon: Package, count: inventory.length },
    { id: 'paket', label: '🎒 Paket Hiking (Hemat)', icon: Sparkles, count: HIKING_PACKAGES.length },
    { id: 'tenda', label: 'Tenda Dome', icon: Tent, count: inventory.filter((i) => i.category === 'tenda').length },
    { id: 'carrier', label: 'Carrier / Ransel', icon: Backpack, count: inventory.filter((i) => i.category === 'carrier').length },
    { id: 'tidur', label: 'SB & Matras', icon: Moon, count: inventory.filter((i) => i.category === 'tidur').length },
    { id: 'masak', label: 'Alat Masak', icon: Utensils, count: inventory.filter((i) => i.category === 'masak').length },
    { id: 'penerangan', label: 'Lampu & HT', icon: Lightbulb, count: inventory.filter((i) => i.category === 'penerangan').length },
    { id: 'aksesoris', label: 'Aksesoris', icon: Compass, count: inventory.filter((i) => i.category === 'aksesoris').length },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-3 md:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-none sm:rounded-3xl max-w-5xl w-full h-full sm:h-[92vh] max-h-screen sm:max-h-[900px] overflow-hidden shadow-2xl border-0 sm:border border-slate-200 flex flex-col">
        {/* Modal Top Header */}
        <div className="px-3.5 py-2.5 sm:px-6 sm:py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-xs sm:text-base font-extrabold text-white truncate">
                  Pilih Peralatan Gunung
                </h3>
                <span className="hidden sm:inline-block text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full">
                  Katalog
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
                Cari, filter per kategori, dan tentukan jumlah barang.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {totalSelectedCount > 0 && (
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-xl text-[11px] sm:text-xs font-black">
                {totalSelectedCount} item
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Tutup Katalog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar & Quick Filters Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200/80 space-y-2 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                autoFocus
                placeholder="Cari nama alat, tenda dome, carrier 60L, kompor, kode #TD-01, merek..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title="Hapus Pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Sort By Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs"
              >
                <option value="default">Urutkan: Standar</option>
                <option value="price-asc">Harga: Termurah</option>
                <option value="price-desc">Harga: Tertinggi</option>
                <option value="stock-desc">Stok: Terbanyak</option>
                <option value="name-asc">Nama (A - Z)</option>
              </select>

              {/* Quick Toggle: Stock Only */}
              <button
                type="button"
                onClick={() => setFilterStockOnly(!filterStockOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  filterStockOnly
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title="Hanya tampilkan alat yang stoknya tersedia"
              >
                <Check className={`w-3.5 h-3.5 ${filterStockOnly ? 'opacity-100' : 'opacity-0'}`} />
                <span>Siap Pakai</span>
              </button>
            </div>
          </div>

          {/* Quick Search Chips Suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] no-scrollbar">
            <span className="text-[10px] font-black uppercase text-slate-400 shrink-0">Cepat:</span>
            {[
              { label: 'Tenda Dome', query: 'Tenda' },
              { label: 'Carrier 60L', query: '60L' },
              { label: 'Kompor Portable', query: 'Kompor' },
              { label: 'Matras', query: 'Matras' },
              { label: 'Sleeping Bag', query: 'Sleeping Bag' },
              { label: 'Headlamp / Lampu', query: 'Lampu' },
              { label: 'Nesting / Cookset', query: 'Nesting' },
              { label: 'Trekking Pole', query: 'Pole' },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => setSearchQuery(chip.query)}
                className={`px-2 py-0.5 rounded-lg border text-[11px] font-semibold shrink-0 transition-colors cursor-pointer ${
                  searchQuery.toLowerCase() === chip.query.toLowerCase()
                    ? 'bg-blue-100 border-blue-300 text-blue-800 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Category Pills Bar */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-extrabold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area: Gear Item Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-100/50">
          {/* SPECIAL: PAKET HIKING TAB */}
          {selectedCategory === 'paket' ? (
            filteredPackages.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="font-bold">Tidak ditemukan paket dengan pencarian &quot;{searchQuery}&quot;</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredPackages.map((pkg) => {
                  const qty = getInCartPackageQty(pkg.code);
                  return (
                    <div
                      key={pkg.id}
                      className={`bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between shadow-xs ${
                        qty > 0 ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/30' : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wide">
                            {pkg.code} • {pkg.targetPerson}
                          </span>
                          <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                            Hemat {pkg.discountPercent}%
                          </span>
                        </div>

                        <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                          {pkg.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          {pkg.description}
                        </p>

                        <div className="mt-2.5 p-2 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
                          <div className="font-bold text-slate-700">Termasuk {pkg.includedGear.reduce((a, b) => a + b.quantity, 0)} item:</div>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                            {pkg.includedGear.map((g, idx) => (
                              <li key={idx} className="truncate">
                                {g.quantity}x {g.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 line-through">
                            {formatRupiah(pkg.originalPricePerDay)}
                          </div>
                          <div className="text-base font-black text-blue-700">
                            {formatRupiah(pkg.pricePerDay)}
                            <span className="text-[10px] text-slate-500 font-normal">/hari</span>
                          </div>
                        </div>

                        {qty === 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              onAddPackage(pkg);
                              playSound('beep');
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Pilih Paket</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-xl p-1">
                            <button
                              type="button"
                              onClick={() => {
                                const packageAsGearId = `pkg-${pkg.code}`;
                                onUpdateQty(packageAsGearId, -1);
                              }}
                              className="w-6 h-6 rounded-lg bg-white border border-blue-200 text-blue-700 font-bold flex items-center justify-center hover:bg-blue-100 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-black text-blue-900 text-xs">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const packageAsGearId = `pkg-${pkg.code}`;
                                onUpdateQty(packageAsGearId, 1);
                              }}
                              className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center hover:bg-blue-700 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* REGULAR GEAR ITEMS GRID */
            filteredGear.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="font-bold">Tidak ditemukan peralatan gunung dengan kriteria tersebut.</p>
                <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci lain atau pilih &quot;Semua Alat&quot;</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredGear.map((gear) => {
                  const available = gear.totalStock - gear.rentedStock - gear.maintenanceStock;
                  const isOutOfStock = available <= 0;
                  const qtyInCart = getInCartQty(gear.id);

                  return (
                    <div
                      key={gear.id}
                      className={`bg-white rounded-2xl p-3.5 border transition-all flex flex-col justify-between shadow-xs ${
                        qtyInCart > 0
                          ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        {/* Header: Code & Category */}
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                            #{gear.code}
                          </span>
                          <span className="capitalize font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            {gear.category}
                          </span>
                        </div>

                        {/* Gear Name */}
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                          {gear.name}
                        </h4>

                        {/* Brand & Specs */}
                        <div className="text-[11px] text-slate-500 mt-1">
                          <span className="font-semibold text-slate-700">{gear.brand}</span>
                          <span className="mx-1">•</span>
                          <span>{gear.specs}</span>
                        </div>

                        {/* Stock Status Badge */}
                        <div className="mt-2.5 flex items-center gap-1.5 text-[10px]">
                          {isOutOfStock ? (
                            <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                              Habis (0 unit)
                            </span>
                          ) : (
                            <span className="font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Tersedia: {available} unit
                            </span>
                          )}
                          <span className="text-slate-400">
                            (Total: {gear.totalStock})
                          </span>
                        </div>
                      </div>

                      {/* Footer: Price & Add / Quantity Stepper */}
                      <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400">Tarif Sewa:</div>
                          <div className="text-sm font-black text-blue-700">
                            {formatRupiah(gear.pricePerDay)}
                            <span className="text-[10px] text-slate-400 font-normal">/hr</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        {qtyInCart === 0 ? (
                          <button
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => onAddToCart(gear)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-black shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Pilih</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-xl p-1">
                            <button
                              type="button"
                              onClick={() => onUpdateQty(gear.id, -1)}
                              className="w-6 h-6 rounded-lg bg-white border border-blue-200 text-blue-700 font-bold flex items-center justify-center hover:bg-blue-100 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center font-black text-blue-900 text-xs">
                              {qtyInCart}
                            </span>
                            <button
                              type="button"
                              disabled={qtyInCart >= available}
                              onClick={() => onUpdateQty(gear.id, 1)}
                              className="w-6 h-6 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold flex items-center justify-center cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>

        {/* Modal Bottom Sticky Summary & Action Footer */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Total Alat Dipilih
              </div>
              <div className="text-xs sm:text-sm font-black text-slate-900">
                {totalSelectedCount > 0 ? (
                  <>
                    <span className="text-blue-700">{totalSelectedCount} Barang</span>
                    <span className="text-slate-400 mx-1.5">•</span>
                    <span className="text-emerald-700">{formatRupiah(totalDailyFee)}/hari</span>
                  </>
                ) : (
                  <span className="text-slate-400 font-normal">Belum ada barang yang dipilih</span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 sm:px-7 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Selesai &amp; Lanjut ke Nota ({totalSelectedCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
