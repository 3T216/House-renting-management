import prisma from '../prisma.js';

export const getReadings = async (req, res) => {
  try {
    const { month, year, roomId } = req.query;
    const where = {};

    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);
    if (roomId) where.roomId = parseInt(roomId);

    const readings = await prisma.utilityReading.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        room: {
          select: { roomCode: true, floor: true, status: true },
        },
      },
    });

    return res.json(readings);
  } catch (error) {
    console.error('Lỗi khi lấy chỉ số điện nước:', error);
    return res.status(500).json({ message: 'Lỗi khi tải lịch sử chỉ số điện nước.' });
  }
};

export const getLatestReading = async (req, res) => {
  try {
    const { roomId } = req.params;

    const latest = await prisma.utilityReading.findFirst({
      where: { roomId: parseInt(roomId) },
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { recordedAt: 'desc' }],
    });

    return res.json(latest || null);
  } catch (error) {
    console.error('Lỗi khi lấy chỉ số mới nhất:', error);
    return res.status(500).json({ message: 'Lỗi khi tải chỉ số gần nhất.' });
  }
};

export const recordReading = async (req, res) => {
  try {
    const { roomId, month, year, electricityOld, electricityNew, waterOld, waterNew } = req.body;

    if (!roomId || !month || !year || electricityOld === undefined || electricityNew === undefined || waterOld === undefined || waterNew === undefined) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ các chỉ số điện và nước.' });
    }

    const eOld = parseFloat(electricityOld);
    const eNew = parseFloat(electricityNew);
    const wOld = parseFloat(waterOld);
    const wNew = parseFloat(waterNew);

    if (eNew < eOld) {
      return res.status(400).json({ message: 'Chỉ số điện mới không được nhỏ hơn chỉ số cũ!' });
    }

    if (wNew < wOld) {
      return res.status(400).json({ message: 'Chỉ số nước mới không được nhỏ hơn chỉ số cũ!' });
    }

    // Kiểm tra xem đã có bản ghi cho phòng này trong tháng/năm đó chưa
    const existing = await prisma.utilityReading.findFirst({
      where: {
        roomId: parseInt(roomId),
        month: parseInt(month),
        year: parseInt(year),
      },
    });

    let result;
    if (existing) {
      result = await prisma.utilityReading.update({
        where: { id: existing.id },
        data: {
          electricityOld: eOld,
          electricityNew: eNew,
          waterOld: wOld,
          waterNew: wNew,
          recordedAt: new Date(),
        },
      });
    } else {
      result = await prisma.utilityReading.create({
        data: {
          roomId: parseInt(roomId),
          month: parseInt(month),
          year: parseInt(year),
          electricityOld: eOld,
          electricityNew: eNew,
          waterOld: wOld,
          waterNew: wNew,
        },
      });
    }

    return res.status(201).json({
      message: 'Ghi nhận chỉ số điện nước thành công!',
      reading: result,
      consumption: {
        electricityKwh: eNew - eOld,
        waterM3: wNew - wOld,
      },
    });
  } catch (error) {
    console.error('Lỗi khi ghi chỉ số điện nước:', error);
    return res.status(500).json({ message: 'Lỗi khi lưu chỉ số điện nước.' });
  }
};
