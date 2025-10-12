// components/CertificateTemplate.tsx
'use client';

import { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type CertificateTemplateProps = {
  certificate: {
    certificate_code: string;
    course_title: string;
    completion_date: string;
    grade: string;
    score: number;
    instructor_name: string;
  };
  studentName: string;
  onDownload?: () => void;
};

export default function CertificateTemplate({ 
  certificate, 
  studentName,
  onDownload 
}: CertificateTemplateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff',
        // ปิด advanced features
        allowTaint: true,
        foreignObjectRendering: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Certificate_${certificate.certificate_code}.pdf`);

      if (onDownload) onDownload();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Certificate Preview - ใช้ inline styles แทน Tailwind gradients */}
      <div 
        ref={certificateRef}
        className="bg-white rounded-lg shadow-2xl overflow-hidden mx-auto"
        style={{
          width: '1190px',
          height: '842px',
          maxWidth: '100%'
        }}
      >
        {/* Border */}
        <div 
          className="w-full h-full p-8 relative"
          style={{
            border: '20px double rgb(79, 70, 229)' // RGB แทน Tailwind class
          }}
        >
          {/* Corner Decorations */}
          <div 
            className="absolute top-6 left-6 w-16 h-16"
            style={{
              borderTop: '4px solid rgb(234, 179, 8)',
              borderLeft: '4px solid rgb(234, 179, 8)'
            }}
          ></div>
          <div 
            className="absolute top-6 right-6 w-16 h-16"
            style={{
              borderTop: '4px solid rgb(234, 179, 8)',
              borderRight: '4px solid rgb(234, 179, 8)'
            }}
          ></div>
          <div 
            className="absolute bottom-6 left-6 w-16 h-16"
            style={{
              borderBottom: '4px solid rgb(234, 179, 8)',
              borderLeft: '4px solid rgb(234, 179, 8)'
            }}
          ></div>
          <div 
            className="absolute bottom-6 right-6 w-16 h-16"
            style={{
              borderBottom: '4px solid rgb(234, 179, 8)',
              borderRight: '4px solid rgb(234, 179, 8)'
            }}
          ></div>

          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="text-6xl mb-4">🎓</div>
              <h1 
                className="text-5xl font-serif font-bold"
                style={{ color: 'rgb(55, 48, 163)' }}
              >
                Certificate of Completion
              </h1>
              <p 
                className="text-lg font-serif italic"
                style={{ color: 'rgb(107, 114, 128)' }}
              >
                This is to certify that
              </p>
            </div>

            {/* Student Name */}
            <div 
              className="py-4 px-12"
              style={{ borderBottom: '2px solid rgb(55, 48, 163)' }}
            >
              <h2 
                className="text-4xl font-serif font-bold"
                style={{ color: 'rgb(17, 24, 39)' }}
              >
                {studentName}
              </h2>
            </div>

            {/* Course Info */}
            <div className="space-y-2">
              <p 
                className="text-lg font-serif"
                style={{ color: 'rgb(107, 114, 128)' }}
              >
                has successfully completed the course
              </p>
              <h3 
                className="text-3xl font-serif font-semibold px-8"
                style={{ color: 'rgb(55, 48, 163)' }}
              >
                {certificate.course_title}
              </h3>
            </div>

            {/* Grade & Score - ใช้ RGB แทน gradient */}
            <div className="flex items-center gap-8 text-center">
              <div 
                className="rounded-lg p-4"
                style={{
                  backgroundColor: 'rgb(254, 249, 195)',
                  border: '2px solid rgb(234, 179, 8)'
                }}
              >
                <div 
                  className="text-sm mb-1"
                  style={{ color: 'rgb(107, 114, 128)' }}
                >
                  Grade
                </div>
                <div 
                  className="text-3xl font-bold"
                  style={{ color: 'rgb(161, 98, 7)' }}
                >
                  {certificate.grade}
                </div>
              </div>
              <div 
                className="rounded-lg p-4"
                style={{
                  backgroundColor: 'rgb(220, 252, 231)',
                  border: '2px solid rgb(34, 197, 94)'
                }}
              >
                <div 
                  className="text-sm mb-1"
                  style={{ color: 'rgb(107, 114, 128)' }}
                >
                  Score
                </div>
                <div 
                  className="text-3xl font-bold"
                  style={{ color: 'rgb(21, 128, 61)' }}
                >
                  {certificate.score}%
                </div>
              </div>
            </div>

            {/* Date & Signatures */}
            <div className="flex items-end justify-between w-full px-12 mt-8">
              <div className="text-left">
                <p 
                  className="text-sm mb-1"
                  style={{ color: 'rgb(107, 114, 128)' }}
                >
                  Date of Completion
                </p>
                <p 
                  className="text-lg font-semibold"
                  style={{ color: 'rgb(17, 24, 39)' }}
                >
                  {new Date(certificate.completion_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div className="text-center">
                <div 
                  className="pt-2 px-8 mb-1"
                  style={{ borderTop: '2px solid rgb(17, 24, 39)' }}
                >
                  <p 
                    className="text-lg font-semibold"
                    style={{ color: 'rgb(17, 24, 39)' }}
                  >
                    {certificate.instructor_name}
                  </p>
                </div>
                <p 
                  className="text-sm"
                  style={{ color: 'rgb(107, 114, 128)' }}
                >
                  Instructor
                </p>
              </div>

              <div className="text-right">
                <p 
                  className="text-sm mb-1"
                  style={{ color: 'rgb(107, 114, 128)' }}
                >
                  Certificate ID
                </p>
                <p 
                  className="text-lg font-mono font-semibold"
                  style={{ color: 'rgb(17, 24, 39)' }}
                >
                  {certificate.certificate_code}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-12 left-0 right-0 text-center">
              <p 
                className="text-xs font-serif italic"
                style={{ color: 'rgb(156, 163, 175)' }}
              >
                Verify this certificate at: actplus.com/verify/{certificate.certificate_code}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print
        </button>
      </div>
    </div>
  );
}