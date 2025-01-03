
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

module.exports = router;
