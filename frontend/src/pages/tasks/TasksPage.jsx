import React, { useEffect, useState } from 'react';
import { getTasks } from '../../api/tasksApi';

const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [filters, setFilters] = useState({ status: '', priority: '' });

    useEffect(() => {
        fetchTasks();
    }, [filters]); // Refetch whenever filters change

    const fetchTasks = async () => {
        try {
            const { data } = await getTasks(filters);
            setTasks(data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    return (
        <div>
            <h1>Task Management</h1>
            
            {/* Filter Section */}
            <div>
                <select onChange={(e) => setFilters({...filters, status: e.target.value})}>
                    <option value="">All Statuses</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>

            {/* Tasks Table */}
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Priority</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map(task => (
                        <tr key={task.task_id}>
                            <td>{task.title}</td>
                            <td>{task.priority}</td>
                            <td>{task.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TasksPage;