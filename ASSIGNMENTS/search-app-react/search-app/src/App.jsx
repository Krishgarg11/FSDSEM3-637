import { useState } from "react";
import notes from "./notes.js";

export default function App() {
  const [search, setSearch] = useState("");

  const filtered = notes.filter((n) =>
    n.title.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="app">
      <h1>Notes Portal App</h1>
      <input
        className="search"
        type="text"
        placeholder="🔍 Search notes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.map((n) => (
        <div key={n.id} className="note">
          <h2>{n.title}</h2>
          <a href={n.file} download>
            <button>Download</button>
          </a>
        </div>
      ))}

      {filtered.length === 0 && <p>No notes match your search.</p>}
    </div>
  );
}
