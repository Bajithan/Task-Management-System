const TaskService = require('../services/task.service');
const UserService = require('../services/user.service');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { emitRealTimeEvent } = require('../websocket/socket');

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
            return successResponse(res, tasks, 'Tasks retrieved successfully');
        } catch (error) {
            console.error("Error retrieving tasks:", error);
            return errorResponse(res, error.message, 500);
        }
    },

    async createTask(req, res) {
        try {
            const taskData = {
                ...req.body,
                created_by: req.user.user_id,
            };
            const task = await TaskService.addTask(taskData);
            
            // Trigger task assignment notification
            if (task.assigned_to) {
                const io = req.app.get('io');
                let changerName = 'A team member';
                try {
                    const changer = await UserService.getUserById(req.user.user_id);
                    if (changer) {
                        changerName = `${changer.first_name} ${changer.last_name}`;
                    }
                } catch (err) {
                    console.error("Failed to fetch changer details:", err);
                }
                emitRealTimeEvent(io, task.assigned_to, 'task-assigned', `${changerName} assigned you to task: "${task.title}"`);
            }

            return successResponse(res, task, 'Task created successfully', 201);
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    },

    async getTaskById(req, res) {
        try {
            const task = await TaskService.fetchTaskById(req.params.id);
            return successResponse(res, task, 'Task retrieved successfully');
        } catch (error) {
            return errorResponse(res, error.message, 404);
        }
    },

    async updateTask(req, res) {
        try {
            // Get original task before update to compare assignment/status changes
            const oldTask = await TaskService.fetchTaskById(req.params.id);
            const task = await TaskService.updateTask(req.params.id, req.body);

            const io = req.app.get('io');
            console.log("NOTIF DEBUG [UpdateTask]:", {
                oldAssignee: oldTask?.assigned_to,
                newAssignee: task?.assigned_to,
                oldStatus: oldTask?.status,
                newStatus: task?.status,
            });
            let changerName = 'A team member';
            try {
                const changer = await UserService.getUserById(req.user.user_id);
                if (changer) {
                    changerName = `${changer.first_name} ${changer.last_name}`;
                }
            } catch (err) {
                console.error("Failed to fetch changer details:", err);
            }
            
            // If assignee changed, notify the new assignee
            if (task.assigned_to && task.assigned_to !== oldTask.assigned_to) {
                console.log("NOTIF DEBUG [UpdateTask]: Triggering task-assigned to user", task.assigned_to);
                emitRealTimeEvent(io, task.assigned_to, 'task-assigned', `${changerName} assigned you to task: "${task.title}"`);
            }
            // If status changed, notify appropriate parties
            if (task.status !== oldTask.status) {
                const changerId = req.user.user_id;
                console.log("NOTIF DEBUG [UpdateTask]: Status changed. Changer:", changerId);
                // Notify assignee (if not the changer)
                if (task.assigned_to && task.assigned_to !== changerId) {
                    console.log("NOTIF DEBUG [UpdateTask]: Triggering status-changed to assignee", task.assigned_to);
                    emitRealTimeEvent(io, task.assigned_to, 'status-changed', `${changerName} changed status of task "${task.title}" to "${task.status}"`);
                }
                // Notify creator (Project Manager) (if not the changer)
                if (task.created_by && task.created_by !== changerId) {
                    console.log("NOTIF DEBUG [UpdateTask]: Triggering status-changed to creator/PM", task.created_by);
                    emitRealTimeEvent(io, task.created_by, 'status-changed', `${changerName} changed status of task "${task.title}" to "${task.status}"`);
                }
            }

            // If due date changed, notify appropriate parties
            const oldDueDateStr = oldTask.due_date ? String(oldTask.due_date).split('T')[0] : null;
            const newDueDateStr = task.due_date ? String(task.due_date).split('T')[0] : null;
            if (newDueDateStr !== oldDueDateStr) {
                const changerId = req.user.user_id;
                const formattedDate = task.due_date ? task.due_date : 'no due date';
                console.log("NOTIF DEBUG [UpdateTask]: Due date changed. Changer:", changerId);
                if (task.assigned_to && task.assigned_to !== changerId) {
                    console.log("NOTIF DEBUG [UpdateTask]: Triggering due-date task-updated to assignee", task.assigned_to);
                    emitRealTimeEvent(io, task.assigned_to, 'task-updated', `${changerName} changed due date of task "${task.title}" to ${formattedDate}`);
                }
                if (task.created_by && task.created_by !== changerId) {
                    console.log("NOTIF DEBUG [UpdateTask]: Triggering due-date task-updated to creator/PM", task.created_by);
                    emitRealTimeEvent(io, task.created_by, 'task-updated', `${changerName} changed due date of task "${task.title}" to ${formattedDate}`);
                }
            }

            // If description changed, notify appropriate parties
            const oldDesc = oldTask.description ? oldTask.description.trim() : '';
            const newDesc = task.description ? task.description.trim() : '';
            if (newDesc !== oldDesc) {
                const changerId = req.user.user_id;
                console.log("NOTIF DEBUG [UpdateTask]: Description changed. Changer:", changerId);
                if (task.assigned_to && task.assigned_to !== changerId) {
                    console.log("NOTIF DEBUG [UpdateTask]: Triggering description task-updated to assignee", task.assigned_to);
                    emitRealTimeEvent(io, task.assigned_to, 'task-updated', `${changerName} updated description of task "${task.title}"`);
                }
                if (task.created_by && task.created_by !== changerId) {
                    console.log("NOTIF DEBUG [UpdateTask]: Triggering description task-updated to creator/PM", task.created_by);
                    emitRealTimeEvent(io, task.created_by, 'task-updated', `${changerName} updated description of task "${task.title}"`);
                }
            }

            // If priority changed, notify appropriate parties
            if (task.priority !== oldTask.priority) {
                const changerId = req.user.user_id;
                console.log("NOTIF DEBUG [UpdateTask]: Priority changed. Changer:", changerId);
                if (task.assigned_to && task.assigned_to !== changerId) {
                    console.log("NOTIF DEBUG [UpdateTask]: Triggering priority task-updated to assignee", task.assigned_to);
                    emitRealTimeEvent(io, task.assigned_to, 'task-updated', `${changerName} changed priority of task "${task.title}" to "${task.priority}"`);
                }
                if (task.created_by && task.created_by !== changerId) {
                    console.log("NOTIF DEBUG [UpdateTask]: Triggering priority task-updated to creator/PM", task.created_by);
                    emitRealTimeEvent(io, task.created_by, 'task-updated', `${changerName} changed priority of task "${task.title}" to "${task.priority}"`);
                }
            }

            return successResponse(res, task, 'Task updated successfully');
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    },

    async updateStatus(req, res) {
        try {
            const oldTask = await TaskService.fetchTaskById(req.params.id);
            const task = await TaskService.updateTaskStatus(
                req.params.id,
                req.body.status,
                req.user.user_id,
                req.user.role
            );
            
            console.log("NOTIF DEBUG [UpdateStatus]:", {
                oldStatus: oldTask?.status,
                newStatus: task?.status,
                assignee: task?.assigned_to
            });
            // Notify the assignee and creator if status changed
            if (task.status !== oldTask.status) {
                const io = req.app.get('io');
                const changerId = req.user.user_id;
                let changerName = 'A team member';
                try {
                    const changer = await UserService.getUserById(changerId);
                    if (changer) {
                        changerName = `${changer.first_name} ${changer.last_name}`;
                    }
                } catch (err) {
                    console.error("Failed to fetch changer details:", err);
                }
                console.log("NOTIF DEBUG [UpdateStatus]: Status changed. Changer:", changerId);
                // Notify assignee (if not the changer)
                if (task.assigned_to && task.assigned_to !== changerId) {
                    console.log("NOTIF DEBUG [UpdateStatus]: Triggering status-changed to assignee", task.assigned_to);
                    emitRealTimeEvent(io, task.assigned_to, 'status-changed', `${changerName} changed status of task "${task.title}" to "${task.status}"`);
                }
                // Notify creator (Project Manager) (if not the changer)
                if (task.created_by && task.created_by !== changerId) {
                    console.log("NOTIF DEBUG [UpdateStatus]: Triggering status-changed to creator/PM", task.created_by);
                    emitRealTimeEvent(io, task.created_by, 'status-changed', `${changerName} changed status of task "${task.title}" to "${task.status}"`);
                }
            }

            return successResponse(res, task, 'Task status updated successfully');
        } catch (error) {
            return errorResponse(res, error.message, error.statusCode || 400);
        }
    },

    async deleteTask(req, res) {
        try {
            await TaskService.removeTask(req.params.id);
            return successResponse(res, null, 'Task deleted successfully', 200);
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    }
};

module.exports = TaskController;