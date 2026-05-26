import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Activity } from 'lucide-react';

export default function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', credentials);
      if (response.data.success) {
        toast.success("Welcome back!");
        onLogin();
      }
    } catch (error) {
      toast.error("Invalid credentials. Use admin / admin123");
    }
  };

  return (
    // Beautiful gradient background
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-slate-100 font-sans selection:bg-blue-500/30">
      
      {/* Glassmorphism Card */}
      <div className="bg-slate-800/40 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-slate-700/50 w-[400px] transform transition-all hover:border-blue-500/30">
        
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-500/20 p-3 rounded-full mb-3 border border-blue-500/30">
            <Activity className="text-blue-400" size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            DentalCare Pro
          </h2>
          <p className="text-slate-400 text-sm mt-1">Sign in to your workspace</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-slate-300 text-sm font-medium ml-1">Username</label>
            <input
              type="text"
              name="username"
              className="w-full p-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              placeholder="e.g., admin"
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-300 text-sm font-medium ml-1">Password</label>
            <input
              type="password"
              name="password"
              className="w-full p-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              placeholder="••••••••"
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:-translate-y-0.5 mt-4">
            Sign In
          </button>
        </form>
        
        <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
          <p className="text-xs text-slate-500">Test Account: <span className="text-slate-400 font-mono">admin / admin123</span></p>
        </div>
      </div>
    </div>
  );
}