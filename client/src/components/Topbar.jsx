import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Topbar({ title = 'Hệ Thống Quản Lý Phòng Trọ' }) {
  const { user, login } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Lỗi lấy thông báo:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  // Nút chuyển đổi nhanh tài khoản thử nghiệm
  const handleQuickSwitch = async (targetEmail, targetPassword) => {
    try {
      const res = await api.post('/auth/login', {
        email: targetEmail,
        password: targetPassword,
      });
      login(res.data.token, res.data.user);
      window.location.href = res.data.user.role === 'LANDLORD' ? '/landlord/dashboard' : '/tenant/portal';
    } catch (err) {
      alert('Không thể chuyển tài khoản demo.');
    }
  };

  return (
    <header className="topbar">
      <div>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>{title}</h1>
        <p style={{ fontSize: '12px', color: '#64748b' }}>
          Hôm nay: {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Nút Demo Switcher */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {user?.role === 'LANDLORD' ? (
            <button
              onClick={() => handleQuickSwitch('hoang.nam@gmail.com', '123456')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Chuyển sang giao diện Người thuê phòng P101"
            >
              <RefreshCw size={14} /> Chuyển sang Khách thuê (P101)
            </button>
          ) : (
            <button
              onClick={() => handleQuickSwitch('admin@gmail.com', 'admin123')}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Chuyển sang giao diện Chủ trọ Quản lý"
            >
              <RefreshCw size={14} /> Chuyển sang Chủ trọ (Admin)
            </button>
          )}
        </div>

        {/* Chuông thông báo */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            style={{
              position: 'relative',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              color: '#334155',
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                marginTop: '10px',
                width: '340px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
                border: '1px solid #e2e8f0',
                zIndex: 100,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Thông báo mới</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{unreadCount} chưa đọc</span>
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <p style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    Không có thông báo nào.
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f8fafc',
                        backgroundColor: n.isRead ? '#ffffff' : '#f0fdf4',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '10px',
                      }}
                    >
                      <div style={{ marginTop: '2px' }}>
                        {n.type === 'BILL' ? (
                          <CheckCircle size={16} color="#10b981" />
                        ) : n.type === 'ALERT' ? (
                          <AlertCircle size={16} color="#ef4444" />
                        ) : (
                          <Info size={16} color="#3b82f6" />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '13px', fontWeight: n.isRead ? 500 : 700, color: '#0f172a' }}>
                          {n.title}
                        </p>
                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{n.content}</p>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                          {new Date(n.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
