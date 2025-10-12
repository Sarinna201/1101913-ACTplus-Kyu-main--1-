// components/ExportButton.tsx
'use client';

import { useState } from 'react';
import { 
  exportToExcel, 
  exportToCSV, 
  exportToPDF, 
  exportSummaryToExcel 
} from '@/lib/exportUtils';

type ExportButtonProps = {
  participants: any[];
  activityTitle: string;
  activityDetails?: any;
};

export default function ExportButton({ 
  participants, 
  activityTitle, 
  activityDetails 
}: ExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: 'excel' | 'csv' | 'pdf' | 'summary') => {
    setExporting(true);
    setShowMenu(false);

    try {
      // ใช้ await สำหรับ Excel exports
      switch (format) {
        case 'excel':
          await exportToExcel(participants, activityTitle);
          break;
        case 'csv':
          exportToCSV(participants, activityTitle);
          break;
        case 'pdf':
          exportToPDF(participants, activityTitle, activityDetails);
          break;
        case 'summary':
          await exportSummaryToExcel(participants, activityTitle, activityDetails);
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={exporting || participants.length === 0}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {exporting ? 'Exporting...' : 'Export'}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowMenu(false)}
          />
          
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-2">
              <button
                onClick={() => handleExport('excel')}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3 transition"
              >
                <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                    <path d="M14 2v6h6" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Excel</div>
                  <div className="text-xs text-gray-500">Participant list (.xlsx)</div>
                </div>
              </button>

              <button
                onClick={() => handleExport('csv')}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3 transition"
              >
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">CSV</div>
                  <div className="text-xs text-gray-500">Comma-separated (.csv)</div>
                </div>
              </button>

              <button
                onClick={() => handleExport('pdf')}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3 transition"
              >
                <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">PDF</div>
                  <div className="text-xs text-gray-500">Attendance report (.pdf)</div>
                </div>
              </button>

              <div className="border-t border-gray-200 my-2"></div>

              <button
                onClick={() => handleExport('summary')}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3 transition"
              >
                <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Full Report</div>
                  <div className="text-xs text-gray-500">With statistics (.xlsx)</div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}