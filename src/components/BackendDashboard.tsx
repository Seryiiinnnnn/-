import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, Package, Clock, Users, Zap, TrendingUp, AlertCircle, Plus, Minus, Settings, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { cn } from '../lib/utils';
import { Point, Rider, Order, SystemStats } from '../types';

// Approximate Klang Valley Bounds
const WIDTH = 1200;
const HEIGHT = 800;

interface BackendDashboardProps {
  propsStats: SystemStats;
  propsUpdateStat: (key: keyof SystemStats, delta: number) => void;
  orderPrefix: string;
  onPrefixChange: (prefix: string) => void;
  orders: Order[];
}

export default function BackendDashboard({ 
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

  const [showNotification, setShowNotification] = useState(false);
  const [isAutoSpawning, setIsAutoSpawning] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isManagementUnlocked, setIsManagementUnlocked] = useState(false); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 

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
    <div className="flex h-screen bg-bg-dark overflow-hidden font-sans text-zinc-400">
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
        className="flex flex-col glass z-20 my-6 rounded-lg overflow-hidden relative"
      >
        <div className="p-6 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
              <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse shadow-[0_0_8px_#39ff14] shrink-0" />
              <h1 className="text-xl font-black tracking-tighter logo-text uppercase">淘味 调度中心</h1>
            </div>
            <button onClick={() => setShowSettings(!showSettings)} className="text-brand-primary p-1 hover:bg-white/5 rounded transition-colors shrink-0">
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
                <div className="p-3 bg-white/5 rounded border border-white/10 mb-4 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-brand-primary opacity-60">订单单号前缀</label>
                    <input 
                      type="text" 
                      value={orderPrefix} 
                      onChange={(e) => onPrefixChange(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-brand-primary outline-none"
                    />
                  </div>
                  
                  <div className="pt-2 border-t border-white/5">
                    <label className="text-[9px] uppercase tracking-widest text-brand-primary opacity-60 block mb-2">地图视角校准 (雪隆区范围)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-[8px] opacity-40">LAT</span>
                        <input 
                          type="number" 
                          step="0.0001"
                          value={mapConfig.lat} 
                          onChange={(e) => setMapConfig({ ...mapConfig, lat: parseFloat(e.target.value) })}
                          className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] opacity-40">LNG</span>
                        <input 
                          type="number" 
                          step="0.0001"
                          value={mapConfig.lng} 
                          onChange={(e) => setMapConfig({ ...mapConfig, lng: parseFloat(e.target.value) })}
                          className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-white"
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
                             className={cn("px-2 py-0.5 rounded text-[8px] border", mapConfig.zoom === z ? "bg-brand-primary text-black border-brand-primary" : "border-white/10")}
                           >
                             {z}
                           </button>
                         ))}
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="text-[9px] uppercase tracking-[0.3em] font-mono text-brand-primary/60">系统状态：雪隆区实时在线</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <StatCard 
              icon={<Zap className="w-4 h-4 text-accent-amber" />} 
              label="进行中订单" 
              value={propsStats.activeOrders} 
              isEdit={isManagementUnlocked}
              onIncrement={() => propsUpdateStat('activeOrders', 1)}
              onDecrement={() => propsUpdateStat('activeOrders', -1)}
            />
            <StatCard 
              icon={<Users className="w-4 h-4 text-brand-primary" />} 
              label="在线骑手" 
              value={propsStats.onlineRiders} 
              isEdit={isManagementUnlocked}
              onIncrement={() => propsUpdateStat('onlineRiders', 10)}
              onDecrement={() => propsUpdateStat('onlineRiders', -10)}
            />
          </div>
          <StatCard 
              icon={<TrendingUp className="w-4 h-4 text-accent-green" />} 
              label="今日配送量" 
              value={propsStats.deliveredToday} 
              isEdit={isManagementUnlocked}
              onIncrement={() => propsUpdateStat('deliveredToday', 100)}
              onDecrement={() => propsUpdateStat('deliveredToday', -100)}
            />
          <StatCard 
              icon={<ShieldCheck className="w-4 h-4 text-accent-amber" />} 
              label="已完成订单" 
              value={propsStats.completedTotal} 
              isEdit={isManagementUnlocked}
              onIncrement={() => propsUpdateStat('completedTotal', 50)}
              onDecrement={() => propsUpdateStat('completedTotal', -50)}
            />

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] uppercase font-bold text-brand-primary border-l-2 border-brand-primary pl-3 py-0.5 tracking-widest">实时订单流</h2>
              <div className="flex gap-2 text-[9px]">
                <button 
                  onClick={() => setIsManagementUnlocked(!isManagementUnlocked)}
                  className={cn("px-2 py-1 rounded border border-white/10 transition-colors uppercase font-bold", isManagementUnlocked ? "bg-brand-primary/20 text-brand-primary border-brand-primary/30" : "bg-white/5 text-zinc-500")}
                >
                  {isManagementUnlocked ? "功能已解锁" : "隐藏功能"}
                </button>
                <button 
                  onClick={() => setIsAutoSpawning(!isAutoSpawning)}
                  className={cn("px-2 py-1 rounded border border-white/10 transition-colors uppercase font-bold", isAutoSpawning ? "bg-accent-green/20 text-accent-green border-accent-green/30" : "bg-white/5 text-zinc-500")}
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
                      "p-3 rounded border border-white/10 bg-white/[0.02] transition-colors",
                      activeOrderId === order.id ? "border-accent-amber/50 bg-accent-amber/5" : "hover:bg-white/[0.05]",
                      order.status === 'completed' && "opacity-40 grayscale"
                    )}
                  >
                    <div className="flex justify-between mb-1">
                      <span className="text-accent-amber font-mono text-[11px] font-bold">#{orderPrefix}-{order.id}</span>
                      <span className="text-white font-bold text-[10px]">RM {order.price.toFixed(2)}</span>
                    </div>
                    <div className="opacity-60 text-[10px] truncate mb-2">{order.items.join(', ')}</div>
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
      <div className="flex-1 relative bg-bg-dark overflow-hidden m-4 ml-0 my-6 mr-6 rounded-lg border border-white/5">
        {/* Toggle Sidebar Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={cn(
            "absolute top-6 left-6 z-30 p-2 rounded-full border transition-all pointer-events-auto",
            isSidebarOpen 
              ? "bg-transparent border-white/10 opacity-0 md:opacity-100 -translate-x-full hover:bg-white/5" 
              : "bg-brand-primary text-black border-brand-primary shadow-2xl scale-110"
          )}
        >
          {isSidebarOpen ? <Minus className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
        </button>

        {/* Map Background Image */}
        <div className="absolute inset-0 z-0 scale-[1.02]">
          <img 
            src={`https://maps.googleapis.com/maps/api/staticmap?center=${mapConfig.lat},${mapConfig.lng}&zoom=${mapConfig.zoom}&size=1280x800&scale=2&maptype=roadmap&key=${(import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY}`} 
            alt="Klang Valley Live Map"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-white/5 pointer-events-none" />
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
            
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-accent-amber)" />
              <stop offset="100%" stopColor="var(--color-accent-green)" />
            </linearGradient>
          </defs>
          
          {/* Historical/Static Markers */}
          <rect x="550" y="405" width="120" height="20" fill="rgba(0,0,0,0.8)" rx="4" />
          <text x="560" y="420" fill="white" fontSize="10" className="opacity-80 tracking-[0.2em] font-bold">吉隆坡中心区</text>

          {/* Active Pulse Lines for ALL non-completed orders */}
          {orders.filter(o => o.status !== 'completed').map(order => {
            const assignedRider = riders.length > 0 ? riders.reduce((prev, curr) => {
              const dPrev = Math.hypot(prev.pos.x - order.pickupPos.x, prev.pos.y - order.pickupPos.y);
              const dCurr = Math.hypot(curr.pos.x - order.pickupPos.x, curr.pos.y - order.pickupPos.y);
              return dCurr < dPrev ? curr : prev;
            }) : null;

            return (
              <motion.g key={`route-${order.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {assignedRider && (
                  <motion.path
                    d={`M ${assignedRider.pos.x} ${assignedRider.pos.y} L ${order.pickupPos.x} ${order.pickupPos.y}`}
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
                <motion.path
                  d={`M ${order.pickupPos.x} ${order.pickupPos.y} L ${order.customerPos.x} ${order.customerPos.y}`}
                  stroke="url(#routeGradient)"
                  strokeWidth="3"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.8 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  filter="url(#glow-green)"
                />
                <motion.circle 
                  cx={order.pickupPos.x} 
                  cy={order.pickupPos.y} 
                  r="4" 
                  fill="var(--color-accent-amber)"
                  filter="url(#glow-amber)"
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
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  style={{ 
                    offsetPath: `path("M ${order.pickupPos.x} ${order.pickupPos.y} L ${order.customerPos.x} ${order.customerPos.y}")`,
                    position: 'absolute'
                  }}
                />
                <motion.circle
                  r="5"
                  stroke="white"
                  strokeWidth="1"
                  fill="transparent"
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 3, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  cx={order.pickupPos.x}
                  cy={order.pickupPos.y}
                />
              </motion.g>
            );
          })}

          {/* Rider Light Points */}
          {stats.onlineRiders > 0 && riders.map(rider => {
            const isAssigned = assignedRiderIds.has(rider.id);
            return (
              <circle
                key={rider.id}
                cx={rider.pos.x}
                cy={rider.pos.y}
                r={isAssigned ? 5 : 2}
                fill={isAssigned ? "var(--color-accent-green)" : "rgba(255,255,255,0.8)"}
                className={cn(
                  "transition-all duration-300",
                  isAssigned ? "opacity-100" : "opacity-60"
                )}
                filter={isAssigned ? "url(#glow-green)" : "url(#glow-cyan)"}
              />
            );
          })}
        </svg>

        <div className="absolute bottom-6 left-8 font-mono text-[10px] text-brand-primary opacity-50 tracking-widest z-20">
           坐标: 3.1390° N | 101.6869° E | 核心节点 [在线]
        </div>

        <div className="absolute top-6 right-6 flex flex-col items-end gap-3 pointer-events-none z-20">
          <div className="glass p-3 rounded border border-white/10 flex items-center gap-6">
             <div className="text-right">
                <p className="text-[9px] uppercase tracking-widest opacity-50">本地系统时间</p>
                <p className="text-sm font-bold text-white uppercase font-mono">{new Date().toLocaleTimeString()}</p>
             </div>
             {activeOrder && activeOrder.status !== 'completed' && (
                <div className="text-right border-l border-white/10 pl-6">
                  <p className="text-[9px] uppercase tracking-widest text-accent-amber">当前派送耗时</p>
                  <p className="text-sm font-bold text-accent-amber uppercase font-mono">
                    <LiveTimer startTime={activeOrder.timestamp} pulse />
                  </p>
                </div>
             )}
          </div>
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
              className="absolute top-1/2 left-1/2 p-6 glass rounded-sm border border-accent-amber/40 min-w-[240px] text-center shadow-[0_0_50px_rgba(255,170,0,0.1)] z-30"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] border border-accent-amber/20 rounded-full animate-ping opacity-20 pointer-events-none" />
              
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent-amber mb-2">检测到新配送序列</h3>
              <p className="font-mono text-lg font-bold text-white tracking-widest mb-1">ID: {orderPrefix}-{activeOrder.id}</p>
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
  onIncrement, 
  onDecrement 
}: { 
  icon: React.ReactNode, 
  label: string, 
  value: string | number,
  isEdit?: boolean,
  onIncrement?: () => void,
  onDecrement?: () => void
}) {
  return (
    <div className="p-4 rounded border border-white/5 bg-white/[0.03] space-y-1 group relative">
      <div className="flex items-center gap-2 text-[10px] font-bold text-brand-primary opacity-70 uppercase tracking-widest">
        {icon}
        {label}
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-black tracking-tight text-white font-sans uppercase">
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
              <button onClick={onDecrement} className="p-1 hover:bg-white/10 border border-white/10 rounded transition-colors active:scale-90"><Minus className="w-3 h-3" /></button>
              <button onClick={onIncrement} className="p-1 hover:bg-white/10 border border-white/10 rounded transition-colors active:scale-90"><Plus className="w-3 h-3" /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
