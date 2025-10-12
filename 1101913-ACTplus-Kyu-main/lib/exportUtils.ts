// lib/exportUtils.ts
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ParticipantData = {
  id: number;
  username: string;
  email: string;
  role: string;
  checkedIn: boolean;
  checkedAt?: string;
};

// Export to Excel using ExcelJS (ปลอดภัยกว่า)
export const exportToExcel = async (
  participants: ParticipantData[], 
  activityTitle: string
) => {
  // Create workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Participants');

  // Add header with styling
  worksheet.columns = [
    { header: 'No.', key: 'no', width: 8 },
    { header: 'Username', key: 'username', width: 25 },
    { header: 'Email', key: 'email', width: 35 },
    { header: 'Role', key: 'role', width: 15 },
    { header: 'Status', key: 'status', width: 18 },
    { header: 'Check-in Time', key: 'checkedAt', width: 22 }
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F46E5' } // Indigo
  };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  // Add data
  participants.forEach((p, index) => {
    worksheet.addRow({
      no: index + 1,
      username: p.username,
      email: p.email,
      role: p.role,
      status: p.checkedIn ? 'Checked In' : 'Not Checked In',
      checkedAt: p.checkedAt ? new Date(p.checkedAt).toLocaleString() : '-'
    });
  });

  // Style data rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.alignment = { vertical: 'middle' };
      // Alternate row colors
      if (rowNumber % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF3F4F6' } // Light gray
        };
      }
    }
    row.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Generate buffer and save
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  const filename = `${activityTitle.replace(/[^a-z0-9]/gi, '_')}_Participants_${new Date().toISOString().split('T')[0]}.xlsx`;
  saveAs(blob, filename);
};

// Export to CSV (เหมือนเดิม)
export const exportToCSV = (
  participants: ParticipantData[], 
  activityTitle: string
) => {
  const headers = ['No.', 'Username', 'Email', 'Role', 'Status', 'Check-in Time'];
  const rows = participants.map((p, index) => [
    index + 1,
    p.username,
    p.email,
    p.role,
    p.checkedIn ? 'Checked In' : 'Not Checked In',
    p.checkedAt ? new Date(p.checkedAt).toLocaleString() : '-'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = `${activityTitle.replace(/[^a-z0-9]/gi, '_')}_Participants_${new Date().toISOString().split('T')[0]}.csv`;
  saveAs(blob, filename);
};

// Export to PDF (เหมือนเดิม)
export const exportToPDF = (
  participants: ParticipantData[], 
  activityTitle: string,
  activityDetails?: {
    dateStart: string;
    dateEnd?: string;
    location?: string;
  }
) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Attendance Report', 14, 20);

  // Add activity info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Activity: ${activityTitle}`, 14, 30);
  
  if (activityDetails) {
    let yPos = 37;
    if (activityDetails.dateStart) {
      doc.setFontSize(10);
      doc.text(`Date: ${new Date(activityDetails.dateStart).toLocaleDateString()}`, 14, yPos);
      yPos += 7;
    }
    if (activityDetails.location) {
      doc.text(`Location: ${activityDetails.location}`, 14, yPos);
      yPos += 7;
    }
    doc.text(`Total Participants: ${participants.length}`, 14, yPos);
    yPos += 7;
    doc.text(`Checked In: ${participants.filter(p => p.checkedIn).length}`, 14, yPos);
  }

  // Add table
  const tableData = participants.map((p, index) => [
    index + 1,
    p.username,
    p.email,
    p.role,
    p.checkedIn ? '✓' : '✗',
    p.checkedAt ? new Date(p.checkedAt).toLocaleString() : '-'
  ]);

  autoTable(doc, {
    head: [['No.', 'Username', 'Email', 'Role', 'Checked In', 'Check-in Time']],
    body: tableData,
    startY: activityDetails ? 60 : 40,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [79, 70, 229], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 30 },
      2: { cellWidth: 45 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 35 }
    }
  });

  // Add footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      `Generated on ${new Date().toLocaleString()}`,
      14,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  const filename = `${activityTitle.replace(/[^a-z0-9]/gi, '_')}_Attendance_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

// Export summary statistics with ExcelJS
export const exportSummaryToExcel = async (
  participants: ParticipantData[],
  activityTitle: string,
  activityDetails?: any
) => {
  const checkedIn = participants.filter(p => p.checkedIn).length;
  const notCheckedIn = participants.length - checkedIn;
  
  // Create workbook
  const workbook = new ExcelJS.Workbook();

  // Summary Sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 25 },
    { header: 'Value', key: 'value', width: 20 }
  ];

  // Style header
  summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  summarySheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F46E5' }
  };

  // Add summary data
  summarySheet.addRow({ metric: 'Total Participants', value: participants.length });
  summarySheet.addRow({ metric: 'Checked In', value: checkedIn });
  summarySheet.addRow({ metric: 'Not Checked In', value: notCheckedIn });
  summarySheet.addRow({ 
    metric: 'Check-in Rate', 
    value: `${((checkedIn / participants.length) * 100).toFixed(1)}%` 
  });

  // Role Breakdown Sheet
  const roleSheet = workbook.addWorksheet('Role Breakdown');
  roleSheet.columns = [
    { header: 'Role', key: 'role', width: 20 },
    { header: 'Count', key: 'count', width: 15 }
  ];

  roleSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  roleSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF10B981' }
  };

  const roleBreakdown = participants.reduce((acc, p) => {
    acc[p.role] = (acc[p.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(roleBreakdown).forEach(([role, count]) => {
    roleSheet.addRow({ role, count });
  });

  // Participants Sheet
  const participantSheet = workbook.addWorksheet('Participants');
  participantSheet.columns = [
    { header: 'No.', key: 'no', width: 8 },
    { header: 'Username', key: 'username', width: 25 },
    { header: 'Email', key: 'email', width: 35 },
    { header: 'Role', key: 'role', width: 15 },
    { header: 'Status', key: 'status', width: 18 },
    { header: 'Check-in Time', key: 'checkedAt', width: 22 }
  ];

  participantSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  participantSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF8B5CF6' }
  };

  participants.forEach((p, index) => {
    participantSheet.addRow({
      no: index + 1,
      username: p.username,
      email: p.email,
      role: p.role,
      status: p.checkedIn ? 'Checked In' : 'Not Checked In',
      checkedAt: p.checkedAt ? new Date(p.checkedAt).toLocaleString() : '-'
    });
  });

  // Style all sheets
  [summarySheet, roleSheet, participantSheet].forEach(sheet => {
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: 'middle' };
        if (rowNumber % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF3F4F6' }
          };
        }
      }
      row.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  // Generate and save
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  const filename = `${activityTitle.replace(/[^a-z0-9]/gi, '_')}_Full_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
  saveAs(blob, filename);
};