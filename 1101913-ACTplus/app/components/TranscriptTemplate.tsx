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

      // Header with ACT+ branding
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(28);
      pdf.setTextColor(249, 115, 22); // Orange
      pdf.text('ACT+', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 10;
      pdf.setFontSize(20);
      pdf.setTextColor(31, 41, 55); // Dark gray/black
      pdf.text('EXTRA CURRICULAR TRANSCRIPT', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 8;
      pdf.setFontSize(11);
      pdf.setTextColor(107, 114, 128); // Gray
      pdf.text('Official Academic Record', pageWidth / 2, yPos, { align: 'center' });
      
      // Orange line separator
      yPos += 5;
      pdf.setDrawColor(249, 115, 22);
      pdf.setLineWidth(1);
      pdf.line(15, yPos, pageWidth - 15, yPos);
      
      yPos += 15;
      
      // Student Info Box
      pdf.setFillColor(255, 247, 237); // Light orange
      pdf.setDrawColor(249, 115, 22); // Orange border
      pdf.setLineWidth(0.5);
      pdf.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3, 'FD');
      
      yPos += 8;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(31, 41, 55);
      pdf.text('Student Information', 20, yPos);
      
      yPos += 7;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(55, 65, 81);
      pdf.text(`Name: ${studentName}`, 20, yPos);
      
      yPos += 6;
      pdf.text(`Transcript ID: ${transcript.transcript_code}`, 20, yPos);
      
      yPos += 6;
      pdf.text(`Generated: ${new Date(transcript.generated_at).toLocaleDateString()}`, 20, yPos);
      
      if (transcript.valid_until) {
        yPos += 6;
        const expStatus = new Date() > new Date(transcript.valid_until) ? '(EXPIRED)' : '';
        pdf.setTextColor(249, 115, 22);
        pdf.text(`Valid Until: ${new Date(transcript.valid_until).toLocaleDateString()} ${expStatus}`, 20, yPos);
      }

      yPos += 18;

      // Summary Statistics
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(249, 115, 22);
      pdf.text('Academic Summary', 15, yPos);
      
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
        headStyles: { 
          fillColor: [249, 115, 22], // Orange
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        styles: { 
          fontSize: 9,
          textColor: [31, 41, 55]
        },
        margin: { left: 15, right: 15 }
      });

      yPos = (pdf as any).lastAutoTable.finalY + 10;

      // Courses Section
      if (transcript.courses && transcript.courses.length > 0) {
        pdf.addPage();
        yPos = 20;
        
        // Page header
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(249, 115, 22);
        pdf.text('ACT+', 15, yPos);
        yPos += 10;
        
        pdf.setFontSize(14);
        pdf.setTextColor(31, 41, 55);
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
            headStyles: { 
              fillColor: [31, 41, 55], // Dark
              textColor: [255, 255, 255],
              fontSize: 9,
              fontStyle: 'bold'
            },
            styles: { 
              fontSize: 8,
              textColor: [31, 41, 55]
            },
            margin: { left: 15, right: 15 },
            columnStyles: {
              0: { cellWidth: 70 },
              1: { cellWidth: 35 },
              2: { cellWidth: 25 },
              3: { cellWidth: 20, halign: 'center', textColor: [249, 115, 22], fontStyle: 'bold' },
              4: { cellWidth: 30 }
            }
          });
        }
      }

      // Activities Section
      if (transcript.activities && transcript.activities.length > 0) {
        pdf.addPage();
        yPos = 20;
        
        // Page header
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(249, 115, 22);
        pdf.text('ACT+', 15, yPos);
        yPos += 10;
        
        pdf.setFontSize(14);
        pdf.setTextColor(31, 41, 55);
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
          headStyles: { 
            fillColor: [31, 41, 55],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold'
          },
          styles: { 
            fontSize: 8,
            textColor: [31, 41, 55]
          },
          margin: { left: 15, right: 15 },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 25, halign: 'center' },
            2: { cellWidth: 20, halign: 'center', textColor: [249, 115, 22], fontStyle: 'bold' },
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
          
          // Page header
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(12);
          pdf.setTextColor(249, 115, 22);
          pdf.text('ACT+', 15, yPos);
          yPos += 10;
        } else {
          yPos = currentY + 15;
        }
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(31, 41, 55);
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
          headStyles: { 
            fillColor: [31, 41, 55],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold'
          },
          styles: { 
            fontSize: 8,
            textColor: [31, 41, 55]
          },
          margin: { left: 15, right: 15 },
          columnStyles: {
            2: { halign: 'center', textColor: [249, 115, 22], fontStyle: 'bold' },
            3: { halign: 'center' }
          }
        });
      }

      // Footer on all pages
      const pageCount = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        
        // Orange line
        const footerY = pdf.internal.pageSize.getHeight() - 20;
        pdf.setDrawColor(249, 115, 22);
        pdf.setLineWidth(0.5);
        pdf.line(15, footerY, pageWidth - 15, footerY);
        
        pdf.setFontSize(8);
        pdf.setTextColor(107, 114, 128);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pdf.internal.pageSize.getHeight() - 12,
          { align: 'center' }
        );
        
        pdf.setTextColor(249, 115, 22);
        pdf.setFont('helvetica', 'bold');
        pdf.text(
          `Verify at: actplus.com/verify-transcript/${transcript.transcript_code}`,
          pageWidth / 2,
          pdf.internal.pageSize.getHeight() - 7,
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
    <div className="space-y-8">
      {/* Preview */}
      <div ref={transcriptRef} className="bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden max-w-4xl mx-auto">
        {/* Header with Orange Gradient */}
        <div 
          className="text-center py-8 px-8"
          style={{
            background: 'linear-gradient(135deg, rgb(249, 115, 22) 0%, rgb(234, 88, 12) 100%)'
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="text-5xl font-black text-white">ACT</div>
            <div className="text-5xl font-black text-white">+</div>
          </div>
          <div 
            className="h-1 w-24 mx-auto mb-4"
            style={{
              background: 'linear-gradient(90deg, transparent, white, transparent)'
            }}
          ></div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
            EXTRA CURRICULAR TRANSCRIPT
          </h1>
          <p className="text-orange-100 font-medium">Official Academic Record</p>
        </div>

        {/* Student Info */}
        <div className="p-8">
          <div 
            className="rounded-xl p-6 mb-8"
            style={{
              backgroundColor: 'rgb(255, 247, 237)',
              border: '3px solid rgb(249, 115, 22)'
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div 
                className="w-2 h-8 rounded"
                style={{ backgroundColor: 'rgb(249, 115, 22)' }}
              ></div>
              <h2 className="font-bold text-xl text-gray-900">Student Information</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Name:</span>
                <span className="font-bold text-gray-900">{studentName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Transcript ID:</span>
                <span 
                  className="font-mono font-bold px-2 py-1 rounded"
                  style={{
                    backgroundColor: 'rgb(31, 41, 55)',
                    color: 'rgb(249, 115, 22)'
                  }}
                >
                  {transcript.transcript_code}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Generated:</span>
                <span className="text-gray-900">{new Date(transcript.generated_at).toLocaleDateString()}</span>
              </div>
              {transcript.valid_until && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium">Valid Until:</span>
                  <span 
                    className="font-semibold"
                    style={{ color: 'rgb(249, 115, 22)' }}
                  >
                    {new Date(transcript.valid_until).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div 
                className="w-2 h-8 rounded"
                style={{ backgroundColor: 'rgb(249, 115, 22)' }}
              ></div>
              <h2 className="font-bold text-xl text-gray-900">Academic Summary</h2>
            </div>
            <div className="grid grid-cols-5 gap-4">
              <div 
                className="rounded-xl p-5 text-center transform transition-all hover:scale-105 hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, rgb(249, 115, 22), rgb(234, 88, 12))'
                }}
              >
                <div className="text-4xl font-black text-white mb-2">{transcript.total_courses}</div>
                <div className="text-xs text-white font-bold uppercase tracking-wider">Courses</div>
              </div>
              
              <div 
                className="rounded-xl p-5 text-center transform transition-all hover:scale-105 hover:shadow-lg"
                style={{
                  backgroundColor: 'rgb(31, 41, 55)',
                  border: '2px solid rgb(249, 115, 22)'
                }}
              >
                <div 
                  className="text-4xl font-black mb-2"
                  style={{ color: 'rgb(249, 115, 22)' }}
                >
                  {transcript.completed_courses}
                </div>
                <div className="text-xs text-white font-bold uppercase tracking-wider">Completed</div>
              </div>
              
              <div 
                className="rounded-xl p-5 text-center transform transition-all hover:scale-105 hover:shadow-lg"
                style={{
                  backgroundColor: 'rgb(255, 247, 237)',
                  border: '2px solid rgb(249, 115, 22)'
                }}
              >
                <div 
                  className="text-4xl font-black mb-2"
                  style={{ color: 'rgb(31, 41, 55)' }}
                >
                  {transcript.total_activities}
                </div>
                <div 
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'rgb(249, 115, 22)' }}
                >
                  Activities
                </div>
              </div>
              
              <div 
                className="rounded-xl p-5 text-center transform transition-all hover:scale-105 hover:shadow-lg"
                style={{
                  backgroundColor: 'rgb(31, 41, 55)'
                }}
              >
                <div className="text-4xl font-black text-white mb-2">{transcript.total_volunteer_hours}</div>
                <div 
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'rgb(249, 115, 22)' }}
                >
                  Hours
                </div>
              </div>
              
              <div 
                className="rounded-xl p-5 text-center transform transition-all hover:scale-105 hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, rgb(249, 115, 22), rgb(234, 88, 12))'
                }}
              >
                <div className="text-4xl font-black text-white mb-2">{transcript.total_skills}</div>
                <div className="text-xs text-white font-bold uppercase tracking-wider">Skills</div>
              </div>
            </div>
          </div>

          {/* Courses Preview (if available) */}
          {transcript.courses && transcript.courses.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div 
                  className="w-2 h-8 rounded"
                  style={{ backgroundColor: 'rgb(249, 115, 22)' }}
                ></div>
                <h2 className="font-bold text-xl text-gray-900">Completed Courses</h2>
                <span 
                  className="ml-auto px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: 'rgb(249, 115, 22)',
                    color: 'white'
                  }}
                >
                  {transcript.courses.filter((c: any) => c.completed).length} courses
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                {transcript.courses.filter((c: any) => c.completed).slice(0, 5).map((course: any, idx: number) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-lg border-2 hover:shadow-md transition-all"
                    style={{ borderColor: 'rgb(229, 231, 235)' }}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                        <span>{course.category || 'General'}</span>
                        <span>•</span>
                        <span>{course.level || 'Beginner'}</span>
                      </div>
                    </div>
                    <div 
                      className="text-2xl font-black px-4 py-2 rounded-lg"
                      style={{
                        color: 'rgb(249, 115, 22)',
                        backgroundColor: 'rgb(255, 247, 237)'
                      }}
                    >
                      {course.averageScore}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Download Note */}
          <div 
            className="text-center py-6 px-8 rounded-xl"
            style={{
              backgroundColor: 'rgb(249, 250, 251)',
              border: '2px dashed rgb(209, 213, 219)'
            }}
          >
            <div className="text-4xl mb-3">📄</div>
            <p className="text-sm text-gray-600 font-medium">
              This is a preview. Download the PDF for the complete transcript with all courses, activities, and skills.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="py-4 px-8 text-center"
          style={{
            backgroundColor: 'rgb(31, 41, 55)',
            borderTop: '4px solid rgb(249, 115, 22)'
          }}
        >
          <p 
            className="text-xs font-mono font-bold"
            style={{ color: 'rgb(249, 115, 22)' }}
          >
            🔒 Verify at: actplus.com/verify-transcript/{transcript.transcript_code}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-3 px-10 py-5 text-white font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg"
          style={{
            background: 'linear-gradient(135deg, rgb(249, 115, 22), rgb(234, 88, 12))'
          }}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Complete Transcript
        </button>

        <button
          onClick={() => {
            const url = `actplus.com/verify-transcript/${transcript.transcript_code}`;
            navigator.clipboard.writeText(url);
            alert('Verification link copied to clipboard!');
          }}
          className="flex items-center gap-3 px-10 py-5 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
          style={{
            backgroundColor: 'rgb(31, 41, 55)',
            color: 'white'
          }}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Verification Link
        </button>
      </div>
    </div>
  );
}