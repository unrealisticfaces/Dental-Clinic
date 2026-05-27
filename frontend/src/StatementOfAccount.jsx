import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Printer, ArrowLeft, Download, Activity, FileText, Building, MapPin, Phone } from 'lucide-react';

export default function StatementOfAccount() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatementData = async () => {
      try {
        const [profileRes, historyRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/patients/${id}`),
          axios.get(`http://localhost:5000/api/patients/${id}/history`)
        ]);
        setPatient(profileRes.data);
        setHistory(historyRes.data);
      } catch (error) {
        console.error("Error fetching statement data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatementData();
  }, [id]);

  useEffect(() => {
    if (!isLoading && patient && searchParams.get('action') === 'download') {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [isLoading, patient, searchParams]);

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

  if (!patient) {
    return (
      <div className="text-center pt-20">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Patient Not Found</h2>
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline font-medium">Return to Directory</button>
      </div>
    );
  }

  const totalAmount = history.reduce((sum, record) => sum + Number(record.amount_paid), 0);
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <style>
        {`
          @media print {
            @page { 
              size: portrait;
              margin: 12mm; 
            }
            body { 
              background-color: white !important; 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
              color-adjust: exact !important; 
            }
            .print-hidden { 
              display: none !important; 
            }
            #printable-statement {
              box-shadow: none !important;
              border: none !important;
              margin: 0 auto !important;
              padding: 0 !important;
              max-width: 100% !important;
            }
          }
        `}
      </style>

      <div className="max-w-4xl mx-auto pb-10 h-full flex flex-col font-sans">
        
        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 print-hidden">
          <button 
            onClick={() => navigate(`/patients/view/${id}`)}
            className="text-slate-500 hover:text-slate-900 flex items-center gap-2 font-semibold transition-colors px-3 py-2 rounded-md hover:bg-slate-200 text-sm"
          >
            <ArrowLeft size={16} /> Back to Profile
          </button>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={handlePrint}
              className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold px-5 py-2.5 rounded-md transition-all flex items-center justify-center gap-2 text-sm shadow-sm flex-1 sm:flex-none"
            >
              <Printer size={16} /> Print Statement
            </button>
            <button 
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-5 py-2.5 rounded-md shadow-sm flex items-center justify-center gap-2 transition-all text-sm flex-1 sm:flex-none"
            >
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>

        {/* Statement Document */}
        <div 
          id="printable-statement" 
          className="bg-white mx-auto w-full max-w-4xl shadow-xl border border-slate-200 overflow-hidden"
        >
          {/* Subtle Top Accent */}
          <div className="h-3 w-full bg-slate-800"></div>

          <div className="p-10 md:p-16">
            
            {/* Header: Letterhead Style */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-12 border-b-2 border-slate-800 pb-8">
              <div className="flex gap-4 items-center">
                <div className="bg-slate-100 text-slate-800 p-3.5 rounded-sm border border-slate-200">
                  <FileText size={32} strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-wider uppercase mb-1">Premier Dental Clinic</h1>
                  <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest">123 Clinic Avenue, Medical District</p>
                  <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest">Cebu City, Philippines 6000</p>
                  <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest mt-1">Tel: +63 912 345 6789</p>
                </div>
              </div>
              
              <div className="mt-6 md:mt-0 md:text-right">
                <h2 className="text-3xl font-light text-slate-800 uppercase tracking-widest mb-1">Statement</h2>
                <h2 className="text-xl font-light text-slate-400 uppercase tracking-widest">Of Account</h2>
              </div>
            </div>

            {/* Account Summary & Patient Info */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
              
              {/* Left: Patient Details */}
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1 w-3/4">Prepared For</p>
                <h3 className="font-black text-xl text-slate-900 uppercase tracking-wider mb-2">
                  {patient.first_name} {patient.last_name}
                </h3>
                <div className="text-slate-600 text-xs font-medium uppercase leading-relaxed max-w-sm">
                  {patient.address || 'Address Not Provided on File'}
                </div>
                <div className="flex items-center gap-2 mt-3 text-slate-600">
                  <Phone size={12} className="text-slate-400" />
                  <span className="text-xs font-mono font-bold tracking-wider">{patient.contact_number}</span>
                </div>
              </div>

              {/* Right: Statement Summary Box */}
              <div className="w-full md:w-80 bg-slate-50 border border-slate-200 rounded-sm p-5">
                <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">Account Summary</h4>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Statement Date</span>
                  <span className="text-xs font-bold text-slate-900">{currentDate}</span>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account No.</span>
                  <span className="text-sm font-black font-mono text-slate-900 tracking-widest">{patient.unique_id}</span>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Visits</span>
                  <span className="text-xs font-bold text-slate-900">{history.length}</span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Total Settled</span>
                  <span className="text-lg font-black font-mono text-slate-900">
                    PHP {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

            </div>

            {/* Ledger Header */}
            <div className="mb-4">
              <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest border-b-2 border-slate-800 pb-2">Transaction Ledger History</p>
            </div>

            {/* Ledger Table */}
            <div className="mb-10 min-h-[300px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="py-2.5 px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest border-y border-slate-300 w-1/5">Date</th>
                    <th className="py-2.5 px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest border-y border-slate-300 w-1/5">Ref No.</th>
                    <th className="py-2.5 px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest border-y border-slate-300 w-2/5">Description</th>
                    <th className="py-2.5 px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest border-y border-slate-300 text-right w-1/5">Amount (PHP)</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length > 0 ? (
                    history.map((record, index) => (
                      <tr key={record.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="py-4 px-4 text-xs font-semibold text-slate-700 align-top border-b border-slate-100">
                          {new Date(record.transaction_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                        </td>
                        <td className="py-4 px-4 text-xs font-mono font-bold text-slate-500 tracking-wider align-top border-b border-slate-100">
                          TXN-{String(record.id).padStart(6, '0')}
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-slate-900 uppercase tracking-wider align-top border-b border-slate-100">
                          {record.procedure_name}
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-slate-900 text-sm align-top border-b border-slate-100">
                          {Number(record.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-sm text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200">
                        No transactions recorded for this account.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* End of Ledger Totals */}
            <div className="flex justify-end mb-16">
              <div className="w-80">
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ending Balance</span>
                  <span className="text-sm font-mono font-bold text-slate-800">0.00</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t-2 border-slate-800 mt-1">
                  <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Total Payments</span>
                  <span className="text-xl font-black font-mono text-slate-900">
                    PHP {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-20 pt-8 border-t border-slate-200 text-center">
              <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-1">
                *** End of Statement ***
              </p>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                If you have any questions regarding this statement, please contact the clinic administrator.
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}