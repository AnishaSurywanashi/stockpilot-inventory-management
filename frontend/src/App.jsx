import React, { useState } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Inventory from './components/Inventory';
import Warehouses from './components/Warehouses';
import Suppliers from './components/Suppliers';
import SalesOrders from './components/SalesOrders';
import PurchaseOrders from './components/PurchaseOrders';
import Transfers from './components/Transfers';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [view, setView] = useState('dashboard');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setToken('');
    setRole('');
    setUsername('');
    setView('dashboard');
  };

  if (!token) {
    return <Login setToken={setToken} setRole={setRole} setUsername={setUsername} />;
  }

  const renderActiveView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products role={role} />;
      case 'inventory':
        return <Inventory />;
      case 'warehouses':
        return <Warehouses role={role} />;
      case 'suppliers':
        return <Suppliers role={role} />;
      case 'sales-orders':
        return <SalesOrders />;
      case 'purchase-orders':
        return <PurchaseOrders />;
      case 'transfers':
        return <Transfers role={role} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex bg-slate-950 min-h-screen">
      {/* Sidebar Panel Navigation */}
      <Sidebar active={view} setView={setView} role={role} />

      {/* Body Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar view={view} username={username} onLogout={handleLogout} />
        <main className="flex-grow overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
