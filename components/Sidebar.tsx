'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Today', href: '/', icon: '◆' },
    { name: 'Tasks', href: '/tasks', icon: '☑' },
    { name: 'Calendar', href: '/calendar', icon: '▦' },
    { name: 'Notes', href: '/notes', icon: '✎' },
    { name: 'Salah', href: '/salah', icon: '☾' },
  ];

  return (
    <div className="sidebar">
      <div className="brand">
        <div className="brand-mark">ﺭ</div>
        <div>
          <div className="brand-name">Rihla</div>
          <div className="brand-sub">Daily Journey</div>
        </div>
      </div>
      
      {links.map((link) => (
        <Link 
          key={link.name} 
          href={link.href} 
          className={`nav-btn ${pathname === link.href ? 'active' : ''}`}
        >
          <span className="nav-ic">{link.icon}</span> {link.name}
        </Link>
      ))}
      
      <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
        <button 
          className="nav-btn" 
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
        >
          <span className="nav-ic">⎋</span> Sign Out
        </button>
      </div>

      <div className="sidebar-foot" style={{ marginTop: '16px' }}>
        Everything here stays saved automatically to your database, only visible to you.
      </div>
    </div>
  );
}
