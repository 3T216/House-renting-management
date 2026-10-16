import React, { useState, useEffect } from 'react';
import { Home, Receipt, QrCode, AlertCircle, CheckCircle2, Send, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import VietQrModal from '../../components/VietQrModal';

export default function TenantPortal() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form gửi phản ánh
  const [fbTitle, setFbTitle] = useState('');
  const [fbContent, setFbContent] = useState('');
  const [fbCategory, setFbCategory] = useState('REPAIR');
  const [fbSubmitting, setFbSubmitting] = useState(false);
  const [fbSuccess, setFbSuccess] = useState(false);

  const activeContract = user?.contracts?.[0];
  const room = activeContract?.room;

  const fetchData = async () => {
    try {
      const [invRes, fbRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/feedbacks'),
      ]);
      setInvoices(invRes.data);
      setFeedbacks(fbRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!room) {
      alert('Bạn chưa được gán vào hợp đồng phòng nào.');
      return;
    }
    setFbSubmitting(true);
    try {
      await api.post('/feedbacks', {
        roomId: room.id,
        title: fbTitle,
        content: fbContent,
        category: fbCategory,
      });
      setFbTitle('');
      setFbContent('');
      setFbSuccess(true);
      setTimeout(() => setFbSuccess(false), 3000);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi gửi phản ánh.');
    } finally {
      setFbSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang nạp thông tin cá nhân...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Banner chào mừng & Thông tin phòng */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.4)',
        }}
      >
        <div>
          <span style={{ fontSize: '13px', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>
            Cổng Dành Cho Người Thuê
          </span>
          <h2 style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px' }}>
            Xin chào, {user?.fullName}!
          </h2>
          <p style={{ color: '#c7d2fe', fontSize: '14px', marginTop: '4px' }}>
            {room ? (
              <>Bạn đang thuê <strong>Phòng {room.roomCode}</strong> (Tầng {room.floor} - {room.area} m²)</>
            ) : (
              'Bạn chưa có hợp đồng thuê phòng nào đang hoạt động.'
            )}
          </p>
        </div>

        {room && (
          <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '14px 20px', borderRadius: '12px', textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Tiền phòng thỏa thuận:</span>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#38bdf8' }}>
              {Number(activeContract?.monthlyRent).toLocaleString('vi-VN')} đ<span style={{ fontSize: '12px', color: '#cbd5e1' }}>/tháng</span>
            </div>
            <span style={{ fontSize: '11px', color: '#a5b4fc' }}>
              Hợp đồng đến: {new Date(activeContract?.endDate).toLocaleDateString('vi-VN')}
            </span>
          </div>
        )}
      </div>

      {/* Phần 1: Hóa đơn của tôi */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Receipt size={20} color="#4f46e5" /> Hóa Đơn Tiền Nhà Của Bạn
          </h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Hỗ trợ thanh toán nhanh quét mã VietQR</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kỳ tháng</th>
                <th>Tiền phòng</th>
                <th>Điện / Nước / Dịch vụ</th>
                <th>Tổng thanh toán</th>
                <th>Hạn chót</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    Chưa có hóa đơn nào được phát hành cho bạn.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  let badge = <span className="badge badge-unpaid">Chưa thanh toán</span>;
                  if (inv.status === 'PAID') {
                    badge = <span className="badge badge-paid">Đã thanh toán</span>;
                  } else if (inv.status === 'PENDING_APPROVAL') {
                    badge = <span className="badge badge-pending">Đã nộp bill, chờ duyệt</span>;
                  } else if (inv.status === 'OVERDUE') {
                    badge = <span className="badge badge-overdue">Quá hạn</span>;
                  }

                  const isPayable = inv.status === 'UNPAID' || inv.status === 'OVERDUE';

                  return (
                    <tr key={inv.id}>
                      <td><strong>Tháng {inv.month}/{inv.year}</strong></td>
                      <td>{Number(inv.roomCharge).toLocaleString('vi-VN')} đ</td>
                      <td style={{ fontSize: '12px', color: '#64748b' }}>
                        Điện: {Number(inv.electricityCharge).toLocaleString('vi-VN')} đ • Nước: {Number(inv.waterCharge).toLocaleString('vi-VN')} đ
                      </td>
                      <td>
                        <strong style={{ fontSize: '16px', color: '#4f46e5' }}>
                          {Number(inv.totalAmount).toLocaleString('vi-VN')} đ
                        </strong>
                      </td>
                      <td style={{ fontSize: '13px', color: '#64748b' }}>
                        {new Date(inv.dueDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td>{badge}</td>
                      <td>
                        <button
                          onClick={async () => {
                            const res = await api.get(`/invoices/${inv.id}`);
                            setSelectedInvoice(res.data);
                          }}
                          className={`btn btn-sm ${isPayable ? 'btn-primary' : 'btn-outline'}`}
                          style={{ fontSize: '12px' }}
                        >
                          <QrCode size={14} /> {isPayable ? 'Thanh Toán VietQR' : 'Xem Phiếu Thu'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Phần 2: Gửi phản ánh / Báo hỏng thiết bị */}
      <div className="grid-cols-2">
        {/* Cột 1: Form báo sự cố */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>
            <AlertCircle size={20} color="#f59e0b" /> Báo Cáo Sự Cố & Hỏng Hóc
          </h2>

          {fbSuccess && (
            <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} /> Gửi phản ánh thành công! Chủ trọ đã nhận được thông báo.
            </div>
          )}

          <form onSubmit={handleSendFeedback}>
            <div className="form-group">
              <label className="form-label">Loại sự cố / Vấn đề *</label>
              <select
                value={fbCategory}
                onChange={(e) => setFbCategory(e.target.value)}
                className="form-select"
              >
                <option value="REPAIR">Hỏng hóc thiết bị (Điện, Nước, Điều hòa, Bóng đèn)</option>
                <option value="NOISE">Phản ánh tiếng ồn / An ninh</option>
                <option value="HYGIENE">Vệ sinh hành lang / Nhà rác</option>
                <option value="BILLING">Thắc mắc về hóa đơn tiền trọ</option>
                <option value="OTHER">Vấn đề khác</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tiêu đề ngắn gọn *</label>
              <input
                type="text"
                required
                placeholder="VD: Hỏng vòi sen nhà tắm..."
                value={fbTitle}
                onChange={(e) => setFbTitle(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Chi tiết sự cố *</label>
              <textarea
                rows="3"
                required
                placeholder="Mô tả cụ thể để chủ trọ chuẩn bị dụng cụ hoặc hẹn thợ sửa..."
                value={fbContent}
                onChange={(e) => setFbContent(e.target.value)}
                className="form-textarea"
              />
            </div>

            <button type="submit" disabled={fbSubmitting} className="btn btn-primary" style={{ width: '100%' }}>
              <Send size={16} /> {fbSubmitting ? 'Đang gửi...' : 'Gửi Cho Chủ Trọ'}
            </button>
          </form>
        </div>

        {/* Cột 2: Tiến độ xử lý phản ánh của bạn */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>
            <Clock size={20} color="#0ea5e9" /> Lịch Sử Yêu Cầu Của Bạn
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '360px', overflowY: 'auto' }}>
            {feedbacks.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '30px' }}>
                Bạn chưa gửi yêu cầu nào.
              </p>
            ) : (
              feedbacks.map((fb) => (
                <div key={fb.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>{fb.title}</strong>
                    {fb.status === 'RESOLVED' ? (
                      <span className="badge badge-paid">Đã xử lý xong</span>
                    ) : fb.status === 'IN_PROGRESS' ? (
                      <span className="badge badge-pending">Đang sửa chữa</span>
                    ) : (
                      <span className="badge badge-unpaid">Chờ tiếp nhận</span>
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>{fb.content}</p>

                  {fb.landlordReply && (
                    <div style={{ background: '#eef2ff', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', borderLeft: '3px solid #4f46e5' }}>
                      <strong style={{ color: '#4338ca' }}>Chủ trọ phản hồi:</strong>
                      <p style={{ color: '#1e1b4b', marginTop: '2px' }}>{fb.landlordReply}</p>
                    </div>
                  )}

                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '8px' }}>
                    Gửi lúc: {new Date(fb.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal VietQR */}
      {selectedInvoice && (
        <VietQrModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onPaymentSubmitted={fetchData}
        />
      )}
    </div>
  );
}
