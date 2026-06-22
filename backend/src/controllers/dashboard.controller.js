const dashboardService = require('../services/dashboard.service');

// GET /api/dashboard/summary
async function getSummary(req, res) {
  try {
    // Call the service to get all dashboard data
    const data = await dashboardService.getSummary();

    // Send success response
    res.status(200).json({
      success: true,
      data: data,
    });

  } catch (error) {
    // Send error response
    res.status(500).json({
      success: false,
      errorCode: 500,
      message: 'Internal Server Error',
      description: error.message,
    });
  }
}
async function getSystemConfig(req, res) {
  try {
    const data = await dashboardService.getSystemConfig();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      errorCode: 500,
      message: 'Internal Server Error',
      description: error.message,
    });
  }
}
module.exports = { getSummary };
module.exports = { getSummary, getSystemConfig };