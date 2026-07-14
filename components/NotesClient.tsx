'use client';

import { useState, useRef, useEffect } from 'react';
import { createNote, updateNote, deleteNote } from '@/app/actions';

type Note = {
  id: string;
  title: string;
  body: string;
  updatedAt: Date;
};

export default function NotesClient({ notes }: { notes: Note[] }) {
  const [localNotes, setLocalNotes] = useState<Note[]>(notes);
  const [creatorExpanded, setCreatorExpanded] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  
  const creatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  // Click outside to save and close
  useEffect(() => {
    const handleClickOutside = async (e: MouseEvent) => {
      if (creatorExpanded && creatorRef.current && !creatorRef.current.contains(e.target as Node)) {
        await handleSaveNew();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [creatorExpanded, newTitle, newBody]);

  const handleSaveNew = async () => {
    if (newTitle.trim() || newBody.trim()) {
      // Optimistic update
      const tempId = 'temp-' + Date.now();
      setLocalNotes([{ id: tempId, title: newTitle, body: newBody, updatedAt: new Date() }, ...localNotes]);
      await createNote({ title: newTitle, body: newBody });
    }
    setNewTitle('');
    setNewBody('');
    setCreatorExpanded(false);
  };

  const handleTitleChange = (id: string, val: string) => {
    setLocalNotes(prev => prev.map(n => n.id === id ? { ...n, title: val } : n));
  };

  const handleBodyChange = (id: string, val: string) => {
    setLocalNotes(prev => prev.map(n => n.id === id ? { ...n, body: val } : n));
  };

  const handleUpdate = async (id: string, title: string, body: string) => {
    if (id.startsWith('temp-')) return;
    await updateNote(id, { title, body });
  };

  const handleDelete = async (id: string) => {
    setLocalNotes(prev => prev.filter(n => n.id !== id));
    if (!id.startsWith('temp-')) {
      await deleteNote(id);
    }
  };

  const autoGrow = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  return (
    <section>
      <div className="top-row">
        <div>
          <h1 className="page-title">Notepad</h1>
          <div className="page-sub">Quick thoughts, jotted down.</div>
        </div>
      </div>
      
      <div className="note-creator-wrap">
        <div className={`note-creator ${creatorExpanded ? 'expanded' : ''}`} ref={creatorRef}>
          <input 
            type="text" 
            placeholder="Title" 
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <textarea 
            placeholder="Take a note..." 
            value={newBody}
            onChange={e => { setNewBody(e.target.value); autoGrow(e); }}
            onFocus={() => setCreatorExpanded(true)}
            rows={creatorExpanded ? 3 : 1}
          ></textarea>
          <div className="note-creator-actions">
            <button className="btn btn-primary btn-sm" onClick={handleSaveNew}>Close</button>
          </div>
        </div>
      </div>

      <div className="notes-grid">
        {localNotes.map(n => (
          <div className="card note-card" key={n.id}>
            <button className="icon-btn note-del" onClick={() => handleDelete(n.id)}>🗑</button>
            <textarea 
              className="title" 
              placeholder="Title" 
              value={n.title}
              onChange={(e) => { handleTitleChange(n.id, e.target.value); autoGrow(e); }}
              onBlur={() => handleUpdate(n.id, n.title, n.body)}
              rows={1}
            ></textarea>
            <textarea 
              className="body" 
              placeholder="Write a note..." 
              value={n.body}
              onChange={(e) => { handleBodyChange(n.id, e.target.value); autoGrow(e); }}
              onBlur={() => handleUpdate(n.id, n.title, n.body)}
              rows={2}
            ></textarea>
            <div className="note-time">
              {new Date(n.updatedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
