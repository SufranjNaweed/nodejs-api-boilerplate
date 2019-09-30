const express = require('express');
const app = express();
const connectDB = require('./config/db');

const cors = require('cors');
const PORT = process.env.PORT || 9000;

app.get('/', function (req, res) {
  res.status(200).send('API is running :)');
});

// Connect DataBase
connectDB();

// Init Middleware
app.use(express.json({ extended : false }));

//Permission CORS 
// /!\ ALl resquest are open for dev purposes, in production mode please modify this /!\
app.use(cors());

// API's Routes 
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/users', require('./routes/api/users'));

// Always the last line of the entry point file
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});