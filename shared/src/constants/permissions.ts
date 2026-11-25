export const PERMISSIONS = {
  // Students
  STUDENT_CREATE: 'student:create',
  STUDENT_READ: 'student:read',
  STUDENT_UPDATE: 'student:update',
  STUDENT_DELETE: 'student:delete',
  STUDENT_PROMOTE: 'student:promote',

  // Staff
  STAFF_CREATE: 'staff:create',
  STAFF_READ: 'staff:read',
  STAFF_UPDATE: 'staff:update',
  STAFF_DELETE: 'staff:delete',

  // Academics
  ACADEMIC_MANAGE: 'academic:manage',
  TIMETABLE_MANAGE: 'timetable:manage',

  // Attendance
  ATTENDANCE_RECORD: 'attendance:record',
  ATTENDANCE_READ: 'attendance:read',

  // Examinations
  EXAM_MANAGE: 'exam:manage',
  MARKS_ENTRY: 'marks:entry',
  MARKS_READ: 'marks:read',

  // Finance
  FINANCE_MANAGE: 'finance:manage',
  FEE_PAYMENT: 'fee:payment',
  FINANCE_READ: 'finance:read',

  // Library
  LIBRARY_MANAGE: 'library:manage',
  LIBRARY_BORROW: 'library:borrow',

  // Transport
  TRANSPORT_MANAGE: 'transport:manage',

  // Settings
  SETTINGS_MANAGE: 'settings:manage',
} as const;
