import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Activity } from 'lucide-react';

export default function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  // FIX: Added the missing isLoading state!
  const [isLoading, setIsLoading] = useState(false); 

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Now this works
    try {
      // Send credentials to the secure backend
      const response = await axios.post('http://localhost:5000/api/login', credentials);
      
      if (response.data.success) {
        // IMPORTANT: Save the secure JWT token to the browser
        localStorage.setItem('token', response.data.token);
        
        toast.success("Welcome back!");
        onLogin(); // Tell App.jsx we are logged in
      }
    } catch (error) {
      // Display the specific error message from the backend if it exists
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setIsLoading(false); // Turn off loading state
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 text-gray-900 font-sans selection:bg-blue-200">
      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 w-[360px]">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-50 p-2 rounded-full mb-3 border border-blue-100">
            <Activity className="text-blue-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            DentalCare Pro
          </h2>
          <p className="text-gray-500 text-xs mt-1">Sign in to your workspace</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-gray-600 text-xs font-semibold ml-1">Username</label>
            <input
              type="text"
              name="username"
              className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
              placeholder="e.g., admin"
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-gray-600 text-xs font-semibold ml-1">Password</label>
            <input
              type="password"
              name="password"
              className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
              placeholder="••••••••"
              onChange={handleChange}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-md shadow-sm transition-all text-sm mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-5 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">Secure Access Required</p>
        </div>
      </div>
    </div>
  );
}