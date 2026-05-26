import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { toast } from 'react-toastify';
import { Users, TrendingUp } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    weeklyCustomers: 0, 
    procedures: [],
    revenue: [] // New state for Bar Chart
  });

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(), 10000);
    return () => clearInterval(interval);
  }, []);

  // Custom tooltips to match the dark theme
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl">
          <p className="text-slate-300 font-medium">{payload[0].name || payload[0].payload.day}</p>
          <p className="text-white font-bold text-lg">
            {payload[0].name ? `${payload[0].value} Bookings` : `$${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-400 mt-1">Real-time clinic performance and metrics.</p>
        </div>
      </div>
      
      {/* Top Row: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* KPI 1: Patients */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-900 p-6 rounded-2xl shadow-lg relative overflow-hidden flex items-center justify-between">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-white/10 w-32 h-32 rounded-full blur-2xl"></div>
          <div className="z-10">
            <h3 className="text-blue-100 font-medium mb-1">Weekly Patients</h3>
            <p className="text-5xl font-black text-white">{stats.weeklyCustomers}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl z-10 backdrop-blur-sm border border-white/10">
            <Users size={32} className="text-white" />
          </div>
        </div>

        {/* KPI 2: Estimated Revenue (Mocked total for UI purposes) */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 p-6 rounded-2xl shadow-lg relative overflow-hidden flex items-center justify-between">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-white/10 w-32 h-32 rounded-full blur-2xl"></div>
          <div className="z-10">
            <h3 className="text-emerald-100 font-medium mb-1">Weekly Revenue</h3>
            <p className="text-5xl font-black text-white">
              ${stats.revenue?.reduce((acc, curr) => acc + curr.total, 0) || 0}
            </p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl z-10 backdrop-blur-sm border border-white/10">
            <TrendingUp size={32} className="text-white" />
          </div>
        </div>
      </div>

      {/* Bottom Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Modern Bar Chart */}
        <div className="bg-[#1e293b] p-6 rounded-2xl shadow-xl border border-slate-800/60 h-[400px] flex flex-col">
          <h3 className="text-slate-200 text-lg font-bold mb-6">Revenue Overview (7 Days)</h3>
          <div className="flex-1 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.4 }} />
                <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Modern Donut Chart */}
        <div className="bg-[#1e293b] p-6 rounded-2xl shadow-xl border border-slate-800/60 h-[400px] flex flex-col">
          <h3 className="text-slate-200 text-lg font-bold mb-2">Procedures Breakdown</h3>
          <div className="flex-1 w-full h-full">
            {stats.procedures.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.procedures}
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                  >
                    {stats.procedures.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px', color: '#cbd5e1' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">Waiting for data...</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}