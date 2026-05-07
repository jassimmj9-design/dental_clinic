import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AssistantDashboard from '../pages/AssistantDashboard';
import DentistDashboard from '../pages/DentistDashboard';

const RoleDashboard = () => {
  const { user } = useContext(AuthContext);

  if (user?.role === 'dentist') {
    return <DentistDashboard />;
  }

  // Assistant (and any other role) sees the assistant dashboard
  return <AssistantDashboard />;
};

export default RoleDashboard;
