
// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const HeatmapData = require("./models/HeatmapData");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/online-learning", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Add to top of server.js
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Define Schemas for leaderboard (if not modularized into models yet)
const LeaderboardSchema = new mongoose.Schema({
  username: String,
  points: Number,
});

// Create models
const Leaderboard = mongoose.model("Leaderboard", LeaderboardSchema);

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Online Learning Platform API");
});

// Leaderboard endpoints
app.get("/api/leaderboard", async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find().sort({ points: -1 });
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/leaderboard", async (req, res) => {
  try {
    const { username, points } = req.body;
    const newEntry = new Leaderboard({ username, points });
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Heatmap endpoints
app.get("/api/heatmap", async (req, res) => {
  try {
    console.log("Fetching heatmap data...");
    const heatmap = await HeatmapData.aggregate([
      {
        $group: {
          _id: "$module",
          data: {
            $push: {
              time: "$time",
              engagement: "$engagement"
            }
          }
        }
      },
      {
        $project: {
          module: "$_id",
          data: 1,
          _id: 0
        }
      }
    ]);

    console.log("Retrieved data:", heatmap);

    if (!heatmap) {
      console.log("No heatmap data returned");
      return res.status(500).json({ message: "Failed to fetch data" });
    }

    if (heatmap.length === 0) {
      console.log("Heatmap array is empty");
      return res.status(404).json({ message: "No data found" });
    }

    res.json(heatmap);
  } catch (err) {
    console.error("Heatmap error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
const PORT = process.env.BACKEND_PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
