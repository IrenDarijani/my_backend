// server.js
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");


dotenv.config();

const app = express();
const PORT = 8080;

// Middleware
app.use(express.json());
app.use(cors());

app.use("/images", express.static(path.join(process.cwd(), "images")));

// Create MySQL pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",          // change if needed
  password: process.env.DB_PASSWORD || "Beautiful100*",      // add your MySQL password
  database: process.env.DB_NAME || "courses_db2"
});




// Test route
app.get("/", (req, res) => {
  res.send("");
});

const aboutFilePath = path.join(process.cwd(), "Aboutme.html");


// Define endpoint to read the file
app.get("/api/about", (req, res) => {
  fs.readFile(aboutFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading about.txt:", err);
      return res.status(500).json({ error: "Failed to load About Me" });
    }
    res.json({ about: data });
  });
});


const areaFilePath = path.join(process.cwd(), "area-exp.html");
const oldmapFilePath = path.join(process.cwd(), "oldmap-exp.html");
const mapFilePath = path.join(process.cwd(), "map-exp.html");
const modelFilePath = path.join(process.cwd(), "model-exp.html");
const introFilePath = path.join(process.cwd(), "intro.html");
const mathPostdocFilePath = path.join(process.cwd(), "math-postdoc.html");
// Removed teachingFilePath

app.get("/api/experience", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync("experience.json", "utf-8"));

    const readFileSafe = (filePath) => {
      try {
        return fs.readFileSync(filePath, "utf-8");
      } catch (err) {
        console.error("Missing file:", filePath);
        return "<p>Missing explanation file.</p>";
      }
    };

    // Read HTML files safely
    const IntroExp = readFileSafe(introFilePath);
    const AreaExp = readFileSafe(areaFilePath);
    const oldMapExp = readFileSafe(oldmapFilePath);
    const MapExp = readFileSafe(mapFilePath);
    const ModelExp = readFileSafe(modelFilePath);
    const MathPostdocExp = readFileSafe(mathPostdocFilePath);
    // Removed TeachingExp

    // Explanations + images group
    const explanationsAndImages = [
      { id: "exp1", type: "html", content: AreaExp },
      { id: "img1", type: "image", image: "http://localhost:8080/images/area-location.png" },
      { id: "exp2", type: "html", content: oldMapExp },
      { id: "img2", type: "image", image: "http://localhost:8080/images/old-map.png" },
      { id: "exp3", type: "html", content: MapExp },
      { id: "img3", type: "image", image: "http://localhost:8080/images/map.png" },
      { id: "exp4", type: "html", content: ModelExp },
      { id: "img4", type: "image", image: "http://localhost:8080/images/model.png" }
    ];

    const modifiedData = [...data];

    // 0️⃣ Insert intro.html before the first item
    modifiedData.splice(0, 0, { id: "intro", type: "html", content: IntroExp });

    // 1️⃣ Insert explanationsAndImages right after the first *original* item (now at index 1)
    modifiedData.splice(2, 0, ...explanationsAndImages);

    const L = explanationsAndImages.length;

    // 2️⃣ Insert math-postdoc before original 2nd item (now at index 2 + L)
    const mathObj = { id: "math-postdoc", type: "html", content: MathPostdocExp };
    modifiedData.splice(2 + L, 0, mathObj);

    // ✅ Removed teaching insertion

    console.log("✅ Sending modified data to frontend");
    res.json(modifiedData);
  } catch (err) {
    console.error("🔥 Error in /api/experience:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});





// New API route to fetch all courses from the database
app.get("/api/courses", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM courses2");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch courses from database" });
  }
});

app.get("/api/talks", (req, res) => {
  res.json({ message: "This is data from the new backend!" });
});


// Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
