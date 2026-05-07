import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CLINIC_NAME = 'Advanced Dental Care Center';
const CLINIC_ADDRESS = '123 Medical Plaza, Suite 200';
const CLINIC_PHONE = '+1 (555) 234-5678';
const CLINIC_EMAIL = 'contact@advanceddentalcare.com';

const addHeader = (doc, title) => {
  // Blue header bar
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(CLINIC_NAME, 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${CLINIC_ADDRESS}  |  ${CLINIC_PHONE}  |  ${CLINIC_EMAIL}`, 14, 25);

  // Title below header
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 48);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 52, 196, 52);

  return 58; // Y position after header
};

const addFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Generated on ${new Date().toLocaleString()} — ${CLINIC_NAME} — Page ${i} of ${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
  }
};

// ==========================================
// 1. Patient Medical Report
// ==========================================
export const generatePatientReport = (patient) => {
  const doc = new jsPDF();
  let y = addHeader(doc, 'Patient Medical Report');

  // Personal Information
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text('PERSONAL INFORMATION', 14, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(10);

  const info = [
    ['Full Name', `${patient.first_name} ${patient.last_name}`],
    ['Patient ID', `PT-${patient.id?.toString().padStart(4, '0')}`],
    ['Gender', patient.gender || 'N/A'],
    ['Date of Birth', patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'],
    ['Phone', patient.phone || 'N/A'],
    ['Email', patient.email || 'N/A'],
    ['Address', patient.address || 'N/A'],
  ];

  info.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 60, y);
    y += 6;
  });

  // Medical Notes
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(11);
  doc.text('MEDICAL NOTES', 14, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  const notes = patient.medical_notes || 'No medical notes recorded.';
  const splitNotes = doc.splitTextToSize(notes, 180);
  doc.text(splitNotes, 14, y);
  y += splitNotes.length * 5 + 8;

  // Treatments Table
  if (patient.treatments?.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(11);
    doc.text('TREATMENT HISTORY', 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['Date', 'Procedure', 'Description', 'Cost']],
      body: patient.treatments
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(t => [
          new Date(t.date).toLocaleDateString(),
          t.procedure_name,
          t.description || '-',
          `${Number(t.cost).toLocaleString('fr-FR')} DH`
        ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // Appointments Table
  if (patient.appointments?.length > 0) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(11);
    doc.text('APPOINTMENT HISTORY', 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['Date & Time', 'Title', 'Status']],
      body: patient.appointments
        .sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
        .map(a => [
          new Date(a.start_time).toLocaleString(),
          a.title,
          a.status.toUpperCase()
        ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
  }

  addFooter(doc);
  doc.save(`Patient_Report_${patient.first_name}_${patient.last_name}.pdf`);
};

// ==========================================
// 2. Invoice PDF
// ==========================================
export const generateInvoicePDF = (invoice) => {
  const doc = new jsPDF();
  let y = addHeader(doc, 'INVOICE');

  // Invoice details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text(`Invoice #: ${invoice.id.toString().padStart(5, '0')}`, 14, y);
  doc.text(`Date: ${new Date(invoice.issued_date).toLocaleDateString()}`, 140, y);
  y += 7;
  doc.text(`Patient: ${invoice.patient?.first_name || ''} ${invoice.patient?.last_name || ''}`, 14, y);
  if (invoice.due_date) {
    doc.text(`Due: ${new Date(invoice.due_date).toLocaleDateString()}`, 140, y);
  }
  y += 12;

  // Line items table
  autoTable(doc, {
    startY: y,
    head: [['Description', 'Amount']],
    body: [
      [invoice.treatment?.procedure_name || 'Acte Dentaire', `${Number(invoice.amount).toLocaleString('fr-FR')} DH`],
    ],
    styles: { fontSize: 10, cellPadding: 5 },
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 130 },
      1: { cellWidth: 50, halign: 'right' },
    },
  });

  y = doc.lastAutoTable.finalY + 8;

  // Summary box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(110, y, 86, 40, 2, 2, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Total:', 115, y + 10);
  doc.text('Paid:', 115, y + 20);
  doc.text('Balance:', 115, y + 30);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`${Number(invoice.amount).toLocaleString('fr-FR')} DH`, 190, y + 10, { align: 'right' });

  doc.setTextColor(16, 185, 129);
  doc.text(`${Number(invoice.paid_amount).toLocaleString('fr-FR')} DH`, 190, y + 20, { align: 'right' });

  const balance = Number(invoice.amount) - Number(invoice.paid_amount);
  doc.setTextColor(...(balance > 0 ? [239, 68, 68] : [16, 185, 129]));
  doc.text(`${balance.toLocaleString('fr-FR')} DH`, 190, y + 30, { align: 'right' });

  y += 50;

  // Status
  const statusColor = invoice.status === 'paid' ? [16, 185, 129] : invoice.status === 'partial' ? [245, 158, 11] : [239, 68, 68];
  doc.setFillColor(...statusColor);
  doc.roundedRect(14, y, 40, 10, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(invoice.status.toUpperCase(), 34, y + 7, { align: 'center' });

  addFooter(doc);
  doc.save(`Invoice_${invoice.id.toString().padStart(5, '0')}.pdf`);
};

// ==========================================
// 3. All Patients List Export
// ==========================================
export const generatePatientsListPDF = (patients) => {
  const doc = new jsPDF();
  let y = addHeader(doc, 'Patients Directory');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Total Patients: ${patients.length}`, 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [['ID', 'Full Name', 'Gender', 'DOB', 'Phone', 'Email']],
    body: patients.map(p => [
      `PT-${p.id.toString().padStart(4, '0')}`,
      `${p.first_name} ${p.last_name}`,
      p.gender || '-',
      p.dob ? new Date(p.dob).toLocaleDateString() : '-',
      p.phone || '-',
      p.email || '-',
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  addFooter(doc);
  doc.save('Patients_Directory.pdf');
};

// ==========================================
// 4. Clinic Revenue / Financial Report
// ==========================================
export const generateRevenueReport = (stats, analytics) => {
  const doc = new jsPDF();
  let y = addHeader(doc, 'Clinic Financial Report');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Report Period: All Time`, 14, y);
  y += 10;

  // Key metrics boxes
  const metrics = [
    { label: 'Revenu Total', value: `${Number(stats?.totalRevenue || 0).toLocaleString('fr-FR')} DH` },
    { label: 'Total Patients', value: String(stats?.totalPatients || 0) },
    { label: 'Factures impayées', value: String(stats?.pendingInvoices || 0) },
  ];

  metrics.forEach((m, i) => {
    const x = 14 + i * 62;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, 56, 22, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, x + 5, y + 8);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(m.value, x + 5, y + 18);
  });

  y += 32;

  // Revenue Trend Table
  if (analytics?.revenueTrend?.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(11);
    doc.text('MONTHLY REVENUE BREAKDOWN', 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['Mois', 'Revenu']],
      body: analytics.revenueTrend.map(r => [r.name, `${Number(r.revenue).toLocaleString('fr-FR')} DH`]),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 1: { halign: 'right' } },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // Common Treatments Table
  if (analytics?.commonTreatments?.length > 0) {
    if (y > 220) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(11);
    doc.text('MOST COMMON PROCEDURES', 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['Procedure', 'Count']],
      body: analytics.commonTreatments.map(t => [t.name, t.value]),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 1: { halign: 'center' } },
    });
  }

  addFooter(doc);
  doc.save('Clinic_Financial_Report.pdf');
};
