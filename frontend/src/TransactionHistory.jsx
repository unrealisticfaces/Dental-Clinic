import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, ChevronLeft, Activity, Receipt, Calendar, User, CreditCard } from 'lucide-react';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const limit = 10;
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/transactions?query=${searchQuery}&page=${currentPage}&limit=${limit}`);
        setTransactions(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (searchQuery === '') {
      fetchTransactions();
    } else {
      const delayDebounceFn = setTimeout(() => {
        fetchTransactions();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, currentPage]);

  return (
    <div className="max-w-7xl mx-auto pb-10 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Receipt className="text-amber-500" size={24} />
            Transaction History
          </h2>
        </div>
        
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-slate-400" size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search by ID, Name, Procedure..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#1e293b] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-sm shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 bg-[#1e293b] rounded-xl border border-slate-700/60 shadow-lg overflow-hidden flex flex-col h-[600px]">
          <div className="overflow-x-auto flex-1 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-[#1e293b]/80 z-20 flex items-center justify-center backdrop-blur-sm">
                <Activity className="animate-pulse text-amber-500" size={32} />
              </div>
            )}
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[11px] font-semibold tracking-wider sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-4">TXN ID</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Procedure</th>
                  <th className="px-6 py-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {transactions.length > 0 ? (
                  transactions.map((txn) => (
                    <tr 
                      key={txn.id} 
                      onClick={() => setSelectedTxn(txn)}
                      className={`hover:bg-slate-700/40 cursor-pointer transition-colors border-l-2 ${selectedTxn?.id === txn.id ? 'bg-slate-700/50 border-amber-500' : 'border-transparent'}`}
                    >
                      <td className="px-6 py-4 font-mono text-sm font-medium text-amber-500">
                        TXN-{String(txn.id).padStart(6, '0')}
                      </td>
                      <td className="px-6 py-4 font-medium text-white text-base">
                        {txn.first_name} {txn.last_name}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {txn.procedure_name}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400 font-medium whitespace-nowrap">
                        {new Date(txn.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-500 text-sm">
                      {!isLoading && 'No transactions found'}
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

        <div className="lg:col-span-1 bg-[#1e293b] rounded-xl border border-slate-700/60 shadow-lg p-6 flex flex-col items-center justify-center h-[600px] relative">
          {selectedTxn ? (
            <div className="w-full flex flex-col items-center text-center animate-in fade-in duration-200">
              <div className="w-20 h-20 mb-4 bg-amber-500/10 rounded-full flex items-center justify-center border-2 border-amber-500/20 shadow-lg">
                <Receipt className="text-amber-500" size={36} />
              </div>
              
              <h3 className="text-xl font-bold text-white tracking-tight">
                TXN-{String(selectedTxn.id).padStart(6, '0')}
              </h3>
              <p className="text-slate-400 text-sm font-medium mb-6">
                {new Date(selectedTxn.transaction_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <div className="w-full bg-[#0f172a]/60 rounded-xl border border-slate-700/50 p-4 mb-6 space-y-4">
                <div className="flex items-start gap-3 text-left">
                  <div className="bg-amber-500/10 p-2 rounded-lg text-amber-500 mt-0.5 shrink-0">
                    <User size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Billed To</p>
                    <p className="text-slate-200 text-sm font-medium">{selectedTxn.first_name} {selectedTxn.last_name}</p>
                    <p className="text-slate-500 text-xs font-mono">{selectedTxn.unique_id}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 text-left">
                  <div className="bg-amber-500/10 p-2 rounded-lg text-amber-500 mt-0.5 shrink-0">
                    <Activity size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Procedure</p>
                    <p className="text-slate-200 text-sm font-medium leading-snug">{selectedTxn.procedure_name}</p>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-700/50">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 text-center">Amount Settled</p>
                  <p className="text-amber-500 text-2xl font-black font-mono">
                    PHP {Number(selectedTxn.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/transactions/receipt/${selectedTxn.id}`)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-[#0f172a] font-bold text-sm py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                Open Official Receipt <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <div className="text-center opacity-60">
              <CreditCard className="text-slate-500 mx-auto mb-3" size={40} />
              <p className="text-slate-400 text-sm font-medium">Select a transaction to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}