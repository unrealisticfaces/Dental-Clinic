import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, User, ChevronRight, ChevronLeft, Activity, MapPin, Phone, Hash } from 'lucide-react';

export default function PatientDirectory() {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const limit = 10;
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/patients?query=${searchQuery}&page=${currentPage}&limit=${limit}`);
        setPatients(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } catch (error) {
        console.error(error);
      }
    };

    if (searchQuery === '') {
      fetchPatients();
    } else {
      const delayDebounceFn = setTimeout(() => {
        fetchPatients();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, currentPage]);

  const handlePreview = async (patient) => {
    setIsLoadingPreview(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/patients/${patient.id}`);
      setSelectedPatient(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <User className="text-blue-500" size={24} />
            Patient Directory
          </h2>
        </div>
        
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-slate-400" size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search patient..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#1e293b] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm shadow-sm"
            autoFocus
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 bg-[#1e293b] rounded-xl border border-slate-700/60 shadow-lg overflow-hidden flex flex-col h-[600px]">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-slate-300 whitespace-nowrap">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold tracking-wider sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="px-5 py-4">Account Number</th>
                  <th className="px-5 py-4">First Name</th>
                  <th className="px-5 py-4">Middle Name</th>
                  <th className="px-5 py-4">Last Name</th>
                  <th className="px-5 py-4 text-right">Contact Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <tr 
                      key={patient.id} 
                      onClick={() => handlePreview(patient)}
                      className={`hover:bg-slate-700/40 cursor-pointer transition-colors border-l-2 ${selectedPatient?.id === patient.id ? 'bg-slate-700/50 border-blue-500' : 'border-transparent'}`}
                    >
                      <td className="px-5 py-4 font-mono text-sm font-medium text-blue-400">{patient.unique_id}</td>
                      <td className="px-5 py-4 font-medium text-white text-sm">{patient.first_name}</td>
                      <td className="px-5 py-4 font-medium text-white text-sm">{patient.middle_name || '-'}</td>
                      <td className="px-5 py-4 font-medium text-white text-sm">{patient.last_name}</td>
                      <td className="px-5 py-4 font-medium text-white text-sm text-right">{patient.contact_number}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500 text-sm">
                      No patients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-700/50 bg-slate-800/30">
            <span className="text-xs text-slate-400 font-medium">
              Page {currentPage} of {totalPages || 1}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-[#1e293b] rounded-xl border border-slate-700/60 shadow-lg p-6 flex flex-col items-center justify-center h-[600px] relative">
          {isLoadingPreview ? (
            <Activity className="animate-pulse text-blue-500" size={32} />
          ) : selectedPatient ? (
            <div className="w-full flex flex-col items-center text-center animate-in fade-in duration-200 h-full justify-between">
              <div className="w-full flex flex-col items-center">
                <div className="w-24 h-24 mb-4 relative shrink-0">
                  {selectedPatient.photo ? (
                    <img src={selectedPatient.photo} alt="Profile" className="w-full h-full rounded-full object-cover border-2 border-slate-600 shadow-md" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-600 shadow-md">
                      <User className="text-slate-400" size={36} />
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-1 tracking-tight break-words text-center w-full">
                  {selectedPatient.first_name} {selectedPatient.last_name}
                </h3>
                <p className="text-blue-400 font-mono text-xs font-medium mb-5 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  {selectedPatient.unique_id}
                </p>

                <div className="w-full bg-[#0f172a]/60 rounded-xl border border-slate-700/50 p-4 mb-6 space-y-4 overflow-y-auto max-h-[220px] custom-scrollbar">
                  <div className="flex items-start gap-3 text-left">
                    <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400 mt-0.5 shrink-0">
                      <Hash size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Age</p>
                      <p className="text-slate-200 text-sm font-medium">{selectedPatient.age} Years Old</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 text-left">
                    <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400 mt-0.5 shrink-0">
                      <Phone size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Contact</p>
                      <p className="text-slate-200 text-sm font-medium break-all">{selectedPatient.contact_number}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-left">
                    <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400 mt-0.5 shrink-0">
                      <MapPin size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Address</p>
                      <p className="text-slate-200 text-sm font-medium break-words whitespace-pre-wrap">{selectedPatient.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/patients/view/${selectedPatient.id}`)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5 mt-auto"
              >
                Open Full Profile <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <div className="text-center opacity-60">
              <User className="text-slate-500 mx-auto mb-3" size={40} />
              <p className="text-slate-400 text-sm font-medium">Select a patient to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}