import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Printer, ArrowLeft, CheckCircle2, Activity, Phone, MapPin, Mail, Download } from 'lucide-react';

export default function Receipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // To handle the ?action=download parameter
  const [transaction, setTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/transactions/${id}`);
        setTransaction(response.data);
      } catch (error) {
        console.error("Error fetching transaction:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransaction();
  }, [id]);

  // If the user arrived with ?action=download, automatically trigger the print dialog.
  useEffect(() => {
    if (!isLoading && transaction && searchParams.get('action') === 'download') {
      setTimeout(() => {
        window.print();
      }, 500); // Small delay to ensure CSS renders before print fires
    }
  }, [isLoading, transaction, searchParams]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Activity className="animate-pulse text-blue-500" size={48} />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center pt-20">
        <h2 className="text-2xl font-bold text-white mb-4">Transaction Not Found</h2>
        <button onClick={() => navigate(-1)} className="text-blue-500 hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #printable-receipt, #printable-receipt * {
              visibility: visible;
            }
            #printable-receipt {
              position: absolute;
              left: 50%;
              top: 0;
              transform: translateX(-50%);
              width: 100%;
              max-width: 48rem !important;
              margin: 0;
              padding: 2rem !important;
              border-top: 8px solid #2563eb !important; 
            }
          }
        `}
      </style>

      <div className="max-w-3xl mx-auto pb-10 h-full flex flex-col">
        
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 print:hidden">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/transactions/search')}
              className="text-slate-400 hover:text-white flex items-center gap-2 font-medium transition-colors p-2 rounded-lg hover:bg-slate-800"
            >
              <ArrowLeft size={18} /> Back to History
            </button>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={handlePrint}
              className="bg-[#1e293b] hover:bg-slate-800 border border-slate-600 text-white font-medium px-4 py-2.5 rounded-lg transition-all w-full sm:w-auto flex justify-center items-center gap-2"
            >
              <Printer size={18} /> Print
            </button>
            <button 
              onClick={handlePrint} // Same logic. Ask user to choose "Save as PDF" in dialog
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2 transition-all w-full sm:w-auto justify-center"
            >
              <Download size={18} /> Save as PDF
            </button>
          </div>
        </div>

        {/* The Receipt Paper */}
        <div 
          id="printable-receipt" 
          className="bg-white text-slate-800 rounded-lg shadow-2xl p-8 md:p-12 border-t-8 border-blue-600 print:shadow-none"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-200 pb-8 mb-8">
            <div>
              <h1 className="text-3xl font-black text-blue-900 tracking-tight mb-2">PREMIER DENTAL CLINIC</h1>
              <div className="text-slate-500 text-sm space-y-1">
                <p className="flex items-center gap-1.5"><MapPin size={14} /> 123 Clinic Avenue, Medical District, Cebu City</p>
                <p className="flex items-center gap-1.5"><Phone size={14} /> +63 912 345 6789</p>
                <p className="flex items-center gap-1.5"><Mail size={14} /> billing@premierdental.com</p>
              </div>
            </div>
            <div className="mt-6 md:mt-0 text-left md:text-right">
              <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-widest mb-2">Official Receipt</h2>
              <p className="text-sm font-semibold text-slate-500">OR No: <span className="text-red-600 font-mono text-lg ml-1">#{String(transaction.id).padStart(6, '0')}</span></p>
              <p className="text-sm font-semibold text-slate-500 mt-1">Date: <span className="text-slate-800 ml-1">
                {new Date(transaction.transaction_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span></p>
            </div>
          </div>

          {/* Patient Info */}
          <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Billed To</h3>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xl font-bold text-slate-800">{transaction.first_name} {transaction.last_name}</p>
                <p className="text-slate-500 font-mono text-sm mt-1">Account No: {transaction.unique_id}</p>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="min-h-[200px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800 text-slate-800 uppercase text-xs font-bold">
                  <th className="py-3 px-2">Description / Procedure Rendered</th>
                  <th className="py-3 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-slate-200">
                  <td className="py-5 px-2 font-medium text-slate-700">{transaction.procedure_name}</td>
                  <td className="py-5 px-2 text-right font-mono font-medium text-slate-700">
                    PHP {Number(transaction.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures & Total Block */}
          <div className="mt-8 pt-8 border-t-2 border-slate-200">
            <div className="flex justify-between items-end mb-2">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 size={20} />
                <span className="font-bold uppercase tracking-wider text-sm">Payment Received</span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-right pr-2">Total Paid</p>
            </div>

            <div className="flex flex-row justify-between items-end">
              <div className="w-48 sm:w-64 border-b border-slate-500 pb-1"></div>
              
              <div className="text-right inline-block border-b-[3px] border-double border-slate-800 pb-1 pr-1">
                <span className="text-2xl sm:text-3xl font-black font-mono text-slate-800 leading-none">
                  PHP {Number(transaction.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex flex-row justify-between items-start mt-2">
              <div className="w-48 sm:w-64 text-center">
                <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest font-bold">Authorized Signature</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-slate-400 text-xs">
            <p className="font-medium">Thank you for trusting Premier Dental Clinic!</p>
            <p className="mt-1">This document serves as your official proof of payment.</p>
          </div>
        </div>
      </div>
    </>
  );
}