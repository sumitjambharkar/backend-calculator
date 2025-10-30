import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpiresAt: {
      type: Date,
    },
    pin: {
      type: String, // 4-digit PIN
      minlength: 4,
      maxlength: 4,
    },
    isLogin: {
      type: Boolean,
      default: false, // false = logged out, true = logged in
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
