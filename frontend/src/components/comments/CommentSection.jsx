import { useState, useEffect } from 'react';
import { getComments, createComment, deleteComment } from '../../api/commentsApi';
import { useWebSocket } from '../../hooks/useWebSocket';

const CommentSection = ({ taskId }) => {
    const [comments, setComments] = useState([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchComments = async () => {
        try {
            const data = await getComments(taskId);
            setComments(data);
        } catch (error) {
            console.error("Error loading comments:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (taskId) {
            fetchComments();
        }
    }, [taskId]);

    const { socket } = useWebSocket();

    useEffect(() => {
        if (!socket || !taskId) return;

        const handleNewComment = () => {
            fetchComments();
        };

        socket.on('comment-added', handleNewComment);

        return () => {
            socket.off('comment-added', handleNewComment);
        };
    }, [socket, taskId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newCommentText.trim()) return;

        try {
      await createComment(taskId, newCommentText);
      const updated = await getComments(taskId);
      setComments(updated);
      setNewCommentText('');
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const handleDelete = async (commentId) => {
        try {
            await deleteComment(commentId);
            setComments(comments.filter(comment => comment.comment_id !== commentId));
        } catch (error) {
            console.error("Error deleting comment:", error);
            alert("You are not allowed to delete this comment.");
        }
    };

    if (isLoading) return <p>Loading comments...</p>;

    return (
        <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '20px', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '15px', color: '#1a1a2e' }}>Comments</h3>

            <div style={{ marginBottom: '15px' }}>
                {comments.length === 0 ? (
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>No comments yet. Be the first!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.comment_id} style={{ padding: '10px', backgroundColor: '#f8f9fa', marginBottom: '10px', borderRadius: '6px' }}>
                            <strong style={{ fontSize: '13px', color: '#1a1a2e' }}>
                                {comment.user_name || `User ${comment.user_id}`}
                            </strong>
                            <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '10px' }}>
                                {new Date(comment.created_at).toLocaleString()}
                            </span>
                            <p style={{ margin: '5px 0', fontSize: '14px', color: '#333' }}>{comment.text}</p>
                            <button
                                onClick={() => handleDelete(comment.comment_id)}
                                style={{ color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer', padding: '0', fontSize: '12px' }}
                            >
                                Delete
                            </button>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    style={{ flexGrow: '1', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                />
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
                    Post Comment
                </button>
            </form>
        </div>
    );
};

export default CommentSection;