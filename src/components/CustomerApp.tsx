import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Utensils, 
  Apple, 
  PlusCircle, 
  Gamepad2, 
  Search, 
  User, 
  ChevronRight, 
  Star,
  MapPin,
  Clock,
  Heart,
  Sun,
  Moon,
  Edit3,
  X,
  Check,
  LayoutDashboard,
  BarChart3,
  Zap,
  Gift
} from 'lucide-react';
import Logo from './Logo';
import { cn } from '../lib/utils';
import { Category, Product } from '../types';
import { ASSETS } from '../constants';

const CATEGORIES: { label: string; icon: any; color: string }[] = [
  { label: '美食外卖', icon: Utensils, color: 'bg-orange-500' },
  { label: '生鲜买菜', icon: Apple, color: 'bg-green-500' },
  { label: '送药上门', icon: PlusCircle, color: 'bg-red-500' },
  { label: '日用品', icon: ShoppingBag, color: 'bg-blue-500' },
  { label: '电子产品', icon: Gamepad2, color: 'bg-purple-500' },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: '9', name: '金林盆菜', price: 399.00, category: '美食外卖', image: ASSETS.PENCAI, rating: 5.0 },
  { id: '1', name: '极品和牛堡', price: 32.00, category: '美食外卖', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop', rating: 4.8 },
  { id: '2', name: '新鲜有机菠菜', price: 5.50, category: '生鲜买菜', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=1000&auto=format&fit=crop', rating: 4.5 },
  { id: '3', name: '强力止痛片', price: 12.00, category: '送药上门', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1000&auto=format&fit=crop', rating: 4.9 },
  { id: '4', name: '机械键盘 K8', price: 299.00, category: '电子产品', image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1000&auto=format&fit=crop', rating: 4.7 },
  { id: '5', name: '日常保湿乳', price: 45.00, category: '日用品', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1000&auto=format&fit=crop', rating: 4.6 },
  { id: '6', name: '混合莓果碗', price: 18.00, category: '美食外卖', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop', rating: 4.4 },
  { id: '7', name: '降噪无线耳机', price: 599.00, category: '电子产品', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop', rating: 4.9 },
  { id: '8', name: '洗衣凝珠 (30pc)', price: 38.00, category: '日用品', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop', rating: 4.3 },
];

interface CustomerAppProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onNavigate?: (view: 'customer' | 'backend' | 'analytics') => void;
}

export default function CustomerApp({ isDarkMode, setIsDarkMode, onNavigate }: CustomerAppProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | '全部'>('全部');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Persistence: Load from localStorage
  const [heroImage, setHeroImage] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('taowei_hero_image');
        // If it's a relative path or the old dev path, use the imported one
        if (!saved || saved.includes('/src/hero-pic.jpeg')) return ASSETS.HERO;
        return saved;
      }
    } catch (e) {
      console.error('Failed to load hero image from localStorage', e);
    }
    return ASSETS.HERO;
  });

  const [isEditingHero, setIsEditingHero] = useState(false);
  const [showOrderNotification, setShowOrderNotification] = useState(false);

  // Persistence: Save to localStorage whenever heroImage or products change
  useEffect(() => {
    try {
      localStorage.setItem('taowei_hero_image', heroImage);
    } catch (e) {
      console.warn('Storage quota likely exceeded. Image might not persist.');
    }
  }, [heroImage]);

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('taowei_products');
        let parsed: Product[] = saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
        
        // Data Migration: Ensure product '9' (Pencai) uses the imported asset and correctly named
        parsed = parsed.map(p => {
          if (p.id === '9') {
             // Always update to the latest ASSETS.PENCAI to reflect user's manual link changes
             return { ...p, image: ASSETS.PENCAI, name: '金林盆菜' };
          }
          return p;
        });
        
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load products from localStorage', e);
    }
    return INITIAL_PRODUCTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('taowei_products', JSON.stringify(products));
    } catch (e) {
      console.warn('Storage quota likely exceeded. Product list might not persist.');
    }
  }, [products]);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleOrder = () => {
    setShowOrderNotification(true);
    // Auto hide after 8 seconds due to long content
    setTimeout(() => setShowOrderNotification(false), 8000);
  };


  const filteredProducts = selectedCategory === '全部' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const handleUpdateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    setEditingProduct(null);
  };

  const themeClasses = {
    bg: isDarkMode ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-900',
    header: isDarkMode ? 'bg-zinc-900/80 border-white/10' : 'bg-white/95 border-zinc-200 shadow-md',
    card: isDarkMode ? 'bg-zinc-900 border-white/5' : 'bg-white border-zinc-100 shadow-sm',
    input: isDarkMode ? 'bg-white/5 border-white/10' : 'bg-zinc-100 border-zinc-200 text-zinc-900',
    textMuted: isDarkMode ? 'text-zinc-400' : 'text-zinc-500',
    textInvert: isDarkMode ? 'text-white' : 'text-zinc-900',
    logo: 'text-[#FF6B00]',
  };

  return (
    <div className={cn("min-h-screen font-sans transition-colors duration-500 selection:bg-orange-500/30", themeClasses.bg)}>
      {/* Header */}
      <header className={cn("sticky top-0 z-50 backdrop-blur-xl border-b px-4 py-3 transition-colors duration-500", themeClasses.header)}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="md" />
            <div className={cn("hidden lg:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest font-mono opacity-60", themeClasses.textInvert)}>
              <MapPin className="w-4 h-4 text-brand-primary" />
              吉隆坡
            </div>
          </div>

          <div className="flex-1 max-w-sm mx-4 relative hidden sm:block">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-zinc-500" />
            </div>
            <input 
              type="text" 
              placeholder="搜索商品..."
              className={cn("w-full border rounded-full py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all font-mono", themeClasses.input)}
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn("p-2 rounded-full border transition-all hover:scale-110 active:scale-95", isDarkMode ? "bg-white/5 border-white/10 text-brand-primary" : "bg-zinc-100 border-zinc-200 text-orange-600")}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Hidden Edit Mode - as per user request "icons hidden" */}
            <button 
               onDoubleClick={() => setIsEditMode(!isEditMode)}
               title="双击进入管理模式"
               className="opacity-0 w-4 h-4 pointer-events-auto" 
            />

            <button className="relative">
              <ShoppingBag className="w-5 h-5 text-brand-primary" />
              <span className="absolute -top-1 -right-1 bg-brand-cream text-[10px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center text-black shadow-sm">2</span>
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={cn("rounded-full p-2 border hover:bg-white/10 transition-colors", isDarkMode ? "bg-white/5 border-white/10" : "bg-zinc-100 border-zinc-200")}
              >
                <User className="w-5 h-5 text-brand-primary" />
              </button>
              
              <AnimatePresence>
                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-0" onClick={() => setIsUserMenuOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={cn(
                        "absolute right-0 mt-3 w-48 rounded-2xl border p-2 shadow-2xl z-50 backdrop-blur-xl",
                        isDarkMode ? "bg-zinc-900/90 border-white/10" : "bg-white/95 border-zinc-200"
                      )}
                    >
                      <div className="p-2 border-b border-white/5 mb-2">
                        <p className={cn("text-[10px] uppercase font-bold tracking-widest opacity-40 mb-1", isDarkMode ? "text-white" : "text-zinc-600")}>高级通道</p>
                      </div>
                      <button 
                        onClick={() => {
                          onNavigate?.('backend');
                          setIsUserMenuOpen(false);
                        }}
                        className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all", isDarkMode ? "hover:bg-white/10 text-zinc-300" : "hover:bg-zinc-100 text-zinc-700")}
                      >
                        <LayoutDashboard className="w-4 h-4 text-brand-primary" />
                        终端后台
                      </button>
                      <button 
                        onClick={() => {
                          onNavigate?.('analytics');
                          setIsUserMenuOpen(false);
                        }}
                        className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all", isDarkMode ? "hover:bg-white/10 text-zinc-300" : "hover:bg-zinc-100 text-zinc-700")}
                      >
                        <BarChart3 className="w-4 h-4 text-accent-green" />
                        核心看板
                      </button>
                      <div className="my-2 border-t border-white/5 pt-2">
                        <p className={cn("text-[10px] uppercase font-bold tracking-widest opacity-40 mb-1 px-2", isDarkMode ? "text-white" : "text-zinc-600")}>账户设置</p>
                        <button className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all", isDarkMode ? "hover:bg-white/10 text-zinc-300" : "hover:bg-zinc-100 text-zinc-700")}>
                           <User className="w-4 h-4 opacity-40" />
                           个人资料
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Banner Section - More Compact */}
        <section className="relative h-[240px] sm:h-[350px] rounded-[2rem] overflow-hidden mb-8 group shadow-xl">
          <img 
            src={heroImage} 
            alt="Hero" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent flex flex-col justify-center px-8 sm:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl sm:text-5xl font-black tracking-tighter mb-2 leading-none uppercase text-white">
                极速送达<br /><span className="text-brand-primary italic">淘出</span>品味
              </h2>
              <button 
                onClick={handleOrder}
                className="mt-4 bg-brand-primary hover:bg-brand-primary/80 text-black font-black px-6 py-2.5 rounded-full transition-all shadow-lg active:scale-95 uppercase tracking-widest text-[10px] flex items-center gap-2"
              >
                立即下单 <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
          
          {isEditMode && (
            <button 
              onClick={() => setIsEditingHero(true)}
              className="absolute bottom-4 right-4 bg-brand-primary text-black p-3 rounded-full shadow-2xl hover:scale-110 transition-transform z-20"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          )}
        </section>

        {/* Product Grid - Online Shopping Style (2 cols on mobile) */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className={cn("text-lg font-black tracking-tight uppercase", isDarkMode ? "text-brand-cream" : "text-zinc-900")}>
              {selectedCategory} <span className="text-brand-primary">推荐</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
            <AnimatePresence mode='popLayout'>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="group"
                >
                  <div className={cn(
                    "relative aspect-square rounded-2xl overflow-hidden mb-3 border transition-all duration-300", 
                    themeClasses.card,
                    product.id === '9' && "border-brand-primary/40 ring-1 ring-brand-primary/20 shadow-[0_0_15px_rgba(233,90,50,0.1)]"
                  )}>
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Overlay Buttons */}
                    <div className="absolute top-2 right-2">
                      {isEditMode && (
                        <button 
                          onClick={() => setEditingProduct(product)}
                          className="bg-brand-primary text-black p-2 rounded-full shadow-lg"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-1 text-[9px] font-bold text-white">
                       <Star className="w-2.5 h-2.5 text-accent-amber fill-accent-amber" />
                       {product.rating}
                    </div>
                  </div>

                  <div className="px-1">
                    <h4 className={cn("font-bold text-sm line-clamp-1 mb-1", themeClasses.textInvert)}>{product.name}</h4>
                    <div className="flex items-center justify-between">
                      <p className={cn("text-sm font-black italic", isDarkMode ? "text-brand-primary" : "text-orange-600")}>RM {product.price.toFixed(2)}</p>
                      <button 
                        onClick={handleOrder}
                        className={cn("w-7 h-7 rounded-lg transition-all flex items-center justify-center", isDarkMode ? "bg-white/5 border border-white/10 text-white" : "bg-zinc-900 text-white")}
                      >
                        <PlusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Order Status Notification */}
      <AnimatePresence>
        {showOrderNotification && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOrderNotification(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md"
            >
              <div className={cn(
                "p-8 rounded-[2.5rem] shadow-2xl border backdrop-blur-3xl overflow-hidden",
                isDarkMode ? "bg-zinc-900/90 border-brand-primary/20" : "bg-white/95 border-orange-200"
              )}>
                {/* Top Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary via-orange-400 to-amber-400" />
                
                <div className="flex flex-col items-center text-center gap-6">
                  <div className="w-40 h-40 rounded-3xl bg-brand-primary/10 flex items-center justify-center overflow-hidden border border-brand-primary/20 shadow-2xl">
                    <img 
                      src={ASSETS.PENCAI} 
                      alt="Jinlin Pencai" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="space-y-4 w-full">
                    <div>
                      <p className="font-black text-xs uppercase tracking-[0.3em] text-brand-primary mb-2">配送情报：载入中</p>
                      <h4 className={cn("text-xl font-black tracking-tight", isDarkMode ? "text-white" : "text-zinc-900")}>
                        您的盆菜正在配送中，<br />预计30分钟内到达。
                      </h4>
                    </div>
                    
                    {/* Coupon Card */}
                    <div className={cn(
                      "p-6 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center",
                      isDarkMode ? "bg-white/5 border-white/20" : "bg-orange-50 border-orange-200"
                    )}>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase mb-2 tracking-widest">感谢您的耐心等候</p>
                      <div className="flex flex-col items-center gap-3">
                         <Gift className="w-8 h-8 text-brand-primary" />
                         <span className="font-black text-brand-primary text-sm uppercase italic tracking-tighter">金林餐厅专属优惠券已到账</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setShowOrderNotification(false)}
                      className="w-full py-4 bg-brand-primary text-black font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-transform shadow-xl shadow-brand-primary/20"
                    >
                      确认并继续
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {isEditingHero && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsEditingHero(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={cn("relative w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border", themeClasses.card)}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">自定义宣传大图</h3>
                <button onClick={() => setIsEditingHero(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">上传本地图片 / 图片 URL</label>
                    <span className="text-[9px] text-brand-primary font-mono lowercase">推荐尺寸: 1600x600</span>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <label className={cn(
                      "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all hover:bg-white/5",
                      isDarkMode ? "border-white/10" : "border-zinc-200"
                    )}>
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <PlusCircle className="w-8 h-8 text-zinc-500 mb-2" />
                        <p className="text-xs text-zinc-500">点击或直接拖入本地图片</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setHeroImage(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <MapPin className="w-3 h-3 text-zinc-500" />
                      </div>
                      <input 
                        type="text" 
                        value={heroImage.startsWith('data:') ? '已上传本地图片' : heroImage}
                        onChange={(e) => setHeroImage(e.target.value)}
                        className={cn("w-full pl-8 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-brand-primary font-mono text-[10px]", themeClasses.input)}
                        placeholder="或输入外部图片 URL..."
                      />
                    </div>
                  </div>
                </div>
                <div className="h-40 rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-black/20">
                   <img src={heroImage} alt="Hero Preview" className="w-full h-full object-cover" />
                </div>
                <button 
                  onClick={() => setIsEditingHero(false)}
                  className="w-full py-4 bg-brand-primary text-black font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all shadow-xl shadow-brand-primary/20"
                >
                  确认修改
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {editingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProduct(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn("relative w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border", themeClasses.card)}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black italic uppercase italic tracking-tighter">自定义单品</h3>
                <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-white/5 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">单品名称</label>
                  <input 
                    type="text" 
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className={cn("w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-primary font-bold", themeClasses.input)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">价格 (RM)</label>
                    <input 
                      type="number" 
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                      className={cn("w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-primary font-bold", themeClasses.input)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">星级评分</label>
                    <input 
                      type="number" 
                      max="5"
                      min="0"
                      step="0.1"
                      value={editingProduct.rating}
                      onChange={(e) => setEditingProduct({ ...editingProduct, rating: parseFloat(e.target.value) || 0 })}
                      className={cn("w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-primary font-bold", themeClasses.input)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">上传本地图片 / 海报图片 URL</label>
                  <div className="flex flex-col gap-4">
                    <label className={cn(
                      "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:bg-white/5",
                      isDarkMode ? "border-white/10" : "border-zinc-200"
                    )}>
                      <div className="flex flex-col items-center justify-center">
                        <PlusCircle className="w-6 h-6 text-zinc-500 mb-1" />
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">上传照片</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && editingProduct) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditingProduct({ ...editingProduct, image: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    <div className="flex gap-4 items-center">
                      <input 
                        type="text" 
                        value={editingProduct.image.startsWith('data:') ? '已上传本地图片' : editingProduct.image}
                        onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        className={cn("flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono text-xs", themeClasses.input)}
                        placeholder="或输入外部图片 URL..."
                      />
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shrink-0 shadow-lg bg-black/20">
                        <img src={editingProduct.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleUpdateProduct(editingProduct)}
                  className="w-full py-4 bg-brand-primary text-black font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-transform shadow-xl shadow-brand-primary/20 mt-4 flex items-center justify-center gap-2"
                >
                  <Check className="w-6 h-6" /> 保存自定义配置
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Nav for Mobile */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
        <div className={cn("rounded-2xl px-8 py-5 flex items-center justify-between shadow-2xl border backdrop-blur-xl", isDarkMode ? "bg-zinc-900/90 border-white/10" : "bg-white/90 border-zinc-200")}>
           <ShoppingBag className="w-6 h-6 text-brand-primary" />
           <Search className={cn("w-6 h-6", themeClasses.textMuted)} />
           <Heart className={cn("w-6 h-6", themeClasses.textMuted)} />
           <User className={cn("w-6 h-6", themeClasses.textMuted)} />
        </div>
      </div>
    </div>
  );
}
