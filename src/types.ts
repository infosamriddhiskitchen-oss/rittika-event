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

export interface OnlineBooking {
  id: string;
  date: string;
  customerName: string;
  mobile: string;
  eventType: string;
  location: string;
  guestCount: number;
  estimatedBudget: number;
  status: 'Pending' | 'Approved' | 'Declined';
  note?: string;
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
}

// Module 22: Sales Invoice System
export interface SalesInvoice {
  id: string;
  invoiceNo: string;
  date: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  items: {
    name: string;
    qty: number;
    rate: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  qrData?: string;
  signatureUrl?: string;
}

// Module 23: Rental Invoice System
export interface RentalInvoice {
  id: string;
  invoiceNo: string;
  date: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  eventName: string;
  items: {
    name: string;
    qty: number;
    rate: number;
    total: number;
  }[];
  rentalCharges: number;
  securityDeposit: number;
  transportCharge: number;
  labourCharge: number;
  totalBill: number;
  paidAmount: number;
  dueAmount: number;
}

// Module 24: Event Invoice System
export interface EventInvoice {
  id: string;
  invoiceNo: string;
  date: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  venue: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  decorationPackage: string;
  materialsUsed: { name: string; qty: number }[];
  labourCost: number;
  transportCost: number;
  extraCharges: number;
  totalCost: number;
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
  termsAndConditions?: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Converted';
  signatureUrl?: string;
  notes?: string;
}

// Module 32: Decor Portfolio & Custom Category Management
export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  url: string;
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



