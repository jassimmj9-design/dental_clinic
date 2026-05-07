const { Patient, Appointment, Invoice, Treatment, User } = require('../models');
const { Op } = require('sequelize');

// ==========================================
// Assistant Dashboard — Full office overview
// ==========================================
const getAssistantDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Stats
    const totalPatients = await Patient.count();
    const todayAppointments = await Appointment.count({
      where: { start_time: { [Op.gte]: today, [Op.lt]: tomorrow } }
    });
    const pendingInvoices = await Invoice.count({
      where: { status: { [Op.in]: ['unpaid', 'partial'] } }
    });
    const revenueResult = await Invoice.sum('paid_amount');
    const totalRevenue = revenueResult || 0;

    // Today's full schedule (all dentists)
    const todaySchedule = await Appointment.findAll({
      where: {
        start_time: { [Op.gte]: today, [Op.lt]: tomorrow }
      },
      include: [
        { model: Patient, as: 'patient', attributes: ['id', 'first_name', 'last_name', 'phone', 'email'] },
        { model: User, as: 'dentist', attributes: ['id', 'name'] }
      ],
      order: [['start_time', 'ASC']]
    });

    // Patients with visit summary (count of appointments, treatments, invoices)
    const patients = await Patient.findAll({
      include: [
        { model: Appointment, as: 'appointments', attributes: ['id', 'start_time', 'status', 'title'] },
        { model: Treatment, as: 'treatments', attributes: ['id', 'procedure_name', 'date', 'cost'] },
        { model: Invoice, as: 'invoices', attributes: ['id', 'amount', 'paid_amount', 'status'] }
      ],
      order: [['created_at', 'DESC']]
    });

    // Build patient summary array
    const patientSummaries = patients.map(p => {
      const pData = p.toJSON();
      const completedVisits = pData.appointments?.filter(a => a.status === 'completed').length || 0;
      const totalVisits = pData.appointments?.length || 0;
      const totalTreatments = pData.treatments?.length || 0;
      const lastTreatment = pData.treatments?.sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null;
      const totalBilled = pData.invoices?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
      const totalPaid = pData.invoices?.reduce((sum, inv) => sum + Number(inv.paid_amount), 0) || 0;
      const hasOutstanding = pData.invoices?.some(inv => inv.status !== 'paid') || false;

      return {
        id: pData.id,
        first_name: pData.first_name,
        last_name: pData.last_name,
        phone: pData.phone,
        email: pData.email,
        totalVisits,
        completedVisits,
        totalTreatments,
        lastTreatment: lastTreatment ? lastTreatment.procedure_name : null,
        lastTreatmentDate: lastTreatment ? lastTreatment.date : null,
        totalBilled,
        totalPaid,
        hasOutstanding,
        // Include full arrays for history panel
        appointments: pData.appointments,
        treatments: pData.treatments,
        invoices: pData.invoices
      };
    });

    // Upcoming appointments (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingCount = await Appointment.count({
      where: {
        start_time: { [Op.gt]: tomorrow, [Op.lt]: nextWeek },
        status: 'scheduled'
      }
    });

    res.json({
      totalPatients,
      todayAppointments,
      pendingInvoices,
      totalRevenue,
      todaySchedule,
      patientSummaries,
      upcomingCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching assistant dashboard' });
  }
};

