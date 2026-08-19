import { GalleryMediaItem } from '../components/ImageGalleryLightbox';

export const INITIAL_PORTFOLIO_CATEGORIES: string[] = [
  'বিবাহ ও সংবর্ধনা',
  'গায়ে হলুদ ও মেহেন্দি',
  'প্রবেশ তোরণ ও গেট',
  'ক্যাটারিং ও বুফে সেটআপ',
  'লাইটিং ও সাউন্ড',
  'জন্মদিন ও পার্টি',
  'কর্পোরেট ইভেন্ট'
];

export const SAMPLE_DECOR_PORTFOLIO: GalleryMediaItem[] = [
  {
    id: 'portfolio-1',
    title: 'রয়্যাল ওয়েডিং স্টেজ ও ফ্লোরাল ব্যাকড্রপ (Royal Wedding Stage)',
    category: 'বিবাহ ও সংবর্ধনা',
    eventName: 'গ্র্যান্ড ওয়েডিং রিসেপশন ২০২৫',
    customerName: 'ড. মাহমুদ ও পরিবার',
    date: '২০২৫-০১-১০',
    description: 'গোল্ডেন থিম, ফ্রেশ অর্কিড ও গোলাপের প্রিমিয়াম ফ্লোরাল সেটআপ, কাস্টম সোফা ও অ্যাম্বিয়েন্ট শ্যান্ডেলিয়ার লাইটিং।',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    estimatedCost: 180000,
    highlightTags: ['রয়্যাল লুক', 'প্রাকৃতিক অর্কিড', 'শ্যান্ডেলিয়ার লাইট', 'ভিআইপি স্টেজ'],
    colorPalette: ['#D4AF37', '#FFFFFF', '#800020']
  },
  {
    id: 'portfolio-2',
    title: 'হলুদ ও মেহেন্দি স্পেশাল সেটআপ (Gaye Holud Vibrant Stage)',
    category: 'গায়ে হলুদ ও মেহেন্দি',
    eventName: 'ঐতিহ্যবাহী হলুদ সন্ধ্যা',
    customerName: 'নুসরাত জাহান',
    date: '২০২৫-০১-১৪',
    description: 'গাঁদা ফুল, ডেকোরেটিভ রিকশা হুড, কাঠের ফ্রেম, পাটের কার্পেট এবং আধুনিক কালারফুল ফোক ফিউশন থিম।',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    estimatedCost: 65000,
    highlightTags: ['গাঁদা ফুল আর্ট', 'ঐতিহ্যবাহী রিকশা পেইন্ট', 'ফোক ভাইব', 'মেহেন্দি কর্নার'],
    colorPalette: ['#FFA500', '#FFD700', '#2E8B57']
  },
  {
    id: 'portfolio-3',
    title: 'গ্র্যান্ড এন্ট্রি তোরণ ও লাইটিং গেট (Grand Entrance Gate)',
    category: 'প্রবেশ তোরণ ও গেট',
    eventName: 'আন্তর্জাতিক বিজনেস সামিট ২০২৫',
    customerName: 'গ্লোবাল কর্পোরেট গ্রুপ',
    date: '২০২৫-০১-১৮',
    description: 'ম্যাসিভ ট্রাস স্ট্রাকচার, এলইডি ফ্লাড লাইট, নিওন সাইনেজ ও এক্সক্লুসিভ রেড কার্পেট ওয়েলকাম প্যাসেজ।',
    url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
    estimatedCost: 45000,
    highlightTags: ['ট্রাস গেট', 'রেড কার্পেট', 'এলইডি স্পটলাইট', 'কর্পোরেট এন্ট্রি'],
    colorPalette: ['#002244', '#C0C0C0', '#FF0000']
  },
  {
    id: 'portfolio-4',
    title: 'ভিআইপি ডাইনিং ও বুফে এরিয়া সেটআপ (VIP Dining & Buffet)',
    category: 'ক্যাটারিং ও বুফে সেটআপ',
    eventName: 'অ্যানুয়াল গালা ডিনার',
    customerName: 'প্রাইম ব্যাংক লিমিটেড',
    date: '২০২৫-০১-২২',
    description: 'গোল টেবিল, সিলভার ক্যান্ডেলস্ট্যান্ড, সাটিন সিল্ক রানার ও প্রিমিয়াম ক্রকারিজ ডেকোরেশন।',
    url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
    estimatedCost: 85000,
    highlightTags: ['ক্যান্ডেললাইট ডাইনিং', 'সাটিন সিল্ক রানার', 'ক্রকারিজ ডিসপ্লে', 'বুফে কাউন্টার'],
    colorPalette: ['#4B0082', '#FFFFFF', '#E6E6FA']
  },
  {
    id: 'portfolio-5',
    title: 'কনসার্ট ও ওপেন এয়ার স্টেজ লাইটিং (Concert & Stage Lighting)',
    category: 'লাইটিং ও সাউন্ড',
    eventName: 'বসন্ত উৎসব সঙ্গীত সন্ধ্যা',
    customerName: 'কালচারাল ক্লাব',
    date: '২০২৫-০১-২৮',
    description: 'শার্পি বিম লাইট, স্মোক এফেক্টস, এলইডি ওয়াল ব্যাকড্রপ এবং ক্রিস্টাল ক্লিয়ার জেবিএল লাইন-অ্যারে সাউন্ড।',
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    estimatedCost: 120000,
    highlightTags: ['শার্পি বিম', 'স্মোক মেশিন', 'লাইন-অ্যারে সাউন্ড', 'এলইডি ওয়াল'],
    colorPalette: ['#1E90FF', '#9400D3', '#00FF7F']
  },
  {
    id: 'portfolio-6',
    title: 'বার্থডে ও বেবি শাওয়ার পেস্টেল থিম (Pastel Theme Party)',
    category: 'জন্মদিন ও পার্টি',
    eventName: 'আরিয়ান এর ১ম জন্মদিন উৎসব',
    customerName: 'আসিফ ইকবাল',
    date: '২০২৫-০২-০২',
    description: 'বেলুন আর্চ, কাস্টম নেইম নিওন লাইট, থিম কেক টেবিল ও পেস্টেল ব্যাকড্রপ ডিজাইন।',
    url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80',
    estimatedCost: 35000,
    highlightTags: ['পেস্টেল বেলুন', 'নিওন লাইট নেম', 'থিম কেক টেবিল', 'ফটোজোন'],
    colorPalette: ['#FFB6C1', '#87CEEB', '#FFFDD0']
  }
];

