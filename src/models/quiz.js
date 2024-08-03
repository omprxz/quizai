import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  text: {
    type: String,
  }
});

const questionSchema = new mongoose.Schema({
  question_type: {
    type: String,
    required: true
  },
  question_text: {
    type: String,
  },
  options: [optionSchema],
  correct_answers: [{
    type: Number,
  }]
});

const quizSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: true
  },
  visibility: {
    type: String,
    default: 'private'
  },
  title: {
    type: String,
    maxlength: 250
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    required: true
  },
  level: {
    type: String,
  },
  category: {
    type: String
  },
  duration: {
    type: Number,
    min: 30,
    max: 36000,
    default: null
  },
  passing_score: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  shuffle_question: {
    type: Boolean,
    required: true
  },
  shuffle_option: {
    type: Boolean,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  total_questions: {
    type: Number,
    min: 1,
    max: 50,
    required: true
  },
  theme: {
    type: String,
    required: true,
    default: 'autumn'
  },
  questions: [questionSchema]
}, {
  timestamps: true
});

const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);

export default Quiz;