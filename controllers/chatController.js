import Chat from "../models/chatModel.js";

// Get messages between logged-in user and another user
export const getChatMessages = async (req, res) => {
  const currentUserId = req.user._id;
  const otherUserId = req.params.userId;

  try {
    const messages = await Chat.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name")
      .populate("receiver", "name");

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send a message + emit via socket
export const sendMessage = async (req, res) => {
  const currentUserId = req.user._id;
  const { receiver, message } = req.body;

  if (!receiver || !message) {
    return res.status(400).json({ message: "Receiver and message are required" });
  }

  try {
    const chat = new Chat({
      sender: currentUserId,
      receiver,
      message,
    });

    await chat.save();

    // 🔥 Emit message to receiver in real time
    const io = req.app.get("io");
    io.to(receiver.toString()).emit("receiveMessage", {
      _id: chat._id,
      sender: currentUserId,
      receiver,
      message,
      createdAt: chat.createdAt,
    });

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  const currentUserId = req.user._id;
  const { senderId } = req.body;

  if (!senderId) return res.status(400).json({ message: "SenderId required" });

  try {
    await Chat.updateMany(
      { sender: senderId, receiver: currentUserId, read: false },
      { $set: { read: true } }
    );

    // Optional: notify sender their messages were read
    const io = req.app.get("io");
    io.to(senderId.toString()).emit("messagesRead", {
      by: currentUserId,
      at: new Date(),
    });

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
