import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use(cors());
app.set("io", io);

app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined room ${userId}`);
  });

  // ✅ 🗣 CALLING EVENTS

  // Step 1: User A starts a call
  socket.on("call-user", ({ from, to, offer }) => {
    console.log(`📞 ${from} is calling ${to}`);
    io.to(to).emit("incoming-call", { from, offer });
  });

  // Step 2: User B answers the call
  socket.on("answer-call", ({ to, answer }) => {
    io.to(to).emit("call-answered", { answer });
  });

  // Step 3: Exchange ICE candidates (network info)
  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { candidate });
  });

  // Step 4: End call
  socket.on("end-call", ({ to }) => {
    io.to(to).emit("call-ended");
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
