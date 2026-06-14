const projectModel = require('../models/project.model');

async function createProject(data) {
  if (!data.name || data.name.trim() === '') {
    throw new Error('Project name is required');
  }
  return await projectModel.createProject(data);
}

async function getProjects() {
  return await projectModel.findAll();
}

async function getProjectById(id) {
  const project = await projectModel.findById(id);
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }
  return project;
}

async function updateProject(id, data) {
  return await projectModel.updateProject(id, data);
}

async function deleteProject(id) {
  return await projectModel.deleteProject(id);
}

module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject };