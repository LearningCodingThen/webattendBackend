// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Make sure cors is imported
const { createClient } = require('@supabase/supabase-js');
const apiRoutes = require('./routes/api');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- CORS CONFIGURATION FOR MULTIPLE ORIGINS ---
// 1. Define your allowed origins in an array
const allowedOrigins = [
  'https://webattend.vercel.app',
  'http://localhost:5173'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
};

// 2. Use the cors middleware with the new options
app.use(cors(corsOptions));
// ----------------------------------------------

// MIDDLEWARE
app.use(express.json());

// Use the API routes
app.use('/api', apiRoutes(supabase));

// A simple GET route for the homepage
app.get('/', (req, res) => {
  res.send('Hello, World! Your Express server is running.');
});

app.listen(port, () => {
  console.log(`Server with Supabase listening at http://localhost:${port}`);
});