export type UserRole = 'student' | 'researcher' | 'professor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  institution?: string;
  createdAt: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  roles: UserRole[];
  badge?: string;
}

export interface StatMetric {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  description?: string;
}

export interface RecentActivityItem {
  id: string;
  title: string;
  timestamp: string;
  type: 'paper_upload' | 'chat_session' | 'comparison' | 'note_created' | 'student_review';
  userRole?: UserRole;
  metadata?: string;
}
