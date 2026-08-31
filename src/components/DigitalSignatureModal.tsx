import React, { useState, useRef, useEffect } from 'react';
import { 
  X, PenTool, Upload, Type, Stamp, Check, Trash2, RotateCcw, 
  Sparkles, ShieldCheck, Image as ImageIcon, Download, CheckCircle2,
  Award, Eye, Layers, Sliders
} from 'lucide-react';
import { 
  CompanyOfficialSeal, 
  StatusRubberStamp, 
  SealColorTheme, 
  StatusStampType,
  SEAL_COLOR_MAP,
  downloadSealAsPNG
} from './DigitalSealStamp';

export interface SignatureSettings {
  mode: 'draw' | 'upload' | 'type';
  drawnDataUrl: string | null;
  uploadedDataUrl: string | null;
  typedName: string;
  typedDesignation: string;
  typedFont: 'font-cursive' | 'font-serif' | 'font-sans' | 'font-mono' | 'font-bengali';
  inkColor: string;
  
  // Seal & Stamp Config
  showCompanySeal: boolean;
  sealColorTheme: SealColorTheme;
  sealRotation: number;
  sealTexture?: 'clean' | 'ink-stamp';
  sealShowDate?: boolean;
  
  showStatusStamp: boolean;
  statusStampType: StatusStampType;
  statusStampColorTheme: SealColorTheme;
  statusStampRotation: number;
}

export const DEFAULT_SIGNATURE_SETTINGS: SignatureSettings = {
  mode: 'type',
  drawnDataUrl: null,
  uploadedDataUrl: null,
  typedName: 'Robin Kumar',
  typedDesignation: 'প্রোপ্রাইটর (Proprietor)',
  typedFont: 'font-cursive',
  inkColor: '#003399',
  showCompanySeal: true,
  sealColorTheme: 'royal-blue',
  sealRotation: -6,
  sealTexture: 'clean',
  sealShowDate: true,
  showStatusStamp: true,
  statusStampType: 'final',
  statusStampColorTheme: 'royal-blue',
  statusStampRotation: -12
};

const STORAGE_KEY = 'rem_digital_signature_data_v2';

export function loadSavedSignatureSettings(): SignatureSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SIGNATURE_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load signature settings:', e);
  }
  return DEFAULT_SIGNATURE_SETTINGS;
}

export function saveSignatureSettings(settings: SignatureSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save signature settings:', e);
  }
}

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SignatureSettings;
  onSaveSettings: (newSettings: SignatureSettings) => void;
}

