import React, { useState, useMemo } from 'react';
import { 
  Users, Calendar, DollarSign, ListTodo, Plus, Trash2, Camera, Video, 
  Download, Eye, Image, TrendingUp, TrendingDown, Clock, ClipboardCheck, 
  X, Sparkles, PlusCircle, ArrowLeftRight, Folder, CheckCircle2, ChevronLeft, ChevronRight, Upload, Play
} from 'lucide-react';
import { 
  StockItem, Customer, EventEntry, Worker, ExpenseEntry, 
  EventGalleryItem, EventWorkerAssignment 
} from '../types';
import { formatCurrency, toBengaliNumber } from '../utils';
import ImageGalleryLightbox, { GalleryMediaItem } from './ImageGalleryLightbox';

interface EventProjectPageProps {
  events: EventEntry[];
  customers: Customer[];
  stockItems: StockItem[];
  workers: Worker[];
  expenses: ExpenseEntry[];
  onUpdateEventMaterials: (eventId: string, materials: { itemCode: string; qty: number; checked: boolean }[]) => void;
  onUpdateEventStatus: (eventId: string, status: 'Pending' | 'Ongoing' | 'Completed') => void;
  onAddExpense: (expense: Omit<ExpenseEntry, 'id'>) => void;
  galleryItems: EventGalleryItem[];
  onAddGalleryItem: (item: Omit<EventGalleryItem, 'id'>) => void;
  onDeleteGalleryItem: (id: string) => void;
  assignments: EventWorkerAssignment[];
  onAddAssignment: (asg: Omit<EventWorkerAssignment, 'id'>) => void;
  onDeleteAssignment: (id: string) => void;
}

