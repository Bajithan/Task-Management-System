import { useState, useEffect } from 'react';
import { getComments, createComment, deleteComment, uploadAttachment } from '../../api/commentsApi';
import { useWebSocket } from '../../hooks/useWebSocket';

const CommentSection = ({ taskId }) => {
    const [comments, setComments] = useState([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
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
        if (!newCommentText.trim() && !selectedFile) return;

        try {
            let attachmentUrl = null;
            let fileName = null;

            if (selectedFile) {
                setIsUploading(true);
                const uploadRes = await uploadAttachment(selectedFile);
                attachmentUrl = uploadRes.url;
                fileName = uploadRes.name;
            }

            await createComment(taskId, newCommentText || `Uploaded attachment: ${fileName}`, attachmentUrl, fileName);
            const updated = await getComments(taskId);
            setComments(updated);
            setNewCommentText('');
            setSelectedFile(null);
        } catch (error) {
            console.error("Error adding comment:", error);
            alert("Failed to post comment or upload attachment");
        } finally {
            setIsUploading(false);
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
            <h3 style={{ fontSize: '15px', color: '#1a1a2e', fontFamily: 'Inter, sans-serif' }}>Comments</h3>

            <div style={{ marginBottom: '15px' }}>
                {comments.length === 0 ? (
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>No comments yet. Be the first!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.comment_id} style={{ padding: '12px', backgroundColor: '#f8f9fa', marginBottom: '10px', borderRadius: '6px', border: '1px solid #edf2f7' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ fontSize: '13px', color: '#1a1a2e' }}>
                                    {comment.user_name || `User ${comment.user_id}`}
                                </strong>
                                <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                                    {new Date(comment.created_at).toLocaleString()}
                                </span>
                            </div>
                            <p style={{ margin: '6px 0', fontSize: '13.5px', color: '#2d3748', lineHeight: 1.4 }}>{comment.text}</p>
                            
                            {/* Render Attachment Link if present */}
                            {comment.attachment_url && (
                                <div style={{ margin: '8px 0', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4f46e5' }}>
                                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                    </svg>
                                    <a 
                                        href={comment.attachment_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}
                                    >
                                        {comment.file_name || 'View Attachment'}
                                    </a>
                                </div>
                            )}

                            <button
                                onClick={() => handleDelete(comment.comment_id)}
                                style={{ color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer', padding: '0', fontSize: '11.5px', fontWeight: 500 }}
                            >
                                Delete
                            </button>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                        type="text"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        disabled={isUploading}
                        style={{ flexGrow: '1', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                    />
                    
                    {/* Attachment Selection Trigger */}
                    <input
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        style={{ display: 'none' }}
                        id="comment-file-input"
                        disabled={isUploading}
                    />
                    <label 
                        htmlFor="comment-file-input" 
                        style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f7fafc', transition: 'background-color 0.15s' }}
                        title="Attach file"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4b5563' }}>
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>
                    </label>

                    <button 
                        type="submit" 
                        disabled={isUploading}
                        style={{ padding: '8px 16px', backgroundColor: isUploading ? '#a5b4fc' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}
                    >
                        {isUploading ? 'Uploading...' : 'Post'}
                    </button>
                </div>

                {/* Selected File Badge */}
                {selectedFile && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#4f46e5', backgroundColor: '#e0e7ff', padding: '6px 12px', borderRadius: '4px', width: 'fit-content', border: '1px solid #c7d2fe' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4f46e5' }}>
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>
                        <span style={{ fontWeight: 500 }}>{selectedFile.name}</span>
                        <button 
                            type="button"
                            onClick={() => setSelectedFile(null)} 
                            style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold', padding: 0, marginLeft: '4px', display: 'flex', alignItems: 'center', fontSize: '13px' }}
                        >
                            ✕
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default CommentSection;