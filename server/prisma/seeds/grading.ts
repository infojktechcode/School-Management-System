import { CBC_GRADING_SYSTEM, KENYA_GRADING_SYSTEM } from '@school-mgmt/shared';
import type { ExtendedPrismaClient } from '../../src/config/prisma.js';

export async function seedGradingSystems(
  db: ExtendedPrismaClient,
  schoolId: string,
): Promise<void> {
  const systems = [
    { name: 'Kenya 8-4-4 (KCSE)', isDefault: true, isCbc: false, scales: KENYA_GRADING_SYSTEM },
    { name: 'Kenya CBC Performance Levels', isDefault: false, isCbc: true, scales: CBC_GRADING_SYSTEM },
  ];

  for (const system of systems) {
    const gradingSystem = await db.gradingSystem.upsert({
      where: { schoolId_name: { schoolId, name: system.name } },
      update: { isDefault: system.isDefault, isCbc: system.isCbc },
      create: {
        schoolId,
        name: system.name,
        isDefault: system.isDefault,
        isCbc: system.isCbc,
      },
    });

    await db.gradingScale.createMany({
      data: system.scales.map((scale) => ({
        gradingSystemId: gradingSystem.id,
        gradeName: scale.gradeName,
        minMarks: scale.minMarks,
        maxMarks: scale.maxMarks,
        points: scale.points,
        remarks: scale.remarks,
      })),
      skipDuplicates: true,
    });
  }

  console.log(`  grading systems: ${systems.length}`);
}
