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
  options: {
    type: [optionSchema],
    default: []
  },
  correct_answers: [{
    type: mongoose.Schema.Types.Mixed,
  }],
  reason: {
    type: String
  }
});

const responseSchema = new mongoose.Schema({
  userid: {
    type: String,
    default: null
  },
  username: {
    type: String,
    default: 'Unknown'
  },
  passing_score: {
    type: Number,
    default: 0
  },
  quizid: {
    type: String,
    required: true
  },
  selectedAnswers: {
    type: Map,
    of: [mongoose.Schema.Types.Mixed],
    default: {}
  },
  questions: [questionSchema],
  correct: {
    type: Number,
    default: 0
  },
  wrong: {
    type: Number,
    default: 0
  },
  notAttempted: {
    type: Number,
    default: 0
  },
  total_questions: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    default: 0
  },
  timeTaken: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

const Response = mongoose.models.Response || mongoose.model('Response', responseSchema);

export default Response