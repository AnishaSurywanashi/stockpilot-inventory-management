import React, { useState, useEffect } from 'react';
import api from '../api';
import { Bell, LogOut, User, Sun, Clock, Calendar, CheckSquare } from 'lucide-react';

export default function Navbar({ view, username, onLogout }) {
  const [notifications, setNotifications] = useState([]);
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [time, setTime] = useState(new Date());

  // Real-time ticking Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchNotifs = async () => {
    try {
      const resp = await api.get('/api/notifications');
      setNotifications(resp.data);
    } catch (err) {
      console.error('Failed to query notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const poll = setInterval(fetchNotifs, 10000);
    return () => clearInterval(poll);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.post(`/api/notifications/${id}/read`);
      fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  const getGreeting = () => {
    const hrs = time.getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="h-20 border-b border-slate-900 bg-slate-950/40 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-40">
      
      {/* View Title breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-xxs text-slate-500 uppercase tracking-widest font-black">
          <span>Enterprise Portal</span>
          <span>//</span>
          <span className="text-indigo-400 text-glow-indigo font-black">{view.replace('-', ' ')}</span>
        </div>
        <h1 className="text-lg font-black text-white capitalize mt-1 select-none">
          {view.replace('-', ' ')} Sheet
        </h1>
      </div>

      {/* Center live clocks widget (looks very innovative!) */}
      <div className="hidden lg:flex items-center gap-6 text-[11px] font-bold text-slate-400">
        <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 border border-slate-850 rounded-xl">
          <Calendar size={13} className="text-indigo-400" />
          <span>{time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 border border-slate-850 rounded-xl">
          <Clock size={13} className="text-indigo-400 animate-pulse" />
          <span className="font-mono text-white text-glow-indigo">{time.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 relative">
        
        {/* Glowing Alerts Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowBellDropdown(!showBellDropdown)}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl border border-slate-850 hover:border-slate-700 transition-colors cursor-pointer relative"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full pulsing-orb text-[0px]" />
            )}
          </button>

          {showBellDropdown && (
            <div className="absolute right-0 mt-3 w-80 glass-panel p-4 rounded-2xl space-y-3 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Unread alerts ({unreadCount})</span>
                {unreadCount > 0 && (
                  <span className="text-[9px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">ALERT_ACTIVE</span>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xxs font-extrabold uppercase">No active security alerts</div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-3 rounded-xl border transition-all text-xs ${
                        notif.isRead 
                          ? 'bg-slate-950/20 border-slate-900 text-slate-500' 
                          : 'bg-slate-900/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-semibold leading-relaxed text-[11px]">{notif.message}</p>
                        {!notif.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="p-0.5 bg-indigo-500/10 hover:bg-indigo-500 hover:text-white text-indigo-400 rounded transition-colors cursor-pointer shrink-0"
                            title="Mark as Read"
                          >
                            <CheckSquare size={12} />
                          </button>
                        )}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-2 font-mono">{new Date(notif.createdAt).toLocaleTimeString()}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3.5 bg-slate-900/40 border border-slate-850 px-4 py-1.5 rounded-2xl select-none">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black">
            <User size={15} />
          </div>
          <div className="hidden sm:block text-left text-xs font-bold font-sans">
            <span className="text-[10px] text-slate-500 block leading-tight">{getGreeting()}</span>
            <span className="text-white block font-black leading-tight mt-0.5">{username}</span>
          </div>
        </div>

        {/* Log Out */}
        <button 
          onClick={onLogout}
          title="Sign Out Access Session"
          className="p-2.5 bg-slate-900/80 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-xl border border-slate-850 hover:border-rose-500/20 transition-all cursor-pointer"
        >
          <LogOut size={16} />
        </button>

      </div>
    </header>
  );
}
