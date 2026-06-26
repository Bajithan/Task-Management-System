// backend/src/services/comment.service.js
const CommentModel = require('../models/comment.model');

const addComment = async (taskId, userId, text, attachmentUrl = null, fileName = null) => {
    // Passes the requested data down to the database model we just made
    return await CommentModel.createComment({ 
        text, 
        task_id: taskId, 
        user_id: userId,
        attachment_url: attachmentUrl,
        file_name: fileName
    });
};

const getComments = async (taskId) => {
    return await CommentModel.findByTask(taskId);
};

const deleteComment = async (commentId, userId, userRole) => {
    // Only the comment owner or an Admin can delete a comment
    if (userRole !== 'Admin') {
        throw new Error('Unauthorized: Only an Admin or the author can delete this comment');
    }
    return await CommentModel.deleteComment(commentId);
};

module.exports = {
    addComment,
    getComments,
    deleteComment
};