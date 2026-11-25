import { KENYA_CLASS_LEVELS, KENYA_ACADEMIC_TERMS } from '@school-mgmt/shared';
import type { ExtendedPrismaClient } from '../../src/config/prisma.js';

const SUBJECTS = [
  { name: 'English', code: 'ENG', category: 'LANGUAGE' },
  { name: 'Kiswahili', code: 'KIS', category: 'LANGUAGE' },
  { name: 'Mathematics', code: 'MAT', category: 'STEM' },
  { name: 'Integrated Science', code: 'SCI', category: 'STEM' },
  { name: 'Social Studies', code: 'SST', category: 'HUMANITIES' },
  { name: 'Christian Religious Education', code: 'CRE', category: 'HUMANITIES' },
  { name: 'Agriculture', code: 'AGR', category: 'TECHNICAL' },
  { name: 'Creative Arts', code: 'ART', category: 'ARTS' },
] as const;

const DEPARTMENTS = [
  { name: 'Languages', code: 'LANG' },
  { name: 'Mathematics & Sciences', code: 'STEM' },
  { name: 'Humanities', code: 'HUM' },
  { name: 'Administration', code: 'ADMIN' },
  { name: 'Finance', code: 'FIN' },
] as const;

export interface AcademicSeedResult {
  academicYearId: string;
  termIds: string[];
  classLevelIds: string[];
  subjectIds: string[];
}

export async function seedAcademicStructure(
  db: ExtendedPrismaClient,
  schoolId: string,
): Promise<AcademicSeedResult> {
  const year = await db.academicYear.upsert({
    where: { schoolId_name: { schoolId, name: '2026' } },
    update: {},
    create: {
      schoolId,
      name: '2026',
      startDate: new Date('2026-01-05'),
      endDate: new Date('2026-11-27'),
      isCurrent: true,
    },
  });

  const termIds: string[] = [];
  for (const [index, window] of KENYA_ACADEMIC_TERMS.entries()) {
    const term = await db.term.upsert({
      where: { academicYearId_name: { academicYearId: year.id, name: window.name } },
      update: {},
      create: {
        academicYearId: year.id,
        name: window.name,
        startDate: new Date(Date.UTC(2026, window.startMonth - 1, window.startDay)),
        endDate: new Date(Date.UTC(2026, window.endMonth - 1, window.endDay)),
        isCurrent: index === 0,
      },
    });
    termIds.push(term.id);
  }

  const classLevelIds: string[] = [];
  for (const level of KENYA_CLASS_LEVELS) {
    const classLevel = await db.classLevel.upsert({
      where: { schoolId_code: { schoolId, code: level.code } },
      update: { name: level.name, levelOrder: level.levelOrder, section: level.section },
      create: {
        schoolId,
        name: level.name,
        code: level.code,
        levelOrder: level.levelOrder,
        section: level.section,
      },
    });
    classLevelIds.push(classLevel.id);
  }

  // Streams for junior secondary (Grades 7-9), matching the seeded students.
  const junior = await db.classLevel.findMany({
    where: { schoolId, code: { in: ['G7', 'G8', 'G9'] } },
  });
  for (const classLevel of junior) {
    for (const streamName of ['A', 'B']) {
      await db.stream.upsert({
        where: { classLevelId_code: { classLevelId: classLevel.id, code: streamName } },
        update: {},
        create: {
          classLevelId: classLevel.id,
          name: `Grade ${classLevel.name.replace('Grade ', '')}${streamName}`,
          code: streamName,
          capacity: 45,
        },
      });
    }
  }

  const subjectIds: string[] = [];
  for (const subject of SUBJECTS) {
    const record = await db.subject.upsert({
      where: { schoolId_code: { schoolId, code: subject.code } },
      update: { name: subject.name, category: subject.category },
      create: {
        schoolId,
        name: subject.name,
        code: subject.code,
        category: subject.category,
        isOptional: false,
      },
    });
    subjectIds.push(record.id);
  }

  for (const department of DEPARTMENTS) {
    await db.department.upsert({
      where: { schoolId_code: { schoolId, code: department.code } },
      update: { name: department.name },
      create: { schoolId, name: department.name, code: department.code },
    });
  }

  console.log(
    `  academic year 2026: ${termIds.length} terms, ${classLevelIds.length} class levels, ${subjectIds.length} subjects`,
  );

  return { academicYearId: year.id, termIds, classLevelIds, subjectIds };
}
