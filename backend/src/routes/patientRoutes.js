const express = require('express');
const router = express.Router();
const { getPatients, getPatientById, createPatient, updatePatient, deletePatient } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getPatients)
  .post(protect, authorize('assistant'), createPatient);

router.route('/:id')
  .get(protect, getPatientById)
  .put(protect, authorize('assistant'), updatePatient)
  .delete(protect, authorize('assistant'), deletePatient);

module.exports = router;
