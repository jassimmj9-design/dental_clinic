const { Invoice, Patient, Treatment } = require('../models');

const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      include: [
        { model: Patient, as: 'patient', attributes: ['first_name', 'last_name'] },
        { model: Treatment, as: 'treatment', attributes: ['procedure_name', 'cost'] }
      ]
    });
    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving invoices' });
  }
};

const createInvoice = async (req, res) => {
  try {
    const { patient_id, treatment_id, amount, paid_amount, status, due_date } = req.body;
    
    const invoice = await Invoice.create({
      patient_id, treatment_id, amount, paid_amount, status, due_date
    });
    
    res.status(201).json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating invoice' });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    await invoice.update(req.body);
    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating invoice' });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    await invoice.destroy();
    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting invoice' });
  }
};

module.exports = {
  getInvoices, createInvoice, updateInvoice, deleteInvoice
};
