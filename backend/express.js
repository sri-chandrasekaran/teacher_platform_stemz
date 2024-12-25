const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const studentRouter = require('./routes.js');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api', studentRouter);  

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

module.exports = app;
