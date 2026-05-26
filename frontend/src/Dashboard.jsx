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

  const COLORS = ['#f59e0b', '#2563eb', '#10b981', '#8b5cf6', '#ef4444'];

  useEffect(() => {
    axios.get('http://localhost:5000/api/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 p-2 rounded shadow-md text-xs">
          <p className="text-gray-600 font-medium mb-1">{label || payload[0].name}</p>
          <p className="text-blue-600 font-bold">
            {payload[0].name === 'users' ? 'Users: ' : ''}
            {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <h2 className="text-xl font-bold text-gray-800 tracking-tight">Clinic Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Weekly Patients</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.weeklyCustomers}</h3>
          </div>
          <div className="bg-amber-50 p-2.5 rounded-md border border-amber-100">
            <Users className="text-amber-600" size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Weekly Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900">
              PHP {stats.revenue.reduce((acc, curr) => acc + curr.total, 0).toLocaleString()}
            </h3>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-md border border-emerald-100">
            <CreditCard className="text-emerald-600" size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">System Status</p>
            <h3 className="text-2xl font-bold text-emerald-600">Online</h3>
          </div>
          <div className="bg-blue-50 p-2.5 rounded-md border border-blue-100">
            <Activity className="text-blue-600" size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">Completed Users (Last 7 Days)</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.users}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="day" stroke="#6b7280" tick={{fontSize: 11}} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" tick={{fontSize: 11}} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4">Procedure Popularity</h3>
          <div className="h-60 w-full">
            {stats.procedures.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.procedures}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.procedures.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#4b5563' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">No procedure data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}