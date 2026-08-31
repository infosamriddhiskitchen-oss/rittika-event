import jsPDF from 'jspdf';
import { GalleryMediaItem } from '../components/ImageGalleryLightbox';
import { toBengaliNumber, formatCurrency } from '../utils';

export interface VideoExportOptions {
  secondsPerSlide?: number;
  transitionEffect?: 'kenburns' | 'fade' | 'zoom';
  companyName?: string;
  onProgress?: (percent: number, statusText: string) => void;
}

export interface VideoExportResult {
  blob: Blob;
  url: string;
  fileName: string;
}

/**
 * 🌟 Helper to flatten multi-photo portfolio items into sequential individual photo slides
 * preserving their individual specific title, individual budget, and individual description!
 */
export function expandMediaItemsToPhotoSlides(items: GalleryMediaItem[]): GalleryMediaItem[] {
  const expanded: GalleryMediaItem[] = [];

  items.forEach((item, itemIdx) => {
    // If rich photoDetails exist
    if (item.photoDetails && item.photoDetails.length > 0) {
      item.photoDetails.forEach((photo, pIdx) => {
        expanded.push({
          id: `${item.id || itemIdx}-photo-${pIdx}`,
          title: photo.title || `${item.title} (ছবি ${toBengaliNumber(pIdx + 1)})`,
          category: item.category,
          url: photo.url,
          images: item.images,
          date: item.date,
          eventName: item.eventName,
          customerName: item.customerName,
          description: photo.description || item.description,
          estimatedCost: photo.estimatedCost !== undefined ? photo.estimatedCost : (pIdx === 0 ? item.estimatedCost : undefined),
          highlightTags: photo.highlightTags || item.highlightTags,
          colorPalette: item.colorPalette
        });
      });
    } else if (item.images && item.images.length > 1) {
      // If legacy images array exist
      item.images.forEach((imgUrl, pIdx) => {
        expanded.push({
          id: `${item.id || itemIdx}-img-${pIdx}`,
          title: `${item.title} (ছবি ${toBengaliNumber(pIdx + 1)})`,
          category: item.category,
          url: imgUrl,
          images: item.images,
          date: item.date,
          eventName: item.eventName,
          customerName: item.customerName,
          description: item.description,
          estimatedCost: pIdx === 0 ? item.estimatedCost : undefined,
          highlightTags: item.highlightTags,
          colorPalette: item.colorPalette
        });
      });
    } else {
      expanded.push(item);
    }
  });

  return expanded.length > 0 ? expanded : items;
}

/**
 * 🎬 1-Click Cinematic Presentation Video Exporter (.webm / .mp4)
 * Generates an HD video file with smooth Ken Burns zoom-in/zoom-out, cross-fades, 
 * lower-third typography, and musical chimes rendered client-side via Canvas + MediaRecorder.
 */
