import React, { useState, useRef, useMemo } from 'react';
import { 
  User, 
  Plus, 
  Check, 
  X, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  FileText, 
  FileImage, 
  Send, 
  PenTool, 
  Eye, 
  CheckCircle,
  CheckCircle2,
  Share2,
  Trash2,
  Upload,
  Sparkles,
  Play,
  Image as ImageIcon,
  ZoomIn,
  Search,
  Filter,
  Edit2,
  Tag,
  Palette,
  Layers,
  Lock,
  FolderPlus,
  SlidersHorizontal,
  CheckSquare,
  Square,
  Download,
  FileDown,
  Presentation,
  Phone,
  MessageCircle,
  ExternalLink,
  Building2,
  Globe,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Film
} from 'lucide-react';
import { Customer, EventEntry, RentalOutEntry, OnlineBooking, BookingRequestStatus, Attachment, UserRole, PortfolioItem, PortfolioPhotoDetail } from '../types';
import { toBengaliNumber, formatCurrency } from '../utils';
import ImageGalleryLightbox, { GalleryMediaItem } from './ImageGalleryLightbox';
import { exportPresentationToPDF, exportStandaloneHTMLSlideshow, exportPresentationToVideo, VideoExportResult } from '../utils/presentationExporter';
import ShareModal from './ShareModal';
import OnlineBookingSection from './OnlineBookingSection';
import BookingRequestsInbox from './BookingRequestsInbox';

interface CustomerPortalProps {
  customers: Customer[];
  events: EventEntry[];
  rentals: RentalOutEntry[];
  onlineBookings: OnlineBooking[];
  attachments: Attachment[];
  onAddCustomer: (customer: Omit<Customer, 'id'>) => void;
  onAddEvent: (event: Omit<EventEntry, 'id'>) => void;
  onAddOnlineBooking: (booking: Omit<OnlineBooking, 'id'>) => void;
  onApproveBooking: (bookingId: string) => void;
  onDeclineBooking: (bookingId: string) => void;
  onUpdateBookingStatus?: (bookingId: string, status: BookingRequestStatus, adminNotes?: string) => void;
  onDeleteBooking?: (bookingId: string) => void;
  onAddAttachment: (attachment: Omit<Attachment, 'id'>) => void;
  onDeleteAttachment: (id: string) => void;
  userRole: UserRole;
  portfolioItems: PortfolioItem[];
  portfolioCategories: string[];
  onAddPortfolioItem: (item: Omit<PortfolioItem, 'id'>) => void;
  onUpdatePortfolioItem: (item: PortfolioItem) => void;
  onDeletePortfolioItem: (id: string) => void;
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
}

