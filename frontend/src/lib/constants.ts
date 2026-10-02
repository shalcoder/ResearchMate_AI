import { NavItem } from '../types';

export interface NavigationSection {
  sectionTitle: string;
  items: NavItem[];
}

export const NAVIGATION_SECTIONS: NavigationSection[] = [
  {
    sectionTitle: 'Workspace',
    items: [
      {
        title: 'Overview',
        href: '/dashboard',
        icon: 'LayoutDashboard',
        roles: ['student', 'researcher', 'professor', 'admin'],
      },
    ],
  },
  {
    sectionTitle: 'Research',
    items: [
      {
        title: 'Paper Library',
        href: '/papers',
        icon: 'BookOpen',
        roles: ['student', 'researcher', 'professor', 'admin'],
      },
      {
        title: 'Literature Search',
        href: '/search',
        icon: 'Search',
        roles: ['student', 'researcher', 'professor'],
      },
      {
        title: 'Compare Papers',
        href: '/compare',
        icon: 'Columns',
        roles: ['student', 'researcher', 'professor'],
      },
    ],
  },
  {
    sectionTitle: 'AI Assistance',
    items: [
      {
        title: 'Ask Research Assistant',
        href: '/chat',
        icon: 'MessageSquareText',
        roles: ['student', 'researcher', 'professor'],
        badge: 'Q&A',
      },
    ],
  },
  {
    sectionTitle: 'Organization',
    items: [
      {
        title: 'Projects & Notes',
        href: '/projects',
        icon: 'FolderKanban',
        roles: ['student', 'researcher', 'professor'],
      },
      {
        title: 'My Profile',
        href: '/profile',
        icon: 'User',
        roles: ['student', 'researcher', 'professor', 'admin'],
      },
    ],
  },
  {
    sectionTitle: 'Advisory & Admin',
    items: [
      {
        title: 'Student Supervision',
        href: '/dashboard/professor',
        icon: 'GraduationCap',
        roles: ['professor'],
        badge: 'Faculty',
      },
      {
        title: 'Department Admin',
        href: '/dashboard/admin',
        icon: 'ShieldCheck',
        roles: ['admin'],
        badge: 'Admin',
      },
    ],
  },
];

// Flat fallback for backward compatibility
export const NAVIGATION_ITEMS: NavItem[] = NAVIGATION_SECTIONS.flatMap(s => s.items);
