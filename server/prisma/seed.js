import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Đang xóa dữ liệu cũ (nếu có)... ---');
  await prisma.notification.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.utilityReading.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  console.log('--- Đang tạo tài khoản người dùng... ---');
  const passwordHash = await bcrypt.hash('123456', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // 1. Tạo Chủ trọ (Landlord)
  const landlord = await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      password: adminPasswordHash,
      fullName: 'Nguyễn Văn Quản Lý',
      phone: '0912345678',
      role: 'LANDLORD',
      identityCard: '001200001234',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    },
  });

  // 2. Tạo Người thuê (Tenants)
  const tenant1 = await prisma.user.create({
    data: {
      email: 'hoang.nam@gmail.com',
      password: passwordHash,
      fullName: 'Trần Hoàng Nam',
      phone: '0987654321',
      role: 'TENANT',
      identityCard: '038099001122',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    },
  });

  const tenant2 = await prisma.user.create({
    data: {
      email: 'minh.anh@gmail.com',
      password: passwordHash,
      fullName: 'Lê Minh Ánh',
      phone: '0977112233',
      role: 'TENANT',
      identityCard: '038098003344',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
    },
  });

  const tenant3 = await prisma.user.create({
    data: {
      email: 'tuan.kiet@gmail.com',
      password: passwordHash,
      fullName: 'Phạm Tuấn Kiệt',
      phone: '0933445566',
      role: 'TENANT',
      identityCard: '038097005566',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    },
  });

  console.log('--- Đang tạo danh mục phòng trọ... ---');
  const roomsData = [
    {
      roomCode: 'P101',
      floor: 1,
      area: 25.5,
      basePrice: 3500000,
      status: 'RENTED',
      maxOccupants: 2,
      description: 'Phòng khép kín tầng 1, có gác lửng, cửa sổ thoáng mát, gần nhà xe tiện đi lại.',
      amenities: 'Điều hòa, Nóng lạnh, Kệ bếp, Gác lửng, Wifi tốc độ cao',
    },
    {
      roomCode: 'P102',
      floor: 1,
      area: 28.0,
      basePrice: 3800000,
      status: 'VACANT',
      maxOccupants: 3,
      description: 'Phòng rộng rãi, có ban công nhỏ phơi đồ, sẵn tủ lạnh.',
      amenities: 'Điều hòa, Nóng lạnh, Tủ lạnh, Bàn ăn, Máy giặt chung',
    },
    {
      roomCode: 'P201',
      floor: 2,
      area: 25.0,
      basePrice: 3500000,
      status: 'RENTED',
      maxOccupants: 2,
      description: 'Phòng tầng 2 yên tĩnh, nhiều ánh sáng tự nhiên.',
      amenities: 'Điều hòa, Nóng lạnh, Tủ quần áo, Rèm cửa',
    },
    {
      roomCode: 'P202',
      floor: 2,
      area: 32.0,
      basePrice: 4200000,
      status: 'VACANT',
      maxOccupants: 3,
      description: 'Phòng Studio cao cấp, nội thất gỗ sồi full tiện nghi.',
      amenities: 'Điều hòa Inverter, Nóng lạnh, Tủ lạnh 2 cánh, Giường nệm, Bàn làm việc',
    },
    {
      roomCode: 'P203',
      floor: 2,
      area: 22.0,
      basePrice: 3000000,
      status: 'MAINTENANCE',
      maxOccupants: 2,
      description: 'Đang sơn sửa lại tường và nâng cấp hệ thống vệ sinh.',
      amenities: 'Điều hòa, Nóng lạnh',
    },
    {
      roomCode: 'P301',
      floor: 3,
      area: 26.0,
      basePrice: 3600000,
      status: 'RENTED',
      maxOccupants: 2,
      description: 'Phòng tầng cao mát mẻ, ban công ngắm cảnh, rất yên tĩnh học tập.',
      amenities: 'Điều hòa, Nóng lạnh, Ban công riêng, Bàn học đôi, Wifi riêng',
    },
    {
      roomCode: 'P302',
      floor: 3,
      area: 26.0,
      basePrice: 3600000,
      status: 'VACANT',
      maxOccupants: 2,
      description: 'Phòng cạnh sân thượng, thoáng mát, view đẹp.',
      amenities: 'Điều hòa, Nóng lạnh, Gác xép, Máy giặt tầng thượng',
    },
  ];

  const createdRooms = [];
  for (const r of roomsData) {
    const room = await prisma.room.create({ data: r });
    createdRooms.push(room);
  }

  const roomP101 = createdRooms.find((r) => r.roomCode === 'P101');
  const roomP201 = createdRooms.find((r) => r.roomCode === 'P201');
  const roomP301 = createdRooms.find((r) => r.roomCode === 'P301');

  console.log('--- Đang tạo hợp đồng thuê phòng... ---');
  const contract1 = await prisma.contract.create({
    data: {
      roomId: roomP101.id,
      tenantId: tenant1.id,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      depositAmount: 3500000,
      monthlyRent: 3500000,
      status: 'ACTIVE',
    },
  });

  const contract2 = await prisma.contract.create({
    data: {
      roomId: roomP201.id,
      tenantId: tenant2.id,
      startDate: new Date('2026-03-01'),
      endDate: new Date('2027-02-28'),
      depositAmount: 3500000,
      monthlyRent: 3500000,
      status: 'ACTIVE',
    },
  });

  const contract3 = await prisma.contract.create({
    data: {
      roomId: roomP301.id,
      tenantId: tenant3.id,
      startDate: new Date('2026-05-01'),
      endDate: new Date('2027-04-30'),
      depositAmount: 3600000,
      monthlyRent: 3600000,
      status: 'ACTIVE',
    },
  });

  console.log('--- Đang tạo chỉ số điện nước tháng 9 & tháng 10... ---');
  // Tháng 9/2026
  await prisma.utilityReading.createMany({
    data: [
      {
        roomId: roomP101.id,
        month: 9,
        year: 2026,
        electricityOld: 1200,
        electricityNew: 1320, // 120 kWh
        waterOld: 45,
        waterNew: 52, // 7 m3
      },
      {
        roomId: roomP201.id,
        month: 9,
        year: 2026,
        electricityOld: 980,
        electricityNew: 1090, // 110 kWh
        waterOld: 30,
        waterNew: 36, // 6 m3
      },
      {
        roomId: roomP301.id,
        month: 9,
        year: 2026,
        electricityOld: 600,
        electricityNew: 715, // 115 kWh
        waterOld: 22,
        waterNew: 28, // 6 m3
      },
      // Tháng 10/2026
      {
        roomId: roomP101.id,
        month: 10,
        year: 2026,
        electricityOld: 1320,
        electricityNew: 1455, // 135 kWh -> 135 * 3500 = 472.500d
        waterOld: 52,
        waterNew: 60, // 8 m3 -> 8 * 25000 = 200.000d
      },
      {
        roomId: roomP201.id,
        month: 10,
        year: 2026,
        electricityOld: 1090,
        electricityNew: 1205, // 115 kWh -> 115 * 3500 = 402.500d
        waterOld: 36,
        waterNew: 42, // 6 m3 -> 6 * 25000 = 150.000d
      },
      {
        roomId: roomP301.id,
        month: 10,
        year: 2026,
        electricityOld: 715,
        electricityNew: 850, // 135 kWh -> 135 * 3500 = 472.500d
        waterOld: 28,
        waterNew: 35, // 7 m3 -> 7 * 25000 = 175.000d
      },
    ],
  });

  console.log('--- Đang tạo hóa đơn mẫu... ---');
  // 1. Hóa đơn tháng 9 của P101 - Đã thanh toán (PAID)
  await prisma.invoice.create({
    data: {
      contractId: contract1.id,
      roomId: roomP101.id,
      month: 9,
      year: 2026,
      roomCharge: 3500000,
      electricityCharge: 120 * 3500, // 420.000
      waterCharge: 7 * 25000, // 175.000
      internetCharge: 100000,
      trashCharge: 30000,
      otherCharge: 0,
      totalAmount: 3500000 + 420000 + 175000 + 100000 + 30000, // 4.225.000
      status: 'PAID',
      dueDate: new Date('2026-10-05'),
      paidAt: new Date('2026-10-03'),
      paymentMethod: 'QR',
      paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    },
  });

  // 2. Hóa đơn tháng 10 của P101 - Chưa thanh toán (UNPAID)
  await prisma.invoice.create({
    data: {
      contractId: contract1.id,
      roomId: roomP101.id,
      month: 10,
      year: 2026,
      roomCharge: 3500000,
      electricityCharge: 135 * 3500, // 472.500
      waterCharge: 8 * 25000, // 200.000
      internetCharge: 100000,
      trashCharge: 30000,
      otherCharge: 0,
      totalAmount: 3500000 + 472500 + 200000 + 100000 + 30000, // 4.302.500
      status: 'UNPAID',
      dueDate: new Date('2026-11-05'),
      paymentMethod: 'QR',
    },
  });

  // 3. Hóa đơn tháng 10 của P201 - Khách đã chuyển tiền, chờ duyệt (PENDING_APPROVAL)
  await prisma.invoice.create({
    data: {
      contractId: contract2.id,
      roomId: roomP201.id,
      month: 10,
      year: 2026,
      roomCharge: 3500000,
      electricityCharge: 115 * 3500, // 402.500
      waterCharge: 6 * 25000, // 150.000
      internetCharge: 100000,
      trashCharge: 30000,
      otherCharge: 0,
      totalAmount: 3500000 + 402500 + 150000 + 100000 + 30000, // 4.182.500
      status: 'PENDING_APPROVAL',
      dueDate: new Date('2026-11-05'),
      paymentMethod: 'BANK_TRANSFER',
      paymentProofUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
    },
  });

  // 4. Hóa đơn tháng 9 của P301 - Quá hạn (OVERDUE)
  await prisma.invoice.create({
    data: {
      contractId: contract3.id,
      roomId: roomP301.id,
      month: 9,
      year: 2026,
      roomCharge: 3600000,
      electricityCharge: 115 * 3500, // 402.500
      waterCharge: 6 * 25000, // 150.000
      internetCharge: 100000,
      trashCharge: 30000,
      otherCharge: 50000, // phi phat cham
      totalAmount: 3600000 + 402500 + 150000 + 100000 + 30000 + 50000, // 4.332.500
      status: 'OVERDUE',
      dueDate: new Date('2026-10-05'),
      paymentMethod: 'BANK_TRANSFER',
    },
  });

  console.log('--- Đang tạo các phản ánh / khiếu nại... ---');
  await prisma.feedback.createMany({
    data: [
      {
        userId: tenant1.id,
        roomId: roomP101.id,
        title: 'Bóng đèn ban công bị cháy',
        content: 'Bóng đèn ngoài ban công phòng P101 bị nhấp nháy rồi tắt hẳn tối qua. Nhờ bác chủ trọ thay giúp.',
        category: 'REPAIR',
        status: 'RESOLVED',
        landlordReply: 'Đã thay bóng LED Điện Quang mới lúc 10h sáng nay.',
        resolvedAt: new Date(),
      },
      {
        userId: tenant2.id,
        roomId: roomP201.id,
        title: 'Vòi nước bồn rửa bát bị rỉ',
        content: 'Vòi nước rửa bát rò rỉ nước liên tục làm ướt sàn kệ bếp.',
        category: 'REPAIR',
        status: 'IN_PROGRESS',
        landlordReply: 'Đã hẹn thợ sửa ống nước đến vào chiều mai.',
      },
      {
        userId: tenant3.id,
        roomId: roomP301.id,
        title: 'Phòng bên cạnh mở loa lớn sau 23h',
        content: 'Phòng tầng 3 hay mở nhạc to sau 23h gây ảnh hưởng việc học và ngủ nghỉ của các phòng xung quanh.',
        category: 'NOISE',
        status: 'PENDING',
      },
    ],
  });

  console.log('--- Đang tạo thông báo... ---');
  await prisma.notification.createMany({
    data: [
      {
        senderId: landlord.id,
        receiverId: null, // Gửi toàn thể khu trọ
        title: 'Thông báo bảo trì máy bơm nước',
        content: 'Chủ nhà sẽ tiến hành sục rửa bể nước ngầm và bảo dưỡng máy bơm vào 14h chiều Chủ nhật tuần này. Dự kiến mất nước từ 14h - 17h.',
        type: 'ANNOUNCEMENT',
        isRead: false,
      },
      {
        senderId: landlord.id,
        receiverId: tenant1.id,
        title: 'Hóa đơn tiền phòng tháng 10/2026',
        content: 'Hóa đơn tiền nhà và dịch vụ tháng 10/2026 của phòng P101 đã được tạo. Tổng tiền: 4.302.500đ. Hạn nộp ngày 05/11.',
        type: 'BILL',
        isRead: false,
      },
    ],
  });

  console.log('✅ Khởi tạo Seed Data thành công rực rỡ!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
