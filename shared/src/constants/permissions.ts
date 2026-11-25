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

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_GROUPS: Record<string, Permission[]> = {
  students: [
    PERMISSIONS.STUDENT_CREATE,
    PERMISSIONS.STUDENT_READ,
    PERMISSIONS.STUDENT_UPDATE,
    PERMISSIONS.STUDENT_DELETE,
    PERMISSIONS.STUDENT_PROMOTE,
  ],
  staff: [
    PERMISSIONS.STAFF_CREATE,
    PERMISSIONS.STAFF_READ,
    PERMISSIONS.STAFF_UPDATE,
    PERMISSIONS.STAFF_DELETE,
  ],
  academics: [PERMISSIONS.ACADEMIC_MANAGE, PERMISSIONS.TIMETABLE_MANAGE],
  attendance: [PERMISSIONS.ATTENDANCE_RECORD, PERMISSIONS.ATTENDANCE_READ],
  examinations: [PERMISSIONS.EXAM_MANAGE, PERMISSIONS.MARKS_ENTRY, PERMISSIONS.MARKS_READ],
  finance: [PERMISSIONS.FINANCE_MANAGE, PERMISSIONS.FEE_PAYMENT, PERMISSIONS.FINANCE_READ],
  library: [PERMISSIONS.LIBRARY_MANAGE, PERMISSIONS.LIBRARY_BORROW],
  transport: [PERMISSIONS.TRANSPORT_MANAGE],
  settings: [PERMISSIONS.SETTINGS_MANAGE],
};
