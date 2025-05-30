
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://ukzzhpclaghvwkiahhfg.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrenpocGNsYWdodndraWFoaGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MDIxNjQsImV4cCI6MjA2NDA3ODE2NH0.3mV1nNVMAWSiNIQ8xz27jiMP-0csgT2EPAvt_RDY_QM';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
