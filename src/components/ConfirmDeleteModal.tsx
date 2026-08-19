import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  title = 'রেকর্ডটি মুছে ফেলতে চান?',
  message = 'আপনি কি নিশ্চিতভাবে এই তথ্যটি স্থায়ীভাবে মুছে ফেলতে চান? এই পরিবর্তনটি অপরিবর্তনীয় এবং হিসাবের তালিকা থেকে বাদ যাবে।',
  itemName,
  onConfirm,
  onCancel
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="confirm-delete-dialog">
      <div className="bg-white border-4 border-black p-6 relative max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black transition cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
        >
          <X size={16} className="stroke-[2.5]" />
        </button>

        <div className="flex items-center gap-3 border-b-3 border-black pb-3 mb-4">
          <div className="p-2 bg-red-100 border-2 border-black text-red-600">
            <AlertTriangle size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-black uppercase text-black">
              {title}
            </h3>
            <p className="text-[11px] font-bold text-red-600">সতর্কতামূলক বার্তা (Permanent Delete)</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <p className="text-xs font-bold text-slate-800 leading-relaxed">
            {message}
          </p>

          {itemName && (
            <div className="p-3 bg-red-50 border-2 border-red-300 rounded text-xs font-mono font-bold text-red-950 break-words">
              আইটেম / বিবরণ: <span className="underline">{itemName}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t-3 border-black pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 bg-white text-black border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-slate-100 cursor-pointer"
          >
            বাতিল করুন
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
            }}
            className="px-4 py-2.5 bg-red-600 text-white border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:bg-red-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={14} className="stroke-[2.5]" />
            হ্যাঁ, ডিলিট করুন
          </button>
        </div>
      </div>
    </div>
  );
}
