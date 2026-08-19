import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  QrCode, 
  AlertTriangle,
  X,
  MapPin,
  Clock,
  Printer,
  Download,
  Trash2
} from 'lucide-react';
import { StockItem, PurchaseEntry, SalesEntry, RentalOutEntry, DamageEntry, Customer } from '../types';
import { calculateCurrentStock, formatCurrency, toBengaliNumber } from '../utils';

interface MasterStockProps {
  stockItems: StockItem[];
  purchases: PurchaseEntry[];
  sales: SalesEntry[];
  rentals: RentalOutEntry[];
  damages: DamageEntry[];
  customers: Customer[];
  onAddItem: (item: Omit<StockItem, 'id'>) => void;
  onUpdateItem: (id: string, updated: Omit<StockItem, 'id'>) => void;
  onDeleteItem?: (id: string) => void;
  onRentItemQuickAction?: (itemCode: string) => void;
}

export default function MasterStock({
  stockItems,
  purchases,
  sales,
  rentals,
  damages,
  customers,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onRentItemQuickAction
}: MasterStockProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [activeQrItem, setActiveQrItem] = useState<StockItem | null>(null);
  const [scanSimCode, setScanSimCode] = useState('');
  const [activeSimResult, setActiveSimResult] = useState<any | null>(null);

  // New Item State Form
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('ফুল');
  const [unit, setUnit] = useState('পিস');
  const [openingStock, setOpeningStock] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [rentalPrice, setRentalPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [minStockLevel, setMinStockLevel] = useState(10);

  // Categories list
  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(stockItems.map(item => item.category)))];
  }, [stockItems]);

  // Compute stock items dynamically
  const computedStockList = useMemo(() => {
    return stockItems.map(item => ({
      ...item,
      currentStock: calculateCurrentStock(item, purchases, sales, rentals, damages)
    }));
  }, [stockItems, purchases, sales, rentals, damages]);

  // Filter & Search
  const filteredItems = useMemo(() => {
    return computedStockList.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.code.toLowerCase().includes(search.toLowerCase()) ||
                          item.category.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [computedStockList, search, selectedCategory]);

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;
    
    // Check if code is unique
    const isCodeDuplicate = stockItems.some(item => item.code.toUpperCase() === code.toUpperCase());
    if (isCodeDuplicate) {
      alert('এই আইটেম কোডটি ইতিমধ্যে ব্যবহৃত হয়েছে! অনুগ্রহ করে অন্য কোড দিন।');
      return;
    }

    onAddItem({
      code: code.toUpperCase().trim(),
      name: name.trim(),
      category,
      unit,
      openingStock: Number(openingStock),
      purchasePrice: Number(purchasePrice),
      rentalPrice: Number(rentalPrice),
      sellingPrice: Number(sellingPrice),
      minStockLevel: Number(minStockLevel)
    });

    // Reset Form
    setCode('');
    setName('');
    setOpeningStock(0);
    setPurchasePrice(0);
    setRentalPrice(0);
    setSellingPrice(0);
    setMinStockLevel(10);
    setIsAddOpen(false);
  };

  const handleEditClick = (item: StockItem) => {
    setEditingItem(item);
    setCode(item.code);
    setName(item.name);
    setCategory(item.category);
    setUnit(item.unit);
    setOpeningStock(item.openingStock);
    setPurchasePrice(item.purchasePrice);
    setRentalPrice(item.rentalPrice);
    setSellingPrice(item.sellingPrice);
    setMinStockLevel(item.minStockLevel);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    onUpdateItem(editingItem.id, {
      code: code.toUpperCase().trim(),
      name: name.trim(),
      category,
      unit,
      openingStock: Number(openingStock),
      purchasePrice: Number(purchasePrice),
      rentalPrice: Number(rentalPrice),
      sellingPrice: Number(sellingPrice),
      minStockLevel: Number(minStockLevel)
    });

    setEditingItem(null);
  };

  // QR Tracker / Scanner Simulator Lookup
  const handleQrLookup = (itemCode: string) => {
    const codeToSearch = itemCode.trim().toUpperCase();
    const item = stockItems.find(i => i.code === codeToSearch);
    if (!item) {
      setActiveSimResult({ found: false, code: codeToSearch });
      return;
    }

    // Find active rentals where this item is currently rented out
    const activeRentals = rentals
      .filter(r => r.itemCode === codeToSearch && r.status !== 'Returned')
      .map(r => {
        const customer = customers.find(c => c.id === r.customerId);
        return {
          id: r.id,
          customerName: customer ? customer.name : 'অজানা গ্রাহক',
          customerMobile: customer ? customer.mobile : '',
          qty: r.qty - r.returnedQty,
          eventDate: r.eventDate,
          returnDate: r.expectedReturnDate,
          status: r.status
        };
      });

    const currentStock = calculateCurrentStock(item, purchases, sales, rentals, damages);

    setActiveSimResult({
      found: true,
      item,
      currentStock,
      activeRentals
    });
  };

  return (
    <div className="space-y-8" id="master-stock-tab">
      
      {/* Tab Header Action Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <h2 className="text-2xl font-black uppercase italic text-black">মাস্টার স্টক ডাটাবেস (Master Stock)</h2>
          <p className="text-sm font-bold text-slate-700 mt-1">ব্যবসার সমস্ত ডেকোরেশন সামগ্রীর মূল তালিকা, প্রারম্ভিক স্টক এবং মূল্য নির্ধারণ।</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="print-stock-report-btn"
            onClick={() => setIsReportOpen(true)}
            className="neo-btn bg-black hover:bg-slate-800 text-white px-4 py-2 text-sm flex items-center gap-2"
          >
            <Printer size={16} className="stroke-[2.5]" />
            স্টক রিপোর্ট (PDF/প্রিন্ট)
          </button>
          <button
            id="open-scanner-sim-btn"
            onClick={() => {
              setScanSimCode('');
              setActiveSimResult(null);
              setActiveQrItem(stockItems[0] || null);
            }}
            className="neo-btn bg-white px-4 py-2 text-sm flex items-center gap-2"
          >
            <QrCode size={16} className="stroke-[2.5]" />
            কিউআর কোড স্ক্যানার সিমুলেটর
          </button>
          <button 
            id="add-stock-item-btn"
            onClick={() => {
              setEditingItem(null);
              setCode('');
              setName('');
              setCategory('ফুল');
              setUnit('পিস');
              setOpeningStock(0);
              setPurchasePrice(0);
              setRentalPrice(0);
              setSellingPrice(0);
              setMinStockLevel(10);
              setIsAddOpen(true);
            }}
            className="neo-btn neo-btn-primary px-4 py-2 text-sm flex items-center gap-1.5"
          >
            <Plus size={16} className="stroke-[2.5]" />
            নতুন আইটেম যোগ করুন
          </button>
        </div>
      </div>

      {/* 🔍 Search & Filter controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" id="stock-filters-panel">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black stroke-[2.5]" size={18} />
          <input
            id="stock-search-input"
            type="text"
            placeholder="কোড বা নাম দিয়ে মালামাল খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border-3 border-black text-sm text-black font-bold focus:outline-none focus:bg-yellow-50"
          />
        </div>
        <div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-black stroke-[2.5]" size={16} />
            <select
              id="stock-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white border-3 border-black text-sm text-black font-bold focus:outline-none focus:bg-yellow-50 appearance-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'সব ক্যাটাগরি' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <span className="neo-badge bg-black text-white px-4 py-2.5 text-xs">
            মোট ফিল্টারড: {toBengaliNumber(filteredItems.length)} টি আইটেম
          </span>
        </div>
      </div>

      {/* 📦 Master Stock Data Table */}
      <div className="neo-card overflow-hidden" id="stock-table-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="master-stock-table">
            <thead>
              <tr className="bg-slate-100 border-b-3 border-black text-black text-xs font-black uppercase tracking-wider">
                <th className="py-4 px-4 border-r border-black/10">কোড ও নাম</th>
                <th className="py-4 px-4 border-r border-black/10">ক্যাটাগরি</th>
                <th className="py-4 px-4 border-r border-black/10 text-center">ইউনিট</th>
                <th className="py-4 px-4 border-r border-black/10 text-center">প্রারম্ভিক স্টক</th>
                <th className="py-4 px-4 border-r border-black/10 text-center">বর্তমান স্টক অবস্থা</th>
                <th className="py-4 px-4 border-r border-black/10 text-right">ক্রয় মূল্য</th>
                <th className="py-4 px-4 border-r border-black/10 text-right">ভাড়া মূল্য (দৈনিক)</th>
                <th className="py-4 px-4 border-r border-black/10 text-right">বিক্রয় মূল্য</th>
                <th className="py-4 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-sm font-bold text-black uppercase">
                    কোন মালামাল পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const isLow = item.currentStock <= item.minStockLevel;

                  return (
                    <tr key={item.id} className="border-b-2 border-black/10 hover:bg-yellow-50/50 transition">
                      <td className="py-4 px-4 border-r border-black/10">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 bg-black text-white text-[10px] font-mono font-black">{item.code}</span>
                          <div>
                            <span className="text-sm font-black text-black block">{item.name}</span>
                            {isLow && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 uppercase mt-0.5">
                                <AlertTriangle size={10} className="stroke-[2.5]" /> কম স্টক! (টার্গেট: {toBengaliNumber(item.minStockLevel)})
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 border-r border-black/10">
                        <span className="neo-badge bg-white px-2.5 py-1 text-xs">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-center text-xs font-black uppercase text-black">{item.unit}</td>
                      <td className="py-4 px-4 border-r border-black/10 text-center font-mono text-sm font-black text-black">
                        {toBengaliNumber(item.openingStock)}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-center">
                        <span className={`text-sm font-black px-2.5 py-1 border-2 border-black ${
                          isLow 
                            ? 'bg-rose-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                            : 'bg-emerald-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        }`}>
                          {toBengaliNumber(item.currentStock)} {item.unit}
                        </span>
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-right font-black text-black font-sans">
                        {formatCurrency(item.purchasePrice)}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-right font-black text-emerald-600 font-sans">
                        {formatCurrency(item.rentalPrice)}
                      </td>
                      <td className="py-4 px-4 border-r border-black/10 text-right font-black text-indigo-700 font-sans">
                        {formatCurrency(item.sellingPrice)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            id={`rent-item-${item.code}`}
                            onClick={() => onRentItemQuickAction && onRentItemQuickAction(item.code)}
                            title="ভাড়ায় মাল দিন"
                            className="p-1.5 border-2 border-black bg-teal-400 hover:bg-teal-500 text-black font-black text-[10px] transition cursor-pointer shadow-[1px_1px_0px_0px_#000000] h-8 flex items-center justify-center gap-1"
                          >
                            <Clock size={12} className="stroke-[2.5]" />
                            <span>ভাড়া</span>
                          </button>
                          <button
                            id={`edit-item-${item.code}`}
                            onClick={() => handleEditClick(item)}
                            title="সম্পাদনা করুন"
                            className="p-1.5 border-2 border-black bg-white hover:bg-yellow-400 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                          >
                            <Edit size={14} className="stroke-[2.5]" />
                          </button>
                          <button
                            id={`qr-item-${item.code}`}
                            onClick={() => {
                              setActiveQrItem(item);
                              handleQrLookup(item.code);
                            }}
                            title="কিউআর কোড ট্যাকার"
                            className="p-1.5 border-2 border-black bg-white hover:bg-sky-400 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                          >
                            <QrCode size={14} className="stroke-[2.5]" />
                          </button>
                          {onDeleteItem && (
                            <button
                              id={`delete-item-${item.code}`}
                              onClick={() => onDeleteItem(item.id)}
                              title="মুছে ফেলুন"
                              className="p-1.5 border-2 border-black bg-red-100 hover:bg-red-400 text-red-700 hover:text-white transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                            >
                              <Trash2 size={14} className="stroke-[2.5]" />
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

      {/* 🖨️ QR Label Generator Modal Side Panel */}
      {activeQrItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="qr-modal">
          <div className="bg-white border-4 border-black p-6 relative flex flex-col md:flex-row gap-6 max-w-2xl w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <button 
              onClick={() => setActiveQrItem(null)}
              className="absolute right-4 top-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>

            {/* Print Side (QR Sticker Mockup) */}
            <div className="flex-1 flex flex-col items-center justify-center border-r-3 border-black pr-0 md:pr-6">
              <span className="text-xs font-black uppercase text-slate-500 mb-2">প্রিন্টযোগ্য কিউআর স্টিকার লেবেল</span>
              
              <div className="p-4 bg-white border-3 border-dashed border-black flex flex-col items-center text-center max-w-[200px]" id="printable-qr-sticker">
                <span className="text-[10px] font-black text-black tracking-wider uppercase">DECOR ERP STICKER</span>
                
                {/* SVG Mock QR Code */}
                <div className="w-32 h-32 my-3 p-1 border-2 border-black bg-white flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                    <rect width="100" height="100" fill="white" />
                    <rect x="0" y="0" width="30" height="30" fill="currentColor" />
                    <rect x="5" y="5" width="20" height="20" fill="white" />
                    <rect x="10" y="10" width="10" height="10" fill="currentColor" />
                    
                    <rect x="70" y="0" width="30" height="30" fill="currentColor" />
                    <rect x="75" y="5" width="20" height="20" fill="white" />
                    <rect x="80" y="10" width="10" height="10" fill="currentColor" />
                    
                    <rect x="0" y="70" width="30" height="30" fill="currentColor" />
                    <rect x="5" y="75" width="20" height="20" fill="white" />
                    <rect x="10" y="80" width="10" height="10" fill="currentColor" />
                    
                    <rect x="40" y="10" width="10" height="10" fill="currentColor" />
                    <rect x="50" y="20" width="10" height="15" fill="currentColor" />
                    <rect x="40" y="40" width="15" height="10" fill="currentColor" />
                    <rect x="15" y="45" width="10" height="15" fill="currentColor" />
                    <rect x="70" y="45" width="15" height="15" fill="currentColor" />
                    <rect x="45" y="75" width="15" height="10" fill="currentColor" />
                    <rect x="75" y="75" width="10" height="15" fill="currentColor" />
                    <rect x="85" y="60" width="10" height="10" fill="currentColor" />
                  </svg>
                </div>

                <span className="text-xs font-black text-black font-mono tracking-widest">{activeQrItem.code}</span>
                <span className="text-[9px] font-black text-slate-700 truncate max-w-[170px] mt-0.5 uppercase">{activeQrItem.name}</span>
              </div>

              <button 
                onClick={() => window.print()}
                className="mt-4 px-4 py-2 bg-black hover:bg-slate-800 text-white text-xs font-black uppercase italic border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer size={13} className="stroke-[2.5]" />
                লেবেল প্রিন্ট করুন
              </button>
            </div>

            {/* Scanner Lookup/Live Info Side */}
            <div className="flex-1 space-y-4">
              <h3 className="text-lg font-black uppercase italic text-black">কিউআর কোড ট্র্যাকিং (QR Tracking)</h3>
              <p className="text-xs font-bold text-slate-600">এই সামগ্রীটি মোবাইল বা স্ক্যানার দিয়ে স্ক্যান করলে এর যাবতীয় রিয়েল-টাইম অবস্থান পাওয়া যাবে।</p>
              
              <div className="space-y-3 bg-slate-50 p-4 border-2 border-black">
                <div className="flex items-center gap-1.5 border-b border-black pb-2 mb-2">
                  <span className="text-xs font-black text-black uppercase tracking-wider">স্ক্যানিং রেজাল্ট সিমুলেশন</span>
                </div>

                {/* Input simulator */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="আইটেম কোড লিখুন..."
                    value={scanSimCode}
                    onChange={(e) => setScanSimCode(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border-2 border-black font-bold text-xs focus:outline-none"
                  />
                  <button
                    onClick={() => handleQrLookup(scanSimCode || activeQrItem.code)}
                    className="px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-black border-2 border-black font-black uppercase text-xs shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                  >
                    স্ক্যান
                  </button>
                </div>

                {activeSimResult && activeSimResult.found ? (
                  <div className="space-y-3 pt-2 text-xs">
                    <div className="flex items-center justify-between border-b border-black/10 pb-1.5">
                      <span className="text-slate-600 font-bold uppercase">আইটেম:</span>
                      <span className="font-black text-black">{activeSimResult.item.name}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-black/10 pb-1.5">
                      <span className="text-slate-600 font-bold uppercase">গুদামে স্টক আছে:</span>
                      <span className="font-black text-emerald-600">{toBengaliNumber(activeSimResult.currentStock)} {activeSimResult.item.unit}</span>
                    </div>

                    <div className="border-t-2 border-black pt-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide block mb-1.5">বর্তমানে কোথায় গেছে / কার কাছে আছে:</span>
                      {activeSimResult.activeRentals.length === 0 ? (
                        <span className="text-xs text-slate-500 italic font-semibold block">এই মালামালটি বর্তমানে কোথাও ভাড়ায় নেই। গুদামে রয়েছে।</span>
                      ) : (
                        <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                          {activeSimResult.activeRentals.map((r: any) => (
                            <div key={r.id} className="p-2 bg-amber-100 border-2 border-black text-xs font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1 font-black">
                                  <MapPin size={10} className="stroke-[2.5]" />
                                  {r.customerName}
                                </span>
                                <span className="font-black text-black">{toBengaliNumber(r.qty)} {activeSimResult.item.unit}</span>
                              </div>
                              <p className="text-[10px] text-slate-700 mt-1 flex items-center gap-1">
                                <Clock size={10} />
                                ইভেন্ট: {toBengaliNumber(r.eventDate)} | ফেরত: {toBengaliNumber(r.returnDate)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : activeSimResult && !activeSimResult.found ? (
                  <p className="text-xs text-rose-600 font-black uppercase pt-2">⚠ দুঃখিত! "{activeSimResult.code}" কোডের কোনো মালামাল স্টকে পাওয়া যায়নি।</p>
                ) : (
                  <div className="pt-2 text-xs font-bold text-black">
                    <p className="italic text-slate-500">স্ক্যান বাটনে চাপ দিলে ডাটাবেস চেক করা হবে।</p>
                    <button 
                      onClick={() => handleQrLookup(activeQrItem.code)}
                      className="mt-2 text-xs text-indigo-700 font-black uppercase flex items-center gap-1 cursor-pointer"
                    >
                      ডিফল্ট কোড ({activeQrItem.code}) দিয়ে চেক করুন
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📝 Add / Edit Item Form Modal */}
      {(isAddOpen || editingItem) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="stock-form-modal">
          <div className="bg-white border-4 border-black p-6 relative max-w-xl w-full max-h-[95vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <button 
              onClick={() => {
                setIsAddOpen(false);
                setEditingItem(null);
              }}
              className="absolute right-4 top-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>

            <h3 className="text-lg font-black uppercase italic text-black mb-4 border-b-3 border-black pb-3">
              {editingItem ? 'মালামাল সম্পাদনা করুন' : 'নতুন ডেকোরেশন সামগ্রী যোগ করুন'}
            </h3>

            <form onSubmit={editingItem ? handleSubmitEdit : handleSubmitAdd} className="space-y-4 text-xs font-bold text-black">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">ইউনিক আইটেম কোড (Item Code)</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: FL003, LT005"
                    value={code}
                    disabled={!!editingItem}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50 disabled:bg-slate-100 disabled:text-slate-500 disabled:border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">সামগ্রীর নাম (Item Name)</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: চেরি ফুল"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">ক্যাটাগরি</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none"
                  >
                    <option value="ফুল">ফুল (Flowers)</option>
                    <option value="লাইট">লাইট (Lights)</option>
                    <option value="তার">তার (Wires)</option>
                    <option value="কার্পেট">কার্পেট (Carpets)</option>
                    <option value="ডেকোরেশন">ডেকোরেশন Stand</option>
                    <option value="অন্যান্য">অন্যান্য (Others)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">পরিমাপের একক (Unit)</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: পিস, চেইন, রোল, গজ"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">প্রারম্ভিক স্টক (Opening Stock)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={openingStock}
                    onChange={(e) => setOpeningStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">মিনিমাম অ্যালার্ট স্টক (Low Stock Limit)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={minStockLevel}
                    onChange={(e) => setMinStockLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t-3 border-black pt-3">
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">ক্রয় মূল্য (৳)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">ভাড়া মূল্য (৳ - দৈনিক)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={rentalPrice}
                    onChange={(e) => setRentalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-600 block mb-1">বিক্রয় মূল্য (৳ - সরাসরি)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border-3 border-black text-sm font-bold focus:outline-none focus:bg-yellow-50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t-3 border-black pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 bg-white text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 text-black border-2 border-black font-black uppercase italic shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-yellow-500 cursor-pointer"
                >
                  {editingItem ? 'পরিবর্তন সংরক্ষণ করুন' : 'স্টকে যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📊 STUNNING PRINTABLE STOCK REPORT MODAL */}
      {isReportOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn" id="stock-report-modal">
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
                <span className="text-sm font-black text-black uppercase italic">রিয়েল-টাইম স্টক রিপোর্ট জেনারেটর</span>
                <p className="text-[10px] text-slate-500 font-bold">এটি আপনার ডাটাবেসের সম্পূর্ণ স্টকের প্রিন্ট ও ডাটা রিলিজ হাব।</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => {
                    // Export to CSV helper
                    const headers = ['আইটেম কোড', 'আইটেম নাম', 'ক্যাটাগরি', 'বর্তমান স্টক', 'একক', 'ক্রয়মূল্য (টাকা)', 'মোট ক্রয় মূল্য (টাকা)', 'ভাড়ামূল্য (টাকা)'];
                    const rows = stockItems.map(item => {
                      const currentStock = calculateCurrentStock(item, purchases, sales, rentals, damages);
                      return [
                        item.code,
                        item.name,
                        item.category,
                        currentStock,
                        item.unit,
                        item.purchasePrice,
                        currentStock * item.purchasePrice,
                        item.rentalPrice
                      ];
                    });

                    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
                      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
                    
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `Rittika_Stock_Report_${new Date().toISOString().split('T')[0]}.csv`);
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
            <div className="bg-white p-6 border-4 border-black print:border-0 print:p-0" id="printable-stock-report">
              
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
                <h2 className="text-base font-black text-black uppercase tracking-wide">মাস্টার ইনভেন্টরি স্টক ও মূল্যায়ন রিপোর্ট (Stock Overview Statement)</h2>
              </div>

              {/* High-Level Aggregates Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center text-xs font-black">
                <div className="border-2 border-black p-2 bg-slate-50">
                  <span className="text-slate-500 text-[10px] uppercase block">মোট প্রকার সামগ্রী</span>
                  <span className="text-lg font-black font-mono block text-indigo-700 mt-1">{toBengaliNumber(stockItems.length)} টি</span>
                </div>
                <div className="border-2 border-black p-2 bg-slate-50">
                  <span className="text-slate-500 text-[10px] uppercase block">মোট মালামাল মজুদ</span>
                  <span className="text-lg font-black font-mono block text-emerald-700 mt-1">
                    {toBengaliNumber(stockItems.reduce((acc, item) => acc + calculateCurrentStock(item, purchases, sales, rentals, damages), 0))} পিস/সেট
                  </span>
                </div>
                <div className="border-2 border-black p-2 bg-slate-50">
                  <span className="text-slate-500 text-[10px] uppercase block">মোট ক্রয়মূল্য মূল্যায়ন</span>
                  <span className="text-lg font-black font-mono block text-rose-600 mt-1">
                    {formatCurrency(stockItems.reduce((acc, item) => acc + (calculateCurrentStock(item, purchases, sales, rentals, damages) * item.purchasePrice), 0))}
                  </span>
                </div>
                <div className="border-2 border-black p-2 bg-slate-50">
                  <span className="text-slate-500 text-[10px] uppercase block">ভাড়া সম্ভাবনা (দৈনিক)</span>
                  <span className="text-lg font-black font-mono block text-teal-600 mt-1">
                    {formatCurrency(stockItems.reduce((acc, item) => acc + (calculateCurrentStock(item, purchases, sales, rentals, damages) * item.rentalPrice), 0))}
                  </span>
                </div>
              </div>

              {/* Details Table */}
              <div className="border-2 border-black overflow-hidden mb-6">
                <table className="w-full text-left text-xs font-bold">
                  <thead className="bg-slate-100 border-b-2 border-black text-[10px] uppercase font-black tracking-wider text-black">
                    <tr>
                      <th className="p-2 border-r-2 border-black text-center w-10">#</th>
                      <th className="p-2 border-r-2 border-black w-24">কোড</th>
                      <th className="p-2 border-r-2 border-black">সামগ্রীর বিবরণ (Item Name)</th>
                      <th className="p-2 border-r-2 border-black text-center w-28">ক্যাটাগরি</th>
                      <th className="p-2 border-r-2 border-black text-center w-20">বর্তমান স্টক</th>
                      <th className="p-2 border-r-2 border-black text-right w-24">ক্রয়মূল্য (টাকা)</th>
                      <th className="p-2 border-r-2 border-black text-right w-24">মোট ক্রয়মূল্য</th>
                      <th className="p-2 text-right w-24">ভাড়ামূল্য (টাকা)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-b border-black">
                    {stockItems.map((item, index) => {
                      const cur = calculateCurrentStock(item, purchases, sales, rentals, damages);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2 border-r-2 border-black text-center font-mono">{toBengaliNumber(index + 1)}</td>
                          <td className="p-2 border-r-2 border-black font-mono text-black">{item.code}</td>
                          <td className="p-2 border-r-2 border-black font-black text-black">{item.name}</td>
                          <td className="p-2 border-r-2 border-black text-center text-slate-700">{item.category}</td>
                          <td className="p-2 border-r-2 border-black text-center font-mono font-black text-black">
                            {toBengaliNumber(cur)} {item.unit}
                          </td>
                          <td className="p-2 border-r-2 border-black text-right font-sans">{formatCurrency(item.purchasePrice)}</td>
                          <td className="p-2 border-r-2 border-black text-right font-sans text-rose-600 font-black">{formatCurrency(cur * item.purchasePrice)}</td>
                          <td className="p-2 text-right font-sans text-emerald-600 font-black">{formatCurrency(item.rentalPrice)}</td>
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
                  <p className="mt-2 text-slate-700">স্টক ইনচার্জ স্বাক্ষর</p>
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
