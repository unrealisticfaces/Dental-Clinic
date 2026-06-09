import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, CreditCard, Activity, ChevronDown, LayoutDashboard, 
  LogOut, Hexagon, UserPlus, Search, Receipt, Calendar, DollarSign, Tv
} from 'lucide-react';

export default function Sidebar({ onLogout }) {
  const [openMenus, setOpenMenus] = useState({ patients: false, transactions: false });
  const location = useLocation();

  const toggleMenu = (menu) => setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 h-full flex flex-col justify-between shadow-2xl relative z-20">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-10 px-2">
          <Hexagon className="text-amber-500 fill-amber-500/20" size={28} strokeWidth={2} />
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">
            DENTAL<span className="text-amber-500">PRO</span>
          </h1>
        </div>
        
        <nav className="space-y-2 text-[10px] font-bold tracking-widest uppercase">
          <Link to="/" className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive('/') ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard size={18} className={isActive('/') ? 'text-slate-900' : 'text-slate-400'} /> 
            DASHBOARD
          </Link>
          
          <Link to="/appointments" className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive('/appointments') ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Calendar size={18} className={isActive('/appointments') ? 'text-slate-900' : 'text-slate-400'} /> 
            APPOINTMENTS
          </Link>

          <div className="pt-2">
            <button onClick={() => toggleMenu('patients')} className="w-full flex items-center justify-between p-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <Users size={18} /> PATIENTS
              </div>
              <ChevronDown size={14} className={`transition-transform duration-300 ${openMenus.patients ? 'rotate-180 text-amber-500' : 'text-slate-500'}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openMenus.patients ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
              <div className="flex flex-col gap-1 pl-4 pr-2 border-l border-slate-700 ml-5 mt-2">
                <Link to="/patients/register" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-[10px] uppercase tracking-widest ${isActive('/patients/register') ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                  <UserPlus size={14} /> REGISTER
                </Link>
                <Link to="/patients/search" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-[10px] uppercase tracking-widest ${isActive('/patients/search') ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                  <Search size={14} /> ACCOUNTS
                </Link>
              </div>
            </div>
          </div>

          <div className="pb-2 border-b border-slate-800">
            <button onClick={() => toggleMenu('transactions')} className="w-full flex items-center justify-between p-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <CreditCard size={18} /> TRANSACTIONS
              </div>
              <ChevronDown size={14} className={`transition-transform duration-300 ${openMenus.transactions ? 'rotate-180 text-amber-500' : 'text-slate-500'}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openMenus.transactions ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
              <div className="flex flex-col gap-1 pl-4 pr-2 border-l border-slate-700 ml-5 mt-2 mb-2">
                <Link to="/transactions/payment" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-[10px] uppercase tracking-widest ${isActive('/transactions/payment') ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                  <Receipt size={14} /> PAYMENT
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link to="/earnings" className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive('/earnings') ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <DollarSign size={18} className={isActive('/earnings') ? 'text-slate-900' : 'text-slate-400'} /> 
              COMMISSIONS
            </Link>

            <Link to="/queue-manager" className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive('/queue-manager') ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Calendar size={18} className={isActive('/queue-manager') ? 'text-slate-900' : 'text-slate-400'} /> 
            QUEUE MANAGER
            </Link>

            <Link to="/tv-settings" className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 mt-1 ${isActive('/tv-settings') ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <Tv size={18} className={isActive('/tv-settings') ? 'text-slate-900' : 'text-slate-400'} /> 
              TV SETTINGS
            </Link>

            <Link to="/logs" className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 mt-1 ${isActive('/logs') ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <Activity size={18} className={isActive('/logs') ? 'text-slate-900' : 'text-slate-400'} /> 
              SYSTEM LOGS
            </Link>
          </div>
        </nav>
      </div>

      <div className="p-5 border-t border-slate-800">
        <button onClick={onLogout} className="flex items-center justify-center gap-2 p-3 rounded-lg bg-slate-800/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 transition-all w-full cursor-pointer font-bold text-[10px] uppercase tracking-widest">
          <LogOut size={16} /> SIGN OUT
        </button>
      </div>
    </div>
  );
}