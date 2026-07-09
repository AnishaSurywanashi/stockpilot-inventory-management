import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  Package, Plus, Search, Edit3, Trash2, 
  AlertCircle, X, Check, Archive, ArrowRightCircle 
} from 'lucide-react';

export default function Products({ role }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Form State
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [unitPrice, setUnitPrice] = useState(0);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [category, setCategory] = useState('');
  const [errorStatus, setErrorStatus] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/api/products');
      setProducts(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddDrawer = () => {
    setEditingId(null);
    setSku('SKU-' + Math.floor(100000 + Math.random() * 900000));
    setName('');
    setUnitPrice(0);
    setLowStockThreshold(5);
    setCategory('');
    setErrorStatus('');
    setShowDrawer(true);
  };

  const openEditDrawer = (prod) => {
    setEditingId(prod.id);
    setSku(prod.sku);
    setName(prod.name);
    setUnitPrice(prod.unitPrice);
    setLowStockThreshold(prod.lowStockThreshold);
    setCategory(prod.category);
    setErrorStatus('');
    setShowDrawer(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Erase this product from the inventory master?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Removal failed. Product is referenced in warehouse stock inventory.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorStatus('');

    if (unitPrice <= 0 || lowStockThreshold < 0) {
      setErrorStatus('Sales costs or threshold values cannot be negative numbers.');
      return;
    }

    const payload = { sku, name, unitPrice, lowStockThreshold, category };

    try {
      if (editingId) {
        await api.put(`/api/products/${editingId}`, payload);
      } else {
        await api.post('/api/products', payload);
      }
      setShowDrawer(false);
      fetchProducts();
    } catch (err) {
      setErrorStatus(err.response?.data?.error || 'Database transaction error occurred.');
    }
  };

  // Filters
  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === '' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Extract unique categories
  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);

  return (
    <div className="p-8 space-y-6 relative min-h-[calc(100vh-5rem)]">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Product Catalog</h2>
          <p className="text-slate-400 text-sm mt-1">Configure SKU profiles, sale prices, safety levels, and classification categories</p>
        </div>

        {role === 'ADMIN' && (
          <button 
            onClick={openAddDrawer}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-indigo-600/10 self-start"
          >
            <Plus size={15} />
            Register Product
          </button>
        )}
      </div>

      {/* Control Search & Filter Panels */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-850 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs font-semibold"
            placeholder="Search by product name or SKU key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-3 bg-slate-900/60 border border-slate-850 rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500 text-xs font-semibold"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Main Table grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm font-semibold">Updating catalog rows...</div>
      ) : (
        <div className="border border-slate-850 rounded-2xl overflow-hidden glass-card">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-850 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <th className="py-4 px-6">SKU Code</th>
                <th className="py-4 px-6">Name Label</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6 text-center">Safety Level</th>
                <th className="py-4 px-6 text-right">Unit Price</th>
                {role === 'ADMIN' && <th className="py-4 px-6 text-right">Operations</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs text-slate-300 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={role === 'ADMIN' ? 6 : 5} className="text-center py-12 text-slate-500 font-extrabold uppercase">
                    No matching catalog profiles found.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-4 px-6 font-mono text-indigo-400 font-bold">{prod.sku}</td>
                    <td className="py-4 px-6 font-bold text-white text-glow-indigo">{prod.name}</td>
                    <td className="py-4 px-6">
                      <span className="bg-slate-900 border border-slate-850 px-2 py-1 rounded text-[10px] uppercase font-bold text-slate-400">
                        {prod.category || 'GENERAL'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center lg:px-12 font-bold font-mono">
                      {prod.lowStockThreshold} units
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-extrabold text-white">
                      ${prod.unitPrice?.toFixed(2)}
                    </td>
                    {role === 'ADMIN' && (
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditDrawer(prod)}
                            className="p-2 bg-slate-900/80 border border-slate-850 hover:border-slate-700 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Edit Catalogue Profile"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id)}
                            className="p-2 bg-slate-900/80 border border-slate-850 hover:border-rose-500/30 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete Catalogue Profile"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Side Slide Overlay Drawer (looks very innovative instead of standard centered dialogs!) */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={() => setShowDrawer(false)} />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md transform transition-all duration-300 slide-in-from-right glass-panel p-8 flex flex-col justify-between border-l border-slate-850 relative">
              
              {/* Drawer Top Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-md font-black text-white uppercase tracking-wider">
                    {editingId ? 'Modify SKU Profile' : 'Register New SKU'}
                  </h3>
                  <p className="text-slate-400 text-xxs mt-0.5 font-bold">Catalog data registry controls</p>
                </div>
                <button 
                  onClick={() => setShowDrawer(false)}
                  className="p-1 px-2.5 bg-slate-900 hover:text-white border border-slate-850 rounded-lg transition-colors cursor-pointer text-xs"
                >
                  Close
                </button>
              </div>

              {/* Drawer Content and Forms */}
              <form onSubmit={handleSubmit} className="flex-1 mt-8 space-y-6 text-xs font-bold text-slate-400">
                {errorStatus && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl flex items-start gap-2.5">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{errorStatus}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider">Catalogue SKU Code</label>
                  <input
                    type="text"
                    required
                    disabled
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-850 rounded-xl text-slate-500 font-mono"
                    value={sku}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider">Product Name Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Server Rack X900"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-850 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-wider">Asset Class / Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Hardware"
                      className="w-full px-4 py-3 bg-slate-950/60 border border-slate-850 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-wider">Low Stock Safety</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="w-full px-4 py-3 bg-slate-950/60 border border-slate-850 rounded-xl text-white text-center focus:outline-none focus:border-indigo-500 font-mono"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider">Sales Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-850 rounded-xl text-indigo-400 font-extrabold focus:outline-none focus:border-indigo-500 font-mono text-sm"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="pt-6 border-t border-slate-900 mt-auto flex justify-end gap-3">
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
                    {editingId ? 'Confirm Changes' : 'Confirm Registration'}
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
