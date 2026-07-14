'use client';

import { useState, useEffect } from 'react';
import TaskModal from './TaskModal';
import { updateTask, deleteTask } from '@/app/actions';

type Task = {
  id: string;
  title: string;
  category: string;
  deadline: Date | null;
  priority: string;
  note: string | null;
  done: boolean;
};

export default function TasksClient({ tasks }: { tasks: Task[] }) {
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);

  const filters = [
    {key:'all', label:'All'},
    {key:'academic', label:'Academic'},
    {key:'nonacademic', label:'Non-academic'},
    {key:'overdue', label:'Overdue'},
    {key:'done', label:'Completed'},
  ];

  const now = new Date();

  const isSoonOrOverdue = (deadline: Date | null) => {
    if (!deadline) return false;
    const diff = new Date(deadline).getTime() - now.getTime();
    return diff < 24*60*60*1000;
  };

  let list = [...tasks];
  if(filter === 'academic') list = list.filter(t => t.category === 'academic');
  else if(filter === 'nonacademic') list = list.filter(t => t.category === 'nonacademic');
  else if(filter === 'overdue') list = list.filter(t => !t.done && t.deadline && new Date(t.deadline).getTime() < now.getTime());
  else if(filter === 'done') list = list.filter(t => t.done);

  list.sort((a,b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const dateA = a.deadline ? new Date(a.deadline).getTime() : 9999999999999;
    const dateB = b.deadline ? new Date(b.deadline).getTime() : 9999999999999;
    return dateA - dateB;
  });

  const handleToggle = async (id: string, done: boolean) => {
    await updateTask(id, { done: !done });
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  return (
    <section>
      <div className="top-row">
        <div>
          <h1 className="page-title">Tasks</h1>
          <div className="page-sub">Academic and non-academic work, with deadlines.</div>
        </div>
        <button className="btn btn-primary" onClick={handleNew}>+ New task</button>
      </div>
      
      <div className="filters">
        {filters.map(f => (
          <button 
            key={f.key} 
            className={`chip ${filter === f.key ? 'active' : ''}`} 
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
      
      <div className="card">
        {list.length === 0 ? (
          <div className="empty-state"><div className="big">📋</div>No tasks here yet.</div>
        ) : (
          <div>
            {list.map(t => {
              const overdue = !t.done && t.deadline && new Date(t.deadline).getTime() < now.getTime();
              let badgeClass='', badgeText='No deadline';
              if (t.deadline) {
                const d = new Date(t.deadline);
                badgeText = d.toLocaleDateString(undefined, {month:'short',day:'numeric'}) + ' · ' + d.toLocaleTimeString(undefined, {hour:'2-digit',minute:'2-digit'});
                if (overdue) badgeClass='over'; 
                else if (isSoonOrOverdue(t.deadline)) badgeClass='soon';
              }

              return (
                <div className="task-row" key={t.id}>
                  <button className={`task-check ${t.done ? 'done' : ''}`} onClick={() => handleToggle(t.id, t.done)}></button>
                  <div className="task-body">
                    <div className={`task-title ${t.done ? 'done' : ''}`}>
                      {t.title}
                      <span className={`rail-tag ${t.category === 'academic' ? 'tag-academic' : 'tag-nonacademic'}`}>
                        {t.category === 'academic' ? 'Academic' : 'Non-academic'}
                      </span>
                    </div>
                    <div className="task-meta">
                      <span className={`due-badge ${badgeClass}`}>{mounted ? badgeText : ''}</span>
                      <span>Priority: {t.priority}</span>
                    </div>
                    {t.note && <div className="task-note">{t.note}</div>}
                  </div>
                  <div className="task-actions">
                    <button className="icon-btn" onClick={() => handleEdit(t)}>✎</button>
                    <button className="icon-btn" onClick={() => deleteTask(t.id)}>🗑</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        task={editingTask} 
      />
    </section>
  );
}
