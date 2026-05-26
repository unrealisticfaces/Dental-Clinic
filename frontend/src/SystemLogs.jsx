import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Activity, ChevronRight, ChevronLeft, Clock } from 'lucide-react';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const limit = 15;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/logs?query=${searchQuery}&page=${currentPage}&limit=${limit}`);
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
  }, [searchQuery, currentPage]);

  return (
    <div className="max-w-7xl mx-auto pb-10 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="text-purple-500" size={24} />
            System Logs
          </h2>
          <p className="text-slate-400 mt-1 text-sm">Monitor all CRUD activities and administrative events.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-slate-400" size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search activity records..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#1e293b] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-sm shadow-sm"
          />
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-xl border border-slate-700/60 shadow-lg overflow-hidden flex flex-col flex-1 min-h-[600px]">
        <div className="overflow-x-auto flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-[#1e293b]/80 z-20 flex items-center justify-center backdrop-blur-sm">
              <Activity className="animate-pulse text-purple-500" size={32} />
            </div>
          )}
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[11px] font-semibold tracking-wider sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 w-24 text-center">Log ID</th>
                <th className="px-6 py-4">Event Description</th>
                <th className="px-6 py-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-medium text-slate-500 text-center">
                      #{String(log.id).padStart(5, '0')}
                    </td>
                    <td className="px-6 py-4 font-medium text-white text-base">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-400">
                        <Clock size={14} className="text-slate-500" />
                        {new Date(log.timestamp).toLocaleDateString('en-US', { 
                          year: 'numeric', month: 'short', day: 'numeric', 
                          hour: '2-digit', minute: '2-digit', second: '2-digit'
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-slate-500 text-sm">
                    {!isLoading && 'No system logs found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-700/50 bg-slate-800/30">
          <span className="text-xs text-slate-400 font-medium">
            Page {currentPage} of {totalPages || 1}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}