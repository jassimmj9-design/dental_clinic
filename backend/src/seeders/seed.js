const bcrypt = require('bcryptjs');
const { sequelize, User, Patient, Appointment, Treatment, Invoice } = require('../models');

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    await sequelize.sync({ force: true });
    console.log('Database synchronized.');

    // Create Users — only assistant and dentist roles
    const assistantPassword = await bcrypt.hash('assistant123', 10);
    const dentistPassword = await bcrypt.hash('dentist123', 10);

    const assistant = await User.create({ name: 'Assistante', email: 'assistant@clinic.com', password_hash: assistantPassword, role: 'assistant' });
    const dentist = await User.create({ name: 'Dentiste', email: 'dentist@clinic.com', password_hash: dentistPassword, role: 'dentist' });

    // Create Patients (Arabic/French names)
    const patients = await Patient.bulkCreate([
      { first_name: 'Ahmed', last_name: 'Benali', email: 'ahmed@mail.com', phone: '0612345678', dob: '1985-05-12', gender: 'Male', address: '12 Rue de Paris', medical_notes: 'Allergic to Penicillin' },
      { first_name: 'Fatima', last_name: 'Zahra', email: 'fatima@mail.com', phone: '0623456789', dob: '1990-08-22', gender: 'Female', address: '34 Avenue Hassan II', medical_notes: 'Asthma' },
      { first_name: 'Ali', last_name: 'Haddad', email: 'ali@mail.com', phone: '0634567890', dob: '1975-12-05', gender: 'Male', address: '8 Rue des Fleurs', medical_notes: 'None' },
      { first_name: 'Yasmine', last_name: 'Chadli', email: 'yasmine@mail.com', phone: '0645678901', dob: '2000-01-30', gender: 'Female', address: '55 Blvd Mohammed V', medical_notes: 'Diabetes Type 2' },
      { first_name: 'Omar', last_name: 'Rhiwi', email: 'omar@mail.com', phone: '0656789012', dob: '1995-11-15', gender: 'Male', address: '12 Cite Al Amal', medical_notes: 'None' },
      { first_name: 'Nadia', last_name: 'Boumediene', email: 'nadia@mail.com', phone: '0667890123', dob: '1988-03-18', gender: 'Female', address: '22 Rue Ibn Sina', medical_notes: 'Hypertension' },
      { first_name: 'Rachid', last_name: 'Amrani', email: 'rachid@mail.com', phone: '0678901234', dob: '1992-07-25', gender: 'Male', address: '15 Avenue Al Massira', medical_notes: 'None' },
      { first_name: 'Samira', last_name: 'El Fassi', email: 'samira@mail.com', phone: '0689012345', dob: '1983-11-02', gender: 'Female', address: '8 Rue Moulay Ismail', medical_notes: 'Allergic to latex' },
    ], { individualHooks: true });

    // Create Appointments across multiple days
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2);
    const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 5);

    const mkDate = (base, h, m) => { const d = new Date(base); d.setHours(h, m, 0, 0); return d; };

    const appointments = await Appointment.bulkCreate([
      // Today — Office appointments
      { patient_id: patients[0].id, dentist_id: dentist.id, title: 'Checkup', start_time: mkDate(today, 9, 0), end_time: mkDate(today, 9, 30), status: 'scheduled', location: 'office' },
      { patient_id: patients[1].id, dentist_id: dentist.id, title: 'Cavity Filling', start_time: mkDate(today, 10, 0), end_time: mkDate(today, 11, 0), status: 'scheduled', location: 'office' },
      { patient_id: patients[3].id, dentist_id: dentist.id, title: 'Teeth Whitening', start_time: mkDate(today, 14, 0), end_time: mkDate(today, 15, 0), status: 'completed', location: 'office' },
      { patient_id: patients[5].id, dentist_id: dentist.id, title: 'Dental Cleaning', start_time: mkDate(today, 15, 30), end_time: mkDate(today, 16, 0), status: 'scheduled', location: 'office' },
      // Yesterday — Completed
      { patient_id: patients[4].id, dentist_id: dentist.id, title: 'Extraction', start_time: mkDate(yesterday, 9, 0), end_time: mkDate(yesterday, 10, 0), status: 'completed', location: 'office' },
      { patient_id: patients[6].id, dentist_id: dentist.id, title: 'Crown Placement', start_time: mkDate(yesterday, 11, 0), end_time: mkDate(yesterday, 12, 30), status: 'completed', location: 'office' },
      // Tomorrow — Office
      { patient_id: patients[2].id, dentist_id: dentist.id, title: 'Root Canal', start_time: mkDate(tomorrow, 14, 0), end_time: mkDate(tomorrow, 15, 30), status: 'scheduled', location: 'office' },
      { patient_id: patients[7].id, dentist_id: dentist.id, title: 'Braces Consultation', start_time: mkDate(tomorrow, 10, 0), end_time: mkDate(tomorrow, 10, 30), status: 'scheduled', location: 'office' },
      // Day after — Office
      { patient_id: patients[0].id, dentist_id: dentist.id, title: 'Follow-up Checkup', start_time: mkDate(dayAfter, 9, 0), end_time: mkDate(dayAfter, 9, 30), status: 'scheduled', location: 'office' },
      
      // HOSPITAL OPERATIONS
      { patient_id: patients[2].id, dentist_id: dentist.id, title: 'Jaw Surgery', start_time: mkDate(tomorrow, 8, 0), end_time: mkDate(tomorrow, 12, 0), status: 'scheduled', location: 'hospital', notes: 'CHU Mohammed VI - Operating Room 3' },
      { patient_id: patients[5].id, dentist_id: dentist.id, title: 'Impacted Wisdom Tooth Removal', start_time: mkDate(dayAfter, 7, 30), end_time: mkDate(dayAfter, 10, 0), status: 'scheduled', location: 'hospital', notes: 'Hospital Al Farabi - General anesthesia required' },
      { patient_id: patients[4].id, dentist_id: dentist.id, title: 'Dental Implant Surgery', start_time: mkDate(nextWeek, 9, 0), end_time: mkDate(nextWeek, 13, 0), status: 'scheduled', location: 'hospital', notes: 'Clinique Al Hayat - Prep Room B' },
    ]);

    // Create Treatments
    const treatments = await Treatment.bulkCreate([
      { patient_id: patients[3].id, dentist_id: dentist.id, appointment_id: appointments[2].id, procedure_name: 'Teeth Whitening', description: 'Standard laser teeth whitening procedure.', cost: 1500.00, date: today },
      { patient_id: patients[4].id, dentist_id: dentist.id, appointment_id: appointments[4].id, procedure_name: 'Tooth Extraction', description: 'Simple extraction of upper molar.', cost: 800.00, date: yesterday },
      { patient_id: patients[6].id, dentist_id: dentist.id, appointment_id: appointments[5].id, procedure_name: 'Crown Placement', description: 'Porcelain crown fitted on lower premolar.', cost: 3500.00, date: yesterday },
      { patient_id: patients[0].id, dentist_id: dentist.id, appointment_id: null, procedure_name: 'Dental Cleaning', description: 'Standard scaling and polishing.', cost: 500.00, date: new Date(today.getTime() - 7 * 86400000) },
      { patient_id: patients[1].id, dentist_id: dentist.id, appointment_id: null, procedure_name: 'Composite Filling', description: 'Tooth-colored composite filling on lower molar.', cost: 1200.00, date: new Date(today.getTime() - 14 * 86400000) },
    ]);

    // Create Invoices
    await Invoice.bulkCreate([
      { patient_id: patients[3].id, treatment_id: treatments[0].id, amount: 1500.00, paid_amount: 500.00, status: 'partial', due_date: new Date(today.getTime() + 30 * 86400000), issued_date: today },
      { patient_id: patients[4].id, treatment_id: treatments[1].id, amount: 800.00, paid_amount: 800.00, status: 'paid', due_date: yesterday, issued_date: yesterday },
      { patient_id: patients[6].id, treatment_id: treatments[2].id, amount: 3500.00, paid_amount: 0.00, status: 'unpaid', due_date: new Date(today.getTime() + 15 * 86400000), issued_date: yesterday },
      { patient_id: patients[0].id, treatment_id: treatments[3].id, amount: 500.00, paid_amount: 500.00, status: 'paid', due_date: new Date(today.getTime() - 7 * 86400000), issued_date: new Date(today.getTime() - 7 * 86400000) },
      { patient_id: patients[1].id, treatment_id: treatments[4].id, amount: 1200.00, paid_amount: 600.00, status: 'partial', due_date: new Date(today.getTime() + 7 * 86400000), issued_date: new Date(today.getTime() - 14 * 86400000) },
    ]);

    console.log('Mock data seeded successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('  Assistant: assistant@clinic.com / assistant123');
    console.log('  Dentist:   dentist@clinic.com / dentist123');
    process.exit(0);

  } catch (error) {
    console.error('Failed to seed DB:', error);
    process.exit(1);
  }
};

seedDatabase();
