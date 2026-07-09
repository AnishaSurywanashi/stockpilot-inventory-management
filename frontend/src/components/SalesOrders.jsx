import React, { useState, useEffect } from 'react';
import api from '../api';
import { ShoppingCart, Plus, Eye, Check, Calendar, Lock, X, AlertOctagon, HelpCircle } from 'lucide-react';

export default function SalesOrders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Drawer State
  const [showDrawer, setShowDrawer] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1 }]);
  const [errorSub, setErrorSub] = useState('');

  // Invoice detail modal state
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordResp, prodResp, whResp] = await Promise.all([
        api.get('/api/sales-orders'),
        api.get('/api/products'),
        api.get('/api/warehouses')
      ]);
      setOrders(ordResp.data);
      setProducts(prodResp.data);
      setWarehouses(whResp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddDrawer = () => {
    setOrderNumber('SO-' + Math.floor(1000 + Math.random() * 9000));
    setWarehouseId('');
    setItems([{ productId: '', quantity: 1 }]);
    setErrorSub('');
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
    setErrorSub('');

    if (!warehouseId) {
      setErrorSub('Select allocation warehouse source.');
      return;
    }

    const invalidItem = items.some(item => !item.productId || item.quantity <= 0);
    if (invalidItem) {
      setErrorSub('All items require a product and positive quantity values.');
      return;
    }

    const payload = {
      orderNumber,
      warehouseId: parseInt(warehouseId),
      items: items.map(item => ({
        productId: parseInt(item.productId),
        quantity: parseInt(item.quantity)
      }))
    };

    try {
      await api.post('/api/sales-orders', payload);
      setShowDrawer(false);
      fetchData();
    } catch (err) {
      setErrorSub(err.response?.data?.error || 'Insufficient stock in depot. Operation declined.');
    }
  };

  const handleConfirm = async (id) => {
    if (!window.confirm('Fulfill order? Reserved stock items will leave the designated warehouse.')) return;
    try {
      await api.post(`/api/sales-orders/${id}/confirm`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Fulfillment error occurred.');
    }
  };

  const handleCancelOrder = async (id) => {
    if (!window.confirm('Erase order? Placed stock reservations will be released.')) return;
    try {
      await api.post(`/api/sales-orders/${id}/cancel`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Cancellation error occurred.');
    }
  };

  return (
    <div className="p-8 space-y-6 relative min-h-[calc(100vh-5rem)]">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Sales Orders (Outbound)</h2>
          <p className="text-slate-400 text-sm mt-1">Manage outbound customer orders, lock stock allocations dynamically, and audit delivery confirmations</p>
        </div>

        <button 
          onClick={openAddDrawer}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-indigo-600/10 self-start"
        >
          <Plus size={15} />
          Create Sales Order
        </button>
      </div>

      {/* Grid mapping rather than plain list tables looks more innovative! */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm font-semibold">Updating outbound orders registry...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500 uppercase font-black text-xs">
              No sales orders registered yet.
            </div>
          ) : (
            orders.map((ord) => {
              const activeItemsTotal = ord.items?.reduce((ttl, item) => ttl + item.quantity, 0) || 0;
              const isCreated = ord.status === 'CREATED';

              return (
                <div key={ord.id} className={`glass-card p-6 rounded-3xl relative overflow-hidden group border ${
                  ord.status === 'CONFIRMED' ? 'border-emerald-500/35' : ord.status === 'CANCELLED' ? 'border-rose-500/25' : 'border-slate-800'
                }`}>
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all pointer-events-none" />
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider">{ord.orderNumber}</span>
                      <h4 className="font-extrabold text-white text-[13px] uppercase mt-1 leading-snug">Source: {ord.warehouseName}</h4>
                    </div>

                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-wider uppercase border ${
                      ord.status === 'CREATED' 
                        ? 'bg-slate-900 text-slate-400 border-slate-850'
                        : ord.status === 'CONFIRMED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                    }`}>
                      {ord.status}
                    </span>
                  </div>

                  <div className="mt-6 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold uppercase">Reserved Size:</span>
                    <span className="font-black text-white">{activeItemsTotal} units</span>
                  </div>

                  {/* Actions buttons */}
                  <div className="mt-6 pt-4 border-t border-slate-900/80 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="p-1 px-2.5 bg-slate-900 text-slate-400 hover:text-white border border-slate-850 hover:border-slate-700 rounded-lg text-xxs font-black uppercase transition-colors cursor-pointer"
                    >
                      Audit Invoice
                    </button>

                    {isCreated && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCancelOrder(ord.id)}
                          className="px-2.5 py-1.5 bg-slate-900 border border-slate-850 hover:border-rose-500/25 text-rose-400 rounded-lg text-xxs font-black uppercase hover:bg-rose-500/5 transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleConfirm(ord.id)}
                          className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/25 rounded-lg text-xxs font-black uppercase transition-all cursor-pointer"
                        >
                          Ship
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* Side Slide Drawer for order creation */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={() => setShowDrawer(false)} />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-lg transform transition-all duration-300 slide-in-from-right glass-panel p-8 flex flex-col justify-between border-l border-slate-850">
              
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-md font-black text-white uppercase tracking-wider">Queue Customer Order</h3>
                  <p className="text-slate-400 text-xxs mt-0.5 font-bold">Locks inventory units in specific source depot.</p>
                </div>
                <button 
                  onClick={() => setShowDrawer(false)}
                  className="p-1 px-2.5 bg-slate-900 hover:text-white border border-slate-850 rounded-lg transition-colors cursor-pointer text-xs"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-grow mt-8 space-y-6 text-xs font-bold text-slate-400 overflow-y-auto pr-1 no-scrollbar">
                {errorSub && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl flex items-start gap-2">
                    <AlertOctagon size={15} className="shrink-0 mt-0.5" />
                    <span>{errorSub}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-wider text-slate-400">Order Ref</label>
                    <input
                      type="text"
                      required
                      disabled
                      className="w-full px-4 py-3 bg-slate-950/60 border border-slate-850 rounded-xl text-slate-500 font-mono"
                      value={orderNumber}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-wider">Allocation Source Depot</label>
                    <select
                      required
                      className="w-full px-4 py-3 bg-slate-950/60 border border-slate-850 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                      value={warehouseId}
                      onChange={(e) => setWarehouseId(e.target.value)}
                    >
                      <option value="">-- Choose Depot --</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Items Builder */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400">Items Breakdown</label>
                    <button
                      type="button"
                      onClick={handleAddItemRow}
                      className="text-indigo-400 hover:text-indigo-300 uppercase tracking-widest text-[9px] font-black"
                    >
                      + Add Item Item
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
                        
                        <div className="w-24 space-y-1">
                          <label className="block text-[9px] uppercase text-slate-500">Qty</label>
                          <input
                            type="number"
                            required
                            min="1"
                            placeholder="e.g. 5"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-center focus:outline-none focus:border-indigo-500"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          disabled={items.length === 1}
                          className="p-2.5 bg-slate-900 hover:bg-slate-850 text-slate-550 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 rounded-lg transition-colors cursor-pointer"
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
                    Submit Order
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* Invoice modal details */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-8 rounded-2xl relative border-t-2 border-indigo-550 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-indigo-400 font-mono font-bold block">{selectedOrder.orderNumber}</span>
                <h3 className="text-md font-black text-white uppercase mt-0.5">Outbound Audit Log</h3>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1 px-2.5 bg-slate-900 hover:text-white border border-slate-850 rounded-lg transition-colors cursor-pointer text-xs"
              >
                Close
              </button>
            </div>

            <div className="space-y-2.5 bg-slate-950/40 p-4 border border-slate-850 rounded-xl text-xs mt-6 text-slate-400 font-bold">
              <div className="flex justify-between">
                <span>Depot Terminal:</span>
                <span className="text-white uppercase">{selectedOrder.warehouseName}</span>
              </div>
              <div className="flex justify-between">
                <span>Created Date:</span>
                <span className="text-white font-mono">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Order Status:</span>
                <span className="text-white uppercase">{selectedOrder.status}</span>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <label className="text-[10px] uppercase tracking-wider text-slate-500 font-black block">Allocation Units</label>
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white uppercase text-xs">{item.productName}</h4>
                    <div className="text-[10px] text-slate-500 font-mono font-bold mt-0.5">Price: ${item.unitPrice?.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-indigo-400 text-glow-indigo font-mono">Qty: {item.quantity}</div>
                    <div className="text-[10px] text-white font-mono mt-0.5">${(item.quantity * item.unitPrice).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-5 border-t border-slate-850 flex justify-between items-center text-xs mt-6">
              <span className="font-bold text-slate-500 uppercase tracking-widest">Total Invoice Cost</span>
              <span className="text-lg font-black text-indigo-400 text-glow-indigo font-mono">
                ${selectedOrder.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
