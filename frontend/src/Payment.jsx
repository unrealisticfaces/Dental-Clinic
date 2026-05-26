import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Search, User, CheckCircle2, ChevronRight, Calculator, FileText, Activity, AlertCircle } from 'lucide-react';

export default function Payment() {
  const navigate = useNavigate();
  const [procedures, setProcedures] = useState([
    { id: '1', name: 'Dental Consultation' },
    { id: '2', name: 'Teeth Cleaning (Prophylaxis)' },
    { id: '3', name: 'Tooth Extraction' },
    { id: '4', name: 'Dental Fillings' },
    { id: '5', name: 'Root Canal Therapy' },
    { id: '6', name: 'Teeth Whitening' },
    { id: '7', name: 'Orthodontic Braces Adjustment' },
    { id: '8', name: 'Dental Crowns / Bridges' },
    { id: '9', name: 'Dentures Fitting' },
    { id: '10', name: 'Dental X-Ray' },
    { id: '11', name: 'Wisdom Tooth Removal' },
    { id: '12', name: 'Dental Implants' },
    { id: '13', name: 'Fluoride Treatment' },
    { id: '14', name: 'Porcelain Veneers' },
    { id: '15', name: 'Periodontal Treatment' },
    { id: '16', name: 'TMJ Therapy' },
    { id: '17', name: 'Sealants' },
    { id: '18', name: 'Inlays and Onlays' }
  ]);
  const [patientSearch, setPatientSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedProcedure, setSelectedProcedure] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/procedures')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setProcedures(res.data);
        }
      })
      .catch(err => console.error(err));
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
      setError('Failed to process payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 h-full flex flex-col relative">
      
      {isProcessing && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <Activity className="animate-pulse text-blue-600 mb-4" size={56} />
          <h3 className="text-xl font-bold text-gray-900">Processing Payment...</h3>
          <p className="text-gray-500 text-sm mt-2">Please wait, securing transaction.</p>
        </div>
      )}

      {successData ? (
        <div className="max-w-md mx-auto pt-10 pb-8 h-full flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5 border-4 border-white shadow-sm">
            <CheckCircle2 className="text-emerald-600" size={40} />
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-widest">Payment Successful</h2>
          <p className="text-gray-500 mb-8 text-sm font-medium">The transaction has been successfully recorded.</p>

          {/* Transaction Summary Preview */}
          <div className="w-full bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm text-left">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
              Transaction Summary
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-0.5">Patient</span>
                <span className="text-sm font-bold text-gray-900 uppercase text-right">{successData.patientName}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-0.5">Procedure</span>
                <span className="text-sm font-bold text-gray-900 uppercase text-right">{successData.procedureName}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-200 mt-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Amount Settled</span>
                <span className="text-xl font-black font-mono text-emerald-600">
                  PHP {Number(successData.amountPaid).toLocaleString('en-US', {minimumFractionDigits: 2})}
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              setSuccessData(null);
              setSelectedPatient(null);
              setSelectedProcedure('');
              setAmount('');
              setPatientSearch('');
            }}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-md transition-all shadow-sm uppercase tracking-widest text-sm"
          >
            Process Another Payment
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <CreditCard className="text-blue-600" size={20} />
              Process Payment
            </h2>
            <p className="text-gray-500 text-xs mt-1">Create a new billing transaction.</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-2.5 rounded-md flex items-center gap-2 text-xs">
              <AlertCircle size={16} />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col min-h-[340px]">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 mb-3">
                <User className="text-blue-600" size={16} /> Step 1: Select Patient
              </h3>

              {!selectedPatient ? (
                <div className="flex-1 flex flex-col">
                  <div className="relative mb-2">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <Search className="text-gray-400" size={14} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Search by Name or Account..." 
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs text-gray-900 placeholder-gray-400 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto border border-gray-200 rounded-md bg-gray-50">
                    {isSearching ? (
                      <div className="p-4 flex justify-center">
                        <Activity className="animate-pulse text-blue-500" size={18} />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {searchResults.map(patient => (
                          <li 
                            key={patient.id}
                            onClick={() => {
                              setSelectedPatient(patient);
                              setPatientSearch('');
                              setSearchResults([]);
                            }}
                            className="p-2 hover:bg-white cursor-pointer transition-colors flex items-center justify-between group"
                          >
                            <div>
                              <p className="text-xs text-gray-900 font-bold uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                                {patient.first_name} {patient.last_name}
                              </p>
                              <p className="text-gray-500 text-[10px] font-mono mt-0.5 font-semibold tracking-wider">{patient.unique_id}</p>
                            </div>
                            <ChevronRight className="text-gray-400 group-hover:text-blue-500" size={14} />
                          </li>
                        ))}
                      </ul>
                    ) : patientSearch ? (
                      <div className="p-4 text-center text-xs text-gray-500 font-bold uppercase tracking-wider">No patients found.</div>
                    ) : (
                      <div className="p-4 text-center text-gray-400 flex flex-col items-center justify-center h-full">
                        <Search size={20} className="mb-1 opacity-30" />
                        <p className="text-[10px] font-bold uppercase tracking-wider">Type to search</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2 border border-blue-100">
                    <CheckCircle2 className="text-blue-600" size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mb-0.5 tracking-tight text-center uppercase">
                    {selectedPatient.first_name} {selectedPatient.last_name}
                  </h4>
                  <p className="text-gray-600 font-mono font-bold tracking-wider bg-gray-100 px-1.5 py-0.5 rounded text-[10px] mb-4">
                    {selectedPatient.unique_id}
                  </p>
                  <button 
                    onClick={() => setSelectedPatient(null)}
                    className="text-gray-500 hover:text-gray-900 border border-gray-300 px-3 py-1 rounded-md transition-colors text-[10px] font-bold uppercase tracking-wider bg-white"
                  >
                    Change Patient
                  </button>
                </div>
              )}
            </div>

            <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col min-h-[340px] transition-opacity duration-300 ${!selectedPatient ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 mb-4">
                <FileText className="text-blue-600" size={16} /> Step 2: Billing Details
              </h3>

              <div className="space-y-3 flex-1">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Procedure Rendered
                  </label>
                  <div className="relative">
                    <select 
                      value={selectedProcedure}
                      onChange={(e) => setSelectedProcedure(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-300 text-xs text-gray-900 font-semibold p-2 rounded-md focus:border-blue-500 outline-none transition-all cursor-pointer uppercase"
                    >
                      <option value="" disabled>-- Select a Procedure --</option>
                      {procedures.map(proc => (
                        <option key={proc.id} value={proc.id}>{proc.name}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                      <ChevronRight className="rotate-90" size={12} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Amount Settled (PHP)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-bold text-xs">₱</span>
                    </div>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:border-blue-500 outline-none transition-all font-mono text-sm font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Amount</span>
                  <span className="text-xl font-black text-gray-900 font-mono tracking-tight">
                    PHP {amount ? Number(amount).toLocaleString('en-US', {minimumFractionDigits: 2}) : '0.00'}
                  </span>
                </div>

                <button 
                  onClick={handleProcessPayment}
                  disabled={!selectedPatient || !selectedProcedure || !amount}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-md transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Calculator size={14} /> Complete Transaction
                </button>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}