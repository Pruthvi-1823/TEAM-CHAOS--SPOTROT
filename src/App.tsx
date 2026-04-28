import React, { useState } from 'react';
import { Navigation, Camera, LayoutDashboard, Package, LogOut, Loader2, AlertTriangle, User as UserIcon, ShieldAlert, Leaf, Sparkles } from 'lucide-react';
import DashboardView from './components/DashboardView';
import ScannerView from './components/ScannerView';
import BatchListView from './components/BatchListView';
import OverviewView from './components/OverviewView';
import PredictView from './components/PredictView';
import { motion, AnimatePresence } from 'motion/react';

type View = 'overview' | 'dashboard' | 'scanner' | 'batches' | 'predict';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('batches');

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

        <div className="p-6 border-t border-emerald-50 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Operational</p>
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
