import React, { useState, useMemo } from 'react';
import { Plus, Trash, Search, ShieldAlert, X, Edit, Trash2 } from 'lucide-react';
import { StockItem, DamageEntry } from '../types';
import { formatCurrency, toBengaliNumber } from '../utils';

interface DamageTrackerProps {
  damages: DamageEntry[];
  stockItems: StockItem[];
  onAddDamage: (damage: Omit<DamageEntry, 'id'>) => void;
  onUpdateDamage?: (id: string, damage: Omit<DamageEntry, 'id'>) => void;
  onDeleteDamage?: (id: string) => void;
}

export default function DamageTracker({
  damages,
  stockItems,
  onAddDamage,
  onUpdateDamage,
  onDeleteDamage
}: DamageTrackerProps) {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDamage, setEditingDamage] = useState<DamageEntry | null>(null);

  // New damage entry form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemCode, setItemCode] = useState(stockItems[0]?.code || '');
  const [qty, setQty] = useState(0);
  const [type, setType] = useState<'Damage' | 'Lost'>('Damage');
  const [cost, setCost] = useState(0);
  const [note, setNote] = useState('');

  const handleEditClick = (d: DamageEntry) => {
    setEditingDamage(d);
    setDate(d.date || '');
    setItemCode(d.itemCode || '');
    setQty(d.qty || 0);
    setType(d.type || 'Damage');
    setCost(d.cost || 0);
    setNote(d.note || '');
    setIsAddOpen(true);
  };

  // Automatically compute average purchase cost of the item to suggest as damage cost
  const handleItemChange = (code: string) => {
    setItemCode(code);
    const item = stockItems.find(i => i.code === code);
    if (item) {
      setCost(item.purchasePrice);
    }
  };

  // Filter damages list
  const filteredDamages = useMemo(() => {
    return damages.filter(d => {
      const item = stockItems.find(i => i.code === d.itemCode);
      const matchSearch = d.itemCode.toLowerCase().includes(search.toLowerCase()) ||
                          (item && item.name.toLowerCase().includes(search.toLowerCase())) ||
                          (d.note && d.note.toLowerCase().includes(search.toLowerCase()));
      return matchSearch;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [damages, stockItems, search]);

  const totalDamageQty = useMemo(() => {
    return filteredDamages.reduce((sum, d) => sum + d.qty, 0);
  }, [filteredDamages]);

  const totalDamageCost = useMemo(() => {
    return filteredDamages.reduce((sum, d) => sum + (d.qty * d.cost), 0);
  }, [filteredDamages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCode || qty <= 0 || cost <= 0) {
      alert('অনুগ্রহ করে সঠিক তথ্য দিন!');
      return;
    }

    const payload = {
      date,
      itemCode,
      qty: Number(qty),
      type,
      cost: Number(cost),
      note: note.trim()
    };

    if (editingDamage && onUpdateDamage) {
      onUpdateDamage(editingDamage.id, payload);
    } else {
      onAddDamage(payload);
    }

    // Reset Form
    setQty(0);
    setNote('');
    setEditingDamage(null);
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-8" id="damage-tracker-tab">
      
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <h2 className="text-2xl font-black uppercase italic text-black">নষ্ট ও হারানো মালামাল (Damage / Lost Items)</h2>
          <p className="text-sm font-bold text-slate-700 mt-1">লাইট নষ্ট হওয়া, ফুল ছিঁড়ে যাওয়া, তার কাটা পড়া বা কার্পেট নষ্ট হওয়া ট্র্যাক করার খাতা।</p>
        </div>
        <button
          id="add-damage-btn"
          onClick={() => {
            if (stockItems.length === 0) {
              alert('অনুগ্রহ করে স্টক তালিকায় আইটেম যোগ করুন!');
              return;
            }
            // Reset to default for new entry
            setEditingDamage(null);
            setDate(new Date().toISOString().split('T')[0]);
            const defaultItem = stockItems[0];
            setItemCode(defaultItem.code);
            setQty(1);
            setType('Damage');
            setCost(defaultItem.purchasePrice);
            setNote('');
            setIsAddOpen(true);
          }}
          className="neo-btn neo-btn-danger px-4 py-2 text-sm flex items-center gap-1.5"
        >
          <Plus size={16} className="stroke-[2.5]" />
          নষ্ট সামগ্রী রেকর্ড করুন
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="damage-stats">
        
        {/* Total Damaged items quantity */}
        <div className="neo-card p-5 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
          <div>
            <span className="text-slate-600 text-xs font-black uppercase tracking-wider block">মোট ক্ষতিগ্রস্ত মালামাল</span>
            <span className="text-2xl font-black text-rose-600 block mt-1 font-mono tracking-tighter">
              {toBengaliNumber(totalDamageQty)} টি সামগ্রী ক্ষতিগ্রস্ত
            </span>
            <span className="text-xs text-black font-black mt-1 block">গুদাম থেকে হ্রাসকৃত স্টক</span>
          </div>
          <div className="w-12 h-12 border-3 border-black bg-rose-400 flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <ShieldAlert size={22} className="stroke-[2.5]" />
          </div>
        </div>

        {/* Total Financial damage cost */}
        <div className="neo-card p-5 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
          <div>
            <span className="text-slate-600 text-xs font-black uppercase tracking-wider block">আনুমানিক আর্থিক ক্ষতিমূল্য</span>
            <span className="text-2xl font-black text-red-600 block mt-1">
              {formatCurrency(totalDamageCost)}
            </span>
            <span className="text-xs text-black font-black mt-1 block uppercase">ট্যাক্স ও ডেপ্রিসিয়েশন খরচ</span>
          </div>
          <div className="w-12 h-12 border-3 border-black bg-yellow-400 flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <ShieldAlert size={22} className="stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="relative" id="damage-search-panel">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black stroke-[2.5]" size={18} />
        <input
          id="damage-search-input"
          type="text"
          placeholder="মালামাল কোড বা নাম লিখে সার্চ করুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border-3 border-black rounded-none text-sm text-black font-bold focus:outline-none focus:bg-yellow-50"
        />
      </div>

      {/* Damage list table */}
      <div className="neo-card overflow-hidden" id="damage-history-table">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="damage-table">
            <thead>
              <tr className="bg-slate-100 border-b-3 border-black text-black text-xs font-black uppercase tracking-wider">
                <th className="py-4 px-4 border-r border-black/10">তারিখ</th>
                <th className="py-4 px-4 border-r border-black/10">আইটেম কোড</th>
                <th className="py-4 px-4 border-r border-black/10">আইটেম নাম</th>
                <th className="py-4 px-4 border-r border-black/10 text-center">পরিমাণ</th>
                <th className="py-4 px-4 border-r border-black/10 text-center">ধরন</th>
                <th className="py-4 px-4 border-r border-black/10 text-right">ক্ষতিমূল্য (প্রতিটি ৳)</th>
                <th className="py-4 px-4 border-r border-black/10 text-right">মোট ক্ষতিমূল্য (৳)</th>
                <th className="py-4 px-4 border-r border-black/10">মন্তব্য</th>
                <th className="py-4 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filteredDamages.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-sm font-bold text-black uppercase">
                    কোন ক্ষতিগ্রস্ত বা হারানো মালামালের রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredDamages.map(d => {
                  const item = stockItems.find(i => i.code === d.itemCode);

                  return (
                    <tr key={d.id} className="border-b-2 border-black/10 hover:bg-yellow-50/50 transition">
                      <td className="py-4 px-4 border-r border-black/10 text-xs font-black text-slate-700 font-mono">
                        {toBengaliNumber(d.date)}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10">
                        <span className="px-2 py-0.5 bg-black text-white text-[10px] font-mono font-black uppercase">
                          {d.itemCode}
                        </span>
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-sm font-black text-black">
                        {item ? item.name : 'অজানা আইটেম'}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-center font-mono text-sm font-black text-rose-600">
                        {toBengaliNumber(d.qty)} {item?.unit || 'পিস'}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-center">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 border-2 border-black ${
                          d.type === 'Damage' 
                            ? 'bg-amber-300 text-black shadow-[1px_1px_0px_0px_#000000]' 
                            : 'bg-rose-300 text-black shadow-[1px_1px_0px_0px_#000000]'
                        }`}>
                          {d.type === 'Damage' ? 'নষ্ট (Damage)' : 'হারানো (Lost)'}
                        </span>
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-right font-black text-slate-700 font-sans">
                        {formatCurrency(d.cost)}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-right font-black text-red-600 font-sans">
                        {formatCurrency(d.qty * d.cost)}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-xs font-bold text-slate-600 max-w-[180px] truncate" title={d.note}>
                        {d.note || '-'}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(d)}
                            className="p-1.5 border-2 border-black bg-white hover:bg-yellow-400 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                            title="সম্পাদনা করুন"
                          >
                            <Edit size={12} className="stroke-[2.5]" />
                          </button>
                          {onDeleteDamage && (
                            <button
                              onClick={() => onDeleteDamage(d.id)}
                              className="p-1.5 border-2 border-black bg-red-100 hover:bg-red-500 hover:text-white text-red-700 transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                              title="মুছে ফেলুন"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="damage-modal">
          <div className="bg-white border-4 border-black p-6 relative max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <button 
              onClick={() => {
                setIsAddOpen(false);
                setEditingDamage(null);
              }}
              className="absolute right-4 top-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>

            <h3 className="text-lg font-black uppercase italic text-black mb-4 border-b-3 border-black pb-3 flex items-center gap-1.5">
              <ShieldAlert size={18} className="text-rose-600 stroke-[2.5]" />
              {editingDamage ? 'তথ্য সংশোধন (Edit)' : 'ক্ষতিগ্রস্ত মালামাল এন্ট্রি'}
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
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">অনুমান ক্ষতিমূল্য (৳ - প্রতি ইউনিট)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={cost || ''}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-600 block mb-1">ক্ষতির ধরন (Type)</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs font-black text-black cursor-pointer">
                    <input
                      type="radio"
                      name="damageType"
                      checked={type === 'Damage'}
                      onChange={() => setType('Damage')}
                      className="accent-black h-4 w-4"
                    />
                    নষ্ট বা ক্ষতিগ্রস্ত (Damage)
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-black text-black cursor-pointer">
                    <input
                      type="radio"
                      name="damageType"
                      checked={type === 'Lost'}
                      onChange={() => setType('Lost')}
                      className="accent-black h-4 w-4"
                    />
                    হারিয়ে গেছে (Lost)
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-600 block mb-1">মন্তব্য (নোট)</label>
                <textarea
                  placeholder="যেমন: বিয়ের প্যান্ডেল খোলার সময় মরিচ বাতির চেইন কাটা পড়েছে..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50 h-20 resize-none"
                />
              </div>

              {/* Total Calculation Show */}
              <div className="p-3 bg-rose-50 border-2 border-black text-black flex items-center justify-between text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span>মোট ক্ষতির পরিমাণ:</span>
                <span className="text-sm font-black text-rose-600 font-sans">{formatCurrency(qty * cost)}</span>
              </div>

              <div className="flex justify-end gap-3 border-t-3 border-black pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingDamage(null);
                  }}
                  className="px-4 py-2 bg-white text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-yellow-500 cursor-pointer"
                >
                  {editingDamage ? 'আপডেট করুন' : 'রেকর্ড সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
