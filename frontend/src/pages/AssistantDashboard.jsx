import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
  Users, Calendar, Clock, DollarSign, Search, Eye, 
  ArrowRight, ClipboardList, Activity, UserCheck, AlertCircle,
  ChevronDown, ChevronUp, X, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { generatePatientsListPDF } from '../utils/pdfGenerator';

const AssistantDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPatient, setExpandedPatient] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/assistant-stats');
        setData(res.data);
      } catch (error) {
        console.error('Error fetching assistant dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="text-slate-500 font-medium animate-pulse">Chargement du tableau de bord...</div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Patients', value: data?.totalPatients || 0, icon: <Users className="w-6 h-6" />, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    { title: "Rendez-vous aujourd'hui", value: data?.todayAppointments || 0, icon: <Calendar className="w-6 h-6" />, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
    { title: 'Factures impayées', value: data?.pendingInvoices || 0, icon: <AlertCircle className="w-6 h-6" />, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { title: 'À venir (7 jours)', value: data?.upcomingCount || 0, icon: <Clock className="w-6 h-6" />, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
  ];

  const filteredPatients = data?.patientSummaries?.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getTimeString = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const togglePatientHistory = (patientId) => {
    setExpandedPatient(expandedPatient === patientId ? null : patientId);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-indigo-200 text-sm font-medium">{new Date().getHours() < 12 ? 'Bonjour' : new Date().getHours() < 18 ? 'Bon après-midi' : 'Bonsoir'},</p>
            <h1 className="text-2xl font-bold mt-1">{user?.name || 'Assistante'}</h1>
            <p className="text-indigo-200 text-sm mt-2">
              Vue du cabinet · <span className="font-bold text-white">{data?.todayAppointments || 0}</span> rendez-vous aujourd'hui
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/patients/new')} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm">
              <Users size={16} className="inline mr-1" /> Nouveau patient
            </button>
            <button onClick={() => navigate('/appointments')} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm">
              <Calendar size={16} className="inline mr-1" /> Agenda
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, index) => (
          <div key={index} className={`card p-5 flex items-center hover:-translate-y-1 transition-transform duration-300 border-l-4 ${stat.border}`}>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} mr-4`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Planning du jour — colonne gauche */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-indigo-500" /> Planning du jour
            </h3>
            <button onClick={() => navigate('/appointments')} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium">
              Vue complète <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {data?.todaySchedule?.length > 0 ? data.todaySchedule.map((appt) => (
              <div key={appt.id} className="flex gap-3 group">
                <div className="flex flex-col items-center pt-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    appt.status === 'completed' ? 'bg-emerald-500' :
                    appt.status === 'cancelled' ? 'bg-red-400' :
                    'bg-indigo-500 ring-4 ring-indigo-100'
                  }`} />
                  <div className="w-0.5 flex-1 bg-slate-200 my-1" />
                </div>
                <div className="flex-1 p-3 rounded-xl bg-slate-50 group-hover:bg-indigo-50/50 transition-colors mb-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{appt.title}</p>
                      <p 
                        onClick={() => navigate(`/patients/${appt.patient?.id}`)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer mt-0.5"
                      >
                        {appt.patient?.first_name} {appt.patient?.last_name}
                        {appt.patient?.phone && <span className="text-slate-400"> · {appt.patient.phone}</span>}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Dr. {appt.dentist?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-600">{getTimeString(appt.start_time)} - {getTimeString(appt.end_time)}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        appt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        appt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-indigo-100 text-indigo-700'
                      }`}>{appt.status === 'completed' ? 'Terminé' : appt.status === 'cancelled' ? 'Annulé' : appt.status === 'no-show' ? 'Absent' : 'Planifié'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-slate-400">
                <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Aucun rendez-vous prévu aujourd'hui</p>
              </div>
            )}
          </div>
        </div>

        {/* Répertoire des patients + Historique — colonne droite */}
        <div className="lg:col-span-3 card p-6">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-violet-500" /> Répertoire des patients
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  if (data?.patientSummaries?.length > 0) {
                    // Map patientSummaries to the flat structure generatePatientsListPDF expects
                    const patients = data.patientSummaries.map(p => ({
                      id: p.id,
                      first_name: p.first_name,
                      last_name: p.last_name,
                      gender: p.gender,
                      dob: p.dob,
                      phone: p.phone,
                      email: p.email,
                    }));
                    generatePatientsListPDF(patients);
                    toast.success('Répertoire des patients exporté !');
                  } else {
                    toast.error('Aucun patient à exporter');
                  }
                }}
                className="text-sm text-slate-500 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                title="Exporter le répertoire des patients"
              >
                <Download size={16} />
              </button>
              <button onClick={() => navigate('/patients')} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium">
                Gérer <ArrowRight size={14} />
              </button>
            </div>
          </div>
          
          {/* Recherche */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Rechercher un patient par nom, téléphone ou email..." 
              className="input-field pl-10 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Patient List */}
          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
            {filteredPatients.length > 0 ? filteredPatients.map((patient) => (
              <div key={patient.id} className="border border-slate-100 rounded-xl overflow-hidden hover:border-indigo-200 transition-colors">
                {/* Patient Row */}
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => togglePatientHistory(patient.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                      {patient.first_name[0]}{patient.last_name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{patient.first_name} {patient.last_name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{patient.phone || patient.email || 'No contact'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Quick summary badges */}
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {patient.totalVisits} visites
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-600 border border-violet-100">
                        {patient.totalTreatments} traitements
                      </span>
                      {patient.hasOutstanding && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">
                          impayé
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/patients/${patient.id}`); }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Voir le profil"
                      >
                        <Eye size={14} />
                      </button>
                      {expandedPatient === patient.id ? <ChevronUp size={16} className="text-slate-400 mt-1" /> : <ChevronDown size={16} className="text-slate-400 mt-1" />}
                    </div>
                  </div>
                </div>

                {/* Panneau historique déroulant */}
                {expandedPatient === patient.id && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-4 animate-in">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-slate-700">Historique du patient</h4>
                      <button onClick={() => setExpandedPatient(null)} className="text-slate-400 hover:text-slate-600">
                        <X size={14} />
                      </button>
                    </div>

                    {/* Résumé chiffré */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-lg p-3 border border-slate-100 text-center">
                        <p className="text-lg font-bold text-indigo-600">{patient.completedVisits}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Visites terminées</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-slate-100 text-center">
                        <p className="text-lg font-bold text-violet-600">{patient.totalBilled.toLocaleString('fr-FR')} DH</p>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Total facturé</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-slate-100 text-center">
                        <p className="text-lg font-bold text-emerald-600">{patient.totalPaid.toLocaleString('fr-FR')} DH</p>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Total payé</p>
                      </div>
                    </div>

                    {/* Dernier traitement */}
                    {patient.lastTreatment && (
                      <div className="bg-white rounded-lg p-3 border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Dernier traitement</p>
                        <p className="text-sm font-medium text-slate-800">{patient.lastTreatment}</p>
                        <p className="text-xs text-slate-500">{patient.lastTreatmentDate ? new Date(patient.lastTreatmentDate).toLocaleDateString('fr-FR') : ''}</p>
                      </div>
                    )}

                    {/* Historique rendez-vous */}
                    {patient.appointments?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Historique des rendez-vous</p>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto">
                          {patient.appointments.sort((a, b) => new Date(b.start_time) - new Date(a.start_time)).slice(0, 5).map(appt => (
                            <div key={appt.id} className="flex justify-between items-center bg-white rounded-lg p-2 border border-slate-100 text-xs">
                              <div>
                                <span className="font-medium text-slate-700">{appt.title}</span>
                                <span className="text-slate-400 ml-2">{new Date(appt.start_time).toLocaleDateString('fr-FR')}</span>
                              </div>
                              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                appt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                appt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>{appt.status === 'completed' ? 'Terminé' : appt.status === 'cancelled' ? 'Annulé' : 'Planifié'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Traitements */}
                    {patient.treatments?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Traitements effectués</p>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto">
                          {patient.treatments.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map(t => (
                            <div key={t.id} className="flex justify-between items-center bg-white rounded-lg p-2 border border-slate-100 text-xs">
                              <div>
                                <span className="font-medium text-slate-700">{t.procedure_name}</span>
                                <span className="text-slate-400 ml-2">{new Date(t.date).toLocaleDateString('fr-FR')}</span>
                              </div>
                              <span className="font-bold text-violet-600">{Number(t.cost).toLocaleString('fr-FR')} DH</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action rapide */}
                    <button 
                      onClick={() => navigate(`/patients/${patient.id}`)}
                      className="w-full py-2 text-center text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye size={14} /> Voir le profil complet
                    </button>
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center py-12 text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Aucun patient trouvé</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AssistantDashboard;
