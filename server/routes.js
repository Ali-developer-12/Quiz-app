const express = require('express');
const mongoose = require('mongoose');
const { Question } = require('./models');

const router = express.Router();

router.get('/questions/:chapter', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json([]);
    const chapter = parseInt(req.params.chapter);
    const questions = await Question.find({ chapter });
    res.json(questions);
  } catch (error) {
    res.json([]);
  }
});

router.post('/submit', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({});
    const { chapter, answers } = req.body;
    
    const questions = await Question.find({ chapter });
    
    let score = 0;
    
    const correctAnswersMap = {};
    questions.forEach(q => {
      correctAnswersMap[q._id.toString()] = q.correctAnswer;
    });

    (answers || []).forEach(submitItem => {
      const correctAns = correctAnswersMap[submitItem.questionId];
      if (correctAns && correctAns === submitItem.answer) {
        score++;
      }
    });

    const totalQuestions = questions.length;
    let scorePercentage = 0;
    if (totalQuestions > 0) {
      scorePercentage = Math.round((score / totalQuestions) * 100 * 100) / 100;
    }

    res.json({
      totalQuestions,
      correctAnswers: score,
      scorePercentage
    });

  } catch (error) {
    res.json({});
  }
});

module.exports = router;
