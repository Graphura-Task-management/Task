const ExcelJS = require("exceljs");
const User = require("../models/User");
const Task = require("../models/Task");

// JSON performance report
const getPerformanceReport = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ["leader", "employee"] } });

    const report = await Promise.all(
      users.map(async (user) => {
        const totalTasks = await Task.countDocuments({ assignedTo: user._id });
        const completedTasks = await Task.countDocuments({ assignedTo: user._id, status: "completed" });
        const completionRate = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

        const tasksWithTime = await Task.find({
          assignedTo: user._id,
          status: "completed",
          createdAt: { $exists: true },
          completedAt: { $exists: true },
        });

        let avgTime = 0;
        if (tasksWithTime.length > 0) {
          const totalTime = tasksWithTime.reduce(
            (sum, task) => sum + (new Date(task.completedAt) - new Date(task.createdAt)),
            0
          );
          avgTime = totalTime / tasksWithTime.length / (1000 * 60); // minutes
        }

        return {
          userId: user._id,
          name: user.name,
          role: user.role,
          totalTasks,
          completedTasks,
          completionRate: completionRate.toFixed(2) + "%",
          averageTimeMinutes: avgTime.toFixed(2),
        };
      })
    );

    res.json({ success: true, data: report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Excel export
const exportPerformanceExcel = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ["leader", "employee"] } });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Performance Report");

    // Header row
    sheet.addRow(["Name", "Role", "Total Tasks", "Completed Tasks", "Completion Rate", "Average Time (Minutes)"]);

    // Data rows
    for (const user of users) {
      const totalTasks = await Task.countDocuments({ assignedTo: user._id });
      const completedTasks = await Task.countDocuments({ assignedTo: user._id, status: "completed" });
      const completionRate = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

      const tasksWithTime = await Task.find({ assignedTo: user._id, status: "completed" });
      let avgTime = 0;
      if (tasksWithTime.length > 0) {
        const totalTime = tasksWithTime.reduce(
          (sum, task) => sum + (new Date(task.completedAt) - new Date(task.createdAt)),
          0
        );
        avgTime = totalTime / tasksWithTime.length / (1000 * 60); // minutes
      }

      sheet.addRow([user.name, user.role, totalTasks, completedTasks, completionRate.toFixed(2) + "%", avgTime.toFixed(2)]);
    }

    // Send Excel file
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=performance.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getPerformanceReport,
  exportPerformanceExcel,
};