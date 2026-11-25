import { z } from 'zod';
import { PAYMENT_METHODS } from '../constants/academic.js';
import { USER_ROLES } from '../constants/roles.js';
import { isValidKenyanPhone, validatePasswordStrength } from '../utils/validation.js';

const uuid = z.string().uuid('Must be a valid UUID');
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');
const timeString = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be HH:MM');
const phone = z.string().refine(isValidKenyanPhone, 'Must be a valid Kenyan phone number');
const strongPassword = z
  .string()
  .refine((value) => validatePasswordStrength(value).valid, {
    message: 'Password must contain 8+ characters, upper and lower case, a number and a symbol',
  });

const today = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

const isPastDate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed <= today();
};

export const idParamSchema = z.object({ id: uuid });
export const idAndChildParamSchema = z.object({ id: uuid, childId: uuid });

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  sortBy: z.string().trim().max(80).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  firstName: z.string().trim().min(2).max(100),
  lastName: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: strongPassword,
  phone: phone.optional(),
  role: z.enum(Object.keys(USER_ROLES) as [keyof typeof USER_ROLES, ...(keyof typeof USER_ROLES)[]]).optional(),
  schoolId: uuid.optional(),
  campusId: uuid.optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: strongPassword,
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: strongPassword,
});

export const schoolSchema = z.object({
  name: z.string().trim().min(2).max(200),
  code: z.string().trim().min(2).max(30).regex(/^[A-Za-z0-9-]+$/, 'Use letters, numbers and dashes'),
  motto: z.string().trim().max(200).optional(),
  address: z.string().trim().min(5).max(300),
  phone,
  email: z.string().trim().email(),
  website: z.string().trim().url().optional(),
  schoolType: z.enum(['KINDERGARTEN', 'PRIMARY', 'SECONDARY', 'COMBINED']),
  currency: z.string().length(3).default('KES'),
  timezone: z.string().default('Africa/Nairobi'),
  dateFormat: z.string().default('DD/MM/YYYY'),
});

export const campusSchema = z.object({
  name: z.string().trim().min(2).max(150),
  code: z.string().trim().min(2).max(30),
  address: z.string().trim().min(5).max(300),
  phone,
  email: z.string().trim().email(),
  principalName: z.string().trim().max(150).optional(),
});

export const academicYearSchema = z
  .object({
    name: z.string().trim().min(4).max(20),
    startDate: dateString,
    endDate: dateString,
    isCurrent: z.boolean().optional().default(false),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export const termSchema = z
  .object({
    academicYearId: uuid,
    name: z.string().trim().min(2).max(40),
    startDate: dateString,
    endDate: dateString,
    isCurrent: z.boolean().optional().default(false),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export const classLevelSchema = z.object({
  name: z.string().trim().min(1).max(40),
  code: z.string().trim().min(1).max(10),
  levelOrder: z.coerce.number().int().min(0),
});

export const streamSchema = z.object({
  classLevelId: uuid,
  name: z.string().trim().min(1).max(40),
  code: z.string().trim().min(1).max(10),
  capacity: z.coerce.number().int().min(1).max(500).default(40),
  classTeacherId: uuid.optional(),
});

export const subjectSchema = z.object({
  name: z.string().trim().min(2).max(100),
  code: z.string().trim().min(1).max(20),
  isOptional: z.boolean().optional().default(false),
  category: z.string().trim().min(2).max(60).default('CORE'),
});

export const studentSchema = z.object({
  admissionNumber: z.string().trim().min(1).max(40).regex(/^[A-Za-z0-9/-]+$/),
  firstName: z.string().trim().min(1).max(100),
  middleName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().min(1).max(100),
  dateOfBirth: dateString.refine(isPastDate, 'Date of birth cannot be in the future'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  classLevelId: uuid,
  streamId: uuid.optional(),
  admissionDate: dateString.refine(isPastDate, 'Admission date cannot be in the future').optional(),
  guardianName: z.string().trim().min(2).max(200).optional(),
  guardianPhone: phone.optional(),
  guardianEmail: z.string().trim().email().optional(),
  medicalNotes: z.string().trim().max(2000).optional(),
});

export const guardianSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  relationship: z.enum(['MOTHER', 'FATHER', 'GUARDIAN', 'SIBLING', 'OTHER']),
  phone,
  alternatePhone: phone.optional(),
  email: z.string().trim().email().optional(),
  nationalId: z.string().trim().max(20).optional(),
  occupation: z.string().trim().max(100).optional(),
  address: z.string().trim().max(300).optional(),
});

export const staffSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  phone,
  staffNumber: z.string().trim().min(1).max(40),
  employmentType: z.enum(['PERMANENT', 'CONTRACT', 'PART_TIME', 'INTERN']),
  dateJoined: dateString,
  departmentId: uuid.optional(),
  jobTitle: z.string().trim().max(120).optional(),
});

export const feeCategorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  isMandatory: z.boolean().optional().default(true),
});

