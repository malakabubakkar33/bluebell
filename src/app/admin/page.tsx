'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  Loader2,
  X,
  Upload,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductsContext';
import { CATEGORIES } from '@/lib/data/mockData';
import { Product, Category } from '@/types';

// Admin Components
import { AdminSidebar, AdminTab } from '@/components/admin/AdminSidebar';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { DashboardView } from '@/components/admin/views/DashboardView';
import { ProductsView } from '@/components/admin/views/ProductsView';
import { OrdersView } from '@/components/admin/views/OrdersView';
import { CustomersView } from '@/components/admin/views/CustomersView';
import { InventoryView } from '@/components/admin/views/InventoryView';
import { BannersView } from '@/components/admin/views/BannersView';
import { ReportsView } from '@/components/admin/views/ReportsView';
import { CategoriesView } from '@/components/admin/views/CategoriesView';
import { CouponsView } from '@/components/admin/views/CouponsView';
import { ReviewsView } from '@/components/admin/views/ReviewsView';
import { SettingsView } from '@/components/admin/views/SettingsView';

export default function AdminPage() {
  const { user, isAdmin, login, logout, usersList, adminUpdateUserStatus, adminDeleteUser } = useAuth();
  const {
    products: productsList,
    addProduct,
    updateProduct,
    deleteProduct,
    categories: categoriesList,
    addCategory,
    updateCategory,
    deleteCategory,
    banners: bannersList,
    addBanner,
    updateBanner,
    deleteBanner,
    deals: dealsList,
    addDeal,
    updateDeal,
    deleteDeal,
  } = useProducts();

  // Navigation State
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // File Upload Ref for Products
  const productImageInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingProduct, setIsUploadingProduct] = useState(false);

  const handleProductFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingProduct(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        setProductForm((prev) => ({
          ...prev,
          image: data.url,
        }));
        showToast(`Image uploaded successfully (${data.provider})!`);
        setIsUploadingProduct(false);
        return;
      }
    } catch (err) {
      console.error('Upload error:', err);
    }

    // Fallback to local FileReader
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      if (loadEvt.target?.result) {
        setProductForm((prev) => ({
          ...prev,
          image: loadEvt.target?.result as string,
        }));
        showToast('Product image loaded locally!');
      }
      setIsUploadingProduct(false);
    };
    reader.readAsDataURL(file);
  };

  // Login Form State (Shown when not authenticated)
  const [loginEmail, setLoginEmail] = useState('admin@bluebells.pk');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    brand: 'Apple',
    category: 'iPhone',
    categorySlug: 'iphone',
    price: 349999,
    originalPrice: 389999,
    stock: 12,
    badge: 'Flagship',
    image: '/categories/iphone.svg',
    warranty: '1 Year Official Brand Warranty (PTA Approved)',
    description: '',
  });

  // Order Details Modal State
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const result = await login(loginEmail, loginPassword);
    if (!result.success) {
      setLoginError(result.error || 'Invalid admin credentials.');
    }
    setIsLoggingIn(false);
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      brand: p.brand,
      category: p.category,
      categorySlug: p.categorySlug || 'iphone',
      price: p.price,
      originalPrice: p.originalPrice || p.price,
      stock: p.stock || 10,
      badge: p.badge || 'Active',
      image: p.image,
      warranty: p.warranty || '1 Year Official Brand Warranty (PTA Approved)',
      description: p.description || '',
    });
    setShowProductModal(true);
  };

  // Open Add Product Modal
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      brand: 'Apple',
      category: 'iPhone',
      categorySlug: 'iphone',
      price: 99999,
      originalPrice: 119999,
      stock: 10,
      badge: 'New',
      image: '/categories/iphone.svg',
      warranty: '1 Year Official Brand Warranty (PTA Approved)',
      description: '',
    });
    setShowProductModal(true);
  };

  // Save Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: productForm.name,
        brand: productForm.brand,
        category: productForm.category,
        categorySlug: productForm.categorySlug,
        price: Number(productForm.price),
        originalPrice: Number(productForm.originalPrice),
        stock: Number(productForm.stock),
        badge: productForm.badge,
        image: productForm.image,
        warranty: productForm.warranty,
        description: productForm.description,
      });
      showToast(`Updated "${productForm.name}" successfully.`);
    } else {
      const newP: Product = {
        id: `prod-${Date.now()}`,
        name: productForm.name,
        slug: productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        subtitle: productForm.warranty || 'PTA Approved Flagship',
        brand: productForm.brand,
        category: productForm.category,
        categorySlug: productForm.categorySlug,
        price: Number(productForm.price),
        originalPrice: Number(productForm.originalPrice),
        stock: Number(productForm.stock),
        badge: productForm.badge,
        image: productForm.image,
        gallery: [productForm.image],
        rating: 5.0,
        reviewCount: 1,
        warranty: productForm.warranty,
        description: productForm.description,
        isFeatured: true,
      };
      addProduct(newP);
      showToast(`Added "${newP.name}" to storefront!`);
    }

    setShowProductModal(false);
  };

  // Quick stock update from Inventory view
  const handleQuickUpdateStock = (productId: string, newStock: number) => {
    updateProduct(productId, { stock: newStock });
    showToast(`Inventory updated to ${newStock} units.`);
  };

  // -------------------------------------------------------------
  // VIEW 1: NOT AUTHENTICATED -> EXACT SPLIT SCREEN LOGIN MOCKUP
  // -------------------------------------------------------------
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row bg-[#F0F4F9]">
        {/* Left Side: Blue Bells Branding with Visual Mockups */}
        <div
          className="lg:w-1/2 min-h-[380px] lg:min-h-screen flex flex-col justify-between p-8 sm:p-12 relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #071A38 0%, #0969DA 55%, #1877F2 100%)',
          }}
        >
          {/* Subtle Ambient Glowing Rings */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute bottom-10 right-0 w-96 h-96 rounded-full bg-blue-300/15 blur-3xl" />
          </div>

          {/* Top Brand Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00C6FF] to-[#0072FF] flex items-center justify-center shadow-xl shadow-blue-500/30">
              <svg
                className="w-7 h-7 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-sans">
                BLUE BELLS
              </h1>
              <p className="text-[10px] sm:text-xs font-bold text-sky-300 uppercase tracking-[0.2em]">
                MOBILE SHOP
              </p>
            </div>
          </div>

          {/* Center Content & Flagships Showcase */}
          <div className="relative z-10 my-auto py-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-sky-200 text-xs font-bold mb-4 border border-white/15">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Admin Panel</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              Manage Your Store, <br className="hidden sm:block" />
              Grow Your Business
            </h2>
            <p className="mt-3 text-sm sm:text-base text-blue-100/80 max-w-md mx-auto lg:mx-0">
              Sign in to your admin account to continue managing inventory, orders, and customer accounts.
            </p>

            {/* Visual Floating Device Showcase */}
            <div className="mt-8 flex items-center justify-center lg:justify-start gap-4">
              <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-xs text-white font-medium flex items-center gap-2">
                <span>📱</span>
                <span>Flagship iPhones</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-xs text-white font-medium flex items-center gap-2">
                <span>⚡</span>
                <span>Samsung Galaxy S24</span>
              </div>
            </div>
          </div>

          {/* Bottom Security Footer */}
          <div className="relative z-10 flex items-center justify-between text-xs text-blue-200/70 border-t border-white/10 pt-4">
            <span>Official Authorized Store Portal</span>
            <Link href="/" className="hover:text-white underline underline-offset-2 font-semibold">
              ← Return to Storefront
            </Link>
          </div>
        </div>

        {/* Right Side: Exact Sign In Card from Mockup */}
        <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/60 border border-slate-100">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Sign in to your admin account
              </p>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@bluebells.pk"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1877F2] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1877F2] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1877F2] focus:ring-blue-500/30"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  className="font-semibold text-[#1877F2] hover:underline"
                  onClick={() => alert('Password reset link sent to registered admin phone/email.')}
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98]"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                OR
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Supabase Button from Mockup */}
            <button
              type="button"
              onClick={() => {
                setLoginEmail('admin@bluebells.pk');
                setLoginPassword('admin123');
              }}
              className="w-full py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 109 113" fill="none">
                <path
                  d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z"
                  fill="#249361"
                />
                <path
                  d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z"
                  fill="#3ECF8E"
                />
              </svg>
              <span>Continue with Supabase</span>
            </button>

            {/* Bottom Security Notice */}
            <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Secure Admin Access</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: AUTHENTICATED -> COMPLETE ADMIN PANEL MATCHING MOCKUP
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F4F7FC] text-slate-900 font-sans">
      {/* 1. Left Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
        onLogout={logout}
        productsCount={productsList.length}
        ordersCount={124}
        lowStockCount={3}
      />

      {/* 2. Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <AdminTopBar
          onToggleMobileSidebar={() => setIsOpenMobile(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onLogout={logout}
        />

        {/* Global Toast Alert */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab Content Display */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={(tab) => setActiveTab(tab)}
              productsList={productsList}
              ordersList={[]}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              productsList={productsList}
              onAddProduct={handleOpenAddProduct}
              onEditProduct={handleOpenEditProduct}
              onDeleteProduct={(id, name) => {
                if (confirm(`Delete "${name}" from store catalog?`)) {
                  deleteProduct(id);
                  showToast(`Product "${name}" deleted.`);
                }
              }}
              onUpdateProduct={(id, updates) => {
                updateProduct(id, updates);
                showToast('Product updated successfully!');
              }}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              ordersList={[]}
              onSelectOrder={(ord) => setSelectedOrder(ord)}
              onUpdateStatus={(id, status) => showToast(`Order ${id} marked as ${status}.`)}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              usersList={usersList}
              onUpdateStatus={adminUpdateUserStatus}
              onDeleteCustomer={adminDeleteUser}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              productsList={productsList}
              onQuickUpdateStock={handleQuickUpdateStock}
            />
          )}

          {activeTab === 'banners' && (
            <BannersView
              bannersList={bannersList}
              productsList={productsList}
              onAddBanner={(b) => {
                addBanner(b);
                showToast(`Banner "${b.title}" activated!`);
              }}
              onUpdateBanner={(id, updates) => {
                updateBanner(id, updates);
                showToast('Banner updated.');
              }}
              onDeleteBanner={(id) => {
                if (confirm('Are you sure you want to delete this banner?')) {
                  deleteBanner(id);
                  showToast('Banner deleted.');
                }
              }}
              dealsList={dealsList}
              onAddDeal={(d) => {
                addDeal(d);
                showToast(`Deal "${d.title}" published!`);
              }}
              onUpdateDeal={(id, updates) => {
                updateDeal(id, updates);
                showToast('Deal updated.');
              }}
              onDeleteDeal={(id) => {
                if (confirm('Are you sure you want to delete this promotional deal?')) {
                  deleteDeal(id);
                  showToast('Deal deleted.');
                }
              }}
            />
          )}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'categories' && (
            <CategoriesView
              categoriesList={categoriesList}
              onAddCategory={(cat) => {
                addCategory(cat);
                showToast(`Category "${cat.name}" added successfully.`);
              }}
              onUpdateCategory={(id, updates) => {
                updateCategory(id, updates);
                showToast(`Category updated.`);
              }}
              onDeleteCategory={(id, name) => {
                if (confirm(`Delete category "${name}"?`)) {
                  deleteCategory(id);
                  showToast(`Category "${name}" deleted.`);
                }
              }}
            />
          )}

          {activeTab === 'coupons' && <CouponsView />}

          {activeTab === 'reviews' && <ReviewsView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* 3. Add / Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="font-black text-lg text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                  <input
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. iPhone 16 Pro Max (PTA Approved)"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand</label>
                  <select
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Google">Google</option>
                    <option value="Xiaomi">Xiaomi</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={productForm.categorySlug}
                    onChange={(e) => {
                      const slug = e.target.value;
                      const cat = CATEGORIES.find((c) => c.slug === slug);
                      setProductForm({
                        ...productForm,
                        categorySlug: slug,
                        category: cat ? cat.name : 'iPhone',
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Price (PKR) *</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sky-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Original Price (Strikethrough) (PKR)</label>
                  <input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setProductForm((prev) => ({
                          ...prev,
                          stock: prev.stock > 0 ? 0 : 10,
                        }))
                      }
                      className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                        productForm.stock > 0
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-rose-500 text-white shadow-xs'
                      }`}
                    >
                      {productForm.stock > 0 ? 'STATUS: IN STOCK' : 'STATUS: OUT OF STOCK'}
                    </button>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {productForm.stock > 0
                        ? 'Product will be purchasable on shop page'
                        : 'Product button will be disabled with Out of Stock badge'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Stock Count:</span>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                      min="0"
                      className="w-20 p-1.5 bg-white border border-slate-300 rounded-lg text-center font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Product Image (Upload File from Computer or Enter URL)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      placeholder="/categories/iphone.svg or image URL"
                      className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => productImageInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 font-bold hover:bg-sky-100 flex items-center gap-1.5 transition-colors text-xs cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File</span>
                    </button>
                    <input
                      ref={productImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProductFileUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Preset Quick Chooser & Live Preview */}
                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
                      <img src={productForm.image} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Quick Vector Presets:</span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          { label: 'iPhone', val: '/categories/iphone.svg' },
                          { label: 'Samsung', val: '/categories/samsung.svg' },
                          { label: 'iPad', val: '/categories/ipad.svg' },
                          { label: 'Watch', val: '/categories/smartwatches.svg' },
                          { label: 'Accessories', val: '/categories/accessories.svg' },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setProductForm({ ...productForm, image: preset.val })}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-600 text-[10px] font-bold text-slate-600 border border-slate-200 transition-colors"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge Tag</label>
                  <input
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    placeholder="New / Flagship / Sale"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Warranty &amp; PTA Status</label>
                  <input
                    value={productForm.warranty}
                    onChange={(e) => setProductForm({ ...productForm, warranty: e.target.value })}
                    placeholder="1 Year Official Brand Warranty (PTA Approved)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  Order #{selectedOrder.id}
                </h3>
                <span className="text-[11px] text-slate-400">{selectedOrder.date}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                <p className="font-bold text-slate-900">Customer Details</p>
                <p className="text-slate-600">{selectedOrder.customer_name}</p>
                <p className="text-slate-500 font-mono">{selectedOrder.customer_phone}</p>
                <p className="text-slate-500">{selectedOrder.customer_email}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                <span className="font-bold text-slate-700">Order Amount</span>
                <span className="font-black text-sm text-[#1877F2]">
                  Rs. {selectedOrder.total?.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="font-bold text-slate-700">Current Status</span>
                <span className="px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] bg-emerald-50 text-emerald-600">
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
