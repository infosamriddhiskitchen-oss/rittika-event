import React, { useState, useMemo } from 'react';
import { Plus, Search, Calendar, ShoppingBag, X, Users, Edit, Trash2, Printer, Download } from 'lucide-react';
import { StockItem, Supplier, PurchaseEntry } from '../types';
import { formatCurrency, toBengaliNumber } from '../utils';

interface PurchaseEntryProps {
  purchases: PurchaseEntry[];
  stockItems: StockItem[];
  suppliers: Supplier[];
  onAddPurchase: (purchase: Omit<PurchaseEntry, 'id'>) => void;
  onUpdatePurchase?: (id: string, purchase: Omit<PurchaseEntry, 'id'>) => void;
  onDeletePurchase?: (id: string) => void;
}

export default function PurchaseTracker({
  purchases,
  stockItems,
  suppliers,
  onAddPurchase,
  onUpdatePurchase,
  onDeletePurchase
}: PurchaseEntryProps) {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<PurchaseEntry | null>(null);

  // New purchase entry form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemCode, setItemCode] = useState(stockItems[0]?.code || '');
  const [qty, setQty] = useState(0);
  const [rate, setRate] = useState(0);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [note, setNote] = useState('');

  const handleEditClick = (p: PurchaseEntry) => {
    setEditingPurchase(p);
    setDate(p.date || '');
    setItemCode(p.itemCode || '');
    setQty(p.qty || 0);
    setRate(p.rate || 0);
    setSupplierId(p.supplierId || '');
    setNote(p.note || '');
    setIsAddOpen(true);
  };

  // Automatically update the default rate when item changes
  const handleItemChange = (code: string) => {
    setItemCode(code);
    const item = stockItems.find(i => i.code === code);
    if (item) {
      setRate(item.purchasePrice);
    }
  };

  // Filter purchase entries
  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      const item = stockItems.find(i => i.code === p.itemCode);
      const supplier = suppliers.find(s => s.id === p.supplierId);
      const matchSearch = p.itemCode.toLowerCase().includes(search.toLowerCase()) ||
                          (item && item.name.toLowerCase().includes(search.toLowerCase())) ||
                          (supplier && supplier.name.toLowerCase().includes(search.toLowerCase())) ||
                          (p.note && p.note.toLowerCase().includes(search.toLowerCase()));
      return matchSearch;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [purchases, stockItems, suppliers, search]);

  const totalPurchaseValueSum = useMemo(() => {
    return filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
  }, [filteredPurchases]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCode || qty <= 0 || rate <= 0 || !supplierId) {
      alert('দয়া করে সঠিক তথ্য প্রদান করুন!');
      return;
    }

    const payload = {
      date,
      itemCode,
      qty: Number(qty),
      rate: Number(rate),
      supplierId,
      totalAmount: Number(qty) * Number(rate),
      note: note.trim()
    };

    if (editingPurchase && onUpdatePurchase) {
      onUpdatePurchase(editingPurchase.id, payload);
    } else {
      onAddPurchase(payload);
    }

    // Reset Form
    setQty(0);
    setNote('');
    setEditingPurchase(null);
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-8" id="purchase-entry-tab">
      
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <h2 className="text-2xl font-black uppercase italic text-black">মালামাল ক্রয় এন্ট্রি (Purchase Entry)</h2>
          <p className="text-sm font-bold text-slate-700 mt-1">নতুন ডেকোরেশন সামগ্রী গুদামে আসলে তা ট্র্যাক করার মূল খাতা।</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="print-purchases-report-btn"
            onClick={() => setIsReportOpen(true)}
            className="neo-btn bg-black hover:bg-slate-800 text-white px-4 py-2 text-sm flex items-center gap-2"
          >
            <Printer size={16} className="stroke-[2.5]" />
            ক্রয় রিপোর্ট (PDF/প্রিন্ট)
          </button>
          <button
            id="add-purchase-btn"
            onClick={() => {
              if (stockItems.length === 0) {
                alert('অনুগ্রহ করে আগে স্টক তালিকায় আইটেম যোগ করুন!');
                return;
              }
              // reset to default for new entry
              setEditingPurchase(null);
              setDate(new Date().toISOString().split('T')[0]);
              const defaultItem = stockItems[0];
              setItemCode(defaultItem.code);
              setQty(1);
              setRate(defaultItem.purchasePrice);
              setSupplierId(suppliers[0]?.id || '');
              setNote('');
              setIsAddOpen(true);
            }}
            className="neo-btn neo-btn-primary px-4 py-2 text-sm flex items-center gap-1.5"
          >
            <Plus size={16} className="stroke-[2.5]" />
            নতুন ক্রয় রেকর্ড করুন
          </button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="purchase-stats">
        
        {/* Total Purchase Expense */}
        <div className="neo-card p-5 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
          <div>
            <span className="text-slate-600 text-xs font-black uppercase tracking-wider block">মোট ক্রয় খরচ</span>
            <span className="text-2xl font-black text-rose-600 block mt-1">
              {formatCurrency(totalPurchaseValueSum)}
            </span>
            <span className="text-xs text-black font-black mt-1 block">ফিল্টারড ডাটাবেস</span>
          </div>
          <div className="w-12 h-12 border-3 border-black bg-rose-400 flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <ShoppingBag size={22} className="stroke-[2.5]" />
          </div>
        </div>
        
        {/* Total Purchase Invoices */}
        <div className="neo-card p-5 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
          <div>
            <span className="text-slate-600 text-xs font-black uppercase tracking-wider block">মোট ক্রয় লেনদেন</span>
            <span className="text-2xl font-black text-black block mt-1 font-mono tracking-tighter">
              {toBengaliNumber(filteredPurchases.length)} টি চালান
            </span>
            <span className="text-xs text-slate-500 font-bold mt-1 block">মোট চালান নথিভুক্ত</span>
          </div>
          <div className="w-12 h-12 border-3 border-black bg-yellow-400 flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Calendar size={22} className="stroke-[2.5]" />
          </div>
        </div>

        {/* Total Suppliers */}
        <div className="neo-card p-5 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
          <div>
            <span className="text-slate-600 text-xs font-black uppercase tracking-wider block">মোট সরবরাহকারী</span>
            <span className="text-2xl font-black text-black block mt-1 font-mono tracking-tighter">
              {toBengaliNumber(suppliers.length)} জন
            </span>
            <span className="text-xs text-slate-500 font-bold mt-1 block">সক্রিয় সাপ্লাইয়ার</span>
          </div>
          <div className="w-12 h-12 border-3 border-black bg-sky-400 flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Users size={22} className="stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Search Input Filter */}
      <div className="relative" id="purchase-search-panel">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black stroke-[2.5]" size={18} />
        <input
          id="purchase-search-input"
          type="text"
          placeholder="আইটেম কোড, নাম বা সরবরাহকারী লিখে সার্চ করুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border-3 border-black rounded-none text-sm text-black font-bold focus:outline-none focus:bg-yellow-50"
        />
      </div>

      {/* Purchase History Table */}
      <div className="neo-card overflow-hidden" id="purchase-history-table">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="purchase-table">
            <thead>
              <tr className="bg-slate-100 border-b-3 border-black text-black text-xs font-black uppercase tracking-wider">
                <th className="py-4 px-4 border-r border-black/10">তারিখ</th>
                <th className="py-4 px-4 border-r border-black/10">আইটেম কোড</th>
                <th className="py-4 px-4 border-r border-black/10">আইটেম নাম</th>
                <th className="py-4 px-4 border-r border-black/10 text-center">পরিমাণ</th>
                <th className="py-4 px-4 border-r border-black/10 text-right">ক্রয় দর (৳)</th>
                <th className="py-4 px-4 border-r border-black/10 text-right">মোট মূল্য (৳)</th>
                <th className="py-4 px-4 border-r border-black/10">সরবরাহকারী</th>
                <th className="py-4 px-4 border-r border-black/10">মন্তব্য</th>
                <th className="py-4 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-sm font-bold text-black uppercase">
                    কোন ক্রয়ের রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredPurchases.map(p => {
                  const item = stockItems.find(i => i.code === p.itemCode);
                  const supplier = suppliers.find(s => s.id === p.supplierId);

                  return (
                    <tr key={p.id} className="border-b-2 border-black/10 hover:bg-yellow-50/50 transition">
                      <td className="py-4 px-4 border-r border-black/10 text-xs font-black text-slate-700 font-mono">
                        {toBengaliNumber(p.date)}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10">
                        <span className="px-2 py-0.5 bg-black text-white text-[10px] font-mono font-black uppercase">
                          {p.itemCode}
                        </span>
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-sm font-black text-black">
                        {item ? item.name : 'অজানা আইটেম'}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-center font-mono text-sm font-black text-slate-700">
                        {toBengaliNumber(p.qty)} {item?.unit || 'পিস'}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-right text-sm font-black text-black font-sans">
                        {formatCurrency(p.rate)}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-right text-sm font-black text-rose-600 font-sans">
                        {formatCurrency(p.totalAmount)}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-sm text-black font-black">
                        {supplier ? supplier.name : 'অজানা সরবরাহকারী'}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-xs text-slate-600 font-bold max-w-[150px] truncate" title={p.note}>
                        {p.note || '-'}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(p)}
                            title="সম্পাদনা করুন"
                            className="p-1.5 border-2 border-black bg-white hover:bg-yellow-400 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                          >
                            <Edit size={12} className="stroke-[2.5]" />
                          </button>
                          {onDeletePurchase && (
                            <button
                              onClick={() => onDeletePurchase(p.id)}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="purchase-modal">
          <div className="bg-white border-4 border-black p-6 relative max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <button 
              onClick={() => {
                setIsAddOpen(false);
                setEditingPurchase(null);
              }}
              className="absolute right-4 top-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>

            <h3 className="text-lg font-black uppercase italic text-black mb-4 border-b-3 border-black pb-3">
              {editingPurchase ? 'ক্রয় এন্ট্রি পরিবর্তন (Edit)' : 'নতুন ক্রয় রেকর্ড করুন'}
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
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">ক্রয় দর (৳ - প্রতি ইউনিট)</label>
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

              <div>
                <label className="text-xs font-black uppercase text-slate-600 block mb-1">সরবরাহকারী (Supplier)</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.itemType})
                    </option>
                  ))}
                </select>
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
              <div className="p-3 bg-indigo-50 border-2 border-black text-black flex items-center justify-between text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span>মোট ক্রয় মূল্য:</span>
                <span className="text-sm font-black text-rose-600">{formatCurrency(qty * rate)}</span>
              </div>

              <div className="flex justify-end gap-3 border-t-3 border-black pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingPurchase(null);
                  }}
                  className="px-4 py-2 bg-white text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-yellow-500 cursor-pointer"
                >
                  {editingPurchase ? 'আপডেট করুন' : 'স্টকে যুক্ত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📊 STUNNING PRINTABLE PURCHASES REPORT MODAL */}
      {isReportOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn" id="purchases-report-modal">
          <div className="bg-white border-4 border-black p-6 relative max-w-4xl w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[95vh] overflow-y-auto print:p-0 print:border-0 print:shadow-none">
            
            <button 
              onClick={() => setIsReportOpen(false)}
              className="absolute right-4 top-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] no-print"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>

            {/* Print Header Actions (no-print) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-3 border-b-3 border-black no-print">
              <div>
                <span className="text-sm font-black text-black uppercase italic">ক্রয় এন্ট্রি রিপোর্ট জেনারেটর</span>
                <p className="text-[10px] text-slate-500 font-bold">এটি আপনার ব্যবসায়ের সর্বমোট ক্রয় চালানের অফিশিয়াল খতিয়ান প্রিন্ট ও ডাউনলোড হাব।</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => {
                    const headers = ['ক্রয় তারিখ', 'আইটেম কোড', 'আইটেম নাম', 'পরিমাণ', 'দর (টাকা)', 'মোট মূল্য (টাকা)', 'সাপ্লাইয়ার'];
                    const rows = purchases.map(p => {
                      const item = stockItems.find(i => i.code === p.itemCode);
                      const supp = suppliers.find(s => s.id === p.supplierId);
                      return [
                        p.date,
                        p.itemCode,
                        item ? item.name : p.itemCode,
                        p.qty,
                        p.rate,
                        p.qty * p.rate,
                        supp ? supp.name : 'অজানা সাপ্লাইয়ার'
                      ];
                    });

                    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
                      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
                    
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `Rittika_Purchases_Report_${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex-1 sm:flex-initial px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black italic text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Download size={13} className="stroke-[2.5]" />
                  ডাটা এক্সেল/CSV ডাউনলোড
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-initial px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-black italic text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Printer size={13} className="stroke-[2.5]" />
                  প্রিন্ট করুন / PDF সেভ করুন
                </button>
              </div>
            </div>

            {/* Printable Report Document Card */}
            <div className="bg-white p-6 border-4 border-black print:border-0 print:p-0" id="printable-purchases-report">
              
              {/* Header */}
              <div className="flex flex-col items-center justify-center text-center border-b-3 border-black pb-5 mb-5">
                <h1 className="text-2xl font-black text-black tracking-tight uppercase italic">রিত্তিকা ইভেন্ট ম্যানেজমেন্ট ডেকোরেশন</h1>
                <p className="text-xs font-bold text-slate-700 mt-1">সব ধরণের বিয়ের গেট, স্টেজ লাইটিং, প্যান্ডেল এবং ডেকোরেশন সামগ্রীর নির্ভরযোগ্য সরবরাহকারী ও ভাড়াদাতা।</p>
                <div className="flex gap-4 mt-2 text-[10px] font-black uppercase text-black">
                  <span>ঠিকানা: ঢাকা, বাংলাদেশ</span>
                  <span>•</span>
                  <span>মোবাইল: ০১৮২৪-৫৯৭৫৬২</span>
                  <span>•</span>
                  <span>রিপোর্ট তারিখ: {toBengaliNumber(new Date().toLocaleDateString('bn-BD'))}</span>
                </div>
              </div>

              <div className="text-center bg-slate-100 border-2 border-black p-3 mb-6">
                <h2 className="text-base font-black text-black uppercase tracking-wide">মালামাল ক্রয় এবং ইনভেন্টরি সংগ্রহ খতিয়ান (Purchase Ledger Statement)</h2>
              </div>

              {/* High-Level Aggregates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center text-xs font-black">
                <div className="border-2 border-black p-2 bg-slate-50">
                  <span className="text-slate-500 text-[10px] uppercase block">মোট ক্রয় খরচ</span>
                  <span className="text-lg font-black font-mono block text-rose-600 mt-1">
                    {formatCurrency(purchases.reduce((acc, p) => acc + (p.qty * p.rate), 0))}
                  </span>
                </div>
                <div className="border-2 border-black p-2 bg-slate-50">
                  <span className="text-slate-500 text-[10px] uppercase block">মোট ক্রয় লেনদেন</span>
                  <span className="text-lg font-black font-mono block text-indigo-700 mt-1">
                    {toBengaliNumber(purchases.length)} টি চালান
                  </span>
                </div>
                <div className="border-2 border-black p-2 bg-slate-50">
                  <span className="text-slate-500 text-[10px] uppercase block">সংযুক্ত সাপ্লাইয়ার সংখ্যা</span>
                  <span className="text-lg font-black font-mono block text-teal-700 mt-1">
                    {toBengaliNumber(suppliers.length)} জন
                  </span>
                </div>
              </div>

              {/* Details Table */}
              <div className="border-2 border-black overflow-hidden mb-6">
                <table className="w-full text-left text-xs font-bold">
                  <thead className="bg-slate-100 border-b-2 border-black text-[10px] uppercase font-black tracking-wider text-black">
                    <tr>
                      <th className="p-2 border-r-2 border-black text-center w-10">#</th>
                      <th className="p-2 border-r-2 border-black w-24">তারিখ</th>
                      <th className="p-2 border-r-2 border-black">ক্রয়কৃত সামগ্রী (Item)</th>
                      <th className="p-2 border-r-2 border-black text-center w-20">পরিমাণ</th>
                      <th className="p-2 border-r-2 border-black text-right w-24">একক দর (৳)</th>
                      <th className="p-2 border-r-2 border-black text-right w-28">মোট ক্রয় মূল্য</th>
                      <th className="p-2 text-left">সরবরাহকারী (Supplier)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-b border-black">
                    {purchases.map((p, index) => {
                      const item = stockItems.find(i => i.code === p.itemCode);
                      const supp = suppliers.find(s => s.id === p.supplierId);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2 border-r-2 border-black text-center font-mono">{toBengaliNumber(index + 1)}</td>
                          <td className="p-2 border-r-2 border-black font-mono text-slate-700">{p.date}</td>
                          <td className="p-2 border-r-2 border-black font-black text-black">
                            {item ? item.name : p.itemCode}
                            <span className="block text-[9px] font-mono font-bold text-slate-400 mt-0.5">কোড: {p.itemCode}</span>
                          </td>
                          <td className="p-2 border-r-2 border-black text-center font-mono">
                            {toBengaliNumber(p.qty)} {item?.unit || 'পিস'}
                          </td>
                          <td className="p-2 border-r-2 border-black text-right font-sans">{formatCurrency(p.rate)}</td>
                          <td className="p-2 border-r-2 border-black text-right font-sans text-rose-600 font-black">{formatCurrency(p.qty * p.rate)}</td>
                          <td className="p-2 text-left text-slate-800">
                            {supp ? supp.name : 'অজানা সাপ্লাইয়ার'}
                            {supp && <span className="block text-[9px] font-mono font-bold text-slate-500 mt-0.5">মোবাইল: {supp.mobile}</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Signature Section */}
              <div className="grid grid-cols-2 gap-12 mt-12 pt-6 border-t-2 border-dashed border-black/30 text-xs font-black">
                <div className="text-center">
                  <div className="h-10 border-b-2 border-black w-40 mx-auto"></div>
                  <p className="mt-2 text-slate-700">অনুমোদনকারীর স্বাক্ষর</p>
                  <p className="text-[10px] text-slate-400 font-bold">তারিখ ও সময় সহ</p>
                </div>
                <div className="text-center">
                  <div className="h-10 border-b-2 border-black w-40 mx-auto"></div>
                  <p className="mt-2 text-slate-700">হিসাবরক্ষক স্বাক্ষর</p>
                  <p className="text-[10px] text-slate-400 font-bold">রিত্তিকা ইভেন্ট ম্যানেজমেন্ট</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
