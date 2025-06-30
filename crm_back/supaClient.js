// supabaseClient.js
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // o ANON_KEY si es solo lectura

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;

