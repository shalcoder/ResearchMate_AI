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

export interface PaperSummary {
  id: string;
  paper_id: string;
  executive_summary: string;
  key_findings: string[];
  methodology?: string;
  limitations: string[];
  future_scope: string[];
  created_at: string;
}

export interface PaperChunk {
  id: string;
  paper_id: string;
  chunk_index: number;
  section_name: string;
  content: string;
  token_count: number;
  page_number: number;
  chroma_id?: string;
  created_at: string;
}

export interface ResearchPaper {
  id: string;
  title: string;
  abstract?: string;
  authors: string[];
  publication_year?: number;
  venue?: string;
  doi?: string;
  file_path: string;
  file_size: number;
  total_pages: number;
  total_chunks: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
  summary?: PaperSummary;
}

export interface Citation {
  citation_id: string;
  chunk_index: number;
  page_number: number;
  section_name: string;
  excerpt: string;
  relevance_score?: number;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  created_at: string;
}

export interface ChatSession {
  id: string;
  title: string;
  paper_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
}

export interface ComparisonMatrixItem {
  aspect: string;
  paper_comparisons: Record<string, string>;
  analysis?: string;
  winner_or_edge?: string;
}

export interface PaperComparison {
  id?: string;
  paper_ids: string[];
  paper_titles: string[];
  synthesis: string;
  matrix: ComparisonMatrixItem[];
  research_gaps: string[];
  created_at?: string;
}

export interface PaperNote {
  id: string;
  paper_id: string;
  user_id: string;
  page_number: number;
  selected_text?: string;
  note_text: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  papers: ResearchPaper[];
}

export interface SearchResultItem {
  paper_id: string;
  paper_title: string;
  venue?: string;
  publication_year?: number;
  chunk_index: number;
  page_number: number;
  section_name: string;
  content_snippet: string;
  relevance_score: number;
}

export interface CitationAllFormats {
  paper_id: string;
  paper_title: string;
  apa: string;
  mla: string;
  ieee: string;
  harvard: string;
  chicago: string;
  bibtex: string;
}



