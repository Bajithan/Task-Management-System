// backend/src/controllers/comment.controller.js
const CommentService = require('../services/comment.service');
const TaskService = require('../services/task.service');
const UserService = require('../services/user.service');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { emitRealTimeEvent } = require('../websocket/socket');

// Handle incoming request to add a comment
const addComment = async (req, res) => {
    try {
        const { taskId, task_id, text } = req.body; // Data sent from the frontend
        const resolvedTaskId = taskId ?? task_id;
        const userId = req.user.user_id; // The logged-in user's ID from auth payload

        if (!resolvedTaskId) {
            return errorResponse(res, 'taskId is required', 400);
        }

        const newComment = await CommentService.addComment(resolvedTaskId, userId, text);

        // Notify the task assignee and creator/PM (if not the commenter themselves!)
        try {
            const task = await TaskService.fetchTaskById(resolvedTaskId);
            const io = req.app.get('io');
            
            let authorName = 'A team member';
            try {
                const commenter = await UserService.getUserById(userId);
                if (commenter) {
                    authorName = `${commenter.first_name} ${commenter.last_name}`;
                }
            } catch (err) {
                console.error("Failed to fetch commenter details:", err);
            }
            
            const summaryText = text.length > 40 ? `${text.substring(0, 40)}...` : text;
            
            console.log("NOTIF DEBUG [Comment]:", {
                taskFound: !!task,
                assignedTo: task?.assigned_to,
                createdBy: task?.created_by,
                commenterId: userId,
            });

            // Notify assignee (if they didn't write the comment)
            if (task && task.assigned_to && task.assigned_to !== userId) {
                console.log("NOTIF DEBUG [Comment]: Triggering comment-added to assignee", task.assigned_to);
                await emitRealTimeEvent(io, task.assigned_to, 'comment-added', `${authorName} commented on task "${task.title}": "${summaryText}"`);
            }
            
            // Notify creator/PM (if they didn't write the comment)
            if (task && task.created_by && task.created_by !== userId) {
                console.log("NOTIF DEBUG [Comment]: Triggering comment-added to creator/PM", task.created_by);
                await emitRealTimeEvent(io, task.created_by, 'comment-added', `${authorName} commented on task "${task.title}": "${summaryText}"`);
            }
        } catch (err) {
            console.error("Failed to trigger comment notification:", err);
        }

        return successResponse(res, newComment, 'Comment added successfully', 201);
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

// Handle incoming request to view comments
const getComments = async (req, res) => {
    try {
        const { taskId } = req.params; // The task ID from the web address
        
        const comments = await CommentService.getComments(taskId);
        return successResponse(res, comments, 'Comments retrieved successfully');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

// Handle incoming request to delete a comment
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.user_id;
        const userRole = req.user.role; // Used to check if they are an Admin
        
        await CommentService.deleteComment(commentId, userId, userRole);
        return successResponse(res, null, 'Comment deleted successfully');
    } catch (error) {
        // If they aren't the owner or admin, send a 403 Forbidden error
        return errorResponse(res, error.message, 403);
    }
};

module.exports = {
    addComment,
    getComments,
    deleteComment
};