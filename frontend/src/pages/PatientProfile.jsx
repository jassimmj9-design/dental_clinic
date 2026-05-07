import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, Edit, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import { generatePatientReport } from '../utils/pdfGenerator';

const PatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      const res = await api.get(`/patients/${id}`);
      setPatient(res.data);
    } catch (error) {
      toast.error('Failed to load patient');
      navigate('/patients');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    try {
      const updatedNotes = patient.medical_notes 
        ? `${patient.medical_notes}\n[${new Date().toLocaleDateString()}] ${newNote}`
        : `[${new Date().toLocaleDateString()}] ${newNote}`;
        
      await api.put(`/patients/${id}`, { medical_notes: updatedNotes });
      toast.success('Note added');
      setNewNote('');
      setShowNoteModal(false);
      fetchPatient();
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleDownloadReport = () => {
    if (!patient) return;
    generatePatientReport(patient);
    toast.success('Patient report downloaded!');
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;
  if (!patient) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/patients')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Patient Profile</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleDownloadReport} className="btn-secondary flex items-center gap-2">
            <Download size={16} /> Download Report
          </button>
          <button onClick={() => navigate(`/patients/edit/${patient.id}`)} className="btn-secondary flex items-center gap-2">
            <Edit size={16} /> Edit Patient
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar: Info */}
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-2xl font-bold">
                {patient.first_name[0]}{patient.last_name[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{patient.first_name} {patient.last_name}</h2>
                <p className="text-sm text-slate-500">ID: PT-{patient.id.toString().padStart(4, '0')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Contact</p>
                <p className="text-sm text-slate-700 mt-1">{patient.phone || 'No phone'}</p>
                <p className="text-sm text-slate-700">{patient.email || 'No email'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Demographics</p>
                <p className="text-sm text-slate-700 mt-1">{patient.gender}, {patient.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() + ' yrs' : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Address</p>
                <p className="text-sm text-slate-700 mt-1">{patient.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Medical Notes</h3>
              {(user?.role === 'dentist' || user?.role === 'admin') && (
                <button onClick={() => setShowNoteModal(true)} className="text-sm text-primary-600 hover:text-primary-800 font-medium">+ Add Note</button>
              )}
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-900 whitespace-pre-wrap">
              {patient.medical_notes || 'No medical notes recorded.'}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <div className="card h-full">
            <div className="flex border-b border-slate-100 p-2 gap-2">
              <button 
                onClick={() => setActiveTab('timeline')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'timeline' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Treatments Timeline
              </button>
              <button 
                onClick={() => setActiveTab('appointments')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'appointments' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Appointments
              </button>
              <button 
                onClick={() => setActiveTab('billing')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'billing' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Billing
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  {patient.treatments?.length > 0 ? (
                    <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
                      {patient.treatments.sort((a,b) => new Date(b.date) - new Date(a.date)).map((t) => (
                        <div key={t.id} className="relative pl-6">
                          <div className="absolute w-3 h-3 bg-primary-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white" />
                          <div>
                            <p className="text-sm text-slate-400 font-medium">{new Date(t.date).toLocaleDateString()}</p>
                            <div className="bg-slate-50 p-4 rounded-xl mt-2 border border-slate-100">
                              <h4 className="font-semibold text-slate-800">{t.procedure_name}</h4>
                              <p className="text-sm text-slate-600 mt-1">{t.description}</p>
                              {t.notes && <p className="text-xs text-slate-500 mt-2 bg-white p-2 rounded-lg border border-slate-100 italic">" {t.notes} "</p>}
                              <p className="text-xs text-emerald-600 font-bold mt-2">${Number(t.cost).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-slate-500 text-center py-8">No treatments recorded.</p>}
                </div>
              )}

              {activeTab === 'appointments' && (
                <div className="space-y-3">
                  {patient.appointments?.length > 0 ? (
                    patient.appointments.sort((a,b) => new Date(b.start_time) - new Date(a.start_time)).map(appt => (
                      <div key={appt.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <p className="font-semibold text-slate-800">{appt.title}</p>
                          <p className="text-sm text-slate-500">{new Date(appt.start_time).toLocaleString()}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                          appt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          appt.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                        }`}>{appt.status}</span>
                      </div>
                    ))
                  ) : <p className="text-slate-500 text-center py-8">No appointments found.</p>}
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-3">
                  {patient.invoices?.length > 0 ? (
                    patient.invoices.sort((a,b) => new Date(b.issued_date) - new Date(a.issued_date)).map(inv => (
                      <div key={inv.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <p className="font-semibold text-slate-800">Invoice #{inv.id.toString().padStart(4, '0')}</p>
                          <p className="text-sm text-slate-500">{new Date(inv.issued_date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">${Number(inv.amount).toLocaleString()}</p>
                          <p className="text-xs font-medium text-emerald-600">Paid: ${Number(inv.paid_amount).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  ) : <p className="text-slate-500 text-center py-8">No billing history.</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} title="Add Medical Note">
        <form onSubmit={handleAddNote} className="space-y-4">
          <textarea 
            rows="5" className="input-field" placeholder="Write clinical notes here..."
            value={newNote} onChange={(e) => setNewNote(e.target.value)} required
          />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowNoteModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary px-6">Save Note</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PatientProfile;
