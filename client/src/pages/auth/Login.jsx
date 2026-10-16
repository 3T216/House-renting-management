import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      if (res.data.user.role === 'LANDLORD') {
        navigate('/landlord/dashboard');
      } else {
        navigate('/tenant/portal');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập không thành công.');
    } finally {
      setLoading(false);
    }
  };

  const quickDemoLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);
    api.post('/auth/login', { email: demoEmail, password: demoPass })
      .then((res) => {
        login(res.data.token, res.data.user);
        if (res.data.user.role === 'LANDLORD') {
          navigate('/landlord/dashboard');
        } else {
          navigate('/tenant/portal');
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Lỗi đăng nhập demo.');
      })
      .finally(() => setLoading(false));
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
          maxWidth: '440px',
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          padding: '36px 32px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 10px 20px rgba(79, 70, 229, 0.3)',
            }}
          >
            <Building2 size={30} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
            NhaTro Manager
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Quản lý phòng trọ, điện nước & thanh toán thông minh
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        {/* Demo Fast Login Buttons */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
            ⚡ Đăng nhập nhanh tài khoản mẫu:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              onClick={() => quickDemoLogin('admin@gmail.com', 'admin123')}
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '13px' }}
            >
              <ShieldCheck size={18} color="#4f46e5" />
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <strong>Chủ Trọ Quản Lý</strong>
                <div style={{ fontSize: '11px', color: '#64748b' }}>admin@gmail.com</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => quickDemoLogin('hoang.nam@gmail.com', '123456')}
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '13px' }}
            >
              <UserCheck size={18} color="#10b981" />
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <strong>Người Thuê (Phòng P101 - Nam)</strong>
                <div style={{ fontSize: '11px', color: '#64748b' }}>hoang.nam@gmail.com</div>
              </div>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#cbd5e1' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span style={{ padding: '0 10px', fontSize: '12px', color: '#94a3b8' }}>hoặc đăng nhập thủ công</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email tài khoản</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px' }}
              />
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            style={{ width: '100%', padding: '12px', marginTop: '12px', fontSize: '15px' }}
          >
            {loading ? 'Đang xác thực...' : 'Đăng Nhập'} <ArrowRight size={16} />
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#64748b' }}>
          Chưa có tài khoản?{' '}
          <Link to="/register" style={{ color: '#4f46e5', fontWeight: 600 }}>
            Đăng ký người thuê mới
          </Link>
        </p>
      </div>
    </div>
  );
}
