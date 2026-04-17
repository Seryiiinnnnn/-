import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, Users, Zap, ShieldCheck, 
  BarChart3, Activity, Clock, Package,
  Plus, Minus, Settings, ChevronLeft,
  ArrowUp, ArrowDown, Play, Pause,
  Sun, Moon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';
import { SystemStats, Order } from '../types';
import Logo from './Logo';
import { cn } from '../lib/utils';

interface StatsDashboardProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  stats: SystemStats;
  updateStat: (key: keyof SystemStats, delta: number) => void;
  onBack?: () => void;
  orderPrefix: string;
  onPrefixChange: (prefix: string) => void;
  orders: Order[];
}

const MOCK_HISTORICAL_DATA = [
  { time: '08:00', orders: 120, riders: 45 },
  { time: '10:00', orders: 450, riders: 80 },
  { time: '12:00', orders: 890, riders: 120 },
  { time: '14:00', orders: 750, riders: 110 },
  { time: '16:00', orders: 620, riders: 95 },
  { time: '18:00', orders: 1100, riders: 150 },
  { time: '20:00', orders: 950, riders: 140 },
];

export default function StatsDashboard({ 
  isDarkMode,
  setIsDarkMode,
  stats, 
  updateStat, 
  onBack, 
  orderPrefix, 
  onPrefixChange,
  orders
}: StatsDashboardProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDriftActive, setIsDriftActive] = useState(true);
  const [driftInterval, setDriftInterval] = useState(1000); // Default now 1s for faster feel
  
  // Chart data state
  const [chartData, setChartData] = useState<{time: string, accepted: number, completed: number}[]>([]);

  // Drift settings: [statKey, deltaAmount]
  const [driftSettings, setDriftSettings] = useState<Record<string, number>>({
    activeOrders: 2,
    onlineRiders: 1,
    deliveredToday: 3,
    completedTotal: 2
  });

  // Initialize and update chart data
  useEffect(() => {
    const historical = Array.from({ length: 20 }).map((_, i) => ({
      time: `${i}:00`,
      accepted: 10 + Math.floor(Math.random() * 50),
      completed: 5 + Math.floor(Math.random() * 40)
    }));
    setChartData(historical);
  }, []);

  const [showCompletionToast, setShowCompletionToast] = useState(false);

  // Auto-drift logic
  useEffect(() => {
    if (!isDriftActive) return;

    // Check for completion
    if (stats.activeOrders === 0 && stats.onlineRiders === 0 && isDriftActive) {
      setShowCompletionToast(true);
      return;
    }

    const interval = setInterval(() => {
      Object.entries(driftSettings).forEach(([key, value]) => {
        const delta = value as number;
        // Large random jumps as requested (2-digit to 3-digit: 10-150 range)
        const isReducing = delta < 0;
        const randomMagnitude = Math.floor(Math.random() * 140) + 10;
        const finalDelta = isReducing ? -randomMagnitude : randomMagnitude;
        
        updateStat(key as keyof SystemStats, finalDelta);
      });

      // Update chart with live-feeling data
      setChartData(prev => {
        const newData = [...prev.slice(1), {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          accepted: 30 + Math.floor(Math.random() * 60),
          completed: 20 + Math.floor(Math.random() * 50)
        }];
        return newData;
      });
    }, driftInterval);

    return () => clearInterval(interval);
  }, [isDriftActive, driftSettings, updateStat, driftInterval, stats.activeOrders, stats.onlineRiders]);

  const handleManualInput = (key: keyof SystemStats, value: string) => {
    const num = parseInt(value.replace(/,/g, ''), 10);
    if (!isNaN(num)) {
       const current = stats[key] as number;
       updateStat(key, num - current);
       if (num > 0) setShowCompletionToast(false);
    }
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

  const themeClasses = {
    bg: isDarkMode ? 'bg-[#05070a] text-zinc-400' : 'bg-[#fdf4e3] text-zinc-700',
    glass: isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-white/70 border-brand-primary/10 shadow-sm',
    card: isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-white/80 border-brand-primary/5 shadow-sm',
    input: isDarkMode ? 'bg-black/40 border-white/10' : 'bg-white border-brand-primary/20 text-zinc-900',
    textMain: isDarkMode ? 'text-white' : 'text-zinc-900',
    textMuted: isDarkMode ? 'text-zinc-500' : 'text-orange-900/40',
    logo: 'text-[#FF6B00]',
    border: isDarkMode ? 'border-white/10' : 'border-orange-200/30',
  };

  return (
    <div className={cn("min-h-screen p-8 font-sans relative overflow-hidden transition-colors duration-500", themeClasses.bg)}>
      {/* Global Completion Notification */}
      <AnimatePresence>
        {showCompletionToast && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] px-16 py-12 rounded-[40px] border-2 shadow-[0_0_150px_rgba(255,107,0,0.3)] flex flex-col items-center gap-6 text-center backdrop-blur-[40px]", 
              isDarkMode ? "bg-black/60 border-[#FF6B00]/40" : "bg-white/80 border-[#FF6B00]/30"
            )}
          >
            <div className="w-24 h-24 bg-[#FF6B00]/10 rounded-full flex items-center justify-center border-2 border-[#FF6B00]/40 shadow-[0_0_30px_rgba(255,107,0,0.2)]">
               <ShieldCheck className="w-12 h-12 text-[#FF6B00] animate-bounce" />
            </div>
            <div className="space-y-2">
              <h2 className={cn("text-5xl font-black italic uppercase tracking-tighter", isDarkMode ? "text-white" : "text-zinc-900")}>全部订单已完成</h2>
              <p className="text-[#FF6B00] font-mono text-xs tracking-[0.3em] font-bold uppercase opacity-80">System Status: All Operations Success</p>
            </div>
            <button 
              onClick={() => setShowCompletionToast(false)}
              className="mt-6 px-12 py-4 bg-[#FF6B00] text-white font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#FF6B00]/30"
            >
              继续监控
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {onBack && (
            <button 
              onClick={onBack}
              className={cn("p-3 rounded-xl border transition-all active:scale-95 group", themeClasses.glass)}
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
          )}
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <Logo size="lg" />
                <h1 className={cn("text-4xl font-black tracking-tighter uppercase italic", themeClasses.textMain)}>
                  <span className="text-[#FF6B00]">极速监控</span> 终端
                  <span className="bg-accent-green/10 border border-accent-green/20 px-2 py-0.5 rounded text-[10px] font-mono non-italic tracking-normal text-accent-green animate-pulse ml-2">● SIGNAL ACTIVE</span>
                </h1>
              </div>
              <p className="text-xs uppercase tracking-[0.4em] font-mono text-[#FF6B00]/60 mt-1 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" />
                Ultra-Fast Real-time Analytics Engine
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={cn("px-6 py-3 rounded-xl border flex items-center gap-4", themeClasses.glass)}>
            <div className="flex flex-col items-end">
               <p className="text-[10px] font-mono opacity-50 uppercase mb-0.5 flex items-center gap-1">
                 <Zap className="w-3 h-3 text-accent-amber" />
                 全局同步时钟
               </p>
               <p className={cn("text-sm font-bold font-mono tracking-widest italic uppercase", themeClasses.textMain)}>{new Date().toLocaleTimeString()}</p>
            </div>
            <div className={cn("w-px h-8", themeClasses.border)} />
            <button 
              onClick={() => setIsEditMode(!isEditMode)}
              className={cn(
                 "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all border",
                 isEditMode ? "bg-[#FF6B00] border-[#FF6B00] text-white shadow-[0_0_20px_#e95a32]" : "bg-[#FF6B00] border-[#FF6B00] text-white hover:opacity-90 shadow-[0_0_10px_rgba(255,107,0,0.3)]"
              )}
            >
              <Settings className="w-4 h-4" />
              {isEditMode ? "保存并锁定" : "调试模式"}
            </button>
          </div>
        </div>
      </header>

      {/* Settings Overlay */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="mb-8 glass p-6 rounded-2xl border border-brand-primary/30 bg-brand-primary/10 flex flex-wrap items-center justify-between gap-8 relative overflow-hidden backdrop-blur-3xl"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-brand-primary" />
            <div className="flex items-center gap-8">
               <div>
                  <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-3 block flex items-center gap-2">
                    <Activity className="w-3 h-3" />
                    增长引擎开关
                  </label>
                  <button 
                    onClick={() => setIsDriftActive(!isDriftActive)}
                    className={cn(
                      "flex items-center gap-3 px-6 py-3 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all border shadow-2xl",
                      isDriftActive 
                        ? "bg-accent-green border-accent-green text-black" 
                        : (isDarkMode ? "bg-zinc-900 border-zinc-700 text-white/20" : "bg-white/30 border-orange-200/20 text-orange-950/20")
                    )}
                  >
                    {isDriftActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    {isDriftActive ? "自动增长：运行中 (极速)" : "自动增长：已离线"}
                  </button>
               </div>
               
               <div className="w-px h-16 bg-white/10" />

               <div>
                  <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-3 block flex items-center gap-2">
                    <Package className="w-3 h-3" />
                    订单单号前缀
                  </label>
                  <input 
                    type="text" 
                    value={orderPrefix} 
                    onChange={(e) => onPrefixChange(e.target.value)}
                    className={cn(
                      "rounded-xl px-4 py-3 font-black text-xs w-24 outline-none focus:border-brand-primary transition-all text-center border",
                      isDarkMode ? "bg-black/40 border-white/10 text-white" : "bg-white border-orange-200/50 text-zinc-900"
                    )}
                  />
               </div>

               <div className="w-px h-16 bg-white/10" />

               <div>
                  <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-3 block flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    核心跳动频率 (当前: 每{driftInterval}ms 刷新)
                  </label>
                  <div className="flex gap-3">
                    {[500, 1000, 2000, 5000].map(ms => (
                      <button 
                        key={ms}
                        onClick={() => setDriftInterval(ms)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-[10px] font-black border transition-all",
                          driftInterval === ms ? "bg-brand-primary border-brand-primary text-white shadow-lg" : "border-white/10 text-white/30 hover:border-white/20 hover:text-white"
                        )}
                      >
                        {ms === 500 ? "超极速 (0.5S)" : `${ms/1000}S`}
                      </button>
                    ))}
                  </div>
               </div>
            </div>

            <div className="text-right flex flex-col items-end">
               <p className="text-[10px] font-bold text-white/50 uppercase mb-1 tracking-widest flex items-center gap-2">
                 <ShieldCheck className="w-3 h-3 text-brand-primary" />
                 管理员越权访问已开启
               </p>
               <p className="text-[9px] font-mono text-brand-primary/80">WARNING: DATA MODIFICATION ACTIVE</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Highlighted Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <BigStatCard 
          icon={<Zap className="w-8 h-8 text-accent-amber" />} 
          label="进行中订单" 
          value={stats.activeOrders} 
          sub="REAL-TIME ACTIVE REQUESTS"
          isEdit={isEditMode}
          driftDelta={driftSettings.activeOrders}
          onValueChange={(val: string) => handleManualInput('activeOrders', val)}
          onDirectionToggle={() => toggleDriftDirection('activeOrders')}
          onStepAdjust={(d: number) => adjustDriftStep('activeOrders', d)}
          highlight
        />
        <BigStatCard 
          icon={<Users className="w-8 h-8 text-[#FF6B00]" />} 
          label="在线骑手" 
          value={stats.onlineRiders} 
          sub="REAL-TIME LOGISTICS FLEET"
          isEdit={isEditMode}
          isDarkMode={isDarkMode}
          driftDelta={driftSettings.onlineRiders}
          onValueChange={(val: string) => handleManualInput('onlineRiders', val)}
          onDirectionToggle={() => toggleDriftDirection('onlineRiders')}
          onStepAdjust={(d: number) => adjustDriftStep('onlineRiders', d)}
          highlight
        />
        <BigStatCard 
          icon={<ShieldCheck className="w-8 h-8 text-accent-cyan" />} 
          label="已完成订单" 
          value={stats.completedTotal} 
          sub="SUCCESSFUL DELIVERIES"
          isEdit={isEditMode}
          driftDelta={driftSettings.completedTotal}
          onValueChange={(val: string) => handleManualInput('completedTotal', val)}
          onDirectionToggle={() => toggleDriftDirection('completedTotal')}
          onStepAdjust={(d: number) => adjustDriftStep('completedTotal', d)}
          highlight
        />
      </div>

      {/* New Charts Row */}
      <div className="grid grid-cols-1 gap-8 mb-12">
        <div className="glass rounded-2xl border border-white/5 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-green/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
          <div className="flex items-center justify-between mb-8">
             <div>
               <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
                 <TrendingUp className="w-6 h-6 text-accent-green" />
                 实时订单吞吐分析 (已接受 vs 已完成)
               </h2>
               <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Real-time Order Volume Distribution & Success Rate</p>
             </div>
             <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-brand-primary" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">已接受</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent-green" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">已完成</span>
                </div>
             </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAccepted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e95a32" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#e95a32" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#39ff14" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#39ff14" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0c10', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="accepted" 
                  stroke="#e95a32" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAccepted)" 
                  animationDuration={1000}
                />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#39ff14" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCompleted)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Status Footer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
         <div className="glass p-6 rounded-xl border border-white/5 flex items-center gap-6">
            <div className="w-12 h-12 bg-accent-amber/10 rounded-xl flex items-center justify-center border border-accent-amber/20">
               <TrendingUp className="w-6 h-6 text-accent-amber" />
            </div>
            <div>
               <p className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-1">今日累计吞吐量</p>
               <h4 className="text-2xl font-black text-white italic">{stats.deliveredToday.toLocaleString()} <span className="text-xs non-italic opacity-30">ORDERS</span></h4>
            </div>
         </div>
         <div className="lg:col-span-2 glass p-6 rounded-xl border border-white/5 flex items-center justify-between">
            <div className="flex gap-12">
               <DetailStat label="服务器负载" value="18.2%" status="optimal" />
               <DetailStat label="全网延迟" value="14MS" status="optimal" />
               <DetailStat label="智能预测偏差" value="±0.4S" status="optimal" />
            </div>
            <div className="font-mono text-[9px] text-zinc-600 tracking-[0.4em] uppercase">TAOWEI CORE INFRASTRUCTURE</div>
         </div>
      </div>

      {/* Real-time Order Feed */}
      <div className="glass rounded-2xl border border-white/5 p-8 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
              <Package className="w-6 h-6 text-brand-primary" />
              实时订单流水信号 (ID: {orderPrefix}-XXXX)
            </h2>
            <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Live Transaction Stream Sync from Core Node</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-accent-green/10 border border-accent-green/20 rounded-full">
             <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
             <span className="text-[9px] font-bold text-accent-green uppercase tracking-widest">Feed Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatePresence initial={false}>
            {orders.slice(0, 12).map(order => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "p-4 rounded-xl border border-white/5 bg-white/[0.02] relative overflow-hidden group/order transition-all",
                  order.status === 'completed' ? "border-accent-green/20 opacity-60" : "border-brand-primary/20"
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="text-[10px] font-mono font-black text-brand-primary/80">#{orderPrefix}-{order.id}</div>
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    order.status === 'completed' ? "bg-accent-green" : "bg-accent-amber shadow-[0_0_8px_orange]"
                  )} />
                </div>
                <div className="text-lg font-black text-white italic tracking-tighter mb-1">RM {order.price.toFixed(2)}</div>
                <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest truncate">{order.items.join(' + ')}</div>
                
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                   <div className="text-[8px] font-mono opacity-40">{new Date(order.timestamp).toLocaleTimeString()}</div>
                   <div className={cn(
                     "text-[8px] font-black uppercase tracking-widest",
                     order.status === 'completed' ? "text-accent-green" : "text-brand-primary"
                   )}>
                     {order.status === 'completed' ? "Signal Success" : "Data Routing..."}
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function DetailStat({ label, value, status }: any) {
  return (
    <div>
      <p className="text-[9px] uppercase font-bold tracking-widest opacity-40 mb-1">{label}</p>
      <div className="flex items-center gap-2">
         <span className="text-lg font-black text-white italic">{value}</span>
         <div className={cn("w-1.5 h-1.5 rounded-full", status === 'optimal' ? "bg-accent-green" : "bg-accent-amber")} />
      </div>
    </div>
  );
}

