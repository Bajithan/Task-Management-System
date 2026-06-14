const { supabase } = require('../config/supabaseClient');

const Task = {
    // Fetch all tasks
    async getAll() {
        const { data, error } = await supabase
            .from('tasks')
            .select('*');
        if (error) throw error;
        return data;
    },

    // Create a new task
    async create(taskData) {
        const { data, error } = await supabase
            .from('tasks')
            .insert([taskData]);
        if (error) throw error;
        return data;
    },

    // Add more functions (update, delete, getById) as needed
};

module.exports = Task;