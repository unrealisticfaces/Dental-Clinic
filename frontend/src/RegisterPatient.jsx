import { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Webcam from 'react-webcam';
import { Camera, Save, RefreshCw, UserCheck, Upload, ChevronDown } from 'lucide-react';

export default function RegisterPatient() {
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '', 
    middleName: '', 
    lastName: '', 
    birthMonth: '',
    birthDay: '',
    birthYear: '',
    gender: '',
    cellphone: '', 
    address: ''
  });

  const calculateAge = (birthDateString) => {
    if (!birthDateString) return '';
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPhoto(imageSrc);
  }, [webcamRef]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, cellphone: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.cellphone.length !== 10) {
      toast.warn("Cellphone number must be exactly 10 digits.");
      return;
    }

    if (!formData.birthMonth || !formData.birthDay || !formData.birthYear) {
      toast.warn("Please select a complete birth date.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedDate = `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`;
      const computedAge = calculateAge(formattedDate);
      
      const payload = { 
        ...formData, 
        age: computedAge, 
        cellphone: `+63${formData.cellphone}`,
        photo 
      };
      
      const response = await axios.post('http://localhost:5000/api/patients', payload);
      
      if (response.data.success) {
        toast.success(`Registration complete! ID generated: ${response.data.uniqueId}`, { autoClose: 5000 });
        
        setFormData({ 
          firstName: '', middleName: '', lastName: '', 
          birthMonth: '', birthDay: '', birthYear: '', 
          gender: '', cellphone: '', address: '' 
        });
        setPhoto(null);
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        toast.error(error.response.data.message, { autoClose: 6000 });
      } else {
        toast.error("Registration failed. Check server connection.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Date Dropdown Generators
  const months = [
    { value: '01', label: 'Jan' }, { value: '02', label: 'Feb' }, { value: '03', label: 'Mar' },
    { value: '04', label: 'Apr' }, { value: '05', label: 'May' }, { value: '06', label: 'Jun' },
    { value: '07', label: 'Jul' }, { value: '08', label: 'Aug' }, { value: '09', label: 'Sep' },
    { value: '10', label: 'Oct' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dec' }
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 120 }, (_, i) => currentYear - i);
  
  const getDaysInMonth = (m, y) => {
    if (!m) return 31;
    const month = parseInt(m);
    const year = parseInt(y) || 2000; 
    return new Date(year, month, 0).getDate();
  };
  
  const days = Array.from({ length: getDaysInMonth(formData.birthMonth, formData.birthYear) }, (_, i) => String(i + 1).padStart(2, '0'));

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
          <UserCheck className="text-blue-600" size={28} />
          Patient Registration
        </h2>
        <p className="text-gray-500 mt-1 text-sm">Register a new patient profile and capture their photo.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h3 className="text-gray-800 text-base font-bold mb-4">Patient Photo</h3>
          
          <div className="w-48 h-48 mx-auto bg-gray-50 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 relative flex items-center justify-center mb-5">
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
          
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={photo ? () => setPhoto(null) : capture}
              className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-md transition text-sm font-medium ${
                photo 
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
              }`}
            >
              {photo ? <RefreshCw size={16} /> : <Camera size={16} />}
              {photo ? 'Retake' : 'Capture'}
            </button>

            {!photo && (
              <>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-md transition text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 shadow-sm"
                >
                  <Upload size={16} /> Upload
                </button>
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-800 text-base font-bold mb-5">Personal Information</h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">First Name <span className="text-red-500">*</span></label>
              <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange}
                className="w-full px-3 py-2 bg-white rounded-md text-gray-900 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Middle Name</label>
              <input type="text" name="middleName" value={formData.middleName} onChange={handleChange}
                className="w-full px-3 py-2 bg-white rounded-md text-gray-900 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Last Name <span className="text-red-500">*</span></label>
              <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange}
                className="w-full px-3 py-2 bg-white rounded-md text-gray-900 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Gender <span className="text-red-500">*</span></label>
              <div className="relative">
                <select name="gender" required value={formData.gender} onChange={handleChange}
                  className="w-full px-3 py-2 bg-white rounded-md text-gray-900 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm appearance-none"
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Birth Date <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                <div className="relative">
                  <select name="birthMonth" required value={formData.birthMonth} onChange={handleChange}
                    className="w-full pl-2 pr-6 py-2 bg-white rounded-md text-gray-900 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm appearance-none"
                  >
                    <option value="" disabled>MM</option>
                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-1 pointer-events-none text-gray-400">
                    <ChevronDown size={12} />
                  </div>
                </div>
                
                <div className="relative">
                  <select name="birthDay" required value={formData.birthDay} onChange={handleChange}
                    className="w-full pl-2 pr-6 py-2 bg-white rounded-md text-gray-900 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm appearance-none"
                  >
                    <option value="" disabled>DD</option>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-1 pointer-events-none text-gray-400">
                    <ChevronDown size={12} />
                  </div>
                </div>

                <div className="relative">
                  <select name="birthYear" required value={formData.birthYear} onChange={handleChange}
                    className="w-full pl-2 pr-6 py-2 bg-white rounded-md text-gray-900 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm appearance-none"
                  >
                    <option value="" disabled>YYYY</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-1 pointer-events-none text-gray-400">
                    <ChevronDown size={12} />
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Cellphone Number <span className="text-red-500">*</span></label>
              <div className="flex bg-white border border-gray-300 rounded-md focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all overflow-hidden">
                <span className="flex items-center px-3 bg-gray-50 border-r border-gray-300 text-gray-600 text-sm font-semibold">
                  +63
                </span>
                <input type="tel" name="cellphone" required placeholder="9123456789" value={formData.cellphone} onChange={handlePhoneChange} maxLength="10"
                  className="w-full px-3 py-2 bg-transparent text-gray-900 outline-none text-sm font-mono" />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Input exactly 10 digits</p>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Full Address <span className="text-red-500">*</span></label>
              <textarea name="address" required rows="2" value={formData.address} onChange={handleChange}
                className="w-full px-3 py-2 bg-white rounded-md text-gray-900 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none text-sm"></textarea>
            </div>
            
            <div className="md:col-span-2 mt-2 pt-4 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-md transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
              >
                {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                {isSubmitting ? 'Registering...' : 'Register & Generate ID'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}