export default function DigitalSignatureModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}: DigitalSignatureModalProps) {
  const [activeTab, setActiveTab] = useState<'draw' | 'upload' | 'type' | 'stamp'>('type');
  const [localSettings, setLocalSettings] = useState<SignatureSettings>(settings);

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushWidth, setBrushWidth] = useState(3.5);
  const [drawingInkColor, setDrawingInkColor] = useState(localSettings.inkColor || '#003399');

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLocalSettings(settings);
    setActiveTab(settings.mode || 'type');
    setDrawingInkColor(settings.inkColor || '#003399');
  }, [settings, isOpen]);

  // Load drawn signature into canvas when opening draw tab
  useEffect(() => {
    if (isOpen && activeTab === 'draw' && canvasRef.current && localSettings.drawnDataUrl) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = localSettings.drawnDataUrl;
      }
    }
  }, [isOpen, activeTab, localSettings.drawnDataUrl]);

  if (!isOpen) return null;

  // Drawing coordinates helper
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  const handleStartDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineWidth = brushWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = drawingInkColor;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleStopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setLocalSettings(prev => ({
        ...prev,
        drawnDataUrl: dataUrl,
        mode: 'draw'
      }));
    }
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setLocalSettings(prev => ({
      ...prev,
      drawnDataUrl: null
    }));
  };

  // Image Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('অনুগ্রহ করে একটি বৈধ ইমেজ ফাইল (PNG, JPG, SVG) নির্বাচন করুন!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setLocalSettings(prev => ({
        ...prev,
        uploadedDataUrl: result,
        mode: 'upload'
      }));
    };
    reader.readAsDataURL(file);
  };

  // Save changes
  const handleApplyAndSave = () => {
    const updated: SignatureSettings = {
      ...localSettings,
      mode: activeTab === 'stamp' ? localSettings.mode : activeTab,
      inkColor: drawingInkColor
    };
    saveSignatureSettings(updated);
    onSaveSettings(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-print">
      <div className="bg-white border-4 border-black max-w-2xl w-full rounded-2xl shadow-[10px_10px_0px_0px_#000000] overflow-hidden my-auto animate-scaleUp">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b-4 border-black">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center text-slate-950 font-black shadow-md">
              <Stamp size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase text-amber-300 tracking-tight leading-none">
                ডিজিটাল স্বাক্ষর ও সিলমোহর সেন্টার
              </h3>
              <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                ইনভয়েস ও রসিদের জন্য অফিসিয়াল রবার স্ট্যাম্প, কাস্টম স্বাক্ষর ও সিলমোহর
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500 hover:text-white text-slate-300 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b-3 border-black bg-slate-100 overflow-x-auto text-xs font-black">
          {[
            { id: 'type', label: 'টাইপ স্বাক্ষর', icon: Type },
            { id: 'upload', label: 'ছবি আপলোড', icon: Upload },
            { id: 'draw', label: 'হাতে আঁকুন', icon: PenTool },
            { id: 'stamp', label: 'সিলমোহর ও স্ট্যাম্প', icon: Stamp }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id !== 'stamp') {
                    setLocalSettings(p => ({ ...p, mode: tab.id as any }));
                  }
                }}
                className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 transition cursor-pointer border-r-2 border-black last:border-r-0 uppercase tracking-wider shrink-0 ${
                  isActive 
                    ? 'bg-amber-400 text-black shadow-inner font-black' 
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {localSettings.mode === tab.id && tab.id !== 'stamp' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Content Body */}
        <div className="p-5 sm:p-6 max-h-[68vh] overflow-y-auto space-y-6">

          {/* TAB 1: TYPE SIGNATURE */}
          {activeTab === 'type' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border-2 border-amber-300 p-3 rounded-xl text-xs font-medium text-amber-950 flex items-start gap-2">
                <Sparkles size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <p>
                  স্বাক্ষরকারীর নাম ও পদবি লিখুন এবং পছন্দের ক্যালিগ্রাফিক বা ক্লাসিক ফন্ট নির্বাচন করুন।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-800 mb-1">
                    স্বাক্ষরকারীর নাম / প্রতিষ্ঠান
                  </label>
                  <input
                    type="text"
                    value={localSettings.typedName}
                    onChange={(e) => setLocalSettings(p => ({ ...p, typedName: e.target.value, mode: 'type' }))}
                    className="w-full bg-white border-2 border-black p-2.5 rounded-xl font-bold text-sm"
                    placeholder="যেমন: Robin Kumar"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-800 mb-1">
                    পদবি / বিবরণ
                  </label>
                  <input
                    type="text"
                    value={localSettings.typedDesignation}
                    onChange={(e) => setLocalSettings(p => ({ ...p, typedDesignation: e.target.value, mode: 'type' }))}
                    className="w-full bg-white border-2 border-black p-2.5 rounded-xl font-bold text-sm"
                    placeholder="যেমন: প্রোপ্রাইটর (Proprietor)"
                  />
                </div>
              </div>

              {/* Font Style Picker */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-800 mb-1.5">
                  স্বাক্ষরের ফন্ট স্টাইল (Typography Style)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'font-cursive', label: 'Cursive Script', sample: 'Robin Kumar' },
                    { id: 'font-serif', label: 'Classic Serif', sample: 'Robin Kumar' },
                    { id: 'font-sans', label: 'Modern Sans', sample: 'Robin Kumar' },
                    { id: 'font-mono', label: 'Tech Mono', sample: 'Robin Kumar' },
                    { id: 'font-bengali', label: 'Bengali Calligraphy', sample: 'রবিন কুমার' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setLocalSettings(p => ({ ...p, typedFont: f.id as any, mode: 'type' }))}
                      className={`p-3 border-2 rounded-xl text-left transition cursor-pointer flex flex-col justify-between h-20 ${
                        localSettings.typedFont === f.id 
                          ? 'border-black bg-amber-200/80 shadow-[3px_3px_0px_0px_#000000]' 
                          : 'border-slate-300 bg-slate-50 hover:bg-white'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase text-slate-700">{f.label}</span>
                      <span className={`text-base text-slate-900 truncate ${
                        f.id === 'font-cursive' ? 'italic font-serif tracking-wider font-bold' :
                        f.id === 'font-serif' ? 'font-serif font-bold' :
                        f.id === 'font-sans' ? 'font-sans font-black' :
                        f.id === 'font-bengali' ? 'font-serif font-black' : 'font-mono font-bold'
                      }`}>
                        {localSettings.typedName || f.sample}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="border-2 border-dashed border-slate-400 bg-slate-50 rounded-xl p-5 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2">
                  লাইভ স্বাক্ষর প্রিভিউ
                </span>
                <div className="border-b-2 border-slate-900 pb-1.5 w-60 mx-auto min-h-[45px] flex items-center justify-center">
                  <span className={`text-2xl text-blue-900 ${
                    localSettings.typedFont === 'font-cursive' ? 'italic font-serif tracking-wider font-bold' :
                    localSettings.typedFont === 'font-serif' ? 'font-serif font-bold' :
                    localSettings.typedFont === 'font-sans' ? 'font-sans font-black' :
                    localSettings.typedFont === 'font-bengali' ? 'font-serif font-black' : 'font-mono font-bold'
                  }`}>
                    {localSettings.typedName || 'Robin Kumar'}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-700 mt-1">
                  {localSettings.typedDesignation || 'প্রোপ্রাইটর (Proprietor)'}
                </p>
                <p className="text-[9px] font-bold text-slate-500 uppercase">
                  RITTIKA EVENT MANAGEMENT
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD IMAGE SIGNATURE */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border-2 border-indigo-300 p-3 rounded-xl text-xs font-medium text-indigo-950 flex items-start gap-2">
                <Upload size={16} className="text-indigo-700 shrink-0 mt-0.5" />
                <p>
                  আপনার আসল হাতের স্বাক্ষরের ছবি (PNG, JPG, SVG) আপলোড করুন। স্বচ্ছ (Transparent PNG) ব্যাকগ্রাউন্ড ছবি সবচেয়ে ভালো ফলাফল দেয়।
                </p>
              </div>

              {/* Upload Drop Zone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-3 border-dashed border-slate-400 hover:border-black bg-slate-50 hover:bg-amber-50/50 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp" 
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 border-2 border-indigo-300 flex items-center justify-center text-indigo-700 shadow-sm">
                  <ImageIcon size={28} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase text-slate-900">স্বাক্ষরের ছবি নির্বাচন করতে ক্লিক করুন</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">বা এখানে ফাইল ড্র্যাগ অ্যান্ড ড্রপ করুন (PNG, JPG, SVG)</p>
                </div>
                <button
                  type="button"
                  className="neo-btn px-4 py-1.5 text-xs bg-indigo-600 text-white font-black uppercase shadow-[2px_2px_0px_0px_#000000]"
                >
                  ফাইল সিলেক্ট করুন
                </button>
              </div>

              {/* Uploaded Preview */}
              {localSettings.uploadedDataUrl && (
                <div className="border-2 border-black bg-white rounded-xl p-4 shadow-[4px_4px_0px_0px_#000000] space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span className="text-xs font-black uppercase text-slate-800">আপলোডকৃত স্বাক্ষর প্রিভিউ</span>
                    </div>
                    <button
                      onClick={() => setLocalSettings(p => ({ ...p, uploadedDataUrl: null }))}
                      className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      মুছুন
                    </button>
                  </div>

                  <div className="bg-slate-100 border border-slate-300 rounded-lg p-4 flex items-center justify-center min-h-[90px]">
                    <img 
                      src={localSettings.uploadedDataUrl} 
                      alt="Uploaded Signature" 
                      className="max-h-20 max-w-full object-contain"
                    />
                  </div>

                  <div className="text-center pt-1 border-t border-slate-200">
                    <span className="text-[10px] font-black uppercase text-slate-700 block">
                      অনুমোদিত স্বাক্ষর (Authorized Signature)
                    </span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase">
                      Rittika Event Management
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DRAW SIGNATURE ON CANVAS */}
          {activeTab === 'draw' && (
            <div className="space-y-4">
              <div className="bg-teal-50 border-2 border-teal-300 p-3 rounded-xl text-xs font-medium text-teal-950 flex items-start gap-2">
                <PenTool size={16} className="text-teal-700 shrink-0 mt-0.5" />
                <p>
                  মাউস বা টাচপ্যাডে/মোবাইল স্ক্রিনে আঙুল দিয়ে সরাসরি আপনার স্বাক্ষর আঁকুন।
                </p>
              </div>

              {/* Ink & Brush Controls */}
              <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-100 p-3 rounded-xl border border-slate-300">
                {/* Ink Color */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-slate-700">কালি:</span>
                  {[
                    { id: '#003399', label: 'রয়েল ব্লু' },
                    { id: '#0f172a', label: 'কালো' },
                    { id: '#991b1b', label: 'গাঢ় লাল' },
                    { id: '#047857', label: 'সবুজ' }
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => setDrawingInkColor(c.id)}
                      className={`w-6 h-6 rounded-full border-2 transition cursor-pointer ${
                        drawingInkColor === c.id ? 'border-black scale-110 shadow-md ring-2 ring-amber-400' : 'border-white'
                      }`}
                      style={{ backgroundColor: c.id }}
                      title={c.label}
                    />
                  ))}
                </div>

                {/* Brush Thickness */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-slate-700">থিকনেস:</span>
                  {[
                    { width: 2, label: 'চিকন' },
                    { width: 3.5, label: 'স্ট্যান্ডার্ড' },
                    { width: 5, label: 'বোল্ড' }
                  ].map(b => (
                    <button
                      key={b.width}
                      onClick={() => setBrushWidth(b.width)}
                      className={`px-2.5 py-1 text-[11px] rounded-lg font-bold border transition cursor-pointer ${
                        brushWidth === b.width ? 'bg-black text-white border-black' : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>

                {/* Clear Canvas */}
                <button
                  onClick={handleClearCanvas}
                  className="px-3 py-1 text-xs font-black text-rose-600 bg-white border border-rose-400 rounded-lg hover:bg-rose-50 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={12} />
                  পরিষ্কার করুন
                </button>
              </div>

              {/* Canvas Box */}
              <div className="border-3 border-black rounded-xl overflow-hidden bg-white shadow-[4px_4px_0px_0px_#000000] relative">
                <canvas
                  ref={canvasRef}
                  width={560}
                  height={170}
                  onMouseDown={handleStartDrawing}
                  onMouseMove={handleDraw}
                  onMouseUp={handleStopDrawing}
                  onMouseLeave={handleStopDrawing}
                  onTouchStart={handleStartDrawing}
                  onTouchMove={handleDraw}
                  onTouchEnd={handleStopDrawing}
                  className="w-full h-[160px] cursor-crosshair touch-none bg-white"
                />
                <div className="absolute bottom-2 right-2 pointer-events-none text-[9px] font-bold text-slate-400 uppercase">
                  ✍️ ক্যানভাসে স্বাক্ষর করুন
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RUBBER STAMP & SEAL CONFIG */}
          {activeTab === 'stamp' && (
            <div className="space-y-6">
              
              {/* Section 1: Official Corporate Luxury Seal */}
              <div className="border-2 border-black rounded-xl p-4 sm:p-5 bg-slate-50 space-y-4 shadow-[2px_2px_0px_0px_#000000]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000000] shrink-0">
                      <ShieldCheck size={20} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase text-slate-900 flex items-center gap-1.5">
                        অফিসিয়াল নীল/গোল্ডেন সিলমোহর (Official Corporate Seal)
                        <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 text-[9px] font-black rounded border border-black uppercase tracking-wider">
                          PREMIUM
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-600 font-medium">
                        রিত্তিকা ইভেন্ট ম্যানেজমেন্টের কেন্দ্রীয় লোগো, ভেড়ামারা কুষ্টিয়া ও অফিসিয়াল স্লোগানসহ কর্পোরেট ডিজিটাল সিল
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.showCompanySeal}
                      onChange={(e) => setLocalSettings(p => ({ ...p, showCompanySeal: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {localSettings.showCompanySeal && (
                  <div className="space-y-4 pt-3 border-t-2 border-slate-200">
                    
                    {/* Controls & Live Preview Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                      
                      {/* Left: Controls (7 cols) */}
                      <div className="lg:col-span-7 space-y-4">
                        
                        {/* Theme Switcher */}
                        <div>
                          <label className="block text-xs font-black uppercase text-slate-700 mb-1.5 flex items-center justify-between">
                            <span>সিলমোহরের কালার থিম নির্বাচন করুন</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {SEAL_COLOR_MAP[localSettings.sealColorTheme]?.label || ''}
                            </span>
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {[
                              { id: 'royal-blue', label: 'রয়েল ব্লু (নীল)', color: '#003399', bg: '#eff6ff' },
                              { id: 'luxury-gold', label: 'লাক্সারি গোল্ড', color: '#c5a059', bg: '#fefce8' },
                              { id: 'deep-navy', label: 'ডিপ নেভি', color: '#0f172a', bg: '#f8fafc' },
                              { id: 'emerald', label: 'পান্না সবুজ', color: '#047857', bg: '#ecfdf5' },
                              { id: 'ruby-red', label: 'রুবি লাল', color: '#b91c1c', bg: '#fef2f2' },
                              { id: 'purple', label: 'ইম্পেরিয়াল বেগুনি', color: '#6b21a8', bg: '#faf5ff' }
                            ].map(c => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => setLocalSettings(p => ({ ...p, sealColorTheme: c.id as any }))}
                                className={`p-2 border-2 rounded-xl text-left text-xs font-black transition cursor-pointer flex items-center gap-2 ${
                                  localSettings.sealColorTheme === c.id 
                                    ? 'bg-amber-300 border-black shadow-[2px_2px_0px_0px_#000000]' 
                                    : 'bg-white border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                <span 
                                  className="w-4 h-4 rounded-full border border-black/30 shrink-0 shadow-xs"
                                  style={{ backgroundColor: c.color }}
                                />
                                <span className="truncate text-[11px]">{c.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Sliders and Toggles Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          
                          {/* Rotation slider */}
                          <div className="bg-white p-3 rounded-xl border-2 border-slate-200 space-y-1.5">
                            <div className="flex justify-between items-center text-xs font-black text-slate-700">
                              <span className="flex items-center gap-1">
                                <Sliders size={13} className="text-slate-500" />
                                অ্যাঙ্গেল / রোটেশন
                              </span>
                              <span className="font-mono text-blue-700 font-bold">{localSettings.sealRotation}°</span>
                            </div>
                            <input 
                              type="range"
                              min="-15"
                              max="15"
                              step="1"
                              value={localSettings.sealRotation}
                              onChange={(e) => setLocalSettings(p => ({ ...p, sealRotation: Number(e.target.value) }))}
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
                            />
                            <div className="flex justify-between text-[9px] font-mono text-slate-400">
                              <span>-15°</span>
                              <button 
                                type="button" 
                                onClick={() => setLocalSettings(p => ({ ...p, sealRotation: -6 }))}
                                className="underline text-slate-600 hover:text-black"
                              >
                                ডিফল্ট (-6°)
                              </button>
                              <span>+15°</span>
                            </div>
                          </div>

                          {/* Options: Date & Texture */}
                          <div className="bg-white p-3 rounded-xl border-2 border-slate-200 space-y-2">
                            <label className="flex items-center justify-between text-xs font-black text-slate-700 cursor-pointer">
                              <span>তারিখ প্রদর্শন (ISSUED • 30 AUG 2026)</span>
                              <input 
                                type="checkbox"
                                checked={localSettings.sealShowDate ?? true}
                                onChange={(e) => setLocalSettings(p => ({ ...p, sealShowDate: e.target.checked }))}
                                className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                              />
                            </label>

                            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs font-black text-slate-700">
                              <span>টেক্সচার স্টাইল</span>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => setLocalSettings(p => ({ ...p, sealTexture: 'clean' }))}
                                  className={`px-2 py-0.5 text-[10px] font-black rounded border cursor-pointer ${
                                    (localSettings.sealTexture || 'clean') === 'clean'
                                      ? 'bg-blue-600 text-white border-blue-800'
                                      : 'bg-slate-100 text-slate-700 border-slate-300'
                                  }`}
                                >
                                  ক্লিন
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setLocalSettings(p => ({ ...p, sealTexture: 'ink-stamp' }))}
                                  className={`px-2 py-0.5 text-[10px] font-black rounded border cursor-pointer ${
                                    localSettings.sealTexture === 'ink-stamp'
                                      ? 'bg-blue-600 text-white border-blue-800'
                                      : 'bg-slate-100 text-slate-700 border-slate-300'
                                  }`}
                                >
                                  ইনক স্ট্যাম্প
                                </button>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Hierarchy Specs Info Pill */}
                        <div className="bg-blue-50/70 border border-blue-200 p-2.5 rounded-xl text-[10.5px] text-slate-700 space-y-1">
                          <div className="font-black text-blue-900 flex items-center gap-1">
                            <Award size={13} className="text-amber-600" />
                            অফিসিয়াল সিলমোহর হায়ারার্কি ও কমপ্যাক্ট ইন্টিগ্রেশন:
                          </div>
                          <p className="text-[10px] leading-relaxed text-slate-600">
                            • <strong>আউটার টপ রিং:</strong> RITTIKA EVENT MANAGEMENT <br />
                            • <strong>আউটার বটম রিং:</strong> BHERAMARA, KUSHTIA, BANGLADESH <br />
                            • <strong>সেন্টার ট্রান্সপারেন্ট লোগো:</strong> ✦ লেখার ব্যাকগ্রাউন্ডে ট্রান্সপারেন্ট ওয়াটারমার্ক ও রাজকীয় মুকুট চিহ্ন ✦ <br />
                            • <strong>মূল লেখা বিন্যাস:</strong> EVENT PLANNER &amp; EVENT SERVICES • ELEVATING EVERY MOMENT <br />
                            • <strong>ভেরিফিকেশন বার:</strong> ISSUED • 30 AUG 2026 • SERVICE • QUALITY • TRUST
                          </p>
                        </div>

                      </div>

                      {/* Right: Live Realistic Preview Box & Download (5 cols) */}
                      <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-white border-2 border-slate-300 rounded-2xl shadow-inner space-y-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Eye size={12} />
                          লাইভ প্রিভিউ (High Precision Vector)
                        </span>

                        <div className="p-3 bg-slate-50/60 rounded-2xl border border-slate-200/80 flex items-center justify-center min-h-[190px] w-full">
                          <CompanyOfficialSeal 
                            id="preview-official-modal-seal"
                            colorTheme={localSettings.sealColorTheme}
                            size="lg"
                            rotation={localSettings.sealRotation}
                            showDate={localSettings.sealShowDate ?? true}
                            texture={localSettings.sealTexture || 'clean'}
                          />
                        </div>

                        {/* Download Seal Button */}
                        <button
                          type="button"
                          onClick={() => downloadSealAsPNG('preview-official-modal-seal', `Rittika_Official_Seal_${localSettings.sealColorTheme}.png`, 1400)}
                          className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs uppercase flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
                          title="হাই-রেজ্যুলেশন স্বচ্ছ পিএনজি সিলমোহর ডাউনলোড করুন"
                        >
                          <Download size={14} className="text-amber-400" />
                          সিলমোহর ডাউনলোড (Transparent PNG)
                        </button>
                      </div>

                    </div>

                  </div>
                )}
              </div>

              {/* Section 2: Dynamic Status Rubber Stamp */}
              <div className="border-2 border-black rounded-xl p-4 bg-slate-50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stamp size={20} className="text-amber-700" />
                    <div>
                      <h4 className="text-sm font-black uppercase text-slate-900">
                        স্ট্যাটাস রবার স্ট্যাম্প (Selectable Status Stamp)
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        ফিক্সড, ফাইনাল, আনুমানিক, unpaid, paid ইত্যাদি সিলেক্টেবল সিলমোহর
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.showStatusStamp}
                      onChange={(e) => setLocalSettings(p => ({ ...p, showStatusStamp: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {localSettings.showStatusStamp && (
                  <div className="space-y-4 pt-3 border-t border-slate-200">
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">
                        স্ট্যাম্পের ধরণ নির্বাচন করুন (Select Stamp Type)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'final', label: 'ফাইনাল বিল (FINAL)', icon: '⚡' },
                          { id: 'fixed', label: 'ফিক্সড বাজেট (FIXED)', icon: '🔒' },
                          { id: 'estimate', label: 'আনুমানিক (ESTIMATE)', icon: '📋' },
                          { id: 'paid', label: 'পরিশোধিত (PAID)', icon: '✓' },
                          { id: 'unpaid', label: 'বকেয়া বিল (UNPAID)', icon: '⚠️' },
                          { id: 'advance', label: 'অগ্রিম প্রাপ্তি (ADVANCE)', icon: '💵' },
                          { id: 'approved', label: 'অনুমোদিত (APPROVED)', icon: '★' },
                          { id: 'original', label: 'মূল কপি (ORIGINAL)', icon: '📄' },
                          { id: 'confidential', label: 'গোপনীয় (CONFIDENTIAL)', icon: '🔒' }
                        ].map(st => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setLocalSettings(p => ({ ...p, statusStampType: st.id as any }))}
                            className={`p-2 border-2 rounded-xl text-left text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                              localSettings.statusStampType === st.id 
                                ? 'bg-amber-300 border-black shadow-[2px_2px_0px_0px_#000000]' 
                                : 'bg-white border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            <span>{st.icon}</span>
                            <span className="truncate">{st.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-center p-3 bg-white border border-slate-300 rounded-xl">
                      <StatusRubberStamp
                        type={localSettings.statusStampType}
                        colorTheme={localSettings.statusStampColorTheme}
                        size="md"
                        rotation={localSettings.statusStampRotation}
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-100 p-4 border-t-3 border-black flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-black uppercase text-slate-700 bg-white border-2 border-black rounded-xl hover:bg-slate-50 transition cursor-pointer shadow-[2px_2px_0px_0px_#000000]"
          >
            বাতিল
          </button>
          <button
            onClick={handleApplyAndSave}
            className="neo-btn px-6 py-2 text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 font-black uppercase flex items-center gap-1.5 shadow-[3px_3px_0px_0px_#000000]"
          >
            <Check size={16} className="stroke-[2.5]" />
            স্বাক্ষর ও সিলমোহর নিশ্চিত করুন (Apply & Save)
          </button>
        </div>

      </div>
    </div>
  );
}
