// routes/api.js
const express = require('express');
const router = express.Router();

// This function will be called by index.js, passing the supabase client
const apiRoutes = (supabase) => {
  // POST route to add a new student
  router.post('/students', async (req, res) => {
    const { name, email, class_id } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const { data, error } = await supabase
      .from('students')
      .insert([{ name, email, class_id }])
      .select();

    if (error) {
      console.error('Error adding student:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  });

  // POST route to add an attendance record
  router.post('/attendance', async (req, res) => {
    const { student_id, date, status } = req.body;

    if (!student_id || !date || !status) {
      return res.status(400).json({ error: 'Student ID, date, and status are required.' });
    }

    const { data, error } = await supabase
      .from('attendance')
      .insert([{ student_id, date, status }])
      .select();
    
    if (error) {
      console.error('Error adding attendance:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  });

  return router;
};

module.exports = apiRoutes;
