// lib/certificateUtils.ts
import { prisma } from './prisma';

// สร้างเลขที่ใบ Certificate แบบ unique
export async function generateCertificateCode(courseId: number, userId: number): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  // นับจำนวน certificates ที่มีในเดือนนี้
  const count = await prisma.certificates.count({
    where: {
      issued_at: {
        gte: new Date(year, new Date().getMonth(), 1),
        lt: new Date(year, new Date().getMonth() + 1, 1)
      }
    }
  });

  const sequence = String(count + 1).padStart(4, '0');
  return `CERT-${year}${month}-${sequence}`;
}

// คำนวณเกรดจากคะแนนเฉลี่ย
export function calculateGrade(averageScore: number): string {
  if (averageScore >= 90) return 'A';
  if (averageScore >= 80) return 'B+';
  if (averageScore >= 75) return 'B';
  if (averageScore >= 70) return 'C+';
  if (averageScore >= 65) return 'C';
  if (averageScore >= 60) return 'D+';
  if (averageScore >= 55) return 'D';
  return 'F';
}

// ตรวจสอบว่าผ่านเกณฑ์หรือไม่ (70% ขึ้นไป)
export function isPassed(averageScore: number): boolean {
  return averageScore >= 70;
}