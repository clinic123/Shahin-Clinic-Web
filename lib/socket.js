import { Server } from "socket.io";

let io;

export function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join topic room
    socket.on("join-topic", (topicId) => {
      socket.join(`topic-${topicId}`);
      console.log(`User ${socket.id} joined topic-${topicId}`);
    });

    // Leave topic room
    socket.on("leave-topic", (topicId) => {
      socket.leave(`topic-${topicId}`);
      console.log(`User ${socket.id} left topic-${topicId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}
