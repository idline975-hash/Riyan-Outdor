import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Users,
  Tag,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  Flame,
  Info,
  X,
  PackageCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { HikingPackage } from '../types';
import { HIKING_PACKAGES } from '../data/hikingPackages';
import { formatRupiah } from '../utils/formatters';

interface PackagesViewProps {
  onSelectPackageForRental: (pkg: HikingPackage) => void;
}

export const PackagesView: React.FC<PackagesViewProps> = ({
  onSelectPackageForRental,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'capacity'>('recommended');
  const [selectedPackageForDetail, setSelectedPackageForDetail] = useState<HikingPackage | null>(null);

  // Filter & Search Logic
  const filteredPackages = HIKING_PACKAGES.filter((pkg) => {
    const matchCategory =
      selectedCategory === 'all' ||
      pkg.categoryType.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      pkg.tier === selectedCategory;

    const matchSearch =
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.recommendedFor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.includedGear.some((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchCategory && matchSearch;
  });

  // Sorting Logic
  const sortedPackages = [...filteredPackages].sort((a, b) => {
    if (sortBy === 'price-asc') return a.pricePerDay - b.pricePerDay;
    if (sortBy === 'price-desc') return b.pricePerDay - a.pricePerDay;
    if (sortBy === 'capacity') {
      const getCap = (p: HikingPackage) => {
        if (p.targetPerson.includes('5-6') || p.targetPerson.includes('6')) return 6;
        if (p.targetPerson.includes('4-5') || p.targetPerson.includes('4')) return 4;
        if (p.targetPerson.includes('2')) return 2;
        return 1;
      };
      return getCap(b) - getCap(a);
    }
    return 0; // Default recommended order
  });

  const getBadgeStyle = (color: HikingPackage['badgeColor']) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'amber':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'rose':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'cyan':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Hero Promo Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-5 sm:p-7 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Pilihan Paket Hemat Sewa Alat 2026</span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
            Paket Camping & Hiking Komplit
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Disediakan berdasarkan jenis pendakian, kapasitas tim, dan tingkatan harga. Hemat hingga 35% dibandingkan sewa satuan dan dijamin alat siap pakai, bersih, & terawat!
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-200">
            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Bebas Ribet Pilih Alat
            </span>
            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
              <Tag className="w-3.5 h-3.5 text-amber-400" /> Diskon Paket s/d 35%
            </span>
            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
              <Compass className="w-3.5 h-3.5 text-cyan-400" /> Rekomendasi Jalur & Gunung
            </span>
          </div>
        </div>

        {/* Ambient Gradient glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-600/20 to-transparent pointer-events-none" />
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari paket solo, squad 4 orang, ekstrem badai, tektok, atau nama alat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] font-bold text-slate-500 uppercase">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none"
            >
              <option value="recommended">⭐ Paling Rekomendasi</option>
              <option value="price-asc">💵 Harga Termurah (Mulai Rp 45rb)</option>
              <option value="price-desc">💎 Kelas Lengkap / Ekspedisi</option>
              <option value="capacity">👥 Kapasitas Orang Terbanyak</option>
            </select>
          </div>
        </div>

        {/* Category Pills (Differentiated by Type) */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {[
            { id: 'all', label: 'Semua Paket (6)' },
            { id: 'solo', label: '🏕️ Solo / Ultralight (1P)' },
            { id: 'duo', label: '👫 Duo / Pasangan (2P)' },
            { id: 'squad', label: '🔥 Squad Reguler (4-5P)' },
            { id: 'extreme', label: '⚡ Ekspedisi Extreme (Safety)' },
            { id: 'family', label: '⛺ Family & Glamping (5-6P)' },
            { id: 'tektok', label: '⚡ Fast Hike / Tektok (1-2P)' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedPackages.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
            <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <div className="text-base font-bold text-slate-800">
              Tidak Ada Paket yang Sesuai
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Tidak ditemukan paket hiking dengan kata kunci &quot;{searchQuery}&quot;. Coba ganti kata kunci atau pilih kategori &quot;Semua Paket&quot;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          sortedPackages.map((pkg) => {
            const savingsAmount = pkg.originalPricePerDay - pkg.pricePerDay;

            return (
              <div
                key={pkg.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Header Top */}
                <div className="p-4 sm:p-5 border-b border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${getBadgeStyle(
                        pkg.badgeColor
                      )}`}
                    >
                      {pkg.badge}
                    </span>

                    <div className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                      <Users className="w-3 h-3 text-slate-500" />
                      <span>{pkg.targetPerson}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                      {pkg.name}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-semibold mt-0.5">
                      Kategori: <span className="text-slate-600">{pkg.categoryType}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {pkg.description}
                  </p>

                  {/* Pricing Box */}
                  <div className="pt-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Harga Sewa Paket
                        </div>
                        <div className="text-lg sm:text-xl font-black text-blue-700 leading-none mt-0.5">
                          {formatRupiah(pkg.pricePerDay)}
                          <span className="text-xs font-normal text-slate-500"> /hari</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-slate-400 line-through">
                          {formatRupiah(pkg.originalPricePerDay)}
                        </div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-black">
                          Hemat {pkg.discountPercent}% ({formatRupiah(savingsAmount)})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Included Gear Highlights Preview */}
                <div className="p-4 sm:p-5 space-y-3 flex-1 bg-white">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Daftar {pkg.includedGear.reduce((a, b) => a + b.quantity, 0)} Item Termasuk:</span>
                      <button
                        type="button"
                        onClick={() => setSelectedPackageForDetail(pkg)}
                        className="text-blue-600 hover:underline font-bold text-[10px] cursor-pointer"
                      >
                        Detail Lengkap &gt;
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {pkg.includedGear.slice(0, 4).map((gear, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs text-slate-700 py-0.5"
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate font-medium">{gear.name}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 shrink-0 bg-slate-100 px-1.5 py-0.2 rounded">
                            {gear.quantity}x
                          </span>
                        </div>
                      ))}

                      {pkg.includedGear.length > 4 && (
                        <button
                          type="button"
                          onClick={() => setSelectedPackageForDetail(pkg)}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 block pt-1 text-left cursor-pointer"
                        >
                          + {pkg.includedGear.length - 4} item tambahan lainnya...
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Recommendation pill */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                      Rekomendasi Jalur / Gunung:
                    </div>
                    <div className="text-xs text-slate-700 font-medium bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-start gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{pkg.recommendedFor}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedPackageForDetail(pkg)}
                    className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Rincian Alat
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectPackageForRental(pkg)}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Sewa Paket</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Package Detail Modal */}
      {selectedPackageForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] text-xs">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <PackageCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">
                    Detail Isi Perlengkapan Paket
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-white">
                    {selectedPackageForDetail.name}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPackageForDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/60">
              {/* Pricing & Savings */}
              <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-blue-600 font-bold uppercase">
                    Harga Sewa Paket ({selectedPackageForDetail.targetPerson})
                  </div>
                  <div className="text-lg font-black text-blue-900">
                    {formatRupiah(selectedPackageForDetail.pricePerDay)}
                    <span className="text-xs font-normal text-slate-500"> /hari</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 line-through">
                    {formatRupiah(selectedPackageForDetail.originalPricePerDay)}
                  </div>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Hemat {formatRupiah(selectedPackageForDetail.originalPricePerDay - selectedPackageForDetail.pricePerDay)} /hari
                  </span>
                </div>
              </div>

              {/* Highlights */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                  Keunggulan Paket Ini:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                  {selectedPackageForDetail.highlightFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complete Items Table */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
                    Daftar Alat Lengkap ({selectedPackageForDetail.includedGear.reduce((a, b) => a + b.quantity, 0)} Unit)
                  </span>
                  <span className="text-[10px] text-slate-400">Semua alat siap pakai</span>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {selectedPackageForDetail.includedGear.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-800">{item.name}</div>
                          <div className="text-[10px] text-slate-400">
                            Kode: {item.gearCode} • Kategori: {item.itemCategory}
                          </div>
                        </div>
                      </div>

                      <span className="font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg text-xs">
                        {item.quantity} Unit
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                  Direkomendasikan untuk Pendakian:
                </span>
                <p className="text-slate-700 font-medium leading-relaxed">
                  {selectedPackageForDetail.recommendedFor}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 gap-3">
              <button
                type="button"
                onClick={() => setSelectedPackageForDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={() => {
                  const pkg = selectedPackageForDetail;
                  setSelectedPackageForDetail(null);
                  onSelectPackageForRental(pkg);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md flex items-center gap-2"
              >
                <span>Sewa Paket Ini (Buka Nota)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
