import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Stethoscope, Clock, CheckCircle, Users, ArrowRight, Activity, Calendar, Building2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DentistDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/dentist-stats');
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching dentist stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Chargement de votre agenda...</div>
      </div>
    );
  }

  const getTimeString = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec accent sarcelle */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-teal-100 text-sm font-medium">{new Date().getHours() < 12 ? 'Bonjour' : 'Bon après-midi'},</p>
            <h1 className="text-2xl font-bold mt-1">{user?.name || 'Docteur'}</h1>
            <p className="text-teal-100 text-sm mt-2">
              Vous avez <span className="font-bold text-white">{stats?.todayTotal || 0}</span> rendez-vous au cabinet aujourd'hui
              {stats?.completedToday > 0 && <>, <span className="font-bold text-white">{stats.completedToday}</span> terminés</>}
              {stats?.hospitalOpsThisWeek > 0 && <> · <span className="font-bold text-white">{stats.hospitalOpsThisWeek}</span> op. hospitalières cette semaine</>}
            </p>
          </div>
          <div className="flex gap-3">
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="card p-5 flex items-center border-l-4 border-teal-400">
          <div className="p-3 rounded-xl bg-teal-50 text-teal-600 mr-4">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Cabinet aujourd'hui</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats?.todayTotal || 0}</h3>
          </div>
        </div>
        <div className="card p-5 flex items-center border-l-4 border-emerald-400">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 mr-4">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Terminés</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats?.completedToday || 0}</h3>
          </div>
        </div>
        <div className="card p-5 flex items-center border-l-4 border-cyan-400">
          <div className="p-3 rounded-xl bg-cyan-50 text-cyan-600 mr-4">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Mes patients</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats?.myPatientCount || 0}</h3>
          </div>
        </div>
        <div className="card p-5 flex items-center border-l-4 border-rose-400">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 mr-4">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Op. Hospitalières</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats?.hospitalOpsThisWeek || 0}</h3>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Office Schedule Timeline */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              Planning du cabinet (aujourd'hui)
            </h3>
            <button onClick={() => navigate('/appointments')} className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 font-medium">
              Agenda complet <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-1">
            {stats?.myTodayAppointments?.length > 0 ? stats.myTodayAppointments.map((appt, idx) => (
              <div key={appt.id} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    appt.status === 'completed' ? 'bg-emerald-500' : 'bg-teal-500 ring-4 ring-teal-100'
                  }`} />
                  {idx < stats.myTodayAppointments.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 my-1" />}
                </div>
                <div className={`flex-1 p-4 rounded-xl mb-2 transition-colors ${
                  appt.status === 'completed' ? 'bg-emerald-50/50' : 'bg-slate-50 group-hover:bg-teal-50/50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-800">{appt.title}</p>
                      <p onClick={() => navigate(`/patients/${appt.patient_id}`)} className="text-sm text-primary-600 hover:text-primary-800 cursor-pointer mt-0.5">
                        {appt.patient?.first_name} {appt.patient?.last_name}
                        {appt.patient?.phone && <span className="text-slate-400"> · {appt.patient.phone}</span>}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-600">
                        {getTimeString(appt.start_time)} - {getTimeString(appt.end_time)}
                      </p>
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <MapPin size={10} className="text-teal-500" />
                        <span className="text-[10px] text-teal-600 font-semibold uppercase">Cabinet</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-slate-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Aucun rendez-vous au cabinet aujourd'hui</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Hospital Ops + Recent Treatments */}
        <div className="space-y-6">
          {/* Hospital Operations */}
          <div className="card p-6 border-l-4 border-rose-300">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-rose-500" />
                Opérations Hospitalières
              </h3>
            </div>
            <div className="space-y-3">
              {stats?.hospitalOps?.length > 0 ? stats.hospitalOps.map((op) => (
                <div key={op.id} className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 hover:border-rose-200 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{op.title}</p>
                      <p 
                        onClick={() => navigate(`/patients/${op.patient_id}`)} 
                        className="text-xs text-rose-600 hover:text-rose-800 cursor-pointer mt-0.5"
                      >
                        {op.patient?.first_name} {op.patient?.last_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-600">
                        {new Date(op.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {getTimeString(op.start_time)} - {getTimeString(op.end_time)}
                      </p>
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <Building2 size={10} className="text-rose-500" />
                        <span className="text-[10px] text-rose-600 font-semibold uppercase">Hôpital</span>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-slate-400">
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">Aucune opération hospitalière à venir</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Treatments */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-slate-800">Traitements récents</h3>
              <button onClick={() => navigate('/treatments')} className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 font-medium">
                Voir tout <ArrowRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {stats?.myRecentTreatments?.length > 0 ? stats.myRecentTreatments.map((t) => (
                <div key={t.id} className="p-3 rounded-xl bg-slate-50 hover:bg-teal-50/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{t.procedure_name}</p>
                      <p onClick={() => navigate(`/patients/${t.patient_id}`)} className="text-xs text-primary-600 hover:text-primary-800 cursor-pointer mt-0.5">{t.patient?.first_name} {t.patient?.last_name}</p>
                    </div>
                    <p className="text-sm font-bold text-teal-600">${Number(t.cost).toLocaleString()}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-400 text-center py-8">Aucun traitement récent</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DentistDashboard;
