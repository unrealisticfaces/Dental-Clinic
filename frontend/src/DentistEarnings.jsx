import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Award, Percent, TrendingUp, Activity, Filter } from 'lucide-react';

export default function DentistEarnings() {
  const [earningsData, setEarningsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('All Time');
  const [customDate, setCustomDate] = useState('');

  useEffect(() => {
    const fetchEarnings = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        let url = `http://localhost:5000/api/reports/dentist-earnings?dateFilter=${dateFilter}`;
        if (dateFilter === 'Custom' && customDate) {
            url += `&customDate=${customDate}`;
        }
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEarningsData(response.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (dateFilter !== 'Custom' || (dateFilter === 'Custom' && customDate)) {
       fetchEarnings();
    }
  }, [dateFilter, customDate]);

  const overallGross = earningsData.reduce((acc, curr) => acc + Number(curr.total_revenue), 0);
  const overallCommissions = earningsData.reduce((acc, curr) => acc + Number(curr.total_commission), 0);
  const overallTreatments = earningsData.reduce((acc, curr) => acc + Number(curr.total_treatments), 0);

  return (
    <div className="max-w-6xl mx-auto pb-10 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <DollarSign className="text-emerald-600" size={24} />
            Dentist Commissions & Payouts
          </h2>
          <p className="text-gray-500 mt-1 text-xs uppercase tracking-wider font-semibold">Track historical clinical performance and financial split values.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-white border border-gray-300 rounded-md overflow-hidden shadow-sm">
            <div className="px-3 bg-gray-50 border-r border-gray-300 flex items-center justify-center">
              <Filter className="text-gray-500" size={14} />
            </div>
            <select 
              value={dateFilter} 
              onChange={e => setDateFilter(e.target.value)} 
              className="px-3 py-2 bg-transparent text-xs font-bold text-gray-700 uppercase outline-none"
            >
              <option value="All Time">All Time</option>
              <option value="Today">Today</option>
              <option value="Week">This Week</option>
              <option value="Month">This Month</option>
              <option value="Custom">Specific Date</option>
            </select>
          </div>
          {dateFilter === 'Custom' && (
            <input 
              type="date" 
              value={customDate} 
              onChange={e => setCustomDate(e.target.value)} 
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-xs font-bold text-gray-700 uppercase outline-none shadow-sm"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Operations</p>
            <p className="text-lg font-black text-gray-900 mt-0.5">{overallTreatments} Cases</p>
          </div>
        </div>

        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-md border border-purple-100">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Gross Generated</p>
            <p className="text-lg font-black text-gray-900 mt-0.5">PHP {overallGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100">
            <Award size={20} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Net Payout Split</p>
            <p className="text-lg font-black text-emerald-600 mt-0.5">PHP {overallCommissions.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[400px]">
        <div className="overflow-x-auto flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center">
              <Activity className="animate-pulse text-emerald-600" size={28} />
            </div>
          )}
          <table className="w-full text-left text-sm text-gray-700 whitespace-nowrap">
            <thead className="bg-slate-800 text-white uppercase text-[10px] font-semibold tracking-wider sticky top-0 z-10 border-b border-slate-900">
              <tr>
                <th className="px-5 py-3.5">Doctor Profile Name</th>
                <th className="px-5 py-3.5 text-center">Commission Percentage</th>
                <th className="px-5 py-3.5 text-center">Completed Operations</th>
                <th className="px-5 py-3.5 text-right">Gross Earnings (PHP)</th>
                <th className="px-5 py-3.5 text-right">Commission Payout (PHP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {earningsData.length > 0 ? (
                earningsData.map((dentist) => (
                  <tr key={dentist.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-gray-900 uppercase text-xs tracking-wider">
                      {dentist.name}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-0.5 bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-mono text-xs font-bold">
                        {dentist.commission_rate}<Percent size={10} />
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center font-mono text-xs font-bold text-gray-700">
                      {dentist.total_treatments}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-xs font-bold text-gray-600">
                      {Number(dentist.total_revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-xs font-black text-emerald-600">
                      {Number(dentist.total_commission).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                    {!isLoading && 'No provider payout records tracked.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}