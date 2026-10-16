import prisma from '../prisma.js';

export const getFeedbacks = async (req, res) => {
  try {
    const isLandlord = req.user.role === 'LANDLORD';
    const { status, category, roomId } = req.query;

    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (roomId) where.roomId = parseInt(roomId);

    if (!isLandlord) {
      where.userId = req.user.id;
    }

    const feedbacks = await prisma.feedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        room: { select: { roomCode: true, floor: true } },
        user: { select: { fullName: true, phone: true, avatarUrl: true } },
      },
    });

    return res.json(feedbacks);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phản ánh:', error);
    return res.status(500).json({ message: 'Lỗi khi tải danh sách khiếu nại.' });
  }
};

export const createFeedback = async (req, res) => {
  try {
    const { roomId, title, content, category = 'REPAIR' } = req.body;

    if (!roomId || !title || !content) {
      return res.status(400).json({ message: 'Vui lòng cung cấp Tiêu đề, Nội dung và Chọn phòng.' });
    }

    const room = await prisma.room.findUnique({ where: { id: parseInt(roomId) } });
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng tương ứng.' });
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: req.user.id,
        roomId: parseInt(roomId),
        title,
        content,
        category,
        status: 'PENDING',
      },
      include: {
        room: true,
        user: { select: { fullName: true } },
      },
    });

    // Thông báo cho chủ trọ
    const landlord = await prisma.user.findFirst({ where: { role: 'LANDLORD' } });
    if (landlord) {
      await prisma.notification.create({
        data: {
          senderId: req.user.id,
          receiverId: landlord.id,
          title: `Phản ánh mới từ phòng ${room.roomCode}`,
          content: `${req.user.fullName} (${room.roomCode}) đã gửi phản ánh: "${title}".`,
          type: 'ALERT',
        },
      });
    }

    return res.status(201).json({
      message: 'Gửi phản ánh thành công! Chủ trọ sẽ sớm xem xét giải quyết.',
      feedback,
    });
  } catch (error) {
    console.error('Lỗi khi tạo phản ánh:', error);
    return res.status(500).json({ message: 'Lỗi khi gửi phản ánh.' });
  }
};

export const replyFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { landlordReply, status } = req.body;

    const feedback = await prisma.feedback.findUnique({
      where: { id: parseInt(id) },
      include: { room: true },
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Không tìm thấy phản ánh này.' });
    }

    const isResolved = status === 'RESOLVED';
    const updated = await prisma.$transaction(async (tx) => {
      const fb = await tx.feedback.update({
        where: { id: parseInt(id) },
        data: {
          ...(landlordReply !== undefined && { landlordReply }),
          ...(status && { status }),
          ...(isResolved ? { resolvedAt: new Date() } : {}),
        },
      });

      // Thông báo cho khách thuê
      await tx.notification.create({
        data: {
          senderId: req.user.id,
          receiverId: feedback.userId,
          title: isResolved ? 'Phản ánh đã được giải quyết' : 'Chủ trọ đã phản hồi yêu cầu',
          content: `Chủ trọ đã phản hồi về phản ánh "${feedback.title}": ${landlordReply || 'Đang tiến hành xử lý.'}`,
          type: 'ANNOUNCEMENT',
        },
      });

      return fb;
    });

    return res.json({
      message: 'Phản hồi khiếu nại thành công!',
      feedback: updated,
    });
  } catch (error) {
    console.error('Lỗi khi trả lời phản ánh:', error);
    return res.status(500).json({ message: 'Lỗi khi cập nhật phản ánh.' });
  }
};
