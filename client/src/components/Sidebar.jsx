import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  FileText,
  Zap,
  Receipt,
  MessageSquareWarning,
  LogOut,
  Building2,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout, isLandlord } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const landlordLinks = [
    { to: '/landlord/dashboard', label: 'Tổng quan Dashboard', icon: LayoutDashboard },
    { to: '/landlord/rooms', label: 'Sơ đồ phòng', icon: Home },
    { to: '/landlord/contracts', label: 'Hợp đồng thuê', icon: FileText },
    { to: '/landlord/utilities', label: 'Ghi số điện nước', icon: Zap },
    { to: '/landlord/invoices', label: 'Hóa đơn tiền phòng', icon: Receipt },
    { to: '/landlord/feedbacks', label: 'Xử lý phản ánh', icon: MessageSquareWarning },
  ];

  const tenantLinks = [
    { to: '/tenant/portal', label: 'Thông tin phòng tôi', icon: Home },
    { to: '/tenant/invoices', label: 'Hóa đơn & Nộp tiền', icon: Receipt },
    { to: '/tenant/feedbacks', label: 'Gửi phản ánh sự cố', icon: MessageSquareWarning },
  ];

  const links = isLandlord ? landlordLinks : tenantLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Building2 size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
            NhaTro<span style={{ color: '#818cf8' }}>Manager</span>
          </h2>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
            {isLandlord ? 'Kênh Quản Trị' : 'Cổng Khách Thuê'}
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-snippet">
          <img
            src={user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.fullName || 'User'}`}
            alt={user?.fullName}
            className="avatar"
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.fullName}
            </p>
            <p style={{ fontSize: '11px', color: '#94a3b8' }}>
              {isLandlord ? 'Chủ nhà trọ' : 'Khách thuê'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Đăng xuất"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
