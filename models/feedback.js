import mongoose from 'mongoose';
const { Schema } = mongoose;

const feedbackSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  mail: String,
  createdAt: { type: Date, default: Date.now }
});

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;
