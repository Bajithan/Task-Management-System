// backend/src/routes/comment.routes.js
const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/comment.controller');
const authMiddleware = require('../middlewares/auth.middleware'); // Member 1 built this to check passwords!

// Require the user to be logged in for all comment actions
router.use(authMiddleware);

// The Map: Connects URLs to your Controller functions
router.post('/', CommentController.addComment);
router.get('/task/:taskId', CommentController.getComments);
router.delete('/:commentId', CommentController.deleteComment);

module.exports = router;