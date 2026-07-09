import React, { useState, useEffect } from 'react';
import api from '../api';
import { Users, Plus, Search, Edit3, Trash2, AlertCircle } from 'lucide-react';

export default function Suppliers({ role }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form State
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errorSub, setErrorSub] = useState('');

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/api/suppliers');
      setSuppliers(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const openAddDrawer = () => {
    setEditingId(null);
    setName('');
    setContactName('');
    setEmail('');
    setPhone('');
    setErrorSub('');
    setShowDrawer(true);
  };

  const openEditDrawer = (sup) => {
    setEditingId(sup.id);
    setName(sup.name);
    setContactName(sup.contactName);
    setEmail(sup.email);
    setPhone(sup.phone);
    setErrorSub('');
    setShowDrawer(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Erase this supply vendor? Replenishment routes may be disconnected.')) return;
    try {
      await api.delete(`/api/suppliers/${id}`);
      fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove supplier.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorSub('');

    if (!name || !contactName || !email) {
      setErrorSub('Please complete name, representative and email details.');
      return;
    }

    const payload = { name, contactName, email, phone };

    try {
      if (editingId) {
        await api.put(`/api/suppliers/${editingId}`, payload);
      } else {
        await api.post('/api/suppliers', payload);
      }
      setShowDrawer(false);
      fetchSuppliers();
    } catch (err) {
      setErrorSub(err.response?.data?.error || 'Failed to submit supplier.');
    }
  };

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contactName.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 relative min-h-[calc(100vh-5rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Supplier Hub</h2>
          <p className="text-slate-400 text-sm mt-1">Configure certified vendor streams, contact representatives, and supply emails</p>
        </div>

        {role === 'ADMIN' && (
          <button 
            onClick={openAddDrawer}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-indigo-600/10 self-start"
          >
            <Plus size={15} />
            Register Supplier
          </button>
        )}
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-850 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs font-semibold"
          placeholder="Filter partners by vendor name, representative, or email address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid listing - high-fidelity cards */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm font-semibold">Updating supplier register...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500 uppercase font-black text-xs">
              No registered suppliers found.
            </div>
          ) : (
            filtered.map((sup) => (
              <div key={sup.id} className="glass-card p-6 rounded-3xl relative overflow-hidden group border border-slate-800">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all" />
                
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                      <Users size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-md uppercase leading-tight">{sup.name}</h4>
                      <span className="text-[10px] text-slate-500 font-bold block mt-1">Rep: {sup.contactName}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2 text-xxs font-semibold uppercase text-slate-400 tracking-wider">
                  <div className="flex justify-between items-center">
                    <span>Email:</span>
                    <span className="font-mono text-white text-glow-indigo lowercase font-bold">{sup.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Direct phone:</span>
                    <span className="font-mono text-white font-bold">{sup.phone || '--'}</span>
                  </div>
                </div>

                {role === 'ADMIN' && (
                  <div className="mt-6 pt-4 border-t border-slate-900 border-slate-900/80 flex justify-end gap-2">
                    <button
                      onClick={() => openEditDrawer(sup)}
                      className="p-2 bg-slate-900 border border-slate-850 hover:border-slate-700 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Edit Vendor"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(sup.id)}
                      className="p-2 bg-slate-900 border border-slate-850 hover:border-rose-500/30 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                      title="Delete Vendor"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Side Slide Drawer Overlay */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={() => setShowDrawer(false)} />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md transform transition-all duration-300 slide-in-from-right glass-panel p-8 flex flex-col justify-between border-l border-slate-850">
              
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-md font-black text-white uppercase tracking-wider">
                    {editingId ? 'Modify Member' : 'Register Vendor'}
                  </h3>
                  <p className="text-slate-400 text-xxs mt-0.5 font-bold">Supplier network hubs</p>
                </div>
                <button 
                  onClick={() => setShowDrawer(false)}
                  className="p-1 px-2.5 bg-slate-900 hover:text-white border border-slate-850 rounded-lg transition-colors cursor-pointer text-xs"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 mt-8 space-y-6 text-xs font-bold text-slate-400">
                {errorSub && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl flex items-start gap-2.5">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{errorSub}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider font-sans text-slate-400">Supplier Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corp"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-850 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider">Representative Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-850 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-indigo-505 focus:border-indigo-500"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider">Vendor Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. supply@intel.com"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-850 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider">Vendor Direct Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +1 (555) 123-4567"
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-850 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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
