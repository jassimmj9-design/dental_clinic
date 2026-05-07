const { Appointment, Patient, User } = require('../models');
const { Op } = require('sequelize');

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        { model: Patient, as: 'patient', attributes: ['first_name', 'last_name'] },
        { model: User, as: 'dentist', attributes: ['name'] }
      ]
    });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving appointments' });
  }
};

const getUpcomingAppointments = async (req, res) => {
  try {
    const dentistCondition = req.user.role === 'dentist' ? { dentist_id: req.user.id } : {};
    
    // next 24 hours
    const now = new Date();
    const next24 = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const appointments = await Appointment.findAll({
      where: {
        ...dentistCondition,
        start_time: { [Op.gt]: now, [Op.lt]: next24 },
        status: 'scheduled'
      },
      include: [
        { model: Patient, as: 'patient', attributes: ['first_name', 'last_name'] },
        { model: User, as: 'dentist', attributes: ['name'] }
      ],
      order: [['start_time', 'ASC']]
    });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving upcoming appointments' });
  }
};

const createAppointment = async (req, res) => {
  try {
    const { patient_id, dentist_id, title, start_time, end_time, status, notes } = req.body;
    
    // Double booking validation
    const conflictingAppt = await Appointment.findOne({
      where: {
        dentist_id,
        [Op.and]: [
          { start_time: { [Op.lt]: end_time } },
          { end_time: { [Op.gt]: start_time } }
        ],
        status: { [Op.notIn]: ['cancelled'] } // ignore cancelled appts
      }
    });

    if (conflictingAppt) {
      return res.status(409).json({ message: 'Doctor is already booked for this time slot.' });
    }

    const appointment = await Appointment.create({
      patient_id, dentist_id, title, start_time, end_time, status, notes
    });
    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating appointment' });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { start_time, end_time, dentist_id } = req.body;
    const apptId = req.params.id;

    const appt = await Appointment.findByPk(apptId);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    // Compute times for validation fallback
    const checkStartTime = start_time || appt.start_time;
    const checkEndTime = end_time || appt.end_time;
    const checkDentist = dentist_id || appt.dentist_id;

    // Double booking validation
    const conflictingAppt = await Appointment.findOne({
      where: {
        dentist_id: checkDentist,
        id: { [Op.ne]: apptId },
        [Op.and]: [
          { start_time: { [Op.lt]: checkEndTime } },
          { end_time: { [Op.gt]: checkStartTime } }
        ],
        status: { [Op.notIn]: ['cancelled'] }
      }
    });

    if (conflictingAppt && req.body.status !== 'cancelled') {
      return res.status(409).json({ message: 'Doctor is already booked for this time slot.' });
    }

    await appt.update(req.body);
    res.json(appt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating appointment' });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    
    await appt.destroy();
    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting appointment' });
  }
};

module.exports = {
  getAppointments, getUpcomingAppointments, createAppointment, updateAppointment, deleteAppointment
};
