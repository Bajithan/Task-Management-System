const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/rbac.middleware');
const projectController = require('../controllers/project.controller');

// Lightweight names-only endpoint, accessible to Collaborator too
router.get('/names', authenticate, allowRoles('Project Manager', 'Collaborator'), projectController.getProjectNames);

router.get('/', authenticate, allowRoles('Project Manager'), projectController.getProjects);
router.post('/', authenticate, allowRoles('Project Manager'), projectController.createProject);
router.get('/:id', authenticate, allowRoles('Project Manager'), projectController.getProjectById);
router.put('/:id', authenticate, allowRoles('Project Manager'), projectController.updateProject);
router.delete('/:id', authenticate, allowRoles('Project Manager'), projectController.deleteProject);

module.exports = router;