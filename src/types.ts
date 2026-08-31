export interface StockItem {
  id: string;
  code: string; // FL001, LT001, etc.
  name: string;
  category: string;
  unit: string;
  openingStock: number;
  purchasePrice: number;
  rentalPrice: number;
  sellingPrice: number;
  minStockLevel: number;
}

export interface PurchaseEntry {
  id: string;
  date: string;
  itemCode: string;
  qty: number;
  rate: number;
  supplierId: string;
  totalAmount: number;
  note?: string;
}

export interface SalesEntry {
  id: string;
  date: string;
  itemCode: string;
  qty: number;
  rate: number;
  customerId: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  note?: string;
}

export interface RentalOutEntry {
  id: string;
  date: string;
  customerId: string;
  itemCode: string;
  qty: number;
  rentalPrice: number;
  eventDate: string;
  expectedReturnDate: string;
  returnedQty: number; // dynamically tracked or recorded in return
  totalBill: number;
  paidAmount: number;
  dueAmount: number;
  status: 'Rented' | 'Returned' | 'Partial';
  note?: string;
}

export interface RentalReturnEntry {
  id: string;
  rentalOutId: string;
  date: string;
  itemCode: string;
  qty: number;
  damageQty: number;
  note?: string;
}

export interface DamageEntry {
  id: string;
  date: string;
  itemCode: string;
  qty: number;
  type: 'Damage' | 'Lost';
  cost: number; // cost value of damage
  note?: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  address: string;
}

export interface Supplier {
  id: string;
  name: string;
  mobile: string;
  itemType: string; // Type of items supplied
}

export interface ExpenseEntry {
  id: string;
  date: string;
  category: 'গাড়ি ভাড়া' | 'শ্রমিক খরচ' | 'বিদ্যুৎ' | 'খাবার' | 'অন্যান্য';
  amount: number;
  note?: string;
}

export interface EventMaterial {
  itemCode: string;
  qty: number;
  checked: boolean;
}

export interface EventEntry {
  id: string;
  name: string;
  date: string;
  customerId: string;
  budget: number;
  paidAmount: number;
  dueAmount: number;
  materials: EventMaterial[];
  status: 'Pending' | 'Ongoing' | 'Completed';
  note?: string;
}

export interface Worker {
  id: string;
  name: string;
  mobile: string;
  dailyWage: number;
  notes?: string;
  monthlySalary?: number; // basic salary for payroll
}

export type UserRole = 'Admin' | 'Manager' | 'Staff' | 'Viewer';

export interface UserProfile {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  isApproved: boolean;
  avatar?: string;
  phone?: string;
  designation?: string;
  provider: 'google' | 'email';
  createdAt: string;
  lastLogin?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  workerId: string;
  workerName: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Absent' | 'Late';
}

export interface SalaryPayment {
  id: string;
  date: string;
  workerId: string;
  workerName: string;
  amount: number;
  type: 'Monthly' | 'Advance';
  note?: string;
}

export interface Vehicle {
  id: string;
  name: string; // e.g. "পিকআপ ভ্যান"
  plateNo: string; // e.g. "ঢাকা মেট্রো-ন ১১-২২৩৩"
  driverName: string;
  status: 'Available' | 'Busy' | 'Maintenance';
}

export interface TripLog {
  id: string;
  date: string;
  vehicleId: string;
  vehicleName: string;
  destination: string;
  driverName: string;
  fuelCost: number;
  note?: string;
}

export type BookingRequestStatus = 
  | 'New' 
  | 'Contacted' 
  | 'Consultation Scheduled' 
  | 'Quotation Sent' 
  | 'Confirmed' 
  | 'Completed' 
  | 'Cancelled'
  | 'Pending'
  | 'Approved'
  | 'Declined';

export interface OnlineBooking {
  id: string;
  requestId?: string; // e.g. "REM-REQ-849201"
  createdAt?: string; // ISO Timestamp or formatted date
  
  // Customer Information
  customerName: string;
  mobile: string;
  email?: string;
  
