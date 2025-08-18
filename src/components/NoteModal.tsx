import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { 
  Save, 
  X, 
  Pin, 
  Tag,
  Plus
} from 'lucide-react';
import { Note, NoteFormData } from '@/types/note';
import { useToast } from '@/hooks/use-toast';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NoteFormData) => void;
  note?: Note | null;
  mode: 'create' | 'edit';
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  note,
  mode
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<NoteFormData>({
    title: '',
    content: '',
    isPinned: false,
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && note) {
        setFormData({
          title: note.title,
          content: note.content,
          isPinned: note.isPinned || false,
          tags: note.tags || []
        });
      } else {
        setFormData({
          title: '',
          content: '',
          isPinned: false,
          tags: []
        });
      }
    }
  }, [isOpen, mode, note]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your note.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      onSave(formData);
      
      toast({
        title: mode === 'create' ? "Note created" : "Note updated",
        description: `Your note "${formData.title}" has been ${mode === 'create' ? 'created' : 'updated'} successfully.`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl h-[90vh] flex flex-col animate-scale-in"
        onKeyDown={handleKeyPress}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">
            {mode === 'create' ? 'Create New Note' : 'Edit Note'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Title and Controls */}
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <Label htmlFor="title" className="text-sm font-medium mb-2 block">
                Note Title
              </Label>
              <Input
                id="title"
                placeholder="Enter note title..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="text-lg font-medium"
                autoFocus
              />
            </div>
            
            <Button
              variant={formData.isPinned ? "default" : "outline"}
              size="sm"
              onClick={() => setFormData(prev => ({ ...prev, isPinned: !prev.isPinned }))}
              className="mt-7"
            >
              <Pin className={`h-4 w-4 ${formData.isPinned ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Tags
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content Editor */}
          <div className="flex-1 flex flex-col min-h-0">
            <Label className="text-sm font-medium mb-2 block">
              Content
            </Label>
            <div className="flex-1 min-h-0">
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                placeholder="Start writing your note..."
                className="h-full"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-border flex-shrink-0">
          <div className="text-sm text-muted-foreground">
            Use <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+Enter</kbd> to save quickly
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving || !formData.title.trim()}
              className="bg-gradient-primary"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Note'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};