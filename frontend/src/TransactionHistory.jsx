import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, ChevronLeft, Activity, Receipt, User, CreditCard } from 'lucide-react';

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
    <div className="max-w-6xl mx-auto pb-10 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <Search className="text-amber-600" size={20} />
            Search Transactions
          </h2>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={14} />
          </div>
          <input 
            type="text" 
            placeholder="Search ID, Name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-sm shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="overflow-x-auto flex-1 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center">
                <Activity className="animate-pulse text-amber-500" size={28} />
              </div>
            )}
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-semibold tracking-wider sticky top-0 z-10 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">TXN ID</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Procedure</th>
                  <th className="px-4 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.length > 0 ? (
                  transactions.map((txn) => (
                    <tr 
                      key={txn.id} 
                      onClick={() => setSelectedTxn(txn)}
                      className={`hover:bg-amber-50 cursor-pointer transition-colors border-l-2 ${selectedTxn?.id === txn.id ? 'bg-amber-50 border-amber-500' : 'border-transparent'}`}
                    >
                      <td className="px-4 py-2.5 font-mono text-xs font-medium text-amber-600">
                        TXN-{String(txn.id).padStart(6, '0')}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-gray-900 text-sm">
                        {txn.first_name} {txn.last_name}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-gray-600">
                        {txn.procedure_name}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-500 text-xs font-medium whitespace-nowrap">
                        {new Date(txn.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-gray-400 text-sm">
                      {!isLoading && 'No transactions found'}
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

        <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex flex-col items-center justify-center h-[500px] relative">
          {selectedTxn ? (
            <div className="w-full flex flex-col items-center text-center animate-in fade-in duration-200">
              <div className="w-16 h-16 mb-3 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 shadow-sm">
                <Receipt className="text-amber-600" size={28} />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                TXN-{String(selectedTxn.id).padStart(6, '0')}
              </h3>
              <p className="text-gray-500 text-xs font-medium mb-4">
                {new Date(selectedTxn.transaction_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <div className="w-full bg-gray-50 rounded-lg border border-gray-200 p-3 mb-4 space-y-3">
                <div className="flex items-start gap-2 text-left">
                  <div className="bg-white p-1.5 rounded border border-gray-200 text-amber-600 mt-0.5 shrink-0">
                    <User size={12} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Billed To</p>
                    <p className="text-gray-900 text-xs font-medium">{selectedTxn.first_name} {selectedTxn.last_name}</p>
                    <p className="text-gray-500 text-[10px] font-mono">{selectedTxn.unique_id}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 text-left">
                  <div className="bg-white p-1.5 rounded border border-gray-200 text-amber-600 mt-0.5 shrink-0">
                    <Activity size={12} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Procedure</p>
                    <p className="text-gray-900 text-xs font-medium leading-snug">{selectedTxn.procedure_name}</p>
                  </div>
                </div>

                <div className="pt-3 mt-1 border-t border-gray-200">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1 text-center">Amount Settled</p>
                  <p className="text-amber-600 text-lg font-bold font-mono">
                    PHP {Number(selectedTxn.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/transactions/receipt/${selectedTxn.id}`)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2.5 rounded-md transition-colors shadow-sm flex items-center justify-center gap-1"
              >
                Open Official Receipt <ChevronRight size={14} />
              </button>
            </div>
          ) : (
            <div className="text-center opacity-60">
              <CreditCard className="text-gray-400 mx-auto mb-2" size={32} />
              <p className="text-gray-500 text-xs font-medium">Select a transaction to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}