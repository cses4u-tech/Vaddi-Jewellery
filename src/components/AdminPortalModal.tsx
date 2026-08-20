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
} from '../services/api';
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
  shop_name_te: 'వధి జ్యువెలరీ',
  tagline: '100% BIS Hallmarked Gold & 92.5 Fine Silver Showroom',
  tagline_te: '100% BIS హాల్మార్క్ బంగారం & 92.5 స్వచ్ఛమైన వెండి షోరూమ్',
  phone: '+91 9650052262',
  whatsapp: '919650052262',
  address: 'VNR & brothers, Vaddi Complex, Sundaracharyula St, Sarvakatta',
  address_te: 'వి.ఎన్.ఆర్ & బ్రదర్స్, వధి కాంప్లెక్స్, సుందరాచార్యుల వీధి, సర్వకట్ట',
  city_state_pincode: 'Proddatur, Andhra Pradesh 516360, India',
  city_state_pincode_te: 'ప్రొద్దుటూరు, ఆంధ్రప్రదేశ్ 516360, భారతదేశం',
  google_maps_url: 'https://maps.app.goo.gl/LcQVnVkd3HuDWsgi9',
  opening_hours: '10:00 AM - 9:30 PM (All 7 Days)',
  opening_hours_te: 'సోమవారం - ఆదివారం: ఉదయం 10:00 - రాత్రి 9:30',
  gold_rate_24k: '7650',
  gold_rate_22k: '7020',
  gold_rate_18k: '5750',
  silver_rate: '98',
  hero_title: 'Exquisite Heritage Jewellery of Proddatur',
  hero_title_te: 'ప్రొద్దుటూరు శ్రేష్ఠమైన సంప్రదాయ బంగారు & వెండి ఆభరణాలు',
  hero_subtitle: 'Generations of Trust, BIS 916 Hallmarked Gold & 92.5 Fine Silver',
  hero_subtitle_te: 'తరతరాల నమ్మకం, 100% BIS 916 హాల్మార్క్ బంగారం & 92.5 స్వచ్ఛమైన వెండి',
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
  const [formShowPrice, setFormShowPrice] = useState<number>(0);
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
  const [shopName, setShopName] = useState(settings?.shop_name || 'VADDI Jewellery');
  const [shopNameTe, setShopNameTe] = useState(settings?.shop_name_te || 'వధి జ్యువెలరీ');
  const [shopTagline, setShopTagline] = useState(settings?.tagline || '100% BIS Hallmarked Gold & 92.5 Fine Silver Showroom');
  const [shopTaglineTe, setShopTaglineTe] = useState(settings?.tagline_te || '100% BIS హాల్మార్క్ బంగారం & 92.5 స్వచ్ఛమైన వెండి షోరూమ్');
  const [shopPhone, setShopPhone] = useState(settings?.phone || '+91 9650052262');
  const [shopWhatsapp, setShopWhatsapp] = useState(settings?.whatsapp || '+91 9650052262');
  const [shopAddress, setShopAddress] = useState(settings?.address || 'VNR & brothers, Vaddi Complex, Sundaracharyula St, Sarvakatta');
  const [shopCityPincode, setShopCityPincode] = useState(settings?.city_state_pincode || 'Proddatur, Andhra Pradesh 516360');
  const [shopMapsUrl, setShopMapsUrl] = useState(settings?.google_maps_url || 'https://maps.app.goo.gl/LcQVnVkd3HuDWsgi9');
  const [shopHours, setShopHours] = useState(settings?.opening_hours || '10:00 AM - 9:30 PM (All 7 Days)');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Global Notification / Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Sync initial settings when modal opens or settings update
  useEffect(() => {
    if (settings) {
      setRate24K(settings.gold_rate_24k || '7650');
      setRate22K(settings.gold_rate_22k || '7020');
      setRate18K(settings.gold_rate_18k || '5750');
      setRateSilver(settings.silver_rate || '98');
      setShopName(settings.shop_name || 'VADDI Jewellery');
      setShopNameTe(settings.shop_name_te || 'వధి జ్యువెలరీ');
      setShopTagline(settings.tagline || '100% BIS Hallmarked Gold & 92.5 Fine Silver Showroom');
      setShopTaglineTe(settings.tagline_te || '100% BIS హాల్మార్క్ బంగారం & 92.5 స్వచ్ఛమైన వెండి షోరూమ్');
      setShopPhone(settings.phone || '+91 9650052262');
      setShopWhatsapp(settings.whatsapp || '+91 9650052262');
      setShopAddress(settings.address || 'VNR & brothers, Vaddi Complex, Sundaracharyula St, Sarvakatta');
      setShopCityPincode(settings.city_state_pincode || 'Proddatur, Andhra Pradesh 516360');
      setShopMapsUrl(settings.google_maps_url || 'https://maps.app.goo.gl/LcQVnVkd3HuDWsgi9');
      setShopHours(settings.opening_hours || '10:00 AM - 9:30 PM (All 7 Days)');
    }
  }, [settings]);

  // Sync categories prop
  useEffect(() => {
    if (categories && categories.length > 0) {
      setAdminCategories(categories);
    }
  }, [categories]);

  // Load data when authenticated
  useEffect(() => {
    if (token && isOpen) {
      loadAdminData();
    }
  }, [token, isOpen]);

  const loadCategoriesList = async () => {
    if (!token) return;
    try {
      const catsData = await fetchAdminCategories(token);
      if (catsData) {
        setAdminCategories(catsData);
      }
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadAdminData = async () => {
    if (!token) return;
    try {
      const [statsData, prodsData, enqData, catsData] = await Promise.all([
        fetchAdminStats(token).catch(() => null),
        fetchAdminProducts(token).catch(() => []),
        fetchAdminEnquiries(token).catch(() => []),
        fetchAdminCategories(token).catch(() => []),
      ]);
      if (statsData) setStats(statsData);
      setProducts(prodsData);
      setEnquiries(enqData);
      if (catsData && catsData.length > 0) {
        setAdminCategories(catsData);
      }
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const authToken = await adminLogin(password);
      setToken(authToken);
      sessionStorage.setItem('vaddi_admin_token', authToken);
      setPassword('');
      showFeedback('success', 'Logged in to VADDI Showroom Admin Portal');
    } catch (err: any) {
      setLoginError(err.message || 'Invalid password. (Default is vaddi123)');
    } finally {
      setIsLoggingIn(false);
    }
  };

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
      showFeedback('success', "Today's Gold & Silver rates updated successfully for Proddatur Market!");
      await loadAdminData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update rates');
    } finally {
      setIsSavingRates(false);
    }
  };

  // Showroom Settings update handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const payload: Record<string, string> = {
        shop_name: shopName,
        shop_name_te: shopNameTe,
        tagline: shopTagline,
        tagline_te: shopTaglineTe,
        phone: shopPhone,
        whatsapp: shopWhatsapp,
        address: shopAddress,
        city_state_pincode: shopCityPincode,
        google_maps_url: shopMapsUrl,
        opening_hours: shopHours,
      };
      await updateAdminSettings(payload, token);
      const updatedSettings: ShowroomSettings = {
        ...(settings || defaultShowroomSettings),
        ...payload,
      };
      onSettingsUpdated(updatedSettings);
      showFeedback('success', 'Showroom profile & contact settings saved successfully');
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
      showFeedback('error', 'Please select a valid image file (JPG, PNG, WEBP).');
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
        } catch (uploadErr) {
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
    } catch (err: any) {
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
    const defaultCat = matchingCats[0]?.name || (initialMetal === 'Gold' ? 'Gold Harams & Bridal Sets' : 'Silver Pooja Items');
    const defaultCatTe = matchingCats[0]?.name_te || (initialMetal === 'Gold' ? 'బంగారు హారాలు & నెక్లెస్ లు' : 'వెండి పూజా సామాగ్రి');

    setFormCode(`VD-${initialMetal === 'Gold' ? 'G' : 'S'}${Math.floor(100 + Math.random() * 900)}`);
    setFormTitle('');
    setFormTitleTe('');
    setFormMetal(initialMetal);
    setFormCategory(defaultCat);
    setFormCategoryTe(defaultCatTe);
    setFormPurity(initialMetal === 'Gold' ? '22K BIS 916' : '92.5 Sterling Silver');
    setFormWeight(initialMetal === 'Gold' ? 15.5 : 50);
    setFormSize('Standard');
    setFormPrice(initialMetal === 'Gold' ? 115000 : 5000);
    setFormShowPrice(0);
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
    setFormPrice(prod.price || 0);
    setFormShowPrice(prod.show_price || 0);
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

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formTitle || !formWeight) {
      showFeedback('error', 'Please fill in product code, title, and weight.');
      return;
    }

    const finalMainImage = formImagePath.trim() || (formImagePaths[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80');
    const finalImagePaths = formImagePaths.length > 0 ? formImagePaths : [finalMainImage];

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
        price: Number(formPrice) || undefined,
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
        showFeedback('success', `Product ${payload.code} updated successfully`);
      } else {
        await createAdminProduct(payload, token);
        showFeedback('success', `New product ${payload.code} added to catalog`);
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
      showFeedback('success', `Product ${code} removed from catalog`);
      await loadAdminData();
      onProductsUpdated();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete product');
    }
  };

  // Enquiries Handlers
  const handleUpdateEnquiryStatus = async (id: number, newStatus: string) => {
    try {
      const notes = editingEnquiryNotes[id];
      await updateAdminEnquiry(id, { status: newStatus, notes }, token);
      showFeedback('success', `Inquiry status updated to ${newStatus}`);
      await loadAdminData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update inquiry');
    }
  };

  const handleDeleteEnquiry = async (id: number) => {
    if (!window.confirm('Delete this customer inquiry record?')) return;
    try {
      await deleteAdminEnquiry(id, token);
      showFeedback('success', 'Inquiry deleted');
      await loadAdminData();
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete inquiry');
    }
  };

  if (!isOpen) return null;

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !productSearch.trim() ||
      p.code.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.title_te && p.title_te.toLowerCase().includes(productSearch.toLowerCase())) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase());
    const matchesMetal =
      productMetalFilter === 'All' || p.metal.toLowerCase() === productMetalFilter.toLowerCase();
    const matchesCategory =
      productCategoryFilter === 'All' ||
      p.category === productCategoryFilter ||
      p.category_te === productCategoryFilter;
    return matchesSearch && matchesMetal && matchesCategory;
  });

  // Filtered Enquiries
  const filteredEnquiries = enquiries.filter((e) => {
    if (enquiryFilter === 'All') return true;
    return e.status === enquiryFilter;
  });

  // Filtered Categories
  const filteredCategories = adminCategories.filter((cat) => {
    const searchLower = categorySearch.toLowerCase().trim();
    const matchesSearch =
      !searchLower ||
      cat.name.toLowerCase().includes(searchLower) ||
      (cat.name_te && cat.name_te.toLowerCase().includes(searchLower)) ||
      (cat.slug && cat.slug.toLowerCase().includes(searchLower));
    const matchesMetal =
      categoryMetalFilter === 'All' || cat.metal.toLowerCase() === categoryMetalFilter.toLowerCase();
    return matchesSearch && matchesMetal;
  });

  return (
    <div
      id="admin-portal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="admin-portal-card"
        className="bg-white rounded-2xl max-w-6xl w-full h-[90vh] max-h-[850px] shadow-2xl border border-stone-300 flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Feedback Alert Toast */}
        {feedback && (
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-200 ${
              feedback.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : 'bg-rose-900 text-rose-100 border-rose-700'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Modal Top Header Bar */}
        <div className="bg-[#1A1A1A] text-white px-5 py-3.5 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C5A869]/20 border border-[#C5A869]/50 flex items-center justify-center text-[#C5A869]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-luxury font-bold text-base text-[#FDFCFB]">
                  VADDI Showroom Admin Portal
                </span>
                <span className="text-[10px] bg-[#C5A869] text-stone-950 font-extrabold px-2 py-0.5 rounded">
                  PRODDATUR
                </span>
              </div>
              <span className="text-[11px] text-stone-400 block">
                {language === 'te' ? 'షోరూమ్ నిర్వహణ & లైవ్ ధరల ఎడిటర్' : 'Inventory, Live Market Rates & Customer Leads'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {token && (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Login View vs Admin Management Dashboard */}
        {!token ? (
          /* Login Screen */
          <div className="flex-1 flex items-center justify-center p-6 bg-stone-50 overflow-y-auto">
            <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-stone-200 shadow-md text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-8 h-8 text-[#C5A869]" />
              </div>

              <div>
                <h3 className="font-serif-luxury text-2xl font-bold text-stone-900">
                  {language === 'te' ? 'అడ్మిన్ లాగిన్' : 'Showroom Owner Login'}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Enter your master password to update daily gold/silver rates and manage inventory.
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password (default: vaddi123)"
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#C5A869] focus:bg-white text-stone-900"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Default showroom master password is <strong className="text-stone-700">vaddi123</strong>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 bg-[#1A1A1A] hover:bg-stone-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-4 h-4 text-[#C5A869]" />
                  <span>{isLoggingIn ? 'Verifying Password...' : 'Unlock Admin Portal'}</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Admin Dashboard Layout */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-stone-100">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-56 bg-white border-b md:border-b-0 md:border-r border-stone-200 p-3 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-[#C5A869]" />
                <span>Dashboard Overview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('rates')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left whitespace-nowrap ${
                  activeTab === 'rates'
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Coins className="w-4 h-4 text-amber-500" />
                <span>Daily Rates (నేటి ధరలు)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left whitespace-nowrap ${
                  activeTab === 'products'
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Gem className="w-4 h-4 text-amber-700" />
                <span>Jewellery Inventory</span>
                {products.length > 0 && (
                  <span className="ml-auto text-[10px] bg-stone-200 text-stone-800 px-1.5 py-0.5 rounded-full">
                    {products.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('categories')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left whitespace-nowrap ${
                  activeTab === 'categories'
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Layers className="w-4 h-4 text-amber-600" />
                <span>Categories (కేటగిరీలు)</span>
                {adminCategories.length > 0 && (
                  <span className="ml-auto text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded-full">
                    {adminCategories.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('enquiries')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left whitespace-nowrap ${
                  activeTab === 'enquiries'
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Customer Inquiries</span>
                {enquiries.filter((e) => e.status === 'New').length > 0 && (
                  <span className="ml-auto text-[10px] bg-rose-600 text-white font-extrabold px-1.5 py-0.5 rounded-full">
                    {enquiries.filter((e) => e.status === 'New').length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Settings className="w-4 h-4 text-stone-500" />
                <span>Showroom Profile</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              {/* TAB 1: DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif-luxury text-xl font-bold text-stone-900">
                      Showroom Analytics & Quick Controls
                    </h3>
                    <p className="text-xs text-stone-500">
                      Live status of Proddatur jewellery catalog and customer leads.
                    </p>
                  </div>

                  {/* 4 Stat Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                      <div className="flex items-center justify-between text-stone-500 text-xs font-semibold mb-1">
                        <span>Total Catalog Items</span>
                        <Gem className="w-4 h-4 text-[#C5A869]" />
                      </div>
                      <div className="text-2xl font-extrabold text-stone-900">
                        {stats?.total_products || products.length}
                      </div>
                      <span className="text-[10px] text-stone-400">
                        Gold: {stats?.gold_products || products.filter((p) => p.metal === 'Gold').length} • Silver: {stats?.silver_products || products.filter((p) => p.metal === 'Silver').length}
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                      <div className="flex items-center justify-between text-stone-500 text-xs font-semibold mb-1">
                        <span>Today's 22K Gold</span>
                        <Coins className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="text-2xl font-extrabold text-amber-800">
                        ₹{Number(rate22K).toLocaleString('en-IN')}/g
                      </div>
                      <span className="text-[10px] text-stone-400">
                        8g Pavan: ₹{(Number(rate22K) * 8).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                      <div className="flex items-center justify-between text-stone-500 text-xs font-semibold mb-1">
                        <span>92.5 Silver Rate</span>
                        <Sparkles className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="text-2xl font-extrabold text-slate-800">
                        ₹{Number(rateSilver).toLocaleString('en-IN')}/g
                      </div>
                      <span className="text-[10px] text-stone-400">
                        1 Kg Bar: ₹{(Number(rateSilver) * 1000).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                      <div className="flex items-center justify-between text-stone-500 text-xs font-semibold mb-1">
                        <span>Customer Inquiries</span>
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-2xl font-extrabold text-blue-800">
                        {stats?.total_enquiries || enquiries.length}
                      </div>
                      <span className="text-[10px] text-rose-600 font-bold">
                        {stats?.new_enquiries || enquiries.filter((e) => e.status === 'New').length} pending follow-ups
                      </span>
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
                        <span className="text-[11px] text-stone-500">Add 22K Gold or 92.5 Silver piece</span>
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
                        <span className="text-[11px] text-stone-500">Create & organize custom collections</span>
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
                        <span className="text-[11px] text-stone-500">24K, 22K gold and silver per gram rates</span>
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
                        <span className="text-[11px] text-stone-500">View quotation & WhatsApp leads</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: DAILY RATES EDITOR */}
              {activeTab === 'rates' && (
                <div className="max-w-2xl bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-6">
                  <div>
                    <h3 className="font-serif-luxury text-xl font-bold text-stone-900">
                      Update Today's Gold & Silver Rates (నేటి ధరలు)
                    </h3>
                    <p className="text-xs text-stone-500">
                      Changes made here instantly update the live scrolling ticker and rate cards across the entire showroom app.
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
                      className="w-full py-3 bg-[#1A1A1A] hover:bg-stone-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 text-[#C5A869]" />
                      <span>{isSavingRates ? 'Saving Rates...' : 'Save & Publish Today\'s Rates'}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: PRODUCTS INVENTORY */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  {/* Products Header Toolbar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-stone-200">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="relative flex-1 max-w-sm">
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
                        onChange={(e) => {
                          setProductMetalFilter(e.target.value as any);
                          setProductCategoryFilter('All');
                        }}
                        className="py-1.5 px-3 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold"
                      >
                        <option value="All">All Metals</option>
                        <option value="Gold">Gold Only</option>
                        <option value="Silver">Silver Only</option>
                      </select>

                      <select
                        value={productCategoryFilter}
                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                        className="py-1.5 px-3 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold max-w-[170px] truncate"
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

                    <button
                      type="button"
                      onClick={handleOpenAddProduct}
                      className="flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-stone-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4 text-[#C5A869]" />
                      <span>Add Jewellery Item</span>
                    </button>
                  </div>

                  {/* Products Table */}
                  <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto max-h-[500px]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200 sticky top-0">
                          <tr>
                            <th className="p-3">Item</th>
                            <th className="p-3">Code</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Purity & Wt</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-stone-400">
                                No items found matching search filters.
                              </td>
                            </tr>
                          ) : (
                            filteredProducts.map((prod) => (
                              <tr key={prod.id} className="hover:bg-stone-50/80 transition-colors">
                                <td className="p-3">
                                  <div className="flex items-center gap-2.5">
                                    <img
                                      src={prod.image_path}
                                      alt={prod.title}
                                      className="w-10 h-10 rounded-lg object-contain bg-stone-100 border border-stone-200 p-0.5 shrink-0"
                                    />
                                    <div>
                                      <span className="font-bold text-stone-900 block line-clamp-1">{prod.title}</span>
                                      {prod.title_te && (
                                        <span className="text-[11px] text-stone-500 block line-clamp-1">{prod.title_te}</span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 font-mono font-bold text-stone-800">{prod.code}</td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                      prod.metal === 'Gold'
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                        : 'bg-slate-100 text-slate-800 border border-slate-300'
                                    }`}
                                  >
                                    {prod.category}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className="font-bold text-stone-800 block">{prod.weight}g</span>
                                  <span className="text-[10px] text-stone-500">{prod.purity}</span>
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
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3.5: CATEGORIES (కేటగిరీలు) */}
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
                        className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenAddCategory('Gold')}
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
                            <th className="p-3">Category Name</th>
                            <th className="p-3">Metal</th>
                            <th className="p-3">Slug / URL Identifier</th>
                            <th className="p-3">Display Order</th>
                            <th className="p-3">Catalog Items</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {filteredCategories.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-stone-400">
                                <div className="space-y-2">
                                  <p>No categories found matching current filters.</p>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAddCategory('Gold')}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-900 rounded-lg text-xs font-bold hover:bg-amber-200 cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Create Custom Category</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            filteredCategories.map((cat) => {
                              const prodCount = products.filter(
                                (p) => p.category === cat.name || (p.metal === cat.metal && p.category?.toLowerCase() === cat.name.toLowerCase())
                              ).length;
                              return (
                                <tr key={cat.id} className="hover:bg-stone-50/80 transition-colors">
                                  <td className="p-3">
                                    <div>
                                      <span className="font-bold text-stone-900 text-xs block">{cat.name}</span>
                                      {cat.name_te && (
                                        <span className="text-[11px] text-amber-800 font-medium block">{cat.name_te}</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        cat.metal === 'Gold'
                                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                          : 'bg-slate-100 text-slate-800 border border-slate-300'
                                      }`}
                                    >
                                      {cat.metal}
                                    </span>
                                  </td>
                                  <td className="p-3 font-mono text-[11px] text-stone-600">
                                    <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-700 border border-stone-200">
                                      {cat.slug}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <span className="text-xs font-bold text-stone-700">#{cat.sort_order}</span>
                                  </td>
                                  <td className="p-3">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                                      {cat.product_count !== undefined ? cat.product_count : prodCount} items
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

              {/* TAB 4: ENQUIRIES & LEADS */}
              {activeTab === 'enquiries' && (
                <div className="space-y-4">
                  {/* Filter Toolbar */}
                  <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-stone-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-700">Status Filter:</span>
                      {['All', 'New', 'Contacted', 'Completed', 'Cancelled'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setEnquiryFilter(status)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            enquiryFilter === status
                              ? 'bg-[#1A1A1A] text-white'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-stone-500 font-medium">
                      Showing {filteredEnquiries.length} leads
                    </span>
                  </div>

                  {/* Enquiries Cards List */}
                  <div className="space-y-3">
                    {filteredEnquiries.length === 0 ? (
                      <div className="bg-white p-8 rounded-xl border border-stone-200 text-center text-stone-400 text-xs">
                        No customer inquiries found in this category.
                      </div>
                    ) : (
                      filteredEnquiries.map((enq) => (
                        <div
                          key={enq.id}
                          className="bg-white rounded-xl p-4 border border-stone-200 shadow-2xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-stone-900">{enq.name}</span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    enq.status === 'New'
                                      ? 'bg-rose-100 text-rose-800'
                                      : enq.status === 'Contacted'
                                      ? 'bg-amber-100 text-amber-800'
                                      : enq.status === 'Completed'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-stone-100 text-stone-600'
                                  }`}
                                >
                                  {enq.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-stone-500 mt-0.5">
                                <a
                                  href={`tel:${enq.phone}`}
                                  className="text-stone-800 font-bold hover:underline flex items-center gap-1"
                                >
                                  <Phone className="w-3 h-3 text-emerald-600" />
                                  <span>{enq.phone}</span>
                                </a>
                                {enq.email && <span>• {enq.email}</span>}
                                <span>• {enq.created_at}</span>
                              </div>
                            </div>

                            {/* Direct WhatsApp Quick Response Button */}
                            <div className="flex items-center gap-2">
                              <a
                                href={`https://wa.me/${enq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                  `నమస్కారం ${enq.name} గారు, వడ్డీ జ్యువెలరీ (ప్రొద్దుటూరు) నుండి మాట్లాడుతున్నాము. మీరు వెబ్‌సైట్‌లో ${enq.product_title || 'ఆభరణం'} గురించి అడిగిన సమాచారం ఇక్కడ అందిస్తున్నాము.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Reply on WhatsApp</span>
                              </a>

                              <button
                                type="button"
                                onClick={() => handleDeleteEnquiry(enq.id)}
                                className="p-1.5 text-stone-400 hover:text-rose-600 rounded cursor-pointer"
                                title="Delete enquiry"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Product Context Chip */}
                          {enq.product_code && (
                            <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-xs flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">
                                  {enq.product_code}
                                </span>
                                <span className="font-semibold text-stone-800">{enq.product_title}</span>
                              </div>
                            </div>
                          )}

                          {/* Inquiry Message */}
                          {enq.message && (
                            <p className="text-xs text-stone-700 bg-stone-50/60 p-2.5 rounded-lg border border-stone-100 italic">
                              "{enq.message}"
                            </p>
                          )}

                          {/* Status and Notes Update */}
                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            <span className="text-xs font-bold text-stone-600">Update Status:</span>
                            <div className="flex items-center gap-1.5">
                              {['New', 'Contacted', 'Completed', 'Cancelled'].map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleUpdateEnquiryStatus(enq.id, st)}
                                  className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                                    enq.status === st
                                      ? 'bg-[#1A1A1A] text-white'
                                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: SHOWROOM SETTINGS */}
              {activeTab === 'settings' && (
                <div className="max-w-3xl bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-6">
                  <div>
                    <h3 className="font-serif-luxury text-xl font-bold text-stone-900">
                      Showroom Profile & Contact Settings
                    </h3>
                    <p className="text-xs text-stone-500">
                      Configure store address, contact numbers, hours, and Google Maps direction links.
                    </p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Showroom Name (English)</label>
                        <input
                          type="text"
                          required
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Showroom Name (Telugu - తెలుగు)</label>
                        <input
                          type="text"
                          value={shopNameTe}
                          onChange={(e) => setShopNameTe(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Tagline (English)</label>
                        <input
                          type="text"
                          value={shopTagline}
                          onChange={(e) => setShopTagline(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Tagline (Telugu - తెలుగు)</label>
                        <input
                          type="text"
                          value={shopTaglineTe}
                          onChange={(e) => setShopTaglineTe(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Showroom Phone</label>
                        <input
                          type="text"
                          value={shopPhone}
                          onChange={(e) => setShopPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">WhatsApp Number</label>
                        <input
                          type="text"
                          value={shopWhatsapp}
                          onChange={(e) => setShopWhatsapp(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Showroom Street Address</label>
                      <input
                        type="text"
                        value={shopAddress}
                        onChange={(e) => setShopAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">City, State & Pincode</label>
                        <input
                          type="text"
                          value={shopCityPincode}
                          onChange={(e) => setShopCityPincode(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Opening Hours</label>
                        <input
                          type="text"
                          value={shopHours}
                          onChange={(e) => setShopHours(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Google Maps Direction URL</label>
                      <input
                        type="url"
                        value={shopMapsUrl}
                        onChange={(e) => setShopMapsUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="w-full py-3 bg-[#1A1A1A] hover:bg-stone-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 text-[#C5A869]" />
                      <span>{isSavingSettings ? 'Saving...' : 'Save Showroom Settings'}</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nested Add / Edit Product Modal */}
        {isEditingProduct && (
          <div
            className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsEditingProduct(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-300 my-auto space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h4 className="font-serif-luxury text-xl font-bold text-stone-900">
                  {selectedProduct ? `Edit Jewellery (${selectedProduct.code})` : 'Add New Jewellery Item'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditingProduct(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProductForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Product Code *</label>
                    <input
                      type="text"
                      required
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Metal Type *</label>
                    <select
                      value={formMetal}
                      onChange={(e) => {
                        const newMetal = e.target.value as 'Gold' | 'Silver';
                        setFormMetal(newMetal);
                        const matching = adminCategories.filter(
                          (c) => c.metal.toLowerCase() === newMetal.toLowerCase()
                        );
                        if (matching.length > 0) {
                          setFormCategory(matching[0].name);
                          setFormCategoryTe(matching[0].name_te || matching[0].name);
                        } else {
                          if (newMetal === 'Gold') {
                            setFormCategory('Gold Harams & Necklaces');
                            setFormCategoryTe('బంగారు హారాలు & నెక్లెస్‌లు');
                          } else {
                            setFormCategory('Silver God Idols');
                            setFormCategoryTe('వెండి దేవుడి విగ్రహాలు');
                          }
                        }
                        if (!selectedProduct) {
                          setFormCode(`VD-${newMetal === 'Gold' ? 'G' : 'S'}${Math.floor(100 + Math.random() * 900)}`);
                        }
                        if (newMetal === 'Gold') {
                          if (formPurity.includes('Silver')) {
                            setFormPurity('22K BIS 916');
                          }
                        } else {
                          if (formPurity.includes('22K') || formPurity.includes('24K') || formPurity.includes('Gold')) {
                            setFormPurity('92.5 Sterling Silver');
                          }
                        }
                      }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold"
                    >
                      <option value="Gold">22K / 24K Gold (బంగారం)</option>
                      <option value="Silver">92.5 Sterling Silver (వెండి)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Title (English) *</label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Traditional 22K Lakshmi Kasu Haram"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Title (Telugu - తెలుగు)</label>
                    <input
                      type="text"
                      value={formTitleTe}
                      onChange={(e) => setFormTitleTe(e.target.value)}
                      placeholder="ఉదా: 22 క్యారెట్ల లక్ష్మీ కాసుల హారం"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-stone-700">Category *</label>
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
                      {/* Fallback in case current product category is not in list */}
                      {formCategory &&
                        !adminCategories.some(
                          (c) =>
                            c.metal.toLowerCase() === formMetal.toLowerCase() &&
                            c.name === formCategory
                        ) && (
                          <option value={formCategory}>{formCategory} (Custom)</option>
                        )}
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
                          <option value="22K BIS 916">22K BIS 916 (Standard Jewellery)</option>
                          <option value="24K Pure Gold (999)">24K Pure Gold (999.9 Coins)</option>
                          <option value="18K BIS Gold">18K BIS Hallmarked Gold</option>
                        </>
                      ) : (
                        <>
                          <option value="92.5 Sterling Silver">92.5 Sterling Silver (Hallmarked)</option>
                          <option value="99.9 Pure Silver">99.9 Pure Silver (Coins & Pooja)</option>
                          <option value="90.0 Traditional Silver">90.0 Traditional Silver</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Weight (Grams) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formWeight}
                      onChange={(e) => setFormWeight(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Size / Dimension</label>
                    <input
                      type="text"
                      value={formSize}
                      onChange={(e) => setFormSize(e.target.value)}
                      placeholder="e.g. 2.6 Size or 18 Inches"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={formPrice}
                      onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 115000"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Availability</label>
                    <select
                      value={formAvailability}
                      onChange={(e) => setFormAvailability(e.target.value as any)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Custom Order">Custom Order</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
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
                            Supports PNG, JPG, WEBP • Max 12MB • Supports Camera Capture on Mobile
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
                          placeholder="https://images.unsplash.com/..."
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
                    <span>{isSavingProduct ? 'Saving...' : 'Save Product'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Nested Add / Edit Category Modal */}
        {isEditingCategory && (
          <div
            className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsEditingCategory(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-300 my-auto space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div>
                  <h4 className="font-serif-luxury text-xl font-bold text-stone-900">
                    {selectedCategoryToEdit ? 'Edit Category' : 'Create Custom Category'}
                  </h4>
                  <p className="text-xs text-stone-500">
                    Manage categories for Proddatur gold and silver showcase.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingCategory(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCategoryForm} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Metal Showcase Type *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCatFormMetal('Gold')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        catFormMetal === 'Gold'
                          ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400/30'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <Coins className="w-4 h-4 text-amber-600" />
                      <span>22K / 24K Gold</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCatFormMetal('Silver')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        catFormMetal === 'Silver'
                          ? 'bg-slate-100 border-slate-400 text-slate-900 ring-2 ring-slate-400/30'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-slate-600" />
                      <span>92.5 Sterling Silver</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Category Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={catFormName}
                    onChange={(e) => {
                      setCatFormName(e.target.value);
                      if (!selectedCategoryToEdit) {
                        setCatFormSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/(^-|-$)/g, '')
                        );
                      }
                    }}
                    placeholder="e.g. Traditional Vaddanams or Antique Jhumkas"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-900 focus:bg-white focus:ring-2 focus:ring-[#C5A869]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Category Name (Telugu - తెలుగు)</label>
                  <input
                    type="text"
                    value={catFormNameTe}
                    onChange={(e) => setCatFormNameTe(e.target.value)}
                    placeholder="ఉదా: బంగారు వడ్డాణాలు / ఆంటీక్ జుంకీలు"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-900 focus:bg-white focus:ring-2 focus:ring-[#C5A869]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Slug / URL Identifier</label>
                    <input
                      type="text"
                      value={catFormSlug}
                      onChange={(e) =>
                        setCatFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))
                      }
                      placeholder="e.g. traditional-vaddanams"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono font-bold text-stone-800"
                    />
                    <span className="text-[10px] text-stone-400 mt-0.5 block">Used for routing & filtering</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Display Sort Order</label>
                    <input
                      type="number"
                      value={catFormSortOrder}
                      onChange={(e) => setCatFormSortOrder(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-800"
                    />
                    <span className="text-[10px] text-stone-400 mt-0.5 block">Lower numbers appear first</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
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
