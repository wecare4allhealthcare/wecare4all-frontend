/**
 * utils/pdfExport.js — download a prescription or full appointment
 * history as a PDF. Pure client-side (jsPDF + jspdf-autotable), no
 * backend call and no paid service — generated entirely in the
 * patient's browser from data already on the page.
 *
 * jspdf-autotable v5 changed its API from a doc.autoTable(...) method
 * to a standalone autoTable(doc, ...) function — confirmed directly by
 * installing the actual package and testing it, not assumed from
 * memory, since the older plugin-style API silently doesn't exist
 * anymore in this version.
 */
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const TYPE_LABELS = { video: "Video Consultation", inperson: "In-Person Visit", home: "Home Visit" };

function addLetterhead(doc, title) {
  doc.setFontSize(16);
  doc.setTextColor(11, 31, 58);
  doc.text("We Care 4 'all'", 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Healthcare Consultancy · wecare4all.in", 14, 24);
  doc.setDrawColor(226, 234, 244);
  doc.line(14, 28, 196, 28);

  doc.setFontSize(14);
  doc.setTextColor(11, 31, 58);
  doc.text(title, 14, 38);
}

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" });
}

export function downloadPrescriptionPDF(appt, items = []) {
  const doc = new jsPDF();
  addLetterhead(doc, "Prescription & Consultation Notes");

  autoTable(doc, {
    startY: 46,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: "bold", textColor: [100,116,139], cellWidth: 35 } },
    body: [
      ["Patient",   appt.patient_name || "—"],
      ["Doctor",    appt.doctors?.full_name ? `Dr. ${appt.doctors.full_name}` : "—"],
      ["Specialty", appt.doctors?.specialization || "—"],
      ["Date",      fmtDate(appt.appointment_date)],
      ["Time",      appt.appointment_time?.slice(0,5) || "—"],
      ["Type",      TYPE_LABELS[appt.appointment_type] || appt.appointment_type || "—"],
    ],
  });

  let cursorY = doc.lastAutoTable.finalY + 10;

  if (items.length > 0) {
    doc.setFontSize(11);
    doc.setTextColor(3, 105, 161);
    doc.text("Medicines", 14, cursorY);
    doc.setDrawColor(147, 197, 253);
    doc.line(14, cursorY + 2, 196, cursorY + 2);

    autoTable(doc, {
      startY: cursorY + 6,
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [3, 105, 161], textColor: [255,255,255] },
      head: [["Medicine", "Dosage", "Frequency", "Duration", "Instructions"]],
      body: items.map(it => [
        it.medicine_name || "—", it.dosage || "—", it.frequency || "—",
        it.duration || "—", it.instructions || "—",
      ]),
    });
    cursorY = doc.lastAutoTable.finalY + 10;
  }

  doc.setFontSize(11);
  doc.setTextColor(21, 128, 61);
  doc.text("Doctor's Notes / Prescription", 14, cursorY);
  doc.setDrawColor(134, 239, 172);
  doc.line(14, cursorY + 2, 196, cursorY + 2);

  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  const text = appt.prescription?.trim() || "No additional notes were added for this consultation.";
  const lines = doc.splitTextToSize(text, 180);
  doc.text(lines, 14, cursorY + 10);

  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "This document is generated for your personal records. For medical decisions, always consult your doctor directly.",
    14, pageHeight - 12
  );

  doc.save(`prescription-${appt.id.slice(0,8)}.pdf`);
}

