// backend/src/routes/comment.routes.js
const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/comment.controller');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Task comments and collaboration endpoints
 */

// Require the user to be logged in for all comment actions
router.use(authenticate);

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Add a comment to a task
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - content
 *             properties:
 *               taskId:
 *                 type: integer
 *               content:
 *                 type: string
 *               attachmentUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 */
router.post('/', CommentController.addComment);

/**
 * @swagger
 * /api/comments/task/{taskId}:
 *   get:
 *     summary: Get all comments for a specific task
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Retrieve comments successfully
 */
router.get('/task/:taskId', CommentController.getComments);

/**
 * @swagger
 * /api/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 */
router.delete('/:commentId', CommentController.deleteComment);

/**
 * @swagger
 * /api/comments/upload:
 *   post:
 *     summary: Upload a file attachment for a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the file being uploaded
 *     requestBody:
 *       required: true
 *       content:
 *         application/octet-stream:
 *           schema:
 *             type: string
 *             format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 */
router.post('/upload', express.raw({ type: '*/*', limit: '10mb' }), CommentController.uploadAttachment);

module.exports = router;