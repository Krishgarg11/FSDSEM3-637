import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { buildSchema } from "graphql";
import { createHandler } from "graphql-http/lib/use/express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS = path.join(__dirname, "data", "users.json");
const NOTES = path.join(__dirname, "data", "notes.json");
const UPLOADS = path.join(__dirname, "uploads");

const readJson = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const writeJson = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2));
const sessions = new Map(); // token -> username

const schema = buildSchema(`
  type Note { id: ID!  title: String!  description: String!  filename: String!  createdAt: String! }
  type NoteFile { filename: String!  mimeType: String!  base64: String! }
  type AuthPayload { token: String!  username: String! }

  type Query {
    notes(search: String): [Note!]!
    downloadNote(id: ID!): NoteFile
  }
  type Mutation {
    login(username: String!, password: String!): AuthPayload!
    addNote(title: String!, description: String!, filename: String!, base64: String!): Note!
  }
`);

const requireAuth = (ctx) => {
  if (!sessions.has(ctx.token)) throw new Error("Please log in first");
};

const root = {
  // Login: user input is checked against data/users.json
  login: ({ username, password }) => {
    const user = readJson(USERS).find((u) => u.username === username && u.password === password);
    if (!user) throw new Error("Invalid username or password");
    const token = crypto.randomUUID();
    sessions.set(token, username);
    return { token, username };
  },

  notes: ({ search }, ctx) => {
    requireAuth(ctx);
    const q = (search || "").trim().toLowerCase();
    return readJson(NOTES).filter(
      (n) => n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q)
    );
  },

  // Add note: details go into data/notes.json, the file goes into /uploads
  addNote: ({ title, description, filename, base64 }, ctx) => {
    requireAuth(ctx);
    const id = crypto.randomUUID();
    const safe = path.basename(filename).replace(/[^\w.\-]/g, "_");
    fs.writeFileSync(path.join(UPLOADS, `${id}-${safe}`), Buffer.from(base64, "base64"));
    const note = { id, title, description, filename: safe, createdAt: new Date().toISOString() };
    const all = readJson(NOTES);
    all.unshift(note);
    writeJson(NOTES, all);
    return note;
  },

  downloadNote: ({ id }, ctx) => {
    requireAuth(ctx);
    const note = readJson(NOTES).find((n) => n.id === id);
    if (!note) throw new Error("Note not found");
    const data = fs.readFileSync(path.join(UPLOADS, `${note.id}-${note.filename}`));
    return { filename: note.filename, mimeType: "application/octet-stream", base64: data.toString("base64") };
  },
};

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "30mb" }));
app.all(
  "/graphql",
  createHandler({
    schema,
    rootValue: root,
    context: (req) => ({ token: (req.headers.authorization || "").replace("Bearer ", "") }),
  })
);

app.listen(4000, () => console.log("GraphQL server on http://localhost:4000/graphql"));
//admin pass admin123
//student pass student123