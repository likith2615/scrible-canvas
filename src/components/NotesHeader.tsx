import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  StickyNote,
  Sparkles
} from 'lucide-react';

interface NotesHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateNote: () => void;
  notesCount: number;
}

export const NotesHeader: React.FC<NotesHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onCreateNote,
  notesCount
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4 shadow-custom-lg">
          <StickyNote className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Professional Notes
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Capture your thoughts, organize your ideas, and boost your productivity with our modern note-taking experience.
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>
              {notesCount === 0 
                ? 'No notes yet' 
                : `${notesCount} note${notesCount === 1 ? '' : 's'}`
              }
            </span>
          </div>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-full sm:w-64 bg-surface"
            />
          </div>

          {/* Create Note Button */}
          <Button 
            onClick={onCreateNote}
            className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-custom-md whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>
    </div>
  );
};