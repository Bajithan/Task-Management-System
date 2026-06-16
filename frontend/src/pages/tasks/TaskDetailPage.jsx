import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTaskById } from '../../api/tasksApi';
import CommentSection from '../../components/comments/CommentSection';
const TaskDetailPage = () => {
    const { id } = useParams();
    const [task, setTask] = useState(null);

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const { data } = await getTaskById(id);
                setTask(data);
            } catch (error) {
                console.error("Error fetching task details:", error);
            }
        };
        fetchTask();
    }, [id]);

    if (!task) return <div>Loading...</div>;

    return (
        <div>
            <h1>{task.title}</h1>
            <p>Priority: {task.priority}</p>
            <p>Status: {task.status}</p>
            <p>Assigned To: {task.assigned_to}</p>
            
            {/* Edit form would go here */}

            {/* MEMBER 4 - CommentSection goes here */}
            <CommentSection taskId={task.task_id} />
        </div>
    );
};

export default TaskDetailPage;