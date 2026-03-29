const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth");

const itemRoutes = require("./routes/items");

const orderRoutes = require("./routes/orders");
const uploadRoutes = require("./routes/upload");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());


// Make io accessible in routes
app.set("io", io);

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/items", itemRoutes);

app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);

// Routes (will be added in later steps)
app.get("/", (req, res) => {
  res.send("Food Delivery API is running...");
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log("Admin connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Admin disconnected:", socket.id);
  });
});

// MongoDB connection + server start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));