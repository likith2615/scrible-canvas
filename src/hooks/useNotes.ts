import { useState, useEffect } from 'react';
import { Note, NoteFormData } from '@/types/note';

const STORAGE_KEY = 'notes-app-data';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load notes from localStorage on mount
  useEffect(() => {
    const storedNotes = localStorage.getItem(STORAGE_KEY);
    if (storedNotes) {
      try {
        const parsedNotes = JSON.parse(storedNotes).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }));
        setNotes(parsedNotes);
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const createNote = (noteData: NoteFormData): Note => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      ...noteData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setNotes(prev => [newNote, ...prev]);
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<NoteFormData>): Note | null => {
    let updatedNote: Note | null = null;

    setNotes(prev => prev.map(note => {
      if (note.id === id) {
        updatedNote = {
          ...note,
          ...updates,
          updatedAt: new Date(),
        };
        return updatedNote;
      }
      return note;
    }));

    return updatedNote;
  };

  const deleteNote = (id: string): boolean => {
    setNotes(prev => prev.filter(note => note.id !== id));
    return true;
  };

  const togglePin = (id: string): boolean => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, isPinned: !note.isPinned, updatedAt: new Date() }
        : note
    ));
    return true;
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort notes: pinned first, then by updated date
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return {
    notes: sortedNotes,
    searchQuery,
    setSearchQuery,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
  };
};