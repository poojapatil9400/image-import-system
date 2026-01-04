const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { Client } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const GOOGLE_API_KEY = process.env.GOOGLE_DRIVE_API_KEY;
const WORKER_SERVICE_URL = process.env.WORKER_SERVICE_URL;

// =====================
// HELPERS
// =====================
function extractFolderId(url) {
  const match = url.match(/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

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
          pageToken: pageToken,
        },
      }
    );

    files.push(...res.data.files);
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  return files;
}

// =====================
// DATABASE
// =====================
const db = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect()
  .then(() => console.log("API DB connected"))
  .catch(err => console.error("DB error:", err));

// =====================
// IMPORT API
// =====================
app.post("/import/google-drive", async (req, res) => {
  try {
    const { url } = req.body;
    const folderId = extractFolderId(url);

    if (!folderId) {
      return res.status(400).json({ message: "Invalid Drive URL" });
    }

    const images = await listAllImages(folderId);

    const chunkSize = 100;
    for (let i = 0; i < images.length; i += chunkSize) {
      await axios.post(`${WORKER_SERVICE_URL}/process`, {
        images: images.slice(i, i + chunkSize),
      });
    }

    res.json({
      message: "Image import request accepted",
      total_images: images.length,
      jobs_created: Math.ceil(images.length / chunkSize),
    });
  } catch (err) {
    console.error("Import error:", err);
    res.status(500).json({ error: "Import failed" });
  }
});

// =====================
// GET IMAGES
// =====================
app.get("/images", async (req, res) => {
  const result = await db.query(
    "SELECT * FROM images ORDER BY created_at DESC"
  );
  res.json(result.rows);
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`API running on port ${PORT}`)
);

