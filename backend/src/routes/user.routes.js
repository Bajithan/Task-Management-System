const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/rbac.middleware');
const { auditLog } = require('../middlewares/audit.middleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and admin user management endpoints
 */

router.use(authenticate);

/**
 * @swagger
 * /api/users/assignable:
 *   get:
 *     summary: Get assignable users (Project Manager only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retrieve list of assignable users successfully
 */
router.get('/assignable', allowRoles('Project Manager', 'Collaborator'), userController.getAssignableUsers);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Update profile of the logged-in user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/me', userController.updateMe);

router.use(allowRoles('Admin'));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retrieve list of all users successfully
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Admin, Project Manager, Collaborator]
 *     responses:
 *       201:
 *         description: User created successfully and onboarding email sent
 */
router.get('/', userController.getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user details by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Retrieve user details successfully
 *   put:
 *     summary: Update user details (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Admin, Project Manager, Collaborator]
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.get('/:id', userController.getUserById);
router.post('/', auditLog('CREATE_USER'), userController.createUser);
router.put('/:id', auditLog('UPDATE_USER'), userController.updateUser);

/**
 * @swagger
 * /api/users/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a user account (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deactivated successfully
 */
router.patch('/:id/deactivate', auditLog('DEACTIVATE_USER'), userController.deactivateUser);

/**
 * @swagger
 * /api/users/{id}/activate:
 *   patch:
 *     summary: Activate a user account (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User activated successfully
 */
router.patch('/:id/activate', auditLog('ACTIVATE_USER'), userController.activateUser);


/**
 * @swagger
 * /api/users/{id}/reset-password:
 *   post:
 *     summary: Reset password for another user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to reset password for
 *     responses:
 *       200:
 *         description: Password reset successful, temporary password returned and emailed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     tempPassword:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not Admin)
 *       404:
 *         description: User not found
 */
router.post('/:id/reset-password', auditLog('RESET_USER_PASSWORD'), userController.adminResetPassword);

module.exports = router;