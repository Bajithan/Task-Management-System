// Remove the curly braces {} so it imports the object directly
const supabase = require('../config/db'); 

const Task = {
    // Fetch all tasks
    async getAll() {
        const { data, error } = await supabase
            .from('Tasks')
            .select('*');
        if (error) throw error;
        return data;
    },

    // Create a new task
    async create(taskData) {
        const { data, error } = await supabase
            .from('Tasks')
            .insert([taskData]);
        if (error) throw error;
        return data;
    },
};

module.exports = Task;