  // Event Information
  eventType: string;
  date: string; // Event Date (YYYY-MM-DD)
  eventTime?: string; // e.g. "সন্ধ্যা ৭:০০"
  location: string; // Venue / Location
  venueType?: string; // 'হল' | 'কমিউনিটি সেন্টার' | 'রেস্টুরেন্ট' | 'বাড়ি' | 'আউটডোর' | 'অন্যান্য'
  guestCount: number;
  
  // Decoration & Design
  decorationStyle?: string; // 'মডার্ন' | 'মিনিমাল' | 'লাক্সারি' | 'ফুলের সাজসজ্জা' | 'ট্র্যাডিশনাল' | 'কাস্টম'
  requiredServices?: string[]; // ['স্টেজ', 'গেট', 'লাইটিং', 'ফুলের সাজসজ্জা', 'সাউন্ড', 'সম্পূর্ণ ডেকোরেশন']
  preferredTheme?: string;
  referenceImageUrl?: string; // Base64 or image URL
  referenceImages?: string[]; // Multiple photos array
  additionalRequirements?: string;
  
  // Budget & Preferences
  budgetRange?: string; // e.g. "৳৫০,০০০ - ৳১,০০,০০০"
  estimatedBudget: number;
  preferredContactMethod?: 'WhatsApp' | 'Phone Call' | 'Email';
  preferredContactTime?: string; // e.g. "সন্ধ্যা ৬টা - ৮টা"
  
  // Message & Administration
  note?: string; // Customer message / special notes
  status: BookingRequestStatus;
  adminNotes?: string;
  assignedConsultant?: string;
  assignedConsultantPhone?: string;
  quotationId?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string; // 'NID' | 'Receipt' | 'Contract' | 'Photo'
  dataUrl: string; // base64 representation
  date: string;
  relatedId: string; // customerId, eventId, or expenseId
}

// Module 21: Purchase Invoice Management
export interface PurchaseInvoice {
  id: string;
  purchaseNo: string;
  invoiceNo: string;
  date: string;
  supplierName: string;
  supplierMobile: string;
  itemName: string;
  qty: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  paymentStatus: 'Paid' | 'Due' | 'Partial';
  fileUrl?: string; // base64 pdf or image
  fileName?: string;
  files?: { name: string; url: string }[];
}

// Module 22: Sales Invoice System
export interface SalesItem {
  name: string;
  qty: number;
  rate: number;
  total: number;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
}

export interface SalesInvoice {
  id: string;
  invoiceNo: string;
  date: string;
  customerId?: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  items: SalesItem[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  qrData?: string;
  signatureUrl?: string;
  paymentStatus?: 'Paid' | 'Partial' | 'Due';
  paymentMethod?: string;
  notes?: string;
  fileUrl?: string;
  fileName?: string;
  files?: { name: string; url: string }[];
  itemName?: string;
}

// Module 23: Rental Invoice System
export interface RentalItem {
  name: string;
  qty: number;
  rate: number;
  total: number;
  quantity?: number;
  totalDays?: number;
  rentPerDay?: number;
  days?: number;
  unitPrice?: number;
  totalPrice?: number;
}

export interface RentalInvoice {
  id: string;
  invoiceNo: string;
  date: string;
  customerId?: string;
  customerName: string;
  customerMobile: string;
  customerAddress?: string;
  eventName: string;
  items: RentalItem[];
  rentalCharges: number;
  securityDeposit: number;
  transportCharge: number;
  labourCharge: number;
  totalBill: number;
  paidAmount: number;
  dueAmount: number;
  advancePaid?: number;
  paymentStatus?: 'Paid' | 'Partial' | 'Due';
  paymentMethod?: string;
  notes?: string;
  fileUrl?: string;
  fileName?: string;
  files?: { name: string; url: string }[];
  itemName?: string;
}

// Module 24: Event Invoice System
export interface EventExtraItem {
  id: string;
  name: string;
  qty: number;
  unit?: string;
  rate: number;
  total: number;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  note?: string;
}
export type EventInvoiceExtraItem = EventExtraItem;

export interface EventInvoice {
  id: string;
  invoiceNo: string;
  date: string;
  eventId?: string;
  eventName: string;
  eventDate: string;
  venue: string;
  customerId?: string;
  customerName: string;
  customerMobile: string;
  customerAddress?: string;
  decorationPackage: string;
  materialsUsed: { name: string; qty: number }[];
  labourCost: number;
  transportCost: number;
  extraCharges: number;
  totalCost: number;
  paidAmount?: number;
  
