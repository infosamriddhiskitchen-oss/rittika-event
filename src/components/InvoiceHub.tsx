import React, { useState, useMemo, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Folder, FileText, Search, Plus, Upload, Download, Printer, Share2, 
  Trash2, Eye, ShieldCheck, Mail, Send, Check, RefreshCw, Layers, CheckSquare, 
  DollarSign, FileSpreadsheet, Sparkles, PenTool, X, ChevronRight, User, Calendar,
  Calculator, Tag, CheckCircle2, ArrowRight, Clock, Edit3, AlertCircle, Coins, PlusCircle, 
  QrCode as QrIcon, Stamp, SlidersHorizontal, Paperclip, Image as ImageIcon, Copy,
  ExternalLink, FileCheck, CheckCheck, Loader2, Smartphone
} from 'lucide-react';
import { 
  StockItem, Customer, Supplier, PurchaseEntry, SalesEntry, RentalOutEntry, EventEntry, Attachment,
  PurchaseInvoice, SalesInvoice, RentalInvoice, EventInvoice, EventQuotation, QuotationItem, EventExtraItem
} from '../types';
import { formatCurrency, toBengaliNumber } from '../utils';
import { 
  CompanyOfficialSeal, 
  StatusRubberStamp, 
  SealColorTheme, 
  StatusStampType 
} from './DigitalSealStamp';
import DigitalSignatureModal, { 
  SignatureSettings, 
  loadSavedSignatureSettings, 
  saveSignatureSettings, 
  DEFAULT_SIGNATURE_SETTINGS 
} from './DigitalSignatureModal';
import { InvoiceEditModal, InvoiceEditTarget } from './InvoiceEditModal';
import { 
  downloadInvoicePDF, 
  downloadInvoiceImage, 
  shareInvoiceFileNative, 
  getInvoiceFileName 
} from '../utils/invoicePdfExporter';

interface InvoiceHubProps {
  purchases: PurchaseEntry[];
  sales: SalesEntry[];
  rentals: RentalOutEntry[];
  events: EventEntry[];
  customers: Customer[];
  suppliers: Supplier[];
  stockItems: StockItem[];
  attachments: Attachment[];
  onAddAttachment: (att: Omit<Attachment, 'id'>) => void;
  onDeleteAttachment: (id: string) => void;
  purchaseInvoices: PurchaseInvoice[];
  onAddPurchaseInvoice: (inv: Omit<PurchaseInvoice, 'id'>) => void;
  onUpdatePurchaseInvoice?: (id: string, inv: Omit<PurchaseInvoice, 'id'>) => void;
  onDeletePurchaseInvoice: (id: string) => void;
  salesInvoices: SalesInvoice[];
  onAddSalesInvoice: (inv: Omit<SalesInvoice, 'id'>) => void;
  onUpdateSalesInvoice?: (id: string, inv: Omit<SalesInvoice, 'id'>) => void;
  onDeleteSalesInvoice: (id: string) => void;
  rentalInvoices: RentalInvoice[];
  onAddRentalInvoice: (inv: Omit<RentalInvoice, 'id'>) => void;
  onUpdateRentalInvoice?: (id: string, inv: Omit<RentalInvoice, 'id'>) => void;
  onDeleteRentalInvoice: (id: string) => void;
  eventInvoices: EventInvoice[];
  onAddEventInvoice: (inv: Omit<EventInvoice, 'id'>) => void;
  onUpdateEventInvoice?: (id: string, inv: Omit<EventInvoice, 'id'>) => void;
  onDeleteEventInvoice: (id: string) => void;
  quotations: EventQuotation[];
  onAddQuotation: (quotation: Omit<EventQuotation, 'id'>) => void;
  onUpdateQuotation?: (id: string, quotation: Omit<EventQuotation, 'id'>) => void;
  onDeleteQuotation: (id: string) => void;
  onConvertQuotationToEvent?: (quotation: EventQuotation) => void;
}

type FolderType = 'purchase' | 'sales' | 'rental' | 'event' | 'quotations' | 'customer' | 'nid' | 'photos';

