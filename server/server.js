const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

mongoose.connect('mongodb://127.0.0.1:27017/quizDB')
  .then(() => {console.log('asddd');
   })
  .catch((err) => {console.log(err)});

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/quiz', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/quiz.html'));
});

app.get('/result', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/result.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
