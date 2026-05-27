import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Calendar as CalendarIcon, Clock, Plus, User, FileText, CheckCircle, XCircle, Phone } from 'lucide-react';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    patient_name: '',
    contact_number: '',
    appointment_date: '',
    appointment_time: '',
    reason: ''
  });

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/appointments');
      setAppointments(res.data);
    } catch (error) {
      console.error("Failed to fetch appointments", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/appointments', formData);
      toast.success('Appointment booked successfully!');
      setShowModal(false);
      setFormData({ patient_name: '', contact_number: '', appointment_date: '', appointment_time: '', reason: '' });
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to book appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${id}/status`, { status });
      toast.success(`Appointment marked as ${status}`);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <CalendarIcon className="text-blue-600" size={28} />
            Appointment Schedule
          </h2>
          <p className="text-slate-500 mt-1 text-sm">Manage upcoming patient visits and consultations.</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-md shadow-sm transition-all flex items-center gap-2 text-sm"
        >
          <Plus size={18} /> Book Appointment
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
          {appointments.length > 0 ? (
            appointments.map((apt) => (
              <div key={apt.id} className="p-6 border-b border-r border-slate-100 hover:bg-slate-50 transition-colors flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm ${
                    apt.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                    apt.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {apt.status}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                    <CalendarIcon size={12} />
                    {new Date(apt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide mb-1">{apt.patient_name}</h3>
                
                <div className="space-y-2 mt-4 flex-1">
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Clock size={14} className="text-slate-400" />
                    <span className="font-mono font-semibold">{apt.appointment_time.slice(0, 5)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Phone size={14} className="text-slate-400" />
                    <span className="font-semibold">{apt.contact_number || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-600 text-sm">
                    <FileText size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <span className="font-medium leading-tight">{apt.reason}</span>
                  </div>
                </div>

                {apt.status === 'Scheduled' && (
                  <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100">
                    <button onClick={() => updateStatus(apt.id, 'Completed')} className="flex-1 flex items-center justify-center gap-1 text-xs font-bold bg-green-50 hover:bg-green-100 text-green-700 py-2 rounded transition-colors">
                      <CheckCircle size={14} /> Complete
                    </button>
                    <button onClick={() => updateStatus(apt.id, 'Cancelled')} className="flex-1 flex items-center justify-center gap-1 text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 py-2 rounded transition-colors">
                      <XCircle size={14} /> Cancel
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full p-12 text-center">
              <CalendarIcon size={48} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-slate-500 font-bold text-lg">No upcoming appointments</h3>
              <p className="text-slate-400 text-sm mt-1">Schedule a new visit to see it here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-slate-800 p-5 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">Book Appointment</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-white transition-colors">
                <XCircle size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Patient Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  <input type="text" name="patient_name" required value={formData.patient_name} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Juan Dela Cruz" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Contact Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  <input type="text" name="contact_number" required value={formData.contact_number} onChange={handleChange} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none" placeholder="09123456789" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Date</label>
                  <input type="date" name="appointment_date" required min={new Date().toISOString().split("T")[0]} value={formData.appointment_date} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Time</label>
                  <input type="time" name="appointment_time" required value={formData.appointment_time} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Procedure / Reason</label>
                <textarea name="reason" required value={formData.reason} onChange={handleChange} rows="2" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="e.g. Routine Cleaning, Toothache..."></textarea>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded transition-colors text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded transition-colors text-sm disabled:opacity-70">
                  {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}