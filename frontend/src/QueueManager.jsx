import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserCheck, BellRing, CheckCircle2, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function QueueManager() {
  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [patientToCall, setPatientToCall] = useState(null);

  const fetchQueue = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/queue/today?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQueue(res.data);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatQueueNumber = (id) => `N-${String(id).padStart(3, '0')}`;

  const initiateCallNext = (patient) => {
    setPatientToCall(patient);
    setIsConfirmOpen(true);
  };

  const confirmCallNext = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (patientToCall) {
        await axios.put(`/api/appointments/${patientToCall.id}/status`, 
          { status: 'Completed' }, 
          { headers: { Authorization: `Bearer ${token}` }}
        );
      }

      toast.success('Called next patient!');
      
      setIsConfirmOpen(false);
      setPatientToCall(null);
      fetchQueue();
    } catch (error) {
      toast.error('Failed to call next patient');
      setIsConfirmOpen(false);
    }
  };

  const manuallyRingBell = async () => {
    try {
      await axios.post('/api/chime');
      toast.info('Voice announcer sent to TV!');
    } catch (error) {
      toast.error('Failed to ping TV');
    }
  };

  const nowServing = queue.length > 0 ? queue[0] : null;
  const waitingList = queue.slice(1);

  if (isLoading) return <div className="p-10 text-center text-gray-500">Loading Queue...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-10 h-full flex flex-col relative">
      <div className="mb-8 border-b border-gray-200 pb-5 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
            <Users className="text-blue-600" size={28} />
            Queue Control Panel
          </h2>
          <p className="text-gray-500 mt-2 text-xs font-bold uppercase tracking-widest">
            Manage walk-ins and call the next patient to the TV display.
          </p>
        </div>
        
        <button 
          onClick={manuallyRingBell}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all active:scale-95"
        >
          <BellRing size={16} className="text-blue-500" /> Announce Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-black tracking-widest text-gray-900 uppercase flex items-center gap-2">
                <UserCheck size={16} className="text-green-600" /> Currently Serving
              </h3>
            </div>
            
            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
              {nowServing ? (
                <>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Ticket Number</p>
                  <h2 className="text-6xl font-black text-blue-600 font-mono tracking-tighter mb-6">
                    {formatQueueNumber(nowServing.id)}
                  </h2>
                  <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Patient Name</p>
                     <p className="font-bold text-gray-800 uppercase">{nowServing.first_name} {nowServing.last_name}</p>
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-3 mb-1">Reason</p>
                     <p className="font-bold text-gray-800 uppercase">{nowServing.reason || 'Consultation'}</p>
                  </div>

                  <button 
                    onClick={() => initiateCallNext(nowServing)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <CheckCircle2 size={18} /> Finish & Call Next <ArrowRight size={18} />
                  </button>
                </>
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <UserCheck size={64} className="mb-4 opacity-50" />
                  <p className="font-bold uppercase tracking-widest">No patient in chair</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-sm font-black tracking-widest text-gray-900 uppercase">Waiting List</h3>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                {waitingList.length} Waiting
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {waitingList.length > 0 ? (
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="bg-white sticky top-0 z-10 text-[10px] uppercase font-bold tracking-widest text-gray-400">
                    <tr>
                      <th className="px-6 py-4 border-b border-gray-100">Ticket</th>
                      <th className="px-6 py-4 border-b border-gray-100">Patient Name</th>
                      <th className="px-6 py-4 border-b border-gray-100">Reason</th>
                      <th className="px-6 py-4 border-b border-gray-100 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {waitingList.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono font-black text-blue-600">{formatQueueNumber(patient.id)}</td>
                        <td className="px-6 py-4 font-bold uppercase">{patient.first_name} {patient.last_name}</td>
                        <td className="px-6 py-4 font-semibold uppercase text-xs text-gray-500">{patient.reason || 'Consultation'}</td>
                        <td className="px-6 py-4 text-right font-bold flex justify-end items-center gap-2">
                          <Clock size={14} className="text-gray-400" /> {patient.appointment_time.substring(0, 5)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-50 py-20">
                  <Users size={48} className="text-gray-400 mb-4" />
                  <p className="font-bold uppercase tracking-widest text-gray-500">Queue is empty</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-600">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">Call Next Patient?</h3>
              <p className="text-sm font-medium text-gray-500 mb-6">
                This will mark <strong className="text-gray-800">{formatQueueNumber(patientToCall?.id)}</strong> as completed and immediately announce the next ticket on the TV.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsConfirmOpen(false)}
                  className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2.5 rounded-lg transition-colors text-xs uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmCallNext}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors text-xs uppercase tracking-widest shadow-md"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}