const TaskService = require('../services/task.service');

const TaskController = {
    async getAllTasks(req, res) {
        try {
            const filters = {
                status: req.query.status || undefined,
                priority: req.query.priority || undefined,
                assigned_to: req.query.assigned_to || undefined,
                project_id: req.query.project_id || undefined,
                no_project: req.query.no_project === 'true' ? true : undefined,
            };
            const tasks = await TaskService.fetchAllTasks(filters);
            res.json(tasks);
        } catch (error) {
            console.error("LOOK AT THIS ERROR:", error);
            res.status(500).json({ error: error.message });
        }
    },

    async createTask(req, res) {
        try {
            const taskData = {
                ...req.body,
                created_by: req.user.user_id,
            };
            const task = await TaskService.addTask(taskData);
            res.status(201).json(task);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async getTaskById(req, res) {
        try {
            const task = await TaskService.fetchTaskById(req.params.id);
            res.json(task);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    },

    async updateTask(req, res) {
        try {
            const task = await TaskService.updateTask(req.params.id, req.body);
            res.json(task);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async updateStatus(req, res) {
        try {
            const task = await TaskService.updateTaskStatus(
                req.params.id,
                req.body.status,
                req.user.user_id,
                req.user.role
            );
            res.json(task);
        } catch (error) {
            res.status(error.statusCode || 400).json({ error: error.message });
        }
    },

    async deleteTask(req, res) {
        try {
            await TaskService.removeTask(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = TaskController;