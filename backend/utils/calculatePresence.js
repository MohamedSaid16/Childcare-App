const Attendance = require('../models/Attendance');

// Calculate total presence duration for a child in a period
exports.calculatePresenceDuration = async (childId, startDate, endDate) => {
  try {
    const attendanceRecords = await Attendance.find({
      child: childId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      status: 'present'
    });

    let totalMinutes = 0;
    let totalDays = 0;

    attendanceRecords.forEach(record => {
      if (record.duration) {
        totalMinutes += record.duration;
        totalDays++;
      }
    });

    return {
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60 * 100) / 100,
      totalDays,
      averageDailyMinutes: totalDays > 0 ? Math.round(totalMinutes / totalDays) : 0
    };
  } catch (error) {
    throw error;
  }
};

// Calculate monthly attendance statistics
exports.calculateMonthlyStats = async (childId, year, month) => {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendanceRecords = await Attendance.find({
      child: childId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    const stats = {
      present: 0,
      absent: 0,
      sick: 0,
      vacation: 0,
      totalDays: attendanceRecords.length,
      totalMinutes: 0
    };

    attendanceRecords.forEach(record => {
      stats[record.status]++;
      if (record.duration) {
        stats.totalMinutes += record.duration;
      }
    });

    return stats;
  } catch (error) {
    throw error;
  }
};