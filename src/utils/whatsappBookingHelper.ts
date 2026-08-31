import { OnlineBooking } from '../types';
import { toBengaliNumber } from '../utils';

/**
 * Returns dynamic Bengali greeting based on current local time
 * - সকাল (05:00 - 11:59) → সুপ্রভাত
 * - দুপুর (12:00 - 15:59) → শুভ অপরাহ্ন
 * - বিকেল/সন্ধ্যা (16:00 - 19:59) → শুভ সন্ধ্যা
 * - রাত (20:00 - 04:59) → শুভ রাত্রি
 */
export function getTimeBasedBengaliGreeting(customerName?: string): {
  salutation: string;
  timePeriod: 'morning' | 'afternoon' | 'evening' | 'night';
  fullGreeting: string;
} {
  const currentHour = new Date().getHours();
  let salutation = 'শুভ সন্ধ্যা';
  let timePeriod: 'morning' | 'afternoon' | 'evening' | 'night' = 'evening';

  if (currentHour >= 5 && currentHour < 12) {
    salutation = 'সুপ্রভাত';
    timePeriod = 'morning';
  } else if (currentHour >= 12 && currentHour < 16) {
    salutation = 'শুভ অপরাহ্ন';
    timePeriod = 'afternoon';
  } else if (currentHour >= 16 && currentHour < 20) {
    salutation = 'শুভ সন্ধ্যা';
    timePeriod = 'evening';
  } else {
    salutation = 'শুভ রাত্রি';
    timePeriod = 'night';
  }

  const cleanName = customerName?.trim();
  const fullGreeting = cleanName 
    ? `${salutation}, ${cleanName} 🌸`
    : `${salutation} 🌸`;

  return {
    salutation,
    timePeriod,
    fullGreeting
  };
}

/**
 * Auto generates clean, memorable Booking Request IDs (e.g. REM-REQ-849201)
 */
export function generateBookingRequestId(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `REM-REQ-${randomNum}`;
}

export interface WhatsAppMessageOptions {
  customerName?: string;
  mobile?: string;
  eventType?: string;
  eventDate?: string;
  eventTime?: string;
  location?: string;
  venueType?: string;
  guestCount?: number | string;
  decorationStyle?: string;
  budgetRange?: string;
  estimatedBudget?: number;
  requiredServices?: string[];
  hasReferenceImage?: boolean;
  referenceImageNote?: string;
  preferredContactTime?: string;
  preferredContactMethod?: string;
  notes?: string;
  requestId?: string;
}

/**
 * Builds the official, premium WhatsApp Inquiry & Consultation text template.
 * Automatically excludes blank/null/undefined fields without placeholders.
 */
