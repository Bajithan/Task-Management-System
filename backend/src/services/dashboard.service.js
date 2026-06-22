
const dashboardModel = require('../models/dashboard.model');

async function getSummary() {
  try {
    const [
      byStatus,
      byPriority,
      overdueTasks,
      projectProgress,
      weeklyCompletion,
    ] = await Promise.all([
      dashboardModel.countTasksByStatus(),
      dashboardModel.countTasksByPriority(),
      dashboardModel.getOverdueTasks(),
      dashboardModel.getProjectProgress(),
      dashboardModel.getWeeklyCompletion(),
    ]);

    return {
      summary: {
        total: (byStatus['To Do'] || 0) + (byStatus['In Progress'] || 0) + (byStatus['Completed'] || 0),
        completed: byStatus['Completed'] || 0,
        inProgress: byStatus['In Progress'] || 0,
        overdue: overdueTasks.length,
      },
      byStatus,
      byPriority,
      projectProgress,
      weeklyCompletion,
    };

  } catch (error) {
    console.error('DASHBOARD ERROR:', error);
    throw new Error('Failed to fetch dashboard summary: ' + error.message);
  }
}
async function getSystemConfig() {
  try {
    const stats = await dashboardModel.getSystemStats();
    return stats;
  } catch (error) {
    console.error('SYSTEM CONFIG ERROR:', error);
    throw new Error('Failed to fetch system config: ' + error.message);
  }
}

module.exports = { getSummary };
module.exports = { getSummary, getSystemConfig };