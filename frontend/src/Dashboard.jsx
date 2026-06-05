import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { Activity, Users, DollarSign, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    weeklyCustomers: 0,
    procedures: [],
    revenue: [],
    users: [],
    growthTrend: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const COLORS = ['#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Activity className="animate-pulse text-indigo-500" size={32} />
      </div>
    );
  }

  const totalWeeklyRevenue = stats.revenue?.reduce((sum, item) => sum + Number(item.total), 0) || 0;
  const totalCustomers = stats.weeklyCustomers || 0;
  const topProcedure = stats.procedures?.length > 0 ? stats.procedures.sort((a,b) => b.value - a.value)[0].name : 'N/A';
  
  const trend = Number(stats.growthTrend || 0);
  const isPositive = trend >= 0;
  const trendColor = isPositive ? 'text-emerald-500' : 'text-red-500';
  const trendSign = isPositive ? '+' : '';

  return (
    <div className="max-w-7xl mx-auto pb-10 font-sans">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Clinic Overview</h2>
        <p className="text-slate-500 mt-1 text-sm">Here is a snapshot of your clinic's performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="bg-blue-50/50 p-3.5 rounded-xl text-blue-500">
            <DollarSign size={22} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Recent Revenue</p>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
              ₱{totalWeeklyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="bg-emerald-50/50 p-3.5 rounded-xl text-emerald-500">
            <Users size={22} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Total Patients</p>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
              {totalCustomers}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="bg-amber-50/50 p-3.5 rounded-xl text-amber-500">
            <Activity size={22} strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Top Procedure</p>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight truncate">
              {topProcedure}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="bg-indigo-50/50 p-3.5 rounded-xl text-indigo-500">
            <TrendingUp size={22} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Growth Trend</p>
            <h3 className={`text-lg font-bold ${trendColor} tracking-tight flex items-center gap-1.5`}>
              {trendSign}{trend}% <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">vs last wk</span>
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-700">Revenue Trend</h3>
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">Last 7 Active Days</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenue || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(val) => `₱${val}`} />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  itemStyle={{ color: '#334155', fontWeight: 'bold' }}
                  formatter={(value) => [`₱${Number(value).toLocaleString()}`, 'Revenue']}
                  labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-6">Procedure Breakdown</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.procedures || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {(stats.procedures || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  itemStyle={{ color: '#334155', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-700">Patient Traffic Overview</h3>
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">Last 7 Active Days</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.users || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  itemStyle={{ color: '#334155', fontWeight: 'bold' }}
                  formatter={(value) => [`${value} Patients`, 'Traffic']}
                  labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}