function BigStatCard({ icon, label, value, sub, highlight, isEdit, driftDelta, onValueChange, onDirectionToggle, onStepAdjust, isDarkMode }: any) {
  return (
    <div className={cn(
      "rounded-2xl border transition-all relative overflow-hidden group/card backdrop-blur-3xl",
      highlight ? "p-10 border-[#FF6B00]/20 bg-[#FF6B00]/5" : "p-6 border-white/5",
      isDarkMode ? "bg-white/[0.03]" : "bg-white/90 border-brand-primary/10 shadow-sm",
      highlight && "shadow-[0_0_60px_rgba(233,90,50,0.08)]",
      isEdit && "border-[#FF6B00]/50 ring-2 ring-[#FF6B00]/10"
    )}>
      {highlight && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B00]/10 blur-[60px] -mr-16 -mt-16 pointer-events-none" />
      )}
      
      <div className="flex items-center justify-between mb-8">
        <div className={cn(
          "p-4 bg-white/5 rounded-2xl transition-all group-hover/card:scale-110 duration-700", 
          highlight && "bg-[#FF6B00]/15 shadow-[0_0_30px_rgba(233,90,50,0.2)]"
        )}>
          {icon}
        </div>
        
        {isEdit && (
          <div className="flex flex-col items-end gap-2">
            <button 
              onClick={onDirectionToggle}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-xl border",
                driftDelta >= 0 ? "bg-accent-green/20 text-accent-green border-accent-green/30" : "bg-accent-red/20 text-accent-red border-accent-red/30"
              )}
            >
              {driftDelta >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {driftDelta >= 0 ? "加速递增" : "加速递减"}
            </button>
          </div>
        )}
      </div>

      <div>
        <p className={cn(
          "uppercase font-bold tracking-widest opacity-50 mb-3 flex items-center gap-2",
          highlight ? "text-[13px]" : "text-[10px]",
          isDarkMode ? "text-zinc-400" : "text-orange-950/40"
        )}>
           <span className="w-2 h-2 rounded-sm bg-[#FF6B00] rotate-45" />
           {label}
        </p>
        
        {isEdit ? (
          <div className="space-y-4">
            <input 
              type="text"
              className={cn(
                 "border rounded-xl px-4 py-3 font-black w-full outline-none focus:border-[#FF6B00] transition-all text-center",
                 isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-white border-brand-primary/20 text-zinc-900",
                 highlight ? "text-5xl" : "text-3xl"
              )}
              placeholder="0"
              defaultValue={value}
              onBlur={(e) => onValueChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onValueChange((e.target as HTMLInputElement).value);
                }
              }}
            />
            
            <div className={cn("flex items-center justify-between p-3 rounded-xl border backdrop-blur-md", isDarkMode ? "bg-black/40 border-white/5" : "bg-white/50 border-brand-primary/10")}>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00]/60">跳动强度: {Math.abs(driftDelta)}</span>
                <div className="flex gap-2">
                   <button onClick={() => onStepAdjust(-1)} className={cn("p-2 rounded-lg transition-colors border", isDarkMode ? "hover:bg-white/10 border-white/10" : "hover:bg-orange-50 border-orange-200/30")}><Minus className={cn("w-4 h-4", isDarkMode ? "text-white" : "text-zinc-900")} /></button>
                   <button onClick={() => onStepAdjust(1)} className={cn("p-2 rounded-lg transition-colors border", isDarkMode ? "hover:bg-white/10 border-white/10" : "hover:bg-orange-50 border-orange-200/30")}><Plus className={cn("w-4 h-4", isDarkMode ? "text-white" : "text-zinc-900")} /></button>
                </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <h3 className={cn(
              "font-black tracking-tighter italic flex items-baseline gap-3",
              isDarkMode ? "text-white" : "text-zinc-900",
              highlight ? "text-7xl" : "text-5xl"
            )}>
              {typeof value === 'number' ? value.toLocaleString() : value}
              <motion.span 
                animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-[12px] non-italic font-black uppercase tracking-widest text-accent-green font-mono"
              >
                ●
              </motion.span>
            </h3>
          </div>
        )}
        
        <p className={cn(
          "opacity-30 uppercase tracking-[0.3em] mt-6 font-mono flex items-center gap-2",
          highlight ? "text-[11px]" : "text-[9px]",
          isDarkMode ? "text-zinc-400" : "text-orange-950/30"
        )}>
          <TrendingUp className="w-4 h-4" />
          {sub}
        </p>
      </div>
    </div>
  );
}

