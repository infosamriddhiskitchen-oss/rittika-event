import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Plus, 
  Trash2, 
  Mail, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Edit3, 
  KeyRound,
  Search,
  Lock,
  PhoneCall,
  UserPlus
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { toBengaliNumber } from '../utils';

interface UserManagerProps {
  currentUser: UserProfile | null;
  approvedUsers: UserProfile[];
  onAddUser: (user: Omit<UserProfile, 'id'>) => void;
  onUpdateUser: (id: string, updated: Partial<UserProfile>) => void;
  onDeleteUser: (id: string) => void;
  onResetAllData?: () => void;
}

export default function UserManager({
  currentUser,
  approvedUsers,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onResetAllData
}: UserManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // High security danger zone states
  const [isDangerZoneUnlocked, setIsDangerZoneUnlocked] = useState(false);
  const [dangerConfirmText, setDangerConfirmText] = useState('');

  // Form states
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Staff');
  const [newPhone, setNewPhone] = useState('');
  const [newDesignation, setNewDesignation] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.role === 'Admin';

  const pendingUsers = approvedUsers.filter(u => !u.isApproved);
  const activeUsers = approvedUsers.filter(u => u.isApproved);

  const filteredUsers = approvedUsers.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm));
    const matchesRole = 
      filterRole === 'all' ? true :
      filterRole === 'pending' ? !u.isApproved :
      u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;

    if (editingUserId) {
      const updatePayload: Partial<UserProfile> = {
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        role: newRole,
        phone: newPhone.trim(),
        designation: newDesignation.trim(),
        isApproved: true
      };
      if (newPassword.trim()) {
        updatePayload.password = newPassword.trim();
      }
      onUpdateUser(editingUserId, updatePayload);
    } else {
      onAddUser({
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        password: newPassword.trim() || '123456',
        role: newRole,
        phone: newPhone.trim(),
        designation: newDesignation.trim(),
        isApproved: true,
        provider: 'email',
        createdAt: new Date().toISOString()
      });
    }

    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setNewRole('Staff');
    setNewPhone('');
    setNewDesignation('');
    setEditingUserId(null);
    setIsAddModalOpen(false);
  };

  const handleEditClick = (u: UserProfile) => {
    setEditingUserId(u.id);
    setNewName(u.name);
    setNewEmail(u.email);
    setNewPassword(u.password || '');
    setNewRole(u.role);
    setNewPhone(u.phone || '');
    setNewDesignation(u.designation || '');
    setIsAddModalOpen(true);
  };

  const handleApproveWithRole = (user: UserProfile, role: UserRole) => {
    onUpdateUser(user.id, {
      isApproved: true,
      role: role
    });
  };

  return (
    <div className="space-y-6" id="user-access-manager">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <h2 className="text-xl font-black uppercase italic tracking-wider text-black flex items-center gap-2">
            <ShieldCheck size={26} className="text-yellow-500 stroke-[2.5]" />
            ইউজার এক্সেস ও রোল কন্ট্রোল প্যানেল (RBAC)
          </h2>
          <p className="text-xs font-bold text-slate-700 mt-1">
            নতুন স্টাফ ও ম্যানেজারদের অ্যাক্সেস আবেদন যাচাই করে অনুমোদন করুন এবং ডাটা অ্যাক্সেস সুরক্ষিত রাখুন।
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => {
              setEditingUserId(null);
              setNewName('');
              setNewEmail('');
              setNewRole('Staff');
              setNewPhone('');
              setNewDesignation('');
              setIsAddModalOpen(true);
            }}
            className="neo-btn bg-yellow-400 text-black px-4 py-2.5 flex items-center gap-1.5 text-xs shadow-[2px_2px_0px_0px_#000000]"
          >
            <Plus size={16} className="stroke-[3]" />
            সরাসরি অনুমোদিত ইউজার যোগ করুন
          </button>
        )}
      </div>

      {/* 🚨 Pending Access Requests Alert Section */}
      {pendingUsers.length > 0 && (
        <div className="bg-amber-100 border-4 border-black p-5 shadow-[6px_6px_0px_0px_#000000] animate-fadeIn" id="pending-requests-section">
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-600 animate-ping"></span>
              <h3 className="text-sm font-black uppercase text-amber-950 flex items-center gap-1.5">
                <Clock size={18} className="text-amber-800" />
                অপেক্ষমাণ স্টাফ/ম্যানেজার অ্যাক্সেস আবেদন ({toBengaliNumber(pendingUsers.length)} টি)
              </h3>
            </div>
            <span className="text-xs font-black bg-amber-200 border border-black px-2 py-0.5 text-black">
              অ্যাডমিন অনুমোদন প্রয়োজন
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingUsers.map(u => (
              <div key={u.id} className="bg-white border-3 border-black p-4 shadow-[3px_3px_0px_0px_#000000] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b-2 border-slate-200 pb-1.5 mb-2">
                    <span className="text-xs font-black text-black">{u.name}</span>
                    <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-900 border border-indigo-400 px-2 py-0.5 rounded">
                      আবেদিত রোল: {u.role === 'Manager' ? 'ম্যানেজার' : 'স্টাফ'}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-700 space-y-1 mb-3">
                    <p className="font-mono flex items-center gap-1">
                      <Mail size={12} className="text-slate-500" />
                      {u.email}
                    </p>
                    {u.phone && (
                      <p className="flex items-center gap-1">
                        <PhoneCall size={12} className="text-slate-500" />
                        {u.phone}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-500">
                      আবেদনের সময়: {new Date(u.createdAt).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t-2 border-slate-200 pt-3">
                  <button
                    onClick={() => handleApproveWithRole(u, u.role || 'Staff')}
                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-black font-black text-xs uppercase flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                  >
                    <UserCheck size={14} />
                    {u.role === 'Manager' ? 'ম্যানেজার হিসেবে অনুমোদন' : 'স্টাফ হিসেবে অনুমোদন'}
                  </button>

                  <button
                    onClick={() => onDeleteUser(u.id)}
                    className="p-2 bg-red-100 hover:bg-red-500 hover:text-white text-red-700 border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                    title="আবেদন বাতিল ও মুছুন"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Rule Notice */}
      <div className="bg-slate-50 border-3 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-yellow-300 border-2 border-black text-black shrink-0 shadow-[1px_1px_0px_0px_#000000]">
            <Lock size={18} className="stroke-[2.5]" />
          </div>
          <div className="text-xs font-bold text-slate-800 space-y-1">
            <p className="font-black text-black uppercase">নিরাপত্তা ও অ্যাক্সেস পলিসি:</p>
            <p>
              • <strong className="text-red-700">অ্যাডমিন (Admin):</strong> সর্বেসর্বা এক্সেস — ডাটা এন্ট্রি, এডিট, ডিলিট, প্রফিট ও ক্ষতি বিশ্লেষণ এবং ইউজার রোল পরিবর্তন করতে পারবেন।
            </p>
            <p>
              • <strong className="text-indigo-700">ম্যানেজার (Manager):</strong> স্টক, ক্রয়, বিক্রয়, রেন্টাল, ইভেন্ট ও কোটেশন পরিচালনা করতে পারবেন। কোম্পানি সেটিংস ও এইচআর সেটিংস সুরক্ষিত থাকবে।
            </p>
            <p>
              • <strong className="text-emerald-700">স্টাফ (Staff):</strong> ইনভেন্টরি চেক, ভাড়া ডেলিভারি ও ফেরত, নষ্ট হিসাব ও লজিস্টিক পরিচালনা করবেন। কোনো ফিন্যান্সিয়াল ডাটা মুছতে পারবেন না।
            </p>
            <p>
              • <strong className="text-slate-600">পাবলিক / ভিউয়ার (Public/Viewer):</strong> শুধুমাত্র সাধারণ পাবলিক পোর্টাল ও ডেকোরেশন প্রদর্শনী দেখতে পারবেন। কোনো অভ্যন্তরীণ ব্যবসায়িক ডাটা দেখতে পারবেন না।
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="নাম, ইমেইল বা ফোন নম্বর দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border-2 border-black bg-white font-bold text-xs shadow-[2px_2px_0px_0px_#000000]"
          />
          <Search size={15} className="absolute left-3 top-2.5 text-slate-500" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-black uppercase text-black">ফিল্টার:</span>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border-2 border-black bg-white font-bold text-xs shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
          >
            <option value="all">সকল ইউজার ({toBengaliNumber(approvedUsers.length)})</option>
            <option value="pending">অনুমোদন পেন্ডিং ({toBengaliNumber(pendingUsers.length)})</option>
            <option value="Admin">অ্যাডমিন (Admin)</option>
            <option value="Manager">ম্যানেজার (Manager)</option>
            <option value="Staff">স্টাফ (Staff)</option>
          </select>
        </div>
      </div>

      {/* User Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((u) => {
          const isCurrent = currentUser?.email.toLowerCase() === u.email.toLowerCase();
          const isSuperAdminEmail = u.email.toLowerCase() === 'info.samriddhiskitchen@gmail.com';

          return (
            <div
              key={u.id}
              className={`border-3 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative flex flex-col justify-between ${
                isCurrent ? 'ring-2 ring-yellow-400 bg-yellow-50/40' : ''
              }`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2 mb-3">
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 border border-black rounded ${
                      u.role === 'Admin'
                        ? 'bg-red-200 text-red-950'
                        : u.role === 'Manager'
                        ? 'bg-indigo-200 text-indigo-950'
                        : u.role === 'Staff'
                        ? 'bg-emerald-200 text-emerald-950'
                        : 'bg-slate-200 text-slate-900'
                    }`}
                  >
                    {u.role === 'Admin'
                      ? '👑 Super Admin'
                      : u.role === 'Manager'
                      ? '👔 Manager'
                      : u.role === 'Staff'
                      ? '🛠️ Staff'
                      : '👁️ Viewer'}
                  </span>

                  {u.isApproved ? (
                    <span className="text-[10px] font-black text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-emerald-600" />
                      অনুমোদিত
                    </span>
                  ) : (
                    <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.5 border border-amber-400 rounded flex items-center gap-1">
                      <Clock size={11} className="text-amber-600" />
                      পেন্ডিং
                    </span>
                  )}
                </div>

                {/* User Info */}
                <div className="space-y-1.5 mb-4">
                  <h4 className="text-sm font-black text-black flex items-center gap-1.5">
                    {u.name}
                    {isCurrent && (
                      <span className="text-[9px] font-bold bg-yellow-400 text-black px-1.5 py-0.2 border border-black rounded">
                        আপনি
                      </span>
                    )}
                  </h4>
                  <p className="text-xs font-mono font-bold text-slate-700 flex items-center gap-1">
                    <Mail size={12} className="text-slate-500 shrink-0" />
                    {u.email}
                  </p>
                  {u.phone && (
                    <p className="text-[11px] font-bold text-slate-600">ফোন: {u.phone}</p>
                  )}
                  {u.designation && (
                    <p className="text-[11px] font-bold text-indigo-700">পদবী: {u.designation}</p>
                  )}
                  {isSuperAdmin && u.password && (
                    <p className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300 rounded inline-block">
                      পাসওয়ার্ড: {u.password}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500 font-mono">
                    মাধ্যম: {u.provider === 'google' ? 'Google Auth' : 'Email/Password'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              {isSuperAdmin && (
                <div className="flex items-center justify-between border-t-2 border-slate-200 pt-3 mt-2 gap-2">
                  {!u.isApproved ? (
                    <div className="flex items-center gap-2 w-full">
                      <button
                        onClick={() => handleApproveWithRole(u, u.role || 'Staff')}
                        className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-black font-black text-xs uppercase flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                      >
                        <UserCheck size={13} />
                        অনুমোদন দিন
                      </button>
                      <button
                        onClick={() => onDeleteUser(u.id)}
                        className="p-1.5 bg-red-100 hover:bg-red-500 hover:text-white text-red-700 border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                        title="বাতিল করুন"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 w-full justify-end">
                      <button
                        onClick={() => handleEditClick(u)}
                        className="px-3 py-1.5 bg-yellow-300 hover:bg-yellow-400 text-black border-2 border-black font-black text-xs uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                        title="রোল ও তথ্য পরিবর্তন"
                      >
                        <Edit3 size={12} />
                        রোল পরিবর্তন
                      </button>
                      
                      {!isSuperAdminEmail && (
                        <button
                          onClick={() => onDeleteUser(u.id)}
                          className="px-2.5 py-1.5 bg-red-100 hover:bg-red-500 hover:text-white text-red-700 border-2 border-black font-black text-xs uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                          title="ইউজার মুছুন"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 🛑 Super Admin High-Security Danger Zone (Protected System Reset) */}
      {isSuperAdmin && onResetAllData && (
        <div className="mt-10 pt-6 border-t-4 border-black" id="superadmin-danger-zone">
          <div className="bg-gradient-to-r from-red-50 to-rose-100 border-4 border-red-600 p-5 shadow-[6px_6px_0px_0px_rgba(220,38,38,1)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-600 text-white flex items-center justify-center shrink-0 border-2 border-black">
                  <ShieldAlert size={22} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase text-red-950 flex items-center gap-2">
                    উন্নত সিস্টেম সেটিংস ও ডাটাবেস রিসেট (Super Admin Only)
                  </h4>
                  <p className="text-xs text-red-900 font-bold mt-0.5">
                    সিস্টেমের সমস্ত তথ্য, স্টক, ইনভয়েস ও ট্রানজাকশন মুছে সম্পূর্ণ প্রাথমিক অবস্থায় রিসেট করুন।
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsDangerZoneUnlocked(!isDangerZoneUnlocked);
                  setDangerConfirmText('');
                }}
                className={`px-4 py-2 border-2 border-black text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-[2px_2px_0px_0px_#000000] ${
                  isDangerZoneUnlocked 
                    ? 'bg-slate-900 text-white hover:bg-slate-800' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isDangerZoneUnlocked ? 'লক করুন / বন্ধ করুন' : 'নিরাপত্তা লক আনলক করুন'}
              </button>
            </div>

            {/* Unlocked Protected Confirmation Form */}
            {isDangerZoneUnlocked && (
              <div className="mt-5 pt-4 border-t-2 border-red-300 space-y-4 animate-fadeIn">
                <div className="p-3 bg-red-100/80 border-2 border-red-400 text-red-900 text-xs font-bold space-y-1">
                  <p className="font-black flex items-center gap-1.5 text-red-950">
                    <Lock size={14} />
                    সতর্কতা: এই অ্যাকশনটি অপরিবর্তনীয়!
                  </p>
                  <p>
                    সমস্ত স্টক আইটেম, বিক্রয় ও ভাড়ার হিসাব, কাস্টমার লেজার, খরচ এবং ইনভয়েস স্থায়ীভাবে মুছে যাবে। অ্যাকশনটি নিশ্চিত করতে নিচের ইনপুট বক্সে হুবহু <strong>DELETE ALL</strong> অথবা <strong>সব মুছুন</strong> লিখুন।
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="text"
                    placeholder='নিশ্চিত করতে "DELETE ALL" বা "সব মুছুন" লিখুন'
                    value={dangerConfirmText}
                    onChange={(e) => setDangerConfirmText(e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-white border-2 border-black font-black text-xs placeholder:text-slate-400 uppercase tracking-wider"
                  />
                  <button
                    type="button"
                    disabled={dangerConfirmText.trim().toUpperCase() !== 'DELETE ALL' && dangerConfirmText.trim() !== 'সব মুছুন'}
                    onClick={() => {
                      onResetAllData();
                      setIsDangerZoneUnlocked(false);
                      setDangerConfirmText('');
                    }}
                    className="px-5 py-2.5 bg-red-600 text-white border-2 border-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} className="stroke-[2.5]" />
                    <span>সমস্ত ডাটা মুছে ফেলুন</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="user-edit-modal">
          <div className="bg-white border-4 border-black p-6 relative max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-base font-black uppercase text-black mb-4 border-b-3 border-black pb-3 flex items-center gap-2">
              <KeyRound size={20} className="text-yellow-500 stroke-[2.5]" />
              {editingUserId ? 'ইউজারের তথ্য ও রোল পরিবর্তন' : 'নতুন অনুমোদিত ইউজার এন্ট্রি'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs font-bold text-black">
              <div>
                <label className="block mb-1 font-black">ব্যবহারকারীর নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সাকিব আল হাসান"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black bg-white font-bold text-xs"
                />
              </div>

              <div>
                <label className="block mb-1 font-black">ইমেইল ঠিকানা (Google / Work Email) *</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black bg-white font-bold text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-black">ইউজার রোল (Role) *</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border-2 border-black bg-white font-bold text-xs cursor-pointer"
                  >
                    <option value="Manager">ম্যানেজার (Manager)</option>
                    <option value="Staff">স্টাফ (Staff)</option>
                    <option value="Admin">অ্যাডমিন (Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-black">পদবী (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    placeholder="যেমন: ইভেন্ট কোঅর্ডিনেটর"
                    value={newDesignation}
                    onChange={(e) => setNewDesignation(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black bg-white font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-black">মোবাইল নম্বর</label>
                  <input
                    type="tel"
                    placeholder="০১৭১১-XXXXXX"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black bg-white font-bold text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-black">লগইন পাসওয়ার্ড (Password) *</label>
                  <input
                    type="text"
                    placeholder={editingUserId ? 'অপরিবর্তিত রাখতে খালি রাখুন' : 'পাসওয়ার্ড দিন'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black bg-white font-bold text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t-3 border-black pt-4 mt-5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-white text-black border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 text-black border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_#000000] hover:bg-yellow-500 cursor-pointer"
                >
                  {editingUserId ? 'আপডেট করুন' : 'অনুমোদন ও সংরক্ষণ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
