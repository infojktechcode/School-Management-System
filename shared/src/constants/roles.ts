import { UserRoleType } from '../types/user.js';

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
