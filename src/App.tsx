import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  CalendarClock, 
  ShieldAlert, 
  Users, 
  CreditCard, 
  ClipboardList, 
  BarChart3, 
  Settings,
  Download,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  Trash2,
  Truck,
  UserCheck,
  FileText,
  Lock,
  Unlock,
  LogIn,
  LogOut,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Share2
} from 'lucide-react';
import { 
  StockItem, 
  PurchaseEntry, 
  SalesEntry, 
  RentalOutEntry, 
  DamageEntry, 
  Customer, 
  Supplier, 
  ExpenseEntry, 
  EventEntry, 
  Worker,
  EventMaterial,
  AttendanceRecord,
  SalaryPayment,
  Vehicle,
  TripLog,
  OnlineBooking,
  Attachment,
  PurchaseInvoice,
  SalesInvoice,
  RentalInvoice,
  EventInvoice,
  EventGalleryItem,
  EventWorkerAssignment,
  EventQuotation,
  UserProfile,
  UserRole,
  PortfolioItem
} from './types';
import { 
  INITIAL_STOCK, 
  INITIAL_CUSTOMERS, 
  INITIAL_SUPPLIERS, 
  INITIAL_PURCHASES, 
  INITIAL_SALES, 
  INITIAL_RENTAL_OUT, 
  INITIAL_DAMAGES, 
  INITIAL_EXPENSES, 
  INITIAL_EVENTS, 
  INITIAL_WORKERS,
  INITIAL_QUOTATIONS
} from './mockData';
import { 
  INITIAL_PORTFOLIO_CATEGORIES, 
  SAMPLE_DECOR_PORTFOLIO 
} from './data/decorShowcaseData';

// Component imports
import Dashboard from './components/Dashboard';
import MasterStock from './components/MasterStock';
import PurchaseTracker from './components/PurchaseEntry';
import SalesTracker from './components/SalesEntry';
import RentalTracker from './components/RentalTracker';
import DamageTracker from './components/DamageTracker';
import ContactManager from './components/ContactManager';
import ExpenseTracker from './components/ExpenseTracker';
import EventManager from './components/EventManager';
import ProfitLoss from './components/ProfitLoss';
import HRManager from './components/HRManager';
import LogisticsManager from './components/LogisticsManager';
import CustomerPortal from './components/CustomerPortal';
import InvoiceHub from './components/InvoiceHub';
import EventProjectPage from './components/EventProjectPage';
import CustomerTimeline from './components/CustomerTimeline';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import AuthModal from './components/AuthModal';
import UserManager from './components/UserManager';
import ShareModal from './components/ShareModal';

