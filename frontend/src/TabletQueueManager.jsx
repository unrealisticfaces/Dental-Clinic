import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCheck, BellRing, CheckCircle2, Clock, ArrowRight, AlertTriangle, Users, Volume2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function TabletQueueManager() {
  const [queue, setQueue] = useState([]);
  const [time, setTime] = useState(new Date());
  
  // Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [patientToCall, setPatientToCall] = useState(null);

  const fetchQueue = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/queue/today', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQueue(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Fast polling so the tablet is always instantly up-to-date
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
      const token = localStorage.getItem('token');
      
      if (patientToCall) {
        await axios.put(`http://localhost:5000/api/appointments/${patientToCall.id}/status`, 
          { status: 'Completed' }, 
          { headers: { Authorization: `Bearer ${token}` }}
        );
      }

      // Tell the TV to instantly fetch the new queue and announce it
      localStorage.setItem('tv_chime_trigger', Date.now().toString());
      toast.success('Called next patient!');
      
      setIsConfirmOpen(false);
      setPatientToCall(null);
      fetchQueue();
    } catch (error) {
      toast.error('Failed to update database');
      setIsConfirmOpen(false);
    }
  };

  const manuallyRingBell = () => {
    localStorage.setItem('tv_chime_trigger', Date.now().toString());
    toast.info('Voice announcer triggered!');
  };

  const nowServing = queue.length > 0 ? queue[0] : null;
  const waitingList = queue.slice(1);

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col font-sans fixed inset-0 z-50 select-none overflow-hidden touch-manipulation">
      
      {/* ======================================= */}
      {/* HEADER (Native App Style) */}
      {/* ======================================= */}
      <div className="h-24 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md">
            <Users className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Queue Manager</h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tablet Control Panel</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right border-r border-slate-200 pr-8">
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter">
              {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </h2>
          </div>
          
          <button 
            onClick={manuallyRingBell}
            className="bg-white hover:bg-slate-50 border-2 border-slate-200 active:border-blue-500 text-slate-600 active:text-blue-600 px-6 py-4 rounded-full font-bold text-sm uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <Volume2 size={20} /> Re-Announce TV
          </button>
        </div>
      </div>

      {/* ======================================= */}
      {/* MAIN WORKSPACE (Split View) */}
      {/* ======================================= */}
      <div className="flex-1 flex gap-8 p-8 overflow-hidden relative">
        
        {/* Soft Background Glows (Like the Kiosk) */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-400/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* LEFT COLUMN: ACTIVE CONTROL (40%) */}
        <div className="w-[40%] flex flex-col gap-6 z-10">
          
          {/* Now Serving Card */}
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 flex-1 flex flex-col items-center justify-center p-10 relative overflow-hidden">
            
            <div className="bg-blue-50 text-blue-600 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-8 flex items-center gap-2">
              <UserCheck size={18} /> In The Chair
            </div>

            {nowServing ? (
              <div className="flex flex-col items-center text-center w-full animate-in zoom-in-95 duration-300">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">Ticket Number</p>
                <h2 className="text-8xl font-black text-slate-900 font-mono tracking-tighter mb-8">
                  {formatQueueNumber(nowServing.id)}
                </h2>
                
                <div className="w-full bg-slate-50 rounded-3xl p-6 border border-slate-100">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Patient Name</p>
                   <p className="text-2xl font-bold text-slate-800 uppercase tracking-wide truncate mb-4">
                     {nowServing.first_name} {nowServing.last_name}
                   </p>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Purpose of Visit</p>
                   <p className="text-lg font-bold text-blue-600 uppercase tracking-wide truncate">
                     {nowServing.reason || 'Consultation'}
                   </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center opacity-40">
                <UserCheck size={80} className="text-slate-400 mb-6" />
                <p className="text-2xl font-bold text-slate-600 uppercase tracking-widest">No Active Patient</p>
              </div>
            )}
          </div>

          {/* MASSIVE FAT-FINGER ACTION BUTTON */}
          <button 
            disabled={!nowServing}
            onClick={() => initiateCallNext(nowServing)}
            className={`w-full py-8 rounded-[2.5rem] font-black text-2xl uppercase tracking-widest flex items-center justify-center gap-4 transition-all shadow-[0_20px_40px_rgba(37,99,235,0.25)] active:scale-95 cursor-pointer
              ${nowServing 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'}`}
          >
            <CheckCircle2 size={32} /> Call Next <ArrowRight size={32} />
          </button>
        </div>

        {/* RIGHT COLUMN: WAITING LIST (60%) */}
        <div className="flex-1 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col overflow-hidden z-10">
          
          <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xl font-black tracking-widest text-slate-800 uppercase">Waiting List</h3>
            <div className="bg-blue-100 text-blue-700 text-sm font-bold px-5 py-2 rounded-full uppercase tracking-widest">
              {waitingList.length} Waiting
            </div>
          </div>

          {/* Scrollable Area (Hardware Accelerated for Tablet) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 webkit-overflow-scrolling-touch">
            {waitingList.length > 0 ? (
              waitingList.map((patient) => (
                <div 
                  key={patient.id} 
                  className="bg-white hover:bg-blue-50/50 border-2 border-slate-100 rounded-3xl p-6 flex items-center gap-8 transition-colors"
                >
                  <div className="w-24 h-24 bg-slate-50 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 border border-slate-200">
                    <span className="text-4xl font-black text-slate-900 font-mono tracking-tighter">
                      {formatQueueNumber(patient.id)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-2xl font-bold text-slate-800 uppercase tracking-wide truncate mb-1">
                      {patient.first_name} {patient.last_name}
                    </p>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                      {patient.reason || 'Consultation'}
                    </p>
                  </div>
                  
                  <div className="text-right border-l-2 border-slate-100 pl-8 pr-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Arrival</p>
                    <p className="text-xl font-black text-blue-600 flex items-center justify-end gap-2">
                      <Clock size={20} /> {patient.appointment_time.substring(0, 5)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30">
                <Users size={80} className="text-slate-400 mb-6" />
                <p className="text-xl font-bold uppercase tracking-widest text-slate-600">Queue is completely empty</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ======================================= */}
      {/* TABLET OPTIMIZED CONFIRMATION MODAL */}
      {/* ======================================= */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-8 border-[6px] border-amber-50">
                <AlertTriangle size={40} className="text-amber-500" />
              </div>
              
              <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Call Next Patient?</h3>
              <p className="text-xl font-medium text-slate-500 mb-12 leading-relaxed px-8">
                This will mark <strong className="text-blue-600 font-black">{formatQueueNumber(patientToCall?.id)}</strong> as completed, and the TV will immediately announce the next ticket.
              </p>
              
              <div className="flex gap-6">
                <button 
                  onClick={() => setIsConfirmOpen(false)}
                  className="flex-1 bg-slate-100 active:bg-slate-200 text-slate-700 font-black py-8 rounded-[2rem] transition-colors text-xl uppercase tracking-widest cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmCallNext}
                  className="flex-1 bg-blue-600 active:bg-blue-700 text-white font-black py-8 rounded-[2rem] transition-colors text-xl uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 cursor-pointer"
                >
                  <CheckCircle2 size={28} /> Confirm
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}