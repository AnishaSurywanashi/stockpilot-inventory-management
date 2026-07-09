import React, { useState, useEffect } from 'react';
import api from '../api';
import { ArrowLeftRight, Plus, AlertCircle, RefreshCw, Cpu, HelpCircle } from 'lucide-react';

export default function Transfers({ role }) {
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showDrawer, setShowDrawer] = useState(false);
  const [fromWarehouseId, setFromWarehouseId] = useState('');
  const [toWarehouseId, setToWarehouseId] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1 }]);
  const [errorStatus, setErrorStatus] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [trResp, prResp, whResp] = await Promise.all([
        api.get('/api/transfers'),
        api.get('/api/products'),
        api.get('/api/warehouses')
      ]);
      setTransfers(trResp.data || []);
      setProducts(prResp.data);
      setWarehouses(whResp.data);
    } catch (err) {
      console.warn('GET transfers not found or disabled, displaying transaction portal.', err);
      try {
        const [prResp, whResp] = await Promise.all([
          api.get('/api/products'),
          api.get('/api/warehouses')
        ]);
        setProducts(prResp.data);
        setWarehouses(whResp.data);
      } catch (e) {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddDrawer = () => {
    setFromWarehouseId('');
    setToWarehouseId('');
    setItems([{ productId: '', quantity: 1 }]);
    setErrorStatus('');
    setShowDrawer(true);
  };

  const handleAddItemRow = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItemRow = (idx) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, value) => {
    const updated = [...items];
    updated[idx][field] = value;
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorStatus('');

    if (!fromWarehouseId || !toWarehouseId) {
      setErrorStatus('Select source and target warehouses.');
      return;
    }

    if (fromWarehouseId === toWarehouseId) {
      setErrorStatus('Source and target warehouse must be distinct.');
      return;
    }

    const invalidItem = items.some(item => !item.productId || item.quantity <= 0);
    if (invalidItem) {
      setErrorStatus('Ensure all lanes specify products and positive quantities.');
      return;
    }

    const payload = {
      fromWarehouseId: parseInt(fromWarehouseId),
      toWarehouseId: parseInt(toWarehouseId),
      items: items.map(item => ({
        productId: parseInt(item.productId),
        quantity: parseInt(item.quantity)
      }))
    };

    try {
      await api.post('/api/transfers', payload);
      setShowDrawer(false);
      alert('Stock Transfer processed atomically and verified successfully!');
      fetchData();
    } catch (err) {
      console.error(err);
      setErrorStatus(err.response?.data?.error || 'Atomic transfer failure. Confirm source quantity levels.');
    }
  };

  return (
    <div className="p-8 space-y-6 relative min-h-[calc(100vh-5rem)]">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Stock Transfers</h2>
          <p className="text-slate-400 text-sm mt-1">Initiate transactional inter-warehouse stock movements with ACID-compliant rollback guarantees</p>
        </div>

        {role === 'ADMIN' && (
          <button 
            onClick={openAddDrawer}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-indigo-600/10 self-start"
          >
            <Plus size={15} />
            Transfer Stock
          </button>
        )}
      </div>

      {/* ACID rollback card info */}
      <div className="glass-panel p-6 rounded-3xl flex items-center gap-5 bg-slate-900/40 relative border-l-4 border-indigo-500">
        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl shrink-0 animate-pulse">
          <ArrowLeftRight size={26} />
        </div>
        <div className="text-xs">
          <h4 className="font-extrabold text-white uppercase tracking-wider">Ledger Integrity Lock</h4>
          <p className="text-slate-400 mt-1 lines-relaxed font-semibold">
            Every transfer transaction executes within an isolated database locking session. If any product lane lacks sufficient quantities in the source depot, the entire transfer is instantly aborted and changes are rolled back to guarantee ledger integrity.
          </p>
        </div>
      </div>

      {/* Transfers logs list if available */}
      <div className="border border-slate-850 rounded-2xl overflow-hidden glass-card">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/60 border-b border-slate-850 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <th className="py-4 px-6">Source (From)</th>
              <th className="py-4 px-6">Destination (To)</th>
              <th className="py-4 px-6">Items Count</th>
              <th className="py-4 px-6">Transfer Status</th>
              <th className="py-4 px-6 text-right">Audit Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-xs text-slate-300 font-medium">
            {transfers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-500 uppercase font-black">
                  No active transfer records logged in db.
                </td>
              </tr>
            ) : (
              transfers.map((tr) => {
                const totalMoved = tr.items?.reduce((a, b) => a + b.quantity, 0) || 0;
                return (
                  <tr key={tr.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">{tr.fromWarehouseName}</td>
                    <td className="py-4 px-6 font-bold text-white">{tr.toWarehouseName}</td>
                    <td className="py-4 px-6 font-mono font-bold text-indigo-400">{totalMoved} units</td>
                    <td className="py-4 px-6">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                        COMPLETED
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-slate-500">{new Date(tr.createdAt).toLocaleString()}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Side Slide Drawer for transfer simulation */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={() => setShowDrawer(false)} />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-lg transform transition-all duration-300 slide-in-from-right glass-panel p-8 flex flex-col justify-between border-l border-slate-850">
              
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-md font-black text-white uppercase tracking-wider">Execute Stock Transfer</h3>
                  <p className="text-slate-400 text-xxs mt-0.5 font-bold">Select source and destination nodes to balance network inventory</p>
                </div>
                <button 
                  onClick={() => setShowDrawer(false)}
                  className="p-1 px-2.5 bg-slate-900 hover:text-white border border-slate-850 rounded-lg transition-colors cursor-pointer text-xs"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-grow mt-8 space-y-6 text-xs font-bold text-slate-400 overflow-y-auto pr-1 no-scrollbar">
                {errorStatus && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl flex items-start gap-2.5">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{errorStatus}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-wider">Source Warehouse (From)</label>
                    <select
                      required
                      className="w-full px-4 py-3 bg-slate-950/60 border border-slate-850 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                      value={fromWarehouseId}
                      onChange={(e) => setFromWarehouseId(e.target.value)}
                    >
                      <option value="">-- Choose Source --</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-wider">Destination Warehouse (To)</label>
                    <select
                      required
                      className="w-full px-4 py-3 bg-slate-955 bg-slate-950/60 border border-slate-850 rounded-xl text-white placeholder-slate-705 placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                      value={toWarehouseId}
                      onChange={(e) => setToWarehouseId(e.target.value)}
                    >
                      <option value="">-- Choose Target --</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Lanes Builder */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-wider text-slate-404 text-slate-400">Transfer Lanes</label>
                    <button
                      type="button"
                      onClick={handleAddItemRow}
                      className="text-indigo-400 hover:text-indigo-300 uppercase tracking-widest text-[9px] font-black"
                    >
                      + Add Product Line
                    </button>
                  </div>

                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-end bg-slate-950/30 p-4 border border-slate-850 rounded-xl">
                        <div className="flex-1 space-y-1">
                          <label className="block text-[9px] uppercase text-slate-500">Pick product</label>
                          <select
                            required
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-medium"
                            value={item.productId}
                            onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          >
                            <option value="">-- Select --</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                            ))}
                          </select>
                        </div>

                        <div className="w-28 space-y-1">
                          <label className="block text-[9px] uppercase text-slate-500">Qty</label>
                          <input
                            type="number"
                            required
                            min="1"
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-center focus:outline-none focus:border-indigo-500 font-mono"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          disabled={items.length === 1}
                          className="p-2.5 bg-slate-909 bg-slate-900 hover:bg-slate-850 text-slate-500 hover:text-rose-455 hover:text-rose-400 border border-slate-808 border-slate-800 hover:border-rose-500/20 rounded-lg transition-colors cursor-pointer"
                        >
                          Erase
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-900 flex justify-end gap-3 self-end w-full">
                  <button
                    type="button"
                    onClick={() => setShowDrawer(false)}
                    className="px-5 py-2.5 bg-slate-900 border border-slate-850 text-slate-400 hover:text-white rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-550 rounded-xl text-white cursor-pointer shadow-md shadow-indigo-600/10"
                  >
                    Confirm Transfer
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
