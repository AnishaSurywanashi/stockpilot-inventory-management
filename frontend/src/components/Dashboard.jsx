import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, Boxes, Warehouse, ShoppingCart, 
  AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw, Cpu, Database, ShieldAlert, Activity
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [ordersHistory, setOrdersHistory] = useState([]);
  const [stockLevels, setStockLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Widget parameters
  const [chartMode, setChartMode] = useState('both'); // both, value, volume

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const [statsResp, historyResp, levelResp] = await Promise.all([
        api.get('/api/dashboard/stats'),
        api.get('/api/dashboard/orders-history'),
        api.get('/api/dashboard/stock-levels')
      ]);
      setStats(statsResp.data);
      setOrdersHistory(historyResp.data);
      setStockLevels(levelResp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const COLORS = ['#6366f1', '#a855f7', '#fb923c', '#f43f5e', '#10b981'];

  // Custom tooltips to blend seamlessly with glassmorphism
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-4 rounded-xl text-xs space-y-1 bg-slate-950/95 border-slate-800">
          <p className="font-extrabold text-white text-[10px] uppercase tracking-wider">{label}</p>
          {payload.map((p, idx) => (
            <p key={idx} className="font-bold" style={{ color: p.color }}>
              {p.name}: <span className="font-extrabold text-white font-mono">{p.value.toLocaleString()}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse text-xs text-slate-500 font-bold">
        Checking telemetry telemetry feeds...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">System Telemetry Log</h2>
          <p className="text-slate-400 text-sm mt-1">Real-time status indexes of stock holdings, order volumes, and low threshold exceptions across terminals</p>
        </div>
        <button 
          onClick={fetchDashboardStats} 
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white rounded-xl border border-slate-800 hover:border-slate-700 transition-all text-xs font-bold cursor-pointer"
        >
          <RefreshCw size={13} className="animate-[spin_10s_linear_infinite]" />
          Synchronize Feeds
        </button>
      </div>

      {/* Upper stats row indicators (Innovative glass telemetry cards!) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1 */}
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden group border-t-2 border-indigo-500">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Stock Valuation</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-black text-white font-mono tracking-tight text-glow-indigo">
              ${stats?.totalValuation?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </h3>
            <span className="text-[9px] font-bold text-indigo-400 flex items-center gap-1 mt-1 leading-none">
              <Activity size={10} className="animate-pulse" /> Live Telemetry
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden group border-t-2 border-purple-500">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Holdings Quantity</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <Database size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-black text-white font-mono tracking-tight text-glow-purple">
              {stats?.totalItemsCount?.toLocaleString() || '0'}
            </h3>
            <span className="text-[9px] font-bold text-purple-400 block mt-1 leading-none">Total units in vaults</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden group border-t-2 border-emerald-500">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Active Vaults</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-black text-white font-mono tracking-tight text-glow-emerald">
              {stats?.warehousesCount || 0}
            </h3>
            <span className="text-[9px] font-bold text-emerald-400 block mt-1 leading-none">Depot stations online</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden group border-t-2 border-rose-500">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-all" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Exceptions Flag</span>
            <div className={`p-2 rounded-xl ${stats?.lowStockAlertsCount > 0 ? 'bg-rose-500/15 text-rose-400' : 'bg-slate-900 text-slate-500'}`}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-black text-white font-mono tracking-tight text-glow-rose">
              {stats?.lowStockAlertsCount || 0}
            </h3>
            <span className={`text-[9px] font-bold block mt-1 leading-none ${
              stats?.lowStockAlertsCount > 0 ? 'text-rose-400' : 'text-slate-500'
            }`}>
              {stats?.lowStockAlertsCount > 0 ? 'Low Stock Threshold Breached' : 'Safety limits stable'}
            </span>
          </div>
        </div>

      </div>

      {/* Grid Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Core Line Chart representing Order values */}
        <div className="glass-panel p-6 rounded-3xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Outbound Order Logs</h4>
              <p className="text-slate-400 text-xxs mt-0.5 font-semibold">Weekly tracking of sales volume velocity</p>
            </div>
            
            <div className="flex gap-2">
              {['both', 'value', 'volume'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setChartMode(mode)}
                  className={`px-3 py-1.5 rounded-lg border text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                    chartMode === mode 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10'
                      : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="h-80 w-full font-mono text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ordersHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="glowVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="date" stroke="#64748b" tickLine={false} />
                <YAxis stroke="#64748b" tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                
                {(chartMode === 'both' || chartMode === 'value') && (
                  <Line 
                    type="monotone" 
                    name="Trade Value ($)"
                    dataKey="totalValue" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', strokeWidth: 1 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                )}

                {(chartMode === 'both' || chartMode === 'volume') && (
                  <Line 
                    type="monotone" 
                    name="Orders Count"
                    dataKey="count" 
                    stroke="#a855f7" 
                    strokeWidth={3}
                    dot={{ fill: '#a855f7', strokeWidth: 1 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High-end Pie/Donut Chart mapping low-stock alerts */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider font-sans">Stock distribution</h4>
            <p className="text-slate-400 text-xxs mt-0.5 font-semibold">Warehouse inventory allocations</p>
          </div>

          <div className="h-64 w-full relative flex items-center justify-center font-mono">
            {stockLevels.length === 0 ? (
              <div className="text-slate-500 text-xxs uppercase font-extrabold text-center font-sans">No stock records yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockLevels}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="quantityOnHand"
                    nameKey="productName"
                  >
                    {stockLevels.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#090d16" strokeWidth={1} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {/* Center Absolute statistics */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <Cpu size={16} className="text-indigo-400 animate-pulse" />
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black mt-1">CAPACITY</span>
              <span className="text-md font-extrabold text-white mt-0.5">{stats?.totalItemsOnHand || 0}</span>
            </div>
          </div>

          {/* Simple legends */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-2 border-t border-slate-900 max-h-24 overflow-y-auto no-scrollbar font-sans font-bold">
            {stockLevels.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="truncate" title={entry.productName}>{entry.productName}</span>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
