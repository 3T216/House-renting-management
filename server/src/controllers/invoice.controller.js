import prisma from '../prisma.js';

const ELECTRICITY_RATE = parseFloat(process.env.ELECTRICITY_RATE || '3500');
const WATER_RATE = parseFloat(process.env.WATER_RATE || '25000');
const INTERNET_RATE = parseFloat(process.env.INTERNET_RATE || '100000');
const TRASH_RATE = parseFloat(process.env.TRASH_RATE || '30000');

const BANK_ID = process.env.BANK_ID || 'MB';
const BANK_ACCOUNT_NO = process.env.BANK_ACCOUNT_NO || '0388889999';
const BANK_ACCOUNT_NAME = process.env.BANK_ACCOUNT_NAME || 'NGUYEN VAN CHU TRO';

export const getInvoices = async (req, res) => {
  try {
    const isLandlord = req.user.role === 'LANDLORD';
    const { month, year, status, roomId } = req.query;

    const where = {};
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);
    if (status) where.status = status;
    if (roomId) where.roomId = parseInt(roomId);

    if (!isLandlord) {
      // Khách thuê chỉ xem hóa đơn của hợp đồng mình đang thuê
      where.contract = { tenantId: req.user.id };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { createdAt: 'desc' }],
      include: {
        room: {
          select: { roomCode: true, floor: true, area: true },
        },
        contract: {
          include: {
            tenant: {
              select: { id: true, fullName: true, phone: true, email: true },
            },
          },
        },
      },
    });

    return res.json(invoices);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách hóa đơn:', error);
    return res.status(500).json({ message: 'Lỗi khi tải danh sách hóa đơn.' });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const isLandlord = req.user.role === 'LANDLORD';

    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: {
        room: true,
        contract: {
          include: {
            tenant: {
              select: { id: true, fullName: true, phone: true, email: true, identityCard: true },
            },
          },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn.' });
    }

    // Bảo mật: Nếu là khách thuê, chỉ xem được hóa đơn của mình
    if (!isLandlord && invoice.contract.tenantId !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập hóa đơn này.' });
    }

    // Lấy thông tin chỉ số điện nước cùng tháng để hiển thị phân rã chi tiết
    const utilityReading = await prisma.utilityReading.findFirst({
      where: {
        roomId: invoice.roomId,
        month: invoice.month,
        year: invoice.year,
      },
    });

    // Tạo link VietQR chuẩn
    const addInfo = `${invoice.room.roomCode} T${invoice.month}_${invoice.year}`;
    const vietQrUrl = `https://img.vietqr.io/image/${BANK_ID}-${BANK_ACCOUNT_NO}-compact2.png?amount=${Math.round(
      invoice.totalAmount
    )}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(BANK_ACCOUNT_NAME)}`;

    return res.json({
      ...invoice,
      utilityReading: utilityReading || null,
      rates: {
        electricityRate: ELECTRICITY_RATE,
        waterRate: WATER_RATE,
        internetRate: INTERNET_RATE,
        trashRate: TRASH_RATE,
      },
      paymentInfo: {
        bankId: BANK_ID,
        accountNo: BANK_ACCOUNT_NO,
        accountName: BANK_ACCOUNT_NAME,
        transferContent: addInfo,
        vietQrUrl,
      },
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết hóa đơn:', error);
    return res.status(500).json({ message: 'Lỗi khi tải chi tiết hóa đơn.' });
  }
};

export const generateInvoice = async (req, res) => {
  try {
    const {
      roomId,
      month,
      year,
      roomCharge: customRoomCharge,
      internetCharge: customInternet,
      trashCharge: customTrash,
      otherCharge = 0,
      dueDate,
    } = req.body;

    if (!roomId || !month || !year) {
      return res.status(400).json({ message: 'Vui lòng cung cấp Phòng, Tháng và Năm lập hóa đơn.' });
    }

    const activeContract = await prisma.contract.findFirst({
      where: { roomId: parseInt(roomId), status: 'ACTIVE' },
      include: { room: true },
    });

    if (!activeContract) {
      return res.status(400).json({ message: 'Phòng này hiện chưa có hợp đồng thuê hoạt động!' });
    }

    // Kiểm tra xem đã xuất hóa đơn cho phòng trong tháng/năm này chưa
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        roomId: parseInt(roomId),
        month: parseInt(month),
        year: parseInt(year),
      },
    });

    if (existingInvoice) {
      return res.status(400).json({
        message: `Hóa đơn tháng ${month}/${year} của phòng ${activeContract.room.roomCode} đã được tạo trước đó!`,
      });
    }

    // Lấy chỉ số điện nước tháng đó
    const reading = await prisma.utilityReading.findFirst({
      where: {
        roomId: parseInt(roomId),
        month: parseInt(month),
        year: parseInt(year),
      },
    });

    if (!reading) {
      return res.status(400).json({
        message: `Chưa có chỉ số điện nước tháng ${month}/${year} cho phòng ${activeContract.room.roomCode}. Vui lòng ghi chỉ số trước!`,
      });
    }

    const roomCharge = customRoomCharge !== undefined ? parseFloat(customRoomCharge) : activeContract.monthlyRent;
    const deltaElec = Math.max(0, reading.electricityNew - reading.electricityOld);
    const deltaWater = Math.max(0, reading.waterNew - reading.waterOld);

    const electricityCharge = deltaElec * ELECTRICITY_RATE;
    const waterCharge = deltaWater * WATER_RATE;
    const internetCharge = customInternet !== undefined ? parseFloat(customInternet) : INTERNET_RATE;
    const trashCharge = customTrash !== undefined ? parseFloat(customTrash) : TRASH_RATE;
    const totalAmount = roomCharge + electricityCharge + waterCharge + internetCharge + trashCharge + parseFloat(otherCharge);

    // Mặc định hạn nộp là ngày 5 của tháng tiếp theo
    const due = dueDate
      ? new Date(dueDate)
      : new Date(parseInt(year), parseInt(month), 5);

    const newInvoice = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          contractId: activeContract.id,
          roomId: parseInt(roomId),
          month: parseInt(month),
          year: parseInt(year),
          roomCharge,
          electricityCharge,
          waterCharge,
          internetCharge,
          trashCharge,
          otherCharge: parseFloat(otherCharge),
          totalAmount,
          status: 'UNPAID',
          dueDate: due,
          paymentMethod: 'QR',
        },
        include: {
          room: true,
          contract: {
            include: { tenant: { select: { fullName: true, phone: true } } },
          },
        },
      });

      // Tạo thông báo gửi cho khách thuê
      await tx.notification.create({
        data: {
          senderId: req.user.id,
          receiverId: activeContract.tenantId,
          title: `Hóa đơn tiền nhà tháng ${month}/${year}`,
          content: `Hóa đơn phòng ${activeContract.room.roomCode} tháng ${month}/${year} đã phát hành. Tổng tiền: ${totalAmount.toLocaleString('vi-VN')} đ. Hạn nộp: ${due.toLocaleDateString('vi-VN')}.`,
          type: 'BILL',
        },
      });

      return invoice;
    });

    return res.status(201).json({
      message: 'Phát hành hóa đơn thành công!',
      invoice: newInvoice,
    });
  } catch (error) {
    console.error('Lỗi khi lập hóa đơn:', error);
    return res.status(500).json({ message: 'Lỗi khi tạo hóa đơn.' });
  }
};

