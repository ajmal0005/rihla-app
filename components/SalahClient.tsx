'use client';

import { useState } from 'react';
import { toggleSalah } from '@/app/actions';

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
  {key:'fajr', label:'Fajr', ar:'الفجر'},
  {key:'dhuhr', label:'Dhuhr', ar:'الظهر'},
  {key:'asr', label:'Asr', ar:'العصر'},
  {key:'maghrib', label:'Maghrib', ar:'المغرب'},
  {key:'isha', label:'Isha', ar:'العشاء'},
] as const;

export default function SalahClient({ salahLogs }: { salahLogs: SalahLog[] }) {
  const [calSelected, setCalSelected] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  });

  const fmtDate = (d: Date) => {
    const dt = new Date(d);
    dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
    return dt.toISOString().slice(0, 10);
  };

  const todayStr = () => fmtDate(new Date());

  const calcSalahStreak = () => {
    let streak = 0;
    const d = new Date();
    while(true) {
      const ds = fmtDate(d);
      const log = salahLogs.find(l => l.date === ds);
      const allDone = log && SALAH_NAMES.every(s => log[s.key]);
      if(allDone) { 
        streak++; 
        d.setDate(d.getDate() - 1); 
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calcSalahStreak();
  
  let totalPossible = 0;
  let totalDone = 0;
  
  const last30 = [];
  for(let i=0; i<30; i++) { 
    const d = new Date(); 
    d.setDate(d.getDate() - i); 
    last30.push(fmtDate(d)); 
  }
  
  last30.forEach(ds => { 
    const log = salahLogs.find(l => l.date === ds);
    SALAH_NAMES.forEach(s => { 
      totalPossible++; 
      if(log && log[s.key]) totalDone++; 
    }); 
  });
  
  const pct = totalPossible ? Math.round(100 * totalDone / totalPossible) : 0;
  const logSelected = salahLogs.find(l => l.date === calSelected);
  const prayersThisDay = logSelected ? SALAH_NAMES.filter(s => logSelected[s.key]).length : 0;

  const week = [];
  for(let i=6; i>=0; i--) { 
    const d = new Date(); 
    d.setDate(d.getDate() - i); 
    week.push(d); 
  }

  const handleToggle = async (prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha') => {
    await toggleSalah(calSelected, prayer);
  };

  return (
    <section>
      <div className="top-row">
        <div>
          <h1 className="page-title">Salah Tracker</h1>
          <div className="page-sub">Mark each prayer as you complete it.</div>
        </div>
      </div>
      
      <div className="stat-grid">
        <div className="card stat"><div className="stat-num">{streak}</div><div className="stat-label">Day streak</div></div>
        <div className="card stat"><div className="stat-num">{pct}%</div><div className="stat-label">Last 30 days</div></div>
        <div className="card stat"><div className="stat-num">{prayersThisDay}</div><div className="stat-label">Prayers this day</div></div>
        <div className="card stat"><div className="stat-num">5</div><div className="stat-label">Prayers per day</div></div>
      </div>
      
      <div className="week-strip">
        {week.map(d => {
          const ds = fmtDate(d);
          const log = salahLogs.find(l => l.date === ds);
          return (
            <div 
              key={ds} 
              className={`card day-col ${ds === calSelected ? 'sel' : ''}`} 
              onClick={() => setCalSelected(ds)}
              style={{ cursor: 'pointer', outline: ds === calSelected ? '2px solid var(--gold)' : 'none' }}
            >
              <div className="dname">{d.toLocaleDateString(undefined, {weekday:'short'})}</div>
              <div className="dnum">{d.getDate()}</div>
              {SALAH_NAMES.map(s => (
                <div key={s.key} className={`pray-dot ${log && log[s.key] ? 'done' : ''}`}></div>
              ))}
            </div>
          );
        })}
      </div>
      
      <div className="card pad">
        <h3 style={{ marginTop: 0 }}>
          {calSelected === todayStr() ? "Today" : new Date(calSelected + 'T00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>
        <div className="salah-list">
          {SALAH_NAMES.map(s => (
            <div className="salah-row" key={s.key}>
              <div className="salah-name">{s.label} <span className="salah-arabic">{s.ar}</span></div>
              <button 
                className={`salah-toggle ${logSelected && logSelected[s.key] ? 'on' : ''}`} 
                onClick={() => handleToggle(s.key)}
              ></button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
