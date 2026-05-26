import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, MapPin, Phone, Hash, Calendar, CreditCard, History, Activity, Printer } from 'lucide-react';

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [profileRes, historyRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/patients/${id}`),
          axios.get(`http://localhost:5000/api/patients/${id}/history`)
        ]);
        setPatient(profileRes.data);
        setHistory(historyRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Activity className="animate-pulse text-blue-600" size={36} />
      </div>
    );
  }

  if (!patient) {
    return <div className="text-gray-800 text-lg text-center pt-20 font-bold">Patient not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <button 
        onClick={() => navigate('/patients/search')}
        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 mb-4 transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Directory
      </button>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6 flex flex-col">
        <div className="h-24 bg-gray-100 border-b border-gray-200 relative shrink-0">
          <div className="absolute -bottom-8 left-6">
            {patient.photo ? (
              <img src={patient.photo} alt="Profile" className="w-20 h-20 rounded-lg object-cover border-4 border-white bg-white shadow-sm" />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-white flex items-center justify-center border-4 border-white shadow-sm">
                <User className="text-gray-400" size={36} />
              </div>
            )}
          </div>
        </div>
        
        <div className="pt-10 pb-5 px-6 flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1 min-w-0 overflow-hidden">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-1 break-all uppercase">
                {patient.first_name} {patient.middle_name ? `${patient.middle_name} ` : ''}{patient.last_name}
              </h1>
              <p className="text-blue-600 font-mono text-sm font-bold tracking-wider">{patient.unique_id}</p>
            </div>
            
            {/* NEW BUTTON LOGIC HERE */}
            <button 
              onClick={() => navigate(`/patients/${patient.id}/statement`)} 
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-md shadow-sm transition-all shrink-0 w-full sm:w-auto mt-2 sm:mt-0 uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Printer size={14} /> Statement of Account
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="min-w-0 overflow-hidden flex flex-col">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Age</p>
              <div className="flex items-center gap-1.5">
                <Hash size={14} className="text-blue-500 shrink-0" />
                <p className="text-gray-800 text-sm truncate font-semibold uppercase">{patient.age || 'N/A'} Years Old</p>
              </div>
            </div>
            
            <div className="min-w-0 overflow-hidden flex flex-col">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Contact Number</p>
              <div className="flex items-start gap-1.5">
                <Phone size={14} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-gray-800 text-sm break-all leading-snug font-semibold">{patient.contact_number}</p>
              </div>
            </div>
            
            <div className="min-w-0 overflow-hidden flex flex-col">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Home Address</p>
              <div className="flex items-start gap-1.5">
                <MapPin size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-gray-800 text-sm break-all leading-snug font-semibold uppercase">{patient.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
          <History className="text-blue-600" size={20} />
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Treatment & Payment History</h2>
        </div>

        <div className="space-y-3">
          {history.length > 0 ? (
            history.map((record) => (
              <div key={record.id} className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-blue-300 transition-colors shadow-sm">
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h4 className="text-gray-900 text-sm font-semibold mb-1 break-all uppercase">{record.procedure_name}</h4>
                  <span className="flex items-center gap-1.5 text-gray-500 text-xs">
                    <Calendar size={12} className="shrink-0" /> 
                    {new Date(record.transaction_date).toLocaleDateString('en-US', { 
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div className="flex flex-col items-start md:items-end shrink-0 mt-2 md:mt-0">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5 font-bold">Amount Paid</span>
                  <span className="flex items-center gap-1 text-gray-900 font-mono text-base font-bold bg-gray-50 px-3 py-1 rounded border border-gray-200">
                    PHP {Number(record.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 border-dashed text-center">
              <CreditCard className="mx-auto text-gray-400 mb-2" size={24} />
              <p className="text-gray-500 text-sm">No transaction history found for this patient.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}