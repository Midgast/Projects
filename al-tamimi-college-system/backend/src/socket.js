import { Server } from "socket.io";
import http from "http";

export function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: process.env.CORS_ORIGIN || "*", credentials: true },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join:room", (room) => {
      socket.join(room);
    });

    socket.on("leave:room", (room) => {
      socket.leave(room);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  // Helper to broadcast
  io.broadcast = (event, room, data) => {
    if (room) {
      io.to(room).emit(event, data);
    } else {
      io.emit(event, data);
    }
  };

  return io;
}
