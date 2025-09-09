const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors'); // Import the cors package
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const port = process.env.PORT || 3000;

// Supabase Initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- MIDDLEWARE ---
// This is the crucial part to fix the CORS error.
// It allows requests from your frontend's origin.
app.use(cors({
  origin: 'http://localhost:5173' // Replace with your frontend's actual URL if different
}));

app.use(express.json()); // To parse JSON bodies

// --- ROUTES ---
// Pass the supabase client to your routes
app.use('/api', apiRoutes(supabase));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


