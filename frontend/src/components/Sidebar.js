'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Calendar, CalendarCheck, Clock } from 'lucide-react';

const navLinks = [
  { href: '/event-types', label: 'Event Types', icon: Calendar },
  { href: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/availability', label: 'Availability', icon: Clock },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <Calendar size={24} />
        <span>Scaler</span>
      </div>

      <nav className="sidebar-nav">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`sidebar-link${pathname.startsWith(href) ? ' active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">JD</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">John Doe</div>
            <div className="sidebar-user-email">john@example.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}
