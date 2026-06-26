const Task = require('../models/task.model');

const TaskService = {
    async fetchAllTasks(filters) {
        return await Task.getAll(filters);
    },

    async addTask(taskData) {
        if (!taskData.title) {
            throw new Error("Task title is required");
        }
        if (taskData.due_date) {
            const dueDate = new Date(taskData.due_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const dueDateMidnight = new Date(dueDate);
            dueDateMidnight.setHours(0, 0, 0, 0);

            if (dueDateMidnight < today) {
                throw new Error("Due date cannot be in the past");
            }
        }
        return await Task.create(taskData);
    },

    async fetchTaskById(taskId) {
        const task = await Task.getById(taskId);
        if (!task) {
            throw new Error("Task not found");
        }
        return task;
    },

    async updateTask(taskId, taskData) {
        const task = await Task.getById(taskId);
        if (!task) {
            throw new Error("Task not found");
        }
        if (taskData.due_date) {
            const oldDueDateStr = task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : null;
            const newDueDateStr = new Date(taskData.due_date).toISOString().split('T')[0];
            
            // Only validate if the due date is being changed
            if (newDueDateStr !== oldDueDateStr) {
                const dueDate = new Date(taskData.due_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const dueDateMidnight = new Date(dueDate);
                dueDateMidnight.setHours(0, 0, 0, 0);

                if (dueDateMidnight < today) {
                    throw new Error("Due date cannot be in the past");
                }
            }
        }
        return await Task.update(taskId, taskData);
    },

    async updateTaskStatus(taskId, status, userId, userRole) {
        const validStatuses = ['To Do', 'In Progress', 'Completed'];
        if (!validStatuses.includes(status)) {
            throw new Error("Invalid status. Must be To Do, In Progress, or Completed");
        }
        const task = await Task.getById(taskId);
        if (!task) {
            throw new Error("Task not found");
        }

        // Permission check:
        // 1. Collaborators can only update status on tasks assigned to them.
        // 2. Project Managers can update status if the task is unassigned, OR if the task is assigned to them.
        if (userRole === 'Collaborator') {
            if (task.assigned_to !== userId) {
                const err = new Error("You can only update status on tasks assigned to you");
                err.statusCode = 403;
                throw err;
            }
        } else if (userRole === 'Project Manager') {
            if (task.assigned_to !== null && task.assigned_to !== userId) {
                const err = new Error("Project Managers can only update status on unassigned tasks or tasks assigned to them");
                err.statusCode = 403;
                throw err;
            }
        }

        return await Task.updateStatus(taskId, status);
    },

    async removeTask(taskId) {
        const task = await Task.getById(taskId);
        if (!task) {
            throw new Error("Task not found");
        }
        return await Task.remove(taskId);
    }
};

module.exports = TaskService;