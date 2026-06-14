// frontend/src/api/commentsApi.js

// This is the address of the backend we just built
const API_URL = 'http://localhost:5000/api/comments';

// We need to grab the user's secret "badge" (token) to prove they are logged in
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// 1. Fetch comments for a specific task
export const getComments = async (taskId) => {
    const response = await fetch(`${API_URL}/task/${taskId}`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch comments');
    return await response.json();
};

// 2. Add a new comment
export const createComment = async (taskId, text) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ taskId, text }),
    });
    if (!response.ok) throw new Error('Failed to create comment');
    return await response.json();
};

// 3. Delete a comment
export const deleteComment = async (commentId) => {
    const response = await fetch(`${API_URL}/${commentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete comment');
    return await response.json();
};