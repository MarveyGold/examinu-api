import mongoose from 'mongoose';
const { Schema } = mongoose;
const dataSchema = new Schema({
  name: { type: String, trim: true, required: true },
  code: { type: String, trim: true, required: true },
  departments: [{
    name: { type: String, trim: true, required: true },
    code: { type: String, trim: true, required: true },
    courses: {
      "100level": [
        {
          name: { type: String, trim: true, required: true },
          code: { type: String, trim: true, required: true },
          term: { type: Number, required: true, default: 1 }
        }
      ],
      "200level": [
        {
          name: { type: String, trim: true, required: true },
          code: { type: String, trim: true, required: true },
          term: { type: Number, required: true, default: 1 }
        }
      ]
    }
  }]
})
const Data = mongoose.model("Data", dataSchema);
export default Data;
