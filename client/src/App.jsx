import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Landlord Pages
import Dashboard from './pages/landlord/Dashboard';
import Rooms from './pages/landlord/Rooms';
import Contracts from './pages/landlord/Contracts';
import Utilities from './pages/landlord/Utilities';
import Invoices from './pages/landlord/Invoices';
import Feedbacks from './pages/landlord/Feedbacks';

// Tenant Pages
import TenantPortal from './pages/tenant/TenantPortal';

const ProtectedLayout = ({ children, title }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar title={title} />
        <main className="content-body">{children}</main>
      </div>
    </div>
  );
};

// Route Guard theo vai trò
const RoleRoute = ({ children, role, fallback }) => {
  const { user } = useAuth();
  if (user?.role !== role) {
    return <Navigate to={fallback} replace />;
  }
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to={user.role === 'LANDLORD' ? '/landlord/dashboard' : '/tenant/portal'} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={user.role === 'LANDLORD' ? '/landlord/dashboard' : '/tenant/portal'} replace /> : <Register />} />

      {/* Điều hướng mặc định */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === 'LANDLORD' ? '/landlord/dashboard' : '/tenant/portal'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Landlord Routes */}
      <Route
        path="/landlord/dashboard"
        element={
          <RoleRoute role="LANDLORD" fallback="/tenant/portal">
            <ProtectedLayout title="Tổng Quan Hoạt Động & Doanh Thu">
              <Dashboard />
            </ProtectedLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/landlord/rooms"
        element={
          <RoleRoute role="LANDLORD" fallback="/tenant/portal">
            <ProtectedLayout title="Sơ Đồ & Danh Mục Phòng Trọ">
              <Rooms />
            </ProtectedLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/landlord/contracts"
        element={
          <RoleRoute role="LANDLORD" fallback="/tenant/portal">
            <ProtectedLayout title="Quản Lý Hợp Đồng Thuê">
              <Contracts />
            </ProtectedLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/landlord/utilities"
        element={
          <RoleRoute role="LANDLORD" fallback="/tenant/portal">
            <ProtectedLayout title="Ghi Nhận Chỉ Số Điện Nước">
              <Utilities />
            </ProtectedLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/landlord/invoices"
        element={
          <RoleRoute role="LANDLORD" fallback="/tenant/portal">
            <ProtectedLayout title="Hóa Đơn & Thu Tiền Phòng">
              <Invoices />
            </ProtectedLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/landlord/feedbacks"
        element={
          <RoleRoute role="LANDLORD" fallback="/tenant/portal">
            <ProtectedLayout title="Hộp Thư Tiếp Nhận Sự Cố">
              <Feedbacks />
            </ProtectedLayout>
          </RoleRoute>
        }
      />

      {/* Tenant Routes */}
      <Route
        path="/tenant/portal"
        element={
          <RoleRoute role="TENANT" fallback="/landlord/dashboard">
            <ProtectedLayout title="Cổng Thông Tin Người Thuê">
              <TenantPortal />
            </ProtectedLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/tenant/invoices"
        element={
          <RoleRoute role="TENANT" fallback="/landlord/dashboard">
            <ProtectedLayout title="Hóa Đơn Của Tôi & Quét Mã QR">
              <TenantPortal />
            </ProtectedLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/tenant/feedbacks"
        element={
          <RoleRoute role="TENANT" fallback="/landlord/dashboard">
            <ProtectedLayout title="Báo Cáo Sự Cố & Hỏng Hóc">
              <TenantPortal />
            </ProtectedLayout>
          </RoleRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
