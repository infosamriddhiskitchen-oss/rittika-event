import React, { useState, useMemo } from 'react';
import { 
  User, Calendar, TrendingUp, CalendarClock, ClipboardList, FileText, 
  DollarSign, Image, Download, Eye, AlertCircle, Clock, CheckCircle, Search, Mail, Phone, MapPin
} from 'lucide-react';
import { 
  Customer, SalesEntry, RentalOutEntry, EventEntry, SalesInvoice, 
  RentalInvoice, EventInvoice, Attachment, EventGalleryItem, StockItem 
} from '../types';
import { formatCurrency, toBengaliNumber } from '../utils';

interface CustomerTimelineProps {
  customers: Customer[];
  sales: SalesEntry[];
  rentals: RentalOutEntry[];
  events: EventEntry[];
  salesInvoices: SalesInvoice[];
  rentalInvoices: RentalInvoice[];
  eventInvoices: EventInvoice[];
  attachments: Attachment[];
  galleryItems: EventGalleryItem[];
  stockItems: StockItem[];
}

export default function CustomerTimeline({
  customers,
  sales,
  rentals,
  events,
  salesInvoices,
  rentalInvoices,
  eventInvoices,
  attachments,
  galleryItems,
  stockItems
}: CustomerTimelineProps) {
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Currently selected customer profile details
  const activeCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  // Filtered customer list for sidebar selection
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile.includes(searchQuery)
    );
  }, [customers, searchQuery]);

  // Aggregate all activities chronologically
  const customerTimelineItems = useMemo(() => {
    if (!selectedCustomerId) return [];

    let items: { 
      id: string; 
      type: 'purchase' | 'rental' | 'event' | 'invoice' | 'document' | 'photo'; 
      title: string; 
      subtitle: string; 
      date: string; 
      status?: string; 
      amount?: number; 
      meta?: any;
    }[] = [];

    // 1. Sales / Purchases
    sales.filter(s => s.customerId === selectedCustomerId).forEach(s => {
      const item = stockItems.find(i => i.code === s.itemCode);
      items.push({
        id: s.id,
        type: 'purchase',
        title: `সরাসরি ক্রয় সম্পন্ন: ${item ? item.name : s.itemCode}`,
        subtitle: `পরিমাণ: ${toBengaliNumber(s.qty)} টি | দর: ${formatCurrency(s.rate)}`,
        date: s.date,
        amount: s.totalAmount
      });
    });

    // 2. Rentals
    rentals.filter(r => r.customerId === selectedCustomerId).forEach(r => {
      const item = stockItems.find(i => i.code === r.itemCode);
      items.push({
        id: r.id,
        type: 'rental',
        title: `সামগ্রী ভাড়া নেওয়া হয়েছে: ${item ? item.name : r.itemCode}`,
        subtitle: `ভাড়া পরিমাণ: ${toBengaliNumber(r.qty)} টি | ইভেন্ট তারিখ: ${r.eventDate}`,
        date: r.date,
        status: r.status,
        amount: r.totalBill
      });
    });

    // 3. Events Bookings
    const customerEvents = events.filter(e => e.customerId === selectedCustomerId);
    customerEvents.forEach(e => {
      items.push({
        id: e.id,
        type: 'event',
        title: `ইভেন্ট ডেকোরেশন বুকিং: ${e.name}`,
        subtitle: `বাজেট: ${formatCurrency(e.budget)} | অগ্রিম: ${formatCurrency(e.paidAmount)}`,
        date: e.date,
        status: e.status,
        amount: e.budget
      });
    });

    // 4. Sales Invoices
    salesInvoices.filter(si => si.customerId === selectedCustomerId).forEach(si => {
      items.push({
        id: si.id,
        type: 'invoice',
        title: `বিক্রয় ইনভয়েস ইস্যু করা হয়েছে: ${si.invoiceNo}`,
        subtitle: `উপমোট: ${formatCurrency(si.subtotal)} | ডিসকাউন্ট: -${formatCurrency(si.discount)}`,
        date: si.date,
        amount: si.grandTotal
      });
    });

    // 5. Rental Invoices
    rentalInvoices.filter(ri => ri.customerId === selectedCustomerId).forEach(ri => {
      items.push({
        id: ri.id,
        type: 'invoice',
        title: `ভাড়া ইনভয়েস জেনারেট হয়েছে: ${ri.invoiceNo}`,
        subtitle: `লেবার ও ট্রান্সপোর্ট সহ ভাড়া চালান`,
        date: ri.date,
        amount: ri.totalBill
      });
    });

    // 6. Event Invoices
    eventInvoices.filter(ei => ei.customerId === selectedCustomerId).forEach(ei => {
      items.push({
        id: ei.id,
        type: 'invoice',
        title: `ইভেন্ট সমাপ্ত চালান বিল: ${ei.invoiceNo}`,
        subtitle: `প্যাকেজ: ${ei.decorationPackage}`,
        date: ei.date,
        amount: ei.totalCost
      });
    });

    // 7. Custom attachments
    attachments.filter(att => att.relatedId === selectedCustomerId).forEach(att => {
      items.push({
        id: att.id,
        type: 'document',
        title: `কাগজপত্র আপলোড: ${att.name}`,
        subtitle: `ধরণ: ${att.type} ডকুমেন্ট কপি`,
        date: att.date,
        meta: att.dataUrl
      });
    });

    // 8. Event Photos associated with customer's events
    const eventIds = customerEvents.map(e => e.id);
    galleryItems.filter(g => eventIds.includes(g.eventId)).forEach(g => {
      items.push({
        id: g.id,
        type: 'photo',
        title: `ইভেন্ট ডেকোরেশন গ্যালারি মিডিয়া`,
        subtitle: `ক্যাটাগরি: ${g.category} | ফাইল: ${g.name}`,
        date: g.date,
        meta: g.dataUrl
      });
    });

    // Sort chronologically (most recent first)
    return items.sort((a, b) => b.date.localeCompare(a.date));

  }, [selectedCustomerId, sales, rentals, events, salesInvoices, rentalInvoices, eventInvoices, attachments, galleryItems, stockItems]);

  // Calculate customer financials (due, payments)
  const customerFinancials = useMemo(() => {
    if (!selectedCustomerId) return { totalPaid: 0, totalDue: 0, totalSpent: 0 };

    // Sales sums
    const cSales = sales.filter(s => s.customerId === selectedCustomerId);
    const salesTotal = cSales.reduce((sum, s) => sum + s.totalAmount, 0);

    // Rentals sums
    const cRentals = rentals.filter(r => r.customerId === selectedCustomerId);
    const rentalsSpent = cRentals.reduce((sum, r) => sum + r.totalBill, 0);
    const rentalsPaid = cRentals.reduce((sum, r) => sum + r.paidAmount, 0);
    const rentalsDue = cRentals.reduce((sum, r) => sum + r.dueAmount, 0);

    // Events sums
    const cEvents = events.filter(e => e.customerId === selectedCustomerId);
    const eventsSpent = cEvents.reduce((sum, e) => sum + e.budget, 0);
    const eventsPaid = cEvents.reduce((sum, e) => sum + e.paidAmount, 0);
    const eventsDue = cEvents.reduce((sum, e) => sum + e.dueAmount, 0);

    return {
      totalSpent: salesTotal + rentalsSpent + eventsSpent,
      totalPaid: salesTotal + rentalsPaid + eventsPaid,
      totalDue: rentalsDue + eventsDue
    };
  }, [selectedCustomerId, sales, rentals, events]);

  return (
    <div className="space-y-8" id="customer-timeline-tab">
      
      {/* Header */}
      <div className="border-b-4 border-black pb-4">
        <h2 className="text-2xl font-black uppercase italic text-black">কাস্টমার হিস্ট্রি ও প্রোফাইল টাইমলাইন (Customer History Timeline)</h2>
        <p className="text-sm font-bold text-slate-700 mt-1">গ্রাহকের ক্রয়ের খাতা, ভাড়ার রেকর্ড, বুকিং ইভেন্টের ফটো এবং বকেয়ার খতিয়ান এক নজরে যাচাই করুন।</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Customer Selection List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="neo-card p-4 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-black">গ্রাহক অনুসন্ধান</h3>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-slate-500" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="নাম বা মোবাইল নম্বর..."
                className="w-full bg-slate-50 border-2 border-black pl-9 pr-3 py-1.5 text-xs font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
              {filteredCustomers.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4 font-bold">কোনো গ্রাহক পাওয়া যায়নি</p>
              ) : (
                filteredCustomers.map(cust => (
                  <button
                    key={cust.id}
                    onClick={() => {
                      setSelectedCustomerId(cust.id);
                    }}
                    className={`w-full text-left p-3 border-2 border-black flex items-center gap-3 transition cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                      selectedCustomerId === cust.id ? 'bg-yellow-400 font-black italic' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full border-2 border-black bg-indigo-100 flex items-center justify-center text-indigo-700 font-black shrink-0">
                      <User size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black truncate">{cust.name}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{cust.mobile}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Customer Profile & Vertical History Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {activeCustomer ? (
            <div className="space-y-6">
              
              {/* Profile Card & Financials Summary Box */}
              <div className="neo-card p-6 bg-white border-black space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-black pb-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 border-3 border-black bg-yellow-300 flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000000]">
                      <User size={22} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase text-black leading-none">{activeCustomer.name}</h3>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mt-2">
                        <span className="flex items-center gap-0.5"><Phone size={12} /> {activeCustomer.mobile}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5"><MapPin size={12} /> {activeCustomer.address}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-indigo-100 border border-indigo-300 text-indigo-800 px-2 py-0.5 font-bold rounded">কাস্টমার আইডি: {activeCustomer.id}</span>
                </div>

                {/* Account Balances Summary Bento */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="border-2 border-black p-3 bg-slate-50 shadow-[2px_2px_0px_0px_#000000]">
                    <span className="text-[10px] text-slate-500 font-black uppercase block">মোট খরচ (Total Spent)</span>
                    <span className="text-base font-black text-slate-800 block mt-1 font-mono">{formatCurrency(customerFinancials.totalSpent)}</span>
                  </div>
                  <div className="border-2 border-black p-3 bg-emerald-50 border-emerald-500 shadow-[2px_2px_0px_0px_#000000]">
                    <span className="text-[10px] text-emerald-800 font-black uppercase block">মোট পরিশোধিত বিল</span>
                    <span className="text-base font-black text-emerald-600 block mt-1 font-mono">{formatCurrency(customerFinancials.totalPaid)}</span>
                  </div>
                  <div className="border-2 border-black p-3 bg-rose-50 border-rose-500 shadow-[2px_2px_0px_0px_#000000]">
                    <span className="text-[10px] text-rose-800 font-black uppercase block">সর্বমোট বকেয়া (Current Due)</span>
                    <span className="text-base font-black text-rose-600 block mt-1 font-mono">{formatCurrency(customerFinancials.totalDue)}</span>
                  </div>
                </div>
              </div>

              {/* Chronological Timeline Container */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-1.5 pl-1">
                  <Clock size={14} />
                  গ্রাহক ইতিহাস টাইমলাইন (Activity Feed)
                </h4>

                <div className="relative border-l-4 border-black ml-4 pl-6 space-y-6">
                  {customerTimelineItems.length === 0 ? (
                    <p className="text-xs font-bold text-slate-500 py-6 italic">এই কাস্টমারের কোনো অ্যাক্টিভিটি হিস্ট্রি পাওয়া যায়নি।</p>
                  ) : (
                    customerTimelineItems.map((item, idx) => {
                      return (
                        <div key={idx} className="relative">
                          {/* Timeline dot */}
                          <div className={`absolute -left-[31px] top-1 w-4 h-4 border-2 border-black rounded-full z-10 ${
                            item.type === 'purchase' ? 'bg-indigo-400' :
                            item.type === 'rental' ? 'bg-amber-400' :
                            item.type === 'event' ? 'bg-teal-400' :
                            item.type === 'invoice' ? 'bg-yellow-400' :
                            item.type === 'document' ? 'bg-pink-400' : 'bg-purple-400'
                          }`}></div>

                          {/* Time Stamp */}
                          <span className="text-[10px] font-black text-slate-500 font-mono block mb-1">তারিখ: {item.date}</span>

                          {/* Detail Card */}
                          <div className="neo-card p-4 hover:translate-y-[-1px] transition-all bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                              <p className="text-xs font-black text-black">{item.title}</p>
                              <span className="text-[10px] text-slate-600 font-bold mt-1 block">{item.subtitle}</span>
                              {item.status && (
                                <span className="inline-block mt-2 px-2 py-0.5 border border-black bg-slate-50 text-[9px] font-black uppercase">
                                  অবস্থা: {item.status}
                                </span>
                              )}
                            </div>

                            {/* Extra details like cost sums or file attachment views */}
                            <div className="shrink-0 text-right">
                              {item.amount !== undefined && (
                                <span className={`text-sm font-black font-mono ${
                                  item.type === 'purchase' ? 'text-indigo-600' : 
                                  item.type === 'rental' ? 'text-amber-600' : 
                                  item.type === 'event' ? 'text-teal-600' : 'text-slate-800'
                                }`}>
                                  {formatCurrency(item.amount)}
                                </span>
                              )}

                              {item.type === 'document' && item.meta && (
                                <a 
                                  href={item.meta} 
                                  download={item.title}
                                  className="neo-btn px-2.5 py-1 text-[10px] bg-pink-100 border-2 border-black font-black uppercase flex items-center gap-1"
                                >
                                  <Download size={10} />
                                  ডাউনলোড
                                </a>
                              )}

                              {item.type === 'photo' && item.meta && (
                                <img 
                                  src={item.meta} 
                                  alt="Event thumbnail" 
                                  className="w-10 h-10 border border-black object-cover rounded shadow-[1.5px_1.5px_0px_0px_#000000]"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="py-24 text-center text-sm font-bold text-slate-500 border-4 border-dashed border-black">
              বাম পাশের তালিকা থেকে কাস্টমার নির্বাচন করুন।
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
