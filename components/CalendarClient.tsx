'use client';

import { useState, useEffect, useRef } from 'react';
import { updateTask, upsertCalendarNote } from '@/app/actions';

type Task = {
  id: string;
  title: string;
  category: string;
  deadline: Date | null;
  priority: string;
  note: string | null;
  done: boolean;
};

type CalendarNote = {
  id: string;
  date: string;
  body: string;
};

export default function CalendarClient({ tasks, calendarNotes = [] }: { tasks: Task[], calendarNotes?: CalendarNote[] }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);

  const [calCursor, setCalCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const [calSelected, setCalSelected] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  });
  
  const [noteBody, setNoteBody] = useState('');
  const noteRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const noteForDay = calendarNotes.find(n => n.date === calSelected);
    setNoteBody(noteForDay ? noteForDay.body : '');
  }, [calSelected, calendarNotes]);

  const fmtDate = (d: Date) => {
    const dt = new Date(d);
    dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
    return dt.toISOString().slice(0, 10);
  };

  const todayStr = () => fmtDate(new Date());

  const handlePrev = () => {
    setCalCursor(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNext = () => {
    setCalCursor(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const handleNoteSave = async () => {
    const existing = calendarNotes.find(n => n.date === calSelected)?.body || '';
    if (existing !== noteBody) {
      await upsertCalendarNote(calSelected, noteBody);
    }
  };

  const handleDoubleClick = (ds: string) => {
    setCalSelected(ds);
    setTimeout(() => {
      noteRef.current?.focus();
    }, 50);
  };

  const year = calCursor.getFullYear();
  const month = calCursor.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for(let i=0; i<startOffset; i++) cells.push(null);
  for(let d=1; d<=daysInMonth; d++) cells.push(new Date(year, month, d));

  const dows = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  const dayTasks = tasks.filter(t => t.deadline && new Date(t.deadline).toISOString().slice(0, 10) === calSelected);
  const label = mounted ? new Date(calSelected + 'T00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : '';

  return (
    <section>
      <div className="top-row">
        <div>
          <h1 className="page-title">Calendar</h1>
          <div className="page-sub">Every dot is a deadline waiting on you.</div>
        </div>
      </div>
      
      <div className="card pad">
        <div className="cal-head">
          <button className="btn btn-ghost btn-sm" onClick={handlePrev}>← Prev</button>
          <h3 style={{ margin: 0 }}>
            {mounted ? calCursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : ''}
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={handleNext}>Next →</button>
        </div>
        
        <div className="cal-grid">
          {dows.map(d => <div key={d} className="cal-dow">{d}</div>)}
          
          {cells.map((d, idx) => {
            if (!d) return <div key={idx} className="cal-cell muted"></div>;
            
            const ds = fmtDate(d);
            const isToday = ds === todayStr();
            const isSel = ds === calSelected;
            const dsTasks = tasks.filter(t => t.deadline && new Date(t.deadline).toISOString().slice(0,10) === ds);
            const dots = dsTasks.slice(0, 3).map((t, i) => (
              <span key={i} className="cal-dot" style={{ background: t.category === 'academic' ? 'var(--sage)' : 'var(--clay)' }}></span>
            ));
            const hasNote = calendarNotes.some(n => n.date === ds && n.body.trim().length > 0);
            
            return (
              <div 
                key={idx} 
                className={`cal-cell ${isToday ? 'today' : ''} ${isSel ? 'sel' : ''}`}
                onClick={() => setCalSelected(ds)}
                onDoubleClick={() => handleDoubleClick(ds)}
              >
                {d.getDate()}
                <div className="cal-dots">
                  {dots}
                  {hasNote && <span className="cal-dot" style={{ background: 'var(--gold)', marginLeft: dots.length ? 3 : 0 }}></span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="cal-day-panel">
        <div className="section-head"><h2>{label}</h2></div>
        
        <div className="card pad" style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px' }}>Notes for {label}</div>
          <textarea 
            ref={noteRef}
            placeholder="Double-click a date or click here to add a note..."
            style={{ width: '100%', border: 'none', background: 'transparent', resize: 'none', minHeight: '60px', fontSize: '14px', outline: 'none' }}
            value={noteBody}
            onChange={e => {
              setNoteBody(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          ></textarea>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button className="btn btn-primary btn-sm" onClick={handleNoteSave}>Save Note</button>
          </div>
        </div>

        {dayTasks.length === 0 ? (
          <div className="card pad"><div className="empty-state">No deadlines this day.</div></div>
        ) : (
          <div className="card">
            <div>
              {dayTasks.map(t => (
                <div className="task-row" key={t.id}>
                  <button className={`task-check ${t.done ? 'done' : ''}`} onClick={() => updateTask(t.id, { done: !t.done })}></button>
                  <div className="task-body">
                    <div className={`task-title ${t.done ? 'done' : ''}`}>
                      {t.title}
                      <span className={`rail-tag ${t.category === 'academic' ? 'tag-academic' : 'tag-nonacademic'}`}>
                        {t.category === 'academic' ? 'Academic' : 'Non-academic'}
                      </span>
                    </div>
                    <div className="task-meta">
                      <span className="due-badge">
                        {mounted ? new Date(t.deadline!).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
