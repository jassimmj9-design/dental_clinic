import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import AssistantDashboard from './pages/AssistantDashboard';
import DentistDashboard from './pages/DentistDashboard';
import Patients from './pages/Patients';
import PatientProfile from './pages/PatientProfile';
import PatientForm from './pages/PatientForm';
import Appointments from './pages/Appointments';
import Treatments from './pages/Treatments';
import Billing from './pages/Billing';
import Settings from './pages/Settings';

import PrivateRoute from './components/PrivateRoute';
import RoleDashboard from './components/RoleDashboard';
import Layout from './components/layout/Layout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<RoleDashboard />} />
            
            <Route path="patients" element={<Patients />} />
            <Route path="patients/new" element={<PatientForm />} />
            <Route path="patients/:id" element={<PatientProfile />} />
            <Route path="patients/edit/:id" element={<PatientForm />} />
            
            <Route path="appointments" element={<Appointments />} />
            <Route path="treatments" element={<Treatments />} />
            <Route path="billing" element={
              <PrivateRoute roles={['assistant']}>
                <Billing />
              </PrivateRoute>
            } />
            <Route path="settings" element={
              <PrivateRoute roles={['assistant']}>
                <Settings />
              </PrivateRoute>
            } />
            
            <Route path="*" element={<div className="flex items-center justify-center h-64 text-slate-400">Page not found</div>} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;
