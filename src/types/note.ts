export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isPinned?: boolean;
  tags?: string[];
}

export interface NoteFormData {
  title: string;
  content: string;
  isPinned?: boolean;
  tags?: string[];
}