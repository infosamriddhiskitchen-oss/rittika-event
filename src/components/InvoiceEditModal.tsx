import React, { useState, useEffect } from 'react';
import { 
  X, Save, Trash2, Plus, Calculator, Calendar, User, Phone, MapPin, 
  DollarSign, FileText, CheckCircle2, AlertCircle, FileSpreadsheet, Paperclip, Image
} from 'lucide-react';
import { 
  EventQuotation, EventInvoice, SalesInvoice, RentalInvoice, PurchaseInvoice, 
  QuotationItem, EventInvoiceExtraItem, SalesItem, RentalItem 
} from '../types';

export interface InvoiceEditTarget {
  type: 'quotation' | 'quotations' | 'event' | 'sales' | 'rental' | 'purchase';
  data: any;
}

interface InvoiceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: InvoiceEditTarget | null;
  onUpdateQuotation?: (id: string, quotation: Omit<EventQuotation, 'id'>) => void;
  onUpdateEventInvoice?: (id: string, invoice: Omit<EventInvoice, 'id'>) => void;
  onUpdateSalesInvoice?: (id: string, invoice: Omit<SalesInvoice, 'id'>) => void;
  onUpdateRentalInvoice?: (id: string, invoice: Omit<RentalInvoice, 'id'>) => void;
  onUpdatePurchaseInvoice?: (id: string, invoice: Omit<PurchaseInvoice, 'id'>) => void;
}

