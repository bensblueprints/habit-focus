import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://kuuulgjkgyhgzkjyembj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dXVsZ2prZ3loZ3pranllbWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5ODI2NDYsImV4cCI6MjA2MTU1ODY0Nn0.TAXvtH7t3LEUZH4_DAZtIs9HM17aeXHUJTGHSNRW9bY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 