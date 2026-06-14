import React, { useEffect, useState } from 'react';
import { getTasks } from '../../api/tasksApi';

const KanbanBoard = () => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const fetchTasks = async () => {
            const { data } = await getTasks();
            setTasks(data);
        };
        fetchTasks();
    }, []);

    // Filter tasks by status for each column
    const todo = tasks.filter(t => t.status === 'To Do');
    const inProgress = tasks.filter(t => t.status === 'In Progress');
    const completed = tasks.filter(t => t.status === 'Completed');

    const TaskCard = ({ task }) => (
        <div style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h3>{task.title}</h3>
            <p>Priority: {task.priority}</p>
            <p>Assigned to: {task.assigned_to}</p>
        </div>
    );

    return (
        <div style={{ display: 'flex', gap: '20px' }}>
            <div><h2>To Do</h2>{todo.map(t => <TaskCard key={t.task_id} task={t} />)}</div>
            <div><h2>In Progress</h2>{inProgress.map(t => <TaskCard key={t.task_id} task={t} />)}</div>
            <div><h2>Completed</h2>{completed.map(t => <TaskCard key={t.task_id} task={t} />)}</div>
        </div>
    );
};

export default KanbanBoard;