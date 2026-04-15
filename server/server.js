import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import connectDb from "./config/connectDB.js";
import dotenv from 'dotenv';
dotenv.config();
import cors from "cors";
import repoRoutes from "./routes/repoRoutes.js";
import codeRoutes from "./routes/codeRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import sendMail from "./services/mailer.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

connectDb();

const app = express();
const corsOptions = {
  origin: [
    process.env.CLIENT_URL,                                      // EC2 Elastic IP
    "https://online-compiler-frontend-codemeet.s3.amazonaws.com", // S3 bucket direct
    "https://d123ABC.cloudfront.net",                            // if using CloudFront (replace with your dist ID)
    "http://localhost:5173",                                     // local dev
    "http://localhost:3000",                                     // local dev alt
  ],
  methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
  allowedHeaders: [
    "Origin", "X-Requested-With",
    "Content-Type", "Accept", "Authorization"
  ],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL,                                      // EC2 Elastic IP
      "https://online-compiler-frontend-codemeet.s3.amazonaws.com", // S3 bucket
      "https://d123ABC.cloudfront.net",                            // CloudFront (if used)
      "http://localhost:5173",                                     // local dev
      "http://localhost:3000",                                     // local dev alt
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
});

// rooms[roomId] = { participants: [{ socketId, userId, name }], iceCandidates: {} }
const rooms = {};

// Track socket -> room mapping for fast cleanup on disconnect
const socketToRoom = {};

function getRoomParticipants(roomId) {
  return rooms[roomId]?.participants || [];
}

function addParticipant(roomId, socketId, userId, name) {
  if (!rooms[roomId]) {
    rooms[roomId] = { participants: [], iceCandidates: {} };
  }
  // Prevent duplicate socket entries (e.g. rapid reconnects)
  const existing = rooms[roomId].participants.findIndex(p => p.socketId === socketId);
  if (existing === -1) {
    rooms[roomId].participants.push({ socketId, userId, name });
  }
  socketToRoom[socketId] = roomId;
}

