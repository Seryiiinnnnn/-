import React, { useState } from 'react';
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
  Heart
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Category, Product } from '../types';

const CATEGORIES: { label: string; icon: any; color: string }[] = [
  { label: '美食外卖', icon: Utensils, color: 'bg-orange-500' },
  { label: '生鲜买菜', icon: Apple, color: 'bg-green-500' },
  { label: '送药上门', icon: PlusCircle, color: 'bg-red-500' },
  { label: '日用品', icon: ShoppingBag, color: 'bg-blue-500' },
  { label: '电子产品', icon: Gamepad2, color: 'bg-purple-500' },
];

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: '极品和牛堡', price: 32.00, category: '美食外卖', image: 'https://picsum.photos/seed/burger/400/300', rating: 4.8 },
  { id: '2', name: '新鲜有机菠菜', price: 5.50, category: '生鲜买菜', image: 'https://picsum.photos/seed/veg/400/300', rating: 4.5 },
  { id: '3', name: '强力止痛片', price: 12.00, category: '送药上门', image: 'https://picsum.photos/seed/med/400/300', rating: 4.9 },
  { id: '4', name: '机械键盘 K8', price: 299.00, category: '电子产品', image: 'https://picsum.photos/seed/tech/400/300', rating: 4.7 },
  { id: '5', name: '日常保湿乳', price: 45.00, category: '日用品', image: 'https://picsum.photos/seed/soap/400/300', rating: 4.6 },
  { id: '6', name: '混合莓果碗', price: 18.00, category: '美食外卖', image: 'https://picsum.photos/seed/fruit/400/300', rating: 4.4 },
  { id: '7', name: '降噪无线耳机', price: 599.00, category: '电子产品', image: 'https://picsum.photos/seed/audio/400/300', rating: 4.9 },
  { id: '8', name: '洗衣凝珠 (30pc)', price: 38.00, category: '日用品', image: 'https://picsum.photos/seed/home/400/300', rating: 4.3 },
];

export default function CustomerApp() {
  const [selectedCategory, setSelectedCategory] = useState<string | '全部'>('全部');
  const [isSearching, setIsSearching] = useState(false);

  const filteredProducts = selectedCategory === '全部' 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-white selection:bg-orange-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bg-dark/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-black italic tracking-tighter logo-text uppercase">淘味 TAOWEI</h1>
            <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-brand-primary/60 uppercase tracking-widest font-mono">
              <MapPin className="w-4 h-4 text-brand-primary" />
              吉隆坡市中心节点
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8 relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-zinc-500" />
            </div>
            <input 
              type="text" 
              placeholder="搜索任何商品... 如 汉堡, 耳机"
              className="w-full bg-white/5 border border-white/10 rounded py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all font-mono"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative">
              <ShoppingBag className="w-6 h-6 text-brand-primary" />
              <span className="absolute -top-1 -right-1 bg-brand-cream text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center text-black">2</span>
            </button>
            <button className="bg-white/5 rounded p-1 border border-white/10 hover:bg-white/10 transition-colors">
              <User className="w-6 h-6 text-brand-primary" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <section className="relative h-[400px] rounded-3xl overflow-hidden mb-12 group">
          <img 
            src="https://picsum.photos/seed/delivery/1600/900" 
            alt="Hero" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-bg-dark/40 to-transparent flex flex-col justify-center px-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-6xl font-black tracking-tighter mb-4 leading-[0.9] uppercase">
                系统扫描:<br /><span className="text-brand-primary italic">满足</span> 您的渴望
              </h2>
              <p className="text-zinc-400 max-w-md mb-8 text-lg font-medium leading-relaxed font-mono text-sm opacity-80">
                物流网络已激活。雪隆区所有节点 30 分钟内极速送达。
              </p>
              <button className="bg-brand-primary hover:bg-brand-primary/80 text-brand-cream font-black px-8 py-4 rounded transition-all shadow-xl shadow-brand-primary/20 active:scale-95 uppercase tracking-widest text-xs">
                立即下单 <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* Categories Bar */}
        <div className="mb-12 overflow-x-auto pb-4 no-scrollbar">
          <div className="flex gap-4">
            <button 
              onClick={() => setSelectedCategory('全部')}
              className={cn(
                "px-6 py-3 rounded-full text-sm font-bold border transition-all whitespace-nowrap",
                selectedCategory === '全部' 
                  ? "bg-white text-black border-white" 
                  : "bg-transparent text-zinc-400 border-white/10 hover:border-white/30"
              )}
            >
              全部服务
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-full text-sm font-bold border transition-all whitespace-nowrap",
                  selectedCategory === cat.label 
                    ? "bg-white text-black border-white" 
                    : "bg-transparent text-zinc-400 border-white/10 hover:border-white/30"
                )}
              >
                <cat.icon className={cn("w-4 h-4", selectedCategory === cat.label ? "text-brand-primary" : "text-zinc-500")} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black tracking-tighter uppercase italic text-brand-cream">
              今日 <span className="text-brand-primary">{selectedCategory}</span> 精选
            </h3>
            <div className="flex gap-2">
               <button className="p-2 border border-white/10 rounded-full hover:bg-white/5"><ChevronRight className="w-5 h-5 rotate-180" /></button>
               <button className="p-2 border border-white/10 rounded-full hover:bg-white/5"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence mode='popLayout'>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="group"
                >
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-zinc-900 border border-white/5">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 right-3">
                      <button className="bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                         <Heart className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-bold">
                       <Star className="w-3 h-3 text-accent-amber fill-accent-amber" />
                       {product.rating}
                    </div>
                  </div>
                  <h4 className="font-bold text-zinc-100 group-hover:text-brand-primary transition-colors">{product.name}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-lg font-black text-white italic">RM {product.price.toFixed(2)}</p>
                    <button className="bg-white/5 hover:bg-brand-primary text-white p-2 border border-white/10 hover:text-brand-cream transition-colors flex items-center justify-center">
                       <PlusCircle className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Floating Bottom Nav for Mobile */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
        <div className="glass rounded px-8 py-4 flex items-center justify-between shadow-2xl">
           <ShoppingBag className="w-6 h-6 text-brand-primary" />
           <Search className="w-6 h-6 text-zinc-400" />
           <Heart className="w-6 h-6 text-zinc-400" />
           <User className="w-6 h-6 text-zinc-400" />
        </div>
      </div>
    </div>
  );
}
