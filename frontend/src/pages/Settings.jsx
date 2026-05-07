import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Settings as SettingsIcon, User, Shield, Bell, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const Settings = () => {
  const { user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', email: user.email || '' });
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.put('/auth/profile', formData);
      setUser(prev => ({ ...prev, ...res.data }));
      toast.success('Profil mis à jour avec succès !');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Échec de la mise à jour du profil');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <SettingsIcon className="text-primary-600" />
        <span>Paramètres du Cabinet</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-3">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white text-primary-600 font-semibold rounded-xl shadow-soft border border-primary-100 transition-all">
            <User size={20} />
            <span>Profil</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-white hover:text-slate-800 rounded-xl transition-all">
            <Shield size={20} />
            <span>Sécurité & Mot de passe</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-white hover:text-slate-800 rounded-xl transition-all">
            <Bell size={20} />
            <span>Notifications</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-white hover:text-slate-800 rounded-xl transition-all">
            <HelpCircle size={20} />
            <span>Centre d'aide</span>
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="card p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Informations utilisateur</h3>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="label-text">Nom complet</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-text">Rôle</label>
                  <input
                    type="text" disabled defaultValue={user?.role === 'assistant' ? 'Assistante' : user?.role === 'dentist' ? 'Dentiste' : user?.role || ''}
                    className="input-field bg-slate-50 cursor-not-allowed uppercase text-xs font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="label-text">Adresse email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="input-field"
                />
              </div>
              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={isSubmitting} className="btn-primary px-8">
                  {isSubmitting ? 'Mise à jour...' : 'Mettre à jour le profil'}
                </button>
              </div>
            </form>
          </div>

          <div className="card p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Informations du cabinet</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-400 uppercase text-[10px] tracking-widest mb-1">Nom du cabinet</p>
                <p className="text-base text-slate-800">Centre Dentaire Avancé</p>
              </div>
              <div>
                <p className="font-semibold text-slate-400 uppercase text-[10px] tracking-widest mb-1">ID Cabinet</p>
                <p className="text-base text-slate-800">CL-998231</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