export const submitPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentProofUrl, paymentMethod = 'QR' } = req.body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: { contract: true, room: true },
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn.' });
    }

    if (invoice.contract.tenantId !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền nộp tiền cho hóa đơn này.' });
    }

    const updated = await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: {
        status: 'PENDING_APPROVAL',
        paymentMethod,
        paymentProofUrl: paymentProofUrl || null,
      },
    });

    // Thông báo cho chủ trọ
    const landlord = await prisma.user.findFirst({ where: { role: 'LANDLORD' } });
    if (landlord) {
      await prisma.notification.create({
        data: {
          senderId: req.user.id,
          receiverId: landlord.id,
          title: `Khách thuê đã gửi xác nhận nộp tiền`,
          content: `Phòng ${invoice.room.roomCode} đã chuyển tiền hóa đơn tháng ${invoice.month}/${invoice.year} (${invoice.totalAmount.toLocaleString('vi-VN')} đ). Vui lòng kiểm tra và duyệt.`,
          type: 'BILL',
        },
      });
    }

    return res.json({
      message: 'Đã gửi xác nhận thanh toán thành công! Vui lòng chờ chủ trọ kiểm tra.',
      invoice: updated,
    });
  } catch (error) {
    console.error('Lỗi khi nộp tiền hóa đơn:', error);
    return res.status(500).json({ message: 'Lỗi khi nộp tiền hóa đơn.' });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: { contract: true, room: true },
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn.' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.update({
        where: { id: parseInt(id) },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          ...(paymentMethod && { paymentMethod }),
        },
      });

      // Gửi thông báo xác nhận thành công cho người thuê
      await tx.notification.create({
        data: {
          senderId: req.user.id,
          receiverId: invoice.contract.tenantId,
          title: 'Thanh toán thành công',
          content: `Chủ trọ đã xác nhận thanh toán hóa đơn tháng ${invoice.month}/${invoice.year} của phòng ${invoice.room.roomCode}. Cảm ơn bạn!`,
          type: 'BILL',
        },
      });

      return inv;
    });

    return res.json({
      message: 'Đã xác nhận thanh toán thành công!',
      invoice: updated,
    });
  } catch (error) {
    console.error('Lỗi khi xác nhận thanh toán:', error);
    return res.status(500).json({ message: 'Lỗi khi duyệt thanh toán.' });
  }
};

export const updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['UNPAID', 'PENDING_APPROVAL', 'PAID', 'OVERDUE'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
    }

    const updated = await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: {
        status,
        ...(status === 'PAID' ? { paidAt: new Date() } : { paidAt: null }),
      },
    });

    return res.json({
      message: 'Cập nhật trạng thái hóa đơn thành công!',
      invoice: updated,
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái:', error);
    return res.status(500).json({ message: 'Lỗi khi cập nhật hóa đơn.' });
  }
};
