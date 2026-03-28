import mongoose from "mongoose";
const { Schema } = mongoose;
const quizSchema = new Schema({
  title: String,
  id: Number,
  question: { type: String, trim: true },
  options: [String],
  optionA: String,
  optionB: String,
  optionC: String,
  optionD: String,
  optionE: String,
  correctAnswer: String,
  explanation: String
});
const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz
