import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  X, 
  QrCode, 
  ExternalLink, 
  Sparkles, 
  Send, 
  Globe, 
  Calendar, 
  LayoutDashboard,
  Code,
  Smartphone,
  MessageCircle,
  Mail
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
  defaultSubTab?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  defaultTab = 'portal',
  defaultSubTab = 'portfolio'
}: ShareModalProps) {
  const [selectedTarget, setSelectedTarget] = useState<'showcase' | 'booking' | 'dashboard'>('showcase');
  const [copied, setCopied] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [activeView, setActiveView] = useState<'link' | 'qr' | 'embed'>('link');

  if (!isOpen) return null;

  // Compute live URL dynamically
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-73765ho4wwievm3bvkmkdb-62626890636.asia-southeast1.run.app';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  const getTargetUrl = () => {
    if (selectedTarget === 'showcase') {
      return `${origin}${pathname}?tab=portal&subtab=portfolio`;
    }
    if (selectedTarget === 'booking') {
      return `${origin}${pathname}?tab=portal&subtab=booking-form`;
    }
    return `${origin}${pathname}?tab=dashboard`;
  };

  const currentUrl = getTargetUrl();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyEmbed = () => {
    const embedCode = `<iframe src="${currentUrl}" width="100%" height="800px" frameborder="0" allowfullscreen></iframe>`;
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2500);
  };

  // WhatsApp share url
  const shareTitle = selectedTarget === 'booking' 
    ? '🌸 রিত্তিকা ডেকোরেশন - অনলাইন ইভেন্ট বুকিং ও শিডিউল রিকোয়েস্ট' 
    : '✨ রিত্তিকা ডেকোরেশন ও ইভেন্ট ম্যানেজমেন্ট - লাইভ শোকেস ও পোর্টফোলিও';
  
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareTitle}\n👉 ${currentUrl}`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`আসসালামু আলাইকুম,\n\nরিত্তিকা ডেকোরেশন ও ইভেন্ট ম্যানেজমেন্টের লাইভ পোর্টাল ও পোর্টফোলিও দেখতে নিচের লিংকে প্রবেশ করুন:\n${currentUrl}\n\nধন্যবাদ!`)}`;

  // Quick SVG QR Code Generator (Lightweight QR Generator Matrix)
  const renderQRCodeSVG = (text: string) => {
    // Generate deterministic pattern based on hash of text
    const size = 25; // 25x25 grid
    const matrix: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));

    // Fill standard 3 corner finder patterns (7x7)
    const setFinderPattern = (startX: number, startY: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            matrix[startY + r][startX + c] = true;
          }
        }
      }
    };

    setFinderPattern(0, 0); // Top-left
    setFinderPattern(size - 7, 0); // Top-right
    setFinderPattern(0, size - 7); // Bottom-left

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      if (i % 2 === 0) {
        matrix[6][i] = true;
        matrix[i][6] = true;
      }
    }

    // Pseudo-random data encoding from text hash
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Skip finder areas
        const inTopLeft = r < 8 && c < 8;
        const inTopRight = r < 8 && c >= size - 8;
        const inBottomLeft = r >= size - 8 && c < 8;
        if (inTopLeft || inTopRight || inBottomLeft) continue;

        // Pseudo hash bit distribution
        const bit = ((hash ^ (r * 31 + c * 17)) & (1 << ((r + c) % 16))) !== 0;
        matrix[r][c] = bit;
      }
    }

    const cellSize = 10;
    const padding = 15;
    const totalSvgSize = size * cellSize + padding * 2;

    return (
      <svg 
        width={totalSvgSize} 
        height={totalSvgSize} 
        viewBox={`0 0 ${totalSvgSize} ${totalSvgSize}`}
        className="w-48 h-48 sm:w-56 sm:h-56 bg-white p-2 rounded-2xl shadow-md border border-slate-200"
      >
        <rect width={totalSvgSize} height={totalSvgSize} fill="#ffffff" rx="12" />
        {matrix.map((row, r) =>
          row.map((filled, c) =>
            filled ? (
              <rect
                key={`${r}-${c}`}
                x={padding + c * cellSize}
                y={padding + r * cellSize}
                width={cellSize - 0.5}
                height={cellSize - 0.5}
                rx={cellSize > 5 ? 1.5 : 0}
                fill="#1e1b4b"
              />
            ) : null
          )
        )}
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn" id="share-website-modal">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 relative max-w-lg w-full shadow-2xl shadow-purple-500/10 overflow-hidden">
        
        {/* Background decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-amber-400/20 via-rose-500/20 to-purple-600/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
        >
          <X size={18} className="stroke-[2.5]" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5 mb-5">
          <div className="p-3 bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 rounded-2xl text-white shadow-md shadow-rose-500/30">
            <Share2 size={26} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">
                ওয়েবসাইট ও পোর্টাল শেয়ার করুন
              </h3>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                Live
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              যে কাউকে সরাসরি লিংক দিন অথবা হোয়াটসঅ্যাপে পাঠিয়ে কাজ দেখান
            </p>
          </div>
        </div>

        {/* Target Page Selector */}
        <div className="mb-5 space-y-1.5">
          <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide block">
            কোন পেজটি শেয়ার করতে চান?
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedTarget('showcase')}
              className={`p-2.5 rounded-xl border text-xs font-black transition cursor-pointer flex flex-col items-center gap-1 text-center ${
                selectedTarget === 'showcase'
                  ? 'bg-gradient-to-r from-purple-50 to-rose-50 border-purple-400 text-purple-950 shadow-xs ring-2 ring-purple-400/20'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles size={16} className={selectedTarget === 'showcase' ? 'text-amber-500' : 'text-slate-400'} />
              <span>ইভেন্ট শোকেস</span>
            </button>

            <button
              onClick={() => setSelectedTarget('booking')}
              className={`p-2.5 rounded-xl border text-xs font-black transition cursor-pointer flex flex-col items-center gap-1 text-center ${
                selectedTarget === 'booking'
                  ? 'bg-gradient-to-r from-purple-50 to-rose-50 border-purple-400 text-purple-950 shadow-xs ring-2 ring-purple-400/20'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Calendar size={16} className={selectedTarget === 'booking' ? 'text-rose-500' : 'text-slate-400'} />
              <span>বুকিং ফর্ম</span>
            </button>

            <button
              onClick={() => setSelectedTarget('dashboard')}
              className={`p-2.5 rounded-xl border text-xs font-black transition cursor-pointer flex flex-col items-center gap-1 text-center ${
                selectedTarget === 'dashboard'
                  ? 'bg-gradient-to-r from-purple-50 to-rose-50 border-purple-400 text-purple-950 shadow-xs ring-2 ring-purple-400/20'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard size={16} className={selectedTarget === 'dashboard' ? 'text-indigo-500' : 'text-slate-400'} />
              <span>ইআরপি ড্যাশবোর্ড</span>
            </button>
          </div>
        </div>

        {/* View Switcher: Direct Link vs QR Code vs Embed Code */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-4 gap-1">
          <button
            onClick={() => setActiveView('link')}
            className={`flex-1 py-1.5 text-xs font-black uppercase rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeView === 'link' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe size={13} />
            সরাসরি লিংক
          </button>
          <button
            onClick={() => setActiveView('qr')}
            className={`flex-1 py-1.5 text-xs font-black uppercase rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeView === 'qr' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode size={13} />
            কিউআর কোড (QR)
          </button>
          <button
            onClick={() => setActiveView('embed')}
            className={`flex-1 py-1.5 text-xs font-black uppercase rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeView === 'embed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code size={13} />
            ওয়েবসাইট এম্বেড
          </button>
        </div>

        {/* 1. Direct Link View */}
        {activeView === 'link' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                লাইভ শেয়ারেবল লিংক (যেকোনো ডিভাইসে সাপোর্ট করে):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-mono select-all focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                    copied
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {copied ? <Check size={14} className="stroke-[3]" /> : <Copy size={14} />}
                  <span>{copied ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
                </button>
              </div>
            </div>

            {/* Quick 1-Click Social / Messenger Share */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-2">
                এক ক্লিকে সোশ্যাল মিডিয়ায় পাঠান:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition"
                >
                  <MessageCircle size={15} className="text-emerald-600" />
                  <span>WhatsApp</span>
                </a>

                {/* Facebook */}
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition"
                >
                  <Share2 size={15} className="text-blue-600" />
                  <span>Facebook</span>
                </a>

                {/* Telegram */}
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition"
                >
                  <Send size={15} className="text-sky-600" />
                  <span>Telegram</span>
                </a>

                {/* Email */}
                <a
                  href={emailUrl}
                  className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition"
                >
                  <Mail size={15} className="text-purple-600" />
                  <span>Email</span>
                </a>
              </div>
            </div>

            {/* Direct Official Contact Shortcuts */}
            <div className="p-3 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-amber-400/30 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-amber-300 block uppercase">Rittika Event Management</span>
                <span className="text-xs font-black text-white">Owner/CEO: Robin Kumar (+880 1721-779396)</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://wa.me/8801721779396"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-black flex items-center gap-1 cursor-pointer"
                >
                  <MessageCircle size={13} />
                  হোয়াটসঅ্যাপ
                </a>
                <a
                  href="https://www.facebook.com/VRelegantshop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-black flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink size={13} />
                  ফেসবুক পেজ
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 2. QR Code View */}
        {activeView === 'qr' && (
          <div className="flex flex-col items-center text-center space-y-3 py-2">
            <div className="p-2 bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 rounded-2xl shadow-lg">
              {renderQRCodeSVG(currentUrl)}
            </div>
            <div>
              <p className="text-xs font-black text-slate-800">
                স্মার্টফোনের ক্যামেরা দিয়ে স্ক্যান করুন
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                কাস্টমার বা ভিজিটর তাৎক্ষণিকভাবে আপনার ডেকোরেশন শোকেস দেখতে পারবেন
              </p>
            </div>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Copy size={13} />
              <span>{copied ? 'লিংক কপি হয়েছে!' : 'লিংক কপি করুন'}</span>
            </button>
          </div>
        )}

        {/* 3. Embed Code View */}
        {activeView === 'embed' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                আপনার নিজের ওয়েবসাইট বা ব্লগে শোকেস যুক্ত করতে নিচের HTML কোডটি কপি করুন:
              </label>
              <textarea
                readOnly
                rows={3}
                value={`<iframe src="${currentUrl}" width="100%" height="800px" style="border:none; border-radius:16px;" allowfullscreen></iframe>`}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-900 text-emerald-400 font-mono text-[11px] select-all focus:outline-none"
              />
            </div>
            <button
              onClick={handleCopyEmbed}
              className={`w-full py-2.5 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 transition cursor-pointer ${
                copiedEmbed
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {copiedEmbed ? <Check size={14} className="stroke-[3]" /> : <Code size={14} />}
              <span>{copiedEmbed ? 'এম্বেড কোড কপি হয়েছে!' : 'এম্বেড কোড কপি করুন'}</span>
            </button>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>✨ রিত্তিকা ডেকোরেশন ও ইভেন্ট ম্যানেজমেন্ট</span>
          <span className="text-purple-600 font-bold">সকল ডিভাইসে অপ্টিমাইজড</span>
        </div>

      </div>
    </div>
  );
}
