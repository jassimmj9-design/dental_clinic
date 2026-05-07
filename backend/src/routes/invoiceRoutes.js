const express = require('express');
const router = express.Router();
const { getInvoices, createInvoice, updateInvoice, deleteInvoice } = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, authorize('assistant'), getInvoices)
  .post(protect, authorize('assistant'), createInvoice);

router.route('/:id')
  .put(protect, authorize('assistant'), updateInvoice)
  .delete(protect, authorize('assistant'), deleteInvoice);

module.exports = router;
