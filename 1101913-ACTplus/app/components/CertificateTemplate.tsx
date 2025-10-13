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
    <div className="space-y-8">
      {/* Certificate Preview */}
      <div 
        ref={certificateRef}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden mx-auto"
        style={{
          width: '1190px',
          height: '842px',
          maxWidth: '100%'
        }}
      >
        {/* Main Border with Orange Gradient */}
        <div 
          className="w-full h-full p-8 relative"
          style={{
            background: 'linear-gradient(135deg, rgb(249, 115, 22) 0%, rgb(234, 88, 12) 100%)',
            padding: '16px'
          }}
        >
          {/* Inner White Container */}
          <div 
            className="w-full h-full relative"
            style={{
              backgroundColor: 'white',
              border: '8px solid rgb(31, 41, 55)',
              boxShadow: 'inset 0 0 0 4px rgb(249, 115, 22)'
            }}
          >
            {/* Decorative Corner Elements */}
            <div 
              className="absolute"
              style={{
                top: '24px',
                left: '24px',
                width: '80px',
                height: '80px',
                borderTop: '6px solid rgb(249, 115, 22)',
                borderLeft: '6px solid rgb(249, 115, 22)',
                borderRadius: '4px 0 0 0'
              }}
            >
              <div
                className="absolute"
                style={{
                  top: '-3px',
                  left: '-3px',
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'rgb(249, 115, 22)',
                  borderRadius: '50%'
                }}
              ></div>
            </div>

            <div 
              className="absolute"
              style={{
                top: '24px',
                right: '24px',
                width: '80px',
                height: '80px',
                borderTop: '6px solid rgb(249, 115, 22)',
                borderRight: '6px solid rgb(249, 115, 22)',
                borderRadius: '0 4px 0 0'
              }}
            >
              <div
                className="absolute"
                style={{
                  top: '-3px',
                  right: '-3px',
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'rgb(249, 115, 22)',
                  borderRadius: '50%'
                }}
              ></div>
            </div>

            <div 
              className="absolute"
              style={{
                bottom: '24px',
                left: '24px',
                width: '80px',
                height: '80px',
                borderBottom: '6px solid rgb(249, 115, 22)',
                borderLeft: '6px solid rgb(249, 115, 22)',
                borderRadius: '0 0 0 4px'
              }}
            >
              <div
                className="absolute"
                style={{
                  bottom: '-3px',
                  left: '-3px',
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'rgb(249, 115, 22)',
                  borderRadius: '50%'
                }}
              ></div>
            </div>

            <div 
              className="absolute"
              style={{
                bottom: '24px',
                right: '24px',
                width: '80px',
                height: '80px',
                borderBottom: '6px solid rgb(249, 115, 22)',
                borderRight: '6px solid rgb(249, 115, 22)',
                borderRadius: '0 0 4px 0'
              }}
            >
              <div
                className="absolute"
                style={{
                  bottom: '-3px',
                  right: '-3px',
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'rgb(249, 115, 22)',
                  borderRadius: '50%'
                }}
              ></div>
            </div>

            {/* Content Container */}
            <div className="flex flex-col items-center justify-center h-full text-center px-16 py-12">
              {/* Logo & Header */}
              <div className="mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div 
                    className="text-6xl font-black"
                    style={{ color: 'rgb(249, 115, 22)' }}
                  >
                    ACT
                  </div>
                  <div 
                    className="text-6xl font-black"
                    style={{
                      color: 'rgb(31, 41, 55)',
                      position: 'relative',
                      top: '-8px'
                    }}
                  >
                    +
                  </div>
                </div>
                
                <div 
                  className="h-1 w-32 mx-auto mb-6"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgb(249, 115, 22), transparent)'
                  }}
                ></div>

                <h1 
                  className="text-5xl font-bold mb-3"
                  style={{ 
                    color: 'rgb(31, 41, 55)',
                    fontFamily: 'Georgia, serif',
                    letterSpacing: '2px'
                  }}
                >
                  CERTIFICATE OF COMPLETION
                </h1>

                <div className="flex items-center justify-center gap-2">
                  <div 
                    className="w-12 h-0.5"
                    style={{ backgroundColor: 'rgb(249, 115, 22)' }}
                  ></div>
                  <div className="text-4xl">🎓</div>
                  <div 
                    className="w-12 h-0.5"
                    style={{ backgroundColor: 'rgb(249, 115, 22)' }}
                  ></div>
                </div>
              </div>

              {/* This is to certify */}
              <p 
                className="text-xl font-serif italic mb-6"
                style={{ color: 'rgb(107, 114, 128)' }}
              >
                This is to certify that
              </p>

              {/* Student Name */}
              <div className="mb-8 relative">
                <h2 
                  className="text-5xl font-bold px-16 py-4"
                  style={{ 
                    color: 'rgb(249, 115, 22)',
                    fontFamily: 'Georgia, serif',
                    letterSpacing: '1px'
                  }}
                >
                  {studentName}
                </h2>
                <div 
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgb(31, 41, 55), transparent)'
                  }}
                ></div>
              </div>

              {/* Course Info */}
              <div className="mb-8">
                <p 
                  className="text-lg font-serif mb-4"
                  style={{ color: 'rgb(107, 114, 128)' }}
                >
                  has successfully completed the course
                </p>
                <div 
                  className="px-12 py-4 rounded-xl"
                  style={{
                    backgroundColor: 'rgb(255, 247, 237)',
                    border: '3px solid rgb(249, 115, 22)'
                  }}
                >
                  <h3 
                    className="text-3xl font-bold"
                    style={{ 
                      color: 'rgb(31, 41, 55)',
                      fontFamily: 'Georgia, serif'
                    }}
                  >
                    {certificate.course_title}
                  </h3>
                </div>
              </div>

              {/* Grade & Score */}
              <div className="flex items-center gap-8 mb-10">
                <div 
                  className="rounded-xl p-6 min-w-[140px]"
                  style={{
                    background: 'linear-gradient(135deg, rgb(249, 115, 22), rgb(234, 88, 12))',
                    boxShadow: '0 10px 25px rgba(249, 115, 22, 0.3)'
                  }}
                >
                  <div 
                    className="text-sm font-bold mb-2 uppercase tracking-wider"
                    style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    Grade
                  </div>
                  <div 
                    className="text-4xl font-black"
                    style={{ color: 'white' }}
                  >
                    {certificate.grade}
                  </div>
                </div>

                <div className="text-4xl font-bold" style={{ color: 'rgb(209, 213, 219)' }}>|</div>

                <div 
                  className="rounded-xl p-6 min-w-[140px]"
                  style={{
                    backgroundColor: 'rgb(31, 41, 55)',
                    border: '3px solid rgb(249, 115, 22)',
                    boxShadow: '0 10px 25px rgba(31, 41, 55, 0.3)'
                  }}
                >
                  <div 
                    className="text-sm font-bold mb-2 uppercase tracking-wider"
                    style={{ color: 'rgb(249, 115, 22)' }}
                  >
                    Score
                  </div>
                  <div 
                    className="text-4xl font-black"
                    style={{ color: 'white' }}
                  >
                    {certificate.score}%
                  </div>
                </div>
              </div>

              {/* Signatures & Info */}
              <div className="flex items-end justify-between w-full mt-auto">
                {/* Date */}
                <div className="text-left">
                  <p 
                    className="text-xs uppercase tracking-wider font-bold mb-2"
                    style={{ color: 'rgb(107, 114, 128)' }}
                  >
                    Date of Completion
                  </p>
                  <p 
                    className="text-lg font-bold"
                    style={{ color: 'rgb(31, 41, 55)' }}
                  >
                    {new Date(certificate.completion_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Instructor Signature */}
                <div className="text-center">
                  <div 
                    className="mb-2 pt-3 px-12"
                    style={{ borderTop: '3px solid rgb(31, 41, 55)' }}
                  >
                    <p 
                      className="text-xl font-bold"
                      style={{ 
                        color: 'rgb(31, 41, 55)',
                        fontFamily: 'Brush Script MT, cursive'
                      }}
                    >
                      {certificate.instructor_name}
                    </p>
                  </div>
                  <p 
                    className="text-xs uppercase tracking-wider font-bold"
                    style={{ color: 'rgb(107, 114, 128)' }}
                  >
                    Course Instructor
                  </p>
                </div>

                {/* Certificate ID */}
                <div className="text-right">
                  <p 
                    className="text-xs uppercase tracking-wider font-bold mb-2"
                    style={{ color: 'rgb(107, 114, 128)' }}
                  >
                    Certificate ID
                  </p>
                  <div 
                    className="px-3 py-1 rounded"
                    style={{
                      backgroundColor: 'rgb(31, 41, 55)',
                      display: 'inline-block'
                    }}
                  >
                    <p 
                      className="text-sm font-mono font-bold"
                      style={{ color: 'rgb(249, 115, 22)' }}
                    >
                      {certificate.certificate_code}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Verification */}
              <div 
                className="absolute bottom-6 left-0 right-0 text-center"
              >
                <div 
                  className="inline-block px-6 py-2 rounded-full"
                  style={{
                    backgroundColor: 'rgb(249, 250, 251)',
                    border: '1px solid rgb(229, 231, 235)'
                  }}
                >
                  <p 
                    className="text-xs font-mono"
                    style={{ color: 'rgb(107, 114, 128)' }}
                  >
                    🔒 Verify at: <span style={{ color: 'rgb(249, 115, 22)', fontWeight: 'bold' }}>actplus.com/verify/{certificate.certificate_code}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-3 px-8 py-4 text-white font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          style={{
            background: 'linear-gradient(135deg, rgb(249, 115, 22), rgb(234, 88, 12))'
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-3 px-8 py-4 text-white font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          style={{
            backgroundColor: 'rgb(31, 41, 55)'
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Certificate
        </button>

        <button
          onClick={() => {
            const url = `actplus.com/verify/${certificate.certificate_code}`;
            navigator.clipboard.writeText(url);
            alert('Verification link copied to clipboard!');
          }}
          className="flex items-center gap-3 px-8 py-4 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          style={{
            backgroundColor: 'white',
            color: 'rgb(31, 41, 55)',
            border: '2px solid rgb(229, 231, 235)'
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Verification Link
        </button>
      </div>
    </div>
  );
}