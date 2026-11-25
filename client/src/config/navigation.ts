import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Bus,
  CalendarCheck,
  FileSpreadsheet,
  LayoutDashboard,
  Library,
  Settings,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react';
import type { Permission } from '@school-mgmt/shared';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: Permission;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Students', href: '/students', icon: Users, permission: 'student:read' },
  { label: 'Staff', href: '/staff', icon: UserCog, permission: 'staff:read' },
  { label: 'Academics', href: '/academics', icon: BookOpen, permission: 'academic:manage' },
  { label: 'Attendance', href: '/attendance', icon: CalendarCheck, permission: 'attendance:read' },
  { label: 'Examinations', href: '/examinations', icon: FileSpreadsheet, permission: 'marks:read' },
  { label: 'Finance', href: '/finance', icon: Wallet, permission: 'finance:read' },
  { label: 'Library', href: '/library', icon: Library, permission: 'library:borrow' },
  { label: 'Transport', href: '/transport', icon: Bus, permission: 'transport:manage' },
  { label: 'Settings', href: '/settings', icon: Settings, permission: 'settings:manage' },
];
