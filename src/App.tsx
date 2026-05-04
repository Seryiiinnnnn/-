import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CustomerApp from './components/CustomerApp';
import BackendDashboard from './components/BackendDashboard';
import StatsDashboard from './components/StatsDashboard';
import Logo from './components/Logo';
import { LayoutDashboard, Smartphone, Activity, Sparkles, BarChart3 } from 'lucide-react';
import { SystemStats, Order } from './types';

// Approximate Klang Valley Bounds
const WIDTH = 1200;
const HEIGHT = 800;

type View = 'customer' | 'backend' | 'analytics';

export default function App() {
  const [view, setView] = useState<View>('customer');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNavigationVisible, setIsNavigationVisible] = useState(true);
  const [isOpening, setIsOpening] = useState(true);
  const [stats, setStats] = useState<SystemStats>({
    activeOrders: 0,
    onlineRiders: 45,
    deliveredToday: 14282,
    avgDeliverTime: 28,
    completedTotal: 840
  });

  const [orderPrefix, setOrderPrefix] = useState('PW');
  const [targetOrderCount, setTargetOrderCount] = useState(8);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1000',
      customerPos: { x: 400, y: 300 },
      pickupPos: { x: 600, y: 450 },
      status: 'pending',
      timestamp: Date.now() - 50000,
      items: ['金林盆菜 x 2'],
      price: 798.00,
      deliveryTime: 0
    },
    {
      id: '999',
      customerPos: { x: 800, y: 200 },
      pickupPos: { x: 600, y: 450 },
      status: 'pending',
      timestamp: Date.now() - 20000,
      items: ['金林盆菜 x 1'],
      price: 399.00,
      deliveryTime: 0
    },
    {
      id: '998',
      customerPos: { x: 200, y: 500 },
      pickupPos: { x: 600, y: 450 },
      status: 'pending',
      timestamp: Date.now() - 10000,
      items: ['金林盆菜 x 3'],
      price: 1197.00,
      deliveryTime: 0
    },
    {
      id: '997',
      customerPos: { x: 900, y: 600 },
      pickupPos: { x: 600, y: 450 },
      status: 'pending',
      timestamp: Date.now() - 5000,
      items: ['金林盆菜 x 1'],
      price: 399.00,
      deliveryTime: 0
    },
    {
      id: '996',
      customerPos: { x: 300, y: 150 },
      pickupPos: { x: 600, y: 450 },
      status: 'pending',
      timestamp: Date.now() - 1000,
      items: ['金林盆菜 x 2'],
      price: 798.00,
      deliveryTime: 0
    }
  ]);
  const orderIdCounter = useRef(1000);

  const [isDriftActive, setIsDriftActive] = useState(true);
  const [showCompletionToast, setShowCompletionToast] = useState(false);
  const [driftInterval, setDriftInterval] = useState(1000);
  const [driftSettings, setDriftSettings] = useState<Record<string, number>>({
    activeOrders: 2,
    onlineRiders: 1,
    deliveredToday: 3,
    completedTotal: 2
  });

  const updateStat = (key: keyof SystemStats, delta: number) => {
    setStats(prev => {
      const newVal = Math.max(0, (prev[key] as number) + delta);
      return {
        ...prev,
        [key]: newVal
      };
    });
  };

  const toggleDriftDirection = (key: string) => {
    setDriftSettings(prev => ({
      ...prev,
      [key]: prev[key] * -1
    }));
  };

  const adjustDriftStep = (key: string, delta: number) => {
    setDriftSettings(prev => ({
      ...prev,
      [key]: Math.max(0, Math.abs(prev[key]) + delta) * (prev[key] >= 0 ? 1 : -1)
    }));
  };

  // Auto-drift logic (Moved from StatsDashboard)
  useEffect(() => {
    if (!isDriftActive) return;

    const interval = setInterval(() => {
      setStats(prev => {
        const nextStats = { ...prev };
        Object.entries(driftSettings).forEach(([key, value]) => {
          const delta = value as number;
          const isReducing = delta < 0;
          const magnitude = Math.abs(delta);
          const randomMagnitude = Math.floor(Math.random() * magnitude) + (magnitude > 0 ? 1 : 0);
          const finalDelta = isReducing ? -randomMagnitude : randomMagnitude;
          
          const statKey = key as keyof SystemStats;
          nextStats[statKey] = Math.max(0, (nextStats[statKey] as number) + finalDelta);
        });
        return nextStats;
      });
    }, driftInterval);

    return () => clearInterval(interval);
  }, [isDriftActive, driftSettings, driftInterval]);

  // Global Notification Logic: When map points disappear, wait 2s
  useEffect(() => {
    if (stats.activeOrders === 0 && stats.onlineRiders === 0 && isDriftActive) {
      const timer = setTimeout(() => {
        setShowCompletionToast(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowCompletionToast(false);
    }
  }, [stats.activeOrders, stats.onlineRiders, isDriftActive]);

  // Global Simulator for Orders (Respects onlineRiders and isDriftActive)
  useEffect(() => {
    const loop = setInterval(() => {
      if (!isDriftActive) return;
      
      // Sync logic: Only spawn if riders are online and we haven't hit the target amount
      const maxOrders = targetOrderCount;
      
      // If system is "down" (riders=0), clear orders and stop
      if (stats.onlineRiders === 0) {
        if (orders.length > 0) setOrders([]);
        return;
      }

      if (Math.random() > 0.85 && orders.filter(o => o.status !== 'completed').length < maxOrders) {
        orderIdCounter.current += 1;
        
        // 70% chance for Jinlin Pencai order, 30% for others
        const isPencai = Math.random() < 0.7;
        // Random quantity for Pencai (1 to 3)
        const quantity = isPencai ? Math.floor(Math.random() * 3) + 1 : 1;
        
        const newOrder: Order = {
          id: `${orderIdCounter.current}`,
          customerPos: { x: Math.random() * WIDTH, y: Math.random() * HEIGHT },
          pickupPos: { x: Math.random() * WIDTH, y: Math.random() * HEIGHT },
          status: 'pending',
          timestamp: Date.now(),
          items: isPencai ? [`金林盆菜 x ${quantity}`] : ['汉堡套餐', '可乐', '薯条'],
          price: isPencai ? (399.00 * quantity) : (25.50 + Math.random() * 20),
          deliveryTime: 0
        };
        setOrders(prev => [newOrder, ...prev].slice(0, 50)); // Keep last 50
        updateStat('activeOrders', 1);

        // Auto complete after random time
        setTimeout(() => {
           setOrders(prev => prev.map(o => o.id === newOrder.id ? { ...o, status: 'completed' } : o));
           updateStat('activeOrders', -1);
           updateStat('completedTotal', 1);
           updateStat('deliveredToday', 1);
        }, 8000 + Math.random() * 5000);
      }
    }, 1000); // Check every second

    return () => clearInterval(loop);
  }, [stats.onlineRiders, orders.length]);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpening(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <AnimatePresence>
        {isOpening && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="flex flex-col items-center"
            >
              <div className="absolute inset-0 bg-[#FF6B00] blur-[100px] opacity-20" />
              <Logo size="xl" className="mb-4" />
              <div className="flex items-center justify-center gap-2 text-brand-cream/60 tracking-[0.4em] text-[10px] font-bold uppercase transition-all">
                <Sparkles className="w-3 h-3 text-[#FF6B00]" />
                极速送达 品味生活
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpening && (
        <>
          {/* View Switcher Overlay - Hidden when in Customer View or when Navigation Visibility is toggled off */}
          <AnimatePresence>
            {view !== 'customer' && isNavigationVisible && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="fixed top-24 right-6 z-[100] flex flex-col gap-2"
              >
                <button 
                  onClick={() => setView('customer')}
                  className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-black border backdrop-blur-xl transition-all shadow-2xl tracking-widest ${view === 'customer' ? 'bg-brand-primary border-brand-primary text-brand-cream' : 'bg-black/50 border-white/10 text-brand-primary/60 hover:border-white/20'}`}
                >
                  <Smartphone className="w-4 h-4" />
                  终端：客户视角
                </button>
                <button 
                  onClick={() => setView('backend')}
                  className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-black border backdrop-blur-xl transition-all shadow-2xl tracking-widest ${view === 'backend' ? 'bg-brand-secondary border-brand-secondary text-brand-cream' : 'bg-black/50 border-white/10 text-brand-secondary/60 hover:border-white/20'}`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  终端：调度后台
                </button>
                <button 
                  onClick={() => setView('analytics')}
                  className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-black border backdrop-blur-xl transition-all shadow-2xl tracking-widest ${view === 'analytics' ? 'bg-accent-green border-accent-green text-black' : 'bg-black/50 border-white/10 text-accent-green/60 hover:border-white/20'}`}
                >
                  <BarChart3 className="w-4 h-4" />
                  核心看板
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main View Container */}
          <AnimatePresence mode="wait">
            {view === 'customer' ? (
              <motion.div
                key="customer"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <CustomerApp 
                  isDarkMode={isDarkMode}
                  setIsDarkMode={setIsDarkMode}
                  isNavigationVisible={isNavigationVisible}
                  onToggleNavigation={() => setIsNavigationVisible(!isNavigationVisible)}
                  onNavigate={(v) => setView(v)} 
                />
              </motion.div>
            ) : view === 'backend' ? (
              <motion.div
                key="backend"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <BackendDashboard 
                  isDarkMode={isDarkMode}
                  setIsDarkMode={setIsDarkMode}
                  isNavigationVisible={isNavigationVisible}
                  onToggleNavigation={() => setIsNavigationVisible(!isNavigationVisible)}
                  propsStats={stats} 
                  propsUpdateStat={updateStat} 
                  orderPrefix={orderPrefix} 
                  onPrefixChange={setOrderPrefix} 
                  targetOrderCount={targetOrderCount}
                  setTargetOrderCount={setTargetOrderCount}
                  isDriftActive={isDriftActive}
                  setIsDriftActive={setIsDriftActive}
                  showCompletionToast={showCompletionToast}
                  setShowCompletionToast={setShowCompletionToast}
                  driftSettings={driftSettings}
                  onToggleDriftDirection={toggleDriftDirection}
                  orders={orders}
                />
              </motion.div>
            ) : (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <StatsDashboard 
                  isDarkMode={isDarkMode}
                  setIsDarkMode={setIsDarkMode}
                  isNavigationVisible={isNavigationVisible}
                  onToggleNavigation={() => setIsNavigationVisible(!isNavigationVisible)}
                  stats={stats} 
                  updateStat={updateStat} 
                  onBack={() => setView('backend')} 
                  orderPrefix={orderPrefix}
                  onPrefixChange={setOrderPrefix}
                  isDriftActive={isDriftActive}
                  setIsDriftActive={setIsDriftActive}
                  showCompletionToast={showCompletionToast}
                  setShowCompletionToast={setShowCompletionToast}
                  driftSettings={driftSettings}
                  onToggleDriftDirection={toggleDriftDirection}
                  onAdjustDriftStep={adjustDriftStep}
                  driftInterval={driftInterval}
                  setDriftInterval={setDriftInterval}
                  orders={orders}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating System Status Toast */}
          <div className="fixed bottom-6 left-6 z-[100] pointer-events-none">
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="glass px-4 py-2 rounded flex items-center gap-3 border-brand-primary/30"
             >
                <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse shadow-[0_0_8px_#39ff14]" />
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-cream tracking-[0.3em] uppercase font-mono">
                   <Activity className="w-3 h-3" />
                   品味核心：实时安全连接
                </div>
             </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