export default function CustomerPortal({
  customers,
  events,
  rentals,
  onlineBookings,
  attachments,
  onAddCustomer,
  onAddEvent,
  onAddOnlineBooking,
  onApproveBooking,
  onDeclineBooking,
  onUpdateBookingStatus,
  onDeleteBooking,
  onAddAttachment,
  onDeleteAttachment,
  userRole,
  portfolioItems,
  portfolioCategories,
  onAddPortfolioItem,
  onUpdatePortfolioItem,
  onDeletePortfolioItem,
  onAddCategory,
  onDeleteCategory
}: CustomerPortalProps) {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'booking-form' | 'inbox' | 'portal' | 'documents'>('portfolio');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Sync subtab from URL query param if present
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const subtab = urlParams.get('subtab');
      if (subtab && ['portfolio', 'booking-form', 'inbox', 'portal', 'documents'].includes(subtab)) {
        setActiveTab(subtab as any);
      }
    }
  }, []);
  
  // Lightbox controllers
  const [portfolioLightboxIdx, setPortfolioLightboxIdx] = useState<number | null>(null);
  const [docLightboxIdx, setDocLightboxIdx] = useState<number | null>(null);
  const [activeSlideItems, setActiveSlideItems] = useState<GalleryMediaItem[] | null>(null);

  // Portal-level Video Export & Player Modal State
  const [isExportingPortalVideo, setIsExportingPortalVideo] = useState(false);
  const [portalVideoProgress, setPortalVideoProgress] = useState(0);
  const [portalVideoStatus, setPortalVideoStatus] = useState('');
  const [portalGeneratedVideo, setPortalGeneratedVideo] = useState<VideoExportResult | null>(null);

  // Multi-Category Filter State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Customer in Portal Mode
  const [portalCustomerId, setPortalCustomerId] = useState(customers[0]?.id || '');

  // Admin Custom Category & Portfolio Modals
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<PortfolioItem | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Form states for Add/Edit Portfolio
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioCategory, setPortfolioCategory] = useState(portfolioCategories[0] || 'বিবাহ ও সংবর্ধনা');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [portfolioPhotoDetails, setPortfolioPhotoDetails] = useState<PortfolioPhotoDetail[]>([]);
  const [activePhotoDetailEditIdx, setActivePhotoDetailEditIdx] = useState<number | null>(null);
  const [tempPhotoTitle, setTempPhotoTitle] = useState('');
  const [tempPhotoCost, setTempPhotoCost] = useState<number | ''>('');
  const [tempPhotoDescription, setTempPhotoDescription] = useState('');
  const [tempPhotoTags, setTempPhotoTags] = useState('');
  const [newImageUrlInput, setNewImageUrlInput] = useState('');
  const [activeCardImageIdx, setActiveCardImageIdx] = useState<Record<string, number>>({});
  const [portfolioEventName, setPortfolioEventName] = useState('');
  const [portfolioCustomerName, setPortfolioCustomerName] = useState('');
  const [portfolioDate, setPortfolioDate] = useState(new Date().toISOString().split('T')[0]);
  const [portfolioDescription, setPortfolioDescription] = useState('');
  const [portfolioCost, setPortfolioCost] = useState<number>(50000);
  const [portfolioTags, setPortfolioTags] = useState('');
  const [portfolioPalette, setPortfolioPalette] = useState('#D4AF37, #FFFFFF, #800020');

  const isAdmin = userRole === 'Admin';
  const canEdit = userRole === 'Admin' || userRole === 'Manager';

  // Toggle Category selection (multi-select)
  const handleToggleCategory = (category: string) => {
    if (category === 'ALL') {
      setSelectedCategories([]);
      return;
    }
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Filtered portfolio list
  const filteredPortfolio: GalleryMediaItem[] = useMemo(() => {
    return portfolioItems
      .filter(item => {
        const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category);
        const matchQuery = !searchQuery.trim() || 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.eventName && item.eventName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.highlightTags && item.highlightTags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
        return matchCategory && matchQuery;
      })
      .map(item => {
        const itemImgs = (item.images && item.images.length > 0) 
          ? item.images 
          : (item.url ? [item.url] : []);
        return {
          id: item.id,
          title: item.title,
          category: item.category,
          url: item.url || itemImgs[0] || '',
          images: itemImgs,
          photoDetails: item.photoDetails,
          eventName: item.eventName,
          customerName: item.customerName,
          date: item.date,
          description: item.description,
          isVideo: item.isVideo,
          estimatedCost: item.estimatedCost,
          highlightTags: item.highlightTags,
          colorPalette: item.colorPalette
        };
      });
  }, [portfolioItems, selectedCategories, searchQuery]);

  // 🌟 Category-Isolated Slide Play (Cycles all photos within that category only)
  const handlePlayCategorySlide = (item: GalleryMediaItem) => {
    const categoryItems = portfolioItems
      .filter(p => p.category === item.category)
      .map(p => {
        const itemImgs = (p.images && p.images.length > 0) ? p.images : (p.url ? [p.url] : []);
        return {
          id: p.id,
          title: p.title,
          category: p.category,
          url: p.url || itemImgs[0] || '',
          images: itemImgs,
          photoDetails: p.photoDetails,
          eventName: p.eventName,
          customerName: p.customerName,
          date: p.date,
          description: p.description,
          isVideo: p.isVideo,
          estimatedCost: p.estimatedCost,
          highlightTags: p.highlightTags,
          colorPalette: p.colorPalette
        };
      });
    
    const targetIdx = Math.max(0, categoryItems.findIndex(ci => ci.id === item.id));
    setActiveSlideItems(categoryItems.length > 0 ? categoryItems : [item]);
    setPortfolioLightboxIdx(targetIdx);
  };

  // 🌟 Play slideshow for current filtered category list
  const handlePlayFilteredSlide = () => {
    if (filteredPortfolio.length === 0) return;
    setActiveSlideItems(filteredPortfolio);
    setPortfolioLightboxIdx(0);
  };

  // 🌟 Direct 1-Click Video Export from Portal Toolbar
  const handleExportPortalVideo = async () => {
    if (filteredPortfolio.length === 0) return;
    setIsExportingPortalVideo(true);
    setPortalVideoProgress(0);
    setPortalVideoStatus('ছবি ও ট্রানজিশন প্রস্তুত হচ্ছে...');
    try {
      const result = await exportPresentationToVideo(filteredPortfolio, {
        secondsPerSlide: 4,
        companyName: 'রিত্তিকা ইভেন্ট ম্যানেজমেন্ট',
        onProgress: (percent, statusText) => {
          setPortalVideoProgress(percent);
          setPortalVideoStatus(statusText);
        }
      });
      setPortalGeneratedVideo(result);
    } catch (err: any) {
      console.error('Portal video export error:', err);
      alert('ভিডিও তৈরিতে সমস্যা হয়েছে: ' + (err.message || 'অনুগ্রহ করে আবার চেষ্টা করুন।'));
    } finally {
      setIsExportingPortalVideo(false);
    }
  };

  // Open Portfolio Modal for Add
  const handleOpenAddPortfolio = () => {
    setEditingPortfolioItem(null);
    setPortfolioTitle('');
    setPortfolioCategory(portfolioCategories[0] || 'বিবাহ ও সংবর্ধনা');
    setPortfolioUrl('');
    setPortfolioImages([]);
    setPortfolioPhotoDetails([]);
    setActivePhotoDetailEditIdx(null);
    setNewImageUrlInput('');
    setPortfolioEventName('');
    setPortfolioCustomerName('');
    setPortfolioDate(new Date().toISOString().split('T')[0]);
    setPortfolioDescription('');
    setPortfolioCost(60000);
    setPortfolioTags('রয়্যাল লুক, প্রিমিয়াম লাইটিং, ফ্লোরাল আর্চ');
    setPortfolioPalette('#D4AF37, #FFFFFF, #800020');
    setIsPortfolioModalOpen(true);
  };

  // Open Portfolio Modal for Edit
  const handleOpenEditPortfolio = (item: PortfolioItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPortfolioItem(item);
    setPortfolioTitle(item.title);
    setPortfolioCategory(item.category);
    
    const existingImgs = (item.images && item.images.length > 0)
      ? item.images
      : (item.url ? [item.url] : []);
    
    setPortfolioImages(existingImgs);
    setPortfolioPhotoDetails(item.photoDetails || []);
    setActivePhotoDetailEditIdx(null);
    setPortfolioUrl(item.url || existingImgs[0] || '');
    setNewImageUrlInput('');
    setPortfolioEventName(item.eventName || '');
    setPortfolioCustomerName(item.customerName || '');
    setPortfolioDate(item.date || new Date().toISOString().split('T')[0]);
    setPortfolioDescription(item.description || '');
    setPortfolioCost(item.estimatedCost || 50000);
    setPortfolioTags(item.highlightTags ? item.highlightTags.join(', ') : '');
    setPortfolioPalette(item.colorPalette ? item.colorPalette.join(', ') : '#D4AF37, #FFFFFF');
    setIsPortfolioModalOpen(true);
  };

  // Open inline sub-photo editor for a specific photo index
  const handleOpenPhotoDetailEditor = (idx: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const photoUrl = portfolioImages[idx];
    const existingDetail = portfolioPhotoDetails.find(p => p.url === photoUrl || p.id === `photo-${idx}`) || portfolioPhotoDetails[idx];
    
    setTempPhotoTitle(existingDetail?.title || '');
    setTempPhotoCost(existingDetail?.estimatedCost !== undefined ? existingDetail.estimatedCost : '');
    setTempPhotoDescription(existingDetail?.description || '');
    setTempPhotoTags(existingDetail?.highlightTags ? existingDetail.highlightTags.join(', ') : '');
    setActivePhotoDetailEditIdx(idx);
  };

  // Save specific sub-photo detailed info and budget
  const handleSavePhotoDetail = (idx: number, e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const photoUrl = portfolioImages[idx];
    const tagsArray = tempPhotoTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const updatedDetail: PortfolioPhotoDetail = {
      id: `photo-${idx}-${Date.now()}`,
      url: photoUrl,
      title: tempPhotoTitle.trim() || undefined,
      estimatedCost: tempPhotoCost !== '' ? Number(tempPhotoCost) : undefined,
      description: tempPhotoDescription.trim() || undefined,
      highlightTags: tagsArray.length > 0 ? tagsArray : undefined
    };

    setPortfolioPhotoDetails(prev => {
      const next = [...prev];
      const existingIdx = next.findIndex(p => p.url === photoUrl);
      if (existingIdx >= 0) {
        next[existingIdx] = updatedDetail;
      } else {
        next.push(updatedDetail);
      }
      return next;
    });

    setActivePhotoDetailEditIdx(null);
  };

  // Handle multiple photo uploads via file input
  const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileArray: File[] = Array.from(files);

    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
          const res = reader.result;
          setPortfolioImages(prev => {
            const nextList = [...prev, res];
            return nextList;
          });
          setPortfolioUrl(prev => prev || res);
        }
      };
      reader.readAsDataURL(file);
    });
    // Reset input value so same files can be re-selected if needed
    e.target.value = '';
  };

  // Handle adding photo from URL or batch URLs
  const handleAddUrlImage = () => {
    if (!newImageUrlInput.trim()) return;
    const urls = newImageUrlInput
      .split(/[\n,]+/)
      .map(u => u.trim())
      .filter(u => u.length > 5);

    if (urls.length > 0) {
      setPortfolioImages(prev => [...prev, ...urls]);
      if (!portfolioUrl) {
        setPortfolioUrl(urls[0]);
      }
      setNewImageUrlInput('');
    }
  };

  // Remove individual photo from uploaded list
  const handleRemovePhoto = (indexToRemove: number) => {
    const removedUrl = portfolioImages[indexToRemove];
    setPortfolioImages(prev => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      if (portfolioUrl === prev[indexToRemove]) {
        setPortfolioUrl(updated[0] || '');
      }
      return updated;
    });
    setPortfolioPhotoDetails(prev => prev.filter(p => p.url !== removedUrl));
    if (activePhotoDetailEditIdx === indexToRemove) {
      setActivePhotoDetailEditIdx(null);
    }
  };

  // Set photo as primary cover
  const handleSetCoverPhoto = (imgUrl: string) => {
    setPortfolioUrl(imgUrl);
  };

  // Handle Save Portfolio Item
  const handleSavePortfolio = (e: React.FormEvent) => {
    e.preventDefault();

    const finalImages = portfolioImages.length > 0
      ? portfolioImages
      : (portfolioUrl.trim() ? [portfolioUrl.trim()] : []);

    if (!portfolioTitle.trim() || finalImages.length === 0) {
      alert('দয়া করে শিরোনাম লিখুন এবং কমপক্ষে একটি ছবি আপলোড বা লিংক প্রদান করুন।');
      return;
    }

    const primaryCover = (portfolioUrl && finalImages.includes(portfolioUrl))
      ? portfolioUrl
      : finalImages[0];

    const tagsArray = portfolioTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const paletteArray = portfolioPalette
      .split(',')
      .map(p => p.trim())
      .filter(p => p.startsWith('#') || p.length > 0);

    // Sync photo details with final images
    const cleanedPhotoDetails: PortfolioPhotoDetail[] = finalImages.map((imgUrl, i) => {
      const existing = portfolioPhotoDetails.find(p => p.url === imgUrl);
      if (existing) return existing;
      return {
        id: `photo-${i}`,
        url: imgUrl
      };
    });

    if (editingPortfolioItem) {
      onUpdatePortfolioItem({
        id: editingPortfolioItem.id,
        title: portfolioTitle.trim(),
        category: portfolioCategory,
        url: primaryCover,
        images: finalImages,
        photoDetails: cleanedPhotoDetails,
        eventName: portfolioEventName.trim(),
        customerName: portfolioCustomerName.trim(),
        date: portfolioDate,
        description: portfolioDescription.trim(),
        estimatedCost: portfolioCost,
        highlightTags: tagsArray,
        colorPalette: paletteArray
      });
    } else {
      onAddPortfolioItem({
        title: portfolioTitle.trim(),
        category: portfolioCategory,
        url: primaryCover,
        images: finalImages,
        photoDetails: cleanedPhotoDetails,
        eventName: portfolioEventName.trim(),
        customerName: portfolioCustomerName.trim(),
        date: portfolioDate,
        description: portfolioDescription.trim(),
        estimatedCost: portfolioCost,
        highlightTags: tagsArray,
        colorPalette: paletteArray
      });
    }

    setIsPortfolioModalOpen(false);
  };

  // Handle Add Category
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    onAddCategory(newCategoryName.trim());
    setNewCategoryName('');
    setIsAddCategoryOpen(false);
  };

  // Handle image upload from computer for portfolio
  const handlePortfolioImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result && typeof reader.result === 'string') {
        setPortfolioUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // 1. Online Booking Form States
  const [custName, setCustName] = useState('');
  const [custMobile, setCustMobile] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventType, setEventType] = useState('Wedding (বিয়ে)');
  const [guestCount, setGuestCount] = useState(150);
  const [eventLoc, setEventLoc] = useState('');
  const [bookingNote, setBookingNote] = useState('');

  // 2. Budget Estimator Calculations
  const estimatedBudget = useMemo(() => {
    let perGuestRate = 180;
    if (eventType.includes('Wedding')) perGuestRate = 280;
    else if (eventType.includes('Birthday')) perGuestRate = 120;
    else if (eventType.includes('Corporate')) perGuestRate = 350;
    else if (eventType.includes('Haldi')) perGuestRate = 150;
    
    return guestCount * perGuestRate;
  }, [eventType, guestCount]);

  // Handle Online Booking Form Submit
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custMobile || !eventLoc) return;

    onAddOnlineBooking({
      date: eventDate,
      customerName: custName.trim(),
      mobile: custMobile.trim(),
      eventType,
      location: eventLoc.trim(),
      guestCount,
      estimatedBudget,
      status: 'Pending',
      note: bookingNote.trim()
    });

    alert('ধন্যবাদ! আপনার বুকিং আবেদনটি সফলভাবে সিস্টেমে পাঠানো হয়েছে। ম্যানেজার পর্যালোচনা করে নিশ্চিত করবেন।');
    
    setCustName('');
    setCustMobile('');
    setEventLoc('');
    setBookingNote('');
  };

  // 3. Customer Portal Stats Filtered for Selected Customer
  const portalCustomer = useMemo(() => {
    return customers.find(c => c.id === portalCustomerId);
  }, [customers, portalCustomerId]);

  const customerEvents = useMemo(() => {
    return events.filter(e => e.customerId === portalCustomerId);
  }, [events, portalCustomerId]);

  const customerRentals = useMemo(() => {
    return rentals.filter(r => r.customerId === portalCustomerId);
  }, [rentals, portalCustomerId]);

  const totalDueAmount = useMemo(() => {
    const eventDue = customerEvents.reduce((sum, e) => sum + e.dueAmount, 0);
    const rentalDue = customerRentals.reduce((sum, r) => sum + r.dueAmount, 0);
    return eventDue + rentalDue;
  }, [customerEvents, customerRentals]);

  // 4. Canvas Digital Signature State & Logic
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    setIsDrawing(true);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSavedSignature(null);
  };

  const saveCanvasSignature = () => {
    if (!canEdit) {
      alert('ডিজিটাল চুক্তি স্বাক্ষর সেভ করতে অনুমোদিত লগইন প্রয়োজন।');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setSavedSignature(dataUrl);
    
    if (portalCustomerId) {
      onAddAttachment({
        name: `${portalCustomer?.name || 'Customer'}_Digital_Signature`,
        type: 'Contract',
        dataUrl,
        date: new Date().toISOString().split('T')[0],
        relatedId: portalCustomerId
      });
      alert('ডিজিটাল সিগনেচার সফলভাবে কাস্টমার চুক্তিতে সংরক্ষণ করা হয়েছে!');
    }
  };

  // 5. Document Management Upload (Base64)
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('NID');
  const [docRelatedId, setDocRelatedId] = useState(customers[0]?.id || '');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) {
      alert('নিরাপত্তা সতর্কতা: নথি আপলোড করতে অনুমোদিত স্টাফ বা অ্যাডমিন লগইন প্রয়োজন।');
      return;
    }
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let count = 0;
    Array.from(files).forEach((file: File, index: number) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
          onAddAttachment({
            name: docName.trim() ? (files.length > 1 ? `${docName.trim()} (${index + 1})` : docName.trim()) : file.name,
            type: docType,
            dataUrl: reader.result,
            date: new Date().toISOString().split('T')[0],
            relatedId: docRelatedId
          });
          count++;
          if (count === files.length) {
            alert(`${files.length} টি ফাইল সফলভাবে সিস্টেমে সংরক্ষণ করা হয়েছে!`);
            setDocName('');
          }
        }
      };
      reader.readAsDataURL(file);
    });
    if (e.target) e.target.value = '';
  };

  // WhatsApp click to send links generator
  const getWhatsAppLink = (phone: string, text: string) => {
    const formattedPhone = phone.startsWith('88') ? phone : '88' + phone;
    return `https://api.whatsapp.com/send?phone=${formattedPhone.replace(/[^\d]/g, '')}&text=${encodeURIComponent(text)}`;
  };

  // Image attachments list for lightbox
  const imageAttachments: GalleryMediaItem[] = useMemo(() => {
    return attachments
      .filter(a => a.dataUrl.startsWith('data:image'))
      .map(a => {
        const relatedCust = customers.find(c => c.id === a.relatedId);
        return {
          id: a.id,
          title: a.name,
          category: a.type,
          url: a.dataUrl,
          date: a.date,
          customerName: relatedCust ? relatedCust.name : undefined,
          description: `সংযুক্ত দলিল ধরণ: ${a.type} | আপলোড তারিখ: ${a.date}`
        };
      });
  }, [attachments, customers]);

  return (
    <div className="space-y-6" id="customer-portal-module">
      {/* Luxury Multi-Gradient Tab Switcher */}
      <div className="flex bg-white/90 backdrop-blur-md border border-slate-200/80 p-1.5 rounded-2xl shadow-sm flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 text-center text-xs font-black uppercase tracking-tight flex items-center justify-center gap-1.5 rounded-xl transition cursor-pointer ${
            activeTab === 'portfolio'
              ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-md shadow-rose-500/20 scale-[1.01]'
              : 'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Sparkles size={14} className="stroke-[2.5]" />
          ডেকোরেশন পোর্টফোলিও ও ফটো শোকেস
        </button>
        <button
          onClick={() => setActiveTab('booking-form')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 text-center text-xs font-black uppercase tracking-tight flex items-center justify-center gap-1.5 rounded-xl transition cursor-pointer ${
            activeTab === 'booking-form'
              ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-md shadow-rose-500/20 scale-[1.01]'
              : 'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Briefcase size={14} className="stroke-[2.5]" />
          অনলাইন বুকিং ও এস্টিমেট
        </button>

        {canEdit && (
          <>
            <button
              onClick={() => setActiveTab('inbox')}
              className={`flex-1 min-w-[130px] py-2.5 px-3 text-center text-xs font-black uppercase tracking-tight flex items-center justify-center gap-1.5 rounded-xl transition cursor-pointer relative ${
                activeTab === 'inbox'
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md scale-[1.01]'
                  : 'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Send size={14} className="stroke-[2.5]" />
              বুকিং ইনবক্স (আবেদন)
              {onlineBookings.filter(b => b.status === 'Pending').length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] w-5 h-5 flex items-center justify-center font-black rounded-full border-2 border-white shadow-sm animate-pulse">
                  {onlineBookings.filter(b => b.status === 'Pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('portal')}
              className={`flex-1 min-w-[140px] py-2.5 px-3 text-center text-xs font-black uppercase tracking-tight flex items-center justify-center gap-1.5 rounded-xl transition cursor-pointer ${
                activeTab === 'portal'
                  ? 'bg-gradient-to-r from-purple-700 via-indigo-600 to-teal-500 text-white shadow-md scale-[1.01]'
                  : 'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <User size={14} className="stroke-[2.5]" />
              কাস্টমার পোর্টাল সিমুলেটর
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex-1 min-w-[130px] py-2.5 px-3 text-center text-xs font-black uppercase tracking-tight flex items-center justify-center gap-1.5 rounded-xl transition cursor-pointer ${
                activeTab === 'documents'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md scale-[1.01]'
                  : 'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FileText size={14} className="stroke-[2.5]" />
              দলিল ও ফাইল ম্যানেজার
            </button>
          </>
        )}
      </div>

      {/* 🌟 Official Business Profile & 1-Click WhatsApp + Facebook Connect Card */}
      <div className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 border border-amber-400/30 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-purple-950/20 relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Left: Brand, Logo, CEO, Address & Location Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-20 sm:h-24 w-auto min-w-[130px] max-w-[240px] rounded-2xl bg-black border-2 border-amber-400/50 p-2 flex items-center justify-center shrink-0 shadow-lg shadow-black/60 overflow-hidden group relative">
              <img 
                src="/logo.png" 
                alt="Rittika Event Management Logo" 
                className="h-full w-auto max-h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform" 
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                  if (e.currentTarget.parentElement) {
                    e.currentTarget.parentElement.innerHTML = '<span class="text-amber-300 text-xl font-black font-serif px-2">REM</span>';
                  }
                }}
              />
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                  👑 অফিসিয়াল ইভেন্ট পার্টনার
                </span>
                <span className="text-[11px] font-bold text-amber-200/90 flex items-center gap-1">
                  <Building2 size={13} className="text-amber-400" />
                  প্রতিষ্ঠানের নাম: <strong className="text-white">Rittika Event Management</strong>
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-200 to-purple-200 tracking-tight">
                  Rittika Event Management
                </h2>
                <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mt-0.5">
                  <span>Owner / CEO:</span>
                  <span className="text-white bg-white/10 px-2 py-0.5 rounded-md border border-white/15">Robin Kumar</span>
                </p>
              </div>

              {/* Address & Location Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-300 pt-1">
                <div className="flex items-start gap-2 bg-white/5 border border-white/10 rounded-xl p-2.5">
                  <MapPin size={16} className="text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">অফিসের ঠিকানা</span>
                    <span className="text-slate-100 font-bold text-[11px]">রথপাড়া, ভেড়ামারা, কুষ্টিয়া, বাংলাদেশ — 7040</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white/5 border border-white/10 rounded-xl p-2.5">
                  <Globe size={16} className="text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">লোকেশন ও বিভাগ</span>
                    <span className="text-slate-100 font-bold text-[11px]">Bheramara, Khulna Division, Bangladesh</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Direct 1-Click Action Buttons for WhatsApp & Facebook */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
            {/* 1-Click WhatsApp Direct Chat */}
            <a
              href="https://wa.me/8801721779396?text=%E0%A6%A8%E0%A6%AE%E0%A6%B8%E0%A7%8D%E0%A6%95%E0%A6%BE%E0%A6%B0%2F%E0%A6%B9%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%B2%E0%A7%8B%2C%20%E0%A6%B0%E0%A6%BF%E0%A6%A4%E0%A7%8D%E0%A6%A4%E0%A6%BF%E0%A6%95%E0%A6%BE%20%E0%A6%87%E0%A6%AD%E0%A7%87%E0%A6%A8%E0%A7%8D%E0%A6%9F%20%E0%A6%AE%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%A8%E0%A7%87%E0%A6%9C%E0%A6%AE%E0%A7%87%E0%A6%A8%E0%A7%8D%E0%A6%9F%20%E0%A6%A5%E0%A7%87%E0%A6%95%E0%A7%87%20%E0%A6%87%E0%A6%AD%E0%A7%87%E0%A6%A8%E0%A7%8D%E0%A6%9F%20%E0%A6%A1%E0%A7%87%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%87%E0%A6%B6%E0%A6%A8%20%E0%A6%93%20%E0%A6%AC%E0%A7%81%E0%A6%95%E0%A6%BF%E0%A6%82%20%E0%A6%B8%E0%A6%82%E0%A6%95%E0%A7%8D%E0%A6%B0%E0%A6%BE%E0%A6%A8%E0%A7%8D%E0%A6%A4%20%E0%A6%A4%E0%A6%A5%E0%A7%8D%E0%A6%AF%20%E0%A6%9C%E0%A6%BE%E0%A6%A8%E0%A6%A4%E0%A7%87%20%E0%A6%9A%E0%A6%BE%E0%A6%87%E0%A7%A4"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-xs uppercase shadow-lg shadow-emerald-900/30 hover:scale-[1.02] active:scale-98 transition duration-200 border border-emerald-400/40 cursor-pointer"
            >
              {/* WhatsApp Icon */}
              <div className="w-6 h-6 rounded-full bg-white text-emerald-600 flex items-center justify-center font-bold">
                <MessageCircle size={15} className="fill-emerald-600 text-white" />
              </div>
              <div className="text-left leading-tight">
                <span className="text-[10px] text-emerald-100 font-bold block">১-ক্লিক হোয়াটসঅ্যাপ চ্যাট</span>
                <span className="text-xs font-black tracking-wide">+880 1721-779396</span>
              </div>
            </a>

            {/* 1-Click Facebook Page Link */}
            <a
              href="https://www.facebook.com/VRelegantshop"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase shadow-lg shadow-blue-900/30 hover:scale-[1.02] active:scale-98 transition duration-200 border border-blue-400/40 cursor-pointer"
            >
              {/* Facebook Icon */}
              <div className="w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold">
                <span className="font-sans font-black text-sm">f</span>
              </div>
              <div className="text-left leading-tight">
                <span className="text-[10px] text-blue-100 font-bold block">অফিসিয়াল ফেসবুক পেজ</span>
                <span className="text-xs font-black flex items-center gap-1">
                  facebook.com/VRelegantshop
                  <ExternalLink size={12} />
                </span>
              </div>
            </a>
          </div>

        </div>
      </div>

      {/* 🌟 0. Decor Portfolio Showcase & Gallery Mode */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6" id="decor-portfolio-showcase">
          {/* Header Banner */}
          <div className="neo-card p-6 bg-white border border-slate-200/80 shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 px-3 py-0.5 text-xs font-black uppercase rounded-full shadow-xs flex items-center gap-1">
                  <Sparkles size={13} />
                  ইভেন্ট শোকেস ও প্রেজেন্টেশন স্লাইডশো
                </span>
                <span className="text-xs font-bold text-slate-500">
                  মোট {toBengaliNumber(filteredPortfolio.length)} টি কাজ ফিল্টার করা
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black uppercase text-slate-900 mt-2">
                রিত্তিকা ইভেন্ট ম্যানেজমেন্ট পোর্টফোলিও
              </h2>
              <p className="text-xs font-medium text-slate-600 mt-1 max-w-2xl leading-relaxed">
                কাস্টমারকে আমাদের প্রিমিয়াম কাজগুলো দেখান, একাধিক ক্যাটাগরি ফিল্টার করুন, ছবি ফুল স্ক্রিন জুম-প্যান করুন এবং প্রফেশনাল ভাইবে স্লাইড চালু করুন।
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Play Slideshow Button for Filtered Category Items */}
              <button
                onClick={handlePlayFilteredSlide}
                disabled={filteredPortfolio.length === 0}
                className={`neo-btn px-4 py-2.5 text-xs font-black uppercase flex items-center gap-2 rounded-xl shadow-md cursor-pointer ${
                  filteredPortfolio.length === 0 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' 
                    : 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white hover:opacity-95'
                }`}
                title="সিলেক্ট করা ক্যাটাগরির ছবিগুলোর ফুল স্ক্রিন স্লাইডশো চালু করুন"
              >
                <Play size={16} className="stroke-[3] fill-white" />
                স্লাইড চালু করুন ({toBengaliNumber(filteredPortfolio.length)})
              </button>

              {/* 🌟 1-Click Cinematic Video Exporter & Downloader */}
              <button
                onClick={handleExportPortalVideo}
                disabled={filteredPortfolio.length === 0 || isExportingPortalVideo}
                className="neo-btn bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-600 text-black px-3.5 py-2.5 text-xs font-black uppercase flex items-center gap-1.5 rounded-xl shadow-md cursor-pointer disabled:opacity-50 border border-yellow-300"
                title="ফিল্টার করা ক্যাটাগরির ছবিগুলো দিয়ে ফুল HD সিনেমাটিক ভিডিও তৈরি ও ডাউনলোড করুন"
              >
                <Film size={15} className="stroke-[2.5]" />
                {isExportingPortalVideo ? 'ভিডিও রেন্ডার হচ্ছে...' : 'সিনেমাটিক ভিডিও'}
              </button>

              {/* 🌟 1-Click Share Showcase Link & QR */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="neo-btn bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3.5 py-2.5 text-xs font-black uppercase flex items-center gap-1.5 rounded-xl shadow-md cursor-pointer"
                title="শোকেস ও বুকিং পেজের লাইভ লিংক, হোয়াটসঅ্যাপ বা কিউআর কোড শেয়ার করুন"
              >
                <Share2 size={15} className="stroke-[2.5]" />
                শেয়ার লিংক ও QR
              </button>

              {/* 1-Click Presentation PDF Download */}
              <button
                onClick={async () => {
                  if (filteredPortfolio.length === 0) return;
                  setIsExportingPdf(true);
                  try {
                    await exportPresentationToPDF(filteredPortfolio, selectedCategories);
                  } catch (e) {
                    console.error(e);
                    alert('PDF তৈরিতে ত্রুটি দেখা দিয়েছে।');
                  } finally {
                    setIsExportingPdf(false);
                  }
                }}
                disabled={filteredPortfolio.length === 0 || isExportingPdf}
                className="neo-btn bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-3.5 py-2.5 text-xs font-black uppercase flex items-center gap-1.5 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                title="ফিল্টার করা ছবিগুলো দিয়ে ১-ক্লিকে প্রজেক্ট প্রেজেন্টেশন PDF ব্রোশিউর ডাউনলোড করুন"
              >
                <FileDown size={15} />
                {isExportingPdf ? 'PDF তৈরি হচ্ছে...' : 'প্রেজেন্টেশন PDF'}
              </button>

              {/* 1-Click Offline Standalone HTML Slide Deck */}
              <button
                onClick={() => {
                  if (filteredPortfolio.length === 0) return;
                  exportStandaloneHTMLSlideshow(filteredPortfolio, selectedCategories);
                }}
                disabled={filteredPortfolio.length === 0}
                className="neo-btn bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-3.5 py-2.5 text-xs font-black uppercase flex items-center gap-1.5 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                title="ইন্টারনেট ছাড়া যে কোনো ডিভাইসে চালানোর মতো স্বয়ংক্রিয় অফলাইন স্লাইডশো ডাউনলোড করুন"
              >
                <Presentation size={15} />
                অফলাইন স্লাইড প্যাকেজ
              </button>

              {/* Admin Actions: Add Photo & Add Custom Category */}
              {isAdmin && (
                <>
                  <button
                    onClick={handleOpenAddPortfolio}
                    className="neo-btn bg-slate-900 hover:bg-slate-800 text-amber-300 px-3.5 py-2.5 text-xs font-black uppercase flex items-center gap-1.5 rounded-xl shadow-md cursor-pointer"
                    title="নতুন ডেকোরেশন ছবি যোগ করুন"
                  >
                    <Plus size={15} />
                    নতুন ছবি যোগ
                  </button>
                  <button
                    onClick={() => setIsAddCategoryOpen(true)}
                    className="neo-btn bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3 py-2.5 text-xs font-black uppercase flex items-center gap-1.5 rounded-xl shadow-xs cursor-pointer"
                    title="নতুন কাস্টম ক্যাটাগরি তৈরি করুন"
                  >
                    <FolderPlus size={15} />
                    কাস্টম ক্যাটাগরি
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Multi-Category Filter Bar & Search */}
          <div className="neo-card p-4 bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              {/* Category Pills with Multi-Select capability */}
              <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
                <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mr-1">
                  <Filter size={13} />
                  ক্যাটাগরি ফিল্টার:
                </span>

                {/* All / Reset Button */}
                <button
                  onClick={() => handleToggleCategory('ALL')}
                  className={`px-3 py-1.5 text-xs font-black rounded-full transition cursor-pointer ${
                    selectedCategories.length === 0
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  সকল কাজ ({toBengaliNumber(portfolioItems.length)})
                </button>

                {/* Category Chips */}
                {portfolioCategories.map(cat => {
                  const isSelected = selectedCategories.includes(cat);
                  const count = portfolioItems.filter(p => p.category === cat).length;
                  return (
                    <div key={cat} className="relative group inline-flex items-center">
                      <button
                        onClick={() => handleToggleCategory(cat)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-full transition cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 text-white shadow-sm font-black'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {isSelected ? <CheckSquare size={13} className="stroke-[3]" /> : <Square size={13} />}
                        <span>{cat}</span>
                        <span className="text-[10px] opacity-80">({toBengaliNumber(count)})</span>
                      </button>

                      {/* Admin Delete Category Button */}
                      {isAdmin && portfolioCategories.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`আপনি কি "${cat}" ক্যাটাগরিটি মুছে ফেলতে চান?`)) {
                              onDeleteCategory(cat);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 transition p-1 hover:text-rose-600 text-slate-400 cursor-pointer ml-0.5"
                          title="ক্যাটাগরি মুছুন"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="কাজ বা ডেকোরেশন খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs font-medium rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-purple-500 focus:outline-none transition shadow-inner"
                />
              </div>
            </div>

            {selectedCategories.length > 0 && (
              <div className="flex items-center gap-2 pt-1 text-[11px] font-bold text-slate-600 border-t border-slate-200">
                <span>নির্বাচিত ক্যাটাগরি:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedCategories.map(cat => (
                    <span key={cat} className="bg-gradient-to-r from-purple-50 to-rose-50 text-purple-900 border border-purple-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 text-[11px]">
                      {cat}
                      <X size={11} className="cursor-pointer hover:text-rose-600" onClick={() => handleToggleCategory(cat)} />
                    </span>
                  ))}
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="text-xs text-rose-600 font-bold underline cursor-pointer ml-1"
                  >
                    রিসেট
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Portfolio Grid */}
          {filteredPortfolio.length === 0 ? (
            <div className="neo-card p-12 text-center bg-white border border-slate-200 shadow-md space-y-3">
              <Sparkles size={36} className="mx-auto text-amber-500" />
              <h3 className="text-sm font-black uppercase text-slate-800">এই ক্যাটাগরিতে কোনো ছবি পাওয়া যায়নি</h3>
              <p className="text-xs font-medium text-slate-500">অন্য ক্যাটাগরি নির্বাচন করুন অথবা নতুন ছবি যোগ করুন।</p>
              <button
                onClick={() => setSelectedCategories([])}
                className="neo-btn neo-btn-primary px-4 py-2 text-xs uppercase font-black"
              >
                সকল ক্যাটাগরি দেখুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPortfolio.map((item, idx) => {
                const originalItem = portfolioItems.find(p => p.id === item.id);
                const itemImages = item.images && item.images.length > 0 ? item.images : (item.url ? [item.url] : []);
                const currentImgIdx = (activeCardImageIdx[item.id] !== undefined && activeCardImageIdx[item.id] < itemImages.length) 
                  ? activeCardImageIdx[item.id] 
                  : 0;
                const activePhotoUrl = itemImages[currentImgIdx] || item.url;

                return (
                  <div 
                    key={item.id}
                    className="group neo-card bg-white border border-slate-200/90 shadow-md hover:shadow-xl overflow-hidden hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Photo Container with Multi-Photo cycling & Hover Zoom */}
                    <div className="relative h-60 w-full overflow-hidden bg-slate-900 border-b border-slate-100">
                      <img
                        src={activePhotoUrl}
                        alt={item.title}
                        onClick={() => handlePlayCategorySlide(item)}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500 cursor-pointer"
                      />

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                        <span className="bg-gradient-to-r from-slate-950/90 to-purple-950/90 text-amber-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-amber-400/40 shadow-sm backdrop-blur-md">
                          {item.category}
                        </span>

                        {/* Multiple Photos Count Badge */}
                        {itemImages.length > 1 && (
                          <span className="bg-gradient-to-r from-rose-600 to-amber-500 text-white text-[10px] font-black px-2 py-0.8 rounded-full shadow-md flex items-center gap-1 backdrop-blur-md border border-white/30">
                            <ImageIcon size={11} className="stroke-[2.5]" />
                            <span>{toBengaliNumber(itemImages.length)} টি ছবি</span>
                          </span>
                        )}
                      </div>

                      {/* Admin Edit & Delete Actions */}
                      {isAdmin && originalItem && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                          <button
                            onClick={(e) => handleOpenEditPortfolio(originalItem, e)}
                            className="p-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 rounded-lg shadow-md cursor-pointer transition hover:scale-105"
                            title="এডিট করুন ও আরও ছবি যুক্ত করুন"
                          >
                            <Edit2 size={13} className="stroke-[2.5]" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`আপনি কি "${item.title}" মুছে ফেলতে চান?`)) {
                                onDeletePortfolioItem(item.id);
                              }
                            }}
                            className="p-1.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-lg shadow-md cursor-pointer transition hover:scale-105"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={13} className="stroke-[2.5]" />
                          </button>
                        </div>
                      )}

                      {/* Photo Cycling Navigation Controls (if multiple photos) */}
                      {itemImages.length > 1 && (
                        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveCardImageIdx(prev => ({
                                ...prev,
                                [item.id]: (currentImgIdx - 1 + itemImages.length) % itemImages.length
                              }));
                            }}
                            className="p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition pointer-events-auto cursor-pointer border border-white/20 shadow-md"
                            title="আগের ছবি"
                          >
                            <ChevronDown size={14} className="rotate-90 stroke-[3]" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveCardImageIdx(prev => ({
                                ...prev,
                                [item.id]: (currentImgIdx + 1) % itemImages.length
                              }));
                            }}
                            className="p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition pointer-events-auto cursor-pointer border border-white/20 shadow-md"
                            title="পরের ছবি"
                          >
                            <ChevronDown size={14} className="-rotate-90 stroke-[3]" />
                          </button>
                        </div>
                      )}

                      {/* Multi-Photo Thumbnail Dots Indicator */}
                      {itemImages.length > 1 && (
                        <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1 z-10">
                          {itemImages.slice(0, 6).map((_, dotIdx) => (
                            <button
                              key={dotIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveCardImageIdx(prev => ({ ...prev, [item.id]: dotIdx }));
                              }}
                              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                currentImgIdx === dotIdx ? 'w-4 bg-amber-400 shadow-xs' : 'w-1.5 bg-white/60 hover:bg-white'
                              }`}
                            />
                          ))}
                          {itemImages.length > 6 && (
                            <span className="text-[9px] text-amber-300 font-bold bg-black/60 px-1 rounded">
                              +{itemImages.length - 6}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Hover Overlay for Slide View */}
                      <div 
                        onClick={() => handlePlayCategorySlide(item)}
                        className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4 cursor-pointer"
                      >
                        <div className="bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 text-white px-3.5 py-1.5 text-xs font-black uppercase rounded-full flex items-center gap-1.5 shadow-lg transform group-hover:scale-105 transition">
                          <Eye size={14} className="stroke-[2.5]" />
                          ফুল স্ক্রিন স্লাইড ({toBengaliNumber(itemImages.length)} টি ছবি)
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 
                            onClick={() => handlePlayCategorySlide(item)}
                            className="text-xs font-black text-slate-900 uppercase tracking-tight group-hover:text-purple-700 transition cursor-pointer"
                          >
                            {item.title}
                          </h4>
                        </div>
                        {item.description && (
                          <p className="text-[11px] font-medium text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Tags & Price Range */}
                      <div className="pt-2.5 border-t border-slate-100 space-y-2">
                        {item.highlightTags && item.highlightTags.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {item.highlightTags.slice(0, 3).map((tag, tIdx) => (
                              <span key={tIdx} className="bg-purple-50 text-purple-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-purple-200">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] font-bold">
                          {item.estimatedCost ? (
                            <span className="text-emerald-600 font-black">
                              বাজেট: {formatCurrency(item.estimatedCost)}
                            </span>
                          ) : (
                            <span className="text-slate-400">কাস্টম বাজেট</span>
                          )}
                          <button
                            onClick={() => handlePlayCategorySlide(item)}
                            className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-rose-600 font-black uppercase flex items-center gap-1 text-[10px] hover:opacity-80 cursor-pointer"
                          >
                            স্লাইড প্লে ({toBengaliNumber(itemImages.length)}) ▶
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 🌟 Modal: Add / Edit Portfolio Item with Unlimited Multi-Photo Upload */}
      {isPortfolioModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border-4 border-black p-5 sm:p-6 relative max-w-2xl w-full shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsPortfolioModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black cursor-pointer z-10"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>

            <h3 className="text-sm sm:text-base font-black uppercase text-black border-b-2 border-black pb-3 mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-yellow-500" />
              {editingPortfolioItem ? 'পোর্টফোলিও ডেকোরেশন এডিট ও ছবি ব্যবস্থাপনা' : 'নতুন পোর্টফোলিও ও মাল্টিপল ফটো আপলোড'}
            </h3>

            <form onSubmit={handleSavePortfolio} className="space-y-4 text-xs font-bold text-black">
              <div>
                <label className="block mb-1">কাজের শিরোনাম (Title) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: প্রিমিয়াম গোল্ডেন ওয়েডিং স্টেজ ও লাইটিং ডেকোরেশন"
                  value={portfolioTitle}
                  onChange={(e) => setPortfolioTitle(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black bg-slate-50 focus:bg-white rounded-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">ক্যাটাগরি *</label>
                  <select
                    value={portfolioCategory}
                    onChange={(e) => setPortfolioCategory(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black bg-white font-bold"
                  >
                    {portfolioCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">আনুমানিক বাজেট (BDT)</label>
                  <input
                    type="number"
                    value={portfolioCost}
                    onChange={(e) => setPortfolioCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border-2 border-black bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* 🌟 Multi-Photo Upload & Gallery Management Box */}
              <div className="p-3.5 bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-rose-500/10 border-2 border-black rounded space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                    <ImageIcon size={16} className="text-purple-700" />
                    <span>মাল্টিপল ফটো আপলোড ও স্লাইডশো গ্যালারি *</span>
                  </label>
                  <span className="text-[11px] font-black bg-purple-950 text-amber-300 px-2.5 py-0.5 rounded-full">
                    মোট {toBengaliNumber(portfolioImages.length)} টি ছবি যুক্ত রয়েছে
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                  ডিভাইস থেকে একসাথে একাধিক ছবি নির্বাচন করুন অথবা ছবির ওয়েব লিংক দিন। যেকোনো সময় ছবি ডিলিট বা নতুন আরও ছবি যুক্ত করতে পারবেন।
                </p>

                {/* Multi-File Upload Dropzone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* File Upload Trigger */}
                  <div className="border-2 border-dashed border-black bg-white p-3 text-center cursor-pointer hover:bg-amber-50/50 relative rounded transition flex flex-col items-center justify-center">
                    <Upload size={22} className="text-purple-700 mb-1" />
                    <span className="text-[11px] block font-black text-slate-900">
                      কম্পিউটার/মোবাইল থেকে ছবি আপলোড করুন
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      (একসাথে একাধিক ছবি সিলেক্ট করা যাবে)
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMultipleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>

                  {/* Batch URL Adder */}
                  <div className="bg-white border-2 border-black p-2.5 rounded flex flex-col justify-between gap-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-700">অথবা ওয়েব লিংক থেকে ছবি যোগ করুন:</span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="https://... ইমেজ লিংক পেস্ট করুন"
                        value={newImageUrlInput}
                        onChange={(e) => setNewImageUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddUrlImage();
                          }
                        }}
                        className="flex-1 px-2 py-1.5 border border-black text-[11px] bg-slate-50 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddUrlImage}
                        className="px-2.5 py-1.5 bg-black text-white text-xs font-black uppercase hover:bg-slate-800 cursor-pointer"
                      >
                        + যোগ
                      </button>
                    </div>
                  </div>
                </div>

                {/* Uploaded Photos Grid with Delete & Cover selection */}
                {portfolioImages.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>যুক্ত করা ছবিসমূহ ({toBengaliNumber(portfolioImages.length)} টি):</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          if (window.confirm('আপনি কি এই ডেকোরেশনের সকল আপলোড করা ছবি মুছে ফেলতে চান?')) {
                            setPortfolioImages([]);
                            setPortfolioUrl('');
                          }
                        }}
                        className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline font-black cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        সবগুলো ছবি মুছুন
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-2 bg-white border-2 border-black rounded">
                      {portfolioImages.map((imgUrl, imgIdx) => {
                        const isCover = portfolioUrl === imgUrl || (!portfolioUrl && imgIdx === 0);
                        return (
                          <div
                            key={imgIdx}
                            className={`relative rounded-lg border-2 overflow-hidden bg-slate-50 transition flex flex-col justify-between shadow-xs ${
                              isCover ? 'border-amber-500 ring-2 ring-amber-400 bg-amber-50/20' : 'border-slate-300 hover:border-slate-800'
                            }`}
                          >
                            {/* Image Thumbnail */}
                            <div className="relative aspect-[4/3] w-full bg-slate-200 overflow-hidden">
                              <img
                                src={imgUrl}
                                alt={`ডেকোরেশন ছবি ${imgIdx + 1}`}
                                className="w-full h-full object-cover"
                              />

                              {/* Active Cover Badge */}
                              {isCover ? (
                                <div className="absolute top-1.5 left-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                                  <span>★</span> মূল প্রচ্ছদ
                                </div>
                              ) : (
                                <div className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.2 rounded backdrop-blur-xs">
                                  ছবি #{toBengaliNumber(imgIdx + 1)}
                                </div>
                              )}
                            </div>

                            {/* Clean, Non-Overlapping Action Toolbar */}
                            <div className="p-1.5 bg-slate-100 border-t border-slate-300 flex flex-col gap-1">
                              {/* Sub-photo custom title or budget badge if exists */}
                              {(() => {
                                const detail = portfolioPhotoDetails.find(p => p.url === imgUrl) || portfolioPhotoDetails[imgIdx];
                                if (detail && (detail.title || detail.estimatedCost !== undefined)) {
                                  return (
                                    <div className="text-[9px] bg-slate-200 px-1.5 py-0.5 rounded flex items-center justify-between text-slate-800 font-bold truncate">
                                      <span className="truncate">{detail.title || `ছবি ${toBengaliNumber(imgIdx + 1)}`}</span>
                                      {detail.estimatedCost !== undefined && (
                                        <span className="text-emerald-700 font-black ml-1">৳{toBengaliNumber(detail.estimatedCost)}</span>
                                      )}
                                    </div>
                                  );
                                }
                                return null;
                              })()}

                              <div className="flex items-center gap-1">
                                {isCover ? (
                                  <span className="flex-1 text-[10px] font-black text-amber-700 bg-amber-100 py-1 px-1 rounded text-center truncate">
                                    ✓ প্রচ্ছদ
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleSetCoverPhoto(imgUrl);
                                    }}
                                    className="flex-1 py-1 px-1 bg-amber-400 hover:bg-amber-500 text-slate-950 text-[10px] font-black rounded uppercase cursor-pointer transition text-center truncate"
                                    title="এই ছবিটিকে কার্ডের প্রচ্ছদ ছবি হিসেবে সেট করুন"
                                  >
                                    প্রচ্ছদ
                                  </button>
                                )}

                                {/* Specific Photo Detail / Budget Edit Button */}
                                <button
                                  type="button"
                                  onClick={(e) => handleOpenPhotoDetailEditor(imgIdx, e)}
                                  className="py-1 px-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded cursor-pointer transition flex items-center gap-0.5 shrink-0"
                                  title="এই নির্দিষ্ট ছবির আলাদা শিরোনাম, বাজেট ও বিবরণ যোগ করুন"
                                >
                                  <Sliders size={10} />
                                  <span>বিবরণ</span>
                                </button>

                                {/* Explicit Delete Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemovePhoto(imgIdx);
                                  }}
                                  className="py-1 px-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black rounded cursor-pointer transition flex items-center gap-0.5 shrink-0"
                                  title="এই ছবিটি তালিকা থেকে মুছে ফেলুন"
                                >
                                  <Trash2 size={10} />
                                  <span>মুছুন</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Add more photo card */}
                      <label className="aspect-[4/3] border-2 border-dashed border-purple-400 hover:border-purple-600 bg-purple-50/50 hover:bg-purple-100/60 rounded-lg flex flex-col items-center justify-center cursor-pointer transition text-purple-800 p-2 text-center">
                        <Plus size={24} className="stroke-[3] mb-1" />
                        <span className="text-[11px] font-black">আরও ছবি যোগ করুন</span>
                        <span className="text-[9px] text-purple-600 font-medium">ক্লিক করে ফাইল সিলেক্ট</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleMultipleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center bg-white border-2 border-dashed border-slate-300 rounded text-slate-500 text-xs font-medium">
                    এখনো কোনো ছবি আপলোড করা হয়নি। উপরে ফাইল নির্বাচন করুন বা ওয়েব লিংক দিন।
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">ইভেন্টের নাম (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    placeholder="যেমন: গ্র্যান্ড রিসেপশন ২০২৫"
                    value={portfolioEventName}
                    onChange={(e) => setPortfolioEventName(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block mb-1">ক্লায়েন্টের নাম (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    placeholder="যেমন: ড. মাহমুদ"
                    value={portfolioCustomerName}
                    onChange={(e) => setPortfolioCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">হাইলাইটস ট্যাগ (কমা দিয়ে আলাদা করুন)</label>
                <input
                  type="text"
                  placeholder="রয়্যাল লুক, প্রাকৃতিক ফুল, নিওন লাইটিং, আর্চ স্টেজ"
                  value={portfolioTags}
                  onChange={(e) => setPortfolioTags(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black bg-slate-50 focus:bg-white text-[11px]"
                />
              </div>

              <div>
                <label className="block mb-1">কাজের বিস্তারিত বর্ণনা</label>
                <textarea
                  rows={2}
                  placeholder="ডেকোরেশনের থিম, ব্যবহৃত মালামাল ও স্পেশাল আলোকের বিবরণ..."
                  value={portfolioDescription}
                  onChange={(e) => setPortfolioDescription(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setIsPortfolioModalOpen(false)}
                  className="flex-1 py-2.5 border-2 border-black bg-white hover:bg-slate-100 font-black cursor-pointer uppercase text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 border-2 border-black bg-yellow-400 hover:bg-yellow-500 text-black font-black uppercase text-xs cursor-pointer shadow-sm"
                >
                  {editingPortfolioItem ? 'আপডেট সংরক্ষণ করুন' : 'পোর্টফোলিও প্রকাশ করুন'}
                </button>
              </div>
            </form>

            {/* 🌟 Nested Modal / Popover: Edit Individual Photo Detail & Budget */}
            {activePhotoDetailEditIdx !== null && portfolioImages[activePhotoDetailEditIdx] && (
              <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-[70] animate-fadeIn">
                <div className="bg-white border-4 border-black p-5 relative max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-slate-900">
                  <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                    <h4 className="text-xs font-black uppercase flex items-center gap-1.5 text-indigo-900">
                      <Sliders size={15} className="text-indigo-600" />
                      ছবি #{toBengaliNumber(activePhotoDetailEditIdx + 1)} এর আলাদা তথ্য ও বাজেট
                    </h4>
                    <button
                      type="button"
                      onClick={() => setActivePhotoDetailEditIdx(null)}
                      className="p-1 border-2 border-black bg-white hover:bg-rose-100 text-black cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Photo Preview */}
                  <div className="flex items-center gap-3 bg-slate-100 p-2 border-2 border-slate-300 rounded mb-3">
                    <img
                      src={portfolioImages[activePhotoDetailEditIdx]}
                      alt="Selected"
                      className="w-16 h-12 object-cover border border-black rounded shrink-0"
                    />
                    <div className="text-[11px] font-bold text-slate-700">
                      <p className="text-slate-950 font-black">নির্দিষ্ট ছবির কাস্টমাইজেশন</p>
                      <p className="text-[10px] text-slate-500">
                        এই তথ্যগুলো ভিডিও ও PDF ব্রোশিউরে এই ছবির স্লাইডে প্রদর্শিত হবে।
                      </p>
                    </div>
                  </div>

                  <form onSubmit={(e) => handleSavePhotoDetail(activePhotoDetailEditIdx, e)} className="space-y-3 text-xs font-bold">
                    <div>
                      <label className="block mb-1 text-slate-800">ছবির আলাদা নাম / স্পট টাইটেল</label>
                      <input
                        type="text"
                        placeholder="যেমন: মূল বিয়ের স্টেজ, ফটো বুথ কর্নার, এন্ট্রি আর্চগেট"
                        value={tempPhotoTitle}
                        onChange={(e) => setTempPhotoTitle(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black bg-slate-50 focus:bg-white text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-800">এই অংশের বাজেট (টাকা ৳)</label>
                      <input
                        type="number"
                        placeholder="যেমন: ২৫০০০"
                        value={tempPhotoCost}
                        onChange={(e) => setTempPhotoCost(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border-2 border-black bg-slate-50 focus:bg-white text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-800">ছবির আলাদা হাইলাইটস (কমা দিয়ে লিখুন)</label>
                      <input
                        type="text"
                        placeholder="যেমন: রোজ ফ্লাওয়ার, এলইডি প্যানেল, গোল্ডেন ফ্রেম"
                        value={tempPhotoTags}
                        onChange={(e) => setTempPhotoTags(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black bg-slate-50 focus:bg-white text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-800">এই অংশের ডেকোরেশন বিবরণ</label>
                      <textarea
                        rows={2}
                        placeholder="এই নির্দিষ্ট অংশের বিবরণ বা ম্যাটেরিয়ালসের তালিকা..."
                        value={tempPhotoDescription}
                        onChange={(e) => setTempPhotoDescription(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black bg-slate-50 focus:bg-white text-xs font-medium"
                      />
                    </div>

                    <div className="flex gap-2 pt-2 border-t-2 border-black">
                      <button
                        type="button"
                        onClick={() => setActivePhotoDetailEditIdx(null)}
                        className="flex-1 py-2 border-2 border-black bg-white hover:bg-slate-100 font-black cursor-pointer uppercase text-xs"
                      >
                        বাতিল
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 border-2 border-black bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs cursor-pointer shadow-sm"
                      >
                        সংরক্ষণ করুন
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🌟 Modal: Add Custom Category */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border-4 border-black p-6 relative max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <button
              onClick={() => setIsAddCategoryOpen(false)}
              className="absolute right-3 top-3 p-1.5 border-2 border-black bg-white hover:bg-slate-100 text-black cursor-pointer"
            >
              <X size={15} />
            </button>
            <h4 className="text-xs font-black uppercase text-black border-b-2 border-black pb-2 mb-3 flex items-center gap-1.5">
              <FolderPlus size={15} className="text-yellow-500" />
              নতুন কাস্টম ক্যাটাগরি তৈরি
            </h4>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block mb-1">ক্যাটাগরির নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মেহেন্দি নাইট, ফোয়ার ডেকোরেশন"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black bg-slate-50 focus:bg-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="flex-1 py-1.5 border-2 border-black bg-white font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 border-2 border-black bg-yellow-400 font-black uppercase shadow-[1px_1px_0px_0px_#000000]"
                >
                  ক্যাটাগরি যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. Online Booking Form Simulator (Client View) */}
      {activeTab === 'booking-form' && (
        <OnlineBookingSection 
          onAddOnlineBooking={onAddOnlineBooking}
        />
      )}

      {/* 2. Online Booking Requests Inbox (Admin / Staff Only) */}
      {activeTab === 'inbox' && canEdit && (
        <BookingRequestsInbox
          onlineBookings={onlineBookings}
          onUpdateBookingStatus={onUpdateBookingStatus || ((bookingId, status, notes) => {
            if (status === 'Confirmed') onApproveBooking(bookingId);
            else if (status === 'Cancelled') onDeclineBooking(bookingId);
          })}
          onApproveBooking={onApproveBooking}
          onDeclineBooking={onDeclineBooking}
          onDeleteBooking={onDeleteBooking}
          canEdit={canEdit}
          userRole={userRole}
        />
      )}

      {/* 3. Customer Portal Simulator (Admin / Staff Only) */}
      {activeTab === 'portal' && canEdit && (
        <div className="space-y-6" id="customer-portal-sim">
          <div className="neo-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-black flex items-center gap-1.5">
                <User size={16} className="text-indigo-600 stroke-[2.5]" />
                কাস্টমার পোর্টাল ভিউয়ার
              </h3>
              <p className="text-[10px] text-slate-700 mt-1">যেকোনো গ্রাহক সিলেক্ট করে তার পোর্টালের লাইভ ইন্টারফেস ও বিল দেখতে পারেন।</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-black shrink-0">গ্রাহক নির্বাচন:</span>
              <select
                value={portalCustomerId}
                onChange={(e) => setPortalCustomerId(e.target.value)}
                className="px-3 py-1.5 border-2 border-black font-bold text-xs shadow-[2px_2px_0px_0px_#000000] bg-white w-full sm:w-60 focus:outline-none"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>
                ))}
              </select>
            </div>
          </div>

          {!portalCustomer ? (
            <div className="py-10 text-center text-xs font-bold text-slate-500 uppercase">
              দয়া করে প্রথমে কাস্টমার ট্যাবে গিয়ে গ্রাহক যোগ করুন।
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="portal-dashboard">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
                  <div className="border-b-3 border-black pb-3 flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-black text-black">গ্রাহকের নাম: {portalCustomer.name}</h4>
                      <p className="text-xs text-slate-600 font-mono">মোবাইল: {toBengaliNumber(portalCustomer.mobile)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-rose-500 font-black block uppercase">মোট বকেয়া পরিমাণ</span>
                      <span className="text-2xl font-sans font-black text-rose-600">
                        {formatCurrency(totalDueAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <a
                      href={getWhatsAppLink(
                        portalCustomer.mobile,
                        `প্রিয় ${portalCustomer.name},\nরিত্তিকা ইভেন্ট ম্যানেজমেন্ট থেকে আপনার বুকিং অনুযায়ী মোট বকেয়া ৳${totalDueAmount} টাকা পরিশোধ করার জন্য অনুরোধ করা হচ্ছে।\nধন্যবাদ।`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white border-2 border-black text-[10px] font-black uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                    >
                      <Share2 size={12} className="stroke-[2.5]" />
                      বকেয়া তাগিদ WhatsApp এ পাঠান
                    </a>
                  </div>
                </div>

                {/* Event Bookings */}
                <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <h4 className="text-xs font-black uppercase border-b-2 border-black pb-2 mb-4">আমার ইভেন্ট বুকিং তালিকা</h4>
                  {customerEvents.length === 0 ? (
                    <p className="text-xs text-slate-500 font-bold py-6 text-center">কোন বুকিং পাওয়া যায়নি।</p>
                  ) : (
                    <div className="space-y-3">
                      {customerEvents.map(ev => (
                        <div key={ev.id} className="p-3 border-2 border-black bg-slate-50 text-xs font-bold space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-black">{ev.name}</span>
                            <span className={`px-2 py-0.5 border border-black text-[9px] uppercase font-black ${
                              ev.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                              ev.status === 'Ongoing' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100'
                            }`}>
                              {ev.status === 'Completed' ? 'সম্পন্ন' : ev.status === 'Ongoing' ? 'চলমান' : 'বুকড করা'}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-600 text-[10px]">
                            <span>তারিখ: {toBengaliNumber(ev.date)}</span>
                            <span className="font-sans font-black">বাজেট: {formatCurrency(ev.budget)} (পরিশোধিত: {formatCurrency(ev.paidAmount)})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rental tracker */}
                <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <h4 className="text-xs font-black uppercase border-b-2 border-black pb-2 mb-4">আমার ভাড়া পণ্য তালিকা</h4>
                  {customerRentals.length === 0 ? (
                    <p className="text-xs text-slate-500 font-bold py-6 text-center">কোন ভাড়া পণ্য পাওয়া যায়নি।</p>
                  ) : (
                    <div className="space-y-3">
                      {customerRentals.map(r => (
                        <div key={r.id} className="p-3 border-2 border-black bg-slate-50 text-xs font-bold space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-slate-800">কোড: {r.itemCode} (পরিমাণ: {toBengaliNumber(r.qty)}টি)</span>
                            <span className={`px-2 py-0.5 border border-black text-[9px] uppercase font-black ${
                              r.status === 'Returned' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {r.status === 'Returned' ? 'ফেরত এসেছে' : 'ভাড়ায় আউট'}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-600 text-[10px]">
                            <span>ফেরতের তারিখ: {toBengaliNumber(r.expectedReturnDate)}</span>
                            <span className="font-sans font-black">বকেয়া: {formatCurrency(r.dueAmount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Digital Signature */}
              <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
                <h4 className="text-xs font-black uppercase border-b-2 border-black pb-2 flex items-center gap-1">
                  <PenTool size={14} className="text-rose-600" />
                  ডিজিটাল চুক্তি স্বাক্ষর (Contract Signature)
                </h4>
                <p className="text-[10px] text-slate-600 leading-normal font-sans">
                  কাস্টমার ভেন্যু বুকিং ও মালামাল ভাড়ার দায়িত্ব ও শর্তাবলী মেনে নিচে তার স্বাক্ষর প্রদান করবেন।
                </p>

                <div className="border-4 border-black bg-slate-50 relative h-48 cursor-crosshair">
                  <canvas
                    ref={canvasRef}
                    width={260}
                    height={180}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-full"
                  />
                  <div className="absolute top-2 right-2 text-[9px] uppercase font-black bg-white/80 border border-black px-1">
                    Sign Here
                  </div>
                </div>

                <div className="flex gap-2 text-xs">
                  <button
                    onClick={clearCanvas}
                    className="flex-1 py-1.5 border-2 border-black bg-white hover:bg-slate-100 font-black cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                  >
                    মুছে ফেলুন (Clear)
                  </button>
                  <button
                    onClick={saveCanvasSignature}
                    className="flex-1 py-1.5 border-2 border-black bg-yellow-400 hover:bg-yellow-500 text-black font-black cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                  >
                    স্বাক্ষর সেভ করুন
                  </button>
                </div>

                {attachments.filter(a => a.relatedId === portalCustomerId && a.name.includes('Signature')).length > 0 && (
                  <div className="pt-3 border-t-2 border-dashed border-black/10">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">সংরক্ষিত গ্রাহক সিগনেচার:</span>
                    <div className="border border-black bg-white p-2 mt-1">
                      <img
                        src={attachments.find(a => a.relatedId === portalCustomerId && a.name.includes('Signature'))?.dataUrl}
                        alt="Digital Signature"
                        className="max-h-20 mx-auto object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Document uploads manager (Admin / Staff Only) */}
      {activeTab === 'documents' && canEdit && (
        <div className="space-y-4" id="documents-manager-panel">
          {/* Security Alert if not logged in */}
          {!canEdit && (
            <div className="p-3 bg-amber-50 border-2 border-amber-500 text-amber-900 text-xs font-bold flex items-center gap-2">
              <Lock size={16} className="text-amber-600 shrink-0" />
              <span>নিরাপত্তা নীতি: দলিল বা নথি আপলোড ও ডিলিট করতে অনুমোদিত অ্যাডমিন বা ম্যানেজার হিসেবে লগইন প্রয়োজন। সাধারণ ব্যবহারকারীরা শুধুমাত্র ভিউ করতে পারবেন।</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form (Only for canEdit) */}
            <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] h-fit space-y-4">
              <h4 className="text-xs font-black uppercase border-b-2 border-black pb-2 flex items-center justify-between">
                <span>নতুন নথি / ছবি সংযুক্তি</span>
                {!canEdit && <Lock size={14} className="text-slate-400" />}
              </h4>
              
              <div className="space-y-3 text-xs font-bold">
                <div>
                  <label className="block mb-1">ফাইলের শিরোনাম/নাম *</label>
                  <input
                    type="text"
                    disabled={!canEdit}
                    placeholder="যেমন: কাস্টমার NID, রিসিট কপি"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black bg-white font-bold disabled:bg-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">নথিপত্র ধরণ</label>
                    <select
                      disabled={!canEdit}
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-black bg-white font-bold disabled:bg-slate-100"
                    >
                      <option value="NID">জাতীয় পরিচয়পত্র (NID)</option>
                      <option value="Contract">চুক্তিপত্র (Contract)</option>
                      <option value="Receipt">টাকা জমা রিসিট (Receipt)</option>
                      <option value="Photo">ইভেন্ট সাইট ফটো (Photo)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">কার সাথে সম্পর্কিত?</label>
                    <select
                      disabled={!canEdit}
                      value={docRelatedId}
                      onChange={(e) => setDocRelatedId(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-black bg-white font-bold disabled:bg-slate-100"
                    >
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1">ফাইল আপলোড করুন *</label>
                  <div className={`border-4 border-dashed border-black bg-slate-50 p-4 text-center relative ${
                    canEdit ? 'cursor-pointer hover:bg-slate-100' : 'opacity-60 cursor-not-allowed'
                  }`}>
                    <Upload size={24} className="mx-auto text-slate-500 mb-2 stroke-[2.5]" />
                    <span className="text-[11px] block text-slate-700 font-bold">
                      {canEdit ? 'ক্লিক করে ফাইল সিলেক্ট করুন' : 'আপলোড করতে লগইন করুন'}
                    </span>
                    {canEdit && (
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        multiple
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Files Gallery */}
            <div className="lg:col-span-2 bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4 flex-wrap gap-2">
                <h4 className="text-xs font-black uppercase flex items-center gap-1.5">
                  <FileText size={15} />
                  সংরক্ষিত নথিপত্র ও গ্যালারি তালিকা
                </h4>
                {imageAttachments.length > 0 && (
                  <button
                    onClick={() => setDocLightboxIdx(0)}
                    className="neo-btn px-3 py-1 text-xs bg-yellow-400 hover:bg-yellow-500 font-black uppercase flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000000]"
                    title="ফুল স্ক্রিন স্লাইডশো মোডে সকল ছবি দেখুন"
                  >
                    <Eye size={13} className="stroke-[2.5]" />
                    ফুল স্ক্রিন স্লাইডার ({toBengaliNumber(imageAttachments.length)})
                  </button>
                )}
              </div>

              {attachments.length === 0 ? (
                <div className="py-12 text-center text-xs font-bold text-slate-500 uppercase">
                  কোন সংযুক্ত দলিল বা ছবি পাওয়া যায়নি।
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {attachments.map(att => {
                    const relatedCust = customers.find(c => c.id === att.relatedId);
                    const isImage = att.dataUrl.startsWith('data:image');
                    const imageIdx = isImage ? imageAttachments.findIndex(img => img.id === att.id) : -1;

                    return (
                      <div key={att.id} className="border-2 border-black bg-slate-50 p-3 space-y-3 text-xs font-bold shadow-[2px_2px_0px_0px_#000000]">
                        <div className="flex items-start justify-between gap-2 border-b border-black/10 pb-2">
                          <div>
                            <span className="font-black text-black block truncate max-w-[150px]">{att.name}</span>
                            <span className="text-[9px] text-indigo-700 block mt-0.5 font-sans">টাইপ: {att.type} | {toBengaliNumber(att.date)}</span>
                            {relatedCust && <span className="text-[9px] text-slate-500 block">কাস্টমার: {relatedCust.name}</span>}
                          </div>
                          <div className="flex items-center gap-1">
                            {isImage && (
                              <button
                                onClick={() => setDocLightboxIdx(imageIdx >= 0 ? imageIdx : 0)}
                                className="p-1 border border-black hover:bg-yellow-400 text-black cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded"
                                title="ফুল স্ক্রিন জুম ও স্লাইড"
                              >
                                <Eye size={12} />
                              </button>
                            )}
                            {canEdit && (
                              <button
                                onClick={() => onDeleteAttachment(att.id)}
                                className="p-1 border border-black hover:bg-red-200 text-rose-700 cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Display image preview */}
                        {isImage ? (
                          <div 
                            onClick={() => setDocLightboxIdx(imageIdx >= 0 ? imageIdx : 0)}
                            className="group relative border border-black bg-white p-1 overflow-hidden h-36 flex items-center justify-center cursor-pointer hover:border-yellow-400 transition"
                          >
                            <img
                              src={att.dataUrl}
                              alt={att.name}
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-200"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="bg-yellow-400 text-black px-2 py-1 text-[10px] font-black uppercase rounded border border-black flex items-center gap-1">
                                <Eye size={10} /> জুম ও স্লাইড
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-200 p-4 text-center text-slate-700 border border-black/15">
                            <FileText size={24} className="mx-auto text-slate-500 mb-1" />
                            <span className="text-[10px] font-black uppercase">পিডিএফ / ফাইল নথি</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for Portfolio Showcase (Plays Filtered/Category-Isolated Items) */}
      <ImageGalleryLightbox
        isOpen={portfolioLightboxIdx !== null}
        onClose={() => {
          setPortfolioLightboxIdx(null);
          setActiveSlideItems(null);
        }}
        initialIndex={portfolioLightboxIdx ?? 0}
        items={activeSlideItems && activeSlideItems.length > 0 ? activeSlideItems : filteredPortfolio}
        title="রিত্তিকা ইভেন্ট ম্যানেজমেন্ট পোর্টফোলিও শোকেস"
        canDelete={isAdmin}
        onDelete={(id) => {
          onDeletePortfolioItem(id);
        }}
      />

      {/* Lightbox for Document Attachments */}
      <ImageGalleryLightbox
        isOpen={docLightboxIdx !== null}
        onClose={() => setDocLightboxIdx(null)}
        initialIndex={docLightboxIdx ?? 0}
        items={imageAttachments}
        title="সংযুক্ত নথিপত্র ও ছবি গ্যালারি"
        canDelete={canEdit}
        onDelete={(id) => {
          onDeleteAttachment(id);
        }}
      />

      {/* 🎬 Portal Video Rendering Progress Overlay */}
      {isExportingPortalVideo && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400/40 p-6 sm:p-8 rounded-2xl max-w-md w-full text-center shadow-2xl text-white space-y-4 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <Film size={28} className="text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase text-amber-300">
                সিনেমাটিক ভিডিও তৈরি হচ্ছে
              </h3>
              <p className="text-xs text-slate-300 font-medium mt-1">
                {portalVideoStatus || 'ছবি ও ট্রানজিশন প্রস্তুত হচ্ছে...'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
              <div 
                className="bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(5, portalVideoProgress)}%` }}
              />
            </div>
            <div className="text-xs font-mono font-bold text-amber-400">
              {toBengaliNumber(portalVideoProgress)}% সম্পন্ন
            </div>
            <p className="text-[11px] text-slate-400">
              ক্যানভাসে ফুল HD রেজোলিউশনে ছবিগুলো সিনেমাটিক ইফেক্টসহ রেন্ডার হচ্ছে...
            </p>
          </div>
        </div>
      )}

      {/* 🎬 Portal Generated Video Preview & Download Modal */}
      {portalGeneratedVideo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[120] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-950 border border-white/20 p-5 sm:p-6 rounded-2xl max-w-2xl w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-400" />
                <h3 className="text-sm sm:text-base font-black uppercase text-amber-300">
                  সিনেমাটিক ভিডিও তৈরি সম্পন্ন!
                </h3>
              </div>
              <button
                onClick={() => setPortalGeneratedVideo(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Video Player */}
            <div className="rounded-xl overflow-hidden bg-black border border-white/15 aspect-video flex items-center justify-center">
              <video 
                src={portalGeneratedVideo.blobUrl} 
                controls 
                autoPlay 
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
              <div className="text-xs text-slate-300">
                <span>ফাইলের আকার: </span>
                <span className="font-bold text-amber-300 font-mono">
                  {(portalGeneratedVideo.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                </span>
                <span className="ml-2 text-slate-400">({portalGeneratedVideo.fileName})</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPortalGeneratedVideo(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  বন্ধ করুন
                </button>
                <button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = portalGeneratedVideo.blobUrl;
                    a.download = portalGeneratedVideo.fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="px-5 py-2 bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-500 hover:to-rose-600 text-slate-950 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 shadow-lg cursor-pointer hover:scale-105 transition"
                >
                  <Download size={15} className="stroke-[2.5]" />
                  ভিডিও ডাউনলোড করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🌐 Live Showcase & Portal Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        defaultTab="portal"
        defaultSubTab={activeTab}
      />
    </div>
  );
}
