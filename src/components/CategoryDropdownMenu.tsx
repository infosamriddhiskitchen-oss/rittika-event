import React, { useState, useEffect, useRef } from 'react';
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
  FileText,
  RefreshCw,
  UserCheck,
  Truck,
  BarChart3,
  ShieldCheck,
  ChevronDown,
  Search,
  Sparkles,
  Layers,
  CheckCircle2,
  Lock,
  ArrowRight,
  X
} from 'lucide-react';
import { UserRole } from '../types';

export interface CategoryGroup {
  id: string;
  groupTitle: string;
  groupTitleEn: string;
  badgeColor: string;
  modules: {
    id: string;
    label: string;
    subLabel: string;
    icon: React.ElementType;
    color: string;
    minRole: 'Viewer' | 'Staff' | 'Manager' | 'Admin';
    highlight?: boolean;
    keywords?: string[];
  }[];
}

interface CategoryDropdownMenuProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  currentUser: {
    name: string;
    email: string;
    role: UserRole;
    isApproved: boolean;
  } | null;
  canAccessTab: (tabId: string) => boolean;
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'overview',
    groupTitle: 'ড্যাশবোর্ড ও ওভারভিউ',
    groupTitleEn: 'Overview & Analytics',
    badgeColor: 'from-amber-500 to-rose-500',
    modules: [
      {
        id: 'dashboard',
        label: 'ড্যাশবোর্ড',
        subLabel: 'ব্যবসায়িক সারসংক্ষেপ, চার্ট ও দ্রুত স্ট্যাটাস',
        icon: LayoutDashboard,
        color: 'text-teal-400',
        minRole: 'Staff',
        highlight: true,
        keywords: ['ড্যাশবোর্ড', 'ওভারভিউ', 'সারসংক্ষেপ', 'গ্রাফ', 'চার্ট', 'dashboard', 'analytics', 'summary', 'stats']
      },
      {
        id: 'profit-loss',
        label: 'লাভ-ক্ষতি ও আর্থিক রিপোর্ট',
        subLabel: 'আয়, ব্যয়, মোট লাভ ও ব্যালেন্স শিট',
        icon: BarChart3,
        color: 'text-emerald-400',
        minRole: 'Admin',
        keywords: ['লাভ', 'ক্ষতি', 'আর্থিক রিপোর্ট', 'ব্যালেন্স শিট', 'আয়', 'ব্যয়', 'profit', 'loss', 'balance sheet', 'finance', 'revenue']
      }
    ]
  },
  {
    id: 'inventory',
    groupTitle: 'অপারেশন ও স্টক ইনভেন্টরি',
    groupTitleEn: 'Stock & Inventory Operations',
    badgeColor: 'from-blue-500 to-indigo-600',
    modules: [
      {
        id: 'stock',
        label: 'মাস্টার স্টক রেজিস্ট্রি',
        subLabel: 'সব মালামালের তালিকা, মূল্য ও বর্তমান পরিমাণ',
        icon: Package,
        color: 'text-sky-400',
        minRole: 'Staff',
        keywords: ['স্টক', 'মালামাল', 'ইনভেন্টরি', 'পণ্য', 'রেজিস্ট্রি', 'গুদাম', 'stock', 'inventory', 'items', 'registry']
      },
      {
        id: 'purchase',
        label: 'মালামাল ক্রয় এন্ট্রি',
        subLabel: 'সাপ্লায়ার বিল ও নতুন স্টক ইনওয়ার্ড',
        icon: ShoppingCart,
        color: 'text-indigo-400',
        minRole: 'Manager',
        keywords: ['ক্রয়', 'কেনাকাটা', 'সাপ্লায়ার বিল', 'ইনওয়ার্ড', 'purchase', 'buy', 'supplier invoice', 'po']
      },
      {
        id: 'sales',
        label: 'সরাসরি বিক্রয় ও ক্যাশ মেমো',
        subLabel: 'আইটেম বিক্রয় ও সরাসরি পেমেন্ট ইনভয়েস',
        icon: TrendingUp,
        color: 'text-emerald-400',
        minRole: 'Manager',
        keywords: ['বিক্রয়', 'ক্যাশ মেমো', 'সেলস', 'সরাসরি বিক্রয়', 'sales', 'cash memo', 'selling', 'pos']
      },
      {
        id: 'rental',
        label: 'ভাড়া প্রদান ও ফেরত ট্র্যাকার',
        subLabel: 'ডেকোরেশন পণ্য ভাড়া ট্র্যাকিং ও স্টক রেন্টাল',
        icon: CalendarClock,
        color: 'text-amber-400',
        minRole: 'Staff',
        keywords: ['ভাড়া', 'রেন্টাল', 'ফেরত', 'ডেকোরেশন ভাড়া', 'বকেয়া মালামাল', 'rental', 'rent out', 'return']
      },
      {
        id: 'damage',
        label: 'ক্ষতিগ্রস্থ ও মেরামত স্টক',
        subLabel: 'নষ্ট, ভাঙা বা হারানো পণ্যের হিসাব',
        icon: ShieldAlert,
        color: 'text-rose-400',
        minRole: 'Staff',
        keywords: ['ক্ষতিগ্রস্থ', 'মেরামত', 'নষ্ট', 'ভাঙা', 'হারানো', 'ড্যামেজ', 'damage', 'repair', 'lost items']
      }
    ]
  },
  {
    id: 'events_billing',
    groupTitle: 'ইভেন্ট, প্রজেক্ট ও ইনভয়েস হাব',
    groupTitleEn: 'Event Projects & Invoicing',
    badgeColor: 'from-purple-500 to-pink-500',
    modules: [
      {
        id: 'event',
        label: 'ইভেন্ট ও কর্মী ব্যবস্থাপনা',
        subLabel: 'ইভেন্ট বুকিং, শিডিউল ও কর্মী দায়িত্ব',
        icon: ClipboardList,
        color: 'text-teal-400',
        minRole: 'Staff',
        keywords: ['ইভেন্ট', 'কর্মী', 'শিডিউল', 'দায়িত্ব', 'বুকিং', 'বিয়ে', 'জন্মদিন', 'event', 'booking', 'schedule']
      },
      {
        id: 'event-projects',
        label: 'ইভেন্ট প্রজেক্ট ও প্যাকেজ',
        subLabel: 'স্টেজ ডিজাইন ও প্রজেক্ট ওয়াইজ মালামাল',
        icon: ClipboardList,
        color: 'text-indigo-400',
        minRole: 'Manager',
        keywords: ['প্রজেক্ট', 'প্যাকেজ', 'স্টেজ ডিজাইন', 'ইভেন্ট প্রজেক্ট', 'package', 'stage design', 'project']
      },
      {
        id: 'invoice-hub',
        label: 'ইনভয়েস, কোটেশন ও সিলমোহর হাব',
        subLabel: 'কোটেশন বিল, ফাইনাল ইনভয়েস, ডিজিটাল সিলমোহর ও স্বাক্ষর',
        icon: FileText,
        color: 'text-emerald-400',
        minRole: 'Manager',
        highlight: true,
        keywords: ['ইনভয়েস', 'কোটেশন', 'বিল', 'সিলমোহর', 'স্বাক্ষর', 'স্ট্যাম্প', 'মেমো', 'রশিদ', 'invoice', 'quotation', 'bill', 'seal', 'stamp', 'signature']
      },
      {
        id: 'customer-timeline',
        label: 'কাস্টমার হিস্ট্রি ও লেজার',
        subLabel: 'গ্রাহকের সম্পূর্ণ লেনদেন টাইমলাইন ও বকেয়া',
        icon: RefreshCw,
        color: 'text-amber-400',
        minRole: 'Manager',
        keywords: ['কাস্টমার লেজার', 'টাইমলাইন', 'লেনদেন', 'বকেয়া হিসাব', 'গ্রাহক হিস্ট্রি', 'customer ledger', 'timeline', 'due statement']
      }
    ]
  },
  {
    id: 'people_logistics',
    groupTitle: 'কাস্টমার, এইচআর ও লজিস্টিকস',
    groupTitleEn: 'CRM, HR & Logistics',
    badgeColor: 'from-emerald-500 to-teal-600',
    modules: [
      {
        id: 'contacts',
        label: 'কাস্টমার ও সরবরাহকারী',
        subLabel: 'ক্লায়েন্ট ডিরেক্টরি ও ভেন্ডর কন্টাক্টস',
        icon: Users,
        color: 'text-cyan-400',
        minRole: 'Manager',
        keywords: ['কাস্টমার', 'ক্লায়েন্ট', 'ভেন্ডর', 'সাপ্লায়ার', 'কন্টাক্টস', 'ফোন নাম্বার', 'contacts', 'customers', 'suppliers', 'crm']
      },
      {
        id: 'hr',
        label: 'এইচআর, হাজিরা ও পেরোল',
        subLabel: 'দৈনিক হাজিরা, বেতন ও বোনাস ভাউচার',
        icon: UserCheck,
        color: 'text-rose-400',
        minRole: 'Admin',
        keywords: ['এইচআর', 'হাজিরা', 'বেতন', 'পেরোল', 'বোনাস', 'স্টাফ তালিকা', 'hr', 'attendance', 'payroll', 'salary', 'staff']
      },
      {
        id: 'logistics',
        label: 'যানবাহন ও লজিস্টিকস',
        subLabel: 'গাড়ি ট্রিপ, জ্বালানি ও মালামাল পরিবহন',
        icon: Truck,
        color: 'text-blue-400',
        minRole: 'Staff',
        keywords: ['লজিস্টিকস', 'যানবাহন', 'গাড়ি', 'ট্রিপ', 'জ্বালানি', 'তেল খরচ', 'মালামাল পরিবহন', 'logistics', 'vehicle', 'transport', 'fuel']
      }
    ]
  },
  {
    id: 'public_security',
    groupTitle: 'পাবলিক শোকেস ও সিকিউরিটি',
    groupTitleEn: 'Public Portal & Security',
    badgeColor: 'from-yellow-500 to-amber-600',
    modules: [
      {
        id: 'portal',
        label: 'পাবলিক পোর্টাল ও ডেকোরেশন শোকেস',
        subLabel: 'ফটো গ্যালারি, বুকিং ফর্ম, স্লাইডশো ও ভিডিও জেনারেটর',
        icon: Sparkles,
        color: 'text-amber-400',
        minRole: 'Viewer',
        highlight: true,
        keywords: ['হোমপেজ', 'পোর্টাল', 'পাবলিক শোকেস', 'ফটো গ্যালারি', 'স্লাইডশো', 'ভিডিও', 'বুকিং ফর্ম', 'হোম', 'portal', 'home', 'gallery', 'slideshow', 'video']
      },
      {
        id: 'expense',
        label: 'খরচ ও ভাউচার হিসাব',
        subLabel: 'দৈনিক অফিস ও অপারেশনাল খরচ রেজিস্টার',
        icon: CreditCard,
        color: 'text-pink-400',
        minRole: 'Manager',
        keywords: ['খরচ', 'ভাউচার', 'অফিস খরচ', 'দৈনিক খরচ', 'বিল ভাউচার', 'expense', 'voucher', 'spending', 'daily expense']
      },
      {
        id: 'users',
        label: 'ইউজার ও সিকিউরিটি রোল কন্ট্রোল',
        subLabel: 'স্টাফ অনুমতি, রোল অ্যাসাইন ও পাসওয়ার্ড',
        icon: ShieldCheck,
        color: 'text-amber-400',
        minRole: 'Admin',
        keywords: ['ইউজার', 'রোল', 'অনুমোদন', 'অ্যাডমিন', 'পাসওয়ার্ড', 'সিকিউরিটি', 'users', 'roles', 'security', 'permissions']
      }
    ]
  }
];

