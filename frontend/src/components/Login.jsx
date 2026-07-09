import React, { useState } from 'react';
import api from '../api';
import { KeyRound, User, ChevronRight, AlertCircle, ShieldAlert, Cpu } from 'lucide-react';

export default function Login({ setToken, setRole, setUsername }) {
  const [isRegister, setIsRegister] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [roleInput, setRoleInput] = useState('STAFF');
  const [errorInput, setErrorInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorInput('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegister 
        ? { username: usernameInput, password: passwordInput, role: roleInput } 
        : { username: usernameInput, password: passwordInput };

      const response = await api.post(endpoint, payload);
      const { token, role, username } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', username);

      setToken(token);
      setRole(role);
      setUsername(username);
    } catch (err) {
      console.error(err);
      setErrorInput(err.response?.data?.error || 'Authentication failed. Incorrect username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Immersive Space Grid Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#0f172a,transparent)] pointer-events-none" />

      {/* Rotating Accent Blur Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-pink-500/10 rounded-full blur-3xl animate-[pulse_6s_infinite] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-y-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg glass-panel p-10 rounded-3xl relative z-10 border border-slate-800/80 shadow-2xl shadow-indigo-950/20">
        
        {/* Subtle Top Glow Tab */}
        <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-900/40 border border-indigo-500/25 text-indigo-400 mb-4 relative group">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-md group-hover:blur-lg transition-all" />
            <Cpu size={28} className="relative z-10 animate-pulse text-indigo-400" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white m-0">
            StockPilot<span className="text-indigo-400 font-extrabold text-glow-indigo">.</span>
          </h2>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-2.5">
            {isRegister ? 'Register Security Operator' : 'Enterprise Control Gateway'}
          </p>
        </div>

        {errorInput && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/25 text-rose-400 px-4 py-3 rounded-xl flex items-start gap-3 text-xs animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="font-semibold">{errorInput}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-semibold text-xs"
                placeholder="Operator Username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Password Access Key</label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-semibold text-xs"
                placeholder="Access Token Key"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
            </div>
          </div>

          {isRegister && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Role Authorization</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className={`py-3 rounded-xl border text-[11px] font-black tracking-wide uppercase transition-all ${
                    roleInput === 'STAFF'
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-inner'
                      : 'border-slate-800/80 bg-slate-900/30 text-slate-400 hover:border-slate-700'
                  }`}
                  onClick={() => setRoleInput('STAFF')}
                >
                  Staff Crew
                </button>
                <button
                  type="button"
                  className={`py-3 rounded-xl border text-[11px] font-black tracking-wide uppercase transition-all ${
                    roleInput === 'ADMIN'
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-inner'
                      : 'border-slate-800/80 bg-slate-900/30 text-slate-400 hover:border-slate-700'
                  }`}
                  onClick={() => setRoleInput('ADMIN')}
                >
                  Security Admin
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full glow-btn-primary font-bold py-3.5 rounded-xl cursor-pointer text-xs uppercase tracking-widest flex items-center justify-center gap-2 group transition-all"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Initialize Operator' : 'Sign In Security'}</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="pt-6 border-t border-slate-900/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-semibold">Security Level: AES-256</span>
          <button 
            type="button"
            className="text-indigo-400 hover:text-indigo-300 font-bold text-xs tracking-wider uppercase transition-colors"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorInput('');
            }}
          >
            {isRegister ? 'Operator Sign In' : 'Register Operator'}
          </button>
        </div>
      </div>
    </div>
  );
}
