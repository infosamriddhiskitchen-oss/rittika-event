import React, { useState, useMemo, useRef } from 'react';
import { 
  Briefcase, 
  Calendar, 
  Clock, 
  MapPin, 
  Building2, 
  Users, 
  Palette, 
  DollarSign, 
  Phone, 
  Mail, 
  MessageCircle, 
  Sparkles, 
  Send, 
  Check, 
  Upload, 
  X, 
  Image as ImageIcon, 
  Eye, 
  Copy, 
  CheckCircle2, 
  Printer, 
  ShieldCheck, 
  Layers, 
  HelpCircle,
  Crown
} from 'lucide-react';
import { OnlineBooking, BookingRequestStatus } from '../types';
import { 
  getTimeBasedBengaliGreeting, 
  buildWhatsAppInquiryMessage, 
  getWhatsAppChatUrl, 
  generateBookingRequestId 
} from '../utils/whatsappBookingHelper';
import { toBengaliNumber, formatCurrency } from '../utils';

interface OnlineBookingSectionProps {
  onAddOnlineBooking: (booking: Omit<OnlineBooking, 'id'>) => void;
  onOpenWhatsAppModal?: (initialData?: Partial<OnlineBooking>) => void;
}

export default function OnlineBookingSection({
  onAddOnlineBooking,
  onOpenWhatsAppModal
}: OnlineBookingSectionProps) {
  // 1. Customer Information
  const [custName, setCustName] = useState('');
  const [custMobile, setCustMobile] = useState('');
  const [custEmail, setCustEmail] = useState('');

  // 2. Event Information
  const [eventType, setEventType] = useState('বিবাহ ও সংবর্ধনা (Wedding)');
  const [eventDate, setEventDate] = useState(new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('সন্ধ্যা ৬:৩০');
  const [eventLoc, setEventLoc] = useState('');
  const [venueType, setVenueType] = useState('কমিউনিটি সেন্টার / ব্যাঙ্কুয়েট হল');
  const [guestCount, setGuestCount] = useState<number>(200);

  // 3. Decoration & Design
  const [decorationStyle, setDecorationStyle] = useState('লাক্সারি রয়্যাল গোল্ডেন');
  const [requiredServices, setRequiredServices] = useState<string[]>([
    'স্টেজ ডেকোরেশন',
    'রয়েল এন্ট্রি গেট',
    'ফুলের সাজসজ্জা'
  ]);
  const [preferredTheme, setPreferredTheme] = useState('গোল্ডেন ও মেরুন রয়েল থিম');
  const [referenceImageUrl, setReferenceImageUrl] = useState<string>('');
  const [referenceImageName, setReferenceImageName] = useState<string>('');
  const [uploadedPhotos, setUploadedPhotos] = useState<Array<{ id: string; name: string; url: string }>>([]);
  const [additionalRequirements, setAdditionalRequirements] = useState('');

  // 4. Budget
  const [budgetRange, setBudgetRange] = useState('৳৫০,০০০ - ৳১,০০,০০০');

  // 5. Contact Preference
  const [preferredContactMethod, setPreferredContactMethod] = useState<'WhatsApp' | 'Phone Call' | 'Email'>('WhatsApp');
  const [preferredContactTime, setPreferredContactTime] = useState('সন্ধ্যা ৬টা - রাত ৯টা');

  // 6. Message / Notes
  const [bookingNote, setBookingNote] = useState('');

  // UI States
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<OnlineBooking | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Dynamic Bengali greeting based on client's local time & entered name
  const timeGreeting = useMemo(() => {
    return getTimeBasedBengaliGreeting(custName);
  }, [custName]);

  // Automated Budget Range calculation estimate
  const estimatedBudget = useMemo(() => {
    let perGuestRate = 220;
    if (eventType.includes('Wedding')) perGuestRate = 320;
    else if (eventType.includes('Birthday')) perGuestRate = 150;
    else if (eventType.includes('Corporate')) perGuestRate = 400;
    else if (eventType.includes('Haldi')) perGuestRate = 200;
    
    return guestCount * perGuestRate;
  }, [eventType, guestCount]);

  // Service toggle
  const toggleService = (srv: string) => {
    setRequiredServices(prev => 
      prev.includes(srv) ? prev.filter(s => s !== srv) : [...prev, srv]
    );
  };

  // Multi-Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const res = reader.result;
          setUploadedPhotos(prev => {
            const updated = [...prev, { id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`, name: file.name, url: res }];
            if (updated.length > 0) {
              setReferenceImageUrl(updated[0].url);
              setReferenceImageName(updated.length > 1 ? `${updated.length} টি ছবি আপলোডকৃত` : updated[0].name);
            }
            return updated;
          });
        }
      };
      reader.readAsDataURL(file);
    });
    // Reset file input so same file can be re-selected if needed
    if (e.target) e.target.value = '';
  };

  const handleRemovePhoto = (id: string) => {
    setUploadedPhotos(prev => {
      const filtered = prev.filter(p => p.id !== id);
      if (filtered.length > 0) {
        setReferenceImageUrl(filtered[0].url);
        setReferenceImageName(filtered.length > 1 ? `${filtered.length} টি ছবি আপলোডকৃত` : filtered[0].name);
      } else {
        setReferenceImageUrl('');
        setReferenceImageName('');
      }
      return filtered;
    });
  };

  // WhatsApp Message Generator (Filters empty fields cleanly)
  const currentWhatsAppMessage = useMemo(() => {
    return buildWhatsAppInquiryMessage({
      customerName: custName,
      mobile: custMobile,
      eventType,
      eventDate,
      eventTime,
      location: eventLoc,
      venueType,
      guestCount,
      decorationStyle,
      budgetRange: budgetRange || `আনুমানিক ৳${estimatedBudget.toLocaleString('en-IN')}`,
      requiredServices,
      hasReferenceImage: !!referenceImageUrl,
      referenceImageNote: referenceImageName ? `ফাইল: ${referenceImageName}` : undefined,
      preferredContactTime: preferredContactTime === 'যেকোনো সময়' ? undefined : preferredContactTime,
      preferredContactMethod,
      notes: bookingNote
    });
  }, [
    custName,
    custMobile,
    eventType,
    eventDate,
    eventTime,
    eventLoc,
    venueType,
    guestCount,
    decorationStyle,
    budgetRange,
    estimatedBudget,
    requiredServices,
    referenceImageUrl,
    referenceImageName,
    preferredContactTime,
    preferredContactMethod,
    bookingNote
  ]);

  // Form Submit Handler
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custMobile.trim() || !eventLoc.trim()) {
      alert('অনুগ্রহ করে গ্রাহকের নাম, মোবাইল নম্বর এবং ভেন্যুর লোকেশন পূরণ করুন।');
      return;
    }

    setIsSubmitting(true);
    const newRequestId = generateBookingRequestId();

    const newBookingData: Omit<OnlineBooking, 'id'> = {
      requestId: newRequestId,
      createdAt: new Date().toISOString(),
      customerName: custName.trim(),
      mobile: custMobile.trim(),
      email: custEmail.trim() || undefined,
      eventType,
      date: eventDate,
      eventTime,
      location: eventLoc.trim(),
      venueType,
      guestCount,
      decorationStyle,
      requiredServices,
      preferredTheme,
      referenceImageUrl: referenceImageUrl || undefined,
      referenceImages: uploadedPhotos.length > 0 ? uploadedPhotos.map(p => p.url) : undefined,
      additionalRequirements: additionalRequirements.trim() || undefined,
      budgetRange,
      estimatedBudget,
      preferredContactMethod,
      preferredContactTime,
      note: bookingNote.trim() || undefined,
      status: 'New',
      adminNotes: 'Online booking request submitted via public website portal'
    };

    onAddOnlineBooking(newBookingData);

    const completeRecord: OnlineBooking = {
      ...newBookingData,
      id: `ob-${Date.now()}`
    };

    setSubmittedBooking(completeRecord);
    setIsSubmitting(false);
  };

  // Launch WhatsApp directly
  const handleDirectWhatsAppChat = () => {
    const waUrl = getWhatsAppChatUrl(currentWhatsAppMessage, '8801721779396');
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const copyRequestId = (reqId: string) => {
    navigator.clipboard.writeText(reqId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="online-booking-section">
      
      {/* 🌟 Top Hero Title Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 text-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                <Crown size={12} /> অফিসিয়াল বুকিং ও ইনকোয়ারি হাব
              </span>
              <span className="bg-white/10 text-amber-200 border border-white/20 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <span>{timeGreeting.fullGreeting}</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              অনলাইন ইভেন্ট বুকিং ও প্রিমিয়াম কনসালটেশন
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              আপনার বিশেষ মুহূর্তকে জাঁকজমকপূর্ণ ও স্মরণীয় করে তুলতে তথ্য পূরণ করে বুকিং রিকোয়েস্ট পাঠান অথবা সরাসরি আমাদের ডেডিকেটেড ইভেন্ট কনসালটেন্টের সাথে হোয়াটসঅ্যাপে আলোচনা করুন।
            </p>
          </div>

          {/* Direct WhatsApp Action in Banner */}
          <div className="shrink-0 flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={handleDirectWhatsAppChat}
              className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-xs uppercase rounded-xl border-2 border-amber-300 shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
            >
              <MessageCircle size={18} className="fill-white" />
              <span>💬 WhatsApp an Event Consultant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Form Layout & Live Preview Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 8 Cols: Full Form */}
        <div className="lg:col-span-8 bg-white border-4 border-black p-5 sm:p-7 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
          
          <form onSubmit={handleBookingSubmit} className="space-y-6 text-xs font-bold text-slate-900">
            
            {/* SECTION 1: Customer Information */}
            <div className="space-y-3 pb-5 border-b-2 border-black/20">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center text-black font-black text-xs">
                  ১
                </span>
                <h3 className="text-sm font-black uppercase text-slate-900">
                  গ্রাহকের প্রাথমিক তথ্য (Customer Information)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                <div>
                  <label className="block mb-1 font-black text-slate-800">
                    আপনার নাম (Customer Name) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="পুরো নাম লিখুন"
                    className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-black text-slate-800">
                    মোবাইল / WhatsApp নম্বর <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={custMobile}
                    onChange={(e) => setCustMobile(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold text-xs focus:bg-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-black text-slate-800">
                    ইমেইল ঠিকানা (Email - ঐচ্ছিক)
                  </label>
                  <input
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Event Information */}
            <div className="space-y-3 pb-5 border-b-2 border-black/20">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center text-black font-black text-xs">
                  ২
                </span>
                <h3 className="text-sm font-black uppercase text-slate-900">
                  ইভেন্ট ও ভেন্যুর বিবরণ (Event & Venue Details)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                <div>
                  <label className="block mb-1 font-black text-slate-800">
                    ইভেন্টের ধরন (Event Type) <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2.5 font-bold text-xs focus:outline-none"
                  >
                    <option value="বিবাহ ও সংবর্ধনা (Wedding)">বিবাহ ও সংবর্ধনা (Wedding)</option>
                    <option value="গায়ে হলুদ ও মেহেন্দি (Haldi / Mehendi)">গায়ে হলুদ ও মেহেন্দি (Haldi / Mehendi)</option>
                    <option value="জন্মদিন ও বার্ষিকী (Birthday / Anniversary)">জন্মদিন ও বার্ষিকী (Birthday / Anniversary)</option>
                    <option value="কর্পোরেট ইভেন্ট ও সেমিনার (Corporate)">কর্পোরেট ইভেন্ট ও সেমিনার (Corporate)</option>
                    <option value="সাংস্কৃতিক উৎসব / কনসার্ট (Cultural)">সাংস্কৃতিক উৎসব / কনসার্ট (Cultural)</option>
                    <option value="পারিবারিক গেট টুগেদার ও পার্টি (Party)">পারিবারিক গেট টুগেদার ও পার্টি (Party)</option>
                    <option value="অন্যান্য বিশেষ আয়োজন (Custom Event)">অন্যান্য বিশেষ আয়োজন (Custom Event)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-black text-slate-800">
                    ইভেন্টের তারিখ (Date) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-black text-slate-800">
                    ইভেন্টের সময় (Time)
                  </label>
                  <input
                    type="text"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    placeholder="যেমন: দুপুর ১২:৩০ বা সন্ধ্যা ৭:০০"
                    className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block mb-1 font-black text-slate-800">
                    ভেন্যু ও লোকেশনের পুরো ঠিকানা <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={eventLoc}
                    onChange={(e) => setEventLoc(e.target.value)}
                    placeholder="যেমন: রথপাড়া কমিউনিটি সেন্টার, ভেড়ামারা, কুষ্টিয়া"
                    className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-black text-slate-800">
                    ভেন্যুর ধরন (Venue Type)
                  </label>
                  <select
                    value={venueType}
                    onChange={(e) => setVenueType(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2.5 font-bold text-xs focus:outline-none"
                  >
                    <option value="কমিউনিটি সেন্টার / ব্যাঙ্কুয়েট হল">কমিউনিটি সেন্টার / ব্যাঙ্কুয়েট হল</option>
                    <option value="রেস্টুরেন্ট / হোটেল ব্যাঙ্কুয়েট">রেস্টুরেন্ট / হোটেল ব্যাঙ্কুয়েট</option>
                    <option value="নিজস্ব বাড়ি / বাগানবাড়ি">নিজস্ব বাড়ি / বাগানবাড়ি</option>
                    <option value="আউটডোর / খোলা মাঠ">আউটডোর / খোলা মাঠ</option>
                    <option value="ক্লাব / রিসোর্ট ভেন্যু">ক্লাব / রিসোর্ট ভেন্যু</option>
                    <option value="অন্যান্য ভেন্যু">অন্যান্য ভেন্যু</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-black text-slate-800">
                  আনুমানিক অতিথি সংখ্যা (Guests Count): <span className="text-purple-900 font-black">{toBengaliNumber(guestCount)} জন</span>
                </label>
                <input
                  type="range"
                  min="30"
                  max="2000"
                  step="10"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>৩০ জন</span>
                  <span>৫০০ জন</span>
                  <span>১০০০ জন</span>
                  <span>২০০০+ জন</span>
                </div>
              </div>
            </div>

            {/* SECTION 3: Decoration & Design */}
            <div className="space-y-3 pb-5 border-b-2 border-black/20">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center text-black font-black text-xs">
                  ৩
                </span>
                <h3 className="text-sm font-black uppercase text-slate-900">
                  ডেকোরেশন স্টাইল ও সার্ভিস পছন্দ (Decoration & Services)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="block mb-1 font-black text-slate-800">
                    পছন্দের ডেকোরেশন স্টাইল (Decoration Style)
                  </label>
                  <select
                    value={decorationStyle}
                    onChange={(e) => setDecorationStyle(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2.5 font-bold text-xs focus:outline-none"
                  >
                    <option value="লাক্সারি রয়্যাল গোল্ডেন">লাক্সারি রয়্যাল গোল্ডেন (Luxury Royal)</option>
                    <option value="মডার্ন ও কনটেম্পোরারি মিনিমাল">মডার্ন ও কনটেম্পোরারি মিনিমাল (Modern Minimal)</option>
                    <option value="তাজা ফুলের এক্সক্লুসিভ সাজসজ্জা">তাজা ফুলের এক্সক্লুসিভ সাজসজ্জা (Floral Paradise)</option>
                    <option value="ঐতিহ্যবাহী বাঙ্গালী ট্র্যাডিশনাল">ঐতিহ্যবাহী বাঙ্গালী ট্র্যাডিশনাল (Traditional Heritage)</option>
                    <option value="কাস্টমাইজড থিম ও ড্রিমলুক">কাস্টমাইজড থিম ও ড্রিমলুক (Custom Dream)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-black text-slate-800">
                    পছন্দের কালার থিম (Preferred Theme)
                  </label>
                  <input
                    type="text"
                    value={preferredTheme}
                    onChange={(e) => setPreferredTheme(e.target.value)}
                    placeholder="যেমন: গোল্ডেন-হোয়াইট, প্যাস্টেল পিঙ্ক, রয়েল ব্লু"
                    className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Required Services Checkboxes */}
              <div>
                <label className="block mb-1.5 font-black text-slate-800">
                  প্রয়োজনীয় সার্ভিসসমূহ নির্বাচন করুন (Select Services):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'স্টেজ ডেকোরেশন',
                    'রয়েল এন্ট্রি গেট',
                    'রয়েল লাইটিং সেটআপ',
                    'তাজা ফুলের সাজসজ্জা',
                    'ফটোজোন ও সেলফি কর্নার',
                    'প্রফেশনাল সাউন্ড সিস্টেম',
                    'ভিআইপি ডাইনিং সেটআপ',
                    'স্মোক ও ফায়ার এফেক্টস',
                    'সম্পূর্ণ ভেন্যু সাজসজ্জা'
                  ].map(srv => {
                    const isSelected = requiredServices.includes(srv);
                    return (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => toggleService(srv)}
                        className={`p-2 rounded border-2 border-black text-left flex items-center justify-between gap-1 transition cursor-pointer ${
                          isSelected 
                            ? 'bg-yellow-400 text-black shadow-[2px_2px_0px_0px_#000000] font-black' 
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold'
                        }`}
                      >
                        <span className="text-[11px] truncate">{srv}</span>
                        {isSelected && <Check size={14} className="stroke-[3] text-black shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reference Image Upload (Multiple photos supported) */}
              <div className="pt-1 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-black text-slate-800 text-xs">
                    রেফারেন্স ডিজাইন ও ভেন্যুর ছবি আপলোড (একাধিক ছবি সাপোর্ট)
                  </label>
                  <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    একসাথে একাধিক ছবি সিলেক্ট করা যাবে
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border-2 border-black text-black font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition"
                  >
                    <Upload size={14} />
                    <span>+ ছবি যোগ করুন (একাধিক ছবি সিলেক্ট করুন)</span>
                  </button>

                  {uploadedPhotos.length > 0 && (
                    <span className="text-xs font-black text-slate-700 font-mono">
                      মোট {uploadedPhotos.length} টি ছবি সংযুক্ত
                    </span>
                  )}
                </div>

                {/* Multiple Uploaded Photos Grid */}
                {uploadedPhotos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 pt-2">
                    {uploadedPhotos.map((photo, idx) => (
                      <div key={photo.id} className="relative group border-2 border-black bg-white rounded-lg overflow-hidden shadow-xs">
                        <img 
                          src={photo.url} 
                          alt={photo.name} 
                          className="w-full h-20 object-cover" 
                        />
                        <div className="p-1 bg-slate-900 text-white text-[9px] truncate font-mono">
                          {photo.name || `ছবি ${idx + 1}`}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(photo.id)}
                          className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow-md cursor-pointer transition transform hover:scale-110"
                          title="ছবি মুছুন"
                        >
                          <X size={12} className="stroke-[3]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 4: Budget & Contact Preference */}
            <div className="space-y-3 pb-5 border-b-2 border-black/20">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center text-black font-black text-xs">
                  ৪
                </span>
                <h3 className="text-sm font-black uppercase text-slate-900">
                  বাজেট ও যোগাযোগের সুবিধা (Budget & Contact Preference)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                <div>
                  <label className="block mb-1 font-black text-slate-800">
                    আনুমানিক বাজেট রেঞ্জ (Budget Range)
                  </label>
                  <select
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2.5 font-bold text-xs focus:outline-none"
                  >
                    <option value="বাজেট আলোচনা সাপেক্ষে">বাজেট আলোচনা সাপেক্ষে</option>
                    <option value="৳২৫,০০০ - ৳৫০,০০০">৳২৫,০০০ - ৳৫০,০০০ (বেসিক)</option>
                    <option value="৳৫০,০০০ - ৳১,০০,০০০">৳৫০,০০০ - ৳১,০০,০০০ (স্ট্যান্ডার্ড)</option>
                    <option value="৳১,০০,০০০ - ৳২,৫০,০০০">৳১,০০,০০০ - ৳২,৫০,০০০ (প্রিমিয়াম)</option>
                    <option value="৳২,৫০,০০০+ (রয়্যাল লাক্সারি)">৳২,৫০,০০০+ (রয়্যাল লাক্সারি)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-black text-slate-800">
                    পছন্দের যোগাযোগ মাধ্যম
                  </label>
                  <select
                    value={preferredContactMethod}
                    onChange={(e) => setPreferredContactMethod(e.target.value as any)}
                    className="w-full bg-white border-2 border-black p-2.5 font-bold text-xs focus:outline-none"
                  >
                    <option value="WhatsApp">হোয়াটসঅ্যাপ (WhatsApp Chat)</option>
                    <option value="Phone Call">ফোন কল (Direct Phone Call)</option>
                    <option value="Email">ইমেইল (Email)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-black text-slate-800">
                    যোগাযোগের সুবিধাজনক সময়
                  </label>
                  <select
                    value={preferredContactTime}
                    onChange={(e) => setPreferredContactTime(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2.5 font-bold text-xs focus:outline-none"
                  >
                    <option value="যেকোনো সময়">যেকোনো সময় (Anytime)</option>
                    <option value="সকাল ১০টা - দুপুর ১টা">সকাল ১০টা - দুপুর ১টা</option>
                    <option value="দুপুর ২টা - বিকেল ৫টা">দুপুর ২টা - বিকেল ৫টা</option>
                    <option value="সন্ধ্যা ৬টা - রাত ৯টা">সন্ধ্যা ৬টা - রাত ৯টা</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 5: Special Notes & Message */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center text-black font-black text-xs">
                  ৫
                </span>
                <h3 className="text-sm font-black uppercase text-slate-900">
                  বিশেষ বার্তা বা কোনো চাহিদা (Special Notes / Requirements)
                </h3>
              </div>

              <div>
                <textarea
                  rows={3}
                  value={bookingNote}
                  onChange={(e) => setBookingNote(e.target.value)}
                  placeholder="আপনার ইভেন্ট সম্পর্কে বিশেষ কোনো পরামর্শ, নির্দিষ্ট ফুল বা কালার পছন্দ ইত্যাদি বিস্তারিত লিখুন..."
                  className="w-full bg-slate-50 border-2 border-black p-3 font-bold text-xs focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons Bar */}
            <div className="pt-4 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowLivePreview(!showLivePreview)}
                  className="px-3.5 py-3 border-2 border-black bg-slate-100 hover:bg-slate-200 text-black font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
                >
                  <Eye size={15} />
                  <span>{showLivePreview ? 'প্রিভিউ লুকান' : 'হোয়াটসঅ্যাপ মেসেজ প্রিভিউ'}</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                {/* Submit to System Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3.5 bg-yellow-400 hover:bg-yellow-500 text-black border-3 border-black font-black text-xs uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000000] active:scale-95 transition cursor-pointer"
                >
                  <Send size={16} />
                  <span>📅 অনলাইন বুকিং রিকোয়েস্ট পাঠান</span>
                </button>

                {/* WhatsApp Chat Button */}
                <button
                  type="button"
                  onClick={handleDirectWhatsAppChat}
                  className="w-full sm:w-auto px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-3 border-black font-black text-xs uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000000] active:scale-95 transition cursor-pointer"
                >
                  <MessageCircle size={16} className="fill-white" />
                  <span>💬 WhatsApp-এ সরাসরি পাঠান</span>
                </button>
              </div>
            </div>

          </form>

        </div>

        {/* Right 4 Cols: Live Preview & AI Estimator */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI Estimator Card */}
          <div className="bg-slate-900 text-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded">
                ✨ এআই বাজেট ক্যালকুলেটর
              </span>
              <span className="text-[10px] text-amber-300 font-mono">Live Estimate</span>
            </div>

            <div className="space-y-2 text-xs border-y border-white/15 py-3">
              <div className="flex justify-between">
                <span className="text-slate-300">ইভেন্টের ধরন:</span>
                <span className="text-amber-200 font-bold">{eventType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">অতিথি সংখ্যা:</span>
                <span className="text-white font-mono font-bold">{toBengaliNumber(guestCount)} জন</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">ডেকোরেশন স্টাইল:</span>
                <span className="text-amber-200 font-bold truncate max-w-[150px]">{decorationStyle}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">আনুমানিক প্রারম্ভিক বাজেট:</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono tracking-tight">
                {formatCurrency(estimatedBudget)}
              </span>
            </div>

            <div className="p-2.5 bg-white/10 rounded border border-white/15 text-[10px] text-slate-300 leading-relaxed">
              💡 এটি একটি আনুমানিক ধারণা। আপনার পছন্দের ফুল ও কাস্টমাইজেশন অনুযায়ী আমাদের ডেডিকেটেড কনসালটেন্ট চূড়ান্ত বাজেট প্রস্তাব পাঠাবেন।
            </div>
          </div>

          {/* WhatsApp Live Preview Box */}
          <div className="bg-emerald-950 border-4 border-black p-5 text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-800 pb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-300">
                <MessageCircle size={16} className="fill-emerald-400 text-emerald-950" />
                <span>WhatsApp মেসেজ ফরম্যাট</span>
              </div>
              <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded font-mono">
                Auto-Formatted
              </span>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-3.5 border border-emerald-700/50 font-sans text-xs text-emerald-100 whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto shadow-inner select-text">
              {currentWhatsAppMessage}
            </div>

            <button
              type="button"
              onClick={handleDirectWhatsAppChat}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase flex items-center justify-center gap-2 rounded border border-emerald-300 cursor-pointer shadow-md transition"
            >
              <MessageCircle size={14} className="fill-slate-950" />
              <span>এই মেসেজ নিয়ে WhatsApp ওপেন করুন</span>
            </button>
          </div>

          {/* Quick Consultant Card */}
          <div className="bg-amber-50 border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-400 border border-black flex items-center justify-center text-black font-black">
                RK
              </div>
              <div>
                <h4 className="font-black text-slate-900">Robin Kumar (Event Consultant)</h4>
                <p className="text-[10px] text-slate-600 font-semibold">মোবাইল: +880 1721-779396</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-700 leading-normal">
              যেকোনো জরুরি জিজ্ঞাসা বা ব্যক্তিগত পরামর্শের জন্য সরাসরি কল বা বার্তা পাঠান।
            </p>
          </div>

        </div>

      </div>

      {/* 🌟 Confirmation Dialog Modal upon Successful Booking Submission */}
      {submittedBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border-4 border-black max-w-lg w-full shadow-[8px_8px_0px_0px_#000000] p-6 sm:p-7 relative space-y-5">
            
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 border-2 border-black flex items-center justify-center mx-auto text-emerald-600 shadow-[3px_3px_0px_0px_#000000]">
              <CheckCircle2 size={36} className="stroke-[2.5]" />
            </div>

            <div className="text-center space-y-2">
              <span className="text-base font-serif">ধন্যবাদ! 🌸</span>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                আপনার Event Booking Request সফলভাবে গ্রহণ করা হয়েছে
              </h3>
              <p className="text-xs font-semibold text-slate-600 leading-relaxed max-w-md mx-auto">
                আমাদের একজন <strong>Dedicated Event Consultant</strong> আপনার দেওয়া তথ্য পর্যালোচনা করে অতি দ্রুত আপনার সঙ্গে যোগাযোগ করবেন।
              </p>
            </div>

            {/* Request ID Badge */}
            <div className="bg-slate-50 border-2 border-black p-4 rounded-xl flex items-center justify-between gap-3 shadow-inner">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-500 block">আপনার বুকিং রিকোয়েস্ট আইডি:</span>
                <span className="text-base sm:text-lg font-black font-mono text-purple-900">
                  {submittedBooking.requestId || submittedBooking.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyRequestId(submittedBooking.requestId || submittedBooking.id)}
                className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 border-2 border-black text-black font-black text-xs flex items-center gap-1 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
              >
                {copiedId ? <Check size={14} className="stroke-[3]" /> : <Copy size={14} />}
                <span>{copiedId ? 'কপি হয়েছে' : 'কপি করুন'}</span>
              </button>
            </div>

            {/* Summary Brief */}
            <div className="border-t border-b border-slate-200 py-3 text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span>গ্রাহক:</span>
                <strong className="text-slate-900">{submittedBooking.customerName}</strong>
              </div>
              <div className="flex justify-between">
                <span>ইভেন্টের তারিখ:</span>
                <strong className="text-slate-900">{submittedBooking.date}</strong>
              </div>
              <div className="flex justify-between">
                <span>ভেন্যু:</span>
                <strong className="text-slate-900 truncate max-w-[200px]">{submittedBooking.location}</strong>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  const msg = buildWhatsAppInquiryMessage({
                    customerName: submittedBooking.customerName,
                    mobile: submittedBooking.mobile,
                    eventType: submittedBooking.eventType,
                    eventDate: submittedBooking.date,
                    location: submittedBooking.location,
                    requestId: submittedBooking.requestId,
                    budgetRange: submittedBooking.budgetRange,
                    notes: 'অনলাইন বুকিং রিকোয়েস্ট সফলভাবে সাবমিট করেছি।'
                  });
                  const waUrl = getWhatsAppChatUrl(msg, '8801721779396');
                  window.open(waUrl, '_blank', 'noopener,noreferrer');
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-xs uppercase rounded border-2 border-black flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000000] cursor-pointer"
              >
                <MessageCircle size={16} className="fill-white" />
                <span>💬 WhatsApp-এ কনসালটেন্টকে মেসেজ দিন</span>
              </button>

              <button
                type="button"
                onClick={() => setSubmittedBooking(null)}
                className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs uppercase rounded border-2 border-black cursor-pointer"
              >
                বন্ধ করুন (Close)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
