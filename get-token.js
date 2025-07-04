// get-token.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // If you want to use a .env file for keys

// IMPORTANT: Use your PUBLIC anon key and project URL here.
// DO NOT use your service_role or JWT secret here. This script acts like a frontend.
const SUPABASE_URL = 'https://exldrebicztgfnaioyce.supabase.co'; // Find in Settings -> API
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bGRyZWJpY3p0Z2ZuYWlveWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzOTg0NzksImV4cCI6MjA2Njk3NDQ3OX0.xLIyPKKvp_E0lXVZ_Z79jo3FejHM4mWmj9o-fySqR7w'; // Find in Settings -> API

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// The email and password of the test user you created in the Supabase dashboard
const TEST_USER_EMAIL = 'test@example.com';
const TEST_USER_PASSWORD = 'password123';

async function getSessionToken() {
  console.log('Attempting to log in...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
  });

  if (error) {
    console.error('Error logging in:', error.message);
    return;
  }

  if (data.session) {
    console.log('\n--- LOGIN SUCCESSFUL! ---');
    console.log('\nCopy the access_token below and use it in Postman.\n');
    console.log('--- BEGIN TOKEN ---');
    console.log(data.session.access_token); // This is the JWT!
    console.log('--- END TOKEN ---\n');
  } else {
    console.log('Login failed, no session data returned.');
  }
}

getSessionToken();