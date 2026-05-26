import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, MapPin, Phone, Hash, Calendar, CreditCard, History, Activity } from 'lucide-react';

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
        <Activity className="animate-pulse text-amber-500" size={48} />
      </div>
    );
  }

  if (!patient) {
    return <div className="text-white text-xl text-center pt-20 font-bold">Patient not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <button 
        onClick={() => navigate('/patients/search')}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors font-medium"
      >
        <ArrowLeft size={18} /> Back to Directory
      </button>

      <div className="bg-[#1e293b] rounded-2xl border border-slate-700/60 shadow-xl overflow-hidden mb-8">
        <div className="h-32 bg-slate-800 border-b border-slate-700/60 relative">
          <div className="absolute -bottom-12 left-8">
            {patient.photo ? (
              <img src={patient.photo} alt="Profile" className="w-28 h-28 rounded-2xl object-cover border-4 border-[#1e293b] bg-slate-800 shadow-xl" />
            ) : (
              <div className="w-28 h-28 rounded-2xl bg-slate-800 flex items-center justify-center border-4 border-[#1e293b] shadow-xl">
                <User className="text-slate-400" size={48} />
              </div>
            )}
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
                {patient.first_name} {patient.middle_name ? `${patient.middle_name} ` : ''}{patient.last_name}
              </h1>
              <p className="text-amber-500 font-mono text-lg font-medium">{patient.unique_id}</p>
            </div>
            <button onClick={() => navigate('/transactions/payment')} className="bg-amber-500 hover:bg-amber-600 text-[#0f172a] font-bold px-6 py-3 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all">
              Process Payment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 p-6 bg-[#0f172a] rounded-xl border border-slate-700">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Age</p>
              <p className="text-white text-lg flex items-center gap-2">
                <Hash size={18} className="text-amber-500" /> {patient.age} Years Old
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Contact Number</p>
              <p className="text-white text-lg flex items-center gap-2">
                <Phone size={18} className="text-amber-500" /> {patient.contact_number}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Home Address</p>
              <p className="text-white text-lg flex items-start gap-2">
                <MapPin size={18} className="text-amber-500 mt-1 shrink-0" /> {patient.address}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-2xl border border-slate-700/60 shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-700/60 pb-6">
          <History className="text-amber-500" size={28} />
          <h2 className="text-2xl font-bold text-white tracking-tight">Treatment & Payment History</h2>
        </div>

        <div className="space-y-4">
          {history.length > 0 ? (
            history.map((record) => (
              <div key={record.id} className="bg-[#0f172a] p-5 rounded-xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-500/50 transition-colors">
                <div>
                  <h4 className="text-white text-xl font-medium mb-1">{record.procedure_name}</h4>
                  <span className="flex items-center gap-2 text-slate-400 text-sm">
                    <Calendar size={14} /> 
                    {new Date(record.transaction_date).toLocaleDateString('en-US', { 
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-500 uppercase tracking-wider mb-1">Amount Paid</span>
                  <span className="flex items-center gap-1 text-amber-500 font-mono text-2xl font-black bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20">
                    PHP {Number(record.amount_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[#0f172a] p-10 rounded-xl border border-slate-700 border-dashed text-center">
              <CreditCard className="mx-auto text-slate-500 mb-3" size={32} />
              <p className="text-slate-400 text-lg">No transaction history found for this patient.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}