export function downloadAppointmentSummaryPDF(appt, items = []) {
  /**
   * Patient-facing single-page appointment summary PDF.
   *
   * Distinct from downloadPrescriptionPDF (which is the doctor's
   * clinical output, accessed via the Prescription & Notes modal).
   * This one is designed to be a clean keepsake the patient downloads
   * directly from their appointment card, immediately after completion,
   * without opening any modal first. It includes everything a patient
   * needs for their personal records:
   *
   *   - Consultation details (doctor, date, type)
   *   - What they reported as symptoms
   *   - Medicines prescribed (full structured list)
   *   - Doctor's notes / prescription text
   *   - A footer reminding them to follow up
   *
   * The medicine list is passed in as `items` — the caller is
   * responsible for fetching GET /appointments/{id}/prescription-items
   * before calling this function (see AppointmentCard in patient
   * Dashboard.jsx, which fetches on button click before calling).
   */
  const doc = new jsPDF();

  // ── Letterhead ──────────────────────────────────────────────
  doc.setFillColor(4, 120, 87);
  doc.rect(0, 0, 210, 36, "F");

  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("We Care 4 'all'", 14, 15);

  doc.setFontSize(10);
  doc.setTextColor(187, 247, 208);
  doc.text("Healthcare Consultancy · wecare4all.in", 14, 22);

  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("Appointment Summary", 14, 31);

  // ── Consultation details box ─────────────────────────────────
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 42, 182, 52, 3, 3, "F");

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const detailRows = [
    ["Patient",     appt.patient_name || "—"],
    ["Doctor",      appt.doctors?.full_name ? `Dr. ${appt.doctors.full_name}` : "—"],
    ["Specialization", appt.doctors?.specialization || "—"],
    ["Date",        fmtDate(appt.appointment_date)],
    ["Time",        appt.appointment_time?.slice(0, 5) || "—"],
    ["Consultation", TYPE_LABELS[appt.appointment_type] || appt.appointment_type || "—"],
    ["Status",      "Completed ✓"],
  ];
  detailRows.forEach(([label, value], i) => {
    const y = 50 + i * 6;
    doc.setTextColor(100, 116, 139);
    doc.text(label, 18, y);
    doc.setTextColor(11, 31, 58);
    doc.setFontSize(9.5);
    doc.text(value, 72, y);
    doc.setFontSize(9);
  });

  let y = 102;

  // ── Symptoms ────────────────────────────────────────────────
  if (appt.symptoms) {
    doc.setFillColor(255, 251, 235);
    doc.roundedRect(14, y, 182, 1, 0, 0, "F");

    doc.setFontSize(10);
    doc.setTextColor(180, 83, 9);
    doc.text("Symptoms Reported", 14, y + 8);
    doc.setDrawColor(253, 230, 138);
    doc.line(14, y + 10, 196, y + 10);

    doc.setFontSize(9.5);
    doc.setTextColor(55, 65, 81);
    const sympLines = doc.splitTextToSize(appt.symptoms, 180);
    doc.text(sympLines, 14, y + 16);
    y += 16 + sympLines.length * 5 + 8;
  }

  // ── Medicines prescribed ─────────────────────────────────────
  if (items.length > 0) {
    doc.setFontSize(10);
    doc.setTextColor(3, 105, 161);
    doc.text("Medicines Prescribed", 14, y + 6);
    doc.setDrawColor(147, 197, 253);
    doc.line(14, y + 8, 196, y + 8);

    autoTable(doc, {
      startY: y + 12,
      theme: "striped",
      styles: { fontSize: 8.5, cellPadding: 2.5 },
      headStyles: { fillColor: [3, 105, 161], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [239, 248, 255] },
      columnStyles: {
        0: { cellWidth: 48 },
        1: { cellWidth: 28 },
        2: { cellWidth: 32 },
        3: { cellWidth: 28 },
        4: { cellWidth: "auto" },
      },
      head: [["Medicine", "Dosage", "Frequency", "Duration", "Instructions"]],
      body: items.map(it => [
        it.medicine_name || "—",
        it.dosage        || "—",
        it.frequency     || "—",
        it.duration      || "—",
        it.instructions  || "—",
      ]),
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // ── Doctor's notes ───────────────────────────────────────────
  const notes = appt.prescription?.trim();
  if (notes) {
    doc.setFontSize(10);
    doc.setTextColor(21, 128, 61);
    doc.text("Doctor's Notes", 14, y + 6);
    doc.setDrawColor(134, 239, 172);
    doc.line(14, y + 8, 196, y + 8);

    doc.setFontSize(9.5);
    doc.setTextColor(55, 65, 81);
    const noteLines = doc.splitTextToSize(notes, 180);
    doc.text(noteLines, 14, y + 14);
    y += 14 + noteLines.length * 5 + 6;
  }

  if (!notes && items.length === 0) {
    doc.setFontSize(9.5);
    doc.setTextColor(148, 163, 184);
    doc.setFont(undefined, "italic");
    doc.text("No prescription or notes were added for this consultation.", 14, y + 10);
    doc.setFont(undefined, "normal");
  }

  // ── Footer ───────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(248, 250, 252);
  doc.rect(0, pageH - 20, 210, 20, "F");

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "This is an automated summary for your personal records. For clinical decisions, always consult your doctor directly. · wecare4all.in",
    14, pageH - 10
  );
  doc.text(
    `Generated: ${fmtDate(new Date())}`,
    196, pageH - 10, { align: "right" }
  );

  doc.save(`appointment-summary-${appt.id.slice(0, 8)}.pdf`);
}

export function downloadAppointmentHistoryPDF(appointments, patientName) {
  const doc = new jsPDF();
  addLetterhead(doc, "Appointment History");

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Patient: ${patientName || "—"}`, 14, 44);
  doc.text(`Generated: ${fmtDate(new Date())}`, 14, 49);

  const rows = appointments.map(a => [
    fmtDate(a.appointment_date),
    a.appointment_time?.slice(0,5) || "—",
    a.doctors?.full_name ? `Dr. ${a.doctors.full_name}` : "—",
    a.doctors?.specialization || "—",
    TYPE_LABELS[a.appointment_type] || a.appointment_type || "—",
    a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : "—",
  ]);

  autoTable(doc, {
    startY: 56,
    head: [["Date", "Time", "Doctor", "Specialty", "Type", "Status"]],
    body: rows,
    styles: { fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: [4, 120, 87], textColor: [255,255,255] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save(`appointment-history-${new Date().toISOString().slice(0,10)}.pdf`);
}
