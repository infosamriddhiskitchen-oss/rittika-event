import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  ExternalLink,
  ChevronUp,
  X
} from 'lucide-react';

interface SmartFloatingSocialBarProps {
  isImmersiveFullView?: boolean;
  onOpenWhatsAppModal?: () => void;
}

export default function SmartFloatingSocialBar({ 
  isImmersiveFullView = false,
  onOpenWhatsAppModal 
}: SmartFloatingSocialBarProps) {
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const lastScrollYRef = useRef<number>(0);

  // 🌟 Inverse Scroll: Appears when scrolling DOWN, Hides when scrolling UP or at TOP
  useEffect(() => {
    let ticking = false;

    const handleScroll = (currentY: number) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (currentY > 100 && currentY > lastScrollYRef.current) {
            // Scrolling down -> Show floating social buttons
            setIsScrolledDown(true);
          } else if (currentY < lastScrollYRef.current - 10 || currentY < 60) {
            // Scrolling up or at top -> Hide floating social buttons
            setIsScrolledDown(false);
          }
          lastScrollYRef.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    const onWindowScroll = () => {
      handleScroll(window.scrollY || document.documentElement.scrollTop);
    };

    window.addEventListener('scroll', onWindowScroll, { passive: true });

    const mainContainer = document.getElementById('main-view-container');
    const onContainerScroll = () => {
      if (mainContainer) {
        handleScroll(mainContainer.scrollTop);
      }
    };

    if (mainContainer) {
      mainContainer.addEventListener('scroll', onContainerScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', onWindowScroll);
      if (mainContainer) {
        mainContainer.removeEventListener('scroll', onContainerScroll);
      }
    };
  }, []);

  // If in immersive full view or dismissed by user, do not show
  if (isImmersiveFullView || isDismissed) {
    return null;
  }

  return (
    <aside 
      aria-label="সোশ্যাল কন্টাক্ট বার"
      className={`fixed bottom-4 right-4 z-40 no-print transition-all duration-300 ease-out transform ${
        isScrolledDown 
          ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto' 
          : 'translate-y-16 opacity-0 scale-90 pointer-events-none'
      }`}
      id="smart-floating-social-bar"
    >
      <div className="flex items-center gap-2 bg-slate-950/90 backdrop-blur-xl p-2 sm:px-3 sm:py-2 rounded-full border border-amber-400/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        {/* WhatsApp Fast Action Button */}
        {onOpenWhatsAppModal ? (
          <button
            type="button"
            onClick={onOpenWhatsAppModal}
            title="হোয়াটসঅ্যাপে সরাসরি মেসেজ বা স্মার্ট বুকিং ইনকোয়ারি পাঠান"
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-md hover:scale-105 active:scale-95 transition cursor-pointer border-0"
          >
            <div className="w-5 h-5 rounded-full bg-white text-emerald-600 flex items-center justify-center shrink-0">
              <MessageCircle size={13} className="fill-emerald-600 text-white" />
            </div>
            <span className="text-[11px] font-black tracking-tight">WhatsApp</span>
          </button>
        ) : (
          <a
            href="https://wa.me/8801721779396"
            target="_blank"
            rel="noopener noreferrer"
            title="হোয়াটসঅ্যাপে সরাসরি মেসেজ পাঠান (+880 1721-779396)"
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-white text-emerald-600 flex items-center justify-center shrink-0">
              <MessageCircle size={13} className="fill-emerald-600 text-white" />
            </div>
            <span className="text-[11px] font-black tracking-tight">WhatsApp</span>
          </a>
        )}

        {/* Facebook Page Fast Action Button */}
        <a
          href="https://www.facebook.com/VRelegantshop"
          target="_blank"
          rel="noopener noreferrer"
          title="ফেসবুক পেজ ভিজিট করুন (facebook.com/VRelegantshop)"
          className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-white text-blue-600 flex items-center justify-center font-black text-xs font-sans shrink-0">
            f
          </div>
          <span className="text-[11px] font-black tracking-tight">Facebook</span>
        </a>

        {/* Scroll To Top Action */}
        <button
          type="button"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            const mainContainer = document.getElementById('main-view-container');
            if (mainContainer) {
              mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          title="উপরে যান (Scroll to top)"
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-amber-300 flex items-center justify-center transition cursor-pointer"
        >
          <ChevronUp size={15} />
        </button>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          title="বন্ধ করুন"
          className="w-6 h-6 rounded-full hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
        >
          <X size={13} />
        </button>
      </div>
    </aside>
  );
}
