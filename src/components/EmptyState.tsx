import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  FileText,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface EmptyStateProps {
  onCreateNote: () => void;
  hasSearch?: boolean;
  searchQuery?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  onCreateNote, 
  hasSearch, 
  searchQuery 
}) => {
  if (hasSearch) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No notes found</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          No notes match your search for "{searchQuery}". Try different keywords or create a new note.
        </p>
        <Button onClick={onCreateNote} className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Create New Note
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-elevated">
          <BookOpen className="h-12 w-12 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-3">Start Your Journey</h3>
      <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
        Welcome to your personal note-taking space! Create your first note to capture 
        ideas, organize thoughts, and boost your productivity.
      </p>

      <div className="space-y-4">
        <Button 
          onClick={onCreateNote} 
          size="lg"
          className="bg-gradient-primary shadow-custom-lg hover:shadow-elevated transition-all duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Your First Note
        </Button>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Rich text formatting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-secondary rounded-full"></div>
            <span>Auto-save</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <span>Search & organize</span>
          </div>
        </div>
      </div>
    </div>
  );
};