  // 🌟 Extended Final Bill Fields after Event Completion
  quotationId?: string;
  quotationNo?: string;
  baseBudget?: number; // মূল বাজেট / কোটেশন চুক্তি
  advancePaid?: number; // অগ্রিম পরিশোধিত
  advancePaymentDate?: string;
  advancePaymentMethod?: string;
  extraItems?: EventExtraItem[]; // অতিরিক্ত কাজের তালিকা ও বিবরণ
  extraWorkCost?: number; // অতিরিক্ত কাজের সর্বমোট বিল
  extraChargesDetails?: string;
  discount?: number; // বিশেষ ছাড়
  damageDeduction?: number; // মালামাল ক্ষতিপূরণ বা জরিমানা
  netPayable?: number; // চূড়ান্ত সর্বমোট বিল
  dueAmount?: number; // অবশিষ্ট প্রদেয় বকেয়া বিল
  paymentStatus?: 'Paid' | 'Partial' | 'Due';
  paymentMethod?: string;
  termsAndConditions?: string;
  notes?: string;
  qrData?: string;
  signatureUrl?: string;
  fileUrl?: string;
  fileName?: string;
  files?: { name: string; url: string }[];
}

// Module 25: Event Gallery & Photo Management
export interface EventGalleryItem {
  id: string;
  eventId: string;
  category: 'Before' | 'During' | 'Final' | 'Video';
  name: string;
  dataUrl: string; // Base64
  date: string;
}

// Module 29: Event Project Page Worker Assignment
export interface EventWorkerAssignment {
  id: string;
  eventId: string;
  workerId: string;
  role: string;
  wage: number;
}

// Module 31: Event Budget Quotation / Estimate Invoice System
export interface QuotationItem {
  id: string;
  name: string;
  category: string; // Custom category or preset
  qty: number;
  unit: string;
  rate: number;
  total: number;
  quantity?: number;
  unitPrice?: number;
  note?: string;
}

export interface EventQuotation {
  id: string;
  quotationNo: string; // e.g. "QUO-873912"
  date: string;
  validUntil?: string;
  customerId?: string;
  customerName: string;
  customerMobile: string;
  customerAddress?: string;
  eventName: string;
  eventDate: string;
  venue: string;
  budgetType: 'Estimated' | 'Fixed'; // 'আনুমানিক বাজেট' | 'ফিক্সড বাজেট'
  items: QuotationItem[];
  subtotal: number;
  transportCharge: number;
  labourCharge: number;
  discount: number;
  grandTotal: number;
  advanceRequired: number;
  advancePaid?: number;
  termsAndConditions?: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Converted';
  signatureUrl?: string;
  notes?: string;
  files?: { name: string; url: string }[];
}

// Module 32: Decor Portfolio & Custom Category Management
export interface PortfolioPhotoDetail {
  id: string;
  url: string;
  title?: string;
  description?: string;
  estimatedCost?: number;
  highlightTags?: string[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  url: string;
  images?: string[]; // Multiple photos array for unlimited slideshow & galleries
  photoDetails?: PortfolioPhotoDetail[]; // Per-photo specific details & budget
  eventName?: string;
  customerName?: string;
  date?: string;
  description?: string;
  isVideo?: boolean;
  estimatedCost?: number;
  highlightTags?: string[];
  colorPalette?: string[];
}

export type SlideshowTransition = 'fade' | 'kenburns' | 'slide' | 'zoom' | 'cinema';