const DEFAULT_APPROVED_USERS: UserProfile[] = [
  {
    id: 'user-admin-super',
    email: 'info.samriddhiskitchen@gmail.com',
    password: 'admin',
    name: 'সমৃদ্ধিস কিচেন (Super Admin)',
    role: 'Admin',
    isApproved: true,
    provider: 'google',
    createdAt: '2025-01-01T00:00:00Z',
    designation: 'মালিক ও প্রধান প্রশাসক'
  },
  {
    id: 'user-manager-demo',
    email: 'manager@rittikadecor.com',
    password: 'manager123',
    name: 'তানভীর আহমেদ (Manager)',
    role: 'Manager',
    isApproved: true,
    provider: 'email',
    createdAt: '2025-01-01T00:00:00Z',
    designation: 'ইভেন্ট ও বিলিং ম্যানেজার'
  },
  {
    id: 'user-staff-demo',
    email: 'staff@rittikadecor.com',
    password: 'staff123',
    name: 'করিম উল্লাহ (Staff)',
    role: 'Staff',
    isApproved: true,
    provider: 'email',
    createdAt: '2025-01-01T00:00:00Z',
    designation: 'স্টক ও লজিস্টিকস স্টাফ'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // 🔐 Authentication & RBAC User Management
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(DEFAULT_APPROVED_USERS[0]);
  const [approvedUsers, setApprovedUsers] = useState<UserProfile[]>(DEFAULT_APPROVED_USERS);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // 🗑️ Reliable Global Delete Modal State
  const [pendingDelete, setPendingDelete] = useState<{
    title: string;
    message?: string;
    itemName?: string;
    onConfirm: () => void;
  } | null>(null);

  // 🔔 Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Core Persistent States & Cross-tab Action Triggers
  const [autoOpenAddRental, setAutoOpenAddRental] = useState(false);
  const [preselectedRentalItemCode, setPreselectedRentalItemCode] = useState<string | null>(null);

  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [purchases, setPurchases] = useState<PurchaseEntry[]>([]);
  const [sales, setSales] = useState<SalesEntry[]>([]);
  const [rentals, setRentals] = useState<RentalOutEntry[]>([]);
  const [damages, setDamages] = useState<DamageEntry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);

  // Advanced Enterprise States
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [salaries, setSalaries] = useState<SalaryPayment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: 'v-1', plateNo: 'ঢাকা মেট্রো-ন ১১-২২৩৩', name: 'টাটা পিকআপ ভ্যান (TR-101)', status: 'Available', driverName: 'রফিক মিয়া' },
    { id: 'v-2', plateNo: 'ঢাকা মেট্রো-ট ৪৪-৫৫৬৬', name: 'ডেলিভারি কাভার্ড ভ্যান (TR-202)', status: 'Available', driverName: 'বাবুল সর্দার' }
  ]);
  const [trips, setTrips] = useState<TripLog[]>([]);
  const [onlineBookings, setOnlineBookings] = useState<OnlineBooking[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [portfolioCategories, setPortfolioCategories] = useState<string[]>(INITIAL_PORTFOLIO_CATEGORIES);

  // Advanced Document & Event Management Modules
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>([]);
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>([]);
  const [rentalInvoices, setRentalInvoices] = useState<RentalInvoice[]>([]);
  const [eventInvoices, setEventInvoices] = useState<EventInvoice[]>([]);
  const [galleryItems, setGalleryItems] = useState<EventGalleryItem[]>([]);
  const [assignments, setAssignments] = useState<EventWorkerAssignment[]>([]);
  const [quotations, setQuotations] = useState<EventQuotation[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // 🔄 Load Data from LocalStorage or seed defaults
  useEffect(() => {
    const cleanLoaded = localStorage.getItem('erp_clean_v4_loaded');
    if (!cleanLoaded) {
      localStorage.removeItem('erp_stock');
      localStorage.removeItem('erp_purchases');
      localStorage.removeItem('erp_sales');
      localStorage.removeItem('erp_rentals');
      localStorage.removeItem('erp_damages');
      localStorage.removeItem('erp_customers');
      localStorage.removeItem('erp_suppliers');
      localStorage.removeItem('erp_expenses');
      localStorage.removeItem('erp_events');
      localStorage.removeItem('erp_workers');
      localStorage.setItem('erp_clean_v4_loaded', 'true');
    }

    const savedStock = localStorage.getItem('erp_stock');
    const savedPurchases = localStorage.getItem('erp_purchases');
    const savedSales = localStorage.getItem('erp_sales');
    const savedRentals = localStorage.getItem('erp_rentals');
    const savedDamages = localStorage.getItem('erp_damages');
    const savedCustomers = localStorage.getItem('erp_customers');
    const savedSuppliers = localStorage.getItem('erp_suppliers');
    const savedExpenses = localStorage.getItem('erp_expenses');
    const savedEvents = localStorage.getItem('erp_events');
    const savedWorkers = localStorage.getItem('erp_workers');
    const savedAttendance = localStorage.getItem('erp_attendance');
    const savedSalaries = localStorage.getItem('erp_salaries');
    const savedVehicles = localStorage.getItem('erp_vehicles');
    const savedTrips = localStorage.getItem('erp_trips');
    const savedOnlineBookings = localStorage.getItem('erp_online_bookings');
    const savedAttachments = localStorage.getItem('erp_attachments');
    const savedUsers = localStorage.getItem('erp_approved_users');
    const savedCurrentUser = localStorage.getItem('erp_current_user');

    if (savedStock) setStockItems(JSON.parse(savedStock));
    else setStockItems(INITIAL_STOCK);

    if (savedPurchases) setPurchases(JSON.parse(savedPurchases));
    else setPurchases(INITIAL_PURCHASES);

    if (savedSales) setSales(JSON.parse(savedSales));
    else setSales(INITIAL_SALES);

    if (savedRentals) setRentals(JSON.parse(savedRentals));
    else setRentals(INITIAL_RENTAL_OUT);

    if (savedDamages) setDamages(JSON.parse(savedDamages));
    else setDamages(INITIAL_DAMAGES);

    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    else setCustomers(INITIAL_CUSTOMERS);

    if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));
    else setSuppliers(INITIAL_SUPPLIERS);

    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    else setExpenses(INITIAL_EXPENSES);

    if (savedEvents) setEvents(JSON.parse(savedEvents));
    else setEvents(INITIAL_EVENTS);

    if (savedWorkers) setWorkers(JSON.parse(savedWorkers));
    else setWorkers(INITIAL_WORKERS);

    if (savedAttendance) setAttendance(JSON.parse(savedAttendance));
    if (savedSalaries) setSalaries(JSON.parse(savedSalaries));
    if (savedVehicles) setVehicles(JSON.parse(savedVehicles));
    if (savedTrips) setTrips(JSON.parse(savedTrips));
    if (savedOnlineBookings) setOnlineBookings(JSON.parse(savedOnlineBookings));
    if (savedAttachments) setAttachments(JSON.parse(savedAttachments));

    if (savedUsers) {
      setApprovedUsers(JSON.parse(savedUsers));
    } else {
      localStorage.setItem('erp_approved_users', JSON.stringify(DEFAULT_APPROVED_USERS));
    }

    if (savedCurrentUser) {
      setCurrentUser(JSON.parse(savedCurrentUser));
    }

    const savedPurchaseInvoices = localStorage.getItem('erp_purchase_invoices');
    const savedSalesInvoices = localStorage.getItem('erp_sales_invoices');
    const savedRentalInvoices = localStorage.getItem('erp_rental_invoices');
    const savedEventInvoices = localStorage.getItem('erp_event_invoices');
    const savedGalleryItems = localStorage.getItem('erp_gallery_items');
    const savedAssignments = localStorage.getItem('erp_event_assignments');
    const savedQuotations = localStorage.getItem('erp_quotations');
    const savedPortfolio = localStorage.getItem('erp_portfolio_items');
    const savedCategories = localStorage.getItem('erp_portfolio_categories');

    if (savedPurchaseInvoices) setPurchaseInvoices(JSON.parse(savedPurchaseInvoices));
    if (savedSalesInvoices) setSalesInvoices(JSON.parse(savedSalesInvoices));
    if (savedRentalInvoices) setRentalInvoices(JSON.parse(savedRentalInvoices));
    if (savedEventInvoices) setEventInvoices(JSON.parse(savedEventInvoices));
    if (savedGalleryItems) setGalleryItems(JSON.parse(savedGalleryItems));
    if (savedAssignments) setAssignments(JSON.parse(savedAssignments));
    if (savedQuotations) setQuotations(JSON.parse(savedQuotations));
    else setQuotations(INITIAL_QUOTATIONS);

    if (savedPortfolio) setPortfolioItems(JSON.parse(savedPortfolio));
    else setPortfolioItems(SAMPLE_DECOR_PORTFOLIO as unknown as PortfolioItem[]);

    if (savedCategories) setPortfolioCategories(JSON.parse(savedCategories));
    else setPortfolioCategories(INITIAL_PORTFOLIO_CATEGORIES);

    // 🌐 URL Parameter Detection for easy sharing links (?tab=portal, ?tab=booking, etc.)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam) {
        if (tabParam === 'booking') {
          setActiveTab('portal');
        } else {
          setActiveTab(tabParam);
        }
      }
    }
  }, []);

  // 💾 Sync updates back to LocalStorage
  const saveState = (key: string, data: any, setter: Function) => {
    setter(data);
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Helper for initiating a reliable delete modal
  const requestDelete = (title: string, itemName: string | undefined, onConfirmAction: () => void) => {
    setPendingDelete({
      title,
      itemName,
      onConfirm: () => {
        onConfirmAction();
        setPendingDelete(null);
        showToast('রেকর্ডটি সফলভাবে মুছে ফেলা হয়েছে এবং হিসাব আপডেট হয়েছে!');
      }
    });
  };

  // User Auth Actions
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('erp_current_user', JSON.stringify(user));
    showToast(`স্বাগতম ${user.name}! (${user.role} হিসেবে লগইন সম্পন্ন)`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('erp_current_user');
    setActiveTab('portal');
    showToast('সফলভাবে লগআউট করা হয়েছে।');
  };

  const handleRequestAccess = (email: string, name: string, requestedRole: UserRole, phone?: string, password?: string) => {
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      name,
      password: password || '123456',
      role: requestedRole,
      isApproved: false,
      phone,
      provider: 'email',
      createdAt: new Date().toISOString()
    };
    const updated = [...approvedUsers, newUser];
    saveState('erp_approved_users', updated, setApprovedUsers);
  };

  const handleAddApprovedUser = (userData: Omit<UserProfile, 'id'>) => {
    const newUser: UserProfile = {
      ...userData,
      id: `usr-${Date.now()}`
    };
    const updated = [...approvedUsers, newUser];
    saveState('erp_approved_users', updated, setApprovedUsers);
    showToast(`নতুন ব্যবহারকারী "${newUser.name}" সফলভাবে যুক্ত হয়েছে!`);
  };

  const handleUpdateUser = (id: string, updated: Partial<UserProfile>) => {
    const updatedList = approvedUsers.map(u => u.id === id ? { ...u, ...updated } : u);
    saveState('erp_approved_users', updatedList, setApprovedUsers);
    if (currentUser && currentUser.id === id) {
      const newCurrent = { ...currentUser, ...updated };
      setCurrentUser(newCurrent);
      localStorage.setItem('erp_current_user', JSON.stringify(newCurrent));
    }
    showToast('ইউজার প্রোফাইল ও অ্যাক্সেস আপডেট করা হয়েছে!');
  };

  const handleDeleteUser = (id: string) => {
    const u = approvedUsers.find(x => x.id === id);
    requestDelete('অনুমোদিত ইউজার মুছুন', u ? `${u.name} (${u.email})` : undefined, () => {
      const updatedList = approvedUsers.filter(x => x.id !== id);
      saveState('erp_approved_users', updatedList, setApprovedUsers);
    });
  };

  // State mutation actions with reliable delete
  const handleAddItem = (item: Omit<StockItem, 'id'>) => {
    const newItem: StockItem = { ...item, id: `item-${Date.now()}` };
    saveState('erp_stock', [...stockItems, newItem], setStockItems);
    showToast(`"${newItem.name}" মালামাল স্টকে যুক্ত হয়েছে!`);
  };

  const handleUpdateItem = (id: string, updated: Omit<StockItem, 'id'>) => {
    const updatedList = stockItems.map(item => item.id === id ? { ...updated, id } : item);
    saveState('erp_stock', updatedList, setStockItems);
    showToast('স্টক আইটেম সফলভাবে আপডেট হয়েছে!');
  };

  const handleDeleteItem = (id: string) => {
    const item = stockItems.find(i => i.id === id);
    requestDelete('স্টক আইটেমটি স্থায়ীভাবে মুছুন', item ? `${item.name} (${item.code})` : undefined, () => {
      const updatedList = stockItems.filter(item => item.id !== id);
      saveState('erp_stock', updatedList, setStockItems);
    });
  };

  const handleAddPurchase = (purchase: Omit<PurchaseEntry, 'id'>) => {
    const newPurchase: PurchaseEntry = { ...purchase, id: `p-${Date.now()}` };
    saveState('erp_purchases', [...purchases, newPurchase], setPurchases);
    showToast(`ক্রয় এন্ট্রি (কোড: ${newPurchase.itemCode}) যুক্ত হয়েছে!`);
  };

  const handleUpdatePurchase = (id: string, updated: Omit<PurchaseEntry, 'id'>) => {
    const updatedList = purchases.map(p => p.id === id ? { ...updated, id } : p);
    saveState('erp_purchases', updatedList, setPurchases);
    showToast('ক্রয় রেকর্ড সফলভাবে আপডেট হয়েছে!');
  };

  const handleDeletePurchase = (id: string) => {
    const p = purchases.find(x => x.id === id);
    requestDelete('ক্রয় রেকর্ড মুছুন', p ? `আইটেম কোড: ${p.itemCode} (৳${p.totalAmount})` : undefined, () => {
      const updatedList = purchases.filter(p => p.id !== id);
      saveState('erp_purchases', updatedList, setPurchases);
    });
  };

  const handleAddSale = (sale: Omit<SalesEntry, 'id'>) => {
    const newSale: SalesEntry = { ...sale, id: `sa-${Date.now()}` };
    saveState('erp_sales', [...sales, newSale], setSales);
    showToast(`বিক্রয় চালান সংরক্ষিত হয়েছে!`);
  };

  const handleUpdateSale = (id: string, updated: Omit<SalesEntry, 'id'>) => {
    const updatedList = sales.map(s => s.id === id ? { ...updated, id } : s);
    saveState('erp_sales', updatedList, setSales);
    showToast('বিক্রয় রেকর্ড আপডেট হয়েছে!');
  };

  const handleDeleteSale = (id: string) => {
    const s = sales.find(x => x.id === id);
    requestDelete('বিক্রয় রেকর্ড মুছুন', s ? `গ্রাহক: ${s.customerName} (৳${s.totalPrice})` : undefined, () => {
      const updatedList = sales.filter(s => s.id !== id);
      saveState('erp_sales', updatedList, setSales);
    });
  };

  const handleAddRental = (rental: Omit<RentalOutEntry, 'id'>) => {
    const newRental: RentalOutEntry = { ...rental, id: `r-${Date.now()}` };
    saveState('erp_rentals', [...rentals, newRental], setRentals);
    showToast(`ভাড়া এন্ট্রি সংরক্ষিত হয়েছে!`);
  };

  const handleUpdateRental = (id: string, updated: Omit<RentalOutEntry, 'id'>) => {
    const updatedList = rentals.map(r => r.id === id ? { ...updated, id } : r);
    saveState('erp_rentals', updatedList, setRentals);
    showToast('ভাড়া রেকর্ড আপডেট হয়েছে!');
  };

  const handleDeleteRental = (id: string) => {
    const r = rentals.find(x => x.id === id);
    requestDelete('ভাড়া রেকর্ড মুছুন', r ? `গ্রাহক: ${r.customerName} (${r.itemCode})` : undefined, () => {
      const updatedList = rentals.filter(r => r.id !== id);
      saveState('erp_rentals', updatedList, setRentals);
    });
  };

  const handleRecordReturn = (
    rentalOutId: string,
    returnedQty: number,
    damageQty: number,
    date: string,
    note: string
  ) => {
    const updatedRentals = rentals.map(r => {
      if (r.id === rentalOutId) {
        const totalReturned = r.returnedQty + returnedQty;
        let newStatus: 'Rented' | 'Returned' | 'Partial' = 'Rented';
        if (totalReturned >= r.qty) {
          newStatus = 'Returned';
        } else if (totalReturned > 0) {
          newStatus = 'Partial';
        }
        return { ...r, returnedQty: totalReturned, status: newStatus };
      }
      return r;
    });
    saveState('erp_rentals', updatedRentals, setRentals);

    if (damageQty > 0) {
      const targetRental = rentals.find(r => r.id === rentalOutId);
      if (targetRental) {
        const item = stockItems.find(i => i.code === targetRental.itemCode);
        const damageCost = item ? item.purchasePrice : 100;
        const newDamage: DamageEntry = {
          id: `d-${Date.now()}`,
          date,
          itemCode: targetRental.itemCode,
          qty: damageQty,
          type: 'Damage',
          cost: damageCost,
          note: `ভাড়া আইডি ${rentalOutId} থেকে ফেরত আসার পর ক্ষতিগ্রস্ত পাওয়া গেছে। ${note}`
        };
        saveState('erp_damages', [...damages, newDamage], setDamages);
      }
    }
    showToast('মালামাল ফেরত ও স্টক আপডেট সম্পন্ন!');
  };

  const handleAddDamage = (damage: Omit<DamageEntry, 'id'>) => {
    const newDamage: DamageEntry = { ...damage, id: `d-${Date.now()}` };
    saveState('erp_damages', [...damages, newDamage], setDamages);
    showToast('ক্ষতিগ্রস্ত/নষ্ট রেকর্ড এন্ট্রি হয়েছে!');
  };

  const handleUpdateDamage = (id: string, updated: Omit<DamageEntry, 'id'>) => {
    const updatedList = damages.map(d => d.id === id ? { ...updated, id } : d);
    saveState('erp_damages', updatedList, setDamages);
    showToast('নষ্ট রেকর্ড আপডেট হয়েছে!');
  };

  const handleDeleteDamage = (id: string) => {
    const d = damages.find(x => x.id === id);
    requestDelete('নষ্ট/ক্ষতিগ্রস্ত এন্ট্রি মুছুন', d ? `কোড: ${d.itemCode} (${d.qty} টি)` : undefined, () => {
      const updatedList = damages.filter(d => d.id !== id);
      saveState('erp_damages', updatedList, setDamages);
    });
  };

  const handleAddCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer: Customer = { ...customer, id: `c-${Date.now()}` };
    saveState('erp_customers', [...customers, newCustomer], setCustomers);
    showToast(`গ্রাহক "${newCustomer.name}" যুক্ত হয়েছে!`);
  };

  const handleUpdateCustomer = (id: string, updated: Omit<Customer, 'id'>) => {
    const updatedList = customers.map(c => c.id === id ? { ...updated, id } : c);
    saveState('erp_customers', updatedList, setCustomers);
    showToast('গ্রাহক তথ্য আপডেট হয়েছে!');
  };

  const handleDeleteCustomer = (id: string) => {
    const c = customers.find(x => x.id === id);
    requestDelete('কাস্টমার প্রোফাইল মুছুন', c ? `${c.name} (${c.mobile})` : undefined, () => {
      const updatedList = customers.filter(c => c.id !== id);
      saveState('erp_customers', updatedList, setCustomers);
    });
  };

  const handleAddSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = { ...supplier, id: `s-${Date.now()}` };
    saveState('erp_suppliers', [...suppliers, newSupplier], setSuppliers);
    showToast(`সরবরাহকারী "${newSupplier.name}" যুক্ত হয়েছে!`);
  };

  const handleUpdateSupplier = (id: string, updated: Omit<Supplier, 'id'>) => {
    const updatedList = suppliers.map(s => s.id === id ? { ...updated, id } : s);
    saveState('erp_suppliers', updatedList, setSuppliers);
    showToast('সরবরাহকারী তথ্য আপডেট হয়েছে!');
  };

  const handleDeleteSupplier = (id: string) => {
    const s = suppliers.find(x => x.id === id);
    requestDelete('সরবরাহকারী রেকর্ড মুছুন', s ? `${s.name} (${s.mobile})` : undefined, () => {
      const updatedList = suppliers.filter(s => s.id !== id);
      saveState('erp_suppliers', updatedList, setSuppliers);
    });
  };

  const handleAddExpense = (expense: Omit<ExpenseEntry, 'id'>) => {
    const newExpense: ExpenseEntry = { ...expense, id: `e-${Date.now()}` };
    saveState('erp_expenses', [...expenses, newExpense], setExpenses);
    showToast(`খরচ এন্ট্রি (৳${newExpense.amount}) যুক্ত হয়েছে!`);
  };

  const handleUpdateExpense = (id: string, updated: Omit<ExpenseEntry, 'id'>) => {
    const updatedList = expenses.map(e => e.id === id ? { ...updated, id } : e);
    saveState('erp_expenses', updatedList, setExpenses);
    showToast('খরচ রেকর্ড আপডেট হয়েছে!');
  };

  const handleDeleteExpense = (id: string) => {
    const e = expenses.find(x => x.id === id);
    requestDelete('খরচ এন্ট্রি মুছুন', e ? `${e.category} (৳${e.amount})` : undefined, () => {
      const updatedList = expenses.filter(e => e.id !== id);
      saveState('erp_expenses', updatedList, setExpenses);
    });
  };

  const handleAddEvent = (event: Omit<EventEntry, 'id'>) => {
    const newEvent: EventEntry = { ...event, id: `ev-${Date.now()}` };
    saveState('erp_events', [...events, newEvent], setEvents);
    showToast(`ইভেন্ট "${newEvent.name}" যুক্ত হয়েছে!`);
  };

  const handleUpdateEvent = (id: string, updated: Omit<EventEntry, 'id'>) => {
    const updatedList = events.map(ev => ev.id === id ? { ...updated, id } : ev);
    saveState('erp_events', updatedList, setEvents);
    showToast('ইভেন্ট তথ্য আপডেট হয়েছে!');
  };

  const handleDeleteEvent = (id: string) => {
    const ev = events.find(x => x.id === id);
    requestDelete('ইভেন্ট বুকিং মুছুন', ev ? `${ev.name} (বাজেট: ৳${ev.budget})` : undefined, () => {
      const updatedList = events.filter(e => e.id !== id);
      saveState('erp_events', updatedList, setEvents);
    });
  };

  const handleUpdateEventMaterials = (eventId: string, materials: EventMaterial[]) => {
    const updatedList = events.map(ev => ev.id === eventId ? { ...ev, materials } : ev);
    saveState('erp_events', updatedList, setEvents);
  };

  const handleUpdateEventStatus = (eventId: string, status: 'Pending' | 'Ongoing' | 'Completed') => {
    const updatedList = events.map(ev => ev.id === eventId ? { ...ev, status } : ev);
    saveState('erp_events', updatedList, setEvents);
    showToast(`ইভেন্ট স্ট্যাটাস "${status}" এ পরিবর্তিত হয়েছে!`);
  };

  const handleAddWorker = (worker: Omit<Worker, 'id'>) => {
    const newWorker: Worker = { ...worker, id: `w-${Date.now()}` };
    saveState('erp_workers', [...workers, newWorker], setWorkers);
    showToast(`কর্মী "${newWorker.name}" যুক্ত হয়েছে!`);
  };

  const handleUpdateWorker = (id: string, updated: Omit<Worker, 'id'>) => {
    const updatedList = workers.map(w => w.id === id ? { ...updated, id } : w);
    saveState('erp_workers', updatedList, setWorkers);
    showToast('কর্মী তথ্য আপডেট হয়েছে!');
  };

  const handleDeleteWorker = (id: string) => {
    const w = workers.find(x => x.id === id);
    requestDelete('কর্মী রেকর্ড মুছুন', w ? `${w.name} (${w.mobile})` : undefined, () => {
      const updatedList = workers.filter(w => w.id !== id);
      saveState('erp_workers', updatedList, setWorkers);
    });
  };

  const handleLogAttendance = (record: AttendanceRecord) => {
    const updatedList = attendance.filter(r => !(r.workerId === record.workerId && r.date === record.date));
    saveState('erp_attendance', [...updatedList, record], setAttendance);
    showToast(`${record.workerName}-এর হাজিরা সংরক্ষিত!`);
  };

  const handleDeleteAttendance = (recordId: string) => {
    const a = attendance.find(x => x.id === recordId);
    requestDelete('হাজিরা রেকর্ড মুছুন', a ? `${a.workerName} (${a.date})` : undefined, () => {
      const updatedList = attendance.filter(r => r.id !== recordId);
      saveState('erp_attendance', updatedList, setAttendance);
    });
  };

  const handlePaySalary = (payment: Omit<SalaryPayment, 'id'>) => {
    const newPayment: SalaryPayment = { ...payment, id: `sal-${Date.now()}` };
    saveState('erp_salaries', [...salaries, newPayment], setSalaries);

    const targetWorker = workers.find(w => w.id === payment.workerId);
    handleAddExpense({
      date: payment.date,
      category: 'শ্রমিক খরচ',
      amount: payment.amount,
      note: `বেতন প্রদান: ${targetWorker ? targetWorker.name : 'শ্রমিক'} (ভাতা ও অগ্রিম সহ)`
    });
    showToast(`বেতন প্রদান (৳${newPayment.amount}) সফল হয়েছে!`);
  };

  const handleUpdateSalary = (id: string, updated: Omit<SalaryPayment, 'id'>) => {
    const updatedList = salaries.map(s => s.id === id ? { ...updated, id } : s);
    saveState('erp_salaries', updatedList, setSalaries);
    showToast('বেতন রেকর্ড আপডেট হয়েছে!');
  };

  const handleDeleteSalary = (id: string) => {
    const s = salaries.find(x => x.id === id);
    requestDelete('বেতন পেমেন্ট রেকর্ড মুছুন', s ? `${s.workerName} (৳${s.amount})` : undefined, () => {
      const updatedList = salaries.filter(s => s.id !== id);
      saveState('erp_salaries', updatedList, setSalaries);
    });
  };

  const handleAddVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = { ...vehicle, id: `v-${Date.now()}` };
    saveState('erp_vehicles', [...vehicles, newVehicle], setVehicles);
    showToast(`যানবাহন "${newVehicle.name}" যুক্ত হয়েছে!`);
  };

  const handleUpdateVehicle = (id: string, updated: Omit<Vehicle, 'id'>) => {
    const updatedList = vehicles.map(v => v.id === id ? { ...updated, id } : v);
    saveState('erp_vehicles', updatedList, setVehicles);
    showToast('যানবাহন তথ্য আপডেট হয়েছে!');
  };

  const handleDeleteVehicle = (id: string) => {
    const v = vehicles.find(x => x.id === id);
    requestDelete('যানবাহন রেকর্ড মুছুন', v ? `${v.name} (${v.plateNo})` : undefined, () => {
      const updatedList = vehicles.filter(v => v.id !== id);
      saveState('erp_vehicles', updatedList, setVehicles);
    });
  };

  const handleAddTrip = (trip: Omit<TripLog, 'id'>) => {
    const newTrip: TripLog = { ...trip, id: `trip-${Date.now()}` };
    saveState('erp_trips', [...trips, newTrip], setTrips);

    handleAddExpense({
      date: trip.date,
      category: 'গাড়ি ভাড়া',
      amount: trip.fuelCost,
      note: `লজিস্টিক ট্রিপ: ${trip.destination} (যানবাহন: ${trip.vehicleName})`
    });
    showToast(`ট্রিপ রেকর্ড সংরক্ষিত হয়েছে!`);
  };

  const handleUpdateTrip = (id: string, updated: Omit<TripLog, 'id'>) => {
    const updatedList = trips.map(t => t.id === id ? { ...updated, id } : t);
    saveState('erp_trips', updatedList, setTrips);
    showToast('ট্রিপ রেকর্ড আপডেট হয়েছে!');
  };

  const handleDeleteTrip = (id: string) => {
    const t = trips.find(x => x.id === id);
    requestDelete('লজিস্টিক ট্রিপ মুছুন', t ? `${t.destination} (চালক: ${t.driverName})` : undefined, () => {
      const updatedList = trips.filter(t => t.id !== id);
      saveState('erp_trips', updatedList, setTrips);
    });
  };

  const handleAddOnlineBooking = (booking: Omit<OnlineBooking, 'id'>) => {
    const newBooking: OnlineBooking = { ...booking, id: `ob-${Date.now()}` };
    saveState('erp_online_bookings', [...onlineBookings, newBooking], setOnlineBookings);
    showToast('বুকিং রিকোয়েস্ট সফলভাবে জমা হয়েছে!');
  };

  const handleApproveBooking = (bookingId: string) => {
    const targetBooking = onlineBookings.find(b => b.id === bookingId);
    if (!targetBooking) return;

    let customer = customers.find(c => c.mobile === targetBooking.mobile);
    if (!customer) {
      const newCustId = `c-${Date.now()}`;
      customer = {
        id: newCustId,
        name: targetBooking.customerName,
        mobile: targetBooking.mobile,
        address: targetBooking.location,
        type: 'General',
        joinDate: targetBooking.date,
        totalPurchased: targetBooking.estimatedBudget
      };
      const updatedCustomers = [...customers, customer];
      saveState('erp_customers', updatedCustomers, setCustomers);
    }

    const newEvent: EventEntry = {
      id: `ev-${Date.now()}`,
      name: `${targetBooking.eventType} - ${targetBooking.customerName}`,
      date: targetBooking.date,
      customerId: customer.id,
      budget: targetBooking.estimatedBudget,
      paidAmount: 0,
      dueAmount: targetBooking.estimatedBudget,
      status: 'Pending',
      materials: []
    };
    const updatedEvents = [...events, newEvent];
    saveState('erp_events', updatedEvents, setEvents);

    const updatedBookings = onlineBookings.map(b => b.id === bookingId ? { ...b, status: 'Approved' as const } : b);
    saveState('erp_online_bookings', updatedBookings, setOnlineBookings);
    showToast(`বুকিং অনুমোদিত হয়েছে এবং নতুন ইভেন্ট প্রজেক্ট তৈরি হয়েছে!`);
  };

  const handleDeclineBooking = (bookingId: string) => {
    const updatedBookings = onlineBookings.map(b => b.id === bookingId ? { ...b, status: 'Declined' as const } : b);
    saveState('erp_online_bookings', updatedBookings, setOnlineBookings);
    showToast('বুকিং আবেদনটি বাতিল করা হয়েছে।');
  };

  const handleAddAttachment = (att: Omit<Attachment, 'id'>) => {
    const newAttachment: Attachment = { ...att, id: `att-${Date.now()}` };
    saveState('erp_attachments', [...attachments, newAttachment], setAttachments);
    showToast('কাগজপত্র / ফাইল আপলোড সম্পন্ন!');
  };

  const handleDeleteAttachment = (id: string) => {
    const att = attachments.find(x => x.id === id);
    requestDelete('ফাইল বা সংযুক্তি মুছুন', att ? att.name : undefined, () => {
      const updatedList = attachments.filter(a => a.id !== id);
      saveState('erp_attachments', updatedList, setAttachments);
    });
  };

  // 🌟 Decor Portfolio & Custom Category Handlers
  const handleAddPortfolioItem = (item: Omit<PortfolioItem, 'id'>) => {
    const newItem: PortfolioItem = { ...item, id: `port-${Date.now()}` };
    saveState('erp_portfolio_items', [newItem, ...portfolioItems], setPortfolioItems);
    showToast('নতুন পোর্টফোলিও ছবি যুক্ত হয়েছে!');
  };

  const handleUpdatePortfolioItem = (item: PortfolioItem) => {
    const updatedList = portfolioItems.map(p => p.id === item.id ? item : p);
    saveState('erp_portfolio_items', updatedList, setPortfolioItems);
    showToast('পোর্টফোলিও ছবি আপডেট করা হয়েছে!');
  };

  const handleDeletePortfolioItem = (id: string) => {
    const p = portfolioItems.find(x => x.id === id);
    requestDelete('পোর্টফোলিও ছবি মুছুন', p ? p.title : undefined, () => {
      const updatedList = portfolioItems.filter(x => x.id !== id);
      saveState('erp_portfolio_items', updatedList, setPortfolioItems);
    });
  };

  const handleAddCategory = (category: string) => {
    const trimmed = category.trim();
    if (!trimmed) return;
    if (!portfolioCategories.includes(trimmed)) {
      const updated = [...portfolioCategories, trimmed];
      saveState('erp_portfolio_categories', updated, setPortfolioCategories);
      showToast(`নতুন ক্যাটাগরি "${trimmed}" সফলভাবে তৈরি হয়েছে!`);
    } else {
      showToast(`"${trimmed}" ক্যাটাগরি ইতিমধ্যে বিদ্যমান রয়েছে।`);
    }
  };

  const handleDeleteCategory = (category: string) => {
    requestDelete('ক্যাটাগরি মুছুন', `ক্যাটাগরি: "${category}"`, () => {
      const updated = portfolioCategories.filter(c => c !== category);
      saveState('erp_portfolio_categories', updated, setPortfolioCategories);
    });
  };

  // 🔄 Modules 21-30 State Handlers
  const handleAddPurchaseInvoice = (inv: Omit<PurchaseInvoice, 'id'>) => {
    const newItem = { ...inv, id: `pi-${Date.now()}` };
    saveState('erp_purchase_invoices', [...purchaseInvoices, newItem], setPurchaseInvoices);
    showToast('ক্রয় চালান সফলভাবে সংরক্ষিত!');
  };
  const handleDeletePurchaseInvoice = (id: string) => {
    const pi = purchaseInvoices.find(x => x.id === id);
    requestDelete('ক্রয় চালান মুছুন', pi ? `চালান নং: ${pi.invoiceNo}` : undefined, () => {
      saveState('erp_purchase_invoices', purchaseInvoices.filter(x => x.id !== id), setPurchaseInvoices);
    });
  };

  const handleAddSalesInvoice = (inv: Omit<SalesInvoice, 'id'>) => {
    const newItem = { ...inv, id: `si-${Date.now()}` };
    saveState('erp_sales_invoices', [...salesInvoices, newItem], setSalesInvoices);
    showToast('বিক্রয় ইনভয়েস সফলভাবে তৈরি হয়েছে!');
  };
  const handleDeleteSalesInvoice = (id: string) => {
    const si = salesInvoices.find(x => x.id === id);
    requestDelete('বিক্রয় ইনভয়েস মুছুন', si ? `ইনভয়েস নং: ${si.invoiceNo}` : undefined, () => {
      saveState('erp_sales_invoices', salesInvoices.filter(x => x.id !== id), setSalesInvoices);
    });
  };

  const handleAddRentalInvoice = (inv: Omit<RentalInvoice, 'id'>) => {
    const newItem = { ...inv, id: `ri-${Date.now()}` };
    saveState('erp_rental_invoices', [...rentalInvoices, newItem], setRentalInvoices);
    showToast('ভাড়া ইনভয়েস তৈরি হয়েছে!');
  };
  const handleDeleteRentalInvoice = (id: string) => {
    const ri = rentalInvoices.find(x => x.id === id);
    requestDelete('ভাড়া ইনভয়েস মুছুন', ri ? `ইনভয়েস নং: ${ri.invoiceNo}` : undefined, () => {
      saveState('erp_rental_invoices', rentalInvoices.filter(x => x.id !== id), setRentalInvoices);
    });
  };

  const handleAddEventInvoice = (inv: Omit<EventInvoice, 'id'>) => {
    const newItem = { ...inv, id: `ei-${Date.now()}` };
    saveState('erp_event_invoices', [...eventInvoices, newItem], setEventInvoices);
    showToast('ইভেন্ট ইনভয়েস তৈরি হয়েছে!');
  };
  const handleDeleteEventInvoice = (id: string) => {
    const ei = eventInvoices.find(x => x.id === id);
    requestDelete('ইভেন্ট ইনভয়েস মুছুন', ei ? `ইনভয়েস নং: ${ei.invoiceNo}` : undefined, () => {
      saveState('erp_event_invoices', eventInvoices.filter(x => x.id !== id), setEventInvoices);
    });
  };

  const handleAddGalleryItem = (item: Omit<EventGalleryItem, 'id'>) => {
    const newItem = { ...item, id: `gi-${Date.now()}` };
    saveState('erp_gallery_items', [...galleryItems, newItem], setGalleryItems);
    showToast('গ্যালারিতে ছবি যোগ হয়েছে!');
  };
  const handleDeleteGalleryItem = (id: string) => {
    const g = galleryItems.find(x => x.id === id);
    requestDelete('ছবি ডিলিট করুন', g ? g.name : undefined, () => {
      saveState('erp_gallery_items', galleryItems.filter(x => x.id !== id), setGalleryItems);
    });
  };

  const handleAddAssignment = (asg: Omit<EventWorkerAssignment, 'id'>) => {
    const newItem = { ...asg, id: `ea-${Date.now()}` };
    saveState('erp_event_assignments', [...assignments, newItem], setAssignments);
    showToast('শ্রমিক দায়িত্ব বরাদ্দ সম্পন্ন!');
  };
  const handleDeleteAssignment = (id: string) => {
    const a = assignments.find(x => x.id === id);
    requestDelete('কর্মী দায়িত্ব বরাদ্দ মুছুন', a ? a.role : undefined, () => {
      saveState('erp_event_assignments', assignments.filter(x => x.id !== id), setAssignments);
    });
  };

  // 📝 Module 31: Event Budget Quotation Handlers
  const handleAddQuotation = (quotation: Omit<EventQuotation, 'id'>) => {
    const newItem: EventQuotation = { ...quotation, id: `quo-${Date.now()}` };
    saveState('erp_quotations', [...quotations, newItem], setQuotations);
    showToast(`বাজেট কোটেশন (${newItem.quotationNo}) তৈরি হয়েছে!`);
  };

  const handleUpdateQuotation = (id: string, updated: Omit<EventQuotation, 'id'>) => {
    const updatedList = quotations.map(q => q.id === id ? { ...updated, id } : q);
    saveState('erp_quotations', updatedList, setQuotations);
    showToast('বাজেট কোটেশন আপডেট হয়েছে!');
  };

  const handleDeleteQuotation = (id: string) => {
    const q = quotations.find(x => x.id === id);
    requestDelete('বাজেট কোটেশন মুছুন', q ? `${q.eventName} (${q.quotationNo})` : undefined, () => {
      saveState('erp_quotations', quotations.filter(x => x.id !== id), setQuotations);
    });
  };

  const handleConvertQuotationToEvent = (quotation: EventQuotation) => {
    let targetCustomerId = quotation.customerId;
    if (!targetCustomerId) {
      const existing = customers.find(c => c.mobile === quotation.customerMobile || (c.name === quotation.customerName && quotation.customerName.trim() !== ''));
      if (existing) {
        targetCustomerId = existing.id;
      } else {
        const newCustId = `c-${Date.now()}`;
        const newCustomer: Customer = {
          id: newCustId,
          name: quotation.customerName || 'গ্রাহক',
          mobile: quotation.customerMobile || '০১৭০০০০০০০০',
          address: quotation.customerAddress || quotation.venue || 'ঢাকা'
        };
        saveState('erp_customers', [...customers, newCustomer], setCustomers);
        targetCustomerId = newCustId;
      }
    }

    const newEvent: EventEntry = {
      id: `ev-${Date.now()}`,
      name: quotation.eventName,
      date: quotation.eventDate || quotation.date,
      customerId: targetCustomerId,
      budget: quotation.grandTotal,
      paidAmount: quotation.advanceRequired || 0,
      dueAmount: Math.max(0, quotation.grandTotal - (quotation.advanceRequired || 0)),
      status: 'Pending',
      materials: quotation.items.map(it => {
        const matchingStock = stockItems.find(st => st.name.toLowerCase() === it.name.toLowerCase());
        return {
          itemCode: matchingStock ? matchingStock.code : `CUST-${it.name.slice(0, 4)}`,
          qty: it.qty,
          checked: false
        };
      }),
      note: `বাজেট কোটেশন (${quotation.quotationNo}) থেকে তৈরি। ভেন্যু: ${quotation.venue} | বাজেট ধরণ: ${quotation.budgetType === 'Estimated' ? 'আনুমানিক' : 'ফিক্সড'}`
    };

    saveState('erp_events', [...events, newEvent], setEvents);
    const updatedQuotations = quotations.map(q => q.id === quotation.id ? { ...q, status: 'Converted' as const } : q);
    saveState('erp_quotations', updatedQuotations, setQuotations);
    showToast(`কোটেশনটি সফলভাবে লাইভ ইভেন্টে রূপান্তরিত হয়েছে!`);
  };

  // 💾 Export All ERP Database to JSON File
  const handleExportData = () => {
    const fullBackup = {
      version: '3.0',
      exportDate: new Date().toISOString(),
      stockItems,
      purchases,
      sales,
      rentals,
      damages,
      customers,
      suppliers,
      expenses,
      events,
      workers,
      attendance,
      salaries,
      vehicles,
      trips,
      onlineBookings,
      attachments,
      purchaseInvoices,
      salesInvoices,
      rentalInvoices,
      eventInvoices,
      galleryItems,
      assignments,
      quotations,
      approvedUsers
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Rittika_ERP_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে!');
  };

  // 💾 Import JSON file into ERP State
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.readAsText(files[0], "UTF-8");
    fileReader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.stockItems && Array.isArray(imported.stockItems)) {
          saveState('erp_stock', imported.stockItems, setStockItems);
          saveState('erp_purchases', imported.purchases || [], setPurchases);
          saveState('erp_sales', imported.sales || [], setSales);
          saveState('erp_rentals', imported.rentals || [], setRentals);
          saveState('erp_damages', imported.damages || [], setDamages);
          saveState('erp_customers', imported.customers || [], setCustomers);
          saveState('erp_suppliers', imported.suppliers || [], setSuppliers);
          saveState('erp_expenses', imported.expenses || [], setExpenses);
          saveState('erp_events', imported.events || [], setEvents);
          saveState('erp_workers', imported.workers || [], setWorkers);
          saveState('erp_attendance', imported.attendance || [], setAttendance);
          saveState('erp_salaries', imported.salaries || [], setSalaries);
          saveState('erp_vehicles', imported.vehicles || [], setVehicles);
          saveState('erp_trips', imported.trips || [], setTrips);
          saveState('erp_online_bookings', imported.onlineBookings || [], setOnlineBookings);
          saveState('erp_attachments', imported.attachments || [], setAttachments);
          saveState('erp_purchase_invoices', imported.purchaseInvoices || [], setPurchaseInvoices);
          saveState('erp_sales_invoices', imported.salesInvoices || [], setSalesInvoices);
          saveState('erp_rental_invoices', imported.rentalInvoices || [], setRentalInvoices);
          saveState('erp_event_invoices', imported.eventInvoices || [], setEventInvoices);
          saveState('erp_gallery_items', imported.galleryItems || [], setGalleryItems);
          saveState('erp_event_assignments', imported.assignments || [], setAssignments);
          saveState('erp_quotations', imported.quotations || [], setQuotations);
          if (imported.approvedUsers) {
            saveState('erp_approved_users', imported.approvedUsers, setApprovedUsers);
          }
          showToast('ব্যাকআপ ফাইল সফলভাবে রিস্টোর হয়েছে!');
        } else {
          alert('ভুল ফাইল ফরম্যাট! দয়া করে সঠিক DekoERP ব্যাকআপ ফাইল দিন।');
        }
      } catch (err) {
        alert('ফাইলটি পড়তে সমস্যা হচ্ছে। ফাইলটি যাচাই করুন।');
      }
    };
  };

  // 💾 Clear Database back to clean state
  const handleResetToSeeded = () => {
    requestDelete('সমস্ত ডাটা মুছে রিসেট করুন', 'সিস্টেমের সমস্ত ডাটা ও এন্ট্রি', () => {
      saveState('erp_stock', [], setStockItems);
      saveState('erp_purchases', [], setPurchases);
      saveState('erp_sales', [], setSales);
      saveState('erp_rentals', [], setRentals);
      saveState('erp_damages', [], setDamages);
      saveState('erp_customers', [], setCustomers);
      saveState('erp_suppliers', [], setSuppliers);
      saveState('erp_expenses', [], setExpenses);
      saveState('erp_events', [], setEvents);
      saveState('erp_workers', [], setWorkers);
      saveState('erp_attendance', [], setAttendance);
      saveState('erp_salaries', [], setSalaries);
      saveState('erp_vehicles', [], setVehicles);
      saveState('erp_trips', [], setTrips);
      saveState('erp_online_bookings', [], setOnlineBookings);
      saveState('erp_attachments', [], setAttachments);
      saveState('erp_purchase_invoices', [], setPurchaseInvoices);
      saveState('erp_sales_invoices', [], setSalesInvoices);
      saveState('erp_rental_invoices', [], setRentalInvoices);
      saveState('erp_event_invoices', [], setEventInvoices);
      saveState('erp_gallery_items', [], setGalleryItems);
      saveState('erp_event_assignments', [], setAssignments);
      saveState('erp_quotations', [], setQuotations);
    });
  };

  // Effective active role
  const effectiveRole: UserRole = (currentUser && currentUser.isApproved) ? currentUser.role : 'Viewer';
  const isApprovedStaffOrAdmin = currentUser && currentUser.isApproved && effectiveRole !== 'Viewer';
  const isSuperAdmin = currentUser && currentUser.isApproved && effectiveRole === 'Admin';

  // Navigation config (Bangla Enterprise Edition)
  const navItems = [
    // Operational & Financial Tabs (Protected)
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard, color: 'text-teal-600', minRole: 'Staff' },
    { id: 'stock', label: 'মাস্টার স্টক', icon: Package, color: 'text-slate-700', minRole: 'Staff' },
    { id: 'purchase', label: 'ক্রয় এন্ট্রি', icon: ShoppingCart, color: 'text-indigo-600', minRole: 'Manager' },
    { id: 'sales', label: 'সরাসরি বিক্রয়', icon: TrendingUp, color: 'text-emerald-600', minRole: 'Manager' },
    { id: 'rental', label: 'ভাড়া ও ফেরত', icon: CalendarClock, color: 'text-amber-600', minRole: 'Staff' },
    { id: 'damage', label: 'নষ্ট/হারানো', icon: ShieldAlert, color: 'text-red-600', minRole: 'Staff' },
    { id: 'contacts', label: 'কাস্টমার ও সরবরাহকারী', icon: Users, color: 'text-slate-800', minRole: 'Manager' },
    { id: 'expense', label: 'খরচ হিসাব', icon: CreditCard, color: 'text-pink-600', minRole: 'Manager' },
    { id: 'event', label: 'ইভেন্ট ও কর্মী', icon: ClipboardList, color: 'text-teal-700', minRole: 'Staff' },
    { id: 'event-projects', label: 'ইভেন্ট প্রজেক্ট পেজ', icon: ClipboardList, color: 'text-indigo-700', minRole: 'Manager' },
    { id: 'invoice-hub', label: 'ইনভয়েস ও ডকুমেন্ট হাব', icon: FileText, color: 'text-emerald-700 font-bold', minRole: 'Manager' },
    { id: 'customer-timeline', label: 'কাস্টমার হিস্ট্রি টাইমলাইন', icon: RefreshCw, color: 'text-amber-700', minRole: 'Manager' },
    { id: 'hr', label: 'এইচআর ও পেরোল', icon: UserCheck, color: 'text-rose-600', minRole: 'Admin' },
    { id: 'logistics', label: 'যানবাহন ও লজিস্টিকস', icon: Truck, color: 'text-blue-600', minRole: 'Staff' },
    { id: 'portal', label: 'পাবলিক পোর্টাল ও বুকিং', icon: FileText, color: 'text-purple-600', minRole: 'Viewer' },
    { id: 'profit-loss', label: 'লাভ-ক্ষতি রিপোর্ট', icon: BarChart3, color: 'text-emerald-700 font-bold', minRole: 'Admin' },
    { id: 'users', label: 'ইউজার ও রোল এক্সেস', icon: ShieldCheck, color: 'text-yellow-600 font-bold', minRole: 'Admin' }
  ];

  const canAccessTab = (tabId: string) => {
    if (tabId === 'portal') return true;
    if (!currentUser || !currentUser.isApproved) return false;
    if (effectiveRole === 'Admin') return true;
    if (effectiveRole === 'Manager') {
      return tabId !== 'hr' && tabId !== 'profit-loss' && tabId !== 'users';
    }
    if (effectiveRole === 'Staff') {
      return ['dashboard', 'stock', 'rental', 'damage', 'event', 'logistics', 'portal'].includes(tabId);
    }
    return false;
  };

  const filteredNavItems = navItems.filter(item => {
    if (item.id === 'portal') return true;
    if (!isApprovedStaffOrAdmin) return false;
    return canAccessTab(item.id);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f5] via-[#f7f3ff] to-[#f0f5fc] flex flex-col font-sans text-slate-900" id="main-application-frame">
      
      {/* 🌟 Toast Notification Bar */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-fadeIn" id="global-toast">
          <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 text-amber-300 border border-amber-400/40 px-4 py-2.5 rounded-xl shadow-xl text-xs font-black flex items-center gap-2 backdrop-blur-md">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 🌟 Top Header & Auth Navigation (Luxury Royal Velvet & Multi-Gradient) */}
      <header className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 border-b border-amber-400/20 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between sticky top-0 z-40 no-print gap-3 shadow-lg shadow-purple-950/20 text-white backdrop-blur-md" id="header-bar">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 p-0.5 shadow-md flex items-center justify-center text-white">
            <div className="w-full h-full bg-slate-950/40 rounded-[10px] flex items-center justify-center">
              <Sparkles size={20} className="text-amber-300 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-200 to-purple-200 leading-none">
              রিত্তিকা ইভেন্ট ম্যানেজমেন্ট
            </h1>
            <p className="text-[10px] text-amber-200/80 font-bold tracking-widest uppercase mt-0.5 flex items-center gap-1.5">
              <span>Rittika Event & Royal Decor ERP</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-ping"></span>
            </p>
          </div>
        </div>

        {/* Sync, Backup & Auth panel inside header */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          
          {/* 🌟 1-Click Share Website & Portal Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            title="ওয়েবসাইট লিংক, কিউআর কোড বা হোয়াটসঅ্যাপে যে কাউকে পাঠান"
            className="px-3.5 py-1.5 text-xs rounded-xl font-black uppercase flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 text-white shadow-md hover:shadow-lg transition cursor-pointer active:scale-95 border border-white/20"
          >
            <Share2 size={14} className="stroke-[2.5]" />
            <span>শেয়ার করুন</span>
          </button>

          {/* User Profile / Status Badge */}
          {currentUser ? (
            <div className="flex items-center gap-2 border border-white/15 bg-white/10 backdrop-blur-md rounded-xl p-1 px-2.5 text-xs shadow-inner">
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs ${
                  currentUser.role === 'Admin' ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white' :
                  currentUser.role === 'Manager' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' :
                  currentUser.role === 'Staff' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' :
                  'bg-slate-700 text-slate-200'
                }`}>
                  {currentUser.role === 'Admin' ? '👑 অ্যাডমিন' :
                   currentUser.role === 'Manager' ? '👔 ম্যানেজার' :
                   currentUser.role === 'Staff' ? '🛠️ স্টাফ' : '👁️ ভিউয়ার'}
                </span>
                <span className="font-bold text-amber-100 hidden sm:inline max-w-[130px] truncate" title={currentUser.email}>
                  {currentUser.name}
                </span>
              </div>

              <button
                onClick={handleLogout}
                title="লগআউট করুন"
                className="p-1 hover:bg-rose-500/20 text-rose-300 rounded-lg transition cursor-pointer"
              >
                <LogOut size={14} className="stroke-[2.5]" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="neo-btn neo-btn-primary px-3.5 py-1.5 text-xs font-black uppercase flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <LogIn size={14} className="stroke-[2.5]" />
              <span>লগইন করুন (Staff/Admin)</span>
            </button>
          )}

          {/* User Access Manager Quick Button for Super Admin */}
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('users')}
              title="ইউজার অনুমোদন ও রোল ম্যানেজমেন্ট"
              className={`px-3 py-1.5 text-xs rounded-xl font-bold flex items-center gap-1 transition cursor-pointer border ${
                activeTab === 'users' 
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-amber-300 shadow-md' 
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              <ShieldCheck size={14} className="stroke-[2.5]" />
              <span className="hidden md:inline">রোল কন্ট্রোল</span>
            </button>
          )}

          {/* Export / Import (Only for Manager / Admin) */}
          {isApprovedStaffOrAdmin && (
            <>
              <button 
                id="export-data-btn"
                onClick={handleExportData}
                title="ডাটা এক্সপোর্ট / ব্যাকআপ ফাইল ডাউনলোড করুন"
                className="px-2.5 py-1.5 text-xs rounded-xl font-bold flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer"
              >
                <Download size={14} className="stroke-[2.5]" />
                <span className="hidden lg:inline">ব্যাকআপ এক্সপোর্ট</span>
              </button>

              {isSuperAdmin && (
                <label 
                  title="আগের ব্যাকআপ ফাইল রিস্টোর করুন"
                  className="px-2.5 py-1.5 text-xs rounded-xl font-bold flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer"
                >
                  <Upload size={14} className="stroke-[2.5]" />
                  <span className="hidden lg:inline">রিস্টোর ইম্পোর্ট</span>
                  <input 
                    id="import-data-file"
                    type="file" 
                    accept=".json" 
                    onChange={handleImportData} 
                    className="hidden" 
                  />
                </label>
              )}
            </>
          )}

        </div>
      </header>

      {/* 🌟 Main Body Layout: Responsive Navigation Drawer & View Screen */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0" id="workspace-layout">
        
        {/* Navigation Sidebar Drawer with Soft Glass Styling */}
        <aside className="w-full md:w-72 bg-white/90 backdrop-blur-md md:border-r border-b md:border-b-0 border-slate-200/80 p-4 flex flex-col justify-between shrink-0 no-print shadow-xs" id="navigation-sidebar">
          <div className="space-y-3">
            
            {/* Quick Switch for Guests to Login */}
            {!isApprovedStaffOrAdmin && (
              <div className="p-3 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border border-amber-300/40 rounded-xl mb-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Lock size={14} className="text-amber-700" />
                  <span className="text-[11px] font-black text-slate-800 uppercase">পাবলিক ভিউয়ার মোড</span>
                </div>
                <p className="text-[10px] text-slate-600 font-bold mb-2">
                  ব্যবসায়িক হিসাব, স্টক ও ইনভয়েস দেখতে অ্যাডমিন বা স্টাফ অ্যাকাউন্টে লগইন করুন।
                </p>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full py-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white rounded-lg font-black text-[11px] uppercase flex items-center justify-center gap-1 shadow-md hover:shadow-lg transition cursor-pointer"
                >
                  <LogIn size={12} />
                  স্টাফ / অ্যাডমিন লগইন
                </button>
              </div>
            )}

            <nav className="space-y-1 max-h-[calc(100vh-210px)] overflow-y-auto pr-1" id="navigation-menu">
              {filteredNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    id={`nav-tab-${item.id}`}
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all text-xs font-black cursor-pointer ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-700 via-rose-600 to-amber-500 text-white shadow-md shadow-purple-900/20 scale-[1.02]' 
                        : 'text-slate-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-rose-50 hover:text-purple-950'
                    }`}
                  >
                    <Icon size={16} className={`${isActive ? 'text-amber-200' : item.color}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-slate-200 pt-3 mt-4 text-center flex flex-col items-center gap-1.5" id="sidebar-footer">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">রিত্তিকা ইভেন্ট ডেকোরেশন ERP v3.0</p>
            {isSuperAdmin && (
              <button
                id="reset-all-data-sidebar-btn"
                onClick={handleResetToSeeded}
                className="w-full mt-1 py-1.5 px-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Trash2 size={11} className="stroke-[2.5]" />
                <span>সমস্ত ডাটা মুছুন</span>
              </button>
            )}
          </div>
        </aside>

        {/* Active Content Window Screen */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto min-h-0" id="main-view-container">
          
          {/* Guest restricted view notice if attempting unapproved tab */}
          {!canAccessTab(activeTab) && (
            <div className="neo-card p-8 text-center max-w-lg mx-auto my-12 bg-white rounded-2xl shadow-xl border border-rose-200">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500/20 to-purple-500/20 text-rose-600 rounded-full mx-auto flex items-center justify-center mb-4">
                <Lock size={32} className="stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black uppercase text-slate-900 mb-2">এই মডিউলটি ব্যক্তিগত ও সংরক্ষিত</h3>
              <p className="text-xs font-bold text-slate-600 mb-6 leading-relaxed">
                রিত্তিকা ইভেন্ট ম্যানেজমেন্টের স্টক, হিসাব ও অভ্যন্তরীণ তথ্য দেখতে অনুগ্রহ করে অ্যাডমিন অথবা অনুমোদিত স্টাফ হিসেবে লগইন করুন।
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="neo-btn neo-btn-primary px-5 py-2.5 text-xs font-black uppercase cursor-pointer"
                >
                  লগইন করুন
                </button>
                <button
                  onClick={() => setActiveTab('portal')}
                  className="neo-btn px-5 py-2.5 text-xs font-black uppercase cursor-pointer bg-slate-100 hover:bg-slate-200"
                >
                  পাবলিক পোর্টালে ফিরে যান
                </button>
              </div>
            </div>
          )}

          {canAccessTab(activeTab) && activeTab === 'dashboard' && (
            <Dashboard
              stockItems={stockItems}
              purchases={purchases}
              sales={sales}
              rentals={rentals}
              damages={damages}
              expenses={expenses}
              onNavigate={setActiveTab}
              userRole={effectiveRole}
              onRentQuickAction={() => {
                setPreselectedRentalItemCode(null);
                setAutoOpenAddRental(true);
                setActiveTab('rental');
              }}
            />
          )}

          {canAccessTab(activeTab) && activeTab === 'stock' && (
            <MasterStock
              stockItems={stockItems}
              purchases={purchases}
              sales={sales}
              rentals={rentals}
              damages={damages}
              customers={customers}
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              onRentItemQuickAction={(itemCode) => {
                setPreselectedRentalItemCode(itemCode);
                setAutoOpenAddRental(true);
                setActiveTab('rental');
              }}
            />
          )}

          {canAccessTab(activeTab) && activeTab === 'purchase' && (
            <PurchaseTracker
              purchases={purchases}
              stockItems={stockItems}
              suppliers={suppliers}
              onAddPurchase={handleAddPurchase}
              onUpdatePurchase={handleUpdatePurchase}
              onDeletePurchase={handleDeletePurchase}
            />
          )}

          {canAccessTab(activeTab) && activeTab === 'sales' && (
            <SalesTracker
              sales={sales}
              stockItems={stockItems}
              customers={customers}
              onAddSale={handleAddSale}
              onUpdateSale={handleUpdateSale}
              onDeleteSale={handleDeleteSale}
            />
          )}

          {canAccessTab(activeTab) && activeTab === 'rental' && (
            <RentalTracker
              rentals={rentals}
              stockItems={stockItems}
              customers={customers}
              onAddRental={handleAddRental}
              onRecordReturn={handleRecordReturn}
              onUpdateRental={handleUpdateRental}
              onDeleteRental={handleDeleteRental}
              autoOpenAdd={autoOpenAddRental}
              onCloseAutoOpen={() => setAutoOpenAddRental(false)}
              preselectedItemCode={preselectedRentalItemCode}
            />
          )}

          {canAccessTab(activeTab) && activeTab === 'damage' && (
            <DamageTracker
              damages={damages}
              stockItems={stockItems}
              onAddDamage={handleAddDamage}
              onUpdateDamage={handleUpdateDamage}
              onDeleteDamage={handleDeleteDamage}
            />
          )}

          {canAccessTab(activeTab) && activeTab === 'contacts' && (
            <ContactManager
              customers={customers}
              suppliers={suppliers}
              onAddCustomer={handleAddCustomer}
              onAddSupplier={handleAddSupplier}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onUpdateSupplier={handleUpdateSupplier}
              onDeleteSupplier={handleDeleteSupplier}
            />
          )}

          {canAccessTab(activeTab) && activeTab === 'expense' && (
            <ExpenseTracker
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {canAccessTab(activeTab) && activeTab === 'event' && (
            <EventManager
              events={events}
              customers={customers}
              stockItems={stockItems}
              workers={workers}
              onAddEvent={handleAddEvent}
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
              onUpdateEventMaterials={handleUpdateEventMaterials}
              onUpdateEventStatus={handleUpdateEventStatus}
              onAddWorker={handleAddWorker}
              onUpdateWorker={handleUpdateWorker}
              onDeleteWorker={handleDeleteWorker}
            />
          )}

          {canAccessTab(activeTab) && activeTab === 'hr' && (
            <HRManager
              workers={workers}
              attendance={attendance}
              salaries={salaries}
              onAddWorker={handleAddWorker}
              onUpdateWorker={handleUpdateWorker}
              onDeleteWorker={handleDeleteWorker}
              onLogAttendance={handleLogAttendance}
              onDeleteAttendance={handleDeleteAttendance}
              onPaySalary={handlePaySalary}
              onUpdateSalary={handleUpdateSalary}
              onDeleteSalary={handleDeleteSalary}
              userRole={effectiveRole}
            />
          )}

          {canAccessTab(activeTab) && activeTab === 'logistics' && (
            <LogisticsManager
              vehicles={vehicles}
              trips={trips}
              onAddVehicle={handleAddVehicle}
              onUpdateVehicle={handleUpdateVehicle}
              onDeleteVehicle={handleDeleteVehicle}
              onAddTrip={handleAddTrip}
              onUpdateTrip={handleUpdateTrip}
              onDeleteTrip={handleDeleteTrip}
              userRole={effectiveRole}
            />
          )}

          {canAccessTab(activeTab) && activeTab === 'portal' && (
            <CustomerPortal
              customers={customers}
              events={events}
              rentals={rentals}
              onlineBookings={onlineBookings}
              attachments={attachments}
              onAddCustomer={handleAddCustomer}
              onAddEvent={handleAddEvent}
              onAddOnlineBooking={handleAddOnlineBooking}
              onApproveBooking={handleApproveBooking}
              onDeclineBooking={handleDeclineBooking}
              onAddAttachment={handleAddAttachment}
              onDeleteAttachment={handleDeleteAttachment}
              portfolioItems={portfolioItems}
              portfolioCategories={portfolioCategories}
              onAddPortfolioItem={handleAddPortfolioItem}
              onUpdatePortfolioItem={handleUpdatePortfolioItem}
              onDeletePortfolioItem={handleDeletePortfolioItem}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              userRole={effectiveRole}
            />
          )}

          {canAccessTab(activeTab) && activeTab === 'profit-loss' && (
            <ProfitLoss
              stockItems={stockItems}
              purchases={purchases}
              sales={sales}
              rentals={rentals}
              expenses={expenses}
              damages={damages}
            />
          )}

          {canAccessTab(activeTab) && activeTab === 'invoice-hub' && (
            <InvoiceHub
              purchases={purchases}
              sales={sales}
              rentals={rentals}
              events={events}
              customers={customers}
              suppliers={suppliers}
              stockItems={stockItems}
              attachments={attachments}
              onAddAttachment={handleAddAttachment}
              onDeleteAttachment={handleDeleteAttachment}
              purchaseInvoices={purchaseInvoices}
              onAddPurchaseInvoice={handleAddPurchaseInvoice}
              onDeletePurchaseInvoice={handleDeletePurchaseInvoice}
              salesInvoices={salesInvoices}
              onAddSalesInvoice={handleAddSalesInvoice}
              onDeleteSalesInvoice={handleDeleteSalesInvoice}
              rentalInvoices={rentalInvoices}
              onAddRentalInvoice={handleAddRentalInvoice}
              onDeleteRentalInvoice={handleDeleteRentalInvoice}
              eventInvoices={eventInvoices}
              onAddEventInvoice={handleAddEventInvoice}
              onDeleteEventInvoice={handleDeleteEventInvoice}
              quotations={quotations}
              onAddQuotation={handleAddQuotation}
              onUpdateQuotation={handleUpdateQuotation}
              onDeleteQuotation={handleDeleteQuotation}
              onConvertQuotationToEvent={handleConvertQuotationToEvent}
            />
          )}

          {canAccessTab(activeTab) && activeTab === 'event-projects' && (
            <EventProjectPage
              events={events}
              customers={customers}
              stockItems={stockItems}
              workers={workers}
              expenses={expenses}
              onUpdateEventMaterials={handleUpdateEventMaterials}
              onUpdateEventStatus={handleUpdateEventStatus}
              onAddExpense={handleAddExpense}
              galleryItems={galleryItems}
              onAddGalleryItem={handleAddGalleryItem}
              onDeleteGalleryItem={handleDeleteGalleryItem}
              assignments={assignments}
              onAddAssignment={handleAddAssignment}
              onDeleteAssignment={handleDeleteAssignment}
            />
          )}

          {canAccessTab(activeTab) && activeTab === 'customer-timeline' && (
            <CustomerTimeline
              customers={customers}
              sales={sales}
              rentals={rentals}
              events={events}
              salesInvoices={salesInvoices}
              rentalInvoices={rentalInvoices}
              eventInvoices={eventInvoices}
              attachments={attachments}
              galleryItems={galleryItems}
              stockItems={stockItems}
            />
          )}

          {canAccessTab(activeTab) && activeTab === 'users' && isSuperAdmin && (
            <UserManager
              currentUser={currentUser}
              approvedUsers={approvedUsers}
              onAddUser={handleAddApprovedUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}
        </main>

      </div>

      {/* 🗑️ Reliable Global Delete Modal */}
      {pendingDelete && (
        <ConfirmDeleteModal
          isOpen={true}
          title={pendingDelete.title}
          message={pendingDelete.message}
          itemName={pendingDelete.itemName}
          onConfirm={pendingDelete.onConfirm}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {/* 🔐 Auth / Login & Access Request Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        approvedUsers={approvedUsers}
        onRequestAccess={handleRequestAccess}
      />

      {/* 🌐 Global Website & Showcase Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        defaultTab={activeTab}
      />
    </div>
  );
}