export function buildWhatsAppInquiryMessage(options: WhatsAppMessageOptions): string {
  const { fullGreeting } = getTimeBasedBengaliGreeting(options.customerName);
  
  const lines: string[] = [];

  // 1. Header & Dynamic Greeting
  lines.push(fullGreeting);
  lines.push('');
  lines.push('আমি *রিত্তিকা ইভেন্ট ম্যানেজমেন্ট*-এর ইভেন্ট ডেকোরেশন ও বুকিং সংক্রান্ত তথ্য জানতে আগ্রহী।');
  lines.push('');
  lines.push('আমার ইভেন্টের বিস্তারিত তথ্য নিচে দেওয়া হলো—');
  lines.push('');

  // 2. Event & Customer Details (Filtered: No empty lines or placeholders)
  const detailLines: string[] = [];

  if (options.requestId?.trim()) {
    detailLines.push(`🆔 রিকোয়েস্ট আইডি: *${options.requestId.trim()}*`);
  }

  if (options.customerName?.trim()) {
    detailLines.push(`👤 ক্লায়েন্টের নাম: *${options.customerName.trim()}*`);
  }

  if (options.mobile?.trim()) {
    detailLines.push(`📱 মোবাইল / WhatsApp: *${options.mobile.trim()}*`);
  }

  if (options.eventType?.trim()) {
    detailLines.push(`📌 ইভেন্টের ধরন: *${options.eventType.trim()}*`);
  }

  if (options.eventDate?.trim()) {
    detailLines.push(`📅 ইভেন্টের তারিখ: *${options.eventDate.trim()}*`);
  }

  if (options.eventTime?.trim()) {
    detailLines.push(`🕐 ইভেন্টের সময়: *${options.eventTime.trim()}*`);
  }

  if (options.location?.trim()) {
    detailLines.push(`📍 ভেন্যু/লোকেশন: *${options.location.trim()}*`);
  }

  if (options.venueType?.trim()) {
    detailLines.push(`🏛️ ভেন্যুর ধরন: *${options.venueType.trim()}*`);
  }

  if (options.guestCount && Number(options.guestCount) > 0) {
    detailLines.push(`👥 আনুমানিক অতিথি: *${toBengaliNumber(options.guestCount)} জন*`);
  }

  if (options.decorationStyle?.trim()) {
    detailLines.push(`🎨 পছন্দের ডেকোরেশন স্টাইল: *${options.decorationStyle.trim()}*`);
  }

  if (options.budgetRange?.trim()) {
    detailLines.push(`💰 আনুমানিক বাজেট: *${options.budgetRange.trim()}*`);
  } else if (options.estimatedBudget && options.estimatedBudget > 0) {
    detailLines.push(`💰 আনুমানিক বাজেট: *৳${toBengaliNumber(options.estimatedBudget.toLocaleString('en-IN'))}*`);
  }

  if (options.requiredServices && options.requiredServices.length > 0) {
    detailLines.push(`✨ প্রয়োজনীয় সার্ভিস: *${options.requiredServices.join(', ')}*`);
  }

  if (options.hasReferenceImage || options.referenceImageNote?.trim()) {
    detailLines.push(`📷 রেফারেন্স ডিজাইন: *${options.referenceImageNote?.trim() || 'ছবি সংযুক্ত করা হয়েছে / আলাদাভাবে পাঠাচ্ছি'}*`);
  }

  if (options.preferredContactTime?.trim()) {
    detailLines.push(`📞 যোগাযোগের সুবিধাজনক সময়: *${options.preferredContactTime.trim()}*`);
  }

  if (options.preferredContactMethod?.trim()) {
    detailLines.push(`💬 পছন্দের যোগাযোগ মাধ্যম: *${options.preferredContactMethod.trim()}*`);
  }

  if (options.notes?.trim()) {
    detailLines.push(`📝 বিশেষ চাহিদা / নোট: *${options.notes.trim()}*`);
  }

  // If no details provided (direct inquiry), add general prompt
  if (detailLines.length === 0) {
    detailLines.push('📌 আমি একটি আসন্ন অনুষ্ঠানের জন্য আপনার ডেকোরেশন প্যাকেজ ও বুকিং তথ্য জানতে চাই।');
  }

  lines.push(...detailLines);
  lines.push('');

  // 3. Professional Closing & Consultant Request
  lines.push('অনুগ্রহ করে আমার প্রয়োজন অনুযায়ী উপযুক্ত প্যাকেজ, ডিজাইন, মূল্য এবং বুকিংয়ের বিস্তারিত জানাবেন।');
  lines.push('');
  lines.push('✨ আমার অনুরোধটি *Customer Priority* হিসেবে বিবেচনা করে একজন *Dedicated Event Consultant* যদি ব্যক্তিগতভাবে আমার প্রয়োজন অনুযায়ী পরামর্শ দেন, তাহলে কৃতজ্ঞ থাকব।');
  lines.push('');
  lines.push('ধন্যবাদ। 💐');
  lines.push('');
  lines.push('*রিত্তিকা ইভেন্ট ম্যানেজমেন্ট*');
  lines.push('_Creating Moments • Designing Memories_');

  return lines.join('\n');
}

/**
 * Creates safe, compliant WhatsApp click-to-chat URL
 * Default Official Support Number: +880 1721-779396
 */
export function getWhatsAppChatUrl(message: string, phone: string = '8801721779396'): string {
  // Clean phone number
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('01')) {
    cleanPhone = '88' + cleanPhone;
  } else if (!cleanPhone.startsWith('880') && cleanPhone.startsWith('1')) {
    cleanPhone = '880' + cleanPhone;
  }
  if (!cleanPhone) {
    cleanPhone = '8801721779396';
  }

  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Status Badge Helpers for Booking Request Pipeline
 */
export function getBookingStatusBadge(status: string): {
  label: string;
  bg: string;
  text: string;
  border: string;
  step: number;
} {
  switch (status) {
    case 'New':
      return { label: 'নতুন রিকোয়েস্ট (New)', bg: 'bg-rose-500', text: 'text-white', border: 'border-rose-700', step: 1 };
    case 'Contacted':
      return { label: 'যোগাযোগ সম্পন্ন (Contacted)', bg: 'bg-amber-400', text: 'text-black', border: 'border-amber-600', step: 2 };
    case 'Consultation Scheduled':
      return { label: 'পরামর্শ নির্ধারিত (Consultation)', bg: 'bg-sky-400', text: 'text-black', border: 'border-sky-600', step: 3 };
    case 'Quotation Sent':
      return { label: 'কোটেশন প্রেরিত (Quotation Sent)', bg: 'bg-indigo-500', text: 'text-white', border: 'border-indigo-700', step: 4 };
    case 'Confirmed':
    case 'Approved':
      return { label: 'বুকিং নিশ্চিত (Confirmed)', bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-700', step: 5 };
    case 'Completed':
      return { label: 'ইভেন্ট সম্পন্ন (Completed)', bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-800', step: 6 };
    case 'Cancelled':
    case 'Declined':
      return { label: 'বাতিল (Cancelled)', bg: 'bg-slate-400', text: 'text-slate-900', border: 'border-slate-600', step: 0 };
    case 'Pending':
    default:
      return { label: 'পর্যালোচনাধীন (Pending)', bg: 'bg-yellow-400', text: 'text-black', border: 'border-yellow-600', step: 1 };
  }
}
