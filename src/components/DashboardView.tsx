import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Scan, Batch } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend } from 'recharts';
import { AlertCircle, TrendingDown, Clock, ShieldAlert, Activity, Thermometer, Droplets, MapPin, Circle } from 'lucide-react';
import { format } from 'date-fns';
import SupplyChainMap from './SupplyChainMap';

export default function DashboardView() {
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [stats, setStats] = useState({
    avgScore: 0,
    highestRiskStage: 'N/A',
    totalScans: 0,
    lossPrevented: 0
  });

  useEffect(() => {
    const q = query(
      collection(db, 'scans'),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scan));
      setRecentScans(scans);
      
      const totalScore = scans.reduce((acc, curr) => acc + curr.spoilageScore, 0);
      
      // Calculate loss prevented: Sum of estimated loss from scans that were "rerouted" or had specific actions
      // For demo, we'll base it on scans where score was high but risk was mitigated
      const estLossPrevented = scans.reduce((acc, s) => {
        if (s.riskLevel === 'High' || s.riskLevel === 'Medium') return acc + (Math.random() * 5000); // Simulated prevention value
        return acc;
      }, 0);

      // Find highest risk stage
      const stageAverages = scans.reduce((acc: any, s) => {
        if (!acc[s.location]) acc[s.location] = { total: 0, count: 0 };
        acc[s.location].total += s.spoilageScore;
        acc[s.location].count += 1;
        return acc;
      }, {});
      
      let maxStage = 'N/A';
      let maxAvg = 0;
      Object.entries(stageAverages).forEach(([stage, data]: any) => {
        const avg = data.total / data.count;
        if (avg > maxAvg) {
          maxAvg = avg;
          maxStage = stage;
        }
      });
      
      setStats({
        totalScans: snapshot.size,
        avgScore: snapshot.size > 0 ? Number((totalScore / snapshot.size).toFixed(1)) : 0,
        highestRiskStage: maxStage,
        lossPrevented: estLossPrevented
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'scans');
    });

    return unsubscribe;
  }, []);

  // Categorized Bar Chart Data - Grouped by Location Type
  const LOCATION_TYPES = [
    { type: 'Origin', label: 'Mandi/Farm' },
    { type: 'Transit', label: 'Transport' },
    { type: 'Storage', label: 'Cold Storage' },
    { type: 'Terminal', label: 'Retail/End' }
  ];

  const barChartData = LOCATION_TYPES.map(loc => {
    const scansAtType = recentScans.filter(s => s.locationType === loc.type);
    return {
      name: loc.label,
      Fresh: scansAtType.filter(s => (s.spoilageScore * 10) <= 20).length,
      Moderate: scansAtType.filter(s => (s.spoilageScore * 10) > 20 && (s.spoilageScore * 10) <= 50).length,
      High: scansAtType.filter(s => (s.spoilageScore * 10) > 50).length,
      avgScore: scansAtType.length > 0 ? scansAtType.reduce((acc, s) => acc + s.spoilageScore, 0) / scansAtType.length : 0
    };
  });

  // Prepare Line Chart Data for Spoilage Trend (Last 24 Hours approx)
  const timeSeriesData = [...recentScans]
    .sort((a, b) => (a.timestamp?.toMillis?.() || 0) - (b.timestamp?.toMillis?.() || 0))
    .reduce((acc: any[], scan) => {
      const time = format(scan.timestamp?.toDate() || new Date(), 'HH:00');
      const existing = acc.find(d => d.time === time);
      if (existing) {
        existing.total += scan.spoilageScore * 10;
        existing.count += 1;
        existing.rate = Number((existing.total / existing.count).toFixed(1));
      } else {
        acc.push({ time, total: scan.spoilageScore * 10, count: 1, rate: scan.spoilageScore * 10 });
      }
      return acc;
    }, [])
    .slice(-12); // Show last 12 data points (hours)

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-start mb-12 relative overflow-hidden p-8 rounded-[2.5rem] bg-slate-900 text-white">
        <img 
          src="https://images.unsplash.com/photo-1488459711635-0c002897481a?auto=format&fit=crop&q=80&w=1600" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen"
          alt=""
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold tracking-tight">Spoilage <span className="text-emerald-400">Intelligence</span></h2>
          <p className="text-emerald-100/80 font-bold mt-2">Real-time summaries of batch integrity across the supply network.</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Activity} 
          label="Total Scans" 
          value={stats.totalScans.toString()} 
          unit="UNITS"
          trend="Total tracked batches"
        />
        <StatCard 
          icon={TrendingDown} 
          label="Avg Spoilage" 
          value={stats.avgScore.toString()} 
          unit="/ 10"
          trend="Overall metabolic health"
        />
        <StatCard 
          icon={ShieldAlert} 
          label="Highest Risk Stage" 
          value={stats.highestRiskStage} 
          unit="LOCATION"
          trend="Critical focus point"
          urgent={stats.highestRiskStage !== 'N/A'}
        />
        <StatCard 
          icon={Activity} 
          label="Loss Prevented" 
          value={`₹${(stats.lossPrevented / 1000).toFixed(1)}k`} 
          unit="SAVED"
          trend="Strategic mitigation impact"
        />
      </div>

      <div className="mt-12">
        <SupplyChainMap scans={recentScans} />
      </div>

      <div className="grid grid-cols-1 gap-12 mt-12">
        {/* Spoilage Rate Trend Area Chart */}
        <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Spoilage Rate Trend</h3>
              <p className="text-sm font-bold text-slate-900">Average metabolic degradation velocity (24h period)</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">{label}</p>
                          <p className="text-xl font-black">{payload[0].value}% <span className="text-[10px] uppercase font-bold text-emerald-400 ml-1">Avg Spoilage</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRate)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Network Risk Heatmap */}
        <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Network Risk Heatmap</h3>
              <p className="text-sm font-bold text-slate-900">Intensity of spoilage risk across supply nodes</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Fresh</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-amber-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-rose-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Critical</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-5 gap-4">
                <div /> {/* Top Left Spacer */}
                {LOCATION_TYPES.map(loc => (
                  <div key={loc.type} className="text-center font-black text-[10px] text-slate-400 uppercase tracking-widest pb-4">
                    {loc.label}
                  </div>
                ))}

                {/* Risk Rows */}
                {['High', 'Moderate', 'Fresh'].map((risk) => (
                  <React.Fragment key={risk}>
                    <div className="flex items-center pr-4">
                      <span className={`text-[10px] font-black uppercase tracking-tighter ${
                        risk === 'High' ? 'text-rose-500' : 
                        risk === 'Moderate' ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                        {risk === 'High' ? 'Critical' : risk} Risk
                      </span>
                    </div>
                    {barChartData.map((data, idx) => {
                      const count = data[risk as keyof typeof data] as number;
                      const maxCount = Math.max(...barChartData.map(d => Math.max(d.Fresh, d.Moderate, d.High)));
                      const opacity = count === 0 ? 0.05 : 0.2 + (count / maxCount) * 0.8;
                      
                      const baseColor = risk === 'High' ? 'bg-rose-500' : 
                                      risk === 'Moderate' ? 'bg-amber-500' : 'bg-emerald-500';

                      return (
                        <div 
                          key={`${risk}-${idx}`}
                          className={`aspect-video rounded-2xl flex flex-col items-center justify-center transition-all hover:scale-105 border border-white shadow-sm relative group`}
                          style={{ 
                            backgroundColor: count === 0 ? 'transparent' : undefined,
                          }}
                        >
                          <div 
                            className={`absolute inset-0 rounded-2xl ${baseColor}`} 
                            style={{ opacity }}
                          />
                          <div className="relative z-10 text-center">
                            <span className="text-2xl font-black text-slate-900 group-hover:scale-125 transition-transform">{count}</span>
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 opacity-60 group-hover:opacity-100 italic">Scans</p>
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-50 flex justify-between items-center bg-slate-50/50 -mx-8 px-8 py-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-300" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network Throughput: {(stats.totalScans / 24).toFixed(1)} batches / hr</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-tight text-slate-400">
              <span className="text-emerald-500">{(stats.avgScore * 10).toFixed(0)}% Avg Health</span>
              <span className="opacity-30">|</span>
              <span className="text-rose-500">{stats.highestRiskStage} Critical</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Handoffs List */}
      <div className="mt-12 bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Recent Handoffs</h3>
            <p className="text-sm font-bold text-slate-900">Chain-of-custody biological monitor</p>
          </div>
          <div className="px-4 py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Live Stream
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {recentScans.slice(0, 10).map((scan) => (
            <div key={scan.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${
                  scan.riskLevel === 'High' ? 'bg-rose-50 text-rose-600' :
                  scan.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  <Circle className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{scan.produceType || 'Batch'}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-100 rounded-md">#{scan.id.slice(-4)}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 grayscale opacity-60">
                      <Thermometer className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-600">{scan.temperature || '--'}°C</span>
                    </div>
                    <div className="flex items-center gap-1.5 grayscale opacity-60">
                      <Droplets className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-600">{scan.humidity || '--'}%</span>
                    </div>
                    <div className="flex items-center gap-1.5 grayscale opacity-60">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-600">{(scan.transitHours || '0')}h</span>
                    </div>
                    <div className="flex items-center gap-1.5 grayscale opacity-60">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{scan.location}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-baseline justify-end gap-1">
                  <span className={`text-2xl font-black ${
                    scan.riskLevel === 'High' ? 'text-rose-600' :
                    scan.riskLevel === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {(scan.spoilageScore * 10).toFixed(0)}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Spoil Rate</span>
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300 mt-1">
                  {format(scan.timestamp?.toDate() || new Date(), 'MMM dd, HH:mm')}
                </p>
              </div>
            </div>
          ))}
          {recentScans.length === 0 && (
            <div className="p-12 text-center text-slate-300 text-sm italic font-medium uppercase tracking-widest">
              Awaiting handoff data...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, unit, trend, urgent }: any) {
  return (
    <div className={`bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm relative overflow-hidden group transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg ${urgent ? 'bg-red-50' : 'bg-emerald-50'}`}>
          <Icon className={`w-5 h-5 ${urgent ? 'text-red-500 animate-pulse' : 'text-emerald-600'}`} />
        </div>
        <span className="text-[9px] font-bold uppercase tracking-tight text-slate-400">{trend}</span>
      </div>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-400">{label}</h4>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span>
          <span className="text-[10px] font-mono opacity-30 text-slate-400">{unit}</span>
        </div>
      </div>
    </div>
  );
}

function Badge({ label, active }: { label: string, active?: boolean }) {
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${active ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'border-slate-200 text-slate-400 hover:border-emerald-100 hover:text-emerald-500'}`}>
      {label}
    </span>
  );
}
