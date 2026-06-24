const supabase = require('../config/db');

const findByEmail = async (email) => {
  if (!email) return null;
  const normalizedEmail = email.toLowerCase().trim();
  const { data, error } = await supabase
    .from('Users')
    .select('*')
    .eq('email', normalizedEmail)
    .single();
  if (error) return null;
  return data;
};

const findById = async (userId) => {
  const { data, error } = await supabase
    .from('Users')
    .select('user_id, first_name, last_name, email, role, is_active, created_at')
    .eq('user_id', userId)
    .single();
  if (error) return null;
  return data;
};

const createUser = async (userData) => {
  const { data, error } = await supabase
    .from('Users')
    .insert(userData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const updateUser = async (userId, updates) => {
  const { data, error } = await supabase
    .from('Users')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const listUsers = async (search, role) => {
  let query = supabase
    .from('Users')
    .select('user_id, first_name, last_name, email, role, is_active, created_at');

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
  }
  if (role) {
    query = query.eq('role', role);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

const saveResetToken = async (email, tokenHash, expires) => {
  const { error } = await supabase
    .from('Users')
    .update({ reset_token_hash: tokenHash, reset_token_expires: expires })
    .eq('email', email);
  if (error) throw error;
};

const clearResetToken = async (userId) => {
  const { error } = await supabase
    .from('Users')
    .update({ reset_token_hash: null, reset_token_expires: null })
    .eq('user_id', userId);
  if (error) throw error;
};

const listAssignableUsers = async () => {
  const { data, error } = await supabase
    .from('Users')
    .select('user_id, first_name, last_name, email, role')
    .in('role', ['Project Manager', 'Collaborator'])
    .eq('is_active', true);
  if (error) throw error;
  return data;
};

module.exports = {
  findByEmail,
  findById,
  createUser,
  updateUser,
  listUsers,
  saveResetToken,
  clearResetToken,
   listAssignableUsers,
};