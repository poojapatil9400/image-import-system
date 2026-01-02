import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [driveUrl, setDriveUrl] = useState("");
  const [status, setStatus] = useState("");

  const importImages = async () => {
    if (!driveUrl) {
      setStatus("Please enter Google Drive folder URL");
      return;
    }

    setStatus("Import started...");

    try {
      const res = await fetch("http://localhost:4000/import/google-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: driveUrl })
      });

      const data = await res.json();
      setStatus(data.message || "Import request submitted");
    } catch {
      setStatus("Backend not reachable");
    }
  };

  return (
    <div className="container">
      <h1>Image Import System</h1>
      <p className="subtitle">
        Import images from a public Google Drive folder
      </p>

      <div className="box">
        <input
          type="text"
          placeholder="Paste Google Drive folder URL"
          value={driveUrl}
          onChange={(e) => setDriveUrl(e.target.value)}
        />
        <button onClick={importImages}>Import Images</button>
        <p className="status">{status}</p>
      </div>

      {/* Removed Images Display Section */}
      {/* No grid or image cards are displayed anymore */}

      {/* Links to verify images */}
      <div className="links">
        <h3>Verify Images in MinIO</h3>
        <p>
          Visit <a href="http://localhost:9001" target="_blank" rel="noopener noreferrer">MinIO's Web Interface</a> to view the imported images.
          <br />
          Login with:
          <br />
          Username: `minioadmin`
          <br />
          Password: `minioadmin`
        </p>

        <h3>Verify Images in PostgreSQL</h3>
        <p>
          To verify the images are saved in the PostgreSQL database, visit the API endpoint: 
          <a href="http://localhost:4000/images" target="_blank" rel="noopener noreferrer">http://localhost:4000/images</a>
        </p>
      </div>
    </div>
  );
}

export default App;

