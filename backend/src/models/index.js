const sequelize = require('../config/database');
const User = require('./User');
const Patient = require('./Patient');
const Appointment = require('./Appointment');
const Treatment = require('./Treatment');
const Invoice = require('./Invoice');

// User & Appointment Map
User.hasMany(Appointment, { foreignKey: 'dentist_id', as: 'dentistAppointments' });
Appointment.belongsTo(User, { foreignKey: 'dentist_id', as: 'dentist' });

// Patient & Appointment
Patient.hasMany(Appointment, { foreignKey: 'patient_id', as: 'appointments' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Patient & Treatment
Patient.hasMany(Treatment, { foreignKey: 'patient_id', as: 'treatments' });
Treatment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// User (Dentist) & Treatment
User.hasMany(Treatment, { foreignKey: 'dentist_id', as: 'performedTreatments' });
Treatment.belongsTo(User, { foreignKey: 'dentist_id', as: 'dentist' });

// Appointment & Treatment
Appointment.hasOne(Treatment, { foreignKey: 'appointment_id', as: 'treatment' });
Treatment.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });

// Patient & Invoice
Patient.hasMany(Invoice, { foreignKey: 'patient_id', as: 'invoices' });
Invoice.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Treatment & Invoice
Treatment.hasOne(Invoice, { foreignKey: 'treatment_id', as: 'invoice' });
Invoice.belongsTo(Treatment, { foreignKey: 'treatment_id', as: 'treatment' });


module.exports = {
  sequelize,
  User,
  Patient,
  Appointment,
  Treatment,
  Invoice
};
