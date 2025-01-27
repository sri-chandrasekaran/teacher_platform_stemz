//HeatmapData.js
const mongoose = require("mongoose");

const heatmapSchema = new mongoose.Schema({
  module: { type: String, required: true },
  engagement: { type: Number, required: true },
  time: { type: String, required: true }
});

//create model
const HeatmapData = mongoose.model("HeatmapData", heatmapSchema);

module.exports = HeatmapData;
