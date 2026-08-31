import React from 'react';

export type SealColorTheme = 'royal-blue' | 'luxury-gold' | 'deep-navy' | 'emerald' | 'ruby-red' | 'purple';

export type StatusStampType = 
  | 'fixed' 
  | 'final' 
  | 'estimate' 
  | 'unpaid' 
  | 'paid' 
  | 'approved' 
  | 'cancelled' 
  | 'confidential' 
  | 'advance' 
  | 'original';

export interface CompanyOfficialSealProps {
  companyNameEnglish?: string;
  location?: string;
  tagline?: string;
  date?: string;
  colorTheme?: SealColorTheme;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  rotation?: number;
  className?: string;
  showDate?: boolean;
  texture?: 'clean' | 'ink-stamp';
  logoUrl?: string;
  id?: string;
}

export const SEAL_COLOR_MAP: Record<SealColorTheme, {
  label: string;
  border: string;
  text: string;
  accent: string;
  bg: string;
  fill: string;
  badgeBg: string;
  badgeText: string;
  goldAccent: string;
  glow: string;
}> = {
  'royal-blue': {
    label: 'অফিসিয়াল রয়েল ব্লু',
    border: '#003399',
    text: '#002673',
    accent: '#0047b3',
    bg: 'rgba(0, 51, 153, 0.04)',
    fill: '#003399',
    badgeBg: '#001a4d',
    badgeText: '#ffffff',
    goldAccent: '#d4af37',
    glow: 'rgba(0, 51, 153, 0.2)'
  },
  'luxury-gold': {
    label: 'প্রিমিয়াম গোল্ডেন',
    border: '#c5a059',
    text: '#8c6d23',
    accent: '#d4af37',
    bg: 'rgba(197, 160, 89, 0.06)',
    fill: '#b38728',
    badgeBg: '#1a1508',
    badgeText: '#fdf6e2',
    goldAccent: '#ffd700',
    glow: 'rgba(197, 160, 89, 0.25)'
  },
  'deep-navy': {
    label: 'ডিপ নেভি ব্ল্যাক',
    border: '#0f172a',
    text: '#0f172a',
    accent: '#334155',
    bg: 'rgba(15, 23, 42, 0.04)',
    fill: '#1e293b',
    badgeBg: '#020617',
    badgeText: '#ffffff',
    goldAccent: '#94a3b8',
    glow: 'rgba(15, 23, 42, 0.2)'
  },
  'emerald': {
    label: 'রয়েল পান্না সবুজ',
    border: '#047857',
    text: '#065f46',
    accent: '#059669',
    bg: 'rgba(4, 120, 87, 0.04)',
    fill: '#047857',
    badgeBg: '#022c22',
    badgeText: '#ffffff',
    goldAccent: '#34d399',
    glow: 'rgba(4, 120, 87, 0.2)'
  },
  'ruby-red': {
    label: 'রয়েল রুবি লাল',
    border: '#b91c1c',
    text: '#991b1b',
    accent: '#dc2626',
    bg: 'rgba(185, 28, 28, 0.04)',
    fill: '#b91c1c',
    badgeBg: '#450a0a',
    badgeText: '#ffffff',
    goldAccent: '#f87171',
    glow: 'rgba(185, 28, 28, 0.2)'
  },
  'purple': {
    label: 'ইম্পেরিয়াল বেগুনি',
    border: '#6b21a8',
    text: '#581c87',
    accent: '#7e22ce',
    bg: 'rgba(107, 33, 168, 0.04)',
    fill: '#6b21a8',
    badgeBg: '#2e1065',
    badgeText: '#ffffff',
    goldAccent: '#c084fc',
    glow: 'rgba(107, 33, 168, 0.2)'
  }
};

const SEAL_SIZE_MAP = {
  sm: { px: 125, fontSizeTop: 8.8, fontSizeBottom: 7.8 },
  md: { px: 165, fontSizeTop: 9.8, fontSizeBottom: 8.8 },
  lg: { px: 205, fontSizeTop: 11.2, fontSizeBottom: 10 },
  xl: { px: 260, fontSizeTop: 13, fontSizeBottom: 11.5 }
};

