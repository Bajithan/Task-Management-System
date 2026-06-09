const { createClient } = require('@supabase/supabase-js');
const { SUPABASE_URL, SUPABASE_ANON_KEY } = require('./env');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase credentials in environment variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = supabase;