import mongoose from 'mongoose';
mongoose.connect(process.env.MONGODB_URI);

const userSchema = new mongoose.Schema({
  slackId: {
    type: String,
    required: true
  },
  googleTokens: {
    type: Object,
    required: true
  }
})

export const User = mongoose.model('user', userSchema);