export const InvoiceEditModal: React.FC<InvoiceEditModalProps> = ({
  isOpen,
  onClose,
  target,
  onUpdateQuotation,
  onUpdateEventInvoice,
  onUpdateSalesInvoice,
  onUpdateRentalInvoice,
  onUpdatePurchaseInvoice
}) => {
  if (!isOpen || !target) return null;

  const { type, data } = target;
  const isQuotation = type === 'quotation' || type === 'quotations';

  // Quotation Edit State
  const [quotationNo, setQuotationNo] = useState(data.quotationNo || '');
  const [qCustomerName, setQCustomerName] = useState(data.customerName || '');
  const [qCustomerMobile, setQCustomerMobile] = useState(data.customerMobile || '');
  const [qEventName, setQEventName] = useState(data.eventName || '');
  const [qEventDate, setQEventDate] = useState(data.eventDate || '');
  const [qVenue, setQVenue] = useState(data.venue || '');
  const [qGuestCount, setQGuestCount] = useState(data.guestCount || 100);
  const [qDate, setQDate] = useState(data.date || '');
  const [qValidUntil, setQValidUntil] = useState(data.validUntil || '');
  const [qStatus, setQStatus] = useState<any>(data.status || 'Draft');
  const [qItems, setQItems] = useState<QuotationItem[]>(data.items || []);
  const [qDiscount, setQDiscount] = useState(data.discount || 0);
  const [qAdvanceExpected, setQAdvanceExpected] = useState(data.advanceExpected || 0);
  const [qNotes, setQNotes] = useState(data.notes || '');

  // Event Invoice Edit State
  const [eInvoiceNo, setEInvoiceNo] = useState(data.invoiceNo || '');
  const [eCustomerName, setECustomerName] = useState(data.customerName || '');
  const [eCustomerMobile, setECustomerMobile] = useState(data.customerMobile || '');
  const [eEventName, setEEventName] = useState(data.eventName || '');
  const [eDate, setEDate] = useState(data.date || '');
  const [eVenue, setEVenue] = useState(data.venue || '');
  const [eDecorationPackage, setEDecorationPackage] = useState(data.decorationPackage || '');
  const [eBaseBudget, setEBaseBudget] = useState(data.baseBudget || 0);
  const [eAdvancePaid, setEAdvancePaid] = useState(data.advancePaid || 0);
  const [eLabourCost, setELabourCost] = useState(data.labourCost || 0);
  const [eTransportCost, setETransportCost] = useState(data.transportCost || 0);
  const [eExtraCharges, setEExtraCharges] = useState(data.extraCharges || 0);
  const [eDiscount, setEDiscount] = useState(data.discount || 0);
  const [eExtraItems, setEExtraItems] = useState<EventInvoiceExtraItem[]>(data.extraItems || []);
  const [ePaymentMethod, setEPaymentMethod] = useState(data.paymentMethod || 'নগদ (Cash)');
  const [eNotes, setENotes] = useState(data.notes || '');

  // Sales Invoice Edit State
  const [sInvoiceNo, setSInvoiceNo] = useState(data.invoiceNo || '');
  const [sCustomerName, setSCustomerName] = useState(data.customerName || '');
  const [sCustomerMobile, setSCustomerMobile] = useState(data.customerMobile || '');
  const [sDate, setSDate] = useState(data.date || '');
  const [sItems, setSItems] = useState<SalesItem[]>(data.items || []);
  const [sDiscount, setSDiscount] = useState(data.discount || 0);
  const [sPaymentStatus, setSPaymentStatus] = useState<any>(data.paymentStatus || 'Paid');
  const [sPaymentMethod, setSPaymentMethod] = useState(data.paymentMethod || 'নগদ (Cash)');
  const [sNotes, setSNotes] = useState(data.notes || '');

  // Rental Invoice Edit State
  const [rInvoiceNo, setRInvoiceNo] = useState(data.invoiceNo || '');
  const [rCustomerName, setRCustomerName] = useState(data.customerName || '');
  const [rCustomerMobile, setRCustomerMobile] = useState(data.customerMobile || '');
  const [rEventName, setREventName] = useState(data.eventName || '');
  const [rDate, setRDate] = useState(data.date || '');
  const [rReturnDate, setRReturnDate] = useState(data.returnDate || '');
  const [rItems, setRItems] = useState<RentalItem[]>(data.items || []);
  const [rSecurityDeposit, setRSecurityDeposit] = useState(data.securityDeposit || 0);
  const [rTransportCharge, setRTransportCharge] = useState(data.transportCharge || 0);
  const [rLabourCharge, setRLabourCharge] = useState(data.labourCharge || 0);
  const [rDiscount, setRDiscount] = useState(data.discount || 0);
  const [rPaidAmount, setRPaidAmount] = useState(data.paidAmount || 0);
  const [rPaymentStatus, setRPaymentStatus] = useState<any>(data.paymentStatus || 'Paid');
  const [rNotes, setRNotes] = useState(data.notes || '');

  // Purchase Invoice Edit State
  const [pPurchaseNo, setPPurchaseNo] = useState(data.purchaseNo || '');
  const [pInvoiceNo, setPInvoiceNo] = useState(data.invoiceNo || '');
  const [pSupplierName, setPSupplierName] = useState(data.supplierName || '');
  const [pSupplierMobile, setPSupplierMobile] = useState(data.supplierMobile || '');
  const [pDate, setPDate] = useState(data.date || '');
  const [pItemName, setPItemName] = useState(data.itemName || '');
  const [pQty, setPQty] = useState(data.qty || 1);
  const [pUnit, setPUnit] = useState(data.unit || 'Pcs');
  const [pUnitPrice, setPUnitPrice] = useState(data.unitPrice || 0);
  const [pPaymentStatus, setPPaymentStatus] = useState<any>(data.paymentStatus || 'Paid');

  // Attached files state across all invoice types
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; url: string; type: string }[]>(
    data.files && Array.isArray(data.files)
      ? data.files
      : data.fileUrl
      ? [{ name: data.fileName || 'সংযুক্ত নথি', url: data.fileUrl, type: 'file' }]
      : []
  );

  // Multi-file upload handler for modal
  const handleModalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFiles = e.target.files;
    if (inputFiles && inputFiles.length > 0) {
      Array.from(inputFiles).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result && typeof reader.result === 'string') {
            setAttachedFiles(prev => [
              ...prev,
              {
                name: file.name,
                url: reader.result as string,
                type: file.type.startsWith('image/') ? 'image' : 'pdf'
              }
            ]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // New Item Row Inputs for dynamic tables
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('স্টেজ ও ব্যাকড্রপ');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('Pcs');
  const [newItemRate, setNewItemRate] = useState(0);

  // Add Item to Quotation
  const handleAddQuotationItem = () => {
    if (!newItemName.trim() || newItemRate <= 0) {
      alert('দয়া করে সঠিক আইটেম নাম এবং রেট দিন।');
      return;
    }
    const item: QuotationItem = {
      id: `qi-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      qty: Number(newItemQty),
      quantity: Number(newItemQty),
      unit: newItemUnit,
      rate: Number(newItemRate),
      unitPrice: Number(newItemRate),
      total: Number(newItemQty) * Number(newItemRate)
    };
    setQItems(prev => [...prev, item]);
    setNewItemName('');
    setNewItemRate(0);
    setNewItemQty(1);
  };

  // Add Item to Event Extra Items
  const handleAddEventExtraItem = () => {
    if (!newItemName.trim() || newItemRate <= 0) {
      alert('দয়া করে সঠিক অতিরিক্ত সেবার নাম এবং খরচ দিন।');
      return;
    }
    const item: EventInvoiceExtraItem = {
      id: `ei-${Date.now()}`,
      name: newItemName.trim(),
      qty: Number(newItemQty),
      quantity: Number(newItemQty),
      unit: newItemUnit,
      rate: Number(newItemRate),
      unitPrice: Number(newItemRate),
      total: Number(newItemQty) * Number(newItemRate),
      totalPrice: Number(newItemQty) * Number(newItemRate)
    };
    setEExtraItems(prev => [...prev, item]);
    setNewItemName('');
    setNewItemRate(0);
    setNewItemQty(1);
  };

  // Calculate Calculations
  const qSubtotal = qItems.reduce((sum, item) => sum + item.total, 0);
  const qGrandTotal = Math.max(0, qSubtotal - qDiscount);

  const eExtraTotal = eExtraItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const eGrandTotal = Math.max(0, (eBaseBudget + eExtraTotal + eLabourCost + eTransportCost + eExtraCharges) - eDiscount);
  const eDueAmount = Math.max(0, eGrandTotal - eAdvancePaid);

  const sSubtotal = sItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const sGrandTotal = Math.max(0, sSubtotal - sDiscount);

  const rRentalTotal = rItems.reduce((sum, item) => sum + (item.totalDays * item.rentPerDay), 0);
  const rGrandTotal = Math.max(0, (rRentalTotal + rTransportCharge + rLabourCharge) - rDiscount);
  const rDueAmount = Math.max(0, rGrandTotal - rPaidAmount);

  // Save changes handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (isQuotation) {
      if (!onUpdateQuotation) {
        alert('কোটেশন আপডেট ফাংশন সংযুক্ত নেই।');
        return;
      }
      onUpdateQuotation(data.id, {
        quotationNo,
        date: qDate,
        validUntil: qValidUntil,
        customerName: qCustomerName,
        customerMobile: qCustomerMobile,
        eventName: qEventName,
        eventDate: qEventDate,
        venue: qVenue,
        guestCount: Number(qGuestCount),
        items: qItems,
        subTotal: qSubtotal,
        discount: Number(qDiscount),
        grandTotal: qGrandTotal,
        advanceExpected: Number(qAdvanceExpected),
        notes: qNotes,
        status: qStatus,
        files: attachedFiles
      });
      alert('বাজেট কোটেশনটি সফলভাবে আপডেট করা হয়েছে!');
      onClose();
    } else if (type === 'event') {
      if (!onUpdateEventInvoice) {
        alert('ইভেন্ট ইনভয়েস আপডেট ফাংশন সংযুক্ত নেই।');
        return;
      }
      onUpdateEventInvoice(data.id, {
        invoiceNo: eInvoiceNo,
        date: eDate,
        customerName: eCustomerName,
        customerMobile: eCustomerMobile,
        eventName: eEventName,
        venue: eVenue,
        decorationPackage: eDecorationPackage,
        baseBudget: Number(eBaseBudget),
        advancePaid: Number(eAdvancePaid),
        extraItems: eExtraItems,
        labourCost: Number(eLabourCost),
        transportCost: Number(eTransportCost),
        extraCharges: Number(eExtraCharges),
        discount: Number(eDiscount),
        grandTotal: eGrandTotal,
        dueAmount: eDueAmount,
        paymentStatus: eDueAmount <= 0 ? 'Paid' : eAdvancePaid > 0 ? 'Partial' : 'Due',
        paymentMethod: ePaymentMethod,
        notes: eNotes,
        signatureUrl: data.signatureUrl,
        files: attachedFiles
      });
      alert('ইভেন্ট ইনভয়েস বিলটি সফলভাবে আপডেট করা হয়েছে!');
      onClose();
    } else if (type === 'sales') {
      if (!onUpdateSalesInvoice) {
        alert('বিক্রয় ইনভয়েস আপডেট ফাংশন সংযুক্ত নেই।');
        return;
      }
      onUpdateSalesInvoice(data.id, {
        invoiceNo: sInvoiceNo,
        date: sDate,
        customerName: sCustomerName,
        customerMobile: sCustomerMobile,
        items: sItems,
        subTotal: sSubtotal,
        discount: Number(sDiscount),
        grandTotal: sGrandTotal,
        paymentStatus: sPaymentStatus,
        paymentMethod: sPaymentMethod,
        notes: sNotes,
        files: attachedFiles
      });
      alert('বিক্রয় ইনভয়েস সফলভাবে আপডেট করা হয়েছে!');
      onClose();
    } else if (type === 'rental') {
      if (!onUpdateRentalInvoice) {
        alert('ভাড়া ইনভয়েস আপডেট ফাংশন সংযুক্ত নেই।');
        return;
      }
      onUpdateRentalInvoice(data.id, {
        invoiceNo: rInvoiceNo,
        date: rDate,
        customerName: rCustomerName,
        customerMobile: rCustomerMobile,
        eventName: rEventName,
        returnDate: rReturnDate,
        items: rItems,
        totalRentalCharge: rRentalTotal,
        securityDeposit: Number(rSecurityDeposit),
        transportCharge: Number(rTransportCharge),
        labourCharge: Number(rLabourCharge),
        discount: Number(rDiscount),
        grandTotal: rGrandTotal,
        paidAmount: Number(rPaidAmount),
        dueAmount: rDueAmount,
        paymentStatus: rDueAmount <= 0 ? 'Paid' : rPaidAmount > 0 ? 'Partial' : 'Due',
        notes: rNotes,
        files: attachedFiles
      });
      alert('ভাড়া ইনভয়েস সফলভাবে আপডেট করা হয়েছে!');
      onClose();
    } else if (type === 'purchase') {
      if (!onUpdatePurchaseInvoice) {
        alert('ক্রয় চালান আপডেট ফাংশন সংযুক্ত নেই।');
        return;
      }
      onUpdatePurchaseInvoice(data.id, {
        purchaseNo: pPurchaseNo,
        invoiceNo: pInvoiceNo,
        date: pDate,
        supplierName: pSupplierName,
        supplierMobile: pSupplierMobile,
        itemName: pItemName,
        qty: Number(pQty),
        unit: pUnit,
        unitPrice: Number(pUnitPrice),
        totalAmount: Number(pQty) * Number(pUnitPrice),
        paymentStatus: pPaymentStatus,
        fileUrl: attachedFiles.length > 0 ? attachedFiles[0].url : undefined,
        fileName: attachedFiles.length > 0 ? attachedFiles[0].name : undefined,
        files: attachedFiles
      });
      alert('সাপ্লায়ার ক্রয় চালান সফলভাবে আপডেট করা হয়েছে!');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border-4 border-black w-full max-w-4xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] my-8 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-yellow-400 border-b-4 border-black p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-black text-yellow-400 rounded-lg">
              {isQuotation ? <Calculator size={20} /> : <FileText size={20} />}
            </div>
            <div>
              <h3 className="font-black text-base uppercase tracking-tight text-black">
                ইনভয়েস তথ্য পরিবর্তন ও এডিট (Edit Invoice)
              </h3>
              <p className="text-xs font-bold text-slate-800">
                {isQuotation && `বাজেট কোটেশন নং: ${quotationNo}`}
                {type === 'event' && `ইভেন্ট ইনভয়েস নং: ${eInvoiceNo}`}
                {type === 'sales' && `বিক্রয় ইনভয়েস নং: ${sInvoiceNo}`}
                {type === 'rental' && `ভাড়া ইনভয়েস নং: ${rInvoiceNo}`}
                {type === 'purchase' && `ক্রয় চালান নং: ${pPurchaseNo}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-black hover:bg-rose-600 text-white rounded cursor-pointer transition"
          >
            <X size={20} className="stroke-[3]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto flex-1 space-y-6">

          {/* 🌟 1. TYPE: QUOTATION */}
          {isQuotation && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-4 border-2 border-black rounded-lg">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">কোটেশন নং *</label>
                  <input
                    type="text"
                    value={quotationNo}
                    onChange={e => setQuotationNo(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">গ্রাহকের নাম *</label>
                  <input
                    type="text"
                    value={qCustomerName}
                    onChange={e => setQCustomerName(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    value={qCustomerMobile}
                    onChange={e => setQCustomerMobile(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">ইভেন্টের নাম</label>
                  <input
                    type="text"
                    value={qEventName}
                    onChange={e => setQEventName(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">ইভেন্টের তারিখ</label>
                  <input
                    type="date"
                    value={qEventDate}
                    onChange={e => setQEventDate(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">ভেন্যু / লোকেশন</label>
                  <input
                    type="text"
                    value={qVenue}
                    onChange={e => setQVenue(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">ইস্যুর তারিখ</label>
                  <input
                    type="date"
                    value={qDate}
                    onChange={e => setQDate(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">মেয়াদের তারিখ</label>
                  <input
                    type="date"
                    value={qValidUntil}
                    onChange={e => setQValidUntil(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">কোটেশন স্ট্যাটাস</label>
                  <select
                    value={qStatus}
                    onChange={e => setQStatus(e.target.value as any)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-black"
                  >
                    <option value="Draft">Draft (খসড়া)</option>
                    <option value="Sent">Sent (পাঠানো হয়েছে)</option>
                    <option value="Accepted">Accepted (গৃহীত)</option>
                    <option value="Converted">Converted (ইভেন্টে রূপান্তরিত)</option>
                    <option value="Expired">Expired (মেয়াদোত্তীর্ণ)</option>
                  </select>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-slate-900">কোটেশনের আইটেম ও ডেকোরেশন তালিকা</h4>
                  <span className="text-xs font-bold text-slate-600 font-mono">মোট আইটেম: {qItems.length}</span>
                </div>

                <div className="border-2 border-black overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-white font-black uppercase">
                      <tr>
                        <th className="p-2 border-r border-slate-700">আইটেম / ডেসক্রিপশন</th>
                        <th className="p-2 border-r border-slate-700 w-24 text-center">পরিমাণ</th>
                        <th className="p-2 border-r border-slate-700 w-28 text-right">একক রেট (৳)</th>
                        <th className="p-2 border-r border-slate-700 w-32 text-right">মোট (৳)</th>
                        <th className="p-2 w-12 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black/20 bg-white">
                      {qItems.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="p-2 font-bold">{item.name}</td>
                          <td className="p-2 text-center font-mono">{item.quantity} {item.unit}</td>
                          <td className="p-2 text-right font-mono">৳{item.unitPrice.toLocaleString('en-IN')}</td>
                          <td className="p-2 text-right font-black font-mono">৳{item.total.toLocaleString('en-IN')}</td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => setQItems(prev => prev.filter((_, i) => i !== idx))}
                              className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                              title="আইটেম মুছুন"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Item Row */}
                <div className="bg-amber-50 border-2 border-amber-300 p-3 rounded grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-black text-slate-800 mb-1">+ নতুন আইটেম যোগ করুন</label>
                    <input
                      type="text"
                      value={newItemName}
                      onChange={e => setNewItemName(e.target.value)}
                      placeholder="আইটেমের বিবরণ বা নাম লিখুন..."
                      className="w-full bg-white border border-black p-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-800 mb-1">রেট (৳)</label>
                    <input
                      type="number"
                      value={newItemRate || ''}
                      onChange={e => setNewItemRate(Number(e.target.value))}
                      placeholder="রেট"
                      className="w-full bg-white border border-black p-1.5 text-xs font-bold font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddQuotationItem}
                    className="w-full bg-slate-900 hover:bg-black text-yellow-400 font-black text-xs py-2 px-3 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>যোগ করুন</span>
                  </button>
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-100 p-4 border-2 border-black rounded-lg">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">সাবটোটাল (৳)</label>
                  <input
                    type="text"
                    value={`৳${qSubtotal.toLocaleString('en-IN')}`}
                    readOnly
                    className="w-full bg-slate-200 border-2 border-black p-2 text-xs font-black font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">স্পেশাল ডিসকাউন্ট (৳)</label>
                  <input
                    type="number"
                    value={qDiscount}
                    onChange={e => setQDiscount(Number(e.target.value))}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-black font-mono text-rose-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">সর্বমোট কোটেশন বাজেট (৳)</label>
                  <input
                    type="text"
                    value={`৳${qGrandTotal.toLocaleString('en-IN')}`}
                    readOnly
                    className="w-full bg-yellow-400 border-2 border-black p-2 text-xs font-black font-mono text-black"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 🌟 2. TYPE: EVENT INVOICE */}
          {type === 'event' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-4 border-2 border-black rounded-lg">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">ইনভয়েস নং *</label>
                  <input
                    type="text"
                    value={eInvoiceNo}
                    onChange={e => setEInvoiceNo(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">গ্রাহকের নাম *</label>
                  <input
                    type="text"
                    value={eCustomerName}
                    onChange={e => setECustomerName(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    value={eCustomerMobile}
                    onChange={e => setECustomerMobile(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">ইভেন্টের নাম</label>
                  <input
                    type="text"
                    value={eEventName}
                    onChange={e => setEEventName(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">ভেন্যু</label>
                  <input
                    type="text"
                    value={eVenue}
                    onChange={e => setEVenue(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">তারিখ</label>
                  <input
                    type="date"
                    value={eDate}
                    onChange={e => setEDate(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-800 mb-1">মূল ডেকোরেশন প্যাকেজ</label>
                  <input
                    type="text"
                    value={eDecorationPackage}
                    onChange={e => setEDecorationPackage(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">মূল প্যাকেজ খরচ (৳) *</label>
                  <input
                    type="number"
                    value={eBaseBudget}
                    onChange={e => setEBaseBudget(Number(e.target.value))}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-black font-mono"
                  />
                </div>
              </div>

              {/* Extra Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-slate-900">অতিরিক্ত ডেকোরেশন ও সেবাসমূহ</h4>
                  <span className="text-xs font-bold text-slate-600 font-mono">মোট: {eExtraItems.length}</span>
                </div>

                {eExtraItems.length > 0 && (
                  <div className="border-2 border-black overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-900 text-white font-black uppercase">
                        <tr>
                          <th className="p-2 border-r border-slate-700">সেবার বিবরণ</th>
                          <th className="p-2 border-r border-slate-700 w-24 text-center">পরিমাণ</th>
                          <th className="p-2 border-r border-slate-700 w-28 text-right">একক রেট (৳)</th>
                          <th className="p-2 border-r border-slate-700 w-32 text-right">মোট (৳)</th>
                          <th className="p-2 w-12 text-center">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-black/20 bg-white">
                        {eExtraItems.map((item, idx) => (
                          <tr key={item.id || idx}>
                            <td className="p-2 font-bold">{item.name}</td>
                            <td className="p-2 text-center font-mono">{item.quantity} {item.unit}</td>
                            <td className="p-2 text-right font-mono">৳{item.unitPrice.toLocaleString('en-IN')}</td>
                            <td className="p-2 text-right font-black font-mono">৳{item.totalPrice.toLocaleString('en-IN')}</td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => setEExtraItems(prev => prev.filter((_, i) => i !== idx))}
                                className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Add Extra Item Form */}
                <div className="bg-emerald-50 border-2 border-emerald-300 p-3 rounded grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-black text-slate-800 mb-1">+ অতিরিক্ত সার্ভিস যোগ করুন</label>
                    <input
                      type="text"
                      value={newItemName}
                      onChange={e => setNewItemName(e.target.value)}
                      placeholder="সার্ভিসের নাম..."
                      className="w-full bg-white border border-black p-1.5 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-800 mb-1">খরচ (৳)</label>
                    <input
                      type="number"
                      value={newItemRate || ''}
                      onChange={e => setNewItemRate(Number(e.target.value))}
                      placeholder="টাকা"
                      className="w-full bg-white border border-black p-1.5 text-xs font-bold font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddEventExtraItem}
                    className="w-full bg-slate-900 hover:bg-black text-emerald-400 font-black text-xs py-2 px-3 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>যোগ করুন</span>
                  </button>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-100 p-4 border-2 border-black rounded-lg">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">লেবার খরচ (৳)</label>
                  <input
                    type="number"
                    value={eLabourCost}
                    onChange={e => setELabourCost(Number(e.target.value))}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-black font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">ট্রান্সপোর্ট খরচ (৳)</label>
                  <input
                    type="number"
                    value={eTransportCost}
                    onChange={e => setETransportCost(Number(e.target.value))}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-black font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">ছাড় / ডিসকাউন্ট (৳)</label>
                  <input
                    type="number"
                    value={eDiscount}
                    onChange={e => setEDiscount(Number(e.target.value))}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-black font-mono text-rose-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">অগ্রিম জমা / পেইড (৳) *</label>
                  <input
                    type="number"
                    value={eAdvancePaid}
                    onChange={e => setEAdvancePaid(Number(e.target.value))}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-black font-mono text-emerald-700"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-800 mb-1">সর্বমোট বিল (Grand Total ৳)</label>
                  <input
                    type="text"
                    value={`৳${eGrandTotal.toLocaleString('en-IN')}`}
                    readOnly
                    className="w-full bg-yellow-400 border-2 border-black p-2 text-sm font-black font-mono text-black"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-800 mb-1">বর্তমান বকেয়া (Due ৳)</label>
                  <input
                    type="text"
                    value={`৳${eDueAmount.toLocaleString('en-IN')}`}
                    readOnly
                    className={`w-full border-2 border-black p-2 text-sm font-black font-mono ${
                      eDueAmount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 🌟 3. TYPE: SALES INVOICE */}
          {type === 'sales' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-4 border-2 border-black rounded-lg">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">বিক্রয় ইনভয়েস নং *</label>
                  <input
                    type="text"
                    value={sInvoiceNo}
                    onChange={e => setSInvoiceNo(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">গ্রাহকের নাম *</label>
                  <input
                    type="text"
                    value={sCustomerName}
                    onChange={e => setSCustomerName(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">মোবাইল নম্বর</label>
                  <input
                    type="text"
                    value={sCustomerMobile}
                    onChange={e => setSCustomerMobile(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">তারিখ</label>
                  <input
                    type="date"
                    value={sDate}
                    onChange={e => setSDate(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">পেমেন্ট মেথড</label>
                  <input
                    type="text"
                    value={sPaymentMethod}
                    onChange={e => setSPaymentMethod(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">ডিসকাউন্ট (৳)</label>
                  <input
                    type="number"
                    value={sDiscount}
                    onChange={e => setSDiscount(Number(e.target.value))}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-black font-mono text-rose-600"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-3 bg-slate-100 p-4 border-2 border-black rounded-lg">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">সাবটোটাল (৳)</label>
                  <input
                    type="text"
                    value={`৳${sSubtotal.toLocaleString('en-IN')}`}
                    readOnly
                    className="w-full bg-slate-200 border-2 border-black p-2 text-xs font-black font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">সর্বমোট বিক্রয় বিল (৳)</label>
                  <input
                    type="text"
                    value={`৳${sGrandTotal.toLocaleString('en-IN')}`}
                    readOnly
                    className="w-full bg-yellow-400 border-2 border-black p-2 text-xs font-black font-mono text-black"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 🌟 4. TYPE: RENTAL INVOICE */}
          {type === 'rental' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-4 border-2 border-black rounded-lg">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">ভাড়া ইনভয়েস নং *</label>
                  <input
                    type="text"
                    value={rInvoiceNo}
                    onChange={e => setRInvoiceNo(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">গ্রাহকের নাম *</label>
                  <input
                    type="text"
                    value={rCustomerName}
                    onChange={e => setRCustomerName(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    value={rCustomerMobile}
                    onChange={e => setRCustomerMobile(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">ইভেন্ট নাম</label>
                  <input
                    type="text"
                    value={rEventName}
                    onChange={e => setREventName(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">ভাড়ার শুরুর তারিখ</label>
                  <input
                    type="date"
                    value={rDate}
                    onChange={e => setRDate(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">ফেরত দেওয়ার তারিখ</label>
                  <input
                    type="date"
                    value={rReturnDate}
                    onChange={e => setRReturnDate(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                  />
                </div>
              </div>

              {/* Financial breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-100 p-4 border-2 border-black rounded-lg">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">সিকিউরিটি ডিপোজিট (৳)</label>
                  <input
                    type="number"
                    value={rSecurityDeposit}
                    onChange={e => setRSecurityDeposit(Number(e.target.value))}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-black font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">ট্রান্সপোর্ট খরচ (৳)</label>
                  <input
                    type="number"
                    value={rTransportCharge}
                    onChange={e => setRTransportCharge(Number(e.target.value))}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-black font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">পরিশোধিত টাকা (৳) *</label>
                  <input
                    type="number"
                    value={rPaidAmount}
                    onChange={e => setRPaidAmount(Number(e.target.value))}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-black font-mono text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">বকেয়া টাকা (Due ৳)</label>
                  <input
                    type="text"
                    value={`৳${rDueAmount.toLocaleString('en-IN')}`}
                    readOnly
                    className={`w-full border-2 border-black p-2 text-xs font-black font-mono ${
                      rDueAmount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 🌟 5. TYPE: PURCHASE INVOICE */}
          {type === 'purchase' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-4 border-2 border-black rounded-lg">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">ক্রয় চালান নং *</label>
                  <input
                    type="text"
                    value={pPurchaseNo}
                    onChange={e => setPPurchaseNo(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">সাপ্লায়ার ইনভয়েস নং</label>
                  <input
                    type="text"
                    value={pInvoiceNo}
                    onChange={e => setPInvoiceNo(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">তারিখ</label>
                  <input
                    type="date"
                    value={pDate}
                    onChange={e => setPDate(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">সাপ্লায়ার / ভেন্ডরের নাম *</label>
                  <input
                    type="text"
                    value={pSupplierName}
                    onChange={e => setPSupplierName(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">সাপ্লায়ার মোবাইল</label>
                  <input
                    type="text"
                    value={pSupplierMobile}
                    onChange={e => setPSupplierMobile(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">পেমেন্ট স্ট্যাটাস</label>
                  <select
                    value={pPaymentStatus}
                    onChange={e => setPPaymentStatus(e.target.value as any)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-black"
                  >
                    <option value="Paid">Paid (পরিশোধিত)</option>
                    <option value="Due">Due (বকেয়া)</option>
                    <option value="Partial">Partial (আংশিক)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-800 mb-1">পণ্য বা মালামালের নাম *</label>
                  <input
                    type="text"
                    value={pItemName}
                    onChange={e => setPItemName(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">পরিমাণ ও ইউনিট</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={pQty}
                      onChange={e => setPQty(Number(e.target.value))}
                      className="w-20 bg-white border-2 border-black p-2 text-xs font-bold font-mono"
                    />
                    <input
                      type="text"
                      value={pUnit}
                      onChange={e => setPUnit(e.target.value)}
                      className="flex-1 bg-white border-2 border-black p-2 text-xs font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">একক দর (Unit Price ৳) *</label>
                  <input
                    type="number"
                    value={pUnitPrice}
                    onChange={e => setPUnitPrice(Number(e.target.value))}
                    className="w-full bg-white border-2 border-black p-2 text-xs font-black font-mono"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-800 mb-1">সর্বমোট ক্রয় মূল্য (৳)</label>
                  <input
                    type="text"
                    value={`৳${(pQty * pUnitPrice).toLocaleString('en-IN')}`}
                    readOnly
                    className="w-full bg-yellow-400 border-2 border-black p-2 text-sm font-black font-mono text-black"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 📎 Attached Documents & Photos Manager (All Invoice Types) */}
          <div className="bg-slate-50 border-2 border-black p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <Paperclip size={16} className="text-black" />
                <h4 className="text-xs font-black uppercase text-black">
                  সংযুক্ত ছবি ও ফাইলসমূহ (Attached Photos & Documents)
                </h4>
              </div>
              <span className="text-[10px] font-bold bg-yellow-300 text-black px-2 py-0.5 rounded border border-black self-start sm:self-auto">
                একাধিক ফাইল আপলোড সাপোর্ট
              </span>
            </div>

            {attachedFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {attachedFiles.map((file, idx) => (
                  <div key={idx} className="bg-white border-2 border-black p-2 flex items-center justify-between gap-2 shadow-[2px_2px_0px_0px_#000]">
                    <div className="flex items-center gap-2 min-w-0">
                      {file.type === 'image' || file.url.startsWith('data:image/') ? (
                        <img src={file.url} alt={file.name} className="w-8 h-8 object-cover border border-black rounded shrink-0" />
                      ) : (
                        <FileText size={20} className="text-indigo-600 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-slate-800 truncate" title={file.name}>
                        {file.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="p-1 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-300 rounded transition shrink-0"
                      title="ফাইল মুছে ফেলুন"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">কোনো ছবি বা ডকুমেন্ট সংযুক্ত নেই।</p>
            )}

            <div className="pt-2">
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                + নতুন ছবি বা ডকুমেন্ট যুক্ত করুন (Add More Files):
              </label>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={handleModalFileUpload}
                className="w-full bg-white border-2 border-black p-1.5 text-xs font-bold cursor-pointer"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t-2 border-black flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-black font-black text-xs uppercase bg-white hover:bg-slate-100 cursor-pointer shadow-xs"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-6 py-2 border-2 border-black font-black text-xs uppercase bg-yellow-400 hover:bg-yellow-500 text-black flex items-center gap-1.5 cursor-pointer shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition"
            >
              <Save size={15} />
              <span>পরিবর্তন সংরক্ষণ করুন (Save Updates)</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
