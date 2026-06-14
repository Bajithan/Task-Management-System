// backend/src/controllers/comment.controller.js
const CommentService = require('../services/comment.service');

// Handle incoming request to add a comment
const addComment = async (req, res) => {
    try {
        const { taskId, task_id, text } = req.body; // Data sent from the frontend
        const resolvedTaskId = taskId ?? task_id;
        const userId = req.user.user_id; // The logged-in user's ID from auth payload

        if (!resolvedTaskId) {
            return res.status(400).json({ error: 'taskId is required' });
        }

        const newComment = await CommentService.addComment(resolvedTaskId, userId, text);
        res.status(201).json(newComment); // Send the new comment back to the frontend
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Handle incoming request to view comments
const getComments = async (req, res) => {
    try {
        const { taskId } = req.params; // The task ID from the web address
        
        const comments = await CommentService.getComments(taskId);
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Handle incoming request to delete a comment
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.user_id;
        const userRole = req.user.role; // Used to check if they are an Admin
        
        await CommentService.deleteComment(commentId, userId, userRole);
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        // If they aren't the owner or admin, send a 403 Forbidden error
        res.status(403).json({ error: error.message });
    }
};

module.exports = {
    addComment,
    getComments,
    deleteComment
};