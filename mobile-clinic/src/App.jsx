import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Kiosk from './Kiosk';
import TabletQueueManager from './TabletQueueManager';

axios.defaults.baseURL = 'http://192.168.1.250:5000';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 gap-8">
      <h1 className="text-4xl text-white font-black tracking-widest uppercase">Select Terminal Mode</h1>
      <div className="flex gap-6">
        <Link to="/kiosk" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 rounded-3xl text-2xl font-black uppercase tracking-widest transition-transform active:scale-95 shadow-xl">
          Launch Kiosk
        </Link>
        <Link to="/manager" className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-6 rounded-3xl text-2xl font-black uppercase tracking-widest transition-transform active:scale-95 shadow-xl">
          Queue Manager
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kiosk" element={<Kiosk />} />
        <Route path="/manager" element={<TabletQueueManager />} />
      </Routes>
      <ToastContainer position="bottom-right" theme="light" />
    </Router>
  );
}