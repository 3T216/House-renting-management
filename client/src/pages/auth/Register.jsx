import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Lock, Mail, User, Phone, CreditCard, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    identityCard: '',
    password: '',
    role: 'TENANT',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', formData);
      login(res.data.token, res.data.user);
      if (res.data.user.role === 'LANDLORD') {
        navigate('/landlord/dashboard');
      } else {
        navigate('/tenant/portal');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký không thành công.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          padding: '36px 32px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <Building2 size={26} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
            Đăng Ký Tài Khoản Mới
          </h2>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
            Tham gia cổng quản lý nhà trọ điện tử tiện lợi
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Họ và tên *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="fullName"
                required
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: '38px' }}
              />
              <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email đăng nhập *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                name="email"
                required
                placeholder="vana@gmail.com"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: '38px' }}
              />
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  name="phone"
                  placeholder="0987..."
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                />
                <Phone size={14} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Số CCCD / CMND</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="identityCard"
                  placeholder="0012..."
                  value={formData.identityCard}
                  onChange={handleChange}
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                />
                <CreditCard size={14} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Vai trò đăng ký</label>
            <select name="role" value={formData.role} onChange={handleChange} className="form-select">
              <option value="TENANT">Khách thuê phòng</option>
              <option value="LANDLORD">Chủ nhà trọ</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                name="password"
                required
                placeholder="Tối thiểu 6 ký tự"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: '38px' }}
              />
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '8px', fontSize: '15px' }}
          >
            {loading ? 'Đang tạo tài khoản...' : 'Hoàn Tất Đăng Ký'} <ArrowRight size={16} />
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#64748b' }}>
          Đã có tài khoản?{' '}
          <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600 }}>
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
