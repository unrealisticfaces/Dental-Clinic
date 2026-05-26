import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, CreditCard, Activity, ChevronDown, LayoutDashboard, 
  LogOut, Hexagon, UserPlus, Search, Receipt 
} from 'lucide-react';

export default function Sidebar({ onLogout }) {
  const [openMenus, setOpenMenus] = useState({ patients: false, transactions: false });
  const location = useLocation();

  const toggleMenu = (menu) => setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col justify-between shadow-sm relative z-20">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-8 px-2">
          <Hexagon className="text-blue-600 fill-blue-50" size={24} strokeWidth={2} />
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Dental<span className="text-blue-600">Pro</span>
          </h1>
        </div>
        
        <nav className="space-y-1.5 text-sm font-medium">
          <Link to="/" className={`flex items-center gap-2.5 p-2 rounded-md transition-all duration-200 ${isActive('/') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
            <LayoutDashboard size={18} className={isActive('/') ? 'text-blue-700' : 'text-gray-500'} /> 
            Dashboard
          </Link>

          <div className="pt-2">
            <button onClick={() => toggleMenu('patients')} className="w-full flex items-center justify-between p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all cursor-pointer">
              <div className="flex items-center gap-2.5">
                <Users size={18} className="text-emerald-600" /> Patients
              </div>
              <ChevronDown size={14} className={`transition-transform duration-300 ${openMenus.patients ? 'rotate-180 text-blue-600' : 'text-gray-400'}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openMenus.patients ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
              <div className="flex flex-col gap-0.5 px-2">
                <Link to="/patients/register" className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-colors text-xs ${isActive('/patients/register') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
                  <UserPlus size={14} /> Register Patient
                </Link>
                <Link to="/patients/search" className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-colors text-xs ${isActive('/patients/search') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
                  <Search size={14} /> Accounts
                </Link>
              </div>
            </div>
          </div>

          <div>
            <button onClick={() => toggleMenu('transactions')} className="w-full flex items-center justify-between p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all cursor-pointer">
              <div className="flex items-center gap-2.5">
                <CreditCard size={18} className="text-amber-600" /> Transactions
              </div>
              <ChevronDown size={14} className={`transition-transform duration-300 ${openMenus.transactions ? 'rotate-180 text-blue-600' : 'text-gray-400'}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openMenus.transactions ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
              <div className="flex flex-col gap-0.5 px-2">
                <Link to="/transactions/payment" className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-colors text-xs ${isActive('/transactions/payment') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
                  <Receipt size={14} /> Process Payment
                </Link>
              </div>
            </div>
          </div>

          <Link to="/logs" className={`flex items-center gap-2.5 p-2 rounded-md transition-all duration-200 mt-2 ${isActive('/logs') ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
            <Activity size={18} className={isActive('/logs') ? 'text-purple-700' : 'text-gray-500'} /> 
            System Logs
          </Link>
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button onClick={onLogout} className="flex items-center justify-center gap-2 p-2 rounded-md bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 transition-all w-full cursor-pointer font-medium text-sm">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}