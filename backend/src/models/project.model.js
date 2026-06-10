const supabase = require('../config/db');

async function createProject(data) {
  const { data: project, error } = await supabase
    .from('projects')
    .insert([data])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return project;
}

async function findAll() {
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return projects;
}

async function findById(projectId) {
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();
  if (error) throw new Error(error.message);
  return project;
}

async function updateProject(projectId, updates) {
  const { data: project, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return project;
}

async function deleteProject(projectId) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);
  if (error) throw new Error(error.message);
  return true;
}

module.exports = { createProject, findAll, findById, updateProject, deleteProject };