/**
 * Format date string into "30 AUG 2026" standard format
 */
export function formatSealDate(dateStr?: string): string {
  if (!dateStr) return '30 AUG 2026';
  
  // If already contains alphabetic month like "30 AUG 2026"
  if (/[A-Za-z]/.test(dateStr)) {
    return dateStr.toUpperCase();
  }
  
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day < 10 ? '0' + day : day} ${month} ${year}`;
    }
  } catch (e) {
    // fallback
  }
  return dateStr.toUpperCase();
}

/**
 * 🌟 Sophisticated Luxury Corporate Official Seal (রিত্তিকা প্রিমিয়াম সিলমোহর)
 * Exact Hierarchy with Transparent Integrated Watermark & Compact Text:
 * - OUTER TOP RING: RITTIKA EVENT MANAGEMENT
 * - OUTER BOTTOM RING: BHERAMARA, KUSHTIA, BANGLADESH
 * - CENTER: ✦ [TRANSPARENT RITTIKA EVENT MANAGEMENT LOGO & WATERMARK INTERWOVEN WITH TEXT] ✦
 * - TEXT INTEGRATION:
 *   - ✦ CROWN INSIGNIA & ACCENTS ✦
 *   - EVENT PLANNER
 *   - &
 *   - EVENT SERVICES
 *   - ELEVATING EVERY MOMENT
 *   - ISSUED • 30 AUG 2026 (or dynamic invoice date)
 *   - SERVICE • QUALITY • TRUST
 */
export function CompanyOfficialSeal({
  companyNameEnglish = 'RITTIKA EVENT MANAGEMENT',
  location = 'BHERAMARA, KUSHTIA, BANGLADESH',
  tagline = 'ELEVATING EVERY MOMENT',
  date = '2026-08-30',
  colorTheme = 'royal-blue',
  size = 'md',
  rotation = -6,
  className = '',
  showDate = true,
  texture = 'clean',
  logoUrl = '/logo.png',
  id
}: CompanyOfficialSealProps) {
  const colors = SEAL_COLOR_MAP[colorTheme] || SEAL_COLOR_MAP['royal-blue'];
  const sizeConfig = SEAL_SIZE_MAP[size] || SEAL_SIZE_MAP.md;
  const dimension = sizeConfig.px;
  const rawId = React.useId().replace(/:/g, '');
  const uniqueId = id || `seal-${rawId}`;

  const formattedDate = formatSealDate(date);

  return (
    <div 
      className={`inline-block select-none transition-transform duration-300 ${className}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        filter: 'drop-shadow(0px 2px 5px rgba(0,0,0,0.12))'
      }}
      title={`${companyNameEnglish} - Official Corporate Seal`}
    >
      <svg
        id={uniqueId}
        width={dimension}
        height={dimension}
        viewBox="0 0 300 300"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
        style={{ color: colors.border }}
      >
        <defs>
          {/* Top text curved path (Radius = 120, Arc from 180° to 0°) */}
          <path
            id={`topArc-${uniqueId}`}
            d="M 30,150 A 120,120 0 1,1 270,150"
            fill="none"
          />
          {/* Bottom text curved path (Radius = 120, Arc from 0° to 180°) */}
          <path
            id={`bottomArc-${uniqueId}`}
            d="M 270,150 A 120,120 0 0,1 30,150"
            fill="none"
          />
          
          {/* Circular Clip for Central Transparent Logo Watermark */}
          <clipPath id={`logoClip-${uniqueId}`}>
            <circle cx="150" cy="150" r="92" />
          </clipPath>

          {/* Micro Guilloche Security Teeth Pattern */}
          <pattern id={`teeth-${uniqueId}`} width="6" height="6" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="6" y2="6" stroke={colors.border} strokeWidth="0.4" opacity="0.3" />
          </pattern>

          {/* Distressed Stamp Texture Pattern */}
          <pattern id={`grunge-${uniqueId}`} width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="0.6" fill={colors.border} opacity="0.4" />
            <circle cx="14" cy="11" r="0.8" fill={colors.border} opacity="0.35" />
            <circle cx="23" cy="20" r="0.5" fill={colors.border} opacity="0.4" />
            <circle cx="8" cy="24" r="0.7" fill={colors.border} opacity="0.3" />
          </pattern>
        </defs>

        {/* 1. Subtle Transparent Background Tint */}
        <circle cx="150" cy="150" r="146" fill={colors.bg} />

        {/* 2. Outermost Security Teeth / Beaded Rim (Radius 145) */}
        <circle
          cx="150"
          cy="150"
          r="145"
          fill="none"
          stroke={colors.border}
          strokeWidth="1.2"
          strokeDasharray="2,3"
          className="opacity-75"
        />

        {/* 3. Outer Solid Triple Concentric Rings */}
        <circle
          cx="150"
          cy="150"
          r="141"
          fill="none"
          stroke={colors.border}
          strokeWidth="3.2"
          className="opacity-95"
        />
        <circle
          cx="150"
          cy="150"
          r="135"
          fill="none"
          stroke={colors.border}
          strokeWidth="0.9"
          className="opacity-80"
        />
        <circle
          cx="150"
          cy="150"
          r="132"
          fill="none"
          stroke={colors.border}
          strokeWidth="0.5"
          strokeDasharray="1.5,1.5"
          className="opacity-60"
        />

        {/* 4. Middle Concentric Rings (Inner Boundary of Outer Text Ring, Radius 97-104) */}
        <circle
          cx="150"
          cy="150"
          r="104"
          fill="none"
          stroke={colors.border}
          strokeWidth="0.8"
          className="opacity-70"
        />
        <circle
          cx="150"
          cy="150"
          r="101"
          fill="none"
          stroke={colors.border}
          strokeWidth="2.2"
          className="opacity-95"
        />
        <circle
          cx="150"
          cy="150"
          r="97"
          fill="none"
          stroke={colors.border}
          strokeWidth="0.8"
          strokeDasharray="2.5,2"
          className="opacity-75"
        />

        {/* 5. Curved Top Text: RITTIKA EVENT MANAGEMENT */}
        <text
          fill={colors.text}
          fontSize="10.8"
          fontWeight="900"
          letterSpacing="2.6"
          className="uppercase font-sans"
          style={{ fontFamily: "'Plus Jakarta Sans', 'Cinzel', 'Montserrat', sans-serif" }}
        >
          <textPath href={`#topArc-${uniqueId}`} startOffset="50%" textAnchor="middle">
            ✦  {companyNameEnglish}  ✦
          </textPath>
        </text>

        {/* 6. Curved Bottom Text: BHERAMARA, KUSHTIA, BANGLADESH */}
        <text
          fill={colors.text}
          fontSize="8.6"
          fontWeight="800"
          letterSpacing="2.2"
          className="uppercase font-sans"
          style={{ fontFamily: "'Plus Jakarta Sans', 'Cinzel', 'Montserrat', sans-serif" }}
        >
          <textPath href={`#bottomArc-${uniqueId}`} startOffset="50%" textAnchor="middle">
            ★  {location}  ★
          </textPath>
        </text>

        {/* 7. Side Security Flanking Stars (At 9 o'clock & 3 o'clock) */}
        <g transform="translate(32, 150)">
          <path d="M 0,-4 L 1.2,-1.2 L 4,0 L 1.2,1.2 L 0,4 L -1.2,1.2 L -4,0 L -1.2,-1.2 Z" fill={colors.border} />
        </g>
        <g transform="translate(268, 150)">
          <path d="M 0,-4 L 1.2,-1.2 L 4,0 L 1.2,1.2 L 0,4 L -1.2,1.2 L -4,0 L -1.2,-1.2 Z" fill={colors.border} />
        </g>

        {/* 8. CENTER TRANSPARENT LOGO WATERMARK (Embedded Behind and Interwoven with Text) */}
        <g clipPath={`url(#logoClip-${uniqueId})`}>
          {/* Subtle Vector Guilloche Sunburst Behind Core */}
          <circle cx="150" cy="150" r="88" fill="none" stroke={colors.border} strokeWidth="0.4" strokeDasharray="3,3" opacity="0.35" />
          
          {/* Transparent Watermark Logo Image */}
          <image
            href={logoUrl}
            x="85"
            y="85"
            width="130"
            height="130"
            opacity="0.18"
            preserveAspectRatio="xMidYMid slice"
            style={{ mixBlendMode: 'multiply' }}
            onError={(e) => {
              (e.currentTarget as SVGElement).style.display = 'none';
            }}
          />

          {/* Central Monogram Silhouette Watermark (Crisp Vector) */}
          <g transform="translate(150, 146)" opacity="0.15" textAnchor="middle">
            <path
              d="M -30,-18 L -18,6 L 0,-24 L 18,6 L 30,-18 L 24,18 L -24,18 Z"
              fill={colors.goldAccent}
            />
          </g>
        </g>

        {/* 9. HARMONIOUS INTERWOVEN CENTRAL TEXT & BRAND EMBLEM (Takes Less Space, High Contrast & Compact) */}
        <g textAnchor="middle">
          
          {/* Top Insignia Crown & Flanking Stars (At y=106) */}
          <g transform="translate(150, 106)">
            {/* Flanking Micro Stars */}
            <path d="M -32,0 L -30.5,-1.5 L -29,0 L -30.5,1.5 Z" fill={colors.accent} />
            <path d="M 32,0 L 30.5,-1.5 L 29,0 L 30.5,1.5 Z" fill={colors.accent} />
            <line x1="-25" y1="0" x2="-14" y2="0" stroke={colors.accent} strokeWidth="0.8" opacity="0.7" />
            <line x1="14" y1="0" x2="25" y2="0" stroke={colors.accent} strokeWidth="0.8" opacity="0.7" />
            
            {/* Crown / Star Medallion Center */}
            <path
              d="M -9,-3 L -5.5,2.5 L 0,-5.5 L 5.5,2.5 L 9,-3 L 7,4.5 L -7,4.5 Z"
              fill={colors.accent}
            />
            <circle cx="0" cy="-6" r="1" fill={colors.goldAccent} />
          </g>

          {/* ✦ EVENT PLANNER ✦ (y=122) */}
          <text
            x="150"
            y="122"
            fill={colors.text}
            fontSize="9.8"
            fontWeight="900"
            letterSpacing="2.8"
            className="uppercase font-sans"
            style={{ fontFamily: "'Cinzel', 'Plus Jakarta Sans', 'Montserrat', sans-serif" }}
          >
            EVENT PLANNER
          </text>

          {/* & with luxury delicate horizontal dividers (y=134) */}
          <g>
            <line x1="102" y1="131" x2="136" y2="131" stroke={colors.border} strokeWidth="0.9" opacity="0.8" />
            <text
              x="150"
              y="134.5"
              fill={colors.accent}
              fontSize="9"
              fontWeight="800"
              className="font-serif italic"
            >
              &amp;
            </text>
            <line x1="164" y1="131" x2="198" y2="131" stroke={colors.border} strokeWidth="0.9" opacity="0.8" />
          </g>

          {/* ✦ EVENT SERVICES ✦ (y=148) */}
          <text
            x="150"
            y="148"
            fill={colors.text}
            fontSize="9.8"
            fontWeight="900"
            letterSpacing="2.8"
            className="uppercase font-sans"
            style={{ fontFamily: "'Cinzel', 'Plus Jakarta Sans', 'Montserrat', sans-serif" }}
          >
            EVENT SERVICES
          </text>

          {/* ✦ ELEVATING EVERY MOMENT ✦ (y=161) */}
          <text
            x="150"
            y="161"
            fill={colors.accent}
            fontSize="7.2"
            fontWeight="800"
            letterSpacing="2.5"
            className="uppercase font-sans"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Cinzel', sans-serif" }}
          >
            {tagline}
          </text>

          {/* 10. LOWER INNER SECTION: ISSUED • 30 AUG 2026 (y=171 to 187) */}
          {showDate && (
            <g transform="translate(0, 171)">
              {/* Refined Security Date Pill Box */}
              <rect
                x="80"
                y="0"
                width="140"
                height="16.5"
                rx="3.5"
                fill={colors.fill}
                stroke={colors.border}
                strokeWidth="1.2"
                opacity="0.96"
              />
              <text
                x="150"
                y="11.5"
                fill="#ffffff"
                fontSize="7.8"
                fontWeight="900"
                letterSpacing="1.4"
                className="uppercase font-mono"
              >
                ISSUED • {formattedDate}
              </text>
            </g>
          )}

          {/* 11. BOTTOM / OUTER INNER SECTION: SERVICE • QUALITY • TRUST (y=202) */}
          <g transform="translate(0, 202)">
            <text
              x="150"
              y="0"
              fill={colors.text}
              fontSize="7.5"
              fontWeight="900"
              letterSpacing="2.2"
              className="uppercase font-sans"
              style={{ fontFamily: "'Cinzel', 'Plus Jakarta Sans', sans-serif" }}
            >
              SERVICE • QUALITY • TRUST
            </text>
            <line x1="86" y1="4.5" x2="214" y2="4.5" stroke={colors.border} strokeWidth="0.6" strokeDasharray="2,2" opacity="0.6" />
          </g>

        </g>

        {/* 12. Realistic Distressed Grunge Ink Texture (If ink-stamp mode enabled) */}
        {texture === 'ink-stamp' && (
          <circle cx="150" cy="150" r="145" fill={`url(#grunge-${uniqueId})`} pointerEvents="none" />
        )}
      </svg>
    </div>
  );
}

