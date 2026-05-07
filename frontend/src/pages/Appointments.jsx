import { useState, useEffect, useContext } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';

const locales = { 'fr': fr };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
});

const Appointments = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);
  const { user } = useContext(AuthContext);

  const isAssistant = user?.role === 'assistant';

  const emptyForm = { patient_id: '', dentist_id: '', title: '', start_time: '', end_time: '', status: 'scheduled', notes: '', location: 'office' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      const formattedEvents = res.data.map(appt => ({
        id: appt.id,
        title: `${appt.title} - ${appt.patient?.first_name} ${appt.patient?.last_name}`,
        start: new Date(appt.start_time),
        end: new Date(appt.end_time),
        resource: appt
      }));
      setEvents(formattedEvents);
    } catch (error) {
      toast.error('Impossible de charger les rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data);
    } catch (e) { /* ignore */ }
  };

  const openCreateModal = () => {
    setEditingAppt(null);
    setForm({ ...emptyForm, dentist_id: user?.id || '' });
    setShowModal(true);
  };

  const openEditModal = (event) => {
    const appt = event.resource;
    setEditingAppt(appt);
    setForm({
      patient_id: appt.patient_id,
      dentist_id: appt.dentist_id,
      title: appt.title,
      start_time: appt.start_time?.slice(0, 16),
      end_time: appt.end_time?.slice(0, 16),
      status: appt.status,
      notes: appt.notes || '',
      location: appt.location || 'office'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAppt) {
        await api.put(`/appointments/${editingAppt.id}`, form);
        toast.success('Rendez-vous mis à jour');
      } else {
        await api.post('/appointments', form);
        toast.success('Rendez-vous créé');
      }
      setShowModal(false);
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async () => {
    if (!editingAppt) return;
    if (window.confirm('Supprimer ce rendez-vous ?')) {
      try {
        await api.delete(`/appointments/${editingAppt.id}`);
        toast.success('Rendez-vous supprimé');
        setShowModal(false);
        fetchAppointments();
      } catch (error) {
        toast.error('Impossible de supprimer');
      }
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: '#3b82f6', borderRadius: '8px', opacity: 0.85,
      color: 'white', border: 'none', display: 'block',
      padding: '4px 8px', fontSize: '0.85rem', fontWeight: '500',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };
    if (event.resource.status === 'completed') style.backgroundColor = '#10b981';
    else if (event.resource.status === 'cancelled') style.backgroundColor = '#ef4444';
    else if (event.resource.status === 'no-show') style.backgroundColor = '#f59e0b';
    if (event.resource.location === 'hospital') {
      style.backgroundColor = event.resource.status === 'completed' ? '#10b981' : '#e11d48';
      style.borderLeft = '3px solid #881337';
    }
    return { style };
  };

  const messages = {
    allDay: 'Toute la journée',
    previous: 'Précédent',
    next: 'Suivant',
    today: "Aujourd'hui",
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Heure',
    event: 'Événement',
    noEventsInRange: 'Aucun rendez-vous sur cette période.',
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <CalendarIcon className="text-primary-600" />
          <span>Agenda du Cabinet</span>
        </h1>
        {isAssistant && (
          <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            <span>Nouveau Rendez-vous</span>
          </button>
        )}
      </div>

      <div className="card flex-1 p-6 overflow-hidden">
        {loading ? (
          <div className="flex h-full items-center justify-center text-slate-500">Chargement de l'agenda...</div>
        ) : (
          <div className="h-full min-h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day']}
              defaultView="week"
              messages={messages}
              culture="fr"
              onSelectEvent={isAssistant ? openEditModal : undefined}
            />
          </div>
        )}
      </div>

      {/* Modale Création/Modification — Assistant uniquement */}
      {isAssistant && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingAppt ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'} size="lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label-text">Patient *</label>
                <select name="patient_id" required className="input-field" value={form.patient_id} onChange={handleChange}>
                  <option value="">Sélectionner un patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-text">Titre *</label>
                <input type="text" name="title" required className="input-field" value={form.title} onChange={handleChange} placeholder="ex. Consultation, Détartrage" />
              </div>
              <div>
                <label className="label-text">Début *</label>
                <input type="datetime-local" name="start_time" required className="input-field" value={form.start_time} onChange={handleChange} />
              </div>
              <div>
                <label className="label-text">Fin *</label>
                <input type="datetime-local" name="end_time" required className="input-field" value={form.end_time} onChange={handleChange} />
              </div>
              <div>
                <label className="label-text">Statut</label>
                <select name="status" className="input-field" value={form.status} onChange={handleChange}>
                  <option value="scheduled">Planifié</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                  <option value="no-show">Absent</option>
                </select>
              </div>
              <div>
                <label className="label-text">Lieu</label>
                <select name="location" className="input-field" value={form.location} onChange={handleChange}>
                  <option value="office">🏥 Cabinet</option>
                  <option value="hospital">🏨 Hôpital</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label-text">Notes</label>
              <textarea name="notes" rows="3" className="input-field" value={form.notes} onChange={handleChange} placeholder="Notes optionnelles..." />
            </div>
            <div className="flex justify-between pt-2">
              {editingAppt && (
                <button type="button" onClick={handleDelete} className="btn-danger flex items-center gap-2">
                  <Trash2 size={16} /> Supprimer
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Annuler</button>
                <button type="submit" className="btn-primary px-8">{editingAppt ? 'Mettre à jour' : 'Créer'}</button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Appointments;
