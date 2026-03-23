import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://urfciciubimuwgnixwpm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZmNpY2l1YmltdXdnbml4d3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNTIxODMsImV4cCI6MjA4OTgyODE4M30.Q_QracnlY-5nUR02PKMwC5EVJllevtTTg1tocoEcTX8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
