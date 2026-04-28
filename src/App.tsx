import React, { useState, useEffect } from 'react';
import { auth, signIn, signOut } from './lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { Navigation, Camera, LayoutDashboard, Package, LogOut, Loader2, AlertTriangle, User as UserIcon, ShieldAlert, Leaf, Sparkles } from 'lucide-react';
import DashboardView from './components/DashboardView';
import ScannerView from './components/ScannerView';
import BatchListView from './components/BatchListView';
import OverviewView from './components/OverviewView';
import PredictView from './components/PredictView';
import { motion, AnimatePresence } from 'motion/react';

type View = 'overview' | 'dashboard' | 'scanner' | 'batches' | 'predict';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('overview');

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F5] font-sans">
        <Loader2 className="w-12 h-12 text-[#141414] animate-spin mb-4" />
        <p className="text-sm font-mono tracking-tighter uppercase opacity-50">Initializing SpotRot System...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                <Leaf className="w-4 h-4 fill-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 underline decoration-emerald-500 decoration-2 underline-offset-4">SpotRot</span>
            </div>
            <button 
              onClick={signIn}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-600 transition-all active:scale-95 shadow-xl shadow-slate-900/10"
            >
              System Login
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-40 pb-24 px-6 min-h-[80vh] flex items-center">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-6 border border-emerald-100">
                <ShieldAlert className="w-4 h-4" />
                Supply Chain Security Protocol
              </div>
              <h1 className="text-6xl lg:text-8xl font-extrabold tracking-tight leading-[0.95] mb-8 text-slate-950">
                Eliminate <span className="text-emerald-600 italic">Spoilage</span> Before It Strikes.
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-12">
                India loses <span className="font-bold text-slate-900">₹92,000 crore</span> in produce annually. SpotRot uses Gemini Vision AI to track, score, and reroute batches at every handoff point.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button 
                  onClick={signIn}
                  className="bg-emerald-600 text-white px-12 py-6 rounded-[2rem] font-bold text-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-emerald-600/30 active:scale-95"
                >
                  <UserIcon className="w-6 h-6" />
                  View Inventory
                </button>
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm">
                    <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-0.5">Global Presence</p>
                    <p className="text-xs text-slate-500 font-bold">Active in Mumbai, Delhi, Nasik, Bangalore Hubs</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center text-white">
                <Leaf className="w-3.5 h-3.5 fill-white" />
              </div>
              <span className="font-bold tracking-tight text-slate-900">SpotRot</span>
            </div>
            <p className="text-sm text-slate-500">© 2024 Intelligent Commodity Condition Tracker. Reducing Post-Harvest Loss.</p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-slate-400 hover:text-emerald-600 transition-colors">Vision API Documentation</a>
              <a href="#" className="text-sm text-slate-400 hover:text-emerald-600 transition-colors">Supply Protocol</a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col md:flex-row font-sans">
      <div className="mesh-gradient">
        <div className="mesh-gradient-1" />
        <div className="mesh-gradient-2" />
      </div>

      {/* Sidebar navigation */}
      <nav className="w-full md:w-64 frosted flex flex-col z-50 md:h-screen sticky top-0 border-r border-emerald-100">
        <div className="p-8 border-b border-emerald-50 flex flex-col items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
              <Leaf className="w-5 h-5 fill-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">SpotRot</h1>
          </div>
        </div>

        <div className="flex-1 py-12 px-4 space-y-2">
          <NavItem 
            icon={ShieldAlert} 
            label="Overview" 
            isActive={currentView === 'overview'} 
            onClick={() => setCurrentView('overview')} 
          />
          <NavItem 
            icon={Camera} 
            label="Vision Scan" 
            isActive={currentView === 'scanner'} 
            onClick={() => setCurrentView('scanner')} 
          />
          <NavItem 
            icon={Sparkles} 
            label="Predict" 
            isActive={currentView === 'predict'} 
            onClick={() => setCurrentView('predict')} 
          />
          <NavItem 
            icon={Package} 
            label="Inventory" 
            isActive={currentView === 'batches'} 
            onClick={() => setCurrentView('batches')} 
          />
          <NavItem 
            icon={LayoutDashboard} 
            label="Analytics" 
            isActive={currentView === 'dashboard'} 
            onClick={() => setCurrentView('dashboard')} 
          />
        </div>

        <div className="p-6 border-t border-emerald-50">


          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <img src={user.photoURL || ''} className="w-8 h-8 rounded-lg border border-slate-200" alt="Avatar" />
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold text-slate-900 truncate w-24">{user.displayName}</p>
                <p className="text-[8px] text-slate-400 truncate w-24 uppercase tracking-tighter">{user.email}</p>
              </div>
            </div>
            <button onClick={signOut} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-8 md:p-12"
          >
            {currentView === 'overview' && <OverviewView />}
            {currentView === 'dashboard' && <DashboardView />}
            {currentView === 'scanner' && <ScannerView onComplete={() => setCurrentView('batches')} />}
            {currentView === 'batches' && <BatchListView />}
            {currentView === 'predict' && <PredictView />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, isActive, onClick }: { icon: any, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all relative overflow-hidden group ${
        isActive ? 'bg-emerald-600 shadow-lg shadow-emerald-600/20 text-white' : 'text-slate-500 hover:bg-emerald-50'
      }`}
    >
      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-emerald-600'}`} />
      <span className="text-sm font-black">{label}</span>
      {isActive && (
        <motion.div 
          layoutId="nav-glow"
          className="absolute inset-0 bg-white/10 blur-xl -z-10"
        />
      )}
    </button>
  );
}
