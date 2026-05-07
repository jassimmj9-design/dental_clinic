const { Treatment, Patient, User, Appointment } = require('../models');

const getTreatments = async (req, res) => {
  try {
    const treatments = await Treatment.findAll({
      include: [
        { model: Patient, as: 'patient', attributes: ['first_name', 'last_name'] },
        { model: User, as: 'dentist', attributes: ['name'] }
      ]
    });
    res.json(treatments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving treatments' });
  }
};

const createTreatment = async (req, res) => {
  try {
    const { patient_id, dentist_id, appointment_id, procedure_name, description, cost, date, notes } = req.body;
    
    const treatment = await Treatment.create({
      patient_id, dentist_id, appointment_id, procedure_name, description, cost, date, notes
    });
    
    res.status(201).json(treatment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating treatment' });
  }
};

const updateTreatment = async (req, res) => {
  try {
    const treatment = await Treatment.findByPk(req.params.id);
    if (!treatment) return res.status(404).json({ message: 'Treatment not found' });

    await treatment.update(req.body);
    res.json(treatment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating treatment' });
  }
};

const deleteTreatment = async (req, res) => {
  try {
    const treatment = await Treatment.findByPk(req.params.id);
    if (!treatment) return res.status(404).json({ message: 'Treatment not found' });

    await treatment.destroy();
    res.json({ message: 'Treatment removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting treatment' });
  }
};

module.exports = {
  getTreatments, createTreatment, updateTreatment, deleteTreatment
};
