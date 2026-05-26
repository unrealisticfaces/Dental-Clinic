import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, CreditCard, Activity, ChevronDown, LayoutDashboard, 
  LogOut, Hexagon, UserPlus, Search, Receipt, List 
} from 'lucide-react';

export default function Sidebar({ onLogout }) {
  const [openMenus, setOpenMenus] = useState({ patients: true, transactions: true });
  const location = useLocation();

  const toggleMenu = (menu) => setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-72 bg-[#1e293b] border-r border-slate-800/60 h-full flex flex-col justify-between shadow-2xl relative z-20">
      <div className="p-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <Hexagon className="text-blue-500 fill-blue-500/20" size={32} strokeWidth={1.5} />
          <h1 className="text-3xl font-black tracking-tight text-white">
            Dental<span className="text-blue-500">Pro</span>
          </h1>
        </div>
        
        <nav className="space-y-3 text-sm font-medium">
          {/* Dashboard Link */}
          <Link to="/" className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isActive('/') ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'}`}>
            <LayoutDashboard size={20} className={isActive('/') ? 'text-white' : 'text-slate-400'} /> 
            Dashboard
          </Link>

          {/* Patients Menu */}
          <div className="pt-2">
            <button onClick={() => toggleMenu('patients')} className="w-full flex items-center justify-between p-3 rounded-xl text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <Users size={20} className="text-emerald-400" /> Patients
              </div>
              <ChevronDown size={16} className={`transition-transform duration-300 ${openMenus.patients ? 'rotate-180 text-blue-400' : 'text-slate-500'}`} />
            </button>
            
            {/* Modern Sub-menu (Pill Design) */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openMenus.patients ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <div className="flex flex-col gap-1 px-3">
                <Link to="/patients/register" className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive('/patients/register') ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}>
                  <UserPlus size={16} /> Register Patient
                </Link>
                <Link to="/patients/search" className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive('/patients/search') ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}>
                  <Search size={16} /> Patient Directory
                </Link>
              </div>
            </div>
          </div>

          {/* Transactions Menu */}
          <div>
            <button onClick={() => toggleMenu('transactions')} className="w-full flex items-center justify-between p-3 rounded-xl text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <CreditCard size={20} className="text-amber-400" /> Transactions
              </div>
              <ChevronDown size={16} className={`transition-transform duration-300 ${openMenus.transactions ? 'rotate-180 text-blue-400' : 'text-slate-500'}`} />
            </button>
            
            {/* Modern Sub-menu (Pill Design) */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openMenus.transactions ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <div className="flex flex-col gap-1 px-3">
                <Link to="/transactions/payment" className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive('/transactions/payment') ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}>
                  <Receipt size={16} /> Process Payment
                </Link>
                <Link to="/transactions/search" className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive('/transactions/search') ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}>
                  <List size={16} /> Transaction History
                </Link>
              </div>
            </div>
          </div>

          {/* System Logs */}
          <Link to="/logs" className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 mt-2 ${isActive('/logs') ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20' : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'}`}>
            <Activity size={20} className={isActive('/logs') ? 'text-purple-400' : 'text-slate-400'} /> 
            System Logs
          </Link>
        </nav>
      </div>

      <div className="p-6 border-t border-slate-800/60">
        <button onClick={onLogout} className="flex items-center justify-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all w-full cursor-pointer font-medium">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );
}