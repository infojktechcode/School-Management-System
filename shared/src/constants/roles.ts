import type { UserRoleType } from '../types/user.js';
import { PERMISSIONS, type Permission } from './permissions.js';

export const USER_ROLES: Record<UserRoleType, { name: string; description: string }> = {
  SUPER_ADMIN: { name: 'Super Administrator', description: 'Full system access across all schools and tenants' },
  SCHOOL_ADMIN: { name: 'School Administrator', description: 'Full administrative control over a specific school' },
  PRINCIPAL: { name: 'Principal / Headteacher', description: 'School leadership, approvals, and academic oversight' },
  DEPUTY_PRINCIPAL: { name: 'Deputy Principal', description: 'Academic management, discipline, and staff coordination' },
  DIRECTOR_OF_STUDIES: { name: 'Director of Studies', description: 'Curriculum, timetables, exams, and academic reporting' },
  BURSAR: { name: 'Bursar / Accountant', description: 'Fee structures, invoices, payments, and financial reports' },
  TEACHER: { name: 'Teacher', description: 'Subject teaching, homework, marks entry, and attendance' },
  CLASS_TEACHER: { name: 'Class Teacher', description: 'Student pastoral care, attendance, and report card comments' },
  LIBRARIAN: { name: 'Librarian', description: 'Library books, inventory, issuing, and returns' },
  SCHOOL_NURSE: { name: 'School Nurse', description: 'Medical records, clinic visits, and health incidents' },
  TRANSPORT_MANAGER: { name: 'Transport Manager', description: 'Vehicle fleet, routes, drivers, and transport allocation' },
  RECEPTIONIST: { name: 'Receptionist', description: 'Visitors, front office, inquiries, and announcements' },
  PARENT: { name: 'Parent / Guardian', description: 'Children progress, attendance, fee balances, and homework' },
  STUDENT: { name: 'Student', description: 'Personal schedule, assignments, results, and fees' },
};

const ALL_PERMISSIONS = Object.values(PERMISSIONS) as Permission[];

const ADMIN_PERMISSIONS: Permission[] = [
  PERMISSIONS.STUDENT_CREATE,
  PERMISSIONS.STUDENT_READ,
  PERMISSIONS.STUDENT_UPDATE,
  PERMISSIONS.STUDENT_DELETE,
  PERMISSIONS.STUDENT_PROMOTE,
  PERMISSIONS.STAFF_CREATE,
  PERMISSIONS.STAFF_READ,
  PERMISSIONS.STAFF_UPDATE,
  PERMISSIONS.STAFF_DELETE,
  PERMISSIONS.ACADEMIC_MANAGE,
  PERMISSIONS.TIMETABLE_MANAGE,
  PERMISSIONS.ATTENDANCE_RECORD,
  PERMISSIONS.ATTENDANCE_READ,
  PERMISSIONS.EXAM_MANAGE,
  PERMISSIONS.MARKS_ENTRY,
  PERMISSIONS.MARKS_READ,
  PERMISSIONS.FINANCE_MANAGE,
  PERMISSIONS.FEE_PAYMENT,
  PERMISSIONS.FINANCE_READ,
  PERMISSIONS.LIBRARY_MANAGE,
  PERMISSIONS.LIBRARY_BORROW,
  PERMISSIONS.TRANSPORT_MANAGE,
  PERMISSIONS.SETTINGS_MANAGE,
];

const ACADEMIC_LEAD_PERMISSIONS: Permission[] = [
  PERMISSIONS.STUDENT_READ,
  PERMISSIONS.STUDENT_UPDATE,
  PERMISSIONS.STUDENT_PROMOTE,
  PERMISSIONS.STAFF_READ,
  PERMISSIONS.ACADEMIC_MANAGE,
  PERMISSIONS.TIMETABLE_MANAGE,
  PERMISSIONS.ATTENDANCE_RECORD,
  PERMISSIONS.ATTENDANCE_READ,
  PERMISSIONS.EXAM_MANAGE,
  PERMISSIONS.MARKS_READ,
  PERMISSIONS.FINANCE_READ,
];

const TEACHING_PERMISSIONS: Permission[] = [
  PERMISSIONS.STUDENT_READ,
  PERMISSIONS.ATTENDANCE_RECORD,
  PERMISSIONS.ATTENDANCE_READ,
  PERMISSIONS.MARKS_ENTRY,
  PERMISSIONS.MARKS_READ,
  PERMISSIONS.LIBRARY_BORROW,
];

const SELF_SERVICE_PERMISSIONS: Permission[] = [
  PERMISSIONS.ATTENDANCE_READ,
  PERMISSIONS.MARKS_READ,
  PERMISSIONS.FINANCE_READ,
];

/**
 * The authoritative role -> permission matrix. Server authorization guards and
 * the client's permission hook both derive from this map, so adding a role
 * here is the only place access needs to be granted.
 */
export const ROLE_PERMISSIONS: Record<UserRoleType, Permission[]> = {
  SUPER_ADMIN: ALL_PERMISSIONS,
  SCHOOL_ADMIN: ADMIN_PERMISSIONS,
  PRINCIPAL: ADMIN_PERMISSIONS.filter(
    (permission) =>
      permission !== PERMISSIONS.SETTINGS_MANAGE && permission !== PERMISSIONS.STAFF_DELETE,
  ),
  DEPUTY_PRINCIPAL: ACADEMIC_LEAD_PERMISSIONS,
  DIRECTOR_OF_STUDIES: ACADEMIC_LEAD_PERMISSIONS.filter(
    (permission) => permission !== PERMISSIONS.FINANCE_READ,
  ),
  BURSAR: [
    PERMISSIONS.STUDENT_READ,
    PERMISSIONS.STAFF_READ,
    PERMISSIONS.FINANCE_MANAGE,
    PERMISSIONS.FEE_PAYMENT,
    PERMISSIONS.FINANCE_READ,
  ],
  TEACHER: TEACHING_PERMISSIONS,
  CLASS_TEACHER: [
    ...TEACHING_PERMISSIONS,
    PERMISSIONS.STUDENT_UPDATE,
  ],
  LIBRARIAN: [
    PERMISSIONS.STUDENT_READ,
    PERMISSIONS.STAFF_READ,
    PERMISSIONS.LIBRARY_MANAGE,
    PERMISSIONS.LIBRARY_BORROW,
  ],
  SCHOOL_NURSE: [PERMISSIONS.STUDENT_READ, PERMISSIONS.STUDENT_UPDATE],
  TRANSPORT_MANAGER: [PERMISSIONS.STUDENT_READ, PERMISSIONS.TRANSPORT_MANAGE],
  RECEPTIONIST: [PERMISSIONS.STUDENT_READ, PERMISSIONS.STAFF_READ],
  PARENT: [...SELF_SERVICE_PERMISSIONS, PERMISSIONS.FEE_PAYMENT, PERMISSIONS.STUDENT_READ],
  STUDENT: [...SELF_SERVICE_PERMISSIONS, PERMISSIONS.LIBRARY_BORROW],
};

export function roleHasPermission(role: UserRoleType, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
