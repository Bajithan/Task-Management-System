const supabase = require('../config/db');

async function countTasksByStatus() {
  const { data, error } = await supabase
    .from('Tasks')
    .select('status');
  if (error) throw error;
  const counts = { 'To Do': 0, 'In Progress': 0, 'Completed': 0 };
  data.forEach(task => {
    if (counts[task.status] !== undefined) counts[task.status]++;
  });
  return counts;
}

async function countTasksByPriority() {
  const { data, error } = await supabase
    .from('Tasks')
    .select('priority');
  if (error) throw error;
  const counts = { Low: 0, Medium: 0, High: 0 };
  data.forEach(task => {
    if (counts[task.priority] !== undefined) counts[task.priority]++;
  });
  return counts;
}

async function getOverdueTasks() {
  const today = new Date().toISOString();
  const { data, error } = await supabase
    .from('Tasks')
    .select('*')
    .lt('due_date', today)
    .neq('status', 'Completed');
  if (error) throw error;
  return data;
}

async function getProjectProgress() {
  const { data, error } = await supabase
    .from('Tasks')
    .select('project_id, status');
  if (error) throw error;
  const projects = {};
  data.forEach(task => {
    if (!projects[task.project_id]) {
      projects[task.project_id] = { total: 0, completed: 0 };
    }
    projects[task.project_id].total++;
    if (task.status === 'Completed') projects[task.project_id].completed++;
  });
  return projects;
}

async function getWeeklyCompletion() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { data, error } = await supabase
    .from('Tasks')
    .select('*')
    .eq('status', 'Completed')
    .gte('created_at', sevenDaysAgo.toISOString());
  if (error) throw error;
  return data;
}

async function getSystemStats() {
  const [usersResult, projectsResult, tasksResult, auditResult] = await Promise.all([
    supabase.from('Users').select('user_id, is_active'),
    supabase.from('Projects').select('project_id'),
    supabase.from('Tasks').select('task_id'),
    supabase.from('Audit_Logs').select('*').order('created_at', { ascending: false }).limit(50),
  ]);

  if (usersResult.error) throw usersResult.error;
  if (projectsResult.error) throw projectsResult.error;
  if (tasksResult.error) throw tasksResult.error;
  if (auditResult.error) throw auditResult.error;

  const totalUsers = usersResult.data.length;
  const activeUsers = usersResult.data.filter(u => u.is_active).length;
  const inactiveUsers = totalUsers - activeUsers;

  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
    totalProjects: projectsResult.data.length,
    totalTasks: tasksResult.data.length,
    recentAuditLogs: auditResult.data,
  };
}

module.exports = {
  countTasksByStatus,
  countTasksByPriority,
  getOverdueTasks,
  getProjectProgress,
  getWeeklyCompletion,
  getSystemStats,
};