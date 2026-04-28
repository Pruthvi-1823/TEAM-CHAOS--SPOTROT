import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Warehouse, Store, Truck, Activity, TrendingDown, Thermometer, Droplets } from 'lucide-react';
import { Scan } from '../types';

interface NodeProps {
  id: string;
  x: number;
  y: number;
  label: string;
  type: string;
  icon: any;
  scans: Scan[];
}

const Node = ({ x, y, label, type, icon: Icon, scans }: NodeProps) => {
  const avgHealth = useMemo(() => {
    if (scans.length === 0) return 100;
    const total = scans.reduce((acc, s) => acc + (10 - s.spoilageScore) * 10, 0);
    return Math.round(total / scans.length);
  }, [scans]);

  const colorClass = avgHealth > 80 ? 'text-emerald-500' : avgHealth > 50 ? 'text-amber-500' : 'text-rose-500';
  const bgColorClass = avgHealth > 80 ? 'bg-emerald-500/10' : avgHealth > 50 ? 'bg-amber-500/10' : 'bg-rose-500/10';
  const borderColorClass = avgHealth > 80 ? 'border-emerald-500/20' : avgHealth > 50 ? 'border-amber-500/20' : 'border-rose-500/20';

  return (
    <motion.div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 12, stiffness: 100 }}
    >
      <div className="relative group">
        {/* Connection Points Background Aura */}
        <div className={`absolute inset-0 blur-2xl rounded-full ${bgColorClass} scale-150 opacity-50`} />
        
        {/* Node Circle */}
        <div className={`relative w-16 h-16 rounded-full border-2 ${borderColorClass} flex items-center justify-center bg-white shadow-xl group-hover:scale-110 transition-transform duration-500`}>
          {avgHealth < 40 && (
            <motion.div 
              className="absolute inset-0 rounded-full bg-rose-500/20"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
          <Icon className={`w-8 h-8 ${colorClass}`} />
          
          {/* Health Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="30"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={188.4}
              strokeDashoffset={188.4 - (188.4 * avgHealth) / 100}
              className={`transition-all duration-1000 ${colorClass} opacity-40`}
            />
          </svg>
        </div>

        {/* Labels */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{type}</p>
          <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{label}</p>
        </div>

        {/* Hover Tooltip/Stats */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none scale-90 group-hover:scale-100">
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 min-w-[160px]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Node Real-time</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Health Index</span>
                <span className={`text-sm font-black ${colorClass}`}>{avgHealth}%</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Active Batches</span>
                <span className="text-sm font-black">{scans.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function SupplyChainMap({ scans }: { scans: Scan[] }) {
  // Define Supply Chain Path
  const nodes = [
    { id: 'mandi', x: 10, y: 50, label: 'Azadpur Mandi', type: 'Origin', icon: MapPin },
    { id: 'transit', x: 36, y: 50, label: 'Hub Express', type: 'Transit', icon: Truck },
    { id: 'storage', x: 62, y: 50, label: 'Cold-Link Storage', type: 'Storage', icon: Warehouse },
    { id: 'retail', x: 88, y: 50, label: 'Reliance Retail', type: 'Terminal', icon: Store }
  ];

  // Group scans by location type to feed to nodes
  const scansByNode = useMemo(() => {
    return {
      mandi: scans.filter(s => s.locationType === 'Origin'),
      transit: scans.filter(s => s.locationType === 'Transit'),
      storage: scans.filter(s => s.locationType === 'Storage'),
      retail: scans.filter(s => s.locationType === 'Terminal')
    };
  }, [scans]);

  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Command Center: Supply Map</h3>
          <p className="text-sm font-bold text-slate-900">Real-time biological movement across network nodes</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Bio-Link Active</span>
        </div>
      </div>

      <div className="relative h-[400px] w-full bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden">
        {/* Grid Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        
        {/* Supply Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          {/* Main Path Lines */}
          <motion.line
            x1="10%" y1="50%" x2="36%" y2="50%"
            stroke="url(#lineGrad)"
            strokeWidth="4"
            strokeDasharray="8 8"
            initial={{ strokeDashoffset: 100 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
          <motion.line
            x1="36%" y1="50%" x2="62%" y2="50%"
            stroke="url(#lineGrad)"
            strokeWidth="4"
            strokeDasharray="8 8"
            initial={{ strokeDashoffset: 100 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
          <motion.line
            x1="62%" y1="50%" x2="88%" y2="50%"
            stroke="url(#lineGrad)"
            strokeWidth="4"
            strokeDasharray="8 8"
            initial={{ strokeDashoffset: 100 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
        </svg>

        {/* Animated Moving Batches (Simulated Flow) */}
        {scans.slice(0, 15).map((scan, i) => {
          const startNodeIdx = i % 3;
          const startX = nodes[startNodeIdx].x;
          const endX = nodes[startNodeIdx + 1].x;
          const colorClass = scan.riskLevel === 'High' ? '#f43f5e' : scan.riskLevel === 'Medium' ? '#f59e0b' : '#10b981';
          
          return (
            <motion.div
              key={scan.id}
              className="absolute w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)]"
              style={{ backgroundColor: colorClass, top: '50.3%', left: `${startX}%` }}
              animate={{ 
                left: [`${startX}%`, `${endX}%`],
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1, 1, 0.5]
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: i * 2,
                ease: 'linear'
              }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(node => (
          <Node
            key={node.id}
            {...node}
            scans={scansByNode[node.id as keyof typeof scansByNode]}
          />
        ))}

        {/* Legend Overlay */}
        <div className="absolute bottom-6 left-6 flex items-center gap-6 bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500 italic">Optimal Integrity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500 italic">Caution: Metabolism Rising</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500 italic">Critical Degradation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
