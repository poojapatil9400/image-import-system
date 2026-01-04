const express = require("express");
const axios = require("axios");
const Minio = require("minio");
const { Client } = require("pg");

const app = express();
app.use(express.json());

// =====================
// DATABASE CONFIG
// =====================
const db = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect()
  .then(() => console.log("Worker DB connected"))
  .catch(err => console.error("DB connection error:", err));

// =====================
// MINIO CONFIG
// =====================
const minio = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: Number(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

// Ensure bucket exists
(async () => {
  try {
    const exists = await minio.bucketExists("images");
    if (!exists) {
      await minio.makeBucket("images");
      console.log("Bucket 'images' created");
    }
  } catch (err) {
    console.error("MinIO bucket error:", err);
  }
})();

// =====================
// PROCESS IMAGES
// =====================
app.post("/process", async (req, res) => {
  try {
    for (const img of req.body.images) {
      console.log("Downloading:", img.name);

      const url = `https://www.googleapis.com/drive/v3/files/${img.id}?alt=media&key=${process.env.GOOGLE_DRIVE_API_KEY}`;

      const response = await axios.get(url, {
        responseType: "arraybuffer",
      });

      const buffer = Buffer.from(response.data);
      const objectName = `${Date.now()}-${img.name}`;

      await minio.putObject(
        "images",
        objectName,
        buffer,
        buffer.length,
        { "Content-Type": img.mimeType }
      );

      await db.query(
        `INSERT INTO images
         (name, google_drive_id, size, mime_type, storage_path)
         VALUES ($1,$2,$3,$4,$5)`,
        [
          img.name,
          img.id,
          img.size || buffer.length,
          img.mimeType,
          `images/${objectName}`,
        ]
      );
    }

    res.json({ status: "processed" });
  } catch (err) {
    console.error("Worker error:", err);
    res.status(500).json({ error: "Processing failed" });
  }
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Worker service running on port ${PORT}`)
);

