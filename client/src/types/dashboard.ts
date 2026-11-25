export interface DashboardStats {
  totalStudents: number;
  totalStaff: number;
  totalTeachers: number;
  feeCollection: {
    invoiced: number;
    collected: number;
    outstanding: number;
    collectionRate: number;
  };
  attendance: {
    present: number;
    absent: number;
    total: number;
    rate: number;
  };
  pendingInvoices: number;
}

export interface EnrollmentPoint {
  classLevel: string;
  students: number;
}

export interface FeeTrendPoint {
  month: string;
  invoiced: number;
  collected: number;
}

export interface ActivityItem {
  id: string;
  type: 'payment' | 'student' | 'announcement';
  title: string;
  description: string;
  at: string;
  amount?: number;
}

export interface DashboardPayload {
  stats: DashboardStats;
  enrollmentByClass: EnrollmentPoint[];
  feeTrend: FeeTrendPoint[];
  recentActivity: ActivityItem[];
}
