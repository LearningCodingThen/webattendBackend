// index.js
require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const apiRoutes = require('./routes/api'); // Import the routes

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// MIDDLEWARE
// This is crucial for your POST routes to be able to read `req.body`
app.use(express.json());

// Use the API routes, passing the supabase client to them
app.use('/api', apiRoutes(supabase));

// A simple GET route for the homepage
app.get('/', (req, res) => {
  res.send('Hello, World! Your Express server is running.');
});


app.listen(port, () => {
  console.log(`Server with Supabase listening at http://localhost:${port}`);
});
