import React, { useState, useMemo } from 'react';
import { Plus, Search, Calendar, RefreshCcw, FileText, CheckCircle2, Printer, X, Trash, Edit, Trash2 } from 'lucide-react';
import { StockItem, Customer, RentalOutEntry, RentalReturnEntry, DamageEntry } from '../types';
import { formatCurrency, toBengaliNumber } from '../utils';

interface RentalTrackerProps {
  rentals: RentalOutEntry[];
  stockItems: StockItem[];
  customers: Customer[];
  onAddRental: (rental: Omit<RentalOutEntry, 'id'>) => void;
  onRecordReturn: (rentalOutId: string, returnedQty: number, damageQty: number, date: string, note: string) => void;
  onUpdateRental?: (id: string, rental: Omit<RentalOutEntry, 'id'>) => void;
  onDeleteRental?: (id: string) => void;
  autoOpenAdd?: boolean;
  onCloseAutoOpen?: () => void;
  preselectedItemCode?: string | null;
}

export default function RentalTracker({
  rentals,
  stockItems,
  customers,
  onAddRental,
  onRecordReturn,
  onUpdateRental,
  onDeleteRental,
  autoOpenAdd,
  onCloseAutoOpen,
  preselectedItemCode
}: RentalTrackerProps) {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeReturnRental, setActiveReturnRental] = useState<RentalOutEntry | null>(null);
  const [activeInvoice, setActiveInvoice] = useState<RentalOutEntry | null>(null);
  const [editingRental, setEditingRental] = useState<RentalOutEntry | null>(null);

  // Rental Out form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [itemCode, setItemCode] = useState(stockItems[0]?.code || '');
  const [qty, setQty] = useState(0);
  const [rentalPrice, setRentalPrice] = useState(0);
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedReturnDate, setExpectedReturnDate] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 5);
    return nextWeek.toISOString().split('T')[0];
  });
  const [paidAmount, setPaidAmount] = useState(0);
  const [note, setNote] = useState('');

  // Rental Return form states (Inside Modal)
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [returningQty, setReturningQty] = useState(0);
  const [damagedQty, setDamagedQty] = useState(0);
  const [returnNote, setReturnNote] = useState('');

  // Handle Auto Open on tab switch or navigation
  React.useEffect(() => {
    if (autoOpenAdd && stockItems.length > 0 && customers.length > 0) {
      const codeToUse = preselectedItemCode || stockItems[0].code;
      const targetItem = stockItems.find(i => i.code === codeToUse) || stockItems[0];
      
      setItemCode(targetItem.code);
      setRentalPrice(targetItem.rentalPrice);
      setCustomerId(customers[0].id);
      setQty(1);
      setPaidAmount(0);
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
      setEventDate(new Date().toISOString().split('T')[0]);
      
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 5);
      setExpectedReturnDate(nextWeek.toISOString().split('T')[0]);
      
      setEditingRental(null);
      setIsAddOpen(true);
      if (onCloseAutoOpen) {
        onCloseAutoOpen();
      }
    }
  }, [autoOpenAdd, stockItems, customers, preselectedItemCode, onCloseAutoOpen]);

  const handleEditClick = (r: RentalOutEntry) => {
    setEditingRental(r);
    setDate(r.date || '');
    setCustomerId(r.customerId || '');
    setItemCode(r.itemCode || '');
    setQty(r.qty || 0);
    setRentalPrice(r.rentalPrice || 0);
    setEventDate(r.eventDate || '');
    setExpectedReturnDate(r.expectedReturnDate || '');
    setPaidAmount(r.paidAmount || 0);
    setNote(r.note || '');
    setIsAddOpen(true);
  };

  // Automatically update rental rate when item changes
  const handleItemChange = (code: string) => {
    setItemCode(code);
    const item = stockItems.find(i => i.code === code);
    if (item) {
      setRentalPrice(item.rentalPrice);
    }
  };

  // Filter rentals
  const filteredRentals = useMemo(() => {
    return rentals.filter(r => {
      const item = stockItems.find(i => i.code === r.itemCode);
      const customer = customers.find(c => c.id === r.customerId);
      const matchSearch = r.itemCode.toLowerCase().includes(search.toLowerCase()) ||
                          (item && item.name.toLowerCase().includes(search.toLowerCase())) ||
                          (customer && customer.name.toLowerCase().includes(search.toLowerCase())) ||
                          r.status.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [rentals, stockItems, customers, search]);

  // Aggregate stats
  const rentedOutValueSum = useMemo(() => {
    return filteredRentals.reduce((sum, r) => sum + r.totalBill, 0);
  }, [filteredRentals]);

  const advancePaidSum = useMemo(() => {
    return filteredRentals.reduce((sum, r) => sum + r.paidAmount, 0);
  }, [filteredRentals]);

  const rentalDueSum = useMemo(() => {
    return filteredRentals.reduce((sum, r) => sum + r.dueAmount, 0);
  }, [filteredRentals]);

  const currentlyOutCount = useMemo(() => {
    return filteredRentals.reduce((sum, r) => sum + (r.qty - r.returnedQty), 0);
  }, [filteredRentals]);

  const handleSubmitOut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCode || qty <= 0 || rentalPrice <= 0 || !customerId) {
      alert('অনুগ্রহ করে সঠিক তথ্য প্রদান করুন!');
      return;
    }

    const total = Number(qty) * Number(rentalPrice);
    const due = Math.max(0, total - Number(paidAmount));

    const payload = {
      date,
      customerId,
      itemCode,
      qty: Number(qty),
      rentalPrice: Number(rentalPrice),
      eventDate,
      expectedReturnDate,
      returnedQty: editingRental ? editingRental.returnedQty : 0,
      totalBill: total,
      paidAmount: Number(paidAmount),
      dueAmount: due,
      status: editingRental ? editingRental.status : ('Rented' as 'Rented' | 'Returned' | 'Partially Returned'),
      damageQty: editingRental ? editingRental.damageQty : 0,
      note: note.trim()
    };

    if (editingRental && onUpdateRental) {
      onUpdateRental(editingRental.id, payload);
    } else {
      onAddRental(payload);
    }

    // Reset Form
    setQty(0);
    setPaidAmount(0);
    setNote('');
    setEditingRental(null);
    setIsAddOpen(false);
  };

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReturnRental) return;

    const remainingToReturn = activeReturnRental.qty - activeReturnRental.returnedQty;
    if (returningQty <= 0) {
      alert('ফেরত দেওয়ার পরিমাণ শূন্যের বেশি হতে হবে!');
      return;
    }
    if (returningQty > remainingToReturn) {
      alert(`দুঃখিত! আপনি সর্বোচ্চ ${toBengaliNumber(remainingToReturn)} টি আইটেম ফেরত নিতে পারবেন।`);
      return;
    }
    if (damagedQty > returningQty) {
      alert('ক্ষতিগ্রস্ত সামগ্রীর সংখ্যা মোট ফেরত সামগ্রীর চেয়ে বেশি হতে পারে না!');
      return;
    }

    onRecordReturn(
      activeReturnRental.id,
      Number(returningQty),
      Number(damagedQty),
      returnDate,
      returnNote.trim()
    );

    // Reset return states
    setActiveReturnRental(null);
    setReturningQty(0);
    setDamagedQty(0);
    setReturnNote('');
  };

  return (
    <div className="space-y-8" id="rental-tracker-tab">
      
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <h2 className="text-2xl font-black uppercase italic text-black">ভাড়া ও ফেরত ট্র্যাকিং (Rental Out & Return)</h2>
          <p className="text-sm font-bold text-slate-700 mt-1">কাস্টমারদের কাছে ভাড়া দেওয়া মাল, ফেরার তারিখ, অগ্রিম ও বকেয়া বিল আদায়ের খতিয়ান।</p>
        </div>
        <button
          id="add-rental-btn"
          onClick={() => {
            if (stockItems.length === 0) {
              alert('অনুগ্রহ করে আগে স্টক তালিকায় আইটেম যোগ করুন!');
              return;
            }
            if (customers.length === 0) {
              alert('অনুগ্রহ করে আগে অন্ততঃ একজন কাস্টমার যোগ করুন! "কাস্টমার ও সরবরাহকারী" ট্যাব থেকে কাস্টমার যোগ করা যাবে।');
              return;
            }
            const defaultItem = stockItems[0];
            setItemCode(defaultItem.code);
            setRentalPrice(defaultItem.rentalPrice);
            setCustomerId(customers[0].id);
            setQty(1);
            setPaidAmount(0);
            setNote('');
            setDate(new Date().toISOString().split('T')[0]);
            setEventDate(new Date().toISOString().split('T')[0]);
            
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 5);
            setExpectedReturnDate(nextWeek.toISOString().split('T')[0]);
            
            setEditingRental(null);
            setIsAddOpen(true);
          }}
          className="neo-btn neo-btn-primary px-4 py-2 text-sm flex items-center gap-1.5"
        >
          <Plus size={16} className="stroke-[2.5]" />
          ভাড়ায় নতুন মাল দিন
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="rental-stats">
        
        {/* Total Rent Bills */}
        <div className="neo-card p-5 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
          <div>
            <span className="text-slate-600 text-xs font-black uppercase tracking-wider block">মোট ভাড়া বিল</span>
            <span className="text-2xl font-black text-teal-600 block mt-1">
              {formatCurrency(rentedOutValueSum)}
            </span>
            <span className="text-xs text-black font-black mt-1 block">নিবন্ধিত ভাড়া বুকিং</span>
          </div>
          <div className="w-11 h-11 border-3 border-black bg-teal-400 flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <FileText size={20} className="stroke-[2.5]" />
          </div>
        </div>

        {/* Total Advance Paid */}
        <div className="neo-card p-5 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
          <div>
            <span className="text-slate-600 text-xs font-black uppercase tracking-wider block">মোট অগ্রিম আদায়</span>
            <span className="text-2xl font-black text-emerald-600 block mt-1">
              {formatCurrency(advancePaidSum)}
            </span>
            <span className="text-xs text-black font-black mt-1 block">বুকিং অগ্রিম নগদ</span>
          </div>
          <div className="w-11 h-11 border-3 border-black bg-emerald-400 flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <CheckCircle2 size={20} className="stroke-[2.5]" />
          </div>
        </div>

        {/* Total Due */}
        <div className="neo-card p-5 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
          <div>
            <span className="text-slate-600 text-xs font-black uppercase tracking-wider block">ভাড়া বকেয়া (Due)</span>
            <span className="text-2xl font-black text-rose-600 block mt-1">
              {formatCurrency(rentalDueSum)}
            </span>
            <span className="text-xs text-rose-600 font-black mt-1 block uppercase">আদায়যোগ্য ভাড়া বকেয়া</span>
          </div>
          <div className="w-11 h-11 border-3 border-black bg-rose-400 flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <X size={20} className="stroke-[2.5]" />
          </div>
        </div>

        {/* Out items */}
        <div className="neo-card p-5 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 col-span-2 lg:col-span-1">
          <div>
            <span className="text-slate-600 text-xs font-black uppercase tracking-wider block">বাইরে থাকা মালামাল</span>
            <span className="text-2xl font-black text-amber-600 block mt-1 font-mono tracking-tighter">
              {toBengaliNumber(currentlyOutCount)} টি
            </span>
            <span className="text-xs text-slate-500 font-bold mt-1 block">ফেরত আসা এখনো বাকি</span>
          </div>
          <div className="w-11 h-11 border-3 border-black bg-amber-400 flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <RefreshCcw size={20} className="stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="relative" id="rental-search-panel">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black stroke-[2.5]" size={18} />
        <input
          id="rental-search-input"
          type="text"
          placeholder="মালামাল কোড, নাম, কাস্টমার বা স্ট্যাটাস (Rented, Returned) লিখে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border-3 border-black rounded-none text-sm text-black font-bold focus:outline-none focus:bg-yellow-50"
        />
      </div>

      {/* Active Rental Out Table */}
      <div className="neo-card overflow-hidden" id="rental-history-table">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="rental-table">
            <thead>
              <tr className="bg-slate-100 border-b-3 border-black text-black text-xs font-black uppercase tracking-wider">
                <th className="py-4 px-4 border-r border-black/10">তারিখ</th>
                <th className="py-4 px-4 border-r border-black/10">কাস্টমার</th>
                <th className="py-4 px-4 border-r border-black/10">আইটেম কোড ও নাম</th>
                <th className="py-4 px-4 border-r border-black/10 text-center">পরিমাণ (বাইরে/মোট)</th>
                <th className="py-4 px-4 border-r border-black/10 text-right">ভাড়া রেট (৳)</th>
                <th className="py-4 px-4 border-r border-black/10 text-right">মোট বিল (৳)</th>
                <th className="py-4 px-4 border-r border-black/10 text-right">বকেয়া (৳)</th>
                <th className="py-4 px-4 border-r border-black/10 text-center">ফেরত ডেট</th>
                <th className="py-4 px-4 border-r border-black/10 text-center">অবস্থা</th>
                <th className="py-4 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filteredRentals.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-sm font-bold text-black uppercase">
                    কোন ভাড়ার রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredRentals.map(r => {
                  const item = stockItems.find(i => i.code === r.itemCode);
                  const customer = customers.find(c => c.id === r.customerId);
                  const remaining = r.qty - r.returnedQty;

                  return (
                    <tr key={r.id} className="border-b-2 border-black/10 hover:bg-yellow-50/50 transition">
                      <td className="py-4 px-4 border-r border-black/10 text-xs font-black text-slate-700 font-mono">
                        {toBengaliNumber(r.date)}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-sm font-black text-black">
                        {customer ? customer.name : 'অজানা গ্রাহক'}
                        <span className="block text-[10px] text-slate-500 font-bold font-mono">{customer?.mobile}</span>
                      </td>
                      <td className="py-4 px-4 border-r border-black/10">
                        <span className="px-2 py-0.5 bg-black text-white text-[10px] font-mono font-black uppercase mr-1">{r.itemCode}</span>
                        <span className="text-sm font-black text-black">{item ? item.name : 'অজানা সামগ্রী'}</span>
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-center font-mono">
                        <span className="text-sm font-black text-black">
                          {toBengaliNumber(remaining)}
                        </span>
                        <span className="text-xs text-slate-500 font-black"> / {toBengaliNumber(r.qty)} {item?.unit || 'পিস'}</span>
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-right font-black text-slate-700 font-sans">
                        {formatCurrency(r.rentalPrice)}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-right font-black text-black font-sans">
                        {formatCurrency(r.totalBill)}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-right font-black text-rose-600 font-sans">
                        {formatCurrency(r.dueAmount)}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-center text-xs font-black text-slate-700 font-mono">
                        {toBengaliNumber(r.expectedReturnDate)}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-center">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 border-2 border-black ${
                          r.status === 'Returned' 
                            ? 'bg-emerald-300 text-black shadow-[1px_1px_0px_0px_#000000]' 
                            : r.status === 'Partial'
                            ? 'bg-amber-300 text-black shadow-[1px_1px_0px_0px_#000000]'
                            : 'bg-rose-300 text-black shadow-[1px_1px_0px_0px_#000000]'
                        }`}>
                          {r.status === 'Returned' ? 'ফেরত এসেছে' : r.status === 'Partial' ? 'আংশিক ফেরত' : 'ভাড়ায় সচল'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {remaining > 0 && (
                            <button
                              id={`return-rent-${r.id}`}
                              onClick={() => {
                                setActiveReturnRental(r);
                                setReturningQty(remaining);
                                setDamagedQty(0);
                              }}
                              className="px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-black border-2 border-black font-black uppercase text-[10px] shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                              title="মালামাল ফেরত নিন"
                            >
                              ফেরত দিন
                            </button>
                          )}
                          <button
                            id={`invoice-rent-${r.id}`}
                            onClick={() => setActiveInvoice(r)}
                            className="p-1 border-2 border-black bg-white hover:bg-slate-100 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                            title="ইনভয়েস মেমো"
                          >
                            <Printer size={13} className="stroke-[2.5]" />
                          </button>
                          <button
                            onClick={() => handleEditClick(r)}
                            className="p-1 border-2 border-black bg-white hover:bg-yellow-400 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                            title="সম্পাদনা করুন"
                          >
                            <Edit size={13} className="stroke-[2.5]" />
                          </button>
                          {onDeleteRental && (
                            <button
                              onClick={() => onDeleteRental(r.id)}
                              className="p-1 border-2 border-black bg-red-100 hover:bg-red-500 hover:text-white text-red-700 transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 size={13} className="stroke-[2.5]" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📥 Rental OUT Form Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="rental-out-modal">
          <div className="bg-white border-4 border-black p-6 relative max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <button 
              onClick={() => {
                setIsAddOpen(false);
                setEditingRental(null);
              }}
              className="absolute right-4 top-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>

            <h3 className="text-lg font-black uppercase italic text-black mb-4 border-b-3 border-black pb-3">
              {editingRental ? 'ভাড়া তথ্য পরিবর্তন (Edit)' : 'ডেকোরেশন সামগ্রী ভাড়া দিন'}
            </h3>

            <form onSubmit={handleSubmitOut} className="space-y-4 text-xs font-bold text-black">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">তারিখ</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">কাস্টমার (Customer)</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.mobile})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">মালামাল কোড (Item)</label>
                  <select
                    value={itemCode}
                    onChange={(e) => handleItemChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none"
                  >
                    {stockItems.map(item => (
                      <option key={item.code} value={item.code}>
                        {item.code} - {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">ভাড়া দেওয়ার পরিমাণ</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={qty || ''}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">ইভেন্ট ডেট (Event Date)</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">সম্ভাব্য ফেরত ডেট (Expected Return)</label>
                  <input
                    type="date"
                    required
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">ভাড়া রেট (৳ - দৈনিক)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={rentalPrice || ''}
                    onChange={(e) => setRentalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">অগ্রিম পরিশোধ বা পেইড (৳)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={paidAmount || ''}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-600 block mb-1">মন্তব্য / অনুষ্ঠানের লোকেশন</label>
                <textarea
                  placeholder="যেমন: ধানমন্ডি ইম্পেরিয়াল কনভেনশন সেন্টার গেট..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50 h-16 resize-none"
                />
              </div>

              {/* Pricing breakdown summary */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-black border-2 border-black bg-yellow-50 p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="p-1">
                  <span className="block text-[10px] text-slate-600 uppercase">মোট ভাড়া বিল</span>
                  <span className="text-sm block mt-0.5 text-black font-sans font-black">{formatCurrency(qty * rentalPrice)}</span>
                </div>
                <div className="p-1">
                  <span className="block text-[10px] text-slate-600 uppercase">অগ্রিম সংগৃহীত</span>
                  <span className="text-sm block mt-0.5 text-emerald-600 font-sans font-black">{formatCurrency(paidAmount)}</span>
                </div>
                <div className="p-1">
                  <span className="block text-[10px] text-slate-600 uppercase">বকেয়া পরিমাণ</span>
                  <span className="text-sm block mt-0.5 text-rose-600 font-sans font-black">{formatCurrency(Math.max(0, (qty * rentalPrice) - paidAmount))}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t-3 border-black pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingRental(null);
                  }}
                  className="px-4 py-2 bg-white text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-yellow-500 cursor-pointer"
                >
                  {editingRental ? 'আপডেট করুন' : 'ভাড়া নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📥 Record RETURN Form Modal */}
      {activeReturnRental && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="rental-return-modal">
          <div className="bg-white border-4 border-black p-6 relative max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <button 
              onClick={() => setActiveReturnRental(null)}
              className="absolute right-4 top-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>

            <h3 className="text-lg font-black uppercase italic text-black mb-4 border-b-3 border-black pb-3 flex items-center gap-1.5">
              <RefreshCcw size={18} className="text-yellow-500 stroke-[2.5]" />
              মালামাল ফেরত নিন (Rental Return)
            </h3>

            <form onSubmit={handleSubmitReturn} className="space-y-4 text-xs font-bold text-black">
              
              <div className="border-2 border-black p-3 bg-slate-100 text-xs font-bold text-black space-y-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <p><span className="font-black uppercase text-[10px] text-slate-600 block">গ্রাহক:</span> {customers.find(c => c.id === activeReturnRental.customerId)?.name}</p>
                <p className="pt-1"><span className="font-black uppercase text-[10px] text-slate-600 block">সামগ্রী:</span> {activeReturnRental.itemCode} - {stockItems.find(i => i.code === activeReturnRental.itemCode)?.name}</p>
                <p className="pt-1"><span className="font-black uppercase text-[10px] text-slate-600 block">ভাড়া দেওয়া হয়েছিল:</span> {toBengaliNumber(activeReturnRental.qty)} টি</p>
                <p><span className="font-black uppercase text-[10px] text-slate-600 block">ইতিমধ্যে ফেরত এসেছে:</span> {toBengaliNumber(activeReturnRental.returnedQty)} টি</p>
                <p className="text-rose-600 font-black pt-1"><span className="font-black">বাকি আছে:</span> {toBengaliNumber(activeReturnRental.qty - activeReturnRental.returnedQty)} টি</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">ফেরত আসার তারিখ</label>
                  <input
                    type="date"
                    required
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">আজ ফেরত আসা পরিমাণ</label>
                  <input
                    type="number"
                    min="1"
                    max={activeReturnRental.qty - activeReturnRental.returnedQty}
                    required
                    value={returningQty || ''}
                    onChange={(e) => setReturningQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-rose-600 block mb-1">নষ্ট বা হারিয়ে গেছে? (যদি থাকে)</label>
                <input
                  type="number"
                  min="0"
                  max={returningQty}
                  required
                  value={damagedQty}
                  onChange={(e) => setDamagedQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-black focus:outline-none focus:bg-yellow-50 text-rose-600 font-mono"
                  placeholder="কতটি সামগ্রী নষ্ট/হারানো গেছে?"
                />
                <span className="text-[10px] text-slate-500 font-bold block mt-1">নষ্ট/হারানো সামগ্রী স্বয়ংক্রিয়ভাবে নষ্ট মাল তালিকায় যোগ হয়ে যাবে।</span>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-600 block mb-1">ফেরত নোট / মন্তব্য</label>
                <textarea
                  placeholder="যেমন: অক্ষত অবস্থায় ফেরত এসেছে, মরিচ বাতির চেইন কাটা ছিল..."
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50 h-16 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t-3 border-black pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setActiveReturnRental(null)}
                  className="px-4 py-2 bg-white text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-yellow-500 cursor-pointer"
                >
                  ফেরত রেকর্ড করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🧾 Custom Auto-Invoice FOR RENTAL CONTRACT View Modal */}
      {activeInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="rental-invoice-modal">
          <div className="bg-white border-4 border-black p-6 relative max-w-2xl w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[95vh] overflow-y-auto">
            <button 
              onClick={() => setActiveInvoice(null)}
              className="absolute right-4 top-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] no-print"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>

            {/* Print Header Action */}
            <div className="flex justify-between items-center mb-6 pb-3 border-b-3 border-black no-print">
              <span className="text-sm font-black text-black uppercase italic">ভাড়া মেমো ও বুকিং রসিদ</span>
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-black hover:bg-slate-800 text-white font-black italic text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000000] flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer size={13} className="stroke-[2.5]" />
                প্রিন্ট করুন / PDF সেভ করুন
              </button>
            </div>

            {/* Printable Area */}
            <div className="bg-white p-6 border-4 border-black" id="printable-invoice-content">
              
              {/* Shop Header */}
              <div className="flex flex-col items-center justify-center text-center border-b-3 border-black pb-5 mb-5">
                <h1 className="text-2xl font-black text-black tracking-tight uppercase italic">মেসার্স ডেকোরেশন মিনি ইআরপি</h1>
                <p className="text-xs font-bold text-slate-700 mt-1">সব ধরণের বিয়ের গেট, স্টেজ লাইটিং, প্যান্ডেল এবং ডেকোরেশন সামগ্রী ভাড়া ও বিক্রেতা।</p>
                <p className="text-[10px] font-black text-black uppercase mt-1">ধানমন্ডি শাখা, ঢাকা | মোবাইল: ০১৭০০-০০০০০০</p>
              </div>

              {/* Invoice Meta */}
              <div className="grid grid-cols-2 gap-4 text-xs text-black font-bold mb-6">
                <div className="border-2 border-black p-3 bg-yellow-50">
                  <h4 className="font-black text-black uppercase border-b-2 border-black pb-1 mb-1">গ্রাহকের বিবরণ:</h4>
                  <p className="font-black text-sm">{customers.find(c => c.id === activeInvoice.customerId)?.name || 'অজানা কাস্টমার'}</p>
                  <p>মোবাইল: {toBengaliNumber(customers.find(c => c.id === activeInvoice.customerId)?.mobile || '')}</p>
                  <p>ঠিকানা: {customers.find(c => c.id === activeInvoice.customerId)?.address || ''}</p>
                </div>
                <div className="border-2 border-black p-3 bg-slate-50 text-right">
                  <h4 className="font-black text-black uppercase border-b-2 border-black pb-1 mb-1 text-right">ভাড়া ও বুকিং রসিদ:</h4>
                  <p><span className="font-black">রসিদ নং:</span> <span className="font-mono font-black">REC-R-{activeInvoice.id}</span></p>
                  <p><span className="font-black">তারিখ:</span> {toBengaliNumber(activeInvoice.date)}</p>
                  <p><span className="font-black">ইভেন্ট ডেট:</span> {toBengaliNumber(activeInvoice.eventDate)}</p>
                  <p><span className="font-black">ফেরত ডেট:</span> {toBengaliNumber(activeInvoice.expectedReturnDate)}</p>
                  <p><span className="font-black">অবস্থা:</span> <span className="font-black text-amber-600 uppercase">{activeInvoice.status === 'Returned' ? 'সম্পূর্ণ ফেরত' : activeInvoice.status === 'Partial' ? 'আংশিক ফেরত' : 'ভাড়ায় সচল'}</span></p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse text-xs mb-6 border-2 border-black">
                <thead>
                  <tr className="border-b-3 border-black text-black font-black uppercase bg-slate-100">
                    <th className="py-2.5 px-2 border-r border-black">আইটেম কোড</th>
                    <th className="py-2.5 px-2 border-r border-black">বিবরণ / মালামালের নাম</th>
                    <th className="py-2.5 px-2 border-r border-black text-center">পরিমাণ</th>
                    <th className="py-2.5 px-2 border-r border-black text-right">দৈনিক ভাড়া (৳)</th>
                    <th className="py-2.5 px-2 text-right">মোট ভাড়া বিল (৳)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b-2 border-black">
                    <td className="py-2.5 px-2 border-r border-black font-mono font-black text-slate-800">{activeInvoice.itemCode}</td>
                    <td className="py-2.5 px-2 border-r border-black font-black text-black">
                      {stockItems.find(i => i.code === activeInvoice.itemCode)?.name || 'অজানা সামগ্রী'}
                    </td>
                    <td className="py-2.5 px-2 border-r border-black text-center font-black text-black">
                      {toBengaliNumber(activeInvoice.qty)} {stockItems.find(i => i.code === activeInvoice.itemCode)?.unit || 'পিস'}
                    </td>
                    <td className="py-2.5 px-2 border-r border-black text-right font-bold">{formatCurrency(activeInvoice.rentalPrice)}</td>
                    <td className="py-2.5 px-2 text-right font-black text-black">{formatCurrency(activeInvoice.totalBill)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Invoice Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-xs border-2 border-black p-3 bg-slate-50 font-bold">
                  <div className="flex justify-between border-b border-black/10 pb-1">
                    <span>সর্বমোট ভাড়া বিল:</span>
                    <span className="font-black text-black font-sans">{formatCurrency(activeInvoice.totalBill)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-black border-b border-black/10 pb-1">
                    <span>অগ্রিম আদায় পরিমাণ:</span>
                    <span className="font-sans">{formatCurrency(activeInvoice.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-black pt-0.5">
                    <span>ফেরতকালীন বকেয়া পরিমাণ:</span>
                    <span className="text-sm font-black font-sans">{formatCurrency(activeInvoice.dueAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Terms */}
              <div className="mt-12 pt-6 border-t-2 border-black flex justify-between items-end text-[10px] text-slate-600 font-bold">
                <div>
                  <p className="font-black text-black uppercase">শর্তাবলী:</p>
                  <p>১. মালামাল ফেরত আসার সময় নষ্ট বা ক্ষতি পাওয়া গেলে ক্ষতিপূরণ দিতে হবে।</p>
                  <p>২. সম্ভাব্য ফেরত তারিখের চেয়ে দেরি হলে দৈনিক ভাড়া দ্বিগুণ হিসাব হবে।</p>
                </div>
                <div className="text-center w-32 border-t-2 border-black pt-1 font-black text-black">
                  গ্রাহকের স্বাক্ষর
                </div>
                <div className="text-center w-32 border-t-2 border-black pt-1 font-black text-black">
                  কর্তৃপক্ষের স্বাক্ষর
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
