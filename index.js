
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cors());

// Serve images from /images
app.use("/images", express.static(path.join(process.cwd(), "images")));

// MySQL pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Beautiful100*",
  database: process.env.DB_NAME || "courses_db2"
});

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// About endpoint
const aboutFilePath = path.join(process.cwd(), "Aboutme.html");
app.get("/api/about", (req, res) => {
  fs.readFile(aboutFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading Aboutme.html:", err);
      return res.status(500).json({ error: "Failed to load About Me" });
    }
    res.json({ about: data });
  });
});

// Experience endpoint
const areaFilePath = path.join(process.cwd(), "area-exp.html");
const oldmapFilePath = path.join(process.cwd(), "oldmap-exp.html");
const mapFilePath = path.join(process.cwd(), "map-exp.html");
const modelFilePath = path.join(process.cwd(), "model-exp.html");
const introFilePath = path.join(process.cwd(), "intro.html");
const mathPostdocFilePath = path.join(process.cwd(), "math-postdoc.html");

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

    const IntroExp = readFileSafe(introFilePath);
    const AreaExp = readFileSafe(areaFilePath);
    const oldMapExp = readFileSafe(oldmapFilePath);
    const MapExp = readFileSafe(mapFilePath);
    const ModelExp = readFileSafe(modelFilePath);
    const MathPostdocExp = readFileSafe(mathPostdocFilePath);

    // Images with deployed backend URL
    const BACKEND_URL = "https://my-backend-590209389403.northamerica-northeast1.run.app";
    const explanationsAndImages = [
      { id: "exp1", type: "html", content: AreaExp },
      { id: "img1", type: "image", image: `${BACKEND_URL}/images/area-location.png` },
      { id: "exp2", type: "html", content: oldMapExp },
      { id: "img2", type: "image", image: `${BACKEND_URL}/images/old-map.png` },
      { id: "exp3", type: "html", content: MapExp },
      { id: "img3", type: "image", image: `${BACKEND_URL}/images/map.png` },
      { id: "exp4", type: "html", content: ModelExp },
      { id: "img4", type: "image", image: `${BACKEND_URL}/images/model.png` }
    ];

    const modifiedData = [...data];

    modifiedData.splice(0, 0, { id: "intro", type: "html", content: IntroExp });
    modifiedData.splice(2, 0, ...explanationsAndImages);
    modifiedData.splice(2 + explanationsAndImages.length, 0, { id: "math-postdoc", type: "html", content: MathPostdocExp });

    res.json(modifiedData);
  } catch (err) {
    console.error("Error in /api/experience:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Courses endpoint for Certifications page
app.get("/api/courses", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM courses2");

    // Map database fields to frontend expected format
    const courses = rows.map(row => ({
      id: row.id,
      title: row.title || "",
      platform: row.platform || "",
      status: row.status || "",
      certificate_date: row.certificate_date ? new Date(row.certificate_date) : null,
      year: row.year || ""
    }));

    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch courses from database" });
  }
});

// Talks endpoint
app.get("/api/talks", (req, res) => {
  res.json({ message: "This is data from the backend!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});


