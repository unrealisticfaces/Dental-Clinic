import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Search, User, CheckCircle2, ChevronRight, Calculator, FileText, Activity, AlertCircle, Printer, Download } from 'lucide-react';

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
  const [successData, setSuccessData] = useState(null); // <-- NEW STATE FOR PREVIEW

  useEffect(() => {
    axios.get('http://localhost:5000/api/procedures')
      .then(res => setProcedures(res.data))
      .catch(err => console.error("Failed to load procedures:", err));
  }, []);

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

    const delayDebounceFn = setTimeout(() => searchPatients(), 300);
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
        // INSTEAD OF REDIRECTING, WE SHOW PREVIEW
        const procName = procedures.find(p => p.id.toString() === selectedProcedure.toString())?.name;
        
        setSuccessData({
          transactionId: response.data.transactionId,
          patientName: `${selectedPatient.first_name} ${selectedPatient.last_name}`,
          procedureName: procName,
          amountPaid: amount,
          date: new Date()
        });
      }
    } catch (err) {
      setError('Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // SUCCESS SCREEN UI
  if (successData) {
    return (
      <div className="max-w-2xl mx-auto pt-10 pb-10 h-full flex flex-col items-center animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border-4 border-emerald-500/20">
          <CheckCircle2 className="text-emerald-500" size={40} />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
        <p className="text-slate-400 mb-8 text-center">Transaction has been recorded and the receipt is ready.</p>

        <div className="bg-[#1e293b] border border-slate-700/60 rounded-xl p-6 w-full shadow-lg mb-8">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-3">Transaction Preview</h3>
          
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Patient Name:</span>
              <span className="text-white font-medium">{successData.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Procedure Rendered:</span>
              <span className="text-white font-medium">{successData.procedureName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date:</span>
              <span className="text-white">{successData.date.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-end pt-4 border-t border-slate-700/50 mt-4">
              <span className="text-slate-400 font-semibold">Total Paid:</span>
              <span className="text-2xl font-mono font-bold text-blue-400">
                PHP {Number(successData.amountPaid).toLocaleString('en-US', {minimumFractionDigits: 2})}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button 
            onClick={() => navigate(`/transactions/receipt/${successData.transactionId}`)}
            className="flex-1 bg-[#0f172a] hover:bg-slate-800 border border-slate-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FileText size={18} /> View Official Receipt
          </button>
          
          <button 
            onClick={() => navigate(`/transactions/receipt/${successData.transactionId}?action=download`)}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Download size={18} /> Download Receipt (PDF)
          </button>
        </div>

        <button 
          onClick={() => {
            setSuccessData(null);
            setSelectedPatient(null);
            setSelectedProcedure('');
            setAmount('');
            setPatientSearch('');
          }}
          className="mt-8 text-slate-500 hover:text-white underline text-sm transition-colors"
        >
          Process another payment
        </button>
      </div>
    );
  }

  // DEFAULT FORM UI
  return (
    <div className="max-w-5xl mx-auto pb-10 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <CreditCard className="text-blue-500" size={26} />
          Process Payment
        </h2>
        <p className="text-slate-400 text-sm mt-1">Create a new billing transaction and generate an official receipt.</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle size={18} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: PATIENT SELECTION */}
        <div className="bg-[#1e293b] rounded-xl border border-slate-700/60 shadow-lg p-5 flex flex-col min-h-[380px]">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <User className="text-blue-500" size={18} /> Step 1: Select Patient
          </h3>

          {!selectedPatient ? (
            <div className="flex-1 flex flex-col">
              <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-slate-400" size={16} />
                </div>
                <input 
                  type="text" 
                  placeholder="Search by Name or Account No..." 
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0f172a] border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:border-blue-500 outline-none transition-all"
                  autoFocus
                />
              </div>

              <div className="flex-1 overflow-y-auto border border-slate-700/50 rounded-lg bg-[#0f172a]/50">
                {isSearching ? (
                  <div className="p-6 flex justify-center">
                    <Activity className="animate-pulse text-blue-500" size={20} />
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
                        className="p-3 hover:bg-blue-500/10 cursor-pointer transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-sm text-white font-medium group-hover:text-blue-400 transition-colors">
                            {patient.first_name} {patient.last_name}
                          </p>
                          <p className="text-slate-500 text-[11px] font-mono mt-0.5">{patient.unique_id}</p>
                        </div>
                        <ChevronRight className="text-slate-600 group-hover:text-blue-500" size={16} />
                      </li>
                    ))}
                  </ul>
                ) : patientSearch ? (
                  <div className="p-6 text-center text-sm text-slate-500">No patients found.</div>
                ) : (
                  <div className="p-6 text-center text-slate-600 flex flex-col items-center justify-center h-full">
                    <Search size={24} className="mb-2 opacity-20" />
                    <p className="text-xs">Type a name to search</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-3 border-2 border-blue-500/20">
                <CheckCircle2 className="text-blue-500" size={28} />
              </div>
              <h4 className="text-lg font-bold text-white mb-1 tracking-tight text-center">
                {selectedPatient.first_name} {selectedPatient.last_name}
              </h4>
              <p className="text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded text-xs mb-6">
                {selectedPatient.unique_id}
              </p>
              
              <button 
                onClick={() => setSelectedPatient(null)}
                className="text-slate-400 hover:text-white border border-slate-600 px-4 py-1.5 rounded-lg transition-colors text-xs font-medium"
              >
                Change Patient
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: BILLING DETAILS */}
        <div className={`bg-[#1e293b] rounded-xl border border-slate-700/60 shadow-lg p-5 flex flex-col min-h-[380px] transition-opacity duration-300 ${!selectedPatient ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-5">
            <FileText className="text-blue-500" size={18} /> Step 2: Billing Details
          </h3>

          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Procedure Rendered
              </label>
              <div className="relative">
                <select 
                  value={selectedProcedure}
                  onChange={(e) => setSelectedProcedure(e.target.value)}
                  className="w-full appearance-none bg-[#0f172a] border border-slate-600 text-sm text-white p-2.5 rounded-lg focus:border-blue-500 outline-none transition-all cursor-pointer"
                >
                  <option value="" disabled>-- Select a Procedure --</option>
                  {procedures.map(proc => (
                    <option key={proc.id} value={proc.id}>{proc.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                  <ChevronRight className="rotate-90" size={14} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Amount Settled (PHP)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-blue-500 font-bold text-sm">₱</span>
                </div>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 bg-[#0f172a] border border-slate-600 rounded-lg text-white placeholder-slate-600 focus:border-blue-500 outline-none transition-all font-mono text-base font-bold"
                />
              </div>
            </div>
          </div>

          <div className="mt-auto pt-5 border-t border-slate-700/60">
            <div className="flex justify-between items-end mb-4">
              <span className="text-sm text-slate-400 font-medium">Total Amount</span>
              <span className="text-2xl font-black text-white font-mono tracking-tight">
                PHP {amount ? Number(amount).toLocaleString('en-US', {minimumFractionDigits: 2}) : '0.00'}
              </span>
            </div>

            <button 
              onClick={handleProcessPayment}
              disabled={isProcessing || !selectedPatient || !selectedProcedure || !amount}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm py-2.5 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <><Activity className="animate-pulse" size={16} /> Processing...</>
              ) : (
                <><Calculator size={16} /> Complete Transaction</>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}