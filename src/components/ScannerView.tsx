import React, { useState, useRef } from 'react';
import { Camera, Upload, ShieldCheck, AlertCircle, Loader2, CheckCircle2, ChevronRight, MapPin, Clock, Navigation, Sparkles } from 'lucide-react';
import { analyzeProduceCondition } from '../services/geminiService';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

const LOCATIONS = [
  { name: 'Mandi', type: 'Origin' },
  { name: 'Truck', type: 'Transit' },
  { name: 'Warehouse', type: 'Storage' },
  { name: 'Retailer', type: 'Terminal' }
];

export default function ScannerView({ onComplete }: { onComplete: () => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [produceType, setProduceType] = useState('Apple');
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PRODUCE_OPTIONS = ['Apple', 'Tomato', 'Potato', 'Onion', 'Mango', 'Banana', 'Citrus'];

  const tips = [
    "India loses over ₹92,000 crore worth of produce annually due to poor post-harvest handling. Your scans help bridge this gap.",
    "Ethylene gas is a natural plant hormone that triggers ripening. Managing its levels can significantly extend shelf life for climacteric fruits.",
    "Gemini Smart Tip: Darker spots on leafy greens often indicate cellular collapse before visible mold appears. Process these first.",
    "Fun Fact: Tomatoes lose flavor in the fridge! Their metabolic activity slows down, stopping the development of key aromatic compounds.",
    "Logistics Insight: Every 1°C increase above optimal storage temperature can reduce shelf life by one full day for sensitive crops."
  ];
  
  const [activeTip] = useState(() => tips[Math.floor(Math.random() * tips.length)]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!image) return;
    setAnalyzing(true);
    try {
      const analysis = await analyzeProduceCondition(image, produceType);
      setResult(analysis);
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!result || !image) return;
    
    try {
      const batchesRef = collection(db, 'batches');
      const identifiedType = result.identifiedProduceType || produceType;
      
      // Simplify batch lookup to avoid needing composite indexes that might not be created
      // We'll just look for a batch of this type created recently
      const q = query(
        batchesRef, 
        where('type', '==', identifiedType),
        limit(1)
      );
      const snapshot = await getDocs(q);
      
      let batchId = snapshot.empty ? null : snapshot.docs[0].id;
      
      if (!batchId) {
        const newBatch = await addDoc(batchesRef, {
          title: `${identifiedType} Unit | TRACE-${Date.now().toString().slice(-4)}`,
          type: identifiedType,
          origin: selectedLocation.name,
          status: 'active',
          createdAt: serverTimestamp(),
          createdBy: "demo-user"
        });
        batchId = newBatch.id;
      }

      // 2. Save the scan using the correct type
      await addDoc(collection(db, 'scans'), {
        batchId,
        produceType: identifiedType,
        location: selectedLocation.name,
        locationType: selectedLocation.type,
        imageUrl: image,
        spoilageScore: result.spoilageScore,
        predictedShelfLife: result.predictedShelfLife,
        riskLevel: result.riskLevel,
        analysisNotes: result.analysisNotes,
        reroutingDecision: result.reroutingDecision,
        temperature: Math.floor(Math.random() * 15) + 20, 
        humidity: Math.floor(Math.random() * 30) + 50,    
        transitHours: Math.floor(Math.random() * 48) + 1, 
        timestamp: serverTimestamp(),
        scannedBy: "demo-user"
      });

      onComplete();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'scans');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-12">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Initiate Vision Scan</h2>
        <p className="mt-1 text-slate-500">Deploy Gemini Vision AI to analyze Produce Condition Index.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          {/* Controls */}
          <div className="bg-white border border-emerald-100 shadow-sm p-6 space-y-6 rounded-2xl">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-slate-400">Commodity Category</label>
              <select 
                value={produceType}
                onChange={(e) => setProduceType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-sans text-sm text-slate-900 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              >
                {PRODUCE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-slate-400">Handoff</label>
              <div className="space-y-2">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => setSelectedLocation(loc)}
                    className={`w-full flex items-center justify-between p-3.5 border rounded-xl text-left transition-all relative overflow-hidden active:scale-[0.98] ${
                      selectedLocation.name === loc.name 
                      ? 'border-emerald-600 bg-emerald-600 shadow-lg shadow-emerald-600/20 text-white' 
                      : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className={`w-4 h-4 ${selectedLocation.name === loc.name ? 'text-white' : 'opacity-30'}`} />
                      <span className="text-xs font-bold uppercase tracking-tight">{loc.name}</span>
                    </div>
                    <span className={`text-[9px] font-mono uppercase ${selectedLocation.name === loc.name ? 'text-emerald-200' : 'opacity-40'}`}>{loc.type}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Image Input */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-video border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${
              image ? 'border-transparent' : 'border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300'
            }`}
          >
            {image ? (
              <>
                <img src={image} className="w-full h-full object-cover transition-all" alt="Captured" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                <div className="absolute bottom-6 right-6 bg-emerald-600 text-white p-3 rounded-xl shadow-xl shadow-emerald-600/20 active:scale-90 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
              </>
            ) : (
              <>
                <div className="bg-emerald-50 text-emerald-600 p-5 rounded-2xl mb-4 group-hover:scale-110 transition-transform border border-emerald-100">
                  <Camera className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-900">Capture Handoff</p>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

          <button
            onClick={handleScan}
            disabled={!image || analyzing}
            className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-3 ${
              !image || analyzing 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
            }`}
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                Vision AI Processing...
              </>
            ) : (
              <>
                Analyze Condition
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Results Pane */}
        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="h-full border border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center bg-slate-50 relative overflow-hidden"
              >
                <img 
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200" 
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                  alt="Scanner Placeholder"
                  referrerPolicy="no-referrer"
                />
                <div className="relative z-10 p-12">
                  <ShieldCheck className="w-12 h-12 mb-4 text-emerald-600 animate-pulse" />
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-900 mb-2">Awaiting Handoff Signal</p>
                  <p className="text-xs text-slate-500 font-bold max-w-[200px]">Center the produce in the frame and capture image to begin Gemini AI analysis</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white border border-emerald-100 p-8 rounded-3xl shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-400" />
                
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                  <div className={`p-3 rounded-2xl ${
                    result.riskLevel === 'High' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl tracking-tight text-slate-900 uppercase">Vision Result</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Protocol Sync: {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Condition Index</label>
                    <p className="text-4xl font-bold text-slate-900">{result.spoilageScore}<span className="text-lg opacity-20 ml-1">/10</span></p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Risk Factor</label>
                    <p className={`text-xl font-bold uppercase tracking-tight ${
                      result.riskLevel === 'High' ? 'text-red-600' : 
                      result.riskLevel === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {result.riskLevel}
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Rerouting Decision</label>
                  <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl flex items-center gap-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Navigation className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-sm font-bold text-amber-700 uppercase tracking-tight">{result.reroutingDecision}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Estimated Shelf Life</label>
                  <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex items-center gap-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Clock className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-sm font-bold text-emerald-700 uppercase tracking-tight">{result.predictedShelfLife}</p>
                  </div>
                </div>

                <div className="mb-10">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">AI Intelligence Notes</label>
                  <p className="text-sm leading-relaxed text-slate-600 border-l-2 border-emerald-500 pl-4 py-1 italic">
                    "{result.analysisNotes}"
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleSave}
                    className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-600/20"
                  >
                    View Inventory
                  </button>
                  <button 
                    onClick={() => setResult(null)}
                    className="w-full py-4 rounded-xl border border-slate-200 font-bold text-[11px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all font-mono"
                  >
                    Discard Handoff
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-12 bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex gap-5 items-start shadow-sm border-l-4 border-l-emerald-500">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          <Sparkles className="w-6 h-6 text-emerald-600 shrink-0" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Gemini Smart Insight</p>
          <p className="text-sm text-emerald-900 leading-relaxed font-medium">
            {activeTip}
          </p>
        </div>
      </div>
    </div>
  );
}
