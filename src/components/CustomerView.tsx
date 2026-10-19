import React, { useState } from 'react';
import { Customer, RentalOrder } from '../types';
import { Search, UserPlus, Phone, ShieldCheck, MessageCircle, FileText, X, Users } from 'lucide-react';
import { playSound } from '../utils/sound';

interface CustomerViewProps {
  customers: Customer[];
  orders: RentalOrder[];
  onAddCustomer: (customer: Customer) => void;
  onFilterOrdersByCustomer: (customerName: string) => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  customers,
  orders,
  onAddCustomer,
  onFilterOrdersByCustomer,
}) => {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newIdType, setNewIdType] = useState<'KTP' | 'SIM' | 'KTM'>('KTP');
  const [newIdNumber, setNewIdNumber] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.idNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    const customer: Customer = {
      id: `cust-${Date.now()}`,
      name: newName,
      phone: newPhone,
      idType: newIdType,
      idNumber: newIdNumber || `${newIdType}-${Date.now().toString().slice(-6)}`,
      address: newAddress || 'Yogyakarta',
      totalRentals: 0,
      status: 'Aktif',
      lastRentalDate: '-',
    };

    onAddCustomer(customer);
    playSound('beep');
    setIsAddOpen(false);
    setNewName('');
    setNewPhone('');
    setNewIdNumber('');
    setNewAddress('');
  };

  return (
    <div className="space-y-3.5 pb-8">
      {/* Header Banner */}
      <div className="p-3.5 sm:p-4 bg-white text-slate-800 rounded-2xl flex items-center justify-between border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-600">
              Database Penyewa & Jaminan
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900">
              Data Pelanggan Outdoor
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Tambah Pelanggan</span>
        </button>
      </div>

      {/* Top Bar Floating Panel */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-3.5 shadow-[0_8px_20px_rgba(15,23,42,0.06)] flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama, no HP, atau no KTP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pelanggan Baru</span>
        </button>
      </div>

      {/* Customers List */}
      {filtered.length === 0 ? (
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-8 text-center space-y-3 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <UserPlus className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Belum Ada Data Pelanggan</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-0.5">
              Data pelanggan masih kosong. Pelanggan baru akan otomatis tersimpan saat Anda membuat nota sewa baru, atau Anda bisa menambahkannya sekarang.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pelanggan Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((customer) => {
            const customerOrders = orders.filter((o) => o.customerName === customer.name);
            const activeRental = customerOrders.find((o) => o.itemStatus === 'Belum Kembali');

            let cleanPhone = customer.phone.replace(/[^0-9]/g, '');
            if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.substring(1);

            return (
              <div
                key={customer.id}
                className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_30px_rgba(15,23,42,0.1)] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {customer.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{customer.phone}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        customer.status === 'Langganan'
                          ? 'bg-purple-100 text-purple-700'
                          : customer.status === 'Blacklist'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {customer.status}
                    </span>
                  </div>

                  <div className="mt-3 p-2.5 bg-slate-50 rounded-xl space-y-1 text-[11px] text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Identitas:</span>
                      <span className="font-bold text-slate-800">
                        {customer.idType} ({customer.idNumber})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Alamat:</span>
                      <span className="font-medium text-slate-800 truncate max-w-[170px]">
                        {customer.address}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Pernah Sewa:</span>
                      <span className="font-bold text-blue-600">
                        {customerOrders.length || customer.totalRentals} Transaksi
                      </span>
                    </div>
                    {activeRental && (
                      <div className="pt-1 border-t border-slate-200 flex justify-between text-rose-600 font-bold">
                        <span>Status Saat Ini:</span>
                        <span>Sedang Sewa (#{activeRental.orderNumber})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={`https://wa.me/${cleanPhone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-emerald-200"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat WA</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => onFilterOrdersByCustomer(customer.name)}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Lihat Nota</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
            <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-300">
                    Form Registrasi
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-white">
                    Tambah Pelanggan Baru
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-4 sm:p-5 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-500 uppercase block mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama sesuai KTP"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase block mb-1">No. WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="08123456789"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-500 uppercase block mb-1">Jenis Identitas</label>
                  <select
                    value={newIdType}
                    onChange={(e) => setNewIdType(e.target.value as 'KTP' | 'SIM' | 'KTM')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-medium text-slate-900"
                  >
                    <option value="KTP">KTP</option>
                    <option value="SIM">SIM</option>
                    <option value="KTM">KTM</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-500 uppercase block mb-1">Nomor Identitas</label>
                  <input
                    type="text"
                    placeholder="3304..."
                    value={newIdNumber}
                    onChange={(e) => setNewIdNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase block mb-1">Alamat Domisili</label>
                <input
                  type="text"
                  placeholder="Kelurahan / Kecamatan, Kota"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-medium text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-sm"
                >
                  Simpan Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
