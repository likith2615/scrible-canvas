import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { X, Plus, Lock, Eye, EyeOff, Save } from 'lucide-react';
import { Note, NoteFormData } from '@/types/note';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { toast } from '@/hooks/use-toast';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NoteFormData) => void;
  note?: Note | null;
  mode: 'create' | 'edit' | 'view';
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  note,
  mode
}) => {
  const [formData, setFormData] = useState<NoteFormData>({
    title: '',
    content: '',
    is_pinned: false,
    tags: [],
    password: ''
  });
  const [newTag, setNewTag] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (note && (mode === 'edit' || mode === 'view')) {
        setFormData({
          title: note.title,
          content: note.content,
          is_pinned: note.is_pinned || false,
          tags: note.tags || [],
          password: '' // Don't show existing password
        });
      } else {
        setFormData({
          title: '',
          content: '',
          is_pinned: false,
          tags: [],
          password: ''
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

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Note' : mode === 'edit' ? 'Edit Note' : 'View Note'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <Label htmlFor="title">Note Title</Label>
              <Input
                id="title"
                placeholder="Enter note title..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                readOnly={isReadOnly}
              />
            </div>
            
            {!isReadOnly && (
              <div className="flex items-center space-x-2 mt-6">
                <Switch
                  checked={formData.is_pinned}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_pinned: checked }))}
                />
                <Label>Pin this note</Label>
              </div>
            )}
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                  {!isReadOnly && (
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                  )}
                </Badge>
              ))}
            </div>
            {!isReadOnly && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button variant="outline" size="sm" onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {!isReadOnly && (
            <div>
              <Label className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password Protection (Optional)
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'edit' && note?.password_hash ? 'Enter new password (leave blank to keep current)' : 'Set a password to protect this note'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
                {formData.password && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col min-h-0">
            <Label>Content</Label>
            <div className="flex-1">
              <RichTextEditor
                content={formData.content}
                onChange={(content) => !isReadOnly && setFormData(prev => ({ ...prev, content }))}
                placeholder="Start writing your note..."
                className="h-full"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {isReadOnly ? 'Close' : 'Cancel'}
          </Button>
          {!isReadOnly && (
            <Button onClick={handleSave} disabled={isSaving || !formData.title.trim()}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Note'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};