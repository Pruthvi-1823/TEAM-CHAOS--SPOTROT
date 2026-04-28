import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Batch, Scan } from '../types';
import { format } from 'date-fns';
import { Package, MapPin, ChevronRight, History, Shield, Info, ArrowUpRight, Navigation, Sparkles, Loader2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function BatchListView() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch directly from scans collection to show a global history timeline
    const q = query(collection(db, 'scans'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setScans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scan)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'scans');
    });
    return unsubscribe;
  }, []);

  const getProduceIcon = (type: string) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('apple')) return '🍎';
    if (t.includes('tomato')) return '🍅';
    if (t.includes('potato')) return '🥔';
    if (t.includes('onion')) return '🧅';
    if (t.includes('mango')) return '🥭';
    if (t.includes('banana')) return '🍌';
    if (t.includes('citrus') || t.includes('orange') || t.includes('lemon')) return '🍋';
    return '📦';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Scanned Inventory Ledger</h2>
          <p className="mt-2 text-slate-500 font-bold uppercase text-[11px] tracking-[0.2em] flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Real-time Global Supply Chain History • {scans.length} Entries
          </p>
        </div>
        <div className="flex items-center gap-4 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
          <History className="w-5 h-5 text-emerald-600" />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800">System Status</p>
            <p className="text-xs font-bold text-emerald-600">Active Monitoring</p>
          </div>
        </div>
      </header>

      <div className="space-y-8">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto mb-4" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accessing Secure Ledger...</p>
            </div>
          ) : scans.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 border-2 border-slate-100 border-dashed rounded-[3rem] text-center"
            >
              <Package className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-slate-400 uppercase tracking-tight">No Inventory Data Detected</h3>
              <p className="text-xs text-slate-400 mt-2">Start a new scan to begin tracking biological integrity.</p>
            </motion.div>
          ) : (
            scans.map((scan, idx) => (
              <motion.div 
                key={scan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-slate-100 rounded-[2.5rem] grid grid-cols-1 lg:grid-cols-12 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all group"
              >
                {/* Column 1: Metadata & Icons */}
                <div className="lg:col-span-3 bg-slate-50/50 p-8 flex flex-col justify-between border-r border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl bg-white w-16 h-16 rounded-3xl flex items-center justify-center shadow-sm border border-slate-100">
                      {getProduceIcon(scan.produceType)}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Commodity Type</p>
                      <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter">{scan.produceType}</h4>
                    </div>
                  </div>
                  
                  <div className="mt-8 space-y-4">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Time Captured</p>
                      <p className="text-xs font-bold text-slate-900">{format(scan.timestamp?.toDate() || new Date(), 'dd MMM yyyy • HH:mm')}</p>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-slate-100">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Traceability ID</p>
                      <code className="text-[10px] font-mono text-emerald-600 font-bold">#{scan.id.slice(-12).toUpperCase()}</code>
                    </div>
                  </div>
                </div>
                
                {/* Column 2: Analysis Result */}
                <div className="lg:col-span-9 p-8 flex flex-col md:flex-row gap-10">
                  <div className="relative w-full md:w-48 aspect-square rounded-[2rem] border border-slate-200 overflow-hidden shadow-inner bg-slate-100 group-hover:border-emerald-400 transition-all">
                    <img src={scan.imageUrl} className="w-full h-full object-cover" alt="Scan" referrerPolicy="no-referrer" />
                    <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-tighter shadow-lg backdrop-blur-md border ${
                      scan.riskLevel === 'High' ? 'bg-red-500/90 text-white border-red-400' : 
                      scan.riskLevel === 'Medium' ? 'bg-amber-400/90 text-slate-900 border-amber-300' : 'bg-emerald-500/90 text-white border-emerald-400'
                    }`}>
                      {scan.riskLevel} Risk
                    </div>
                  </div>

                  <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-slate-900">
                          <div className="p-2 bg-emerald-50 rounded-xl">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <h5 className="font-black text-base uppercase tracking-tighter">{scan.location}</h5>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{scan.locationType} Node</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right bg-slate-950 text-white px-6 py-3 rounded-3xl border border-slate-800 shadow-2xl">
                        <p className="text-3xl font-black text-emerald-400 leading-none">{scan.spoilageScore.toFixed(1)}<span className="text-xs text-slate-500 ml-1 font-bold">/10</span></p>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Integrity Score</p>
                      </div>
                    </div>
                    
                    {scan.reroutingDecision && (
                      <div className="flex items-center gap-3 px-5 py-3 bg-white border-2 border-emerald-100 rounded-2xl shadow-sm">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">AI Deployment Decision: <span className="text-emerald-700">{scan.reroutingDecision}</span></span>
                      </div>
                    )}
                    
                    <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100 relative group-hover:bg-white transition-all">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="w-4 h-4 text-emerald-600" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Multimodal Intelligence Report</p>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-600 font-medium">"{scan.analysisNotes}"</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.1em]">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        Shelf Life: {scan.predictedShelfLife}
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.1em]">
                        <Shield className="w-3.5 h-3.5" />
                        Biological Verified
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