interface StatusRubberStampProps {
  type: StatusStampType;
  colorTheme?: SealColorTheme;
  customText?: string;
  customSubText?: string;
  date?: string;
  rotation?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showDate?: boolean;
}

const STATUS_CONFIGS: Record<StatusStampType, {
  title: string;
  subtitle: string;
  bengali: string;
  defaultColor: SealColorTheme;
  icon: string;
}> = {
  'fixed': {
    title: 'FIXED CONTRACT',
    subtitle: 'FINAL & NON-NEGOTIABLE',
    bengali: 'নির্ধারিত ফিক্সড চুক্তি',
    defaultColor: 'royal-blue',
    icon: '🔒'
  },
  'final': {
    title: 'FINAL INVOICE',
    subtitle: 'COMPLETION SETTLEMENT',
    bengali: 'চূড়ান্ত নিষ্পত্তিকৃত বিল',
    defaultColor: 'royal-blue',
    icon: '⚡'
  },
  'estimate': {
    title: 'ESTIMATED BUDGET',
    subtitle: 'PROVISIONAL QUOTATION',
    bengali: 'আনুমানিক বাজেট প্রস্তাবনা',
    defaultColor: 'royal-blue',
    icon: '📋'
  },
  'unpaid': {
    title: 'UNPAID / DUE',
    subtitle: 'PAYMENT OUTSTANDING',
    bengali: 'অপরিশোধিত বকেয়া বিল',
    defaultColor: 'ruby-red',
    icon: '⚠️'
  },
  'paid': {
    title: 'PAID IN FULL',
    subtitle: 'PAYMENT RECEIVED & VERIFIED',
    bengali: 'সম্পূর্ণ পরিশোধিত রসিদ',
    defaultColor: 'emerald',
    icon: '✓'
  },
  'approved': {
    title: 'APPROVED',
    subtitle: 'AUTHORIZED BY MANAGEMENT',
    bengali: 'অনুমোদিত ও অনুমোদিত চুক্তি',
    defaultColor: 'royal-blue',
    icon: '★'
  },
  'cancelled': {
    title: 'CANCELLED',
    subtitle: 'VOID & INOPERATIVE',
    bengali: 'বাতিলকৃত ইনভয়েস',
    defaultColor: 'ruby-red',
    icon: '✕'
  },
  'confidential': {
    title: 'CONFIDENTIAL',
    subtitle: 'INTERNAL CLIENT RECORD',
    bengali: 'গোপনীয় অফিসিয়াল দলিল',
    defaultColor: 'ruby-red',
    icon: '🔒'
  },
  'advance': {
    title: 'ADVANCE RECEIVED',
    subtitle: 'BOOKING DEPOSIT ADJUSTED',
    bengali: 'অগ্রিম গ্রহণ ও সমন্বয়',
    defaultColor: 'purple',
    icon: '💵'
  },
  'original': {
    title: 'ORIGINAL COPY',
    subtitle: 'AUTHENTICATED RECORD',
    bengali: 'অফিসিয়াল মূল কপি',
    defaultColor: 'deep-navy',
    icon: '★'
  }
};

