import mongoose from 'mongoose'

const OtpSchema = new mongoose.Schema({
  otp: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

const Otp = mongoose.models.Otp || mongoose.model('Otp', OtpSchema)

export default Otp