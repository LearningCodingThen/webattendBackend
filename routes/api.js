// routes/api.js
const express = require('express');
const router = express.Router();

// This function will be called by index.js, passing the supabase client
const apiRoutes = (supabase) => {
  // POST route to add a new student
  router.post('/students', async (req, res) => {
    const { name, uid } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name and uid is required.' });
    }
    const { data, error } = await supabase
      .from('students')
      .insert([{ name, uid }])
      .select();

    if (error) {
      console.error('Error adding student:', error);
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(data);
  });

router.post('/classDay', async (req, res) => {
  const { classes, date, num } = req.body;

  if (!classes || !date) {
    return res.status(400).json({ error: 'Classes and date are required.' });
  }

  // Step 1: Check if date already exists
  const { data: existing, error: selectError } = await supabase
    .from('classes')
    .select('id')
    .eq('date', date)
    .single();

  if (selectError && selectError.code !== 'PGRST116') {
    console.error('Error checking existing date:', selectError);
    return res.status(500).json({ error: selectError.message });
  }

  if (existing) {
    return res.status(409).json({ error: 'A record already exists for this date.' });
  }

  // Step 2: Insert into classes table
  const { data: classData, error: classError } = await supabase
    .from('classes')
    .insert([{ classes, date, num }])
    .select();

  if (classError) {
    console.error('Error inserting class data:', classError);
    return res.status(500).json({ error: classError.message });
  }

  // Step 3: Prepare 33 attendance records (bulk insert instead of looping)
  const attendanceRows = Array.from({ length: 33 }, (_, i) => ({
    student_id: i + 1,
    date: date,
    status: 'absent',
  }));

  const { data: attendanceData, error: attendanceError } = await supabase
    .from('attendance')
    .insert(attendanceRows);

  if (attendanceError) {
    console.error('Error inserting attendance data:', attendanceError);
    return res.status(500).json({ error: attendanceError.message });
  }

  // Step 4: Return response
  res.status(201).json({
    message: 'Class and attendance created successfully',
    class: classData,
    attendance: attendanceData,
  });
});


  // POST route to add an attendance record
  router.post('/attendance', async (req, res) => {
    // The date will be generated on the server to ensure it's always the current date.
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Student ID are required.' });
    }

    // Generate today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // First, check if an attendance record already exists for this student today
    const { data: existingRecord, error: checkError } = await supabase
      .from('attendance')
      .select('id')
      .eq('id', id)
      .eq('date', today)
      .maybeSingle(); // Fetches a single row or null, doesn't error if not found

    if (checkError) {
      console.error('Error checking for existing attendance:', checkError);
      return res.status(500).json({ error: checkError.message });
    }

    // If a record is found, return a conflict response
    if (existingRecord) {
      return res.status(409).json({ error: 'Attendance already marked for this student today.' });
    }

    // If no record exists, proceed with insertion
    const { data, error } = await supabase
      .from('attendance')
      .insert([{ student_id: id, date: today, status: 'present' }])
      .select()
      .single(); // We are inserting one record, so we expect one back


    if (error) {
      console.error('Error adding attendance:', error);
      // This is a good fallback in case of a race condition
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Attendance already marked for this student today.' });
      }
      return res.status(500).json({ error: error.message });
    }
    console.log('Attendance added:', data);
    res.status(201).json(data);
  });
  // GET all students
  router.get('/students', async (req, res) => {
    const { data, error } = await supabase
      .from('students')
      .select('*');

    if (error) {
      console.error('Error fetching students:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  });

  // GET a single student by ID
  router.get('/students/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single(); // Use .single() to get one record

    if (error) {
      console.error(`Error fetching student with id ${id}:`, error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(data);
  });

  // GET all attendance records
  router.get('/attendance', async (req, res) => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*');

    if (error) {
      console.error('Error fetching attendance:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  });
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .limit(1);

  if (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({ message: 'Login successful', user: data });
});

  return router;
};

module.exports = apiRoutes;