function removeParticipant(socketId) {
  const roomId = socketToRoom[socketId];
  if (!roomId || !rooms[roomId]) return null;

  rooms[roomId].participants = rooms[roomId].participants.filter(p => p.socketId !== socketId);
  delete socketToRoom[socketId];

  if (rooms[roomId].participants.length === 0) {
    delete rooms[roomId];
  }
  return roomId;
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ── CREATE ROOM ──────────────────────────────────────────
  socket.on("create-room", ({ id, userId, name }) => {
    if (!rooms[id]) {
      rooms[id] = { participants: [], iceCandidates: {}, code: "", language: "python" };
    }
    addParticipant(id, socket.id, userId || socket.id, name || "Host");
    socket.join(id);
    console.log(`Room ${id} created by ${socket.id}`);
    socket.emit("room-created", { roomId: id });
  });

  // ── JOIN ROOM ────────────────────────────────────────────
  socket.on("join-room", ({ id, name, userId }) => {
    console.log(`join-room: ${name} (${socket.id}) → room ${id}`);

    if (!rooms[id]) {
      rooms[id] = { participants: [], iceCandidates: {} };
    }

    // ── 2-PARTICIPANT LIMIT ───────────────────────────────────────────────
    // Check BEFORE adding: count existing unique participants.
    // A rejoin (same socket already in the room) is always allowed so that
    // page-refresh / socket-reconnect does not lock the user out.
    const currentList = getRoomParticipants(id);
    const isRejoin = currentList.some(p => p.socketId === socket.id);

    if (!isRejoin && currentList.length >= 2) {
      // Emit the error only to the rejected socket — do NOT add them to the room
      socket.emit("room-full", {
        message: "Meeting is full. Only 2 participants are allowed.",
        participants: currentList.map(p => ({ name: p.name })),
        limit: 2,
      });
      console.log(`Room ${id} is full (${currentList.length}/2). Rejected: ${name}`);
      return;  // <-- stops here; existing participants are NOT disturbed
    }
    // ─────────────────────────────────────────────────────────────────────

    addParticipant(id, socket.id, userId || socket.id, name);
    socket.join(id);

    // Notify existing participants
    const others = getRoomParticipants(id).filter(p => p.socketId !== socket.id);
    others.forEach(({ socketId }) => {
      io.to(socketId).emit("user-joined", { newUserId: socket.id, name });
    });

    // Send existing participants list to the new joiner so they can initiate offers
    const activeScreenSharer = rooms[id]?.screenSharerId || null;
    socket.emit("existing-users", {
      users: others.map(p => ({ socketId: p.socketId, name: p.name })),
      screensharerId: activeScreenSharer,
      // Send the first person's current code+language to the new joiner
      code:     rooms[id]?.code     ?? "",
      language: rooms[id]?.language ?? "python",
    });

    console.log(`Room ${id} participants:`, getRoomParticipants(id).map(p => p.name));
  });

  // ── WEBRTC SIGNALLING ────────────────────────────────────
  socket.on("offer", ({ offer, to, name }) => {
    console.log(`Offer: ${socket.id} → ${to}`);
    io.to(to).emit("offer", { offer, from: socket.id, name });
  });

  socket.on("answer", ({ answer, to }) => {
    console.log(`Answer: ${socket.id} → ${to}`);
    io.to(to).emit("answer", { answer, from: socket.id });
  });

  socket.on("ice-candidate", ({ candidate, to }) => {
    if (!candidate) return;
    console.log(`ICE: ${socket.id} → ${to}`);
    io.to(to).emit("ice-candidate", { candidate, from: socket.id });
  });

  // Re-negotiation (needed when adding screen share tracks)
  socket.on("nego-needed", ({ to, offer }) => {
    io.to(to).emit("nego-needed", { from: socket.id, offer });
  });

  socket.on("nego-done", ({ to, answer }) => {
    io.to(to).emit("nego-final", { from: socket.id, answer });
  });

  // ── CODE COLLABORATION ───────────────────────────────────
  socket.on("codeChange", ({ code, id }) => {
    // Persist latest code in room so new joiners get it
    if (rooms[id]) rooms[id].code = code;
    socket.to(id).emit("codeChange", { code });
  });

  socket.on("change-language", ({ language, id }) => {
    if (rooms[id]) rooms[id].language = language;
    socket.to(id).emit("change-language", language);
  });

  // ── CHAT MESSAGES ────────────────────────────────────────
  socket.on("message", (message, time, sender, roomId) => {
    if (!roomId) return;
    socket.to(roomId).emit("message", message, time, sender);
  });

  socket.on("chatbot-sync", ({ roomId, messages }) => {
    if (!roomId) return;
    socket.to(roomId).emit("chatbot-sync", { messages });
  });

  // ── SCREEN SHARE & MEDIA SIGNALS ─────────────────────────
  socket.on("screen-share-start", ({ roomId }) => {
    if (rooms[roomId]) rooms[roomId].screenSharerId = socket.id; // track who is sharing
    socket.to(roomId).emit("screen-share-start", { from: socket.id });
  });

  socket.on("screen-share-stop", ({ roomId }) => {
    if (rooms[roomId]) delete rooms[roomId].screenSharerId; // clear tracker
    socket.to(roomId).emit("screen-share-stop", { from: socket.id });
  });

  socket.on("media-state", ({ roomId, video, audio }) => {
    socket.to(roomId).emit("media-state-changed", { video, audio, userId: socket.id });
  });

  // ── LEAVE ROOM ───────────────────────────────────────────
  socket.on("leave-room", ({ roomId }) => {
    console.log(`leave-room: ${socket.id} from ${roomId}`);
    if (rooms[roomId]) {
      rooms[roomId].participants = rooms[roomId].participants.filter(p => p.socketId !== socket.id);
      // If the leaving user was sharing screen, clear it
      if (rooms[roomId].screenSharerId === socket.id) delete rooms[roomId].screenSharerId;
      delete socketToRoom[socket.id];
      socket.leave(roomId);
      socket.to(roomId).emit("user-left", { userId: socket.id });
      if (rooms[roomId].participants.length === 0) {
        delete rooms[roomId];
      }
    }
  });

  // ── DISCONNECT ───────────────────────────────────────────
  socket.on("disconnect", (reason) => {
    console.log(`Disconnected: ${socket.id}, reason: ${reason}`);
    const roomId = socketToRoom[socket.id];
    // If this socket was the active screen sharer, clear it before removing
    if (roomId && rooms[roomId]?.screenSharerId === socket.id) {
      delete rooms[roomId].screenSharerId;
      // Notify remaining participants that screen share ended
      io.to(roomId).emit("screen-share-stop", { from: socket.id });
    }
    const clearedRoomId = removeParticipant(socket.id);
    if (clearedRoomId) {
      io.to(clearedRoomId).emit("user-left", { userId: socket.id });
    }
  });

  // ── ERROR HANDLING (prevent crashes) ─────────────────────
  socket.on("error", (err) => {
    console.error(`Socket error for ${socket.id}:`, err);
  });
});

// Graceful error handling — don't crash the server
io.on("connect_error", (error) => {
  console.error("IO connect_error:", error);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception (server kept alive):", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection (server kept alive):", reason);
});

// ── REST ROUTES ──────────────────────────────────────────────
app.get("/", (req, res) => res.send("Server running..."));

app.get("/meet/:meetId", (req, res) => {
  const { meetId } = req.params;
  if (rooms[meetId]) {
    const participants = rooms[meetId].participants.map(p => ({ name: p.name }));
    const isFull = participants.length >= 2;
    // Return 403 when full so clients can gate-check before even connecting
    return res.status(isFull ? 403 : 200).json({
      message: isFull ? "Meeting is full (2/2 participants)" : "Meeting available",
      participants,
      full: isFull,
      limit: 2,
    });
  }
  // Room does not exist yet — fine; the first joiner will create it
  return res.status(200).json({ message: "Meeting ready to be created", participants: [], full: false, limit: 2 });
});

app.get("/test-mail", async (req, res) => {
  const response = await sendMail("test@example.com", "Test", "Testing nodemailer");
  return res.status(200).send(response);
});

app.use("/repo", repoRoutes);
app.use("/code", codeRoutes);
app.use("/file", fileRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

export default server;