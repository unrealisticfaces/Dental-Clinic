import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, ChevronRight, ChevronLeft, Activity, Filter } from 'lucide-react';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [customDate, setCustomDate] = useState('');
  const limit = 15;

  const tabs = ['All', 'Registration', 'Payment', 'Appointment', 'Clinical', 'Update', 'Delete'];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, dateFilter, customDate]);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        let url = `http://localhost:5000/api/logs?query=${searchQuery}&page=${currentPage}&limit=${limit}`;
        if (activeTab !== 'All') url += `&type=${activeTab.toUpperCase()}`;
        if (dateFilter !== 'All Time') url += `&dateFilter=${dateFilter}`;
        if (dateFilter === 'Custom' && customDate) url += `&customDate=${customDate}`;

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLogs(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (searchQuery === '') {
      fetchLogs();
    } else {
      const delayDebounceFn = setTimeout(() => {
        fetchLogs();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, currentPage, activeTab, dateFilter, customDate]);

  const getEventBadge = (eventName) => {
    switch (eventName) {
      case 'REGISTRATION':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider">REGISTRATION</span>;
      case 'PAYMENT':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider">PAYMENT</span>;
      case 'APPOINTMENT':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider">APPOINTMENT</span>;
      case 'CLINICAL':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider">CLINICAL</span>;
      case 'UPDATE':
        return <span className="bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider">UPDATE</span>;
      case 'DELETE':
        return <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider">DELETE</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 border border-gray-300 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider">SYSTEM</span>;
    }
  };

  const displayLogs = logs.filter(log => {
    const eventType = log.action.includes('|') ? log.action.split('|')[0] : 'SYSTEM';
    return eventType !== 'AUTH';
  });

  return (
    <div className="max-w-6xl mx-auto pb-10 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <Activity className="text-purple-600" size={20} />
            System Logs
          </h2>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-white border border-gray-300 rounded-md overflow-hidden shadow-sm">
            <div className="px-3 bg-gray-50 border-r border-gray-300 flex items-center justify-center">
              <Filter className="text-gray-500" size={14} />
            </div>
            <select 
              value={dateFilter} 
              onChange={e => setDateFilter(e.target.value)} 
              className="px-3 py-2 bg-transparent text-xs font-bold text-gray-700 uppercase outline-none"
            >
              <option value="All Time">All Time</option>
              <option value="Today">Today</option>
              <option value="Week">This Week</option>
              <option value="Month">This Month</option>
              <option value="Custom">Specific Date</option>
            </select>
          </div>

          {dateFilter === 'Custom' && (
            <input 
              type="date" 
              value={customDate} 
              onChange={e => setCustomDate(e.target.value)} 
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-xs font-bold text-gray-700 uppercase outline-none shadow-sm"
            />
          )}

          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={14} />
            </div>
            <input 
              type="text" 
              placeholder="Search activity records..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-sm shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 mb-4 overflow-x-auto pb-px custom-scrollbar">
        {tabs.map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-t-md transition-colors whitespace-nowrap ${
              activeTab === tab 
                ? 'bg-slate-800 text-white border-x border-t border-slate-900' 
                : 'bg-white text-gray-500 hover:bg-gray-50 border-x border-t border-transparent hover:border-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-b-lg rounded-tr-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[500px]">
        <div className="overflow-x-auto flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center">
              <Activity className="animate-pulse text-purple-600" size={28} />
            </div>
          )}
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-slate-800 text-white uppercase text-[10px] font-semibold tracking-wider sticky top-0 z-10 border-b border-slate-900">
              <tr>
                <th className="px-4 py-3 w-20">Log ID</th>
                <th className="px-4 py-3 w-32">Event</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayLogs.length > 0 ? (
                displayLogs.map((log) => {
                  const hasSplit = log.action.includes('|');
                  const eventType = hasSplit ? log.action.split('|')[0] : 'SYSTEM';
                  const description = hasSplit ? log.action.split('|')[1] : log.action;

                  let displayAmount = '-';
                  if (log.amount) {
                    displayAmount = `PHP ${Number(log.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
                  } else {
                    const match = description.match(/(?:PHP|₱|amount of|paid)\s*([\d,.]+)/i) || description.match(/([\d,.]+)\s*PHP/i);
                    if (match && match[1]) {
                      const num = parseFloat(match[1].replace(/,/g, ''));
                      if (!isNaN(num)) {
                        displayAmount = `PHP ${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
                      }
                    }
                  }

                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        #{String(log.id).padStart(5, '0')}
                      </td>
                      <td className="px-4 py-2.5">
                        {getEventBadge(eventType)}
                      </td>
                      <td className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-800">
                        {description}
                      </td>
                      <td className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-800">
                        {displayAmount}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                          {new Date(log.timestamp).toLocaleDateString('en-US', { 
                            year: 'numeric', month: 'short', day: 'numeric', 
                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                          })}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-400 text-[10px] font-semibold uppercase tracking-wider">
                    {!isLoading && 'No system logs found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50">
          <span className="text-xs text-gray-500 font-medium">
            Page {currentPage} of {totalPages || 1}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}