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
    <div className="max-w-6xl mx-auto pb-10 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <User className="text-blue-600" size={20} />
            Accounts
          </h2>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={14} />
          </div>
          <input 
            type="text" 
            placeholder="Search patient..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm shadow-sm"
            autoFocus
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-gray-700 whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-semibold tracking-wider sticky top-0 z-10 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Account Number</th>
                  <th className="px-4 py-3">First Name</th>
                  <th className="px-4 py-3">Middle Name</th>
                  <th className="px-4 py-3">Last Name</th>
                  <th className="px-4 py-3 text-right">Contact Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <tr 
                      key={patient.id} 
                      onClick={() => handlePreview(patient)}
                      className={`hover:bg-blue-50 cursor-pointer transition-colors border-l-2 ${selectedPatient?.id === patient.id ? 'bg-blue-50 border-blue-500' : 'border-transparent'}`}
                    >
                      <td className="px-4 py-2.5 font-mono text-sm font-bold tracking-wider text-blue-700 uppercase">{patient.unique_id}</td>
                      <td className="px-4 py-2.5 text-[10px] font-semibold tracking-wider text-gray-800 uppercase">{patient.first_name}</td>
                      <td className="px-4 py-2.5 text-[10px] font-semibold tracking-wider text-gray-800 uppercase">{patient.middle_name || '-'}</td>
                      <td className="px-4 py-2.5 text-[10px] font-semibold tracking-wider text-gray-800 uppercase">{patient.last_name}</td>
                      <td className="px-4 py-2.5 text-[10px] font-semibold tracking-wider text-gray-800 uppercase text-right">{patient.contact_number}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-400 text-[10px] font-semibold uppercase tracking-wider">
                      No patients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50">
            <span className="text-xs text-gray-500 font-medium">
              Page {currentPage} of {totalPages || 1}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex flex-col items-center justify-center h-[500px] relative">
          {isLoadingPreview ? (
            <Activity className="animate-pulse text-blue-500" size={28} />
          ) : selectedPatient ? (
            <div className="w-full flex flex-col items-center text-center animate-in fade-in duration-200 h-full justify-between">
              <div className="w-full flex flex-col items-center">
                <div className="w-16 h-16 mb-3 relative shrink-0">
                  {selectedPatient.photo ? (
                    <img src={selectedPatient.photo} alt="Profile" className="w-full h-full rounded-full object-cover border border-gray-300" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center border border-gray-300">
                      <User className="text-gray-400" size={24} />
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-1 tracking-tight break-words text-center w-full uppercase">
                  {selectedPatient.first_name} {selectedPatient.last_name}
                </h3>
                <p className="text-blue-600 font-mono text-[10px] font-bold tracking-wider uppercase mb-4 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {selectedPatient.unique_id}
                </p>

                <div className="w-full bg-gray-50 rounded-lg border border-gray-200 p-3 mb-4 space-y-3 overflow-y-auto max-h-[200px]">
                  <div className="flex items-start gap-2 text-left">
                    <div className="bg-white p-1.5 rounded border border-gray-200 text-blue-500 mt-0.5 shrink-0">
                      <Hash size={12} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Age</p>
                      <p className="text-gray-800 text-[10px] uppercase font-semibold tracking-wider">{selectedPatient.age} Years Old</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 text-left">
                    <div className="bg-white p-1.5 rounded border border-gray-200 text-blue-500 mt-0.5 shrink-0">
                      <Phone size={12} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Contact</p>
                      <p className="text-gray-800 text-[10px] uppercase font-semibold tracking-wider break-all">{selectedPatient.contact_number}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-left">
                    <div className="bg-white p-1.5 rounded border border-gray-200 text-blue-500 mt-0.5 shrink-0">
                      <MapPin size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Address</p>
                      <p className="text-gray-800 text-[10px] uppercase font-semibold tracking-wider break-words whitespace-pre-wrap">{selectedPatient.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/patients/view/${selectedPatient.id}`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-md transition-colors shadow-sm flex items-center justify-center gap-1 mt-auto"
              >
                Open Full Profile <ChevronRight size={14} />
              </button>
            </div>
          ) : (
            <div className="text-center opacity-60">
              <User className="text-gray-400 mx-auto mb-2" size={32} />
              <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">Select a patient to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}