import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'house_renting_super_secret_jwt_key_2026_xyz';

export const register = async (req, res) => {
  try {
    const { email, password, fullName, phone, identityCard, role } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ Email, Mật khẩu và Họ tên.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email này đã được sử dụng. Vui lòng chọn email khác.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'LANDLORD' ? 'LANDLORD' : 'TENANT';

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phone: phone || null,
        identityCard: identityCard || null,
        role: userRole,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      },
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, fullName: newUser.fullName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json({
      message: 'Đăng ký tài khoản thành công!',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Lỗi khi đăng ký:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống máy chủ khi đăng ký.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ Email và Mật khẩu.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        contracts: {
          where: { status: 'ACTIVE' },
          include: { room: true },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Tài khoản không tồn tại trên hệ thống.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mật khẩu không chính xác.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    return res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống máy chủ khi đăng nhập.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        contracts: {
          where: { status: 'ACTIVE' },
          include: { room: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng.' });
    }

    const { password: _, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy thông tin tài khoản.' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, identityCard, avatarUrl } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(fullName && { fullName }),
        ...(phone !== undefined && { phone }),
        ...(identityCard !== undefined && { identityCard }),
        ...(avatarUrl && { avatarUrl }),
      },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return res.json({
      message: 'Cập nhật thông tin thành công!',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật profile:', error);
    return res.status(500).json({ message: 'Lỗi khi cập nhật thông tin cá nhân.' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu cũ và mới.' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu cũ không chính xác.' });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: newHashedPassword },
    });

    return res.json({ message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    console.error('Lỗi khi đổi mật khẩu:', error);
    return res.status(500).json({ message: 'Lỗi khi đổi mật khẩu.' });
  }
};
