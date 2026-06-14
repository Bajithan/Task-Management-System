const projectService = require('../services/project.service');
const { successResponse, errorResponse } = require('../utils/responseHelper');

async function createProject(req, res) {
  try {
    const projectData = {
      ...req.body,
      created_by: req.user.user_id,
    };
    const project = await projectService.createProject(projectData);
    return successResponse(res, project, 'Project created', 201);
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

async function getProjects(req, res) {
  try {
    const projects = await projectService.getProjects();
    return successResponse(res, projects, 'Projects fetched');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
}

async function getProjectById(req, res) {
  try {
    const project = await projectService.getProjectById(req.params.id);
    return successResponse(res, project, 'Project fetched');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

async function updateProject(req, res) {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    return successResponse(res, project, 'Project updated');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

async function deleteProject(req, res) {
  try {
    await projectService.deleteProject(req.params.id);
    return successResponse(res, null, 'Project deleted');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject };