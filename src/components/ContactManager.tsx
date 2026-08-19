import React, { useState, useMemo } from 'react';
import { Plus, Search, User, Briefcase, Phone, MessageSquare, MapPin, X, Edit, Trash2 } from 'lucide-react';
import { Customer, Supplier } from '../types';
import { toBengaliNumber } from '../utils';

interface ContactManagerProps {
  customers: Customer[];
  suppliers: Supplier[];
  onAddCustomer: (customer: Omit<Customer, 'id'>) => void;
  onAddSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  onUpdateCustomer?: (id: string, customer: Omit<Customer, 'id'>) => void;
  onDeleteCustomer?: (id: string) => void;
  onUpdateSupplier?: (id: string, supplier: Omit<Supplier, 'id'>) => void;
  onDeleteSupplier?: (id: string) => void;
}

export default function ContactManager({
  customers,
  suppliers,
  onAddCustomer,
  onAddSupplier,
  onUpdateCustomer,
  onDeleteCustomer,
  onUpdateSupplier,
  onDeleteSupplier
}: ContactManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'customer' | 'supplier'>('customer');
  const [search, setSearch] = useState('');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Forms states
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [itemType, setItemType] = useState('');

  const handleEditCustomerClick = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setMobile(c.mobile);
    setAddress(c.address || '');
    setIsAddCustomerOpen(true);
  };

  const handleEditSupplierClick = (s: Supplier) => {
    setEditingSupplier(s);
    setName(s.name);
    setMobile(s.mobile);
    setItemType(s.itemType || '');
    setIsAddSupplierOpen(true);
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search) ||
      c.address.toLowerCase().includes(search.toLowerCase())
    );
  }, [customers, search]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.mobile.includes(search) ||
      s.itemType.toLowerCase().includes(search.toLowerCase())
    );
  }, [suppliers, search]);

  const handleSubmitCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) return;
    const payload = { name: name.trim(), mobile: mobile.trim(), address: address.trim() };
    if (editingCustomer && onUpdateCustomer) {
      onUpdateCustomer(editingCustomer.id, payload);
    } else {
      onAddCustomer(payload);
    }
    setName('');
    setMobile('');
    setAddress('');
    setEditingCustomer(null);
    setIsAddCustomerOpen(false);
  };

  const handleSubmitSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) return;
    const payload = { name: name.trim(), mobile: mobile.trim(), itemType: itemType.trim() };
    if (editingSupplier && onUpdateSupplier) {
      onUpdateSupplier(editingSupplier.id, payload);
    } else {
      onAddSupplier(payload);
    }
    setName('');
    setMobile('');
    setItemType('');
    setEditingSupplier(null);
    setIsAddSupplierOpen(false);
  };

  // Helper to trigger WhatsApp link
  const getWhatsAppLink = (mobileNumber: string) => {
    // clean number
    let cleaned = mobileNumber.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '88' + cleaned; // default BD prefix
    }
    return `https://wa.me/${cleaned}`;
  };

  return (
    <div className="space-y-8" id="contacts-manager-tab">
      
      {/* Tab Header Action Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <h2 className="text-2xl font-black uppercase italic text-black">যোগাযোগ ডিরেক্টরি (Contact Directory)</h2>
          <p className="text-sm font-bold text-slate-700 mt-1">কাস্টমার ও মালামাল সরবরাহকারীদের ডাটাবেস। এক ক্লিকে কল বা হোয়াটসঅ্যাপ করুন।</p>
        </div>
        <button
          id={`add-contact-${activeSubTab}`}
          onClick={() => {
            if (activeSubTab === 'customer') {
              setEditingCustomer(null);
              setName('');
              setMobile('');
              setAddress('');
              setIsAddCustomerOpen(true);
            } else {
              setEditingSupplier(null);
              setName('');
              setMobile('');
              setItemType('');
              setIsAddSupplierOpen(true);
            }
          }}
          className="neo-btn neo-btn-primary px-4 py-2 text-sm flex items-center gap-1.5"
        >
          <Plus size={16} className="stroke-[2.5]" />
          {activeSubTab === 'customer' ? 'নতুন কাস্টমার যোগ করুন' : 'নতুন সরবরাহকারী যোগ করুন'}
        </button>
      </div>

      {/* Sub tabs navigation */}
      <div className="flex border-b-4 border-black gap-2 mt-4" id="contacts-toggle-tabs">
        <button
          id="toggle-customers-tab"
          onClick={() => { setActiveSubTab('customer'); setSearch(''); }}
          className={`px-4 py-2 font-black text-xs uppercase tracking-wider border-x-3 border-t-3 border-black transition cursor-pointer relative -bottom-[4px] ${
            activeSubTab === 'customer' 
              ? 'bg-yellow-400 text-black' 
              : 'bg-white text-slate-600 hover:text-black border-b-3 border-b-black'
          }`}
        >
          গ্রাহক তালিকা ({toBengaliNumber(customers.length)} জন)
        </button>
        <button
          id="toggle-suppliers-tab"
          onClick={() => { setActiveSubTab('supplier'); setSearch(''); }}
          className={`px-4 py-2 font-black text-xs uppercase tracking-wider border-x-3 border-t-3 border-black transition cursor-pointer relative -bottom-[4px] ${
            activeSubTab === 'supplier' 
              ? 'bg-yellow-400 text-black' 
              : 'bg-white text-slate-600 hover:text-black border-b-3 border-b-black'
          }`}
        >
          সরবরাহকারী তালিকা ({toBengaliNumber(suppliers.length)} জন)
        </button>
      </div>

      {/* Search Input Filter */}
      <div className="relative" id="contacts-search-panel">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black stroke-[2.5]" size={18} />
        <input
          id="contact-search-input"
          type="text"
          placeholder={activeSubTab === 'customer' ? 'নাম, মোবাইল বা ঠিকানা লিখে কাস্টমার খুঁজুন...' : 'নাম, মোবাইল বা মালামালের ধরন লিখে সরবরাহকারী খুঁজুন...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border-3 border-black rounded-none text-sm text-black font-bold focus:outline-none focus:bg-yellow-50"
        />
      </div>

      {/* Data Cards Grid for modern contact-book layout */}
      {activeSubTab === 'customer' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn" id="customers-grid">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-full py-10 text-center text-sm font-bold text-black uppercase">
              কোন কাস্টমার পাওয়া যায়নি।
            </div>
          ) : (
            filteredCustomers.map(c => (
              <div key={c.id} className="neo-card p-5 flex flex-col justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-yellow-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <User size={18} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-black">{c.name}</h4>
                        <p className="text-xs font-black text-slate-700 font-mono mt-0.5">{toBengaliNumber(c.mobile)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleEditCustomerClick(c)}
                        className="p-1.5 border-2 border-black bg-white hover:bg-yellow-400 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                        title="সম্পাদনা করুন"
                      >
                        <Edit size={11} className="stroke-[2.5]" />
                      </button>
                      {onDeleteCustomer && (
                        <button
                          onClick={() => onDeleteCustomer(c.id)}
                          className="p-1.5 border-2 border-black bg-red-100 hover:bg-red-500 hover:text-white text-red-700 transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={11} className="stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  </div>
                  {c.address && (
                    <p className="text-xs text-slate-800 font-bold flex items-start gap-1">
                      <MapPin size={12} className="text-black shrink-0 mt-0.5 stroke-[2.5]" />
                      {c.address}
                    </p>
                  )}
                </div>

                {/* Directory call buttons */}
                <div className="flex gap-2 mt-5 border-t-2 border-black pt-3">
                  <a
                    id={`dial-${c.mobile}`}
                    href={`tel:${c.mobile}`}
                    className="flex-1 py-1.5 bg-white text-black border-2 border-black font-black text-[10px] uppercase italic text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-100"
                  >
                    <Phone size={12} className="inline mr-1 stroke-[2.5]" />
                    সরাসরি কল
                  </a>
                  <a
                    id={`wa-${c.mobile}`}
                    href={getWhatsAppLink(c.mobile)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 bg-emerald-400 text-black border-2 border-black font-black text-[10px] uppercase italic text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-500"
                  >
                    <MessageSquare size={12} className="inline mr-1 stroke-[2.5]" />
                    হোয়াটসঅ্যাপ
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn" id="suppliers-grid">
          {filteredSuppliers.length === 0 ? (
            <div className="col-span-full py-10 text-center text-sm font-bold text-black uppercase">
              কোন সরবরাহকারী পাওয়া যায়নি।
            </div>
          ) : (
            filteredSuppliers.map(s => (
              <div key={s.id} className="neo-card p-5 flex flex-col justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Briefcase size={18} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-black">{s.name}</h4>
                        <p className="text-xs font-black text-slate-700 font-mono mt-0.5">{toBengaliNumber(s.mobile)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleEditSupplierClick(s)}
                        className="p-1.5 border-2 border-black bg-white hover:bg-yellow-400 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                        title="সম্পাদনা করুন"
                      >
                        <Edit size={11} className="stroke-[2.5]" />
                      </button>
                      {onDeleteSupplier && (
                        <button
                          onClick={() => onDeleteSupplier(s.id)}
                          className="p-1.5 border-2 border-black bg-red-100 hover:bg-red-500 hover:text-white text-red-700 transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={11} className="stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-600 block uppercase">মালামালের ক্যাটাগরি:</span>
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-indigo-100 text-black border-2 border-black text-xs font-black shadow-[1px_1px_0px_0px_#000000]">
                      {s.itemType}
                    </span>
                  </div>
                </div>

                {/* Directory call buttons */}
                <div className="flex gap-2 mt-5 border-t-2 border-black pt-3">
                  <a
                    id={`dial-sup-${s.mobile}`}
                    href={`tel:${s.mobile}`}
                    className="flex-1 py-1.5 bg-white text-black border-2 border-black font-black text-[10px] uppercase italic text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-100"
                  >
                    <Phone size={12} className="inline mr-1 stroke-[2.5]" />
                    সরাসরি কল
                  </a>
                  <a
                    id={`wa-sup-${s.mobile}`}
                    href={getWhatsAppLink(s.mobile)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 bg-emerald-400 text-black border-2 border-black font-black text-[10px] uppercase italic text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-500"
                  >
                    <MessageSquare size={12} className="inline mr-1 stroke-[2.5]" />
                    হোয়াটসঅ্যাপ
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="customer-modal">
          <div className="bg-white border-4 border-black p-6 relative max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <button 
              onClick={() => {
                setIsAddCustomerOpen(false);
                setEditingCustomer(null);
                setName('');
                setMobile('');
                setAddress('');
              }}
              className="absolute right-4 top-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>

            <h3 className="text-lg font-black uppercase italic text-black mb-4 border-b-3 border-black pb-3">
              {editingCustomer ? 'কাস্টমার তথ্য পরিবর্তন' : 'নতুন কাস্টমার যোগ করুন'}
            </h3>

            <form onSubmit={handleSubmitCustomer} className="space-y-4 text-xs font-bold text-black">
              <div>
                <label className="text-xs font-black uppercase text-slate-600 block mb-1">কাস্টমারের নাম</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: আরশাদ খান"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-600 block mb-1">মোবাইল নম্বর</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: 01711223344"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-600 block mb-1">ঠিকানা</label>
                <textarea
                  placeholder="কাস্টমারের সম্পূর্ণ ঠিকানা..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50 h-20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t-3 border-black pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddCustomerOpen(false);
                    setEditingCustomer(null);
                    setName('');
                    setMobile('');
                    setAddress('');
                  }}
                  className="px-4 py-2 bg-white text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-yellow-500 cursor-pointer"
                >
                  {editingCustomer ? 'আপডেট করুন' : 'কাস্টমার সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {isAddSupplierOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="supplier-modal">
          <div className="bg-white border-4 border-black p-6 relative max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <button 
              onClick={() => {
                setIsAddSupplierOpen(false);
                setEditingSupplier(null);
                setName('');
                setMobile('');
                setItemType('');
              }}
              className="absolute right-4 top-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>

            <h3 className="text-lg font-black uppercase italic text-black mb-4 border-b-3 border-black pb-3">
              {editingSupplier ? 'সরবরাহকারী তথ্য পরিবর্তন' : 'নতুন সরবরাহকারী যোগ করুন'}
            </h3>

            <form onSubmit={handleSubmitSupplier} className="space-y-4 text-xs font-bold text-black">
              <div>
                <label className="text-xs font-black uppercase text-slate-600 block mb-1">সরবরাহকারী প্রতিষ্ঠানের নাম</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: নিউ শাহবাগ ফ্লাওয়ার কোম্পানি"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-600 block mb-1">মোবাইল নম্বর</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: 01511223344"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-600 block mb-1">কোন ধরণের মালামাল সরবরাহ করেন</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: কৃত্রিম ফুল, মেটাল ফ্রেম, লাইটিং তার"
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                />
              </div>

              <div className="flex justify-end gap-3 border-t-3 border-black pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddSupplierOpen(false);
                    setEditingSupplier(null);
                    setName('');
                    setMobile('');
                    setItemType('');
                  }}
                  className="px-4 py-2 bg-white text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-yellow-500 cursor-pointer"
                >
                  {editingSupplier ? 'আপডেট করুন' : 'সরবরাহকারী সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
