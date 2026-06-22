const supabase = require('../config/db');

const Task = {
    async getAll(filters = {}) {
        let query = supabase.from('Tasks').select('*');

        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.priority) {
            query = query.eq('priority', filters.priority);
        }
        if (filters.assigned_to) {
            query = query.eq('assigned_to', filters.assigned_to);
        }
        if (filters.project_id) {
            query = query.eq('project_id', filters.project_id);
        }
        if (filters.no_project === true) {
            query = query.is('project_id', null);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async create(taskData) {
        const { data, error } = await supabase
            .from('Tasks')
            .insert([taskData])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async getById(taskId) {
        const { data, error } = await supabase
            .from('Tasks')
            .select('*')
            .eq('task_id', taskId)
            .single();
        if (error) return null;
        return data;
    },

    async update(taskId, taskData) {
        const { data, error } = await supabase
            .from('Tasks')
            .update(taskData)
            .eq('task_id', taskId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async updateStatus(taskId, status) {
        const { data, error } = await supabase
            .from('Tasks')
            .update({ status })
            .eq('task_id', taskId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async remove(taskId) {
        const { error } = await supabase
            .from('Tasks')
            .delete()
            .eq('task_id', taskId);
        if (error) throw error;
        return true;
    }
};

module.exports = Task;