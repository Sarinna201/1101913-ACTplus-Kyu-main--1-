// components/TranscriptTemplate.tsx
'use client';

import { useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type TranscriptTemplateProps = {
  transcript: any;
  studentName: string;
  onDownload?: () => void;
};

export default function TranscriptTemplate({ 
  transcript, 
  studentName,
  onDownload 
}: TranscriptTemplateProps) {
  const transcriptRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPos = 20;

      // Header
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.setTextColor(79, 70, 229);
      pdf.text('EXTRA CURRICULAR TRANSCRIPT', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 8;
      pdf.setFontSize(12);
      pdf.setTextColor(107, 114, 128);
      pdf.text('ACTPlus Learning Platform', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 15;
      
      // Student Info Box
      pdf.setFillColor(240, 240, 255);
      pdf.roundedRect(15, yPos, pageWidth - 30, 30, 3, 3, 'F');
      
      yPos += 8;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(17, 24, 39);
      pdf.text('Student Information', 20, yPos);
      
      yPos += 7;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Name: ${studentName}`, 20, yPos);
      
      yPos += 6;
      pdf.text(`Transcript ID: ${transcript.transcript_code}`, 20, yPos);
      
      yPos += 6;
      pdf.text(`Generated: ${new Date(transcript.generated_at).toLocaleDateString()}`, 20, yPos);
      
      if (transcript.valid_until) {
        yPos += 6;
        const expStatus = new Date() > new Date(transcript.valid_until) ? '(EXPIRED)' : '';
        pdf.text(`Valid Until: ${new Date(transcript.valid_until).toLocaleDateString()} ${expStatus}`, 20, yPos);
      }

      yPos += 15;

      // Summary Statistics
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(79, 70, 229);
      pdf.text('Summary', 15, yPos);
      
      yPos += 8;
      
      const summaryData = [
        ['Total Courses Enrolled', transcript.total_courses.toString()],
        ['Courses Completed', transcript.completed_courses.toString()],
        ['Activities Participated', transcript.total_activities.toString()],
        ['Volunteer Hours', transcript.total_volunteer_hours.toString()],
        ['Skills Acquired', transcript.total_skills.toString()]
      ];

      autoTable(pdf, {
        startY: yPos,
        head: [['Category', 'Count']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], fontSize: 10 },
        styles: { fontSize: 9 },
        margin: { left: 15, right: 15 }
      });

      yPos = (pdf as any).lastAutoTable.finalY + 10;

      // Courses Section
      if (transcript.courses && transcript.courses.length > 0) {
        pdf.addPage();
        yPos = 20;
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(79, 70, 229);
        pdf.text('Completed Courses', 15, yPos);
        
        yPos += 8;
        
        const coursesData = transcript.courses
          .filter((c: any) => c.completed)
          .map((c: any) => [
            c.title,
            c.category || '-',
            c.level || '-',
            `${c.averageScore}%`,
            new Date(c.enrolledAt).toLocaleDateString()
          ]);

        if (coursesData.length > 0) {
          autoTable(pdf, {
            startY: yPos,
            head: [['Course Title', 'Category', 'Level', 'Score', 'Date']],
            body: coursesData,
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229], fontSize: 9 },
            styles: { fontSize: 8 },
            margin: { left: 15, right: 15 },
            columnStyles: {
              0: { cellWidth: 70 },
              1: { cellWidth: 35 },
              2: { cellWidth: 25 },
              3: { cellWidth: 20 },
              4: { cellWidth: 30 }
            }
          });
        }
      }

      // Activities Section
      if (transcript.activities && transcript.activities.length > 0) {
        pdf.addPage();
        yPos = 20;
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(79, 70, 229);
        pdf.text('Activities Participated', 15, yPos);
        
        yPos += 8;
        
        const activitiesData = transcript.activities.map((a: any) => [
          a.title,
          `${a.year}/${a.term}`,
          a.volunteerHours?.toString() || '0',
          a.authority || '-',
          new Date(a.dateStart).toLocaleDateString()
        ]);

        autoTable(pdf, {
          startY: yPos,
          head: [['Activity', 'Year/Term', 'Hours', 'Authority', 'Date']],
          body: activitiesData,
          theme: 'striped',
          headStyles: { fillColor: [79, 70, 229], fontSize: 9 },
          styles: { fontSize: 8 },
          margin: { left: 15, right: 15 },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 25 },
            2: { cellWidth: 20 },
            3: { cellWidth: 35 },
            4: { cellWidth: 30 }
          }
        });
      }

      // Skills Section
      if (transcript.skills && transcript.skills.length > 0) {
        const currentY = (pdf as any).lastAutoTable?.finalY || yPos;
        
        if (currentY > 200) {
          pdf.addPage();
          yPos = 20;
        } else {
          yPos = currentY + 15;
        }
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(79, 70, 229);
        pdf.text('Skills & Competencies', 15, yPos);
        
        yPos += 8;
        
        const skillsData = transcript.skills.map((s: any) => [
          s.code,
          s.name,
          s.totalPoints.toString(),
          `Level ${s.level}`
        ]);

        autoTable(pdf, {
          startY: yPos,
          head: [['Code', 'Skill Name', 'Points', 'Level']],
          body: skillsData,
          theme: 'striped',
          headStyles: { fillColor: [79, 70, 229], fontSize: 9 },
          styles: { fontSize: 8 },
          margin: { left: 15, right: 15 }
        });
      }

      // Footer on all pages
      const pageCount = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(156, 163, 175);
        pdf.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
        pdf.text(
          `Verify at: actplus.com/verify-transcript/${transcript.transcript_code}`,
          pageWidth / 2,
          pdf.internal.pageSize.getHeight() - 5,
          { align: 'center' }
        );
      }

      pdf.save(`Transcript_${transcript.transcript_code}.pdf`);

      if (onDownload) onDownload();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div ref={transcriptRef} className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-4xl mx-auto text-gray-800">
        {/* Header */}
        <div className="text-center mb-8 pb-8 border-b-2 border-indigo-600">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">
            EXTRA CURRICULAR TRANSCRIPT
          </h1>
          <p className="text-gray-600">ACTPlus Learning Platform</p>
        </div>

        {/* Student Info */}
        <div className="bg-indigo-50 rounded-lg p-6 mb-8">
          <h2 className="font-bold text-lg text-gray-900 mb-4">Student Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 font-semibold">{studentName}</span>
            </div>
            <div>
              <span className="text-gray-600">Transcript ID:</span>
              <span className="ml-2 font-mono font-semibold">{transcript.transcript_code}</span>
            </div>
            <div>
              <span className="text-gray-600">Generated:</span>
              <span className="ml-2">{new Date(transcript.generated_at).toLocaleDateString()}</span>
            </div>
            {transcript.valid_until && (
              <div>
                <span className="text-gray-600">Valid Until:</span>
                <span className="ml-2">{new Date(transcript.valid_until).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mb-8">
          <h2 className="font-bold text-lg text-gray-900 mb-4">Summary</h2>
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-900">{transcript.total_courses}</div>
              <div className="text-xs text-blue-600 mt-1">Courses</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-900">{transcript.completed_courses}</div>
              <div className="text-xs text-green-600 mt-1">Completed</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-900">{transcript.total_activities}</div>
              <div className="text-xs text-purple-600 mt-1">Activities</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-orange-900">{transcript.total_volunteer_hours}</div>
              <div className="text-xs text-orange-600 mt-1">Hours</div>
            </div>
            <div className="bg-pink-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-pink-900">{transcript.total_skills}</div>
              <div className="text-xs text-pink-600 mt-1">Skills</div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="text-center text-xs text-gray-500 italic mt-8 pt-8 border-t border-gray-200">
          <p>This is a preview. Download PDF for the complete transcript.</p>
        </div>
      </div>

      {/* Download Button */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-lg text-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF
        </button>
      </div>
    </div>
  );
}