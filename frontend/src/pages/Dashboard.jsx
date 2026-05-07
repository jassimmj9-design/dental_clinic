import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Users, Calendar, DollarSign, Clock, ArrowRight, BarChart2, PieChart as PieChartIcon, Activity, TrendingUp, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { generateRevenueReport } from '../utils/pdfGenerator';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/analytics')
        ]);
        setStats(statsRes.data);
        setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <div className="text-slate-500 font-medium animate-pulse">Loading dashboard elements...</div>
      </div>
    );
  }

  const handleDownloadReport = () => {
    if (!stats || !analytics) {
      toast.error('Data not ready yet');
      return;
    }
    generateRevenueReport(stats, analytics);
    toast.success('Financial report downloaded!');
  };

  const statCards = [
    { title: 'Total Patients', value: stats?.totalPatients || 0, icon: <Users className="w-6 h-6" />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { title: "Today's Appointments", value: stats?.todayAppointments || 0, icon: <Calendar className="w-6 h-6" />, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { title: 'Total Revenue', value: `$${Number(stats?.totalRevenue || 0).toLocaleString()}`, icon: <DollarSign className="w-6 h-6" />, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { title: 'Pending Invoices', value: stats?.pendingInvoices || 0, icon: <Clock className="w-6 h-6" />, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <BarChart2 className="text-primary-600" />
            Clinic Overview Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">Real-time statistics and administrative insights</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleDownloadReport} className="btn-secondary flex items-center gap-2 shadow-sm">
            <Download size={16} /> Export Financials
          </button>
          <button onClick={() => navigate('/appointments')} className="btn-primary shadow-md hover:shadow-lg transition-shadow">
            + New Appointment
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, index) => (
          <div key={index} className={`card p-5 flex items-center hover:-translate-y-1 transition-transform duration-300 border-l-4 ${stat.border}`}>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} mr-4 shadow-inner`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Trend */}
        <div className="card p-6 min-h-[350px] flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-500" /> Revenue Trend
            </h3>
            <p className="text-xs text-slate-500">Monthly collected payments</p>
          </div>
          <div className="flex-1 w-full h-full min-h-[250px]">
            {analytics?.revenueTrend?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                  <Tooltip cursor={{fill: '#F1F5F9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-slate-400">Not enough data</div>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Patient Growth Line Chart */}
          <div className="card p-6 flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" /> Patient Growth
              </h3>
            </div>
            <div className="flex-1 w-full h-full min-h-[200px]">
              {analytics?.patientGrowth?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.patientGrowth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} />
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Line type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-slate-400">Not enough data</div>}
            </div>
          </div>

          {/* Common Treatments Pie Chart */}
          <div className="card p-6 flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-amber-500" /> Common Procedures
              </h3>
            </div>
            <div className="flex-1 w-full h-full min-h-[200px]">
              {analytics?.commonTreatments?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.commonTreatments} innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                      {analytics.commonTreatments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-slate-400">Not enough data</div>}
            </div>
            {/* Custom Legend */}
            <div className="mt-2 space-y-1">
              {analytics?.commonTreatments?.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 text-slate-600 truncate">
                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></span>
                    {item.name}
                  </span>
                  <span className="font-bold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Appointments */}
        <div className="card p-6 lg:col-span-2 shadow-soft">
          <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" /> Waitlist / Recent Appointments
            </h3>
            <button onClick={() => navigate('/appointments')} className="text-sm text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1 font-medium transition-colors">
              Full Schedule <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {stats?.recentAppointments?.length > 0 ? stats.recentAppointments.map((appt) => (
              <div key={appt.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary-200 hover:shadow-sm transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 text-primary-600 flex items-center justify-center text-sm font-bold group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
                    {appt.patient?.first_name?.[0]}{appt.patient?.last_name?.[0]}
                  </div>
                  <div>
                    <p 
                      onClick={() => navigate(`/patients/${appt.patient_id}`)}
                      className="font-bold text-slate-800 text-sm hover:text-primary-600 cursor-pointer transition-colors"
                    >
                      {appt.patient?.first_name} {appt.patient?.last_name}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      {appt.title} · Dr. {appt.dentist?.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">{new Date(appt.start_time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    appt.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                    appt.status === 'cancelled' ? 'bg-red-100 text-red-700 border border-red-200' :
                    'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>{appt.status}</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-10">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">No appointments yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="card p-6 shadow-soft">
          <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" /> New Patients
            </h3>
            <button onClick={() => navigate('/patients')} className="text-sm text-primary-600 hover:text-primary-700 border px-2 py-1 rounded-md text-xs font-semibold hover:bg-primary-50 transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {stats?.recentPatients?.length > 0 ? stats.recentPatients.map((patient) => (
              <div 
                key={patient.id} 
                onClick={() => navigate(`/patients/${patient.id}`)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-primary-100 text-purple-700 flex items-center justify-center text-sm font-bold shadow-sm">
                  {patient.first_name[0]}{patient.last_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate group-hover:text-primary-600 transition-colors">{patient.first_name} {patient.last_name}</p>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">{patient.phone || patient.email || 'No contact info'}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )) : (
              <p className="text-sm text-slate-400 text-center py-8">No patients yet</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
