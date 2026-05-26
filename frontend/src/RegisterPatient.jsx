import { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Webcam from 'react-webcam';
import { Camera, Save, RefreshCw, UserCheck } from 'lucide-react';

export default function RegisterPatient() {
  const webcamRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '', 
    middleName: '', 
    lastName: '', 
    age: '', 
    cellphone: '', 
    address: ''
  });

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPhoto(imageSrc);
  }, [webcamRef]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photo) {
      toast.warn("Please capture a patient photo before registering.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('http://localhost:5000/api/patients', { 
        ...formData, 
        photo 
      });
      
      if (response.data.success) {
        toast.success(`Registration complete! ID generated: ${response.data.uniqueId}`, { autoClose: 5000 });
        
        // Reset form after successful submission
        setFormData({ firstName: '', middleName: '', lastName: '', age: '', cellphone: '', address: '' });
        setPhoto(null);
      }
    } catch (error) {
      toast.error("Registration failed. Check server connection.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <UserCheck className="text-blue-500" size={32} />
          Patient Registration
        </h2>
        <p className="text-slate-400 mt-1">Register a new patient profile and capture their photo.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Photo Capture Container */}
        <div className="lg:col-span-1 bg-[#1e293b] p-6 rounded-2xl border border-slate-700/60 shadow-xl h-fit">
          <h3 className="text-slate-200 text-lg font-bold mb-4">Patient Photo</h3>
          
          <div className="w-full aspect-square bg-slate-900 rounded-xl overflow-hidden border-2 border-dashed border-slate-600 relative flex items-center justify-center mb-6">
            {photo ? (
              <img src={photo} alt="Patient" className="object-cover w-full h-full" />
            ) : (
              <Webcam 
                audio={false} 
                ref={webcamRef} 
                screenshotFormat="image/jpeg" 
                className="w-full h-full object-cover" 
              />
            )}
          </div>
          
          <button 
            type="button" 
            onClick={photo ? () => setPhoto(null) : capture}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl transition font-medium ${
              photo 
                ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
            }`}
          >
            {photo ? <RefreshCw size={18} /> : <Camera size={18} />}
            {photo ? 'Retake Photo' : 'Capture Photo'}
          </button>
        </div>

        {/* Right Column: Information Form */}
        <div className="lg:col-span-2 bg-[#1e293b] p-8 rounded-2xl border border-slate-700/60 shadow-xl">
          <h3 className="text-slate-200 text-lg font-bold mb-6">Personal Information</h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">First Name <span className="text-red-500">*</span></label>
              <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange}
                className="w-full p-3 bg-slate-900/50 rounded-xl text-white border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">Middle Name</label>
              <input type="text" name="middleName" value={formData.middleName} onChange={handleChange}
                className="w-full p-3 bg-slate-900/50 rounded-xl text-white border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">Last Name <span className="text-red-500">*</span></label>
              <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange}
                className="w-full p-3 bg-slate-900/50 rounded-xl text-white border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">Age <span className="text-red-500">*</span></label>
              <input type="number" name="age" required min="1" value={formData.age} onChange={handleChange}
                className="w-full p-3 bg-slate-900/50 rounded-xl text-white border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-400 mb-2 block">Cellphone Number <span className="text-red-500">*</span></label>
              <input type="tel" name="cellphone" required placeholder="e.g., +63 912 345 6789" value={formData.cellphone} onChange={handleChange}
                className="w-full p-3 bg-slate-900/50 rounded-xl text-white border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-400 mb-2 block">Full Address <span className="text-red-500">*</span></label>
              <textarea name="address" required rows="3" value={formData.address} onChange={handleChange}
                className="w-full p-3 bg-slate-900/50 rounded-xl text-white border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"></textarea>
            </div>
            
            <div className="md:col-span-2 mt-4 pt-6 border-t border-slate-700/50">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                {isSubmitting ? 'Registering...' : 'Register & Generate ID'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}