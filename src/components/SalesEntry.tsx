import React, { useState, useMemo } from 'react';
import { Plus, Search, Calendar, FileText, Printer, X, CreditCard, DollarSign, Edit, Trash2 } from 'lucide-react';
import { StockItem, Customer, SalesEntry } from '../types';
import { formatCurrency, toBengaliNumber } from '../utils';

interface SalesEntryProps {
  sales: SalesEntry[];
  stockItems: StockItem[];
  customers: Customer[];
  onAddSale: (sale: Omit<SalesEntry, 'id'>) => void;
  onUpdateSale?: (id: string, sale: Omit<SalesEntry, 'id'>) => void;
  onDeleteSale?: (id: string) => void;
}

export default function SalesTracker({
  sales,
  stockItems,
  customers,
  onAddSale,
  onUpdateSale,
  onDeleteSale
}: SalesEntryProps) {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<SalesEntry | null>(null);
  const [editingSale, setEditingSale] = useState<SalesEntry | null>(null);

  // New sales entry form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemCode, setItemCode] = useState(stockItems[0]?.code || '');
  const [qty, setQty] = useState(0);
  const [rate, setRate] = useState(0);
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [paidAmount, setPaidAmount] = useState(0);
  const [note, setNote] = useState('');

  const handleEditClick = (s: SalesEntry) => {
    setEditingSale(s);
    setDate(s.date || '');
    setItemCode(s.itemCode || '');
    setQty(s.qty || 0);
    setRate(s.rate || 0);
    setCustomerId(s.customerId || '');
    setPaidAmount(s.paidAmount || 0);
    setNote(s.note || '');
    setIsAddOpen(true);
  };

  // Automatically update the default rate when item changes
  const handleItemChange = (code: string) => {
    setItemCode(code);
    const item = stockItems.find(i => i.code === code);
    if (item) {
      setRate(item.sellingPrice);
    }
  };

  // Filter sales entries
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const item = stockItems.find(i => i.code === s.itemCode);
      const customer = customers.find(c => c.id === s.customerId);
      const matchSearch = s.itemCode.toLowerCase().includes(search.toLowerCase()) ||
                          (item && item.name.toLowerCase().includes(search.toLowerCase())) ||
                          (customer && customer.name.toLowerCase().includes(search.toLowerCase())) ||
                          (s.note && s.note.toLowerCase().includes(search.toLowerCase()));
      return matchSearch;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [sales, stockItems, customers, search]);

  const totalSalesValueSum = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  }, [filteredSales]);

  const totalPaidSum = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + s.paidAmount, 0);
  }, [filteredSales]);

  const totalDueSum = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + s.dueAmount, 0);
  }, [filteredSales]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCode || qty <= 0 || rate <= 0 || !customerId) {
      alert('দয়া করে সঠিক তথ্য প্রদান করুন!');
      return;
    }

    const total = Number(qty) * Number(rate);
    const due = Math.max(0, total - Number(paidAmount));

    const payload = {
      date,
      itemCode,
      qty: Number(qty),
      rate: Number(rate),
      customerId,
      totalAmount: total,
      paidAmount: Number(paidAmount),
      dueAmount: due,
      note: note.trim()
    };

    if (editingSale && onUpdateSale) {
      onUpdateSale(editingSale.id, payload);
    } else {
      onAddSale(payload);
    }

    // Reset Form
    setQty(0);
    setPaidAmount(0);
    setNote('');
    setEditingSale(null);
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-8" id="sales-entry-tab">
      
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <h2 className="text-2xl font-black uppercase italic text-black">সরাসরি বিক্রয় এন্ট্রি (Sales Entry)</h2>
          <p className="text-sm font-bold text-slate-700 mt-1">মালামাল সরাসরি কাস্টমারের কাছে বিক্রি করার হিসাব এবং অগ্রিম/বকেয়া ট্র্যাকিং।</p>
        </div>
        <button
          id="add-sale-btn"
          onClick={() => {
            if (stockItems.length === 0) {
              alert('অনুগ্রহ করে আগে স্টক তালিকায় আইটেম যোগ করুন!');
              return;
            }
            // reset to default for new entry
            setEditingSale(null);
            setDate(new Date().toISOString().split('T')[0]);
            const defaultItem = stockItems[0];
            setItemCode(defaultItem.code);
            setQty(1);
            setRate(defaultItem.sellingPrice);
            setCustomerId(customers[0]?.id || '');
            setPaidAmount(0);
            setNote('');
            setIsAddOpen(true);
          }}
          className="neo-btn neo-btn-primary px-4 py-2 text-sm flex items-center gap-1.5"
        >
          <Plus size={16} className="stroke-[2.5]" />
          নতুন বিক্রয় রেকর্ড করুন
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="sales-stats">
        
        {/* Total Sale Value */}
        <div className="neo-card p-5 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
          <div>
            <span className="text-slate-600 text-xs font-black uppercase tracking-wider block">মোট বিক্রি বিল</span>
            <span className="text-2xl font-black text-indigo-700 block mt-1">
              {formatCurrency(totalSalesValueSum)}
            </span>
            <span className="text-xs text-black font-black mt-1 block">বিক্রয় চালান থেকে</span>
          </div>
          <div className="w-12 h-12 border-3 border-black bg-indigo-400 flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <FileText size={22} className="stroke-[2.5]" />
          </div>
        </div>

        {/* Total Paid / Collected */}
        <div className="neo-card p-5 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
          <div>
            <span className="text-slate-600 text-xs font-black uppercase tracking-wider block">মোট আদায় (পেইড)</span>
            <span className="text-2xl font-black text-emerald-600 block mt-1">
              {formatCurrency(totalPaidSum)}
            </span>
            <span className="text-xs text-black font-black mt-1 block">সংগৃহীত নগদ টাকা</span>
          </div>
          <div className="w-12 h-12 border-3 border-black bg-emerald-400 flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <CreditCard size={22} className="stroke-[2.5]" />
          </div>
        </div>

        {/* Total Due / Receivable */}
        <div className="neo-card p-5 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
          <div>
            <span className="text-slate-600 text-xs font-black uppercase tracking-wider block">মোট বকেয়া (Due)</span>
            <span className="text-2xl font-black text-rose-600 block mt-1">
              {formatCurrency(totalDueSum)}
            </span>
            <span className="text-xs text-rose-600 font-black mt-1 block uppercase">আদায়যোগ্য বকেয়া</span>
          </div>
          <div className="w-12 h-12 border-3 border-black bg-rose-400 flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <DollarSign size={22} className="stroke-[2.5]" />
          </div>
        </div>
        
        {/* Total Sale Orders Count */}
        <div className="neo-card p-5 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
          <div>
            <span className="text-slate-600 text-xs font-black uppercase tracking-wider block">মোট বিক্রয় অর্ডার</span>
            <span className="text-2xl font-black text-black block mt-1 font-mono tracking-tighter">
              {toBengaliNumber(filteredSales.length)} টি অর্ডার
            </span>
            <span className="text-xs text-slate-500 font-bold mt-1 block">নিবন্ধিত বিক্রয় চালান</span>
          </div>
          <div className="w-12 h-12 border-3 border-black bg-yellow-400 flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Calendar size={22} className="stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Search Input Filter */}
      <div className="relative" id="sales-search-panel">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black stroke-[2.5]" size={18} />
        <input
          id="sales-search-input"
          type="text"
          placeholder="আইটেম কোড, নাম বা কাস্টমার লিখে সার্চ করুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border-3 border-black rounded-none text-sm text-black font-bold focus:outline-none focus:bg-yellow-50"
        />
      </div>

      {/* Sales History Table */}
      <div className="neo-card overflow-hidden" id="sales-history-table">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="sales-table">
            <thead>
              <tr className="bg-slate-100 border-b-3 border-black text-black text-xs font-black uppercase tracking-wider">
                <th className="py-4 px-4 border-r border-black/10">তারিখ</th>
                <th className="py-4 px-4 border-r border-black/10">আইটেম কোড</th>
                <th className="py-4 px-4 border-r border-black/10">আইটেম নাম</th>
                <th className="py-4 px-4 border-r border-black/10 text-center">পরিমাণ</th>
                <th className="py-4 px-4 border-r border-black/10 text-right">বিক্রয় দর (৳)</th>
                <th className="py-4 px-4 border-r border-black/10 text-right">মোট বিল (৳)</th>
                <th className="py-4 px-4 border-r border-black/10 text-right">আদায় (৳)</th>
                <th className="py-4 px-4 border-r border-black/10 text-right">বকেয়া (৳)</th>
                <th className="py-4 px-4 border-r border-black/10">কাস্টমার</th>
                <th className="py-4 px-4 border-r border-black/10 text-center">ইনভয়েস</th>
                <th className="py-4 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-sm font-bold text-black uppercase">
                    কোন বিক্রয়ের রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredSales.map(s => {
                  const item = stockItems.find(i => i.code === s.itemCode);
                  const customer = customers.find(c => c.id === s.customerId);

                  return (
                    <tr key={s.id} className="border-b-2 border-black/10 hover:bg-yellow-50/50 transition">
                      <td className="py-4 px-4 border-r border-black/10 text-xs font-black text-slate-700 font-mono">
                        {toBengaliNumber(s.date)}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10">
                        <span className="px-2 py-0.5 bg-black text-white text-[10px] font-mono font-black uppercase">
                          {s.itemCode}
                        </span>
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-sm font-black text-black">
                        {item ? item.name : 'অজানা আইটেম'}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-center font-mono text-sm font-black text-slate-700">
                        {toBengaliNumber(s.qty)} {item?.unit || 'পিস'}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-right text-sm font-black text-black font-sans">
                        {formatCurrency(s.rate)}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-right text-sm font-black text-black font-sans">
                        {formatCurrency(s.totalAmount)}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-right text-sm font-black text-emerald-600 font-sans">
                        {formatCurrency(s.paidAmount)}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-right text-sm font-black text-rose-600 font-sans">
                        {formatCurrency(s.dueAmount)}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-sm text-black font-black">
                        {customer ? customer.name : 'অজানা কাস্টমার'}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-center">
                        <button
                          id={`invoice-sale-${s.id}`}
                          onClick={() => setActiveInvoice(s)}
                          className="p-1.5 border-2 border-black bg-white hover:bg-yellow-400 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                          title="ইনভয়েস প্রিন্ট"
                        >
                          <Printer size={14} className="stroke-[2.5]" />
                        </button>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(s)}
                            title="সম্পাদনা করুন"
                            className="p-1.5 border-2 border-black bg-white hover:bg-yellow-400 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                          >
                            <Edit size={12} className="stroke-[2.5]" />
                          </button>
                          {onDeleteSale && (
                            <button
                              onClick={() => onDeleteSale(s.id)}
                              title="মুছে ফেলুন"
                              className="p-1.5 border-2 border-black bg-red-100 hover:bg-red-500 hover:text-white text-red-700 transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                            >
                              <Trash2 size={12} className="stroke-[2.5]" />
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

      {/* Add Entry Modal Form */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="sales-modal">
          <div className="bg-white border-4 border-black p-6 relative max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <button 
              onClick={() => {
                setIsAddOpen(false);
                setEditingSale(null);
              }}
              className="absolute right-4 top-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>

            <h3 className="text-lg font-black uppercase italic text-black mb-4 border-b-3 border-black pb-3">
              {editingSale ? 'বিক্রয় এন্ট্রি পরিবর্তন (Edit)' : 'নতুন বিক্রয় রেকর্ড করুন'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-black">
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
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">মালামাল নির্বাচন (Item)</label>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">পরিমাণ (Quantity)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={qty || ''}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">বিক্রয় দর (৳ - প্রতি ইউনিট)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={rate || ''}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">আজ আদায় / পেইড (৳)</label>
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
                <label className="text-xs font-black uppercase text-slate-600 block mb-1">মন্তব্য (নোট)</label>
                <textarea
                  placeholder="কোনো অতিরিক্ত তথ্য বা বিশেষ নোট..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50 h-20 resize-none"
                />
              </div>

              {/* Total Calculation Show */}
              <div className="grid grid-cols-3 gap-2 border-2 border-black text-center text-xs font-black p-2 bg-yellow-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="p-1">
                  <span className="block text-[10px] text-slate-600 uppercase">মোট বিল</span>
                  <span className="text-sm font-black block mt-0.5 text-black">{formatCurrency(qty * rate)}</span>
                </div>
                <div className="p-1">
                  <span className="block text-[10px] text-slate-600 uppercase">পরিশোধিত</span>
                  <span className="text-sm font-black block mt-0.5 text-emerald-600">{formatCurrency(paidAmount)}</span>
                </div>
                <div className="p-1">
                  <span className="block text-[10px] text-slate-600 uppercase">বকেয়া</span>
                  <span className="text-sm font-black block mt-0.5 text-rose-600">{formatCurrency(Math.max(0, (qty * rate) - paidAmount))}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t-3 border-black pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingSale(null);
                  }}
                  className="px-4 py-2 bg-white text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-yellow-500 cursor-pointer"
                >
                  {editingSale ? 'আপডেট করুন' : 'বিক্রয় সম্পন্ন করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🧾 Custom Auto-Invoice Printable View Modal */}
      {activeInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="sales-invoice-modal">
          <div className="bg-white border-4 border-black p-6 relative max-w-2xl w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[95vh] overflow-y-auto">
            <button 
              onClick={() => setActiveInvoice(null)}
              className="absolute right-4 top-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] no-print"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>

            {/* Print Header Action */}
            <div className="flex justify-between items-center mb-6 pb-3 border-b-3 border-black no-print">
              <span className="text-sm font-black text-black uppercase italic">স্বয়ংক্রিয় মেমো ও ইনভয়েস</span>
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
                  <h4 className="font-black text-black uppercase border-b-2 border-black pb-1 mb-1 text-right">ইনভয়েস বিবরণ:</h4>
                  <p><span className="font-black">চালান নং:</span> <span className="font-mono font-black">INV-S-{activeInvoice.id}</span></p>
                  <p><span className="font-black">তারিখ:</span> {toBengaliNumber(activeInvoice.date)}</p>
                  <p><span className="font-black">স্ট্যাটাস:</span> <span className={`font-black uppercase ${activeInvoice.dueAmount === 0 ? 'text-emerald-600 bg-emerald-50 px-1 border border-emerald-300' : 'text-rose-600 bg-rose-50 px-1 border border-rose-300'}`}>{activeInvoice.dueAmount === 0 ? 'পরিশোধিত' : 'বকেয়া রয়েছে'}</span></p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse text-xs mb-6 border-2 border-black">
                <thead>
                  <tr className="border-b-3 border-black text-black font-black uppercase bg-slate-100">
                    <th className="py-2.5 px-2 border-r border-black">আইটেম কোড</th>
                    <th className="py-2.5 px-2 border-r border-black">বিবরণ / মালামালের নাম</th>
                    <th className="py-2.5 px-2 border-r border-black text-center">পরিমাণ</th>
                    <th className="py-2.5 px-2 border-r border-black text-right">দর (৳)</th>
                    <th className="py-2.5 px-2 text-right">মোট (৳)</th>
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
                    <td className="py-2.5 px-2 border-r border-black text-right font-bold">{formatCurrency(activeInvoice.rate)}</td>
                    <td className="py-2.5 px-2 text-right font-black text-black">{formatCurrency(activeInvoice.totalAmount)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Invoice Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-xs border-2 border-black p-3 bg-slate-50 font-bold">
                  <div className="flex justify-between border-b border-black/10 pb-1">
                    <span>সর্বমোট বিল:</span>
                    <span className="font-black text-black">{formatCurrency(activeInvoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-black border-b border-black/10 pb-1">
                    <span>পরিশোধিত (আদায়):</span>
                    <span>{formatCurrency(activeInvoice.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-black pt-0.5">
                    <span>বকেয়া পরিমাণ:</span>
                    <span className="text-sm font-black">{formatCurrency(activeInvoice.dueAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Terms */}
              <div className="mt-12 pt-6 border-t-2 border-black flex justify-between items-end text-[10px] text-slate-600 font-bold">
                <div>
                  <p className="font-black text-black uppercase">শর্তাবলী:</p>
                  <p>১. বিক্রিত মাল ফেরত নেওয়া হয় না।</p>
                  <p>২. যেকোনো ধরণের বকেয়া বিল ১৫ দিনের মধ্যে পরিশোধযোগ্য।</p>
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
