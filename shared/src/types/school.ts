export interface School {
  id: string;
  name: string;
  code: string;
  motto?: string;
  logoUrl?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  schoolType: 'PRIMARY' | 'SECONDARY' | 'COMBINED' | 'KINDERGARTEN';
  currency: string;
  timezone: string;
  dateFormat: string;
  academicYearId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Campus {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  principalName?: string;
  isActive: boolean;
}