export default function InvoiceHub({
  purchases,
  sales,
  rentals,
  events,
  customers,
  suppliers,
  stockItems,
  attachments,
  onAddAttachment,
  onDeleteAttachment,
  purchaseInvoices,
  onAddPurchaseInvoice,
  onUpdatePurchaseInvoice,
  onDeletePurchaseInvoice,
  salesInvoices,
  onAddSalesInvoice,
  onUpdateSalesInvoice,
  onDeleteSalesInvoice,
  rentalInvoices,
  onAddRentalInvoice,
  onUpdateRentalInvoice,
  onDeleteRentalInvoice,
  eventInvoices,
  onAddEventInvoice,
  onUpdateEventInvoice,
  onDeleteEventInvoice,
  quotations,
  onAddQuotation,
  onUpdateQuotation,
  onDeleteQuotation,
  onConvertQuotationToEvent
}: InvoiceHubProps) {
  
  // General State
  const [activeTab, setActiveTab] = useState<'all-saved-invoices' | 'document-center' | 'quotations' | 'purchase-invoices' | 'sales-invoices' | 'rental-invoices' | 'event-invoices'>('all-saved-invoices');
  const [selectedFolder, setSelectedFolder] = useState<FolderType>('quotations');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState(false);
  const [isSignOpen, setIsSignOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<InvoiceEditTarget | null>(null);
  const [archiveFilterType, setArchiveFilterType] = useState<'all' | 'quotations' | 'event' | 'sales' | 'rental' | 'purchase'>('all');
  const [archiveFilterStatus, setArchiveFilterStatus] = useState<'all' | 'paid' | 'due' | 'partial' | 'converted'>('all');
  const [pFiles, setPFiles] = useState<{ name: string; url: string }[]>([]);
  
  // Sharing trigger modals
  const [sharingInvoice, setSharingInvoice] = useState<{ 
    id: string; 
    type: 'sales' | 'rental' | 'event' | 'quotations' | 'purchase'; 
    mobile: string; 
    email?: string;
    name: string;
    date?: string;
    total?: number;
    paid?: number;
    due?: number;
    rawData?: any;
  } | null>(null);
  const [shareMethod, setShareMethod] = useState<'whatsapp' | 'email'>('whatsapp');
  const [shareTarget, setShareTarget] = useState('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingImg, setIsDownloadingImg] = useState(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);
  const [copiedLinkToast, setCopiedLinkToast] = useState(false);
  const [isSharingNative, setIsSharingNative] = useState(false);
  
  // Active selected invoice for full-screen preview / printing / downloading
  const [previewInvoice, setPreviewInvoice] = useState<{
    id: string;
    type: 'purchase' | 'sales' | 'rental' | 'event' | 'quotations';
    data: any;
  } | null>(null);

  // Digital signature & stamp configuration
  const [sigSettings, setSigSettings] = useState<SignatureSettings>(loadSavedSignatureSettings);
  const [previewStampOverride, setPreviewStampOverride] = useState<'auto' | StatusStampType | 'none'>('auto');
  const [previewStampColor, setPreviewStampColor] = useState<SealColorTheme>('royal-blue');
  const [previewSealEnabled, setPreviewSealEnabled] = useState<boolean>(true);

  // Helper to extract active signature image URL (if drawing or upload mode)
  const getActiveSignatureUrl = () => {
    if (sigSettings.mode === 'draw' && sigSettings.drawnDataUrl) return sigSettings.drawnDataUrl;
    if (sigSettings.mode === 'upload' && sigSettings.uploadedDataUrl) return sigSettings.uploadedDataUrl;
    return undefined;
  };

  // Helper to resolve status stamp for previewed invoice
  const getResolvedStatusStamp = (inv: { type: string; data: any }): StatusStampType | null => {
    if (previewStampOverride === 'none' || !sigSettings.showStatusStamp) return null;
    if (previewStampOverride !== 'auto') return previewStampOverride;
    
    if (inv.type === 'quotations') {
      if (inv.data.status === 'Converted') return 'approved';
      if (inv.data.budgetType === 'Estimated') return 'estimate';
      if (inv.data.budgetType === 'Fixed') return 'fixed';
      return 'estimate';
    }
    if (inv.type === 'event') {
      if (inv.data.baseBudget !== undefined) return 'final';
      if (inv.data.paymentStatus === 'Paid' || inv.data.dueAmount === 0) return 'paid';
      return 'unpaid';
    }
    if (inv.type === 'sales') {
      return 'paid';
    }
    if (inv.type === 'rental') {
      return (inv.data.dueAmount === 0 || inv.data.paidAmount >= inv.data.totalBill) ? 'paid' : 'unpaid';
    }
    if (inv.type === 'purchase') {
      return inv.data.paymentStatus === 'Paid' ? 'paid' : 'unpaid';
    }
    return 'final';
  };

  // Dynamic QR Code generation for current preview invoice
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (!previewInvoice) {
      setQrDataUrl('');
      return;
    }
    // Sync preview seal state
    setPreviewSealEnabled(sigSettings.showCompanySeal);
    setPreviewStampColor(sigSettings.statusStampColorTheme || 'royal-blue');

    const invData = previewInvoice.data;
    const invNo = previewInvoice.type === 'quotations' 
      ? invData.quotationNo 
      : (invData.invoiceNo || invData.purchaseNo || previewInvoice.id);
    const client = invData.customerName || invData.supplierName || 'General Client';
    const amount = previewInvoice.type === 'quotations'
      ? invData.grandTotal
      : (invData.netPayable || invData.totalBill || invData.totalCost || invData.grandTotal || invData.totalAmount || 0);
    const date = invData.date || new Date().toISOString().slice(0, 10);
    
    const qrPayload = [
      `ORGANIZATION: RITTIKA EVENT MANAGEMENT`,
      `TYPE: ${previewInvoice.type.toUpperCase()}`,
      `DOC NO: ${invNo}`,
      `CLIENT: ${client}`,
      `DATE: ${date}`,
      `AMOUNT: BDT ${amount}`,
      `VERIFICATION: GENUINE & VERIFIED BY REM`,
      `SUPPORT: +880 1721-779396`,
      `LOCATION: Bheramara, Kushtia, Bangladesh`
    ].join('\n');

    QRCode.toDataURL(qrPayload, {
      width: 256,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Failed to generate invoice QR code:', err));
  }, [previewInvoice, sigSettings]);

  // 📝 MODULE 31: EVENT BUDGET QUOTATION BUILDER STATE
  const [isCreatingQuotation, setIsCreatingQuotation] = useState(false);
  const [editingQuotationId, setEditingQuotationId] = useState<string | null>(null);
  const [quotationFilterStatus, setQuotationFilterStatus] = useState<'All' | 'Draft' | 'Sent' | 'Converted' | 'Expired'>('All');
  const [quotationFilterBudgetType, setQuotationFilterBudgetType] = useState<'All' | 'Estimated' | 'Fixed'>('All');

  // Quotation Meta Fields
  const [qNo, setQNo] = useState(`QUO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-4)}`);
  const [qDate, setQDate] = useState(new Date().toISOString().split('T')[0]);
  const [qValidUntil, setQValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [qCustomerId, setQCustomerId] = useState('');
  const [qCustomerName, setQCustomerName] = useState('');
  const [qCustomerMobile, setQCustomerMobile] = useState('');
  const [qCustomerAddress, setQCustomerAddress] = useState('');
  const [qEventName, setQEventName] = useState('');
  const [qEventDate, setQEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [qVenue, setQVenue] = useState('');
  const [qBudgetType, setQBudgetType] = useState<'Estimated' | 'Fixed'>('Estimated');
  
  // Quotation Items List
  const [qItems, setQItems] = useState<QuotationItem[]>([]);
  
  // Single Item Input Form (for adding one by one)
  const [curCategoryOption, setCurCategoryOption] = useState('প্যান্ডেল ও স্টেজ সেটআপ');
  const [customCategoryText, setCustomCategoryText] = useState('');
  const [curItemName, setCurItemName] = useState('');
  const [curItemQty, setCurItemQty] = useState(1);
  const [curItemUnit, setCurItemUnit] = useState('পিস');
  const [curItemRate, setCurItemRate] = useState(0);
  const [curItemNote, setCurItemNote] = useState('');
  const [selectedStockPickerCode, setSelectedStockPickerCode] = useState('');

  // Additional Charges & Terms
  const [qTransportCharge, setQTransportCharge] = useState(0);
  const [qLabourCharge, setQLabourCharge] = useState(0);
  const [qDiscount, setQDiscount] = useState(0);
  const [qAdvanceRequired, setQAdvanceRequired] = useState(0);
  const [qTerms, setQTerms] = useState(
    '১. মোট প্রাক্কলিত/নির্ধারিত বাজেটের ৫০% অগ্রিম প্রদান সাপেক্ষে বুকিং নিশ্চিত করা হবে।\n' +
    '২. ইভেন্ট পরিচালনার সমাপ্তির দিনে অবশিষ্ট ৫০% পেমেন্ট পরিশোধ করতে হবে।\n' +
    '৩. ভেন্যুতে বিদ্যুৎ ও জেনারেটর সংযোগ ক্লায়েন্টের দায়িত্বে থাকবে।\n' +
    '৪. মালামাল কোনো ক্ষয়ক্ষতি হলে নির্ধারিত মূল্যে ক্ষতিপূরণ প্রযোজ্য হবে।'
  );
  const [qNotes, setQNotes] = useState('');

  // 🌟 MODULE 33: EVENT COMPLETION FINAL INVOICE BUILDER STATE
  const [isCreatingFinalInvoice, setIsCreatingFinalInvoice] = useState(false);
  const [finalInvNo, setFinalInvNo] = useState(`FIN-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-4)}`);
  const [finalInvDate, setFinalInvDate] = useState(new Date().toISOString().split('T')[0]);
  const [finalSelectedQuotationId, setFinalSelectedQuotationId] = useState('');
  const [finalSelectedEventId, setFinalSelectedEventId] = useState('');
  const [finalEventName, setFinalEventName] = useState('');
  const [finalEventDate, setFinalEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [finalVenue, setFinalVenue] = useState('');
  const [finalCustomerId, setFinalCustomerId] = useState('');
  const [finalCustomerName, setFinalCustomerName] = useState('');
  const [finalCustomerMobile, setFinalCustomerMobile] = useState('');
  const [finalCustomerAddress, setFinalCustomerAddress] = useState('');
  const [finalBaseBudget, setFinalBaseBudget] = useState(0);
  const [finalAdvancePaid, setFinalAdvancePaid] = useState(0);
  const [finalAdvanceDate, setFinalAdvanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [finalAdvanceMethod, setFinalAdvanceMethod] = useState('বিকাশ (bKash)');

  // Extra Work Items List for Final Bill
  const [finalExtraItems, setFinalExtraItems] = useState<EventExtraItem[]>([]);
  const [curExtraName, setCurExtraName] = useState('');
  const [curExtraQty, setCurExtraQty] = useState(1);
  const [curExtraUnit, setCurExtraUnit] = useState('সেট');
  const [curExtraRate, setCurExtraRate] = useState(0);
  const [curExtraNote, setCurExtraNote] = useState('');

  // Extra Transport, Labour, Damage charge, Discount, and Settlement Status
  const [finalExtraTransport, setFinalExtraTransport] = useState(0);
  const [finalExtraLabour, setFinalExtraLabour] = useState(0);
  const [finalDamageCharge, setFinalDamageCharge] = useState(0);
  const [finalDiscount, setFinalDiscount] = useState(0);
  const [finalPaymentStatus, setFinalPaymentStatus] = useState<'Paid' | 'Partial' | 'Due'>('Paid');
  const [finalPaymentMethod, setFinalPaymentMethod] = useState('নগদ (Cash)');
  const [finalTerms, setFinalTerms] = useState(
    '১. ইভেন্ট চুক্তি ও পরিকল্পনা অনুযায়ী সফলভাবে সম্পন্ন হয়েছে।\n' +
    '২. ক্লায়েন্টের চাহিদা অনুযায়ী অতিরিক্ত মালামাল ও সেবার বিল মূল বাজেটের সাথে সমন্বয় করা হয়েছে।\n' +
    '৩. প্রদত্ত অগ্রিম কর্তনের পর অবশিষ্ট প্রদেয় বকেয়া বিল তাৎক্ষণিক পরিশোধযোগ্য।\n' +
    '৪. মালামাল অক্ষত অবস্থায় ফেরত নেওয়া হয়েছে / নির্ধারিত ক্ষতিপূরণ সমন্বয় করা হয়েছে।\n' +
    '৫. রিত্তিকা ইভেন্ট ম্যানেজমেন্টের সেবা গ্রহণ করার জন্য ধন্যবাদ।'
  );
  const [finalNotes, setFinalNotes] = useState('');

  // Purchase Form fields
  const [purchaseNo, setPurchaseNo] = useState(`PO-${Date.now().toString().slice(-6)}`);
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [pSupplierName, setPSupplierName] = useState('');
  const [pSupplierMobile, setPSupplierMobile] = useState('');
  const [pItemName, setPItemName] = useState('');
  const [pQty, setPQty] = useState(1);
  const [pUnit, setPUnit] = useState('পিস');
  const [pUnitPrice, setPUnitPrice] = useState(0);
  const [pPaymentStatus, setPPaymentStatus] = useState<'Paid' | 'Due' | 'Partial'>('Paid');
  const [pBase64File, setPBase64File] = useState<string | null>(null);
  const [pFileName, setPFileName] = useState('');

  // Auto Generate / Custom Sales Invoice Setup
  const [salesInvoiceMode, setSalesInvoiceMode] = useState<'existing' | 'custom'>('existing');
  const [selectedSaleId, setSelectedSaleId] = useState('');
  const [salesDiscount, setSalesDiscount] = useState(0);
  // Custom Sales fields
  const [customSaleDate, setCustomSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [customSaleCustomerName, setCustomSaleCustomerName] = useState('');
  const [customSaleCustomerMobile, setCustomSaleCustomerMobile] = useState('');
  const [customSaleCustomerAddress, setCustomSaleCustomerAddress] = useState('');
  const [customSaleItemName, setCustomSaleItemName] = useState('');
  const [customSaleQty, setCustomSaleQty] = useState(1);
  const [customSaleUnit, setCustomSaleUnit] = useState('পিস');
  const [customSaleRate, setCustomSaleRate] = useState(0);
  const [customSaleDiscount, setCustomSaleDiscount] = useState(0);
  const [customSalePaid, setCustomSalePaid] = useState(0);
  const [customSalePaymentMethod, setCustomSalePaymentMethod] = useState('নগদ (Cash)');
  const [customSaleNote, setCustomSaleNote] = useState('');
  const [customSaleFiles, setCustomSaleFiles] = useState<{ name: string; url: string }[]>([]);

  // Auto Generate / Custom Rental Invoice Setup
  const [rentalInvoiceMode, setRentalInvoiceMode] = useState<'existing' | 'custom'>('existing');
  const [selectedRentalId, setSelectedRentalId] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState(0);
  const [transportCharge, setTransportCharge] = useState(0);
  const [labourCharge, setLabourCharge] = useState(0);
  // Custom Rental fields
  const [customRentalDate, setCustomRentalDate] = useState(new Date().toISOString().split('T')[0]);
  const [customRentalEventDate, setCustomRentalEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [customRentalCustomerName, setCustomRentalCustomerName] = useState('');
  const [customRentalCustomerMobile, setCustomRentalCustomerMobile] = useState('');
  const [customRentalCustomerAddress, setCustomRentalCustomerAddress] = useState('');
  const [customRentalEventName, setCustomRentalEventName] = useState('');
  const [customRentalVenue, setCustomRentalVenue] = useState('');
  const [customRentalItemName, setCustomRentalItemName] = useState('');
  const [customRentalQty, setCustomRentalQty] = useState(1);
  const [customRentalUnit, setCustomRentalUnit] = useState('পিস');
  const [customRentalRate, setCustomRentalRate] = useState(0);
  const [customRentalDays, setCustomRentalDays] = useState(1);
  const [customRentalDeposit, setCustomRentalDeposit] = useState(0);
  const [customRentalTransport, setCustomRentalTransport] = useState(0);
  const [customRentalLabour, setCustomRentalLabour] = useState(0);
  const [customRentalPaid, setCustomRentalPaid] = useState(0);
  const [customRentalPaymentMethod, setCustomRentalPaymentMethod] = useState('নগদ (Cash)');
  const [customRentalNote, setCustomRentalNote] = useState('');
  const [customRentalFiles, setCustomRentalFiles] = useState<{ name: string; url: string }[]>([]);

  // Auto Generate / Custom Event Invoice Setup
  const [eventInvoiceMode, setEventInvoiceMode] = useState<'existing' | 'custom'>('existing');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [eventExtraCharge, setEventExtraCharge] = useState(0);
  const [eventExtraDetails, setEventExtraDetails] = useState('');
  // Custom Event fields
  const [customEventDate, setCustomEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [customEventEventDate, setCustomEventEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [customEventName, setCustomEventName] = useState('');
  const [customEventVenue, setCustomEventVenue] = useState('');
  const [customEventCustomerName, setCustomEventCustomerName] = useState('');
  const [customEventCustomerMobile, setCustomEventCustomerMobile] = useState('');
  const [customEventCustomerAddress, setCustomEventCustomerAddress] = useState('');
  const [customEventPackage, setCustomEventPackage] = useState('');
  const [customEventBudget, setCustomEventBudget] = useState(0);
  const [customEventTransport, setCustomEventTransport] = useState(0);
  const [customEventLabour, setCustomEventLabour] = useState(0);
  const [customEventExtraCharge, setCustomEventExtraCharge] = useState(0);
  const [customEventExtraDetails, setCustomEventExtraDetails] = useState('');
  const [customEventPaid, setCustomEventPaid] = useState(0);
  const [customEventPaymentMethod, setCustomEventPaymentMethod] = useState('নগদ (Cash)');
  const [customEventNotes, setCustomEventNotes] = useState('');
  const [customEventFiles, setCustomEventFiles] = useState<{ name: string; url: string }[]>([]);

  // Quotation & Final Bill Multi-File States
  const [qFiles, setQFiles] = useState<{ name: string; url: string }[]>([]);
  const [finalInvFiles, setFinalInvFiles] = useState<{ name: string; url: string }[]>([]);

  // Generic multi-file upload handler generator
  const createMultiFileHandler = (setter: React.Dispatch<React.SetStateAction<{ name: string; url: string }[]>>) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (typeof event.target?.result === 'string') {
            setter(prev => [...prev, { name: file.name, url: event.target!.result as string }]);
          }
        };
        reader.readAsDataURL(file);
      });
      if (e.target) e.target.value = '';
    };
  };

  const handleSalesFileUpload = createMultiFileHandler(setCustomSaleFiles);
  const handleRentalFileUpload = createMultiFileHandler(setCustomRentalFiles);
  const handleEventFileUpload = createMultiFileHandler(setCustomEventFiles);
  const handleQuotationFileUpload = createMultiFileHandler(setQFiles);
  const handleFinalInvFileUpload = createMultiFileHandler(setFinalInvFiles);

  // Upload supplier purchase invoice base64 (Supports multiple files simultaneously)
  const handlePurchaseFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          const res = event.target.result;
          setPFiles(prev => [...prev, { name: file.name, url: res }]);
          setPBase64File(res);
          setPFileName(file.name);
        }
      };
      reader.readAsDataURL(file);
    });
    if (e.target) e.target.value = '';
  };

  const handleCreatePurchaseInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pSupplierName || !pItemName || pQty <= 0 || pUnitPrice <= 0) {
      alert('দয়া করে সঠিক তথ্য প্রদান করুন!');
      return;
    }

    onAddPurchaseInvoice({
      purchaseNo,
      invoiceNo,
      date: purchaseDate,
      supplierName: pSupplierName,
      supplierMobile: pSupplierMobile,
      itemName: pItemName,
      qty: Number(pQty),
      unit: pUnit,
      unitPrice: Number(pUnitPrice),
      totalAmount: Number(pQty) * Number(pUnitPrice),
      paymentStatus: pPaymentStatus,
      fileUrl: pBase64File || (pFiles.length > 0 ? pFiles[0].url : undefined),
      fileName: pFileName || (pFiles.length > 0 ? pFiles[0].name : undefined),
      files: pFiles.length > 0 ? pFiles : undefined
    });

    // Reset fields
    setPurchaseNo(`PO-${Date.now().toString().slice(-6)}`);
    setInvoiceNo(`INV-${Date.now().toString().slice(-6)}`);
    setPSupplierName('');
    setPSupplierMobile('');
    setPItemName('');
    setPQty(1);
    setPUnitPrice(0);
    setPBase64File(null);
    setPFileName('');
    setPFiles([]);
    setIsAddPurchaseOpen(false);
  };

  // 📝 MODULE 31: CATEGORY PRESETS & QUOTATION LOGIC
  const CATEGORY_PRESETS = [
    'প্যান্ডেল ও স্টেজ সেটআপ',
    'আলোকসজ্জা ও লাইটিং',
    'ফ্লাওয়ার ডেকোরেশন ও ব্যাকড্রপ',
    'সাউন্ড ও মাইক সিস্টেম',
    'ভিআইপি সিটিং ও সোফা',
    'টেবিল-চেয়ার ও কভার',
    'এন্ট্রি গেট ও তোরণ',
    'ক্যাটারিং ও বুফে সরঞ্জাম',
    'এলইডি স্ক্রিন ও প্রজেক্টর',
    'লজিস্টিকস ও পরিবহন',
    'অন্যান্য / কাস্টম ক্যাটাগরি'
  ];

  // Add Item to Quotation
  const handleAddQuotationItem = () => {
    const category = (curCategoryOption === 'অন্যান্য / কাস্টম ক্যাটাগরি' ? customCategoryText.trim() : (customCategoryText.trim() || curCategoryOption.trim())) || 'সাধারণ আইটেম';

    if (!curItemName.trim()) {
      alert('দয়া করে আইটেম বা সামগ্রীর নাম লিখুন!');
      return;
    }
    if (curItemQty <= 0) {
      alert('দয়া করে সঠিক পরিমাণ উল্লেখ করুন!');
      return;
    }

    const newItem: QuotationItem = {
      id: `qi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      category,
      name: curItemName.trim(),
      qty: Number(curItemQty),
      unit: curItemUnit.trim() || 'পিস',
      rate: Number(curItemRate) || 0,
      total: (Number(curItemQty) || 1) * (Number(curItemRate) || 0),
      note: curItemNote.trim() || undefined
    };

    setQItems(prev => [...prev, newItem]);

    // Reset item inputs but keep category for rapid entry
    setCurItemName('');
    setCurItemQty(1);
    setCurItemRate(0);
    setCurItemNote('');
    setSelectedStockPickerCode('');
  };

  const handleRemoveQuotationItem = (itemId: string) => {
    setQItems(prev => prev.filter(it => it.id !== itemId));
  };

  const handleStockPickerChange = (code: string) => {
    setSelectedStockPickerCode(code);
    if (!code) return;
    const found = stockItems.find(s => s.code === code);
    if (found) {
      setCurItemName(found.name);
      setCurItemUnit(found.unit || 'পিস');
      setCurItemRate(found.rentalPrice || found.sellingPrice || 0);
      if (found.category) {
        if (CATEGORY_PRESETS.includes(found.category)) {
          setCurCategoryOption(found.category);
        } else {
          setCurCategoryOption('অন্যান্য / কাস্টম ক্যাটাগরি');
          setCustomCategoryText(found.category);
        }
      }
    }
  };

  // Quotation Calculations
  const qItemsSubtotal = useMemo(() => {
    return qItems.reduce((sum, item) => sum + (item.total || (item.qty * item.rate)), 0);
  }, [qItems]);

  const qGrandTotal = useMemo(() => {
    return Math.max(0, qItemsSubtotal + Number(qTransportCharge || 0) + Number(qLabourCharge || 0) - Number(qDiscount || 0));
  }, [qItemsSubtotal, qTransportCharge, qLabourCharge, qDiscount]);

  const categoryWiseBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    qItems.forEach(it => {
      map[it.category] = (map[it.category] || 0) + it.total;
    });
    return map;
  }, [qItems]);

  const handleOpenNewQuotation = () => {
    setEditingQuotationId(null);
    setQNo(`QUO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-4)}`);
    setQDate(new Date().toISOString().split('T')[0]);
    const d = new Date();
    d.setDate(d.getDate() + 15);
    setQValidUntil(d.toISOString().split('T')[0]);
    setQCustomerId('');
    setQCustomerName('');
    setQCustomerMobile('');
    setQCustomerAddress('');
    setQEventName('');
    setQEventDate(new Date().toISOString().split('T')[0]);
    setQVenue('');
    setQBudgetType('Estimated');
    setQItems([]);
    setCurCategoryOption('প্যান্ডেল ও স্টেজ সেটআপ');
    setCustomCategoryText('');
    setCurItemName('');
    setCurItemQty(1);
    setCurItemUnit('পিস');
    setCurItemRate(0);
    setCurItemNote('');
    setSelectedStockPickerCode('');
    setQTransportCharge(0);
    setQLabourCharge(0);
    setQDiscount(0);
    setQAdvanceRequired(0);
    setQTerms(
      '১. মোট প্রাক্কলিত/নির্ধারিত বাজেটের ৫০% অগ্রিম প্রদান সাপেক্ষে বুকিং নিশ্চিত করা হবে।\n' +
      '২. ইভেন্ট পরিচালনার সমাপ্তির দিনে অবশিষ্ট ৫০% পেমেন্ট পরিশোধ করতে হবে।\n' +
      '৩. ভেন্যুতে বিদ্যুৎ ও জেনারেটর সংযোগ ক্লায়েন্টের দায়িত্বে থাকবে।\n' +
      '৪. মালামাল কোনো ক্ষয়ক্ষতি হলে নির্ধারিত মূল্যে ক্ষতিপূরণ প্রযোজ্য হবে।'
    );
    setQNotes('');
    setIsCreatingQuotation(true);
  };

  const handleEditQuotation = (quotation: EventQuotation) => {
    setEditingQuotationId(quotation.id);
    setQNo(quotation.quotationNo);
    setQDate(quotation.date);
    setQValidUntil(quotation.validUntil || quotation.date);
    setQCustomerId(quotation.customerId || '');
    setQCustomerName(quotation.customerName);
    setQCustomerMobile(quotation.customerMobile);
    setQCustomerAddress(quotation.customerAddress || '');
    setQEventName(quotation.eventName);
    setQEventDate(quotation.eventDate);
    setQVenue(quotation.venue);
    setQBudgetType(quotation.budgetType);
    setQItems(quotation.items || []);
    setQTransportCharge(quotation.transportCharge || 0);
    setQLabourCharge(quotation.labourCharge || 0);
    setQDiscount(quotation.discount || 0);
    setQAdvanceRequired(quotation.advanceRequired || 0);
    setQTerms(quotation.termsAndConditions || '');
    setQNotes(quotation.notes || '');
    setIsCreatingQuotation(true);
  };

  const handleSaveQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qCustomerName.trim() && !qEventName.trim()) {
      alert('দয়া করে গ্রাহকের নাম অথবা ইভেন্টের নাম প্রদান করুন!');
      return;
    }
    if (qItems.length === 0) {
      alert('দয়া করে অন্তত একটি আইটেম বা সার্ভিস তালিকায় যোগ করুন!');
      return;
    }

    const payload: Omit<EventQuotation, 'id'> = {
      quotationNo: qNo,
      date: qDate,
      validUntil: qValidUntil,
      customerId: qCustomerId || undefined,
      customerName: qCustomerName || 'গ্রাহক',
      customerMobile: qCustomerMobile || '',
      customerAddress: qCustomerAddress || '',
      eventName: qEventName || 'ইভেন্ট ডেকোরেশন',
      eventDate: qEventDate,
      venue: qVenue || 'গ্রাহক ভেন্যু',
      budgetType: qBudgetType,
      status: editingQuotationId ? (quotations.find(q => q.id === editingQuotationId)?.status || 'Draft') : 'Draft',
      items: qItems,
      subtotal: qItemsSubtotal,
      transportCharge: Number(qTransportCharge) || 0,
      labourCharge: Number(qLabourCharge) || 0,
      discount: Number(qDiscount) || 0,
      grandTotal: qGrandTotal,
      advanceRequired: Number(qAdvanceRequired) || 0,
      termsAndConditions: qTerms,
      notes: qNotes,
      files: qFiles.length > 0 ? qFiles : undefined,
      signatureUrl: getActiveSignatureUrl()
    };

    if (editingQuotationId && onUpdateQuotation) {
      onUpdateQuotation(editingQuotationId, payload);
      alert('কোটেশন সফলভাবে আপডেট করা হয়েছে!');
      setPreviewInvoice({
        id: editingQuotationId,
        type: 'quotations',
        data: { ...payload, id: editingQuotationId }
      });
    } else {
      onAddQuotation(payload);
      alert('নতুন বাজেট কোটেশন সফলভাবে তৈরি ও সংরক্ষণ করা হয়েছে!');
      setPreviewInvoice({
        id: `quo-${Date.now()}`,
        type: 'quotations',
        data: { ...payload, id: `quo-${Date.now()}` }
      });
    }

    setQFiles([]);
    setIsCreatingQuotation(false);
    setEditingQuotationId(null);
  };

  // Quick Customer Autofill
  const handleCustomerSelectForQuotation = (custId: string) => {
    setQCustomerId(custId);
    if (!custId) return;
    const found = customers.find(c => c.id === custId);
    if (found) {
      setQCustomerName(found.name);
      setQCustomerMobile(found.mobile);
      if (found.address) setQCustomerAddress(found.address);
    }
  };

  // Sales invoice auto generator (From Existing Records)
  const handleAutoGenerateSalesInvoice = () => {
    const targetSale = sales.find(s => s.id === selectedSaleId);
    if (!targetSale) {
      alert('সঠিক বিক্রয় এন্ট্রি নির্বাচন করুন!');
      return;
    }
    const customer = customers.find(c => c.id === targetSale.customerId);
    const stockItem = stockItems.find(i => i.code === targetSale.itemCode);

    const subtotal = targetSale.totalAmount;
    const grand = Math.max(0, subtotal - salesDiscount);

    onAddSalesInvoice({
      invoiceNo: `SAL-${Date.now().toString().slice(-6)}`,
      date: targetSale.date,
      customerId: targetSale.customerId,
      customerName: customer ? customer.name : 'অজানা কাস্টমার',
      customerMobile: customer ? customer.mobile : '০১৭০০০০০০০০',
      customerAddress: customer ? customer.address : 'ঢাকা, বাংলাদেশ',
      items: [
        {
          name: stockItem ? stockItem.name : targetSale.itemCode,
          qty: targetSale.qty,
          rate: targetSale.rate,
          total: targetSale.totalAmount
        }
      ],
      subtotal,
      discount: salesDiscount,
      grandTotal: grand,
      qrData: `InvoiceNo: SAL-${Date.now().toString().slice(-6)}\nCustomer: ${customer ? customer.name : 'Unknown'}\nTotal: ${grand} BDT`,
      signatureUrl: getActiveSignatureUrl()
    });

    setSelectedSaleId('');
    setSalesDiscount(0);
    alert('বিক্রয় ইনভয়েস সফলভাবে জেনারেট হয়েছে!');
  };

  // Custom Sales Invoice Creator (Manual / Free-text Input)
  const handleCreateCustomSalesInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSaleCustomerName.trim() || !customSaleItemName.trim() || customSaleQty <= 0 || customSaleRate <= 0) {
      alert('দয়া করে কাস্টমারের নাম, আইটেম, পরিমাণ এবং বিক্রয় দর সঠিকভাবে লিখুন!');
      return;
    }

    const subtotal = Number(customSaleQty) * Number(customSaleRate);
    const grand = Math.max(0, subtotal - Number(customSaleDiscount || 0));

    onAddSalesInvoice({
      invoiceNo: `SAL-${Date.now().toString().slice(-6)}`,
      date: customSaleDate || new Date().toISOString().split('T')[0],
      customerName: customSaleCustomerName.trim(),
      customerMobile: customSaleCustomerMobile.trim() || '০১৭০০০০০০০০',
      customerAddress: customSaleCustomerAddress.trim() || 'কুষ্টিয়া, বাংলাদেশ',
      items: [
        {
          name: customSaleItemName.trim(),
          qty: Number(customSaleQty),
          rate: Number(customSaleRate),
          total: subtotal
        }
      ],
      subtotal,
      discount: Number(customSaleDiscount || 0),
      grandTotal: grand,
      paymentStatus: (customSalePaid >= grand) ? 'Paid' : (customSalePaid > 0 ? 'Partial' : 'Due'),
      paymentMethod: customSalePaymentMethod,
      notes: customSaleNote,
      files: customSaleFiles.length > 0 ? customSaleFiles : undefined,
      qrData: `InvoiceNo: SAL-${Date.now().toString().slice(-6)}\nCustomer: ${customSaleCustomerName}\nTotal: ${grand} BDT`,
      signatureUrl: getActiveSignatureUrl()
    });

    // Reset fields
    setCustomSaleCustomerName('');
    setCustomSaleCustomerMobile('');
    setCustomSaleCustomerAddress('');
    setCustomSaleItemName('');
    setCustomSaleQty(1);
    setCustomSaleRate(0);
    setCustomSaleDiscount(0);
    setCustomSalePaid(0);
    setCustomSaleNote('');
    setCustomSaleFiles([]);
    alert('কাস্টম বিক্রয় ইনভয়েস সফলভাবে তৈরি ও সংরক্ষিত হয়েছে!');
  };

  // Rental invoice auto generator (From Existing Records)
  const handleAutoGenerateRentalInvoice = () => {
    const targetRental = rentals.find(r => r.id === selectedRentalId);
    if (!targetRental) {
      alert('সঠিক ভাড়া এন্ট্রি নির্বাচন করুন!');
      return;
    }
    const customer = customers.find(c => c.id === targetRental.customerId);
    const stockItem = stockItems.find(i => i.code === targetRental.itemCode);

    const itemsCost = targetRental.totalBill;
    const grand = itemsCost + transportCharge + labourCharge;

    onAddRentalInvoice({
      invoiceNo: `RNT-${Date.now().toString().slice(-6)}`,
      date: targetRental.date,
      customerId: targetRental.customerId,
      customerName: customer ? customer.name : 'অজানা কাস্টমার',
      customerMobile: customer ? customer.mobile : '০১৭০০০০০০০০',
      eventName: `ইভেন্ট তারিখ: ${targetRental.eventDate}`,
      items: [
        {
          name: stockItem ? stockItem.name : targetRental.itemCode,
          qty: targetRental.qty,
          rate: targetRental.rentalPrice,
          total: itemsCost
        }
      ],
      rentalCharges: itemsCost,
      securityDeposit,
      transportCharge,
      labourCharge,
      totalBill: grand,
      paidAmount: targetRental.paidAmount,
      dueAmount: Math.max(0, grand - targetRental.paidAmount)
    });

    setSelectedRentalId('');
    setSecurityDeposit(0);
    setTransportCharge(0);
    setLabourCharge(0);
    alert('ভাড়া ইনভয়েস সফলভাবে জেনারেট হয়েছে!');
  };

  // Custom Rental Invoice Creator (Manual / Free-text Input)
  const handleCreateCustomRentalInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRentalCustomerName.trim() || !customRentalItemName.trim() || customRentalQty <= 0 || customRentalRate <= 0) {
      alert('দয়া করে গ্রাহকের নাম, ভাড়ার সামগ্রী, পরিমাণ এবং ভাড়া রেট সঠিকভাবে লিখুন!');
      return;
    }

    const itemsCost = Number(customRentalQty) * Number(customRentalRate) * Number(customRentalDays || 1);
    const grand = itemsCost + Number(customRentalTransport || 0) + Number(customRentalLabour || 0);
    const paid = Number(customRentalPaid || 0);

    onAddRentalInvoice({
      invoiceNo: `RNT-${Date.now().toString().slice(-6)}`,
      date: customRentalDate || new Date().toISOString().split('T')[0],
      customerName: customRentalCustomerName.trim(),
      customerMobile: customRentalCustomerMobile.trim() || '০১৭০০০০০০০০',
      eventName: customRentalEventName.trim() || `ইভেন্ট তারিখ: ${customRentalEventDate}`,
      items: [
        {
          name: customRentalItemName.trim(),
          qty: Number(customRentalQty),
          rate: Number(customRentalRate),
          total: itemsCost
        }
      ],
      rentalCharges: itemsCost,
      securityDeposit: Number(customRentalDeposit || 0),
      transportCharge: Number(customRentalTransport || 0),
      labourCharge: Number(customRentalLabour || 0),
      totalBill: grand,
      paidAmount: paid,
      dueAmount: Math.max(0, grand - paid),
      paymentStatus: (paid >= grand) ? 'Paid' : (paid > 0 ? 'Partial' : 'Due'),
      paymentMethod: customRentalPaymentMethod,
      notes: customRentalNote,
      files: customRentalFiles.length > 0 ? customRentalFiles : undefined
    });

    // Reset fields
    setCustomRentalCustomerName('');
    setCustomRentalCustomerMobile('');
    setCustomRentalCustomerAddress('');
    setCustomRentalEventName('');
    setCustomRentalVenue('');
    setCustomRentalItemName('');
    setCustomRentalQty(1);
    setCustomRentalRate(0);
    setCustomRentalDays(1);
    setCustomRentalDeposit(0);
    setCustomRentalTransport(0);
    setCustomRentalLabour(0);
    setCustomRentalPaid(0);
    setCustomRentalNote('');
    setCustomRentalFiles([]);
    alert('কাস্টম ভাড়া ইনভয়েস সফলভাবে তৈরি ও সংরক্ষিত হয়েছে!');
  };

  // Event invoice auto generator (From Existing Records)
  const handleAutoGenerateEventInvoice = () => {
    const targetEvent = events.find(e => e.id === selectedEventId);
    if (!targetEvent) {
      alert('সঠিক ইভেন্ট নির্বাচন করুন!');
      return;
    }
    const customer = customers.find(c => c.id === targetEvent.customerId);

    // Calculate dynamic labour, transport etc. from event notes/costs or defaults
    const transportVal = 2000;
    const labourVal = 1500;
    const packageCost = targetEvent.budget - transportVal - labourVal;

    // Materials list mapped
    const materialsUsed = targetEvent.materials.map(m => {
      const item = stockItems.find(i => i.code === m.itemCode);
      return {
        name: item ? item.name : m.itemCode,
        qty: m.qty
      };
    });

    onAddEventInvoice({
      invoiceNo: `EVT-${Date.now().toString().slice(-6)}`,
      date: targetEvent.date,
      eventId: targetEvent.id,
      eventName: targetEvent.name,
      eventDate: targetEvent.date,
      venue: 'ক্লায়েন্ট ভেন্যু',
      customerId: targetEvent.customerId,
      customerName: customer ? customer.name : 'অজানা কাস্টমার',
      customerMobile: customer ? customer.mobile : '০১৭০০০০০০০০',
      decorationPackage: targetEvent.name,
      materialsUsed,
      labourCost: labourVal,
      transportCost: transportVal,
      extraCharges: eventExtraCharge,
      totalCost: targetEvent.budget + eventExtraCharge
    });

    setSelectedEventId('');
    setEventExtraCharge(0);
    setEventExtraDetails('');
    alert('ইভেন্ট ইনভয়েস সফলভাবে জেনারেট হয়েছে!');
  };

  // Custom Event Invoice Creator (Manual / Free-text Input)
  const handleCreateCustomEventInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEventCustomerName.trim() || !customEventName.trim() || customEventBudget <= 0) {
      alert('দয়া করে ক্লায়েন্টের নাম, ইভেন্টের নাম এবং মূল বাজেট সঠিকভাবে লিখুন!');
      return;
    }

    const total = Number(customEventBudget) + Number(customEventTransport || 0) + Number(customEventLabour || 0) + Number(customEventExtraCharge || 0);

    onAddEventInvoice({
      invoiceNo: `EVT-${Date.now().toString().slice(-6)}`,
      date: customEventDate || new Date().toISOString().split('T')[0],
      eventName: customEventName.trim(),
      eventDate: customEventEventDate || customEventDate,
      venue: customEventVenue.trim() || 'ক্লায়েন্ট ভেন্যু',
      customerName: customEventCustomerName.trim(),
      customerMobile: customEventCustomerMobile.trim() || '০১৭০০০০০০০০',
      decorationPackage: customEventPackage.trim() || customEventName.trim(),
      materialsUsed: [
        {
          name: customEventPackage.trim() || 'কাস্টম ডেকোরেশন ও স্টেজ প্যাকেজ',
          qty: 1
        }
      ],
      labourCost: Number(customEventLabour || 0),
      transportCost: Number(customEventTransport || 0),
      extraCharges: Number(customEventExtraCharge || 0),
      totalCost: total,
      dueAmount: Math.max(0, total - Number(customEventPaid || 0)),
      paymentStatus: (Number(customEventPaid || 0) >= total) ? 'Paid' : (Number(customEventPaid || 0) > 0 ? 'Partial' : 'Due'),
      paymentMethod: customEventPaymentMethod,
      notes: customEventNotes,
      files: customEventFiles.length > 0 ? customEventFiles : undefined
    });

    // Reset fields
    setCustomEventName('');
    setCustomEventVenue('');
    setCustomEventCustomerName('');
    setCustomEventCustomerMobile('');
    setCustomEventCustomerAddress('');
    setCustomEventPackage('');
    setCustomEventBudget(0);
    setCustomEventTransport(0);
    setCustomEventLabour(0);
    setCustomEventExtraCharge(0);
    setCustomEventExtraDetails('');
    setCustomEventPaid(0);
    setCustomEventNotes('');
    setCustomEventFiles([]);
    alert('কাস্টম ইভেন্ট ইনভয়েস সফলভাবে তৈরি ও সংরক্ষিত হয়েছে!');
  };

  // 🌟 MODULE 33: FINAL EVENT INVOICE CALCULATIONS & HANDLERS
  const finalExtraWorkCost = useMemo(() => {
    return finalExtraItems.reduce((sum, item) => sum + (item.total || (item.qty * item.rate)), 0);
  }, [finalExtraItems]);

  const finalExtraChargesTotal = useMemo(() => {
    return Number(finalExtraTransport || 0) + Number(finalExtraLabour || 0) + Number(finalDamageCharge || 0);
  }, [finalExtraTransport, finalExtraLabour, finalDamageCharge]);

  const finalNetPayable = useMemo(() => {
    return Math.max(0, Number(finalBaseBudget || 0) + finalExtraWorkCost + finalExtraChargesTotal - Number(finalDiscount || 0));
  }, [finalBaseBudget, finalExtraWorkCost, finalExtraChargesTotal, finalDiscount]);

  const finalDueAmount = useMemo(() => {
    return Math.max(0, finalNetPayable - Number(finalAdvancePaid || 0));
  }, [finalNetPayable, finalAdvancePaid]);

  const EXTRA_WORK_PRESETS = [
    { name: 'অতিরিক্ত আলোকসজ্জা ও ফ্লাডলাইট সেটআপ', qty: 1, unit: 'সেট', rate: 2500, note: 'ক্লায়েন্টের তাৎক্ষণিক চাহিদামতো অতিরিক্ত ৩টি হ্যালোজেন ও ২টি মুভিং হেড' },
    { name: 'অতিরিক্ত ৫০টি ভিআইপি কুশন চেয়ার ও বো কভার', qty: 50, unit: 'পিস', rate: 40, note: 'অতিথি সংখ্যা বৃদ্ধির কারণে অতিরিক্ত চেয়ার ও সিল্ক কভার' },
    { name: 'স্টেজ ও গেটে অতিরিক্ত তাজা ফুল ডেকোরেশন', qty: 1, unit: 'প্যাকেজ', rate: 4500, note: 'আমদানি করা রজনীগন্ধা ও থাই গোলাপের এক্সক্লুসিভ অতিরিক্ত কাজ' },
    { name: 'অতিরিক্ত ৪ ঘণ্টা জেনারেটর ব্যাকআপ ও জ্বালানি', qty: 4, unit: 'ঘণ্টা', rate: 800, note: 'ইভেন্টের সময়সীমা বৃদ্ধিজনিত ডিজেল ও ব্যাকআপ খরচ' },
    { name: 'অতিরিক্ত এলইডি স্ক্রিন ও লাইভ ক্যামেরা ফিড', qty: 1, unit: 'সেট', rate: 6000, note: 'সাইড ভেন্যুর জন্য অতিরিক্ত ১০x৮ ফিট এলইডি ওয়াল' },
    { name: 'ইভেন্ট ক্রু ও টেকনিশিয়ান নাইট ওভারটাইম মজুরি', qty: 4, unit: 'জন', rate: 500, note: 'রাত ১২টার পর অতিরিক্ত সেটআপ ও আনলোডিং ওভারটাইম' }
  ];

  // Open Final Invoice Builder
  const handleOpenFinalInvoice = (targetQuotation?: EventQuotation, targetEvent?: EventEntry) => {
    const invNumber = `FIN-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
    setFinalInvNo(invNumber);
    setFinalInvDate(new Date().toISOString().split('T')[0]);
    setFinalExtraItems([]);
    setCurExtraName('');
    setCurExtraQty(1);
    setCurExtraUnit('সেট');
    setCurExtraRate(0);
    setCurExtraNote('');
    setFinalExtraTransport(0);
    setFinalExtraLabour(0);
    setFinalDamageCharge(0);
    setFinalDiscount(0);
    setFinalPaymentStatus('Paid');
    setFinalPaymentMethod('নগদ (Cash)');
    setFinalNotes('');
    setFinalTerms(
      '১. ইভেন্ট চুক্তি ও পরিকল্পনা অনুযায়ী সফলভাবে সম্পন্ন হয়েছে।\n' +
      '২. ক্লায়েন্টের চাহিদা অনুযায়ী অতিরিক্ত মালামাল ও সেবার বিল মূল বাজেটের সাথে সমন্বয় করা হয়েছে।\n' +
      '৩. প্রদত্ত অগ্রিম কর্তনের পর অবশিষ্ট প্রদেয় বকেয়া বিল তাৎক্ষণিক পরিশোধযোগ্য।\n' +
      '৪. মালামাল অক্ষত অবস্থায় ফেরত নেওয়া হয়েছে / নির্ধারিত ক্ষতিপূরণ সমন্বয় করা হয়েছে।\n' +
      '৫. রিত্তিকা ইভেন্ট ম্যানেজমেন্টের সেবা গ্রহণ করার জন্য ধন্যবাদ।'
    );

    if (targetQuotation) {
      setFinalSelectedQuotationId(targetQuotation.id);
      setFinalSelectedEventId('');
      setFinalEventName(targetQuotation.eventName);
      setFinalEventDate(targetQuotation.eventDate || targetQuotation.date);
      setFinalVenue(targetQuotation.venue || '');
      setFinalCustomerId(targetQuotation.customerId || '');
      setFinalCustomerName(targetQuotation.customerName);
      setFinalCustomerMobile(targetQuotation.customerMobile);
      setFinalCustomerAddress(targetQuotation.customerAddress || '');
      setFinalBaseBudget(targetQuotation.grandTotal || 0);
      setFinalAdvancePaid(targetQuotation.advanceRequired || 0);
      setFinalAdvanceDate(targetQuotation.date);
    } else if (targetEvent) {
      setFinalSelectedQuotationId('');
      setFinalSelectedEventId(targetEvent.id);
      setFinalEventName(targetEvent.name);
      setFinalEventDate(targetEvent.date);
      setFinalVenue(targetEvent.note || 'গ্রাহক ভেন্যু');
      const cust = customers.find(c => c.id === targetEvent.customerId);
      setFinalCustomerId(targetEvent.customerId);
      setFinalCustomerName(cust ? cust.name : 'গ্রাহক');
      setFinalCustomerMobile(cust ? cust.mobile : '');
      setFinalCustomerAddress(cust ? cust.address : '');
      setFinalBaseBudget(targetEvent.budget || 0);
      setFinalAdvancePaid(targetEvent.paidAmount || 0);
      setFinalAdvanceDate(targetEvent.date);
    } else {
      setFinalSelectedQuotationId('');
      setFinalSelectedEventId('');
      setFinalEventName('');
      setFinalEventDate(new Date().toISOString().split('T')[0]);
      setFinalVenue('');
      setFinalCustomerId('');
      setFinalCustomerName('');
      setFinalCustomerMobile('');
      setFinalCustomerAddress('');
      setFinalBaseBudget(0);
      setFinalAdvancePaid(0);
      setFinalAdvanceDate(new Date().toISOString().split('T')[0]);
    }

    setIsCreatingQuotation(false);
    setIsCreatingFinalInvoice(true);
    setActiveTab('quotations');
    setPreviewInvoice(null);
  };

  const handleQuotationSelectForFinal = (qId: string) => {
    setFinalSelectedQuotationId(qId);
    if (!qId) return;
    const q = quotations.find(item => item.id === qId);
    if (q) {
      setFinalEventName(q.eventName);
      setFinalEventDate(q.eventDate || q.date);
      setFinalVenue(q.venue || 'গ্রাহক ভেন্যু');
      setFinalCustomerId(q.customerId || '');
      setFinalCustomerName(q.customerName);
      setFinalCustomerMobile(q.customerMobile);
      setFinalCustomerAddress(q.customerAddress || '');
      setFinalBaseBudget(q.grandTotal || 0);
      setFinalAdvancePaid(q.advanceRequired || 0);
      setFinalAdvanceDate(q.date);
    }
  };

  const handleEventSelectForFinal = (eId: string) => {
    setFinalSelectedEventId(eId);
    if (!eId) return;
    const ev = events.find(item => item.id === eId);
    if (ev) {
      setFinalEventName(ev.name);
      setFinalEventDate(ev.date);
      setFinalVenue(ev.note || 'গ্রাহক ভেন্যু');
      const cust = customers.find(c => c.id === ev.customerId);
      setFinalCustomerId(ev.customerId);
      setFinalCustomerName(cust ? cust.name : 'গ্রাহক');
      setFinalCustomerMobile(cust ? cust.mobile : '');
      setFinalCustomerAddress(cust ? cust.address : '');
      setFinalBaseBudget(ev.budget || 0);
      setFinalAdvancePaid(ev.paidAmount || 0);
      setFinalAdvanceDate(ev.date);
    }
  };

  const handleAddExtraItem = () => {
    if (!curExtraName.trim()) {
      alert('দয়া করে অতিরিক্ত কাজের নাম বা বিবরণ লিখুন!');
      return;
    }
    if (curExtraRate < 0 || curExtraQty <= 0) {
      alert('সঠিক পরিমাণ ও দর উল্লেখ করুন!');
      return;
    }

    const newItem: EventExtraItem = {
      id: `ext-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: curExtraName.trim(),
      qty: Number(curExtraQty),
      unit: curExtraUnit.trim() || 'পিস',
      rate: Number(curExtraRate) || 0,
      total: (Number(curExtraQty) || 1) * (Number(curExtraRate) || 0),
      note: curExtraNote.trim() || undefined
    };

    setFinalExtraItems(prev => [...prev, newItem]);
    setCurExtraName('');
    setCurExtraQty(1);
    setCurExtraRate(0);
    setCurExtraNote('');
  };

  const handleRemoveExtraItem = (itemId: string) => {
    setFinalExtraItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleApplyExtraPreset = (preset: { name: string; qty: number; unit: string; rate: number; note: string }) => {
    const newItem: EventExtraItem = {
      id: `ext-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: preset.name,
      qty: preset.qty,
      unit: preset.unit,
      rate: preset.rate,
      total: preset.qty * preset.rate,
      note: preset.note
    };
    setFinalExtraItems(prev => [...prev, newItem]);
  };

  const handleSaveFinalInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalCustomerName.trim() && !finalEventName.trim()) {
      alert('দয়া করে গ্রাহক ও ইভেন্টের নাম প্রদান করুন!');
      return;
    }

    const linkedQuotation = quotations.find(q => q.id === finalSelectedQuotationId);

    const payload: Omit<EventInvoice, 'id'> = {
      invoiceNo: finalInvNo || `FIN-${Date.now().toString().slice(-6)}`,
      date: finalInvDate,
      eventId: finalSelectedEventId || `EVT-${Date.now()}`,
      eventName: finalEventName || 'সম্পন্ন ইভেন্ট',
      eventDate: finalEventDate,
      venue: finalVenue || 'গ্রাহক ভেন্যু',
      customerId: finalCustomerId || `CUST-${Date.now()}`,
      customerName: finalCustomerName || 'গ্রাহক',
      customerMobile: finalCustomerMobile || '',
      customerAddress: finalCustomerAddress || 'রথপাড়া, ভেড়ামারা, কুষ্টিয়া',
      decorationPackage: finalEventName || 'সম্পূর্ণ ইভেন্ট ডেকোরেশন',
      materialsUsed: [],
      labourCost: Number(finalExtraLabour) || 0,
      transportCost: Number(finalExtraTransport) || 0,
      extraCharges: finalExtraChargesTotal,
      totalCost: finalNetPayable,

      // Final Bill Properties
      quotationId: finalSelectedQuotationId || undefined,
      quotationNo: linkedQuotation ? linkedQuotation.quotationNo : undefined,
      baseBudget: Number(finalBaseBudget) || 0,
      advancePaid: Number(finalAdvancePaid) || 0,
      advancePaymentDate: finalAdvanceDate,
      advancePaymentMethod: finalAdvanceMethod,
      extraItems: finalExtraItems,
      extraWorkCost: finalExtraWorkCost,
      extraChargesDetails: `পরিবহন: ৳${finalExtraTransport}, লেবার: ৳${finalExtraLabour}${finalDamageCharge > 0 ? `, ক্ষতিপূরণ: ৳${finalDamageCharge}` : ''}`,
      discount: Number(finalDiscount) || 0,
      damageDeduction: Number(finalDamageCharge) || 0,
      netPayable: finalNetPayable,
      dueAmount: finalDueAmount,
      paymentStatus: finalPaymentStatus,
      paymentMethod: finalPaymentMethod,
      termsAndConditions: finalTerms,
      notes: finalNotes,
      files: finalInvFiles.length > 0 ? finalInvFiles : undefined,
      qrData: `Final Invoice: ${finalInvNo}\nCustomer: ${finalCustomerName}\nEvent: ${finalEventName}\nTotal: ${finalNetPayable} BDT\nAdvance Paid: ${finalAdvancePaid} BDT\nDue: ${finalDueAmount} BDT\nRittika Event Management`,
      signatureUrl: getActiveSignatureUrl()
    };

    onAddEventInvoice(payload);

    // Update linked quotation to Converted if exists
    if (finalSelectedQuotationId && linkedQuotation && onUpdateQuotation) {
      onUpdateQuotation(finalSelectedQuotationId, {
        ...linkedQuotation,
        status: 'Converted'
      });
    }

    setFinalInvFiles([]);
    setIsCreatingFinalInvoice(false);

    const generatedWithId = {
      ...payload,
      id: `EVT-INV-${Date.now()}`
    };

    setPreviewInvoice({
      id: generatedWithId.id,
      type: 'event',
      data: generatedWithId
    });

    alert('🎉 ইভেন্ট সম্পন্ন ফাইনাল ইনভয়েস সফলভাবে জেনারেট ও সংরক্ষণ করা হয়েছে!');
  };

  // Folder Files filtering for Document Center (Module 26) & Media Storage (Module 30)
  const folderDocumentsList = useMemo(() => {
    let files: { id: string; name: string; type: string; date: string; folder: FolderType; previewUrl?: string; data: any }[] = [];

    // Purchase files
    purchaseInvoices.forEach(pi => {
      files.push({
        id: pi.id,
        name: `ক্রয় ইনভয়েস: ${pi.invoiceNo} (${pi.supplierName})`,
        type: pi.fileName ? pi.fileName.split('.').pop() || 'pdf' : 'pdf',
        date: pi.date,
        folder: 'purchase',
        previewUrl: pi.fileUrl,
        data: pi
      });
    });

    // Sales files
    salesInvoices.forEach(si => {
      files.push({
        id: si.id,
        name: `বিক্রয় ইনভয়েস: ${si.invoiceNo} (${si.customerName})`,
        type: 'pdf',
        date: si.date,
        folder: 'sales',
        data: si
      });
    });

    // Rental files
    rentalInvoices.forEach(ri => {
      files.push({
        id: ri.id,
        name: `ভাড়া ইনভয়েস: ${ri.invoiceNo} (${ri.customerName})`,
        type: 'pdf',
        date: ri.date,
        folder: 'rental',
        data: ri
      });
    });

    // Event files
    eventInvoices.forEach(ei => {
      files.push({
        id: ei.id,
        name: `ইভেন্ট ইনভয়েস: ${ei.invoiceNo} (${ei.customerName})`,
        type: 'pdf',
        date: ei.date,
        folder: 'event',
        data: ei
      });
    });

    // Quotations files (Module 31)
    quotations.forEach(q => {
      files.push({
        id: q.id,
        name: `কোটেশন [${q.budgetType === 'Estimated' ? 'আনুমানিক' : 'ফিক্সড'}]: ${q.quotationNo} (${q.customerName || q.eventName})`,
        type: 'pdf',
        date: q.date,
        folder: 'quotations',
        data: q
      });
    });

    // Custom attachments from customer portal / attachments
    attachments.forEach(att => {
      let folder: FolderType = 'customer';
      if (att.type === 'NID') folder = 'nid';
      else if (att.type === 'Photo') folder = 'photos';

      files.push({
        id: att.id,
        name: att.name,
        type: att.name.split('.').pop() || 'png',
        date: att.date,
        folder,
        previewUrl: att.dataUrl,
        data: att
      });
    });

    return files.filter(f => f.folder === selectedFolder && (
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.date.includes(searchQuery)
    ));
  }, [purchaseInvoices, salesInvoices, rentalInvoices, eventInvoices, quotations, attachments, selectedFolder, searchQuery]);

  // Filtered quotations for Quotation Explorer
  const filteredQuotations = useMemo(() => {
    return quotations.filter(q => {
      const matchSearch = 
        q.quotationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.date.includes(searchQuery);

      const matchBudget = quotationFilterBudgetType === 'All' || q.budgetType === quotationFilterBudgetType;
      const matchStatus = quotationFilterStatus === 'All' || q.status === quotationFilterStatus;

      return matchSearch && matchBudget && matchStatus;
    });
  }, [quotations, searchQuery, quotationFilterBudgetType, quotationFilterStatus]);

  // 🌟 Unified All Saved Invoices & Quotations List
  const allSavedInvoicesList = useMemo(() => {
    type UnifiedItem = {
      id: string;
      type: 'quotations' | 'event' | 'sales' | 'rental' | 'purchase';
      typeLabel: string;
      number: string;
      name: string;
      partyName: string;
      partyMobile: string;
      date: string;
      amount: number;
      paid: number;
      due: number;
      status: string;
      files: { name: string; url: string }[];
      originalData: any;
    };

    const list: UnifiedItem[] = [];

    // Quotations
    quotations.forEach(q => {
      list.push({
        id: q.id,
        type: 'quotations',
        typeLabel: 'বাজেট কোটেশন',
        number: q.quotationNo,
        name: q.eventName,
        partyName: q.customerName,
        partyMobile: q.customerMobile,
        date: q.date,
        amount: q.grandTotal,
        paid: q.advancePaid || 0,
        due: Math.max(0, q.grandTotal - (q.advancePaid || 0)),
        status: q.status === 'Converted' ? 'Converted' : (q.budgetType === 'Fixed' ? 'Fixed' : 'Estimated'),
        files: [],
        originalData: q
      });
    });

    // Event Invoices
    eventInvoices.forEach(ev => {
      const files: { name: string; url: string }[] = [];
      if (ev.files && Array.isArray(ev.files)) files.push(...ev.files);
      else if (ev.fileUrl) files.push({ name: ev.fileName || 'event_bill', url: ev.fileUrl });

      list.push({
        id: ev.id,
        type: 'event',
        typeLabel: 'ইভেন্ট বিল ও চালান',
        number: ev.invoiceNo,
        name: ev.eventName,
        partyName: ev.customerName,
        partyMobile: ev.customerMobile,
        date: ev.date,
        amount: ev.totalCost,
        paid: ev.paidAmount !== undefined ? ev.paidAmount : (ev.totalCost - (ev.dueAmount || 0)),
        due: ev.dueAmount || 0,
        status: ev.paymentStatus || (ev.dueAmount === 0 ? 'Paid' : 'Due'),
        files,
        originalData: ev
      });
    });

    // Sales Invoices
    salesInvoices.forEach(sl => {
      const files: { name: string; url: string }[] = [];
      if (sl.files && Array.isArray(sl.files)) files.push(...sl.files);
      else if (sl.fileUrl) files.push({ name: sl.fileName || 'sales_receipt', url: sl.fileUrl });

      list.push({
        id: sl.id,
        type: 'sales',
        typeLabel: 'বিক্রয় ইনভয়েস',
        number: sl.invoiceNo,
        name: sl.itemName,
        partyName: sl.customerName,
        partyMobile: sl.customerMobile,
        date: sl.date,
        amount: sl.grandTotal,
        paid: sl.grandTotal,
        due: 0,
        status: 'Paid',
        files,
        originalData: sl
      });
    });

    // Rental Invoices
    rentalInvoices.forEach(rn => {
      const files: { name: string; url: string }[] = [];
      if (rn.files && Array.isArray(rn.files)) files.push(...rn.files);
      else if (rn.fileUrl) files.push({ name: rn.fileName || 'rental_invoice', url: rn.fileUrl });

      list.push({
        id: rn.id,
        type: 'rental',
        typeLabel: 'ভাড়া ইনভয়েস',
        number: rn.invoiceNo,
        name: rn.itemName,
        partyName: rn.customerName,
        partyMobile: rn.customerMobile,
        date: rn.date,
        amount: rn.totalBill,
        paid: rn.advancePaid,
        due: rn.dueAmount,
        status: rn.paymentStatus,
        files,
        originalData: rn
      });
    });

    // Purchase Invoices
    purchaseInvoices.forEach(pc => {
      const files: { name: string; url: string }[] = [];
      if (pc.files && Array.isArray(pc.files)) files.push(...pc.files);
      else if (pc.fileUrl) files.push({ name: pc.fileName || 'supplier_invoice', url: pc.fileUrl });

      list.push({
        id: pc.id,
        type: 'purchase',
        typeLabel: 'সাপ্লায়ার ক্রয় বিল',
        number: pc.invoiceNo || pc.purchaseNo,
        name: pc.itemName,
        partyName: pc.supplierName,
        partyMobile: pc.supplierMobile,
        date: pc.date,
        amount: pc.totalAmount,
        paid: pc.paymentStatus === 'Paid' ? pc.totalAmount : 0,
        due: pc.paymentStatus === 'Due' ? pc.totalAmount : 0,
        status: pc.paymentStatus,
        files,
        originalData: pc
      });
    });

    // Filter by category
    let filtered = list;
    if (archiveFilterType !== 'all') {
      filtered = filtered.filter(item => item.type === archiveFilterType);
    }

    // Filter by payment status
    if (archiveFilterStatus === 'paid') {
      filtered = filtered.filter(item => item.status === 'Paid' || item.due === 0);
    } else if (archiveFilterStatus === 'due') {
      filtered = filtered.filter(item => item.status === 'Due' || item.due > 0);
    } else if (archiveFilterStatus === 'partial') {
      filtered = filtered.filter(item => item.status === 'Partial');
    } else if (archiveFilterStatus === 'converted') {
      filtered = filtered.filter(item => item.status === 'Converted');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.number.toLowerCase().includes(q) ||
        item.partyName.toLowerCase().includes(q) ||
        item.partyMobile.includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.date.includes(q) ||
        item.typeLabel.toLowerCase().includes(q)
      );
    }

    // Sort by date descending
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [quotations, eventInvoices, salesInvoices, rentalInvoices, purchaseInvoices, archiveFilterType, archiveFilterStatus, searchQuery]);

  // Handle printing of an invoice
  const handlePrint = () => {
    window.print();
  };

  // 🌟 Direct High-Quality PDF Downloader
  const handleDirectPdfDownload = async () => {
    if (!previewInvoice) return;
    setIsDownloadingPdf(true);
    try {
      const res = await downloadInvoicePDF('printable-invoice-canvas', {
        invoiceNo: previewInvoice.data.quotationNo || previewInvoice.data.invoiceNo || previewInvoice.data.purchaseNo || previewInvoice.data.id || 'INV',
        customerName: previewInvoice.data.customerName || previewInvoice.data.eventName || previewInvoice.data.supplierName || 'Client',
        type: previewInvoice.type,
        date: previewInvoice.data.date
      });
      if (res.success) {
        setDownloadSuccessToast(`✓ "${res.fileName}" সফলভাবে ডাউনলোড হয়েছে!`);
        setTimeout(() => setDownloadSuccessToast(null), 4000);
      } else {
        alert('PDF তৈরিতে সমস্যা হয়েছে: ' + (res.error || 'অনুগ্রহ করে পুনরায় চেষ্টা করুন'));
      }
    } catch (err: any) {
      console.error('PDF error:', err);
      alert('PDF ডাউনলোড ব্যর্থ হয়েছে: ' + (err?.message || 'Error'));
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // 🌟 Direct High-Definition JPG Image Downloader
  const handleDirectImgDownload = async () => {
    if (!previewInvoice) return;
    setIsDownloadingImg(true);
    try {
      const res = await downloadInvoiceImage('printable-invoice-canvas', {
        invoiceNo: previewInvoice.data.quotationNo || previewInvoice.data.invoiceNo || previewInvoice.data.purchaseNo || previewInvoice.data.id || 'INV',
        customerName: previewInvoice.data.customerName || previewInvoice.data.eventName || previewInvoice.data.supplierName || 'Client',
        type: previewInvoice.type,
        date: previewInvoice.data.date
      }, 'jpg');
      if (res.success) {
        setDownloadSuccessToast(`✓ HD বিল ছবি "${res.fileName}" ডাউনলোড হয়েছে!`);
        setTimeout(() => setDownloadSuccessToast(null), 4000);
      }
    } catch (err: any) {
      console.error('Image error:', err);
      alert('ছবি তৈরি ব্যর্থ হয়েছে: ' + (err?.message || 'Error'));
    } finally {
      setIsDownloadingImg(false);
    }
  };

  // 🌟 WhatsApp/Email Share Trigger Mechanism
  const triggerShare = (inv: any, type: 'sales' | 'rental' | 'event' | 'quotations' | 'purchase') => {
    const invId = inv.quotationNo || inv.invoiceNo || inv.purchaseNo || inv.id || '';
    const name = inv.customerName || inv.eventName || inv.supplierName || 'সম্মানিত গ্রাহক';
    const total = inv.grandTotal || inv.totalCost || inv.totalBill || inv.netPayable || inv.baseBudget || 0;
    const paid = inv.advancePaid || inv.paidAmount || (inv.paymentStatus === 'Paid' ? total : 0);
    const due = inv.dueAmount !== undefined ? inv.dueAmount : Math.max(0, total - paid);

    setSharingInvoice({
      id: invId,
      type,
      mobile: inv.customerMobile || inv.mobile || '',
      email: inv.customerEmail || inv.email || '',
      name,
      date: inv.date || new Date().toISOString().split('T')[0],
      total,
      paid,
      due,
      rawData: inv
    });
    setShareTarget(inv.customerMobile || inv.mobile || '');
    setShareMethod('whatsapp');
  };

  // 🌟 Build Rich Formatted Text with Summary and Verification Links
  const buildShareText = (item: NonNullable<typeof sharingInvoice>) => {
    const appBaseUrl = window.location.origin;
    const docTypeTitle = item.type === 'quotations' 
      ? 'বাজেট কোটেশন ও এস্টিমেট' 
      : item.type === 'event' 
      ? 'ইভেন্ট ফাইনাল ইনভয়েস বিল' 
      : item.type === 'rental'
      ? 'ভাড়া বিল মেমো'
      : item.type === 'sales'
      ? 'বিক্রয় ইনভয়েস বিল'
      : 'অফিসিয়াল ইনভয়েস';

    const totalTxt = formatCurrency(item.total || 0);
    const paidTxt = formatCurrency(item.paid || 0);
    const dueTxt = formatCurrency(item.due || 0);

    let text = `👑 *রিত্তিকা ইভেন্ট ম্যানেজমেন্ট* — *${docTypeTitle}*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `👤 *গ্রাহক / ইভেন্ট:* ${item.name}\n`;
    text += `🧾 *ডকুমেন্ট নং:* ${item.id}\n`;
    if (item.date) text += `📅 *তারিখ:* ${item.date}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💰 *মোট বাজেট / বিল:* ${totalTxt}\n`;
    if ((item.paid || 0) > 0) {
      text += `💵 *পরিশোধিত:* ${paidTxt}\n`;
    }
    if ((item.due || 0) > 0) {
      text += `⚠️ *অবশিষ্ট বকেয়া:* ${dueTxt}\n`;
    } else if ((item.total || 0) > 0 && (item.paid || 0) >= (item.total || 0)) {
      text += `✅ *স্ট্যাটাস:* সম্পূর্ণ পরিশোধিত (Paid in Full)\n`;
    }
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📄 *অফিসিয়াল কপি:* আপনার বিলের মূল ডিজিটাল কপি প্রস্তুত রয়েছে।\n`;
    text += `🌐 *অনলাইন পোর্টাল:* ${appBaseUrl}\n\n`;
    text += `📞 *হটলাইন:* +880 1721-779396\n`;
    text += `🏢 *অফিস:* রথপাড়া, ভেড়ামারা, কুষ্টিয়া\n`;
    text += `রিত্তিকা ইভেন্ট ম্যানেজমেন্টের সাথে যোগাযোগ করার জন্য ধন্যবাদ! ✨`;
    return text;
  };

  // 🌟 Automated 1-Click PDF Download + WhatsApp Chat
  const handleDirectWhatsAppShareWithPdf = async () => {
    if (!sharingInvoice) return;
    
    // Auto-trigger PDF download if preview canvas exists or preview invoice is set
    const previewCanvas = document.getElementById('printable-invoice-canvas');
    if (previewCanvas) {
      try {
        await downloadInvoicePDF('printable-invoice-canvas', {
          invoiceNo: sharingInvoice.id,
          customerName: sharingInvoice.name,
          type: sharingInvoice.type,
          date: sharingInvoice.date
        });
      } catch (e) {
        console.warn('Silent PDF download trigger:', e);
      }
    }

    const message = encodeURIComponent(buildShareText(sharingInvoice));
    let cleanMobile = (shareTarget || sharingInvoice.mobile || '').replace(/[^0-9]/g, '');
    if (cleanMobile.startsWith('0')) {
      cleanMobile = '880' + cleanMobile.slice(1);
    } else if (!cleanMobile.startsWith('880') && cleanMobile.length === 10) {
      cleanMobile = '880' + cleanMobile;
    }

    const waUrl = cleanMobile 
      ? `https://wa.me/${cleanMobile}?text=${message}` 
      : `https://wa.me/?text=${message}`;
    
    window.open(waUrl, '_blank');
    setDownloadSuccessToast('✓ PDF ফাইল ডাউনলোড হয়েছে এবং WhatsApp ওপেন করা হয়েছে! আপনি ফাইলটি সহজে চ্যাটে ড্রপ/সংযুক্ত করতে পারেন।');
    setTimeout(() => setDownloadSuccessToast(null), 6000);
  };

  // 🌟 Native Web Share API with Attached PDF File (Mobile WhatsApp / Gmail Direct Send)
  const handleNativeFileShare = async () => {
    if (!sharingInvoice) return;
    setIsSharingNative(true);
    try {
      const previewCanvas = document.getElementById('printable-invoice-canvas');
      if (!previewCanvas) {
        alert('অনুগ্রহ করে ইনভয়েসটি প্রিভিউ স্ক্রিনে ওপেন রাখুন');
        setIsSharingNative(false);
        return;
      }

      const res = await downloadInvoicePDF('printable-invoice-canvas', {
        invoiceNo: sharingInvoice.id,
        customerName: sharingInvoice.name,
        type: sharingInvoice.type,
        date: sharingInvoice.date
      });

      if (res.success && res.file) {
        const shared = await shareInvoiceFileNative(res.file, {
          title: `Rittika Event Management - ${sharingInvoice.id}`,
          text: buildShareText(sharingInvoice)
        });
        if (!shared) {
          // If navigator.share was cancelled or unsupported, fallback to WhatsApp web link
          handleDirectWhatsAppShareWithPdf();
        }
      } else {
        handleDirectWhatsAppShareWithPdf();
      }
    } catch (err) {
      console.error('Native share error:', err);
      handleDirectWhatsAppShareWithPdf();
    } finally {
      setIsSharingNative(false);
    }
  };

  // 🌟 Automated 1-Click PDF Download + Email Client
  const handleDirectEmailShareWithPdf = async () => {
    if (!sharingInvoice) return;
    
    const previewCanvas = document.getElementById('printable-invoice-canvas');
    if (previewCanvas) {
      try {
        await downloadInvoicePDF('printable-invoice-canvas', {
          invoiceNo: sharingInvoice.id,
          customerName: sharingInvoice.name,
          type: sharingInvoice.type,
          date: sharingInvoice.date
        });
      } catch (e) {
        console.warn('Silent PDF download error:', e);
      }
    }

    const emailTo = shareTarget || sharingInvoice.email || '';
    const subject = encodeURIComponent(`Rittika Event Management - ${sharingInvoice.type === 'quotations' ? 'বাজেট কোটেশন' : 'ইনভয়েস বিল'} #${sharingInvoice.id}`);
    const body = encodeURIComponent(buildShareText(sharingInvoice) + `\n\n(অফিসিয়াল PDF ফাইলটি আপনার ডিভাইসে ডাউনলোড হয়েছে, অনুগ্রহ করে ইমেইলে এটাচ করুন)`);
    
    const mailtoUrl = `mailto:${emailTo}?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;

    setDownloadSuccessToast('✓ PDF ফাইল ডাউনলোড হয়েছে এবং ইমেইল ক্লায়েন্ট ওপেন হয়েছে!');
    setTimeout(() => setDownloadSuccessToast(null), 5000);
  };

  // Standard submit router
  const handleShareSubmit = () => {
    if (!sharingInvoice) return;
    if (shareMethod === 'whatsapp') {
      handleDirectWhatsAppShareWithPdf();
    } else {
      handleDirectEmailShareWithPdf();
    }
  };

  return (
    <div className="space-y-8" id="invoice-hub-tab">
      
      {/* 🌟 Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-4 no-print">
        <div>
          <h2 className="text-2xl font-black uppercase italic text-black">ইনভয়েস হাব ও কোটেশন সেন্টার (Invoices & Quotation Center)</h2>
          <p className="text-sm font-bold text-slate-700 mt-1">পদ্ধতিগতভাবে ইভেন্ট বাজেট কোটেশন, বিক্রয়, ক্রয়, ভাড়া ও ইভেন্ট বিল তৈরি, প্রিন্ট ও হোয়াটসঅ্যাপে শেয়ার করুন।</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'quotations' && (
            <button
              onClick={handleOpenNewQuotation}
              className="neo-btn px-4 py-2 text-xs flex items-center gap-1.5 bg-yellow-400 font-black uppercase shadow-[2px_2px_0px_0px_#000000]"
            >
              <PlusCircle size={14} />
              নতুন বাজেট কোটেশন
            </button>
          )}
          <button
            onClick={() => setIsSignOpen(true)}
            className="neo-btn px-4 py-2 text-xs flex items-center gap-1.5 bg-white hover:bg-slate-50 font-black uppercase shadow-[2px_2px_0px_0px_#000000]"
          >
            <PenTool size={14} />
            ডিজিটাল সিগনেচার
          </button>
        </div>
      </div>

      {/* 🌟 Tab Selector Header */}
      <div className="flex overflow-x-auto border-b-4 border-black gap-2 no-print" id="invoice-tabs">
        {[
          { id: 'all-saved-invoices', label: 'সংরক্ষিত সকল ইনভয়েস আর্কাইভ (Archive & Edit)', icon: Folder, badge: quotations.length + purchaseInvoices.length + salesInvoices.length + rentalInvoices.length + eventInvoices.length },
          { id: 'quotations', label: 'বাজেট কোটেশন ও এস্টিমেট', icon: Calculator, badge: quotations.length },
          { id: 'event-invoices', label: 'ইভেন্ট বিল ও চালান', icon: FileText, badge: eventInvoices.length },
          { id: 'sales-invoices', label: 'বিক্রয় ইনভয়েস (Sales)', icon: FileText, badge: salesInvoices.length },
          { id: 'rental-invoices', label: 'ভাড়া ইনভয়েস (Rental)', icon: FileText, badge: rentalInvoices.length },
          { id: 'purchase-invoices', label: 'Supplier ক্রয় ইনভয়েস', icon: FileSpreadsheet, badge: purchaseInvoices.length },
          { id: 'document-center', label: 'ডকুমেন্ট ও মিডিয়া সেন্টার', icon: Layers }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setPreviewInvoice(null);
                setIsCreatingQuotation(false);
              }}
              className={`px-4 py-2.5 font-black text-xs uppercase tracking-wider border-x-3 border-t-3 border-black transition cursor-pointer shrink-0 relative -bottom-[4px] flex items-center gap-1.5 ${
                isActive 
                  ? 'bg-yellow-400 text-black' 
                  : 'bg-white text-slate-600 hover:text-black border-b-3 border-b-black'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${isActive ? 'bg-black text-yellow-400' : 'bg-slate-200 text-slate-800'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 🌟 SHARED DATALISTS FOR FLEXIBLE INPUT ACROSS ALL FORMS */}
      <datalist id="dl-quotation-categories">
        {CATEGORY_PRESETS.map(cat => (
          <option key={cat} value={cat} />
        ))}
      </datalist>

      <datalist id="dl-units">
        <option value="পিস" />
        <option value="টি" />
        <option value="সেট" />
        <option value="ফিট" />
        <option value="গজ" />
        <option value="স্কয়ার ফিট" />
        <option value="কেজি" />
        <option value="লিটার" />
        <option value="দিন" />
        <option value="ঘণ্টা" />
        <option value="বান্ডিল" />
        <option value="রোল" />
        <option value="প্যাকেট" />
        <option value="বস্তা" />
        <option value="বক্স" />
        <option value="জোড়া" />
      </datalist>

      <datalist id="dl-stock-items">
        {stockItems.map(st => (
          <option key={st.code} value={st.name}>
            [{st.category}] ৳{st.rentalPrice || st.sellingPrice || 0}
          </option>
        ))}
      </datalist>

      <datalist id="dl-customers">
        {customers.map(c => (
          <option key={c.id} value={c.name}>
            {c.mobile} - {c.address || ''}
          </option>
        ))}
      </datalist>

      <datalist id="dl-payment-methods">
        <option value="বিকাশ (bKash)" />
        <option value="নগদ (Cash)" />
        <option value="নগদ অনলাইন (Nagad)" />
        <option value="রকেট (Rocket)" />
        <option value="উপায় (Upay)" />
        <option value="ব্যাংক ট্রান্সফার (Bank)" />
        <option value="চেক (Cheque)" />
        <option value="বকেয়া (Due - Pending)" />
        <option value="কার্ড (Card / POS)" />
      </datalist>

      {/* 🌟 CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="invoice-hub-content-area">
        
        {/* LEFT COLUMN: Controls / Forms / Folder list */}
        <div className="lg:col-span-4 space-y-6 no-print">
          
          {/* Active Tab: All Saved Invoices Archive Left Panel */}
          {activeTab === 'all-saved-invoices' && (
            <div className="space-y-4">
              <div className="neo-card p-5 space-y-4 bg-yellow-50 border-2 border-black">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                    <Folder size={16} className="text-yellow-600" />
                    ইনভয়েস আর্কাইভ কন্ট্রোল
                  </h3>
                  <span className="text-[10px] bg-black text-yellow-400 px-2 py-0.5 font-mono font-black rounded">
                    {toBengaliNumber(quotations.length + purchaseInvoices.length + salesInvoices.length + rentalInvoices.length + eventInvoices.length)} টি মোট
                  </span>
                </div>
                
                <p className="text-xs font-bold text-slate-700 leading-relaxed">
                  সবধরনের তৈরি ও সংরক্ষিত ইনভয়েস, কোটেশন, বিল ও চালান এক নজরে দেখুন, প্রিভিউ ও প্রিন্ট করুন, এডিট বা কাস্টমাইজ করুন এবং হোয়াটসঅ্যাপে পাঠান।
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleOpenNewQuotation}
                    className="neo-btn py-2 text-[11px] flex items-center justify-center gap-1.5 bg-yellow-400 text-black font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] hover:bg-yellow-300"
                  >
                    <PlusCircle size={13} />
                    নতুন কোটেশন
                  </button>
                  <button
                    onClick={() => handleOpenFinalInvoice()}
                    className="neo-btn py-2 text-[11px] flex items-center justify-center gap-1.5 bg-teal-400 text-black font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] hover:bg-teal-300"
                  >
                    <Sparkles size={13} />
                    ফাইনাল বিল
                  </button>
                </div>
              </div>

              {/* Archive Category Filter Pills */}
              <div className="neo-card p-4 space-y-3 bg-white border-2 border-black">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5 flex items-center justify-between">
                  <span>ইনভয়েস ধরন অনুযায়ী ফিল্টার</span>
                  <span className="text-[10px] text-slate-500 font-bold font-mono">
                    {toBengaliNumber(
                      (archiveFilterType === 'all' 
                        ? quotations.length + purchaseInvoices.length + salesInvoices.length + rentalInvoices.length + eventInvoices.length
                        : archiveFilterType === 'quotations' ? quotations.length
                        : archiveFilterType === 'event' ? eventInvoices.length
                        : archiveFilterType === 'sales' ? salesInvoices.length
                        : archiveFilterType === 'rental' ? rentalInvoices.length
                        : purchaseInvoices.length)
                    )} টি
                  </span>
                </h4>
                
                <div className="space-y-1.5">
                  {[
                    { id: 'all', label: 'সকল সংরক্ষিত ইনভয়েস ও মেমো', count: quotations.length + purchaseInvoices.length + salesInvoices.length + rentalInvoices.length + eventInvoices.length },
                    { id: 'quotations', label: 'বাজেট কোটেশন ও এস্টিমেট', count: quotations.length },
                    { id: 'event', label: 'ইভেন্ট বিল ও ফাইনাল ইনভয়েস', count: eventInvoices.length },
                    { id: 'sales', label: 'সরাসরি বিক্রয় ইনভয়েস (Sales)', count: salesInvoices.length },
                    { id: 'rental', label: 'মালামাল ভাড়া ইনভয়েস (Rental)', count: rentalInvoices.length },
                    { id: 'purchase', label: 'সাপ্লায়ার ক্রয় চালান (Purchase)', count: purchaseInvoices.length },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setArchiveFilterType(f.id as any)}
                      className={`w-full text-left px-3 py-2 text-xs font-black border-2 border-black flex items-center justify-between transition cursor-pointer ${
                        archiveFilterType === f.id
                          ? 'bg-yellow-400 text-black shadow-[2px_2px_0px_0px_#000000]'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span>{f.label}</span>
                      <span className="font-mono text-[10px] bg-black text-white px-1.5 py-0.5 rounded">
                        {toBengaliNumber(f.count)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div className="neo-card p-4 space-y-3 bg-white border-2 border-black">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5">
                  পেমেন্ট স্ট্যাটাস ফিল্টার
                </h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'all', label: 'সব স্ট্যাটাস' },
                    { id: 'paid', label: 'পরিশোধিত (Paid)' },
                    { id: 'due', label: 'বকেয়া (Due)' },
                    { id: 'converted', label: 'কনভার্টেড ইভেন্ট' }
                  ].map(st => (
                    <button
                      key={st.id}
                      onClick={() => setArchiveFilterStatus(st.id as any)}
                      className={`px-2 py-1.5 text-[11px] font-black border border-black rounded text-center transition cursor-pointer ${
                        archiveFilterStatus === st.id
                          ? 'bg-slate-900 text-amber-400'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Financial Overall Summary */}
              <div className="neo-card p-4 space-y-3 bg-white border-2 border-black">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <DollarSign size={14} />
                  আর্থিক সার্বিক হিসাব
                </h4>
                <div className="space-y-2 text-xs font-bold">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">মোট কোটেশন বাজেট:</span>
                    <span className="font-mono font-black text-indigo-700">
                      {formatCurrency(quotations.reduce((acc, q) => acc + q.grandTotal, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">মোট বিক্রয় বিল:</span>
                    <span className="font-mono font-black text-emerald-700">
                      {formatCurrency(salesInvoices.reduce((acc, s) => acc + s.grandTotal, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">মোট ভাড়া বিল:</span>
                    <span className="font-mono font-black text-amber-700">
                      {formatCurrency(rentalInvoices.reduce((acc, r) => acc + r.totalBill, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-100 pt-1.5">
                    <span className="text-slate-600">মোট সাপ্লায়ার ক্রয়:</span>
                    <span className="font-mono font-black text-rose-700">
                      {formatCurrency(purchaseInvoices.reduce((acc, p) => acc + p.totalAmount, 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Tab: Quotations Left Panel */}
          {activeTab === 'quotations' && (
            <div className="space-y-4">
              <div className="neo-card p-5 space-y-4 bg-yellow-50 border-2 border-black">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                    <Calculator size={16} className="text-yellow-600" />
                    বাজেট কোটেশন কন্ট্রোল
                  </h3>
                  <span className="text-[10px] bg-black text-yellow-400 px-2 py-0.5 font-mono font-black rounded">
                    {toBengaliNumber(quotations.length)} টি
                  </span>
                </div>
                
                <p className="text-xs font-bold text-slate-700 leading-relaxed">
                  গ্রাহকের যেকোনো ইভেন্টের জন্য কাস্টম ক্যাটাগরি, আইটেম ও মালামাল যোগ করে <strong>আনুমানিক (Estimated)</strong> বা <strong>ফিক্সড (Fixed)</strong> বাজেট কোটেশন ইনভয়েস বিল জেনারেট করুন।
                </p>

                <button
                  onClick={handleOpenNewQuotation}
                  className="w-full neo-btn py-2.5 text-xs flex items-center justify-center gap-2 bg-yellow-400 text-black font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:bg-yellow-300"
                >
                  <PlusCircle size={15} />
                  + নতুন কোটেশন তৈরি করুন
                </button>

                <button
                  onClick={() => handleOpenFinalInvoice()}
                  className="w-full neo-btn py-2.5 text-xs flex items-center justify-center gap-2 bg-teal-400 text-black font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:bg-teal-300"
                  title="ইভেন্ট শেষ হওয়ার পর অতিরিক্ত কাজ ও অগ্রিম সমন্বয়ে ফাইনাল বিল করুন"
                >
                  <Sparkles size={15} />
                  ⚡ ফাইনাল ইভেন্ট বিল জেনারেট
                </button>
              </div>

              {/* Quotation Stats Summary */}
              <div className="neo-card p-4 space-y-3 bg-white border-2 border-black">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <FileSpreadsheet size={13} />
                  কোটেশন সারসংক্ষেপ
                </h4>
                <div className="space-y-2 text-xs font-bold">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">মোট প্রস্তাবিত বাজেট:</span>
                    <span className="font-black text-indigo-700 font-mono">
                      {formatCurrency(quotations.reduce((acc, q) => acc + q.grandTotal, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Clock size={12} className="text-amber-500" />
                      আনুমানিক কোটেশন:
                    </span>
                    <span className="font-mono font-black text-amber-700">
                      {toBengaliNumber(quotations.filter(q => q.budgetType === 'Estimated').length)} টি
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 flex items-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-500" />
                      ফিক্সড বাজেট কোটেশন:
                    </span>
                    <span className="font-mono font-black text-emerald-700">
                      {toBengaliNumber(quotations.filter(q => q.budgetType === 'Fixed').length)} টি
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-100 pt-1.5">
                    <span className="text-slate-600 flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-teal-600" />
                      কনভার্টেড ইভেন্ট:
                    </span>
                    <span className="font-mono font-black text-teal-700">
                      {toBengaliNumber(quotations.filter(q => q.status === 'Converted').length)} টি
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Filter selector */}
              <div className="neo-card p-4 space-y-3 bg-white border-2 border-black">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5">
                  ফিল্টার ক্যাটাগরি
                </h4>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500">বাজেটের ধরণ:</label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'All', label: 'সব' },
                      { id: 'Estimated', label: 'আনুমানিক' },
                      { id: 'Fixed', label: 'ফিক্সড' }
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => setQuotationFilterBudgetType(type.id as any)}
                        className={`py-1.5 text-[11px] font-black border border-black text-center ${
                          quotationFilterBudgetType === type.id ? 'bg-yellow-400 text-black font-black' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">স্ট্যাটাস:</label>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { id: 'All', label: 'সব স্ট্যাটাস' },
                      { id: 'Draft', label: 'খসড়া (Draft)' },
                      { id: 'Sent', label: 'প্রেরিত (Sent)' },
                      { id: 'Converted', label: 'ইভেন্ট কনফার্মড' }
                    ].map(st => (
                      <button
                        key={st.id}
                        onClick={() => setQuotationFilterStatus(st.id as any)}
                        className={`py-1.5 text-[10px] font-black border border-black text-center ${
                          quotationFilterStatus === st.id ? 'bg-black text-yellow-400' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Tab: Document Center & Media Storage */}
          {activeTab === 'document-center' && (
            <div className="space-y-4" id="folders-navigation">
              <h3 className="text-sm font-black uppercase tracking-wider text-black">ফোল্ডার তালিকা (Folders)</h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'quotations', label: 'Event Budget Quotations', count: quotations.length, color: 'bg-yellow-100 border-yellow-500' },
                  { id: 'purchase', label: 'Purchase Invoices', count: purchaseInvoices.length, color: 'bg-indigo-100 border-indigo-500' },
                  { id: 'sales', label: 'Sales Invoices', count: salesInvoices.length, color: 'bg-emerald-100 border-emerald-500' },
                  { id: 'rental', label: 'Rental Agreements', count: rentalInvoices.length, color: 'bg-amber-100 border-amber-500' },
                  { id: 'event', label: 'Event Contracts & Bills', count: eventInvoices.length, color: 'bg-teal-100 border-teal-500' },
                  { id: 'customer', label: 'Customer Documents', count: attachments.filter(a => a.type === 'Receipt' || a.type === 'Contract').length, color: 'bg-pink-100 border-pink-500' },
                  { id: 'nid', label: 'NID Copies', count: attachments.filter(a => a.type === 'NID').length, color: 'bg-rose-100 border-rose-500' },
                  { id: 'photos', label: 'Event Photos & Gallery', count: attachments.filter(a => a.type === 'Photo').length, color: 'bg-purple-100 border-purple-500' }
                ].map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id as FolderType)}
                    className={`w-full text-left p-3 border-2 border-black flex items-center justify-between transition cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                      selectedFolder === folder.id ? 'bg-yellow-400 italic font-black' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Folder size={16} className={selectedFolder === folder.id ? 'fill-black' : 'text-slate-600'} />
                      <span className="text-xs font-bold uppercase">{folder.label}</span>
                    </div>
                    <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded font-mono font-black">{folder.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Tab: Purchase Invoices */}
          {activeTab === 'purchase-invoices' && (
            <div className="neo-card p-5 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-black">ক্রয় ইনভয়েস ম্যানেজমেন্ট</h3>
              <p className="text-xs font-bold text-slate-700">নতুন মালামাল ক্রয়ের সময় সরবরাহকারীর দেওয়া চালান বা রসিদ আপলোড এবং এন্ট্রি করে রাখুন।</p>
              <button
                onClick={() => setIsAddPurchaseOpen(true)}
                className="w-full neo-btn neo-btn-primary py-2 text-xs flex items-center justify-center gap-1.5 bg-indigo-500 text-white"
              >
                <Plus size={14} />
                নতুন ক্রয় চালান যোগ করুন
              </button>
            </div>
          )}

          {/* Active Tab: Sales Invoices */}
          {activeTab === 'sales-invoices' && (
            <div className="neo-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-black">বিক্রয় ইনভয়েস জেনারেটর</h3>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 border border-black px-1.5 py-0.5 rounded">Sales</span>
              </div>

              {/* Mode Toggle */}
              <div className="grid grid-cols-2 gap-1 border-2 border-black p-1 bg-slate-100">
                <button
                  type="button"
                  onClick={() => setSalesInvoiceMode('existing')}
                  className={`py-1.5 text-[11px] font-black uppercase transition ${
                    salesInvoiceMode === 'existing' ? 'bg-emerald-400 text-black border border-black shadow-[1px_1px_0px_0px_#000]' : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  তালিকা থেকে নির্বাচন
                </button>
                <button
                  type="button"
                  onClick={() => setSalesInvoiceMode('custom')}
                  className={`py-1.5 text-[11px] font-black uppercase transition ${
                    salesInvoiceMode === 'custom' ? 'bg-emerald-400 text-black border border-black shadow-[1px_1px_0px_0px_#000]' : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  + কাস্টম এন্ট্রি
                </button>
              </div>

              {salesInvoiceMode === 'existing' ? (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-700">বিক্রয় তালিকা থেকে সিলেক্ট করে অটোমেটিক কাস্টমাইজড ইনভয়েস তৈরি করুন।</p>
                  <div>
                    <label className="text-[11px] font-black uppercase block mb-1">বিক্রয় রেকর্ড নির্বাচন করুন</label>
                    <select
                      value={selectedSaleId}
                      onChange={(e) => setSelectedSaleId(e.target.value)}
                      className="w-full bg-white border-2 border-black p-2 text-xs font-bold"
                    >
                      <option value="">নির্বাচন করুন...</option>
                      {sales.map(s => {
                        const c = customers.find(cust => cust.id === s.customerId);
                        const item = stockItems.find(st => st.code === s.itemCode);
                        return (
                          <option key={s.id} value={s.id}>
                            {s.date} - {c ? c.name : 'Unknown'} ({item ? item.name : s.itemCode} x {s.qty})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase block mb-1">ডিসকাউন্ট দিন (টাকা)</label>
                    <input
                      type="number"
                      value={salesDiscount}
                      onChange={(e) => setSalesDiscount(Number(e.target.value))}
                      className="w-full bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                      placeholder="0"
                    />
                  </div>

                  <button
                    onClick={handleAutoGenerateSalesInvoice}
                    disabled={!selectedSaleId}
                    className="w-full neo-btn py-2 text-xs font-black uppercase bg-emerald-400 border-2 border-black shadow-[2px_2px_0px_0px_#000000] disabled:opacity-50"
                  >
                    ইনভয়েস জেনারেট করুন
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateCustomSalesInvoice} className="space-y-2.5 text-xs font-bold">
                  <p className="text-xs font-bold text-slate-700">ড্রপডাউন ছাড়াও সম্পূর্ণ কাস্টম গ্রাহক ও বিক্রয় তথ্য দিয়ে সরাসরি ইনভয়েস তৈরি করুন:</p>
                  
                  <div>
                    <label className="text-[10px] font-black uppercase block mb-0.5">তারিখ (Date)</label>
                    <input
                      type="date"
                      value={customSaleDate}
                      onChange={(e) => setCustomSaleDate(e.target.value)}
                      className="w-full bg-white border-2 border-black p-1.5"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase block mb-0.5">গ্রাহকের নাম (Customer Name)</label>
                    <input
                      type="text"
                      list="common-customer-names-list"
                      required
                      placeholder="যেমন: রবিন কুমার / কাস্টম নাম"
                      value={customSaleCustomerName}
                      onChange={(e) => setCustomSaleCustomerName(e.target.value)}
                      className="w-full bg-white border-2 border-black p-1.5"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-0.5">মোবাইল নম্বর</label>
                      <input
                        type="text"
                        placeholder="০১৭xxxxxxxx"
                        value={customSaleCustomerMobile}
                        onChange={(e) => setCustomSaleCustomerMobile(e.target.value)}
                        className="w-full bg-white border-2 border-black p-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-0.5">ঠিকানা</label>
                      <input
                        type="text"
                        placeholder="ভেড়ামারা, কুষ্টিয়া"
                        value={customSaleCustomerAddress}
                        onChange={(e) => setCustomSaleCustomerAddress(e.target.value)}
                        className="w-full bg-white border-2 border-black p-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase block mb-0.5">বিক্রিত সামগ্রী / আইটেমের নাম</label>
                    <input
                      type="text"
                      list="common-stock-items-list"
                      required
                      placeholder="যেমন: এলইডি পার লাইট / ক্রিস্টাল সেট"
                      value={customSaleItemName}
                      onChange={(e) => setCustomSaleItemName(e.target.value)}
                      className="w-full bg-white border-2 border-black p-1.5"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-0.5">পরিমাণ</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={customSaleQty}
                        onChange={(e) => setCustomSaleQty(Number(e.target.value))}
                        className="w-full bg-white border-2 border-black p-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-0.5">একক</label>
                      <input
                        type="text"
                        list="common-units-list"
                        value={customSaleUnit}
                        onChange={(e) => setCustomSaleUnit(e.target.value)}
                        className="w-full bg-white border-2 border-black p-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-0.5">দর (Rate)</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={customSaleRate}
                        onChange={(e) => setCustomSaleRate(Number(e.target.value))}
                        className="w-full bg-white border-2 border-black p-1.5 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase block mb-0.5">ডিসকাউন্ট / ছাড় (টাকা)</label>
                    <input
                      type="number"
                      min="0"
                      value={customSaleDiscount}
                      onChange={(e) => setCustomSaleDiscount(Number(e.target.value))}
                      className="w-full bg-white border-2 border-black p-1.5 font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] font-black uppercase block">ডকুমেন্ট / মেমো ছবি আপলোড (Multiple Files)</label>
                      <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">
                        একাধিক ছবি সাপোর্ট
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      multiple
                      onChange={handleSalesFileUpload}
                      className="w-full bg-white border-2 border-black p-1 text-[11px] cursor-pointer"
                    />
                    {customSaleFiles.length > 0 && (
                      <div className="mt-1.5 space-y-1">
                        <p className="text-[10px] font-black text-emerald-800">
                          ✓ মোট {customSaleFiles.length} টি ফাইল সংযুক্ত:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {customSaleFiles.map((sf, idx) => (
                            <span key={idx} className="text-[10px] bg-emerald-50 border border-emerald-300 text-emerald-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <span className="max-w-[100px] truncate">{sf.name}</span>
                              <button
                                type="button"
                                onClick={() => setCustomSaleFiles(prev => prev.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:text-red-700 font-bold text-xs"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-2 bg-emerald-50 border border-emerald-300 flex justify-between items-center text-xs font-black">
                    <span>মোট বিল:</span>
                    <span className="font-mono text-emerald-800 text-sm">
                      {formatCurrency(Math.max(0, (customSaleQty * customSaleRate) - customSaleDiscount))}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full neo-btn py-2 text-xs font-black uppercase bg-emerald-400 border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:bg-emerald-300"
                  >
                    + কাস্টম বিক্রয় ইনভয়েস সংরক্ষণ
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Active Tab: Rental Invoices */}
          {activeTab === 'rental-invoices' && (
            <div className="neo-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-black">ভাড়া ইনভয়েস জেনারেটর</h3>
                <span className="text-[10px] font-black bg-amber-100 text-amber-900 border border-black px-1.5 py-0.5 rounded">Rental</span>
              </div>

              {/* Mode Toggle */}
              <div className="grid grid-cols-2 gap-1 border-2 border-black p-1 bg-slate-100">
                <button
                  type="button"
                  onClick={() => setRentalInvoiceMode('existing')}
                  className={`py-1.5 text-[11px] font-black uppercase transition ${
                    rentalInvoiceMode === 'existing' ? 'bg-amber-400 text-black border border-black shadow-[1px_1px_0px_0px_#000]' : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  তালিকা থেকে নির্বাচন
                </button>
                <button
                  type="button"
                  onClick={() => setRentalInvoiceMode('custom')}
                  className={`py-1.5 text-[11px] font-black uppercase transition ${
                    rentalInvoiceMode === 'custom' ? 'bg-amber-400 text-black border border-black shadow-[1px_1px_0px_0px_#000]' : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  + কাস্টম এন্ট্রি
                </button>
              </div>

              {rentalInvoiceMode === 'existing' ? (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-700">ভাড়ার রেকর্ড থেকে সিকিউরিটি ডিপোজিট, লেবার এবং ট্রান্সপোর্ট চার্জসহ প্রফেশনাল ইনভয়েস জেনারেট করুন।</p>

                  <div>
                    <label className="text-[11px] font-black uppercase block mb-1">ভাড়া রেকর্ড নির্বাচন করুন</label>
                    <select
                      value={selectedRentalId}
                      onChange={(e) => setSelectedRentalId(e.target.value)}
                      className="w-full bg-white border-2 border-black p-2 text-xs font-bold"
                    >
                      <option value="">নির্বাচন করুন...</option>
                      {rentals.map(r => {
                        const c = customers.find(cust => cust.id === r.customerId);
                        const item = stockItems.find(st => st.code === r.itemCode);
                        return (
                          <option key={r.id} value={r.id}>
                            {r.date} - {c ? c.name : 'Unknown'} ({item ? item.name : r.itemCode} x {r.qty})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase block mb-1">সিকিউরিটি ডিপোজিট (টাকা)</label>
                    <input
                      type="number"
                      value={securityDeposit}
                      onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                      className="w-full bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase block mb-1">গাড়ি ভাড়া / ট্রান্সপোর্ট খরচ</label>
                    <input
                      type="number"
                      value={transportCharge}
                      onChange={(e) => setTransportCharge(Number(e.target.value))}
                      className="w-full bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase block mb-1">লেবার / শ্রমিক খরচ</label>
                    <input
                      type="number"
                      value={labourCharge}
                      onChange={(e) => setLabourCharge(Number(e.target.value))}
                      className="w-full bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                    />
                  </div>

                  <button
                    onClick={handleAutoGenerateRentalInvoice}
                    disabled={!selectedRentalId}
                    className="w-full neo-btn py-2 text-xs font-black uppercase bg-amber-400 border-2 border-black shadow-[2px_2px_0px_0px_#000000] disabled:opacity-50"
                  >
                    ভাড়া ইনভয়েস জেনারেট করুন
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateCustomRentalInvoice} className="space-y-2.5 text-xs font-bold">
                  <p className="text-xs font-bold text-slate-700">ড্রপডাউন ছাড়াই যেকোনো গ্রাহক ও ভাড়ার মালামালের জন্য সরাসরি চালান তৈরি করুন:</p>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-0.5">চালানের তারিখ</label>
                      <input
                        type="date"
                        value={customRentalDate}
                        onChange={(e) => setCustomRentalDate(e.target.value)}
                        className="w-full bg-white border-2 border-black p-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-0.5">ইভেন্ট তারিখ</label>
                      <input
                        type="date"
                        value={customRentalEventDate}
                        onChange={(e) => setCustomRentalEventDate(e.target.value)}
                        className="w-full bg-white border-2 border-black p-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase block mb-0.5">গ্রাহকের নাম (Customer)</label>
                    <input
                      type="text"
                      list="common-customer-names-list"
                      required
                      placeholder="যেমন: রবিন কুমার / কাস্টম নাম"
                      value={customRentalCustomerName}
                      onChange={(e) => setCustomRentalCustomerName(e.target.value)}
                      className="w-full bg-white border-2 border-black p-1.5"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-0.5">মোবাইল</label>
                      <input
                        type="text"
                        placeholder="০১৭xxxxxxxx"
                        value={customRentalCustomerMobile}
                        onChange={(e) => setCustomRentalCustomerMobile(e.target.value)}
                        className="w-full bg-white border-2 border-black p-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-0.5">ইভেন্টের নাম / উপলক্ষ</label>
                      <input
                        type="text"
                        list="common-event-presets-list"
                        placeholder="যেমন: বিবাহ ডেকোরেশন"
                        value={customRentalEventName}
                        onChange={(e) => setCustomRentalEventName(e.target.value)}
                        className="w-full bg-white border-2 border-black p-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase block mb-0.5">ভাড়ার সামগ্রী / আইটেমের বিবরণ</label>
                    <input
                      type="text"
                      list="common-stock-items-list"
                      required
                      placeholder="যেমন: ভিআইপি সোফা সেট / সাউন্ড বক্স"
                      value={customRentalItemName}
                      onChange={(e) => setCustomRentalItemName(e.target.value)}
                      className="w-full bg-white border-2 border-black p-1.5"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-0.5">পরিমাণ</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={customRentalQty}
                        onChange={(e) => setCustomRentalQty(Number(e.target.value))}
                        className="w-full bg-white border-2 border-black p-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-0.5">একক</label>
                      <input
                        type="text"
                        list="common-units-list"
                        value={customRentalUnit}
                        onChange={(e) => setCustomRentalUnit(e.target.value)}
                        className="w-full bg-white border-2 border-black p-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-0.5">ভাড়া রেট (টাকা)</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={customRentalRate}
                        onChange={(e) => setCustomRentalRate(Number(e.target.value))}
                        className="w-full bg-white border-2 border-black p-1.5 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-0.5">ডিপোজিট</label>
                      <input
                        type="number"
                        min="0"
                        value={customRentalDeposit}
                        onChange={(e) => setCustomRentalDeposit(Number(e.target.value))}
                        className="w-full bg-white border-2 border-black p-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-0.5">পরিবহন ভাড়া</label>
                      <input
                        type="number"
                        min="0"
                        value={customRentalTransport}
                        onChange={(e) => setCustomRentalTransport(Number(e.target.value))}
                        className="w-full bg-white border-2 border-black p-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-0.5">লেবার চার্জ</label>
                      <input
                        type="number"
                        min="0"
                        value={customRentalLabour}
                        onChange={(e) => setCustomRentalLabour(Number(e.target.value))}
                        className="w-full bg-white border-2 border-black p-1.5 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] font-black uppercase block">চুক্তিপত্র / মালামাল ছবি আপলোড (Multiple Files)</label>
                      <span className="text-[9px] text-amber-800 font-bold bg-amber-50 px-1 py-0.5 rounded border border-amber-200">
                        একাধিক ছবি সাপোর্ট
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      multiple
                      onChange={handleRentalFileUpload}
                      className="w-full bg-white border-2 border-black p-1 text-[11px] cursor-pointer"
                    />
                    {customRentalFiles.length > 0 && (
                      <div className="mt-1.5 space-y-1">
                        <p className="text-[10px] font-black text-amber-900">
                          ✓ মোট {customRentalFiles.length} টি ফাইল সংযুক্ত:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {customRentalFiles.map((rf, idx) => (
                            <span key={idx} className="text-[10px] bg-amber-50 border border-amber-300 text-amber-900 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <span className="max-w-[100px] truncate">{rf.name}</span>
                              <button
                                type="button"
                                onClick={() => setCustomRentalFiles(prev => prev.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:text-red-700 font-bold text-xs"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-2 bg-amber-50 border border-amber-300 flex justify-between items-center text-xs font-black">
                    <span>মোট ভাড়া বিল:</span>
                    <span className="font-mono text-amber-900 text-sm">
                      {formatCurrency((customRentalQty * customRentalRate) + customRentalTransport + customRentalLabour)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full neo-btn py-2 text-xs font-black uppercase bg-amber-400 border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:bg-amber-300"
                  >
                    + কাস্টম ভাড়া ইনভয়েস সংরক্ষণ
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Active Tab: Event Invoices */}
          {activeTab === 'event-invoices' && (
            <div className="neo-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-black">ইভেন্ট বিলিং ও চালান</h3>
                <span className="text-[10px] font-black bg-teal-100 text-teal-900 border border-black px-1.5 py-0.5 rounded">Event</span>
              </div>

              {/* Mode Toggle */}
              <div className="grid grid-cols-2 gap-1 border-2 border-black p-1 bg-slate-100">
                <button
                  type="button"
                  onClick={() => setEventInvoiceMode('existing')}
                  className={`py-1.5 text-[11px] font-black uppercase transition ${
                    eventInvoiceMode === 'existing' ? 'bg-teal-400 text-black border border-black shadow-[1px_1px_0px_0px_#000]' : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  তালিকা থেকে নির্বাচন
                </button>
                <button
                  type="button"
                  onClick={() => setEventInvoiceMode('custom')}
                  className={`py-1.5 text-[11px] font-black uppercase transition ${
                    eventInvoiceMode === 'custom' ? 'bg-teal-400 text-black border border-black shadow-[1px_1px_0px_0px_#000]' : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  + কাস্টম এন্ট্রি
                </button>
              </div>

              {eventInvoiceMode === 'existing' ? (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-700">ইভেন্ট সম্পন্ন হওয়ার পর ডেকোরেশন প্যাকেজ এবং অতিরিক্ত মালামালসহ সম্পূর্ণ বিল জেনারেট করুন।</p>

                  <div>
                    <label className="text-[11px] font-black uppercase block mb-1">সম্পন্ন ইভেন্ট নির্বাচন করুন</label>
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="w-full bg-white border-2 border-black p-2 text-xs font-bold"
                    >
                      <option value="">নির্বাচন করুন...</option>
                      {events.map(ev => {
                        const c = customers.find(cust => cust.id === ev.customerId);
                        return (
                          <option key={ev.id} value={ev.id}>
                            {ev.name} ({c ? c.name : 'Unknown'}) - {ev.date}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase block mb-1">অতিরিক্ত খরচ (যদি থাকে)</label>
                    <input
                      type="number"
                      value={eventExtraCharge}
                      onChange={(e) => setEventExtraCharge(Number(e.target.value))}
                      className="w-full bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase block mb-1">অতিরিক্ত খরচের বিবরণ</label>
                    <textarea
                      value={eventExtraDetails}
                      onChange={(e) => setEventExtraDetails(e.target.value)}
                      className="w-full bg-white border-2 border-black p-2 text-xs font-bold"
                      rows={2}
                      placeholder="যেমন: অতিরিক্ত আলোকসজ্জা"
                    />
                  </div>

                  <button
                    onClick={handleAutoGenerateEventInvoice}
                    disabled={!selectedEventId}
                    className="w-full neo-btn py-2 text-xs font-black uppercase bg-teal-400 border-2 border-black shadow-[2px_2px_0px_0px_#000000] disabled:opacity-50"
                  >
                    ইভেন্ট ইনভয়েস জেনারেট করুন
                  </button>

                  <div className="pt-2 border-t border-slate-300">
                    <button
                      onClick={() => handleOpenFinalInvoice()}
                      className="w-full neo-btn py-2.5 text-xs font-black uppercase bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center gap-1.5 hover:bg-yellow-300"
                      title="সম্পন্ন ইভেন্টের অগ্রিম, অতিরিক্ত কাজ ও ক্ষতিপূরণ সমন্বয় করে ফাইনাল বিল বানান"
                    >
                      <Sparkles size={14} />
                      ⚡ সম্পূর্ণ ফাইনাল বিল বিল্ডার
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateCustomEventInvoice} className="space-y-2.5 text-xs font-bold">
                  <p className="text-xs font-bold text-slate-700">ড্রপডাউন ছাড়াই যেকোনো নতুন ইভেন্ট বা প্যাকেজের জন্য সরাসরি বিল তৈরি করুন:</p>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-0.5">বিলিং তারিখ</label>
                      <input
                        type="date"
                        value={customEventDate}
                        onChange={(e) => setCustomEventDate(e.target.value)}
                        className="w-full bg-white border-2 border-black p-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-0.5">ইভেন্ট সম্পন্ন তারিখ</label>
                      <input
                        type="date"
                        value={customEventEventDate}
                        onChange={(e) => setCustomEventEventDate(e.target.value)}
                        className="w-full bg-white border-2 border-black p-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase block mb-0.5">ইভেন্টের নাম (Event Name)</label>
                    <input
                      type="text"
                      list="common-event-presets-list"
                      required
                      placeholder="যেমন: গ্র্যান্ড ওয়েডিং রিসেপশন ২০২৬"
                      value={customEventName}
                      onChange={(e) => setCustomEventName(e.target.value)}
                      className="w-full bg-white border-2 border-black p-1.5"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-0.5">ক্লায়েন্টের নাম (Client)</label>
                      <input
                        type="text"
                        list="common-customer-names-list"
                        required
                        placeholder="যেমন: মো: কামরুল হাসান"
                        value={customEventCustomerName}
                        onChange={(e) => setCustomEventCustomerName(e.target.value)}
                        className="w-full bg-white border-2 border-black p-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-0.5">মোবাইল নম্বর</label>
                      <input
                        type="text"
                        placeholder="০১৭xxxxxxxx"
                        value={customEventCustomerMobile}
                        onChange={(e) => setCustomEventCustomerMobile(e.target.value)}
                        className="w-full bg-white border-2 border-black p-1.5 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase block mb-0.5">ভেন্যু / লোকেশন (Venue)</label>
                    <input
                      type="text"
                      list="common-venue-presets-list"
                      placeholder="যেমন: ভেড়ামারা কমিউনিটি সেন্টার"
                      value={customEventVenue}
                      onChange={(e) => setCustomEventVenue(e.target.value)}
                      className="w-full bg-white border-2 border-black p-1.5"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase block mb-0.5">ডেকোরেশন প্যাকেজ / সেবার বিবরণ</label>
                    <input
                      type="text"
                      placeholder="যেমন: প্রিমিয়াম স্টেজ, এন্ট্রি গেট, ফ্লাওয়ার ও লাইটিং"
                      value={customEventPackage}
                      onChange={(e) => setCustomEventPackage(e.target.value)}
                      className="w-full bg-white border-2 border-black p-1.5"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-0.5">মূল বাজেট</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={customEventBudget}
                        onChange={(e) => setCustomEventBudget(Number(e.target.value))}
                        className="w-full bg-white border-2 border-black p-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-0.5">পরিবহন খরচ</label>
                      <input
                        type="number"
                        min="0"
                        value={customEventTransport}
                        onChange={(e) => setCustomEventTransport(Number(e.target.value))}
                        className="w-full bg-white border-2 border-black p-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-0.5">লেবার খরচ</label>
                      <input
                        type="number"
                        min="0"
                        value={customEventLabour}
                        onChange={(e) => setCustomEventLabour(Number(e.target.value))}
                        className="w-full bg-white border-2 border-black p-1.5 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-0.5">অতিরিক্ত চার্জ (Extra)</label>
                      <input
                        type="number"
                        min="0"
                        value={customEventExtraCharge}
                        onChange={(e) => setCustomEventExtraCharge(Number(e.target.value))}
                        className="w-full bg-white border-2 border-black p-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase block mb-0.5">অতিরিক্ত বিবরণ</label>
                      <input
                        type="text"
                        placeholder="যেমন: এক্সট্রা ফ্লাওয়ার"
                        value={customEventExtraDetails}
                        onChange={(e) => setCustomEventExtraDetails(e.target.value)}
                        className="w-full bg-white border-2 border-black p-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] font-black uppercase block">ইভেন্ট সাইট / ডেকোরেশন ছবি আপলোড (Multiple Files)</label>
                      <span className="text-[9px] text-teal-800 font-bold bg-teal-50 px-1 py-0.5 rounded border border-teal-200">
                        একাধিক ছবি সাপোর্ট
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      multiple
                      onChange={handleEventFileUpload}
                      className="w-full bg-white border-2 border-black p-1 text-[11px] cursor-pointer"
                    />
                    {customEventFiles.length > 0 && (
                      <div className="mt-1.5 space-y-1">
                        <p className="text-[10px] font-black text-teal-900">
                          ✓ মোট {customEventFiles.length} টি ফাইল সংযুক্ত:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {customEventFiles.map((ef, idx) => (
                            <span key={idx} className="text-[10px] bg-teal-50 border border-teal-300 text-teal-900 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <span className="max-w-[100px] truncate">{ef.name}</span>
                              <button
                                type="button"
                                onClick={() => setCustomEventFiles(prev => prev.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:text-red-700 font-bold text-xs"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-2 bg-teal-50 border border-teal-300 flex justify-between items-center text-xs font-black">
                    <span>মোট ইভেন্ট বিল:</span>
                    <span className="font-mono text-teal-900 text-sm">
                      {formatCurrency(customEventBudget + customEventTransport + customEventLabour + customEventExtraCharge)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full neo-btn py-2 text-xs font-black uppercase bg-teal-400 border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:bg-teal-300"
                  >
                    + কাস্টম ইভেন্ট ইনভয়েস সংরক্ষণ
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Results explorer / Invoices list / Quotation Form Builder / Stunning Live PDF Preview Layout */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Preview Frame! If there is an active preview, show the stunning official styled Invoice/Quotation! */}
          {previewInvoice ? (
            <div className="space-y-4" id="active-invoice-renderer">
              {/* Toolbar */}
              <div className="space-y-2 no-print">
                <div className="flex items-center justify-between border-2 border-black p-3 bg-slate-100 shadow-[2px_2px_0px_0px_#000000] flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewInvoice(null)}
                      className="neo-btn px-3 py-1.5 text-xs bg-white flex items-center gap-1 font-bold shadow-[1px_1px_0px_0px_#000000]"
                    >
                      ← ফিরে যান
                    </button>
                    <span className="text-xs font-black text-black font-mono">
                      {previewInvoice.type === 'quotations' 
                        ? `কোটেশন নং: ${previewInvoice.data.quotationNo}` 
                        : `ইনভয়েস নং: ${previewInvoice.data.invoiceNo || previewInvoice.data.purchaseNo}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setIsSignOpen(true)}
                      className="neo-btn px-3 py-1.5 text-xs bg-white hover:bg-slate-50 flex items-center gap-1.5 font-black uppercase shadow-[1px_1px_0px_0px_#000000]"
                      title="স্বাক্ষর, সিলমোহর ও স্ট্যাম্প কাস্টমাইজ করুন"
                    >
                      <Stamp size={13} className="text-blue-700" />
                      স্বাক্ষর ও সিলমোহর
                    </button>
                    {previewInvoice.type === 'quotations' && (
                      <button
                        onClick={() => handleOpenFinalInvoice(previewInvoice.data)}
                        className="neo-btn px-3 py-1.5 text-xs bg-amber-400 flex items-center gap-1.5 font-black uppercase shadow-[1px_1px_0px_0px_#000000] hover:bg-amber-300"
                        title="ইভেন্ট সম্পন্ন করার পর ফাইনাল ইনভয়েস বিল জেনারেট করুন"
                      >
                        <Sparkles size={13} />
                        ⚡ ফাইনাল বিল জেনারেট
                      </button>
                    )}
                    {previewInvoice.type === 'quotations' && previewInvoice.data.status !== 'Converted' && (
                      <button
                        onClick={() => {
                          if (window.confirm('আপনি কি এই কোটেশনটিকে কনফার্মড ইভেন্টে রূপান্তর করতে চান?')) {
                            if (onConvertQuotationToEvent) {
                              onConvertQuotationToEvent(previewInvoice.data);
                            }
                            setPreviewInvoice({
                              ...previewInvoice,
                              data: { ...previewInvoice.data, status: 'Converted' }
                            });
                          }
                        }}
                        className="neo-btn px-3 py-1.5 text-xs bg-emerald-400 flex items-center gap-1.5 font-black uppercase shadow-[1px_1px_0px_0px_#000000] hover:bg-emerald-300"
                      >
                        <CheckCircle2 size={13} />
                        ⚡ ইভেন্টে রূপান্তর করুন
                      </button>
                    )}
                    <button
                      onClick={handleDirectPdfDownload}
                      disabled={isDownloadingPdf}
                      className="neo-btn px-3.5 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 font-black uppercase shadow-[1px_1px_0px_0px_#000000] cursor-pointer disabled:opacity-50"
                      title="ডাইরেক্ট হাই-কোয়ালিটি PDF ফাইল হিসেবে ডাউনলোড করুন"
                    >
                      {isDownloadingPdf ? (
                        <Loader2 size={13} className="animate-spin text-amber-300" />
                      ) : (
                        <Download size={13} className="text-amber-300" />
                      )}
                      <span>{isDownloadingPdf ? 'PDF তৈরি হচ্ছে...' : 'সরাসরি PDF ডাউনলোড'}</span>
                    </button>

                    <button
                      onClick={handleDirectImgDownload}
                      disabled={isDownloadingImg}
                      className="neo-btn px-3 py-1.5 text-xs bg-amber-400 hover:bg-amber-300 text-black flex items-center gap-1.5 font-black uppercase shadow-[1px_1px_0px_0px_#000000] cursor-pointer disabled:opacity-50"
                      title="HD ইমেজ (JPG) ফরম্যাটে ডাউনলোড করুন"
                    >
                      {isDownloadingImg ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <ImageIcon size={13} />
                      )}
                      <span>{isDownloadingImg ? 'ছবি তৈরি...' : 'HD ছবি ডাউনলোড'}</span>
                    </button>

                    <button
                      onClick={handlePrint}
                      className="neo-btn px-3 py-1.5 text-xs bg-white hover:bg-slate-50 flex items-center gap-1.5 font-black uppercase shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                      title="ব্রাউজার প্রিন্টার উইন্ডো ওপেন করুন"
                    >
                      <Printer size={13} />
                      <span>প্রিন্ট করুন</span>
                    </button>

                    <button
                      onClick={() => triggerShare(previewInvoice.data, previewInvoice.type as any)}
                      className="neo-btn px-3.5 py-1.5 text-xs bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1.5 font-black uppercase shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                      title="WhatsApp বা Email এ PDF সহ সরাসরি পাঠান"
                    >
                      <Share2 size={13} />
                      <span>WhatsApp ও Email শেয়ার</span>
                    </button>
                  </div>
                </div>

                {/* 🌟 Download Success Toast Banner */}
                {downloadSuccessToast && (
                  <div className="bg-emerald-500 text-white p-3 rounded-lg border-2 border-black font-black text-xs flex items-center justify-between shadow-[2px_2px_0px_0px_#000000] animate-bounce">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-white" />
                      <span>{downloadSuccessToast}</span>
                    </div>
                    <button 
                      onClick={() => setDownloadSuccessToast(null)}
                      className="p-0.5 hover:bg-emerald-600 rounded text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* 🌟 Interactive Live Seal & Stamp Quick-Controls Bar */}
                <div className="bg-slate-900 text-white p-2.5 rounded-lg border-2 border-black flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Company Seal Toggle */}
                    <label className="flex items-center gap-1.5 cursor-pointer select-none font-bold text-amber-300">
                      <input
                        type="checkbox"
                        checked={previewSealEnabled}
                        onChange={(e) => setPreviewSealEnabled(e.target.checked)}
                        className="rounded accent-amber-400 cursor-pointer"
                      />
                      <span>নীল অফিসিয়াল সিলমোহর (Official Seal)</span>
                    </label>

                    {/* Status Rubber Stamp Selector */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-300 font-bold">স্ট্যাটাস স্ট্যাম্প:</span>
                      <select
                        value={previewStampOverride}
                        onChange={(e) => setPreviewStampOverride(e.target.value as any)}
                        className="bg-slate-800 text-white border border-slate-700 px-2 py-1 rounded text-xs font-bold cursor-pointer"
                      >
                        <option value="auto">✨ স্বয়ংক্রিয় (Auto by Status)</option>
                        <option value="fixed">🔒 ফিক্সড চুক্তি (FIXED CONTRACT)</option>
                        <option value="final">⚡ ফাইনাল বিল (FINAL INVOICE)</option>
                        <option value="estimate">📋 আনুমানিক (ESTIMATED BUDGET)</option>
                        <option value="paid">✓ পরিশোধিত (PAID IN FULL)</option>
                        <option value="unpaid">⚠️ বকেয়া বিল (UNPAID / DUE)</option>
                        <option value="advance">💵 অগ্রিম প্রাপ্তি (ADVANCE RECEIVED)</option>
                        <option value="approved">★ অনুমোদিত (APPROVED)</option>
                        <option value="original">📄 মূল কপি (ORIGINAL COPY)</option>
                        <option value="confidential">🔒 গোপনীয় (CONFIDENTIAL)</option>
                        <option value="cancelled">✕ বাতিলকৃত (CANCELLED)</option>
                        <option value="none">🚫 স্ট্যাম্প বন্ধ (Hide Stamp)</option>
                      </select>
                    </div>

                    {/* Stamp Color Selector */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-300 font-bold">কালি:</span>
                      <select
                        value={previewStampColor}
                        onChange={(e) => setPreviewStampColor(e.target.value as any)}
                        className="bg-slate-800 text-white border border-slate-700 px-2 py-1 rounded text-xs font-bold cursor-pointer"
                      >
                        <option value="royal-blue">🔵 রয়েল ব্লু (Royal Blue)</option>
                        <option value="emerald">🟢 পান্না সবুজ (Emerald)</option>
                        <option value="ruby-red">🔴 রুবি লাল (Ruby Red)</option>
                        <option value="deep-navy">⚫ ডিপ নেভি (Deep Navy)</option>
                        <option value="purple">🟣 বেগুনি (Purple)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsSignOpen(true)}
                    className="text-[11px] font-black uppercase text-amber-400 hover:text-amber-300 underline flex items-center gap-1 cursor-pointer"
                  >
                    <PenTool size={12} />
                    স্বাক্ষর ও সিলমোহর সেটিংস
                  </button>
                </div>
              </div>

              {/* 🌟 THE ACTUAL PRINTABLE INVOICE / QUOTATION TEMPLATE */}
              <div 
                className="bg-white border-2 border-slate-900 p-8 sm:p-10 relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.12)] print:border-0 print:shadow-none print:p-4" 
                id="printable-invoice-canvas"
              >
                
                {/* Elegantly Crafted Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0">
                  <span className="text-7xl font-black uppercase tracking-widest text-slate-900 rotate-[-30deg] font-sans">
                    RITTIKA EVENT MANAGEMENT
                  </span>
                </div>

                <div className="relative z-10 space-y-6">
                  
                  {/* Premium Company Header & Doc Meta */}
                  <div className="border-b-2 border-slate-900 pb-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 sm:h-20 w-auto min-w-[120px] max-w-[200px] rounded-xl bg-black border-2 border-slate-900 flex items-center justify-center p-1.5 shadow-[3px_3px_0px_0px_#0f172a] shrink-0 overflow-hidden relative">
                          <img 
                            src="/logo.png" 
                            alt="Rittika Event Management Logo" 
                            className="h-full w-auto max-h-full object-contain filter drop-shadow-md" 
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                              if (e.currentTarget.parentElement) {
                                e.currentTarget.parentElement.innerHTML = '<span class="text-amber-400 text-lg font-black font-serif px-2">REM</span>';
                              }
                            }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">Rittika Event Management</h2>
                            <span className="bg-slate-900 text-amber-400 text-[9px] font-black px-2 py-0.5 rounded tracking-wider uppercase">Official</span>
                          </div>
                          <p className="text-xs text-slate-800 font-bold mt-1">প্রোপ্রাইটর: Robin Kumar | মোবাইল: +880 1721-779396</p>
                          <p className="text-xs text-slate-600 font-semibold">অফিস: রথপাড়া, ভেড়ামারা, কুষ্টিয়া, বাংলাদেশ — 7040</p>
                        </div>
                      </div>
                      <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 w-full sm:w-auto">
                        <span className="inline-block bg-slate-900 text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded shadow-sm">
                          {previewInvoice.type === 'quotations' 
                            ? 'বাজেট কোটেশন ও এস্টিমেট' 
                            : previewInvoice.type === 'event' && previewInvoice.data.baseBudget !== undefined
                            ? 'ইভেন্ট ফাইনাল ইনভয়েস বিল'
                            : 'অফিসিয়াল ইনভয়েস বিল'}
                        </span>
                        <p className="text-sm font-black text-slate-900 mt-2 font-mono">
                          {previewInvoice.type === 'quotations' 
                            ? `নং: ${previewInvoice.data.quotationNo}` 
                            : `নং: ${previewInvoice.data.invoiceNo || previewInvoice.data.purchaseNo}`}
                        </p>
                        <p className="text-xs font-bold text-slate-600 font-mono">ইস্যু তারিখ: {previewInvoice.data.date}</p>
                        {previewInvoice.type === 'quotations' && previewInvoice.data.validUntil && (
                          <p className="text-xs font-bold text-rose-700 font-mono">মেয়াদ: {previewInvoice.data.validUntil}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Prominent Budget Type Banner for Quotations */}
                  {previewInvoice.type === 'quotations' && (
                    <div className={`p-3 rounded-lg border text-center font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-sm ${
                      previewInvoice.data.budgetType === 'Estimated' 
                        ? 'bg-amber-50 border-amber-300 text-amber-950' 
                        : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    }`}>
                      {previewInvoice.data.budgetType === 'Estimated' ? (
                        <>
                          <Clock size={16} className="text-amber-800" />
                          <span>⚡ বাজেটের ধরণ: আনুমানিক বাজেট কোটেশন (ESTIMATED BUDGET - বাজার দর ও চাহিদানুযায়ী সমন্বয়যোগ্য)</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={16} className="text-emerald-800" />
                          <span>🔒 বাজেটের ধরণ: ফিক্সড বাজেট চুক্তি কোটেশন (FIXED CONTRACT - চূড়ান্ত অপরিবর্তনীয় বাজেট)</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Prominent Banner for Final Event Invoices */}
                  {previewInvoice.type === 'event' && previewInvoice.data.baseBudget !== undefined && (
                    <div className="p-3 rounded-lg border border-teal-300 text-center font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-sm bg-teal-50 text-teal-950">
                      <Sparkles size={16} className="text-teal-800" />
                      <span>🎉 ইভেন্ট সম্পন্ন চূড়ান্ত হিসাব ও ফাইনাল সেটেলমেন্ট বিল (Final Event Settlement & Completion Invoice)</span>
                    </div>
                  )}

                  {/* Customer / Supplier Metadata in Elegant Dual Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5 flex items-center gap-1">
                        <User size={12} className="text-slate-600" />
                        {previewInvoice.type === 'quotations' ? 'সম্মানিত গ্রাহক / ক্লায়েন্ট বিবরণ' : 'ইনভয়েস প্রাপক / ক্লায়েন্ট বিবরণ'}
                      </span>
                      <p className="text-sm font-black text-slate-900">
                        {previewInvoice.data.customerName || previewInvoice.data.supplierName || 'সাধারণ ক্লায়েন্ট'}
                      </p>
                      <p className="text-xs font-semibold text-slate-700 mt-1">
                        মোবাইল: <span className="font-mono">{previewInvoice.data.customerMobile || previewInvoice.data.supplierMobile || 'প্রযোজ্য নয়'}</span>
                      </p>
                      {previewInvoice.data.customerAddress && (
                        <p className="text-xs text-slate-600 font-medium mt-0.5">ঠিকানা: {previewInvoice.data.customerAddress}</p>
                      )}
                    </div>
                    <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 md:text-right">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5 md:justify-end flex items-center gap-1">
                        <Tag size={12} className="text-slate-600" />
                        ডকুমেন্ট ও ইভেন্ট ধরণ
                      </span>
                      <p className="text-sm font-black text-slate-900 uppercase">
                        {previewInvoice.type === 'quotations' ? `ইভেন্ট কোটেশন [${previewInvoice.data.budgetType === 'Estimated' ? 'আনুমানিক' : 'ফিক্সড'}]` :
                         previewInvoice.type === 'purchase' ? 'Supplier ক্রয় চালান' : 
                         previewInvoice.type === 'sales' ? 'সরাসরি বিক্রয় চালান' :
                         previewInvoice.type === 'rental' ? 'সামগ্রী ভাড়া চালান' : 
                         previewInvoice.data.baseBudget !== undefined ? 'ইভেন্ট সম্পন্ন ফাইনাল বিল' : 'ইভেন্ট সার্ভিস ও সম্পন্ন বিল'}
                      </p>
                      {previewInvoice.data.eventName && (
                        <p className="text-xs font-bold text-slate-800 mt-1">ইভেন্ট: {previewInvoice.data.eventName}</p>
                      )}
                      {previewInvoice.data.eventDate && (
                        <p className="text-xs font-bold text-indigo-700 font-mono mt-0.5">ইভেন্ট তারিখ: {previewInvoice.data.eventDate}</p>
                      )}
                      {previewInvoice.data.venue && (
                        <p className="text-xs font-medium text-slate-600 font-mono mt-0.5">ভেন্যু: {previewInvoice.data.venue}</p>
                      )}
                    </div>
                  </div>

                  {/* Core Items Table */}
                  <div className="border border-slate-900 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs font-bold">
                      <thead className="bg-slate-900 text-white text-[10px] uppercase font-black tracking-wider">
                        <tr>
                          <th className="p-3 border-r border-slate-700 text-center w-12">#</th>
                          {previewInvoice.type === 'quotations' && (
                            <th className="p-3 border-r border-slate-700 w-28">ক্যাটাগরি</th>
                          )}
                          <th className="p-3 border-r border-slate-700">বিবরণ / মালামাল ও সার্ভিস (Items & Services)</th>
                          <th className="p-3 border-r border-slate-700 text-center w-24">পরিমাণ (Qty)</th>
                          <th className="p-3 border-r border-slate-700 text-right w-28">দর (Rate)</th>
                          <th className="p-3 text-right w-32">মোট (Total)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {previewInvoice.type === 'quotations' ? (
                          previewInvoice.data.items?.map((item: any, idx: number) => (
                            <tr key={item.id || idx} className="hover:bg-slate-50">
                              <td className="p-3 border-r-2 border-black text-center font-mono">{idx + 1}</td>
                              <td className="p-3 border-r-2 border-black">
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-yellow-100 text-yellow-900 border border-black rounded inline-block">
                                  {item.category}
                                </span>
                              </td>
                              <td className="p-3 border-r-2 border-black">
                                <p className="font-black text-black">{item.name}</p>
                                {item.note && (
                                  <p className="text-[10px] text-slate-600 italic mt-0.5 font-normal">
                                    স্পেসিফিকেশন: {item.note}
                                  </p>
                                )}
                              </td>
                              <td className="p-3 border-r-2 border-black text-center font-mono">
                                {item.qty} {item.unit || 'টি'}
                              </td>
                              <td className="p-3 border-r-2 border-black text-right font-mono">
                                {formatCurrency(item.rate)}
                              </td>
                              <td className="p-3 text-right font-mono font-black">
                                {formatCurrency(item.total)}
                              </td>
                            </tr>
                          ))
                        ) : previewInvoice.type === 'purchase' ? (
                          <tr>
                            <td className="p-3 border-r-2 border-black text-center font-mono">১</td>
                            <td className="p-3 border-r-2 border-black">
                              <p className="font-black text-black">{previewInvoice.data.itemName}</p>
                              <span className="text-[10px] text-slate-500 font-mono">ক্রয় এন্ট্রি আইডি: {previewInvoice.data.purchaseNo}</span>
                            </td>
                            <td className="p-3 border-r-2 border-black text-center font-mono">{previewInvoice.data.qty} {previewInvoice.data.unit}</td>
                            <td className="p-3 border-r-2 border-black text-right font-mono">{formatCurrency(previewInvoice.data.unitPrice)}</td>
                            <td className="p-3 text-right font-mono">{formatCurrency(previewInvoice.data.totalAmount)}</td>
                          </tr>
                        ) : previewInvoice.type === 'event' ? (
                          previewInvoice.data.baseBudget !== undefined ? (
                            <>
                              {/* Final Invoice Item Breakdown */}
                              <tr>
                                <td className="p-3 border-r-2 border-black text-center font-mono">১</td>
                                <td className="p-3 border-r-2 border-black">
                                  <p className="font-black text-black">মূল ইভেন্ট বাজেট চুক্তি (Base Contract Budget)</p>
                                  <span className="text-[10px] text-slate-600 font-bold block mt-0.5">
                                    প্যাকেজ / কোটেশন রেফারেন্স: {previewInvoice.data.quotationNo || previewInvoice.data.decorationPackage || 'মূল চুক্তি'}
                                  </span>
                                </td>
                                <td className="p-3 border-r-2 border-black text-center font-mono">১ ইভেন্ট</td>
                                <td className="p-3 border-r-2 border-black text-right font-mono">{formatCurrency(previewInvoice.data.baseBudget)}</td>
                                <td className="p-3 text-right font-mono font-black">{formatCurrency(previewInvoice.data.baseBudget)}</td>
                              </tr>

                              {/* Extra Items */}
                              {previewInvoice.data.extraItems?.map((extra: EventExtraItem, eIdx: number) => (
                                <tr key={extra.id || eIdx} className="bg-amber-50/50">
                                  <td className="p-3 border-r-2 border-black text-center font-mono">{eIdx + 2}</td>
                                  <td className="p-3 border-r-2 border-black">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[9px] bg-amber-200 border border-black px-1.5 py-0.2 rounded font-black text-amber-900 uppercase">
                                        অতিরিক্ত কাজ
                                      </span>
                                      <span className="font-black text-black">{extra.name}</span>
                                    </div>
                                    {extra.note && (
                                      <p className="text-[10px] text-slate-600 italic mt-0.5">নোট: {extra.note}</p>
                                    )}
                                  </td>
                                  <td className="p-3 border-r-2 border-black text-center font-mono">{extra.qty} {extra.unit || 'টি'}</td>
                                  <td className="p-3 border-r-2 border-black text-right font-mono">{formatCurrency(extra.rate)}</td>
                                  <td className="p-3 text-right font-mono font-black">{formatCurrency(extra.total)}</td>
                                </tr>
                              ))}

                              {previewInvoice.data.labourCost > 0 && (
                                <tr>
                                  <td className="p-3 border-r-2 border-black text-center font-mono">#</td>
                                  <td className="p-3 border-r-2 border-black font-black text-black">অতিরিক্ত লেবার ও ওভারটাইম মজুরি</td>
                                  <td className="p-3 border-r-2 border-black text-center font-mono">-</td>
                                  <td className="p-3 border-r-2 border-black text-right font-mono">{formatCurrency(previewInvoice.data.labourCost)}</td>
                                  <td className="p-3 text-right font-mono font-black">{formatCurrency(previewInvoice.data.labourCost)}</td>
                                </tr>
                              )}

                              {previewInvoice.data.transportCost > 0 && (
                                <tr>
                                  <td className="p-3 border-r-2 border-black text-center font-mono">#</td>
                                  <td className="p-3 border-r-2 border-black font-black text-black">অতিরিক্ত যানবাহন ও পরিবহন চার্জ</td>
                                  <td className="p-3 border-r-2 border-black text-center font-mono">-</td>
                                  <td className="p-3 border-r-2 border-black text-right font-mono">{formatCurrency(previewInvoice.data.transportCost)}</td>
                                  <td className="p-3 text-right font-mono font-black">{formatCurrency(previewInvoice.data.transportCost)}</td>
                                </tr>
                              )}

                              {previewInvoice.data.damageDeduction > 0 && (
                                <tr className="bg-rose-50/50">
                                  <td className="p-3 border-r-2 border-black text-center font-mono">#</td>
                                  <td className="p-3 border-r-2 border-black font-black text-rose-900">
                                    মালামাল ক্ষতিপূরণ / ড্যামেজ চার্জ (Damage Compensation)
                                  </td>
                                  <td className="p-3 border-r-2 border-black text-center font-mono">-</td>
                                  <td className="p-3 border-r-2 border-black text-right font-mono">{formatCurrency(previewInvoice.data.damageDeduction)}</td>
                                  <td className="p-3 text-right font-mono font-black text-rose-900">{formatCurrency(previewInvoice.data.damageDeduction)}</td>
                                </tr>
                              )}
                            </>
                          ) : (
                            <>
                              <tr>
                                <td className="p-3 border-r-2 border-black text-center font-mono">১</td>
                                <td className="p-3 border-r-2 border-black">
                                  <p className="font-black text-black">ডেকোরেশন প্যাকেজ: {previewInvoice.data.decorationPackage}</p>
                                  <div className="text-[10px] text-slate-600 mt-1 font-bold space-y-1">
                                    <p>ব্যবহৃত মালামাল চেকলিস্ট:</p>
                                    <ul className="list-disc list-inside pl-2">
                                      {previewInvoice.data.materialsUsed?.map((m: any, idx: number) => (
                                        <li key={idx}>{m.name} (পরিমাণ: {m.qty} টি)</li>
                                      ))}
                                    </ul>
                                  </div>
                                </td>
                                <td className="p-3 border-r-2 border-black text-center font-mono">১ প্যাকেজ</td>
                                <td className="p-3 border-r-2 border-black text-right font-mono">{formatCurrency(previewInvoice.data.totalCost - (previewInvoice.data.labourCost || 0) - (previewInvoice.data.transportCost || 0) - (previewInvoice.data.extraCharges || 0))}</td>
                                <td className="p-3 text-right font-mono">{formatCurrency(previewInvoice.data.totalCost - (previewInvoice.data.labourCost || 0) - (previewInvoice.data.transportCost || 0) - (previewInvoice.data.extraCharges || 0))}</td>
                              </tr>
                              <tr>
                                <td className="p-3 border-r-2 border-black text-center font-mono">২</td>
                                <td className="p-3 border-r-2 border-black">শ্রমিক মজুরি (Labour Cost)</td>
                                <td className="p-3 border-r-2 border-black text-center font-mono">-</td>
                                <td className="p-3 border-r-2 border-black text-right font-mono">{formatCurrency(previewInvoice.data.labourCost)}</td>
                                <td className="p-3 text-right font-mono">{formatCurrency(previewInvoice.data.labourCost)}</td>
                              </tr>
                              <tr>
                                <td className="p-3 border-r-2 border-black text-center font-mono">৩</td>
                                <td className="p-3 border-r-2 border-black">যানবাহন ও লজিস্টিকস চার্জ (Transport)</td>
                                <td className="p-3 border-r-2 border-black text-center font-mono">-</td>
                                <td className="p-3 border-r-2 border-black text-right font-mono">{formatCurrency(previewInvoice.data.transportCost)}</td>
                                <td className="p-3 text-right font-mono">{formatCurrency(previewInvoice.data.transportCost)}</td>
                              </tr>
                              {previewInvoice.data.extraCharges > 0 && (
                                <tr>
                                  <td className="p-3 border-r-2 border-black text-center font-mono">৪</td>
                                  <td className="p-3 border-r-2 border-black">অতিরিক্ত চার্জ (Extra Charges)</td>
                                  <td className="p-3 border-r-2 border-black text-center font-mono">-</td>
                                  <td className="p-3 border-r-2 border-black text-right font-mono">{formatCurrency(previewInvoice.data.extraCharges)}</td>
                                  <td className="p-3 text-right font-mono">{formatCurrency(previewInvoice.data.extraCharges)}</td>
                                </tr>
                              )}
                            </>
                          )
                        ) : (
                          previewInvoice.data.items?.map((item: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-3 border-r-2 border-black text-center font-mono">{idx + 1}</td>
                              <td className="p-3 border-r-2 border-black font-black text-black">{item.name}</td>
                              <td className="p-3 border-r-2 border-black text-center font-mono">{item.qty}</td>
                              <td className="p-3 border-r-2 border-black text-right font-mono">{formatCurrency(item.rate)}</td>
                              <td className="p-3 text-right font-mono">{formatCurrency(item.total)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Calculations & QR Code Verification */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-stretch gap-6 border-b-2 border-black pb-4">
                    
                    {/* QR Verification details */}
                    <div className="flex items-center gap-3.5 border-2 border-black p-3 bg-gradient-to-br from-slate-50 to-amber-50/40 shadow-[2px_2px_0px_0px_#000000] w-full sm:w-auto rounded-none">
                      <div className="w-20 h-20 border-2 border-black bg-white flex items-center justify-center p-1 shrink-0 shadow-[1px_1px_0px_0px_#000000] relative">
                        {qrDataUrl ? (
                          <img 
                            src={qrDataUrl} 
                            alt="Invoice QR Verification" 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                            <QrIcon size={24} className="text-slate-800" />
                            <span className="text-[7px] font-black text-slate-600">QR CODE</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase text-black tracking-wider">অফিসিয়াল ডিজিটাল QR কোড</span>
                          <span className="bg-emerald-100 text-emerald-900 text-[8px] font-black px-1 py-0.5 border border-black uppercase">Verified</span>
                        </div>
                        <p className="text-[10px] text-slate-700 font-bold leading-tight mt-1 max-w-[200px]">
                          স্মার্টফোন ক্যামেরা দিয়ে স্ক্যান করে সরাসরি ইনভয়েসের সত্যতা ও বিবরণ যাচাই করুন।
                        </p>
                        <span className="text-[9px] font-black text-emerald-800 mt-1 flex items-center gap-1">
                          ✓ VERIFIED BY RITTIKA EVENT MANAGEMENT
                        </span>
                      </div>
                    </div>

                    {/* Grand totals breakdown */}
                    <div className="text-right space-y-1 w-full sm:w-80 font-black text-xs">
                      {previewInvoice.type === 'quotations' ? (
                        <>
                          <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span className="text-slate-600">মালামাল ও সার্ভিস উপ-মোট:</span>
                            <span className="font-mono">{formatCurrency(previewInvoice.data.subtotal)}</span>
                          </div>
                          {previewInvoice.data.transportCharge > 0 && (
                            <div className="flex justify-between border-b border-slate-200 pb-1 text-slate-700">
                              <span>গাড়ি ভাড়া / পরিবহন খরচ:</span>
                              <span className="font-mono">+{formatCurrency(previewInvoice.data.transportCharge)}</span>
                            </div>
                          )}
                          {previewInvoice.data.labourCharge > 0 && (
                            <div className="flex justify-between border-b border-slate-200 pb-1 text-slate-700">
                              <span>শ্রমিক ও ইন্সটলেশন খরচ:</span>
                              <span className="font-mono">+{formatCurrency(previewInvoice.data.labourCharge)}</span>
                            </div>
                          )}
                          {previewInvoice.data.discount > 0 && (
                            <div className="flex justify-between border-b border-slate-200 pb-1 text-rose-600">
                              <span>বিশেষ ছাড় (Discount):</span>
                              <span className="font-mono">-{formatCurrency(previewInvoice.data.discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between border-b-2 border-black pb-1 pt-1 bg-yellow-50 px-2">
                            <span className="text-black uppercase">
                              {previewInvoice.data.budgetType === 'Estimated' ? 'সর্বমোট আনুমানিক বাজেট:' : 'সর্বমোট ফিক্সড বাজেট:'}
                            </span>
                            <span className="font-mono text-base text-black font-black">
                              {formatCurrency(previewInvoice.data.grandTotal)}
                            </span>
                          </div>
                          {previewInvoice.data.advanceRequired > 0 && (
                            <div className="flex justify-between text-indigo-700 pt-1">
                              <span>বুকিং অগ্রিম প্রদেয়:</span>
                              <span className="font-mono font-black">{formatCurrency(previewInvoice.data.advanceRequired)}</span>
                            </div>
                          )}
                        </>
                      ) : previewInvoice.type === 'purchase' ? (
                        <div className="flex justify-between border-b border-slate-200 pb-1">
                          <span className="text-slate-600">মোট মূল্য:</span>
                          <span className="font-mono">{formatCurrency(previewInvoice.data.totalAmount)}</span>
                        </div>
                      ) : previewInvoice.type === 'event' ? (
                        previewInvoice.data.baseBudget !== undefined ? (
                          <>
                            {/* Final Event Bill Breakdown */}
                            <div className="flex justify-between border-b border-slate-200 pb-1">
                              <span className="text-slate-600">মূল চুক্তি বাজেট:</span>
                              <span className="font-mono">{formatCurrency(previewInvoice.data.baseBudget)}</span>
                            </div>
                            {previewInvoice.data.extraWorkCost > 0 && (
                              <div className="flex justify-between border-b border-slate-200 pb-1 text-amber-700">
                                <span>অতিরিক্ত কাজের বিল:</span>
                                <span className="font-mono">+{formatCurrency(previewInvoice.data.extraWorkCost)}</span>
                              </div>
                            )}
                            {(previewInvoice.data.transportCost > 0 || previewInvoice.data.labourCost > 0) && (
                              <div className="flex justify-between border-b border-slate-200 pb-1 text-slate-700">
                                <span>অতিরিক্ত পরিবহন ও লেবার:</span>
                                <span className="font-mono">+{formatCurrency((previewInvoice.data.transportCost || 0) + (previewInvoice.data.labourCost || 0))}</span>
                              </div>
                            )}
                            {previewInvoice.data.damageDeduction > 0 && (
                              <div className="flex justify-between border-b border-slate-200 pb-1 text-rose-700">
                                <span>মালামাল ক্ষতিপূরণ / ড্যামেজ:</span>
                                <span className="font-mono">+{formatCurrency(previewInvoice.data.damageDeduction)}</span>
                              </div>
                            )}
                            {previewInvoice.data.discount > 0 && (
                              <div className="flex justify-between border-b border-slate-200 pb-1 text-rose-600">
                                <span>বিশেষ ছাড় (Discount):</span>
                                <span className="font-mono">-{formatCurrency(previewInvoice.data.discount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between border-b-2 border-black pb-1 pt-1 bg-teal-50 px-2">
                              <span className="text-black uppercase">সর্বমোট চূড়ান্ত বিল (Net Payable):</span>
                              <span className="font-mono text-base text-black font-black">
                                {formatCurrency(previewInvoice.data.netPayable || previewInvoice.data.totalCost)}
                              </span>
                            </div>
                            {previewInvoice.data.advancePaid > 0 && (
                              <div className="flex justify-between border-b border-slate-200 pb-1 pt-1 text-emerald-700">
                                <span>
                                  পরিশোধিত অগ্রিম ({previewInvoice.data.advancePaymentMethod || 'অগ্রিম'}):
                                </span>
                                <span className="font-mono font-black">-{formatCurrency(previewInvoice.data.advancePaid)}</span>
                              </div>
                            )}
                            <div className={`flex justify-between pt-1 px-2 border-2 border-black ${previewInvoice.data.dueAmount > 0 ? 'bg-rose-100 text-rose-950' : 'bg-emerald-100 text-emerald-950'}`}>
                              <span className="uppercase font-black">
                                {previewInvoice.data.dueAmount > 0 ? 'অবশিষ্ট প্রদেয় বকেয়া বিল:' : 'সম্পূর্ণ পরিশোধিত (Paid):'}
                              </span>
                              <span className="font-mono text-base font-black">
                                {formatCurrency(previewInvoice.data.dueAmount || 0)}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span className="text-slate-600">সর্বমোট খরচ:</span>
                            <span className="font-mono">{formatCurrency(previewInvoice.data.totalCost)}</span>
                          </div>
                        )
                      ) : previewInvoice.type === 'rental' ? (
                        <>
                          <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span className="text-slate-600">ভাড়া উপ-মোট:</span>
                            <span className="font-mono">{formatCurrency(previewInvoice.data.rentalCharges)}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200 pb-1 text-slate-700">
                            <span>নিরাপত্তা জামানত (Security):</span>
                            <span className="font-mono">+{formatCurrency(previewInvoice.data.securityDeposit)}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200 pb-1 text-slate-700">
                            <span>শ্রমিক ও গাড়ি ভাড়া:</span>
                            <span className="font-mono">+{formatCurrency(previewInvoice.data.transportCharge + previewInvoice.data.labourCharge)}</span>
                          </div>
                          <div className="flex justify-between border-b-2 border-black pb-1">
                            <span className="text-black">সর্বমোট বিল (Grand Total):</span>
                            <span className="font-mono text-base text-teal-600">{formatCurrency(previewInvoice.data.totalBill)}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span className="text-slate-600">উপ-মোট:</span>
                            <span className="font-mono">{formatCurrency(previewInvoice.data.subtotal)}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200 pb-1 text-rose-600">
                            <span>ডিসকাউন্ট:</span>
                            <span className="font-mono">-{formatCurrency(previewInvoice.data.discount)}</span>
                          </div>
                          <div className="flex justify-between border-b-2 border-black pb-1">
                            <span className="text-black">সর্বমোট বিল:</span>
                            <span className="font-mono text-base text-emerald-600">{formatCurrency(previewInvoice.data.grandTotal)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Terms & Conditions Section (For Quotations & Final Invoices) */}
                  {previewInvoice.data.termsAndConditions && (
                    <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/70 text-xs space-y-1.5 shadow-sm">
                      <span className="font-black uppercase text-slate-900 block tracking-wider text-[11px] flex items-center gap-1.5">
                        <FileText size={13} className="text-slate-700" />
                        {previewInvoice.type === 'quotations' ? 'বাজেট শর্তাবলী ও নিয়মাবলী (Terms & Conditions):' : 'চূড়ান্ত বিলের শর্তাবলী ও বিবরণ (Final Bill Terms):'}
                      </span>
                      <p className="whitespace-pre-line text-slate-700 font-medium leading-relaxed pl-4 border-l-2 border-amber-400">
                        {previewInvoice.data.termsAndConditions}
                      </p>
                    </div>
                  )}

                  {/* Attached Files / Reference Gallery in Preview */}
                  {((previewInvoice.data.files && previewInvoice.data.files.length > 0) || previewInvoice.data.fileUrl) && (
                    <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/60 text-xs space-y-2 shadow-sm no-print">
                      <span className="font-black uppercase text-slate-900 block tracking-wider text-[11px] flex items-center gap-1.5">
                        <Paperclip size={13} className="text-slate-700" />
                        সংযুক্ত রেফারেন্স ও ছবিসমূহ ({previewInvoice.data.files?.length || 1} টি):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {previewInvoice.data.files && previewInvoice.data.files.length > 0 ? (
                          previewInvoice.data.files.map((file: any, fidx: number) => (
                            <a
                              key={fidx}
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-white border border-slate-300 hover:border-black p-1.5 rounded flex items-center gap-2 text-[11px] font-bold text-slate-800 hover:bg-slate-100 transition shadow-2xs"
                            >
                              {file.type === 'image' || file.url.startsWith('data:image/') ? (
                                <img src={file.url} alt={file.name} className="w-6 h-6 object-cover rounded border border-slate-300" />
                              ) : (
                                <FileText size={16} className="text-indigo-600" />
                              )}
                              <span className="max-w-[140px] truncate">{file.name}</span>
                            </a>
                          ))
                        ) : (
                          <a
                            href={previewInvoice.data.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-white border border-slate-300 hover:border-black p-1.5 rounded flex items-center gap-2 text-[11px] font-bold text-slate-800"
                          >
                            <FileText size={16} className="text-indigo-600" />
                            <span>{previewInvoice.data.fileName || 'ডকুমেন্ট দেখুন'}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Digital Seal, Status, and Signature Panel */}
                  <div className="pt-6 border-t-2 border-slate-900/40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center justify-between">
                    
                    {/* 1. Status badge & Document authenticity (Clean, no overlapping stamp) */}
                    <div className="space-y-2 text-center md:text-left flex flex-col items-center md:items-start justify-center p-3 bg-slate-50/70 border border-slate-200 rounded-xl">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {previewInvoice.type === 'quotations' ? 'কোটেশন স্ট্যাটাস' : 'পেমেন্ট স্ট্যাটাস'}
                      </p>
                      <span className={`inline-block border px-3 py-1 text-xs font-black uppercase rounded-md shadow-xs ${
                        previewInvoice.type === 'quotations' 
                          ? previewInvoice.data.status === 'Converted' ? 'bg-teal-50 border-teal-400 text-teal-900' : 'bg-amber-50 border-amber-400 text-amber-900'
                          : (previewInvoice.data.paymentStatus === 'Paid' || (previewInvoice.type === 'event' && previewInvoice.data.dueAmount === 0) || previewInvoice.type === 'sales') ? 'bg-emerald-50 border-emerald-400 text-emerald-900' : 'bg-rose-50 border-rose-400 text-rose-900'
                      }`}>
                        {previewInvoice.type === 'quotations'
                          ? (previewInvoice.data.status === 'Converted' ? '✓ কনফার্মড ইভেন্ট' : '● প্রস্তাবনা কোটেশন')
                          : (previewInvoice.data.paymentStatus === 'Paid' || (previewInvoice.type === 'event' && previewInvoice.data.dueAmount === 0) || previewInvoice.type === 'sales') ? '✓ সম্পূর্ণ পরিশোধিত' : '● বকেয়া বিল (Due)'}
                      </span>
                      <p className="text-[9px] text-slate-500 font-semibold mt-1">
                        অফিসিয়াল সফটওয়্যার জেনারেটেড ডিজিটাল ইনভয়েস
                      </p>
                    </div>

                    {/* 2. DEDICATED BLANK/OPEN AREA FOR STATUS RUBBER STAMP (সম্পূর্ণ ফাঁকা ও পরিষ্কার জায়গায় রাবার স্ট্যাম্প) */}
                    <div className="flex flex-col items-center justify-center p-3 bg-white border border-dashed border-slate-300 rounded-xl min-h-[105px] relative">
                      <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider mb-1 block">
                        অফিসিয়াল স্ট্যাটাস সিলমোহর (Status Stamp)
                      </span>
                      {getResolvedStatusStamp(previewInvoice) ? (
                        <div className="py-1 flex items-center justify-center">
                          <StatusRubberStamp 
                            type={getResolvedStatusStamp(previewInvoice)!} 
                            colorTheme={previewStampColor} 
                            date={previewInvoice.data.date}
                            size="md"
                            rotation={-5}
                          />
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">স্ট্যাম্প প্রযোজ্য নয়</span>
                      )}
                    </div>

                    {/* 3. Official Blue/Gold Company Round Seal */}
                    <div className="flex flex-col items-center justify-center p-2 min-h-[105px]">
                      {previewSealEnabled && sigSettings.showCompanySeal ? (
                        <CompanyOfficialSeal 
                          colorTheme={sigSettings.sealColorTheme || 'royal-blue'} 
                          date={previewInvoice.data.date}
                          size="md"
                          rotation={sigSettings.sealRotation}
                          texture={sigSettings.sealTexture}
                          showDate={sigSettings.sealShowDate}
                        />
                      ) : (
                        <div className="text-center text-slate-300 text-[10px] font-bold py-4">
                          [ অফিসিয়াল সিলমোহর ]
                        </div>
                      )}
                    </div>
                    
                    {/* 4. Official Digital Signature */}
                    <div className="text-center flex flex-col items-center justify-center md:items-end p-2">
                      <div className="border-b-2 border-slate-900 pb-1.5 w-48 sm:w-52 text-center flex items-center justify-center min-h-[55px]">
                        {previewInvoice.data.signatureUrl || getActiveSignatureUrl() ? (
                          <img 
                            src={previewInvoice.data.signatureUrl || getActiveSignatureUrl() || ''} 
                            alt="Digital Signature" 
                            className="max-h-14 max-w-full object-contain"
                          />
                        ) : (
                          <div className="text-center py-0.5">
                            <span className={`text-xl text-slate-900 block ${
                              sigSettings.typedFont === 'font-cursive' 
                                ? 'italic font-serif tracking-wider font-bold text-slate-950' 
                                : sigSettings.typedFont === 'font-serif' 
                                ? 'font-serif font-bold text-slate-900' 
                                : sigSettings.typedFont === 'font-sans' 
                                ? 'font-sans font-black text-slate-900' 
                                : sigSettings.typedFont === 'font-bengali' 
                                ? 'font-serif font-black text-slate-950' 
                                : 'font-mono font-bold text-slate-900'
                            }`}>
                              {sigSettings.typedName || 'Robin Kumar'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-600 block">
                              {sigSettings.typedDesignation || 'প্রোপ্রাইটর (Proprietor)'}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-black uppercase text-slate-800 block mt-1.5 tracking-wider">
                        অনুমোদিত স্বাক্ষর (Authorized Signature)
                      </span>
                      <span className="text-[8px] font-bold text-slate-500 block uppercase tracking-wider">
                        Rittika Event Management
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Uploaded Invoice File Preview Section */}
              {previewInvoice.type === 'purchase' && previewInvoice.data.fileUrl && (
                <div className="neo-card p-5 space-y-4 no-print">
                  <h4 className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                    <Eye size={16} />
                    আপলোডকৃত চালানের মূল কপি (Uploaded Document File)
                  </h4>
                  <div className="border-4 border-black p-4 bg-slate-50 flex justify-center items-center overflow-auto max-h-[500px]">
                    {previewInvoice.data.fileUrl.startsWith('data:image/') ? (
                      <img 
                        src={previewInvoice.data.fileUrl} 
                        alt="Supplier Invoice upload" 
                        className="max-w-full h-auto border-2 border-black shadow-[4px_4px_0px_0px_#000000]"
                      />
                    ) : (
                      <div className="text-center p-6 space-y-3">
                        <FileText size={48} className="mx-auto text-indigo-500" />
                        <p className="text-xs font-black text-slate-700">পিডিএফ ডকুমেন্ট ফাইল: {previewInvoice.data.fileName || 'invoice_document.pdf'}</p>
                        <a 
                          href={previewInvoice.data.fileUrl} 
                          download={previewInvoice.data.fileName || 'invoice.pdf'}
                          className="neo-btn px-4 py-2 text-xs bg-indigo-500 text-white font-black uppercase tracking-wider"
                        >
                          চালানটি ডাউনলোড করুন (Download)
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : isCreatingFinalInvoice ? (
            
            /* 🌟 INTERACTIVE EVENT COMPLETION FINAL INVOICE BUILDER */
            <div className="neo-card p-6 space-y-6 bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000000]" id="final-invoice-builder-form">
              
              {/* Form Header */}
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <div>
                  <h3 className="text-lg font-black uppercase italic text-black flex items-center gap-2">
                    <Sparkles size={20} className="text-teal-600" />
                    ইভেন্ট সমাপ্তি চূড়ান্ত ফাইনাল ইনভয়েস বিল্ডার (Event Final Bill Generator)
                  </h3>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">
                    ইভেন্ট সম্পন্ন হওয়ার পর মূল বাজেট, অগ্রিম প্রদান, অতিরিক্ত কাজের আইটেম, ওভারটাইম লেবার, পরিবহন এবং ক্ষতিপূরণ হিসাব করে চূড়ান্ত বিল তৈরি করুন।
                  </p>
                </div>
                <button
                  onClick={() => setIsCreatingFinalInvoice(false)}
                  className="neo-btn px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 font-bold"
                >
                  বাতিল (Close)
                </button>
              </div>

              {/* Section 1: Event & Quotation Linkage */}
              <div className="space-y-4 bg-slate-50 p-4 border-2 border-black">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                    <span className="w-5 h-5 bg-black text-yellow-400 rounded-full flex items-center justify-center text-[11px]">১</span>
                    ইভেন্ট / কোটেশন নির্বাচন ও সাধারণ তথ্য
                  </h4>
                  <span className="text-[10px] bg-teal-100 border border-teal-800 px-2 py-0.5 font-bold text-teal-900">
                    অটো-লিঙ্ক সক্রিয়
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-[11px] font-black uppercase">কোটেশন থেকে তথ্য লোড করুন</label>
                    <select
                      value={finalSelectedQuotationId}
                      onChange={(e) => handleQuotationSelectForFinal(e.target.value)}
                      className="w-full bg-white border-2 border-black p-2 text-xs font-bold"
                    >
                      <option value="">-- বিদ্যমান বাজেট কোটেশন নির্বাচন করুন --</option>
                      {quotations.map(q => (
                        <option key={q.id} value={q.id}>
                          {q.quotationNo} — {q.eventName} ({q.customerName}) [{formatCurrency(q.grandTotal)}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-[11px] font-black uppercase">সম্পন্ন ইভেন্ট থেকে লোড করুন</label>
                    <select
                      value={finalSelectedEventId}
                      onChange={(e) => handleEventSelectForFinal(e.target.value)}
                      className="w-full bg-white border-2 border-black p-2 text-xs font-bold"
                    >
                      <option value="">-- সম্পন্ন ইভেন্ট নির্বাচন করুন --</option>
                      {events.map(ev => {
                        const c = customers.find(cust => cust.id === ev.customerId);
                        return (
                          <option key={ev.id} value={ev.id}>
                            {ev.name} ({c ? c.name : 'Unknown'}) - {ev.date}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Meta Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-black">
                  <div>
                    <label className="block mb-1 text-[11px]">ফাইনাল ইনভয়েস নম্বর</label>
                    <input
                      type="text"
                      value={finalInvNo}
                      onChange={(e) => setFinalInvNo(e.target.value)}
                      className="w-full bg-white border-2 border-black p-2 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-[11px]">ইনভয়েস তৈরির তারিখ</label>
                    <input
                      type="date"
                      value={finalInvDate}
                      onChange={(e) => setFinalInvDate(e.target.value)}
                      className="w-full bg-white border-2 border-black p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-[11px]">ইভেন্টের নাম / অনুষ্ঠান</label>
                    <input
                      type="text"
                      value={finalEventName}
                      onChange={(e) => setFinalEventName(e.target.value)}
                      className="w-full bg-white border-2 border-black p-2 font-bold"
                      placeholder="যেমন: শুভ বিবাহ বা জন্মদিন"
                    />
                  </div>
                </div>

                {/* Client & Venue Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-black border-t border-slate-200">
                  <div>
                    <label className="block mb-1 text-[11px]">গ্রাহকের নাম (Customer Name)</label>
                    <input
                      type="text"
                      value={finalCustomerName}
                      onChange={(e) => setFinalCustomerName(e.target.value)}
                      className="w-full bg-white border-2 border-black p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-[11px]">গ্রাহকের মোবাইল নম্বর</label>
                    <input
                      type="text"
                      value={finalCustomerMobile}
                      onChange={(e) => setFinalCustomerMobile(e.target.value)}
                      className="w-full bg-white border-2 border-black p-2 font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-[11px]">ভেন্যু / অনুষ্ঠানস্থল</label>
                    <input
                      type="text"
                      value={finalVenue}
                      onChange={(e) => setFinalVenue(e.target.value)}
                      className="w-full bg-white border-2 border-black p-2 font-bold"
                    />
                  </div>
                </div>

              </div>

              {/* Section 2: Base Budget & Advance Tracking */}
              <div className="space-y-4 bg-yellow-50/70 p-4 border-2 border-black">
                <h4 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-black text-yellow-400 rounded-full flex items-center justify-center text-[11px]">২</span>
                  মূল চুক্তি বাজেট ও পরিশোধিত অগ্রিম ট্র্যাকিং (Base Budget & Advance Received)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-black">
                  <div>
                    <label className="block mb-1 text-[11px] text-slate-900">মূল বাজেট / চুক্তি মূল্য (টাকা)</label>
                    <input
                      type="number"
                      value={finalBaseBudget}
                      onChange={(e) => setFinalBaseBudget(Number(e.target.value))}
                      className="w-full bg-white border-2 border-black p-2 font-bold font-mono text-base"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-[11px] text-emerald-900">পরিশোধিত অগ্রিম টাকা (Advance Paid)</label>
                    <input
                      type="number"
                      value={finalAdvancePaid}
                      onChange={(e) => setFinalAdvancePaid(Number(e.target.value))}
                      className="w-full bg-white border-2 border-emerald-700 p-2 font-bold font-mono text-base text-emerald-900"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-[11px]">অগ্রিম প্রাপ্তির তারিখ</label>
                    <input
                      type="date"
                      value={finalAdvanceDate}
                      onChange={(e) => setFinalAdvanceDate(e.target.value)}
                      className="w-full bg-white border-2 border-black p-2 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-[11px]">অগ্রিম প্রাপ্তির মাধ্যম (বাছাই বা কাস্টম)</label>
                    <input
                      type="text"
                      list="dl-payment-methods"
                      placeholder="যেমন: বিকাশ বা নগদ"
                      value={finalAdvanceMethod}
                      onChange={(e) => setFinalAdvanceMethod(e.target.value)}
                      className="w-full bg-white border-2 border-black p-2 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Extra Items / Extra Work Added During Event */}
              <div className="space-y-4 bg-white p-4 border-2 border-black">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                    <span className="w-5 h-5 bg-black text-yellow-400 rounded-full flex items-center justify-center text-[11px]">৩</span>
                    ইভেন্টে অতিরিক্ত কাজের আইটেম ও বিল (Extra Work Done)
                  </h4>
                  <span className="text-xs font-black font-mono text-amber-900 bg-amber-100 px-2 py-0.5 border border-black">
                    অতিরিক্ত আইটেম খরচ: {formatCurrency(finalExtraWorkCost)}
                  </span>
                </div>

                {/* Quick Add Presets */}
                <div className="p-3 bg-amber-50 border border-black space-y-2">
                  <span className="text-[11px] font-black uppercase text-slate-700 block">
                    ⚡ এক ক্লিকে অতিরিক্ত কাজের প্রিসেট যোগ করুন:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {EXTRA_WORK_PRESETS.map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => handleApplyExtraPreset(preset)}
                        className="text-[11px] font-bold bg-white hover:bg-yellow-300 border border-black px-2.5 py-1 rounded transition flex items-center gap-1 shadow-[1px_1px_0px_0px_#000000]"
                      >
                        <Plus size={11} />
                        {preset.name} ({formatCurrency(preset.rate)})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual Custom Extra Work Add Form */}
                <div className="p-3 bg-slate-50 border-2 border-black space-y-3">
                  <span className="text-[11px] font-black uppercase text-black block">
                    + কাস্টম অতিরিক্ত কাজের এন্ট্রি:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs font-bold">
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] uppercase mb-0.5">কাজের নাম / মালামালের বিবরণ</label>
                      <input
                        type="text"
                        list="dl-stock-items"
                        value={curExtraName}
                        onChange={(e) => setCurExtraName(e.target.value)}
                        placeholder="যেমন: অতিরিক্ত স্টেজ ফ্লাওয়ার বা এন্ট্রি গেট"
                        className="w-full bg-white border-2 border-black p-1.5"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase mb-0.5">পরিমাণ (Qty)</label>
                      <input
                        type="number"
                        min="1"
                        value={curExtraQty}
                        onChange={(e) => setCurExtraQty(Number(e.target.value))}
                        className="w-full bg-white border-2 border-black p-1.5 font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase mb-0.5">একক (Unit)</label>
                      <input
                        type="text"
                        list="dl-units"
                        value={curExtraUnit}
                        onChange={(e) => setCurExtraUnit(e.target.value)}
                        className="w-full bg-white border-2 border-black p-1.5"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase mb-0.5">দর (Rate)</label>
                      <input
                        type="number"
                        value={curExtraRate}
                        onChange={(e) => setCurExtraRate(Number(e.target.value))}
                        className="w-full bg-white border-2 border-black p-1.5 font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2 flex items-end">
                      <button
                        type="button"
                        onClick={handleAddExtraItem}
                        className="w-full neo-btn py-1.5 bg-yellow-400 hover:bg-yellow-300 font-black uppercase text-xs shadow-[2px_2px_0px_0px_#000000]"
                      >
                        যোগ করুন
                      </button>
                    </div>
                    <div className="sm:col-span-12">
                      <input
                        type="text"
                        value={curExtraNote}
                        onChange={(e) => setCurExtraNote(e.target.value)}
                        placeholder="অতিরিক্ত কাজের স্পেসিফিকেশন বা গ্রাহকের অনুরোধের নোট (ঐচ্ছিক)"
                        className="w-full bg-white border border-slate-400 p-1.5 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Table of added extra items */}
                {finalExtraItems.length > 0 ? (
                  <div className="border-2 border-black overflow-x-auto">
                    <table className="w-full text-left text-xs font-bold">
                      <thead className="bg-slate-100 border-b-2 border-black text-[10px] uppercase font-black">
                        <tr>
                          <th className="p-2 border-r-2 border-black text-center w-10">#</th>
                          <th className="p-2 border-r-2 border-black">কাজের বিবরণ</th>
                          <th className="p-2 border-r-2 border-black text-center w-20">পরিমাণ</th>
                          <th className="p-2 border-r-2 border-black text-right w-24">দর (Rate)</th>
                          <th className="p-2 border-r-2 border-black text-right w-28">মোট (Total)</th>
                          <th className="p-2 text-center w-12">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-black">
                        {finalExtraItems.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="p-2 border-r-2 border-black text-center font-mono">{idx + 1}</td>
                            <td className="p-2 border-r-2 border-black">
                              <p className="font-black text-black">{item.name}</p>
                              {item.note && <p className="text-[10px] text-slate-600 italic font-normal">{item.note}</p>}
                            </td>
                            <td className="p-2 border-r-2 border-black text-center font-mono">{item.qty} {item.unit}</td>
                            <td className="p-2 border-r-2 border-black text-right font-mono">{formatCurrency(item.rate)}</td>
                            <td className="p-2 border-r-2 border-black text-right font-mono font-black">{formatCurrency(item.total)}</td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveExtraItem(item.id)}
                                className="p-1 bg-red-100 hover:bg-red-500 hover:text-white border border-black rounded"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-4 text-xs font-bold text-slate-500 border border-dashed border-slate-300">
                    এখনও কোনো অতিরিক্ত কাজের আইটেম যোগ করা হয়নি। উপরের প্রিসেট বা ফর্ম থেকে যোগ করুন।
                  </p>
                )}
              </div>

              {/* Section 4: Extra Labour, Transport, Damage Compensation, Discount */}
              <div className="space-y-4 bg-slate-50 p-4 border-2 border-black">
                <h4 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-black text-yellow-400 rounded-full flex items-center justify-center text-[11px]">৪</span>
                  অতিরিক্ত পরিবহন, লেবার, ক্ষতিপূরণ ও ছাড় (Logistics, Labour, Damage & Discount)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-black">
                  <div>
                    <label className="block mb-1 text-[11px]">অতিরিক্ত পরিবহন / গাড়ি ভাড়া</label>
                    <input
                      type="number"
                      value={finalExtraTransport}
                      onChange={(e) => setFinalExtraTransport(Number(e.target.value))}
                      className="w-full bg-white border-2 border-black p-2 font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-[11px]">অতিরিক্ত লেবার / ওভারটাইম মজুরি</label>
                    <input
                      type="number"
                      value={finalExtraLabour}
                      onChange={(e) => setFinalExtraLabour(Number(e.target.value))}
                      className="w-full bg-white border-2 border-black p-2 font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-[11px] text-rose-900">মালামাল ড্যামেজ / ক্ষতিপূরণ ফি</label>
                    <input
                      type="number"
                      value={finalDamageCharge}
                      onChange={(e) => setFinalDamageCharge(Number(e.target.value))}
                      className="w-full bg-white border-2 border-rose-700 p-2 font-bold font-mono text-rose-900"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-[11px] text-indigo-900">বিশেষ ছাড় (Discount / কম)</label>
                    <input
                      type="number"
                      value={finalDiscount}
                      onChange={(e) => setFinalDiscount(Number(e.target.value))}
                      className="w-full bg-white border-2 border-indigo-700 p-2 font-bold font-mono text-indigo-900"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Payment Settlement & Terms */}
              <div className="space-y-4 bg-teal-50/50 p-4 border-2 border-black">
                <h4 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-black text-yellow-400 rounded-full flex items-center justify-center text-[11px]">৫</span>
                  পেমেন্ট সেটেলমেন্ট ও ইনভয়েস শর্তাবলী (Settlement Status & Terms)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-black">
                  <div>
                    <label className="block mb-1 text-[11px]">পেমেন্ট স্ট্যাটাস</label>
                    <select
                      value={finalPaymentStatus}
                      onChange={(e) => setFinalPaymentStatus(e.target.value as any)}
                      className="w-full bg-white border-2 border-black p-2 font-bold"
                    >
                      <option value="Paid">✓ সম্পূর্ণ পরিশোধিত (Paid in Full)</option>
                      <option value="Partial">⚠️ আংশিক পরিশোধিত (Partial Payment)</option>
                      <option value="Pending">❌ বকেয়া বিল (Pending / Due)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-[11px]">ফাইনাল পেমেন্ট পরিশোধ মাধ্যম (বাছাই বা কাস্টম)</label>
                    <input
                      type="text"
                      list="dl-payment-methods"
                      placeholder="যেমন: নগদ, বিকাশ বা ব্যাংক"
                      value={finalPaymentMethod}
                      onChange={(e) => setFinalPaymentMethod(e.target.value)}
                      className="w-full bg-white border-2 border-black p-2 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-black uppercase block">ফাইনাল ইনভয়েস শর্তাবলী ও নোট</label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setFinalTerms(`১. ইভেন্ট সমাপ্তির পর সমস্ত মালামাল সঠিক অবস্থায় গ্রহণ ও হিসাব সম্পন্ন করা হয়েছে।\n২. অতিরিক্ত কাজের জন্য নির্ধারিত বিল অনুমোদিত।\n৩. কোনো অসঙ্গতি থাকলে বিল প্রাপ্তির ৩ দিনের মধ্যে অবহিত করুন।`)}
                        className="text-[10px] font-bold bg-white hover:bg-slate-200 border border-black px-2 py-0.5 rounded"
                      >
                        স্ট্যান্ডার্ড শর্তাবলী
                      </button>
                      <button
                        type="button"
                        onClick={() => setFinalTerms(`১. ইভেন্টের সম্পূর্ণ বিল সফলভাবে পরিশোধিত হয়েছে। কোনো প্রকার বকেয়া নেই।\n২. রিত্তিকা ইভেন্ট ম্যানেজমেন্টের সাথে কাজ করার জন্য ধন্যবাদ!`)}
                        className="text-[10px] font-bold bg-white hover:bg-slate-200 border border-black px-2 py-0.5 rounded"
                      >
                        পরিশোধিত রসিদ
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={finalTerms}
                    onChange={(e) => setFinalTerms(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold leading-relaxed"
                  />
                </div>

                {/* Final Bill Multi-File Upload */}
                <div className="bg-slate-50 border-2 border-black p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase text-black">
                      ইভেন্ট সম্পন্নতার স্থিরচিত্র বা চূড়ান্ত বিল ভাউচার (Multiple Files)
                    </label>
                    <span className="text-[10px] text-teal-900 font-bold bg-teal-100 px-2 py-0.5 rounded border border-teal-300">
                      একাধিক ছবি বা পিডিএফ
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    onChange={handleFinalInvFileUpload}
                    className="w-full bg-white border-2 border-black p-2 text-xs cursor-pointer font-bold"
                  />
                  {finalInvFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-black text-slate-800">
                        ✓ সংযুক্ত ফাইলসমূহ ({finalInvFiles.length} টি):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {finalInvFiles.map((ff, idx) => (
                          <span key={idx} className="text-xs bg-white border-2 border-black text-black px-2 py-1 rounded flex items-center gap-1.5 shadow-[1px_1px_0px_0px_#000]">
                            <span className="max-w-[150px] truncate font-bold">{ff.name}</span>
                            <button
                              type="button"
                              onClick={() => setFinalInvFiles(prev => prev.filter((_, i) => i !== idx))}
                              className="text-red-500 hover:text-red-700 font-black text-sm"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Real-time Final Calculation Breakdown Card */}
              <div className="neo-card p-5 bg-yellow-100 border-4 border-black space-y-3">
                <h4 className="text-sm font-black uppercase tracking-wider text-black border-b-2 border-black pb-2 flex items-center justify-between">
                  <span>📊 চূড়ান্ত আর্থিক হিসাবের সারসংক্ষেপ (Final Financial Summary)</span>
                  <span className="font-mono text-xs">{finalInvNo}</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-black">
                  <div className="bg-white p-2.5 border-2 border-black">
                    <span className="text-[10px] uppercase text-slate-500 block">মূল চুক্তি বাজেট</span>
                    <span className="text-sm font-mono">{formatCurrency(finalBaseBudget)}</span>
                  </div>

                  <div className="bg-white p-2.5 border-2 border-black">
                    <span className="text-[10px] uppercase text-amber-700 block">অতিরিক্ত কাজের মোট</span>
                    <span className="text-sm font-mono text-amber-900">+{formatCurrency(finalExtraWorkCost)}</span>
                  </div>

                  <div className="bg-white p-2.5 border-2 border-black">
                    <span className="text-[10px] uppercase text-slate-700 block">লেবার/পরিবহন/ড্যামেজ</span>
                    <span className="text-sm font-mono">+{formatCurrency(finalExtraTransport + finalExtraLabour + finalDamageCharge - finalDiscount)}</span>
                  </div>

                  <div className="bg-white p-2.5 border-2 border-black">
                    <span className="text-[10px] uppercase text-teal-800 block">সর্বমোট প্রদেয় বিল</span>
                    <span className="text-base font-mono font-black text-black">{formatCurrency(finalNetPayable)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4 text-xs font-black">
                    <span className="text-emerald-800 bg-emerald-100 border border-black px-2.5 py-1 rounded">
                      পরিশোধিত অগ্রিম: -{formatCurrency(finalAdvancePaid)}
                    </span>
                    <span className={`px-2.5 py-1 rounded border border-black ${finalDueAmount > 0 ? 'bg-rose-200 text-rose-950 font-black' : 'bg-emerald-200 text-emerald-950'}`}>
                      {finalDueAmount > 0 ? `বকেয়া ব্যালেন্স: ${formatCurrency(finalDueAmount)}` : '✓ পূর্ণ পরিশোধিত'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingFinalInvoice(false)}
                      className="neo-btn px-4 py-2 bg-white hover:bg-slate-100 text-black font-black uppercase text-xs"
                    >
                      বাতিল
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveFinalInvoice}
                      className="neo-btn px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_#000000] flex items-center gap-2"
                    >
                      <Sparkles size={15} />
                      💾 ফাইনাল ইনভয়েস সংরক্ষণ ও প্রিন্ট প্রিভিউ
                    </button>
                  </div>
                </div>

              </div>

            </div>
          ) : activeTab === 'quotations' ? (
            
            /* 🌟 ACTIVE TAB: QUOTATIONS MODULE */
            isCreatingQuotation ? (
              
              /* 🌟 INTERACTIVE EVENT BUDGET QUOTATION FORM BUILDER */
              <div className="neo-card p-6 space-y-6 bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000000]" id="quotation-builder-form">
                
                {/* Form Header */}
                <div className="flex items-center justify-between border-b-2 border-black pb-3">
                  <div>
                    <h3 className="text-lg font-black uppercase italic text-black flex items-center gap-2">
                      <Calculator size={20} className="text-yellow-600" />
                      {editingQuotationId ? 'বাজেট কোটেশন সম্পাদনা করুন' : 'নতুন ইভেন্ট বাজেট কোটেশন বিল্ডার'}
                    </h3>
                    <p className="text-xs font-bold text-slate-600 mt-0.5">
                      কাস্টম ক্যাটাগরি, আইটেম ও বাজেট দর ইনপুট দিয়ে স্বয়ংক্রিয় প্রাক্কলিত বিল তৈরি করুন।
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCreatingQuotation(false)}
                    className="neo-btn px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 font-bold"
                  >
                    বাতিল (Close)
                  </button>
                </div>

                {/* Section 1: Budget Type & Meta Details */}
                <div className="space-y-4 bg-slate-50 p-4 border-2 border-black">
                  <h4 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                    <span className="w-5 h-5 bg-black text-yellow-400 rounded-full flex items-center justify-center text-[11px]">১</span>
                    বাজেটের ধরণ ও সাধারণ তথ্য
                  </h4>

                  {/* Budget Type Toggle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setQBudgetType('Estimated')}
                      className={`p-3 border-2 border-black cursor-pointer transition ${
                        qBudgetType === 'Estimated'
                          ? 'bg-amber-100 border-amber-600 shadow-[3px_3px_0px_0px_#000000]'
                          : 'bg-white hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock size={16} className={qBudgetType === 'Estimated' ? 'text-amber-700' : 'text-slate-500'} />
                        <span className="text-xs font-black uppercase">⚡ আনুমানিক বাজেট (Estimated)</span>
                      </div>
                      <p className="text-[10px] text-slate-600 font-bold mt-1">
                        ইভেন্টের প্রাথমিক ধারণা ও প্রাক্কলন বিল। বাজারদর বা প্রয়োজনীয়তা অনুযায়ী খরচ কম-বেশি হতে পারে।
                      </p>
                    </div>

                    <div
                      onClick={() => setQBudgetType('Fixed')}
                      className={`p-3 border-2 border-black cursor-pointer transition ${
                        qBudgetType === 'Fixed'
                          ? 'bg-emerald-100 border-emerald-600 shadow-[3px_3px_0px_0px_#000000]'
                          : 'bg-white hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className={qBudgetType === 'Fixed' ? 'text-emerald-700' : 'text-slate-500'} />
                        <span className="text-xs font-black uppercase">🔒 ফিক্সড বাজেট চুক্তি (Fixed Contract)</span>
                      </div>
                      <p className="text-[10px] text-slate-600 font-bold mt-1">
                        গ্রাহকের সাথে চূড়ান্ত চুক্তিভিত্তিক বাজেট। এই মূল্যের বাইরে অতিরিক্ত কোনো চার্জ নেওয়া হবে না।
                      </p>
                    </div>
                  </div>

                  {/* Meta inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-black">
                    <div>
                      <label className="block mb-1 text-[11px]">কোটেশন নম্বর</label>
                      <input
                        type="text"
                        value={qNo}
                        onChange={(e) => setQNo(e.target.value)}
                        className="w-full bg-white border-2 border-black p-2 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[11px]">প্রস্তাবের তারিখ</label>
                      <input
                        type="date"
                        value={qDate}
                        onChange={(e) => setQDate(e.target.value)}
                        className="w-full bg-white border-2 border-black p-2 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[11px]">মেয়াদ উত্তীর্ণ তারিখ</label>
                      <input
                        type="date"
                        value={qValidUntil}
                        onChange={(e) => setQValidUntil(e.target.value)}
                        className="w-full bg-white border-2 border-black p-2 font-bold"
                      />
                    </div>
                  </div>

                  {/* Customer & Event details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-black border-t border-slate-200">
                    <div>
                      <label className="block mb-1 text-[11px]">কাস্টমার নির্বাচন / নাম</label>
                      <div className="space-y-1">
                        <select
                          value={qCustomerId}
                          onChange={(e) => handleCustomerSelectForQuotation(e.target.value)}
                          className="w-full bg-white border-2 border-black p-2 font-bold"
                        >
                          <option value="">-- বিদ্যমান কাস্টমার বাছুন --</option>
                          {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={qCustomerName}
                          onChange={(e) => {
                            setQCustomerName(e.target.value);
                            setQCustomerId('');
                          }}
                          placeholder="অথবা নতুন ক্লায়েন্টের নাম"
                          className="w-full bg-white border-2 border-black p-1.5 font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 text-[11px]">গ্রাহকের মোবাইল নম্বর</label>
                      <input
                        type="text"
                        value={qCustomerMobile}
                        onChange={(e) => setQCustomerMobile(e.target.value)}
                        placeholder="০১৭০০০০০০০০"
                        className="w-full bg-white border-2 border-black p-2 font-bold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-[11px]">ইভেন্টের নাম / উপলক্ষ</label>
                      <input
                        type="text"
                        value={qEventName}
                        onChange={(e) => setQEventName(e.target.value)}
                        placeholder="যেমন: তানভীরের গায়ে হলুদ"
                        className="w-full bg-white border-2 border-black p-2 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-[11px]">ইভেন্ট তারিখ</label>
                      <input
                        type="date"
                        value={qEventDate}
                        onChange={(e) => setQEventDate(e.target.value)}
                        className="w-full bg-white border-2 border-black p-2 font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block mb-1 text-[11px]">ইভেন্টের ভেন্যু / স্থান</label>
                      <input
                        type="text"
                        value={qVenue}
                        onChange={(e) => setQVenue(e.target.value)}
                        placeholder="যেমন: সেনা মালঞ্চ অডিটোরিয়াম, ঢাকা"
                        className="w-full bg-white border-2 border-black p-2 font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Custom Categories & Items Addition Builder */}
                <div className="space-y-4 bg-yellow-50/50 p-4 border-2 border-black">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-black text-yellow-400 rounded-full flex items-center justify-center text-[11px]">২</span>
                      কাস্টম ক্যাটাগরি ও মালামালের বাজেট এন্ট্রি
                    </h4>
                    <span className="text-[11px] font-bold text-slate-600">
                      যুক্তকৃত আইটেম: {toBengaliNumber(qItems.length)} টি
                    </span>
                  </div>

                  {/* Item input box */}
                  <div className="p-3.5 bg-white border-2 border-black space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-black">
                      
                      {/* Category Selection */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px]">ক্যাটাগরি (বাছাই বা কাস্টম)</label>
                          <span className="text-[9px] text-slate-500 font-bold">ড্রপডাউন/টাইপ</span>
                        </div>
                        <input
                          type="text"
                          list="dl-quotation-categories"
                          value={customCategoryText || (curCategoryOption === 'অন্যান্য / কাস্টম ক্যাটাগরি' ? '' : curCategoryOption)}
                          onChange={(e) => {
                            setCustomCategoryText(e.target.value);
                            setCurCategoryOption(e.target.value);
                          }}
                          placeholder="যেমন: প্যান্ডেল ও স্টেজ / ড্রোন"
                          className="w-full bg-slate-50 border-2 border-black p-2 font-bold"
                        />
                      </div>

                      {/* Quick Category Presets dropdown */}
                      <div>
                        <label className="block mb-1 text-[11px]">প্রিসেট ক্যাটাগরি থেকে বাছুন</label>
                        <select
                          value={CATEGORY_PRESETS.includes(curCategoryOption) ? curCategoryOption : ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              setCurCategoryOption(e.target.value);
                              setCustomCategoryText(e.target.value);
                            }
                          }}
                          className="w-full bg-slate-50 border-2 border-black p-2 font-bold"
                        >
                          <option value="">-- দ্রুত প্রিসেট তালিকা --</option>
                          {CATEGORY_PRESETS.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Quick stock picker helper */}
                      <div>
                        <label className="block mb-1 text-[11px]">স্টক থেকে দ্রুত বাছাই (ঐচ্ছিক)</label>
                        <select
                          value={selectedStockPickerCode}
                          onChange={(e) => handleStockPickerChange(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-black p-2 font-bold text-slate-700"
                        >
                          <option value="">-- স্টক মালামাল নির্বাচন --</option>
                          {stockItems.map(st => (
                            <option key={st.code} value={st.code}>
                              [{st.category}] {st.name} (ভাড়া: ৳{st.rentalPrice || st.sellingPrice || 0})
                            </option>
                          ))}
                        </select>
                      </div>

                    </div>

                    {/* Item Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs font-black">
                      <div className="sm:col-span-5">
                        <label className="block mb-1 text-[11px]">মালামাল বা সেবার নাম (বাছাই বা কাস্টম) *</label>
                        <input
                          type="text"
                          list="dl-stock-items"
                          value={curItemName}
                          onChange={(e) => setCurItemName(e.target.value)}
                          placeholder="যেমন: ক্রিস্টাল রিং এন্ট্রি গেইট বা কাস্টম সার্ভিস"
                          className="w-full bg-slate-50 border-2 border-black p-2 font-bold"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block mb-1 text-[11px]">পরিমাণ (Qty)</label>
                        <input
                          type="number"
                          min={1}
                          value={curItemQty}
                          onChange={(e) => setCurItemQty(Number(e.target.value))}
                          className="w-full bg-slate-50 border-2 border-black p-2 font-bold font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block mb-1 text-[11px]">একক (Unit)</label>
                        <input
                          type="text"
                          list="dl-units"
                          value={curItemUnit}
                          onChange={(e) => setCurItemUnit(e.target.value)}
                          placeholder="টি/সেট/ফিট"
                          className="w-full bg-slate-50 border-2 border-black p-2 font-bold"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block mb-1 text-[11px]">বাজেট দর / রেট (টাকা) *</label>
                        <input
                          type="number"
                          min={0}
                          value={curItemRate}
                          onChange={(e) => setCurItemRate(Number(e.target.value))}
                          className="w-full bg-slate-50 border-2 border-black p-2 font-bold font-mono"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                      <div className="sm:col-span-9">
                        <label className="block mb-1 text-[11px] font-black">স্পেসিফিকেশন বা বিশেষ নোট (ঐচ্ছিক)</label>
                        <input
                          type="text"
                          value={curItemNote}
                          onChange={(e) => setCurItemNote(e.target.value)}
                          placeholder="যেমন: গোল্ডেন কালার, ১০x১২ ফিট সাইজ"
                          className="w-full bg-slate-50 border-2 border-black p-2 text-xs font-bold"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <button
                          type="button"
                          onClick={handleAddQuotationItem}
                          className="w-full neo-btn py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black uppercase text-xs flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_#000000]"
                        >
                          <PlusCircle size={14} />
                          + তালিকায় যুক্ত করুন
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Added Items List Table */}
                  {qItems.length === 0 ? (
                    <div className="p-6 text-center text-xs font-bold text-slate-500 border-2 border-dashed border-black bg-white">
                      এখনো কোনো মালামাল যোগ করা হয়নি। উপরের ফর্ম থেকে ক্যাটাগরি ও মালামাল একের পর এক যুক্ত করুন।
                    </div>
                  ) : (
                    <div className="border-2 border-black overflow-x-auto bg-white">
                      <table className="w-full text-left text-xs font-bold">
                        <thead className="bg-slate-100 border-b-2 border-black text-[10px] uppercase font-black tracking-wider text-black">
                          <tr>
                            <th className="p-2.5 border-r-2 border-black text-center w-10">#</th>
                            <th className="p-2.5 border-r-2 border-black w-28">ক্যাটাগরি</th>
                            <th className="p-2.5 border-r-2 border-black">মালামাল / সেবার নাম</th>
                            <th className="p-2.5 border-r-2 border-black text-center w-20">পরিমাণ</th>
                            <th className="p-2.5 border-r-2 border-black text-right w-24">দর (Rate)</th>
                            <th className="p-2.5 border-r-2 border-black text-right w-28">মোট টাকা</th>
                            <th className="p-2.5 text-center w-12">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y border-black">
                          {qItems.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-yellow-50/50">
                              <td className="p-2.5 border-r-2 border-black text-center font-mono">{idx + 1}</td>
                              <td className="p-2.5 border-r-2 border-black">
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-slate-100 border border-black rounded inline-block">
                                  {item.category}
                                </span>
                              </td>
                              <td className="p-2.5 border-r-2 border-black">
                                <p className="font-black text-black">{item.name}</p>
                                {item.note && (
                                  <p className="text-[10px] text-slate-500 font-normal mt-0.5">{item.note}</p>
                                )}
                              </td>
                              <td className="p-2.5 border-r-2 border-black text-center font-mono">
                                {item.qty} {item.unit}
                              </td>
                              <td className="p-2.5 border-r-2 border-black text-right font-mono">
                                {formatCurrency(item.rate)}
                              </td>
                              <td className="p-2.5 border-r-2 border-black text-right font-mono font-black text-black">
                                {formatCurrency(item.total)}
                              </td>
                              <td className="p-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuotationItem(item.id)}
                                  className="p-1 border border-black bg-rose-100 hover:bg-rose-500 hover:text-white text-rose-700 transition cursor-pointer"
                                  title="মুছুন"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Section 3: Extra Charges, Discount & Terms */}
                <div className="space-y-4 bg-slate-50 p-4 border-2 border-black">
                  <h4 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                    <span className="w-5 h-5 bg-black text-yellow-400 rounded-full flex items-center justify-center text-[11px]">৩</span>
                    অতিরিক্ত খরচ, ছাড় ও বাজেট শর্তাবলী
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-black">
                    <div>
                      <label className="block mb-1 text-[11px]">গাড়ি ভাড়া / পরিবহন খরচ</label>
                      <input
                        type="number"
                        min={0}
                        value={qTransportCharge}
                        onChange={(e) => setQTransportCharge(Number(e.target.value))}
                        className="w-full bg-white border-2 border-black p-2 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[11px]">শ্রমিক ও মজুরি খরচ</label>
                      <input
                        type="number"
                        min={0}
                        value={qLabourCharge}
                        onChange={(e) => setQLabourCharge(Number(e.target.value))}
                        className="w-full bg-white border-2 border-black p-2 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[11px]">বিশেষ ছাড় / ডিসকাউন্ট</label>
                      <input
                        type="number"
                        min={0}
                        value={qDiscount}
                        onChange={(e) => setQDiscount(Number(e.target.value))}
                        className="w-full bg-white border-2 border-black p-2 font-mono font-bold text-rose-600"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[11px]">প্রস্তাবিত বুকিং অগ্রিম</label>
                      <input
                        type="number"
                        min={0}
                        value={qAdvanceRequired}
                        onChange={(e) => setQAdvanceRequired(Number(e.target.value))}
                        className="w-full bg-white border-2 border-black p-2 font-mono font-bold text-indigo-700"
                      />
                    </div>
                  </div>

                  {/* Terms & Conditions Box with presets */}
                  <div className="pt-2 text-xs font-black space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px]">বাজেট কোটেশনের শর্তাবলী ও নিয়মাবলী</label>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setQTerms('১. ইভেন্ট বুকিং চূড়ান্ত করার জন্য ৫০% অগ্রিম প্রদেয়।\n২. মালামাল ক্ষতিগ্রস্ত হলে ক্লায়েন্ট ক্ষতিপূরণ দিতে বাধ্য থাকিবেন।\n৩. এই আনুমানিক বাজেট কোটেশনের মেয়াদ ৩০ দিন পর্যন্ত কার্যকর।')}
                          className="text-[10px] font-bold text-indigo-600 underline hover:text-indigo-800"
                        >
                          + স্ট্যান্ডার্ড শর্তাবলী লোড করুন
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={qTerms}
                      onChange={(e) => setQTerms(e.target.value)}
                      rows={3}
                      className="w-full bg-white border-2 border-black p-2 text-xs font-bold leading-relaxed"
                      placeholder="বাজেটের শর্তাবলী লিখুন..."
                    />
                  </div>

                  {/* Multi-file upload for Quotation */}
                  <div className="bg-slate-50 border-2 border-black p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase text-black">
                        রেফারেন্স ফটো, ড্রাফট বা ডিজাইন সংযুক্তি (Multiple Files)
                      </label>
                      <span className="text-[10px] text-yellow-900 font-bold bg-yellow-100 px-2 py-0.5 rounded border border-yellow-300">
                        একাধিক ছবি বা পিডিএফ আপলোড
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      multiple
                      onChange={handleQuotationFileUpload}
                      className="w-full bg-white border-2 border-black p-2 text-xs cursor-pointer font-bold"
                    />
                    {qFiles.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-black text-slate-800">
                          ✓ সংযুক্ত ফাইলসমূহ ({qFiles.length} টি):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {qFiles.map((qf, idx) => (
                            <span key={idx} className="text-xs bg-white border-2 border-black text-black px-2 py-1 rounded flex items-center gap-1.5 shadow-[1px_1px_0px_0px_#000]">
                              <span className="max-w-[150px] truncate font-bold">{qf.name}</span>
                              <button
                                type="button"
                                onClick={() => setQFiles(prev => prev.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:text-red-700 font-black text-sm"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 4: Live Total Budget Summary Calculation Box */}
                <div className="border-4 border-black p-4 bg-yellow-400 text-black space-y-2 shadow-[4px_4px_0px_0px_#000000]">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                    <div>
                      <span className="text-xs uppercase font-black tracking-wider block">
                        সর্বমোট প্রস্তাবিত বাজেট ({qBudgetType === 'Estimated' ? 'আনুমানিক প্রাক্কলন' : 'ফিক্সড চুক্তি'})
                      </span>
                      <p className="text-[11px] font-bold text-slate-800 mt-0.5">
                        মালামাল সাবটোটাল ({formatCurrency(qItems.reduce((acc, i) => acc + i.total, 0))}) + পরিবহন ও লেবার ({formatCurrency(qTransportCharge + qLabourCharge)}) - ছাড় ({formatCurrency(qDiscount)})
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl sm:text-3xl font-black font-mono">
                        {formatCurrency(Math.max(0, qItems.reduce((acc, i) => acc + i.total, 0) + qTransportCharge + qLabourCharge - qDiscount))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-2 border-t-2 border-black">
                  <button
                    type="button"
                    onClick={() => setIsCreatingQuotation(false)}
                    className="neo-btn px-5 py-2.5 bg-white text-black font-bold text-xs"
                  >
                    বাতিল (Cancel)
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveQuotation}
                    className="neo-btn px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_#000000]"
                  >
                    💾 কোটেশন সংরক্ষণ ও প্রিভিউ দেখুন
                  </button>
                </div>

              </div>
            ) : (
              
              /* 🌟 QUOTATIONS LIST EXPLORER & MANAGEMENT CARDS */
              <div className="space-y-6" id="quotations-explorer-view">
                
                {/* Search & Header Bar */}
                <div className="flex flex-col sm:flex-row gap-4 border-2 border-black p-4 bg-white shadow-[3px_3px_0px_0px_#000000] justify-between items-center">
                  <div className="relative w-full sm:w-80">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={15} className="text-slate-500" />
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="কোটেশন নং, কাস্টমার বা ইভেন্ট খুঁজুন..."
                      className="w-full bg-slate-50 border-2 border-black pl-9 pr-3 py-2 text-xs font-bold focus:outline-none"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <span className="text-xs font-black uppercase text-black font-mono">
                      মোট: {toBengaliNumber(filteredQuotations.length)} টি কোটেশন
                    </span>
                    <button
                      onClick={handleOpenNewQuotation}
                      className="neo-btn px-4 py-2 bg-yellow-400 text-black text-xs font-black uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_#000000]"
                    >
                      <Plus size={14} />
                      নতুন কোটেশন
                    </button>
                  </div>
                </div>

                {/* Quotation Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="quotations-grid">
                  {filteredQuotations.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-sm font-bold text-slate-500 border-4 border-dashed border-black bg-white p-6 space-y-3">
                      <Calculator size={40} className="mx-auto text-yellow-600" />
                      <p>কোনো বাজেট কোটেশন পাওয়া যায়নি।</p>
                      <button
                        onClick={handleOpenNewQuotation}
                        className="neo-btn px-4 py-2 bg-yellow-400 text-black text-xs font-black uppercase mx-auto inline-flex items-center gap-1"
                      >
                        <PlusCircle size={14} />
                        প্রথম বাজেট কোটেশন তৈরি করুন
                      </button>
                    </div>
                  ) : (
                    filteredQuotations.map(q => (
                      <div
                        key={q.id}
                        className="neo-card p-4 flex flex-col justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 bg-white border-2 border-black"
                      >
                        <div>
                          {/* Card Top Header */}
                          <div className="flex items-start justify-between border-b border-slate-200 pb-2.5 mb-3 gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 border border-black rounded ${
                                  q.budgetType === 'Estimated' ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                                }`}>
                                  {q.budgetType === 'Estimated' ? '⚡ আনুমানিক বাজেট' : '🔒 ফিক্সড বাজেট'}
                                </span>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 border border-black rounded ${
                                  q.status === 'Converted' ? 'bg-teal-200 text-teal-900' :
                                  q.status === 'Sent' ? 'bg-indigo-200 text-indigo-900' : 'bg-slate-100 text-slate-800'
                                }`}>
                                  {q.status === 'Converted' ? 'কনফার্মড ইভেন্ট' : q.status === 'Sent' ? 'প্রেরিত' : 'খসড়া'}
                                </span>
                              </div>
                              <span className="text-xs font-black text-black font-mono mt-1 block">
                                {q.quotationNo}
                              </span>
                            </div>

                            {/* Quick Action Buttons */}
                            <div className="flex gap-1">
                              <button
                                onClick={() => setPreviewInvoice({ id: q.id, type: 'quotations', data: q })}
                                className="p-1.5 border-2 border-black bg-white hover:bg-yellow-400 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                                title="প্রিভিউ ও প্রিন্ট"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                onClick={() => triggerShare(q, 'quotations')}
                                className="p-1.5 border-2 border-black bg-teal-100 hover:bg-teal-400 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                                title="হোয়াটসঅ্যাপ শেয়ার"
                              >
                                <Share2 size={13} />
                              </button>
                              <button
                                onClick={() => handleEditQuotation(q)}
                                className="p-1.5 border-2 border-black bg-amber-100 hover:bg-amber-400 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                                title="সম্পাদনা করুন"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={() => onDeleteQuotation(q.id)}
                                className="p-1.5 border-2 border-black bg-red-100 hover:bg-red-500 hover:text-white text-red-700 transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Event & Client Details */}
                          <div className="space-y-1">
                            <h4 className="text-sm font-black text-black leading-tight">
                              {q.eventName || 'ইভেন্ট বাজেট কোটেশন'}
                            </h4>
                            <p className="text-xs font-bold text-slate-700">
                              গ্রাহক: {q.customerName || 'অজানা ক্লায়েন্ট'} ({q.customerMobile || 'মোবাইল নেই'})
                            </p>
                            {q.venue && (
                              <p className="text-[11px] text-slate-600 font-bold">
                                স্থান: {q.venue}
                              </p>
                            )}
                            <p className="text-[10px] text-slate-500 font-mono">
                              তারিখ: {q.date} {q.eventDate && `| ইভেন্ট: ${q.eventDate}`}
                            </p>
                          </div>

                          {/* Item Categories Chips */}
                          <div className="mt-3 flex flex-wrap gap-1">
                            {Array.from(new Set(q.items.map(i => i.category))).map(cat => (
                              <span key={cat} className="text-[9px] font-bold bg-slate-100 border border-black px-1.5 py-0.2 rounded">
                                {cat}
                              </span>
                            ))}
                            <span className="text-[9px] font-bold text-slate-500 self-center">
                              ({toBengaliNumber(q.items.length)} টি আইটেম)
                            </span>
                          </div>
                        </div>

                        {/* Card Bottom Footer with Grand Total & Convert Button */}
                        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-500 block">
                              প্রস্তাবিত বাজেট
                            </span>
                            <span className="text-base font-black font-mono text-black">
                              {formatCurrency(q.grandTotal)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenFinalInvoice(q)}
                              className="neo-btn px-2.5 py-1.5 text-[11px] bg-amber-400 hover:bg-amber-300 font-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_#000000]"
                              title="ইভেন্ট সম্পন্ন করার পর এই কোটেশনের চূড়ান্ত বিল তৈরি করুন"
                            >
                              <Sparkles size={12} />
                              ফাইনাল বিল
                            </button>

                            {q.status !== 'Converted' ? (
                              <button
                                onClick={() => {
                                  if (window.confirm(`আপনি কি "${q.eventName}" কোটেশনটিকে কনফার্মড ইভেন্টে রূপান্তর করতে চান?`)) {
                                    if (onConvertQuotationToEvent) {
                                      onConvertQuotationToEvent(q);
                                    }
                                  }
                                }}
                                className="neo-btn px-2.5 py-1.5 text-[11px] bg-emerald-400 hover:bg-emerald-300 font-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_#000000]"
                                title="কোটেশনটিকে চূড়ান্ত ইভেন্টে রূপান্তর করুন"
                              >
                                <CheckCircle2 size={12} />
                                কনভার্ট
                              </button>
                            ) : (
                              <span className="text-[10px] font-black text-teal-700 bg-teal-50 border border-teal-600 px-2 py-1 rounded">
                                ✓ কনফার্মড
                              </span>
                            )}
                          </div>
                        </div>

                      </div>
                    ))
                  )}
                </div>

              </div>
            )
          ) : activeTab === 'all-saved-invoices' ? (
            
            /* 🌟 MODULE: COMPREHENSIVE SAVED INVOICES & MEMO ARCHIVE (WITH LIVE EDIT & DELETE & PREVIEW) */
            <div className="space-y-6" id="all-saved-invoices-archive-view">
              
              {/* Archive Header & Search Controls */}
              <div className="flex flex-col sm:flex-row gap-4 border-2 border-black p-4 bg-white shadow-[3px_3px_0px_0px_#000000] justify-between items-center">
                <div className="relative w-full sm:w-80">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={15} className="text-slate-500" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ইনভয়েস নং, গ্রাহকের নাম, মোবাইল বা ইভেন্ট খুঁজুন..."
                    className="w-full bg-slate-50 border-2 border-black pl-9 pr-3 py-2 text-xs font-bold focus:outline-none focus:bg-white"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-black font-bold text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-xs font-black uppercase text-black bg-yellow-300 border border-black px-2.5 py-1 rounded shadow-sm">
                    মোট সংরক্ষিত: {toBengaliNumber(allSavedInvoicesList.length)} টি
                  </span>
                </div>
              </div>

              {/* Invoices List Display */}
              <div className="space-y-3" id="saved-invoices-list-container">
                {allSavedInvoicesList.length === 0 ? (
                  <div className="py-16 text-center text-sm font-bold text-slate-500 border-4 border-dashed border-black bg-white space-y-3">
                    <Folder size={40} className="mx-auto text-slate-400" />
                    <p>কোনো সংরক্ষিত ইনভয়েস বা কোটেশন পাওয়া যায়নি।</p>
                    <button
                      onClick={handleOpenNewQuotation}
                      className="neo-btn px-4 py-2 text-xs bg-yellow-400 font-black uppercase"
                    >
                      + নতুন কোটেশন তৈরি করুন
                    </button>
                  </div>
                ) : (
                  allSavedInvoicesList.map(item => (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="neo-card p-4 sm:p-5 bg-white border-2 border-black hover:shadow-[5px_5px_0px_0px_#000000] transition-all space-y-3"
                    >
                      {/* Top Row: Type & Number & Date */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded border border-black shadow-sm ${
                            item.type === 'quotations' ? 'bg-amber-300 text-black' :
                            item.type === 'event' ? 'bg-teal-300 text-black' :
                            item.type === 'sales' ? 'bg-emerald-300 text-black' :
                            item.type === 'rental' ? 'bg-blue-300 text-black' :
                            'bg-rose-300 text-black'
                          }`}>
                            {item.typeLabel}
                          </span>
                          <span className="font-mono font-black text-xs text-slate-900">
                            নং: {item.number}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500 font-mono">
                            📅 {item.date}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                            item.status === 'Converted' ? 'bg-teal-100 border-teal-600 text-teal-900' :
                            item.status === 'Paid' || item.due === 0 ? 'bg-emerald-100 border-emerald-600 text-emerald-900' :
                            item.status === 'Due' ? 'bg-rose-100 border-rose-600 text-rose-900' :
                            item.status === 'Partial' ? 'bg-amber-100 border-amber-600 text-amber-900' :
                            'bg-slate-100 border-slate-400 text-slate-800'
                          }`}>
                            {item.status === 'Converted' ? '✓ কনভার্টেড' :
                             item.status === 'Paid' || item.due === 0 ? '✓ পরিশোধিত (Paid)' :
                             item.status === 'Due' ? '● বকেয়া (Due)' :
                             item.status === 'Partial' ? '◐ আংশিক (Partial)' :
                             item.status === 'Fixed' ? 'ফিক্সড বাজেট' : 'আনুমানিক এস্টিমেট'}
                          </span>
                          {item.files.length > 0 && (
                            <span className="text-[10px] bg-indigo-50 border border-indigo-300 text-indigo-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                              📎 {item.files.length} ফাইল
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle Row: Name / Party / Financials */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs">
                        <div className="sm:col-span-6 space-y-1">
                          <h4 className="font-black text-sm text-slate-950 flex items-center gap-1.5">
                            {item.name}
                          </h4>
                          <p className="text-slate-700 font-bold flex items-center gap-1">
                            <User size={12} className="text-slate-500" />
                            <span>{item.partyName}</span>
                            {item.partyMobile && (
                              <span className="text-slate-500 font-mono text-[11px]">({item.partyMobile})</span>
                            )}
                          </p>
                        </div>

                        {/* Financial Amounts breakdown */}
                        <div className="sm:col-span-6 flex items-center justify-start sm:justify-end gap-3 sm:gap-4 flex-wrap bg-slate-50 p-2 border border-slate-200 rounded font-mono">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-slate-500 uppercase block font-bold">মোট বিল</span>
                            <span className="font-black text-sm text-slate-900">{formatCurrency(item.amount)}</span>
                          </div>
                          {item.type !== 'purchase' && (
                            <>
                              <div className="text-left sm:text-right">
                                <span className="text-[10px] text-emerald-700 uppercase block font-bold">পরিশোধ</span>
                                <span className="font-black text-xs text-emerald-800">{formatCurrency(item.paid)}</span>
                              </div>
                              {item.due > 0 && (
                                <div className="text-left sm:text-right">
                                  <span className="text-[10px] text-rose-700 uppercase block font-bold">বকেয়া</span>
                                  <span className="font-black text-xs text-rose-800">{formatCurrency(item.due)}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Bottom Row: Actions (Preview, Edit, WhatsApp, Delete) */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* 👁️ View & Print */}
                          <button
                            onClick={() => setPreviewInvoice({ id: item.id, type: item.type as any, data: item.originalData })}
                            className="neo-btn px-3 py-1.5 text-xs bg-yellow-400 hover:bg-yellow-300 font-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_#000000]"
                            title="ইনভয়েস প্রিভিউ ও প্রিন্ট"
                          >
                            <Eye size={13} />
                            <span>প্রিভিউ ও প্রিন্ট</span>
                          </button>

                          {/* ✏️ Edit (Full Form Editor) */}
                          <button
                            onClick={() => setEditingTarget({ type: item.type, data: item.originalData })}
                            className="neo-btn px-3 py-1.5 text-xs bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_#000000]"
                            title="ইনভয়েসের বিস্তারিত তথ্য এডিট করুন"
                          >
                            <Edit3 size={13} />
                            <span>এডিট</span>
                          </button>

                          {/* 💬 WhatsApp Share */}
                          {item.partyMobile && (
                            <button
                              onClick={() => triggerShare(item.originalData, item.type as any)}
                              className="neo-btn px-3 py-1.5 text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_#000000]"
                              title="হোয়াটসঅ্যাপে পাঠান"
                            >
                              <Share2 size={13} />
                              <span>হোয়াটসঅ্যাপ</span>
                            </button>
                          )}

                          {/* Convert to event for quotations */}
                          {item.type === 'quotations' && item.status !== 'Converted' && (
                            <button
                              onClick={() => {
                                if (window.confirm(`আপনি কি "${item.name}" কোটেশনটিকে কনফার্মড ইভেন্টে রূপান্তর করতে চান?`)) {
                                  if (onConvertQuotationToEvent) {
                                    onConvertQuotationToEvent(item.originalData);
                                  }
                                }
                              }}
                              className="neo-btn px-3 py-1.5 text-xs bg-teal-400 hover:bg-teal-300 font-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_#000000]"
                              title="কোটেশন কনফার্মড ইভেন্টে রূপান্তর"
                            >
                              <CheckCircle2 size={13} />
                              <span>কনভার্ট</span>
                            </button>
                          )}
                        </div>

                        {/* 🗑️ Delete Button */}
                        <button
                          onClick={() => {
                            if (window.confirm(`আপনি কি নিশ্চিত যে "${item.number}" ইনভয়েসটি মুছে ফেলতে চান?`)) {
                              if (item.type === 'quotations') onDeleteQuotation(item.id);
                              else if (item.type === 'event') onDeleteEventInvoice(item.id);
                              else if (item.type === 'sales') onDeleteSalesInvoice(item.id);
                              else if (item.type === 'rental') onDeleteRentalInvoice(item.id);
                              else if (item.type === 'purchase') onDeletePurchaseInvoice(item.id);
                            }
                          }}
                          className="neo-btn px-2.5 py-1.5 text-xs bg-rose-100 hover:bg-rose-600 hover:text-white text-rose-800 font-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_#000000]"
                          title="ইনভয়েস মুছে ফেলুন"
                        >
                          <Trash2 size={13} />
                          <span>ডিলিট</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            
            /* Otherwise, show standard list view with explorer & search for Document Center, Purchase, etc. */
            <div className="space-y-6" id="documents-explorer-view">
              
              {/* Search & Statistics */}
              <div className="flex flex-col sm:flex-row gap-4 border-2 border-black p-4 bg-white shadow-[3px_3px_0px_0px_#000000] justify-between items-center">
                <div className="relative w-full sm:w-72">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={15} className="text-slate-500" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ইনভয়েস নম্বর বা সরবরাহকারী খুঁজুন..."
                    className="w-full bg-slate-50 border-2 border-black pl-9 pr-3 py-1.5 text-xs font-bold focus:outline-none"
                  />
                </div>
                <div className="text-xs font-black uppercase text-black">
                  ফিল্টারকৃত আইটেম: {toBengaliNumber(folderDocumentsList.length)} টি ফাইল
                </div>
              </div>

              {/* Folder Documents Table Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="explorer-grid">
                {folderDocumentsList.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-sm font-bold text-slate-500 border-4 border-dashed border-black">
                    এই ফোল্ডারে কোনো ফাইল বা ইনভয়েস পাওয়া যায়নি।
                  </div>
                ) : (
                  folderDocumentsList.map(doc => (
                    <div 
                      key={doc.id} 
                      className="neo-card p-4 flex flex-col justify-between hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150"
                    >
                      <div className="flex items-start justify-between border-b border-slate-200 pb-2.5 mb-3 gap-2">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-indigo-600 shrink-0" />
                          <div>
                            <span className="text-[9px] bg-slate-100 border border-black px-1 rounded uppercase font-mono font-black">{doc.type}</span>
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{doc.date}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setPreviewInvoice({ id: doc.id, type: doc.folder as any, data: doc.data })}
                            className="p-1.5 border-2 border-black bg-white hover:bg-yellow-400 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                            title="ইনভয়েস প্রিভিউ"
                          >
                            <Eye size={12} />
                          </button>
                          {doc.previewUrl && (
                            <a
                              href={doc.previewUrl}
                              download={doc.name}
                              className="p-1.5 border-2 border-black bg-slate-50 hover:bg-indigo-300 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_#000000] flex items-center justify-center"
                              title="ফাইল ডাউনলোড"
                            >
                              <Download size={12} />
                            </a>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm('আপনি কি এই ইনভয়েস / ডকুমেন্টটি মুছে ফেলতে চান?')) {
                                if (doc.folder === 'quotations') onDeleteQuotation(doc.id);
                                else if (doc.folder === 'purchase') onDeletePurchaseInvoice(doc.id);
                                else if (doc.folder === 'sales') onDeleteSalesInvoice(doc.id);
                                else if (doc.folder === 'rental') onDeleteRentalInvoice(doc.id);
                                else if (doc.folder === 'event') onDeleteEventInvoice(doc.id);
                                else onDeleteAttachment(doc.id);
                              }
                            }}
                            className="p-1.5 border-2 border-black bg-red-100 hover:bg-red-500 hover:text-white text-red-700 transition cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-xs font-black text-black leading-snug">{doc.name}</h4>
                      
                      {/* Short Invoice Summary Footer in Card */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-black">
                        {doc.folder === 'quotations' && (
                          <>
                            <span className="text-amber-700">বাজেট: {formatCurrency(doc.data.grandTotal)}</span>
                            <span className="text-slate-500 font-mono">{doc.data.quotationNo}</span>
                          </>
                        )}
                        {doc.folder === 'purchase' && (
                          <>
                            <span className="text-slate-600">মোট: {formatCurrency(doc.data.totalAmount)}</span>
                            <span className="text-indigo-600">Supplier: {doc.data.supplierName}</span>
                          </>
                        )}
                        {doc.folder === 'sales' && (
                          <>
                            <span className="text-emerald-600">বিল: {formatCurrency(doc.data.grandTotal)}</span>
                            <span className="text-slate-500">কাস্টমার: {doc.data.customerName}</span>
                          </>
                        )}
                        {doc.folder === 'rental' && (
                          <>
                            <span className="text-amber-600">বিল: {formatCurrency(doc.data.totalBill)}</span>
                            <span className="text-slate-500">বকেয়া: {formatCurrency(doc.data.dueAmount)}</span>
                          </>
                        )}
                        {doc.folder === 'event' && (
                          <>
                            <span className="text-teal-600">বাজেট: {formatCurrency(doc.data.totalCost)}</span>
                            <span className="text-slate-500">ইভেন্ট: {doc.data.eventName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* 🌟 DIALOG: NEW SUPPLIER PURCHASE INVOICE FORM (MODULE 21) */}
      {isAddPurchaseOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto no-print">
          <div className="bg-white border-4 border-black max-w-2xl w-full p-6 shadow-[8px_8px_0px_0px_#000000] relative">
            <button 
              onClick={() => setIsAddPurchaseOpen(false)}
              className="absolute top-4 right-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
            >
              <X size={14} className="stroke-[2.5]" />
            </button>

            <h3 className="text-lg font-black uppercase italic text-black border-b-2 border-black pb-2 mb-4">Supplier ক্রয় চালান এন্ট্রি (Purchase Invoice Entry)</h3>
            
            <form onSubmit={handleCreatePurchaseInvoice} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-black">
              
              <div>
                <label className="uppercase block mb-1">পারচেস নং (Purchase No)</label>
                <input
                  type="text"
                  required
                  value={purchaseNo}
                  onChange={(e) => setPurchaseNo(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-black p-2 font-bold"
                />
              </div>

              <div>
                <label className="uppercase block mb-1">চালান নম্বর (Invoice Number)</label>
                <input
                  type="text"
                  required
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-black p-2 font-bold"
                  placeholder="যেমন: INV-9921"
                />
              </div>

              <div>
                <label className="uppercase block mb-1">তারিখ (Date)</label>
                <input
                  type="date"
                  required
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-black p-2 font-bold"
                />
              </div>

              <div>
                <label className="uppercase block mb-1">সরবরাহকারী নাম (Supplier Name)</label>
                <input
                  type="text"
                  list="dl-suppliers"
                  required
                  value={pSupplierName}
                  onChange={(e) => setPSupplierName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-black p-2 font-bold"
                  placeholder="যেমন: বেঙ্গল ইভেন্ট সাপ্লায়ার বা কাস্টম"
                />
              </div>

              <div>
                <label className="uppercase block mb-1">সরবরাহকারী মোবাইল (Supplier Mobile)</label>
                <input
                  type="text"
                  value={pSupplierMobile}
                  onChange={(e) => setPSupplierMobile(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-black p-2 font-bold font-mono"
                  placeholder="যেমন: ০১৭০০০০০০০০"
                />
              </div>

              <div>
                <label className="uppercase block mb-1">মালামাল / সামগ্রীর নাম (Item Name)</label>
                <input
                  type="text"
                  list="dl-stock-items"
                  required
                  value={pItemName}
                  onChange={(e) => setPItemName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-black p-2 font-bold"
                  placeholder="যেমন: ক্রিস্টাল ঝাড়বাতি বা কাস্টম আইটেম"
                />
              </div>

              <div>
                <label className="uppercase block mb-1">পরিমাণ (Quantity)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={pQty}
                  onChange={(e) => setPQty(Number(e.target.value))}
                  className="w-full bg-slate-50 border-2 border-black p-2 font-bold font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="uppercase block mb-1">একক (Unit)</label>
                  <input
                    type="text"
                    list="dl-units"
                    required
                    value={pUnit}
                    onChange={(e) => setPUnit(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-black p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="uppercase block mb-1">একক মূল্য (Price)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={pUnitPrice}
                    onChange={(e) => setPUnitPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border-2 border-black p-2 font-bold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="uppercase block mb-1">পেমেন্ট স্ট্যাটাস (Payment Status)</label>
                <select
                  value={pPaymentStatus}
                  onChange={(e) => setPPaymentStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border-2 border-black p-2 font-bold cursor-pointer"
                >
                  <option value="Paid">পরিশোধিত (Paid)</option>
                  <option value="Due">বকেয়া (Due)</option>
                  <option value="Partial">আংশিক (Partial)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="uppercase block font-bold text-xs">চালান ও রসিদ ফাইল আপলোড (Multiple Files)</label>
                  <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                    একাধিক ফাইল নির্বাচন করা যাবে
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={handlePurchaseFileUpload}
                  className="w-full bg-slate-50 border-2 border-black p-1.5 font-bold cursor-pointer"
                />
                {pFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-[11px] font-black text-emerald-800">
                      ✓ মোট {pFiles.length} টি ফাইল সংযুক্ত:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {pFiles.map((pf, idx) => (
                        <span key={idx} className="text-[10px] bg-emerald-50 border border-emerald-300 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                          <span className="max-w-[120px] truncate">{pf.name}</span>
                          <button
                            type="button"
                            onClick={() => setPFiles(prev => prev.filter((_, i) => i !== idx))}
                            className="text-rose-600 hover:text-rose-800 font-black"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="sm:col-span-2 pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPurchaseOpen(false)}
                  className="neo-btn px-4 py-2 bg-white text-black"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="neo-btn px-5 py-2 bg-indigo-500 text-white"
                >
                  চালানটি সংরক্ষণ করুন
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 🌟 DIGITAL SIGNATURE & OFFICIAL RUBBER SEAL CONFIGURATOR MODAL */}
      <DigitalSignatureModal
        isOpen={isSignOpen}
        onClose={() => setIsSignOpen(false)}
        settings={sigSettings}
        onSaveSettings={(newSettings) => {
          setSigSettings(newSettings);
          setPreviewSealEnabled(newSettings.showCompanySeal);
          setPreviewStampColor(newSettings.statusStampColorTheme || 'royal-blue');
        }}
      />

      {/* 🌟 DIALOG: ADVANCED SHARE & PDF DISPATCH CONTROLLER */}
      {sharingInvoice && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 overflow-y-auto no-print backdrop-blur-xs">
          <div className="bg-white border-4 border-black max-w-lg w-full p-6 shadow-[10px_10px_0px_0px_#000000] relative animate-in fade-in zoom-in duration-150">
            <button 
              onClick={() => {
                setSharingInvoice(null);
                setCopiedLinkToast(false);
              }}
              className="absolute top-4 right-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
              title="বন্ধ করুন"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 border-b-3 border-black pb-3 mb-4">
              <div className="p-2 bg-emerald-400 border-2 border-black rounded shadow-[2px_2px_0px_0px_#000000]">
                <Share2 size={18} className="text-black" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase text-black leading-tight">
                  ইনভয়েস বিল ও PDF ফাইল সরাসরি শেয়ার
                </h3>
                <p className="text-xs text-slate-600 font-bold">
                  WhatsApp ও ইমেইলে গ্রাহককে অফিসিয়াল কপি প্রেরণ করুন
                </p>
              </div>
            </div>

            {/* Document summary strip */}
            <div className="bg-slate-100 border-2 border-black p-3 mb-4 text-xs font-bold space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">গ্রাহক / ইভেন্ট:</span>
                <span className="font-black text-black">{sharingInvoice.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">ডকুমেন্ট / বিল নং:</span>
                <span className="font-mono font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 border border-indigo-200 rounded">
                  {sharingInvoice.id}
                </span>
              </div>
              {(sharingInvoice.total || 0) > 0 && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-300">
                  <span className="text-slate-600">মোট বিল: <span className="font-black text-black">{formatCurrency(sharingInvoice.total || 0)}</span></span>
                  <span className="text-emerald-700 font-black">পরিশোধ: {formatCurrency(sharingInvoice.paid || 0)}</span>
                  {(sharingInvoice.due || 0) > 0 ? (
                    <span className="text-rose-600 font-black">বকেয়া: {formatCurrency(sharingInvoice.due || 0)}</span>
                  ) : (
                    <span className="text-emerald-700 font-black bg-emerald-100 px-1 rounded">পরিশোধিত ✓</span>
                  )}
                </div>
              )}
            </div>

            {/* Method switcher */}
            <div className="space-y-4 text-xs font-black">
              <div>
                <label className="block mb-1.5 text-slate-700 uppercase">প্রেরণের মাধ্যম বেছে নিন</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShareMethod('whatsapp');
                      setShareTarget(sharingInvoice.mobile || '');
                    }}
                    className={`py-2.5 px-3 border-2 border-black text-center flex items-center justify-center gap-2 font-black transition cursor-pointer shadow-[2px_2px_0px_0px_#000000] ${
                      shareMethod === 'whatsapp' ? 'bg-emerald-400 text-black' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Send size={15} />
                    <span>WhatsApp শেয়ার</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShareMethod('email');
                      setShareTarget(sharingInvoice.email || 'client@example.com');
                    }}
                    className={`py-2.5 px-3 border-2 border-black text-center flex items-center justify-center gap-2 font-black transition cursor-pointer shadow-[2px_2px_0px_0px_#000000] ${
                      shareMethod === 'email' ? 'bg-indigo-400 text-black' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Mail size={15} />
                    <span>Email শেয়ার</span>
                  </button>
                </div>
              </div>

              {/* Target recipient input */}
              <div>
                <label className="block mb-1 text-slate-800 font-black">
                  {shareMethod === 'whatsapp' ? 'হোয়াটসঅ্যাপ মোবাইল নম্বর (যেমন: 017xxxxxxxx)' : 'গ্রাহক ইমেইল এড্রেস'}
                </label>
                <input
                  type="text"
                  value={shareTarget}
                  onChange={(e) => setShareTarget(e.target.value)}
                  placeholder={shareMethod === 'whatsapp' ? '০১৭xxxxxxxx' : 'client@email.com'}
                  className="w-full bg-slate-50 border-2 border-black p-2.5 font-bold font-mono text-sm shadow-[inset_1px_1px_0px_0px_#000000]"
                />
              </div>

              {/* Primary Fast Action Buttons */}
              <div className="space-y-2 pt-2">
                {shareMethod === 'whatsapp' ? (
                  <>
                    <button
                      type="button"
                      onClick={handleDirectWhatsAppShareWithPdf}
                      className="w-full neo-btn py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase text-sm flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000000] cursor-pointer"
                    >
                      <Send size={16} />
                      <span>১-ক্লিকে PDF ডাউনলোড ও WhatsApp ওপেন</span>
                    </button>

                    {/* Native Web Share with File attachment (ideal for mobile WhatsApp) */}
                    <button
                      type="button"
                      onClick={handleNativeFileShare}
                      disabled={isSharingNative}
                      className="w-full neo-btn py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-black uppercase text-xs flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000000] cursor-pointer disabled:opacity-50"
                    >
                      <Smartphone size={15} />
                      <span>{isSharingNative ? 'PDF ফাইল তৈরি হচ্ছে...' : '📱 ফোনে সরাসরি WhatsApp-এ PDF ফাইল সহ পাঠান'}</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleDirectEmailShareWithPdf}
                    className="w-full neo-btn py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-sm flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000000] cursor-pointer"
                  >
                    <Mail size={16} />
                    <span>১-ক্লিকে PDF ডাউনলোড ও ইমেইল ক্লায়েন্ট ওপেন</span>
                  </button>
                )}

                {/* Auxiliary quick action buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      if (previewInvoice) {
                        handleDirectPdfDownload();
                      } else {
                        // If preview invoice not already set, open preview
                        const found = quotations.find(q => q.quotationNo === sharingInvoice.id) ||
                          eventInvoices.find(e => e.invoiceNo === sharingInvoice.id) ||
                          salesInvoices.find(s => s.invoiceNo === sharingInvoice.id) ||
                          rentalInvoices.find(r => r.invoiceNo === sharingInvoice.id);
                        if (found) {
                          setPreviewInvoice({ id: sharingInvoice.id, type: sharingInvoice.type as any, data: found });
                        }
                        handleDirectPdfDownload();
                      }
                    }}
                    className="py-2 px-2.5 border-2 border-black bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                  >
                    <Download size={13} />
                    <span>📥 PDF ডাউনলোড</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const text = buildShareText(sharingInvoice);
                      navigator.clipboard.writeText(text);
                      setCopiedLinkToast(true);
                      setTimeout(() => setCopiedLinkToast(false), 3000);
                    }}
                    className="py-2 px-2.5 border-2 border-black bg-white hover:bg-slate-100 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                  >
                    {copiedLinkToast ? (
                      <>
                        <CheckCheck size={13} className="text-emerald-600" />
                        <span className="text-emerald-700">কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>📋 মেসেজ টেক্সট কপি</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Informative footer note */}
              <div className="p-2.5 bg-amber-50 border border-amber-300 rounded text-[11px] text-amber-900 font-semibold leading-relaxed flex items-start gap-1.5">
                <AlertCircle size={14} className="text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>টিপস:</strong> বোতামে ক্লিক করলে মূল <strong>PDF ফাইলটি</strong> স্বয়ংক্রিয়ভাবে আপনার ডিভাইসে ডাউনলোড হবে এবং WhatsApp চ্যাট ওপেন হয়ে যাবে। আপনি শুধু চ্যাটে ফাইলটি এটাচ/ড্রপ করলেই গ্রাহক মূল PDF পেয়ে যাবেন।
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 MODAL: FULL INVOICE & QUOTATION EDIT MODAL */}
      {editingTarget && (
        <InvoiceEditModal
          isOpen={!!editingTarget}
          onClose={() => setEditingTarget(null)}
          target={editingTarget}
          onUpdateQuotation={onUpdateQuotation}
          onUpdateEventInvoice={onUpdateEventInvoice}
          onUpdateSalesInvoice={onUpdateSalesInvoice}
          onUpdateRentalInvoice={onUpdateRentalInvoice}
          onUpdatePurchaseInvoice={onUpdatePurchaseInvoice}
        />
      )}

    </div>
  );
}