export default function CategoryDropdownMenu({
  activeTab,
  onSelectTab,
  currentUser,
  canAccessTab
}: CategoryDropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Clean search filter when closed (NO auto-focus when opened to keep virtual keyboard closed)
  useEffect(() => {
    if (!isOpen) {
      setSearchFilter('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Find active module details
  const activeModule = CATEGORY_GROUPS.flatMap(g => g.modules).find(m => m.id === activeTab);

  // Filter groups by global search query matching titles, descriptions, keywords & categories
  const filteredGroups = CATEGORY_GROUPS.map(group => {
    const matchedModules = group.modules.filter(mod => {
      if (!searchFilter.trim()) return true;
      const q = searchFilter.toLowerCase().trim();
      const hasTitleMatch = mod.label.toLowerCase().includes(q);
      const hasSubMatch = mod.subLabel.toLowerCase().includes(q);
      const hasGroupMatch = group.groupTitle.toLowerCase().includes(q) || group.groupTitleEn.toLowerCase().includes(q);
      const hasIdMatch = mod.id.toLowerCase().includes(q);
      const hasKeywordMatch = mod.keywords?.some(k => k.toLowerCase().includes(q));
      
      return hasTitleMatch || hasSubMatch || hasGroupMatch || hasIdMatch || hasKeywordMatch;
    });
    return {
      ...group,
      modules: matchedModules
    };
  }).filter(group => group.modules.length > 0);

  const handleSelect = (tabId: string) => {
    if (canAccessTab(tabId)) {
      onSelectTab(tabId);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef} id="category-dropdown-container">
      {/* Trigger Button in Header */}
      <button
        type="button"
        id="category-dropdown-trigger"
        onClick={() => setIsOpen(prev => !prev)}
        className={`px-3.5 py-1.5 rounded-xl font-black text-xs uppercase flex items-center gap-2 transition cursor-pointer border ${
          isOpen
            ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 text-white border-white/40 shadow-lg shadow-purple-950/40 ring-2 ring-amber-300'
            : 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-amber-400/50 shadow-sm'
        }`}
        title="ড্যাশবোর্ডের সকল ক্যাটাগরি ও মডিউল ড্রপডাউন মেনু"
      >
        <div className="flex items-center gap-1.5">
          <Layers size={15} className="text-amber-300 stroke-[2.5]" />
          <span className="hidden sm:inline">সকল ক্যাটাগরি</span>
          <span className="sm:hidden">মেনু</span>
        </div>

        {activeModule && (
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] bg-slate-950/60 px-2 py-0.5 rounded-lg border border-amber-400/30 text-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            {activeModule.label}
          </span>
        )}

        <ChevronDown
          size={14}
          className={`stroke-[3] transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-300' : 'text-slate-300'}`}
        />
      </button>

      {/* Mega Dropdown Panel */}
      {isOpen && (
        <div
          id="category-dropdown-menu"
          className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-16 sm:top-11 sm:w-[580px] lg:w-[680px] bg-slate-950/95 border-2 border-amber-400/50 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-fadeIn text-white max-h-[85vh] flex flex-col"
        >
          {/* Header of Dropdown with Search */}
          <div className="p-3.5 border-b border-white/15 bg-gradient-to-r from-slate-950 via-purple-950/90 to-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="p-1.5 bg-gradient-to-br from-amber-400 to-rose-500 text-slate-950 rounded-lg shadow-sm">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase text-amber-300 tracking-wider">
                  ড্যাশবোর্ড ক্যাটাগরি ও মডিউল ডিরেক্টরি
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">
                  যেকোনো ক্যাটাগরিতে সরাসরি প্রবেশ করতে ক্লিক করুন
                </p>
              </div>
            </div>

            {/* Live Search inside Dropdown */}
            <div className="relative w-full sm:w-64">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="ক্যাটাগরি বা মডিউল খুঁজুন..."
                className="w-full pl-8 pr-7 py-1.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-slate-900/90 transition shadow-inner font-bold"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Categorized Modules List */}
          <div className="overflow-y-auto p-3.5 space-y-4 flex-1 custom-scrollbar">
            {filteredGroups.length === 0 ? (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <Search size={28} className="mx-auto text-slate-600" />
                <p className="text-xs font-bold text-slate-300">"{searchFilter}" এর জন্য কোনো ক্যাটাগরি মেলেনি</p>
                <button
                  onClick={() => setSearchFilter('')}
                  className="text-xs text-amber-400 hover:underline font-black cursor-pointer"
                >
                  সার্চ রিসেট করুন
                </button>
              </div>
            ) : (
              filteredGroups.map(group => (
                <div key={group.id} className="space-y-1.5">
                  {/* Category Group Header */}
                  <div className="flex items-center justify-between px-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2.5 w-1 rounded-full bg-gradient-to-b ${group.badgeColor}`}></span>
                      <span className="text-xs font-black uppercase text-amber-200 tracking-wide">
                        {group.groupTitle}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">
                      {group.groupTitleEn}
                    </span>
                  </div>

                  {/* Modules Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {group.modules.map(mod => {
                      const Icon = mod.icon;
                      const isActive = activeTab === mod.id;
                      const hasAccess = canAccessTab(mod.id);

                      return (
                        <button
                          key={mod.id}
                          id={`dropdown-nav-${mod.id}`}
                          onClick={() => handleSelect(mod.id)}
                          disabled={!hasAccess}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all duration-150 flex items-start justify-between gap-2.5 cursor-pointer relative group ${
                            isActive
                              ? 'bg-gradient-to-r from-purple-900/90 via-rose-950/80 to-slate-900 border-amber-400/80 shadow-md ring-1 ring-amber-400/60'
                              : hasAccess
                              ? 'bg-white/5 hover:bg-white/12 border-white/10 hover:border-white/25 hover:translate-x-0.5'
                              : 'bg-slate-900/40 border-slate-800/60 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div
                              className={`p-2 rounded-lg border transition ${
                                isActive
                                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                                  : hasAccess
                                  ? 'bg-white/10 group-hover:bg-white/20 border-white/15 text-white'
                                  : 'bg-slate-800 border-slate-700 text-slate-500'
                              }`}
                            >
                              <Icon size={16} className={isActive ? 'text-slate-950 stroke-[2.5]' : mod.color} />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-black truncate ${isActive ? 'text-amber-300' : 'text-white'}`}>
                                  {mod.label}
                                </span>
                                {mod.highlight && (
                                  <span className="text-[9px] bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase">
                                    ★ মূল
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 line-clamp-1 font-medium mt-0.5">
                                {mod.subLabel}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center mt-1">
                            {isActive ? (
                              <CheckCircle2 size={14} className="text-amber-300" />
                            ) : !hasAccess ? (
                              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 flex items-center gap-0.5">
                                <Lock size={10} />
                                {mod.minRole}
                              </span>
                            ) : (
                              <ArrowRight size={13} className="text-slate-500 group-hover:text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer of Dropdown */}
          <div className="p-2.5 border-t border-white/15 bg-slate-950/90 px-4 flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span className="flex items-center gap-1.5">
              <span>মোট {CATEGORY_GROUPS.flatMap(g => g.modules).length} টি মডিউল অন্তর্ভুক্ত</span>
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
            >
              বন্ধ করুন (Esc)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
