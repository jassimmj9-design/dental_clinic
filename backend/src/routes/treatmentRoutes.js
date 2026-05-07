const express = require('express');
const router = express.Router();
const { getTreatments, createTreatment, updateTreatment, deleteTreatment } = require('../controllers/treatmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getTreatments)
  .post(protect, authorize('assistant', 'dentist'), createTreatment);

router.route('/:id')
  .put(protect, authorize('assistant', 'dentist'), updateTreatment)
  .delete(protect, authorize('assistant', 'dentist'), deleteTreatment);

module.exports = router;
