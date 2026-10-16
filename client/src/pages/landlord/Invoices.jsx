import React, { useState, useEffect } from 'react';
import { Plus, Receipt, CheckCircle, Eye, AlertCircle, Clock, ExternalLink, X } from 'lucide-react';
import api from '../../services/api';
import VietQrModal from '../../components/VietQrModal';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewProofModal, setViewProofModal] = useState(null);

  const [formData, setFormData] = useState({
    roomId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    otherCharge: 0,
    dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
  });

  const fetchData = async () => {
    try {
      const [invRes, roomRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/rooms'),
      ]);
      setInvoices(invRes.data);
      setRooms(roomRes.data.filter((r) => r.status === 'RENTED'));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/invoices/generate', formData);
      setShowGenerateModal(false);
      fetchData();
      alert('Phát hành hóa đơn thành công! Người thuê đã nhận được thông báo.');
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi tạo hóa đơn.');
    }
  };

  const handleVerifyPayment = async (invoiceId) => {
    if (window.confirm('Xác nhận đã nhận tiền chuyển khoản cho hóa đơn này?')) {
      try {
        await api.put(`/invoices/${invoiceId}/verify-payment`, { paymentMethod: 'QR' });
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Lỗi khi duyệt thanh toán.');
      }
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus === 'ALL') return true;
    return inv.status === filterStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Quản Lý Hóa Đơn & Thu Tiền</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Theo dõi tình trạng thanh toán, duyệt bill chuyển khoản và sinh mã VietQR
          </p>
        </div>
        <button onClick={() => setShowGenerateModal(true)} className="btn btn-primary">
          <Plus size={18} /> Phát Hành Hóa Đơn Mới
        </button>
      </div>

      {/* Tabs lọc */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { id: 'ALL', label: 'Tất cả hóa đơn' },
          { id: 'PENDING_APPROVAL', label: '⏳ Chờ duyệt nộp tiền' },
          { id: 'UNPAID', label: 'Chưa thanh toán' },
          { id: 'PAID', label: 'Đã thanh toán' },
          { id: 'OVERDUE', label: 'Quá hạn' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`btn btn-sm ${filterStatus === tab.id ? 'btn-primary' : 'btn-secondary'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Danh sách hóa đơn */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã phòng</th>
                <th>Khách thuê</th>
                <th>Kỳ tháng</th>
                <th>Chi tiết phân rã</th>
                <th>Tổng thanh toán</th>
                <th>Trạng thái</th>
                <th>Hạn nộp</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    Không tìm thấy hóa đơn nào trong danh mục này.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  let badge = <span className="badge badge-unpaid">Chưa thanh toán</span>;
                  if (inv.status === 'PAID') {
                    badge = <span className="badge badge-paid">Đã thanh toán</span>;
                  } else if (inv.status === 'PENDING_APPROVAL') {
                    badge = <span className="badge badge-pending">Khách đã nộp bill</span>;
                  } else if (inv.status === 'OVERDUE') {
                    badge = <span className="badge badge-overdue">Quá hạn nộp</span>;
                  }

                  return (
                    <tr key={inv.id}>
                      <td>
                        <strong style={{ fontSize: '15px', color: '#4f46e5' }}>{inv.room?.roomCode}</strong>
                      </td>
                      <td>
                        <strong>{inv.contract?.tenant?.fullName || '—'}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{inv.contract?.tenant?.phone}</div>
                      </td>
                      <td>
                        <strong>Tháng {inv.month}/{inv.year}</strong>
                      </td>
                      <td style={{ fontSize: '12px', color: '#475569' }}>
                        <div>Phòng: {Number(inv.roomCharge).toLocaleString('vi-VN')} đ</div>
                        <div>Điện: {Number(inv.electricityCharge).toLocaleString('vi-VN')} đ • Nước: {Number(inv.waterCharge).toLocaleString('vi-VN')} đ</div>
                      </td>
                      <td>
                        <strong style={{ fontSize: '16px', color: '#0f172a' }}>
                          {Number(inv.totalAmount).toLocaleString('vi-VN')} đ
                        </strong>
                      </td>
                      <td>{badge}</td>
                      <td style={{ fontSize: '12px', color: '#64748b' }}>
                        {new Date(inv.dueDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {/* Nút xem chi tiết & VietQR */}
                          <button
                            onClick={async () => {
                              const res = await api.get(`/invoices/${inv.id}`);
                              setSelectedInvoice(res.data);
                            }}
                            className="btn btn-outline btn-sm"
                            title="Xem chi tiết & mã VietQR"
                          >
                            <Eye size={14} /> Chi tiết
                          </button>

                          {/* Nút xem ảnh biên lai nếu có */}
                          {inv.paymentProofUrl && (
                            <button
                              onClick={() => setViewProofModal(inv.paymentProofUrl)}
                              className="btn btn-secondary btn-sm"
                              title="Xem ảnh chụp giao dịch ngân hàng"
                              style={{ color: '#0ea5e9' }}
                            >
                              Ảnh Bill
                            </button>
                          )}

                          {/* Nút duyệt bill */}
                          {inv.status === 'PENDING_APPROVAL' && (
                            <button
                              onClick={() => handleVerifyPayment(inv.id)}
                              className="btn btn-success btn-sm"
                              title="Duyệt hóa đơn này đã nộp đủ tiền"
                            >
                              <CheckCircle size={14} /> Duyệt nộp
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Phát Hành Hóa Đơn */}
      {showGenerateModal && (
        <div className="modal-overlay" onClick={() => setShowGenerateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Phát Hành Hóa Đơn Tiền Nhà</h2>
              <button onClick={() => setShowGenerateModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label className="form-label">Chọn phòng đang thuê *</label>
                <select
                  required
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  className="form-select"
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Phòng {r.roomCode} (Tầng {r.floor})
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  * Lưu ý: Cần ghi chỉ số điện nước của tháng này trước khi lập hóa đơn.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Tháng *</label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                    className="form-select"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>Tháng {m}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Năm *</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Phí phát sinh khác (nếu có)</label>
                  <input
                    type="number"
                    value={formData.otherCharge}
                    onChange={(e) => setFormData({ ...formData, otherCharge: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hạn chót thanh toán *</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#475569', marginBottom: '16px' }}>
                Đơn giá áp dụng: Điện 3.500đ/kWh • Nước 25.000đ/m³ • Internet 100.000đ • Rác 30.000đ. Hệ thống sẽ tự động nhân số tiêu thụ và cộng tiền phòng.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowGenerateModal(false)} className="btn btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Tính Toán & Phát Hành
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết VietQR */}
      {selectedInvoice && (
        <VietQrModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onPaymentSubmitted={fetchData}
        />
      )}

      {/* Modal xem ảnh bill */}
      {viewProofModal && (
        <div className="modal-overlay" onClick={() => setViewProofModal(null)}>
          <div className="modal-content" style={{ maxWidth: '520px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Ảnh Chụp Ủy Nhiệm Chi / Biên Lai</h3>
            <img
              src={viewProofModal}
              alt="Payment Proof"
              style={{ width: '100%', maxHeight: '450px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            />
            <button onClick={() => setViewProofModal(null)} className="btn btn-secondary" style={{ marginTop: '16px', width: '100%' }}>
              Đóng lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
