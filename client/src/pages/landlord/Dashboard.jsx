import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  Zap,
  Receipt,
  MessageSquareWarning,
  PieChart as PieIcon,
  TrendingUp,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, revRes] = await Promise.all([
          api.get('/stats/dashboard'),
          api.get('/stats/revenue'),
        ]);
        setStats(dashRes.data);
        setRevenueData(revRes.data);
      } catch (err) {
        console.error('Lỗi tải dữ liệu dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang nạp dữ liệu thống kê...</div>;
  }

  // Cấu hình Biểu đồ Cột Doanh Thu
  const barChartData = {
    labels: revenueData.map((d) => d.label),
    datasets: [
      {
        label: 'Tiền Phòng (VNĐ)',
        data: revenueData.map((d) => d.roomRevenue),
        backgroundColor: '#4f46e5',
        borderRadius: 6,
      },
      {
        label: 'Điện, Nước & Dịch Vụ (VNĐ)',
        data: revenueData.map((d) => d.utilityRevenue),
        backgroundColor: '#0ea5e9',
        borderRadius: 6,
      },
    ],
  };

  // Cấu hình Biểu đồ Tròn Trạng Thái Phòng
  const doughnutData = {
    labels: ['Đang thuê', 'Còn trống', 'Bảo trì'],
    datasets: [
      {
        data: [
          stats?.rooms?.rented || 0,
          stats?.rooms?.vacant || 0,
          stats?.rooms?.maintenance || 0,
        ],
        backgroundColor: ['#ef4444', '#10b981', '#f59e0b'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Hàng thẻ KPI Metrics */}
      <div className="grid-cols-4">
        {/* Card 1: Tỷ lệ lấp đầy */}
        <div className="stat-card">
          <div>
            <span className="stat-label">Tỷ lệ lấp đầy</span>
            <div className="stat-value" style={{ color: '#4f46e5' }}>
              {stats?.rooms?.occupancyRate}%
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
              {stats?.rooms?.rented} / {stats?.rooms?.total} phòng đang thuê
            </p>
          </div>
          <div className="stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <Home size={24} />
          </div>
        </div>

        {/* Card 2: Tiền thu tháng này */}
        <div className="stat-card">
          <div>
            <span className="stat-label">Đã thu tháng {stats?.finance?.currentMonth}</span>
            <div className="stat-value" style={{ color: '#10b981' }}>
              {Number(stats?.finance?.totalCollectedThisMonth).toLocaleString('vi-VN')} đ
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
              Mục tiêu: {Number(stats?.finance?.totalInvoicedThisMonth).toLocaleString('vi-VN')} đ
            </p>
          </div>
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
            <DollarSign size={24} />
          </div>
        </div>

        {/* Card 3: Nợ chưa thanh toán */}
        <div className="stat-card">
          <div>
            <span className="stat-label">Tổng nợ tồn đọng</span>
            <div className="stat-value" style={{ color: '#ef4444' }}>
              {Number(stats?.finance?.totalOutstandingDebt).toLocaleString('vi-VN')} đ
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
              Bao gồm chưa nộp & quá hạn
            </p>
          </div>
          <div className="stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <AlertTriangle size={24} />
          </div>
        </div>

        {/* Card 4: Cảnh báo cần duyệt */}
        <div className="stat-card">
          <div>
            <span className="stat-label">Việc cần xử lý ngay</span>
            <div className="stat-value" style={{ color: '#f59e0b' }}>
              {(stats?.alerts?.pendingApprovalsCount || 0) + (stats?.alerts?.pendingFeedbacksCount || 0)}
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
              {stats?.alerts?.pendingApprovalsCount} bill chờ duyệt, {stats?.alerts?.pendingFeedbacksCount} phản ánh
            </p>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      {/* Hàng biểu đồ */}
      <div className="grid-cols-3">
        {/* Cột 1 & 2: Biểu đồ doanh thu (chiếm 2 phần) */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h2 className="card-title">
              <TrendingUp size={20} color="#4f46e5" /> Doanh Thu Hàng Tháng
            </h2>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Đơn vị: VNĐ</span>
          </div>
          <div style={{ height: '320px' }}>
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { stacked: true, grid: { display: false } },
                  y: { stacked: true, grid: { color: '#f1f5f9' } },
                },
                plugins: {
                  legend: { position: 'top', labels: { boxWidth: 12 } },
                },
              }}
            />
          </div>
        </div>

        {/* Cột 3: Tỷ lệ phòng */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <PieIcon size={20} color="#0ea5e9" /> Hiện Trạng Phòng Trọ
            </h2>
          </div>
          <div style={{ height: '240px', position: 'relative' }}>
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { boxWidth: 12 } },
                },
                cutout: '70%',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px', textAlign: 'center' }}>
            <div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#ef4444' }}>{stats?.rooms?.rented}</span>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Đã thuê</p>
            </div>
            <div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>{stats?.rooms?.vacant}</span>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Trống</p>
            </div>
            <div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#f59e0b' }}>{stats?.rooms?.maintenance}</span>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Sửa chữa</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lối tắt tác vụ nhanh */}
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '16px' }}>Thao Tác Nhanh Thường Dùng</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <Link to="/landlord/utilities" className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '14px' }}>
            <Zap size={20} color="#f59e0b" />
            <div style={{ textAlign: 'left' }}>
              <strong>Nhập điện nước cuối tháng</strong>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Ghi số điện & nước các phòng</div>
            </div>
          </Link>

          <Link to="/landlord/invoices" className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '14px' }}>
            <Receipt size={20} color="#4f46e5" />
            <div style={{ textAlign: 'left' }}>
              <strong>Phát hành hóa đơn</strong>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Tự động tính tiền & gửi QR</div>
            </div>
          </Link>

          <Link to="/landlord/rooms" className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '14px' }}>
            <Home size={20} color="#10b981" />
            <div style={{ textAlign: 'left' }}>
              <strong>Sơ đồ & Thêm phòng mới</strong>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Quản lý hiện trạng & tiện ích</div>
            </div>
          </Link>

          <Link to="/landlord/feedbacks" className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '14px' }}>
            <MessageSquareWarning size={20} color="#ef4444" />
            <div style={{ textAlign: 'left' }}>
              <strong>Hộp thư sự cố / báo hỏng</strong>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Xem và phản hồi khiếu nại</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
