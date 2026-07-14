'use client';

import { useState, useEffect } from 'react';
import { createTask, updateTask } from '@/app/actions';

type Task = {
  id?: string;
  title: string;
  category: string;
  deadline: Date | null;
  priority: string;
  note: string | null;
};

export default function TaskModal({ 
  isOpen, 
  onClose, 
  task 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  task?: Task | null;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('academic');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('medium');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (task && isOpen) {
      setTitle(task.title);
      setCategory(task.category);
      // Format deadline for datetime-local input
      if (task.deadline) {
        const d = new Date(task.deadline);
        // subtract timezone offset
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        setDeadline(d.toISOString().slice(0, 16));
      } else {
        setDeadline('');
      }
      setPriority(task.priority);
      setNote(task.note || '');
    } else if (isOpen) {
      setTitle('');
      setCategory('academic');
      setDeadline('');
      setPriority('medium');
      setNote('');
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Give the task a title');
      return;
    }
    
    const deadlineDate = deadline ? new Date(deadline) : null;
    
    if (task && task.id) {
      await updateTask(task.id, {
        title,
        category,
        deadline: deadlineDate,
        priority,
        note
      });
    } else {
      await createTask({
        title,
        category,
        deadline: deadlineDate,
        priority,
        note
      });
    }
    onClose();
  };

  return (
    <div className="overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <h3>{task ? 'Edit task' : 'New task'}</h3>
        
        <div className="field">
          <label>Title</label>
          <input 
            type="text" 
            placeholder="e.g. Submit physics assignment" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div className="field">
          <label>Category</label>
          <div className="seg">
            <button 
              type="button" 
              className={category === 'academic' ? 'sel' : ''} 
              onClick={() => setCategory('academic')}
            >Academic</button>
            <button 
              type="button" 
              className={category === 'nonacademic' ? 'sel' : ''} 
              onClick={() => setCategory('nonacademic')}
            >Non-academic</button>
          </div>
        </div>
        
        <div className="field">
          <label>Deadline</label>
          <input 
            type="datetime-local" 
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
        
        <div className="field">
          <label>Priority</label>
          <div className="seg">
            <button type="button" className={priority === 'low' ? 'sel' : ''} onClick={() => setPriority('low')}>Low</button>
            <button type="button" className={priority === 'medium' ? 'sel' : ''} onClick={() => setPriority('medium')}>Medium</button>
            <button type="button" className={priority === 'high' ? 'sel' : ''} onClick={() => setPriority('high')}>High</button>
          </div>
        </div>
        
        <div className="field">
          <label>Note (optional)</label>
          <textarea 
            placeholder="Any extra detail..." 
            value={note}
            onChange={(e) => setNote(e.target.value)}
          ></textarea>
        </div>
        
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save task</button>
        </div>
      </div>
    </div>
  );
}
