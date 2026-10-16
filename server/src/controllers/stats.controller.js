import prisma from '../prisma.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalRooms = await prisma.room.count();
    const rentedRooms = await prisma.room.count({ where: { status: 'RENTED' } });
    const vacantRooms = await prisma.room.count({ where: { status: 'VACANT' } });
    const maintenanceRooms = await prisma.room.count({ where: { status: 'MAINTENANCE' } });

    const occupancyRate = totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 100) : 0;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Hóa đơn tháng hiện tại
    const currentMonthInvoices = await prisma.invoice.findMany({
      where: { month: currentMonth, year: currentYear },
    });

    const totalInvoicedThisMonth = currentMonthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalCollectedThisMonth = currentMonthInvoices
      .filter((inv) => inv.status === 'PAID')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    // Toàn bộ công nợ chưa trả (UNPAID + OVERDUE)
    const allUnpaidInvoices = await prisma.invoice.findMany({
      where: { status: { in: ['UNPAID', 'OVERDUE', 'PENDING_APPROVAL'] } },
    });
    const totalOutstandingDebt = allUnpaidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    const pendingApprovalsCount = await prisma.invoice.count({
      where: { status: 'PENDING_APPROVAL' },
    });

    const pendingFeedbacksCount = await prisma.feedback.count({
      where: { status: 'PENDING' },
    });

    return res.json({
      rooms: {
        total: totalRooms,
        rented: rentedRooms,
        vacant: vacantRooms,
        maintenance: maintenanceRooms,
        occupancyRate,
      },
      finance: {
        currentMonth,
        currentYear,
        totalInvoicedThisMonth,
        totalCollectedThisMonth,
        totalOutstandingDebt,
      },
      alerts: {
        pendingApprovalsCount,
        pendingFeedbacksCount,
      },
    });
  } catch (error) {
    console.error('Lỗi khi lấy thống kê dashboard:', error);
    return res.status(500).json({ message: 'Lỗi khi tải dữ liệu thống kê.' });
  }
};

export const getRevenueStats = async (req, res) => {
  try {
    // Lấy tất cả hóa đơn đã thanh toán để tổng hợp theo tháng
    const invoices = await prisma.invoice.findMany({
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });

    const monthlyMap = {};

    invoices.forEach((inv) => {
      const key = `${inv.month}/${inv.year}`;
      if (!monthlyMap[key]) {
        monthlyMap[key] = {
          label: `T${inv.month}/${inv.year}`,
          month: inv.month,
          year: inv.year,
          roomRevenue: 0,
          utilityRevenue: 0,
          totalRevenue: 0,
          unpaidAmount: 0,
        };
      }

      if (inv.status === 'PAID') {
        const utilAmount = inv.electricityCharge + inv.waterCharge + inv.internetCharge + inv.trashCharge + inv.otherCharge;
        monthlyMap[key].roomRevenue += inv.roomCharge;
        monthlyMap[key].utilityRevenue += utilAmount;
        monthlyMap[key].totalRevenue += inv.totalAmount;
      } else {
        monthlyMap[key].unpaidAmount += inv.totalAmount;
      }
    });

    const chartData = Object.values(monthlyMap);
    return res.json(chartData);
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu biểu đồ doanh thu:', error);
    return res.status(500).json({ message: 'Lỗi khi tải dữ liệu doanh thu.' });
  }
};
