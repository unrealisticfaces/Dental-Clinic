import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './Dashboard';
import Sidebar from './Sidebar';
import Login from './Login';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // If not logged in, only show the Login screen
  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={() => setIsAuthenticated(true)} />
        <ToastContainer position="bottom-right" theme="dark" />
      </>
    );
  }

  // If logged in, show the main application layout
  return (
    <Router>
      <div className="flex h-screen bg-darkBg text-white font-sans">
        <Sidebar onLogout={() => setIsAuthenticated(false)} />
        
        <div className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients/register" element={<h2 className="text-2xl font-bold">Register Patient</h2>} />
            <Route path="/patients/search" element={<h2 className="text-2xl font-bold">Search Patients</h2>} />
            <Route path="/transactions/payment" element={<h2 className="text-2xl font-bold">Payments</h2>} />
            <Route path="/transactions/search" element={<h2 className="text-2xl font-bold">Search Transactions</h2>} />
            <Route path="/logs" element={<h2 className="text-2xl font-bold">System Logs</h2>} />
            
            {/* Catch-all route to redirect unknown URLs back to dashboard */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        
        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    </Router>
  );
}