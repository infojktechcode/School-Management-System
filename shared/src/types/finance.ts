export interface FeeCategory {
  id: string;
  schoolId: string;
  name: string;
  description?: string;
  isMandatory: boolean;
}

export interface FeeStructure {
  id: string;
  schoolId: string;
  feeCategoryId: string;
  classLevelId?: string;
  academicYearId: string;
  termId?: string;
  amount: number;
}

export interface StudentInvoice {
  id: string;
  schoolId: string;
  studentId: string;
  termId: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  dueDate: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  schoolId: string;
  studentId: string;
  invoiceId?: string;
  amount: number;
  paymentMethod: 'MPESA' | 'BANK' | 'CASH' | 'CHEQUE';
  referenceNumber: string;
  paidAt: string;
  receivedBy: string;
  notes?: string;
}
