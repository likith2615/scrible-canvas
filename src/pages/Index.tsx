import React, { useState, useEffect } from 'react';
import { Plus, Search, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseNotes } from '@/hooks/useSupabaseNotes';
import { NoteCard } from '@/components/NoteCard';
import { NoteModal } from '@/components/NoteModal';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { PasswordProtectedNote } from '@/components/PasswordProtectedNote';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Note } from '@/types/note';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { 
    notes, 
    loading, 
    searchQuery, 
    setSearchQuery, 
    createNote, 
    updateNote, 
    deleteNote, 
    togglePin,
    verifyNotePassword 
  } = useSupabaseNotes();

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<{ id: string; title: string } | null>(null);
  const [protectedNote, setProtectedNote] = useState<Note | null>(null);
  const [unlockedNotes, setUnlockedNotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleCreateNote = () => {
    setSelectedNote(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewNote = (note: Note) => {
    if (note.password_hash && !unlockedNotes.has(note.id)) {
      setProtectedNote(note);
      return;
    }
    
    setSelectedNote(note);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeleteNote = (id: string, title: string) => {
    setNoteToDelete({ id, title });
  };

  const confirmDelete = () => {
    if (noteToDelete) {
      deleteNote(noteToDelete.id);
      setNoteToDelete(null);
    }
  };

  const handlePasswordVerified = () => {
    if (protectedNote) {
      setUnlockedNotes(prev => new Set([...prev, protectedNote.id]));
      setSelectedNote(protectedNote);
      setModalMode('view');
      setIsModalOpen(true);
      setProtectedNote(null);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (protectedNote) {
    return (
      <PasswordProtectedNote
        note={protectedNote}
        onPasswordVerified={handlePasswordVerified}
        onVerifyPassword={(password) => verifyNotePassword(protectedNote, password)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  SecureNotes
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user.email?.split('@')[0]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleCreateNote} className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <EmptyState onCreateNote={handleCreateNote} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                onTogglePin={togglePin}
                onView={handleViewNote}
              />
            ))}
          </div>
        )}
      </main>

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={modalMode === 'create' ? createNote : (data) => selectedNote && updateNote(selectedNote.id, data)}
        note={selectedNote}
        mode={modalMode}
      />

      <DeleteConfirmDialog
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={confirmDelete}
        noteTitle={noteToDelete?.title || ''}
      />
    </div>
  );
};

export default Index;