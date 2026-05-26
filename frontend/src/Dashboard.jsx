import { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, Users, CreditCard } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    weeklyCustomers: 0,
    procedures: [],
    revenue: [],
    users: []
  });

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'];

  useEffect(() => {
    axios.get('http://localhost:5000/api/dashboard/stats')
      .then(res => {
        setStats(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f172a] border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-slate-300 font-medium mb-1">{label || payload[0].name}</p>
          <p className="text-amber-500 font-bold">
            {payload[0].name === 'users' ? 'Users: ' : ''}
            {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-white tracking-tight">Clinic Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700/60 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Weekly Patients</p>
            <h3 className="text-3xl font-black text-white">{stats.weeklyCustomers}</h3>
          </div>
          <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
            <Users className="text-amber-500" size={24} />
          </div>
        </div>

        <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700/60 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Weekly Revenue</p>
            <h3 className="text-3xl font-black text-white">
              PHP {stats.revenue.reduce((acc, curr) => acc + curr.total, 0).toLocaleString()}
            </h3>
          </div>
          <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
            <CreditCard className="text-emerald-500" size={24} />
          </div>
        </div>

        <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700/60 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">System Status</p>
            <h3 className="text-3xl font-black text-emerald-400">Online</h3>
          </div>
          <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
            <Activity className="text-blue-500" size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-[#1e293b] p-6 rounded-xl border border-slate-700/60 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Completed Users (Last 7 Days)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.users}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tick={{fontSize: 12}} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#334155', opacity: 0.4}} />
                <Bar dataKey="users" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-xl border border-slate-700/60 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Procedure Popularity</h3>
          <div className="h-72 w-full">
            {stats.procedures.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.procedures}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.procedures.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">No procedure data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}