// ==========================================
// Dentist Dashboard — personal schedule + hospital ops
// ==========================================
const getDentistStats = async (req, res) => {
  try {
    const dentistId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's office appointments
    const myTodayAppointments = await Appointment.findAll({
      where: {
        dentist_id: dentistId,
        start_time: { [Op.gte]: today, [Op.lt]: tomorrow },
        location: 'office'
      },
      include: [
        { model: Patient, as: 'patient', attributes: ['id', 'first_name', 'last_name', 'phone'] }
      ],
      order: [['start_time', 'ASC']]
    });

    // Hospital operations (all upcoming, not just today)
    const hospitalOps = await Appointment.findAll({
      where: {
        dentist_id: dentistId,
        location: 'hospital',
        start_time: { [Op.gte]: today }
      },
      include: [
        { model: Patient, as: 'patient', attributes: ['id', 'first_name', 'last_name', 'phone'] }
      ],
      order: [['start_time', 'ASC']]
    });

    // Hospital ops this week
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    const hospitalOpsThisWeek = await Appointment.count({
      where: {
        dentist_id: dentistId,
        location: 'hospital',
        start_time: { [Op.gte]: today, [Op.lt]: endOfWeek }
      }
    });

    const myPatientCount = await Appointment.count({
      where: { dentist_id: dentistId },
      distinct: true,
      col: 'patient_id'
    });

    const completedToday = await Appointment.count({
      where: {
        dentist_id: dentistId,
        status: 'completed',
        start_time: { [Op.gte]: today, [Op.lt]: tomorrow }
      }
    });

    const myRecentTreatments = await Treatment.findAll({
      where: { dentist_id: dentistId },
      include: [
        { model: Patient, as: 'patient', attributes: ['first_name', 'last_name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    res.json({
      myTodayAppointments,
      myPatientCount,
      completedToday,
      todayTotal: myTodayAppointments.length,
      myRecentTreatments,
      hospitalOps,
      hospitalOpsThisWeek
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching dentist stats' });
  }
};

// ==========================================
// Analytics — kept for general use
// ==========================================
const getAnalytics = async (req, res) => {
  try {
    const patients = await Patient.findAll({ attributes: ['created_at'] });
    const growthMap = {};
    patients.forEach(p => {
      const month = new Date(p.created_at).toLocaleString('default', { month: 'short' });
      growthMap[month] = (growthMap[month] || 0) + 1;
    });
    const patientGrowth = Object.entries(growthMap).map(([name, count]) => ({ name, patients: count }));

    const invoices = await Invoice.findAll({ attributes: ['paid_amount', 'issued_date'] });
    const revenueMap = {};
    invoices.forEach(inv => {
      const month = new Date(inv.issued_date || new Date()).toLocaleString('default', { month: 'short' });
      revenueMap[month] = (revenueMap[month] || 0) + Number(inv.paid_amount);
    });
    const revenueTrend = Object.entries(revenueMap).map(([name, total]) => ({ name, revenue: total }));

    const treatments = await Treatment.findAll({ attributes: ['procedure_name'] });
    const treatmentMap = {};
    treatments.forEach(t => {
      treatmentMap[t.procedure_name] = (treatmentMap[t.procedure_name] || 0) + 1;
    });
    const commonTreatments = Object.entries(treatmentMap)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    res.json({ patientGrowth, revenueTrend, commonTreatments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};

// Keep getDashboardStats for backward compat (now used by assistant too)
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalPatients = await Patient.count();
    const todayAppointments = await Appointment.count({
      where: { start_time: { [Op.gte]: today, [Op.lt]: tomorrow } }
    });
    const revenueResult = await Invoice.sum('paid_amount');
    const totalRevenue = revenueResult || 0;
    const pendingInvoices = await Invoice.count({
      where: { status: { [Op.in]: ['unpaid', 'partial'] } }
    });

    const recentAppointments = await Appointment.findAll({
      include: [
        { model: Patient, as: 'patient', attributes: ['first_name', 'last_name'] },
        { model: User, as: 'dentist', attributes: ['name'] }
      ],
      order: [['start_time', 'DESC']],
      limit: 5
    });

    const recentPatients = await Patient.findAll({
      order: [['created_at', 'DESC']],
      limit: 5
    });

    res.json({ totalPatients, todayAppointments, totalRevenue, pendingInvoices, recentAppointments, recentPatients });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};

module.exports = { getDashboardStats, getDentistStats, getAnalytics, getAssistantDashboard };
