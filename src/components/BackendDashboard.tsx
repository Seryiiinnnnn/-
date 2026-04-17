import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, Package, Clock, Users, Zap, TrendingUp, AlertCircle, Plus, Minus, Settings, ShieldCheck, LayoutDashboard, Sun, Moon } from 'lucide-react';
import Logo from './Logo';
import { cn } from '../lib/utils';
import { Point, Rider, Order, SystemStats } from '../types';

import mapBg from '../map-bg.png';

// Approximate Klang Valley Bounds
const WIDTH = 1200;
const HEIGHT = 800;

interface BackendDashboardProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  propsStats: SystemStats;
  propsUpdateStat: (key: keyof SystemStats, delta: number) => void;
  orderPrefix: string;
  onPrefixChange: (prefix: string) => void;
  orders: Order[];
}

export default function BackendDashboard({ 
  isDarkMode,
  setIsDarkMode,
  propsStats, 
  propsUpdateStat, 
  orderPrefix, 
  onPrefixChange,
  orders 
}: BackendDashboardProps) {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  
  const [mapConfig, setMapConfig] = useState({
    lat: 2.9531775249216956,
    lng: 102.09935132155357,
    zoom: 9
  });

  const [simulationSpeed, setSimulationSpeed] = useState(() => {
    const saved = localStorage.getItem('taowei_sim_speed');
    return saved ? parseFloat(saved) : 1;
  });
  
  const [routeDensity, setRouteDensity] = useState(() => {
    const saved = localStorage.getItem('taowei_route_density');
    return saved ? parseInt(saved) : 6;
  });

  const [routeOffset, setRouteOffset] = useState(0);

  const [showNotification, setShowNotification] = useState(false);
  const [isAutoSpawning, setIsAutoSpawning] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isManagementUnlocked, setIsManagementUnlocked] = useState(false); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 

  const themeClasses = {
    bg: isDarkMode ? 'bg-zinc-950 text-zinc-400' : 'bg-[#fdf4e3] text-zinc-700',
    glass: isDarkMode ? 'bg-zinc-900/60 border-white/10' : 'bg-white/70 border-brand-primary/10 shadow-xl',
    card: isDarkMode ? 'bg-white/[0.03] border-white/5' : 'bg-white/80 border-brand-primary/5 shadow-sm',
    input: isDarkMode ? 'bg-black/40 border-white/10' : 'bg-white border-brand-primary/20 text-zinc-900',
    textMain: isDarkMode ? 'text-white' : 'text-zinc-900',
    textMuted: isDarkMode ? 'text-zinc-500' : 'text-orange-900/40',
    logo: 'text-[#FF6B00]',
    border: isDarkMode ? 'border-white/10' : 'border-orange-200/30',
  };
  // Save settings when changed
  useEffect(() => {
    localStorage.setItem('taowei_sim_speed', simulationSpeed.toString());
  }, [simulationSpeed]);

  useEffect(() => {
    localStorage.setItem('taowei_route_density', routeDensity.toString());
  }, [routeDensity]);

  // Rotation logic for routes
  useEffect(() => {
    const interval = setInterval(() => {
      setRouteOffset(prev => prev + 1);
    }, 5000 / simulationSpeed); // Rotate every 5 seconds adjusted by speed
    return () => clearInterval(interval);
  }, [simulationSpeed]);
  
  // Sync Riders with Stats
  useEffect(() => {
    setRiders(prev => {
      const targetCount = propsStats.onlineRiders;
      if (prev.length === targetCount) return prev;
      
      if (prev.length < targetCount) {
        const diff = targetCount - prev.length;
        const newRiders: Rider[] = Array.from({ length: diff }).map((_, i) => ({
          id: `rider-${prev.length + i}`,
          pos: { 
            x: WIDTH/2 + (Math.random() - 0.5) * WIDTH * 0.7, 
            y: HEIGHT/2 + (Math.random() - 0.5) * HEIGHT * 0.7 
          },
          status: 'idle',
          velocity: { x: (Math.random() - 0.5) * 1.5, y: (Math.random() - 0.5) * 1.5 }
        }));
        return [...prev, ...newRiders];
      } else {
        return prev.slice(0, targetCount);
      }
    });
  }, [propsStats.onlineRiders]);

  // Check for global completion state
  useEffect(() => {
    if (propsStats.activeOrders === 0 && propsStats.onlineRiders === 0) {
      if (!showNotification) {
         setShowNotification(true);
      }
    } else {
      setShowNotification(false);
    }
  }, [propsStats.activeOrders, propsStats.onlineRiders, showNotification]);

  // Sync active order with local display
  useEffect(() => {
    const pendingOrders = orders.filter(o => o.status === 'pending');
    if (pendingOrders.length > 0 && !activeOrderId) {
      setTimeout(() => setActiveOrderId(pendingOrders[0].id), 200);
    }
  }, [orders, activeOrderId]);

  // Simulation Loop for Rider Motion
  useEffect(() => {
    const loop = setInterval(() => {
      setRiders(prev => prev.map(rider => {
        let newX = rider.pos.x + rider.velocity.x;
        let newY = rider.pos.y + rider.velocity.y;

        let vx = rider.velocity.x;
        let vy = rider.velocity.y;
        if (newX <= 0 || newX >= WIDTH) vx *= -1;
        if (newY <= 0 || newY >= HEIGHT) vy *= -1;

        return {
          ...rider,
          pos: { x: newX, y: newY },
          velocity: { x: vx, y: vy }
        };
      }));
    }, 50);
    return () => clearInterval(loop);
  }, []);

  const stats = propsStats;

  const activeOrder = orders.find(o => o.id === activeOrderId);
  
  // Identify all "active" riders assigned to currently pending orders
  const assignedRiderIds = new Set(
    orders
      .filter(o => o.status !== 'completed')
      .map(order => {
        if (riders.length === 0) return null;
        return riders.reduce((prev, curr) => {
          const dPrev = Math.hypot(prev.pos.x - order.pickupPos.x, prev.pos.y - order.pickupPos.y);
          const dCurr = Math.hypot(curr.pos.x - order.pickupPos.x, curr.pos.y - order.pickupPos.y);
          return dCurr < dPrev ? curr : prev;
        }).id;
      })
      .filter(id => id !== null)
  );

  return (
    <div className={cn("flex h-screen overflow-hidden font-sans transition-colors duration-500", themeClasses.bg)}>
      {/* Sidebar Stats */}
      <motion.div 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 320 : 0,
          opacity: isSidebarOpen ? 1 : 0,
          marginLeft: isSidebarOpen ? 24 : 0,
          marginRight: isSidebarOpen ? 0 : 0
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn("flex flex-col backdrop-blur-xl z-20 my-6 rounded-lg overflow-hidden relative border", themeClasses.glass)}
      >
        <div className={cn("p-6 border-b shrink-0", themeClasses.border)}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
              <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse shadow-[0_0_8px_#39ff14] shrink-0" />
              <Logo size="md" />
              <span className={cn("text-sm font-black tracking-tighter uppercase", themeClasses.textMain)}>调度中心</span>
            </div>
            <button onClick={() => setShowSettings(!showSettings)} className="text-[#FF6B00] p-1 hover:bg-white/5 rounded transition-colors shrink-0">
              <Settings className="w-4 h-4" />
            </button>
          </div>
          <AnimatePresence>
            {showSettings && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className={cn("p-3 rounded border mb-4 space-y-3", isDarkMode ? "bg-white/5 border-white/10" : "bg-white/50 border-brand-primary/10")}>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#FF6B00] opacity-60">订单单号前缀</label>
                    <input 
                      type="text" 
                      value={orderPrefix} 
                      onChange={(e) => onPrefixChange(e.target.value)}
                      className={cn("w-full border rounded px-2 py-1 text-xs focus:border-[#FF6B00] outline-none transition-colors", themeClasses.input)}
                    />
                  </div>
                  
                  <div className={cn("pt-2 border-t", themeClasses.border)}>
                    <label className="text-[9px] uppercase tracking-widest text-[#FF6B00] opacity-60 block mb-2">地图视角校准 (雪隆区范围)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-[8px] opacity-40">LAT</span>
                        <input 
                          type="number" 
                          step="0.0001"
                          value={mapConfig.lat} 
                          onChange={(e) => setMapConfig({ ...mapConfig, lat: parseFloat(e.target.value) })}
                          className={cn("w-full border rounded px-2 py-1 text-[10px] transition-colors", themeClasses.input)}
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] opacity-40">LNG</span>
                        <input 
                          type="number" 
                          step="0.0001"
                          value={mapConfig.lng} 
                          onChange={(e) => setMapConfig({ ...mapConfig, lng: parseFloat(e.target.value) })}
                          className={cn("w-full border rounded px-2 py-1 text-[10px] transition-colors", themeClasses.input)}
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                       <span className="text-[8px] opacity-40 uppercase">缩放比例 (ZOOM)</span>
                       <div className="flex gap-2">
                         {[9, 10, 11, 12, 13].map(z => (
                           <button 
                             key={z} 
                             onClick={() => setMapConfig({ ...mapConfig, zoom: z })}
                             className={cn("px-2 py-0.5 rounded text-[8px] border transition-all", mapConfig.zoom === z ? "bg-[#FF6B00] text-white border-[#FF6B00]" : themeClasses.border)}
                           >
                             {z}
                           </button>
                         ))}
                       </div>
                    </div>
                  </div>

                  <div className={cn("pt-2 border-t", themeClasses.border)}>
                    <label className="text-[9px] uppercase tracking-widest text-[#FF6B00] opacity-60 block mb-2">模拟动态控制</label>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[8px] opacity-40 uppercase tracking-widest">配送响应速度: {simulationSpeed}x</span>
                          <span className="text-[8px] text-accent-green font-bold">加速开启</span>
                        </div>
                        <input 
                          type="range" 
                          min="0.2" 
                          max="5" 
                          step="0.1" 
                          value={simulationSpeed} 
                          onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                          className="w-full accent-[#FF6B00] h-1 rounded-lg bg-white/10 appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[8px] opacity-40 uppercase tracking-widest">活跃路线密度: {routeDensity}</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="50" 
                          step="1" 
                          value={routeDensity} 
                          onChange={(e) => setRouteDensity(parseInt(e.target.value))}
                          className="w-full accent-[#FF6B00] h-1 rounded-lg bg-white/10 appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className={cn("pt-2 border-t", themeClasses.border)}>
                    <label className="text-[9px] uppercase tracking-widest text-[#FF6B00] opacity-60 block mb-2">自定义地图背景</label>
                    <div className="flex flex-col gap-2">
                      <label className={cn("flex items-center justify-center gap-2 py-2 border border-dashed rounded cursor-pointer hover:bg-white/5 transition-all text-[10px]", themeClasses.border)}>
                        <MapPin className="w-3 h-3 text-[#FF6B00]" />
                        <span className="opacity-60">上传本地地图照片</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                localStorage.setItem('taowei_custom_map', reader.result as string);
                                window.location.reload();
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {localStorage.getItem('taowei_custom_map') && (
                        <button 
                          onClick={() => {
                            localStorage.removeItem('taowei_custom_map');
                            window.location.reload();
                          }}
                          className="text-[8px] text-red-500 uppercase font-bold text-center hover:underline"
                        >
                          重置为默认动态地图
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="text-[9px] uppercase tracking-[0.3em] font-mono text-[#FF6B00]/60">系统状态：雪隆区实时在线</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <StatCard 
              isDarkMode={isDarkMode}
              icon={<Zap className="w-4 h-4 text-accent-amber" />} 
              label="进行中订单" 
              value={propsStats.activeOrders} 
              isEdit={isManagementUnlocked}
              onIncrement={() => propsUpdateStat('activeOrders', 1)}
              onDecrement={() => propsUpdateStat('activeOrders', -1)}
            />
            <StatCard 
              isDarkMode={isDarkMode}
              icon={<Users className="w-4 h-4 text-[#FF6B00]" />} 
              label="在线骑手" 
              value={propsStats.onlineRiders} 
              isEdit={isManagementUnlocked}
              onIncrement={() => propsUpdateStat('onlineRiders', 10)}
              onDecrement={() => propsUpdateStat('onlineRiders', -10)}
            />
          </div>
          <StatCard 
              isDarkMode={isDarkMode}
              icon={<TrendingUp className="w-4 h-4 text-accent-green" />} 
              label="今日配送量" 
              value={propsStats.deliveredToday} 
              isEdit={isManagementUnlocked}
              onIncrement={() => propsUpdateStat('deliveredToday', 100)}
              onDecrement={() => propsUpdateStat('deliveredToday', -100)}
            />
          <StatCard 
              isDarkMode={isDarkMode}
              icon={<ShieldCheck className="w-4 h-4 text-accent-amber" />} 
              label="已完成订单" 
              value={propsStats.completedTotal} 
              isEdit={isManagementUnlocked}
              onIncrement={() => propsUpdateStat('completedTotal', 50)}
              onDecrement={() => propsUpdateStat('completedTotal', -50)}
            />

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] uppercase font-bold text-[#FF6B00] border-l-2 border-[#FF6B00] pl-3 py-0.5 tracking-widest">实时订单流</h2>
              <div className="flex gap-2 text-[9px]">
                <button 
                  onClick={() => setIsManagementUnlocked(!isManagementUnlocked)}
                  className={cn("px-2 py-1 rounded border transition-all uppercase font-bold", isManagementUnlocked ? "bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30" : isDarkMode ? "bg-white/5 text-zinc-500 border-white/10" : "bg-white/50 text-orange-950/40 border-brand-primary/10")}
                >
                  {isManagementUnlocked ? "功能已解锁" : "隐藏功能"}
                </button>
                <button 
                  onClick={() => setIsAutoSpawning(!isAutoSpawning)}
                  className={cn("px-2 py-1 rounded border transition-all uppercase font-bold", isAutoSpawning ? "bg-accent-green/20 text-accent-green border-accent-green/30" : isDarkMode ? "bg-white/5 text-zinc-500 border-white/10" : "bg-white/50 text-orange-950/40 border-brand-primary/10")}
                >
                  {isAutoSpawning ? "自动派单中" : "暂停派单"}
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {orders.map(order => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={cn(
                      "p-3 rounded border transition-colors",
                      isDarkMode ? "bg-white/[0.02] border-white/10" : "bg-white/60 border-brand-primary/5 shadow-sm",
                      activeOrderId === order.id ? (isDarkMode ? "border-accent-amber/50 bg-accent-amber/5" : "border-accent-amber bg-accent-amber/10 shadow-[0_0_15px_rgba(255,170,0,0.1)]") : "hover:bg-brand-primary/5",
                      order.status === 'completed' && "opacity-40 grayscale"
                    )}
                  >
                    <div className="flex justify-between mb-1">
                      <span className="text-accent-amber font-mono text-[11px] font-bold">#{orderPrefix}-{order.id}</span>
                      <span className={cn("font-bold text-[10px]", themeClasses.textMain)}>RM {order.price.toFixed(2)}</span>
                    </div>
                    <div className={cn("text-[10px] truncate mb-2", themeClasses.textMuted)}>{order.items.join(', ')}</div>
                    <div className="flex items-center justify-between font-mono text-[9px] opacity-40">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        吉隆坡中心区
                      </div>
                      <span className={cn(order.status === 'completed' ? "text-accent-green" : "text-zinc-500")}>
                        {order.status === 'completed' ? (
                          "已送达"
                        ) : (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 animate-pulse" />
                            <LiveTimer startTime={order.timestamp} />
                          </div>
                        )}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {orders.length === 0 && (
                <div className="text-center py-8 text-[10px] opacity-30 uppercase tracking-widest">暂无订单数据</div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Map Area */}
      <div className={cn("flex-1 relative overflow-hidden m-4 ml-0 my-6 mr-6 rounded-lg border shadow-inner transition-colors duration-500", isDarkMode ? "bg-zinc-950 border-white/5" : "bg-white border-brand-primary/10")}>
        {/* Toggle Sidebar Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={cn(
            "absolute top-6 left-6 z-30 p-2 rounded-full border transition-all pointer-events-auto",
            isSidebarOpen 
              ? (isDarkMode ? "bg-transparent border-white/10 opacity-0 md:opacity-100 -translate-x-full hover:bg-white/5" : "bg-transparent border-brand-primary/10 opacity-0 md:opacity-100 -translate-x-full hover:bg-brand-primary/5")
              : "bg-[#FF6B00] text-white border-[#FF6B00] shadow-2xl scale-110"
          )}
        >
          {isSidebarOpen ? <Minus className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
        </button>

        {/* Map Background Image */}
        <div className="absolute inset-0 z-0 scale-[1.02]">
          <img 
            src={localStorage.getItem('taowei_custom_map') || mapBg} 
            alt="Dispatch Map"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // If local image fails and it was the user-set one, cleanup
              if (localStorage.getItem('taowei_custom_map')) {
                localStorage.removeItem('taowei_custom_map');
                window.location.reload();
              } else {
                // Fallback to dynamic Google Map as the ultimate backup
                (e.target as HTMLImageElement).src = `https://maps.googleapis.com/maps/api/staticmap?center=${mapConfig.lat},${mapConfig.lng}&zoom=${mapConfig.zoom}&size=1280x800&scale=2&maptype=roadmap&key=${(import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY}&style=feature:all|element:all|saturation:-100|lightness:${isDarkMode ? -80 : 20}`;
              }
            }}
          />
          <div className={cn("absolute inset-0 pointer-events-none", isDarkMode ? "bg-black/20" : "bg-white/10")} />
        </div>

        <svg 
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`} 
          className="absolute inset-0 w-full h-full select-none pointer-events-none z-10"
        >
           <defs>
            <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-amber" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-yellow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFF00" />
              <stop offset="100%" stopColor="#39ff14" />
            </linearGradient>
          </defs>
          
          {/* Historical/Static Markers */}
          <rect x="550" y="405" width="120" height="20" fill={isDarkMode ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.7)"} rx="4" />
          <text x="560" y="420" fill={isDarkMode ? "white" : "maroon"} fontSize="10" className="opacity-80 tracking-[0.2em] font-bold">吉隆坡中心区</text>

          {/* Active Pulse Lines for ALL non-completed orders */}
          {(() => {
            const activeOrders = orders.filter(o => o.status !== 'completed');
            if (activeOrders.length === 0) return null;
            
            // Circularly select routes based on density and offset
            return Array.from({ length: Math.min(routeDensity, activeOrders.length) }).map((_, i) => {
              const orderIndex = (i + routeOffset) % activeOrders.length;
              const order = activeOrders[orderIndex];
              
              const assignedRider = riders.length > 0 ? riders.reduce((prev, curr) => {
                const dPrev = Math.hypot(prev.pos.x - order.pickupPos.x, prev.pos.y - order.pickupPos.y);
                const dCurr = Math.hypot(curr.pos.x - order.pickupPos.x, curr.pos.y - order.pickupPos.y);
                return dCurr < dPrev ? curr : prev;
              }) : null;

              // Generate a curved path if order ID ends with a digit that is even
              const idNumeric = order.id.replace(/\D/g, '');
              const isCurved = idNumeric ? parseInt(idNumeric) % 2 === 0 : false;
              
              const getPath = (start: Point, end: Point) => {
                if (!isCurved) return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
                const midX = (start.x + end.x) / 2;
                const midY = (start.y + end.y) / 2;
                const dx = end.x - start.x;
                const dy = end.y - start.y;
                // Offset perpendicular to the segment
                const ctrlX = midX - dy * 0.15;
                const ctrlY = midY + dx * 0.15;
                return `M ${start.x} ${start.y} Q ${ctrlX} ${ctrlY} ${end.x} ${end.y}`;
              };

              const riderToPickupPath = assignedRider ? getPath(assignedRider.pos, order.pickupPos) : "";
              const pickupToCustomerPath = getPath(order.pickupPos, order.customerPos);

              return (
                <motion.g key={`route-${order.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {assignedRider && (
                    <motion.path
                      d={riderToPickupPath}
                      stroke={isDarkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)"}
                      strokeWidth="1"
                      strokeDasharray="4 2"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5 / simulationSpeed }}
                    />
                  )}
                  <motion.path
                    d={pickupToCustomerPath}
                    stroke="url(#routeGradient)"
                    strokeWidth="3"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{ duration: 1 / simulationSpeed, ease: "easeOut" }}
                    filter="url(#glow-yellow)"
                  />
                  <motion.circle 
                    cx={order.pickupPos.x} 
                    cy={order.pickupPos.y} 
                    r="4" 
                    fill="#FFFF00"
                    filter="url(#glow-yellow)"
                  />
                  <motion.circle 
                    cx={order.customerPos.x} 
                    cy={order.customerPos.y} 
                    r="4" 
                    fill="var(--color-accent-green)"
                    filter="url(#glow-green)"
                  />
                  {/* Animated Signal Particle */}
                  <motion.circle
                    r="3"
                    fill="white"
                    filter="url(#glow-cyan)"
                    initial={{ offsetDistance: "0%" }}
                    animate={{ offsetDistance: "100%" }}
                    transition={{ duration: 1.5 / simulationSpeed, repeat: Infinity, ease: "linear" }}
                    style={{ 
                      offsetPath: `path("${pickupToCustomerPath}")`,
                      position: 'absolute'
                    }}
                  />
                  <motion.circle
                    r="5"
                    stroke="#FFFF00"
                    strokeWidth="1"
                    fill="transparent"
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ duration: 2 / simulationSpeed, repeat: Infinity, ease: "easeOut" }}
                    cx={order.pickupPos.x}
                    cy={order.pickupPos.y}
                  />
                </motion.g>
              );
            });
          })()}

          {/* Rider Light Points */}
          {stats.onlineRiders > 0 && riders.map(rider => {
            const isAssigned = assignedRiderIds.has(rider.id);
            return (
              <circle
                key={rider.id}
                cx={rider.pos.x}
                cy={rider.pos.y}
                r={isAssigned ? 5 : 2}
                fill={isAssigned ? "#FFFF00" : "#39ff14"}
                className={cn(
                  "transition-all duration-300",
                  isAssigned ? "opacity-100" : "opacity-60"
                )}
                filter={isAssigned ? "url(#glow-yellow)" : "url(#glow-green)"}
              />
            );
          })}
        </svg>

        <div className={cn("absolute bottom-6 left-8 font-mono text-[10px] opacity-50 tracking-widest z-20", isDarkMode ? "text-[#FF6B00]" : "text-zinc-600")}>
           坐标: 3.1390° N | 101.6869° E | 核心节点 [在线]
        </div>

        <div className="absolute top-6 right-6 flex flex-col items-end gap-3 pointer-events-none z-20">
          <div className={cn("p-3 rounded border flex items-center gap-6 backdrop-blur-md", themeClasses.glass)}>
             <div className="text-right">
                <p className="text-[9px] uppercase tracking-widest opacity-50">本地系统时间</p>
                <p className={cn("text-sm font-bold uppercase font-mono transition-colors", themeClasses.textMain)}>{new Date().toLocaleTimeString()}</p>
             </div>
             {activeOrder && activeOrder.status !== 'completed' && (
                <div className={cn("text-right border-l pl-6", isDarkMode ? "border-white/10" : "border-zinc-200")}>
                  <p className="text-[9px] uppercase tracking-widest text-accent-amber">当前派送耗时</p>
                  <p className="text-sm font-bold text-accent-amber uppercase font-mono">
                    <LiveTimer startTime={activeOrder.timestamp} pulse />
                  </p>
                </div>
             )}
          </div>
          
          {/* Global Theme Toggle for Backend */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn(
              "p-3 rounded-full border transition-all pointer-events-auto hover:scale-110 active:scale-95 shadow-lg",
              isDarkMode ? "bg-zinc-800 border-white/10 text-[#FF6B00]" : "bg-white border-zinc-200 text-[#FF6B00]"
            )}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {showNotification && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-accent-green text-black px-12 py-8 rounded-sm font-black shadow-[0_0_50px_rgba(57,255,20,0.4)] flex flex-col items-center gap-4 uppercase tracking-tighter border-4 border-black/20 pointer-events-auto"
              >
                <div className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="text-2xl mb-1">所有订单已完成</p>
                  <p className="text-[10px] tracking-[0.4em] opacity-60">系统进入待命状态 | 调度核心就绪</p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {activeOrderId && activeOrder && activeOrder.status !== 'completed' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
              className={cn(
                "absolute top-1/2 left-1/2 p-6 rounded-sm border min-w-[240px] text-center shadow-[0_0_50px_rgba(255,170,0,0.1)] z-30 backdrop-blur-xl",
                isDarkMode ? "bg-zinc-900/60 border-accent-amber/40" : "bg-white/80 border-accent-amber shadow-2xl"
              )}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] border border-accent-amber/20 rounded-full animate-ping opacity-20 pointer-events-none" />
              
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent-amber mb-2">检测到新配送序列</h3>
              <p className={cn("font-mono text-lg font-bold tracking-widest mb-1", themeClasses.textMain)}>ID: {orderPrefix}-{activeOrder.id}</p>
              <div className="flex flex-col my-3">
                <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-1">实时配送计时</p>
                <div className="text-4xl font-black text-accent-amber font-mono">
                   <LiveTimer startTime={activeOrder.timestamp} />
                </div>
              </div>
              <p className="font-mono text-xl font-bold text-accent-amber my-2">智能派单中...</p>
              <div className="flex items-center justify-center gap-2 text-[10px] text-accent-green uppercase font-bold tracking-widest mt-2">
                <Zap className="w-3 h-3" />
                路线优化已完成
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LiveTimer({ startTime, pulse = false }: { startTime: number, pulse?: boolean }) {
  const [ticks, setTicks] = useState(0);
  
  useEffect(() => {
    const t = setInterval(() => setTicks(prev => prev + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;

  return (
    <motion.span
      key={s}
      initial={pulse ? { scale: 1.1, opacity: 0.8 } : false}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-block"
    >
      {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
    </motion.span>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  isEdit,
  isDarkMode,
  onIncrement, 
  onDecrement 
}: { 
  icon: React.ReactNode, 
  label: string, 
  value: string | number,
  isEdit?: boolean,
  isDarkMode?: boolean,
  onIncrement?: () => void,
  onDecrement?: () => void
}) {
  return (
    <div className={cn("p-4 rounded border space-y-1 group relative transition-all", isDarkMode ? "border-white/5 bg-white/[0.03]" : "bg-white/90 border-brand-primary/10 shadow-sm")}>
      <div className="flex items-center gap-2 text-[10px] font-bold text-[#FF6B00] opacity-70 uppercase tracking-widest">
        {icon}
        {label}
      </div>
      <div className="flex items-end justify-between">
        <div className={cn("text-2xl font-black tracking-tight font-sans uppercase transition-colors", isDarkMode ? "text-white" : "text-zinc-900")}>
          {value}
        </div>
        <AnimatePresence>
          {isEdit && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex gap-1"
            >
              <button onClick={onDecrement} className={cn("p-1 rounded border transition-colors active:scale-90", isDarkMode ? "hover:bg-white/10 border-white/10" : "hover:bg-orange-50 border-orange-200/30")}><Minus className="w-3 h-3" /></button>
              <button onClick={onIncrement} className={cn("p-1 rounded border transition-colors active:scale-90", isDarkMode ? "hover:bg-white/10 border-white/10" : "hover:bg-orange-50 border-orange-200/30")}><Plus className="w-3 h-3" /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
