import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ClipboardCheck, ArrowUpRight, ArrowDownRight, Briefcase } from 'lucide-react';
import { StockItem, PurchaseEntry, SalesEntry, RentalOutEntry, ExpenseEntry, DamageEntry } from '../types';
import { calculateCurrentStock, formatCurrency, toBengaliNumber } from '../utils';

interface ProfitLossProps {
  stockItems: StockItem[];
  purchases: PurchaseEntry[];
  sales: SalesEntry[];
  rentals: RentalOutEntry[];
  expenses: ExpenseEntry[];
  damages: DamageEntry[];
}

export default function ProfitLoss({
  stockItems,
  purchases,
  sales,
  rentals,
  expenses,
  damages
}: ProfitLossProps) {
  
  // Real-time calculated states
  const computedStockList = useMemo(() => {
    return stockItems.map(item => ({
      ...item,
      currentStock: calculateCurrentStock(item, purchases, sales, rentals, damages)
    }));
  }, [stockItems, purchases, sales, rentals, damages]);

  // Total Stock Asset Value (current stock * purchase price)
  const totalStockAssetValue = useMemo(() => {
    return computedStockList.reduce((sum, item) => {
      const positiveStock = Math.max(0, item.currentStock);
      return sum + (positiveStock * item.purchasePrice);
    }, 0);
  }, [computedStockList]);

  // Income: Sales + Rental Bills
  const totalSalesIncome = useMemo(() => {
    return sales.reduce((sum, s) => sum + s.totalAmount, 0);
  }, [sales]);

  const totalRentalIncome = useMemo(() => {
    return rentals.reduce((sum, r) => sum + r.totalBill, 0);
  }, [rentals]);

  const totalRevenue = totalSalesIncome + totalRentalIncome;

  // Expenses: Purchases + General Expenses
  const totalPurchasesCost = useMemo(() => {
    return purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  }, [purchases]);

  const totalGeneralExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // Cost of damages/losses
  const totalDamageCost = useMemo(() => {
    return damages.reduce((sum, d) => sum + (d.qty * d.cost), 0);
  }, [damages]);

  const totalOutgoingExpenses = totalPurchasesCost + totalGeneralExpenses + totalDamageCost;

  // Net Profit / Loss = Revenue - Expenses
  const netProfit = totalRevenue - totalOutgoingExpenses;
  const isProfit = netProfit >= 0;

  // Group expenses by category
  const expensesByCategory = useMemo(() => {
    const categories: { [key: string]: number } = {
      'গাড়ি ভাড়া': 0,
      'শ্রমিক খরচ': 0,
      'বিদ্যুৎ': 0,
      'খাবার': 0,
      'অন্যান্য': 0
    };
    expenses.forEach(e => {
      if (categories[e.category] !== undefined) {
        categories[e.category] += e.amount;
      } else {
        categories['অন্যান্য'] += e.amount;
      }
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  return (
    <div className="space-y-8" id="profit-loss-tab">
      
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <h2 className="text-2xl font-black uppercase italic text-black">লাভ-ক্ষতি ও ব্যবসা রিপোর্ট (Profit & Loss)</h2>
          <p className="text-sm font-bold text-slate-700 mt-1">ব্যবসার মোট আয়, মোট ব্যয়, স্টকের আর্থিক মূল্য এবং লাভ বা ক্ষতির রিয়েল-টাইম রিপোর্ট।</p>
        </div>
        <button
          onClick={() => window.print()}
          className="neo-btn neo-btn-primary px-4 py-2 text-sm flex items-center gap-1.5 no-print"
        >
          রিপোর্ট প্রিন্ট করুন
        </button>
      </div>

      {/* Primary Net Indicator Card */}
      <div className={`border-4 border-black p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${
        isProfit 
          ? 'bg-emerald-300' 
          : 'bg-rose-300'
      }`} id="net-profit-card">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs font-black uppercase tracking-wider text-black block">নিট লাভ বা ক্ষতি (Net Profit / Loss)</span>
          <h1 className="text-4xl font-black text-black">
            {formatCurrency(Math.abs(netProfit))}
          </h1>
          <p className="text-xs font-black text-slate-900">
            {isProfit 
              ? 'অভিনন্দন! আপনার ব্যবসা বর্তমানে লাভজনক অবস্থায় রয়েছে।' 
              : 'সতর্কতা! আপনার ব্যয় আয়ের চেয়ে বেশি রয়েছে। খরচ নিয়ন্ত্রণে রাখুন।'
            }
          </p>
        </div>
        
        <div className="w-14 h-14 border-4 border-black bg-white text-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          {isProfit ? <ArrowUpRight size={32} className="stroke-[3]" /> : <ArrowDownRight size={32} className="stroke-[3]" />}
        </div>
      </div>

      {/* Grid of details breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="reporting-breakdown-grid">
        
        {/* Income Details Card */}
        <div className="neo-card p-6 space-y-4" id="income-details-panel">
          <h3 className="text-base font-black uppercase italic text-black flex items-center gap-1.5 border-b-3 border-black pb-3 mb-2">
            <TrendingUp size={18} className="text-emerald-700 stroke-[2.5]" />
            মোট আয় বিবরণী (Inflow Revenue)
          </h3>

          <div className="space-y-4 text-xs font-bold text-black">
            <div className="flex justify-between items-center pb-2 border-b-2 border-black/10">
              <span className="text-slate-700">সরাসরি বিক্রয় থেকে আয়</span>
              <span className="font-black font-sans text-sm">{formatCurrency(totalSalesIncome)}</span>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b-2 border-black/10">
              <span className="text-slate-700">ডেকোরেশন সামগ্রী ভাড়া বাবদ আয়</span>
              <span className="font-black font-sans text-sm">{formatCurrency(totalRentalIncome)}</span>
            </div>

            <div className="flex justify-between items-center pt-2 text-emerald-800 font-black border-t-2 border-black">
              <span className="text-sm">সর্বমোট রাজস্ব আয় (Total Revenue)</span>
              <span className="text-base font-sans font-black">{formatCurrency(totalRevenue)}</span>
            </div>
          </div>
        </div>

        {/* Expenses Details Card */}
        <div className="neo-card p-6 space-y-4" id="expense-details-panel">
          <h3 className="text-base font-black uppercase italic text-black flex items-center gap-1.5 border-b-3 border-black pb-3 mb-2">
            <TrendingDown size={18} className="text-rose-600 stroke-[2.5]" />
            মোট ব্যয় বিবরণী (Outflow Expenses)
          </h3>

          <div className="space-y-4 text-xs font-bold text-black">
            <div className="flex justify-between items-center pb-2 border-b-2 border-black/10">
              <span className="text-slate-700">মালামাল ক্রয়ের জন্য ব্যয়</span>
              <span className="font-black font-sans text-sm">{formatCurrency(totalPurchasesCost)}</span>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b-2 border-black/10">
              <span className="text-slate-700">সাধারণ ব্যবসায়িক খরচ</span>
              <span className="font-black font-sans text-sm">{formatCurrency(totalGeneralExpenses)}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b-2 border-black/10">
              <span className="text-slate-700">নষ্ট/হারানো মালামালের ক্ষতি</span>
              <span className="font-black font-sans text-sm">{formatCurrency(totalDamageCost)}</span>
            </div>

            <div className="flex justify-between items-center pt-2 text-rose-700 font-black border-t-2 border-black">
              <span className="text-sm">সর্বমোট ব্যয় (Total Expenses)</span>
              <span className="text-base font-sans font-black">{formatCurrency(totalOutgoingExpenses)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Asset Valuation Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="reporting-assets-and-subcategories">
        
        {/* Business Assets Valuation */}
        <div className="neo-card p-6 flex flex-col justify-between" id="asset-valuation-panel">
          <div>
            <h3 className="text-base font-black uppercase italic text-black flex items-center gap-1.5 border-b-3 border-black pb-3 mb-4">
              <Briefcase size={18} className="text-teal-700 stroke-[2.5]" />
              ব্যবসায়িক সম্পদ (Asset Valuation)
            </h3>
            
            <p className="text-xs font-bold text-slate-700 mb-4 leading-relaxed">
              আপনার গুদামে বর্তমানে সচল থাকা মালামালের মোট ক্রয়মূল্যের যোগফল। এটি সরাসরি নগদ টাকা না হলেও আপনার ব্যবসার মূল সম্পদ।
            </p>

            <div className="p-4 bg-teal-300 border-2 border-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-[10px] font-black uppercase text-teal-950 block">মোট মজুদ মাল ভ্যালু (বাজার দর):</span>
              <span className="text-2xl font-black block mt-1 font-sans">{formatCurrency(totalStockAssetValue)}</span>
            </div>
          </div>

          <p className="text-[10px] font-bold text-slate-500 italic mt-6">
            *প্রারম্ভিক স্টক ও ক্রয়ের পর ভাড়ায় থাকা সামগ্রীসহ মোট সচল পরিমাণ থেকে হিসাবকৃত।
          </p>
        </div>

        {/* Expenses by Categories Chart */}
        <div className="neo-card p-6 md:col-span-2" id="expense-by-cat-panel">
          <h3 className="text-base font-black uppercase italic text-black flex items-center gap-1.5 border-b-3 border-black pb-3 mb-4">
            <Wallet size={18} className="text-indigo-600 stroke-[2.5]" />
            ক্যাটাগরি অনুযায়ী খরচের বিশ্লেষণ
          </h3>

          <div className="space-y-4 text-xs font-bold text-black">
            {expensesByCategory.map(item => {
              const totalSum = totalGeneralExpenses || 1;
              const pct = (item.value / totalSum) * 100;

              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-800">{item.name}</span>
                    <span className="font-black text-slate-900 font-sans">
                      {formatCurrency(item.value)} ({toBengaliNumber(pct.toFixed(0))}%)
                    </span>
                  </div>
                  <div className="w-full h-4 bg-white border-2 border-black overflow-hidden rounded-none">
                    <div 
                      className="h-full bg-indigo-400 border-r-2 border-black transition-all duration-300"
                      style={{ width: `${Math.max(2, pct)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
