import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, Download, ArrowLeft, Hexagon } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Receipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/transactions/${id}`)
      .then(res => res.json())
      .then(data => setTransaction(data))
      .catch(() => toast.error('Failed to load transaction details'));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (!transaction) return <div className="p-8 text-center text-slate-400">Loading receipt...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/transactions/payment')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors print:hidden">
        <ArrowLeft size={16} /> Back to Payments
      </button>

      <div className="bg-[#1e293b] p-10 rounded-2xl border border-slate-800 shadow-2xl print:bg-white print:text-black print:shadow-none print:border-none relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-amber-500 rounded-t-2xl print:hidden"></div>

        <div className="flex justify-between items-start mb-10 border-b border-slate-700/50 print:border-gray-300 pb-8">
          <div className="flex items-center gap-3">
            <Hexagon className="text-amber-500 print:text-gray-800" size={40} strokeWidth={1.5} />
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white print:text-black">
                Dental<span className="text-amber-500 print:text-gray-600">Pro</span>
              </h1>
              <p className="text-slate-400 print:text-gray-500 text-sm mt-1">Official Receipt</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-mono text-white print:text-black">TXN-{String(transaction.id).padStart(6, '0')}</p>
            <p className="text-sm text-slate-400 print:text-gray-500">
              {new Date(transaction.transaction_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <p className="text-sm font-semibold text-slate-400 print:text-gray-500 uppercase tracking-wider mb-2">Patient Details</p>
            <p className="text-xl font-bold text-white print:text-black">{transaction.first_name} {transaction.last_name}</p>
            <p className="text-slate-400 print:text-gray-600">ID: {transaction.unique_id}</p>
          </div>
        </div>

        <div className="bg-[#0f172a] print:bg-gray-50 rounded-xl p-6 border border-slate-700/50 print:border-gray-200 mb-10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 print:border-gray-300">
                <th className="text-left pb-4 text-sm font-semibold text-slate-400 print:text-gray-500 uppercase tracking-wider">Description</th>
                <th className="text-right pb-4 text-sm font-semibold text-slate-400 print:text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-6 text-lg text-white print:text-black font-medium">{transaction.procedure_name}</td>
                <td className="py-6 text-lg text-white print:text-black font-mono text-right">
                  PHP {Number(transaction.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center border-t border-slate-700/50 print:border-gray-300 pt-6">
          <p className="text-slate-400 print:text-gray-500">Thank you for your business!</p>
          <div className="text-right">
            <p className="text-sm text-slate-400 print:text-gray-500 uppercase tracking-wider mb-1">Total Paid</p>
            <p className="text-3xl font-black text-amber-500 print:text-black font-mono">
              PHP {Number(transaction.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-8 print:hidden">
        <button 
          onClick={handlePrint}
          className="flex-1 bg-[#1e293b] hover:bg-slate-700 text-white py-4 rounded-xl border border-slate-700 flex items-center justify-center gap-3 font-medium transition-colors"
        >
          <Printer size={20} /> Print Receipt
        </button>
        <button 
          onClick={handlePrint}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-[#0f172a] py-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-colors shadow-lg shadow-amber-500/20"
        >
          <Download size={20} /> Download PDF
        </button>
      </div>
    </div>
  );
}