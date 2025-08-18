import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import bcrypt from 'bcryptjs';

export interface Note {
  id: string;
  title: string;
  content: string;
  password_hash?: string;
  is_pinned: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface NoteFormData {
  title: string;
  content: string;
  password?: string;
  is_pinned?: boolean;
  tags?: string[];
}

export const useSupabaseNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Load notes from Supabase
  const loadNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading notes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const createNote = async (noteData: NoteFormData): Promise<Note | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let passwordHash = null;
      if (noteData.password && noteData.password.trim()) {
        passwordHash = await bcrypt.hash(noteData.password, 10);
      }

      const { data, error } = await supabase
        .from('notes')
        .insert({
          title: noteData.title,
          content: noteData.content,
          password_hash: passwordHash,
          is_pinned: noteData.is_pinned || false,
          tags: noteData.tags || [],
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => [data, ...prev]);
      toast({
        title: "Note created",
        description: "Your note has been created successfully.",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error creating note",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateNote = async (id: string, updates: Partial<NoteFormData>): Promise<Note | null> => {
    try {
      let passwordHash = undefined;
      if (updates.password !== undefined) {
        passwordHash = updates.password && updates.password.trim() 
          ? await bcrypt.hash(updates.password, 10) 
          : null;
      }

      const updateData: any = { ...updates };
      delete updateData.password;
      if (passwordHash !== undefined) {
        updateData.password_hash = passwordHash;
      }

      const { data, error } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => prev.map(note => note.id === id ? data : note));
      toast({
        title: "Note updated",
        description: "Your note has been updated successfully.",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error updating note",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteNote = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== id));
      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully.",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting note",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const togglePin = async (id: string): Promise<boolean> => {
    try {
      const note = notes.find(n => n.id === id);
      if (!note) return false;

      const { data, error } = await supabase
        .from('notes')
        .update({ is_pinned: !note.is_pinned })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => prev.map(n => n.id === id ? data : n));
      return true;
    } catch (error: any) {
      toast({
        title: "Error updating note",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const verifyNotePassword = async (note: Note, password: string): Promise<boolean> => {
    if (!note.password_hash) return true;
    return bcrypt.compare(password, note.password_hash);
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort notes: pinned first, then by updated date
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) {
      return a.is_pinned ? -1 : 1;
    }
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  return {
    notes: sortedNotes,
    loading,
    searchQuery,
    setSearchQuery,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    verifyNotePassword,
    refreshNotes: loadNotes,
  };
};