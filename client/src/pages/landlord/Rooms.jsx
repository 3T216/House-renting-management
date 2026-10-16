import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User, Users, CheckCircle, AlertCircle, Wrench, X } from 'lucide-react';
import api from '../../services/api';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterFloor, setFilterFloor] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomCode: '',
    floor: 1,
    area: 25,
    basePrice: 3500000,
    status: 'VACANT',
    maxOccupants: 2,
    description: '',
    amenities: 'Điều hòa, Nóng lạnh, Wifi',
  });

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openAddModal = () => {
    setEditingRoom(null);
    setFormData({
      roomCode: '',
      floor: 1,
      area: 25,
      basePrice: 3500000,
      status: 'VACANT',
      maxOccupants: 2,
      description: '',
      amenities: 'Điều hòa, Nóng lạnh, Wifi',
    });
    setShowModal(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setFormData({
      roomCode: room.roomCode,
      floor: room.floor,
      area: room.area,
      basePrice: room.basePrice,
      status: room.status,
      maxOccupants: room.maxOccupants,
      description: room.description || '',
      amenities: room.amenities || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom.id}`, formData);
      } else {
        await api.post('/rooms', formData);
      }
      setShowModal(false);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra.');
    }
  };

  const handleDelete = async (id, code) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa phòng ${code}?`)) {
      try {
        await api.delete(`/rooms/${id}`);
        fetchRooms();
      } catch (err) {
        alert(err.response?.data?.message || 'Không thể xóa phòng này.');
      }
    }
  };

  const filteredRooms = rooms.filter((r) => {
    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchFloor = filterFloor === 'ALL' || r.floor === parseInt(filterFloor);
    return matchStatus && matchFloor;
  });

  const floors = [...new Set(rooms.map((r) => r.floor))].sort((a, b) => a - b);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Thanh công cụ & Bộ lọc */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Lọc trạng thái */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'VACANT', label: 'Còn trống' },
              { id: 'RENTED', label: 'Đang thuê' },
              { id: 'MAINTENANCE', label: 'Bảo trì' },
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

          {/* Lọc tầng */}
          <select
            value={filterFloor}
            onChange={(e) => setFilterFloor(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
          >
            <option value="ALL">Tất cả các tầng</option>
            {floors.map((f) => (
              <option key={f} value={f}>
                Tầng {f}
              </option>
            ))}
          </select>
        </div>

        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={18} /> Thêm Phòng Mới
        </button>
      </div>

      {/* Grid danh sách phòng */}
      <div className="grid-cols-3">
        {filteredRooms.map((room) => {
          const activeContract = room.contracts?.[0];
          const tenant = activeContract?.tenant;

          let badgeClass = 'badge-vacant';
          let badgeText = 'Còn trống';
          if (room.status === 'RENTED') {
            badgeClass = 'badge-rented';
            badgeText = 'Đang cho thuê';
          } else if (room.status === 'MAINTENANCE') {
            badgeClass = 'badge-maintenance';
            badgeText = 'Đang sửa chữa';
          }

          return (
            <div key={room.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{room.roomCode}</h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Tầng {room.floor} • {room.area} m²</span>
                  </div>
                  <span className={`badge ${badgeClass}`}>{badgeText}</span>
                </div>

                <div style={{ margin: '14px 0', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>Giá thuê niêm yết:</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#4f46e5' }}>
                    {Number(room.basePrice).toLocaleString('vi-VN')} đ<span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>/tháng</span>
                  </div>
                </div>

                {/* Thông tin khách thuê nếu có */}
                {tenant ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: '#eef2ff', borderRadius: '6px', marginBottom: '12px', fontSize: '13px' }}>
                    <User size={16} color="#4f46e5" />
                    <div>
                      <strong>{tenant.fullName}</strong>
                      <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>{tenant.phone}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '12px' }}>
                    {room.status === 'MAINTENANCE' ? 'Đang tiến hành bảo trì' : 'Chưa có người thuê'}
                  </div>
                )}

                {/* Tiện nghi */}
                {room.amenities && (
                  <div style={{ fontSize: '12px', color: '#475569', marginBottom: '16px' }}>
                    <strong>Tiện nghi:</strong> {room.amenities}
                  </div>
                )}
              </div>

              {/* Nút hành động */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <button
                  onClick={() => openEditModal(room)}
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1 }}
                >
                  <Edit2 size={14} /> Chỉnh sửa
                </button>
                <button
                  onClick={() => handleDelete(room.id, room.roomCode)}
                  className="btn btn-outline btn-sm"
                  style={{ color: '#ef4444', borderColor: '#fecaca' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Thêm / Sửa Phòng */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>
                {editingRoom ? `Sửa Thông Tin Phòng ${editingRoom.roomCode}` : 'Thêm Phòng Mới'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Mã phòng *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: P103"
                    value={formData.roomCode}
                    onChange={(e) => setFormData({ ...formData, roomCode: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tầng số *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Diện tích (m²) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Giá thuê niêm yết (VNĐ) *</label>
                  <input
                    type="number"
                    step="50000"
                    required
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Trạng thái hiện tại</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-select"
                  >
                    <option value="VACANT">Còn trống</option>
                    <option value="RENTED">Đang cho thuê</option>
                    <option value="MAINTENANCE">Đang sửa chữa / bảo trì</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Số người tối đa</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxOccupants}
                    onChange={(e) => setFormData({ ...formData, maxOccupants: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Trang thiết bị & Tiện nghi</label>
                <input
                  type="text"
                  placeholder="Điều hòa, Nóng lạnh, Tủ lạnh, Gác lửng..."
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả thêm</label>
                <textarea
                  rows="2"
                  placeholder="Mô tả hướng cửa, vị trí phơi đồ..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRoom ? 'Lưu Thay Đổi' : 'Tạo Phòng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
