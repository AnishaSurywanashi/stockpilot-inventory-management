import React, { useState, useEffect } from 'react';
import api from '../api';
import { TrendingUp, Plus, Check, Eye, AlertCircle, RefreshCw, X, Trash2 } from 'lucide-react';

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Drawer State
  const [showDrawer, setShowDrawer] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1, unitPrice: 0 }]);
  const [errorStatus, setErrorStatus] = useState('');

  // Invoice Details State
  const [selectedOrder, setSelectedOrder] = useState(null);

  const role = localStorage.getItem('role');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordResp, prodResp, whResp, supResp] = await Promise.all([
        api.get('/api/purchase-orders'),
        api.get('/api/products'),
        api.get('/api/warehouses'),
        api.get('/api/suppliers')
      ]);
      setOrders(ordResp.data);
      setProducts(prodResp.data);
      setWarehouses(whResp.data);
      setSuppliers(supResp.data);
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
    setOrderNumber('PO-' + Math.floor(1000 + Math.random() * 9000));
    setWarehouseId('');
    setSupplierId('');
    setItems([{ productId: '', quantity: 1, unitPrice: 0 }]);
    setErrorStatus('');
    setShowDrawer(true);
  };

  const handleAddItemRow = () => {
    setItems([...items, { productId: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItemRow = (idx) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, value) => {
    const updated = [...items];
    updated[idx][field] = value;
    
    // Auto populate unitPrice from catalog
    if (field === 'productId') {
      const prod = products.find(p => p.id.toString() === value);
      if (prod) {
        updated[idx].unitPrice = prod.unitPrice;
      }
    }
    setItems(updated);
  };

  const calculateTotalInvoice = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.unitPrice || 0) * parseInt(item.quantity || 0)), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorStatus('');

    if (!warehouseId || !supplierId) {
      setErrorStatus('Please select a destination warehouse and source supplier.');
      return;
    }

    const invalidItem = items.some(item => !item.productId || item.quantity <= 0 || item.unitPrice < 0);
    if (invalidItem) {
      setErrorStatus('Verify all products are selected, and quantities/prices are positive.');
      return;
    }

    const payload = {
      orderNumber,
      warehouseId: parseInt(warehouseId),
      supplierId: parseInt(supplierId),
      items: items.map(item => ({
        productId: parseInt(item.productId),
        quantity: parseInt(item.quantity),
        unitPrice: parseFloat(item.unitPrice)
      }))
    };

    try {
      await api.post('/api/purchase-orders', payload);
      setShowDrawer(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setErrorStatus(err.response?.data?.error || 'Failed to place purchase order.');
    }
  };

  const handleConfirm = async (id) => {
    if (!window.confirm('Fulfill this Purchase Order? Correct stock quantities will be added to the destination warehouse.')) return;
    try {
      await api.post(`/api/purchase-orders/${id}/confirm`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to confirm purchase order.');
    }
  };

  return (
    <div className="p-8 space-y-6 relative min-h-[calc(100vh-5rem)]">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Purchase Orders (Inbound)</h2>
          <p className="text-slate-400 text-sm mt-1">Manage vendor supply purchases, restock incoming units, and audit pending procurement</p>
        </div>

        <button 
          onClick={openAddDrawer}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-indigo-600/10 self-start"
        >
          <Plus size={15} />
          Create Purchase Order
        </button>
      </div>

      {/* Grid listing is more innovative! */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm font-semibold">Querying pending purchases...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500 uppercase font-black text-xs">
              No purchase orders recorded yet.
            </div>
          ) : (
            orders.map((ord) => {
              const itemsCount = ord.items?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
              const isCreated = ord.status === 'CREATED';

              return (
                <div key={ord.id} className={`glass-card p-6 rounded-3xl relative overflow-hidden group border ${
                  ord.status === 'CONFIRMED' ? 'border-emerald-500/35' : 'border-slate-800'
                }`}>
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all pointer-events-none" />
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider">{ord.orderNumber}</span>
                      <h4 className="font-extrabold text-white text-[13px] uppercase mt-1 leading-snug">{ord.supplierName}</h4>
                    </div>

                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-wider uppercase border ${
                      ord.status === 'CREATED' 
                        ? 'bg-slate-900 text-slate-400 border-slate-800'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {ord.status}
                    </span>
                  </div>

                  <div className="mt-6 space-y-2 text-xs font-semibold text-slate-400">
                    <div className="flex justify-between">
                      <span>Restock Depot:</span>
                      <span className="text-white uppercase">{ord.warehouseName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Refill Items:</span>
                      <span className="text-white">{itemsCount} units</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-900/80 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="p-1 px-2.5 bg-slate-900 text-slate-450 text-slate-400 hover:text-white border border-slate-850 hover:border-slate-700 rounded-lg text-xxs font-black uppercase transition-colors cursor-pointer"
                    >
                      Audit Invoice
                    </button>

                    {isCreated && role === 'ADMIN' && (
                      <button
                        onClick={() => handleConfirm(ord.id)}
                        className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-lg text-xxs font-black uppercase transition-all cursor-pointer"
                      >
                        Receive
                      </button>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* Side Slide Drawer for PO Issue */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={() => setShowDrawer(false)} />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-lg transform transition-all duration-300 slide-in-from-right glass-panel p-8 flex flex-col justify-between border-l border-slate-850">
              
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-md font-black text-white uppercase tracking-wider">Issue Purchase Order</h3>
                  <p className="text-slate-400 text-xxs mt-0.5 font-bold">Request supplies from registered partners to select warehouses.</p>
                </div>
                <button 
                  onClick={() => setShowDrawer(false)}
                  className="p-1 px-2.5 bg-slate-900 hover:text-white border border-slate-850 rounded-lg transition-colors cursor-pointer text-xs"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-grow mt-8 space-y-6 text-xs font-bold text-slate-400 overflow-y-auto pr-1 no-scrollbar flex flex-col justify-between">
                <div className="space-y-6">
                  {errorStatus && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl flex items-start gap-2.5">
                      <AlertCircle size={15} className="shrink-0 mt-0.5" />
                      <span>{errorStatus}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase tracking-wider">PO Number</label>
                      <input
                        type="text"
                        required
                        disabled
                        className="w-full px-3 py-2.5 bg-slate-955 bg-slate-950/60 border border-slate-855 border-slate-850 rounded-xl text-slate-500 font-mono text-center"
                        value={orderNumber}
                      />
                    </div>

                    <div className="space-y-1 col-span-2">
                      <label className="block text-[9px] uppercase tracking-wider">Destination Warehouse</label>
                      <select
                        required
                        className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-850 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                        value={warehouseId}
                        onChange={(e) => setWarehouseId(e.target.value)}
                      >
                        <option value="">-- Choose Warehouse --</option>
                        {warehouses.map(w => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-wider">Authorized Supplier</label>
                    <select
                      required
                      className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-850 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                      value={supplierId}
                      onChange={(e) => setSupplierId(e.target.value)}
                    >
                      <option value="">-- Choose Supplier --</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Items collection rows */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase tracking-wider text-slate-400">Items Collection</label>
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
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-lg text-white font-medium"
                              value={item.productId}
                              onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                            >
                              <option value="">-- Select --</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                              ))}
                            </select>
                          </div>

                          <div className="w-20 space-y-1">
                            <label className="block text-[9px] uppercase text-slate-500">Qty</label>
                            <input
                              type="number"
                              required
                              min="1"
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-850 rounded-lg text-white text-center focus:outline-none focus:border-indigo-500"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                            />
                          </div>

                          <div className="w-24 space-y-1">
                            <label className="block text-[9px] uppercase text-slate-500">Cost ($)</label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-850 rounded-lg text-indigo-400 font-extrabold focus:outline-none focus:border-indigo-500 text-center font-mono"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            disabled={items.length === 1}
                            className="p-2.5 bg-slate-900 hover:bg-slate-850 text-slate-500 hover:text-rose-455 hover:text-rose-400 border border-slate-850 rounded-lg transition-colors cursor-pointer animate-[fade-in_250ms_ease]"
                          >
                            <Trash2 size={12} />
                          </button>

                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-900/80 flex flex-col gap-4 mt-6">
                  <div className="flex justify-between items-center text-xs uppercase tracking-wider font-bold">
                    <span className="text-slate-500">Total Purchase Value</span>
                    <span className="text-sm font-black text-indigo-400 font-mono">${calculateTotalInvoice().toFixed(2)}</span>
                  </div>

                  <div className="flex justify-end gap-3 w-full">
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
                      Issue Purchase
                    </button>
                  </div>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* Invoice Details dialog popup */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-8 rounded-2xl relative border-t-2 border-emerald-500 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-indigo-400 font-mono font-bold block">{selectedOrder.orderNumber}</span>
                <h3 className="text-md font-black text-white uppercase mt-0.5">Inbound Receipt Audit</h3>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1 px-2.5 bg-slate-900 hover:text-white border border-slate-850 rounded-lg transition-colors cursor-pointer text-xs"
              >
                Close
              </button>
            </div>

            <div className="space-y-2.5 bg-slate-950/40 p-4 border border-slate-850 rounded-xl text-xs mt-6 text-slate-400 font-bold uppercase">
              <div className="flex justify-between">
                <span>Supply Vendor:</span>
                <span className="text-white font-extrabold normal-case">{selectedOrder.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span>Receipt Depot:</span>
                <span className="text-white">{selectedOrder.warehouseName}</span>
              </div>
              <div className="flex justify-between">
                <span>Created Date:</span>
                <span className="text-white font-mono">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <label className="text-[10px] uppercase tracking-wider text-slate-500 font-black block">Purchased Details</label>
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-slate-950/20 border border-slate-900 p-3.5 rounded-xl text-xs font-bold">
                  <div>
                    <div className="text-white uppercase">{item.productName}</div>
                    <div className="text-[10px] text-slate-500 font-mono font-bold mt-0.5">Unit cost: ${item.unitPrice?.toFixed(2)}</div>
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
