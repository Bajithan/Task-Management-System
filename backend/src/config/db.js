const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const { SUPABASE_URL, SUPABASE_ANON_KEY } = require('./env');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase credentials in environment variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
  },
  realtime: {
    transport: ws,
  },
});

module.exports = supabase;