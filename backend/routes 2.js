
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
    const result = await pool.query('SELECT * FROM notifications');
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
// router.get('/points', async (req, res) => {
//   console.log('Request received for /points');
//   try {
//     const result = await pool.query(
//       `SELECT classroom_1.student_name, current_scores.cumulative_scores AS points
//        FROM current_scores
//        JOIN classroom_1 ON current_scores.student_id = classroom_1.student_id
//        ORDER BY current_scores.cumulative_scores DESC
//        LIMIT 7`
//     );
//     console.log(result.rows); 
//     res.json(result.rows);  // Respond with the data
//   } catch (err) {
//     console.error('Error querying database:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

router.get('/userpoints', async (req, res) => {
  console.log('Request received for /userpoints');
  try {
    const result = await pool.query('SELECT * FROM userpoints');
    console.log(result.rows); 
    res.json(result.rows);  
  } catch (err) {
    console.error('Error querying database:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
