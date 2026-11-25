export interface AttendanceRecord {
  id: string;
  schoolId: string;
  studentId: string;
  classLevelId: string;
  termId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'SICK';
  remarks?: string;
  recordedBy: string;
}

export interface StaffAttendanceRecord {
  id: string;
  schoolId: string;
  staffId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE';
  notes?: string;
}
