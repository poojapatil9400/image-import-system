import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [images, setImages] = useState([]);

  const importImages = async () => {
    setMessage("Importing images...");
    try {
      const res = await fetch("http://localhost:4000/import/google-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage("Backend not reachable");
    }
  };

  const loadImages = async () => {
    try {
      const res = await fetch("http://localhost:4000/images");
      const data = await res.json();
      setImages(data);
    } catch {}
  };

  useEffect(() => {
    loadImages();
  }, []);

  return (
    <div className="container">
      <h1>📸 Image Import System</h1>
      <p className="subtitle">
        Import images from a public Google Drive folder
      </p>

      <div className="card">
        <input
          type="text"
          placeholder="Paste Google Drive folder URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button onClick={importImages}>Import Images</button>
        <p className="message">{message}</p>
      </div>

      <h2>Imported Images</h2>
      <div className="grid">
        {images.length === 0 && <p>No images imported yet</p>}
        {images.map((img) => (
          <div className="image-card" key={img.id}>
            <p>{img.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
