import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
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
import DentistEarnings from './DentistEarnings';
import QueueBoard from './QueueBoard';
import TVSettings from './TVSettings';
import Kiosk from './Kiosk';
import QueueManager from './QueueManager';
import TabletQueueManager from './TabletQueueManager';

// ==========================================
// AXIOS CONFIGURATION
// ==========================================
// We use backticks (`) instead of quotes (') to ensure 
// the variable ${serverIP} is actually read.
const serverIP = window.location.hostname;
axios.defaults.baseURL = `http://${serverIP}:5000`;

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

  if (isCheckingAuth) return null;

  // LOGIN WALL
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
      <Routes>
        
        {/* ========================================== */}
        {/* FULL-SCREEN APPS (NO SIDEBAR)              */}
        {/* ========================================== */}
        <Route path="/queue" element={<QueueBoard />} />
        <Route path="/kiosk" element={<Kiosk />} />
        <Route path="/tablet-queue" element={<TabletQueueManager />} />
        
        {/* ========================================== */}
        {/* ADMIN DASHBOARD (WITH SIDEBAR)             */}
        {/* ========================================== */}
        <Route path="*" element={
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
                <Route path="/earnings" element={<DentistEarnings />} />
                <Route path="/tv-settings" element={<TVSettings />} />
                <Route path="/logs" element={<SystemLogs />} />
                <Route path="/queue-manager" element={<QueueManager />} />
                
                {/* Fallback to Dashboard */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
            
            <ToastContainer position="bottom-right" theme="light" />
          </div>
        } />

      </Routes>
    </Router>
  );
}