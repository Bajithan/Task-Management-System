const Task = require('../models/task.model');

const TaskService = {
    async fetchAllTasks() {
        // You could add logic here, like filtering or sorting
        return await Task.getAll();
    },

    async addTask(taskData) {
        // Example logic: Ensure the task has a title before saving
        if (!taskData.title) {
            throw new Error("Task title is required");
        }
        return await Task.create(taskData);
    }
};

module.exports = TaskService;