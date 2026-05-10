import { NavLink, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
  Home, Users, Calendar,
  CreditCard, Settings, LogOut, Activity
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Tableau de bord', path: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'Patients', path: '/patients', icon: <Users className="w-5 h-5" /> },
    { name: 'Rendez-vous', path: '/appointments', icon: <Calendar className="w-5 h-5" /> },
    { name: 'Traitements', path: '/treatments', icon: <Activity className="w-5 h-5" /> },
  ];

  // Seul l'assistant voit Facturation et Paramètres
  if (user?.role === 'assistant') {
    navItems.push({ name: 'Facturation', path: '/billing', icon: <CreditCard className="w-5 h-5" /> });
    navItems.push({ name: 'Paramètres', path: '/settings', icon: <Settings className="w-5 h-5" /> });
  }

  const isDentist = user?.role === 'dentist';
  const activeClass = isDentist
    ? 'bg-teal-50 text-teal-600 font-medium shadow-sm'
    : 'bg-primary-50 text-primary-600 font-medium shadow-sm';
  const brandColor = isDentist ? 'text-teal-600' : 'text-primary-600';

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-center h-20 border-b border-slate-100 px-6">
          <div className={`flex items-center gap-2 ${brandColor}`}>
            <Activity className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight text-slate-900">Dental<span className={brandColor}>Care</span></span>
          </div>
        </div>

        <div className="overflow-y-auto overflow-x-hidden flex-grow flex flex-col justify-between h-[calc(100vh-5rem)]">
          <ul className="flex flex-col py-4 px-3 space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? activeClass
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                  end={item.path === '/'}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="p-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="ml-3">Se déconnecter</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
