const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/rbac.middleware');
const { auditLog } = require('../middlewares/audit.middleware');

router.use(authenticate);

router.get('/assignable', allowRoles('Project Manager'), userController.getAssignableUsers);
router.put('/me', userController.updateMe);

router.use(allowRoles('Admin'));

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', auditLog('CREATE_USER'), userController.createUser);
router.put('/:id', auditLog('UPDATE_USER'), userController.updateUser);
router.patch('/:id/deactivate', auditLog('DEACTIVATE_USER'), userController.deactivateUser);

module.exports = router;