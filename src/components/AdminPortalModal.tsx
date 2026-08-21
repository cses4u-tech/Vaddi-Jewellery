import React, { useState, useEffect } from 'react';
import { Product, Category, Enquiry, Review, ShowroomSettings, MetalType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  adminLogin,
  fetchAdminStats,
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  fetchAdminEnquiries,
  updateAdminEnquiry,
  deleteAdminEnquiry,
  updateAdminSettings,
  uploadLocalImage,
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  recalculateAdminPrices,
} from '../services/api';
import { calculateProductPriceBreakdown } from '../utils/pricing';
import {
  X,
  Lock,
  LogOut,
  LayoutDashboard,
  Gem,
  Coins,
  MessageSquare,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  Phone,
  MessageCircle,
  Image as ImageIcon,
  Sparkles,
  Upload,
  RefreshCw,
  Tags,
  Layers,
  Check,
  Calculator,
  Zap,
  Building,
  Eye,
} from 'lucide-react';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ShowroomSettings | null;
  categories: Category[];
  onSettingsUpdated: (newSettings: ShowroomSettings) => void;
  onProductsUpdated: () => void;
  onCategoriesUpdated?: () => void;
}

const defaultShowroomSettings: ShowroomSettings = {
  shop_name: 'VADDI Jewellery',
  shop_name_te: 'వద్ధి జ్యువెలరీ',
  tagline: '100% BIS Hallmarked Gold & 92.5 Fine Silver Showroom',
  tagline_te: 'తరతరాల నమ్మకమైన బంగారు & వెండి షోరూమ్ • ప్రొద్దుటూరు',
  phone: '+91 9650052262',
  whatsapp: '+919650052262',
  address: 'VNR & brothers, Vaddi Complex, Sundaracharyula St, Sarvakatta',
  address_te: 'వి.ఎన్.ఆర్ & బ్రదర్స్, వద్ధి కాంప్లెక్స్, సుందరాచార్యుల వీధి, సర్వకట్ట',
  city_state_pincode: 'Proddatur, Andhra Pradesh 516360, India',
  city_state_pincode_te: 'ప్రొద్దుటూరు, ఆంధ్రప్రదేశ్ 516360, భారతదేశం',
  google_maps_url: 'https://maps.app.goo.gl/LcQVnVkd3HuDWsgi9',
  opening_hours: '10:00 AM - 9:30 PM (All 7 Days Open)',
  opening_hours_te: 'సోమవారం - ఆదివారం: ఉదయం 10:00 - రాత్రి 9:30 (7 రోజులు)',
  gold_rate_24k: '7650',
  gold_rate_22k: '7020',
  gold_rate_18k: '5750',
  silver_rate: '98',
  hero_title: 'Timeless Gold & Silver Elegance in Proddatur',
  hero_title_te: 'ప్రొద్దుటూరులో తరతరాల బంగారు, వెండి వైభవం',
  hero_subtitle: 'Discover authentic 22K BIS Hallmarked gold jewellery, pure 92.5 sterling silver articles, sacred idols, and bespoke heirloom craftsmanship.',
  hero_subtitle_te: '100% BIS హాల్మార్క్ కలిగిన 22K బంగారు ఆభరణాలు, 92.5 వెండి పూజా సామాగ్రి, దైవ విగ్రహాలు మరియు ప్రత్యేకమైన కస్టమ్ డిజైన్లు.',
};

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  onClose,
  settings,
  categories,
  onSettingsUpdated,
  onProductsUpdated,
  onCategoriesUpdated,
}) => {
  const { language, t } = useLanguage();

  // Auth State
  const [token, setToken] = useState<string>(() => sessionStorage.getItem('vaddi_admin_token') || '');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rates' | 'products' | 'categories' | 'enquiries' | 'settings'>('dashboard');

  // Stats
  const [stats, setStats] = useState<any>(null);

  // Categories State
  const [adminCategories, setAdminCategories] = useState<Category[]>(categories || []);
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryMetalFilter, setCategoryMetalFilter] = useState<'All' | 'Gold' | 'Silver'>('All');
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [selectedCategoryToEdit, setSelectedCategoryToEdit] = useState<Category | null>(null);

  // Category Form State
  const [catFormName, setCatFormName] = useState('');
  const [catFormNameTe, setCatFormNameTe] = useState('');
  const [catFormMetal, setCatFormMetal] = useState<'Gold' | 'Silver'>('Gold');
  const [catFormSlug, setCatFormSlug] = useState('');
  const [catFormSortOrder, setCatFormSortOrder] = useState<number>(1);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [productMetalFilter, setProductMetalFilter] = useState<'All' | 'Gold' | 'Silver'>('All');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('All');
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Product Form State
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formTitleTe, setFormTitleTe] = useState('');
  const [formMetal, setFormMetal] = useState<'Gold' | 'Silver'>('Gold');
  const [formCategory, setFormCategory] = useState('');
  const [formCategoryTe, setFormCategoryTe] = useState('');
  const [formPurity, setFormPurity] = useState('22K BIS 916');
  const [formWeight, setFormWeight] = useState<number>(0);
  const [formSize, setFormSize] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formShowPrice, setFormShowPrice] = useState<number>(1);
  const [formWastagePercent, setFormWastagePercent] = useState<number>(10.0);
  const [formWastageCost, setFormWastageCost] = useState<number>(0);
  const [formLabourCost, setFormLabourCost] = useState<number>(2500);
  const [formMakingChargePerGram, setFormMakingChargePerGram] = useState<number>(0);
  const [formAutoCalculatePrice, setFormAutoCalculatePrice] = useState<boolean>(true);
  const [formAvailability, setFormAvailability] = useState<'In Stock' | 'Custom Order' | 'Out of Stock'>('In Stock');
  const [formFeatured, setFormFeatured] = useState<boolean>(false);
  const [formNewArrival, setFormNewArrival] = useState<boolean>(false);
  const [formImagePath, setFormImagePath] = useState('');
  const [formImagePaths, setFormImagePaths] = useState<string[]>([]);
  const [formDescription, setFormDescription] = useState('');
  const [formDescriptionTe, setFormDescriptionTe] = useState('');
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const [isRecalculatingAll, setIsRecalculatingAll] = useState(false);

  // Enquiries State
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [enquiryFilter, setEnquiryFilter] = useState<string>('All');
  const [editingEnquiryNotes, setEditingEnquiryNotes] = useState<{ [id: number]: string }>({});

  // Rates Form State
  const [rate24K, setRate24K] = useState(settings?.gold_rate_24k || '7650');
  const [rate22K, setRate22K] = useState(settings?.gold_rate_22k || '7020');
  const [rate18K, setRate18K] = useState(settings?.gold_rate_18k || '5750');
  const [rateSilver, setRateSilver] = useState(settings?.silver_rate || '98');
  const [isSavingRates, setIsSavingRates] = useState(false);

  // Showroom Settings Form State
  const [shopName, setShopName] = useState(settings?.shop_name || defaultShowroomSettings.shop_name);
  const [shopNameTe, setShopNameTe] = useState(settings?.shop_name_te || defaultShowroomSettings.shop_name_te);
  const [shopTagline, setShopTagline] = useState(settings?.tagline || defaultShowroomSettings.tagline);
  const [shopTaglineTe, setShopTaglineTe] = useState(settings?.tagline_te || defaultShowroomSettings.tagline_te);
  const [shopPhone, setShopPhone] = useState(settings?.phone || defaultShowroomSettings.phone);
  const [shopWhatsapp, setShopWhatsapp] = useState(settings?.whatsapp || defaultShowroomSettings.whatsapp);
  const [shopAddress, setShopAddress] = useState(settings?.address || defaultShowroomSettings.address);
  const [shopAddressTe, setShopAddressTe] = useState(settings?.address_te || defaultShowroomSettings.address_te || 'వి.ఎన్.ఆర్ & బ్రదర్స్, వద్ధి కాంప్లెక్స్, సుందరాచార్యుల వీధి, సర్వకట్ట');
  const [shopCityPincode, setShopCityPincode] = useState(settings?.city_state_pincode || defaultShowroomSettings.city_state_pincode);
  const [shopCityPincodeTe, setShopCityPincodeTe] = useState(settings?.city_state_pincode_te || defaultShowroomSettings.city_state_pincode_te || 'ప్రొద్దుటూరు, ఆంధ్రప్రదేశ్ 516360, భారతదేశం');
  const [shopMapsUrl, setShopMapsUrl] = useState(settings?.google_maps_url || defaultShowroomSettings.google_maps_url);
  const [shopHours, setShopHours] = useState(settings?.opening_hours || defaultShowroomSettings.opening_hours);
  const [shopHoursTe, setShopHoursTe] = useState(settings?.opening_hours_te || defaultShowroomSettings.opening_hours_te || 'సోమవారం - ఆదివారం: ఉదయం 10:00 - రాత్రి 9:30');
  const [heroTitle, setHeroTitle] = useState(settings?.hero_title || defaultShowroomSettings.hero_title || 'Timeless Gold & Silver Elegance in Proddatur');
  const [heroTitleTe, setHeroTitleTe] = useState(settings?.hero_title_te || defaultShowroomSettings.hero_title_te || 'ప్రొద్దుటూరులో తరతరాల బంగారు, వెండి వైభవం');
  const [heroSubtitle, setHeroSubtitle] = useState(settings?.hero_subtitle || defaultShowroomSettings.hero_subtitle || 'Discover authentic 22K BIS Hallmarked gold jewellery, pure 92.5 sterling silver articles, sacred idols, and bespoke heirloom craftsmanship.');
  const [heroSubtitleTe, setHeroSubtitleTe] = useState(settings?.hero_subtitle_te || defaultShowroomSettings.hero_subtitle_te || '100% BIS హాల్మార్క్ కలిగిన 22K బంగారు ఆభరణాలు, 92.5 వెండి పూజా సామాగ్రి, దైవ విగ్రహాలు మరియు ప్రత్యేకమైన కస్టమ్ డిజైన్లు.');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Action Feedback Alert
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // Sync state with settings prop
  useEffect(() => {
    if (settings) {
      setRate24K(settings.gold_rate_24k || '7650');
      setRate22K(settings.gold_rate_22k || '7020');
      setRate18K(settings.gold_rate_18k || '5750');
      setRateSilver(settings.silver_rate || '98');
      setShopName(settings.shop_name || defaultShowroomSettings.shop_name);
      setShopNameTe(settings.shop_name_te || defaultShowroomSettings.shop_name_te);
      setShopTagline(settings.tagline || defaultShowroomSettings.tagline);
      setShopTaglineTe(settings.tagline_te || defaultShowroomSettings.tagline_te);
      setShopPhone(settings.phone || defaultShowroomSettings.phone);
      setShopWhatsapp(settings.whatsapp || defaultShowroomSettings.whatsapp);
      setShopAddress(settings.address || defaultShowroomSettings.address);
      setShopAddressTe(settings.address_te || defaultShowroomSettings.address_te || 'వి.ఎన్.ఆర్ & బ్రదర్స్, వద్ధి కాంప్లెక్స్, సుందరాచార్యుల వీధి, సర్వకట్ట');
      setShopCityPincode(settings.city_state_pincode || defaultShowroomSettings.city_state_pincode);
      setShopCityPincodeTe(settings.city_state_pincode_te || defaultShowroomSettings.city_state_pincode_te || 'ప్రొద్దుటూరు, ఆంధ్రప్రదేశ్ 516360, భారతదేశం');
      setShopMapsUrl(settings.google_maps_url || defaultShowroomSettings.google_maps_url);
      setShopHours(settings.opening_hours || defaultShowroomSettings.opening_hours);
      setShopHoursTe(settings.opening_hours_te || defaultShowroomSettings.opening_hours_te || 'సోమవారం - ఆదివారం: ఉదయం 10:00 - రాత్రి 9:30');
      setHeroTitle(settings.hero_title || defaultShowroomSettings.hero_title || 'Timeless Gold & Silver Elegance in Proddatur');
      setHeroTitleTe(settings.hero_title_te || defaultShowroomSettings.hero_title_te || 'ప్రొద్దుటూరులో తరతరాల బంగారు, వెండి వైభవం');
      setHeroSubtitle(settings.hero_subtitle || defaultShowroomSettings.hero_subtitle || 'Discover authentic 22K BIS Hallmarked gold jewellery, pure 92.5 sterling silver articles, sacred idols, and bespoke heirloom craftsmanship.');
      setHeroSubtitleTe(settings.hero_subtitle_te || defaultShowroomSettings.hero_subtitle_te || '100% BIS హాల్మార్క్ కలిగిన 22K బంగారు ఆభరణాలు, 92.5 వెండి పూజా సామాగ్రి, దైవ విగ్రహాలు మరియు ప్రత్యేకమైన కస్టమ్ డిజైన్లు.');
    }
  }, [settings]);

  // Load Admin Data when token exists
  const loadAdminData = async () => {
    if (!token) return;
    try {
      const [statsData, prodsData, enqsData, catsData] = await Promise.all([
        fetchAdminStats(token).catch(() => null),
        fetchAdminProducts(token).catch(() => []),
        fetchAdminEnquiries(token).catch(() => []),
        fetchAdminCategories(token).catch(() => []),
      ]);
      if (statsData) setStats(statsData);
      setProducts(prodsData);
      setEnquiries(enqsData);
      if (catsData && catsData.length > 0) {
        setAdminCategories(catsData);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  const loadCategoriesList = async () => {
    try {
      const cats = await fetchAdminCategories(token);
      setAdminCategories(cats);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    if (isOpen && token) {
      loadAdminData();
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const adminToken = await adminLogin(password);
      if (adminToken) {
        setToken(adminToken);
        sessionStorage.setItem('vaddi_admin_token', adminToken);
        setPassword('');
        showFeedback('success', 'Welcome to VADDI Jewellery Admin Portal');
      } else {
        setLoginError('Invalid showroom password. Please try again.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setToken('');
    sessionStorage.removeItem('vaddi_admin_token');
    setActiveTab('dashboard');
    showFeedback('success', 'Admin session logged out successfully');
  };

  // Rates update handler
  const handleSaveRates = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingRates(true);
    try {
      const payload: Record<string, string> = {
        gold_rate_24k: String(rate24K),
        gold_rate_22k: String(rate22K),
        gold_rate_18k: String(rate18K),
        silver_rate: String(rateSilver),
      };
      await updateAdminSettings(payload, token);
      const updatedSettings: ShowroomSettings = {
        ...(settings || defaultShowroomSettings),
        ...payload,
      };
      onSettingsUpdated(updatedSettings);
      showFeedback('success', "Today's Gold & Silver rates updated! All product prices automatically recalculated in real time for all users.");
      await loadAdminData();
      onProductsUpdated();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update rates');
    } finally {
      setIsSavingRates(false);
    }
  };

  // Recalculate All Prices Handler
  const handleRecalculateAllPricesClick = async () => {
    setIsRecalculatingAll(true);
    try {
      const res = await recalculateAdminPrices(token);
      showFeedback('success', res.message || "All product prices recalculated successfully based on today's rates, wastage & labour costs.");
      await loadAdminData();
      onProductsUpdated();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to recalculate prices');
    } finally {
      setIsRecalculatingAll(false);
    }
  };

  // Showroom Settings update handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const payload: Record<string, string> = {
        shop_name: shopName.trim(),
        shop_name_te: shopNameTe.trim(),
        tagline: shopTagline.trim(),
        tagline_te: shopTaglineTe.trim(),
        phone: shopPhone.trim(),
        whatsapp: shopWhatsapp.trim(),
        address: shopAddress.trim(),
        address_te: shopAddressTe.trim(),
        city_state_pincode: shopCityPincode.trim(),
        city_state_pincode_te: shopCityPincodeTe.trim(),
        google_maps_url: shopMapsUrl.trim(),
        opening_hours: shopHours.trim(),
        opening_hours_te: shopHoursTe.trim(),
        hero_title: heroTitle.trim(),
        hero_title_te: heroTitleTe.trim(),
        hero_subtitle: heroSubtitle.trim(),
        hero_subtitle_te: heroSubtitleTe.trim(),
      };
      await updateAdminSettings(payload, token);
      const updatedSettings: ShowroomSettings = {
        ...(settings || defaultShowroomSettings),
        ...payload,
      };
      onSettingsUpdated(updatedSettings);
      showFeedback('success', 'Showroom details updated and synced across all visitors in real-time!');
      await loadAdminData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to save settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Handle image upload from computer / camera / gallery
  const handleImageFileSelect = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith('image/')) {
      showFeedback('error', 'Please select a valid image file (JPG, PNG, WEBP, SVG).');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      showFeedback('error', 'Image size is larger than 12MB. Please select a smaller photo.');
      return;
    }

    setIsUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        if (!dataUrl) {
          setIsUploadingImage(false);
          return;
        }

        try {
          const uploadRes = await uploadLocalImage(dataUrl, file.name, token);
          const uploadedPath = uploadRes?.image_path || dataUrl;
          setFormImagePath(uploadedPath);
          setFormImagePaths((prev) => {
            const list = prev.filter((p) => p !== uploadedPath);
            return [uploadedPath, ...list];
          });
          showFeedback('success', `Jewellery photo "${file.name}" uploaded successfully!`);
        } catch {
          setFormImagePath(dataUrl);
          setFormImagePaths((prev) => {
            const list = prev.filter((p) => p !== dataUrl);
            return [dataUrl, ...list];
          });
          showFeedback('success', `Photo "${file.name}" loaded successfully!`);
        } finally {
          setIsUploadingImage(false);
        }
      };
      reader.onerror = () => {
        setIsUploadingImage(false);
        showFeedback('error', 'Failed to read image file.');
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploadingImage(false);
      showFeedback('error', 'Could not process selected image.');
    }
  };

  // Category Handlers
  const handleOpenAddCategory = (defaultMetal: 'Gold' | 'Silver' = 'Gold') => {
    setSelectedCategoryToEdit(null);
    setCatFormName('');
    setCatFormNameTe('');
    setCatFormMetal(defaultMetal);
    setCatFormSlug('');
    const maxOrder = adminCategories.reduce((max, c) => Math.max(max, c.sort_order || 0), 0);
    setCatFormSortOrder(maxOrder + 1);
    setIsEditingCategory(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setSelectedCategoryToEdit(cat);
    setCatFormName(cat.name);
    setCatFormNameTe(cat.name_te || '');
    setCatFormMetal(cat.metal || 'Gold');
    setCatFormSlug(cat.slug || '');
    setCatFormSortOrder(cat.sort_order || 1);
    setIsEditingCategory(true);
  };

  const handleSaveCategoryForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormName.trim()) {
      showFeedback('error', 'Category name in English is required');
      return;
    }

    const generatedSlug = catFormSlug.trim()
      ? catFormSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : catFormName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    setIsSavingCategory(true);
    try {
      const payload = {
        name: catFormName.trim(),
        name_te: catFormNameTe.trim() || catFormName.trim(),
        metal: catFormMetal,
        slug: generatedSlug,
        sort_order: Number(catFormSortOrder) || 1,
      };

      if (selectedCategoryToEdit) {
        await updateAdminCategory(selectedCategoryToEdit.id, payload, token);
        showFeedback('success', `Category "${payload.name}" updated successfully`);
      } else {
        await createAdminCategory(payload, token);
        showFeedback('success', `New category "${payload.name}" created successfully`);
      }

      setIsEditingCategory(false);
      setSelectedCategoryToEdit(null);
      await loadCategoriesList();
      if (onCategoriesUpdated) {
        onCategoriesUpdated();
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to save category');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    const confirm = window.confirm(
      `Are you sure you want to delete category "${cat.name}"?\n(Products linked to this category won't be deleted, but may need recategorization).`
    );
    if (!confirm) return;

    try {
      await deleteAdminCategory(cat.id, token);
      showFeedback('success', `Category "${cat.name}" deleted successfully`);
      await loadCategoriesList();
      if (onCategoriesUpdated) {
        onCategoriesUpdated();
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete category');
    }
  };

  // Products Handlers
  const handleOpenAddProduct = () => {
    setSelectedProduct(null);
    const initialMetal: 'Gold' | 'Silver' = formMetal || 'Gold';
    const matchingCats = adminCategories.filter((c) => c.metal.toLowerCase() === initialMetal.toLowerCase());
    const defaultCat = matchingCats[0]?.name || (initialMetal === 'Gold' ? 'Gold Harams & Necklaces' : 'Silver God Idols');
    const defaultCatTe = matchingCats[0]?.name_te || (initialMetal === 'Gold' ? 'బంగారు హారాలు & నెక్లెస్‌లు' : 'వెండి దేవుడి విగ్రహాలు');

    setFormCode(`VD-${initialMetal === 'Gold' ? 'G' : 'S'}${Math.floor(100 + Math.random() * 900)}`);
    setFormTitle('');
    setFormTitleTe('');
    setFormMetal(initialMetal);
    setFormCategory(defaultCat);
    setFormCategoryTe(defaultCatTe);
    setFormPurity(initialMetal === 'Gold' ? '22K BIS 916' : '92.5 Sterling Silver');
    setFormWeight(initialMetal === 'Gold' ? 24.5 : 250);
    setFormSize('Standard');
    setFormWastagePercent(initialMetal === 'Gold' ? 10.0 : 8.0);
    setFormWastageCost(0);
    setFormLabourCost(initialMetal === 'Gold' ? 2500 : 1200);
    setFormMakingChargePerGram(0);
    setFormAutoCalculatePrice(true);
    setFormPrice(0);
    setFormShowPrice(1);
    setFormAvailability('In Stock');
    setFormFeatured(false);
    setFormNewArrival(true);
    setFormImagePath('');
    setFormImagePaths([]);
    setShowUrlFallback(false);
    setFormDescription(initialMetal === 'Gold' ? 'Traditional 22K 916 Hallmarked mastercrafted gold design from Proddatur goldsmiths.' : '92.5 Fine Hallmarked authentic Silver article from Proddatur.');
    setFormDescriptionTe(initialMetal === 'Gold' ? 'ప్రొద్దుటూరు స్వర్ణకారుల చేతిపనితనంతో తయారుచేసిన 100% BIS హాల్మార్క్ బంగారు ఆభరణం.' : 'ప్రొద్దుటూరు 92.5 స్వచ్ఛమైన వెండి ఆభరణం.');
    setIsEditingProduct(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setFormCode(prod.code);
    setFormTitle(prod.title);
    setFormTitleTe(prod.title_te || '');
    setFormMetal(prod.metal);
    setFormCategory(prod.category);
    setFormCategoryTe(prod.category_te || '');
    setFormPurity(prod.purity);
    setFormWeight(prod.weight);
    setFormSize(prod.size || '');
    setFormWastagePercent(prod.wastage_percent !== undefined && prod.wastage_percent !== null ? Number(prod.wastage_percent) : (prod.metal === 'Gold' ? 10 : 8));
    setFormWastageCost(prod.wastage_cost ? Number(prod.wastage_cost) : 0);
    setFormLabourCost(prod.labour_cost !== undefined && prod.labour_cost !== null ? Number(prod.labour_cost) : (prod.metal === 'Gold' ? 2500 : 1200));
    setFormMakingChargePerGram(prod.making_charge_per_gram ? Number(prod.making_charge_per_gram) : 0);
    setFormAutoCalculatePrice(true);
    setFormPrice(prod.price || 0);
    setFormShowPrice(prod.show_price !== undefined ? prod.show_price : 1);
    setFormAvailability(prod.availability);
    setFormFeatured(prod.featured === 1);
    setFormNewArrival(prod.new_arrival === 1);
    setFormImagePath(prod.image_path || '');
    const paths = (prod.image_paths && prod.image_paths.length > 0) ? prod.image_paths : (prod.image_path ? [prod.image_path] : []);
    setFormImagePaths(paths);
    setShowUrlFallback(Boolean(prod.image_path && prod.image_path.startsWith('http')));
    setFormDescription(prod.description || '');
    setFormDescriptionTe(prod.description_te || '');
    setIsEditingProduct(true);
  };

  // Live calculation for the product form preview
  const livePriceBreakdown = calculateProductPriceBreakdown(
    {
      metal: formMetal,
      purity: formPurity,
      weight: Number(formWeight) || 0,
      wastage_percent: Number(formWastagePercent) || 0,
      wastage_cost: Number(formWastageCost) || 0,
      labour_cost: Number(formLabourCost) || 0,
      making_charge_per_gram: Number(formMakingChargePerGram) || 0,
    },
    settings
  );

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formTitle || !formWeight) {
      showFeedback('error', 'Please fill in product code, title, and weight.');
      return;
    }

    const finalMainImage = formImagePath.trim() || (formImagePaths[0] || (formMetal === 'Silver' ? '/images/jewellery/vd_s001_silver_ganesha_idol.svg' : '/images/jewellery/vd_g001_gold_lakshmi_haram.svg'));
    const finalImagePaths = formImagePaths.length > 0 ? formImagePaths : [finalMainImage];

    // Compute final price
    const finalPrice = formAutoCalculatePrice
      ? livePriceBreakdown.totalPrice
      : (Number(formPrice) > 0 ? Number(formPrice) : livePriceBreakdown.totalPrice);

    setIsSavingProduct(true);
    try {
      const payload: Partial<Product> = {
        code: formCode.trim().toUpperCase(),
        title: formTitle.trim(),
        title_te: formTitleTe.trim() || undefined,
        metal: formMetal,
        category: formCategory,
        category_te: formCategoryTe.trim() || undefined,
        purity: formPurity,
        weight: Number(formWeight),
        size: formSize.trim() || undefined,
        wastage_percent: Number(formWastagePercent) || 0,
        wastage_cost: Number(formWastageCost) || 0,
        labour_cost: Number(formLabourCost) || 0,
        making_charge_per_gram: Number(formMakingChargePerGram) || 0,
        price: finalPrice,
        show_price: formShowPrice,
        availability: formAvailability,
        featured: formFeatured ? 1 : 0,
        new_arrival: formNewArrival ? 1 : 0,
        image_path: finalMainImage,
        image_paths: finalImagePaths,
        description: formDescription.trim(),
        description_te: formDescriptionTe.trim() || undefined,
      };

      if (selectedProduct) {
        await updateAdminProduct(selectedProduct.id, payload, token);
        showFeedback('success', `Product ${payload.code} updated with dynamic price ₹${finalPrice.toLocaleString('en-IN')}`);
      } else {
        await createAdminProduct(payload, token);
        showFeedback('success', `New product ${payload.code} added to catalog with price ₹${finalPrice.toLocaleString('en-IN')}`);
      }

      setIsEditingProduct(false);
      setSelectedProduct(null);
      await loadAdminData();
      onProductsUpdated();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to save product');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: number, code: string) => {
    const confirm = window.confirm(`Are you sure you want to delete jewellery item "${code}" permanently?`);
    if (!confirm) return;

    try {
      await deleteAdminProduct(id, token);
      showFeedback('success', `Product "${code}" deleted from database`);
      await loadAdminData();
      onProductsUpdated();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete product');
    }
  };

  // Enquiries Handlers
  const handleUpdateEnquiryStatus = async (id: number, newStatus: string, notes?: string) => {
    try {
      await updateAdminEnquiry(id, { status: newStatus, notes }, token);
      showFeedback('success', `Inquiry #${id} marked as ${newStatus}`);
      await loadAdminData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update enquiry status');
    }
  };

  const handleDeleteEnquiry = async (id: number) => {
    const confirm = window.confirm('Are you sure you want to delete this customer enquiry record?');
    if (!confirm) return;

    try {
      await deleteAdminEnquiry(id, token);
      showFeedback('success', 'Enquiry record deleted');
      await loadAdminData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete enquiry');
    }
  };

  // Filtered products in Admin list
  const filteredProducts = products.filter((p) => {
    if (productMetalFilter !== 'All' && p.metal.toLowerCase() !== productMetalFilter.toLowerCase()) {
      return false;
    }
    if (productCategoryFilter !== 'All' && p.category !== productCategoryFilter) {
      return false;
    }
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      return (
        p.code.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        (p.title_te && p.title_te.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered categories in Admin list
  const filteredAdminCategories = adminCategories.filter((c) => {
    if (categoryMetalFilter !== 'All' && c.metal.toLowerCase() !== categoryMetalFilter.toLowerCase()) {
      return false;
    }
    if (categorySearch.trim()) {
      const q = categorySearch.toLowerCase();
      return c.name.toLowerCase().includes(q) || (c.name_te && c.name_te.toLowerCase().includes(q)) || c.slug.toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered enquiries
  const filteredEnquiries = enquiries.filter((e) => {
    if (enquiryFilter === 'All') return true;
    return e.status === enquiryFilter;
  });

  return (
    <div
      id="admin-portal-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="admin-portal-modal-card"
        className="bg-[#F8F7F4] rounded-2xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-300 relative my-auto overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="bg-[#1A1A1A] text-white px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E6CA85] to-[#B38F4D] flex items-center justify-center text-stone-950 font-serif-luxury font-extrabold text-xl shadow-inner">
              V
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-luxury text-lg sm:text-xl font-bold tracking-wide text-[#FDFCFB]">
                  VADDI Showroom Admin Portal
                </h2>
                <span className="bg-[#C5A869]/20 text-[#E6CA85] text-[10px] font-bold px-2 py-0.5 rounded border border-[#C5A869]/40">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Proddatur Showroom Management • Real-time DB & Pricing Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {token && (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-stone-700"
                title="Log out of admin session"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg transition-colors cursor-pointer border border-stone-700"
              title="Close Portal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`px-6 py-2.5 flex items-center gap-2 text-xs font-semibold shrink-0 animate-in slide-in-from-top duration-150 ${
              feedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Main Body */}
        {!token ? (
          /* LOGIN SCREEN */
          <div className="flex-1 p-6 sm:p-12 flex items-center justify-center bg-gradient-to-b from-stone-50 to-[#F8F7F4]">
            <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-stone-200 shadow-lg space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#C5A869] border border-amber-200 mx-auto flex items-center justify-center shadow-inner">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="font-serif-luxury text-2xl font-bold text-stone-900">
                  Showroom Owner Access
                </h3>
                <p className="text-xs text-stone-500">
                  Enter your VADDI Jewellery master password to update daily market rates, manage products, wastage & labour costs, and customer leads.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter showroom password..."
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#C5A869] focus:bg-white"
                  />
                </div>

                {loginError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 bg-[#1A1A1A] hover:bg-stone-800 text-white text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn ? 'Verifying...' : 'Unlock Admin Portal'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-white border-r border-stone-200 p-4 space-y-1 shrink-0 overflow-y-auto">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-[#1A1A1A] text-white shadow-2xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-[#C5A869]" />
                <span>Overview & Stats</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('rates')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'rates'
                    ? 'bg-[#1A1A1A] text-white shadow-2xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Coins className="w-4 h-4 text-[#C5A869]" />
                  <span>Today's Market Rates</span>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-extrabold">
                  ₹{settings?.gold_rate_22k || '7020'}/g
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'products'
                    ? 'bg-[#1A1A1A] text-white shadow-2xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Gem className="w-4 h-4 text-[#C5A869]" />
                  <span>Jewellery Catalog ({products.length})</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('categories')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'categories'
                    ? 'bg-[#1A1A1A] text-white shadow-2xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-[#C5A869]" />
                  <span>Categories ({adminCategories.length})</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('enquiries')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'enquiries'
                    ? 'bg-[#1A1A1A] text-white shadow-2xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-[#C5A869]" />
                  <span>Customer Inquiries</span>
                </div>
                {enquiries.filter((e) => e.status === 'New').length > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                    {enquiries.filter((e) => e.status === 'New').length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#1A1A1A] text-white shadow-2xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Settings className="w-4 h-4 text-[#C5A869]" />
                <span>Showroom Profile</span>
              </button>

              {/* Quick Price Sync Action in Sidebar */}
              <div className="pt-4 border-t border-stone-200 mt-4">
                <button
                  type="button"
                  disabled={isRecalculatingAll}
                  onClick={handleRecalculateAllPricesClick}
                  className="w-full flex items-center justify-center gap-2 p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl text-xs font-bold text-amber-950 transition-all cursor-pointer shadow-2xs disabled:opacity-60"
                  title="Recalculate all product prices with today's live rates"
                >
                  <Zap className={`w-4 h-4 text-[#8C6D23] ${isRecalculatingAll ? 'animate-spin' : ''}`} />
                  <span>{isRecalculatingAll ? 'Calculating...' : 'Recalculate All Prices'}</span>
                </button>
              </div>
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                      <div className="flex items-center justify-between text-stone-500 text-xs font-semibold mb-1">
                        <span>Total Jewellery Items</span>
                        <Gem className="w-4 h-4 text-[#C5A869]" />
                      </div>
                      <div className="text-2xl font-extrabold text-stone-900">
                        {stats?.totalProducts || products.length}
                      </div>
                      <span className="text-[10px] text-stone-500">Live in local SQLite database</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                      <div className="flex items-center justify-between text-stone-500 text-xs font-semibold mb-1">
                        <span>Gold Catalog</span>
                        <Coins className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="text-2xl font-extrabold text-amber-800">
                        {stats?.goldCount || products.filter((p) => p.metal.toLowerCase() === 'gold').length}
                      </div>
                      <span className="text-[10px] text-amber-700 font-semibold">22K 916 & 24K Coins</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                      <div className="flex items-center justify-between text-stone-500 text-xs font-semibold mb-1">
                        <span>Silver Catalog</span>
                        <Sparkles className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="text-2xl font-extrabold text-slate-800">
                        {stats?.silverCount || products.filter((p) => p.metal.toLowerCase() === 'silver').length}
                      </div>
                      <span className="text-[10px] text-slate-600 font-semibold">92.5 Sterling Silver</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                      <div className="flex items-center justify-between text-stone-500 text-xs font-semibold mb-1">
                        <span>Customer Inquiries</span>
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-2xl font-extrabold text-blue-800">
                        {stats?.totalEnquiries || enquiries.length}
                      </div>
                      <span className="text-[10px] text-rose-600 font-bold">
                        {stats?.newEnquiries || enquiries.filter((e) => e.status === 'New').length} pending leads
                      </span>
                    </div>
                  </div>

                  {/* Real-time Pricing Guarantee Card */}
                  <div className="bg-gradient-to-br from-amber-900 to-stone-900 text-white rounded-2xl p-6 shadow-md border border-amber-700/50">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#C5A869] text-stone-950 text-[10px] font-extrabold px-2 py-0.5 rounded">
                            LIVE REAL-TIME ENGINE
                          </span>
                          <span className="text-xs text-amber-200 font-semibold">
                            Auto-calculates for all website visitors immediately
                          </span>
                        </div>
                        <h3 className="font-serif-luxury text-xl font-bold text-amber-100">
                          Formula: Total = (Weight × Gram Rate) + Wastage (VA) + Labour Cost
                        </h3>
                        <p className="text-xs text-amber-200/80 max-w-2xl">
                          When you adjust today's market rates or edit product wastage / labour charges, every product price auto-calculates and pushes dynamically across the website.
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={isRecalculatingAll}
                        onClick={handleRecalculateAllPricesClick}
                        className="px-4 py-2.5 bg-[#C5A869] hover:bg-[#B38F4D] text-stone-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer shrink-0 transition-all"
                      >
                        <Zap className="w-4 h-4" />
                        <span>{isRecalculatingAll ? 'Syncing...' : 'Force Sync All Prices'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Action Shortcuts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('products');
                        handleOpenAddProduct();
                      }}
                      className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs hover:border-[#C5A869] transition-all text-left flex items-start gap-3 cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Plus className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-stone-900 block">Add Jewellery Item</span>
                        <span className="text-[11px] text-stone-500">With Wastage & Labour parameters</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('rates')}
                      className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs hover:border-[#C5A869] transition-all text-left flex items-start gap-3 cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-stone-900 block">Update Today's Rates</span>
                        <span className="text-[11px] text-stone-500">Auto-updates all catalog prices</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('categories')}
                      className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs hover:border-[#C5A869] transition-all text-left flex items-start gap-3 cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-amber-100/60 text-amber-900 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-stone-900 block">Manage Categories</span>
                        <span className="text-[11px] text-stone-500">Gold & Silver collections</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('enquiries')}
                      className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs hover:border-[#C5A869] transition-all text-left flex items-start gap-3 cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-stone-900 block">Customer Inquiries</span>
                        <span className="text-[11px] text-stone-500">View WhatsApp & custom order leads</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: DAILY RATES EDITOR */}
              {activeTab === 'rates' && (
                <div className="max-w-3xl bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif-luxury text-xl font-bold text-stone-900">
                        Update Today's Gold & Silver Rates (నేటి ధరలు)
                      </h3>
                      <button
                        type="button"
                        disabled={isRecalculatingAll}
                        onClick={handleRecalculateAllPricesClick}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg text-xs font-bold text-amber-950 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-[#8C6D23]" />
                        <span>Recalculate Catalog</span>
                      </button>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Updating these rates instantly updates the scrolling ticker, rate cards, and <strong>automatically recalculates the dynamic selling price of every product</strong> for all active website visitors.
                    </p>
                  </div>

                  <form onSubmit={handleSaveRates} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* 24K Gold Rate */}
                      <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                        <label className="block text-xs font-bold text-amber-900 mb-1">
                          24K Pure Gold Rate (₹ / Gram) *
                        </label>
                        <input
                          type="number"
                          step="1"
                          required
                          value={rate24K}
                          onChange={(e) => setRate24K(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm font-extrabold text-amber-950 focus:ring-2 focus:ring-amber-500"
                        />
                        <span className="text-[11px] text-amber-700 mt-1 block">
                          10 Grams (Tola): <strong>₹{(Number(rate24K) * 10).toLocaleString('en-IN')}</strong>
                        </span>
                      </div>

                      {/* 22K Gold Rate */}
                      <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                        <label className="block text-xs font-bold text-amber-900 mb-1">
                          22K Standard BIS 916 (₹ / Gram) *
                        </label>
                        <input
                          type="number"
                          step="1"
                          required
                          value={rate22K}
                          onChange={(e) => setRate22K(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm font-extrabold text-amber-950 focus:ring-2 focus:ring-amber-500"
                        />
                        <span className="text-[11px] text-amber-700 mt-1 block">
                          8 Grams (Pavan): <strong>₹{(Number(rate22K) * 8).toLocaleString('en-IN')}</strong>
                        </span>
                      </div>

                      {/* 18K Gold Rate */}
                      <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          18K Gold Rate (₹ / Gram) *
                        </label>
                        <input
                          type="number"
                          step="1"
                          required
                          value={rate18K}
                          onChange={(e) => setRate18K(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm font-bold text-stone-900 focus:ring-2 focus:ring-stone-500"
                        />
                        <span className="text-[11px] text-stone-500 mt-1 block">
                          10 Grams: <strong>₹{(Number(rate18K) * 10).toLocaleString('en-IN')}</strong>
                        </span>
                      </div>

                      {/* Silver Rate */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          92.5 Fine Silver (₹ / Gram) *
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          required
                          value={rateSilver}
                          onChange={(e) => setRateSilver(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-500"
                        />
                        <span className="text-[11px] text-slate-600 mt-1 block">
                          1 Kg Silver Bar: <strong>₹{(Number(rateSilver) * 1000).toLocaleString('en-IN')}</strong>
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingRates}
                      className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 text-[#C5A869]" />
                      <span>{isSavingRates ? 'Recalculating All Prices & Saving...' : "Save Today's Rates & Auto-Recalculate Prices"}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: PRODUCTS & PRICING ENGINE */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  {/* Products Toolbar */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-stone-200">
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Search code, title, category..."
                          className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-[#C5A869]"
                        />
                      </div>

                      <select
                        value={productMetalFilter}
                        onChange={(e) => setProductMetalFilter(e.target.value as any)}
                        className="py-1.5 px-3 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold"
                      >
                        <option value="All">All Metals</option>
                        <option value="Gold">Gold Only</option>
                        <option value="Silver">Silver Only</option>
                      </select>

                      <select
                        value={productCategoryFilter}
                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                        className="py-1.5 px-3 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold max-w-[180px] truncate"
                      >
                        <option value="All">All Categories</option>
                        {adminCategories
                          .filter(
                            (c) =>
                              productMetalFilter === 'All' ||
                              c.metal.toLowerCase() === productMetalFilter.toLowerCase()
                          )
                          .map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isRecalculatingAll}
                        onClick={handleRecalculateAllPricesClick}
                        className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                        title="Recalculate all products with today's live rate, wastage & labour"
                      >
                        <Zap className="w-3.5 h-3.5 text-[#8C6D23]" />
                        <span>{isRecalculatingAll ? 'Syncing...' : 'Sync Prices'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenAddProduct}
                        className="flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-stone-800 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                      >
                        <Plus className="w-4 h-4 text-[#C5A869]" />
                        <span>Add Jewellery Item</span>
                      </button>
                    </div>
                  </div>

                  {/* Products Table */}
                  <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto max-h-[520px]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200 sticky top-0 z-10">
                          <tr>
                            <th className="p-3">Item / Image</th>
                            <th className="p-3">Code</th>
                            <th className="p-3">Purity & Wt</th>
                            <th className="p-3">Wastage (VA %)</th>
                            <th className="p-3">Labour Cost</th>
                            <th className="p-3">Calculated Price</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="p-8 text-center text-stone-400">
                                No items found matching search filters.
                              </td>
                            </tr>
                          ) : (
                            filteredProducts.map((prod) => {
                              const breakdown = calculateProductPriceBreakdown(prod, settings);
                              return (
                                <tr key={prod.id} className="hover:bg-stone-50/80 transition-colors">
                                  <td className="p-3">
                                    <div className="flex items-center gap-2.5">
                                      <img
                                        src={prod.image_path}
                                        alt={prod.title}
                                        className="w-10 h-10 rounded-lg object-contain bg-stone-100 border border-stone-200 p-0.5 shrink-0"
                                      />
                                      <div className="max-w-[200px]">
                                        <span className="font-bold text-stone-900 block truncate">{prod.title}</span>
                                        <span className="text-[11px] text-stone-500 block truncate">{prod.category}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3 font-mono font-bold text-stone-800">{prod.code}</td>
                                  <td className="p-3">
                                    <span className="font-bold text-stone-900 block">{prod.weight}g</span>
                                    <span className="text-[10px] text-stone-500">{prod.purity}</span>
                                  </td>
                                  <td className="p-3">
                                    <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                      {prod.wastage_percent !== undefined ? prod.wastage_percent : (prod.metal === 'Gold' ? 10 : 8)}%
                                    </span>
                                    <span className="text-[10px] text-stone-400 block mt-0.5">
                                      +₹{breakdown.wastageAmount.toLocaleString('en-IN')}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <span className="font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                                      ₹{(prod.labour_cost !== undefined ? prod.labour_cost : (prod.metal === 'Gold' ? 2500 : 1200)).toLocaleString('en-IN')}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <span className="font-extrabold text-stone-950 block text-sm">
                                      ₹{breakdown.totalPrice.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Auto-synced
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        prod.availability === 'In Stock'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : prod.availability === 'Custom Order'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-stone-100 text-stone-600'
                                      }`}
                                    >
                                      {prod.availability}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right">
                                    <div className="inline-flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditProduct(prod)}
                                        className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-200 rounded cursor-pointer"
                                        title="Edit Product"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteProduct(prod.id, prod.code)}
                                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded cursor-pointer"
                                        title="Delete Product"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CATEGORIES */}
              {activeTab === 'categories' && (
                <div className="space-y-4">
                  {/* Category Toolbar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-stone-200">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          placeholder="Search categories (English / తెలుగు)..."
                          className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-[#C5A869]"
                        />
                      </div>

                      <select
                        value={categoryMetalFilter}
                        onChange={(e) => setCategoryMetalFilter(e.target.value as any)}
                        className="py-1.5 px-3 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold"
                      >
                        <option value="All">All Metals ({adminCategories.length})</option>
                        <option value="Gold">Gold Categories ({adminCategories.filter((c) => c.metal === 'Gold').length})</option>
                        <option value="Silver">Silver Categories ({adminCategories.filter((c) => c.metal === 'Silver').length})</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={loadCategoriesList}
                        title="Reload Categories"
                        className="p-2 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenAddCategory(categoryMetalFilter === 'Silver' ? 'Silver' : 'Gold')}
                        className="flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-stone-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                      >
                        <Plus className="w-4 h-4 text-[#C5A869]" />
                        <span>Add Category</span>
                      </button>
                    </div>
                  </div>

                  {/* Categories Table */}
                  <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto max-h-[500px]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200 sticky top-0">
                          <tr>
                            <th className="p-3">Order</th>
                            <th className="p-3">Category Name (English)</th>
                            <th className="p-3">తెలుగు పేరు (Telugu)</th>
                            <th className="p-3">Metal Type</th>
                            <th className="p-3">Slug (URL)</th>
                            <th className="p-3">Items Linked</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {filteredAdminCategories.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-stone-400">
                                No categories found.
                              </td>
                            </tr>
                          ) : (
                            filteredAdminCategories.map((cat) => {
                              const linkedCount = (cat as any).product_count !== undefined
                                ? (cat as any).product_count
                                : products.filter((p) => p.category === cat.name || p.category_te === cat.name_te).length;
                              return (
                                <tr key={cat.id} className="hover:bg-stone-50/80 transition-colors">
                                  <td className="p-3 font-mono font-bold text-stone-500">#{cat.sort_order || cat.id}</td>
                                  <td className="p-3">
                                    <span className="font-bold text-stone-900 block">{cat.name}</span>
                                  </td>
                                  <td className="p-3">
                                    <span className="text-stone-700 font-medium">{cat.name_te || '—'}</span>
                                  </td>
                                  <td className="p-3">
                                    <span
                                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                        cat.metal === 'Gold'
                                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                          : 'bg-slate-100 text-slate-800 border border-slate-300'
                                      }`}
                                    >
                                      {cat.metal}
                                    </span>
                                  </td>
                                  <td className="p-3 font-mono text-[11px] text-stone-500">{cat.slug}</td>
                                  <td className="p-3">
                                    <span className="font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded text-[10px]">
                                      {linkedCount} items
                                    </span>
                                  </td>
                                  <td className="p-3 text-right">
                                    <div className="inline-flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditCategory(cat)}
                                        className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-200 rounded cursor-pointer"
                                        title="Edit Category"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteCategory(cat)}
                                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded cursor-pointer"
                                        title="Delete Category"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: ENQUIRIES */}
              {activeTab === 'enquiries' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-stone-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-700">Filter Status:</span>
                      {['All', 'New', 'Contacted', 'Closed'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setEnquiryFilter(st)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            enquiryFilter === st
                              ? 'bg-[#1A1A1A] text-white'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-stone-500 font-medium">
                      Showing {filteredEnquiries.length} of {enquiries.length} leads
                    </span>
                  </div>

                  <div className="space-y-3">
                    {filteredEnquiries.length === 0 ? (
                      <div className="p-12 text-center bg-white rounded-xl border border-stone-200 text-stone-400">
                        No customer inquiries found for this filter.
                      </div>
                    ) : (
                      filteredEnquiries.map((enq) => (
                        <div
                          key={enq.id}
                          className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-stone-900">{enq.name}</span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                    enq.status === 'New'
                                      ? 'bg-rose-100 text-rose-800'
                                      : enq.status === 'Contacted'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-stone-100 text-stone-600'
                                  }`}
                                >
                                  {enq.status}
                                </span>
                              </div>
                              <span className="text-[11px] text-stone-400">{enq.created_at || 'Recent enquiry'}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <a
                                href={`tel:${enq.phone}`}
                                className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition-colors"
                              >
                                <Phone className="w-3 h-3 text-stone-600" />
                                <span>{enq.phone}</span>
                              </a>
                              <a
                                href={`https://wa.me/${enq.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold transition-colors"
                              >
                                <MessageCircle className="w-3 h-3 fill-current text-emerald-600" />
                                <span>WhatsApp</span>
                              </a>
                            </div>
                          </div>

                          {enq.product_title && (
                            <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-xs flex items-center gap-2">
                              <Gem className="w-3.5 h-3.5 text-[#C5A869] shrink-0" />
                              <span className="text-stone-500">Item Inquired:</span>
                              <strong className="text-stone-900">{enq.product_title}</strong>
                              {enq.product_code && (
                                <span className="font-mono bg-stone-200 text-stone-800 px-1 rounded text-[10px]">
                                  {enq.product_code}
                                </span>
                              )}
                            </div>
                          )}

                          {enq.message && (
                            <p className="text-xs text-stone-700 bg-stone-50/50 p-2.5 rounded-lg border border-stone-100">
                              "{enq.message}"
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-semibold text-stone-500">Mark as:</span>
                              {['New', 'Contacted', 'Closed'].map((statusOption) => (
                                <button
                                  key={statusOption}
                                  type="button"
                                  onClick={() => handleUpdateEnquiryStatus(enq.id, statusOption, enq.notes)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                    enq.status === statusOption
                                      ? 'bg-stone-800 text-white'
                                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                  }`}
                                >
                                  {statusOption}
                                </button>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteEnquiry(enq.id)}
                              className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: SHOWROOM SETTINGS */}
              {activeTab === 'settings' && (
                <div className="max-w-4xl bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-8">
                  {/* Tab Title & Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                          <Building className="w-4 h-4" />
                        </div>
                        <h3 className="font-serif-luxury text-xl font-bold text-stone-900">
                          Showroom Profile, Name & Location Settings
                        </h3>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        Update the official jewellery showroom name (English & Telugu), address, Proddatur location, timings, and contact numbers. Changes are saved to database and synced immediately across all visitors.
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold self-start sm:self-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Live Sync Enabled</span>
                    </div>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-8">
                    {/* SECTION 1: Showroom Name & Brand Identity (Bilingual) */}
                    <div className="bg-stone-50/80 rounded-2xl p-5 border border-stone-200/80 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                        <span className="text-sm font-bold text-stone-900">1. Showroom Name & Brand Identity (పేరు & బ్రాండింగ్)</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-800 mb-1">
                            Showroom Name (English) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. VADDI Jewellery"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#C5A869] focus:outline-hidden"
                          />
                          <span className="text-[11px] text-stone-400 mt-0.5 block">Displayed on website header, footer, modals and catalogs</span>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-800 mb-1">
                            షోరూమ్ పేరు (తెలుగు) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="ఉదా: వద్ధి జ్యువెలరీ"
                            value={shopNameTe}
                            onChange={(e) => setShopNameTe(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#C5A869] focus:outline-hidden"
                          />
                          <span className="text-[11px] text-stone-400 mt-0.5 block">తెలుగు భాష ఎంపిక చేసుకున్నప్పుడు వెబ్‌సైట్‌లో కనిపిస్తుంది</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className="block text-xs font-bold text-stone-800 mb-1">
                            Tagline / Subtitle (English)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Prestigious Heritage Jewellery Showroom"
                            value={shopTagline}
                            onChange={(e) => setShopTagline(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#C5A869] focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-800 mb-1">
                            ఉపశీర్షిక / ట్యాగ్‌లైన్ (తెలుగు)
                          </label>
                          <input
                            type="text"
                            placeholder="ఉదా: తరతరాల నమ్మకమైన బంగారు & వెండి షోరూమ్"
                            value={shopTaglineTe}
                            onChange={(e) => setShopTaglineTe(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#C5A869] focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: Showroom Address & Location (Bilingual) */}
                    <div className="bg-stone-50/80 rounded-2xl p-5 border border-stone-200/80 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                        <span className="text-sm font-bold text-stone-900">2. Showroom Location & Address (చిరునామా & లొకేషన్)</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-800 mb-1">
                            Address / Complex & Street (English) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. VNR & brothers, Vaddi Complex, Sundaracharyula St, Sarvakatta"
                            value={shopAddress}
                            onChange={(e) => setShopAddress(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#C5A869] focus:outline-hidden"
                          />
                          <span className="text-[11px] text-stone-400 mt-0.5 block">Street & complex details</span>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-800 mb-1">
                            చిరునామా / కాంప్లెక్స్ & వీధి (తెలుగు) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="ఉదా: వి.ఎన్.ఆర్ & బ్రదర్స్, వద్ధి కాంప్లెక్స్, సుందరాచార్యుల వీధి, సర్వకట్ట"
                            value={shopAddressTe}
                            onChange={(e) => setShopAddressTe(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#C5A869] focus:outline-hidden"
                          />
                          <span className="text-[11px] text-stone-400 mt-0.5 block">వీధి మరియు కాంప్లెక్స్ వివరాలు</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className="block text-xs font-bold text-stone-800 mb-1">
                            City, State & Pincode (English) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Proddatur, Andhra Pradesh 516360, India"
                            value={shopCityPincode}
                            onChange={(e) => setShopCityPincode(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#C5A869] focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-800 mb-1">
                            నగరం, రాష్ట్రం & పిన్‌కోడ్ (తెలుగు) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="ఉదా: ప్రొద్దుటూరు, ఆంధ్రప్రదేశ్ 516360, భారతదేశం"
                            value={shopCityPincodeTe}
                            onChange={(e) => setShopCityPincodeTe(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#C5A869] focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div className="pt-1">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-stone-800">
                            Google Maps Showroom Location Link
                          </label>
                          {shopMapsUrl && (
                            <a
                              href={shopMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
                            >
                              <span>Test Google Maps Link ↗</span>
                            </a>
                          )}
                        </div>
                        <input
                          type="url"
                          placeholder="https://maps.app.goo.gl/..."
                          value={shopMapsUrl}
                          onChange={(e) => setShopMapsUrl(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#C5A869] focus:outline-hidden"
                        />
                        <span className="text-[11px] text-stone-400 mt-0.5 block">Direct GPS map link for showroom directions</span>
                      </div>
                    </div>

                    {/* SECTION 3: Contact Numbers & Operating Hours */}
                    <div className="bg-stone-50/80 rounded-2xl p-5 border border-stone-200/80 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                        <span className="text-sm font-bold text-stone-900">3. Contact Numbers & Operating Hours (సంప్రదింపు నంబర్లు & వేళలు)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-800 mb-1">
                            Calling Phone Number <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="+91 9650052262"
                            value={shopPhone}
                            onChange={(e) => setShopPhone(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#C5A869] focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-800 mb-1">
                            WhatsApp Business Number <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="+919650052262"
                            value={shopWhatsapp}
                            onChange={(e) => setShopWhatsapp(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#C5A869] focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className="block text-xs font-bold text-stone-800 mb-1">
                            Opening Hours (English) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Monday - Sunday: 10:00 AM - 9:30 PM (All 7 Days)"
                            value={shopHours}
                            onChange={(e) => setShopHours(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#C5A869] focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-800 mb-1">
                            తెరిచే వేళలు (తెలుగు) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="ఉదా: సోమవారం - ఆదివారం: ఉదయం 10:00 - రాత్రి 9:30"
                            value={shopHoursTe}
                            onChange={(e) => setShopHoursTe(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#C5A869] focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 4: Hero Banner Bilingual Headlines */}
                    <div className="bg-stone-50/80 rounded-2xl p-5 border border-stone-200/80 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                        <span className="text-sm font-bold text-stone-900">4. Hero Banner Headlines (హీరో బ్యానర్ ముఖ్యాంశాలు)</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-800 mb-1">
                            Hero Main Title (English)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Timeless Gold & Silver Elegance in Proddatur"
                            value={heroTitle}
                            onChange={(e) => setHeroTitle(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#C5A869] focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-800 mb-1">
                            హీరో ప్రధాన శీర్షిక (తెలుగు)
                          </label>
                          <input
                            type="text"
                            placeholder="ఉదా: ప్రొద్దుటూరులో తరతరాల బంగారు, వెండి వైభవం"
                            value={heroTitleTe}
                            onChange={(e) => setHeroTitleTe(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#C5A869] focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className="block text-xs font-bold text-stone-800 mb-1">
                            Hero Subtitle (English)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Hero subtitle in English..."
                            value={heroSubtitle}
                            onChange={(e) => setHeroSubtitle(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#C5A869] focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-800 mb-1">
                            హీరో ఉపశీర్షిక (తెలుగు)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="హీరో ఉపశీర్షిక తెలుగులో..."
                            value={heroSubtitleTe}
                            onChange={(e) => setHeroSubtitleTe(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#C5A869] focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 5: LIVE BILINGUAL PREVIEW CARD */}
                    <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 space-y-4 border border-stone-800">
                      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-[#C5A869]" />
                          <span className="text-xs font-bold uppercase tracking-wider text-[#C5A869]">
                            Live Customer Display Preview (కస్టమర్లకు ఎలా కనిపిస్తుంది)
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-400 bg-stone-800 px-2 py-0.5 rounded">
                          English & తెలుగు
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* English Preview Card */}
                        <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                            English Mode
                          </span>
                          <div className="font-serif-luxury text-base font-bold text-white">
                            {shopName || 'VADDI Jewellery'}
                          </div>
                          <div className="text-[11px] text-[#C5A869]">
                            {shopTagline || 'Prestigious Heritage Jewellery Showroom'}
                          </div>
                          <div className="text-[11px] text-stone-400 pt-1">
                            📍 {shopAddress || 'VNR & brothers, Vaddi Complex'}, {shopCityPincode || 'Proddatur, AP'}
                          </div>
                          <div className="text-[11px] text-stone-400">
                            ⏰ {shopHours || '10:00 AM - 9:30 PM'}
                          </div>
                          <div className="text-[11px] text-emerald-400 font-mono">
                            📞 {shopPhone || '+91 9650052262'}
                          </div>
                        </div>

                        {/* Telugu Preview Card */}
                        <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                            తెలుగు మోడ్
                          </span>
                          <div className="font-serif-luxury text-base font-bold text-white">
                            {shopNameTe || 'వద్ధి జ్యువెలరీ'}
                          </div>
                          <div className="text-[11px] text-[#C5A869]">
                            {shopTaglineTe || 'తరతరాల నమ్మకమైన బంగారు & వెండి షోరూమ్'}
                          </div>
                          <div className="text-[11px] text-stone-400 pt-1">
                            📍 {shopAddressTe || 'వి.ఎన్.ఆర్ కాంప్లెక్స్, సర్వకట్ట'}, {shopCityPincodeTe || 'ప్రొద్దుటూరు'}
                          </div>
                          <div className="text-[11px] text-stone-400">
                            ⏰ {shopHoursTe || 'ఉదయం 10:00 - రాత్రి 9:30'}
                          </div>
                          <div className="text-[11px] text-emerald-400 font-mono">
                            📞 {shopPhone || '+91 9650052262'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submit Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-200">
                      <button
                        type="submit"
                        disabled={isSavingSettings}
                        className="px-8 py-3 bg-[#1A1A1A] hover:bg-stone-800 text-white font-bold text-sm rounded-xl flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-4 h-4 text-[#C5A869]" />
                        <span>{isSavingSettings ? 'Saving to Database...' : 'Save & Update Showroom Details'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShopName(defaultShowroomSettings.shop_name);
                          setShopNameTe(defaultShowroomSettings.shop_name_te || 'వద్ధి జ్యువెలరీ');
                          setShopTagline(defaultShowroomSettings.tagline);
                          setShopTaglineTe(defaultShowroomSettings.tagline_te || 'తరతరాల నమ్మకమైన బంగారు & వెండి షోరూమ్');
                          setShopAddress(defaultShowroomSettings.address);
                          setShopAddressTe(defaultShowroomSettings.address_te || 'వి.ఎన్.ఆర్ & బ్రదర్స్, వద్ధి కాంప్లెక్స్, సుందరాచార్యుల వీధి, సర్వకట్ట');
                          setShopCityPincode(defaultShowroomSettings.city_state_pincode);
                          setShopCityPincodeTe(defaultShowroomSettings.city_state_pincode_te || 'ప్రొద్దుటూరు, ఆంధ్రప్రదేశ్ 516360, భారతదేశం');
                          setShopPhone(defaultShowroomSettings.phone);
                          setShopWhatsapp(defaultShowroomSettings.whatsapp);
                          setShopMapsUrl(defaultShowroomSettings.google_maps_url);
                          setShopHours(defaultShowroomSettings.opening_hours);
                          setShopHoursTe(defaultShowroomSettings.opening_hours_te || 'సోమవారం - ఆదివారం: ఉదయం 10:00 - రాత్రి 9:30');
                        }}
                        className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl border border-stone-300 transition-colors cursor-pointer"
                      >
                        Reset to Default Vaddi Details
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT PRODUCT WITH WASTAGE & LABOUR PARAMETERS */}
        {isEditingProduct && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-stone-200 relative my-auto animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                    <Gem className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                      {selectedProduct ? `Edit Product: ${selectedProduct.code}` : 'Add New Jewellery Item'}
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Set weight, wastage percentage (VA) & labour costs to auto-calculate dynamic selling price.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingProduct(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProductForm} className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Item Code *</label>
                    <input
                      type="text"
                      required
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      placeholder="e.g. VD-G009"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Metal Type *</label>
                    <select
                      value={formMetal}
                      onChange={(e) => {
                        const metal = e.target.value as 'Gold' | 'Silver';
                        setFormMetal(metal);
                        if (metal === 'Silver') {
                          setFormPurity('92.5 Sterling Silver');
                          setFormWastagePercent(8.0);
                          setFormLabourCost(1200);
                          const silverCats = adminCategories.filter((c) => c.metal.toLowerCase() === 'silver');
                          if (silverCats.length > 0) {
                            setFormCategory(silverCats[0].name);
                            setFormCategoryTe(silverCats[0].name_te || '');
                          }
                        } else {
                          setFormPurity('22K BIS 916');
                          setFormWastagePercent(10.0);
                          setFormLabourCost(2500);
                          const goldCats = adminCategories.filter((c) => c.metal.toLowerCase() === 'gold');
                          if (goldCats.length > 0) {
                            setFormCategory(goldCats[0].name);
                            setFormCategoryTe(goldCats[0].name_te || '');
                          }
                        }
                      }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold"
                    >
                      <option value="Gold">Gold (బంగారం)</option>
                      <option value="Silver">Silver (వెండి)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Availability</label>
                    <select
                      value={formAvailability}
                      onChange={(e) => setFormAvailability(e.target.value as any)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold"
                    >
                      <option value="In Stock">In Stock (లభించును)</option>
                      <option value="Custom Order">Custom Order (ఆర్డర్ పై చేయబడును)</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Item Title (English) *</label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Traditional Temple Lakshmi Kasu Haram"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">ఆభరణం పేరు (తెలుగు)</label>
                    <input
                      type="text"
                      value={formTitleTe}
                      onChange={(e) => setFormTitleTe(e.target.value)}
                      placeholder="ఉదా: సాంప్రదాయ ఆలయ లక్ష్మీ కాసుల హారం"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-stone-700">Category *</label>
                      <button
                        type="button"
                        onClick={() => handleOpenAddCategory(formMetal)}
                        className="text-[10px] text-[#C5A869] hover:underline font-bold cursor-pointer"
                      >
                        + New Category
                      </button>
                    </div>
                    <select
                      value={formCategory}
                      onChange={(e) => {
                        const sel = e.target.value;
                        setFormCategory(sel);
                        const matched = adminCategories.find((c) => c.name === sel);
                        if (matched && matched.name_te) {
                          setFormCategoryTe(matched.name_te);
                        }
                      }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold"
                    >
                      {adminCategories
                        .filter((c) => c.metal.toLowerCase() === formMetal.toLowerCase())
                        .map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name} {c.name_te ? `(${c.name_te})` : ''}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Purity *</label>
                    <select
                      value={formPurity}
                      onChange={(e) => setFormPurity(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold"
                    >
                      {formMetal === 'Gold' ? (
                        <>
                          <option value="22K BIS 916">22K BIS 916 (Standard Jewellery - ₹{settings?.gold_rate_22k || '7020'}/g)</option>
                          <option value="24K 999.9">24K Pure Gold (999.9 Coins - ₹{settings?.gold_rate_24k || '7650'}/g)</option>
                          <option value="18K BIS 750">18K BIS Gold (₹{settings?.gold_rate_18k || '5750'}/g)</option>
                        </>
                      ) : (
                        <>
                          <option value="92.5 Sterling Silver">92.5 Sterling Silver (₹{settings?.silver_rate || '98'}/g)</option>
                          <option value="99.9 Pure Silver">99.9 Pure Silver (Coins & Pooja)</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Weight (Grams) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      required
                      value={formWeight}
                      onChange={(e) => setFormWeight(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* 2 NEW PARAMETERS: WASTAGE CHARGES (VA %) & LABOUR COST (MAKING CHARGE ₹) */}
                {/* ========================================================================= */}
                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-amber-800" />
                    <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wide">
                      Pricing Parameters: Wastage Charges & Labour Cost
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Parameter 1: Wastage Charges */}
                    <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-stone-800">
                          1. Wastage Charges (తరుగు శాతం / VA %) *
                        </label>
                        <span className="text-[11px] font-extrabold text-amber-900">
                          +₹{livePriceBreakdown.wastageAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="50"
                          value={formWastagePercent}
                          onChange={(e) => setFormWastagePercent(parseFloat(e.target.value) || 0)}
                          placeholder="e.g. 10.0"
                          className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500"
                        />
                        <span className="text-xs font-bold text-stone-600">%</span>
                      </div>
                      {/* Quick preset buttons */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {[6, 8, 10, 12, 14].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setFormWastagePercent(pct)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              formWastagePercent === pct
                                ? 'bg-amber-900 text-white'
                                : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Parameter 2: Labour Cost */}
                    <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-stone-800">
                          2. Labour / Making Cost (మజూరీ ఖర్చులు ₹) *
                        </label>
                        <span className="text-[11px] font-extrabold text-amber-900">
                          +₹{livePriceBreakdown.labourCost.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-600">₹</span>
                        <input
                          type="number"
                          step="10"
                          min="0"
                          value={formLabourCost}
                          onChange={(e) => setFormLabourCost(parseFloat(e.target.value) || 0)}
                          placeholder="e.g. 2500"
                          className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      {/* Quick preset buttons */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {[650, 1200, 2500, 4500, 6500].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setFormLabourCost(amt)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              formLabourCost === amt
                                ? 'bg-amber-900 text-white'
                                : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                            }`}
                          >
                            ₹{amt.toLocaleString('en-IN')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* LIVE AUTO-CALCULATED PRICE PREVIEW BREAKDOWN */}
                  <div className="bg-stone-900 text-white p-3.5 rounded-xl space-y-2 shadow-inner">
                    <div className="flex items-center justify-between text-xs text-amber-300 border-b border-stone-800 pb-2">
                      <span className="font-bold flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        Today's Gram Rate: ₹{livePriceBreakdown.ratePerGram.toLocaleString('en-IN')}/g ({livePriceBreakdown.purityBadge})
                      </span>
                      <span className="text-[11px] text-stone-400 font-mono">
                        Base: ₹{livePriceBreakdown.metalBasePrice.toLocaleString('en-IN')} ({formWeight}g)
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                      <div className="text-xs text-stone-300 space-y-0.5">
                        <div className="text-[11px] text-stone-400">
                          Calculation: Base (₹{livePriceBreakdown.metalBasePrice.toLocaleString('en-IN')}) + Wastage (₹{livePriceBreakdown.wastageAmount.toLocaleString('en-IN')}) + Labour (₹{livePriceBreakdown.labourCost.toLocaleString('en-IN')})
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-amber-300 uppercase tracking-wider block">
                          Auto-Calculated Selling Price
                        </span>
                        <span className="text-xl font-extrabold text-[#E6CA85]">
                          ₹{livePriceBreakdown.totalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Visibility Toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-stone-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formShowPrice === 1}
                        onChange={(e) => setFormShowPrice(e.target.checked ? 1 : 0)}
                        className="rounded text-[#C5A869] focus:ring-amber-500"
                      />
                      <span>Display Estimated Price on Showroom Website & Catalog</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-stone-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formAutoCalculatePrice}
                        onChange={(e) => setFormAutoCalculatePrice(e.target.checked)}
                        className="rounded text-[#C5A869] focus:ring-amber-500"
                      />
                      <span>Auto-Sync Daily with Market Rates</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Size / Dimension</label>
                    <input
                      type="text"
                      value={formSize}
                      onChange={(e) => setFormSize(e.target.value)}
                      placeholder="e.g. 2.6 Size or 22 Inches"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="e.g. 22K BIS Hallmarked heritage piece"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Direct Image Upload from Device */}
                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-stone-800">
                      Product Photos (Upload from Computer / Mobile) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowUrlFallback(!showUrlFallback)}
                      className="text-[11px] text-[#C5A869] hover:underline font-semibold cursor-pointer"
                    >
                      {showUrlFallback ? 'Hide URL Input' : 'Or use Image URL'}
                    </button>
                  </div>

                  {/* Upload Dropzone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingFile(true);
                    }}
                    onDragLeave={() => setIsDraggingFile(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingFile(false);
                      handleImageFileSelect(e.dataTransfer.files);
                    }}
                    className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                      isDraggingFile
                        ? 'border-[#C5A869] bg-amber-50/60 ring-2 ring-[#C5A869]/30'
                        : 'border-stone-300 hover:border-stone-400 bg-white'
                    }`}
                  >
                    <input
                      type="file"
                      id="product-image-file-input"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        handleImageFileSelect(e.target.files);
                        e.target.value = '';
                      }}
                    />

                    {isUploadingImage ? (
                      <div className="py-4 flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 text-[#C5A869] animate-spin" />
                        <span className="text-xs font-bold text-stone-700">Uploading jewellery photo...</span>
                        <span className="text-[11px] text-stone-400">Optimizing for catalogue display</span>
                      </div>
                    ) : (
                      <label
                        htmlFor="product-image-file-input"
                        className="cursor-pointer flex flex-col items-center justify-center gap-2 py-2"
                      >
                        <div className="w-10 h-10 rounded-full bg-amber-100/70 border border-amber-200 flex items-center justify-center text-[#C5A869]">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-stone-800 hover:text-[#C5A869]">
                            Click to Browse or Drag & Drop Jewellery Photo
                          </span>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Supports PNG, JPG, WEBP, SVG • Max 12MB • Supports Camera Capture on Mobile
                          </p>
                        </div>
                      </label>
                    )}
                  </div>

                  {/* Uploaded Images Preview Gallery */}
                  {formImagePaths.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <span className="text-[11px] font-bold text-stone-600 block">
                        Uploaded Photos ({formImagePaths.length}):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {formImagePaths.map((path, idx) => (
                          <div
                            key={idx}
                            className={`relative group rounded-lg overflow-hidden border p-1 bg-white shadow-2xs ${
                              path === formImagePath ? 'border-[#C5A869] ring-2 ring-[#C5A869]/30' : 'border-stone-200'
                            }`}
                          >
                            <img
                              src={path}
                              alt={`Jewellery preview ${idx + 1}`}
                              className="w-full h-20 object-contain rounded bg-stone-50"
                            />
                            {path === formImagePath && (
                              <span className="absolute top-2 left-2 bg-[#C5A869] text-stone-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs">
                                Main Photo
                              </span>
                            )}
                            <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                              {path !== formImagePath && (
                                <button
                                  type="button"
                                  onClick={() => setFormImagePath(path)}
                                  className="px-2 py-1 bg-[#C5A869] text-stone-950 font-bold rounded text-[10px] cursor-pointer"
                                  title="Set as main photo"
                                >
                                  Make Main
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = formImagePaths.filter((p) => p !== path);
                                  setFormImagePaths(updated);
                                  if (path === formImagePath) {
                                    setFormImagePath(updated[0] || '');
                                  }
                                }}
                                className="p-1 bg-red-600 text-white rounded text-[10px] cursor-pointer hover:bg-red-700"
                                title="Remove photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fallback URL Input */}
                  {showUrlFallback && (
                    <div className="mt-3 pt-3 border-t border-stone-200">
                      <label className="block text-[11px] font-bold text-stone-600 mb-1">
                        Or enter direct Image Web URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={formImagePath}
                          onChange={(e) => {
                            setFormImagePath(e.target.value);
                            if (e.target.value && !formImagePaths.includes(e.target.value)) {
                              setFormImagePaths([e.target.value, ...formImagePaths]);
                            }
                          }}
                          placeholder="https://..."
                          className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 py-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFeatured}
                      onChange={(e) => setFormFeatured(e.target.checked)}
                      className="rounded text-[#C5A869]"
                    />
                    <span>Mark as Featured Item</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formNewArrival}
                      onChange={(e) => setFormNewArrival(e.target.checked)}
                      className="rounded text-[#C5A869]"
                    />
                    <span>Mark as New Arrival</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setIsEditingProduct(false)}
                    className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProduct}
                    className="px-5 py-2 bg-[#1A1A1A] hover:bg-stone-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 text-[#C5A869]" />
                    <span>{isSavingProduct ? 'Saving...' : 'Save Product & Auto-Calculate Price'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT CATEGORY */}
        {isEditingCategory && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative my-auto animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                      {selectedCategoryToEdit ? `Edit Category: ${selectedCategoryToEdit.name}` : 'Add New Category'}
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Create custom categories for Gold & Silver jewellery
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingCategory(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCategoryForm} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Category Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={catFormName}
                    onChange={(e) => {
                      setCatFormName(e.target.value);
                      if (!selectedCategoryToEdit) {
                        setCatFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                      }
                    }}
                    placeholder="e.g. Gold Antique Harams & Chokers"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    కేటగిరీ పేరు (తెలుగు)
                  </label>
                  <input
                    type="text"
                    value={catFormNameTe}
                    onChange={(e) => setCatFormNameTe(e.target.value)}
                    placeholder="ఉదా: బంగారు యాంటిక్ హారాలు & చోకర్లు"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Metal Type *</label>
                    <select
                      value={catFormMetal}
                      onChange={(e) => setCatFormMetal(e.target.value as any)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold"
                    >
                      <option value="Gold">Gold (బంగారం)</option>
                      <option value="Silver">Silver (వెండి)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Display Sort Order</label>
                    <input
                      type="number"
                      min="1"
                      value={catFormSortOrder}
                      onChange={(e) => setCatFormSortOrder(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Category Slug (URL Identifier)
                  </label>
                  <input
                    type="text"
                    value={catFormSlug}
                    onChange={(e) => setCatFormSlug(e.target.value)}
                    placeholder="e.g. gold-antique-harams"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setIsEditingCategory(false)}
                    className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingCategory}
                    className="px-5 py-2 bg-[#1A1A1A] hover:bg-stone-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 text-[#C5A869]" />
                    <span>{isSavingCategory ? 'Saving...' : 'Save Category'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
