import { prisma } from '../../config/prisma.js';

type Numeric = { toNumber(): number } | number | null | undefined;

function num(value: Numeric): number {
  if (value === null || value === undefined) return 0;
  return typeof value === 'number' ? value : value.toNumber();
}

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

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(date: Date): string {
  return new Intl.DateTimeFormat('en-KE', { month: 'short', timeZone: 'UTC' }).format(date);
}

export async function getDashboard(schoolId: string): Promise<DashboardPayload> {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const sixMonthsAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));

  const [
    totalStudents,
    totalStaff,
    totalTeachers,
    invoiceTotals,
    todayAttendance,
    pendingInvoices,
    enrollmentGroups,
    classLevels,
    payments,
    invoices,
    recentStudents,
    recentPayments,
    announcements,
  ] = await Promise.all([
    prisma.student.count({ where: { schoolId, status: 'ACTIVE' } }),
    prisma.staff.count({ where: { schoolId, isActive: true } }),
    prisma.teacher.count({ where: { schoolId, isActive: true } }),
    prisma.studentInvoice.aggregate({
      where: { schoolId, status: { not: 'CANCELLED' } },
      _sum: { totalAmount: true, paidAmount: true, balance: true },
    }),
    prisma.attendance.groupBy({
      by: ['status'],
      where: { schoolId, date: today },
      _count: { _all: true },
    }),
    prisma.studentInvoice.count({
      where: { schoolId, status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] } },
    }),
    prisma.student.groupBy({
      by: ['classLevelId'],
      where: { schoolId, status: 'ACTIVE' },
      _count: { _all: true },
    }),
    prisma.classLevel.findMany({ where: { schoolId }, select: { id: true, name: true, levelOrder: true } }),
    prisma.payment.findMany({
      where: { schoolId, paidAt: { gte: sixMonthsAgo } },
      select: { amount: true, paidAt: true },
    }),
    prisma.studentInvoice.findMany({
      where: { schoolId, createdAt: { gte: sixMonthsAgo } },
      select: { totalAmount: true, createdAt: true },
    }),
    prisma.student.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, firstName: true, lastName: true, admissionNumber: true, createdAt: true },
    }),
    prisma.payment.findMany({
      where: { schoolId },
      orderBy: { paidAt: 'desc' },
      take: 5,
      include: { student: { select: { firstName: true, lastName: true } } },
    }),
    prisma.announcement.findMany({
      where: { schoolId, isPublished: true },
      orderBy: { publishAt: 'desc' },
      take: 5,
      select: { id: true, title: true, body: true, publishAt: true },
    }),
  ]);

  const invoiced = num(invoiceTotals._sum.totalAmount);
  const collected = num(invoiceTotals._sum.paidAmount);
  const outstanding = num(invoiceTotals._sum.balance);

  const attendanceCounts = new Map(todayAttendance.map((row) => [row.status, row._count._all]));
  const present = (attendanceCounts.get('PRESENT') ?? 0) + (attendanceCounts.get('LATE') ?? 0);
  const absent = (attendanceCounts.get('ABSENT') ?? 0) + (attendanceCounts.get('SICK') ?? 0);
  const attendanceTotal = [...attendanceCounts.values()].reduce((sum, value) => sum + value, 0);

  const classById = new Map(classLevels.map((level) => [level.id, level]));
  const enrollmentByClass: EnrollmentPoint[] = enrollmentGroups
    .map((group) => ({
      classLevel: group.classLevelId
        ? (classById.get(group.classLevelId)?.name ?? 'Unassigned')
        : 'Unassigned',
      students: group._count._all,
    }))
    .sort((a, b) => a.classLevel.localeCompare(b.classLevel, undefined, { numeric: true }));

  const months: Array<{ key: string; label: string }> = [];
  for (let offset = -5; offset <= 0; offset += 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
    months.push({ key: monthKey(date), label: monthLabel(date) });
  }

  const feeTrend: FeeTrendPoint[] = months.map((month) => ({
    month: month.label,
    invoiced: invoices
      .filter((invoice) => monthKey(invoice.createdAt) === month.key)
      .reduce((sum, invoice) => sum + num(invoice.totalAmount), 0),
    collected: payments
      .filter((payment) => monthKey(payment.paidAt) === month.key)
      .reduce((sum, payment) => sum + num(payment.amount), 0),
  }));

  const activity: ActivityItem[] = [
    ...recentPayments.map((payment) => ({
      id: `payment-${payment.id}`,
      type: 'payment' as const,
      title: 'Fee payment received',
      description: `${payment.student.firstName} ${payment.student.lastName} · ${payment.paymentMethod}`,
      at: payment.paidAt.toISOString(),
      amount: num(payment.amount),
    })),
    ...recentStudents.map((student) => ({
      id: `student-${student.id}`,
      type: 'student' as const,
      title: 'Student enrolled',
      description: `${student.firstName} ${student.lastName} · ${student.admissionNumber}`,
      at: student.createdAt.toISOString(),
    })),
    ...announcements.map((announcement) => ({
      id: `announcement-${announcement.id}`,
      type: 'announcement' as const,
      title: announcement.title,
      description: announcement.body.slice(0, 90),
      at: announcement.publishAt.toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 8);

  return {
    stats: {
      totalStudents,
      totalStaff,
      totalTeachers,
      feeCollection: {
        invoiced,
        collected,
        outstanding,
        collectionRate: invoiced > 0 ? Number(((collected / invoiced) * 100).toFixed(1)) : 0,
      },
      attendance: {
        present,
        absent,
        total: attendanceTotal,
        rate: attendanceTotal > 0 ? Number(((present / attendanceTotal) * 100).toFixed(1)) : 0,
      },
      pendingInvoices,
    },
    enrollmentByClass,
    feeTrend,
    recentActivity: activity,
  };
}
