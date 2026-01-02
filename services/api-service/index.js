const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { Client } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const GOOGLE_API_KEY = process.env.GOOGLE_DRIVE_API_KEY;

// Extract folder ID
function extractFolderId(url) {
  const match = url.match(/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// List images (pagination safe for 10k+)
async function listAllImages(folderId) {
  let files = [];
  let pageToken = null;

  do {
    const res = await axios.get(
      "https://www.googleapis.com/drive/v3/files",
      {
        params: {
          key: GOOGLE_API_KEY,
          q: `'${folderId}' in parents and mimeType contains 'image/'`,
          fields: "nextPageToken, files(id,name,mimeType,size)",
          pageSize: 1000,
          pageToken,
        },
      }
    );

    files.push(...res.data.files);
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  return files;
}

// DB
const db = new Client({
  host: "localhost",
  user: "admin",
  password: "admin",
  database: "imagesdb",
});
db.connect();

// Import API
app.post("/import/google-drive", async (req, res) => {
  const { url } = req.body;
  const folderId = extractFolderId(url);

  if (!folderId) {
    return res.status(400).json({ message: "Invalid Drive URL" });
  }

  const images = await listAllImages(folderId);

  const chunkSize = 100;
  for (let i = 0; i < images.length; i += chunkSize) {
    await axios.post("http://localhost:5000/process", {
      images: images.slice(i, i + chunkSize),
    });
  }

  res.json({
    message: "Image import request accepted",
    total_images: images.length,
    jobs_created: Math.ceil(images.length / chunkSize),
  });
});

// GET IMAGES
app.get("/images", async (req, res) => {
  const result = await db.query(
    "SELECT * FROM images ORDER BY created_at DESC"
  );
  res.json(result.rows);
});

app.listen(4000, () => console.log("API running on port 4000"));
