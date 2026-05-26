import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, History, User, Calendar, CreditCard, ChevronRight, Activity } from 'lucide-react';

export default function PatientDirectory() {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch patients (with live search)
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/patients?query=${searchQuery}`);
        setPatients(response.data);
      } catch (error) {
        console.error("Failed to fetch patients:", error);
      }
    };

    // Simple debounce to prevent spamming the database on every keystroke
    const delayDebounceFn = setTimeout(() => {
      fetchPatients();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Fetch history when a patient is clicked
  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/patients/${patient.id}/history`);
      setPatientHistory(response.data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 h-full flex flex-col">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <User className="text-emerald-500" size={32} />
            Patient Directory
          </h2>
          <p className="text-slate-400 mt-1">Search patients and view their clinic history.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-slate-400" size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search by Name, ID, or Phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 p-3 bg-[#1e293b] border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        
        {/* Left Side: Patient List Table */}
        <div className="lg:col-span-2 bg-[#1e293b] rounded-2xl border border-slate-700/60 shadow-xl overflow-hidden flex flex-col h-[600px]">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-xs sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="p-4 font-semibold">Patient ID</th>
                  <th className="p-4 font-semibold">Full Name</th>
                  <th className="p-4 font-semibold">Contact</th>
                  <th className="p-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <tr 
                      key={patient.id} 
                      onClick={() => handleSelectPatient(patient)}
                      className={`hover:bg-slate-700/30 cursor-pointer transition-colors ${selectedPatient?.id === patient.id ? 'bg-slate-700/50 border-l-4 border-emerald-500' : 'border-l-4 border-transparent'}`}
                    >
                      <td className="p-4 font-mono font-bold text-emerald-400">{patient.unique_id}</td>
                      <td className="p-4 font-medium text-white">
                        {patient.first_name} {patient.last_name}
                      </td>
                      <td className="p-4 text-slate-400">{patient.contact_number}</td>
                      <td className="p-4 text-right">
                        <button className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
                          View <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-500">
                      No patients found matching "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Patient History Panel */}
        <div className="lg:col-span-1 bg-gradient-to-b from-[#1e293b] to-slate-900 rounded-2xl border border-slate-700/60 shadow-xl p-6 flex flex-col h-[600px]">
          {selectedPatient ? (
            <>
              {/* Profile Header */}
              <div className="flex items-center gap-4 border-b border-slate-700/60 pb-6 mb-6">
                {selectedPatient.photo ? (
                  <img src={selectedPatient.photo} alt="Profile" className="w-16 h-16 rounded-xl object-cover border border-slate-600 shadow-md" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 shadow-md">
                    <User className="text-slate-400" size={32} />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-white leading-tight">
                    {selectedPatient.first_name} {selectedPatient.last_name}
                  </h3>
                  <p className="text-emerald-400 font-mono text-sm">{selectedPatient.unique_id}</p>
                </div>
              </div>

              {/* History Timeline */}
              <div className="flex items-center gap-2 text-slate-200 font-semibold mb-4">
                <History className="text-blue-400" size={20} /> Treatment History
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                    <Activity className="animate-pulse mb-2 text-blue-500" size={24} />
                    Loading records...
                  </div>
                ) : patientHistory.length > 0 ? (
                  patientHistory.map((record) => (
                    <div key={record.id} className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors">
                      <h4 className="text-white font-medium mb-2">{record.procedure_name}</h4>
                      
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} /> 
                          {new Date(record.transaction_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400 font-medium bg-emerald-400/10 px-2 py-1 rounded">
                          <CreditCard size={14} /> 
                          ${record.amount_paid}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700 border-dashed text-center">
                    <p className="text-slate-400 text-sm">No transaction history found for this patient.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Empty State
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="bg-slate-800/50 p-4 rounded-full mb-4">
                <Search className="text-slate-500" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-300 mb-1">No Patient Selected</h3>
              <p className="text-sm text-slate-500">Click on a patient from the directory on the left to view their detailed treatment history.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}