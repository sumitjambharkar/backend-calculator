import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // ✅ load .env first

const JWT_SECRET = process.env.JWT_SECRET // use env variable

// Send OTP → generate short-lived token
export const sendOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone number is required" });

  try {
    let user = await User.findOne({ phone });
    if (!user) user = new User({ phone });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    await user.save();

    console.log(`OTP for ${phone}: ${otp}`); // replace with SMS sending

    // Short-lived token to identify user
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "10m" });

    res.json({ message: "OTP sent successfully", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP → generate long-lived token
export const verifyOtp = async (req, res) => {
  const { otp } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });
  if (!otp) return res.status(400).json({ message: "OTP is required" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isPhoneVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Long-lived token for authenticated session
    const authToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ message: "Phone verified successfully", token: authToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Set name and PIN → protected route
export const setNameAndPin = async (req, res) => {
  const { name, pin } = req.body;
  const user = req.user;

  if (!name || !pin) {
    return res.status(400).json({ message: "Name and PIN required" });
  }

  if (!/^\d{4}$/.test(pin)) {
    return res.status(400).json({ message: "PIN must be 4 digits" });
  }

  try {
    user.name = name;
    user.pin = pin;
    user.isLogin = true; // ✅ Mark user as logged in
    await user.save();

    res.status(200).json({
      success: true,
      message: "Name, PIN set successfully and user logged in",
      user,
    });
  } catch (error) {
    console.error("setNameAndPin Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Verify PIN → protected route
export const verifyPin = async (req, res) => {
  const { pin } = req.body;
  const user = req.user;

  if (!pin) return res.status(400).json({ message: "PIN required" });
  if (!/^\d{4}$/.test(pin)) return res.status(400).json({ message: "PIN must be 4 digits" });

  try {
    if (user.pin !== pin) return res.status(400).json({ message: "Incorrect PIN" });

    res.json({ message: "PIN verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Controller to get list of users
export const userList = async (req, res) => {
  try {
    // Example: fetch all users except password
    const users = await User.find({}, { password: 0, __v: 0 });

    res.status(200).json({
      success: true,
      data: users,
      message: "Users fetched successfully",
    });
  } catch (error) {
    console.error("User list error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by auth middleware
    res.json({ user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};