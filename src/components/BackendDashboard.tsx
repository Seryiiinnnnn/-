import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, Package, Clock, Users, Zap, TrendingUp, AlertCircle, Plus, Minus, Settings, ShieldCheck, LayoutDashboard, Sun, Moon, X } from 'lucide-react';
import Logo from './Logo';
import { cn } from '../lib/utils';
import { Point, Rider, Order, SystemStats } from '../types';
import { ASSETS } from '../constants';

// Approximate Klang Valley Bounds
const WIDTH = 1200;
const HEIGHT = 800;

interface BackendDashboardProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  isNavigationVisible: boolean;
  onToggleNavigation: () => void;
  propsStats: SystemStats;
  propsUpdateStat: (key: keyof SystemStats, delta: number) => void;
  orderPrefix: string;
  onPrefixChange: (prefix: string) => void;
  targetOrderCount: number;
  setTargetOrderCount: (val: number) => void;
  isDriftActive: boolean;
  setIsDriftActive: (val: boolean) => void;
  showCompletionToast: boolean;
  setShowCompletionToast: (val: boolean) => void;
  driftSettings: Record<string, number>;
  onToggleDriftDirection: (key: string) => void;
  orders: Order[];
}

export default function BackendDashboard({ 
  isDarkMode,
  setIsDarkMode,
  isNavigationVisible,
  onToggleNavigation,
  propsStats, 
  propsUpdateStat, 
  orderPrefix, 
  onPrefixChange,
  targetOrderCount,
  setTargetOrderCount,
  isDriftActive,
  setIsDriftActive,
  showCompletionToast,
  setShowCompletionToast,
  driftSettings,
  onToggleDriftDirection,
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
    const saved = localStorage.getItem('pinwei_sim_speed');
    return saved ? parseFloat(saved) : 1;
  });
  
  const [routeDensity, setRouteDensity] = useState(() => {
    const saved = localStorage.getItem('pinwei_route_density');
    return saved ? parseInt(saved) : 4;
  });

  const [routeOffset, setRouteOffset] = useState(0);
  
  const [timeOffset, setTimeOffset] = useState(() => {
    const saved = localStorage.getItem('pinwei_time_offset');
    return saved ? parseInt(saved) : 0;
  });
  const [currentTime, setCurrentTime] = useState(Date.now() + timeOffset);

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
    localStorage.setItem('pinwei_sim_speed', simulationSpeed.toString());
  }, [simulationSpeed]);

  useEffect(() => {
    localStorage.setItem('pinwei_route_density', routeDensity.toString());
  }, [routeDensity]);

  // Global clock for labels and timers
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(Date.now() + timeOffset);
    }, 1000);
    return () => clearInterval(clockInterval);
  }, [timeOffset]);

  useEffect(() => {
    localStorage.setItem('pinwei_time_offset', timeOffset.toString());
  }, [timeOffset]);

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
            x: Math.random() * WIDTH, 
            y: Math.random() * HEIGHT
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

  // Sync active order with local display
  useEffect(() => {
    const pendingOrders = orders.filter(o => o.status === 'pending');
    if (pendingOrders.length > 0 && !activeOrderId) {
      setTimeout(() => setActiveOrderId(pendingOrders[0].id), 200);
    }
  }, [orders, activeOrderId]);

  // Simulation Loop for Rider Motion - Optimized frequency
  useEffect(() => {
    const loop = setInterval(() => {
      setRiders(prev => prev.map(rider => {
        // Double the movement delta to compensate for 100ms tick (vs 50ms)
        let newX = rider.pos.x + rider.velocity.x * 2;
        let newY = rider.pos.y + rider.velocity.y * 2;

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
    }, 100);
    return () => clearInterval(loop);
  }, []);

  const stats = propsStats;

  const activeOrder = orders.find(o => o.id === activeOrderId);
  
  // Identify all "active" riders assigned to currently pending orders
  // Optimized: Pre-calculate assignments and useMemo
  const orderAssignments = useMemo(() => {
    if (riders.length === 0) return new Map<string, string>();
    
    const assignments = new Map<string, string>();
    const activeOrders = orders.filter(o => o.status !== 'completed');
    
    activeOrders.forEach(order => {
      let nearestDist = Infinity;
      let nearestId = '';
      
      for (const rider of riders) {
        const dist = Math.hypot(rider.pos.x - order.pickupPos.x, rider.pos.y - order.pickupPos.y);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestId = rider.id;
        }
      }
      assignments.set(order.id, nearestId);
    });
    
    return assignments;
  }, [orders, riders]);

  const assignedRiderIds = useMemo(() => new Set(orderAssignments.values()), [orderAssignments]);

  return (
    <div className={cn("relative h-screen overflow-hidden font-sans transition-colors duration-500", themeClasses.bg)}>
      {/* Global Completion Notification */}
      <AnimatePresence>
        {showCompletionToast && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={cn(
              "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] px-8 md:px-16 py-10 md:py-12 rounded-[30px] md:rounded-[40px] border-2 shadow-[0_0_150px_rgba(255,107,0,0.3)] flex flex-col items-center gap-4 md:gap-6 text-center backdrop-blur-[40px] w-[90%] md:w-auto max-w-lg", 
              isDarkMode ? "bg-black/60 border-[#FF6B00]/40" : "bg-white/80 border-[#FF6B00]/30"
            )}
          >
            <button 
              onClick={() => setShowCompletionToast(false)}
              className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full hover:bg-white/10 transition-colors opacity-50 hover:opacity-100"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <div className="w-16 h-16 md:w-24 md:h-24 bg-[#FF6B00]/10 rounded-full flex items-center justify-center border-2 border-[#FF6B00]/40 shadow-[0_0_30px_rgba(255,107,0,0.2)]">
               <ShieldCheck className="w-8 h-8 md:w-12 md:h-12 text-[#FF6B00] animate-bounce" />
            </div>
            <div className="space-y-1 md:space-y-2">
              <h2 className={cn("text-3xl md:text-5xl font-black italic uppercase tracking-tighter", isDarkMode ? "text-white" : "text-zinc-900")}>全部订单已完成</h2>
              <p className="text-[#FF6B00] font-mono text-[8px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] font-bold uppercase opacity-80 uppercase">System Status: All Operations Success</p>
            </div>
            <button 
              onClick={() => setShowCompletionToast(false)}
              className="mt-4 md:mt-6 px-8 md:px-12 py-3 md:py-4 bg-[#FF6B00] text-white text-xs md:text-sm font-black uppercase tracking-widest rounded-xl md:rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#FF6B00]/30"
            >
              继续监控
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Stats */}
      <motion.div 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? (window.innerWidth < 768 ? '85%' : 320) : 0,
          opacity: isSidebarOpen ? 1 : 0,
          left: isSidebarOpen ? (window.innerWidth < 768 ? '7.5%' : 24) : -320
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed inset-y-6 flex flex-col backdrop-blur-3xl z-40 rounded-3xl overflow-hidden border transition-all duration-500 shadow-2xl", 
          isDarkMode ? "bg-black/40 border-white/10" : "bg-white/40 border-brand-primary/10",
        )}
      >
        <div className={cn("p-6 border-b shrink-0", themeClasses.border)}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
              <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse shadow-[0_0_8px_#39ff14] shrink-0" />
              <div onDoubleClick={onToggleNavigation} className="cursor-pointer">
                <Logo size="md" />
              </div>
              <span className={cn("text-sm font-black tracking-tighter uppercase", themeClasses.textMain)}>调度中心</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setShowSettings(!showSettings)} className="text-[#FF6B00] p-1 hover:bg-white/5 rounded transition-colors">
                <Settings className="w-4 h-4" />
              </button>
              <button onClick={() => setIsSidebarOpen(false)} className="text-[#FF6B00] p-1 hover:bg-white/5 rounded transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
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
                    <label className="text-[9px] uppercase tracking-widest text-[#FF6B00] opacity-60 block mb-2">自定义系统时间</label>
                    <div className="space-y-3">
                       <div className="flex items-center justify-center gap-2 bg-black/20 p-3 rounded-lg border border-white/5">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[7px] opacity-30 uppercase font-bold">Hours</span>
                            <input 
                              type="number"
                              min="1"
                              max="12"
                              value={(() => {
                                const d = new Date(currentTime);
                                let h = d.getHours() % 12;
                                return h === 0 ? 12 : h;
                              })()}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (isNaN(val)) return;
                                const d = new Date(currentTime);
                                let h = d.getHours();
                                const isPM = h >= 12;
                                let targetH = val % 12;
                                if (isPM) targetH += 12;
                                d.setHours(targetH);
                                setTimeOffset(d.getTime() - Date.now());
                              }}
                              className={cn("w-10 h-8 text-center text-sm font-bold font-mono rounded border transition-all", themeClasses.input)}
                            />
                          </div>
                          <span className="text-xl font-bold opacity-30 self-end pb-1">:</span>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[7px] opacity-30 uppercase font-bold">Minutes</span>
                            <input 
                              type="number"
                              min="0"
                              max="59"
                              value={new Date(currentTime).getMinutes()}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (isNaN(val)) return;
                                const d = new Date(currentTime);
                                d.setMinutes(val % 60);
                                setTimeOffset(d.getTime() - Date.now());
                              }}
                              className={cn("w-10 h-8 text-center text-sm font-bold font-mono rounded border transition-all", themeClasses.input)}
                            />
                          </div>
                          <div className="flex flex-col gap-1 ml-1 self-end pb-0.5">
                            <button 
                              onClick={() => {
                                const d = new Date(currentTime);
                                let h = d.getHours();
                                if (h >= 12) d.setHours(h - 12);
                                setTimeOffset(d.getTime() - Date.now());
                              }}
                              className={cn("px-1.5 py-0.5 text-[8px] font-black rounded border transition-all", new Date(currentTime).getHours() < 12 ? "bg-[#FF6B00] text-white border-[#FF6B00]" : "opacity-30 border-white/10")}
                            >
                              AM
                            </button>
                            <button 
                              onClick={() => {
                                const d = new Date(currentTime);
                                let h = d.getHours();
                                if (h < 12) d.setHours(h + 12);
                                setTimeOffset(d.getTime() - Date.now());
                              }}
                              className={cn("px-1.5 py-0.5 text-[8px] font-black rounded border transition-all", new Date(currentTime).getHours() >= 12 ? "bg-[#FF6B00] text-white border-[#FF6B00]" : "opacity-30 border-white/10")}
                            >
                              PM
                            </button>
                          </div>
                       </div>
                       
                       <div className="flex gap-2">
                         <button 
                           onClick={() => setTimeOffset(0)}
                           className="flex-1 py-1.5 text-[8px] bg-white/5 border border-white/10 rounded hover:bg-white/10 transition-all uppercase font-bold flex items-center justify-center gap-1"
                         >
                           <Zap className="w-2.5 h-2.5" />
                           同步真实时间
                         </button>
                       </div>
                    </div>
                  </div>

                  <div className={cn("pt-2 border-t", themeClasses.border)}>
                    <label className="text-[9px] uppercase tracking-widest text-[#FF6B00] opacity-60 block mb-2">模拟动态控制</label>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-white/5 p-2 rounded">
                        <span className="text-[8px] opacity-60 uppercase font-bold">全局状态更新</span>
                        <button 
                          onClick={() => setIsDriftActive(!isDriftActive)}
                          className={cn("px-2 py-1 rounded text-[8px] font-bold uppercase transition-all", isDriftActive ? "bg-accent-green text-black" : "bg-red-500/20 text-red-500 border border-red-500/30")}
                        >
                          {isDriftActive ? "运行中" : "已暂停"}
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <div className="flex flex-col">
                            <span className="text-[8px] opacity-40 uppercase tracking-widest font-bold">活跃订单目标</span>
                            <span className="text-[10px] text-accent-amber font-mono">{targetOrderCount}</span>
                          </div>
                          <button 
                            onClick={() => onToggleDriftDirection('activeOrders')}
                            className={cn("px-2 py-1 rounded text-[8px] font-bold uppercase transition-all", driftSettings.activeOrders >= 0 ? "bg-accent-green/20 text-accent-green" : "bg-red-500/20 text-red-500")}
                          >
                            {driftSettings.activeOrders >= 0 ? "加速递增" : "加速递减"}
                          </button>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="150" 
                          step="1" 
                          value={targetOrderCount} 
                          onChange={(e) => setTargetOrderCount(parseInt(e.target.value))}
                          className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#FF6B00]"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <div className="flex flex-col">
                            <span className="text-[8px] opacity-40 uppercase tracking-widest font-bold">在线骑手数量</span>
                            <span className="text-[10px] text-accent-green font-mono">{propsStats.onlineRiders}</span>
                          </div>
                          <button 
                            onClick={() => onToggleDriftDirection('onlineRiders')}
                            className={cn("px-2 py-1 rounded text-[8px] font-bold uppercase transition-all", driftSettings.onlineRiders >= 0 ? "bg-accent-green/20 text-accent-green" : "bg-red-500/20 text-red-500")}
                          >
                            {driftSettings.onlineRiders >= 0 ? "加速递增" : "加速递减"}
                          </button>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="1000" 
                          step="1" 
                          value={propsStats.onlineRiders} 
                          onChange={(e) => propsUpdateStat('onlineRiders', parseInt(e.target.value) - propsStats.onlineRiders)}
                          className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-accent-green"
                        />
                      </div>
                    </div>
                  </div>

                  <div className={cn("pt-2 border-t", themeClasses.border)}>
                    <label className="text-[9px] uppercase tracking-widest text-[#FF6B00] opacity-60 block mb-2">地图校准信息</label>
                    <div className="bg-white/5 p-2 rounded border border-white/5">
                      <p className="text-[8px] opacity-40 italic leading-tight mb-2">手动校准将应用于全局渲染引擎以确保背景参考图与地理数据对齐。</p>
                      <button 
                        onClick={() => {
                          localStorage.removeItem('pinwei_custom_map');
                          window.location.reload();
                        }}
                        className="w-full text-[8px] bg-red-500/20 text-red-500 border border-red-500/30 uppercase font-bold py-2 rounded hover:bg-red-500/30 transition-all font-mono"
                      >
                        RESET_CALIBRATION_CACHE
                      </button>
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
                      <div className={cn(order.status === 'completed' ? "text-accent-green" : "text-zinc-500")}>
                        {order.status === 'completed' ? (
                          "已送达"
                        ) : (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 animate-pulse" />
                            <LiveTimer startTime={order.timestamp} now={currentTime} />
                          </div>
                        )}
                      </div>
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

      {/* Main Map Area - Now Background */}
      <div className={cn(
        "absolute inset-0 z-0 overflow-hidden transition-all duration-500",
        isDarkMode ? "bg-zinc-950" : "bg-white"
      )}>
        {/* Toggle Sidebar Button - Repositioned for full screen */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={cn(
            "fixed top-4 left-4 md:top-6 md:left-6 z-50 p-2 md:p-3 rounded-xl md:rounded-full border transition-all pointer-events-auto",
            isSidebarOpen 
              ? (isDarkMode ? "bg-zinc-900 border-white/10 opacity-0 pointer-events-none" : "bg-white border-brand-primary/10 opacity-0 pointer-events-none")
              : "bg-[#FF6B00] text-white border-[#FF6B00] shadow-2xl scale-110"
          )}
        >
          <LayoutDashboard className="w-5 h-5" />
        </button>

        {/* Map Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={localStorage.getItem('pinwei_custom_map') || ASSETS.MAP_BG} 
            alt="Dispatch Map"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            style={{ filter: isDarkMode ? 'brightness(0.3) contrast(1.2) saturate(0.8)' : 'brightness(1.1) contrast(0.9) saturate(0.9)' }}
            onError={(e) => {
              // If local image fails and it was the user-set one, cleanup
              if (localStorage.getItem('pinwei_custom_map')) {
                localStorage.removeItem('pinwei_custom_map');
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
            <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="50%" stopColor="#007AFF" />
              <stop offset="100%" stopColor="#39ff14" />
            </linearGradient>
            <linearGradient id="blueGlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00FBFF" />
              <stop offset="100%" stopColor="#007AFF" />
            </linearGradient>
          </defs>
          
          {/* Historical/Static Markers */}
          <rect x="550" y="405" width="120" height="20" fill={isDarkMode ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.7)"} rx="4" />
          <text x="560" y="420" fill={isDarkMode ? "white" : "maroon"} fontSize="10" className="opacity-80 tracking-[0.2em] font-bold">吉隆坡中心区</text>

          {/* Active Pulse Lines for ALL non-completed orders */}
          {(() => {
            const activeOrders = orders.filter(o => o.status !== 'completed');
            if (activeOrders.length === 0) return null;
            
            // Optimized: Use pre-calculated assignments
            return Array.from({ length: Math.min(routeDensity, activeOrders.length) }).map((_, i) => {
              const orderIndex = (i + routeOffset) % activeOrders.length;
              const order = activeOrders[orderIndex];
              
              const assignedRiderId = orderAssignments.get(order.id);
              const assignedRider = riders.find(r => r.id === assignedRiderId);

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
                    filter="url(#glow-blue)"
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

          {/* Rider Light Points - Optimized rendering */}
          {stats.onlineRiders > 0 && riders.map(rider => {
            const isAssigned = assignedRiderIds.has(rider.id);
            // Low performance cost: only filters on assigned riders
            return (
              <circle
                key={rider.id}
                cx={rider.pos.x}
                cy={rider.pos.y}
                r={isAssigned ? 8 : 4}
                fill={isAssigned ? "#FFFF00" : "#39ff14"}
                style={{ 
                  opacity: isAssigned ? 1 : 0.6,
                  transition: 'opacity 0.3s ease'
                }}
                filter={isAssigned ? "url(#glow-green)" : undefined}
                className="select-none pointer-events-none"
              />
            );
          })}
        </svg>

        <div className={cn("fixed bottom-6 left-8 font-mono text-[10px] opacity-50 tracking-widest z-20 hidden md:block", isDarkMode ? "text-[#FF6B00]" : "text-zinc-600")}>
           坐标: 3.1390° N | 101.6869° E | 核心节点 [在线]
        </div>

        <div className="fixed top-6 right-6 hidden md:flex flex-col items-end gap-3 pointer-events-none z-20">
          <div className={cn("p-3 rounded border flex items-center gap-6 backdrop-blur-md", themeClasses.glass)}>
             <div className="text-right">
                <p className="text-[9px] uppercase tracking-widest opacity-50">本地系统时间</p>
                <p className={cn("text-sm font-bold uppercase font-mono transition-colors", themeClasses.textMain)}>{new Date(currentTime).toLocaleTimeString()}</p>
             </div>
             {activeOrder && activeOrder.status !== 'completed' && (
                <div className={cn("text-right border-l pl-6", isDarkMode ? "border-white/10" : "border-zinc-200")}>
                  <p className="text-[9px] uppercase tracking-widest text-accent-amber">当前派送耗时</p>
                  <p className="text-sm font-bold text-accent-amber uppercase font-mono">
                    <LiveTimer startTime={activeOrder.timestamp} now={currentTime} pulse />
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
                   <LiveTimer startTime={activeOrder.timestamp} now={currentTime} />
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

function LiveTimer({ startTime, now, pulse = false }: { startTime: number, now: number, pulse?: boolean }) {
  const elapsed = Math.floor((now - startTime) / 1000);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;

  const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  return (
    <motion.span
      key={timeStr}
      initial={pulse ? { scale: 1.1, opacity: 0.8 } : false}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-block"
    >
      {timeStr}
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
