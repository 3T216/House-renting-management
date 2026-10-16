import React, { useState, useEffect } from 'react';
import { Plus, FileText, CheckCircle2, XCircle, AlertCircle, Calendar, User, DollarSign, X } from 'lucide-react';
import api from '../../services/api';

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    roomId: '',
    tenantId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    depositAmount: 3500000,
    monthlyRent: 3500000,
  });

  const fetchData = async () => {
    try {
      const [cRes, rRes] = await Promise.all([
        api.get('/contracts'),
        api.get('/rooms?status=VACANT'),
      ]);
      setContracts(cRes.data);
      setRooms(rRes.data);

      // Lấy danh sách người thuê bằng cách trích từ contracts hoặc profile
      // Lấy danh sách tenant từ contracts hoặc fetch
      const uniqueTenants = [];
      const seen = new Set();
      cRes.data.forEach((c) => {
        if (c.tenant && !seen.has(c.tenant.id)) {
          seen.add(c.tenant.id);
          uniqueTenants.push(c.tenant);
        }
      });
      setTenants(uniqueTenants);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoomChange = (e) => {
    const roomId = e.target.value;
    const selected = rooms.find((r) => r.id === parseInt(roomId));
    setFormData({
      ...formData,
      roomId,
      depositAmount: selected ? selected.basePrice : formData.depositAmount,
      monthlyRent: selected ? selected.basePrice : formData.monthlyRent,
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/contracts', formData);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi tạo hợp đồng.');
    }
  };

  const handleTerminate = async (id, roomCode) => {
    if (window.confirm(`Bạn có chắc chắn muốn thanh lý và kết thúc hợp đồng thuê của phòng ${roomCode}?`)) {
      try {
        await api.put(`/contracts/${id}/terminate`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Lỗi khi kết thúc hợp đồng.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Quản Lý Hợp Đồng Thuê</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Theo dõi thời hạn thuê phòng, tiền đặt cọc và thanh lý hợp đồng
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} /> Lập Hợp Đồng Mới
        </button>
      </div>

      {/* Bảng danh sách hợp đồng */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã phòng</th>
                <th>Người thuê</th>
                <th>Số điện thoại</th>
                <th>Thời hạn hợp đồng</th>
                <th>Tiền cọc</th>
                <th>Giá thuê/tháng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    Chưa có hợp đồng nào.
                  </td>
                </tr>
              ) : (
                contracts.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong style={{ fontSize: '15px', color: '#4f46e5' }}>{c.room?.roomCode}</strong>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Tầng {c.room?.floor}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={c.tenant?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${c.tenant?.fullName}`}
                          alt=""
                          className="avatar"
                          style={{ width: '28px', height: '28px' }}
                        />
                        <strong>{c.tenant?.fullName}</strong>
                      </div>
                    </td>
                    <td>{c.tenant?.phone || '—'}</td>
                    <td>
                      <div style={{ fontSize: '12px' }}>
                        <div>{new Date(c.startDate).toLocaleDateString('vi-VN')}</div>
                        <span style={{ color: '#94a3b8' }}>đến</span>{' '}
                        <div>{new Date(c.endDate).toLocaleDateString('vi-VN')}</div>
                      </div>
                    </td>
                    <td>
                      <strong>{Number(c.depositAmount).toLocaleString('vi-VN')} đ</strong>
                    </td>
                    <td>
                      <strong style={{ color: '#059669' }}>{Number(c.monthlyRent).toLocaleString('vi-VN')} đ</strong>
                    </td>
                    <td>
                      {c.status === 'ACTIVE' ? (
                        <span className="badge badge-vacant">Hiệu lực</span>
                      ) : (
                        <span className="badge badge-rented">Đã kết thúc</span>
                      )}
                    </td>
                    <td>
                      {c.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleTerminate(c.id, c.room?.roomCode)}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#ef4444', borderColor: '#fecaca', fontSize: '12px' }}
                        >
                          Trả phòng
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Lập Hợp Đồng Mới */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Lập Hợp Đồng Thuê Phòng Mới</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Chọn phòng còn trống *</label>
                <select
                  required
                  value={formData.roomId}
                  onChange={handleRoomChange}
                  className="form-select"
                >
                  <option value="">-- Chọn phòng trống --</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Phòng {r.roomCode} (Tầng {r.floor} - {Number(r.basePrice).toLocaleString('vi-VN')} đ/tháng)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Chọn khách thuê *</label>
                <select
                  required
                  value={formData.tenantId}
                  onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                  className="form-select"
                >
                  <option value="">-- Chọn khách thuê --</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.phone || t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Ngày bắt đầu thuê *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày kết thúc hợp đồng *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Tiền đặt cọc (VNĐ) *</label>
                  <input
                    type="number"
                    step="50000"
                    required
                    value={formData.depositAmount}
                    onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Giá thuê thỏa thuận (VNĐ) *</label>
                  <input
                    type="number"
                    step="50000"
                    required
                    value={formData.monthlyRent}
                    onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Ký Hợp Đồng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
