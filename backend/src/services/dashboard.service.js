const dashboardModel = require('../models/dashboard.model');

async function getSummary() {
  try {
    // Call all model functions at the same time (faster)
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

    // Format everything into one object for the frontend
    return {
      summary: {
        total: (byStatus['To Do'] || 0) + 
               (byStatus['In Progress'] || 0) + 
               (byStatus['Completed'] || 0),
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
    throw new Error('Failed to fetch dashboard summary: ' + error.message);
  }
}

module.exports = { getSummary };