export default function EventProjectPage({
  events,
  customers,
  stockItems,
  workers,
  expenses,
  onUpdateEventMaterials,
  onUpdateEventStatus,
  onAddExpense,
  galleryItems,
  onDeleteGalleryItem,
  onAddGalleryItem,
  assignments,
  onAddAssignment,
  onDeleteAssignment
}: EventProjectPageProps) {
  
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  
  // Modal controllers
  const [isWorkerAssignOpen, setIsWorkerAssignOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Assignment form states
  const [assignWorkerId, setAssignWorkerId] = useState(workers[0]?.id || '');
  const [assignRole, setAssignRole] = useState('প্যান্ডেল সেটআপ');
  const [assignWage, setAssignWage] = useState(500);

  // Expense form states
  const [expCategory, setExpCategory] = useState<'গাড়ি ভাড়া' | 'শ্রমিক খরচ' | 'বিদ্যুৎ' | 'খাবার' | 'অন্যান্য'>('শ্রমিক খরচ');
  const [expAmount, setExpAmount] = useState(0);
  const [expNote, setExpNote] = useState('');

  // Gallery multi-upload state
  const [selectedCategory, setSelectedCategory] = useState<'Before' | 'During' | 'Final' | 'Video'>('Final');

  // Currently viewing event project
  const currentEvent = useMemo(() => {
    return events.find(e => e.id === selectedEventId);
  }, [events, selectedEventId]);

  // Customer for current event
  const currentCustomer = useMemo(() => {
    if (!currentEvent) return null;
    return customers.find(c => c.id === currentEvent.customerId);
  }, [currentEvent, customers]);

  // Filtered workers assigned to this specific event
  const eventAssignmentsList = useMemo(() => {
    return assignments.filter(asg => asg.eventId === selectedEventId);
  }, [assignments, selectedEventId]);

  // Specific expenses associated with this event (linked by notes referring to event name or ID)
  const eventExpensesList = useMemo(() => {
    if (!currentEvent) return [];
    return expenses.filter(exp => 
      exp.note?.toLowerCase().includes(currentEvent.name.toLowerCase()) || 
      exp.note?.toLowerCase().includes(currentEvent.id.toLowerCase())
    );
  }, [expenses, currentEvent]);

  // Gallery items for this specific event
  const eventGallery = useMemo(() => {
    return galleryItems.filter(g => g.eventId === selectedEventId);
  }, [galleryItems, selectedEventId]);

  // Math totals for the event profit analysis (Module 29)
  const eventMetrics = useMemo(() => {
    if (!currentEvent) return { wages: 0, totalExpenses: 0, materialCount: 0, profit: 0, profitPct: 0 };
    
    // 1. Worker wages
    const wagesTotal = eventAssignmentsList.reduce((sum, asg) => sum + asg.wage, 0);
    
    // 2. Out-of-pocket expenses
    const expTotal = eventExpensesList.reduce((sum, exp) => sum + exp.amount, 0);
    
    // 3. Materials count
    const materialCount = currentEvent.materials.reduce((sum, m) => sum + m.qty, 0);
    
    // 4. Budget
    const budget = currentEvent.budget;
    const totalCosts = wagesTotal + expTotal;
    const profit = budget - totalCosts;
    const profitPct = budget > 0 ? (profit / budget) * 100 : 0;

    return {
      wages: wagesTotal,
      totalExpenses: expTotal,
      materialCount,
      profit,
      profitPct
    };
  }, [currentEvent, eventAssignmentsList, eventExpensesList]);

  // Handle worker assignment submission
  const handleAssignWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignWorkerId) {
      alert('সঠিক কর্মী নির্বাচন করুন!');
      return;
    }

    onAddAssignment({
      eventId: selectedEventId,
      workerId: assignWorkerId,
      role: assignRole,
      wage: Number(assignWage)
    });

    setIsWorkerAssignOpen(false);
    setAssignRole('প্যান্ডেল সেটআপ');
  };

  // Handle logging of event-specific expense
  const handleAddEventExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (expAmount <= 0) {
      alert('সঠিক পরিমাণ লিখুন!');
      return;
    }

    if (!currentEvent) return;

    onAddExpense({
      date: currentEvent.date,
      category: expCategory,
      amount: expAmount,
      note: `ইভেন্ট খরচ: "${currentEvent.name}" এর জন্য [${expCategory}] - ${expNote}`
    });

    setIsAddExpenseOpen(false);
    setExpAmount(0);
    setExpNote('');
  };

  // Multiple File uploads converting to base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        onAddGalleryItem({
          eventId: selectedEventId,
          category: selectedCategory,
          name: file.name,
          dataUrl: event.target?.result as string,
          date: new Date().toISOString().split('T')[0]
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // Toggle loaded checklist items directly
  const handleToggleMaterialChecked = (itemCode: string) => {
    if (!currentEvent) return;
    const updated = currentEvent.materials.map(m => 
      m.itemCode === itemCode ? { ...m, checked: !m.checked } : m
    );
    onUpdateEventMaterials(currentEvent.id, updated);
  };

  return (
    <div className="space-y-8" id="event-project-page-tab">
      
      {/* 🌟 Top Heading & Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-4 no-print">
        <div>
          <h2 className="text-2xl font-black uppercase italic text-black">ইভেন্ট প্রজেক্ট পেজ (Event Project Center)</h2>
          <p className="text-sm font-bold text-slate-700 mt-1">প্রতিটি ডেকোরেশন প্রজেক্টের বাজেট, কর্মী, অন-সাইট খরচ, চেকলিস্ট ও রিয়েল-টাইম লাভ বিশ্লেষণ।</p>
        </div>
        
        {/* Project Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-black shrink-0">প্রজেক্ট নির্বাচন করুন:</span>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="bg-white border-2 border-black px-4 py-2 text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
          >
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.name} ({ev.date})</option>
            ))}
          </select>
        </div>
      </div>

      {/* If no events booked, prompt to create */}
      {events.length === 0 ? (
        <div className="py-16 text-center text-sm font-bold text-slate-500 border-4 border-dashed border-black">
          সিস্টেমে কোনো ইভেন্ট বুকিং এন্ট্রি করা নেই। দয়া করে "ইভেন্ট ও কর্মী" ট্যাব থেকে প্রথমে বুকিং করুন।
        </div>
      ) : currentEvent && (
        
        <div className="space-y-8" id="project-dashboard">
          
          {/* 🌟 ROW 1: Project Financials Summary Bento (Module 29 Profit Analysis) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="project-profit-bento">
            
            {/* Budget Box */}
            <div className="neo-card p-5 bg-teal-50 border-teal-500 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div>
                <span className="text-slate-600 text-[10px] font-black uppercase tracking-wider block">ইভেন্ট বাজেট</span>
                <span className="text-xl font-black text-slate-800 block mt-1 font-mono">{formatCurrency(currentEvent.budget)}</span>
                <span className="text-[10px] text-teal-800 font-bold block mt-1">অগ্রিম প্রাপ্ত: {formatCurrency(currentEvent.paidAmount)}</span>
              </div>
              <div className="w-10 h-10 border-2 border-black bg-teal-300 flex items-center justify-center text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] shrink-0">
                <DollarSign size={18} />
              </div>
            </div>

            {/* Total Labor Wages */}
            <div className="neo-card p-5 bg-indigo-50 border-indigo-500 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div>
                <span className="text-slate-600 text-[10px] font-black uppercase tracking-wider block">শ্রমিক মজুরি (Labor Wages)</span>
                <span className="text-xl font-black text-indigo-700 block mt-1 font-mono">{formatCurrency(eventMetrics.wages)}</span>
                <span className="text-[10px] text-indigo-800 font-bold block mt-1">কর্মী সংখ্যা: {toBengaliNumber(eventAssignmentsList.length)} জন</span>
              </div>
              <div className="w-10 h-10 border-2 border-black bg-indigo-300 flex items-center justify-center text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] shrink-0">
                <Users size={18} />
              </div>
            </div>

            {/* Out-of-pocket expenses */}
            <div className="neo-card p-5 bg-rose-50 border-rose-500 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div>
                <span className="text-slate-600 text-[10px] font-black uppercase tracking-wider block">অন্যান্য লজিস্টিক খরচ</span>
                <span className="text-xl font-black text-rose-600 block mt-1 font-mono">{formatCurrency(eventMetrics.totalExpenses)}</span>
                <span className="text-[10px] text-rose-800 font-bold block mt-1">গাড়ি ভাড়া ও জেনারেটর</span>
              </div>
              <div className="w-10 h-10 border-2 border-black bg-rose-300 flex items-center justify-center text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] shrink-0">
                <TrendingDown size={18} />
              </div>
            </div>

            {/* Event Net Profit */}
            <div className={`neo-card p-5 flex items-center justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all ${
              eventMetrics.profit >= 0 ? 'bg-emerald-50 border-emerald-500' : 'bg-red-50 border-red-500'
            }`}>
              <div>
                <span className="text-slate-600 text-[10px] font-black uppercase tracking-wider block">প্রজেক্ট লাভ (Net Profit)</span>
                <span className={`text-xl font-black block mt-1 font-mono ${eventMetrics.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(eventMetrics.profit)}
                </span>
                <span className="text-[10px] font-black block mt-1">
                  মার্জিন: {toBengaliNumber(eventMetrics.profitPct.toFixed(1))}%
                </span>
              </div>
              <div className={`w-10 h-10 border-2 border-black flex items-center justify-center text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] shrink-0 ${
                eventMetrics.profit >= 0 ? 'bg-emerald-300' : 'bg-red-300'
              }`}>
                <TrendingUp size={18} />
              </div>
            </div>

          </div>

          {/* 🌟 ROW 2: Event Information and Material Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Box: Customer Info & Assignments */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Customer Info Card */}
              <div className="neo-card p-5 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-black border-b border-black pb-2 flex items-center gap-1.5">
                  <ClipboardCheck size={14} />
                  গ্রাহক ও বুকিং বিবরণ
                </h3>
                {currentCustomer && (
                  <div className="text-xs font-bold text-slate-800 space-y-2">
                    <p>গ্রাহকের নাম: <span className="font-black text-black">{currentCustomer.name}</span></p>
                    <p>মোবাইল নম্বর: <span className="font-mono">{currentCustomer.mobile}</span></p>
                    <p>ভেন্যু / ঠিকানা: <span>{currentCustomer.address}</span></p>
                    <p>ইভেন্ট তারিখ: <span className="font-mono">{currentEvent.date}</span></p>
                    <p className="flex items-center gap-2">
                      অবস্থা: 
                      <span className={`px-2 py-0.5 border text-[10px] font-black uppercase ${
                        currentEvent.status === 'Completed' ? 'bg-emerald-200 border-emerald-600 text-emerald-800' :
                        currentEvent.status === 'Ongoing' ? 'bg-amber-200 border-amber-600 text-amber-800' :
                        'bg-slate-200 border-slate-600 text-slate-800'
                      }`}>
                        {currentEvent.status}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Worker Assignments */}
              <div className="neo-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-black pb-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-1.5">
                    <Users size={14} />
                    কর্মী নিয়োগ তালিকা
                  </h3>
                  <button
                    onClick={() => {
                      if (workers.length === 0) {
                        alert('দয়া করে আগে এইচআর ও কর্মী প্যানেল থেকে কর্মী যোগ করুন!');
                        return;
                      }
                      setAssignWorkerId(workers[0].id);
                      setIsWorkerAssignOpen(true);
                    }}
                    className="p-1 border border-black bg-yellow-400 hover:bg-yellow-500 shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                    title="কর্মী যোগ করুন"
                  >
                    <Plus size={12} className="stroke-[2.5]" />
                  </button>
                </div>

                <div className="space-y-2">
                  {eventAssignmentsList.length === 0 ? (
                    <p className="text-[11px] font-bold text-slate-500 text-center py-4">এই ইভেন্টের কোনো কর্মী বরাদ্দ করা হয়নি।</p>
                  ) : (
                    eventAssignmentsList.map(asg => {
                      const worker = workers.find(w => w.id === asg.workerId);
                      return (
                        <div key={asg.id} className="flex items-center justify-between p-2.5 border border-black bg-slate-50 text-[11px] font-black">
                          <div>
                            <p className="text-black">{worker ? worker.name : 'অজানা শ্রমিক'}</p>
                            <span className="text-[10px] text-indigo-600 font-bold">{asg.role}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded border border-indigo-200">{formatCurrency(asg.wage)}</span>
                            <button
                              onClick={() => onDeleteAssignment(asg.id)}
                              className="p-1 hover:bg-red-500 hover:text-white border border-red-500 rounded text-red-600 transition"
                              title="বাদ দিন"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Event specific expenses logs */}
              <div className="neo-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-black pb-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-1.5">
                    <TrendingDown size={14} />
                    ইভেন্ট খরচ রেজিস্টার
                  </h3>
                  <button
                    onClick={() => setIsAddExpenseOpen(true)}
                    className="p-1 border border-black bg-rose-400 hover:bg-rose-500 shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                    title="খরচ যোগ করুন"
                  >
                    <Plus size={12} className="stroke-[2.5]" />
                  </button>
                </div>

                <div className="space-y-2">
                  {eventExpensesList.length === 0 ? (
                    <p className="text-[11px] font-bold text-slate-500 text-center py-4">এই ইভেন্টের কোনো অতিরিক্ত খরচ রেকর্ড করা হয়নি।</p>
                  ) : (
                    eventExpensesList.map(exp => (
                      <div key={exp.id} className="p-2 border border-black bg-rose-50 flex items-center justify-between text-[11px] font-black">
                        <div>
                          <p className="text-slate-800">{exp.note || exp.category}</p>
                          <span className="text-[9px] text-slate-500 font-mono">{exp.date}</span>
                        </div>
                        <span className="font-mono text-rose-600">{formatCurrency(exp.amount)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Right Box: Material Load List Checklist (Module 29 Checklist) */}
            <div className="lg:col-span-7">
              <div className="neo-card p-5 space-y-4 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-black border-b border-black pb-2 flex items-center gap-1.5">
                    <ListTodo size={14} />
                    গুদাম লোড ও আনলোড চেকলিস্ট (Material Loading Checklist)
                  </h3>
                  <p className="text-[10px] text-slate-700 font-bold mt-1">গাড়ি লোড বা সাইটে মালামাল পৌঁছানোর পর আইটেমগুলো চেকবক্সে টিক দিন।</p>
                  
                  <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {currentEvent.materials.length === 0 ? (
                      <p className="text-xs font-bold text-slate-500 text-center py-8">চেকলিস্টে কোনো সামগ্রী যোগ করা নেই।</p>
                    ) : (
                      currentEvent.materials.map(m => {
                        const item = stockItems.find(st => st.code === m.itemCode);
                        return (
                          <div 
                            key={m.itemCode} 
                            onClick={() => handleToggleMaterialChecked(m.itemCode)}
                            className={`p-3 border-2 border-black flex items-center justify-between cursor-pointer transition-all ${
                              m.checked ? 'bg-emerald-50 text-emerald-800 line-through' : 'bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={m.checked}
                                readOnly
                                className="w-4 w-4 accent-emerald-500 border-2 border-black rounded cursor-pointer"
                              />
                              <div>
                                <span className="text-xs font-black">{item ? item.name : m.itemCode}</span>
                                <span className="text-[9px] text-slate-500 font-mono block">আইডি: {m.itemCode}</span>
                              </div>
                            </div>
                            <span className="text-xs font-black font-mono">পরিমাণ: {toBengaliNumber(m.qty)} টি</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 text-xs font-bold text-slate-600 flex justify-between items-center">
                  <span>মোট সামগ্রী: {toBengaliNumber(currentEvent.materials.length)} ধরণের</span>
                  <span className="font-black text-black">
                    লোড সম্পন্ন: {toBengaliNumber(currentEvent.materials.filter(m => m.checked).length)} / {toBengaliNumber(currentEvent.materials.length)}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* 🌟 ROW 3: EVENT GALLERY & PHOTO ALBUM (Module 25 Event Gallery) */}
          <div className="neo-card p-6 space-y-6" id="event-gallery-panel">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-4 border-black pb-3 gap-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-1.5">
                  <Camera size={16} />
                  ইভেন্ট ছবি অ্যালবাম ও গ্যালারি (Event Album)
                </h3>
                <p className="text-xs font-bold text-slate-700 mt-0.5">ডেকোরেশনের আগের ও পরের ছবি, সেটআপের মুহূর্ত এবং ভিডিও মেমোরি আপলোড করুন।</p>
              </div>

              {/* Upload Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                {eventGallery.length > 0 && (
                  <button
                    onClick={() => setLightboxIndex(0)}
                    className="neo-btn px-3 py-1.5 text-xs bg-emerald-400 hover:bg-emerald-500 font-black uppercase flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000000]"
                    title="ফুল স্ক্রিন স্লাইডশো মোডে কাস্টমারকে কাজ দেখান"
                  >
                    <Play size={13} className="stroke-[2.5]" />
                    স্লাইডশো ও গ্যালারি শোকেস ({toBengaliNumber(eventGallery.length)})
                  </button>
                )}

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="bg-white border-2 border-black px-3 py-1.5 text-xs font-black"
                >
                  <option value="Before">Before Decoration (কাজের আগে)</option>
                  <option value="During">During Setup (কাজ চলাকালীন)</option>
                  <option value="Final">Final Decoration (কাজ শেষে)</option>
                  <option value="Video">Videos (ভিডিও ক্লিপ)</option>
                </select>

                <label className="neo-btn px-4 py-1.5 text-xs bg-yellow-400 font-black uppercase flex items-center gap-1.5 cursor-pointer">
                  <Upload size={13} />
                  ছবি আপলোড করুন
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Folders of Gallery based on Category */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {['Before', 'During', 'Final', 'Video'].map(cat => {
                const photos = eventGallery.filter(g => g.category === cat);
                return (
                  <div key={cat} className="border-2 border-black p-4 bg-slate-50 space-y-3">
                    <span className="text-xs font-black uppercase text-indigo-800 tracking-wider flex items-center gap-1.5">
                      {cat === 'Before' && <Folder size={14} />}
                      {cat === 'During' && <Clock size={14} />}
                      {cat === 'Final' && <CheckCircle2 size={14} />}
                      {cat === 'Video' && <Video size={14} />}
                      {cat === 'Before' ? 'Before (পূর্বে)' : 
                       cat === 'During' ? 'During Setup' : 
                       cat === 'Final' ? 'Final Decor' : 'Event Video'}
                      <span className="text-[10px] bg-black/10 px-1 rounded ml-auto">({toBengaliNumber(photos.length)})</span>
                    </span>
                    
                    {photos.length === 0 ? (
                      <p className="text-[10px] text-slate-400 font-bold italic py-8 text-center">কোনো মিডিয়া ফাইল নেই</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {photos.map(p => {
                          const globalIdx = eventGallery.findIndex(g => g.id === p.id);
                          return (
                            <div key={p.id} className="relative group border border-black bg-white aspect-square overflow-hidden shadow-[2px_2px_0px_0px_#000000]">
                              {p.category === 'Video' ? (
                                <video 
                                  src={p.dataUrl} 
                                  className="w-full h-full object-cover cursor-pointer"
                                  onClick={() => setLightboxIndex(globalIdx >= 0 ? globalIdx : 0)}
                                />
                              ) : (
                                <img 
                                  src={p.dataUrl} 
                                  alt={p.name} 
                                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition duration-200"
                                  onClick={() => setLightboxIndex(globalIdx >= 0 ? globalIdx : 0)}
                                />
                              )}

                              {/* Hover overlay deletion & presentation */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                <button
                                  onClick={() => setLightboxIndex(globalIdx >= 0 ? globalIdx : 0)}
                                  className="p-1 border border-black bg-white hover:bg-yellow-400 text-black rounded cursor-pointer"
                                  title="ফুল স্ক্রিন স্লাইডারে দেখুন"
                                >
                                  <Eye size={11} />
                                </button>
                                <a
                                  href={p.dataUrl}
                                  download={p.name}
                                  className="p-1 border border-black bg-white hover:bg-teal-400 text-black rounded flex items-center justify-center cursor-pointer"
                                  title="ডাউনলোড"
                                >
                                  <Download size={11} />
                                </a>
                                <button
                                  onClick={() => {
                                    if (window.confirm('মিডিয়া ফাইলটি মুছে ফেলতে চান?')) {
                                      onDeleteGalleryItem(p.id);
                                    }
                                  }}
                                  className="p-1 border border-black bg-white hover:bg-red-500 hover:text-white text-red-700 rounded cursor-pointer"
                                  title="মুছে ফেলুন"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      )}

      {/* 🌟 Interactive Fullscreen Lightbox & Presentation Slideshow (Module 25) */}
      <ImageGalleryLightbox
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        initialIndex={lightboxIndex ?? 0}
        title={`ইভেন্ট গ্যালারি: ${currentEvent?.name || 'ইভেন্ট প্রজেক্ট'}`}
        items={eventGallery.map(p => ({
          id: p.id,
          title: p.name,
          category: p.category === 'Before' ? 'Before Decoration (পূর্বে)' : 
                    p.category === 'During' ? 'During Setup (কাজ চলাকালীন)' : 
                    p.category === 'Final' ? 'Final Decor (কাজ শেষে)' : 'Event Video',
          url: p.dataUrl,
          date: p.date,
          eventName: currentEvent?.name,
          customerName: currentCustomer?.name,
          isVideo: p.category === 'Video' || p.dataUrl.startsWith('data:video')
        }))}
        canDelete={true}
        onDelete={(id) => {
          onDeleteGalleryItem(id);
        }}
      />

      {/* 🌟 DIALOG: WORKER ASSIGNMENT */}
      {isWorkerAssignOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto no-print">
          <div className="bg-white border-4 border-black max-w-sm w-full p-6 shadow-[8px_8px_0px_0px_#000000] relative text-xs font-black">
            <button 
              onClick={() => setIsWorkerAssignOpen(false)}
              className="absolute top-4 right-4 p-1 border border-black bg-white hover:bg-slate-50 text-black cursor-pointer"
            >
              <X size={14} />
            </button>

            <h3 className="text-sm font-black uppercase italic text-black border-b border-black pb-2 mb-4">শ্রমিক বরাদ্দ করুন (Assign Worker)</h3>
            
            <form onSubmit={handleAssignWorkerSubmit} className="space-y-4">
              
              <div>
                <label className="block mb-1">শ্রমিক নির্বাচন করুন</label>
                <select
                  value={assignWorkerId}
                  onChange={(e) => setAssignWorkerId(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-black p-2 font-bold focus:outline-none"
                >
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.mobile})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">কাজের ভূমিকা (Role)</label>
                <input
                  type="text"
                  required
                  value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-black p-2 font-bold"
                  placeholder="যেমন: ডেকোরেশন ডিজাইনার"
                />
              </div>

              <div>
                <label className="block mb-1">দৈনিক মজুরি (Wage)</label>
                <input
                  type="number"
                  required
                  value={assignWage}
                  onChange={(e) => setAssignWage(Number(e.target.value))}
                  className="w-full bg-slate-50 border-2 border-black p-2 font-bold font-mono"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWorkerAssignOpen(false)}
                  className="neo-btn px-4 py-2 bg-white text-black"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="neo-btn px-5 py-2 bg-yellow-400 text-black"
                >
                  বরাদ্দ করুন
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 🌟 DIALOG: LOG EXPENSE */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto no-print">
          <div className="bg-white border-4 border-black max-w-sm w-full p-6 shadow-[8px_8px_0px_0px_#000000] relative text-xs font-black">
            <button 
              onClick={() => setIsAddExpenseOpen(false)}
              className="absolute top-4 right-4 p-1 border border-black bg-white hover:bg-slate-50 text-black cursor-pointer"
            >
              <X size={14} />
            </button>

            <h3 className="text-sm font-black uppercase italic text-black border-b border-black pb-2 mb-4">প্রজেক্ট খরচ যোগ করুন (Log Expense)</h3>
            
            <form onSubmit={handleAddEventExpenseSubmit} className="space-y-4">
              
              <div>
                <label className="block mb-1">ক্যাটাগরি</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border-2 border-black p-2 font-bold cursor-pointer"
                >
                  <option value="গাড়ি ভাড়া">গাড়ি ভাড়া / ট্র্যান্সপোর্ট</option>
                  <option value="শ্রমিক খরচ">শ্রমিক খরচ / মজুরি</option>
                  <option value="বিদ্যুৎ">বিদ্যুৎ / আলোকসজ্জা</option>
                  <option value="খাবার">খাবার / কেটারিং</option>
                  <option value="অন্যান্য">অন্যান্য সামগ্রী</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">পরিমাণ (Amount in BDT)</label>
                <input
                  type="number"
                  required
                  value={expAmount}
                  onChange={(e) => setExpAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border-2 border-black p-2 font-bold font-mono"
                />
              </div>

              <div>
                <label className="block mb-1">বিবরণ (Note)</label>
                <textarea
                  required
                  value={expNote}
                  onChange={(e) => setExpNote(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-black p-2 font-bold"
                  rows={2}
                  placeholder="যেমন: জেনারেটর ভাড়া প্রদান"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="neo-btn px-4 py-2 bg-white text-black"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="neo-btn px-5 py-2 bg-rose-400 text-black"
                >
                  খরচ সংরক্ষণ করুন
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
