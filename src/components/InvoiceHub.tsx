import React, { useState, useMemo, useRef } from 'react';
import { 
  Folder, FileText, Search, Plus, Upload, Download, Printer, Share2, 
  Trash2, Eye, ShieldCheck, Mail, Send, Check, RefreshCw, Layers, CheckSquare, 
  DollarSign, FileSpreadsheet, Sparkles, PenTool, X, ChevronRight, User, Calendar,
  Calculator, Tag, CheckCircle2, ArrowRight, Clock, Edit3, AlertCircle, Coins, PlusCircle
} from 'lucide-react';
import { 
  StockItem, Customer, Supplier, PurchaseEntry, SalesEntry, RentalOutEntry, EventEntry, Attachment,
  PurchaseInvoice, SalesInvoice, RentalInvoice, EventInvoice, EventQuotation, QuotationItem
} from '../types';
import { formatCurrency, toBengaliNumber } from '../utils';

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
  onDeletePurchaseInvoice: (id: string) => void;
  salesInvoices: SalesInvoice[];
  onAddSalesInvoice: (inv: Omit<SalesInvoice, 'id'>) => void;
  onDeleteSalesInvoice: (id: string) => void;
  rentalInvoices: RentalInvoice[];
  onAddRentalInvoice: (inv: Omit<RentalInvoice, 'id'>) => void;
  onDeleteRentalInvoice: (id: string) => void;
  eventInvoices: EventInvoice[];
  onAddEventInvoice: (inv: Omit<EventInvoice, 'id'>) => void;
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
  onDeletePurchaseInvoice,
  salesInvoices,
  onAddSalesInvoice,
  onDeleteSalesInvoice,
  rentalInvoices,
  onAddRentalInvoice,
  onDeleteRentalInvoice,
  eventInvoices,
  onAddEventInvoice,
  onDeleteEventInvoice,
  quotations,
  onAddQuotation,
  onUpdateQuotation,
  onDeleteQuotation,
  onConvertQuotationToEvent
}: InvoiceHubProps) {
  
  // General State
  const [activeTab, setActiveTab] = useState<'document-center' | 'quotations' | 'purchase-invoices' | 'sales-invoices' | 'rental-invoices' | 'event-invoices'>('quotations');
  const [selectedFolder, setSelectedFolder] = useState<FolderType>('quotations');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState(false);
  const [isSignOpen, setIsSignOpen] = useState(false);
  
  // Sharing trigger modals
  const [sharingInvoice, setSharingInvoice] = useState<{ id: string; type: 'sales' | 'rental' | 'event' | 'quotations'; mobile: string; name: string } | null>(null);
  const [shareMethod, setShareMethod] = useState<'whatsapp' | 'email'>('whatsapp');
  const [shareTarget, setShareTarget] = useState('');
  
  // Active selected invoice for full-screen preview / printing / downloading
  const [previewInvoice, setPreviewInvoice] = useState<{
    id: string;
    type: 'purchase' | 'sales' | 'rental' | 'event' | 'quotations';
    data: any;
  } | null>(null);

  // Digital signature configuration
  const [typedSignature, setTypedSignature] = useState('রিত্তিকা ডেকোরেশন');
  const [selectedSigFont, setSelectedSigFont] = useState<'font-serif' | 'font-sans' | 'font-mono'>('font-serif');
  const [canvasSignature, setCanvasSignature] = useState<string | null>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);

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

  // Auto Generate Sales Invoice Setup
  const [selectedSaleId, setSelectedSaleId] = useState('');
  const [salesDiscount, setSalesDiscount] = useState(0);

  // Auto Generate Rental Invoice Setup
  const [selectedRentalId, setSelectedRentalId] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState(0);
  const [transportCharge, setTransportCharge] = useState(0);
  const [labourCharge, setLabourCharge] = useState(0);

  // Auto Generate Event Invoice Setup
  const [selectedEventId, setSelectedEventId] = useState('');
  const [eventExtraCharge, setEventExtraCharge] = useState(0);
  const [eventExtraDetails, setEventExtraDetails] = useState('');

  // Handle Canvas Drawing for Digital Signature
  const [isDrawing, setIsDrawing] = useState(false);
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = sigCanvasRef.current;
    if (canvas) {
      setCanvasSignature(canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasSignature(null);
  };

  // Upload supplier purchase invoice base64
  const handlePurchaseFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPBase64File(event.target?.result as string);
    };
    reader.readAsDataURL(file);
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
      fileUrl: pBase64File || undefined,
      fileName: pFileName || undefined
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
    const category = curCategoryOption === 'অন্যান্য / কাস্টম ক্যাটাগরি' 
      ? (customCategoryText.trim() || 'অন্যান্য') 
      : curCategoryOption;

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
      signatureUrl: canvasSignature || undefined
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

  // Sales invoice auto generator
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
      signatureUrl: canvasSignature || undefined
    });

    setSelectedSaleId('');
    setSalesDiscount(0);
    alert('বিক্রয় ইনভয়েস সফলভাবে জেনারেট হয়েছে!');
  };

  // Rental invoice auto generator
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

  // Event invoice auto generator
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

  // Handle printing of an invoice
  const handlePrint = () => {
    window.print();
  };

  // WhatsApp/Email share mechanism
  const triggerShare = (inv: any, type: 'sales' | 'rental' | 'event' | 'quotations') => {
    setSharingInvoice({
      id: inv.id,
      type,
      mobile: inv.customerMobile || '',
      name: inv.customerName || inv.eventName || 'গ্রাহক'
    });
    setShareTarget(inv.customerMobile || '');
    setShareMethod('whatsapp');
  };

  const handleShareSubmit = () => {
    if (!sharingInvoice) return;
    if (shareMethod === 'whatsapp') {
      const isQuo = sharingInvoice.type === 'quotations';
      const text = encodeURIComponent(
        isQuo
          ? `প্রিয় ${sharingInvoice.name}, রিত্তিকা ইভেন্ট ডেকোরেশন থেকে আপনার ইভেন্টের বাজেট কোটেশন বিল তৈরি হয়েছে। কোটেশন নং: ${sharingInvoice.id}। ধন্যবাদ!`
          : `প্রিয় ${sharingInvoice.name}, রিত্তিকা ইভেন্ট ডেকোরেশন থেকে আপনার ইনভয়েসটি জেনারেট হয়েছে। ইনভয়েস নং: ${sharingInvoice.id}. ধন্যবাদ!`
      );
      const url = `https://wa.me/${shareTarget}?text=${text}`;
      window.open(url, '_blank');
    } else {
      alert(`ইমেলটি (${shareTarget}) ঠিকানায় প্রেরণ করা হয়েছে! (সিমুলেটেড)`);
    }
    setSharingInvoice(null);
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
          { id: 'quotations', label: 'বাজেট কোটেশন ও এস্টিমেট (Quotations)', icon: Calculator, badge: quotations.length },
          { id: 'document-center', label: 'ডকুমেন্ট ও মিডিয়া সেন্টার', icon: Folder },
          { id: 'purchase-invoices', label: 'Supplier ক্রয় ইনভয়েস', icon: FileSpreadsheet, badge: purchaseInvoices.length },
          { id: 'sales-invoices', label: 'বিক্রয় ইনভয়েস (Sales)', icon: FileText, badge: salesInvoices.length },
          { id: 'rental-invoices', label: 'ভাড়া ইনভয়েস (Rental)', icon: FileText, badge: rentalInvoices.length },
          { id: 'event-invoices', label: 'ইভেন্ট বিল ও চালান', icon: FileText, badge: eventInvoices.length }
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

      {/* 🌟 CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="invoice-hub-content-area">
        
        {/* LEFT COLUMN: Controls / Forms / Folder list */}
        <div className="lg:col-span-4 space-y-6 no-print">
          
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
              <h3 className="text-sm font-black uppercase tracking-wider text-black">ইনভয়েস অটো-জেনারেটর</h3>
              <p className="text-xs font-bold text-slate-700">সরাসরি বিক্রয় তালিকা থেকে সিলেক্ট করে অটোমেটিক কাস্টমাইজড ইনভয়েস তৈরি করুন।</p>
              
              <div className="space-y-3">
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
            </div>
          )}

          {/* Active Tab: Rental Invoices */}
          {activeTab === 'rental-invoices' && (
            <div className="neo-card p-5 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-black">ভাড়া ইনভয়েস অটো-জেনারেটর</h3>
              <p className="text-xs font-bold text-slate-700">ভাড়ার রেকর্ড থেকে সিকিউরিটি ডিপোজিট, লেবার এবং ট্রান্সপোর্ট চার্জসহ প্রফেশনাল ইনভয়েস জেনারেট করুন।</p>

              <div className="space-y-3">
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
            </div>
          )}

          {/* Active Tab: Event Invoices */}
          {activeTab === 'event-invoices' && (
            <div className="neo-card p-5 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-black">ইভেন্ট বিলিং ও চালান</h3>
              <p className="text-xs font-bold text-slate-700">ইভেন্ট সম্পন্ন হওয়ার পর ডেকোরেশন প্যাকেজ এবং অতিরিক্ত মালামালসহ সম্পূর্ণ বিল জেনারেট করুন।</p>

              <div className="space-y-3">
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
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Results explorer / Invoices list / Quotation Form Builder / Stunning Live PDF Preview Layout */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Preview Frame! If there is an active preview, show the stunning official styled Invoice/Quotation! */}
          {previewInvoice ? (
            <div className="space-y-4" id="active-invoice-renderer">
              {/* Toolbar */}
              <div className="flex items-center justify-between border-2 border-black p-3 bg-slate-100 shadow-[2px_2px_0px_0px_#000000] no-print flex-wrap gap-2">
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
                    onClick={handlePrint}
                    className="neo-btn px-3 py-1.5 text-xs bg-yellow-400 flex items-center gap-1.5 font-black uppercase shadow-[1px_1px_0px_0px_#000000]"
                  >
                    <Printer size={13} />
                    প্রিন্ট / PDF ডাউনলোড
                  </button>
                  <button
                    onClick={() => triggerShare(previewInvoice.data, previewInvoice.type as any)}
                    className="neo-btn px-3 py-1.5 text-xs bg-teal-300 flex items-center gap-1.5 font-black uppercase shadow-[1px_1px_0px_0px_#000000]"
                  >
                    <Share2 size={13} />
                    শেয়ার করুন
                  </button>
                </div>
              </div>

              {/* 🌟 THE ACTUAL PRINTABLE INVOICE / QUOTATION TEMPLATE */}
              <div 
                className="bg-white border-4 border-black p-8 relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] print:border-0 print:shadow-none" 
                id="printable-invoice-canvas"
              >
                
                {/* Elegantly Crafted Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0">
                  <span className="text-7xl font-black uppercase tracking-widest text-black rotate-[-35deg] font-sans">
                    RITTIKA DECORATION
                  </span>
                </div>

                <div className="relative z-10 space-y-6">
                  
                  {/* Company Logo & Invoice Meta Headers */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-4 border-black pb-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-yellow-400 border-3 border-black flex items-center justify-center text-black font-black text-xl shadow-[2px_2px_0px_0px_#000000]">
                        RD
                      </div>
                      <div>
                        <h2 className="text-xl font-black uppercase italic tracking-tight text-black leading-none">রিত্তিকা ইভেন্ট ডেকোরেশন</h2>
                        <p className="text-[9px] text-black font-black uppercase tracking-widest mt-1">Rittika Event & Decoration ERP System</p>
                        <p className="text-[10px] text-slate-700 font-bold">মোবাইল: ০১৮২৪-৫৯৭৫৬২ | ঠিকানা: ঢাকা, বাংলাদেশ</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <h3 className="text-2xl font-black text-black uppercase tracking-tight italic">
                        {previewInvoice.type === 'quotations' ? 'ইভেন্ট বাজেট কোটেশন / প্রাক্কলন বিল' : 'ইনভয়েস / চালান'}
                      </h3>
                      <p className="text-xs font-black text-slate-800 mt-1 font-mono">
                        {previewInvoice.type === 'quotations' 
                          ? `কোটেশন নং: ${previewInvoice.data.quotationNo}` 
                          : `ইনভয়েস নং: ${previewInvoice.data.invoiceNo || previewInvoice.data.purchaseNo}`}
                      </p>
                      <p className="text-xs font-bold text-slate-700 font-mono">তারিখ: {previewInvoice.data.date}</p>
                      {previewInvoice.type === 'quotations' && previewInvoice.data.validUntil && (
                        <p className="text-[11px] font-bold text-rose-700 font-mono">মেয়াদ উত্তীর্ণ: {previewInvoice.data.validUntil}</p>
                      )}
                    </div>
                  </div>

                  {/* Prominent Budget Type Banner for Quotations */}
                  {previewInvoice.type === 'quotations' && (
                    <div className={`p-3 border-2 border-black text-center font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000000] ${
                      previewInvoice.data.budgetType === 'Estimated' 
                        ? 'bg-amber-200 text-amber-950' 
                        : 'bg-emerald-200 text-emerald-950'
                    }`}>
                      {previewInvoice.data.budgetType === 'Estimated' ? (
                        <>
                          <Clock size={16} className="text-amber-800" />
                          <span>⚡ বাজেটের ধরণ: আনুমানিক বাজেট কোটেশন (ESTIMATED BUDGET QUOTATION - বাজার দর ও চাহিদানুযায়ী সমন্বয়যোগ্য)</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={16} className="text-emerald-800" />
                          <span>🔒 বাজেটের ধরণ: ফিক্সড বাজেট চুক্তি কোটেশন (FIXED BUDGET CONTRACT - চূড়ান্ত অপরিবর্তনীয় বাজেট)</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Customer / Supplier Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b-2 border-black pb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                        {previewInvoice.type === 'quotations' ? 'সম্মানিত গ্রাহক / ক্লায়েন্ট বিবরণ' : 'ইনভয়েস প্রাপক বিবরণ'}
                      </span>
                      <p className="text-sm font-black text-black mt-1">
                        নাম: {previewInvoice.data.customerName || previewInvoice.data.supplierName || 'সাধারণ ক্লায়েন্ট'}
                      </p>
                      <p className="text-xs font-bold text-slate-800">
                        মোবাইল: {previewInvoice.data.customerMobile || previewInvoice.data.supplierMobile || 'প্রযোজ্য নয়'}
                      </p>
                      {previewInvoice.data.customerAddress && (
                        <p className="text-xs font-bold text-slate-700">ঠিকানা: {previewInvoice.data.customerAddress}</p>
                      )}
                    </div>
                    <div className="md:text-right">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">ডকুমেন্ট ও ইভেন্ট ধরণ</span>
                      <p className="text-sm font-black text-black uppercase mt-1">
                        {previewInvoice.type === 'quotations' ? `ইভেন্ট কোটেশন [${previewInvoice.data.budgetType === 'Estimated' ? 'আনুমানিক' : 'ফিক্সড'}]` :
                         previewInvoice.type === 'purchase' ? 'Supplier ক্রয় চালান' : 
                         previewInvoice.type === 'sales' ? 'সরাসরি বিক্রয় চালান' :
                         previewInvoice.type === 'rental' ? 'সামগ্রী ভাড়া চালান' : 'ইভেন্ট ডেকোরেশন সম্পন্ন বিল'}
                      </p>
                      {previewInvoice.data.eventName && (
                        <p className="text-xs font-bold text-slate-800">ইভেন্ট: {previewInvoice.data.eventName}</p>
                      )}
                      {previewInvoice.data.eventDate && (
                        <p className="text-xs font-bold text-indigo-700 font-mono">ইভেন্ট তারিখ: {previewInvoice.data.eventDate}</p>
                      )}
                      {previewInvoice.data.venue && (
                        <p className="text-xs font-bold text-slate-700 font-mono">ভেন্যু / স্থান: {previewInvoice.data.venue}</p>
                      )}
                    </div>
                  </div>

                  {/* Core Items Table */}
                  <div className="border-2 border-black overflow-hidden">
                    <table className="w-full text-left text-xs font-bold">
                      <thead className="bg-slate-100 border-b-2 border-black text-[10px] uppercase font-black tracking-wider text-black">
                        <tr>
                          <th className="p-3 border-r-2 border-black text-center w-12">#</th>
                          {previewInvoice.type === 'quotations' && (
                            <th className="p-3 border-r-2 border-black w-28">ক্যাটাগরি</th>
                          )}
                          <th className="p-3 border-r-2 border-black">বিবরণ / মালামাল (Item Details)</th>
                          <th className="p-3 border-r-2 border-black text-center w-24">পরিমাণ (Qty)</th>
                          <th className="p-3 border-r-2 border-black text-right w-28">বাজেট দর (Rate)</th>
                          <th className="p-3 text-right w-32">মোট মূল্য (Total)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-black">
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
                          <>
                            <tr>
                              <td className="p-3 border-r-2 border-black text-center font-mono">১</td>
                              <td className="p-3 border-r-2 border-black">
                                <p className="font-black text-black">ডেকোরেশন প্যাকেজ: {previewInvoice.data.decorationPackage}</p>
                                <div className="text-[10px] text-slate-600 mt-1 font-bold space-y-1">
                                  <p>ব্যবহৃত মালামাল চেকলিস্ট:</p>
                                  <ul className="list-disc list-inside pl-2">
                                    {previewInvoice.data.materialsUsed.map((m: any, idx: number) => (
                                      <li key={idx}>{m.name} (পরিমাণ: {m.qty} টি)</li>
                                    ))}
                                  </ul>
                                </div>
                              </td>
                              <td className="p-3 border-r-2 border-black text-center font-mono">১ প্যাকেজ</td>
                              <td className="p-3 border-r-2 border-black text-right font-mono">{formatCurrency(previewInvoice.data.totalCost - previewInvoice.data.labourCost - previewInvoice.data.transportCost - previewInvoice.data.extraCharges)}</td>
                              <td className="p-3 text-right font-mono">{formatCurrency(previewInvoice.data.totalCost - previewInvoice.data.labourCost - previewInvoice.data.transportCost - previewInvoice.data.extraCharges)}</td>
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
                    <div className="flex items-center gap-3 border-2 border-black p-3 bg-slate-50 shadow-[2px_2px_0px_0px_#000000] w-full sm:w-auto">
                      <div className="w-16 h-16 border border-black bg-white flex flex-wrap p-1 gap-1 shrink-0">
                        <div className="w-7 h-7 bg-black"></div>
                        <div className="w-7 h-7 bg-white border border-black flex items-center justify-center text-[5px] font-mono">QR</div>
                        <div className="w-7 h-7 bg-white border border-black"></div>
                        <div className="w-7 h-7 bg-black"></div>
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase text-black block tracking-wider">QR ভেরিফিকেশন কোড</span>
                        <p className="text-[10px] text-slate-700 font-bold leading-tight mt-1">মোবাইল ক্যামেরা দিয়ে স্ক্যান করে ইনভয়েসের সত্যতা যাচাই করুন।</p>
                        <span className="text-[9px] font-black text-emerald-700 mt-1 block">✓ VERIFIED BY RD ERP</span>
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
                        <div className="flex justify-between border-b border-slate-200 pb-1">
                          <span className="text-slate-600">সর্বমোট খরচ:</span>
                          <span className="font-mono">{formatCurrency(previewInvoice.data.totalCost)}</span>
                        </div>
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

                  {/* Terms & Conditions Section (Especially for Quotations) */}
                  {previewInvoice.type === 'quotations' && previewInvoice.data.termsAndConditions && (
                    <div className="border-2 border-black p-3 bg-slate-50 text-[11px] space-y-1.5">
                      <span className="font-black uppercase text-black block tracking-wider">
                        বাজেট শর্তাবলী ও নিয়মাবলী (Terms & Conditions):
                      </span>
                      <p className="whitespace-pre-line text-slate-800 font-bold leading-relaxed">
                        {previewInvoice.data.termsAndConditions}
                      </p>
                    </div>
                  )}

                  {/* Digital Signature Panel */}
                  <div className="flex justify-between items-end pt-6">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">
                        {previewInvoice.type === 'quotations' ? 'কোটেশন স্ট্যাটাস' : 'পেমেন্ট স্ট্যাটাস'}
                      </p>
                      <span className={`inline-block border-2 border-black px-2.5 py-1 text-xs font-black uppercase mt-1 shadow-[2px_2px_0px_0px_#000000] ${
                        previewInvoice.type === 'quotations' 
                          ? previewInvoice.data.status === 'Converted' ? 'bg-teal-300 text-black' : 'bg-yellow-300 text-black'
                          : (previewInvoice.data.paymentStatus === 'Paid' || previewInvoice.type === 'sales') ? 'bg-emerald-300 text-black' : 'bg-rose-300 text-black'
                      }`}>
                        {previewInvoice.type === 'quotations'
                          ? (previewInvoice.data.status === 'Converted' ? 'কনফার্মড ইভেন্ট (Converted)' : 'প্রস্তাবনা (Quotation)')
                          : (previewInvoice.data.paymentStatus === 'Paid' || previewInvoice.type === 'sales') ? 'পরিশোধিত (Paid)' : 'বকেয়া (Due)'}
                      </span>
                    </div>
                    
                    {/* Official Digital Signature */}
                    <div className="text-center">
                      <div className="border-b-2 border-black pb-1 w-48 mx-auto flex items-center justify-center min-h-[50px]">
                        {previewInvoice.data.signatureUrl || canvasSignature ? (
                          <img 
                            src={previewInvoice.data.signatureUrl || canvasSignature || ''} 
                            alt="Digital Signature" 
                            className="max-h-12 object-contain"
                          />
                        ) : (
                          <span className={`text-xl text-indigo-600 tracking-wide ${selectedSigFont}`}>
                            {typedSignature}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-black uppercase text-slate-600 block mt-1.5">অনুমোদিত স্বাক্ষর (Authorized Signature)</span>
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
                        <label className="block mb-1 text-[11px]">ক্যাটাগরি নির্বাচন</label>
                        <select
                          value={curCategoryOption}
                          onChange={(e) => setCurCategoryOption(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-black p-2 font-bold"
                        >
                          {CATEGORY_PRESETS.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* If custom category selected */}
                      {curCategoryOption === 'অন্যান্য / কাস্টম ক্যাটাগরি' && (
                        <div>
                          <label className="block mb-1 text-[11px]">কাস্টম ক্যাটাগরির নাম</label>
                          <input
                            type="text"
                            value={customCategoryText}
                            onChange={(e) => setCustomCategoryText(e.target.value)}
                            placeholder="যেমন: ড্রোন ও ফটোগ্রাফি"
                            className="w-full bg-yellow-50 border-2 border-black p-2 font-bold"
                          />
                        </div>
                      )}

                      {/* Quick stock picker helper */}
                      <div className={curCategoryOption === 'অন্যান্য / কাস্টম ক্যাটাগরি' ? '' : 'sm:col-span-2'}>
                        <label className="block mb-1 text-[11px]">স্টক থেকে দ্রুত বাছাই (ঐচ্ছিক)</label>
                        <select
                          value={selectedStockPickerCode}
                          onChange={(e) => handleStockPickerChange(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-black p-2 font-bold text-slate-700"
                        >
                          <option value="">-- স্টক মালামাল নির্বাচন করে অটোফিল করুন --</option>
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
                        <label className="block mb-1 text-[11px]">মালামাল বা সেবার নাম *</label>
                        <input
                          type="text"
                          value={curItemName}
                          onChange={(e) => setCurItemName(e.target.value)}
                          placeholder="যেমন: ক্রিস্টাল রিং এন্ট্রি গেইট"
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
                              ইভেন্টে রূপান্তর
                            </button>
                          ) : (
                            <span className="text-[10px] font-black text-teal-700 bg-teal-50 border border-teal-600 px-2 py-1 rounded">
                              ✓ ইভেন্টে রূপান্তর সম্পন্ন
                            </span>
                          )}
                        </div>

                      </div>
                    ))
                  )}
                </div>

              </div>
            )
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
                  required
                  value={pSupplierName}
                  onChange={(e) => setPSupplierName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-black p-2 font-bold"
                  placeholder="যেমন: আরং ডেকোরেটরস"
                />
              </div>

              <div>
                <label className="uppercase block mb-1">সরবরাহকারী মোবাইল (Supplier Mobile)</label>
                <input
                  type="text"
                  value={pSupplierMobile}
                  onChange={(e) => setPSupplierMobile(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-black p-2 font-bold"
                  placeholder="যেমন: ০১৭০০০০০০০০"
                />
              </div>

              <div>
                <label className="uppercase block mb-1">মালামাল / সামগ্রীর নাম (Item Name)</label>
                <input
                  type="text"
                  required
                  value={pItemName}
                  onChange={(e) => setPItemName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-black p-2 font-bold"
                  placeholder="যেমন: ক্রিস্টাল ঝাড়বাতি"
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
                <label className="uppercase block mb-1">চালান ফাইল আপলোড (PDF / JPG / PNG)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handlePurchaseFileUpload}
                  className="w-full bg-slate-50 border-2 border-black p-1.5 font-bold cursor-pointer"
                />
                {pFileName && <p className="text-[10px] text-emerald-700 mt-1">✓ {pFileName}</p>}
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

      {/* 🌟 DIALOG: DIGITAL SIGNATURE CONFIGURATOR */}
      {isSignOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto no-print">
          <div className="bg-white border-4 border-black max-w-md w-full p-6 shadow-[8px_8px_0px_0px_#000000] relative">
            <button 
              onClick={() => setIsSignOpen(false)}
              className="absolute top-4 right-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
            >
              <X size={14} className="stroke-[2.5]" />
            </button>

            <h3 className="text-lg font-black uppercase italic text-black border-b-2 border-black pb-2 mb-4">অনুমোদিত ডিজিটাল স্বাক্ষর</h3>
            
            <div className="space-y-4 text-xs font-black">
              
              <div>
                <label className="block mb-1">টাইপ স্বাক্ষর (Type Name)</label>
                <input
                  type="text"
                  value={typedSignature}
                  onChange={(e) => {
                    setTypedSignature(e.target.value);
                    setCanvasSignature(null); // Type overrides drawn canvas
                  }}
                  className="w-full bg-slate-50 border-2 border-black p-2 font-bold text-sm"
                  placeholder="যেমন: রিত্তিকা ডেকোরেশন"
                />
              </div>

              <div>
                <label className="block mb-1">স্বাক্ষর ফন্ট (Font style)</label>
                <div className="flex gap-2">
                  {[
                    { id: 'font-serif', label: 'Serif Classic' },
                    { id: 'font-sans', label: 'Sans Simple' },
                    { id: 'font-mono', label: 'Mono Tech' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedSigFont(f.id as any)}
                      className={`flex-1 p-2 border-2 border-black text-center ${
                        selectedSigFont === f.id ? 'bg-yellow-400 font-black' : 'bg-white font-bold'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-1">হাতে আঁকুন (Draw Signature on Canvas)</label>
                <div className="border-2 border-black bg-slate-50 relative overflow-hidden">
                  <canvas
                    ref={sigCanvasRef}
                    width={380}
                    height={120}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full cursor-crosshair bg-white"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-1.5">
                  <button
                    onClick={clearCanvas}
                    className="text-[10px] uppercase font-black text-rose-600 border border-black px-2 py-1 bg-white hover:bg-slate-50"
                  >
                    মুছে ফেলুন (Clear Canvas)
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  onClick={() => setIsSignOpen(false)}
                  className="neo-btn px-5 py-2 bg-yellow-400 text-black uppercase"
                >
                  স্বাক্ষর নিশ্চিত করুন (Apply Signature)
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 🌟 DIALOG: SHARE CONTROLLER */}
      {sharingInvoice && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto no-print">
          <div className="bg-white border-4 border-black max-w-sm w-full p-6 shadow-[8px_8px_0px_0px_#000000] relative">
            <button 
              onClick={() => setSharingInvoice(null)}
              className="absolute top-4 right-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
            >
              <X size={14} />
            </button>

            <h3 className="text-base font-black uppercase italic text-black border-b-2 border-black pb-2 mb-4">চালানটি গ্রাহকের কাছে প্রেরণ করুন</h3>

            <div className="space-y-4 text-xs font-black">
              <div>
                <label className="block mb-1">গ্রাহকের নাম: <span className="text-indigo-600">{sharingInvoice.name}</span></label>
                <label className="block mt-1 mb-1">চালান নং: <span className="font-mono text-slate-700">{sharingInvoice.id}</span></label>
              </div>

              <div>
                <label className="block mb-1">প্রেরণের মাধ্যম</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShareMethod('whatsapp');
                      setShareTarget(sharingInvoice.mobile);
                    }}
                    className={`flex-1 py-2 border-2 border-black text-center flex items-center justify-center gap-1.5 ${
                      shareMethod === 'whatsapp' ? 'bg-emerald-300' : 'bg-white'
                    }`}
                  >
                    <Send size={12} />
                    WhatsApp Share
                  </button>
                  <button
                    onClick={() => {
                      setShareMethod('email');
                      setShareTarget('client@email.com');
                    }}
                    className={`flex-1 py-2 border-2 border-black text-center flex items-center justify-center gap-1.5 ${
                      shareMethod === 'email' ? 'bg-indigo-300' : 'bg-white'
                    }`}
                  >
                    <Mail size={12} />
                    Email PDF Invoice
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-1">
                  {shareMethod === 'whatsapp' ? 'হোয়াটসঅ্যাপ মোবাইল নম্বর' : 'গ্রাহক ইমেইল এড্রেস'}
                </label>
                <input
                  type="text"
                  value={shareTarget}
                  onChange={(e) => setShareTarget(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-black p-2 font-bold font-mono"
                />
              </div>

              <button
                onClick={handleShareSubmit}
                className="w-full neo-btn py-2 bg-yellow-400 text-black font-black uppercase"
              >
                পাঠিয়ে দিন (Share Now)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