export async function exportPresentationToVideo(
  rawItems: GalleryMediaItem[],
  options: VideoExportOptions = {}
): Promise<VideoExportResult> {
  const {
    secondsPerSlide = 4,
    companyName = 'রিত্তিকা ইভেন্ট ম্যানেজমেন্ট',
    onProgress
  } = options;

  const items = expandMediaItemsToPhotoSlides(rawItems);

  if (!items || items.length === 0) {
    throw new Error('কোনো ছবি পাওয়া যায়নি।');
  }

  onProgress?.(5, 'ছবিগুলো লোড ও প্রসেসিং করা হচ্ছে...');

  // Safe Bulletproof Image Preloading (Preventing Canvas Tainting and CORS failures)
  const loadedImages: HTMLImageElement[] = await Promise.all(
    items.map(async (item) => {
      const createFallbackImg = () => {
        const fallback = new Image();
        fallback.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="50%" stop-color="%231e1b4b"/><stop offset="100%" stop-color="%23020617"/></linearGradient></defs><rect width="1280" height="720" fill="url(%23g)"/><circle cx="640" cy="300" r="120" fill="%23facc15" opacity="0.15"/><text x="50%" y="45%" fill="%23facc15" font-size="34" font-family="sans-serif" font-weight="bold" text-anchor="middle">${encodeURIComponent(item.title || 'ইভেন্ট ডেকোরেশন')}</text><text x="50%" y="54%" fill="%2394a3b8" font-size="20" font-family="sans-serif" text-anchor="middle">${encodeURIComponent(companyName)}</text><text x="50%" y="62%" fill="%2310b981" font-size="22" font-family="sans-serif" font-weight="bold" text-anchor="middle">${encodeURIComponent(item.estimatedCost ? `বাজেট: ৳ ${item.estimatedCost.toLocaleString('en-IN')}` : '')}</text></svg>`;
        return fallback;
      };

      if (!item.url) return createFallbackImg();

      // If dataUrl, load directly
      if (item.url.startsWith('data:')) {
        return new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(createFallbackImg());
          img.src = item.url;
        });
      }

      // If HTTP/HTTPS URL, try fetching as blob first to guarantee safe canvas drawing
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(item.url, { mode: 'cors', signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          return new Promise<HTMLImageElement>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(createFallbackImg());
            img.src = blobUrl;
          });
        }
      } catch (err) {
        // Fetch failed (CORS or network), fallback to crossOrigin anonymous img
      }

      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        let resolved = false;
        const timer = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve(createFallbackImg());
          }
        }, 4000);

        img.onload = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            resolve(img);
          }
        };
        img.onerror = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            resolve(createFallbackImg());
          }
        };
        img.src = item.url;
      });
    })
  );

  onProgress?.(15, 'সিনেমাটিক ভিডিও রেন্ডারার ইঞ্জিন প্রস্তুত হচ্ছে...');

  // Setup HD Canvas (1280x720 16:9 for optimal rendering speed and sharp quality)
  const width = 1280;
  const height = 720;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  const fps = 30;
  const canvasStream = canvas.captureStream(fps);

  let combinedStream: MediaStream = canvasStream;
  let audioContext: AudioContext | null = null;
  let audioDestination: MediaStreamAudioDestinationNode | null = null;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioContext = new AudioCtx();
      audioDestination = audioContext.createMediaStreamDestination();
      const tracks = [...canvasStream.getVideoTracks(), ...audioDestination.stream.getAudioTracks()];
      combinedStream = new MediaStream(tracks);
    }
  } catch (e) {
    console.log('Audio stream setup skipped, using video-only stream:', e);
    combinedStream = canvasStream;
  }

  // Determine optimal MIME type
  const possibleTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm;codecs=h264',
    'video/webm',
    'video/mp4;codecs=avc1',
    'video/mp4'
  ];

  let selectedMimeType = '';
  for (const type of possibleTypes) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      selectedMimeType = type;
      break;
    }
  }

  const recordedChunks: Blob[] = [];
  let recorder: MediaRecorder;
  try {
    recorder = new MediaRecorder(combinedStream, {
      mimeType: selectedMimeType || undefined,
      videoBitsPerSecond: 3000000 // 3 Mbps
    });
  } catch (e) {
    // Fallback without audio stream if combined stream failed
    recorder = new MediaRecorder(canvasStream, {
      videoBitsPerSecond: 2500000
    });
  }

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  // Helper to play celebration chime in audio stream
  const playSlideChime = (slideIdx: number) => {
    if (!audioContext || !audioDestination) return;
    try {
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const baseNote = notes[slideIdx % notes.length];
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.value = baseNote;
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.03, audioContext.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1.1);
      osc.connect(gain);
      gain.connect(audioDestination);
      osc.start();
      osc.stop(audioContext.currentTime + 1.2);
    } catch (e) {}
  };

  // Start with timeslice to ensure continuous data gathering
  recorder.start(500);

  const totalSlides = items.length;
  const framesPerSlide = Math.round(secondsPerSlide * fps);
  const transitionFrames = Math.round(0.7 * fps);

  // Helper to render frame
  const renderFrame = (
    imgCurrent: HTMLImageElement,
    itemCurrent: GalleryMediaItem,
    progress: number,
    slideIdx: number,
    imgNext?: HTMLImageElement,
    itemNext?: GalleryMediaItem,
    transitionAlpha: number = 0
  ) => {
    // 1. Dark Luxurious Backdrop
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Current Image with Cinematic Ken Burns
    const drawKenBurns = (img: HTMLImageElement, prog: number, isZoomIn: boolean, alpha = 1) => {
      try {
        ctx.save();
        ctx.globalAlpha = alpha;

        const scale = isZoomIn ? 1.0 + prog * 0.12 : 1.12 - prog * 0.12;
        const panX = isZoomIn ? (prog - 0.5) * 24 : (0.5 - prog) * 24;
        const panY = (prog - 0.5) * 16;

        const imgAspect = (img.naturalWidth || 1280) / (img.naturalHeight || 720);
        const canvasAspect = width / height;

        let drawW, drawH;
        if (imgAspect > canvasAspect) {
          drawH = height * scale;
          drawW = drawH * imgAspect;
        } else {
          drawW = width * scale;
          drawH = drawW / imgAspect;
        }

        const drawX = (width - drawW) / 2 + panX;
        const drawY = (height - drawH) / 2 + panY;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();
      } catch (err) {
        ctx.restore();
      }
    };

    const isZoomIn = slideIdx % 2 === 0;
    drawKenBurns(imgCurrent, progress, isZoomIn, 1 - transitionAlpha);

    if (imgNext && transitionAlpha > 0) {
      const isNextZoomIn = (slideIdx + 1) % 2 === 0;
      drawKenBurns(imgNext, transitionAlpha * 0.2, isNextZoomIn, transitionAlpha);
    }

    // 3. Cinematic Vignette & Bottom Gradient Shadow
    const grad = ctx.createLinearGradient(0, height - 250, 0, height);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.75)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, height - 250, width, 250);

    // Top Header Banner
    const topGrad = ctx.createLinearGradient(0, 0, 0, 90);
    topGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, width, 90);

    // Top Left: Company Branding
    ctx.fillStyle = '#facc15'; // Gold
    ctx.font = 'bold 20px "Noto Sans Bengali", "Segoe UI", sans-serif';
    ctx.fillText(companyName.toUpperCase(), 35, 40);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.fillText('EXCLUSIVE PROJECT PRESENTATION & SHOWCASE', 35, 60);

    // Top Right: Slide Counter
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(width - 150, 20, 115, 34);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(width - 150, 20, 115, 34);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px "Noto Sans Bengali", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`স্লাইড ${toBengaliNumber(slideIdx + 1)} / ${toBengaliNumber(totalSlides)}`, width - 92, 42);
    ctx.textAlign = 'left';

    // 4. Lower-Third Info Overlay
    const activeItem = transitionAlpha > 0.5 && itemNext ? itemNext : itemCurrent;
    const cardY = height - 150;

    // Golden Accent Bar
    ctx.fillStyle = '#facc15';
    ctx.fillRect(35, cardY, 6, 90);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px "Noto Sans Bengali", "Segoe UI", sans-serif';
    const displayTitle = activeItem.title.length > 55 ? activeItem.title.slice(0, 55) + '...' : activeItem.title;
    ctx.fillText(displayTitle, 55, cardY + 28);

    // Category Pill & Cost
    let currX = 55;
    if (activeItem.category) {
      ctx.fillStyle = '#facc15';
      const catText = activeItem.category.toUpperCase();
      ctx.font = 'bold 12px "Noto Sans Bengali", "Segoe UI", sans-serif';
      const catWidth = ctx.measureText(catText).width + 16;
      ctx.fillRect(currX, cardY + 42, catWidth, 24);

      ctx.fillStyle = '#000000';
      ctx.fillText(catText, currX + 8, cardY + 58);
      currX += catWidth + 15;
    }

    if (activeItem.estimatedCost) {
      ctx.fillStyle = '#10b981'; // Emerald
      const costText = `বাজেট: ৳ ${activeItem.estimatedCost.toLocaleString('en-IN')}`;
      ctx.font = 'bold 14px "Noto Sans Bengali", "Segoe UI", sans-serif';
      ctx.fillText(costText, currX, cardY + 58);
    }

    // Subtitle / Details
    if (activeItem.description) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px "Noto Sans Bengali", "Segoe UI", sans-serif';
      const shortDesc = activeItem.description.length > 80 ? activeItem.description.slice(0, 80) + '...' : activeItem.description;
      ctx.fillText(shortDesc, 55, cardY + 86);
    } else if (activeItem.highlightTags && activeItem.highlightTags.length > 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px "Noto Sans Bengali", "Segoe UI", sans-serif';
      ctx.fillText(`✨ ${activeItem.highlightTags.join(' • ')}`, 55, cardY + 86);
    }

    // 5. Bottom Real-time Video Progress Line
    const overallProgress = (slideIdx + progress) / totalSlides;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(0, height - 4, width, 4);

    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, height - 4, width * overallProgress, 4);
  };

  // Run render loop frame by frame
  for (let s = 0; s < totalSlides; s++) {
    const currentImg = loadedImages[s];
    const currentItem = items[s];
    const nextImg = loadedImages[(s + 1) % totalSlides];
    const nextItem = items[(s + 1) % totalSlides];

    playSlideChime(s);

    for (let f = 0; f < framesPerSlide; f++) {
      const slideProgress = f / framesPerSlide;
      const isTransitioning = f >= framesPerSlide - transitionFrames && totalSlides > 1;
      const transitionAlpha = isTransitioning ? (f - (framesPerSlide - transitionFrames)) / transitionFrames : 0;

      renderFrame(
        currentImg,
        currentItem,
        slideProgress,
        s,
        totalSlides > 1 ? nextImg : undefined,
        totalSlides > 1 ? nextItem : undefined,
        transitionAlpha
      );

      const currentOverallPct = Math.round(20 + ((s * framesPerSlide + f) / (totalSlides * framesPerSlide)) * 75);
      onProgress?.(
        currentOverallPct,
        `সিনেমাটিক ভিডিও তৈরি হচ্ছে (স্লাইড ${toBengaliNumber(s + 1)}/${toBengaliNumber(totalSlides)}) - ${toBengaliNumber(currentOverallPct)}%`
      );

      await new Promise((r) => setTimeout(r, 1000 / fps));
    }
  }

  onProgress?.(96, 'ভিডিও ফাইল কম্প্রেশন ও ডাউনলোডের প্রস্তুতি সম্পন্ন হচ্ছে...');

  // Finish Recording
  return new Promise<VideoExportResult>((resolve, reject) => {
    recorder.onstop = () => {
      onProgress?.(100, 'ভিডিও ফাইল প্রস্তুত!');
      const ext = (selectedMimeType && selectedMimeType.includes('mp4')) ? 'mp4' : 'webm';
      const blob = new Blob(recordedChunks, { type: selectedMimeType || 'video/webm' });
      const fileName = `Rittika_Event_Video_${new Date().toISOString().split('T')[0]}.${ext}`;
      const url = URL.createObjectURL(blob);

      // Trigger automatic browser download
      try {
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // Delay revoke to avoid interrupting ongoing download stream
        setTimeout(() => URL.revokeObjectURL(url), 120000);
      } catch (err) {
        console.warn('Auto download error, url remains valid:', err);
      }

      resolve({ blob, url, fileName });
    };

    recorder.onerror = (e) => {
      reject(e);
    };

    if (recorder.state === 'recording') {
      recorder.requestData();
    }
    recorder.stop();
    audioContext?.close().catch(() => {});
  });
}

/**
 * 📄 1-Click Bengali PDF Presentation & Brochure Exporter
 * Renders high-definition presentation slides via HTML5 Canvas 2D with native Bengali Unicode fonts
 * and exports to a crisp, print-ready PDF document.
 */
export async function exportPresentationToPDF(
  rawItems: GalleryMediaItem[],
  selectedCategories: string[] = [],
  companyName: string = 'রিত্তিকা ইভেন্ট ম্যানেজমেন্ট'
) {
  const items = expandMediaItemsToPhotoSlides(rawItems);

  if (!items || items.length === 0) {
    alert('কোনো ছবি বা ইভেন্ট আইটেম পাওয়া যায়নি।');
    return;
  }

  // Pre-load all images as HTMLImageElements
  const loadedImages: HTMLImageElement[] = await Promise.all(
    items.map((item) => {
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => {
          const fallback = new Image();
          fallback.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" fill="%231e293b"><rect width="800" height="600" fill="%231e293b"/><text x="50%" y="50%" fill="%23facc15" font-size="24" font-family="sans-serif" font-weight="bold" text-anchor="middle">${encodeURIComponent(item.title || 'ইভেন্ট ছবি')}</text></svg>`;
          fallback.onload = () => resolve(fallback);
        };
        img.src = item.url;
      });
    })
  );

  // Setup A4 Landscape PDF Document
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Canvas Resolution (1920x1080 16:9 for ultra-crisp high-DPI rendering)
  const canvasW = 1920;
  const canvasH = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  const fontBengali = '"Noto Sans Bengali", "Hind Siliguri", "Segoe UI", Roboto, sans-serif';

  // Helper to wrap text into multiple lines on canvas
  const wrapText = (text: string, maxWidth: number, maxLines: number = 5): string[] => {
    if (!text) return [];
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
      const width = ctx.measureText(testLine).width;
      if (width < maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = words[i];
        if (lines.length >= maxLines - 1) {
          break;
        }
      }
    }
    if (currentLine && lines.length < maxLines) {
      lines.push(currentLine);
    }
    return lines;
  };

  // Helper to draw rounded rectangle on Canvas
  const drawRoundedRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number,
    fillColor?: string,
    strokeColor?: string,
    lineWidth: number = 1
  ) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }
    if (strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
    ctx.restore();
  };

  // 1. 🌟 RENDER COVER PAGE ON CANVAS
  ctx.clearRect(0, 0, canvasW, canvasH);

  // Background Royal Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, canvasW, canvasH);
  bgGrad.addColorStop(0, '#0f172a');
  bgGrad.addColorStop(0.35, '#1e1b4b');
  bgGrad.addColorStop(0.7, '#4c1d95');
  bgGrad.addColorStop(1, '#831843');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Decorative Golden Border Frame
  drawRoundedRect(50, 50, canvasW - 100, canvasH - 100, 24, undefined, '#facc15', 4);
  drawRoundedRect(65, 65, canvasW - 130, canvasH - 130, 16, undefined, 'rgba(250, 204, 21, 0.35)', 1.5);

  // Badge
  drawRoundedRect(canvasW / 2 - 120, 100, 240, 48, 24, 'rgba(250, 204, 21, 0.15)', '#facc15', 2);
  ctx.fillStyle = '#facc15';
  ctx.font = `bold 20px ${fontBengali}`;
  ctx.textAlign = 'center';
  ctx.fillText('✨ ROYAL EVENT CATALOG ✨', canvasW / 2, 132);

  // Main Bengali Title
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 56px ${fontBengali}`;
  ctx.fillText(companyName, canvasW / 2, 235);

  // Subtitle
  ctx.fillStyle = '#facc15';
  ctx.font = `bold 28px ${fontBengali}`;
  ctx.fillText('এক্সক্লুসিভ প্রজেক্ট ও ইভেন্ট ডিজাইন প্রেজেন্টেশন ব্রোশিউর', canvasW / 2, 290);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = `500 20px ${fontBengali}`;
  ctx.fillText('Exclusive Event Stage Design, Lighting & Floral Showcase', canvasW / 2, 330);

  // Center Presentation Details Card
  const cardW = 860;
  const cardH = 340;
  const cardX = (canvasW - cardW) / 2;
  const cardY = 380;
  drawRoundedRect(cardX, cardY, cardW, cardH, 20, 'rgba(15, 23, 42, 0.75)', 'rgba(250, 204, 21, 0.4)', 2);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#facc15';
  ctx.font = `bold 24px ${fontBengali}`;
  ctx.fillText('📋 প্রেজেন্টেশন সারসংক্ষেপ (Overview)', cardX + 40, cardY + 55);

  // Divider
  ctx.strokeStyle = 'rgba(250, 204, 21, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cardX + 40, cardY + 75);
  ctx.lineTo(cardX + cardW - 40, cardY + 75);
  ctx.stroke();

  // Category list
  const catSummary = selectedCategories.length > 0 ? selectedCategories.join(' • ') : 'সকল ক্যাটাগরির নির্বাচিত কাজ';
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold 20px ${fontBengali}`;
  ctx.fillText(`• অন্তর্ভুক্ত ক্যাটাগরি: `, cardX + 40, cardY + 125);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(catSummary, cardX + 240, cardY + 125);

  // Total Designs Count
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`• মোট প্রজেক্ট ডিজাইন: `, cardX + 40, cardY + 175);
  ctx.fillStyle = '#facc15';
  ctx.fillText(`${toBengaliNumber(items.length)} টি প্রিমিয়াম স্লাইড ও কনসেপ্ট`, cardX + 270, cardY + 175);

  // Date
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`• প্রস্তুতের তারিখ: `, cardX + 40, cardY + 225);
  ctx.fillStyle = '#a7f3d0';
  ctx.fillText(new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }), cardX + 200, cardY + 225);

  // Note
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`• উপস্থাপনা ধরণ: `, cardX + 40, cardY + 275);
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText('ক্লায়েন্ট কোটেশন ও কনসেপ্ট সিলেকশন গাইড বুক', cardX + 200, cardY + 275);

  // Bottom Footer on Cover
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = `600 18px ${fontBengali}`;
  ctx.fillText(`সার্বিক পরিচালনায়: ${companyName} • মোবাইল: 01721-779396`, canvasW / 2, canvasH - 100);

  // Add Cover Page to PDF
  const coverImgData = canvas.toDataURL('image/jpeg', 0.95);
  doc.addImage(coverImgData, 'JPEG', 0, 0, pageWidth, pageHeight);

  // 2. 🌟 RENDER INDIVIDUAL PRESENTATION SLIDES ON CANVAS
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const imgObj = loadedImages[i];

    doc.addPage();
    ctx.clearRect(0, 0, canvasW, canvasH);

    // Slide Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Top Header Banner
    const headerH = 100;
    const topGrad = ctx.createLinearGradient(0, 0, canvasW, 0);
    topGrad.addColorStop(0, '#0f172a');
    topGrad.addColorStop(0.5, '#1e1b4b');
    topGrad.addColorStop(1, '#3b0764');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, canvasW, headerH);

    // Gold accent line under header
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, headerH - 4, canvasW, 4);

    // Header Left: Brand Name
    ctx.textAlign = 'left';
    ctx.fillStyle = '#facc15';
    ctx.font = `bold 28px ${fontBengali}`;
    ctx.fillText(companyName, 60, 58);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = `600 16px ${fontBengali}`;
    ctx.fillText('EXCLUSIVE EVENT PORTFOLIO & CLIENT PRESENTATION', 60, 84);

    // Header Right: Slide Number Badge
    drawRoundedRect(canvasW - 280, 24, 220, 52, 26, 'rgba(255, 255, 255, 0.15)', '#facc15', 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 20px ${fontBengali}`;
    ctx.fillText(`স্লাইড নং: ${toBengaliNumber(i + 1)} / ${toBengaliNumber(items.length)}`, canvasW - 170, 57);

    // 🖼️ LEFT COLUMN: BIG HD IMAGE DISPLAY
    const imgBoxX = 60;
    const imgBoxY = 135;
    const imgBoxW = 980;
    const imgBoxH = 830;

    drawRoundedRect(imgBoxX, imgBoxY, imgBoxW, imgBoxH, 20, '#ffffff', '#cbd5e1', 2);

    if (imgObj && imgObj.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      const pad = 12;
      const innerX = imgBoxX + pad;
      const innerY = imgBoxY + pad;
      const innerW = imgBoxW - pad * 2;
      const innerH = imgBoxH - pad * 2;
      const rad = 16;
      ctx.moveTo(innerX + rad, innerY);
      ctx.lineTo(innerX + innerW - rad, innerY);
      ctx.quadraticCurveTo(innerX + innerW, innerY, innerX + innerW, innerY + rad);
      ctx.lineTo(innerX + innerW, innerY + innerH - rad);
      ctx.quadraticCurveTo(innerX + innerW, innerY + innerH, innerX + innerW - rad, innerY + innerH);
      ctx.lineTo(innerX + rad, innerY + innerH);
      ctx.quadraticCurveTo(innerX, innerY + innerH, innerX, innerY + innerH - rad);
      ctx.lineTo(innerX, innerY + rad);
      ctx.quadraticCurveTo(innerX, innerY, innerX + rad, innerY);
      ctx.closePath();
      ctx.clip();

      const imgAspect = imgObj.naturalWidth / imgObj.naturalHeight;
      const targetAspect = innerW / innerH;
      let drawW, drawH, drawX, drawY;

      if (imgAspect > targetAspect) {
        drawH = innerH;
        drawW = innerH * imgAspect;
        drawX = innerX + (innerW - drawW) / 2;
        drawY = innerY;
      } else {
        drawW = innerW;
        drawH = innerW / imgAspect;
        drawX = innerX;
        drawY = innerY + (innerH - drawH) / 2;
      }

      ctx.drawImage(imgObj, drawX, drawY, drawW, drawH);
      ctx.restore();
    }

    // 📝 RIGHT COLUMN: METADATA & BENGALI DETAILS
    const rightX = 1080;
    const rightW = canvasW - rightX - 60;
    let currY = 160;

    // 1. Category Pill
    if (item.category) {
      ctx.font = `bold 16px ${fontBengali}`;
      const catText = `ক্যাটাগরি: ${item.category}`;
      const catTextW = ctx.measureText(catText).width + 36;
      drawRoundedRect(rightX, currY, catTextW, 38, 19, '#fef3c7', '#f59e0b', 1.5);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#92400e';
      ctx.fillText(catText, rightX + 18, currY + 25);
      currY += 56;
    }

    // 2. Title (Bengali & Word Wrap)
    ctx.font = `900 36px ${fontBengali}`;
    ctx.fillStyle = '#0f172a';
    const titleLines = wrapText(item.title, rightW, 3);
    for (const line of titleLines) {
      ctx.fillText(line, rightX, currY + 28);
      currY += 46;
    }
    currY += 12;

    // 3. Estimated Budget Banner
    if (item.estimatedCost) {
      drawRoundedRect(rightX, currY, rightW, 64, 16, '#ecfdf5', '#10b981', 1.5);
      ctx.fillStyle = '#065f46';
      ctx.font = `bold 22px ${fontBengali}`;
      ctx.fillText('আনুমানিক বাজেট:', rightX + 24, currY + 40);

      ctx.fillStyle = '#047857';
      ctx.font = `900 26px ${fontBengali}`;
      const budgetStr = `৳ ${toBengaliNumber(item.estimatedCost.toLocaleString('en-IN'))} টাকা`;
      ctx.textAlign = 'right';
      ctx.fillText(budgetStr, rightX + rightW - 24, currY + 41);
      ctx.textAlign = 'left';

      currY += 82;
    }

    // 4. Key Meta Details Box
    drawRoundedRect(rightX, currY, rightW, 140, 16, '#ffffff', '#e2e8f0', 1.5);

    let metaY = currY + 34;
    ctx.font = `bold 18px ${fontBengali}`;
    ctx.fillStyle = '#475569';
    ctx.fillText('অনুষ্ঠান / ইভেন্ট:', rightX + 24, metaY);
    ctx.fillStyle = '#0f172a';
    ctx.font = `700 18px ${fontBengali}`;
    ctx.fillText(item.eventName || 'এক্সক্লুসিভ স্টেজ ডেকোরেশন', rightX + 160, metaY);
    metaY += 34;

    ctx.font = `bold 18px ${fontBengali}`;
    ctx.fillStyle = '#475569';
    ctx.fillText('ক্লায়েন্ট / হোস্ট:', rightX + 24, metaY);
    ctx.fillStyle = '#0f172a';
    ctx.font = `700 18px ${fontBengali}`;
    ctx.fillText(item.customerName || 'প্রদর্শনীর জন্য সংরক্ষিত', rightX + 160, metaY);
    metaY += 34;

    ctx.font = `bold 18px ${fontBengali}`;
    ctx.fillStyle = '#475569';
    ctx.fillText('তারিখ:', rightX + 24, metaY);
    ctx.fillStyle = '#0f172a';
    ctx.font = `700 18px ${fontBengali}`;
    ctx.fillText(item.date || new Date().toISOString().split('T')[0], rightX + 160, metaY);

    currY += 160;

    // 5. Description in Bengali
    if (item.description) {
      ctx.fillStyle = '#1e293b';
      ctx.font = `bold 20px ${fontBengali}`;
      ctx.fillText('ডেকোরেশনের বিবরণ ও বৈশিষ্ট্য:', rightX, currY + 20);
      currY += 32;

      ctx.fillStyle = '#334155';
      ctx.font = `500 17px ${fontBengali}`;
      const descLines = wrapText(item.description, rightW, 4);
      for (const line of descLines) {
        ctx.fillText(line, rightX, currY + 18);
        currY += 28;
      }
      currY += 16;
    }

    // 6. Highlight Tags
    if (item.highlightTags && item.highlightTags.length > 0) {
      ctx.fillStyle = '#475569';
      ctx.font = `bold 18px ${fontBengali}`;
      ctx.fillText('হাইলাইটস ও ম্যাটেরিয়ালস:', rightX, currY + 18);
      currY += 30;

      let tagX = rightX;
      for (const tag of item.highlightTags) {
        ctx.font = `bold 15px ${fontBengali}`;
        const tagText = `#${tag}`;
        const tagW = ctx.measureText(tagText).width + 24;
        if (tagX + tagW > rightX + rightW) break;

        drawRoundedRect(tagX, currY, tagW, 32, 16, '#f1f5f9', '#cbd5e1', 1);
        ctx.fillStyle = '#4338ca';
        ctx.fillText(tagText, tagX + 12, currY + 21);
        tagX += tagW + 10;
      }
      currY += 46;
    }

    // 7. Theme Color Palette
    if (item.colorPalette && item.colorPalette.length > 0) {
      ctx.fillStyle = '#475569';
      ctx.font = `bold 18px ${fontBengali}`;
      ctx.fillText('থিম কালার প্যালেট:', rightX, currY + 18);
      currY += 28;

      let swatchX = rightX;
      for (const colorHex of item.colorPalette) {
        drawRoundedRect(swatchX, currY, 44, 32, 8, colorHex, '#000000', 1.5);
        swatchX += 54;
      }
    }

    // Bottom Footer Line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(60, canvasH - 65);
    ctx.lineTo(canvasW - 60, canvasH - 65);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = `600 15px ${fontBengali}`;
    ctx.textAlign = 'left';
    ctx.fillText(`✨ ${companyName} • মোবাইল: 01721-779396 • ওয়েবসাইট ও লাইভ পোর্টাল বুকিং`, 60, canvasH - 35);

    ctx.textAlign = 'right';
    ctx.fillText('Confidential Client Presentation Document', canvasW - 60, canvasH - 35);

    const slideImgData = canvas.toDataURL('image/jpeg', 0.95);
    doc.addImage(slideImgData, 'JPEG', 0, 0, pageWidth, pageHeight);
  }

  const fileName = `Rittika_Event_Presentation_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

/**
 * 1-Click Interactive Offline HTML Slide Presentation Package Exporter
 */
export function exportStandaloneHTMLSlideshow(
  rawItems: GalleryMediaItem[],
  selectedCategories: string[] = [],
  companyName: string = 'রিত্তিকা ইভেন্ট ম্যানেজমেন্ট'
) {
  const items = expandMediaItemsToPhotoSlides(rawItems);

  if (!items || items.length === 0) {
    alert('কোনো ছবি বা ইভেন্ট আইটেম পাওয়া যায়নি।');
    return;
  }

  const itemsJson = JSON.stringify(items);
  const categoriesText = selectedCategories.length > 0 ? selectedCategories.join(', ') : 'সকল কাজ';

  const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${companyName} - প্রজেক্ট প্রেজেন্টেশন স্লাইডশো</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0f1117;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      user-select: none;
    }
    header {
      background: #181b22;
      border-bottom: 2px solid #facc15;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 20;
    }
    .brand { font-size: 16px; font-weight: 900; color: #facc15; text-transform: uppercase; }
    .status { font-size: 12px; color: #cbd5e1; }
    .controls { display: flex; gap: 8px; align-items: center; }
    button {
      background: #27272a;
      color: #fff;
      border: 1px solid #3f3f46;
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 700;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    button:hover { background: #3f3f46; }
    button.primary { background: #facc15; color: #000; border-color: #facc15; }
    button.primary:hover { background: #eab308; }
    .main-stage {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      overflow: hidden;
    }
    .slide-img {
      max-height: 72vh;
      max-width: 90vw;
      border-radius: 8px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.8);
      border: 2px solid rgba(255,255,255,0.2);
      transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    }
    .info-card {
      position: absolute;
      bottom: 24px;
      left: 24px;
      max-width: 420px;
      background: rgba(15, 17, 23, 0.92);
      border: 2px solid #facc15;
      border-radius: 8px;
      padding: 16px;
      backdrop-filter: blur(12px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.7);
    }
    .info-title { font-size: 15px; font-weight: 900; color: #facc15; margin-bottom: 6px; }
    .info-meta { font-size: 11px; color: #94a3b8; display: flex; gap: 12px; margin-bottom: 8px; }
    .info-desc { font-size: 12px; color: #e2e8f0; line-height: 1.5; margin-bottom: 8px; }
    .tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .tag { background: #27272a; border: 1px solid #3f3f46; font-size: 10px; padding: 2px 6px; border-radius: 4px; }
    .nav-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0,0,0,0.7);
      border: 2px solid rgba(255,255,255,0.3);
      color: #fff;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      cursor: pointer;
      z-index: 10;
    }
    .nav-arrow:hover { background: #facc15; color: #000; border-color: #facc15; }
    .arrow-left { left: 20px; }
    .arrow-right { right: 20px; }
    .progress {
      height: 4px;
      background: rgba(255,255,255,0.1);
      width: 100%;
    }
    .progress-bar {
      height: 100%;
      background: #facc15;
      width: 0%;
      transition: width 0.1s linear;
    }
    .thumbs {
      background: #181b22;
      border-top: 1px solid rgba(255,255,255,0.1);
      padding: 10px 16px;
      display: flex;
      gap: 10px;
      overflow-x: auto;
      justify-content: center;
    }
    .thumb {
      width: 60px;
      height: 45px;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      opacity: 0.6;
      transition: all 0.2s;
    }
    .thumb.active { border-color: #facc15; opacity: 1; transform: scale(1.08); }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }
  </style>
</head>
<body>
  <header>
    <div>
      <div class="brand">${companyName}</div>
      <div class="status">ক্যাটাগরি: ${categoriesText} | <span id="counter">১ / ${items.length}</span></div>
    </div>
    <div class="controls">
      <button id="playBtn" class="primary" onclick="togglePlay()">▶ স্লাইড চালু</button>
      <button onclick="toggleAudio()">🔔 অডিও ভাইব</button>
      <button onclick="toggleFullscreen()">⛶ ফুল স্ক্রিন</button>
    </div>
  </header>
  
  <div class="progress"><div id="pBar" class="progress-bar"></div></div>

  <div class="main-stage">
    <div class="nav-arrow arrow-left" onclick="prevSlide()">❮</div>
    <img id="stageImg" class="slide-img" src="" alt="Slide">
    <div class="nav-arrow arrow-right" onclick="nextSlide()">❯</div>

    <div id="infoCard" class="info-card">
      <div id="infoTitle" class="info-title"></div>
      <div id="infoMeta" class="info-meta"></div>
      <div id="infoDesc" class="info-desc"></div>
      <div id="infoTags" class="tags"></div>
    </div>
  </div>

  <div id="thumbs" class="thumbs"></div>

  <script>
    const items = ${itemsJson};
    let currentIdx = 0;
    let isPlaying = false;
    let playTimer = null;
    let isAudioOn = false;
    let audioCtx = null;
    const speed = 4000;

    function renderSlide() {
      const item = items[currentIdx];
      document.getElementById('stageImg').src = item.url;
      document.getElementById('counter').innerText = (currentIdx + 1) + ' / ' + items.length;
      document.getElementById('infoTitle').innerText = item.title;
      
      let meta = 'ক্যাটাগরি: ' + (item.category || 'ইভেন্ট');
      if (item.estimatedCost) meta += ' | বাজেট: ৳' + item.estimatedCost.toLocaleString();
      document.getElementById('infoMeta').innerText = meta;
      document.getElementById('infoDesc').innerText = item.description || '';

      const tagsEl = document.getElementById('infoTags');
      tagsEl.innerHTML = '';
      if (item.highlightTags) {
        item.highlightTags.forEach(t => {
          const span = document.createElement('span');
          span.className = 'tag';
          span.innerText = '#' + t;
          tagsEl.appendChild(span);
        });
      }

      const thumbEls = document.querySelectorAll('.thumb');
      thumbEls.forEach((el, idx) => {
        el.className = 'thumb' + (idx === currentIdx ? ' active' : '');
      });

      if (isAudioOn) playChime();
    }

    function buildThumbs() {
      const container = document.getElementById('thumbs');
      items.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'thumb' + (idx === 0 ? ' active' : '');
        div.onclick = () => { currentIdx = idx; renderSlide(); };
        div.innerHTML = '<img src="' + item.url + '" alt="t">';
        container.appendChild(div);
      });
    }

    function nextSlide() {
      currentIdx = (currentIdx + 1) % items.length;
      renderSlide();
    }

    function prevSlide() {
      currentIdx = (currentIdx - 1 + items.length) % items.length;
      renderSlide();
    }

    function togglePlay() {
      isPlaying = !isPlaying;
      const btn = document.getElementById('playBtn');
      if (isPlaying) {
        btn.innerText = '❚❚ থামান';
        playTimer = setInterval(nextSlide, speed);
      } else {
        btn.innerText = '▶ স্লাইড চালু';
        clearInterval(playTimer);
      }
    }

    function toggleAudio() {
      isAudioOn = !isAudioOn;
      if (isAudioOn) playChime();
    }

    function playChime() {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.03, audioCtx.currentTime + 0.05 + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2 + i * 0.1);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(audioCtx.currentTime + i * 0.06);
          osc.stop(audioCtx.currentTime + 1.4 + i * 0.1);
        });
      } catch (e) {}
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(()=>{});
      } else {
        document.exitFullscreen().catch(()=>{});
      }
    }

    window.onload = () => {
      buildThumbs();
      renderSlide();
    };

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === ' ') { e.preventDefault(); togglePlay(); }
    });
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Rittika_Slide_Presentation_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
