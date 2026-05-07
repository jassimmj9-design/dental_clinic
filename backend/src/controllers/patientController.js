const { Patient, Appointment, Treatment, Invoice } = require('../models');

const getPatients = async (req, res) => {
  try {
    const patients = await Patient.findAll();
    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching patients' });
  }
};

const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id, {
      include: [
        { model: Appointment, as: 'appointments' },
        { model: Treatment, as: 'treatments' },
        { model: Invoice, as: 'invoices' }
      ]
    });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching patient' });
  }
};

const createPatient = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, dob, gender, address, medical_notes } = req.body;
    
    const newPatient = await Patient.create({
      first_name,
      last_name,
      email,
      phone,
      dob,
      gender,
      address,
      medical_notes
    });
    
    res.status(201).json(newPatient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating patient' });
  }
};

const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    await patient.update(req.body);
    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating patient' });
  }
};

const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    await patient.destroy();
    res.json({ message: 'Patient removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting patient' });
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};
