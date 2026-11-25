import { prisma } from '../src/config/prisma.js';
import { seedAcademicStructure } from './seeds/academic.js';
import { seedGradingSystems } from './seeds/grading.js';
import { seedRolesAndPermissions } from './seeds/roles.js';
import { seedDemoSchool, seedDemoStudents, seedFees } from './seeds/school.js';
import { seedDemoUsers } from './seeds/users.js';

async function main(): Promise<void> {
  console.log('Seeding School Management System...');

  console.log('1/6 Roles and permissions');
  await seedRolesAndPermissions(prisma);

  console.log('2/6 School profile');
  const schoolId = await seedDemoSchool(prisma);

  console.log('3/6 Academic structure');
  const academic = await seedAcademicStructure(prisma, schoolId);

  console.log('4/6 Grading systems');
  await seedGradingSystems(prisma, schoolId);

  console.log('5/6 Demo users');
  const users = await seedDemoUsers(prisma, schoolId);

  console.log('6/6 Fees and demo students');
  const feeCategoryIds = await seedFees(prisma, schoolId, academic);
  const demo = await seedDemoStudents(prisma, schoolId, academic, feeCategoryIds);

  // Give the student portal account a linked student record.
  if (users.studentUserId && demo.studentIds[0]) {
    await prisma.student.update({
      where: { id: demo.studentIds[0] },
      data: { userId: users.studentUserId },
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
