import { useEffect, useState } from "react";
import { gql } from "./graphql.js";

const NOTES = `query ($s: String) { notes(search: $s) { id title description filename createdAt } }`;
const ADD = `mutation ($t: String!, $d: String!, $f: String!, $b: String!) {
  addNote(title: $t, description: $d, filename: $f, base64: $b) { id } }`;
const DOWNLOAD = `query ($id: ID!) { downloadNote(id: $id) { filename mimeType base64 } }`;

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(",")[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

export default function Notes({ auth, onLogout }) {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const load = () =>
    gql(NOTES, { s: search }, auth.token)
      .then((d) => { setNotes(d.notes); setError(""); })
      .catch((e) => setError(e.message));

  useEffect(() => { load(); }, [search]);

  async function addNote(e) {
    e.preventDefault();
    if (!file) return setError("Choose a file to upload");
    try {
      await gql(ADD, { t: title, d: description, f: file.name, b: await toBase64(file) }, auth.token);
      setTitle(""); setDescription(""); setFile(null); e.target.reset();
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function download(id) {
    try {
      const { downloadNote: f } = await gql(DOWNLOAD, { id }, auth.token);
      const bytes = Uint8Array.from(atob(f.base64), (c) => c.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: f.mimeType }));
      const a = document.createElement("a");
      a.href = url; a.download = f.filename; a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app">
      <div className="topbar">
        <span>Signed in as {auth.username}</span>
        <button onClick={onLogout}>Log out</button>
      </div>
      <h1>Notes Portal App</h1>

      <form className="card" onSubmit={addNote}>
        <h2>Add a note</h2>
        <input placeholder="Note title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Note description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
        <button type="submit">Upload note</button>
      </form>

      <input className="search" placeholder="🔍 Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} />
      {error && <p className="error">{error}</p>}

      {notes.map((n) => (
        <div key={n.id} className="note">
          <h2>{n.title}</h2>
          <p>{n.description}</p>
          <small>{n.filename}</small>
          <div><button onClick={() => download(n.id)}>Download</button></div>
        </div>
      ))}
      {!error && notes.length === 0 && <p>No notes found.</p>}
    </div>
  );
}
