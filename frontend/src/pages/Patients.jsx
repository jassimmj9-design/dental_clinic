import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Search, UserPlus, Eye, Edit, Trash2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { generatePatientsListPDF } from '../utils/pdfGenerator';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const isAssistant = user?.role === 'assistant';

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Impossible de charger les patients');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      try {
        await api.delete(`/patients/${id}`);
        toast.success('Patient supprimé');
        fetchPatients();
      } catch (error) {
        console.error(error);
        toast.error('Impossible de supprimer le patient');
      }
    }
  };

  const handleDownloadDirectory = () => {
    if (patients.length === 0) {
      toast.error('Aucun patient à exporter');
      return;
    }
    generatePatientsListPDF(patients);
    toast.success('Répertoire des patients téléchargé !');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Gestion des Patients</h1>
        <div className="flex gap-3">
          <button onClick={handleDownloadDirectory} className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            <span>Exporter PDF</span>
          </button>
          {isAssistant && (
            <button
              onClick={() => navigate('/patients/new')}
              className="btn-primary flex items-center gap-2"
            >
              <UserPlus size={18} />
              <span>Ajouter un patient</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-soft border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou téléphone..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Nom du patient</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Contact</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Sexe / Naissance</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500">Chargement des patients...</td></tr>
              ) : filteredPatients.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500">Aucun patient trouvé.</td></tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                          {patient.first_name[0]}{patient.last_name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{patient.first_name} {patient.last_name}</p>
                          <p className="text-xs text-slate-400">N° #{patient.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <p>{patient.email || 'Pas d\'email'}</p>
                      <p>{patient.phone || 'Pas de téléphone'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <p>{patient.gender === 'Male' ? 'Homme' : patient.gender === 'Female' ? 'Femme' : patient.gender}</p>
                      <p>{patient.dob ? new Date(patient.dob).toLocaleDateString('fr-FR') : 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => navigate(`/patients/${patient.id}`)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Voir le profil">
                          <Eye size={18} />
                        </button>
                        {isAssistant && (
                          <>
                            <button onClick={() => navigate(`/patients/edit/${patient.id}`)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Modifier">
                              <Edit size={18} />
                            </button>
                            <button onClick={() => handleDelete(patient.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Patients;
