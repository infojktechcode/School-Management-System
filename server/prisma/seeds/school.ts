import type { ExtendedPrismaClient } from '../../src/config/prisma.js';
import type { AcademicSeedResult } from './academic.js';

const FEE_ITEMS = [
  { name: 'Tuition', amount: 25_000, description: 'Term tuition' },
  { name: 'Transport', amount: 5_000, description: 'School bus - Term 1' },
  { name: 'Library', amount: 1_500, description: 'Library and resource fee' },
  { name: 'Activity', amount: 2_000, description: 'Co-curricular activities' },
] as const;

const STUDENTS = [
  { admission: 'ADM-2026-001', first: 'Brian', last: 'Otieno', gender: 'MALE', dob: '2013-03-14', classCode: 'G7', stream: 'A', guardian: 'Mary Otieno', phone: '+254712345001', relationship: 'MOTHER' },
  { admission: 'ADM-2026-002', first: 'Amina', last: 'Hassan', gender: 'FEMALE', dob: '2013-06-22', classCode: 'G7', stream: 'A', guardian: 'Yusuf Hassan', phone: '+254712345002', relationship: 'FATHER' },
  { admission: 'ADM-2026-003', first: 'Kevin', last: 'Mwangi', gender: 'MALE', dob: '2013-01-09', classCode: 'G7', stream: 'B', guardian: 'Grace Mwangi', phone: '+254712345003', relationship: 'MOTHER' },
  { admission: 'ADM-2026-004', first: 'Faith', last: 'Chebet', gender: 'FEMALE', dob: '2013-09-02', classCode: 'G7', stream: 'B', guardian: 'Daniel Chebet', phone: '+254712345004', relationship: 'FATHER' },
  { admission: 'ADM-2026-005', first: 'Samuel', last: 'Kariuki', gender: 'MALE', dob: '2012-04-18', classCode: 'G8', stream: 'A', guardian: 'Anne Kariuki', phone: '+254712345005', relationship: 'MOTHER' },
  { admission: 'ADM-2026-006', first: 'Mercy', last: 'Achieng', gender: 'FEMALE', dob: '2012-11-30', classCode: 'G8', stream: 'A', guardian: 'Peter Achieng', phone: '+254712345006', relationship: 'FATHER' },
  { admission: 'ADM-2026-007', first: 'Elvis', last: 'Mutua', gender: 'MALE', dob: '2012-02-11', classCode: 'G8', stream: 'B', guardian: 'Esther Mutua', phone: '+254712345007', relationship: 'MOTHER' },
  { admission: 'ADM-2026-008', first: 'Sharon', last: 'Njeri', gender: 'FEMALE', dob: '2012-07-25', classCode: 'G8', stream: 'B', guardian: 'James Njeri', phone: '+254712345008', relationship: 'FATHER' },
  { admission: 'ADM-2026-009', first: 'Dennis', last: 'Kiprop', gender: 'MALE', dob: '2011-05-06', classCode: 'G9', stream: 'A', guardian: 'Ruth Kiprop', phone: '+254712345009', relationship: 'MOTHER' },
  { admission: 'ADM-2026-010', first: 'Cynthia', last: 'Wambui', gender: 'FEMALE', dob: '2011-08-19', classCode: 'G9', stream: 'A', guardian: 'Joseph Wambui', phone: '+254712345010', relationship: 'FATHER' },
  { admission: 'ADM-2026-011', first: 'Victor', last: 'Omondi', gender: 'MALE', dob: '2011-12-01', classCode: 'G9', stream: 'B', guardian: 'Lilian Omondi', phone: '+254712345011', relationship: 'MOTHER' },
  { admission: 'ADM-2026-012', first: 'Natasha', last: 'Auma', gender: 'FEMALE', dob: '2011-03-28', classCode: 'G9', stream: 'B', guardian: 'George Auma', phone: '+254712345012', relationship: 'FATHER' },
] as const;

export interface SchoolSeedResult {
  schoolId: string;
  studentIds: string[];
  feeCategoryIds: string[];
}

export async function seedDemoSchool(db: ExtendedPrismaClient): Promise<string> {
  const school = await db.school.upsert({
    where: { code: 'DEMO001' },
    update: {},
    create: {
      name: 'Moi Avenue Demo School',
      code: 'DEMO001',
      motto: 'Knowledge, Integrity, Service',
      address: 'P.O. Box 1234, Nairobi',
      phone: '+254700000001',
      email: 'info@demo.school.ac.ke',
      website: 'https://demo.school.ac.ke',
      schoolType: 'COMBINED',
      currency: 'KES',
      timezone: 'Africa/Nairobi',
      dateFormat: 'DD/MM/YYYY',
      locale: 'en-KE',
    },
  });

  await db.schoolSettings.upsert({
    where: { schoolId: school.id },
    update: {},
    create: {
      schoolId: school.id,
      currency: 'KES',
      timezone: 'Africa/Nairobi',
      dateFormat: 'DD/MM/YYYY',
      locale: 'en-KE',
      admissionPrefix: 'ADM',
      invoicePrefix: 'INV',
      feeReminderDays: 7,
    },
  });

  console.log(`  school: ${school.name} (${school.code})`);
  return school.id;
}