/**
 * 🌟 Dynamic Selectable Status Rubber Stamp (স্ট্যাটাস সিলমোহর)
 */
export function StatusRubberStamp({
  type,
  colorTheme,
  customText,
  customSubText,
  date,
  rotation = -12,
  size = 'md',
  className = '',
  showDate = true
}: StatusRubberStampProps) {
  const config = STATUS_CONFIGS[type] || STATUS_CONFIGS['final'];
  const activeColor = colorTheme || config.defaultColor;
  const colors = SEAL_COLOR_MAP[activeColor] || SEAL_COLOR_MAP['royal-blue'];

  const title = customText || config.title;
  const subtitle = customSubText || config.bengali;
  const displayDate = formatSealDate(date);

  const scaleClasses = {
    sm: 'px-3 py-1.5 min-w-[130px]',
    md: 'px-4 py-2 min-w-[170px]',
    lg: 'px-5 py-2.5 min-w-[210px]'
  }[size];

  const titleSizeClasses = {
    sm: 'text-[11px] tracking-wider',
    md: 'text-[14px] tracking-widest',
    lg: 'text-[17px] tracking-widest'
  }[size];

  const subSizeClasses = {
    sm: 'text-[7.5px]',
    md: 'text-[9px]',
    lg: 'text-[10.5px]'
  }[size];

  return (
    <div
      className={`inline-block select-none pointer-events-none transition-transform duration-300 ${className}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.18))'
      }}
    >
      <div 
        className={`border-[3px] border-double rounded-md text-center relative overflow-hidden backdrop-blur-xs ${scaleClasses}`}
        style={{
          borderColor: colors.border,
          color: colors.text,
          backgroundColor: colors.bg
        }}
      >
        {/* Subtle Distressed Corner Dots */}
        <div className="absolute top-0.5 left-0.5 text-[7px] font-mono opacity-60">★</div>
        <div className="absolute top-0.5 right-0.5 text-[7px] font-mono opacity-60">★</div>
        <div className="absolute bottom-0.5 left-0.5 text-[7px] font-mono opacity-60">★</div>
        <div className="absolute bottom-0.5 right-0.5 text-[7px] font-mono opacity-60">★</div>

        {/* Main Stamp Title */}
        <div className="border-b-[1.5px] pb-0.5 mx-1" style={{ borderColor: colors.border }}>
          <span className={`font-black uppercase block leading-none font-sans ${titleSizeClasses}`}>
            {title}
          </span>
        </div>

        {/* Bengali / Secondary Sub-text */}
        <div className="pt-0.5">
          <span className={`font-black uppercase block tracking-tight leading-tight ${subSizeClasses}`}>
            {subtitle}
          </span>
          {showDate && (
            <span className="text-[7.5px] font-bold font-mono tracking-wider block opacity-90 mt-0.5">
              DATE: {displayDate}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 🌟 Helper function to download seal as high-resolution PNG image
 */
export async function downloadSealAsPNG(svgElementId: string, fileName = 'Rittika_Official_Seal.png', targetSize = 1200): Promise<void> {
  const svgElement = document.getElementById(svgElementId);
  if (!svgElement) {
    console.error('SVG Element not found for seal download:', svgElementId);
    return;
  }

  try {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const urlObj = window.URL || (window as any).webkitURL;
    const blobURL = urlObj.createObjectURL(svgBlob);
    
    const image = new Image();
    image.crossOrigin = 'anonymous';
    
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, targetSize, targetSize);
        ctx.drawImage(image, 0, 0, targetSize, targetSize);
        
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      urlObj.revokeObjectURL(blobURL);
    };

    image.src = blobURL;
  } catch (err) {
    console.error('Error exporting seal PNG:', err);
  }
}

