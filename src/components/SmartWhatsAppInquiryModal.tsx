import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Palette, 
  Clock, 
  User, 
  Phone, 
  Check, 
  Eye, 
  Layers,
  Crown,
  Building2,
  FileCheck
} from 'lucide-react';
import { getTimeBasedBengaliGreeting, buildWhatsAppInquiryMessage, getWhatsAppChatUrl, generateBookingRequestId } from '../utils/whatsappBookingHelper';
import { OnlineBooking } from '../types';

interface SmartWhatsAppInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<OnlineBooking>;
  onSaveOnlineBooking?: (booking: Omit<OnlineBooking, 'id'>) => void;
}

export default function SmartWhatsAppInquiryModal({
  isOpen,
  onClose,
  initialData,
  onSaveOnlineBooking
}: SmartWhatsAppInquiryModalProps) {
  const [customerName, setCustomerName] = useState(initialData?.customerName || '');
  const [mobile, setMobile] = useState(initialData?.mobile || '');
  const [eventType, setEventType] = useState(initialData?.eventType || 'বিবাহ ও সংবর্ধনা (Wedding)');
  const [eventDate, setEventDate] = useState(initialData?.date || '');
  const [eventTime, setEventTime] = useState(initialData?.eventTime || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [venueType, setVenueType] = useState(initialData?.venueType || 'কমিউনিটি সেন্টার / কনভেনশন হল');
  const [guestCount, setGuestCount] = useState<string>(initialData?.guestCount ? String(initialData.guestCount) : '');
  const [decorationStyle, setDecorationStyle] = useState(initialData?.decorationStyle || 'লাক্সারি রয়্যাল ডেকোরেশন');
  const [budgetRange, setBudgetRange] = useState(initialData?.budgetRange || '');
  const [selectedServices, setSelectedServices] = useState<string[]>(initialData?.requiredServices || ['স্টেজ ডেকোরেশন', 'লাইটিং সেটআপ']);
  const [preferredContactTime, setPreferredContactTime] = useState(initialData?.preferredContactTime || 'যেকোনো সময়');
  const [notes, setNotes] = useState(initialData?.note || '');
  const [alsoSaveOnline, setAlsoSaveOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<'quick' | 'detailed' | 'preview'>('quick');

  // Dynamic greeting state
  const timeGreeting = useMemo(() => {
    return getTimeBasedBengaliGreeting(customerName);
  }, [customerName]);

  // Sync initial data when modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      if (initialData.customerName) setCustomerName(initialData.customerName);
      if (initialData.mobile) setMobile(initialData.mobile);
      if (initialData.eventType) setEventType(initialData.eventType);
      if (initialData.date) setEventDate(initialData.date);
      if (initialData.eventTime) setEventTime(initialData.eventTime);
      if (initialData.location) setLocation(initialData.location);
      if (initialData.venueType) setVenueType(initialData.venueType);
      if (initialData.guestCount) setGuestCount(String(initialData.guestCount));
      if (initialData.decorationStyle) setDecorationStyle(initialData.decorationStyle);
      if (initialData.budgetRange) setBudgetRange(initialData.budgetRange);
      if (initialData.requiredServices) setSelectedServices(initialData.requiredServices);
      if (initialData.preferredContactTime) setPreferredContactTime(initialData.preferredContactTime);
      if (initialData.note) setNotes(initialData.note);
    }
  }, [isOpen, initialData]);

  // Service toggle helper
  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  // Generated WhatsApp text message
  const generatedWhatsAppText = useMemo(() => {
    return buildWhatsAppInquiryMessage({
      customerName,
      mobile,
      eventType,
      eventDate,
      eventTime,
      location,
      venueType,
      guestCount: guestCount ? Number(guestCount) : undefined,
      decorationStyle,
      budgetRange,
      requiredServices: selectedServices,
      preferredContactTime: preferredContactTime === 'যেকোনো সময়' ? undefined : preferredContactTime,
      notes
    });
  }, [
    customerName,
    mobile,
    eventType,
    eventDate,
    eventTime,
    location,
    venueType,
    guestCount,
    decorationStyle,
    budgetRange,
    selectedServices,
    preferredContactTime,
    notes
  ]);

  const handleLaunchWhatsApp = () => {
    // Optionally also register in online bookings database
    if (alsoSaveOnline && onSaveOnlineBooking) {
      const generatedId = generateBookingRequestId();
      onSaveOnlineBooking({
        requestId: generatedId,
        createdAt: new Date().toISOString(),
        customerName: customerName.trim() || 'WhatsApp Visitor',
        mobile: mobile.trim() || 'Not Provided (WhatsApp)',
        eventType: eventType || 'ইভেন্ট ডেকোরেশন',
        date: eventDate || new Date().toISOString().split('T')[0],
        eventTime,
        location: location.trim() || 'কথোপকথনে নির্ধারিত হবে',
        venueType,
        guestCount: guestCount ? Number(guestCount) : 100,
        decorationStyle,
        requiredServices: selectedServices,
        budgetRange,
        estimatedBudget: 0,
        preferredContactMethod: 'WhatsApp',
        preferredContactTime,
        note: notes.trim(),
        status: 'New',
        adminNotes: 'Generated via Smart WhatsApp Inquiry button'
      });
    }

    const waUrl = getWhatsAppChatUrl(generatedWhatsAppText, '8801721779396');
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-print animate-fadeIn">
      <div className="bg-white border-4 border-black max-w-2xl w-full shadow-[8px_8px_0px_0px_#000000] relative my-auto overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 text-white p-4 sm:p-5 border-b-4 border-black flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-slate-950 shadow-md shrink-0">
              <MessageCircle size={22} className="fill-white text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles size={10} /> Smart WhatsApp Inquiry
                </span>
                <span className="text-[11px] text-amber-300 font-bold">
                  {timeGreeting.salutation} 🌸
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black uppercase text-white tracking-tight mt-0.5">
                স্মার্ট হোয়াটসঅ্যাপ ইনকোয়ারি ও কনসালটেশন
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 border-2 border-amber-400/50 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition shadow-xs cursor-pointer shrink-0"
            title="বন্ধ করুন"
          >
            <X size={16} />
          </button>
        </div>

        {/* Dynamic Greeting & Persona Pill */}
        <div className="bg-amber-50 border-b-2 border-black px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-bold text-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-base">🌸</span>
            <span>
              বর্তমান গ্রিটিং: <strong className="text-purple-900 font-black">{timeGreeting.fullGreeting}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1 bg-white border border-black/30 px-2 py-1 rounded text-[11px]">
            <Crown size={12} className="text-amber-500" />
            <span className="text-slate-600 font-semibold">ডেডিকেটেড ইভেন্ট কনসালটেন্ট:</span>
            <strong className="text-slate-900">Robin Kumar</strong>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b-2 border-black bg-slate-100 text-xs font-black">
          <button
            type="button"
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-2.5 px-3 text-center border-r-2 border-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'quick' ? 'bg-yellow-400 text-black shadow-inner' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sparkles size={14} />
            দ্রুত ইনকোয়ারি (Quick)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('detailed')}
            className={`flex-1 py-2.5 px-3 text-center border-r-2 border-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'detailed' ? 'bg-yellow-400 text-black shadow-inner' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers size={14} />
            বিস্তারিত ইভেন্ট তথ্য (Detailed)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2.5 px-3 text-center flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'preview' ? 'bg-yellow-400 text-black shadow-inner' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Eye size={14} />
            মেসেজ প্রিভিউ (Live Preview)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-4 text-xs font-bold text-slate-900">
          
          {/* TAB 1: QUICK INQUIRY */}
          {activeTab === 'quick' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-black text-slate-800">আপনার নাম (Customer Name)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="যেমন: অনিক রহমান"
                      className="w-full bg-slate-50 border-2 border-black p-2.5 pl-8 font-bold text-xs focus:bg-white focus:outline-none"
                    />
                    <User size={14} className="absolute left-2.5 top-3 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-black text-slate-800">মোবাইল নম্বর (Phone / WhatsApp)</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-slate-50 border-2 border-black p-2.5 pl-8 font-bold text-xs focus:bg-white focus:outline-none font-mono"
                    />
                    <Phone size={14} className="absolute left-2.5 top-3 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-black text-slate-800">ইভেন্টের ধরন (Event Type)</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2.5 font-bold text-xs focus:outline-none"
                  >
                    <option value="বিবাহ ও সংবর্ধনা (Wedding)">বিবাহ ও সংবর্ধনা (Wedding)</option>
                    <option value="গায়ে হলুদ ও মেহেন্দি (Haldi / Mehendi)">গায়ে হলুদ ও মেহেন্দি (Haldi / Mehendi)</option>
                    <option value="জন্মদিন ও বার্ষিকী (Birthday / Anniversary)">জন্মদিন ও বার্ষিকী (Birthday / Anniversary)</option>
                    <option value="কর্পোরেট ইভেন্ট ও সেমিনার (Corporate)">কর্পোরেট ইভেন্ট ও সেমিনার (Corporate)</option>
                    <option value="সাংস্কৃতিক অনুষ্ঠান ও মেলা (Cultural / Concert)">সাংস্কৃতিক অনুষ্ঠান ও মেলা (Cultural / Concert)</option>
                    <option value="অন্যান্য বিশেষ আয়োজন (Custom Event)">অন্যান্য বিশেষ আয়োজন (Custom Event)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-black text-slate-800">ইভেন্টের সম্ভাব্য তারিখ (Event Date)</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-black p-2.5 pl-8 font-bold text-xs focus:bg-white focus:outline-none"
                    />
                    <Calendar size={14} className="absolute left-2.5 top-3 text-slate-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-black text-slate-800">ভেন্যু বা লোকেশন (Venue / Location)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="যেমন: ভেড়ামারা, কুষ্টিয়া অথবা কমিউনিটি সেন্টারের নাম"
                    className="w-full bg-slate-50 border-2 border-black p-2.5 pl-8 font-bold text-xs focus:bg-white focus:outline-none"
                  />
                  <MapPin size={14} className="absolute left-2.5 top-3 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 font-black text-slate-800">প্রয়োজনীয় সার্ভিসসমূহ (Required Services)</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'স্টেজ ডেকোরেশন',
                    'এন্ট্রি গেট সাজসজ্জা',
                    'রয়েল লাইটিং সেটআপ',
                    'তাজা ফুলের সাজসজ্জা',
                    'সাউন্ড সিস্টেম',
                    'সম্পূর্ণ ভেন্যু ডেকোরেশন',
                    'ফটোজোন ও সেলফি কর্নার'
                  ].map(srv => {
                    const isSelected = selectedServices.includes(srv);
                    return (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => toggleService(srv)}
                        className={`px-2.5 py-1 text-[11px] font-bold border-2 border-black rounded transition cursor-pointer flex items-center gap-1 ${
                          isSelected ? 'bg-emerald-400 text-black shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected && <Check size={12} className="stroke-[3]" />}
                        {srv}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED EVENT SPECS */}
          {activeTab === 'detailed' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 font-black text-slate-800">ইভেন্টের সময় (Time)</label>
                  <input
                    type="text"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    placeholder="যেমন: দুপুর ১টা / সন্ধ্যা ৭টা"
                    className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-black text-slate-800">ভেন্যুর ধরন (Venue Type)</label>
                  <select
                    value={venueType}
                    onChange={(e) => setVenueType(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2.5 font-bold text-xs"
                  >
                    <option value="কমিউনিটি সেন্টার / কনভেনশন হল">কমিউনিটি সেন্টার / কনভেনশন হল</option>
                    <option value="রেস্টুরেন্ট / হোটেল ব্যাঙ্কুয়েট">রেস্টুরেন্ট / হোটেল ব্যাঙ্কুয়েট</option>
                    <option value="নিজস্ব বাড়ি / বাগানবাড়ি">নিজস্ব বাড়ি / বাগানবাড়ি</option>
                    <option value="আউটডোর / খোলা মাঠ">আউটডোর / খোলা মাঠ</option>
                    <option value="ক্লাব / রিসোর্ট">ক্লাব / রিসোর্ট</option>
                    <option value="অন্যান্য ভেন্যু">অন্যান্য ভেন্যু</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-black text-slate-800">অতিথি সংখ্যা (Guest Count)</label>
                  <input
                    type="number"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    placeholder="যেমন: ২৫০"
                    className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-black text-slate-800">ডেকোরেশন স্টাইল (Decoration Style)</label>
                  <select
                    value={decorationStyle}
                    onChange={(e) => setDecorationStyle(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2.5 font-bold text-xs"
                  >
                    <option value="লাক্সারি রয়্যাল ডেকোরেশন">লাক্সারি রয়্যাল ডেকোরেশন (Luxury Royal)</option>
                    <option value="মডার্ন ও কনটেম্পোরারি">মডার্ন ও কনটেম্পোরারি (Modern)</option>
                    <option value="মিনিমাল ও এলিগ্যান্ট">মিনিমাল ও এলিগ্যান্ট (Minimal)</option>
                    <option value="তাজা ফুলের এক্সক্লুসিভ সাজসজ্জা">তাজা ফুলের এক্সক্লুসিভ সাজসজ্জা (Floral)</option>
                    <option value="ঐতিহ্যবাহী ট্র্যাডিশনাল">ঐতিহ্যবাহী ট্র্যাডিশনাল (Traditional)</option>
                    <option value="কাস্টমাইজড থিম ডেকোরেশন">কাস্টমাইজড থিম ডেকোরেশন (Custom Theme)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-black text-slate-800">আনুমানিক বাজেট রেঞ্জ (Budget Range)</label>
                  <select
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2.5 font-bold text-xs"
                  >
                    <option value="">বাজেট পরে আলোচনা সাপেক্ষে</option>
                    <option value="৳২০,০০০ - ৳৫০,০০০">৳২০,০০০ - ৳৫০,০০০ (Basic Package)</option>
                    <option value="৳৫০,০০০ - ৳১,০০,০০০">৳৫০,০০০ - ৳১,০০,০০০ (Standard Package)</option>
                    <option value="৳১,০০,০০০ - ৳২,৫০,০০০">৳১,০০,০০০ - ৳২,৫০,০০০ (Premium Package)</option>
                    <option value="৳২,৫০,০০০+ (Exclusive Royal)">৳২,৫০,০০০+ (Exclusive Royal)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-black text-slate-800">যোগাযোগের সুবিধাজনক সময় (Preferred Contact Time)</label>
                <select
                  value={preferredContactTime}
                  onChange={(e) => setPreferredContactTime(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2.5 font-bold text-xs"
                >
                  <option value="যেকোনো সময়">যেকোনো সময় (Anytime)</option>
                  <option value="সকাল ১০টা - দুপুর ১টা">সকাল ১০টা - দুপুর ১টা</option>
                  <option value="দুপুর ২টা - বিকেল ৫টা">দুপুর ২টা - বিকেল ৫টা</option>
                  <option value="সন্ধ্যা ৬টা - রাত ৯টা">সন্ধ্যা ৬টা - রাত ৯টা</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-black text-slate-800">বিশেষ চাহিদা বা রেফারেন্স ডিজাইনের বিবরণ</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="কোনো বিশেষ থিম কালার বা ফুলের পছন্দ থাকলে লিখুন..."
                  className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold text-xs focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* TAB 3: LIVE WHATSAPP PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
                <span>হোয়াটসঅ্যাপে পাঠানো হবে এই বয়ানটি:</span>
                <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-mono text-[10px]">
                  WhatsApp Ready
                </span>
              </div>
              <div className="bg-emerald-950/90 text-emerald-100 p-4 rounded-xl border-2 border-black font-sans text-xs whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto shadow-inner">
                {generatedWhatsAppText}
              </div>
            </div>
          )}

          {/* Option to also register in database */}
          <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={alsoSaveOnline}
                onChange={(e) => setAlsoSaveOnline(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
              <span>একই সাথে অনলাইন বুকিং সিস্টেমে Request ID সহ জমা রাখুন (Sync to Booking Ledger)</span>
            </label>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 border-t-3 border-black p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-600 font-semibold flex items-center gap-1.5">
            <Phone size={13} className="text-emerald-600" />
            <span>সরাসরি অফিসিয়াল হেল্পলাইন: <strong>+880 1721-779396</strong></span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 border-2 border-black bg-white hover:bg-slate-100 text-black font-black uppercase text-xs cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleLaunchWhatsApp}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-2 border-black font-black uppercase text-xs flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000000] active:scale-95 transition cursor-pointer"
            >
              <MessageCircle size={16} className="fill-white" />
              WhatsApp-এ পাঠান
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
