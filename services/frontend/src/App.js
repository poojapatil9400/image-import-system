import { useState } from "react";
import "./App.css";

function App() {
  const [driveUrl, setDriveUrl] = useState("");
  const [status, setStatus] = useState("");

  // Use environment variable for API
  const API_URL = process.env.REACT_APP_API_URL;

  const importImages = async () => {
    if (!driveUrl) {
      setStatus("Please enter Google Drive folder URL");
      return;
    }

    setStatus("Import started...");

    try {
      const res = await fetch(`${API_URL}/import/google-drive`, {
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

      {/* Links to verify images */}
      <div className="links">
        <h3>Verify Images in PostgreSQL</h3>
        <p>
          Visit API endpoint: 
          <a href={`${API_URL}/images`} target="_blank" rel="noopener noreferrer">{`${API_URL}/images`}</a>
        </p>
      </div>
    </div>
  );
}

export default App;

