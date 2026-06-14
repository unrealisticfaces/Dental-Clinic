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
  const [accountInput, setAccountInput] = useState('');
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

  const handleSelectPurpose = (purpose) => {
    setSelectedPurpose(purpose);
    setStep('identify');
  };

  const processTicket = async (isGuest) => {
    if (!isGuest && !accountInput.trim()) return;
    setStep('processing');
    
    try {
      const response = await axios.post('http://192.168.1.250:5000/api/kiosk/ticket', {
        purpose: selectedPurpose.label,
        accountId: isGuest ? null : accountInput.trim()
      });
      
      if (response.data.success) {
        const realId = response.data.ticketId;
        
        setTicketNumber(`N-${String(realId).padStart(3, '0')}`);
        setStep('success');
        
        setTimeout(() => {
          setStep('welcome');
          setTicketNumber(null);
          setSelectedPurpose('');
          setAccountInput('');
        }, 6000);
      } else {
        alert(response.data.message || "Account not found. Please check your ID or tap Skip/Guest.");
        setStep('identify');
      }
    } catch (error) {
      alert("Database connection failed. Is the server running?");
      setStep('welcome');
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col font-sans fixed inset-0 z-50 select-none overflow-hidden touch-manipulation">
      
      <div className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between shadow-sm shrink-0 relative z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <Stethoscope className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">Fano Dental Clinic</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Self-Service Terminal</p>
          </div>
        </div>
        
        <div className="text-right">
          <h2 className="text-xl font-black text-slate-800 tracking-tighter">
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative p-8 min-h-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none"></div>

        {step === 'welcome' && (
          <div className="flex flex-row items-center justify-center gap-16 w-full max-w-5xl animate-in fade-in zoom-in-95 duration-500 z-10 cursor-pointer" onClick={() => setStep('purpose')}>
            
            <div className="flex-1 flex flex-col items-start text-left">
              <h2 className="text-6xl font-black text-slate-900 tracking-tight mb-6 leading-tight">
                Welcome to <br/><span className="text-blue-600">The Clinic</span>
              </h2>
              <p className="text-2xl font-medium text-slate-500 mb-12 max-w-xl">
                Please tap the screen to select your service and get your queue ticket.
              </p>
              <button className="group relative bg-blue-600 text-white rounded-full px-12 py-6 flex items-center gap-6 shadow-[0_15px_30px_rgba(37,99,235,0.3)] transition-all hover:scale-105 active:scale-95">
                <span className="text-2xl font-bold uppercase tracking-widest">Tap to Start</span>
                <div className="bg-white/20 p-2 rounded-full group-hover:translate-x-2 transition-transform">
                  <ChevronRight size={28} className="text-white" />
                </div>
              </button>
            </div>

            <div className="w-[350px] h-[350px] bg-white rounded-full shadow-[0_10px_40px_rgba(37,99,235,0.1)] border border-slate-200 flex items-center justify-center relative shrink-0">
              <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full animate-ping opacity-50"></div>
              <Fingerprint size={120} className="text-blue-600 animate-pulse" strokeWidth={1.5} />
            </div>

          </div>
        )}

        {step === 'purpose' && (
          <div className="flex flex-col w-full max-w-6xl h-full animate-in slide-in-from-right-10 duration-300 z-10">
            <div className="w-full flex items-center justify-between mb-8 shrink-0">
              <button 
                onClick={() => setStep('welcome')}
                className="bg-white border-2 border-slate-200 text-slate-500 hover:bg-slate-50 px-6 py-4 rounded-full flex items-center gap-3 font-bold uppercase tracking-widest transition-colors shadow-sm active:scale-95 cursor-pointer"
              >
                <ArrowLeft size={20} /> Back
              </button>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight text-center flex-1 pr-32">
                What brings you in today?
              </h2>
            </div>

            <div className="grid grid-cols-3 grid-rows-2 gap-6 w-full flex-1 min-h-0 pb-4">
              {purposes.map((purpose) => {
                const Icon = purpose.icon;
                return (
                  <button
                    key={purpose.id}
                    onClick={() => handleSelectPurpose(purpose)}
                    className="bg-white border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 active:bg-blue-100 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-4 transition-all duration-200 shadow-sm hover:shadow-lg active:scale-95 group cursor-pointer"
                  >
                    <div className="w-16 h-16 bg-slate-50 group-hover:bg-blue-600 rounded-2xl flex items-center justify-center transition-colors">
                      <Icon size={32} className="text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-xl font-bold text-slate-700 group-hover:text-blue-800 tracking-tight text-center">
                      {purpose.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 'identify' && (
          <div className="flex flex-col items-center justify-center w-full max-w-3xl h-full animate-in slide-in-from-right-10 duration-300 z-10 pb-12">
            <div className="w-full flex items-center justify-between mb-8 shrink-0">
              <button 
                onClick={() => setStep('purpose')}
                className="bg-white border-2 border-slate-200 text-slate-500 hover:bg-slate-50 px-8 py-5 rounded-full flex items-center gap-4 font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm text-lg"
              >
                <ArrowLeft size={24} /> Back
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-[3rem] p-12 w-full shadow-xl text-center flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
              
              <div className="w-24 h-24 bg-blue-50 border border-slate-100 rounded-full flex items-center justify-center mb-8 shadow-inner">
                <Fingerprint size={48} className="text-blue-600" />
              </div>
              
              <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-4">Link to Patient Profile</h2>
              <p className="text-lg font-bold text-slate-400 uppercase tracking-widest mb-10">Enter your Account Number (e.g., F26001)</p>
              
              <input 
                type="text"
                value={accountInput}
                onChange={(e) => setAccountInput(e.target.value.toUpperCase())}
                placeholder="ACCOUNT NO."
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-[2rem] px-8 py-6 text-4xl font-black text-slate-800 text-center mb-10 focus:border-blue-500 focus:outline-none transition-colors shadow-inner placeholder:text-slate-300 uppercase tracking-[0.1em]"
              />
              
              <div className="flex gap-6 w-full">
                <button 
                  onClick={() => processTicket(true)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 border-2 border-slate-100 text-slate-600 font-black py-6 rounded-[2rem] text-xl uppercase tracking-widest transition-all active:scale-95 cursor-pointer"
                >
                  Skip / Guest
                </button>
                <button 
                  onClick={() => processTicket(false)}
                  disabled={!accountInput.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-200 text-white font-black py-6 rounded-[2rem] text-xl uppercase tracking-widest shadow-md transition-all active:scale-95 cursor-pointer border-2 border-blue-600 disabled:shadow-none"
                >
                  Confirm ID
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center text-center animate-in fade-in duration-300 z-10 h-full">
            <div className="relative mb-12">
              <div className="w-32 h-32 border-8 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Printer className="text-blue-600" size={40} />
              </div>
            </div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-6">Generating Ticket...</h2>
            <p className="text-xl font-bold text-blue-600 uppercase tracking-[0.2em]">Registering {selectedPurpose?.label}</p>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center text-center animate-in slide-in-from-bottom-10 duration-500 z-10 h-full">
            <div className="flex items-center gap-4 mb-6">
              <CheckCircle size={60} className="text-green-500 drop-shadow-sm" />
              <h2 className="text-5xl font-black text-slate-900 tracking-tight">
                You're all set!
              </h2>
            </div>
            
            <p className="text-xl font-medium text-slate-500 mb-8">
              Please take a screenshot or remember your number.
            </p>

            <div className="bg-white rounded-[3rem] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-slate-200 relative w-[450px]">
              <div className="absolute -left-6 top-[60%] -translate-y-1/2 w-12 h-12 bg-slate-50 rounded-full border-r border-slate-200"></div>
              <div className="absolute -right-6 top-[60%] -translate-y-1/2 w-12 h-12 bg-slate-50 rounded-full border-l border-slate-200"></div>
              
              <div className="bg-blue-50 text-blue-700 px-6 py-2 rounded-full inline-block text-sm font-bold uppercase tracking-widest mb-6">
                {selectedPurpose?.label}
              </div>
              
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400 mb-2 border-b-2 border-dashed border-slate-200 pb-6">
                Your Queue Number
              </p>
              
              <div className="text-[6.5rem] font-black text-slate-900 leading-none tracking-tighter my-8 font-mono">
                {ticketNumber}
              </div>
              
              <div className="border-t-2 border-dashed border-slate-200 pt-6 flex flex-col items-center justify-center gap-2 text-slate-500">
                <div className="flex items-center gap-2 text-lg font-semibold tracking-wide">
                  <Clock size={20} /> Please watch the TV display
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