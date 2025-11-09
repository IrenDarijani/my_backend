
const express = require("express");
const cors = require("cors");
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
    const BACKEND_URL = "https://my-backend-893790128563.northamerica-northeast1.run.app";
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

app.get("/api/courses", (req, res) => {
  try {
    const filePath = path.join(process.cwd(), "courses.json");
    const jsonData = fs.readFileSync(filePath, "utf-8");
    const coursesData = JSON.parse(jsonData).courses;

    // Convert YYYY-MM-DD → Month YYYY
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const formattedCourses = coursesData.map(course => {
      if (course.date) {
        const [year, month] = course.date.split("-");
        const monthText = monthNames[parseInt(month) - 1];
        return { ...course, monthYear: `${monthText} ${year}` };
      }
      return course;
    });

    res.json(formattedCourses);
  } catch (err) {
    console.error("Error loading courses.json:", err);
    res.status(500).json({ error: "Failed to load courses data" });
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


