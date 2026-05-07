import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Échec de la connexion. Vérifiez vos identifiants.');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-card border border-slate-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">
            Cabinet Dentaire
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Connectez-vous pour accéder à votre tableau de bord
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="label-text" htmlFor="email">Adresse email</label>
              <input
                id="email"
                type="email"
                required
                className="input-field"
                placeholder="email@cabinet.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label-text" htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button type="submit" className="w-full btn-primary py-3 text-lg">
              Se connecter
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-slate-500 space-y-1">
            <p>Assistante : assistant@clinic.com / assistant123</p>
            <p>Dentiste : dentist@clinic.com / dentist123</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
