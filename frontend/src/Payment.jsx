import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Search, User, CheckCircle2, ChevronRight, Calculator, FileText, Activity, AlertCircle } from 'lucide-react';

export default function Payment() {
  const navigate = useNavigate();
  
  // State
  const [procedures, setProcedures] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Form State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedProcedure, setSelectedProcedure] = useState('');
  const [amount, setAmount] = useState('');
  
  // UI State
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Fetch standard procedures on load
  useEffect(() => {
    axios.get('http://localhost:5000/api/procedures')
      .then(res => setProcedures(res.data))
      .catch(err => console.error("Failed to load procedures:", err));
  }, []);

  // Live search for patients
  useEffect(() => {
    if (!patientSearch.trim()) {
      setSearchResults([]);
      return;
    }

    const searchPatients = async () => {
      setIsSearching(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/patients/search?q=${patientSearch}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      searchPatients();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [patientSearch]);

  const handleProcessPayment = async () => {
    setError('');
    if (!selectedPatient) return setError('Please select a patient.');
    if (!selectedProcedure) return setError('Please select a procedure.');
    if (!amount || isNaN(amount) || Number(amount) <= 0) return setError('Please enter a valid amount.');

    setIsProcessing(true);
    try {
      const response = await axios.post('http://localhost:5000/api/transactions', {
        patient_id: selectedPatient.id,
        procedure_id: selectedProcedure,
        amount_paid: Number(amount)
      });
      
      if (response.data.success) {
        // Navigate straight to the new receipt page
        navigate(`/transactions/receipt/${response.data.transactionId}`);
      }
    } catch (err) {
      setError('Failed to process payment. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <CreditCard className="text-blue-500" size={32} />
          Process Payment
        </h2>
        <p className="text-slate-400 mt-2">Create a new billing transaction and generate an official receipt.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3 animate-in fade-in">
          <AlertCircle size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: PATIENT SELECTION */}
        <div className="bg-[#1e293b] rounded-2xl border border-slate-700/60 shadow-xl p-6 flex flex-col h-[550px]">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
            <User className="text-blue-500" size={20} /> Step 1: Select Patient
          </h3>

          {!selectedPatient ? (
            <div className="flex-1 flex flex-col">
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="text-slate-400" size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="Search by Name or Account Number..." 
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#0f172a] border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  autoFocus
                />
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-700/50 rounded-xl bg-[#0f172a]/50">
                {isSearching ? (
                  <div className="p-8 flex justify-center">
                    <Activity className="animate-pulse text-blue-500" size={24} />
                  </div>
                ) : searchResults.length > 0 ? (
                  <ul className="divide-y divide-slate-700/50">
                    {searchResults.map(patient => (
                      <li 
                        key={patient.id}
                        onClick={() => {
                          setSelectedPatient(patient);
                          setPatientSearch('');
                          setSearchResults([]);
                        }}
                        className="p-4 hover:bg-blue-500/10 cursor-pointer transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-white font-medium group-hover:text-blue-400 transition-colors">
                            {patient.first_name} {patient.last_name}
                          </p>
                          <p className="text-slate-500 text-xs font-mono mt-0.5">{patient.unique_id}</p>
                        </div>
                        <ChevronRight className="text-slate-600 group-hover:text-blue-500 transition-colors" size={18} />
                      </li>
                    ))}
                  </ul>
                ) : patientSearch ? (
                  <div className="p-8 text-center text-slate-500">No patients found.</div>
                ) : (
                  <div className="p-8 text-center text-slate-600 flex flex-col items-center justify-center h-full">
                    <Search size={32} className="mb-3 opacity-20" />
                    <p className="text-sm">Type a name to search our database</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in-95 duration-200">
              <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border-4 border-blue-500/20">
                <CheckCircle2 className="text-blue-500" size={40} />
              </div>
              <h4 className="text-2xl font-bold text-white mb-1 tracking-tight text-center">
                {selectedPatient.first_name} {selectedPatient.last_name}
              </h4>
              <p className="text-slate-400 font-mono bg-slate-800 px-3 py-1 rounded-lg text-sm mb-8">
                {selectedPatient.unique_id}
              </p>
              
              <button 
                onClick={() => setSelectedPatient(null)}
                className="text-slate-400 hover:text-white border border-slate-600 hover:border-slate-500 px-6 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                Change Patient
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: BILLING DETAILS */}
        <div className={`bg-[#1e293b] rounded-2xl border border-slate-700/60 shadow-xl p-6 flex flex-col h-[550px] transition-opacity duration-300 ${!selectedPatient ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
            <FileText className="text-blue-500" size={20} /> Step 2: Billing Details
          </h3>

          <div className="space-y-6 flex-1">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Procedure Rendered
              </label>
              <div className="relative">
                <select 
                  value={selectedProcedure}
                  onChange={(e) => setSelectedProcedure(e.target.value)}
                  className="w-full appearance-none bg-[#0f172a] border border-slate-600 text-white p-4 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium cursor-pointer"
                >
                  <option value="" disabled>-- Select a Procedure --</option>
                  {procedures.map(proc => (
                    <option key={proc.id} value={proc.id}>{proc.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                  <ChevronRight className="rotate-90" size={16} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Amount Settled (PHP)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-blue-500 font-bold">₱</span>
                </div>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 bg-[#0f172a] border border-slate-600 rounded-xl text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono text-2xl font-bold"
                />
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-700/60">
            <div className="flex justify-between items-end mb-6">
              <span className="text-slate-400 font-medium">Total Amount</span>
              <span className="text-3xl font-black text-white font-mono tracking-tight">
                PHP {amount ? Number(amount).toLocaleString('en-US', {minimumFractionDigits: 2}) : '0.00'}
              </span>
            </div>

            <button 
              onClick={handleProcessPayment}
              disabled={isProcessing || !selectedPatient || !selectedProcedure || !amount}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
            >
              {isProcessing ? (
                <><Activity className="animate-pulse" size={20} /> Processing...</>
              ) : (
                <><Calculator size={20} /> Complete Transaction</>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}