const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./meapi.db');

db.serialize(() => {
  // Ensure tables exist
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

  // Clear old data
  db.run('DELETE FROM profile');
  db.run('DELETE FROM skills');
  db.run('DELETE FROM projects');

  // Insert Profile (from your resume)
  db.run(`INSERT INTO profile(name,email,education,work,github,linkedin,portfolio)
    VALUES(?,?,?,?,?,?,?)`,
    [
      'Aadil Ali',
      'aadilalitank@gmail.com',
      'Bachelor of Computer Applications - 74.92% (2018–2022, MDS University, Ajmer)',
      'Full Stack AI Developer | React, Next.js, Node.js, MongoDB, AI Integrations',
      'https://github.com/aadilaliofficial',
      'https://linkedin.com/in/aadilalideveloper',
      'https://bit.ly/aadilaliportfolio'
    ]
  );

  // Insert Skills (from resume)
  const skills = [
    'HTML5','CSS3','JavaScript','Bootstrap','jQuery',
    'Tailwind CSS','Material UI','React.js','Redux','Axios','Next.js',
    'Node.js','Express.js','RESTful API','MongoDB','PostGreSQL','SQL','JWT',
    'Python','TensorFlow.js','LangChain.js','Natural.js','Gemini API',
    'OpenAI API','Hugging Face API','AWS','Firebase','Vercel','Render',
    'Cloudinary','Postman','Git','GitHub','VS Code','Figma'
  ];
  skills.forEach(s => db.run('INSERT INTO skills(name) VALUES(?)', [s]));

  // Insert Projects (from resume)
  const projects = [
    [
      'Smart AI Kanban To Do',
      'Kanban-based task management app with auth, CRUD, drag-and-drop, and real-time updates via Socket.IO',
      'Next.js, Node.js, MongoDB',
      'https://kanban-todo-assignment.vercel.app/login'
    ],
    [
      'Personal Finance Visualizer',
      'Finance tracking app with charts, SWR, and real-time insights using MongoDB Atlas',
      'Next.js, Recharts, MongoDB',
      'https://personalfinancevisualizer-2fgu.onrender.com/'
    ],
    [
      'React Performance Research',
      'Research project on React performance optimization',
      'React.js',
      'https://github.com/aadilaliofficial/reactPerformance-01-researchPaper'
    ],
    [
      'Shopease',
      'Hackathon project – E-commerce app with AI-powered features',
      'Full Stack',
      'https://devfolio.co/projects/shopease-5043'
    ],
    [
      'AI Image Classifier',
      'Hackathon project – AI-based image classifier',
      'AI / ML',
      'https://devfolio.co/projects/ai-image-classifier-b58c'
    ]
  ];
  projects.forEach(p => db.run('INSERT INTO projects(title,description,skill,link) VALUES(?,?,?,?)', p));
});

db.close(() => console.log('Tables ensured and resume data seeded successfully.'));
