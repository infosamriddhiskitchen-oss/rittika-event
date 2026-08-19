import React, { useState, useMemo } from 'react';
import { Plus, Search, DollarSign, Calendar, FileText, X, Edit, Trash2 } from 'lucide-react';
import { ExpenseEntry } from '../types';
import { formatCurrency, toBengaliNumber } from '../utils';

interface ExpenseTrackerProps {
  expenses: ExpenseEntry[];
  onAddExpense: (expense: Omit<ExpenseEntry, 'id'>) => void;
  onUpdateExpense?: (id: string, expense: Omit<ExpenseEntry, 'id'>) => void;
  onDeleteExpense?: (id: string) => void;
}

export default function ExpenseTracker({
  expenses,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense
}: ExpenseTrackerProps) {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseEntry | null>(null);

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<'গাড়ি ভাড়া' | 'শ্রমিক খরচ' | 'বিদ্যুৎ' | 'খাবার' | 'অন্যান্য'>('গাড়ি ভাড়া');
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState('');

  const handleEditClick = (e: ExpenseEntry) => {
    setEditingExpense(e);
    setDate(e.date || '');
    setCategory(e.category || 'গাড়ি ভাড়া');
    setAmount(e.amount || 0);
    setNote(e.note || '');
    setIsAddOpen(true);
  };

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => 
      e.category.toLowerCase().includes(search.toLowerCase()) ||
      (e.note && e.note.toLowerCase().includes(search.toLowerCase()))
    ).sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, search]);

  const totalExpenseSum = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('অনুগ্রহ করে সঠিক টাকার পরিমাণ দিন!');
      return;
    }

    const payload = {
      date,
      category,
      amount: Number(amount),
      note: note.trim()
    };

    if (editingExpense && onUpdateExpense) {
      onUpdateExpense(editingExpense.id, payload);
    } else {
      onAddExpense(payload);
    }

    setAmount(0);
    setNote('');
    setEditingExpense(null);
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-8" id="expense-tracker-tab">
      
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <h2 className="text-2xl font-black uppercase italic text-black">ব্যবসায়িক খরচ হিসাব (Expense Sheet)</h2>
          <p className="text-sm font-bold text-slate-700 mt-1">গাড়ি ভাড়া, শ্রমিক মজুরি, বিদ্যুৎ বিল, খাওয়া-দাওয়া ইত্যাদি দৈনন্দিন খরচের বিবরণ খাতা।</p>
        </div>
        <button
          id="add-expense-btn"
          onClick={() => {
            setEditingExpense(null);
            setDate(new Date().toISOString().split('T')[0]);
            setCategory('গাড়ি ভাড়া');
            setAmount(0);
            setNote('');
            setIsAddOpen(true);
          }}
          className="neo-btn neo-btn-danger px-4 py-2 text-sm flex items-center gap-1.5"
        >
          <Plus size={16} className="stroke-[2.5]" />
          নতুন খরচ যুক্ত করুন
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="expense-stats">
        
        {/* Total Expense amount */}
        <div className="neo-card p-5 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
          <div>
            <span className="text-slate-600 text-xs font-black uppercase tracking-wider block">মোট খরচের পরিমাণ</span>
            <span className="text-2xl font-black text-rose-600 block mt-1">
              {formatCurrency(totalExpenseSum)}
            </span>
            <span className="text-xs text-black font-black mt-1 block">নিবন্ধিত খরচের ভাউচার</span>
          </div>
          <div className="w-12 h-12 border-3 border-black bg-rose-400 flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <DollarSign size={22} className="stroke-[2.5]" />
          </div>
        </div>

        {/* Total Expense vouchers count */}
        <div className="neo-card p-5 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
          <div>
            <span className="text-slate-600 text-xs font-black uppercase tracking-wider block">মোট খরচ ভাউচার</span>
            <span className="text-2xl font-black text-black block mt-1 font-mono tracking-tighter">
              {toBengaliNumber(filteredExpenses.length)} টি এন্ট্রি
            </span>
            <span className="text-xs text-slate-500 font-bold mt-1 block">মোট খরচ ডাটাবেস</span>
          </div>
          <div className="w-12 h-12 border-3 border-black bg-yellow-400 flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Calendar size={22} className="stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="relative" id="expense-search-panel">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black stroke-[2.5]" size={18} />
        <input
          id="expense-search-input"
          type="text"
          placeholder="খরচের ধরন (যেমন: গাড়ি ভাড়া) বা নোট লিখে সার্চ করুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border-3 border-black rounded-none text-sm text-black font-bold focus:outline-none focus:bg-yellow-50"
        />
      </div>

      {/* Expense History Table */}
      <div className="neo-card overflow-hidden" id="expense-history-table">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="expense-table">
            <thead>
              <tr className="bg-slate-100 border-b-3 border-black text-black text-xs font-black uppercase tracking-wider">
                <th className="py-4 px-4 border-r border-black/10">তারিখ</th>
                <th className="py-4 px-4 border-r border-black/10">খরচের ক্যাটাগরি</th>
                <th className="py-4 px-4 border-r border-black/10 text-right">খরচের পরিমাণ (৳)</th>
                <th className="py-4 px-4 border-r border-black/10">বিশেষ নোট / বিবরণ</th>
                <th className="py-4 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm font-bold text-black uppercase">
                    কোন খরচের রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(e => (
                  <tr key={e.id} className="border-b-2 border-black/10 hover:bg-yellow-50/50 transition">
                    <td className="py-4 px-4 border-r border-black/10 text-xs font-black text-slate-700 font-mono">
                      {toBengaliNumber(e.date)}
                    </td>
                    <td className="py-4 px-4 border-r border-black/10">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 border-2 border-black ${
                        e.category === 'গাড়ি ভাড়া' ? 'bg-amber-300 text-black shadow-[1px_1px_0px_0px_#000000]' :
                        e.category === 'শ্রমিক খরচ' ? 'bg-indigo-300 text-black shadow-[1px_1px_0px_0px_#000000]' :
                        e.category === 'বিদ্যুৎ' ? 'bg-teal-300 text-black shadow-[1px_1px_0px_0px_#000000]' :
                        e.category === 'খাবার' ? 'bg-orange-300 text-black shadow-[1px_1px_0px_0px_#000000]' :
                        'bg-slate-300 text-black shadow-[1px_1px_0px_0px_#000000]'
                      }`}>
                        {e.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 border-r border-black/10 text-right font-black text-rose-600 font-sans">
                      {formatCurrency(e.amount)}
                    </td>
                    <td className="py-4 px-4 border-r border-black/10 text-xs font-bold text-slate-700">
                      {e.note || '-'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(e)}
                          className="p-1.5 border-2 border-black bg-white hover:bg-yellow-400 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                          title="সম্পাদনা করুন"
                        >
                          <Edit size={12} className="stroke-[2.5]" />
                        </button>
                        {onDeleteExpense && (
                          <button
                            onClick={() => onDeleteExpense(e.id)}
                            className="p-1.5 border-2 border-black bg-red-100 hover:bg-red-500 hover:text-white text-red-700 transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={12} className="stroke-[2.5]" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Entry Modal Form */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="expense-modal">
          <div className="bg-white border-4 border-black p-6 relative max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <button 
              onClick={() => {
                setIsAddOpen(false);
                setEditingExpense(null);
                setAmount(0);
                setNote('');
              }}
              className="absolute right-4 top-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>

            <h3 className="text-lg font-black uppercase italic text-black mb-4 border-b-3 border-black pb-3 flex items-center gap-1.5">
              <FileText size={18} className="text-rose-600 stroke-[2.5]" />
              {editingExpense ? 'ব্যবসায়িক খরচ সংশোধন' : 'ব্যবসায়িক খরচ এন্ট্রি'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-black">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">ক্যাটাগরি</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none"
                  >
                    <option value="গাড়ি ভাড়া">গাড়ি ভাড়া</option>
                    <option value="শ্রমিক খরচ">শ্রমিক খরচ</option>
                    <option value="বিদ্যুৎ">বিদ্যুৎ বিল</option>
                    <option value="খাবার">খাবার খরচ</option>
                    <option value="অন্যান্য">অন্যান্য খরচ</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">খরচের পরিমাণ (৳)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-600 block mb-1">খরচের বিবরণ / মন্তব্য</label>
                <textarea
                  placeholder="যেমন: ৩ জন কামলার দুপুরের চা-নাস্তা এবং দুপুরের মিল..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50 h-20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t-3 border-black pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingExpense(null);
                    setAmount(0);
                    setNote('');
                  }}
                  className="px-4 py-2 bg-white text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-yellow-500 cursor-pointer"
                >
                  {editingExpense ? 'আপডেট করুন' : 'খরচ সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
