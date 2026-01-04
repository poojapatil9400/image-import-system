import { useState } from "react";
import "./App.css";

const API_BASE_URL = process.env.REACT_APP_API_URL;

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
      const res = await fetch(
        `${API_BASE_URL}/import/google-drive`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: driveUrl })
        }
      );

      const data = await res.json();
      setStatus(data.message || "Import request submitted");
    } catch (err) {
      console.error(err);
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

      <div className="links">
        <h3>Verify Images</h3>
        <p>
          After import, verify data using backend API:
          <br />
          <a
            href={`${API_BASE_URL}/images`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Stored Images
          </a>
        </p>

        <p style={{ fontSize: "0.9em", color: "#777" }}>
          (MinIO UI is not exposed publicly in production)
        </p>
      </div>
    </div>
  );
}

export default App;

