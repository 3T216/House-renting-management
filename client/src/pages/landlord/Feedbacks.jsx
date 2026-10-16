import React, { useState, useEffect } from 'react';
import { MessageSquareWarning, CheckCircle2, Clock, Send, MessageCircle, X } from 'lucide-react';
import api from '../../services/api';

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [submitting, setSubmitting] = useState(false);

  const fetchFeedbacks = async () => {
    try {
      const res = await api.get('/feedbacks');
      setFeedbacks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const openReplyModal = (fb) => {
    setSelectedFeedback(fb);
    setReplyText(fb.landlordReply || '');
    setNewStatus(fb.status === 'PENDING' ? 'IN_PROGRESS' : fb.status);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/feedbacks/${selectedFeedback.id}/reply`, {
        landlordReply: replyText,
        status: newStatus,
      });
      setSelectedFeedback(null);
      fetchFeedbacks();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi gửi phản hồi.');
    } finally {
      setSubmitting(false);
    }
  };

  const categoryLabels = {
    REPAIR: { label: 'Sửa chữa hỏng hóc', color: '#dc2626', bg: '#fee2e2' },
    NOISE: { label: 'Tiếng ồn / An ninh', color: '#d97706', bg: '#fef3c7' },
    HYGIENE: { label: 'Vệ sinh chung', color: '#059669', bg: '#d1fae5' },
    BILLING: { label: 'Thắc mắc tiền trọ', color: '#2563eb', bg: '#dbeafe' },
    OTHER: { label: 'Khác', color: '#4b5563', bg: '#f3f4f6' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Hộp Thư Phản Ánh & Sự Cố</h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Tiếp nhận khiếu nại, yêu cầu sửa chữa điện nước, thiết bị từ người thuê phòng
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {feedbacks.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            Không có phản ánh nào từ người thuê.
          </div>
        ) : (
          feedbacks.map((fb) => {
            const cat = categoryLabels[fb.category] || categoryLabels.OTHER;

            let statusBadge = <span className="badge badge-unpaid">Chờ tiếp nhận</span>;
            if (fb.status === 'IN_PROGRESS') {
              statusBadge = <span className="badge badge-pending">Đang xử lý</span>;
            } else if (fb.status === 'RESOLVED') {
              statusBadge = <span className="badge badge-paid">Đã giải quyết</span>;
            }

            return (
              <div key={fb.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: cat.bg,
                        color: cat.color,
                        textTransform: 'uppercase',
                      }}
                    >
                      {cat.label}
                    </span>
                    {statusBadge}
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                    {fb.title}
                  </h3>

                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, marginBottom: '14px' }}>
                    {fb.content}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                    <strong>{fb.user?.fullName}</strong> • Phòng <strong>{fb.room?.roomCode}</strong>
                    <span>• {new Date(fb.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>

                  {fb.landlordReply && (
                    <div style={{ background: '#f8fafc', borderLeft: '3px solid #4f46e5', padding: '8px 12px', borderRadius: '4px', fontSize: '12px', marginTop: '10px' }}>
                      <strong style={{ color: '#4f46e5' }}>Phản hồi của bạn:</strong>
                      <p style={{ color: '#334155', marginTop: '2px' }}>{fb.landlordReply}</p>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '12px' }}>
                  <button
                    onClick={() => openReplyModal(fb)}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%' }}
                  >
                    <MessageCircle size={14} /> Phản hồi & Cập nhật tiến độ
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Trả Lời Phản Ánh */}
      {selectedFeedback && (
        <div className="modal-overlay" onClick={() => setSelectedFeedback(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Xử Lý Phản Ánh Sự Cố</h2>
              <button onClick={() => setSelectedFeedback(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
              <div><strong>Phòng:</strong> {selectedFeedback.room?.roomCode} ({selectedFeedback.user?.fullName})</div>
              <div><strong>Vấn đề:</strong> {selectedFeedback.title}</div>
              <div style={{ marginTop: '4px', color: '#475569' }}>"{selectedFeedback.content}"</div>
            </div>

            <form onSubmit={handleReplySubmit}>
              <div className="form-group">
                <label className="form-label">Cập nhật trạng thái xử lý *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="form-select"
                >
                  <option value="IN_PROGRESS">Đang xử lý (đã tiếp nhận hoặc hẹn thợ)</option>
                  <option value="RESOLVED">Đã giải quyết xong hoàn toàn</option>
                  <option value="PENDING">Chờ xử lý</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nội dung phản hồi cho người thuê *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="VD: Đã báo thợ sửa vào 14h chiều nay / Đã thay thiết bị mới..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setSelectedFeedback(null)} className="btn btn-secondary">
                  Hủy
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Đang gửi...' : 'Gửi Phản Hồi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
