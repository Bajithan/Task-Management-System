const projectService = require('../services/project.service');
const { successResponse, errorResponse } = require('../utils/responseHelper');

async function createProject(req, res) {
  try {
    const project = await projectService.createProject(req.body);
    return res.status(201).json(successResponse('Project created', project));
  } catch (err) {
    return res.status(err.statusCode || 500).json(errorResponse(err.message));
  }
}

async function getProjects(req, res) {
  try {
    const projects = await projectService.getProjects();
    return res.status(200).json(successResponse('Projects fetched', projects));
  } catch (err) {
    return res.status(500).json(errorResponse(err.message));
  }
}

async function getProjectById(req, res) {
  try {
    const project = await projectService.getProjectById(req.params.id);
    return res.status(200).json(successResponse('Project fetched', project));
  } catch (err) {
    return res.status(err.statusCode || 500).json(errorResponse(err.message));
  }
}

async function updateProject(req, res) {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    return res.status(200).json(successResponse('Project updated', project));
  } catch (err) {
    return res.status(err.statusCode || 500).json(errorResponse(err.message));
  }
}

async function deleteProject(req, res) {
  try {
    await projectService.deleteProject(req.params.id);
    return res.status(200).json(successResponse('Project deleted', null));
  } catch (err) {
    return res.status(err.statusCode || 500).json(errorResponse(err.message));
  }
}

module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject };