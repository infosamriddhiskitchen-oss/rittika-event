import React, { useState, useMemo } from 'react';
import { 
  Send, 
  MessageCircle, 
  Phone, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  MapPin, 
  User, 
  DollarSign, 
  FileText, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Layers, 
  ChevronRight, 
  Image as ImageIcon, 
  Eye, 
  ExternalLink,
  Crown,
  Share2,
  Check,
  Building2,
  Users
} from 'lucide-react';
import { OnlineBooking, BookingRequestStatus, UserRole } from '../types';
import { 
  getBookingStatusBadge, 
  getWhatsAppChatUrl, 
  getTimeBasedBengaliGreeting 
} from '../utils/whatsappBookingHelper';
import { toBengaliNumber, formatCurrency } from '../utils';

interface BookingRequestsInboxProps {
  onlineBookings: OnlineBooking[];
  onUpdateBookingStatus: (bookingId: string, status: BookingRequestStatus, adminNotes?: string) => void;
  onApproveBooking?: (bookingId: string) => void;
  onDeclineBooking?: (bookingId: string) => void;
  onDeleteBooking?: (bookingId: string) => void;
  onConvertToQuotation?: (booking: OnlineBooking) => void;
  canEdit: boolean;
  userRole: UserRole;
}

export default function BookingRequestsInbox({
  onlineBookings,
  onUpdateBookingStatus,
  onApproveBooking,
  onDeclineBooking,
  onDeleteBooking,
  onConvertToQuotation,
  canEdit,
  userRole
}: BookingRequestsInboxProps) {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeBookingModal, setActiveBookingModal] = useState<OnlineBooking | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState<string>('');
  const [statusChangeSelect, setStatusChangeSelect] = useState<BookingRequestStatus>('New');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Status Filter options
  const statusFilterOptions = [
    { key: 'ALL', label: 'সকল আবেদন (All)' },
    { key: 'New', label: 'নতুন (New)' },
    { key: 'Contacted', label: 'যোগাযোগ হয়েছে' },
    { key: 'Consultation Scheduled', label: 'পরামর্শ নির্ধারিত' },
    { key: 'Quotation Sent', label: 'কোটেশন প্রেরিত' },
    { key: 'Confirmed', label: 'নিশ্চিত (Confirmed)' },
    { key: 'Completed', label: 'সম্পন্ন' },
    { key: 'Cancelled', label: 'বাতিল' }
  ];

  // Filtered list
  const filteredBookings = useMemo(() => {
    return [...onlineBookings].reverse().filter(b => {
      // Status filter
      if (selectedStatusFilter !== 'ALL') {
        if (selectedStatusFilter === 'New' && (b.status === 'New' || b.status === 'Pending')) {
          // match
        } else if (b.status !== selectedStatusFilter) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = b.customerName?.toLowerCase().includes(query);
        const matchesMobile = b.mobile?.includes(query);
        const matchesLoc = b.location?.toLowerCase().includes(query);
        const matchesReqId = b.requestId?.toLowerCase().includes(query);
        const matchesEvent = b.eventType?.toLowerCase().includes(query);
        return matchesName || matchesMobile || matchesLoc || matchesReqId || matchesEvent;
      }

      return true;
    });
  }, [onlineBookings, selectedStatusFilter, searchQuery]);

  // Quick stats
  const stats = useMemo(() => {
    const total = onlineBookings.length;
    const newCount = onlineBookings.filter(b => b.status === 'New' || b.status === 'Pending').length;
    const confirmedCount = onlineBookings.filter(b => b.status === 'Confirmed' || b.status === 'Approved').length;
    const quotationCount = onlineBookings.filter(b => b.status === 'Quotation Sent').length;
    return { total, newCount, confirmedCount, quotationCount };
  }, [onlineBookings]);

  // Open detail modal
  const openDetailModal = (booking: OnlineBooking) => {
    setActiveBookingModal(booking);
    setAdminNoteInput(booking.adminNotes || '');
    setStatusChangeSelect(booking.status || 'New');
  };

  // Save modal status update
  const handleSaveModalUpdate = () => {
    if (!activeBookingModal) return;
    onUpdateBookingStatus(activeBookingModal.id, statusChangeSelect, adminNoteInput);
    setActiveBookingModal(null);
  };

  // Send WhatsApp Reply to Customer
  const handleSendWhatsAppReply = (booking: OnlineBooking) => {
    const { fullGreeting } = getTimeBasedBengaliGreeting(booking.customerName);
    const replyText = `${fullGreeting}

রিত্তিকা ইভেন্ট ম্যানেজমেন্ট থেকে আপনার বুকিং রিকোয়েস্ট (${booking.requestId || booking.id}) সংক্রান্ত তথ্য পর্যালোচনা করা হয়েছে।

📌 ইভেন্টের ধরন: ${booking.eventType}
📅 তারিখ: ${booking.date}
📍 ভেন্যু: ${booking.location}

আমাদের ডেডিকেটেড ইভেন্ট কনসালটেন্ট টিম আপনার ডেকোরেশন প্ল্যান নিয়ে আলোচনা করতে প্রস্তুত। আপনার সাথে কথা বলার সুবিধাজনক সময় জানাবেন কি?

ধন্যবাদ। 💐
Robin Kumar (CEO)
রিত্তিকা ইভেন্ট ম্যানেজমেন্ট
+880 1721-779396`;

    const waUrl = getWhatsAppChatUrl(replyText, booking.mobile);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white border-4 border-black p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
      
      {/* Header Bar */}
      <div className="border-b-3 border-black pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-yellow-400 border-2 border-black rounded-lg text-black font-black">
              <Send size={18} />
            </span>
            <h3 className="text-base sm:text-lg font-black text-black uppercase tracking-tight">
              অনলাইন বুকিং ও ইনকোয়ারি ইনবক্স (Booking CRM Hub)
            </h3>
          </div>
          <p className="text-xs font-bold text-slate-600 mt-1">
            ওয়েবসাইট ও হোয়াটসঅ্যাপ থেকে আসা সকল ক্লায়েন্ট বুকিং রিকোয়েস্ট ম্যানেজ, স্ট্যাটাস ট্র্যাকিং ও যোগাযোগ করুন।
          </p>
        </div>

        {/* Quick Summary Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-black">
          <div className="px-3 py-1.5 bg-slate-100 border-2 border-black rounded shadow-[2px_2px_0px_0px_#000000]">
            সর্বমোট: <span className="text-indigo-700 font-mono font-black">{toBengaliNumber(stats.total)}</span>
          </div>
          <div className="px-3 py-1.5 bg-rose-100 text-rose-900 border-2 border-black rounded shadow-[2px_2px_0px_0px_#000000]">
            নতুন রিকোয়েস্ট: <span className="font-mono font-black">{toBengaliNumber(stats.newCount)}</span>
          </div>
          <div className="px-3 py-1.5 bg-emerald-100 text-emerald-900 border-2 border-black rounded shadow-[2px_2px_0px_0px_#000000]">
            নিশ্চিত বুকিং: <span className="font-mono font-black">{toBengaliNumber(stats.confirmedCount)}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="গ্রাহকের নাম, মোবাইল, রিকোয়েস্ট আইডি বা লোকেশন দিয়ে খুঁজুন..."
            className="w-full bg-slate-50 border-2 border-black p-2.5 pl-9 font-bold text-xs focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_#000000]"
          />
          <Search size={15} className="absolute left-3 top-3 text-slate-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-xs text-slate-500 hover:text-black font-black"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {statusFilterOptions.map(opt => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSelectedStatusFilter(opt.key)}
              className={`px-3 py-1.5 text-[11px] font-black border-2 border-black rounded-lg transition whitespace-nowrap cursor-pointer ${
                selectedStatusFilter === opt.key 
                  ? 'bg-yellow-400 text-black shadow-[2px_2px_0px_0px_#000000]' 
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Booking List Cards */}
      <div className="space-y-3.5">
        {filteredBookings.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 space-y-2">
            <Send size={28} className="mx-auto text-slate-400 stroke-1" />
            <p className="text-xs font-black text-slate-500 uppercase">কোনো বুকিং আবেদন পাওয়া যায়নি</p>
            <p className="text-[11px] text-slate-400 font-medium">ফিল্টার বা সার্চ কি-ওয়ার্ড পরিবর্তন করে দেখুন।</p>
          </div>
        ) : (
          filteredBookings.map(b => {
            const badge = getBookingStatusBadge(b.status);
            return (
              <div 
                key={b.id} 
                className="border-3 border-black p-4 sm:p-5 bg-white hover:bg-slate-50/60 transition shadow-[3px_3px_0px_0px_#000000] rounded-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
              >
                {/* Left: Client & Event Core Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {b.requestId && (
                      <span className="bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-black font-mono px-2 py-0.5 rounded">
                        {b.requestId}
                      </span>
                    )}
                    <h4 className="text-sm font-black text-slate-900">{b.customerName}</h4>
                    <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                      {badge.label}
                    </span>
                    {b.createdAt && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(b.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-black/10 font-mono">
                      <Phone size={12} className="text-emerald-600" />
                      {toBengaliNumber(b.mobile)}
                    </span>
                    <span className="flex items-center gap-1 bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200">
                      <Calendar size={12} className="text-blue-600" />
                      {toBengaliNumber(b.date)} {b.eventTime && `(${b.eventTime})`}
                    </span>
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                      <Building2 size={12} className="text-amber-600" />
                      {b.eventType}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-black/10">
                      <MapPin size={12} className="text-rose-500" />
                      {b.location}
                    </span>
                    {b.guestCount && (
                      <span className="flex items-center gap-1 bg-teal-50 text-teal-900 px-2 py-0.5 rounded border border-teal-200">
                        <Users size={12} className="text-teal-600" />
                        {toBengaliNumber(b.guestCount)} জন অতিথি
                      </span>
                    )}
                  </div>

                  {/* Required services or notes */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {b.requiredServices?.map(s => (
                      <span key={s} className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded border border-slate-200">
                        ✓ {s}
                      </span>
                    ))}
                    {b.budgetRange && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200 font-mono">
                        বাজেট: {b.budgetRange}
                      </span>
                    )}
                  </div>

                  {b.note && (
                    <p className="text-[11px] text-slate-600 bg-amber-50/80 p-2 rounded border border-amber-200 italic">
                      "{b.note}"
                    </p>
                  )}

                  {b.adminNotes && (
                    <p className="text-[10px] text-purple-900 font-bold">
                      অ্যাডমিন নোট: {b.adminNotes}
                    </p>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-2 w-full lg:w-auto shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap justify-end w-full sm:w-auto">
                    
                    {/* WhatsApp Reply Button */}
                    <button
                      type="button"
                      onClick={() => handleSendWhatsAppReply(b)}
                      title="গ্রাহকের সাথে WhatsApp এ চ্যাট করুন"
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded border border-black flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                    >
                      <MessageCircle size={13} className="fill-white" />
                      <span>WhatsApp</span>
                    </button>

                    {/* View Details / Status Change Modal */}
                    <button
                      type="button"
                      onClick={() => openDetailModal(b)}
                      className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xs rounded border border-black flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                    >
                      <Edit3 size={13} />
                      <span>স্ট্যাটাস ও ডিটেইলস</span>
                    </button>

                    {/* Reference image viewer */}
                    {b.referenceImageUrl && (
                      <button
                        type="button"
                        onClick={() => setPreviewImage(b.referenceImageUrl || null)}
                        className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs rounded border border-indigo-300 flex items-center gap-1 cursor-pointer"
                        title="রেফারেন্স ডিজাইন ছবি দেখুন"
                      >
                        <ImageIcon size={14} />
                      </button>
                    )}

                    {/* Delete button */}
                    {onDeleteBooking && canEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`আপনি কি "${b.customerName}" এর বুকিং রিকোয়েস্ট মুছে ফেলতে চান?`)) {
                            onDeleteBooking(b.id);
                          }
                        }}
                        className="p-1.5 hover:bg-rose-100 text-rose-600 rounded border border-transparent hover:border-rose-300 cursor-pointer"
                        title="রিকোয়েস্ট মুছুন"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {/* 1-Click Approve / Advance Status */}
                  {canEdit && (
                    <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                      {b.status === 'New' || b.status === 'Pending' ? (
                        <button
                          type="button"
                          onClick={() => onUpdateBookingStatus(b.id, 'Contacted', 'ক্লায়েন্টের সঙ্গে যোগাযোগ করা হয়েছে')}
                          className="px-2.5 py-1 bg-sky-400 hover:bg-sky-500 text-black font-black text-[10px] uppercase rounded border border-black shadow-xs cursor-pointer"
                        >
                          → Contacted মার্ক করুন
                        </button>
                      ) : b.status === 'Contacted' ? (
                        <button
                          type="button"
                          onClick={() => onUpdateBookingStatus(b.id, 'Consultation Scheduled', 'পরামর্শের তারিখ নির্ধারিত হয়েছে')}
                          className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-black font-black text-[10px] uppercase rounded border border-black shadow-xs cursor-pointer"
                        >
                          → Consultation শিডিউল
                        </button>
                      ) : b.status === 'Consultation Scheduled' ? (
                        <button
                          type="button"
                          onClick={() => onUpdateBookingStatus(b.id, 'Quotation Sent', 'কোটেশন পাঠানো হয়েছে')}
                          className="px-2.5 py-1 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-[10px] uppercase rounded border border-black shadow-xs cursor-pointer"
                        >
                          → Quotation Sent মার্ক করুন
                        </button>
                      ) : b.status === 'Quotation Sent' && onApproveBooking ? (
                        <button
                          type="button"
                          onClick={() => onApproveBooking(b.id)}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase rounded border border-black shadow-xs cursor-pointer"
                        >
                          ✓ বুকিং কনফার্ম ও প্রজেক্ট তৈরি
                        </button>
                      ) : null}
                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 🌟 Detail & Status Management Modal */}
      {activeBookingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border-4 border-black max-w-xl w-full shadow-[8px_8px_0px_0px_#000000] p-6 relative space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-900 font-mono">
                  {activeBookingModal.requestId || activeBookingModal.id}
                </span>
                <h3 className="text-base font-black text-slate-900">
                  বুকিং আবেদন ও ক্লায়েন্ট প্রোফাইল
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveBookingModal(null)}
                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-black font-black"
              >
                ✕
              </button>
            </div>

            {/* Client Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-black/10">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">গ্রাহকের নাম:</span>
                <strong className="text-slate-900">{activeBookingModal.customerName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">মোবাইল নম্বর:</span>
                <strong className="text-slate-900 font-mono">{activeBookingModal.mobile}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">ইভেন্টের ধরন:</span>
                <span className="text-purple-900 font-bold">{activeBookingModal.eventType}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">ইভেন্টের তারিখ:</span>
                <span className="text-slate-900 font-bold font-mono">{activeBookingModal.date}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">ভেন্যুর ঠিকানা:</span>
                <span className="text-slate-900 font-bold">{activeBookingModal.location}</span>
              </div>
              {activeBookingModal.decorationStyle && (
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">ডেকোরেশন স্টাইল:</span>
                  <span className="text-slate-900 font-bold">{activeBookingModal.decorationStyle}</span>
                </div>
              )}
              {activeBookingModal.budgetRange && (
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">বাজেট রেঞ্জ:</span>
                  <span className="text-emerald-700 font-bold font-mono">{activeBookingModal.budgetRange}</span>
                </div>
              )}
            </div>

            {/* Status Change Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-800">
                বুকিং স্ট্যাটাস পরিবর্তন করুন (Pipeline Stage):
              </label>
              <select
                value={statusChangeSelect}
                onChange={(e) => setStatusChangeSelect(e.target.value as BookingRequestStatus)}
                className="w-full bg-white border-2 border-black p-2.5 font-bold text-xs focus:outline-none"
              >
                <option value="New">নতুন রিকোয়েস্ট (New)</option>
                <option value="Contacted">যোগাযোগ সম্পন্ন (Contacted)</option>
                <option value="Consultation Scheduled">পরামর্শ নির্ধারিত (Consultation Scheduled)</option>
                <option value="Quotation Sent">কোটেশন প্রেরিত (Quotation Sent)</option>
                <option value="Confirmed">বুকিং নিশ্চিত (Confirmed)</option>
                <option value="Completed">ইভেন্ট সম্পন্ন (Completed)</option>
                <option value="Cancelled">বাতিল (Cancelled)</option>
              </select>
            </div>

            {/* Admin Note */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-800">
                অ্যাডমিন নোট / বিশেষ মন্তব্য:
              </label>
              <textarea
                rows={2}
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                placeholder="ক্লায়েন্টের সঙ্গে কী আলোচনা হলো বা পরামর্শের নোট লিখুন..."
                className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold text-xs focus:bg-white"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t-2 border-black">
              <button
                type="button"
                onClick={() => handleSendWhatsAppReply(activeBookingModal)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded border-2 border-black flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <MessageCircle size={14} className="fill-white" />
                <span>WhatsApp রিপ্লাই</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveBookingModal(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded border-2 border-black cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleSaveModalUpdate}
                  className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xs uppercase rounded border-2 border-black shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="max-w-2xl max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white font-black text-sm bg-black/50 px-3 py-1 rounded"
            >
              ✕ বন্ধ করুন
            </button>
            <img 
              src={previewImage} 
              alt="Reference Design" 
              className="max-w-full max-h-[80vh] rounded-lg border-2 border-white object-contain" 
            />
          </div>
        </div>
      )}

    </div>
  );
}
