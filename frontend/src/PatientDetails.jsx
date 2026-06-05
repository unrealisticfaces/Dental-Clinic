import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, User, MapPin, Phone, Hash, Calendar, 
  CreditCard, History, Activity, ChevronLeft, ChevronRight, Stethoscope, XCircle, Save
} from 'lucide-react';

const getToothType = (num) => {
  const n = parseInt(num);
  if ([1, 2, 3, 14, 15, 16, 17, 18, 19, 30, 31, 32].includes(n)) return 'molar';
  if ([4, 5, 12, 13, 20, 21, 28, 29].includes(n)) return 'premolar';
  if ([6, 11, 22, 27].includes(n)) return 'canine';
  return 'incisor';
};

const RealisticTooth = ({ type, status, number, isLower }) => {
  const getFillColor = () => {
    switch(status) {
      case 'Cavity': return '#fee2e2';
      case 'Filling': return '#dbeafe';
      case 'Crown': return '#fef3c7';
      case 'Missing': return '#f9fafb';
      case 'Extracted': return '#f3f4f6';
      default: return '#ffffff';
    }
  };

  const getStrokeColor = () => {
    switch(status) {
      case 'Cavity': return '#ef4444';
      case 'Filling': return '#3b82f6';
      case 'Crown': return '#f59e0b';
      case 'Missing': return '#e5e7eb';
      case 'Extracted': return '#9ca3af';
      default: return '#d1d5db';
    }
  };

  const getPath = () => {
    if (type === 'molar') return "M 6 20 C 6 5, 12 0, 15 0 C 18 0, 20 12, 20 12 C 20 12, 22 0, 25 0 C 28 0, 34 5, 34 20 C 38 25, 38 50, 34 55 C 28 55, 20 50, 20 50 C 20 50, 12 55, 6 55 C 2 50, 2 25, 6 20 Z";
    if (type === 'premolar') return "M 10 20 C 10 5, 15 0, 20 0 C 25 0, 30 5, 30 20 C 34 25, 32 50, 25 55 C 20 53, 20 53, 15 55 C 8 50, 6 25, 10 20 Z";
    if (type === 'canine') return "M 12 20 C 15 5, 18 0, 20 0 C 22 0, 25 5, 28 20 C 34 25, 30 50, 20 55 C 10 50, 6 25, 12 20 Z";
    return "M 10 20 C 10 5, 15 0, 20 0 C 25 0, 30 5, 30 20 C 34 25, 34 50, 30 55 C 25 55, 15 55, 10 55 C 6 50, 6 25, 10 20 Z";
  };

  const isMissing = status === 'Missing';
  const isExtracted = status === 'Extracted';

  return (
    <div className="relative flex flex-col items-center">
      {!isLower && <span className="text-[10px] font-bold text-gray-400 mb-1 transition-all duration-200 group-hover:text-blue-600 group-hover:scale-150 inline-block origin-bottom">{number}</span>}
      <div className={`relative transition-transform duration-200 ${isLower ? 'group-hover:translate-y-1' : 'group-hover:-translate-y-1'} group-hover:scale-105`}>
        <svg 
          viewBox="0 0 40 60" 
          className={`w-7 h-10 ${isLower ? 'rotate-180' : ''} ${isMissing ? 'opacity-40' : ''}`}
        >
          <path
            d={getPath()}
            fill={getFillColor()}
            stroke={getStrokeColor()}
            strokeWidth="1.5"
            strokeDasharray={isMissing ? "3 3" : "0"}
            strokeLinejoin="round"
          />
        </svg>
        {isExtracted && (
          <div className="absolute inset-0 flex items-center justify-center">
            <XCircle size={20} className="text-gray-400" />
          </div>
        )}
      </div>
      {isLower && <span className="text-[10px] font-bold text-gray-400 mt-1 transition-all duration-200 group-hover:text-blue-600 group-hover:scale-150 inline-block origin-top">{number}</span>}
    </div>
  );
};

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [dentalChart, setDentalChart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [isSubmittingChart, setIsSubmittingChart] = useState(false);
  const [chartForm, setChartForm] = useState({ condition_name: 'Normal', notes: '' });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const fetchDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [profileRes, historyRes, chartRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/patients/${id}`, { headers }),
        axios.get(`http://localhost:5000/api/patients/${id}/history`, { headers }),
        axios.get(`http://localhost:5000/api/patients/${id}/chart`, { headers })
      ]);
      setPatient(profileRes.data);
      setHistory(historyRes.data);
      setDentalChart(chartRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleChartSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingChart(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/patients/${id}/chart`, {
        tooth_number: selectedTooth.toString(),
        condition_name: chartForm.condition_name,
        notes: chartForm.notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Tooth #${selectedTooth} record updated!`);
      setSelectedTooth(null);
      setChartForm({ condition_name: 'Normal', notes: '' });
      fetchDetails();
    } catch (error) {
      toast.error('Failed to update dental chart');
    } finally {
      setIsSubmittingChart(false);
    }
  };

  const getToothStatus = (number) => {
    const records = dentalChart.filter(c => c.tooth_number === number.toString());
    if (records.length === 0) return 'Normal';
    return records[0].condition_name;
  };

  const getBadgeColor = (condition) => {
    switch (condition) {
      case 'Cavity': return 'bg-red-100 border-red-200 text-red-700';
      case 'Missing': return 'bg-gray-100 border-gray-200 text-gray-500';
      case 'Extracted': return 'bg-gray-200 border-gray-300 text-gray-600';
      case 'Filling': return 'bg-blue-100 border-blue-200 text-blue-700';
      case 'Crown': return 'bg-amber-100 border-amber-200 text-amber-700';
      default: return 'bg-white border-gray-200 text-gray-600';
    }
  };

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

  const upperTeeth = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  const lowerTeeth = [32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17];

  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentHistory = history.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const selectedToothHistory = selectedTooth 
    ? dentalChart.filter(c => c.tooth_number === selectedTooth.toString()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    : [];

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <button 
        onClick={() => navigate('/patients')}
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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Stethoscope className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Clinical Dental Chart</h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">Click a tooth to update</span>
        </div>

        <div className="flex flex-col items-center gap-8 mb-4 overflow-x-auto pb-4 custom-scrollbar">
          <div className="flex gap-2">
            {upperTeeth.map(num => (
              <button 
                key={`upper-${num}`}
                onClick={() => setSelectedTooth(num)}
                className="focus:outline-none group p-1.5 rounded-xl hover:bg-blue-50/50 transition-colors"
              >
                <RealisticTooth 
                  type={getToothType(num)} 
                  status={getToothStatus(num)} 
                  number={num} 
                  isLower={false}
                />
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {lowerTeeth.map(num => (
              <button 
                key={`lower-${num}`}
                onClick={() => setSelectedTooth(num)}
                className="focus:outline-none group p-1.5 rounded-xl hover:bg-blue-50/50 transition-colors"
              >
                <RealisticTooth 
                  type={getToothType(num)} 
                  status={getToothStatus(num)} 
                  number={num} 
                  isLower={true}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mt-6 pt-4 border-t border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-gray-300 bg-white"></div> Normal</span>
          <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-red-400 bg-red-100"></div> Cavity</span>
          <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-blue-400 bg-blue-100"></div> Filling</span>
          <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-amber-400 bg-amber-100"></div> Crown</span>
          <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-gray-200 bg-gray-50"></div> Missing</span>
          <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-gray-400 bg-gray-100"></div> Extracted</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
          <History className="text-blue-600" size={20} />
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Treatment & Payment History</h2>
        </div>

        <div className="space-y-3">
          {history.length > 0 ? (
            <>
              {currentHistory.map((record) => (
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
              ))}
              
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">
                    Showing <span className="font-bold">{startIndex + 1}</span> to <span className="font-bold">{Math.min(startIndex + ITEMS_PER_PAGE, history.length)}</span> of <span className="font-bold">{history.length}</span> records
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-md border border-gray-200 text-gray-600 disabled:opacity-40 disabled:bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-md border border-gray-200 text-gray-600 disabled:opacity-40 disabled:bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 border-dashed text-center">
              <CreditCard className="mx-auto text-gray-400 mb-2" size={24} />
              <p className="text-gray-500 text-sm">No transaction history found for this patient.</p>
            </div>
          )}
        </div>
      </div>

      {selectedTooth && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="bg-slate-800 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-base">Tooth #{selectedTooth} Record</h3>
              <button onClick={() => setSelectedTooth(null)} className="text-slate-300 hover:text-white transition-colors">
                <XCircle size={20} />
              </button>
            </div>
            
            <form onSubmit={handleChartSubmit} className="p-5">
              <div className="mb-5 bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-40 overflow-y-auto custom-scrollbar">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Past Records</h4>
                {selectedToothHistory.length > 0 ? (
                  <div className="space-y-3">
                    {selectedToothHistory.map(record => (
                      <div key={record.id} className="relative pl-3 border-l-2 border-blue-200">
                        <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-blue-500"></div>
                        <div className="flex justify-between items-start mb-0.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${getBadgeColor(record.condition_name)}`}>
                            {record.condition_name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(record.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {record.notes && <p className="text-xs text-slate-600 mt-1">{record.notes}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-2">No previous records for this tooth.</p>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Update Condition</label>
                  <select 
                    value={chartForm.condition_name} 
                    onChange={(e) => setChartForm({...chartForm, condition_name: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
                  >
                    <option value="Normal">Normal (Clear Status)</option>
                    <option value="Cavity">Cavity Detected</option>
                    <option value="Filling">Restoration / Filling</option>
                    <option value="Crown">Dental Crown</option>
                    <option value="Missing">Missing Tooth</option>
                    <option value="Extracted">Extracted</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Clinical Notes</label>
                  <textarea 
                    value={chartForm.notes} 
                    onChange={(e) => setChartForm({...chartForm, notes: e.target.value})}
                    rows="3" 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                    placeholder="Add specific details, material used, or future observations..."
                  ></textarea>
                </div>

                <div className="pt-2 mt-2 flex gap-3">
                  <button type="submit" disabled={isSubmittingChart} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-70">
                    <Save size={16} /> {isSubmittingChart ? 'Saving...' : 'Save Record'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}