import React, { useState } from 'react';
import { Thermometer, Droplets, Clock, MapPin, Leaf, Sparkles, Loader2, AlertCircle, TrendingDown, DollarSign, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { predictSpoilage } from '../services/geminiService';

export default function PredictView() {
  const [formData, setFormData] = useState({
    cropType: 'Tomato',
    handoffPoint: 'Warehouse',
    temperature: 28,
    humidity: 65,
    hoursInTransit: 12
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    spoilageRate: number;
    estimatedLoss: string;
    riskLevel: string;
    decision: string;
    biologicalInsight: string;
  } | null>(null);

  const CROP_TYPES = ['Tomato', 'Potato', 'Onion', 'Mango', 'Banana', 'Leafy Greens', 'Citrus'];
  const HANDOFF_POINTS = ['Mandi', 'Truck', 'Warehouse', 'Retailer'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const prediction = await predictSpoilage(formData);
      setResult(prediction);
    } catch (error) {
      console.error(error);
      alert('Failed to generate prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-12">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">Integrity <span className="text-emerald-600">Forecasting</span></h2>
        <p className="text-slate-600 font-bold max-w-xl">
          Simulate supply chain conditions to predict potential value loss before it happens. Powered by Gemini Multimodal Analysis.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden"
        >
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100/50 rounded-xl">
                <Leaf className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-900">Condition Parameters</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-1">Crop Type</label>
                <select 
                  value={formData.cropType}
                  onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                >
                  {CROP_TYPES.map(crop => <option key={crop} value={crop}>{crop}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-1">Handoff Point</label>
                <select 
                  value={formData.handoffPoint}
                  onChange={(e) => setFormData({ ...formData, handoffPoint: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                >
                  {HANDOFF_POINTS.map(point => <option key={point} value={point}>{point}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Thermometer className="w-3 h-3" /> Temperature (°C)
                  </label>
                  <span className="text-xs font-bold text-emerald-600 font-mono">{formData.temperature}°C</span>
                </div>
                <input 
                  type="range" min="0" max="50"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Droplets className="w-3 h-3" /> Humidity (%)
                  </label>
                  <span className="text-xs font-bold text-emerald-600 font-mono">{formData.humidity}%</span>
                </div>
                <input 
                  type="range" min="0" max="100"
                  value={formData.humidity}
                  onChange={(e) => setFormData({ ...formData, humidity: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Hours In Transit
                  </label>
                  <span className="text-xs font-bold text-emerald-600 font-mono">{formData.hoursInTransit}h</span>
                </div>
                <input 
                  type="range" min="0" max="72"
                  value={formData.hoursInTransit}
                  onChange={(e) => setFormData({ ...formData, hoursInTransit: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-xl shadow-slate-900/10 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Generate Forecast
            </button>
          </form>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-[2.5rem] border border-slate-200 overflow-hidden relative"
              >
                <img 
                  src="https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&q=80&w=1200" 
                  className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-soft-light"
                  alt="Prediction Placeholder"
                  referrerPolicy="no-referrer"
                />
                <div className="relative z-10 p-12">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 mx-auto shadow-sm">
                    <Sparkles className="w-10 h-10 text-emerald-600/40" />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 leading-relaxed max-w-[200px]">
                    Adjust parameters and click generate to run the biological simulation
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Exposure Score</p>
                      <h3 className="text-4xl font-black text-slate-900">{result.spoilageRate}% <span className="text-sm font-bold text-slate-400 align-top tracking-tighter">Risk</span></h3>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                      result.riskLevel.toLowerCase() === 'high' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      result.riskLevel.toLowerCase() === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {result.riskLevel} Risk
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Estimated Loss</p>
                      </div>
                      <p className="text-lg font-black text-slate-900">{result.estimatedLoss}</p>
                    </div>
                    <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-700">Immediate Action</p>
                      </div>
                      <p className="text-xs font-bold text-emerald-900 leading-tight uppercase tracking-tight">{result.decision}</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 text-white p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Biological Insight</p>
                    </div>
                    <p className="text-sm leading-relaxed font-medium opacity-90 italic">
                      "{result.biologicalInsight}"
                    </p>
                  </div>
                </div>


              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
