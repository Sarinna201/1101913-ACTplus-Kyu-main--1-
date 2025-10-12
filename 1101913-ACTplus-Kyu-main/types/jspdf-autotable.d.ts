// types/jspdf-autotable.d.ts
declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  interface AutoTableOptions {
    startY?: number;
    head?: any[][];
    body?: any[][];
    theme?: 'striped' | 'grid' | 'plain';
    headStyles?: any;
    styles?: any;
    margin?: any;
    columnStyles?: any;
  }

  export default function autoTable(
    doc: jsPDF,
    options: AutoTableOptions
  ): void;
}