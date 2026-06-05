import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, User, FileText, X, Stethoscope } from 'lucide-react';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({ patient_id: '', dentist_id: '', appointment_date: '', appointment_time: '07:00', reason: '' });
  const [selectedPatientName, setSelectedPatientName] = useState('');

  const timeSlots = [
    { label: '07:00 AM', value: '07:00' },
    { label: '08:00 AM', value: '08:00' },
    { label: '09:00 AM', value: '09:00' },
    { label: '10:00 AM', value: '10:00' },
    { label: '11:00 AM', value: '11:00' },
    { label: '12:00 PM', value: '12:00' },
    { label: '01:00 PM', value: '13:00' },
    { label: '02:00 PM', value: '14:00' },
    { label: '03:00 PM', value: '15:00' },
    { label: '04:00 PM', value: '16:00' }
  ];

  const getDaysInWeek = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1);
    return Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const weekDays = getDaysInWeek(currentDate);

  useEffect(() => {
    fetchAppointments();
    fetchDentists();
  }, [currentDate]);

  const fetchAppointments = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/api/appointments', { headers: { Authorization: `Bearer ${token}` } });
    setAppointments(res.data);
  };

  const fetchDentists = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/api/dentists', { headers: { Authorization: `Bearer ${token}` } });
    setDentists(res.data);
  };

  useEffect(() => {
    if (!patientSearch.trim()) {
      setPatients([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/patients/search?q=${patientSearch}`, { headers: { Authorization: `Bearer ${token}` } });
      setPatients(res.data);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [patientSearch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    await axios.post('http://localhost:5000/api/appointments', formData, { headers: { Authorization: `Bearer ${token}` } });
    fetchAppointments();
    setIsModalOpen(false);
    setFormData({ patient_id: '', dentist_id: '', appointment_date: '', appointment_time: '07:00', reason: '' });
    setPatientSearch('');
    setSelectedPatientName('');
  };

  const nextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const openSlot = (date, timeValue) => {
    const localDate = new Date(date);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
    setFormData({ ...formData, appointment_date: localDate.toISOString().split('T')[0], appointment_time: timeValue });
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <CalendarIcon className="text-blue-600" size={28} />
            Schedule Board
          </h2>
          <p className="text-gray-500 mt-1 text-sm">Manage clinic appointments via the visual calendar.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <button onClick={prevWeek} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"><ChevronLeft size={18} className="text-gray-600" /></button>
            <span className="px-4 font-semibold text-xs text-gray-800">
              {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[5].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button onClick={nextWeek} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"><ChevronRight size={18} className="text-gray-600" /></button>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm">
            <Plus size={16} /> New Booking
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-300 rounded-xl shadow-md overflow-hidden flex flex-col">
        <div className="grid grid-cols-7 border-b-2 border-slate-900 bg-slate-800">
          <div className="py-2.5 px-2 border-r border-slate-600 flex items-center justify-center text-[9px] font-semibold text-white uppercase tracking-wider">Time</div>
          {weekDays.map((day, i) => (
            <div key={i} className="py-2.5 px-2 border-r border-slate-600 text-center">
              <p className="text-[9px] font-semibold text-slate-300 uppercase tracking-wider">{day.toLocaleDateString('en-US', { weekday: 'short' })}</p>
              <p className={`text-sm font-bold mt-0.5 ${day.toDateString() === new Date().toDateString() ? 'text-blue-400' : 'text-white'}`}>{day.getDate()}</p>
            </div>
          ))}
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-100">
          {timeSlots.map(slot => (
            <div key={slot.value} className="grid grid-cols-7 border-b border-slate-300 min-h-[75px]">
              <div className="border-r border-slate-300 p-2 flex items-start justify-center bg-slate-50">
                <span className="text-[10px] font-bold text-slate-600 mt-1">{slot.label}</span>
              </div>
              
              {weekDays.map((day, i) => {
                const dayStr = day.toLocaleDateString('en-CA');
                const slotAppts = appointments.filter(a => {
                   const aDate = new Date(a.appointment_date).toLocaleDateString('en-CA');
                   const aTime = a.appointment_time.substring(0, 5);
                   return aDate === dayStr && aTime === slot.value;
                });
                
                return (
                  <div key={i} onClick={() => openSlot(day, slot.value)} className="border-r border-slate-300 p-1.5 cursor-pointer hover:bg-blue-50 transition-colors relative group bg-white">
                    {slotAppts.map(appt => (
                      <div key={appt.id} className="bg-blue-100 border-l-4 border-blue-600 rounded-r-sm p-1.5 mb-1.5 shadow-sm relative z-10 hover:bg-blue-200 transition-colors">
                        <p className="text-[10px] font-bold text-blue-900 truncate leading-tight">{appt.first_name} {appt.last_name}</p>
                        <p className="text-[9px] text-blue-700 font-semibold truncate mt-0.5 leading-tight">{appt.reason || 'General'}</p>
                        <p className="text-[8px] text-blue-600 font-medium truncate mt-0.5 leading-tight uppercase tracking-wider">DR: {appt.dentist_name || 'UNASSIGNED'}</p>
                      </div>
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <Plus className="text-blue-400" size={16} />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-800 p-4 flex justify-between items-center">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2"><CalendarIcon size={16}/> Schedule Appointment</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-white transition-colors"><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5"><User size={14}/> Select Patient</label>
                {selectedPatientName ? (
                  <div className="flex justify-between items-center bg-slate-50 border border-slate-300 p-2.5 rounded-md">
                    <span className="text-sm font-bold text-slate-800">{selectedPatientName}</span>
                    <button type="button" onClick={() => { setSelectedPatientName(''); setFormData({...formData, patient_id: ''}); }} className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Change</button>
                  </div>
                ) : (
                  <div className="relative">
                    <input type="text" placeholder="Search by Name or UID..." value={patientSearch} onChange={e => setPatientSearch(e.target.value)} className="w-full border border-slate-300 rounded-md p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"/>
                    {patientSearch && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-xl max-h-40 overflow-y-auto z-50">
                        {isSearching ? <div className="p-3 text-xs text-center text-slate-500 font-semibold">Searching...</div> : patients.map(p => (
                          <div key={p.id} onClick={() => { setFormData({...formData, patient_id: p.id}); setSelectedPatientName(`${p.first_name} ${p.last_name}`); setPatientSearch(''); }} className="p-2.5 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-0">
                            <p className="text-sm font-bold text-slate-800">{p.first_name} {p.last_name}</p>
                            <p className="text-[10px] text-slate-500 font-mono font-semibold">{p.unique_id}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5"><Stethoscope size={14}/> Attending Dentist</label>
                <div className="relative">
                  <select 
                    required 
                    value={formData.dentist_id} 
                    onChange={e => setFormData({...formData, dentist_id: e.target.value})} 
                    className="w-full appearance-none bg-white border border-slate-300 text-sm text-slate-800 font-bold p-2.5 rounded-md focus:border-blue-500 outline-none transition-all cursor-pointer uppercase"
                  >
                    <option value="" disabled>-- Select a Dentist --</option>
                    {dentists.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
                    <ChevronRight className="rotate-90" size={14} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5"><CalendarIcon size={14}/> Date</label>
                  <input type="date" required value={formData.appointment_date} onChange={e => setFormData({...formData, appointment_date: e.target.value})} className="w-full border border-slate-300 rounded-md p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800 font-bold"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5"><Clock size={14}/> Time</label>
                  <select required value={formData.appointment_time} onChange={e => setFormData({...formData, appointment_time: e.target.value})} className="w-full border border-slate-300 rounded-md p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800 bg-white font-bold">
                    {timeSlots.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5"><FileText size={14}/> Reason / Procedure</label>
                <input type="text" placeholder="e.g. Cleaning, Extraction" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full border border-slate-300 rounded-md p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800 font-semibold"/>
              </div>
              <button type="submit" disabled={!formData.patient_id || !formData.dentist_id || !formData.appointment_date} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-md transition-colors text-sm mt-2 disabled:opacity-50">Confirm Appointment</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}