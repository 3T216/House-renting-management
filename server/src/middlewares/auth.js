import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'house_renting_super_secret_jwt_key_2026_xyz';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Vui lòng đăng nhập để tiếp tục truy cập.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.' });
    }
    req.user = user;
    next();
  });
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Bạn không có quyền hạn thực hiện thao tác này.',
      });
    }
    next();
  };
};
