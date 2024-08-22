import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
    userid: {
      type: String,
      default: null
    },
    name: String,
    email: String,
    category: {
      type: String,
      required: true
    },
    message: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
});

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);

export default Feedback;