import prisma from '../prisma.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [{ receiverId: req.user.id }, { receiverId: null }],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return res.json({
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông báo:', error);
    return res.status(500).json({ message: 'Lỗi khi tải thông báo.' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true },
    });

    return res.json({ message: 'Đã đánh dấu đã đọc.' });
  } catch (error) {
    console.error('Lỗi khi cập nhật thông báo:', error);
    return res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái đã đọc.' });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { title, content, type = 'ANNOUNCEMENT', receiverId } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Vui lòng điền tiêu đề và nội dung thông báo.' });
    }

    const notif = await prisma.notification.create({
      data: {
        senderId: req.user.id,
        receiverId: receiverId ? parseInt(receiverId) : null,
        title,
        content,
        type,
      },
    });

    return res.status(201).json({
      message: 'Gửi thông báo thành công!',
      notification: notif,
    });
  } catch (error) {
    console.error('Lỗi khi tạo thông báo:', error);
    return res.status(500).json({ message: 'Lỗi khi gửi thông báo.' });
  }
};
