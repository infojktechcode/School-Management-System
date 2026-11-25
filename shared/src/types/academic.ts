export interface AcademicYear {
  id: string;
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Term {
  id: string;
  academicYearId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface ClassLevel {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  levelOrder: number;
}

export interface Stream {
  id: string;
  classLevelId: string;
  name: string;
  code: string;
  capacity: number;
  classTeacherId?: string;
}

export interface Subject {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  isOptional: boolean;
  category: string;
}
