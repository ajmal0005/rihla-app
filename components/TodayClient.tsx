'use client';

import { useState, useEffect } from 'react';
import TaskModal from './TaskModal';

type Task = {
  id: string;
  title: string;
  category: string;
  deadline: Date | null;
  priority: string;
  note: string | null;
  done: boolean;
  createdAt: Date;
};

type SalahLog = {
  id: string;
  date: string;
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
};

const SALAH_NAMES = [
  {key:'fajr', label:'Fajr', ar:'الفجر', nominal:'05:00'},
  {key:'dhuhr', label:'Dhuhr', ar:'الظهر', nominal:'13:15'},
  {key:'asr', label:'Asr', ar:'العصر', nominal:'16:30'},
  {key:'maghrib', label:'Maghrib', ar:'المغرب', nominal:'19:00'},
  {key:'isha', label:'Isha', ar:'العشاء', nominal:'20:30'},
] as const;

export default function TodayClient({ tasks, salahLogs, calendarNotes = [] }: { tasks: Task[], salahLogs: SalahLog[], calendarNotes?: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = () => {
    const d = new Date();
    // adjust for timezone to get local YYYY-MM-DD
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0,10);
  };

  const isSoonOrOverdue = (deadline: Date | null) => {
    if (!deadline) return false;
    const diff = new Date(deadline).getTime() - now.getTime();
    return diff < 24*60*60*1000;
  };

  const hr = now.getHours();
  const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';

  const soonTasks = tasks.filter(t => !t.done && t.deadline && isSoonOrOverdue(t.deadline));
  const todayTasks = tasks.filter(t => t.deadline && new Date(t.deadline).toISOString().slice(0,10) === todayStr());
  const doneToday = todayTasks.filter(t => t.done).length;
  const overdueTasks = tasks.filter(t => !t.done && t.deadline && new Date(t.deadline).getTime() < now.getTime());
  
  const logToday = salahLogs.find(l => l.date === todayStr()) || null;
  const prayedToday = SALAH_NAMES.filter(s => logToday && logToday[s.key]).length;
  
  const todayNote = calendarNotes.find(n => n.date === todayStr());

  const railItems: any[] = [];
  todayTasks.forEach(t => {
    let timeStr = '23:59';
    if (t.deadline) {
      const d = new Date(t.deadline);
      timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    railItems.push({ type: 'task', time: timeStr, data: t });
  });

  SALAH_NAMES.forEach(s => {
    railItems.push({ type: 'prayer', time: s.nominal, data: s });
  });

  railItems.sort((a, b) => a.time.localeCompare(b.time));

  return (
    <section>
      <div className="top-row">
        <div>
          <div className="hijri-date">{mounted ? now.toLocaleDateString(undefined, {weekday:'long', year:'numeric', month:'long', day:'numeric'}) : ''}</div>
          <h1 className="page-title">{greeting}</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Quick add task</button>
      </div>

      {soonTasks.length > 0 && (
        <div className="banner" style={{marginBottom: '22px'}}>
          <span>⏰ {soonTasks.length} task{soonTasks.length > 1 ? 's' : ''} due within 24 hours or overdue — check the day rail below.</span>
        </div>
      )}

      <div className="stat-grid">
        <div className="card stat"><div className="stat-num">{todayTasks.length}</div><div className="stat-label">Due today</div></div>
        <div className="card stat"><div className="stat-num">{doneToday}</div><div className="stat-label">Completed today</div></div>
        <div className="card stat">
          <div className="stat-num" style={overdueTasks.length > 0 ? {color:'var(--danger)'} : {}}>{overdueTasks.length}</div>
          <div className="stat-label">Overdue</div>
        </div>
        <div className="card stat"><div className="stat-num">{prayedToday}/5</div><div className="stat-label">Prayers today</div></div>
      </div>

      <div className="section-head"><h2>Day rail</h2></div>
      <div className="card pad">
        <div className="rail">
          {railItems.length === 0 ? (
            <div className="rail-empty">Nothing scheduled — enjoy the quiet, or add a task.</div>
          ) : (
            railItems.map((item, idx) => {
              if (item.type === 'prayer') {
                const key = item.data.key as keyof SalahLog;
                const done = logToday ? logToday[key] : false;
                return (
                  <div className="rail-item" key={idx}>
                    <div className={`rail-dot prayer ${done ? 'done' : ''}`}></div>
                    <div className="rail-time">{item.time} · approx.</div>
                    <div className={`rail-title ${done ? 'done' : ''}`}>
                      {item.data.label} <span className="rail-tag tag-prayer">{item.data.ar}</span>
                    </div>
                  </div>
                );
              } else {
                const t = item.data as Task;
                const overdueFlag = !t.done && t.deadline && new Date(t.deadline).getTime() < now.getTime();
                return (
                  <div className="rail-item" key={idx}>
                    <div className={`rail-dot ${t.done ? 'done' : overdueFlag ? 'overdue' : ''}`}></div>
                    <div className="rail-time">{item.time}</div>
                    <div className={`rail-title ${t.done ? 'done' : ''}`}>
                      {t.title}
                      <span className={`rail-tag ${t.category === 'academic' ? 'tag-academic' : 'tag-nonacademic'}`}>
                        {t.category === 'academic' ? 'Academic' : 'Non-academic'}
                      </span>
                    </div>
                  </div>
                );
              }
            })
          )}
        </div>
        
        {todayNote && todayNote.body.trim() && (
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px' }}>Today's Calendar Note</div>
            <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
              {todayNote.body}
            </div>
          </div>
        )}
      </div>

      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
