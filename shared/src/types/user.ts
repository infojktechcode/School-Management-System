export type UserRoleType =
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'PRINCIPAL'
  | 'DEPUTY_PRINCIPAL'
  | 'DIRECTOR_OF_STUDIES'
  | 'BURSAR'
  | 'TEACHER'
  | 'CLASS_TEACHER'
  | 'LIBRARIAN'
  | 'SCHOOL_NURSE'
  | 'TRANSPORT_MANAGER'
  | 'RECEPTIONIST'
  | 'PARENT'
  | 'STUDENT';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  schoolId: string;
  roles: UserRoleType[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}
