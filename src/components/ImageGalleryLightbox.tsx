import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  Download, 
  Share2, 
  Trash2, 
  Info, 
  Layers, 
  Calendar, 
  User, 
  Sparkles, 
  Check, 
  Settings2, 
  Volume2, 
  VolumeX, 
  Palette, 
  DollarSign, 
  Tag, 
  Move,
  Clock,
  Sliders,
  Film,
  Video,
  PlayCircle,
  Loader2
} from 'lucide-react';
import { toBengaliNumber, formatCurrency } from '../utils';
import { SlideshowTransition } from '../types';
import { 
  exportPresentationToPDF, 
  exportStandaloneHTMLSlideshow,
  exportPresentationToVideo 
} from '../utils/presentationExporter';

export interface GalleryMediaItem {
  id: string;
  title: string;
  category?: string;
  url: string;
  date?: string;
  eventName?: string;
  customerName?: string;
  description?: string;
  isVideo?: boolean;
  estimatedCost?: number;
  highlightTags?: string[];
  colorPalette?: string[];
}

interface ImageGalleryLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  items: GalleryMediaItem[];
  initialIndex?: number;
  onDelete?: (id: string) => void;
  canDelete?: boolean;
  title?: string;
}

export default function ImageGalleryLightbox({
  isOpen,
  onClose,
  items,
  initialIndex = 0,
  onDelete,
  canDelete = false,
  title = 'ডেকোরেশন ও ইভেন্ট ফটো শোকেস'
}: ImageGalleryLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Slideshow & presentation controls
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState(false);
  const [slideshowSpeed, setSlideshowSpeed] = useState(5000); // Default 5s
  const [transitionEffect, setTransitionEffect] = useState<SlideshowTransition>('kenburns');
  const [isAmbientSoundOn, setIsAmbientSoundOn] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // 🎬 Video Export State
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoStatus, setVideoStatus] = useState('');
  const [videoSlideDuration, setVideoSlideDuration] = useState(4); // 4s per slide for video export

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sync initialIndex when modal opens or items change
  useEffect(() => {
    if (isOpen) {
      const validIndex = Math.min(Math.max(0, initialIndex), Math.max(0, items.length - 1));
      setCurrentIndex(validIndex);
      resetView();
      setIsPlayingSlideshow(false);
      setShowSettings(false);
    }
  }, [isOpen, initialIndex, items.length]);

  const resetView = () => {
    setZoomLevel(1);
    setRotation(0);
    setPanPosition({ x: 0, y: 0 });
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSettings) {
          setShowSettings(false);
        } else if (isFullscreen) {
          exitFullscreen();
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlayingSlideshow(prev => !prev);
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        resetView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, items.length, isFullscreen, showSettings]);

  // Slideshow timer
  useEffect(() => {
    if (!isPlayingSlideshow || items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
      resetView();
      if (isAmbientSoundOn) {
        playCelebrationChime();
      }
    }, slideshowSpeed);

    return () => clearInterval(interval);
  }, [isPlayingSlideshow, items.length, slideshowSpeed, isAmbientSoundOn]);

  // Ambient sound synthesizer using Web Audio API
  const playCelebrationChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Celebration chord)
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.05 + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8 + i * 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + 2.0 + i * 0.1);
      });
    } catch (err) {
      console.log('Audio chime info:', err);
    }
  };

  const toggleAmbientSound = () => {
    const nextState = !isAmbientSoundOn;
    setIsAmbientSoundOn(nextState);
    if (nextState) {
      playCelebrationChime();
    }
  };

  if (!isOpen || items.length === 0) return null;

  const currentItem = items[currentIndex] || items[0];

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % items.length);
    resetView();
    if (isAmbientSoundOn) playCelebrationChime();
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
    resetView();
    if (isAmbientSoundOn) playCelebrationChime();
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.35, 3.5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const next = Math.max(prev - 0.35, 0.6);
      if (next <= 1) {
        setPanPosition({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Fullscreen management
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsFullscreen(false);
  };

  // Pan & Drag Handlers for Zoomed Image
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - panPosition.x,
        y: e.clientY - panPosition.y
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      e.preventDefault();
      setPanPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile drag & swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel > 1 && e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - panPosition.x,
        y: e.touches[0].clientY - panPosition.y
      };
    } else if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && zoomLevel > 1 && e.touches.length === 1) {
      setPanPosition({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);
    if (zoomLevel <= 1 && touchStartXRef.current !== null) {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartXRef.current - touchEndX;

      if (diff > 50) {
        handleNext(); // swipe left -> next
      } else if (diff < -50) {
        handlePrev(); // swipe right -> prev
      }
    }
    touchStartXRef.current = null;
  };

  // 🎬 Cinematic Transition Animation Style Calculation
  const isEvenSlide = currentIndex % 2 === 0;

  const getTransitionStyle = () => {
    if (zoomLevel > 1) {
      return {
        transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel}) rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.15s ease-out'
      };
    }

    if (transitionEffect === 'kenburns') {
      const targetScale = isPlayingSlideshow ? (isEvenSlide ? 1.12 : 1.0) : 1.0;
      const initialScale = isPlayingSlideshow ? (isEvenSlide ? 1.0 : 1.12) : 1.0;
      return {
        transform: `scale(${targetScale}) rotate(${rotation}deg)`,
        transition: isPlayingSlideshow ? `transform ${slideshowSpeed}ms cubic-bezier(0.25, 1, 0.5, 1)` : 'transform 0.4s ease-out'
      };
    } else if (transitionEffect === 'zoom') {
      return {
        transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
        transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
      };
    } else {
      return {
        transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
        transition: 'transform 0.35s ease-out'
      };
    }
  };

  const getTransitionClass = () => {
    if (transitionEffect === 'cinema') return 'animate-cinema-dissolve';
    if (transitionEffect === 'fade') return 'animate-fadeIn';
    if (transitionEffect === 'slide') return 'animate-slide-in';
    return '';
  };

  // 🎬 Trigger 1-Click Video Export
  const handleExportVideo = async (durationSec: number = videoSlideDuration) => {
    setShowExportMenu(false);
    setIsExportingVideo(true);
    setVideoProgress(0);
    setVideoStatus('ছবি ও ট্রানজিশন প্রস্তুত হচ্ছে...');
    try {
      await exportPresentationToVideo(items, {
        secondsPerSlide: durationSec,
        transitionEffect: transitionEffect,
        companyName: 'রিত্তিকা ডেকোরেশন ও ইভেন্ট ম্যানেজমেন্ট',
        onProgress: (percent, statusText) => {
          setVideoProgress(percent);
          setVideoStatus(statusText);
        }
      });
    } catch (err: any) {
      console.error('Video generation error:', err);
      alert('ভিডিও তৈরিতে সমস্যা হয়েছে: ' + (err.message || 'অনুগ্রহ করে আবার চেষ্টা করুন।'));
    } finally {
      setTimeout(() => {
        setIsExportingVideo(false);
      }, 1500);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black/95 z-[100] flex flex-col justify-between select-none backdrop-blur-md text-white font-sans overflow-hidden"
      id="photo-showcase-lightbox"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 🌟 Top Control Bar */}
      <div className="bg-black/90 border-b border-white/15 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4 z-30 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-yellow-400 text-black border border-black font-black text-xs rounded shadow-xs">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black uppercase text-white tracking-wide flex items-center gap-2 truncate max-w-[150px] sm:max-w-md">
              {currentItem.title || title}
            </h3>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300">
              <span className="text-yellow-400">
                ছবি: {toBengaliNumber(currentIndex + 1)} / {toBengaliNumber(items.length)}
              </span>
              {currentItem.category && (
                <span className="hidden sm:inline bg-white/10 px-1.5 py-0.2 rounded border border-white/15 text-[10px]">
                  {currentItem.category}
                </span>
              )}
              {zoomLevel > 1 && (
                <span className="bg-emerald-500/80 text-white px-1.5 py-0.2 rounded text-[10px] flex items-center gap-0.5">
                  <Move size={10} /> জুম ({Math.round(zoomLevel * 100)}%) - ড্র্যাগ করুন
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 🌟 Center Toolbar: Auto-Play & Duration Selector (3s, 5s, 10s) */}
        <div className="flex items-center bg-slate-950/80 backdrop-blur-md border border-white/20 p-1.5 rounded-xl gap-1.5 shadow-xl">
          {/* Auto-Play Main Button */}
          <button
            onClick={() => setIsPlayingSlideshow(prev => !prev)}
            className={`px-3 py-1.5 text-xs font-black uppercase rounded-lg flex items-center gap-1.5 transition cursor-pointer border ${
              isPlayingSlideshow 
                ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 text-white border-transparent shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse' 
                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
            title="অটো-প্লে স্লাইডশো চালু / বন্ধ (Spacebar)"
          >
            {isPlayingSlideshow ? <Pause size={14} className="stroke-[3]" /> : <Play size={14} className="stroke-[3]" />}
            <span className="font-black">{isPlayingSlideshow ? 'পজ' : 'অটো-প্লে'}</span>
          </button>

          {/* Quick Duration Selector: 3s, 5s, 10s */}
          <div className="hidden sm:flex items-center gap-1 border-l border-white/20 pl-2 ml-1">
            <span className="text-[10px] text-slate-300 font-bold px-1 flex items-center gap-1">
              <Clock size={11} className="text-amber-400" /> সময়:
            </span>
            {[
              { ms: 3000, label: '৩ সে.' },
              { ms: 5000, label: '৫ সে.' },
              { ms: 10000, label: '১০ সে.' }
            ].map(item => (
              <button
                key={item.ms}
                onClick={() => {
                  setSlideshowSpeed(item.ms);
                  if (!isPlayingSlideshow) setIsPlayingSlideshow(true);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-black transition cursor-pointer border ${
                  slideshowSpeed === item.ms
                    ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 border-transparent shadow-sm'
                    : 'bg-white/5 hover:bg-white/15 text-slate-300 border-white/15'
                }`}
                title={`প্রতি স্লাইড ${item.label} পর পরিবর্তিত হবে`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls & Menus */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Ambient Sound Toggle */}
          <button
            onClick={toggleAmbientSound}
            className={`p-2 rounded border transition cursor-pointer ${
              isAmbientSoundOn 
                ? 'bg-yellow-400 text-black border-yellow-400' 
                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
            title={isAmbientSoundOn ? 'অ্যাম্বিয়েন্ট সাউন্ড বন্ধ করুন' : 'অ্যাম্বিয়েন্ট সাউন্ড ভাইব চালু করুন'}
          >
            {isAmbientSoundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white/10 hover:bg-white/20 rounded text-white border border-white/15 transition cursor-pointer"
            title="জুম ইন (+)"
          >
            <ZoomIn size={16} />
          </button>

          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white/10 hover:bg-white/20 rounded text-white border border-white/15 transition cursor-pointer"
            title="জুম আউট (-)"
          >
            <ZoomOut size={16} />
          </button>

          {/* Rotate */}
          <button
            onClick={handleRotate}
            className="p-2 bg-white/10 hover:bg-white/20 rounded text-white border border-white/15 transition cursor-pointer hidden sm:block"
            title="ঘোরান (Rotate 90°)"
          >
            <RotateCw size={16} />
          </button>

          {/* Reset Zoom */}
          {(zoomLevel !== 1 || panPosition.x !== 0 || panPosition.y !== 0) && (
            <button
              onClick={resetView}
              className="px-2 py-1 bg-yellow-400 text-black text-[10px] font-black rounded border border-black"
              title="১০০% ভিউ ও প্যান রিসেট"
            >
              রিসেট
            </button>
          )}

          {/* Toggle Details Card */}
          <button
            onClick={() => setShowInfo(prev => !prev)}
            className={`p-2 rounded border transition cursor-pointer ${
              showInfo ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
            title="কাজের বিবরণ ও বাজেট সাজেশন কার্ড অন/অফ"
          >
            <Info size={16} />
          </button>

          {/* Presentation & Effect Settings */}
          <button
            onClick={() => setShowSettings(prev => !prev)}
            className={`p-2 rounded border transition cursor-pointer ${
              showSettings ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
            title="স্লাইড ট্রানজিশন ও সেটিংস"
          >
            <Settings2 size={16} />
          </button>

          {/* 1-Click Presentation Export Dropdown (PDF, HTML, and Video MP4/WebM) */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(prev => !prev)}
              disabled={isExportingPdf || isExportingVideo}
              className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-black text-xs uppercase rounded border border-yellow-300 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="১-ক্লিকে প্রেজেন্টেশন ও ভিডিও ডাউনলোড"
            >
              <Download size={14} className="stroke-[3]" />
              <span className="hidden md:inline">
                {isExportingVideo ? 'ভিডিও হচ্ছে...' : (isExportingPdf ? 'PDF হচ্ছে...' : 'প্রেজেন্টেশন এক্সপোর্ট')}
              </span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-10 w-72 bg-black/95 border-2 border-yellow-400 p-2.5 rounded-lg shadow-2xl z-50 space-y-1.5 text-xs text-white animate-fadeIn backdrop-blur-md">
                <div className="text-[10px] font-black uppercase text-yellow-400 px-2 py-1 border-b border-white/15 flex items-center justify-between">
                  <span>১-ক্লিকে প্রেজেন্টেশন ডাউনলোড</span>
                  <span className="text-[9px] bg-yellow-400/20 text-yellow-300 px-1 rounded">HD</span>
                </div>
                
                {/* 🎬 Export as Cinematic Video (MP4 / WebM) */}
                <button
                  onClick={() => handleExportVideo(videoSlideDuration)}
                  className="w-full text-left p-2.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:bg-yellow-400 hover:text-black rounded transition font-black flex items-center justify-between border border-yellow-400/40 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Film size={15} className="text-yellow-400 group-hover:text-black" />
                    <div>
                      <span className="block text-xs">🎥 সিনেমাটিক ভিডিও (MP4/WebM)</span>
                      <span className="text-[10px] text-slate-300 font-normal block">Ken Burns জুম ও ট্রানজিশন সহ</span>
                    </div>
                  </div>
                  <span className="text-[9px] bg-yellow-400 text-black font-black px-1.5 py-0.5 rounded">ভিডিও</span>
                </button>

                {/* Export as PDF Brochure */}
                <button
                  onClick={async () => {
                    setShowExportMenu(false);
                    setIsExportingPdf(true);
                    try {
                      const categories = Array.from(new Set(items.map(i => i.category).filter(Boolean))) as string[];
                      await exportPresentationToPDF(items, categories);
                    } catch (e) {
                      console.error(e);
                      alert('PDF তৈরিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
                    } finally {
                      setIsExportingPdf(false);
                    }
                  }}
                  className="w-full text-left p-2 hover:bg-yellow-400 hover:text-black rounded transition font-bold flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>📄</span>
                    <span>প্রেজেন্টেশন ব্রোশিউর (PDF)</span>
                  </div>
                  <span className="text-[9px] bg-white/20 text-white hover:text-black px-1.5 py-0.5 rounded">ব্রোশিউর</span>
                </button>

                {/* Export as Standalone Offline HTML Slide Deck */}
                <button
                  onClick={() => {
                    setShowExportMenu(false);
                    const categories = Array.from(new Set(items.map(i => i.category).filter(Boolean))) as string[];
                    exportStandaloneHTMLSlideshow(items, categories);
                  }}
                  className="w-full text-left p-2 hover:bg-yellow-400 hover:text-black rounded transition font-bold flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>🌐</span>
                    <span>অফলাইন স্লাইডশো প্যাকেজ (.html)</span>
                  </div>
                  <span className="text-[9px] bg-white/20 text-white hover:text-black px-1.5 py-0.5 rounded">ইন্টারেক্টিভ</span>
                </button>

                {/* Single Image Download */}
                <a
                  href={currentItem.url}
                  download={currentItem.title || `rittika_photo_${currentIndex + 1}.jpg`}
                  onClick={() => setShowExportMenu(false)}
                  className="w-full text-left p-2 hover:bg-white/10 rounded transition font-bold flex items-center justify-between cursor-pointer block border-t border-white/10"
                >
                  <div className="flex items-center gap-2">
                    <span>🖼️</span>
                    <span>বর্তমান ছবিটি ডাউনলোড</span>
                  </div>
                  <span className="text-[9px] text-slate-400">JPG/PNG</span>
                </a>
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white/10 hover:bg-white/20 rounded text-white border border-white/15 transition cursor-pointer hidden sm:block"
            title="ফুল স্ক্রিন মোড"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Delete Option (if Allowed by Admin) */}
          {canDelete && onDelete && (
            <button
              onClick={() => {
                if (window.confirm('আপনি কি নিশ্চিতভাবে এই ছবিটি মুছে ফেলতে চান?')) {
                  onDelete(currentItem.id);
                  if (items.length <= 1) {
                    onClose();
                  } else {
                    setCurrentIndex(prev => Math.max(0, prev - 1));
                  }
                }
              }}
              className="p-2 bg-red-600/80 hover:bg-red-600 rounded text-white border border-red-400 transition cursor-pointer"
              title="মুছে ফেলুন"
            >
              <Trash2 size={16} />
            </button>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 bg-white/20 hover:bg-red-600 hover:text-white rounded text-white border border-white/30 transition cursor-pointer ml-1"
            title="বন্ধ করুন (Esc)"
          >
            <X size={18} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 🌟 Slideshow Real-Time Progress Indicator Bar */}
      {isPlayingSlideshow && (
        <div className="w-full bg-white/15 h-1.5 relative overflow-hidden z-20">
          <div 
            key={`${currentIndex}-${slideshowSpeed}-${isPlayingSlideshow}`}
            className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-purple-500 relative shadow-[0_0_15px_rgba(244,63,94,0.9)]"
            style={{
              animation: `progressBarFill ${slideshowSpeed}ms linear forwards`
            }}
          >
            {/* Glowing Laser Leading Dot */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_10px_#ffffff]" />
          </div>
        </div>
      )}

      {/* 🌟 Main Canvas Area */}
      <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        {/* Previous Button Arrow */}
        {items.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/70 hover:bg-yellow-400 hover:text-black text-white border-2 border-white/30 hover:border-black transition cursor-pointer z-30 shadow-2xl active:scale-95"
            title="পূর্ববর্তী ছবি (Left Arrow)"
          >
            <ChevronLeft size={28} className="stroke-[3]" />
          </button>
        )}

        {/* Center Display Image / Video */}
        <div 
          className={`relative max-w-6xl max-h-[76vh] flex items-center justify-center select-none ${
            zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
          }`}
          onMouseDown={handleMouseDown}
          onDoubleClick={() => (zoomLevel > 1 ? resetView() : handleZoomIn())}
        >
          {currentItem.isVideo || currentItem.url.startsWith('data:video') ? (
            <video
              src={currentItem.url}
              controls
              autoPlay
              className="max-h-[72vh] max-w-full rounded shadow-2xl object-contain border-2 border-white/20"
            />
          ) : (
            <img
              key={currentItem.id || currentIndex}
              src={currentItem.url}
              alt={currentItem.title}
              style={getTransitionStyle()}
              className={`max-h-[72vh] max-w-full rounded shadow-[0_20px_50px_rgba(0,0,0,0.8)] object-contain border-2 border-white/20 ${getTransitionClass()}`}
              draggable={false}
            />
          )}

          {/* Zoom & Pan Hint Badge on Image */}
          {zoomLevel > 1 && (
            <div className="absolute top-3 right-3 bg-black/80 text-yellow-400 text-[10px] font-black px-2.5 py-1 rounded-full border border-yellow-400/50 shadow-md pointer-events-none flex items-center gap-1.5 animate-pulse">
              <Move size={12} /> মাউস বা আঙুল দিয়ে ড্র্যাগ করে সব অংশ দেখুন
            </div>
          )}

          {/* Active Auto-Play Speed Indicator Tag */}
          {isPlayingSlideshow && (
            <div className="absolute top-3 left-3 bg-black/85 text-yellow-400 border border-yellow-400/40 text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg pointer-events-none flex items-center gap-1.5">
              <Clock size={11} /> স্লাইডশো গতি: {toBengaliNumber(slideshowSpeed / 1000)} সেকেন্ড
            </div>
          )}
        </div>

        {/* Next Button Arrow */}
        {items.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/70 hover:bg-yellow-400 hover:text-black text-white border-2 border-white/30 hover:border-black transition cursor-pointer z-30 shadow-2xl active:scale-95"
            title="পরবর্তী ছবি (Right Arrow)"
          >
            <ChevronRight size={28} className="stroke-[3]" />
          </button>
        )}

        {/* 🌟 Professional Suggestions & Details Card (প্রফেশনাল ফিল ও ভাইব দেওয়ার জন্য) */}
        {showInfo && (
          <div className="absolute bottom-20 sm:bottom-24 left-3 sm:left-6 max-w-md bg-black/90 border-2 border-yellow-400 p-4 text-xs space-y-2 shadow-2xl backdrop-blur-lg rounded-md z-30 animate-fadeIn text-white max-h-[40vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-start justify-between gap-2 border-b border-white/15 pb-2">
              <div>
                <h4 className="text-sm font-black text-yellow-400 uppercase tracking-wide">
                  {currentItem.title}
                </h4>
                {currentItem.category && (
                  <span className="text-[10px] font-black uppercase text-black bg-yellow-400 px-2 py-0.5 rounded mt-1 inline-block">
                    {currentItem.category}
                  </span>
                )}
              </div>
              {currentItem.estimatedCost && (
                <div className="text-right">
                  <span className="text-[9px] text-slate-300 block">আনুমানিক বাজেট রেঞ্জ</span>
                  <span className="text-xs font-black text-emerald-400">
                    {formatCurrency(currentItem.estimatedCost)}
                  </span>
                </div>
              )}
            </div>

            {/* Event & Client Details */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-bold">
              {currentItem.eventName && (
                <p className="flex items-center gap-1 truncate">
                  <Layers size={12} className="text-yellow-400 shrink-0" />
                  <span className="truncate">{currentItem.eventName}</span>
                </p>
              )}
              {currentItem.customerName && (
                <p className="flex items-center gap-1 truncate">
                  <User size={12} className="text-yellow-400 shrink-0" />
                  <span className="truncate">{currentItem.customerName}</span>
                </p>
              )}
              {currentItem.date && (
                <p className="flex items-center gap-1">
                  <Calendar size={12} className="text-yellow-400 shrink-0" />
                  <span>{currentItem.date}</span>
                </p>
              )}
            </div>

            {/* Description / Work details */}
            {currentItem.description && (
              <p className="text-[11px] text-slate-200 border-t border-white/10 pt-2 leading-relaxed">
                {currentItem.description}
              </p>
            )}

            {/* Professional Suggestion & Highlight Tags */}
            {currentItem.highlightTags && currentItem.highlightTags.length > 0 && (
              <div className="pt-2 border-t border-white/10">
                <span className="text-[9px] text-yellow-400 block font-black uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Sparkles size={10} /> বিশেষ বৈশিষ্ট্য ও ডেকোরেশন হাইলাইটস:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {currentItem.highlightTags.map((tag, idx) => (
                    <span key={idx} className="bg-white/15 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/15 flex items-center gap-1">
                      <Tag size={9} className="text-yellow-400" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Color Palette Display */}
            {currentItem.colorPalette && currentItem.colorPalette.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[9px] text-slate-400 flex items-center gap-1 font-bold">
                  <Palette size={10} /> থিম কালার:
                </span>
                <div className="flex items-center gap-1">
                  {currentItem.colorPalette.map((color, idx) => (
                    <span
                      key={idx}
                      className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 🌟 Presentation & Effect Settings Drawer Modal */}
        {showSettings && (
          <div className="absolute top-16 right-4 w-80 bg-black/95 border-2 border-yellow-400 p-5 rounded-lg shadow-2xl backdrop-blur-xl z-40 space-y-4 animate-fadeIn text-xs text-white">
            <div className="flex items-center justify-between border-b border-white/20 pb-2">
              <h4 className="font-black uppercase text-yellow-400 flex items-center gap-1.5">
                <Sliders size={14} />
                প্রেজেন্টেশন ও স্লাইড সেটিংস
              </h4>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Transition Effects */}
            <div>
              <label className="block mb-1.5 text-slate-300 font-bold">সিনেমাটিক ট্রানজিশন অ্যানিমেশন:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'kenburns', name: '🎥 Ken Burns (ধীর জুম-ইন/আউট)' },
                  { id: 'cinema', name: '✨ Cinema Dissolve (ব্লার-ফেড)' },
                  { id: 'fade', name: '🌫️ Soft Fade (সফট ফেড)' },
                  { id: 'slide', name: '⏩ Smooth Slide (স্লাইড)' },
                  { id: 'zoom', name: '🔍 Zoom Burst (জুম ইফেক্ট)' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTransitionEffect(t.id as SlideshowTransition)}
                    className={`px-2 py-1.5 rounded border text-[11px] font-bold text-left transition cursor-pointer ${
                      transitionEffect === t.id
                        ? 'bg-yellow-400 text-black border-yellow-400 font-black shadow-xs'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Speed Options (3s, 5s, 10s, etc.) */}
            <div>
              <label className="block mb-1.5 text-slate-300 font-bold">প্রতি স্লাইডের সময় (Duration):</label>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                {[
                  { ms: 3000, label: '৩ সে.' },
                  { ms: 5000, label: '৫ সে.' },
                  { ms: 8000, label: '৮ সে.' },
                  { ms: 10000, label: '১০ সে.' }
                ].map(s => (
                  <button
                    key={s.ms}
                    onClick={() => setSlideshowSpeed(s.ms)}
                    className={`py-1.5 rounded border text-[11px] font-black transition cursor-pointer ${
                      slideshowSpeed === s.ms
                        ? 'bg-yellow-400 text-black border-yellow-400 shadow-xs'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="space-y-2 border-t border-white/15 pt-3 text-[11px]">
              <label className="flex items-center justify-between cursor-pointer p-1.5 bg-white/5 rounded hover:bg-white/10">
                <span className="flex items-center gap-1.5">
                  <Volume2 size={13} className="text-yellow-400" />
                  অ্যাম্বিয়েন্ট সাউন্ড এফেক্টস
                </span>
                <input
                  type="checkbox"
                  checked={isAmbientSoundOn}
                  onChange={toggleAmbientSound}
                  className="accent-yellow-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-1.5 bg-white/5 rounded hover:bg-white/10">
                <span className="flex items-center gap-1.5">
                  <Info size={13} className="text-yellow-400" />
                  বাজেট ও বিবরণ সাজেশন কার্ড
                </span>
                <input
                  type="checkbox"
                  checked={showInfo}
                  onChange={(e) => setShowInfo(e.target.checked)}
                  className="accent-yellow-400 cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 🌟 🎬 Video Export Progress Modal */}
      {isExportingVideo && (
        <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4 backdrop-blur-xl animate-fadeIn">
          <div className="max-w-md w-full bg-slate-900 border-2 border-yellow-400 rounded-xl p-6 text-center space-y-4 shadow-2xl text-white">
            <div className="w-16 h-16 bg-yellow-400/20 text-yellow-400 border border-yellow-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Film size={32} />
            </div>

            <div>
              <h3 className="text-lg font-black text-yellow-400 uppercase tracking-wide">
                সিনেমাটিক ভিডিও তৈরি হচ্ছে
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {videoStatus || 'হাই-ডেফিনিশন অ্যানিমেশন ও ট্রানজিশন রেন্ডার হচ্ছে...'}
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-white/20">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300 rounded-full"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>রেন্ডারিং প্রগ্রেস</span>
                <span className="text-yellow-400 font-black">{videoProgress}%</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-black/40 p-2.5 rounded border border-white/10">
              💡 ভিডিও ফাইলটি সম্পন্ন হলে স্বয়ংক্রিয়ভাবে ডাউনলোড হয়ে যাবে। এটি ক্লায়েন্টকে হোয়াটসঅ্যাপ বা সোশ্যাল মিডিয়ায় পাঠানো যাবে।
            </div>
          </div>
        </div>
      )}

      {/* 🌟 Bottom Thumbnail Carousel Strip */}
      <div className="bg-black/95 border-t border-white/15 p-2 sm:p-3 flex items-center gap-2 overflow-x-auto z-30 scrollbar-thin">
        <div className="flex items-center gap-2 mx-auto">
          {items.map((item, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={item.id || index}
                onClick={() => {
                  setCurrentIndex(index);
                  resetView();
                  if (isAmbientSoundOn) playCelebrationChime();
                }}
                className={`relative shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded overflow-hidden border-2 transition-all cursor-pointer ${
                  isActive 
                    ? 'border-yellow-400 scale-110 shadow-[0_0_12px_rgba(250,204,21,0.9)] z-10' 
                    : 'border-white/20 opacity-60 hover:opacity-100'
                }`}
              >
                {item.isVideo || item.url.startsWith('data:video') ? (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-yellow-400">
                    ▶ Video
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                )}
                {isActive && (
                  <div className="absolute inset-x-0 bottom-0 bg-yellow-400 text-black text-[9px] font-black text-center py-0.2">
                    {toBengaliNumber(index + 1)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
