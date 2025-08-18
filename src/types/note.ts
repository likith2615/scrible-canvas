export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  tags: string[];
  password_hash?: string;
  user_id: string;
}

export interface NoteFormData {
  title: string;
  content: string;
  is_pinned?: boolean;
  tags?: string[];
  password?: string;
}