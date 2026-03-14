import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("aptitude.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    name TEXT,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER,
    question_text TEXT,
    options TEXT, -- JSON string
    correct_answer TEXT,
    explanation TEXT,
    difficulty TEXT,
    FOREIGN KEY(topic_id) REFERENCES topics(id)
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    user_id INTEGER,
    topic_id INTEGER,
    completed BOOLEAN DEFAULT 0,
    score INTEGER DEFAULT 0,
    PRIMARY KEY(user_id, topic_id)
  );
`);

// Seed some initial data if empty
const topicCount = db.prepare("SELECT COUNT(*) as count FROM topics").get() as { count: number };
if (topicCount.count === 0) {
  const insertTopic = db.prepare("INSERT INTO topics (category, name, description) VALUES (?, ?, ?)");
  insertTopic.run("Quantitative", "Percentages", "Understanding fractions of a whole.");
  insertTopic.run("Quantitative", "Time and Work", "Calculating efficiency and duration.");
  insertTopic.run("Quantitative", "Speed and Distance", "Relative motion and travel time.");
  insertTopic.run("Logical", "Syllogisms", "Deductive reasoning from premises.");
  insertTopic.run("Verbal", "Reading Comprehension", "Analyzing and interpreting text.");
}

// Robust Seeding: Check each topic individually
const insertQuestion = db.prepare("INSERT INTO questions (topic_id, question_text, options, correct_answer, explanation, difficulty) VALUES (?, ?, ?, ?, ?, ?)");

const seedTopicQuestions = (topicId: number, questions: any[]) => {
  const count = db.prepare("SELECT COUNT(*) as count FROM questions WHERE topic_id = ?").get(topicId) as { count: number };
  if (count.count === 0) {
    questions.forEach(q => {
      insertQuestion.run(topicId, q.text, JSON.stringify(q.options), q.correct, q.explanation, q.difficulty);
    });
  }
};

// Percentages (Topic ID: 1)
seedTopicQuestions(1, [
  { text: "What is 25% of 480?", options: ["100", "120", "140", "160"], correct: "120", explanation: "25% of 480 = (25/100) * 480 = 120", difficulty: "Easy" },
  { text: "A number is 60% of 250. Find the number.", options: ["120", "140", "150", "180"], correct: "150", explanation: "60% of 250 = (60/100) * 250 = 150", difficulty: "Easy" },
  { text: "The price of a shirt is ₹800. It is increased by 20%. What is the new price?", options: ["₹880", "₹920", "₹960", "₹1000"], correct: "₹960", explanation: "New Price = 800 + (20/100 * 800) = 800 + 160 = ₹960", difficulty: "Medium" },
  { text: "A student scored 45% marks in an exam and got 360 marks. What is the total marks of the exam?", options: ["600", "700", "800", "900"], correct: "800", explanation: "45% of Total = 360 => Total = 360 / 0.45 = 800", difficulty: "Medium" },
  { text: "The salary of an employee increases by 10% in the first year and 20% in the second year. Find the total percentage increase.", options: ["30%", "31%", "32%", "33%"], correct: "32%", explanation: "Let initial salary be 100. After 1st year: 110. After 2nd year: 110 * 1.2 = 132. Total increase = 32%", difficulty: "Advanced" },
  { text: "If the price of sugar increases by 25%, by what percentage should consumption decrease to keep expenditure the same?", options: ["20%", "25%", "15%", "30%"], correct: "20%", explanation: "Let price be P and consumption be C. New price = 1.25P. New consumption C' = E / 1.25P = (P*C) / 1.25P = 0.8C. Decrease = 20%", difficulty: "Advanced" }
]);

// Time and Work (Topic ID: 2)
seedTopicQuestions(2, [
  { text: "A can do a work in 15 days and B in 20 days. If they work on it together for 4 days, then the fraction of the work that is left is:", options: ["1/4", "1/10", "7/15", "8/15"], correct: "8/15", explanation: "A's 1 day work = 1/15; B's 1 day work = 1/20; (A + B)'s 1 day work = (1/15 + 1/20) = 7/60; (A + B)'s 4 days work = (7/60 * 4) = 7/15; Remaining work = (1 - 7/15) = 8/15.", difficulty: "Medium" },
  { text: "A is thrice as good a workman as B and therefore is able to finish a job in 60 days less than B. Working together, they can do it in:", options: ["20 days", "22.5 days", "25 days", "30 days"], correct: "22.5 days", explanation: "Ratio of times taken by A and B = 1:3. Difference = 2. 2 units = 60 days => 1 unit = 30 days. A takes 30 days, B takes 90 days. Together: (30*90)/(30+90) = 2700/120 = 22.5 days.", difficulty: "Hard" }
]);

// Speed and Distance (Topic ID: 3)
seedTopicQuestions(3, [
  { text: "A person crosses a 600 m long street in 5 minutes. What is his speed in km per hour?", options: ["3.6", "7.2", "8.4", "10"], correct: "7.2", explanation: "Speed = 600 / (5 * 60) = 2 m/sec. In km/hr = 2 * (18/5) = 7.2 km/hr.", difficulty: "Easy" },
  { text: "If a person walks at 14 km/hr instead of 10 km/hr, he would have walked 20 km more. The actual distance travelled by him is:", options: ["50 km", "56 km", "70 km", "80 km"], correct: "50 km", explanation: "Let actual distance be x. x/10 = (x+20)/14 => 14x = 10x + 200 => 4x = 200 => x = 50 km.", difficulty: "Medium" }
]);

// Syllogisms (Topic ID: 4)
seedTopicQuestions(4, [
  { text: "Statements: All mangoes are golden in colour. No golden-coloured things are cheap. Conclusions: I) All mangoes are cheap. II) Golden-coloured mangoes are not cheap.", options: ["Only I follows", "Only II follows", "Either I or II follows", "Neither I nor II follows"], correct: "Only II follows", explanation: "All mangoes are golden. No golden is cheap. So, no mango is cheap. Conclusion II follows.", difficulty: "Easy" },
  { text: "Statements: Some actors are singers. All the singers are dancers. Conclusions: I) Some actors are dancers. II) No singer is actor.", options: ["Only I follows", "Only II follows", "Both I and II follow", "Neither I nor II follows"], correct: "Only I follows", explanation: "Some actors are singers + All singers are dancers => Some actors are dancers.", difficulty: "Medium" }
]);

// Reading Comprehension (Topic ID: 5)
seedTopicQuestions(5, [
  { text: "Passage: 'The impact of digital technology on education has been profound. It has democratized access to information, allowing students from remote areas to learn from the best resources.' Question: What is a positive impact mentioned?", options: ["Digital distraction", "Democratized access", "Digital divide", "Increased costs"], correct: "Democratized access", explanation: "The passage explicitly states it has democratized access to information.", difficulty: "Easy" },
  { text: "Passage: 'Climate change is no longer a distant threat but a present reality. Melting ice caps and rising sea levels are clear indicators.' Question: What is the main theme of the passage?", options: ["Melting ice caps", "Sustainable energy", "Urgency of climate change", "Extreme weather"], correct: "Urgency of climate change", explanation: "The passage emphasizes that climate change is a 'present reality'.", difficulty: "Medium" }
]);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/topics", (req, res) => {
    const topics = db.prepare("SELECT * FROM topics").all();
    res.json(topics);
  });

  app.get("/api/user/:id", (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
    res.json(user || { id: 1, name: "Student", xp: 120, level: 2 }); // Mock if not found
  });

  app.get("/api/questions/:topicId", (req, res) => {
    const questions = db.prepare("SELECT * FROM questions WHERE topic_id = ?").all() as any[];
    const parsedQuestions = questions.map(q => ({
      ...q,
      options: JSON.parse(q.options)
    }));
    res.json(parsedQuestions);
  });

  app.get("/api/mock-questions", (req, res) => {
    const questions = db.prepare("SELECT * FROM questions ORDER BY RANDOM() LIMIT 10").all() as any[];
    const parsedQuestions = questions.map(q => ({
      ...q,
      options: JSON.parse(q.options)
    }));
    res.json(parsedQuestions);
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
