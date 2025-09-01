const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const blocks = ["Morning","Afternoon","Evening"];

// Initialize schedule
let schedule = {};

days.forEach(day => {
  schedule[day] = {};
  blocks.forEach(block => schedule[day][block] = "");
});

// Save to CSV function
function saveScheduleToCSV() {
  let csv = "Day,Morning,Afternoon,Evening\n";
  days.forEach(day => {
    csv += `${day},${schedule[day]["Morning"]},${schedule[day]["Afternoon"]},${schedule[day]["Evening"]}\n`;
  });
  fs.writeFileSync("weekly_schedule.csv", csv, "utf8");
  console.log("✅ weekly_schedule.csv saved.");
}

// Handle save form
app.post("/save", (req, res) => {
  console.log("📩 Received:", req.body);

  days.forEach(day => {
    blocks.forEach(block => {
      let key = `${day}_${block}`;
      if (req.body[key]) {
        schedule[day][block] = req.body[key];
      }
    });
  });

  saveScheduleToCSV();

  // Build schedule preview table
  let preview = `<table border="1" style="border-collapse:collapse; margin:20px auto; text-align:center;">
                  <tr><th>Day</th><th>Morning</th><th>Afternoon</th><th>Evening</th></tr>`;
  days.forEach(day => {
    preview += `<tr>
                  <td>${day}</td>
                  <td>${schedule[day]["Morning"]}</td>
                  <td>${schedule[day]["Afternoon"]}</td>
                  <td>${schedule[day]["Evening"]}</td>
                </tr>`;
  });
  preview += "</table>";

  res.send(`
    <h2>✅ Schedule Saved Successfully!</h2>
    <p>Your schedule has been exported to <b>weekly_schedule.csv</b>.</p>
    <a href="/download">⬇️ Download CSV</a><br><br>
    <h3>📅 Your Weekly Schedule:</h3>
    ${preview}
    <br><a href="/">⬅️ Go Back</a>
  `);
});

// Handle download
app.get("/download", (req, res) => {
  const file = path.join(__dirname, "weekly_schedule.csv");
  if (fs.existsSync(file)) {
    res.download(file);
  } else {
    res.send("⚠️ CSV not found. Please save the schedule first.");
  }
});

app.listen(PORT, () => console.log(` Server running at http://localhost:${PORT}`));