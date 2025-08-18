import React, { useState } from 'react';
import { useNotes } from '@/hooks/useNotes';
import { NotesHeader } from '@/components/NotesHeader';
import { NoteCard } from '@/components/NoteCard';
import { NoteModal } from '@/components/NoteModal';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { Note, NoteFormData } from '@/types/note';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { 
    notes, 
    searchQuery, 
    setSearchQuery, 
    createNote, 
    updateNote, 
    deleteNote, 
    togglePin 
  } = useNotes();
  
  const { toast } = useToast();
  
  // Modal states
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const handleCreateNote = () => {
    setSelectedNote(null);
    setModalMode('create');
    setIsNoteModalOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setModalMode('edit');
    setIsNoteModalOpen(true);
  };

  const handleDeleteNote = (id: string) => {
    const note = notes.find(n => n.id === id);
    setSelectedNote(note || null);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedNote) {
      deleteNote(selectedNote.id);
      toast({
        title: "Note deleted",
        description: `"${selectedNote.title}" has been deleted successfully.`,
      });
    }
    setIsDeleteDialogOpen(false);
    setSelectedNote(null);
  };

  const handleSaveNote = (data: NoteFormData) => {
    if (modalMode === 'create') {
      createNote(data);
    } else if (selectedNote) {
      updateNote(selectedNote.id, data);
    }
    setIsNoteModalOpen(false);
    setSelectedNote(null);
  };

  const handleTogglePin = (id: string) => {
    togglePin(id);
    const note = notes.find(n => n.id === id);
    if (note) {
      toast({
        title: note.isPinned ? "Note unpinned" : "Note pinned",
        description: `"${note.title}" has been ${note.isPinned ? 'unpinned' : 'pinned'}.`,
      });
    }
  };

  const showEmptyState = notes.length === 0;
  const showSearchEmptyState = searchQuery && notes.length === 0;

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <NotesHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateNote={handleCreateNote}
          notesCount={notes.length}
        />

        {/* Notes Grid */}
        <div className="mt-8">
          {showEmptyState || showSearchEmptyState ? (
            <EmptyState 
              onCreateNote={handleCreateNote}
              hasSearch={!!searchQuery}
              searchQuery={searchQuery}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                  onTogglePin={handleTogglePin}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setSelectedNote(null);
        }}
        onSave={handleSaveNote}
        note={selectedNote}
        mode={modalMode}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedNote(null);
        }}
        onConfirm={handleConfirmDelete}
        note={selectedNote}
      />
    </div>
  );
};

export default Index;
