// backend/src/routes/comment.routes.js
const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/comment.controller');
const { authenticate } = require('../middlewares/auth.middleware'); // Pulling out the exact tool Member 1 built!

// Require the user to be logged in for all comment actions
router.use(authenticate);

// The Map: Connects URLs to your Controller functions
router.post('/', CommentController.addComment);
router.get('/task/:taskId', CommentController.getComments);
router.delete('/:commentId', CommentController.deleteComment);

module.exports = router;