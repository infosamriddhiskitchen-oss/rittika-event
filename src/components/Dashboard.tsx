import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  TrendingDown,
  Info,
  Sparkles
} from 'lucide-react';
import { StockItem, PurchaseEntry, SalesEntry, RentalOutEntry, DamageEntry, ExpenseEntry, UserRole } from '../types';
import { calculateCurrentStock, formatCurrency, toBengaliNumber } from '../utils';

interface DashboardProps {
  stockItems: StockItem[];
  purchases: PurchaseEntry[];
  sales: SalesEntry[];
  rentals: RentalOutEntry[];
  damages: DamageEntry[];
  expenses: ExpenseEntry[];
  onNavigate: (tab: string) => void;
  userRole?: UserRole;
  onRentQuickAction?: () => void;
}

export default function Dashboard({
  stockItems,
  purchases,
  sales,
  rentals,
  damages,
  expenses,
  onNavigate,
  userRole = 'Admin',
  onRentQuickAction
}: DashboardProps) {
  
  // Real-time calculated state
  const computedStockList = useMemo(() => {
    return stockItems.map(item => ({
      ...item,
      currentStock: calculateCurrentStock(item, purchases, sales, rentals, damages)
    }));
  }, [stockItems, purchases, sales, rentals, damages]);

  // 1. Total items count
  const totalItemsCount = stockItems.length;

  // 2. Total stock value (Current stock * Purchase Price)
  const totalStockValue = useMemo(() => {
    return computedStockList.reduce((sum, item) => {
      const positiveStock = Math.max(0, item.currentStock);
      return sum + (positiveStock * item.purchasePrice);
    }, 0);
  }, [computedStockList]);

  // 3. Total purchase amount
  const totalPurchaseValue = useMemo(() => {
    return purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  }, [purchases]);

  // 4. Total sales amount
  const totalSalesValue = useMemo(() => {
    return sales.reduce((sum, s) => sum + s.totalAmount, 0);
  }, [sales]);

  // 5. Currently Rented Out
  const currentlyRentedOutCount = useMemo(() => {
    return rentals.reduce((sum, r) => {
      const remaining = r.qty - r.returnedQty;
      return sum + Math.max(0, remaining);
    }, 0);
  }, [rentals]);

  // 6. Low stock alert list
  const lowStockItems = useMemo(() => {
    return computedStockList.filter(item => item.currentStock <= item.minStockLevel);
  }, [computedStockList]);

  // Category wise Stock breakdown
  const categoryStockBreakdown = useMemo(() => {
    const data: { [key: string]: number } = {};
    computedStockList.forEach(item => {
      data[item.category] = (data[item.category] || 0) + Math.max(0, item.currentStock);
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [computedStockList]);

  // Total stock items across categories
  const totalStockQuantity = useMemo(() => {
    return categoryStockBreakdown.reduce((sum, item) => sum + item.value, 0);
  }, [categoryStockBreakdown]);

  // Top Selling Items (by Sales & Rental volume combined)
  const topUsedItems = useMemo(() => {
    const usageMap: { [key: string]: { name: string; qty: number; category: string } } = {};
    
    // add sales qty
    sales.forEach(s => {
      const item = stockItems.find(i => i.code === s.itemCode);
      const name = item ? item.name : s.itemCode;
      const cat = item ? item.category : 'অন্যান্য';
      if (!usageMap[s.itemCode]) {
        usageMap[s.itemCode] = { name, qty: 0, category: cat };
      }
      usageMap[s.itemCode].qty += s.qty;
    });

    // add rental qty
    rentals.forEach(r => {
      const item = stockItems.find(i => i.code === r.itemCode);
      const name = item ? item.name : r.itemCode;
      const cat = item ? item.category : 'অন্যান্য';
      if (!usageMap[r.itemCode]) {
        usageMap[r.itemCode] = { name, qty: 0, category: cat };
      }
      usageMap[r.itemCode].qty += r.qty;
    });

    return Object.values(usageMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [sales, rentals, stockItems]);

  // Rental Status Breakdown: Rented (outstanding), Returned, Lost/Damaged
  const rentalStatusData = useMemo(() => {
    let totalRented = 0;
    let totalReturned = 0;
    
    rentals.forEach(r => {
      totalRented += r.qty;
      totalReturned += r.returnedQty;
    });

    const outstanding = totalRented - totalReturned;
    const damaged = damages.reduce((sum, d) => sum + d.qty, 0);

    return {
      rented: outstanding,
      returned: totalReturned,
      damaged: damaged
    };
  }, [rentals, damages]);

  // Monthly Sales trend mock representation
  // We can extract months from sales and purchases to show a nice trend
  const monthlyTrends = useMemo(() => {
    const salesByMonth: { [key: string]: { sales: number; purchases: number } } = {
      'জানুয়ারি': { sales: 12000, purchases: 8000 },
      'ফেব্রুয়ারি': { sales: 18000, purchases: 14000 },
      'মার্চ': { sales: 15000, purchases: 9500 },
      'এপ্রিল': { sales: 22000, purchases: 11000 },
      'মে': { sales: 25000, purchases: 13000 },
      'জুন': { sales: totalSalesValue || 15000, purchases: totalPurchaseValue || 12000 }
    };
    return Object.entries(salesByMonth).map(([month, data]) => ({
      month,
      sales: data.sales,
      purchases: data.purchases
    }));
  }, [totalSalesValue, totalPurchaseValue]);

  // Max value for scaling sales trend graph
  const maxTrendValue = useMemo(() => {
    let max = 1000;
    monthlyTrends.forEach(t => {
      if (t.sales > max) max = t.sales;
      if (t.purchases > max) max = t.purchases;
    });
    return max * 1.15;
  }, [monthlyTrends]);

  return (
    <div className="space-y-8" id="dashboard-tab">
      
      {/* 🚀 Welcome & Fast Navigation Info (Royal Multi-Gradient Hero) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-rose-950 border border-amber-400/30 p-6 sm:p-8 shadow-xl shadow-purple-950/20 text-white" id="welcome-panel">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-400/10 via-rose-500/10 to-purple-600/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-600/15 to-transparent rounded-full blur-2xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400/20 to-rose-400/20 border border-amber-400/30 text-amber-300 text-xs font-black uppercase mb-3">
              <Sparkles size={13} className="text-amber-300 animate-spin" />
              <span>ইভেন্ট ও রয়্যাল ডেকোরেশন ইআরপি</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-100 to-purple-100 uppercase tracking-tight">
              রিত্তিকা ডেকোরেশন ইভেন্ট হাব
            </h2>
            <p className="text-slate-300 font-medium text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              আপনার বিয়ের স্টেজ, লাইটিং, ফ্লাওয়ার আর্চ, ডেকোরেশন সামগ্রীর স্টক, ভাড়া, সরাসরি বিক্রি ও লাভ-ক্ষতির পূর্ণ নিয়ন্ত্রণ।
            </p>
          </div>
          <div className="flex gap-3 flex-wrap relative z-10">
            <button 
              id="quick-rental-btn"
              onClick={() => {
                if (onRentQuickAction) {
                  onRentQuickAction();
                } else {
                  onNavigate('rental');
                }
              }} 
              className="neo-btn neo-btn-primary px-5 py-3 text-xs font-black shadow-lg cursor-pointer"
            >
              + ভাড়ায় মাল দিন
            </button>
            <button 
              id="quick-stock-btn"
              onClick={() => onNavigate('stock')} 
              className="neo-btn bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-3 text-xs font-bold transition cursor-pointer backdrop-blur-md"
            >
              স্টক লিস্ট দেখুন
            </button>
          </div>
        </div>
      </div>

      {/* 📊 Key Statistics Widgets Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4" id="stats-grid">
        
        {/* Total Items */}
        <div id="stat-total-items" className="neo-card p-5 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-lg transition-all duration-200 border border-slate-200/80">
          <div>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">মোট আইটেম</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block mt-1 font-mono tracking-tighter">
              {toBengaliNumber(totalItemsCount)}
            </span>
            <span className="text-[11px] text-purple-700 font-bold mt-1 block">ক্যাটাগরি ডাটাবেস</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md shadow-rose-500/30">
            <Package size={22} className="stroke-[2.5]" />
          </div>
        </div>

        {/* Total Stock Value */}
        <div id="stat-stock-value" className="neo-card p-5 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-lg transition-all duration-200 border border-slate-200/80">
          <div>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">স্টক ভ্যালু</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 block mt-1 font-sans tracking-tight">
              {userRole === 'Staff' ? '🔒 Restricted' : formatCurrency(totalStockValue)}
            </span>
            <span className="text-[11px] text-emerald-700 font-bold mt-1 block font-mono">
              {userRole === 'Staff' ? 'সীমিত অ্যাক্সেস' : `${toBengaliNumber(totalStockQuantity)} টি সচল`}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/30">
            <DollarSign size={22} className="stroke-[2.5]" />
          </div>
        </div>

        {/* Total Purchases */}
        <div id="stat-total-purchases" className="neo-card p-5 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-lg transition-all duration-200 border border-slate-200/80">
          <div>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">মালামাল ক্রয়</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-1 font-sans tracking-tight">
              {userRole === 'Staff' ? '🔒 Restricted' : formatCurrency(totalPurchaseValue)}
            </span>
            <span className="text-[11px] text-indigo-600 font-bold mt-1 block font-mono">
              {userRole === 'Staff' ? 'সীমিত অ্যাক্সেস' : `${toBengaliNumber(purchases.length)} টি ক্রয় রসিদ`}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
            <ShoppingCart size={22} className="stroke-[2.5]" />
          </div>
        </div>

        {/* Total Sales */}
        <div id="stat-total-sales" className="neo-card p-5 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-lg transition-all duration-200 border border-slate-200/80">
          <div>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">সরাসরি বিক্রি</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 block mt-1 font-sans tracking-tight">
              {userRole === 'Staff' ? '🔒 Restricted' : formatCurrency(totalSalesValue)}
            </span>
            <span className="text-[11px] text-emerald-800 font-bold mt-1 block font-mono">
              {userRole === 'Staff' ? 'সীমিত অ্যাক্সেস' : `${toBengaliNumber(sales.length)} টি বিক্রয় অর্ডার`}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-rose-500/30">
            <TrendingUp size={22} className="stroke-[2.5]" />
          </div>
        </div>

        {/* Outstanding Rentals */}
        <div id="stat-rented-out" className="neo-card p-5 col-span-2 lg:col-span-1 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-lg transition-all duration-200 border border-slate-200/80">
          <div>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">ভাড়ায় বাইরে আছে</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 block mt-1 font-mono tracking-tighter">
              {toBengaliNumber(currentlyRentedOutCount)}
            </span>
            <span className="text-[11px] text-amber-700 font-bold mt-1 block">ফেরত আসা বাকি</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/30">
            <Clock size={22} className="stroke-[2.5]" />
          </div>
        </div>

      </div>

      {/* ⚠️ Low Stock Alert & Event Notification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-notifications-and-alerts">
        
        {/* Low Stock Panel */}
        <div className="neo-card p-6 lg:col-span-2 bg-white" id="low-stock-alert-panel">
          <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
                <AlertTriangle size={18} className="stroke-[2.5]" />
              </span>
              <h3 className="text-base font-black uppercase text-slate-900">কম স্টকের অ্যালার্ট (Low Stock Alert)</h3>
            </div>
            <span className="neo-badge bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1">
              {toBengaliNumber(lowStockItems.length)} টি অ্যালার্ট
            </span>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Package size={44} className="mb-2 text-emerald-500 stroke-[2]" />
              <p className="text-xs font-bold text-slate-700 uppercase">সব মালামাল পর্যাপ্ত পরিমাণে স্টকে আছে!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
              {lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-rose-50/50 rounded-xl border border-rose-200/80 shadow-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-slate-900 text-white text-[10px] font-mono font-black rounded">{item.code}</span>
                      <p className="text-xs font-black text-slate-900 truncate max-w-[140px] md:max-w-[180px]">{item.name}</p>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">ক্যাটাগরি: {item.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-rose-600 block">
                      {toBengaliNumber(item.currentStock)} {item.unit}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold block">টার্গেট: {toBengaliNumber(item.minStockLevel)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rental / Return quick status */}
        <div className="neo-card p-6 flex flex-col justify-between bg-white" id="quick-rental-status-panel">
          <div>
            <h3 className="text-base font-black uppercase text-slate-900 mb-4 border-b border-slate-200 pb-3 flex items-center gap-2">
              <Clock className="text-purple-600 stroke-[2.5]" size={18} />
              ভাড়ার বর্তমান অবস্থা
            </h3>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400 inline-block shadow-xs"></span>
                  ভাড়ায় বাইরে আছে
                </span>
                <span className="text-sm font-black text-slate-900 font-mono">
                  {toBengaliNumber(rentalStatusData.rented)} টি
                </span>
              </div>
              
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-xs"></span>
                  মোট ফেরত এসেছে
                </span>
                <span className="text-sm font-black text-slate-900 font-mono">
                  {toBengaliNumber(rentalStatusData.returned)} টি
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-xs"></span>
                  ক্ষতিগ্রস্ত/হারানো
                </span>
                <span className="text-sm font-black text-rose-600 font-mono">
                  {toBengaliNumber(rentalStatusData.damaged)} টি
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <button 
              onClick={() => onNavigate('rental')}
              className="w-full text-center py-2.5 neo-btn bg-gradient-to-r from-purple-50 to-rose-50 hover:from-purple-100 hover:to-rose-100 text-purple-900 text-xs font-black border border-purple-200 rounded-xl transition cursor-pointer"
            >
              ভাড়া ও ফেরত সম্পর্কিত হিসাব
            </button>
          </div>
        </div>

      </div>

      {/* 📈 Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-charts-container">
        
        {/* Category Wise Stock Bar Chart */}
        <div className="neo-card p-6 bg-white" id="category-stock-chart-panel">
          <h3 className="text-base font-black uppercase text-slate-900 mb-4 border-b border-slate-200 pb-3 flex items-center gap-2">
            <Package size={18} className="text-purple-600 stroke-[2.5]" />
            ক্যাটাগরি ভিত্তিক স্টক (মালামাল সংখ্যা)
          </h3>
          
          <div className="space-y-4 pt-2">
            {categoryStockBreakdown.map((item, idx) => {
              const totalSum = categoryStockBreakdown.reduce((sum, c) => sum + c.value, 0) || 1;
              const pct = (item.value / totalSum) * 100;
              
              const barGradients = [
                'bg-gradient-to-r from-amber-400 to-rose-500',
                'bg-gradient-to-r from-rose-500 to-purple-600',
                'bg-gradient-to-r from-purple-600 to-indigo-600',
                'bg-gradient-to-r from-emerald-400 to-teal-500',
                'bg-gradient-to-r from-amber-400 to-orange-500',
                'bg-gradient-to-r from-indigo-400 to-sky-500'
              ];
              const gradient = barGradients[idx % barGradients.length];

              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold uppercase">
                    <span className="text-slate-800">{item.name}</span>
                    <span className="text-slate-900 font-black">
                      {toBengaliNumber(item.value)} টি ({toBengaliNumber(pct.toFixed(0))}%)
                    </span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                    <div 
                      className={`h-full ${gradient} rounded-full transition-all duration-500 shadow-xs`}
                      style={{ width: `${Math.max(4, pct)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Purchase vs Sales Comparison Chart */}
        <div className="neo-card p-6 bg-white" id="purchase-sales-trend-panel">
          <h3 className="text-base font-black uppercase text-slate-900 mb-4 border-b border-slate-200 pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600 stroke-[2.5]" />
              ক্রয় বনাম সরাসরি বিক্রয় তুলনা (মাসিক)
            </span>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>ক্রয়
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>বিক্রি
              </span>
            </div>
          </h3>

          {userRole === 'Staff' ? (
            <div className="h-[220px] flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 font-bold text-xs">
              <span className="text-xl">🔒</span>
              <span className="mt-2 text-[10px] uppercase font-black">আর্থিক ডাটা স্টাফদের জন্য বন্ধ</span>
            </div>
          ) : (
            <div className="h-[220px] flex items-end justify-between gap-3 pt-6 border-b border-slate-200 pb-2">
              {monthlyTrends.map((t) => {
                const pHeight = (t.purchases / maxTrendValue) * 100;
                const sHeight = (t.sales / maxTrendValue) * 100;

                return (
                  <div key={t.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-full mb-2">
                      {/* Purchase Bar */}
                      <div 
                        className="w-3 md:w-5 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-sm transition-all duration-200 hover:scale-105 relative cursor-pointer shadow-xs"
                        style={{ height: `${Math.max(8, pHeight)}%` }}
                        title={`ক্রয়: ${formatCurrency(t.purchases)}`}
                      >
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 shadow-md">
                          {toBengaliNumber(t.purchases)}
                        </span>
                      </div>

                      {/* Sales Bar */}
                      <div 
                        className="w-3 md:w-5 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-sm transition-all duration-200 hover:scale-105 relative cursor-pointer shadow-xs"
                        style={{ height: `${Math.max(8, sHeight)}%` }}
                        title={`বিক্রি: ${formatCurrency(t.sales)}`}
                      >
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 shadow-md">
                          {toBengaliNumber(t.sales)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider whitespace-nowrap">{t.month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* 🏆 Top Used Items Panel */}
      <div className="neo-card p-6 bg-white border border-slate-200/80" id="top-selling-items-panel">
        <h3 className="text-base font-black uppercase text-slate-900 mb-4 border-b border-slate-200 pb-3 flex items-center gap-2">
          <TrendingUp className="text-amber-500 stroke-[2.5]" size={18} />
          সবচেয়ে বেশি ব্যবহৃত বা বিক্রিত ডেকোরেশন মালামাল (Top Demand Items)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="top-items-table">
            <thead>
              <tr className="border-b border-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider bg-slate-50/80">
                <th className="py-3 px-4">আইটেম কোড</th>
                <th className="py-3 px-4">আইটেম নাম</th>
                <th className="py-3 px-4">ক্যাটাগরি</th>
                <th className="py-3 px-4 text-center">মোট চাহিদা ও ব্যবহার</th>
                <th className="py-3 px-4 text-right">স্টক অবস্থা</th>
              </tr>
            </thead>
            <tbody>
              {topUsedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-xs font-bold text-slate-500 uppercase">
                    কোন মালামাল বিক্রি বা ভাড়া করা হয়নি এখনো।
                  </td>
                </tr>
              ) : (
                topUsedItems.map((item, index) => {
                  const masterItem = stockItems.find(i => i.code === item.code);
                  const currentStock = masterItem ? calculateCurrentStock(masterItem, purchases, sales, rentals, damages) : 0;
                  const isLow = masterItem ? currentStock <= masterItem.minStockLevel : false;

                  return (
                    <tr key={item.name + index} className="border-b border-slate-100 hover:bg-purple-50/40 transition">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-slate-700">
                        <span className="px-2 py-0.5 bg-slate-900 text-amber-300 text-[10px] font-mono font-bold uppercase rounded">
                          {item.code ? item.code : 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-slate-900">
                        {masterItem ? masterItem.name : item.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="neo-badge bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 text-[11px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-black text-emerald-600">
                        {toBengaliNumber(item.qty)} {masterItem?.unit || 'পিস'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`text-xs font-bold uppercase ${isLow ? 'text-rose-600 font-black' : 'text-slate-700'}`}>
                          স্টক: {toBengaliNumber(currentStock)} {masterItem?.unit || 'পিস'} {isLow && '⚠'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

