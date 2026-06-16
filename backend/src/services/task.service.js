const Task = require('../models/task.model');

const TaskService = {
    async fetchAllTasks() {
        return await Task.getAll();
    },

    async addTask(taskData) {
        if (!taskData.title) {
            throw new Error("Task title is required");
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
        return await Task.update(taskId, taskData);
    },

    async updateTaskStatus(taskId, status) {
        const validStatuses = ['To Do', 'In Progress', 'Completed'];
        if (!validStatuses.includes(status)) {
            throw new Error("Invalid status. Must be To Do, In Progress, or Completed");
        }
        const task = await Task.getById(taskId);
        if (!task) {
            throw new Error("Task not found");
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