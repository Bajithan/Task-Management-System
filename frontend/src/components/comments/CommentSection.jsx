// frontend/src/components/comments/CommentSection.jsx
import { useState, useEffect } from 'react';
import { getComments, createComment, deleteComment } from '../../api/commentsApi';

// The "taskId" is passed in by whoever uses this Lego brick
const CommentSection = ({ taskId }) => {
    // 1. Set up our memory for this component
    const [comments, setComments] = useState([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // 2. Fetch the comments as soon as this loads
    useEffect(() => {
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
        
        if (taskId) {
            fetchComments();
        }
    }, [taskId]);

    // 3. Handle what happens when the user clicks "Post"
    const handleSubmit = async (e) => {
        e.preventDefault(); // Stops the page from fully refreshing
        if (!newCommentText.trim()) return; // Don't allow blank comments

        try {
            const addedComment = await createComment(taskId, newCommentText);
            // Add the brand new comment to the bottom of our current list
            setComments([...comments, addedComment]);
            setNewCommentText(''); // Clear out the typing box
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    // 4. Handle deleting a comment
    const handleDelete = async (commentId) => {
        try {
            await deleteComment(commentId);
            // Remove the deleted comment from the screen instantly
            setComments(comments.filter(comment => comment.id !== commentId));
        } catch (error) {
            console.error("Error deleting comment:", error);
            alert("You are not allowed to delete this comment.");
        }
    };

    if (isLoading) return <p>Loading comments...</p>;

    // 5. This is what actually draws on the screen
    return (
        <div className="comment-section" style={{ borderTop: '1px solid #ccc', marginTop: '20px', paddingTop: '20px' }}>
            <h3>Comments</h3>
            
            <div className="comments-list" style={{ marginBottom: '15px' }}>
                {comments.length === 0 ? (
                    <p>No comments yet. Be the first!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} style={{ padding: '10px', backgroundColor: '#f9f9f9', marginBottom: '10px', borderRadius: '5px' }}>
                            <strong>User {comment.user_id}</strong>
                            <span style={{ fontSize: '0.8em', color: 'gray', marginLeft: '10px' }}>
                                {new Date(comment.created_at).toLocaleString()}
                            </span>
                            <p style={{ margin: '5px 0' }}>{comment.text}</p>
                            <button 
                                onClick={() => handleDelete(comment.id)}
                                style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', padding: '0' }}
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
                    style={{ flexGrow: '1', padding: '8px' }}
                />
                <button type="submit" style={{ padding: '8px 15px' }}>Post Comment</button>
            </form>
        </div>
    );
};

export default CommentSection;