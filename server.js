import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // replace with your Expo app URL in production
    methods: ["GET", "POST"],
  },
});

const PORT = 3000;

// Connect MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Attach `io` to app so it’s accessible in routes/controllers
app.set("io", io);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// Socket connection logic
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined room ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
