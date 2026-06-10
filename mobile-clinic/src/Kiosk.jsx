import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Fingerprint, CheckCircle, ChevronRight, Stethoscope, 
  Clock, Printer, Sparkles, Activity, Smile, Shield, MoreHorizontal, ArrowLeft
} from 'lucide-react';

export default function Kiosk() {
  const [step, setStep] = useState('welcome');
  const [ticketNumber, setTicketNumber] = useState(null);
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const purposes = [
    { id: 'consultation', label: 'Consultation', icon: Stethoscope },
    { id: 'cleaning', label: 'Teeth Cleaning', icon: Sparkles },
    { id: 'extraction', label: 'Extraction', icon: Activity },
    { id: 'braces', label: 'Braces / Ortho', icon: Smile },
    { id: 'filling', label: 'Pasta / Filling', icon: Shield },
    { id: 'other', label: 'Other / Inquiries', icon: MoreHorizontal },
  ];

  const handleSelectPurpose = async (purpose) => {
    setSelectedPurpose(purpose.label);
    setStep('processing');
    
    try {
      const response = await axios.post('/api/kiosk/ticket', {
        purpose: purpose.label
      });
      
      if (response.data.success) {
        const realId = response.data.ticketId;
        
        setTicketNumber(`N-${String(realId).padStart(3, '0')}`);
        setStep('success');
        
        setTimeout(() => {
          setStep('welcome');
          setTicketNumber(null);
          setSelectedPurpose('');
        }, 6000);
      }
    } catch (error) {
      alert("Database connection failed. Is the server running?");
      setStep('welcome');
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col font-sans fixed inset-0 z-50 select-none overflow-hidden">
      
      <div className="h-24 bg-white border-b border-slate-200 px-10 flex items-center justify-between shadow-sm shrink-0 relative z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <Stethoscope className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Fano Dental Clinic</h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Self-Service Terminal</p>
          </div>
        </div>
        
        <div className="text-right">
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter">
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative p-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none"></div>

        {step === 'welcome' && (
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500 z-10 w-full max-w-4xl cursor-pointer" onClick={() => setStep('purpose')}>
            <div className="bg-white p-6 rounded-full shadow-[0_10px_40px_rgba(37,99,235,0.1)] mb-10 border border-slate-100">
              <Fingerprint size={80} className="text-blue-600 animate-pulse" strokeWidth={1.5} />
            </div>
            
            <h2 className="text-6xl font-black text-slate-900 tracking-tight mb-6">
              Welcome to the Clinic
            </h2>
            <p className="text-2xl font-medium text-slate-500 mb-16 max-w-2xl">
              Please tap the screen to select your service and get your queue ticket.
            </p>

            <button className="group relative bg-blue-600 text-white rounded-full px-16 py-8 flex items-center gap-6 shadow-[0_20px_50px_rgba(37,99,235,0.3)] transition-all hover:scale-105">
              <span className="text-3xl font-bold uppercase tracking-widest">Tap to Start</span>
              <div className="bg-white/20 p-3 rounded-full group-hover:translate-x-2 transition-transform">
                <ChevronRight size={32} className="text-white" />
              </div>
            </button>
          </div>
        )}

        {step === 'purpose' && (
          <div className="flex flex-col items-center w-full max-w-5xl animate-in slide-in-from-right-10 duration-300 z-10">
            <div className="w-full flex items-center justify-between mb-10">
              <button 
                onClick={() => setStep('welcome')}
                className="bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 px-6 py-4 rounded-full flex items-center gap-3 font-bold uppercase tracking-widest transition-colors shadow-sm active:scale-95 cursor-pointer"
              >
                <ArrowLeft size={20} /> Back
              </button>
              <h2 className="text-4xl font-black text-slate-800 tracking-tight text-center flex-1 pr-32">
                What brings you in today?
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-6 w-full">
              {purposes.map((purpose) => {
                const Icon = purpose.icon;
                return (
                  <button
                    key={purpose.id}
                    onClick={() => handleSelectPurpose(purpose)}
                    className="bg-white border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 active:bg-blue-100 rounded-3xl p-10 flex flex-col items-center justify-center gap-6 transition-all duration-200 shadow-sm hover:shadow-xl active:scale-95 group cursor-pointer"
                  >
                    <div className="w-20 h-20 bg-slate-50 group-hover:bg-blue-600 rounded-2xl flex items-center justify-center transition-colors">
                      <Icon size={40} className="text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-2xl font-bold text-slate-700 group-hover:text-blue-800 tracking-tight text-center">
                      {purpose.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center text-center animate-in fade-in duration-300 z-10">
            <div className="relative mb-10">
              <div className="w-32 h-32 border-8 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Printer className="text-blue-600" size={40} />
              </div>
            </div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-4">Generating Ticket...</h2>
            <p className="text-xl font-medium text-slate-500 uppercase tracking-widest">Registering your {selectedPurpose}</p>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center text-center animate-in slide-in-from-bottom-10 duration-500 z-10">
            <CheckCircle size={100} className="text-green-500 mb-8 drop-shadow-lg" />
            
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
              You're all set!
            </h2>
            <p className="text-xl font-medium text-slate-500 mb-10">
              Please take a screenshot or remember your number.
            </p>

            <div className="bg-white rounded-3xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-slate-200 relative w-[450px]">
              <div className="absolute -left-6 top-[65%] -translate-y-1/2 w-12 h-12 bg-slate-50 rounded-full border-r border-slate-200"></div>
              <div className="absolute -right-6 top-[65%] -translate-y-1/2 w-12 h-12 bg-slate-50 rounded-full border-l border-slate-200"></div>
              
              <div className="bg-blue-50 text-blue-700 px-6 py-2 rounded-full inline-block text-sm font-bold uppercase tracking-widest mb-6">
                {selectedPurpose}
              </div>
              
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400 mb-2 border-b-2 border-dashed border-slate-200 pb-6">
                Your Queue Number
              </p>
              
              <div className="text-[6.5rem] font-black text-slate-900 leading-none tracking-tighter my-8 font-mono">
                {ticketNumber}
              </div>
              
              <div className="border-t-2 border-dashed border-slate-200 pt-6 flex flex-col items-center justify-center gap-2 text-slate-500">
                <div className="flex items-center gap-2 font-semibold tracking-wide">
                  <Clock size={18} /> Please watch the TV display
                </div>
                <p className="text-xs uppercase tracking-widest opacity-60 mt-2">Auto-closing in 5 seconds...</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}