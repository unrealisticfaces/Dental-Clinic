import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Payment() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [procedures, setProcedures] = useState([]);
  const [selectedProcedure, setSelectedProcedure] = useState('');
  const [amount, setAmount] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/procedures')
      .then(res => res.json())
      .then(data => setProcedures(data))
      .catch(() => toast.error('Failed to load procedures'));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const res = await fetch(`http://localhost:5000/api/patients/search?q=${searchQuery}`);
      const data = await res.json();
      setSearchResults(data);
      if (data.length === 0) toast.info('No patients found');
    } catch {
      toast.error('Search failed');
    }
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !selectedProcedure || !amount) {
      toast.error('Please complete all fields');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          procedure_id: selectedProcedure,
          amount_paid: amount
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Payment processed successfully');
        navigate(`/transactions/receipt/${data.transactionId}`);
      } else {
        toast.error(data.error || 'Payment failed');
      }
    } catch {
      toast.error('Payment processing failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-white flex items-center gap-3">
        <CreditCard className="text-amber-500" size={32} />
        Process Payment
      </h2>

      <div className="bg-[#1e293b] p-6 rounded-xl border border-slate-800">
        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search patient by Name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0f172a] text-white border border-slate-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <button type="submit" className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition-colors font-medium">
            Search
          </button>
        </form>

        {searchResults.length > 0 && !selectedPatient && (
          <div className="space-y-2 mb-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Search Results</h3>
            {searchResults.map(patient => (
              <div 
                key={patient.id} 
                onClick={() => setSelectedPatient(patient)}
                className="bg-[#0f172a] p-4 rounded-lg border border-slate-700 hover:border-amber-500 cursor-pointer flex justify-between items-center transition-all"
              >
                <div>
                  <p className="font-bold text-lg text-white">{patient.first_name} {patient.last_name}</p>
                  <p className="text-sm text-slate-400">ID: {patient.unique_id}</p>
                </div>
                <button className="text-amber-500 font-medium">Select</button>
              </div>
            ))}
          </div>
        )}

        {selectedPatient && (
          <form onSubmit={handleProcessPayment} className="space-y-6">
            <div className="bg-[#0f172a] p-4 rounded-lg border border-amber-500/30 flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-400">Selected Patient</p>
                <p className="font-bold text-xl text-white">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                <p className="text-sm text-amber-500">ID: {selectedPatient.unique_id}</p>
              </div>
              <button type="button" onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-white text-sm underline">
                Change Patient
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Procedure</label>
                <select
                  value={selectedProcedure}
                  onChange={(e) => setSelectedProcedure(e.target.value)}
                  className="w-full bg-[#0f172a] text-white border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500"
                >
                  <option value="">Select a procedure...</option>
                  {procedures.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Amount (PHP)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#0f172a] text-white border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-[#0f172a] font-bold text-lg py-4 rounded-lg transition-colors shadow-lg shadow-amber-500/20">
                Complete Payment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}