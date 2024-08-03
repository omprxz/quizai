import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema({
  userid: {
    type: String,
    default: null
  },
  username: {
    type: String,
    default: 'Unknown'
  },
  quizid: {
    type: String,
    required: true
  },
  selectedAnswers: {
    type: Map,
    of: [Number],
    default: {}
  },
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