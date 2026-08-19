import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Lock, ShieldCheck } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  itemName?: string;
  isSuperAdmin?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  title = 'রেকর্ডটি মুছে ফেলতে চান?',
  message = 'আপনি কি নিশ্চিতভাবে এই তথ্যটি স্থায়ীভাবে মুছে ফেলতে চান? এই পরিবর্তনটি অপরিবর্তনীয় এবং হিসাবের তালিকা থেকে বাদ যাবে।',
  itemName,
  isSuperAdmin = true,
  onConfirm,
  onCancel
}: ConfirmDeleteModalProps) {
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAction = () => {
    // If not super admin, require admin pass verification
    if (!isSuperAdmin) {
      if (adminPassword !== 'adminRobin' && adminPassword !== 'admin' && adminPassword !== 'admin123') {
        setError('অ্যাডমিন পাসওয়ার্ড ভুল! শুধুমাত্র প্রধান অ্যাডমিন পারমিশন নিয়ে ডিলিট করতে পারবেন।');
        return;
      }
    }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="confirm-delete-dialog">
      <div className="bg-white border-4 border-slate-900 rounded-2xl p-6 relative max-w-md w-full shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition cursor-pointer rounded-lg shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
        >
          <X size={16} className="stroke-[2.5]" />
        </button>

        <div className="flex items-center gap-3 border-b-3 border-black pb-3 mb-4">
          <div className="p-2 bg-red-100 border-2 border-black text-red-600 rounded-xl">
            <AlertTriangle size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-black uppercase text-black">
              {title}
            </h3>
            <p className="text-[11px] font-bold text-red-600">উচ্চ নিরাপত্তা প্রটোকল (Secure Deletion)</p>
          </div>
        </div>

        <div className="space-y-3 mb-5">
          <p className="text-xs font-bold text-slate-800 leading-relaxed">
            {message}
          </p>

          {itemName && (
            <div className="p-3 bg-red-50 border-2 border-red-300 rounded-xl text-xs font-mono font-bold text-red-950 break-words">
              আইটেম / বিবরণ: <span className="underline">{itemName}</span>
            </div>
          )}

          {!isSuperAdmin && (
            <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Lock size={14} className="text-amber-700" />
                <span>প্রধান অ্যাডমিন পাসওয়ার্ড প্রদান করুন:</span>
              </div>
              <input
                type="password"
                placeholder="অ্যাডমিন পাসওয়ার্ড (admin)"
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-2 border-2 border-black bg-white text-xs font-mono font-bold rounded-lg focus:outline-none"
              />
              {error && <p className="text-[11px] font-bold text-red-600">{error}</p>}
            </div>
          )}

          {isSuperAdmin && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 border border-emerald-300 rounded-lg">
              <ShieldCheck size={14} />
              <span>সুপার অ্যাডমিন দ্বারা অথেনটিকেটেড (Super Admin Verified)</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t-3 border-black pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 bg-white text-black border-2 border-black font-black uppercase text-xs rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-slate-100 cursor-pointer"
          >
            বাতিল করুন
          </button>
          <button
            type="button"
            onClick={handleAction}
            className="px-4 py-2.5 bg-red-600 text-white border-2 border-black font-black uppercase text-xs rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-red-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={14} className="stroke-[2.5]" />
            হ্যাঁ, ডিলিট করুন
          </button>
        </div>
      </div>
    </div>
  );
}
