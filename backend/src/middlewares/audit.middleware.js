const supabase = require('../config/db');

const auditLog = (action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user ? req.user.user_id : null;
      await supabase.from('Audit_Logs').insert({
        user_id: userId,
        action,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });
    } catch (err) {
      console.error('Audit log failed:', err.message);
    }
    next();
  };
};

module.exports = { auditLog };