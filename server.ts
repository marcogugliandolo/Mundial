import express from "express";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const dataDir = path.join(process.cwd(), "data");

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db: Database;

async function startServer() {
  // Connect to SQLite DB
  db = await open({
    filename: path.join(dataDir, "porra.sqlite"),
    driver: sqlite3.Database
  });

  // Initialize DB tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      data TEXT
    );
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  const app = express();
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/participants", async (req, res) => {
    try {
      const rows = await db.all("SELECT data FROM participants");
      const participants = rows.map((r) => JSON.parse(r.data));
      res.json(participants);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/participants", async (req, res) => {
    try {
      const participant = req.body;
      if (!participant.id) {
        return res.status(400).json({ error: "Missing ID" });
      }
      await db.run("INSERT OR REPLACE INTO participants (id, data) VALUES (?, ?)", [
        participant.id,
        JSON.stringify(participant),
      ]);
      res.json({ success: true, participant });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/official", async (req, res) => {
    try {
      const row = await db.get("SELECT value FROM config WHERE key = ?", ["official_results"]);
      if (row) {
        res.json(JSON.parse(row.value));
      } else {
        res.json(null);
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/official", async (req, res) => {
    try {
      const data = req.body;
      await db.run("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)", [
        "official_results",
        JSON.stringify(data),
      ]);
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Fallback for SPA routing in production
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
