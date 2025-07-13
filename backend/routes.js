
const express = require('express');
const pool = require('./db');
const router = express.Router();

// Get all students from classroom_1
router.get('/students', async (req, res) => {
    console.log('Request received for /students');
    try {
      const result = await pool.query('SELECT * FROM classroom_1');
      console.log(result.rows); 
      res.json(result.rows);  
    } catch (err) {
      console.error('Error querying database:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
});

// get all notifications 
router.get('/notifs', async (req, res) => {
  console.log('Request received for /notifs');
  try {
    const result = await pool.query('SELECT * FROM notifs');
    console.log(result.rows); 
    res.json(result.rows);  
  } catch (err) {
    console.error('Error querying database:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// get all classes 
router.get('/course', async (req, res) => {
  console.log('Request received for /course');
  try {
    const result = await pool.query('SELECT * FROM self_paced_courses');
    console.log(result.rows); 
    res.json(result.rows);  
  } catch (err) {
    console.error('Error querying database:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get top 5 students with highest points
router.get('/points', async (req, res) => {
  console.log('Request received for /points');
  try {
    const result = await pool.query(
      `SELECT classroom_1.first_name, classroom_1.last_name, current_scores.points
       FROM current_scores
       JOIN classroom_1 ON current_scores.student_id = classroom_1.student_id
       ORDER BY current_scores.points DESC
       `
    );
    console.log(result.rows); 
    res.json(result.rows);  // Respond with the data
  } catch (err) {
    console.error('Error querying database:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/active-users', async (req, res) => {
  const active_minute_intervals = parseInt(req.query.minutes) || 30; 
  try {
    const result = await pool.query(
      `SELECT student_id, first_name, last_name, last_active
       FROM classroom_1
       WHERE last_active >= NOW() - INTERVAL '$1 minutes'
       ORDER BY last_active DESC`,
      [active_minute_intervals]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching active users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
