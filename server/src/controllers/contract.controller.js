import prisma from '../prisma.js';

export const getContracts = async (req, res) => {
  try {
    const isLandlord = req.user.role === 'LANDLORD';
    const where = isLandlord ? {} : { tenantId: req.user.id };

    const contracts = await prisma.contract.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        room: true,
        tenant: {
          select: { id: true, fullName: true, email: true, phone: true, identityCard: true, avatarUrl: true },
        },
      },
    });

    return res.json(contracts);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách hợp đồng:', error);
    return res.status(500).json({ message: 'Lỗi khi tải danh sách hợp đồng.' });
  }
};

export const createContract = async (req, res) => {
  try {
    const { roomId, tenantId, startDate, endDate, depositAmount, monthlyRent } = req.body;

    if (!roomId || !tenantId || !startDate || !endDate || depositAmount === undefined || monthlyRent === undefined) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin hợp đồng.' });
    }

    const room = await prisma.room.findUnique({ where: { id: parseInt(roomId) } });
    if (!room) {
      return res.status(404).json({ message: 'Phòng được chọn không tồn tại.' });
    }

    // Kiểm tra xem phòng đang có hợp đồng hoạt động không
    const existingActive = await prisma.contract.findFirst({
      where: { roomId: parseInt(roomId), status: 'ACTIVE' },
    });
    if (existingActive) {
      return res.status(400).json({ message: 'Phòng này hiện đang có khách thuê với hợp đồng còn hiệu lực!' });
    }

    const newContract = await prisma.$transaction(async (tx) => {
      const contract = await tx.contract.create({
        data: {
          roomId: parseInt(roomId),
          tenantId: parseInt(tenantId),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          depositAmount: parseFloat(depositAmount),
          monthlyRent: parseFloat(monthlyRent),
          status: 'ACTIVE',
        },
        include: {
          room: true,
          tenant: { select: { fullName: true, phone: true, email: true } },
        },
      });

      // Cập nhật trạng thái phòng sang RENTED
      await tx.room.update({
        where: { id: parseInt(roomId) },
        data: { status: 'RENTED' },
      });

      // Gửi thông báo cho khách thuê
      await tx.notification.create({
        data: {
          senderId: req.user.id,
          receiverId: parseInt(tenantId),
          title: 'Hợp đồng thuê phòng đã được kích hoạt',
          content: `Hợp đồng thuê phòng ${room.roomCode} của bạn đã được lập thành công với giá ${Number(monthlyRent).toLocaleString('vi-VN')} đ/tháng.`,
          type: 'ANNOUNCEMENT',
        },
      });

      return contract;
    });

    return res.status(201).json({
      message: 'Lập hợp đồng thuê phòng thành công!',
      contract: newContract,
    });
  } catch (error) {
    console.error('Lỗi khi lập hợp đồng:', error);
    return res.status(500).json({ message: 'Lỗi khi tạo hợp đồng thuê.' });
  }
};

export const terminateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const contractId = parseInt(id);

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: { room: true },
    });

    if (!contract) {
      return res.status(404).json({ message: 'Không tìm thấy hợp đồng.' });
    }

    if (contract.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Hợp đồng này đã kết thúc trước đó.' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.contract.update({
        where: { id: contractId },
        data: { status: 'TERMINATED' },
      });

      // Đổi trạng thái phòng về VACANT
      await tx.room.update({
        where: { id: contract.roomId },
        data: { status: 'VACANT' },
      });

      // Gửi thông báo kết thúc cho người thuê
      await tx.notification.create({
        data: {
          senderId: req.user.id,
          receiverId: contract.tenantId,
          title: 'Thanh lý hợp đồng thuê phòng',
          content: `Hợp đồng thuê phòng ${contract.room.roomCode} đã được chủ trọ hoàn tất thủ tục thanh lý/trả phòng.`,
          type: 'ANNOUNCEMENT',
        },
      });
    });

    return res.json({ message: 'Đã thanh lý và kết thúc hợp đồng thuê thành công!' });
  } catch (error) {
    console.error('Lỗi khi kết thúc hợp đồng:', error);
    return res.status(500).json({ message: 'Lỗi khi thanh lý hợp đồng.' });
  }
};
