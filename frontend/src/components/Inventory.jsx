import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  Boxes, Search, Warehouse, Eye, Lock, ArrowUpRight, 
  Plus, Check, AlertTriangle, Cpu, AlertCircle 
} from 'lucide-react';

export default function Inventory() {
  const [inventories, setInventories] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Manual Reservation state
  const [showDrawer, setShowDrawer] = useState(false);
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const [invResp, prResp, whResp] = await Promise.all([
        api.get('/api/inventory'),
        api.get('/api/products'),
        api.get('/api/warehouses')
      ]);
      setInventories(invResp.data);
      setProducts(prResp.data);
      setWarehouses(whResp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleManualReserve = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!productId || !warehouseId || quantity <= 0) {
      setErrorMsg('Complete product, depot and quantities parameters.');
      return;
    }

    const payload = {
      productId: parseInt(productId),
      warehouseId: parseInt(warehouseId),
      quantity: parseInt(quantity)
    };

    try {
      await api.post('/api/reservations/reserve', payload);
      setShowDrawer(false);
      fetchInventory();
      alert('Physical Stock units locked and reserved successfully!');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Insufficient stock to lock units.');
    }
  };

  // Searching
  const filtered = inventories.filter(item => {
    const term = searchQuery.toLowerCase();
    return (
      item.productName?.toLowerCase().includes(term) ||
      item.productSku?.toLowerCase().includes(term) ||
      item.warehouseName?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-8 space-y-6 relative min-h-[calc(100vh-5rem)]">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Stock Allocation Hub</h2>
          <p className="text-slate-400 text-sm mt-1">Audit active warehouse quantities, manual stock reservations, and threshold ratios</p>
        </div>

        <button 
          onClick={() => {
            setProductId('');
            setWarehouseId('');
            setQuantity(1);
            setErrorMsg('');
            setShowDrawer(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-indigo-600/10 self-start"
        >
          <Lock size={14} />
          Lock Reserve Stock
        </button>
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-850 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs font-semibold"
          placeholder="Filter allocations by product, SKU, or depot code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Main Grid allocations */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs font-bold uppercase">Auditing security ledgers...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500 uppercase font-black text-xs">
              No inventory holdings matched filter criteria.
            </div>
          ) : (
            filtered.map((item) => {
              const capAvailable = item.quantityOnHand - item.quantityReserved;
              const ratio = item.quantityOnHand > 0 ? (capAvailable / item.quantityOnHand) * 100 : 0;
              const isBelowThreshold = item.quantityOnHand <= (item.lowStockThreshold || 0);

              return (
                <div key={item.id} className={`glass-card p-6 rounded-3xl relative overflow-hidden group border-t-2 ${
                  isBelowThreshold ? 'border-rose-500' : 'border-indigo-500'
                }`}>
                  {/* Backdrop details */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-extrabold text-white text-sm group-hover:text-indigo-400 transition-colors uppercase leading-snug">
                        {item.productName}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono font-bold mt-1 uppercase">SKU: {item.productSku}</p>
                    </div>

                    {isBelowThreshold && (
                      <div className="p-1 px-2.5 bg-rose-500/10 text-rose-400 rounded-lg text-[9px] font-black uppercase tracking-wider border border-rose-500/20 flex items-center gap-1">
                        <AlertTriangle size={10} className="shrink-0" />
                        LOW
                      </div>
                    )}
                  </div>

                  {/* Warehouse destination info tag */}
                  <div className="flex items-center gap-2 mt-4 text-[10px] text-slate-400 font-extrabold uppercase bg-slate-950/20 p-2.5 rounded-xl border border-slate-900">
                    <Warehouse size={12} className="text-slate-500" />
                    <span>Depot: {item.warehouseName}</span>
                  </div>

                  {/* Quantity distributions metrics */}
                  <div className="grid grid-cols-3 gap-2 mt-5 text-center bg-slate-950/40 p-4 border border-slate-900 rounded-2xl">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-black block">On Hand</span>
                      <span className="text-sm font-black text-white block mt-0.5">{item.quantityOnHand}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-black block">Reserved</span>
                      <span className="text-sm font-black text-amber-400 block mt-0.5">{item.quantityReserved}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-black block text-indigo-400">Available</span>
                      <span className="text-sm font-black text-indigo-400 text-glow-indigo block mt-0.5">{capAvailable}</span>
                    </div>
                  </div>

                  {/* Ratio capacity bar indicator */}
                  <div className="space-y-1.5 mt-5">
                    <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase">
                      <span>Available stock ratio</span>
                      <span className="font-mono text-white">{ratio.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          ratio < 30 ? 'bg-rose-500' : ratio < 70 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`} 
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Manual Reserve Side Drawer overlay */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={() => setShowDrawer(false)} />

          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md transform transition-all duration-300 slide-in-from-right glass-panel p-8 flex flex-col border-l border-slate-850 justify-between">
              
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-md font-black text-white uppercase tracking-wider">Manual Stock Lock</h3>
                  <p className="text-slate-400 text-xxs mt-0.5 font-bold">Lock quantities for outbound delivery safety</p>
                </div>
                <button 
                  onClick={() => setShowDrawer(false)}
                  className="p-1 px-2.5 bg-slate-900 hover:text-white border border-slate-850 rounded-lg transition-colors cursor-pointer text-xs"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleManualReserve} className="flex-1 mt-8 space-y-6 text-xs font-bold text-slate-400">
                {errorMsg && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl flex items-start gap-2">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider">Catalog Product SKU</label>
                  <select
                    required
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-850 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                  >
                    <option value="">-- Select SKU Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider">Depot Warehouse Location</label>
                  <select
                    required
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-850 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-indigo-505 focus:border-indigo-500"
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                  >
                    <option value="">-- Select Destination Depot --</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider">Required Lock Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 50"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-850 rounded-xl text-white text-center focus:outline-none focus:border-indigo-500 font-mono text-sm"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-900/80">
                  <button
                    type="button"
                    onClick={() => setShowDrawer(false)}
                    className="px-5 py-2.5 bg-slate-900 border border-slate-850 text-slate-400 hover:text-white rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white cursor-pointer shadow-md shadow-indigo-600/10"
                  >
                    Submit Lock
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
