import React, { useState, useEffect } from 'react';
import { Zap, Droplets, ArrowRight, History, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function Utilities() {
  const [rooms, setRooms] = useState([]);
  const [readings, setReadings] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [electricityOld, setElectricityOld] = useState(0);
  const [electricityNew, setElectricityNew] = useState(0);
  const [waterOld, setWaterOld] = useState(0);
  const [waterNew, setWaterNew] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchData = async () => {
    try {
      const [rRes, uRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/utilities'),
      ]);
      setRooms(rRes.data);
      setReadings(uRes.data);
      if (rRes.data.length > 0 && !selectedRoomId) {
        setSelectedRoomId(rRes.data[0].id);
        fetchLatestReading(rRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLatestReading = async (roomId) => {
    try {
      const res = await api.get(`/utilities/latest/${roomId}`);
      if (res.data) {
        setElectricityOld(res.data.electricityNew);
        setElectricityNew(res.data.electricityNew);
        setWaterOld(res.data.waterNew);
        setWaterNew(res.data.waterNew);
      } else {
        setElectricityOld(0);
        setElectricityNew(0);
        setWaterOld(0);
        setWaterNew(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoomChange = (e) => {
    const rId = e.target.value;
    setSelectedRoomId(rId);
    fetchLatestReading(rId);
  };

  const handleRecord = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await api.post('/utilities/record', {
        roomId: selectedRoomId,
        month,
        year,
        electricityOld,
        electricityNew,
        waterOld,
        waterNew,
      });

      setMessage({ type: 'success', text: res.data.message });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi khi lưu chỉ số.' });
    } finally {
      setSubmitting(false);
    }
  };

  const deltaElec = Math.max(0, electricityNew - electricityOld);
  const deltaWater = Math.max(0, waterNew - waterOld);
  const estElecCost = deltaElec * 3500;
  const estWaterCost = deltaWater * 25000;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Ghi Nhận Chỉ Số Điện Nước</h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Tự động tính toán lượng điện tiêu thụ (kWh), khối nước (m³) và hỗ trợ xuất hóa đơn
        </p>
      </div>

      {/* Form nhập chỉ số */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '20px' }}>
          <Zap size={20} color="#f59e0b" /> Nhập Số Điện Nước Cuối Tháng
        </h3>

        {message && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '20px',
              background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: message.type === 'success' ? '#065f46' : '#991b1b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleRecord}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Phòng trọ *</label>
              <select
                value={selectedRoomId}
                onChange={handleRoomChange}
                className="form-select"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Phòng {r.roomCode} (Tầng {r.floor} - {r.status === 'RENTED' ? 'Đang thuê' : 'Trống'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tháng ghi nhận *</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="form-select"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Năm *</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', margin: '16px 0' }}>
            {/* Khối Điện */}
            <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '16px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: 700, marginBottom: '12px' }}>
                <Zap size={18} /> Chỉ Số Đồng Hồ Điện (kWh)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Số cũ (đầu kỳ)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={electricityOld}
                    onChange={(e) => setElectricityOld(parseFloat(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Số mới (cuối kỳ)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={electricityNew}
                    onChange={(e) => setElectricityNew(parseFloat(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>
              </div>
              <div style={{ marginTop: '12px', fontSize: '13px', color: '#92400e', display: 'flex', justifyContent: 'space-between' }}>
                <span>Tiêu thụ: <strong>{deltaElec} kWh</strong></span>
                <span>Tạm tính (3.500đ/kWh): <strong>{estElecCost.toLocaleString('vi-VN')} đ</strong></span>
              </div>
            </div>

            {/* Khối Nước */}
            <div style={{ background: '#f0f9ff', border: '1px solid #e0f2fe', padding: '16px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', fontWeight: 700, marginBottom: '12px' }}>
                <Droplets size={18} /> Chỉ Số Đồng Hồ Nước (m³)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Số cũ (đầu kỳ)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={waterOld}
                    onChange={(e) => setWaterOld(parseFloat(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Số mới (cuối kỳ)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={waterNew}
                    onChange={(e) => setWaterNew(parseFloat(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>
              </div>
              <div style={{ marginTop: '12px', fontSize: '13px', color: '#075985', display: 'flex', justifyContent: 'space-between' }}>
                <span>Tiêu thụ: <strong>{deltaWater} m³</strong></span>
                <span>Tạm tính (25.000đ/m³): <strong>{estWaterCost.toLocaleString('vi-VN')} đ</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ minWidth: '180px' }}>
              {submitting ? 'Đang lưu...' : 'Lưu Chỉ Số Điện Nước'}
            </button>
          </div>
        </form>
      </div>

      {/* Lịch sử ghi số */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={18} color="#4f46e5" />
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Lịch Sử Chỉ Số Đã Ghi Gần Đây</h3>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Phòng</th>
                <th>Kỳ tháng/năm</th>
                <th>Điện (Cũ → Mới)</th>
                <th>Tiêu thụ Điện</th>
                <th>Nước (Cũ → Mới)</th>
                <th>Tiêu thụ Nước</th>
                <th>Ngày ghi</th>
              </tr>
            </thead>
            <tbody>
              {readings.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    Chưa có lịch sử ghi số.
                  </td>
                </tr>
              ) : (
                readings.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.room?.roomCode}</strong></td>
                    <td>Tháng {r.month}/{r.year}</td>
                    <td>{r.electricityOld} → <strong>{r.electricityNew}</strong></td>
                    <td><strong style={{ color: '#d97706' }}>{r.electricityNew - r.electricityOld} kWh</strong></td>
                    <td>{r.waterOld} → <strong>{r.waterNew}</strong></td>
                    <td><strong style={{ color: '#0284c7' }}>{r.waterNew - r.waterOld} m³</strong></td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(r.recordedAt).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
