import { NavItem } from '../types';

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['student', 'researcher', 'professor', 'admin'],
  },
  {
    title: 'Paper Library',
    href: '/papers',
    icon: 'BookOpen',
    roles: ['student', 'researcher', 'professor', 'admin'],
  },
  {
    title: 'Paper Chat & RAG',
    href: '/chat',
    icon: 'MessageSquareText',
    roles: ['student', 'researcher', 'professor'],
  },
  {
    title: 'Paper Comparison',
    href: '/compare',
    icon: 'Columns',
    roles: ['student', 'researcher', 'professor'],
  },
  {
    title: 'Semantic Search',
    href: '/search',
    icon: 'Search',
    roles: ['student', 'researcher', 'professor'],
  },
  {
    title: 'Projects & Notes',
    href: '/projects',
    icon: 'FolderKanban',
    roles: ['student', 'researcher', 'professor'],
  },
  {
    title: 'Student Review Hub',
    href: '/dashboard/professor',
    icon: 'GraduationCap',
    roles: ['professor'],
    badge: 'Faculty',
  },
  {
    title: 'Admin Governance',
    href: '/dashboard/admin',
    icon: 'ShieldCheck',
    roles: ['admin'],
    badge: 'System',
  },
];
