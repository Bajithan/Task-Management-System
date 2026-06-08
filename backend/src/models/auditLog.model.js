const supabase = require('../config/db');

const createLog = async (userId, action, ipAddress, userAgent) => {
  const { error } = await supabase.from('Audit_Logs').insert({
    user_id: userId,
    action,
    ip_address: ipAddress,
    user_agent: userAgent,
  });
  if (error) console.error('Failed to write audit log:', error.message);
};

module.exports = { createLog };