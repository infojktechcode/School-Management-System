export interface Examination {
  id: string;
  schoolId: string;
  academicYearId: string;
  termId: string;
  name: string;
  examType: string;
  startDate: string;
  endDate: string;
  isPublished: boolean;
}

export interface Mark {
  id: string;
  examinationId: string;
  studentId: string;
  subjectId: string;
  marksObtained: number;
  maxMarks: number;
  grade?: string;
  remarks?: string;
}

export interface GradingScaleEntry {
  gradeName: string;
  minMarks: number;
  maxMarks: number;
  points: number;
  remarks: string;
}

export interface GradingScale extends GradingScaleEntry {
  id: string;
  schoolId: string;
}