export const feeStructureSchema = z.object({
  feeCategoryId: uuid,
  classLevelId: uuid.optional(),
  academicYearId: uuid,
  termId: uuid.optional(),
  amount: z.coerce.number().positive('Amount must be greater than zero').max(10_000_000),
});

export const invoiceItemSchema = z.object({
  feeCategoryId: uuid,
  description: z.string().trim().min(2).max(200),
  amount: z.coerce.number().positive().max(10_000_000),
  quantity: z.coerce.number().int().positive().default(1),
});

export const invoiceSchema = z.object({
  studentId: uuid,
  termId: uuid,
  dueDate: dateString,
  items: z.array(invoiceItemSchema).min(1, 'An invoice needs at least one item'),
  discountAmount: z.coerce.number().min(0).max(10_000_000).optional().default(0),
  notes: z.string().trim().max(1000).optional(),
});

export const paymentSchema = z.object({
  studentId: uuid,
  invoiceId: uuid.optional(),
  amount: z.coerce.number().positive('Payment amount must be greater than zero').max(10_000_000),
  paymentMethod: z.enum(PAYMENT_METHODS),
  referenceNumber: z.string().trim().min(3).max(100),
  paidAt: z.string().datetime().optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const mpesaCallbackSchema = z.object({
  Body: z.object({
    stkCallback: z.object({
      MerchantRequestID: z.string(),
      CheckoutRequestID: z.string(),
      ResultCode: z.number(),
      ResultDesc: z.string(),
      CallbackMetadata: z
        .object({
          Item: z.array(z.object({ Name: z.string(), Value: z.union([z.string(), z.number()]) })),
        })
        .optional(),
    }),
  }),
});

export const attendanceSchema = z.object({
  studentId: uuid,
  classLevelId: uuid,
  termId: uuid,
  date: dateString.refine(isPastDate, 'Attendance cannot be recorded for a future date'),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'SICK']),
  remarks: z.string().trim().max(500).optional(),
});

export const staffAttendanceSchema = z.object({
  staffId: uuid,
  date: dateString.refine(isPastDate, 'Attendance cannot be recorded for a future date'),
  clockIn: timeString.optional(),
  clockOut: timeString.optional(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'ON_LEAVE']),
  notes: z.string().trim().max(500).optional(),
});

export const examinationSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    examType: z.enum(['CAT', 'MID_TERM', 'END_TERM', 'MOCK', 'NATIONAL']),
    academicYearId: uuid,
    termId: uuid,
    startDate: dateString,
    endDate: dateString,
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'End date must not precede start date',
    path: ['endDate'],
  });

export const marksSchema = z
  .object({
    studentId: uuid,
    subjectId: uuid,
    marksObtained: z.coerce.number().min(0),
    maxMarks: z.coerce.number().positive().max(1000).default(100),
    remarks: z.string().trim().max(500).optional(),
  })
  .refine((data) => data.marksObtained <= data.maxMarks, {
    message: 'Marks obtained cannot exceed the maximum marks',
    path: ['marksObtained'],
  });

export const gradingScaleSchema = z.object({
  gradeName: z.string().trim().min(1).max(10),
  minMarks: z.coerce.number().min(0).max(100),
  maxMarks: z.coerce.number().min(0).max(100),
  points: z.coerce.number().min(0),
  remarks: z.string().trim().max(100),
});

export const announcementSchema = z.object({
  title: z.string().trim().min(2).max(200),
  body: z.string().trim().min(2).max(10_000),
  audience: z
    .array(z.enum(['ALL', 'STAFF', 'TEACHERS', 'STUDENTS', 'PARENTS', 'CLASS']))
    .min(1),
  classLevelId: uuid.optional(),
  publishAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type MarksInput = z.infer<typeof marksSchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type AcademicYearInput = z.infer<typeof academicYearSchema>;
