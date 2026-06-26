const supabase = require('../config/db');

const createComment = async (data) => {
    const { data: comment, error } = await supabase
        .from('Comments')
        .insert([{
            text: data.text,
            task_id: data.task_id,
            user_id: data.user_id,
            attachment_url: data.attachment_url || null,
            file_name: data.file_name || null
        }])
        .select()
        .single();
    if (error) throw error;
    return comment;
};

const findByTask = async (taskId) => {
    const { data: comments, error } = await supabase
        .from('Comments')
        .select(`
            comment_id,
            text,
            task_id,
            user_id,
            attachment_url,
            file_name,
            created_at,
            Users ( first_name, last_name )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

    if (error) throw error;

    return comments.map(c => ({
        comment_id: c.comment_id,
        text: c.text,
        task_id: c.task_id,
        user_id: c.user_id,
        attachment_url: c.attachment_url,
        file_name: c.file_name,
        created_at: c.created_at,
        user_name: c.Users ? `${c.Users.first_name} ${c.Users.last_name}` : 'Unknown User',
    }));
};

const deleteComment = async (commentId) => {
    const { error } = await supabase
        .from('Comments')
        .delete()
        .eq('comment_id', commentId);
    if (error) throw error;
    return true;
};

module.exports = { createComment, findByTask, deleteComment };