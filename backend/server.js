const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Gemini Client
const genAI = new GoogleGenerativeAI("AIzaSyBqNq28MnmYZ3IRP2EH5YMSGt01ReVGOCM");

// ✅ SQLite DB setup
const db = new sqlite3.Database('./meapi.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS profile(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT, email TEXT, education TEXT, work TEXT,
    github TEXT, linkedin TEXT, portfolio TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS skills(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS projects(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT, description TEXT, skill TEXT, link TEXT
  )`);
});

// ✅ Health check
app.get('/health', (_, res) => res.sendStatus(200));

/* ------------ NORMAL ROUTES ------------ */
// 📌 PROFILE
app.get('/profile', (req, res) => {
  db.all('SELECT * FROM profile', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/profile', (req, res) => {
  const { name, email, education, work, github, linkedin, portfolio } = req.body;
  db.run(
    `INSERT INTO profile(name,email,education,work,github,linkedin,portfolio) VALUES(?,?,?,?,?,?,?)`,
    [name, email, education, work, github, linkedin, portfolio],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// 📌 SKILLS
app.get('/skills', (req, res) => {
  db.all('SELECT * FROM skills', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/skills', (req, res) => {
  const { name } = req.body;
  db.run('INSERT INTO skills(name) VALUES(?)', [name], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// 📌 PROJECTS
app.get('/projects', (req, res) => {
  db.all('SELECT * FROM projects', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/projects', (req, res) => {
  const { title, description, skill, link } = req.body;
  db.run(
    'INSERT INTO projects(title,description,skill,link) VALUES(?,?,?,?)',
    [title, description, skill, link],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

/* ------------ GEMINI SEARCH ROUTE ------------ */
app.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ profile: [], skills: [], projects: [] });

  db.all("SELECT * FROM profile", [], (err, profileRows) => {
    if (err) return res.status(500).json({ error: err.message });
    db.all("SELECT * FROM skills", [], (err2, skillsRows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      db.all("SELECT * FROM projects", [], async (err3, projectRows) => {
        if (err3) return res.status(500).json({ error: err3.message });

        const prompt = `
User searched: "${q}"

Profile:
${JSON.stringify(profileRows)}

Skills:
${JSON.stringify(skillsRows)}

Projects:
${JSON.stringify(projectRows)}

👉 Return a JSON object with this structure only:
{
  "profile": [ { "name": "...", "email": "...", "education": "...", "work": "...", "github":"...", "linkedin":"...", "portfolio":"..." } ],
  "skills": [ { "name":"..." } ],
  "projects": [ { "title":"...", "description":"...", "skill":"...", "link":"..." } ]
}

Include only the items most relevant to the search query.
Do not add any explanation outside JSON.
        `;

        try {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const result = await model.generateContent(prompt);
          let content = result.response.text().trim();

          // Remove markdown code blocks if any
          if (content.startsWith("```")) {
            content = content.replace(/```json|```/g, "").trim();
          }

          const parsed = JSON.parse(content);
          res.json(parsed);
        } catch (e) {
          console.error("Gemini search failed:", e);
          res.status(500).json({ error: "Gemini search failed" });
        }
      });
    });
  });
});

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