export async function seedFees(
  db: ExtendedPrismaClient,
  schoolId: string,
  academic: AcademicSeedResult,
): Promise<string[]> {
  const categoryIds: string[] = [];

  for (const item of FEE_ITEMS) {
    const category = await db.feeCategory.upsert({
      where: { schoolId_name: { schoolId, name: item.name } },
      update: {},
      create: { schoolId, name: item.name, isMandatory: true },
    });
    categoryIds.push(category.id);

    const classLevels = await db.classLevel.findMany({ where: { schoolId } });
    for (const classLevel of classLevels) {
      const existing = await db.feeStructure.findFirst({
        where: {
          schoolId,
          feeCategoryId: category.id,
          classLevelId: classLevel.id,
          academicYearId: academic.academicYearId,
          termId: academic.termIds[0],
        },
      });

      if (!existing) {
        await db.feeStructure.create({
          data: {
            schoolId,
            feeCategoryId: category.id,
            classLevelId: classLevel.id,
            academicYearId: academic.academicYearId,
            termId: academic.termIds[0],
            amount: item.amount,
          },
        });
      }
    }
  }

  console.log(`  fee categories: ${categoryIds.length}`);
  return categoryIds;
}

export async function seedDemoStudents(
  db: ExtendedPrismaClient,
  schoolId: string,
  academic: AcademicSeedResult,
  feeCategoryIds: string[],
): Promise<SchoolSeedResult> {
  const classLevels = await db.classLevel.findMany({ where: { schoolId } });
  const classByCode = new Map(classLevels.map((level) => [level.code, level]));
  const streams = await db.stream.findMany();
  const streamKey = (classLevelId: string, code: string) =>
    streams.find((stream) => stream.classLevelId === classLevelId && stream.code === code)?.id;

  const studentIds: string[] = [];
  const totalFees = FEE_ITEMS.reduce((sum, item) => sum + item.amount, 0);

  for (const [index, seed] of STUDENTS.entries()) {
    const classLevel = classByCode.get(seed.classCode);
    if (!classLevel) continue;

    const streamId = streamKey(classLevel.id, seed.stream);
    const student = await db.student.upsert({
      where: { schoolId_admissionNumber: { schoolId, admissionNumber: seed.admission } },
      update: {},
      create: {
        schoolId,
        admissionNumber: seed.admission,
        firstName: seed.first,
        lastName: seed.last,
        dateOfBirth: new Date(seed.dob),
        gender: seed.gender,
        admissionDate: new Date('2026-01-05'),
        status: 'ACTIVE',
        classLevelId: classLevel.id,
        streamId,
      },
    });
    studentIds.push(student.id);

    let guardian = await db.guardian.findFirst({
      where: { schoolId, phone: seed.phone },
    });
    if (!guardian) {
      guardian = await db.guardian.create({
        data: {
          schoolId,
          firstName: seed.guardian.split(' ')[0] ?? seed.guardian,
          lastName: seed.guardian.split(' ').slice(1).join(' ') || 'Guardian',
          relationship: seed.relationship as 'MOTHER' | 'FATHER',
          phone: seed.phone,
        },
      });
    }

    await db.studentGuardian.upsert({
      where: {
        studentId_guardianId: { studentId: student.id, guardianId: guardian.id },
      },
      update: { isPrimary: true },
      create: { studentId: student.id, guardianId: guardian.id, isPrimary: true },
    });

    await db.studentEnrollment.upsert({
      where: {
        studentId_academicYearId: {
          studentId: student.id,
          academicYearId: academic.academicYearId,
        },
      },
      update: {},
      create: {
        schoolId,
        studentId: student.id,
        classLevelId: classLevel.id,
        streamId,
        academicYearId: academic.academicYearId,
        termId: academic.termIds[0],
        status: 'ENROLLED',
      },
    });

    const invoiceNumber = `INV-20260105-${String(index + 1).padStart(4, '0')}`;
    const paidAmount = index % 4 === 0 ? 0 : index % 3 === 0 ? totalFees : 20_000;
    const balance = totalFees - paidAmount;

    const invoice = await db.studentInvoice.upsert({
      where: { schoolId_invoiceNumber: { schoolId, invoiceNumber } },
      update: {},
      create: {
        schoolId,
        studentId: student.id,
        termId: academic.termIds[0],
        invoiceNumber,
        totalAmount: totalFees,
        paidAmount,
        balance,
        status: balance === 0 ? 'PAID' : paidAmount === 0 ? 'UNPAID' : 'PARTIAL',
        dueDate: new Date('2026-02-05'),
        items: {
          create: FEE_ITEMS.map((item, itemIndex) => ({
            feeCategoryId: feeCategoryIds[itemIndex]!,
            description: item.description,
            amount: item.amount,
            quantity: 1,
          })),
        },
      },
    });

    if (paidAmount > 0) {
      await db.payment.upsert({
        where: { schoolId_referenceNumber: { schoolId, referenceNumber: `SEED-${seed.admission}` } },
        update: {},
        create: {
          schoolId,
          studentId: student.id,
          invoiceId: invoice.id,
          amount: paidAmount,
          paymentMethod: 'MPESA',
          referenceNumber: `SEED-${seed.admission}`,
          paidAt: new Date('2026-01-20T09:30:00Z'),
          notes: 'Seeded demo payment',
        },
      });
    }

    // Five school days of attendance per student.
    for (let day = 1; day <= 5; day += 1) {
      const date = new Date(Date.UTC(2026, 1, day));
      const status =
        index % 7 === 0 && day === 3
          ? 'ABSENT'
          : index % 5 === 0 && day === 4
            ? 'LATE'
            : 'PRESENT';

      await db.attendance.upsert({
        where: { studentId_date: { studentId: student.id, date } },
        update: {},
        create: {
          schoolId,
          studentId: student.id,
          classLevelId: classLevel.id,
          termId: academic.termIds[0],
          date,
          status,
        },
      });
    }
  }

  console.log(`  demo students: ${studentIds.length} with guardians, invoices and attendance`);
  return { schoolId, studentIds, feeCategoryIds };
}
