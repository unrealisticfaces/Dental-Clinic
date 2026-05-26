import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import TransactionHistory from './TransactionHistory';
import SystemLogs from './SystemLogs';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={() => setIsAuthenticated(true)} />
        <ToastContainer position="bottom-right" theme="dark" />
      </>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-[#0f172a] text-white font-sans">
        <Sidebar onLogout={() => setIsAuthenticated(false)} />
        
        <div className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients/register" element={<RegisterPatient />} />
            <Route path="/patients/search" element={<PatientDirectory />} />
            <Route path="/patients/view/:id" element={<PatientDetails />} />
            <Route path="/transactions/payment" element={<Payment />} />
            <Route path="/transactions/receipt/:id" element={<Receipt />} />
            <Route path="/transactions/search" element={<TransactionHistory />} />
            <Route path="/logs" element={<SystemLogs />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        
        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    </Router>
  );
}