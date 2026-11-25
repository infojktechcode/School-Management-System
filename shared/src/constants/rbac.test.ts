import { describe, expect, it } from 'vitest';
import { PERMISSIONS } from './permissions';
import { ROLE_PERMISSIONS } from './roles';
import { KENYA_CLASS_LEVELS, SCHOOL_TYPES } from './academic';

describe('RBAC matrix', () => {
  const allPermissions = Object.values(PERMISSIONS);

  it('assigns only known permissions to roles', () => {
    for (const permissions of Object.values(ROLE_PERMISSIONS)) {
      for (const permission of permissions) {
        expect(allPermissions).toContain(permission);
      }
    }
  });

  it('gives super admins every permission', () => {
    expect(new Set(ROLE_PERMISSIONS.SUPER_ADMIN)).toEqual(new Set(allPermissions));
  });

  it('gives teachers marks entry but not finance management', () => {
    expect(ROLE_PERMISSIONS.TEACHER).toContain(PERMISSIONS.MARKS_ENTRY);
    expect(ROLE_PERMISSIONS.TEACHER).not.toContain(PERMISSIONS.FINANCE_MANAGE);
  });

  it('keeps parents read-only', () => {
    expect(ROLE_PERMISSIONS.PARENT).toContain(PERMISSIONS.STUDENT_READ);
    expect(ROLE_PERMISSIONS.PARENT).not.toContain(PERMISSIONS.STUDENT_CREATE);
    expect(ROLE_PERMISSIONS.PARENT).not.toContain(PERMISSIONS.FINANCE_MANAGE);
  });
});

describe('academic constants', () => {
  it('covers primary and secondary school types', () => {
    expect(SCHOOL_TYPES).toContain('PRIMARY');
    expect(SCHOOL_TYPES).toContain('SECONDARY');
    expect(SCHOOL_TYPES).toContain('COMBINED');
  });

  it('orders Kenyan class levels from pre-primary upward', () => {
    const names = KENYA_CLASS_LEVELS.map((level) => level.name);
    expect(names[0]).toBe('PP1');
    expect(names).toContain('Grade 9');
    expect(names.at(-1)).toBe('Grade 12');
  });
});
