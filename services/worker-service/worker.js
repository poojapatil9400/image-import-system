const express = require("express");
const axios = require("axios");
const Minio = require("minio");
const { Client } = require("pg");

const app = express();
app.use(express.json());

// DB
const db = new Client({
  host: "localhost",
  user: "admin",
  password: "admin",
  database: "imagesdb",
});
db.connect();

// MinIO
const minio = new Minio.Client({
  endPoint: "localhost",
  port: 9000,
  useSSL: false,
  accessKey: "minioadmin",
  secretKey: "minioadmin",
});

(async () => {
  const exists = await minio.bucketExists("images");
  if (!exists) await minio.makeBucket("images");
})();

app.post("/process", async (req, res) => {
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
});

app.listen(5000, () => console.log("Worker service running on port 5000"));
