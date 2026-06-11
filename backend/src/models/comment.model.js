// backend/src/models/comment.model.js
const supabase = require('../config/db'); // Brings in our database connection

// 1. Create a new comment
const createComment = async (data) => {
    const { data: comment, error } = await supabase
        .from('comments')
        .insert([{ 
            text: data.text, 
            task_id: data.task_id, 
            user_id: data.user_id 
        }])
        .select();
        
    if (error) throw error;
    return comment[0];
};

// 2. Find all comments for a specific task
const findByTask = async (taskId) => {
    const { data: comments, error } = await supabase
        .from('comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true }); // Shows oldest to newest
        
    if (error) throw error;
    return comments;
};

// 3. Delete a comment
const deleteComment = async (commentId) => {
    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
        
    if (error) throw error;
    return true;
};

// Export these functions so other files can use them
module.exports = {
    createComment,
    findByTask,
    deleteComment
};