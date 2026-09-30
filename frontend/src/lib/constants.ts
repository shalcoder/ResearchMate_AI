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
        title: 'Papers Library',
        href: '/papers',
        icon: 'BookOpen',
        roles: ['student', 'researcher', 'professor', 'admin'],
      },
      {
        title: 'Semantic Search',
        href: '/search',
        icon: 'Search',
        roles: ['student', 'researcher', 'professor'],
      },
      {
        title: 'Paper Comparison',
        href: '/compare',
        icon: 'Columns',
        roles: ['student', 'researcher', 'professor'],
      },
    ],
  },
  {
    sectionTitle: 'AI Tools',
    items: [
      {
        title: 'Paper Chat & RAG',
        href: '/chat',
        icon: 'MessageSquareText',
        roles: ['student', 'researcher', 'professor'],
        badge: 'Grounded',
      },
    ],
  },
  {
    sectionTitle: 'Organize',
    items: [
      {
        title: 'Projects & Notes',
        href: '/projects',
        icon: 'FolderKanban',
        roles: ['student', 'researcher', 'professor'],
      },
    ],
  },
  {
    sectionTitle: 'Admin & Faculty',
    items: [
      {
        title: 'Faculty Review Hub',
        href: '/dashboard/professor',
        icon: 'GraduationCap',
        roles: ['professor'],
        badge: 'Faculty',
      },
      {
        title: 'Governance & Audit',
        href: '/dashboard/admin',
        icon: 'ShieldCheck',
        roles: ['admin'],
        badge: 'System',
      },
    ],
  },
];

// Flat fallback for backward compatibility
export const NAVIGATION_ITEMS: NavItem[] = NAVIGATION_SECTIONS.flatMap(s => s.items);
