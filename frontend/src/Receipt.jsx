import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Printer, ArrowLeft, Download, Activity, Building, MapPin, Phone } from 'lucide-react';

export default function Receipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [transaction, setTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/transactions/${id}`);
        const txData = response.data;

        if (!txData.address && txData.patient_id) {
          try {
            const ptRes = await axios.get(`http://localhost:5000/api/patients/${txData.patient_id}`);
            txData.address = ptRes.data.address;
          } catch (e) {}
        } else if (!txData.address && txData.unique_id) {
          try {
            const searchRes = await axios.get(`http://localhost:5000/api/patients/search?q=${txData.unique_id}`);
            if (searchRes.data && searchRes.data.length > 0) {
              txData.address = searchRes.data[0].address;
            }
          } catch (e) {}
        }

        setTransaction(txData);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransaction();
  }, [id]);

  useEffect(() => {
    if (!isLoading && transaction && searchParams.get('action') === 'download') {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [isLoading, transaction, searchParams]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Activity className="animate-pulse text-blue-600" size={36} />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center pt-20">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Transaction Not Found</h2>
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline font-medium">Return to Dashboard</button>
      </div>
    );
  }

  const receiptNo = String(transaction.id).padStart(6, '0');
  const formattedDate = new Date(transaction.transaction_date).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
  const formattedAmount = Number(transaction.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2 });
  const resolvedAddress = transaction.address || transaction.patient_address || 'Not Provided';

  return (
    <>
      <style>
        {`
          @media print {
            @page { margin: 15mm; }
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              background-color: white !important;
            }
            .print-hidden { 
              display: none !important; 
            }
            #receipt-wrapper {
              height: auto !important;
              padding: 0 !important;
              display: block !important;
            }
            #printable-receipt {
              box-shadow: none !important;
              border: none !important;
              margin: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
            }
          }
        `}
      </style>

      <div id="receipt-wrapper" className="max-w-4xl mx-auto pb-10 h-full flex flex-col font-sans">
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 print-hidden">
          <button 
            onClick={() => navigate('/')}
            className="text-slate-500 hover:text-slate-900 flex items-center gap-2 font-semibold transition-colors px-3 py-2 rounded-md hover:bg-slate-200 text-sm"
          >
            <ArrowLeft size={16} /> Dashboard
          </button>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={handlePrint}
              className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold px-5 py-2.5 rounded-md transition-all flex items-center justify-center gap-2 text-sm shadow-sm flex-1 sm:flex-none"
            >
              <Printer size={16} /> Print Receipt
            </button>
            <button 
              onClick={handlePrint}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-2.5 rounded-md shadow-sm flex items-center justify-center gap-2 transition-all text-sm flex-1 sm:flex-none"
            >
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>

        <div 
          id="printable-receipt" 
          className="bg-white mx-auto w-full max-w-3xl shadow-xl border border-slate-200 rounded-sm overflow-hidden"
        >
          <div className="h-4 w-full bg-slate-900"></div>
          <div className="h-1 w-full bg-blue-600"></div>

          <div className="p-10 md:p-14">
            
            <div className="flex flex-col md:flex-row justify-between items-start mb-12 border-b-2 border-slate-100 pb-8">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-4">Premier Dental Clinic</h1>
                
                <div className="flex flex-col gap-1.5 mt-3">
                  <div className="flex items-center gap-1.5">
                    <Building size={14} className="text-slate-400 shrink-0" />
                    <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">123 Clinic Avenue, Medical District</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">Cebu City, Philippines 6000</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">+63 912 345 6789</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 md:mt-0 md:text-right">
                <h2 className="text-3xl font-light text-slate-300 uppercase tracking-widest mb-4">Official Receipt</h2>
                <div className="inline-block text-left bg-slate-50 border border-slate-200 p-3 rounded-md min-w-[200px]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Receipt No.</span>
                    <span className="font-mono text-base font-bold text-red-600">#{receiptNo}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</span>
                    <span className="text-xs font-bold text-slate-800">{formattedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-12 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Billed To</p>
                <h3 className="font-black text-xl text-slate-900 uppercase tracking-wider mb-5">
                  {transaction.first_name} {transaction.last_name}
                </h3>
                
                <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-3">
                  <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">Account No:</span> 
                  <span className="text-slate-700 font-mono text-xs font-bold tracking-wider">{transaction.unique_id}</span>
                  
                  <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">Address:</span>
                  <span className="text-slate-600 text-xs font-medium uppercase leading-relaxed max-w-md">
                    {resolvedAddress}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-8 min-h-[200px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y-2 border-slate-800">
                    <th className="py-3 px-4 text-xs font-bold text-slate-800 uppercase tracking-widest w-3/4">Procedure Rendered</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-800 uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-6 px-4 text-sm font-bold text-slate-800 uppercase tracking-wider align-top">
                      {transaction.procedure_name}
                    </td>
                    <td className="py-6 px-4 text-right font-mono font-bold text-slate-900 text-base align-top">
                      {formattedAmount}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mb-16">
              <div className="w-72">
                <div className="flex justify-between items-center py-2 text-sm border-b border-slate-200">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-xs">Subtotal</span>
                  <span className="font-mono font-semibold text-slate-800">{formattedAmount}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-sm border-b border-slate-800">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-xs">VAT (0%)</span>
                  <span className="font-mono font-semibold text-slate-800">0.00</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Total Settled</span>
                  <span className="text-xl font-black font-mono text-slate-900">
                    PHP {formattedAmount}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mt-24">
              <div>
              </div>
              <div className="text-right">
                <div className="border-b border-slate-800 w-56 ml-auto mb-2"></div>
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Authorized Signature</p>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">Clinic Administrator</p>
              </div>
            </div>

            <div className="mt-16 pt-6 border-t border-slate-200 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                This document is a system-generated official receipt.
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}