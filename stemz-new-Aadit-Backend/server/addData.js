//addData.ja
const mongoose = require("mongoose");
const HeatmapData = require("./models/HeatmapData");

mongoose.connect("mongodb://localhost:27017/online-learning", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const data = [
  { module: "Module 1", engagement: 50, time: "Week 1" },
  { module: "Module 1", engagement: 70, time: "Week 2" },
  { module: "Module 1", engagement: 60, time: "Week 3" },

  { module: "Module 2", engagement: 85, time: "Week 1" },
  { module: "Module 2", engagement: 90, time: "Week 2" },
  { module: "Module 2", engagement: 75, time: "Week 3" },

  { module: "Module 3", engagement: 60, time: "Week 1" },
  { module: "Module 3", engagement: 95, time: "Week 2" },
  { module: "Module 3", engagement: 80, time: "Week 3" },

  { module: "Module 4", engagement: 55, time: "Week 1" },
  { module: "Module 4", engagement: 65, time: "Week 2" },
  { module: "Module 4", engagement: 50, time: "Week 3" },
];

async function addData() {
  try {
   
    await HeatmapData.deleteMany({});

    // insert
    await HeatmapData.insertMany(data);
    console.log("Data added successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("Error adding data:", err);
  }
}

addData();
