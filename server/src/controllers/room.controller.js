import prisma from '../prisma.js';

export const getRooms = async (req, res) => {
  try {
    const { status, floor } = req.query;
    const where = {};

    if (status) where.status = status;
    if (floor) where.floor = parseInt(floor);

    const rooms = await prisma.room.findMany({
      where,
      orderBy: [{ floor: 'asc' }, { roomCode: 'asc' }],
      include: {
        contracts: {
          where: { status: 'ACTIVE' },
          include: {
            tenant: {
              select: { id: true, fullName: true, phone: true, email: true, avatarUrl: true },
            },
          },
        },
      },
    });

    return res.json(rooms);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phòng:', error);
    return res.status(500).json({ message: 'Lỗi khi tải danh sách phòng.' });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await prisma.room.findUnique({
      where: { id: parseInt(id) },
      include: {
        contracts: {
          where: { status: 'ACTIVE' },
          include: {
            tenant: {
              select: { id: true, fullName: true, phone: true, email: true, identityCard: true },
            },
          },
        },
        utilityReadings: {
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
          take: 6,
        },
        invoices: {
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
          take: 6,
        },
        feedbacks: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            user: { select: { fullName: true } },
          },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng trọ này.' });
    }

    return res.json(room);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết phòng:', error);
    return res.status(500).json({ message: 'Lỗi khi tải thông tin phòng.' });
  }
};

export const createRoom = async (req, res) => {
  try {
    const { roomCode, floor, area, basePrice, status, maxOccupants, description, amenities } = req.body;

    if (!roomCode || !floor || !area || !basePrice) {
      return res.status(400).json({ message: 'Vui lòng điền đủ Mã phòng, Tầng, Diện tích và Giá cơ bản.' });
    }

    const existing = await prisma.room.findUnique({ where: { roomCode } });
    if (existing) {
      return res.status(400).json({ message: `Mã phòng ${roomCode} đã tồn tại trong hệ thống.` });
    }

    const room = await prisma.room.create({
      data: {
        roomCode,
        floor: parseInt(floor),
        area: parseFloat(area),
        basePrice: parseFloat(basePrice),
        status: status || 'VACANT',
        maxOccupants: maxOccupants ? parseInt(maxOccupants) : 2,
        description: description || null,
        amenities: amenities || null,
      },
    });

    return res.status(201).json({
      message: 'Thêm phòng mới thành công!',
      room,
    });
  } catch (error) {
    console.error('Lỗi khi tạo phòng:', error);
    return res.status(500).json({ message: 'Lỗi khi tạo mới phòng trọ.' });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { roomCode, floor, area, basePrice, status, maxOccupants, description, amenities } = req.body;

    const existing = await prisma.room.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return res.status(404).json({ message: 'Không tìm thấy phòng trọ để cập nhật.' });
    }

    if (roomCode && roomCode !== existing.roomCode) {
      const codeTaken = await prisma.room.findUnique({ where: { roomCode } });
      if (codeTaken) {
        return res.status(400).json({ message: `Mã phòng ${roomCode} đã được dùng.` });
      }
    }

    const updatedRoom = await prisma.room.update({
      where: { id: parseInt(id) },
      data: {
        ...(roomCode && { roomCode }),
        ...(floor && { floor: parseInt(floor) }),
        ...(area && { area: parseFloat(area) }),
        ...(basePrice && { basePrice: parseFloat(basePrice) }),
        ...(status && { status }),
        ...(maxOccupants && { maxOccupants: parseInt(maxOccupants) }),
        ...(description !== undefined && { description }),
        ...(amenities !== undefined && { amenities }),
      },
    });

    return res.json({
      message: 'Cập nhật thông tin phòng thành công!',
      room: updatedRoom,
    });
  } catch (error) {
    console.error('Lỗi khi sửa phòng:', error);
    return res.status(500).json({ message: 'Lỗi khi cập nhật phòng.' });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const roomId = parseInt(id);

    const activeContract = await prisma.contract.findFirst({
      where: { roomId, status: 'ACTIVE' },
    });

    if (activeContract) {
      return res.status(400).json({
        message: 'Không thể xóa phòng đang có hợp đồng thuê có hiệu lực! Vui lòng kết thúc hợp đồng trước.',
      });
    }

    await prisma.room.delete({ where: { id: roomId } });
    return res.json({ message: 'Xóa phòng trọ thành công!' });
  } catch (error) {
    console.error('Lỗi khi xóa phòng:', error);
    return res.status(500).json({ message: 'Lỗi khi xóa phòng trọ.' });
  }
};
