const TaskService = require('../services/task.service');

const TaskController = {
    async getAllTasks(req, res) {
        try {
            const tasks = await TaskService.fetchAllTasks();
            res.json(tasks);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async createTask(req, res) {
        try {
            const task = await TaskService.addTask(req.body);
            res.status(201).json(task);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = TaskController;