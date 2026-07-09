import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Boxes, 
  Warehouse, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  ArrowLeftRight,
  ShieldAlert,
  Terminal,
  Activity
} from 'lucide-react';

export default function Sidebar({ active, setView, role }) {
  // Live server status mocking
  const [load, setLoad] = useState(1.4);
  const [activeThreads, setActiveThreads] = useState(8);

  useEffect(() => {
    const timer = setInterval(() => {
      setLoad((1.1 + Math.random() * 0.8).toFixed(2));
      setActiveThreads(8 + Math.floor(Math.random() * 5));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Intel', icon: LayoutDashboard },
    { id: 'products', label: 'Products master', icon: Package },
    { id: 'inventory', label: 'Stock Depot', icon: Boxes },
    { id: 'warehouses', label: 'Warehouses', icon: Warehouse },
    { id: 'suppliers', label: 'Supplier Hub', icon: Users },
    { id: 'sales-orders', label: 'Outbound SO', icon: ShoppingCart },
    { id: 'purchase-orders', label: 'Inbound PO', icon: TrendingUp },
    { id: 'transfers', label: 'Stock Transfers', icon: ArrowLeftRight },
  ];

  return (
    <aside className="w-64 border-r border-slate-900 bg-slate-950/70 backdrop-blur-xl flex flex-col h-screen sticky top-0 font-sans z-50">
      
      {/* Brand Logo Header */}
      <div className="p-6 border-b border-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-extrabold text-[15px] shadow-lg shadow-indigo-600/20">
            SP
          </div>
          <div>
            <span className="font-extrabold text-[17px] tracking-tight text-white block">
              StockPilot<span className="text-indigo-400">.</span>
            </span>
          </div>
        </div>
      </div>

      {/* Terminal Profile tag */}
      <div className="m-4 mx-5 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/85">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-950/80 ring-1 ring-indigo-500/20 flex items-center justify-center text-indigo-400 animate-pulse">
            <Terminal size={15} />
          </div>
          <div>
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Status Center</div>
            <div className="text-xs font-black text-slate-100 flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulsing-orb" />
              <span>{role === 'ADMIN' ? 'SYS_ADMIN' : 'STAFF_LEDGER'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation menu list */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all group relative cursor-pointer ${
                isActive
                  ? 'bg-slate-900/80 border-l border-indigo-500 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-900/30 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon 
                  size={16} 
                  className={`transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-350'}`} 
                />
                <span>{item.label}</span>
              </div>
              
              {/* Subtle side dot */}
              {isActive && (
                <span className="w-1 h-3 rounded-full bg-indigo-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Mock Live Server System Statistics (looks very high-end details!) */}
      <div className="px-5 py-4 border-t border-slate-900/80 space-y-2 text-[10px] select-none text-slate-500 font-semibold bg-slate-950/20">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Activity size={10} className="text-indigo-400" />
            SYS LOAD
          </span>
          <span className="font-mono text-white font-bold">{load}ms</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Terminal size={10} className="text-indigo-400" />
            WORKERS
          </span>
          <span className="font-mono text-white font-bold">{activeThreads} active</span>
        </div>
      </div>
    </aside>
  );
}
