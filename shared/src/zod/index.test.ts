import { describe, expect, it } from 'vitest';
import {
  academicYearSchema,
  attendanceSchema,
  loginSchema,
  marksSchema,
  paginationSchema,
  paymentSchema,
  registerSchema,
  studentSchema,
} from './index';

const validUuid = '8f1c2a3e-4b5d-4e6f-8a9b-0c1d2e3f4a5b';

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'secret' }).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    expect(loginSchema.safeParse({ email: 'nope', password: 'secret' }).success).toBe(false);
  });

  it('requires a password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false);
  });
});

describe('registerSchema', () => {
  const base = {
    firstName: 'Jane',
    lastName: 'Wanjiku',
    email: 'jane@school.ac.ke',
    password: 'Str0ng!pass',
  };

  it('accepts a strong registration payload', () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it('rejects a weak password', () => {
    expect(registerSchema.safeParse({ ...base, password: 'weak' }).success).toBe(false);
  });

  it('rejects an invalid Kenyan phone number', () => {
    expect(registerSchema.safeParse({ ...base, phone: '12345' }).success).toBe(false);
  });
});

describe('paginationSchema', () => {
  it('applies defaults', () => {
    expect(paginationSchema.parse({})).toMatchObject({ page: 1, limit: 20 });
  });

  it('coerces query string values', () => {
    expect(paginationSchema.parse({ page: '2', limit: '50' })).toMatchObject({
      page: 2,
      limit: 50,
    });
  });

  it('caps the page size', () => {
    expect(paginationSchema.safeParse({ limit: '500' }).success).toBe(false);
  });
});

describe('studentSchema', () => {
  it('accepts a valid student', () => {
    const result = studentSchema.safeParse({
      admissionNumber: 'ADM-001',
      firstName: 'Brian',
      lastName: 'Otieno',
      dateOfBirth: '2012-03-04',
      gender: 'MALE',
      classLevelId: validUuid,
    });
    expect(result.success).toBe(true);
  });

  it('rejects a future date of birth', () => {
    const result = studentSchema.safeParse({
      admissionNumber: 'ADM-002',
      firstName: 'Brian',
      lastName: 'Otieno',
      dateOfBirth: '2999-01-01',
      gender: 'MALE',
      classLevelId: validUuid,
    });
    expect(result.success).toBe(false);
  });
});

describe('paymentSchema', () => {
  const base = {
    studentId: validUuid,
    amount: 1500,
    paymentMethod: 'MPESA',
    referenceNumber: 'QK12ABC34',
  };

  it('accepts a valid payment', () => {
    expect(paymentSchema.safeParse(base).success).toBe(true);
  });

  it('rejects zero and negative amounts', () => {
    expect(paymentSchema.safeParse({ ...base, amount: 0 }).success).toBe(false);
    expect(paymentSchema.safeParse({ ...base, amount: -5 }).success).toBe(false);
  });

  it('rejects an unknown payment method', () => {
    expect(paymentSchema.safeParse({ ...base, paymentMethod: 'CRYPTO' }).success).toBe(false);
  });
});

describe('marksSchema', () => {
  it('accepts marks within the maximum', () => {
    expect(
      marksSchema.safeParse({ studentId: validUuid, subjectId: validUuid, marksObtained: 78, maxMarks: 100 })
        .success,
    ).toBe(true);
  });

  it('rejects marks above the maximum', () => {
    expect(
      marksSchema.safeParse({ studentId: validUuid, subjectId: validUuid, marksObtained: 101, maxMarks: 100 })
        .success,
    ).toBe(false);
  });
});

describe('attendanceSchema', () => {
  it('accepts a valid attendance record', () => {
    expect(
      attendanceSchema.safeParse({
        studentId: validUuid,
        classLevelId: validUuid,
        termId: validUuid,
        date: '2026-01-05',
        status: 'PRESENT',
      }).success,
    ).toBe(true);
  });

  it('rejects an unknown status', () => {
    expect(
      attendanceSchema.safeParse({
        studentId: validUuid,
        classLevelId: validUuid,
        termId: validUuid,
        date: '2026-01-05',
        status: 'HOLIDAY',
      }).success,
    ).toBe(false);
  });
});

describe('academicYearSchema', () => {
  it('rejects a year whose end precedes its start', () => {
    expect(
      academicYearSchema.safeParse({
        name: '2026',
        startDate: '2026-12-01',
        endDate: '2026-01-01',
      }).success,
    ).toBe(false);
  });
});
