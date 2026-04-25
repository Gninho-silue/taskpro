import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Bell,
  ChevronLeft,
  LogOut,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/tasks', icon: CheckSquare, label: 'My Tasks' },
  { to: '/teams', icon: Users, label: 'Teams' },
  { to: '/notifications', icon: Bell, label: 'Notifications', badge: true },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fullName = user ? `${user.firstname} ${user.lastname}` : '';

  return (
    <aside
      className="flex flex-col flex-shrink-0 border-r border-[#1e1e3a]"
      style={{
        width: collapsed ? 64 : 220,
        background: '#0c0c1d',
        transition: 'width 0.22s ease',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 border-b border-[#1e1e3a]"
        style={{ padding: '18px 14px', minHeight: 60 }}
      >
        <div
          className="flex items-center justify-center rounded-[10px] flex-shrink-0 text-white font-extrabold"
          style={{
            width: 32,
            height: 32,
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            fontSize: 16,
          }}
        >
          T
        </div>
        {!collapsed && (
          <span className="text-[#e8e8f0] font-extrabold text-[16px] whitespace-nowrap">TaskPro</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 mx-2 my-0.5 rounded-[8px] transition-all relative',
                collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5',
                isActive
                  ? 'bg-[rgba(124,58,237,0.18)] text-[#a78bfa]'
                  : 'text-[#6b6b8a] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#a78bfa]',
              ].join(' ')
            }
          >
            <Icon size={17} className="flex-shrink-0" />
            {!collapsed && (
              <span className="text-[13px] font-medium whitespace-nowrap flex-1">{label}</span>
            )}
            {badge && unreadCount > 0 && !collapsed && (
              <span
                className="text-[10px] font-bold text-white rounded-full px-1.5 py-0.5"
                style={{ background: '#7c3aed', minWidth: 18, textAlign: 'center' }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
            {badge && unreadCount > 0 && collapsed && (
              <span
                className="absolute top-1 right-1 rounded-full"
                style={{ width: 7, height: 7, background: '#ef4444' }}
              />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-[#1e1e3a] p-3">
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 mb-2">
            <Avatar name={fullName} size={28} />
            <div className="overflow-hidden">
              <div className="text-[12px] font-semibold text-[#e8e8f0] truncate">{fullName}</div>
              <div className="text-[10px] text-[#6b6b8a] truncate">{user.email}</div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={[
            'flex items-center gap-2 w-full rounded-[8px] px-3 py-2 text-[12px] text-[#6b6b8a]',
            'hover:bg-[rgba(239,68,68,0.1)] hover:text-[#ef4444] transition-all',
            collapsed ? 'justify-center' : '',
          ].join(' ')}
        >
          <LogOut size={15} />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={[
            'flex items-center gap-2 w-full rounded-[8px] px-3 py-2 text-[12px] text-[#6b6b8a]',
            'hover:bg-[rgba(255,255,255,0.04)] hover:text-[#e8e8f0] transition-all mt-1',
            collapsed ? 'justify-center' : '',
          ].join(' ')}
        >
          <ChevronLeft
            size={15}
            style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.22s ease' }}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
