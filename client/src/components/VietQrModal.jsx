import React, { useState } from 'react';
import { X, Copy, Check, Upload, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

export default function VietQrModal({ invoice, onClose, onPaymentSubmitted }) {
  const [copiedField, setCopiedField] = useState(null);
  const [proofUrl, setProofUrl] = useState(invoice.paymentProofUrl || '');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!invoice) return null;

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/invoices/${invoice.id}/submit-payment`, {
        paymentProofUrl: proofUrl || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
        paymentMethod: 'QR',
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setSuccess(true);
      setTimeout(() => {
        if (onPaymentSubmitted) onPaymentSubmitted();
        onClose();
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi gửi xác nhận thanh toán.');
    } finally {
      setSubmitting(false);
    }
  };

  const bankName = 'MB Bank (Ngân Hàng Quân Đội)';
  const accountNo = invoice.paymentInfo?.accountNo || '0388889999';
  const accountName = invoice.paymentInfo?.accountName || 'NGUYEN VAN CHU TRO';
  const transferContent = invoice.paymentInfo?.transferContent || `${invoice.room?.roomCode} T${invoice.month}_${invoice.year}`;
  const qrUrl = invoice.paymentInfo?.vietQrUrl || `https://img.vietqr.io/image/MB-0388889999-compact2.png?amount=${Math.round(invoice.totalAmount)}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountName)}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
              Phiếu Thu & Thanh Toán VietQR
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Phòng: <strong>{invoice.room?.roomCode}</strong> | Kỳ thanh toán: Tháng {invoice.month}/{invoice.year}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <CheckCircle2 size={64} color="#10b981" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#065f46' }}>
              Gửi Xác Nhận Nộp Tiền Thành Công!
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>
              Hóa đơn đã được chuyển sang trạng thái <strong>Chờ chủ trọ duyệt</strong>.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Cột 1: Mã VietQR */}
            <div style={{ textAlign: 'center', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>
                Quét mã qua ứng dụng ngân hàng
              </p>
              <img
                src={qrUrl}
                alt="VietQR Transfer"
                style={{ width: '100%', maxWidth: '240px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
                Chuẩn Napas247 - Tự động điền đúng số tiền & nội dung
              </p>
            </div>

            {/* Cột 2: Thông tin chuyển khoản & Bảng giá */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#eef2ff', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: '#4338ca', fontWeight: 600 }}>TỔNG TIỀN CẦN THANH TOÁN</span>
                <p style={{ fontSize: '24px', fontWeight: 800, color: '#4f46e5' }}>
                  {Number(invoice.totalAmount).toLocaleString('vi-VN')} đ
                </p>
              </div>

              {/* Thông tin STK */}
              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Ngân hàng:</span>
                  <strong>{bankName}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Số tài khoản:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      {accountNo}
                    </code>
                    <button
                      onClick={() => copyToClipboard(accountNo, 'acc')}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6366f1' }}
                    >
                      {copiedField === 'acc' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Chủ tài khoản:</span>
                  <strong>{accountName}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Nội dung CK:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <code style={{ background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, color: '#92400e' }}>
                      {transferContent}
                    </code>
                    <button
                      onClick={() => copyToClipboard(transferContent, 'content')}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6366f1' }}
                    >
                      {copiedField === 'content' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Form gửi ảnh minh chứng */}
              <form onSubmit={handleSubmitProof} style={{ marginTop: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <label className="form-label" style={{ fontSize: '12px' }}>
                  Link ảnh biên lai / Ủy nhiệm chi (Tùy chọn):
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '12px', padding: '8px 10px' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '13px' }}
                >
                  <Upload size={16} /> {submitting ? 'Đang gửi...' : 'Tôi Đã Chuyển Khoản & Gửi Bill'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
