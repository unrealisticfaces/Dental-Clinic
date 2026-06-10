import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCheck, CheckCircle2, Clock, ArrowRight, AlertTriangle, Users, Volume2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function TabletQueueManager() {
  const [queue, setQueue] = useState([]);
  const [time, setTime] = useState(new Date());
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [patientToCall, setPatientToCall] = useState(null);

  const fetchQueue = async () => {
    try {
      const res = await axios.get(`http://192.168.1.250:5000/api/queue/today?t=${Date.now()}`);
      setQueue(res.data);
    } catch (error) {}
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 3000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const clockInterval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const formatQueueNumber = (id) => `N-${String(id).padStart(3, '0')}`;

  const initiateCallNext = (patient) => {
    setPatientToCall(patient);
    setIsConfirmOpen(true);
  };

  const confirmCallNext = async () => {
    try {
      if (patientToCall) {
        await axios.put(`http://192.168.1.250:5000/api/appointments/${patientToCall.id}/status`, { status: 'Completed' });
      }

      toast.success('Called next patient!');
      
      setIsConfirmOpen(false);
      setPatientToCall(null);
      fetchQueue();
    } catch (error) {
      toast.error('Network block. Retrying...');
      setIsConfirmOpen(false);
    }
  };

  const manuallyRingBell = async () => {
    try {
      await axios.post('http://192.168.1.250:5000/api/chime');
      toast.info('TV Announcer Triggered!');
    } catch (error) {
      toast.error('Failed to trigger TV.');
    }
  };

  const nowServing = queue.length > 0 ? queue[0] : null;
  const waitingList = queue.slice(1);

  return (
    <div className="h-screen w-screen bg-slate-100 flex flex-col font-sans fixed inset-0 z-50 select-none overflow-hidden touch-manipulation">
      <div className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <Users className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">Queue Manager</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tablet Control Panel</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right border-r border-slate-200 pr-8">
            <h2 className="text-xl font-black text-slate-800 tracking-tighter">
              {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </h2>
          </div>
          
          <button 
            onClick={manuallyRingBell}
            className="bg-white hover:bg-slate-50 border-2 border-slate-200 active:border-blue-500 text-slate-600 active:text-blue-600 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <Volume2 size={18} /> Re-Announce TV
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-row gap-6 p-6 min-h-0 relative">
        <div className="absolute top-0 left-0 w-full h-full bg-blue-400/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-[45%] flex flex-col gap-6 z-10 min-h-0">
          <div className="bg-white rounded-[2rem] shadow-lg border border-slate-200 flex-1 flex flex-col items-center justify-center p-8 relative min-h-0">
            <div className="bg-blue-50 text-blue-600 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 shrink-0">
              <UserCheck size={16} /> In The Chair
            </div>

            {nowServing ? (
              <div className="flex flex-col items-center text-center w-full flex-1 justify-center min-h-0">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-2 shrink-0">Ticket Number</p>
                <h2 className="text-7xl font-black text-slate-900 font-mono tracking-tighter mb-6 shrink-0">
                  {formatQueueNumber(nowServing.id)}
                </h2>
                
                <div className="w-full bg-slate-50 rounded-2xl p-6 border border-slate-100 shrink-0">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Patient Name</p>
                   <p className="text-xl font-bold text-slate-800 uppercase tracking-wide truncate mb-4">
                     {nowServing.first_name} {nowServing.last_name}
                   </p>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Purpose of Visit</p>
                   <p className="text-base font-bold text-blue-600 uppercase tracking-wide truncate">
                     {nowServing.reason || 'Consultation'}
                   </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 opacity-40">
                <UserCheck size={64} className="text-slate-400 mb-4" />
                <p className="text-xl font-bold text-slate-600 uppercase tracking-widest">No Active Patient</p>
              </div>
            )}
          </div>

          <button 
            disabled={!nowServing}
            onClick={() => initiateCallNext(nowServing)}
            className={`w-full py-6 rounded-[2rem] font-black text-xl uppercase tracking-widest flex items-center justify-center gap-4 transition-all shrink-0 cursor-pointer
              ${nowServing 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_10px_20px_rgba(37,99,235,0.2)] active:scale-95' 
                : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'}`}
          >
            <CheckCircle2 size={28} /> Call Next <ArrowRight size={28} />
          </button>
        </div>

        <div className="flex-1 bg-white rounded-[2rem] shadow-lg border border-slate-200 flex flex-col min-h-0 z-10">
          <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
            <h3 className="text-lg font-black tracking-widest text-slate-800 uppercase">Waiting List</h3>
            <div className="bg-blue-100 text-blue-700 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
              {waitingList.length} Waiting
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 webkit-overflow-scrolling-touch">
            {waitingList.length > 0 ? (
              waitingList.map((patient) => (
                <div 
                  key={patient.id} 
                  className="bg-white hover:bg-blue-50/50 border-2 border-slate-100 rounded-2xl p-5 flex items-center gap-6 transition-colors"
                >
                  <div className="w-20 h-20 bg-slate-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border border-slate-200">
                    <span className="text-2xl font-black text-slate-900 font-mono tracking-tighter">
                      {formatQueueNumber(patient.id)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-slate-800 uppercase tracking-wide truncate mb-1">
                      {patient.first_name} {patient.last_name}
                    </p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {patient.reason || 'Consultation'}
                    </p>
                  </div>
                  
                  <div className="text-right border-l-2 border-slate-100 pl-6 pr-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Arrival</p>
                    <p className="text-lg font-black text-blue-600 flex items-center justify-end gap-1">
                      <Clock size={16} /> {patient.appointment_time.substring(0, 5)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30">
                <Users size={64} className="text-slate-400 mb-4" />
                <p className="text-lg font-bold uppercase tracking-widest text-slate-600">Queue is empty</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 border-[6px] border-amber-50">
                <AlertTriangle size={32} className="text-amber-500" />
              </div>
              
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Call Next Patient?</h3>
              <p className="text-lg font-medium text-slate-500 mb-10 leading-relaxed px-4">
                This will mark <strong className="text-blue-600 font-black">{formatQueueNumber(patientToCall?.id)}</strong> as completed, and the TV will immediately announce the next ticket.
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsConfirmOpen(false)}
                  className="flex-1 bg-slate-100 active:bg-slate-200 text-slate-700 font-black py-5 rounded-[1.5rem] transition-colors text-lg uppercase tracking-widest cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmCallNext}
                  className="flex-1 bg-blue-600 active:bg-blue-700 text-white font-black py-5 rounded-[1.5rem] transition-colors text-lg uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 size={24} /> Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}