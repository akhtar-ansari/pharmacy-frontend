import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://stuaqochnyjuewvpkwlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0dWFxb2NobnlqdWV3dnBrd2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NjI2MTQsImV4cCI6MjA3NTIzODYxNH0.hAa8LO0pMEtnLhl4fiR6Fgaj8Ug1ZaiW8AA1fb2U30g';

export const supabase = createClient(supabaseUrl, supabaseKey);