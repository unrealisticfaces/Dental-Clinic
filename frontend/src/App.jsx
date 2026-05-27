import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Dashboard from './Dashboard';
import Sidebar from './Sidebar';
import Login from './Login';
import Payment from './Payment';
import Receipt from './Receipt';
import RegisterPatient from './RegisterPatient';
import PatientDirectory from './PatientDirectory';
import PatientDetails from './PatientDetails';
import StatementOfAccount from './StatementOfAccount';
import SystemLogs from './SystemLogs';
import Appointments from './Appointments';

// Set up Global Axios Interceptor for JWT
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Auto-login if a token already exists in local storage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsCheckingAuth(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (isCheckingAuth) return null; // Prevents UI flicker on reload

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={() => setIsAuthenticated(true)} />
        <ToastContainer position="bottom-right" theme="light" />
      </>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
        <Sidebar onLogout={handleLogout} />
        
        <div className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/patients/register" element={<RegisterPatient />} />
            <Route path="/patients/search" element={<PatientDirectory />} />
            <Route path="/patients/view/:id" element={<PatientDetails />} />
            <Route path="/patients/:id/statement" element={<StatementOfAccount />} /> 
            <Route path="/transactions/payment" element={<Payment />} />
            <Route path="/transactions/receipt/:id" element={<Receipt />} />
            <Route path="/logs" element={<SystemLogs />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        
        <ToastContainer position="bottom-right" theme="light" />
      </div>
    </Router>
  );
}