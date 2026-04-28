import React from 'react';
import { ShieldCheck, Zap, BarChart3, MapPin, Search } from 'lucide-react';
import { motion } from 'motion/react';

export default function OverviewView() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="mb-16 relative overflow-hidden rounded-[2.5rem] bg-emerald-900 aspect-[21/9] flex items-center p-8 md:p-16">
        <img 
          src="https://images.unsplash.com/photo-1518843875459-f738682238a6?q=80&w=1600" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay scale-110"
          alt="Fresh Produce"
          referrerPolicy="no-referrer"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            SpotRot: The Future of <br/>
            <span className="text-emerald-400 italic">Produce Intelligence.</span>
          </h2>
          <p className="mt-6 text-xl text-emerald-50/90 leading-relaxed max-w-2xl font-bold">
            SpotRot is an intelligent commodity condition tracker designed to eliminate post-harvest losses using Computer Vision and Predictive AI.
          </p>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <InfoCard 
          icon={ShieldCheck}
          image="https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=800"
          title="Vision Handoff"
          desc="Using Gemini 1.5 Flash Vision API, SpotRot analyzes produce batches at every handoff point (Farms, Warehouses, Transit) to detect early signs of spoilage."
        />
        <InfoCard 
          icon={Zap}
          image="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800"
          title="Predictive Rerouting"
          desc="AI predicts remaining shelf-life in real-time. If a batch is at risk, the system suggests immediate rerouting to closer markets, saving kilos of produce."
        />
        <InfoCard 
          icon={BarChart3}
          image="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800"
          title="Network Leakage Insights"
          desc="Gain full visibility into exactly where spoilage occurs in your supply chain. Identify high-risk nodes and improve infrastructure."
        />
        <InfoCard 
          icon={Search}
          image="https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?q=80&w=800"
          title="Automated Scoring"
          desc="Standardize quality control across your network. Every batch gets a Produce Condition Index (PCI) score from 0-10, ensuring trust."
        />
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl -ml-20 -mt-20 opacity-50" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-emerald-800 mb-6 flex items-center justify-center gap-3">
            <MapPin className="w-6 h-6" />
            The SpotRot Mission
          </h3>
          <p className="text-lg text-emerald-900/70 leading-relaxed font-medium">
            India loses over ₹92,000 crore in produce annually. By digitizing the handoff points and providing objective AI analysis, SpotRot empowers logistics managers to make data-driven decisions that reduce waste, increase farmer revenue, and ensure food security.
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, desc, image }: any) {
  return (
    <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 -mr-12 -mt-12 bg-emerald-50 rounded-full blur-3xl group-hover:bg-emerald-100 transition-colors" />
      
      {image && (
        <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-1000 pointer-events-none">
          <img src={image} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" alt="background" referrerPolicy="no-referrer" />
        </div>
      )}

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {image && (
            <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden shrink-0 border border-slate-100 shadow-md transition-all duration-500 group-hover:scale-105 group-hover:rotate-2">
              <img src={image} className="w-full h-full object-cover" alt={title} referrerPolicy="no-referrer" />
            </div>
          )}
          <div className="flex-1">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
              <Icon className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-3">{title}</h4>
            <p className="text-sm text-slate-600 leading-relaxed font-bold">{desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
