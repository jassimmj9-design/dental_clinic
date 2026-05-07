const express = require('express');
const router = express.Router();
const { getAppointments, getUpcomingAppointments, createAppointment, updateAppointment, deleteAppointment } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAppointments)
  .post(protect, createAppointment);

router.route('/upcoming')
  .get(protect, getUpcomingAppointments);

router.route('/:id')
  .put(protect, updateAppointment)
  .delete(protect, deleteAppointment);

module.exports = router;
