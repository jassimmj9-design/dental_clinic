import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const PatientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male',
    address: '',
    medical_notes: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchPatient = async () => {
        try {
          const res = await api.get(`/patients/${id}`);
          // Format date for input type="date"
          const data = res.data;
          if (data.dob) data.dob = data.dob.split('T')[0];
          setFormData(data);
        } catch (error) {
          toast.error('Failed to load patient data');
          navigate('/patients');
        }
      };
      fetchPatient();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/patients/${id}`, formData);
        toast.success('Patient updated successfully');
      } else {
        await api.post('/patients', formData);
        toast.success('Patient created successfully');
      }
      navigate('/patients');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/patients')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">{isEdit ? 'Edit Patient' : 'Add New Patient'}</h1>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label-text">First Name *</label>
              <input 
                type="text" name="first_name" required className="input-field" 
                value={formData.first_name} onChange={handleChange}
              />
            </div>
            <div>
              <label className="label-text">Last Name *</label>
              <input 
                type="text" name="last_name" required className="input-field" 
                value={formData.last_name} onChange={handleChange}
              />
            </div>
            <div>
              <label className="label-text">Email</label>
              <input 
                type="email" name="email" className="input-field" 
                value={formData.email} onChange={handleChange}
              />
            </div>
            <div>
              <label className="label-text">Phone</label>
              <input 
                type="text" name="phone" className="input-field" 
                value={formData.phone} onChange={handleChange}
              />
            </div>
            <div>
              <label className="label-text">Date of Birth</label>
              <input 
                type="date" name="dob" className="input-field" 
                value={formData.dob} onChange={handleChange}
              />
            </div>
            <div>
              <label className="label-text">Gender</label>
              <select name="gender" className="input-field" value={formData.gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label-text">Address</label>
            <input 
              type="text" name="address" className="input-field" 
              value={formData.address} onChange={handleChange}
            />
          </div>

          <div>
            <label className="label-text">Medical Notes</label>
            <textarea 
              name="medical_notes" rows="4" className="input-field" 
              value={formData.medical_notes} onChange={handleChange}
              placeholder="Allergies, chronic conditions, etc."
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <button type="button" onClick={() => navigate('/patients')} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-8">
              <Save size={18} />
              <span>{loading ? 'Saving...' : 'Save Patient'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;
