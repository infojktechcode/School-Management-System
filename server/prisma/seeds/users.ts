import { USER_ROLES, type UserRoleType } from '@school-mgmt/shared';
import type { ExtendedPrismaClient } from '../../src/config/prisma.js';
import { supabaseAdmin } from '../../src/config/supabase.js';

export const DEMO_PASSWORD = process.env.SEED_DEFAULT_PASSWORD ?? 'Demo@Passw0rd!';

const ACCOUNTS: Array<{
  role: UserRoleType;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string;
  departmentCode?: string;
}> = [
  { role: 'SUPER_ADMIN', firstName: 'System', lastName: 'Administrator', email: 'superadmin@demo.school.ac.ke' },
  { role: 'SCHOOL_ADMIN', firstName: 'Grace', lastName: 'Kimani', email: 'admin@demo.school.ac.ke', jobTitle: 'School Administrator', departmentCode: 'ADMIN' },
  { role: 'PRINCIPAL', firstName: 'Peter', lastName: 'Njoroge', email: 'principal@demo.school.ac.ke', jobTitle: 'Principal', departmentCode: 'ADMIN' },
  { role: 'DEPUTY_PRINCIPAL', firstName: 'Sarah', lastName: 'Odhiambo', email: 'deputy@demo.school.ac.ke', jobTitle: 'Deputy Principal', departmentCode: 'ADMIN' },
  { role: 'DIRECTOR_OF_STUDIES', firstName: 'John', lastName: 'Kariuki', email: 'studies@demo.school.ac.ke', jobTitle: 'Director of Studies', departmentCode: 'STEM' },
  { role: 'BURSAR', firstName: 'Alice', lastName: 'Wanjiru', email: 'bursar@demo.school.ac.ke', jobTitle: 'Bursar', departmentCode: 'FIN' },
  { role: 'TEACHER', firstName: 'Michael', lastName: 'Ochieng', email: 'teacher@demo.school.ac.ke', jobTitle: 'Mathematics Teacher', departmentCode: 'STEM' },
  { role: 'CLASS_TEACHER', firstName: 'Lucy', lastName: 'Achieng', email: 'classteacher@demo.school.ac.ke', jobTitle: 'Grade 7 Class Teacher', departmentCode: 'LANG' },
  { role: 'LIBRARIAN', firstName: 'David', lastName: 'Mwangi', email: 'librarian@demo.school.ac.ke', jobTitle: 'Librarian', departmentCode: 'ADMIN' },
  { role: 'SCHOOL_NURSE', firstName: 'Esther', lastName: 'Njoki', email: 'nurse@demo.school.ac.ke', jobTitle: 'School Nurse', departmentCode: 'ADMIN' },
  { role: 'TRANSPORT_MANAGER', firstName: 'Samuel', lastName: 'Kiptoo', email: 'transport@demo.school.ac.ke', jobTitle: 'Transport Manager', departmentCode: 'ADMIN' },
  { role: 'RECEPTIONIST', firstName: 'Joy', lastName: 'Wairimu', email: 'reception@demo.school.ac.ke', jobTitle: 'Receptionist', departmentCode: 'ADMIN' },
  { role: 'PARENT', firstName: 'Charles', lastName: 'Otieno', email: 'parent@demo.school.ac.ke' },
  { role: 'STUDENT', firstName: 'Brian', lastName: 'Otieno', email: 'student@demo.school.ac.ke' },
];

const TEACHER_ROLES: UserRoleType[] = ['TEACHER', 'CLASS_TEACHER'];
const STAFF_ROLES: UserRoleType[] = [
  'SCHOOL_ADMIN',
  'PRINCIPAL',
  'DEPUTY_PRINCIPAL',
  'DIRECTOR_OF_STUDIES',
  'BURSAR',
  'LIBRARIAN',
  'SCHOOL_NURSE',
  'TRANSPORT_MANAGER',
  'RECEPTIONIST',
];

export interface UserSeedResult {
  userIds: Record<UserRoleType, string | undefined>;
  studentUserId?: string;
}

async function maybeProvisionSupabaseUser(email: string): Promise<void> {
  if (process.env.SEED_PROVISION_AUTH !== 'true') return;

  const { error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
  });

  if (error && !/already/i.test(error.message)) {
    console.warn(`  auth provisioning skipped for ${email}: ${error.message}`);
  }
}

export async function seedDemoUsers(
  db: ExtendedPrismaClient,
  schoolId: string,
): Promise<UserSeedResult> {
  const userIds = {} as Record<UserRoleType, string | undefined>;
  const departments = await db.department.findMany({ where: { schoolId } });
  const departmentByCode = new Map(departments.map((department) => [department.code, department.id]));

  for (const [index, account] of ACCOUNTS.entries()) {
    if (!USER_ROLES[account.role]) continue;

    const user = await db.user.upsert({
      where: { email: account.email },
      update: { firstName: account.firstName, lastName: account.lastName, isActive: true },
      create: {
        schoolId: account.role === 'SUPER_ADMIN' ? null : schoolId,
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
        isEmailVerified: true,
      },
    });
    userIds[account.role] = user.id;

    const role = await db.role.findUnique({ where: { name: account.role } });
    if (role) {
      await db.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: role.id } },
        update: {},
        create: { userId: user.id, roleId: role.id },
      });
    }

    if (STAFF_ROLES.includes(account.role) || TEACHER_ROLES.includes(account.role)) {
      const staff = await db.staff.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          schoolId,
          userId: user.id,
          staffNumber: `STF-${String(index + 1).padStart(3, '0')}`,
          departmentId: account.departmentCode
            ? departmentByCode.get(account.departmentCode)
            : undefined,
          jobTitle: account.jobTitle,
          employmentType: 'PERMANENT',
          dateJoined: new Date('2025-01-06'),
        },
      });

      if (TEACHER_ROLES.includes(account.role)) {
        await db.teacher.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            schoolId,
            userId: user.id,
            staffId: staff.id,
            employeeNumber: `TCH-${String(index + 1).padStart(3, '0')}`,
            qualification: 'Bachelor of Education',
            specialization: account.role === 'TEACHER' ? 'Mathematics' : 'Languages',
            dateJoined: new Date('2025-01-06'),
          },
        });
      }
    }

    await maybeProvisionSupabaseUser(account.email);
  }

  console.log(`  demo users: ${ACCOUNTS.length} (password: ${DEMO_PASSWORD})`);
  return { userIds, studentUserId: userIds.STUDENT };
}
