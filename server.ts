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

// Seed initial data
const insertTopic = db.prepare("INSERT INTO topics (category, name, description) VALUES (?, ?, ?)");
const checkTopic = db.prepare("SELECT id FROM topics WHERE name = ?");

const topicsToSeed = [
  ["Arithmetic", "Percentage", "Understanding fractions of a whole."],
  ["Arithmetic", "Profit and Loss", "Calculating gains and losses in trade."],
  ["Arithmetic", "Simple Interest", "Calculating interest on principal amount."],
  ["Arithmetic", "Compound Interest", "Interest on interest calculations."],
  ["Arithmetic", "Partnership", "Business sharing and investment math."],
  ["Arithmetic", "Ratio and Proportion", "Comparing quantities and proportions."],
  ["Arithmetic", "Average", "Calculating the mean of a set of values."],
  ["Arithmetic", "Problems on Ages", "Mathematical problems involving age calculations."],
  ["Arithmetic", "Time and Work", "Calculating efficiency and duration."],
  ["Arithmetic", "Pipes and Cistern", "Flow rates and tank filling problems."],
  ["Arithmetic", "Time and Distance", "Relative motion and travel time."],
  ["Arithmetic", "Problems on Trains", "Speed and distance specifically for trains."],
  ["Arithmetic", "Boats and Streams", "Upstream and downstream calculations."],
  ["Arithmetic", "Alligation or Mixture", "Mixing quantities of different values."],
  ["Arithmetic", "Chain Rule", "Direct and indirect proportions."],
  ["Arithmetic", "Decimal Fraction", "Operations with decimal numbers."],
  ["Arithmetic", "Simplification", "Reducing complex expressions."],
  ["Arithmetic", "Square Root and Cube Root", "Finding roots of numbers."],
  ["Arithmetic", "Problems on Numbers", "Properties and types of numbers."],
  ["Arithmetic", "Problems on H.C.F and L.C.M", "Highest Common Factor and Least Common Multiple."],
  ["Quantitative", "Permutation and Combination", "Arrangements and selections."],
  ["Quantitative", "Probability", "Likelihood of events occurring."],
  ["Quantitative", "Logarithm", "Inverse operations of exponentiation."],
  ["Quantitative", "Surds and Indices", "Powers and roots of numbers."],
  ["Quantitative", "Area", "Measuring 2D surfaces."],
  ["Quantitative", "Volume and Surface Area", "Measuring 3D shapes."],
  ["Quantitative", "Height and Distance", "Trigonometric applications."],
  ["Quantitative", "Races and Games", "Competitive math scenarios."],
  ["Quantitative", "Stocks and Shares", "Financial math and investments."],
  ["Quantitative", "True Discount", "Present value calculations."],
  ["Quantitative", "Banker’s Discount", "Banking interest and discounts."],
  ["Quantitative", "Calendar", "Date and day calculations."],
  ["Quantitative", "Clock", "Time and angle calculations."],
  ["Quantitative", "Odd Man Out and Series", "Pattern recognition and logic."],
  ["Logical", "Logical Sequence of Words", "Arranging words in a meaningful order."],
  ["Logical", "Blood Relation Test", "Deciphering family relationships."],
  ["Logical", "Syllogism", "Deductive reasoning from premises."],
  ["Logical", "Series Completion", "Identifying patterns in number or letter series."],
  ["Logical", "Cause and Effect", "Analyzing relationships between events."],
  ["Logical", "Dice", "Visualizing 3D cube rotations and faces."],
  ["Logical", "Venn Diagrams", "Representing relationships between sets."],
  ["Logical", "Cube and Cuboid", "Geometric reasoning with 3D shapes."],
  ["Logical", "Analogy", "Finding similarities between pairs of concepts."],
  ["Logical", "Seating Arrangement", "Logical positioning based on constraints."],
  ["Logical", "Character Puzzles", "Solving puzzles involving symbols or characters."],
  ["Logical", "Direction Sense Test", "Navigating based on cardinal directions."],
  ["Logical", "Classification", "Identifying the odd one out in a group."],
  ["Logical", "Data Sufficiency", "Determining if given data is enough to solve a problem."],
  ["Logical", "Arithmetic Reasoning", "Mathematical problems requiring logical thinking."],
  ["Verbal", "Spotting Errors", "Identifying grammatical errors in sentences."],
  ["Verbal", "Synonyms", "Finding words with similar meanings."],
  ["Verbal", "Antonyms", "Finding words with opposite meanings."],
  ["Verbal", "Selecting Words", "Choosing the most appropriate word for a context."],
  ["Verbal", "Spellings", "Identifying correctly or incorrectly spelled words."],
  ["Verbal", "Sentence Formation", "Constructing meaningful sentences from fragments."],
  ["Verbal", "Ordering of Words", "Arranging words to form a coherent sentence."],
  ["Verbal", "Sentence Correction", "Correcting grammatically incorrect sentences."],
  ["Verbal", "Sentence Improvement", "Enhancing sentence structure and clarity."],
  ["Verbal", "Completing Statements", "Filling in blanks to complete a logical statement."],
  ["Verbal", "Ordering of Sentences", "Arranging sentences in a logical sequence."],
  ["Verbal", "Paragraph Formation", "Constructing a coherent paragraph from sentences."],
  ["Verbal", "Cloze Test", "Filling in blanks within a passage."],
  ["Verbal", "Comprehension", "Analyzing and interpreting written passages."],
  ["Verbal", "One Word Substitutes", "Replacing a phrase with a single word."],
  ["Verbal", "Idioms and Phrases", "Understanding figurative expressions."],
  ["Verbal", "Change of Voice", "Converting between active and passive voice."],
  ["Verbal", "Change of Speech", "Converting between direct and indirect speech."],
  ["Verbal", "Verbal Analogies", "Finding relationships between pairs of words."]
];

topicsToSeed.forEach(([category, name, description]) => {
  const existing = checkTopic.get(name);
  if (!existing) {
    insertTopic.run(category, name, description);
  } else {
    // Update category if it changed
    db.prepare("UPDATE topics SET category = ? WHERE name = ?").run(category, name);
  }
});

// Robust Seeding: Check each topic individually
const insertQuestion = db.prepare("INSERT INTO questions (topic_id, question_text, options, correct_answer, explanation, difficulty) VALUES (?, ?, ?, ?, ?, ?)");

const seedTopicQuestions = (topicName: string, questions: any[]) => {
  const topic = db.prepare("SELECT id FROM topics WHERE name = ?").get(topicName) as { id: number };
  if (!topic) return;
  
  const count = db.prepare("SELECT COUNT(*) as count FROM questions WHERE topic_id = ?").get(topic.id) as { count: number };
  if (count.count === 0) {
    questions.forEach(q => {
      insertQuestion.run(topic.id, q.text, JSON.stringify(q.options), q.correct, q.explanation, q.difficulty);
    });
  }
};

// Percentage
seedTopicQuestions("Percentage", [
  { text: "What is 25% of 480?", options: ["100", "120", "140", "160"], correct: "120", explanation: "25% of 480 = (25/100) * 480 = 120", difficulty: "Easy" },
  { text: "A number is 60% of 250. Find the number.", options: ["120", "140", "150", "180"], correct: "150", explanation: "60% of 250 = (60/100) * 250 = 150", difficulty: "Easy" },
  { text: "The price of a shirt is ₹800. It is increased by 20%. What is the new price?", options: ["₹880", "₹920", "₹960", "₹1000"], correct: "₹960", explanation: "New Price = 800 + (20/100 * 800) = 800 + 160 = ₹960", difficulty: "Medium" },
  { text: "A student scored 45% marks in an exam and got 360 marks. What is the total marks of the exam?", options: ["600", "700", "800", "900"], correct: "800", explanation: "45% of Total = 360 => Total = 360 / 0.45 = 800", difficulty: "Medium" },
  { text: "The salary of an employee increases by 10% in the first year and 20% in the second year. Find the total percentage increase.", options: ["30%", "31%", "32%", "33%"], correct: "32%", explanation: "Let initial salary be 100. After 1st year: 110. After 2nd year: 110 * 1.2 = 132. Total increase = 32%", difficulty: "Advanced" },
  { text: "If the price of sugar increases by 25%, by what percentage should consumption decrease to keep expenditure the same?", options: ["20%", "25%", "15%", "30%"], correct: "20%", explanation: "Let price be P and consumption be C. New price = 1.25P. New consumption C' = E / 1.25P = (P*C) / 1.25P = 0.8C. Decrease = 20%", difficulty: "Advanced" }
]);

// Time and Work
seedTopicQuestions("Time and Work", [
  { text: "A can do a work in 15 days and B in 20 days. If they work on it together for 4 days, then the fraction of the work that is left is:", options: ["1/4", "1/10", "7/15", "8/15"], correct: "8/15", explanation: "A's 1 day work = 1/15; B's 1 day work = 1/20; (A + B)'s 1 day work = (1/15 + 1/20) = 7/60; (A + B)'s 4 days work = (7/60 * 4) = 7/15; Remaining work = (1 - 7/15) = 8/15.", difficulty: "Medium" },
  { text: "A is thrice as good a workman as B and therefore is able to finish a job in 60 days less than B. Working together, they can do it in:", options: ["20 days", "22.5 days", "25 days", "30 days"], correct: "22.5 days", explanation: "Ratio of times taken by A and B = 1:3. Difference = 2. 2 units = 60 days => 1 unit = 30 days. A takes 30 days, B takes 90 days. Together: (30*90)/(30+90) = 2700/120 = 22.5 days.", difficulty: "Hard" }
]);

// Time and Distance
seedTopicQuestions("Time and Distance", [
  { text: "A person crosses a 600 m long street in 5 minutes. What is his speed in km per hour?", options: ["3.6", "7.2", "8.4", "10"], correct: "7.2", explanation: "Speed = 600 / (5 * 60) = 2 m/sec. In km/hr = 2 * (18/5) = 7.2 km/hr.", difficulty: "Easy" },
  { text: "If a person walks at 14 km/hr instead of 10 km/hr, he would have walked 20 km more. The actual distance travelled by him is:", options: ["50 km", "56 km", "70 km", "80 km"], correct: "50 km", explanation: "Let actual distance be x. x/10 = (x+20)/14 => 14x = 10x + 200 => 4x = 200 => x = 50 km.", difficulty: "Medium" }
]);

// Syllogisms
seedTopicQuestions("Syllogisms", [
  { text: "Statements: All mangoes are golden in colour. No golden-coloured things are cheap. Conclusions: I) All mangoes are cheap. II) Golden-coloured mangoes are not cheap.", options: ["Only I follows", "Only II follows", "Either I or II follows", "Neither I nor II follows"], correct: "Only II follows", explanation: "All mangoes are golden. No golden is cheap. So, no mango is cheap. Conclusion II follows.", difficulty: "Easy" },
  { text: "Statements: Some actors are singers. All the singers are dancers. Conclusions: I) Some actors are dancers. II) No singer is actor.", options: ["Only I follows", "Only II follows", "Both I and II follow", "Neither I nor II follows"], correct: "Only I follows", explanation: "Some actors are singers + All singers are dancers => Some actors are dancers.", difficulty: "Medium" }
]);

// Reading Comprehension
seedTopicQuestions("Reading Comprehension", [
  { text: "Passage: 'The impact of digital technology on education has been profound. It has democratized access to information, allowing students from remote areas to learn from the best resources.' Question: What is a positive impact mentioned?", options: ["Digital distraction", "Democratized access", "Digital divide", "Increased costs"], correct: "Democratized access", explanation: "The passage explicitly states it has democratized access to information.", difficulty: "Easy" },
  { text: "Passage: 'Climate change is no longer a distant threat but a present reality. Melting ice caps and rising sea levels are clear indicators.' Question: What is the main theme of the passage?", options: ["Melting ice caps", "Sustainable energy", "Urgency of climate change", "Extreme weather"], correct: "Urgency of climate change", explanation: "The passage emphasizes that climate change is a 'present reality'.", difficulty: "Medium" }
]);

// Ratio and Proportion
seedTopicQuestions("Ratio and Proportion", [
  { text: "If A:B = 2:3 and B:C = 4:5, find A:B:C.", options: ["8:12:15", "2:3:5", "4:6:10", "8:10:15"], correct: "8:12:15", explanation: "A:B = 2:3 = 8:12; B:C = 4:5 = 12:15. So A:B:C = 8:12:15", difficulty: "Medium" },
  { text: "Two numbers are in the ratio 3:5. If 9 is subtracted from each, the new numbers are in the ratio 12:23. The smaller number is:", options: ["27", "33", "49", "55"], correct: "33", explanation: "Let numbers be 3x and 5x. (3x-9)/(5x-9) = 12/23. Solving gives x=11. Smaller number = 3*11 = 33.", difficulty: "Hard" }
]);

// Profit and Loss
seedTopicQuestions("Profit and Loss", [
  { text: "A person buys a toy for ₹50 and sells it for ₹75. What is the profit percentage?", options: ["25%", "50%", "75%", "100%"], correct: "50%", explanation: "Profit = 75 - 50 = 25. Profit% = (25/50) * 100 = 50%.", difficulty: "Easy" },
  { text: "If the cost price of 10 articles is equal to the selling price of 8 articles, find the profit percentage.", options: ["20%", "25%", "30%", "40%"], correct: "25%", explanation: "Let CP of 1 article be ₹1. CP of 10 = ₹10. SP of 8 = ₹10. SP of 1 = ₹1.25. Profit = 0.25. Profit% = 25%.", difficulty: "Medium" }
]);

// Permutation and Combination
seedTopicQuestions("Permutation and Combination", [
  { text: "In how many ways can the letters of the word 'LEADER' be arranged?", options: ["72", "144", "360", "720"], correct: "360", explanation: "The word 'LEADER' contains 6 letters, namely 1L, 2E, 1A, 1D, 1R. Total arrangements = 6! / 2! = 720 / 2 = 360.", difficulty: "Medium" },
  { text: "In how many ways a committee, consisting of 5 men and 6 women can be formed from 8 men and 10 women?", options: ["266", "5040", "11760", "86400"], correct: "11760", explanation: "Number of ways = (8C5 * 10C6) = (8C3 * 10C4) = 56 * 210 = 11760.", difficulty: "Hard" },
  { text: "How many 3-digit numbers can be formed from the digits 2, 3, 5, 6, 7 and 9, which are divisible by 5 and none of the digits is repeated?", options: ["5", "10", "15", "20"], correct: "20", explanation: "For a number to be divisible by 5, the last digit must be 5. Remaining 2 positions can be filled by 5 digits in 5P2 = 20 ways.", difficulty: "Medium" }
]);

// Probability
seedTopicQuestions("Probability", [
  { text: "Tickets numbered 1 to 20 are mixed up and then a ticket is drawn at random. What is the probability that the ticket drawn has a number which is a multiple of 3 or 5?", options: ["1/2", "2/5", "8/15", "9/20"], correct: "9/20", explanation: "Multiples of 3: {3, 6, 9, 12, 15, 18}. Multiples of 5: {5, 10, 15, 20}. Combined: {3, 5, 6, 9, 10, 12, 15, 18, 20}. Total = 9. Probability = 9/20.", difficulty: "Medium" },
  { text: "A bag contains 2 red, 3 green and 2 blue balls. Two balls are drawn at random. What is the probability that none of the balls drawn is blue?", options: ["10/21", "11/21", "2/7", "5/7"], correct: "10/21", explanation: "Total balls = 7. Total ways to draw 2 = 7C2 = 21. Ways to draw 2 non-blue (red or green) = 5C2 = 10. Probability = 10/21.", difficulty: "Hard" },
  { text: "In a box, there are 8 red, 7 blue and 6 green balls. One ball is picked up randomly. What is the probability that it is neither red nor green?", options: ["1/3", "7/21", "8/21", "9/21"], correct: "7/21", explanation: "Total balls = 8+7+6 = 21. Neither red nor green means it must be blue. P(Blue) = 7/21 = 1/3.", difficulty: "Easy" }
]);

// Logarithm
seedTopicQuestions("Logarithm", [
  { text: "If log 27 = 1.431, then the value of log 9 is:", options: ["0.934", "0.945", "0.954", "0.958"], correct: "0.954", explanation: "log 27 = log(3^3) = 3 log 3 = 1.431 => log 3 = 0.477. log 9 = log(3^2) = 2 log 3 = 2 * 0.477 = 0.954.", difficulty: "Medium" },
  { text: "The value of log_5 (1/125) is:", options: ["3", "-3", "1/3", "-1/3"], correct: "-3", explanation: "log_5 (1/125) = log_5 (5^-3) = -3.", difficulty: "Easy" },
  { text: "If log_10 x = a, then log_10 (x^2) is equal to:", options: ["a^2", "2a", "a/2", "a+2"], correct: "2a", explanation: "log(x^n) = n log x. So log_10 (x^2) = 2 log_10 x = 2a.", difficulty: "Easy" }
]);

// Surds and Indices
seedTopicQuestions("Surds and Indices", [
  { text: "The value of (256)^0.16 * (256)^0.09 is:", options: ["4", "16", "64", "256.25"], correct: "4", explanation: "(256)^(0.16 + 0.09) = (256)^0.25 = (256)^(1/4) = (4^4)^(1/4) = 4.", difficulty: "Medium" },
  { text: "If 5^a = 3125, then the value of 5^(a-3) is:", options: ["25", "125", "625", "1625"], correct: "25", explanation: "5^a = 5^5 => a = 5. 5^(a-3) = 5^(5-3) = 5^2 = 25.", difficulty: "Easy" },
  { text: "The value of (1/216)^(-2/3) / (1/27)^(-4/3) is:", options: ["3/4", "2/3", "4/9", "1/8"], correct: "4/9", explanation: "(6^-3)^(-2/3) / (3^-3)^(-4/3) = 6^2 / 3^4 = 36 / 81 = 4/9.", difficulty: "Hard" }
]);

// Area
seedTopicQuestions("Area", [
  { text: "The length of a rectangle is 18 cm and its breadth is 10 cm. If the length is increased to 25 cm, what should be the breadth so that the area remains the same?", options: ["7.2 cm", "7.5 cm", "8 cm", "9 cm"], correct: "7.2 cm", explanation: "Original Area = 18 * 10 = 180. New Breadth = 180 / 25 = 7.2 cm.", difficulty: "Medium" },
  { text: "The area of a circle is 154 cm². Its radius is:", options: ["7 cm", "14 cm", "21 cm", "3.5 cm"], correct: "7 cm", explanation: "Area = πr² = 154 => (22/7) * r² = 154 => r² = 49 => r = 7 cm.", difficulty: "Easy" },
  { text: "A rectangular park 60 m long and 40 m wide has two concrete crossroads running in the middle of the park and rest of the park has been used as a lawn. If the area of the lawn is 2109 sq. m, then what is the width of the road?", options: ["2.91 m", "3 m", "5.82 m", "None of these"], correct: "3 m", explanation: "Area of park = 2400. Area of roads = 2400 - 2109 = 291. Let width be x. 60x + 40x - x^2 = 291 => x^2 - 100x + 291 = 0. x=3 or 97. Width = 3m.", difficulty: "Hard" }
]);

// Volume and Surface Area
seedTopicQuestions("Volume and Surface Area", [
  { text: "A cube has a side of 5 cm. Its volume is:", options: ["25 cm³", "100 cm³", "125 cm³", "150 cm³"], correct: "125 cm³", explanation: "Volume = side³ = 5³ = 125 cm³.", difficulty: "Easy" },
  { text: "The surface area of a sphere is 616 cm². Its radius is:", options: ["7 cm", "14 cm", "21 cm", "3.5 cm"], correct: "7 cm", explanation: "Surface Area = 4πr² = 616 => 4 * (22/7) * r² = 616 => r² = 49 => r = 7 cm.", difficulty: "Medium" },
  { text: "A cistern 6m long and 4m wide contains water up to a depth of 1m 25cm. The total area of the wet surface is:", options: ["49 m²", "50 m²", "53.5 m²", "55 m²"], correct: "49 m²", explanation: "Area of bottom = 6*4 = 24. Area of 4 walls = 2(6+4)*1.25 = 25. Total wet area = 24+25 = 49 m².", difficulty: "Hard" }
]);

// Height and Distance
seedTopicQuestions("Height and Distance", [
  { text: "The angle of elevation of the sun, when the length of the shadow of a tree is equal to the height of the tree, is:", options: ["30°", "45°", "60°", "90°"], correct: "45°", explanation: "tan θ = Height / Shadow. Since Height = Shadow, tan θ = 1 => θ = 45°.", difficulty: "Easy" },
  { text: "A ladder 15 m long just reaches the top of a vertical wall. If the ladder makes an angle of 60° with the wall, then the height of the wall is:", options: ["15√3 m", "15/2 m", "15/√2 m", "15 m"], correct: "15/2 m", explanation: "Angle with wall is 60°, so angle with ground is 30°. sin 30° = Height / 15 => 1/2 = Height / 15 => Height = 7.5 m.", difficulty: "Medium" },
  { text: "Two ships are sailing in the sea on the either side of a lighthouse. The angles of depression of the two ships as observed from the top of the lighthouse are 30° and 45° respectively. If the lighthouse is 100 m high, the distance between the two ships is:", options: ["173 m", "200 m", "273 m", "300 m"], correct: "273 m", explanation: "Distance 1 = 100/tan 30 = 100√3 = 173.2. Distance 2 = 100/tan 45 = 100. Total = 273.2 m.", difficulty: "Hard" }
]);

// Problems on Numbers
seedTopicQuestions("Problems on Numbers", [
  { text: "The sum of the first 50 natural numbers is:", options: ["1225", "1275", "1325", "1375"], correct: "1275", explanation: "Sum = n(n+1)/2 = 50(51)/2 = 25 * 51 = 1275.", difficulty: "Easy" },
  { text: "A number when divided by 899 gives a remainder 63. If the same number is divided by 29, the remainder will be:", options: ["3", "4", "5", "10"], correct: "5", explanation: "Remainder = 63 mod 29 = 5.", difficulty: "Medium" },
  { text: "The difference between a two-digit number and the number obtained by interchanging the positions of its digits is 36. What is the difference between the two digits of that number?", options: ["3", "4", "9", "None of these"], correct: "4", explanation: "(10x+y) - (10y+x) = 36 => 9(x-y) = 36 => x-y = 4.", difficulty: "Medium" }
]);

// Races and Games
seedTopicQuestions("Races and Games", [
  { text: "In a 100 m race, A can beat B by 25 m and B can beat C by 4 m. In the same race, A can beat C by:", options: ["21 m", "26 m", "28 m", "29 m"], correct: "28 m", explanation: "When A covers 100m, B covers 75m. When B covers 100m, C covers 96m. When B covers 75m, C covers (96/100)*75 = 72m. A beats C by 100 - 72 = 28m.", difficulty: "Medium" },
  { text: "In a game of 100 points, A can give B 20 points and C 28 points. Then, B can give C:", options: ["8 points", "10 points", "14 points", "40 points"], correct: "10 points", explanation: "A:B = 100:80, A:C = 100:72. B:C = 80:72 = 100:90. B can give C 10 points.", difficulty: "Medium" },
  { text: "In a 500 m race, the ratio of the speeds of two contestants A and B is 3 : 4. A has a start of 140 m. Then, A wins by:", options: ["60 m", "40 m", "20 m", "10 m"], correct: "20 m", explanation: "To reach 500m, A needs to cover 360m. Time taken by A = 360/3k = 120/k. In this time, B covers 4k * (120/k) = 480m. A wins by 500 - 480 = 20m.", difficulty: "Hard" }
]);

// Stocks and Shares
seedTopicQuestions("Stocks and Shares", [
  { text: "The cost price of a ₹100 stock at 4% discount, brokerage being 1/4%, is:", options: ["₹95.75", "₹96.25", "₹104.25", "₹103.75"], correct: "₹96.25", explanation: "CP = (100 - 4) + 1/4 = 96 + 0.25 = ₹96.25.", difficulty: "Medium" },
  { text: "Find the income derived from ₹8800, 12% stock at 110.", options: ["₹960", "₹1056", "₹1000", "₹1200"], correct: "₹960", explanation: "Investment = 8800. Face Value = (8800/110) * 100 = 8000. Income = 12% of 8000 = ₹960.", difficulty: "Medium" },
  { text: "A man buys ₹20 shares paying 9% dividend. The man wants to have an interest of 12% on his money. The market value of each share is:", options: ["₹12", "₹15", "₹18", "₹21"], correct: "₹15", explanation: "Dividend = 9% of 20 = 1.8. Interest = 12% of MV = 1.8 => MV = 1.8 / 0.12 = ₹15.", difficulty: "Hard" }
]);

// True Discount
seedTopicQuestions("True Discount", [
  { text: "The true discount on ₹2562 due 4 months hence is ₹122. The rate percent is:", options: ["12%", "15%", "10%", "18%"], correct: "15%", explanation: "PW = Amount - TD = 2562 - 122 = 2440. SI on 2440 for 4 months is 122. R = (122 * 100 * 12) / (2440 * 4) = 15%.", difficulty: "Hard" },
  { text: "The true discount on a bill due 9 months hence at 12% per annum is ₹540. Find the amount of the bill.", options: ["₹6000", "₹6540", "₹5400", "₹5940"], correct: "₹6540", explanation: "TD = (A * R * T) / (100 + RT) => 540 = (A * 12 * 9/12) / (100 + 12 * 9/12) => 540 = 9A / 109 => A = 6540.", difficulty: "Hard" },
  { text: "The present worth of ₹2310 due 2½ years hence, the rate of interest being 15% per annum, is:", options: ["₹1750", "₹1680", "₹1840", "₹1440"], correct: "₹1680", explanation: "PW = (100 * Amount) / (100 + RT) = (100 * 2310) / (100 + 15 * 2.5) = 231000 / 137.5 = ₹1680.", difficulty: "Medium" }
]);

// Banker’s Discount
seedTopicQuestions("Banker’s Discount", [
  { text: "The banker's discount on a bill due 4 months hence at 15% is ₹420. The true discount is:", options: ["₹400", "₹410", "₹415", "₹425"], correct: "₹400", explanation: "BD = SI on face value. TD = SI on PW. BD = TD + SI on TD. 420 = TD + (TD * 15 * 4/12) / 100 => 420 = TD + 0.05TD = 1.05TD => TD = 400.", difficulty: "Hard" },
  { text: "The banker's gain on a bill due 1 year hence at 12% per annum is ₹6. The true discount is:", options: ["₹50", "₹60", "₹72", "₹100"], correct: "₹50", explanation: "BG = BD - TD = SI on TD. 6 = (TD * 12 * 1) / 100 => TD = 50.", difficulty: "Medium" },
  { text: "The banker's discount on ₹1600 at 15% per annum for some days is ₹24. The true discount for the same period is ₹23.50. The number of days is:", options: ["73", "146", "365", "None of these"], correct: "73", explanation: "BG = BD - TD = 24 - 23.5 = 0.5. BG = SI on TD => 0.5 = (23.5 * 15 * T) / 100 => T = 50 / (23.5 * 15) = 1/5 year = 73 days.", difficulty: "Hard" }
]);

// Calendar
seedTopicQuestions("Calendar", [
  { text: "What was the day of the week on 15th August, 1947?", options: ["Friday", "Saturday", "Sunday", "Thursday"], correct: "Friday", explanation: "1946 years + period from 1.1.1947 to 15.8.1947. 1600 years (0 odd days) + 300 years (1 odd day) + 46 years (11 leap, 35 ordinary = 22+35 = 57 = 1 odd day). Total odd days till 1946 = 2. Days in 1947: 31+28+31+30+31+30+31+15 = 227 = 3 odd days. Total = 5 odd days = Friday.", difficulty: "Hard" },
  { text: "Today is Monday. After 61 days, it will be:", options: ["Wednesday", "Saturday", "Tuesday", "Thursday"], correct: "Saturday", explanation: "61 mod 7 = 5. Monday + 5 days = Saturday.", difficulty: "Easy" },
  { text: "The calendar for the year 2007 will be the same for the year:", options: ["2014", "2016", "2017", "2018"], correct: "2018", explanation: "Count odd days from 2007: 2007(1), 2008(2), 2009(1), 2010(1), 2011(1), 2012(2), 2013(1), 2014(1), 2015(1), 2016(2), 2017(1). Sum = 14 (divisible by 7). So 2018 will have the same calendar.", difficulty: "Hard" }
]);

// Clock
seedTopicQuestions("Clock", [
  { text: "At what angle the hands of a clock are inclined at 15 minutes past 5?", options: ["52.5°", "67.5°", "72.5°", "64°"], correct: "67.5°", explanation: "Angle = |30h - 5.5m| = |30*5 - 5.5*15| = |150 - 82.5| = 67.5°.", difficulty: "Medium" },
  { text: "How many times do the hands of a clock coincide in a day?", options: ["11", "22", "24", "44"], correct: "22", explanation: "The hands coincide 11 times every 12 hours, so 22 times in 24 hours.", difficulty: "Easy" },
  { text: "At what time between 4 and 5 o'clock will the hands of a watch point in opposite directions?", options: ["45 min past 4", "40 min past 4", "54 6/11 min past 4", "None of these"], correct: "54 6/11 min past 4", explanation: "At 4 o'clock, hands are 20 min apart. For opposite, they need to be 30 min apart. Gain needed = 30 + 20 = 50 min. 55 min gained in 60 min. 50 min gained in (60/55)*50 = 54 6/11 min.", difficulty: "Hard" }
]);

// Simple Interest
seedTopicQuestions("Simple Interest", [
  { text: "Find the simple interest on ₹5000 at 10% per annum for 2 years.", options: ["₹500", "₹1000", "₹1500", "₹2000"], correct: "₹1000", explanation: "SI = (P * R * T) / 100 = (5000 * 10 * 2) / 100 = ₹1000.", difficulty: "Easy" },
  { text: "At what rate percent per annum will a sum of money double in 8 years?", options: ["12.5%", "10%", "15%", "20%"], correct: "12.5%", explanation: "Let P = 100. SI = 100. T = 8. R = (100 * 100) / (100 * 8) = 12.5%.", difficulty: "Medium" },
  { text: "A sum of money at simple interest amounts to ₹815 in 3 years and to ₹854 in 4 years. The sum is:", options: ["₹650", "₹690", "₹698", "₹700"], correct: "₹698", explanation: "SI for 1 year = 854 - 815 = 39. SI for 3 years = 39 * 3 = 117. Principal = 815 - 117 = ₹698.", difficulty: "Hard" }
]);

// Compound Interest
seedTopicQuestions("Compound Interest", [
  { text: "Find the compound interest on ₹10000 at 10% per annum for 2 years, compounded annually.", options: ["₹2000", "₹2100", "₹2200", "₹2300"], correct: "₹2100", explanation: "Amount = P(1 + R/100)^T = 10000(1.1)^2 = 12100. CI = 12100 - 10000 = ₹2100.", difficulty: "Medium" },
  { text: "The difference between simple and compound interest on ₹1200 for one year at 10% per annum reckoned half-yearly is:", options: ["₹2.50", "₹3", "₹3.75", "₹None of these"], correct: "₹3", explanation: "SI = 120. CI half-yearly: R=5%, T=2. A = 1200(1.05)^2 = 1323. CI = 123. Difference = 123 - 120 = ₹3.", difficulty: "Hard" }
]);

// Partnership
seedTopicQuestions("Partnership", [
  { text: "A and B invest ₹3000 and ₹4000 in a business. If the total profit is ₹700, what is A's share?", options: ["₹300", "₹400", "₹350", "₹250"], correct: "₹300", explanation: "Ratio of investment = 3:4. A's share = (3/7) * 700 = ₹300.", difficulty: "Easy" },
  { text: "A, B and C enter into a partnership. A invests 3 times as much as B and B invests two-third of what C invests. At the end of the year, the profit earned is ₹6600. What is the share of B?", options: ["₹1200", "₹1500", "₹1800", "₹2100"], correct: "₹1200", explanation: "Let C = 3x. B = 2x. A = 6x. Ratio = 6:2:3. B's share = (2/11) * 6600 = ₹1200.", difficulty: "Medium" }
]);

// Average
seedTopicQuestions("Average", [
  { text: "Find the average of first five prime numbers.", options: ["5.2", "5.4", "5.6", "5.8"], correct: "5.6", explanation: "First five primes: 2, 3, 5, 7, 11. Sum = 28. Average = 28/5 = 5.6.", difficulty: "Easy" },
  { text: "The average of 7 consecutive numbers is 20. The largest of these numbers is:", options: ["20", "22", "23", "24"], correct: "23", explanation: "Let numbers be x-3, x-2, x-1, x, x+1, x+2, x+3. Sum = 7x. 7x/7 = 20 => x=20. Largest = 20+3 = 23.", difficulty: "Medium" }
]);

// Problems on Ages
seedTopicQuestions("Problems on Ages", [
  { text: "The ratio of ages of A and B is 4:5. If the sum of their ages is 81, find A's age.", options: ["36", "45", "40", "35"], correct: "36", explanation: "4x + 5x = 81 => 9x = 81 => x = 9. A's age = 4 * 9 = 36.", difficulty: "Easy" },
  { text: "Father is aged three times more than his son Ronit. After 8 years, he would be two and a half times of Ronit's age. After further 8 years, how many times would he be of Ronit's age?", options: ["2 times", "2.5 times", "2.75 times", "3 times"], correct: "2 times", explanation: "Let Ronit's age be x. Father = 4x. (4x+8) = 2.5(x+8) => 1.5x = 12 => x=8. Ronit=8, Father=32. After 16 years: Ronit=24, Father=48. Ratio = 2.", difficulty: "Hard" }
]);

// Pipes and Cistern
seedTopicQuestions("Pipes and Cistern", [
  { text: "Pipe A can fill a tank in 10 hours and Pipe B can fill it in 15 hours. Together they can fill it in:", options: ["5 hours", "6 hours", "7 hours", "8 hours"], correct: "6 hours", explanation: "Together = (10 * 15) / (10 + 15) = 150 / 25 = 6 hours.", difficulty: "Medium" },
  { text: "Two pipes A and B can fill a tank in 20 and 30 minutes respectively. If both the pipes are used together, then how long will it take to fill the tank?", options: ["12 min", "15 min", "25 min", "50 min"], correct: "12 min", explanation: "1/20 + 1/30 = 5/60 = 1/12. So 12 minutes.", difficulty: "Easy" }
]);

// Problems on Trains
seedTopicQuestions("Problems on Trains", [
  { text: "A train 150 m long passes a pole in 15 seconds. What is its speed in km/hr?", options: ["30", "36", "40", "45"], correct: "36", explanation: "Speed = 150 / 15 = 10 m/s = 10 * 18/5 = 36 km/hr.", difficulty: "Easy" },
  { text: "Two trains 140 m and 160 m long run at the speed of 60 km/hr and 40 km/hr respectively in opposite directions on parallel tracks. The time which they take to cross each other, is:", options: ["9 sec", "9.6 sec", "10 sec", "10.8 sec"], correct: "10.8 sec", explanation: "Relative speed = 60 + 40 = 100 km/hr = 100 * 5/18 = 250/9 m/s. Total distance = 140 + 160 = 300 m. Time = 300 / (250/9) = 2700/250 = 10.8 sec.", difficulty: "Hard" }
]);

// Boats and Streams
seedTopicQuestions("Boats and Streams", [
  { text: "A boat goes 12 km/hr in still water. If the speed of the stream is 2 km/hr, find the speed downstream.", options: ["10 km/hr", "12 km/hr", "14 km/hr", "16 km/hr"], correct: "14 km/hr", explanation: "Downstream = Speed in still water + Speed of stream = 12 + 2 = 14 km/hr.", difficulty: "Easy" },
  { text: "A boat can travel with a speed of 13 km/hr in still water. If the speed of the stream is 4 km/hr, find the time taken by the boat to go 68 km downstream.", options: ["2 hours", "3 hours", "4 hours", "5 hours"], correct: "4 hours", explanation: "Downstream speed = 13 + 4 = 17 km/hr. Time = 68 / 17 = 4 hours.", difficulty: "Medium" }
]);

// Alligation or Mixture
seedTopicQuestions("Alligation or Mixture", [
  { text: "In what ratio must rice at ₹9.30 per kg be mixed with rice at ₹10.80 per kg so that the mixture be worth ₹10 per kg?", options: ["8:7", "7:8", "5:6", "6:5"], correct: "8:7", explanation: "By rule of alligation: (10.80 - 10) : (10 - 9.30) = 0.80 : 0.70 = 8:7.", difficulty: "Medium" },
  { text: "A mixture contains alcohol and water in the ratio 4 : 3. If 5 liters of water is added to the mixture, the ratio becomes 4: 5. Find the quantity of alcohol in the given mixture.", options: ["10 liters", "12 liters", "15 liters", "18 liters"], correct: "10 liters", explanation: "Let alcohol = 4x, water = 3x. 4x / (3x + 5) = 4/5 => 20x = 12x + 20 => 8x = 20 => x = 2.5. Alcohol = 4 * 2.5 = 10 liters.", difficulty: "Hard" }
]);

// Chain Rule
seedTopicQuestions("Chain Rule", [
  { text: "If 15 men can reap a field in 35 days, in how many days will 21 men reap it?", options: ["25", "20", "30", "28"], correct: "25", explanation: "M1D1 = M2D2 => 15 * 35 = 21 * D2 => D2 = (15 * 35) / 21 = 25 days.", difficulty: "Easy" },
  { text: "If 7 spiders make 7 webs in 7 days, then 1 spider will make 1 web in how many days?", options: ["1", "7/2", "7", "49"], correct: "7", explanation: "M1D1/W1 = M2D2/W2 => (7 * 7) / 7 = (1 * D2) / 1 => D2 = 7 days.", difficulty: "Medium" }
]);

// Decimal Fraction
seedTopicQuestions("Decimal Fraction", [
  { text: "Evaluate: 0.006 * 0.02", options: ["0.12", "0.012", "0.0012", "0.00012"], correct: "0.00012", explanation: "6 * 2 = 12. Decimal places = 3 + 2 = 5. Result = 0.00012.", difficulty: "Easy" },
  { text: "Which of the following is equal to 3.14 * 10^6?", options: ["314", "3140", "314000", "3140000"], correct: "3140000", explanation: "3.14 * 1000000 = 3140000.", difficulty: "Easy" }
]);

// Simplification
seedTopicQuestions("Simplification", [
  { text: "Simplify: 12.05 * 5.4 + 0.6", options: ["65.67", "65.07", "66.07", "65.6"], correct: "65.67", explanation: "12.05 * 5.4 = 65.07. 65.07 + 0.6 = 65.67.", difficulty: "Easy" },
  { text: "Simplify: (3080 + 6160) / 28", options: ["320", "330", "340", "350"], correct: "330", explanation: "9240 / 28 = 330.", difficulty: "Medium" }
]);

// Square Root and Cube Root
seedTopicQuestions("Square Root and Cube Root", [
  { text: "Find the square root of 0.0009", options: ["0.3", "0.03", "0.003", "0.0003"], correct: "0.03", explanation: "sqrt(9) = 3. Decimal places = 4/2 = 2. Result = 0.03.", difficulty: "Easy" },
  { text: "The cube root of 0.000216 is:", options: ["0.6", "0.06", "0.006", "None of these"], correct: "0.06", explanation: "cbrt(216) = 6. Decimal places = 6/3 = 2. Result = 0.06.", difficulty: "Medium" }
]);

// Problems on H.C.F and L.C.M
seedTopicQuestions("Problems on H.C.F and L.C.M", [
  { text: "Find the H.C.F of 2/3, 8/9, 64/81 and 10/27.", options: ["2/81", "2/3", "10/81", "None of these"], correct: "2/81", explanation: "HCF of fractions = HCF of numerators / LCM of denominators = HCF(2,8,64,10) / LCM(3,9,81,27) = 2 / 81.", difficulty: "Medium" },
  { text: "The L.C.M. of two numbers is 48. The numbers are in the ratio 2 : 3. The sum of the numbers is:", options: ["28", "32", "40", "64"], correct: "40", explanation: "Let numbers be 2x and 3x. LCM = 6x = 48 => x=8. Numbers are 16 and 24. Sum = 40.", difficulty: "Medium" }
]);

// Logical Sequence of Words
seedTopicQuestions("Logical Sequence of Words", [
  { text: "Arrange the following in a logical order: 1. Birth, 2. Death, 3. Childhood, 4. Infancy, 5. Adolescence", options: ["4, 3, 5, 1, 2", "1, 4, 3, 5, 2", "1, 3, 4, 5, 2", "4, 1, 3, 5, 2"], correct: "1, 4, 3, 5, 2", explanation: "The logical sequence is: Birth -> Infancy -> Childhood -> Adolescence -> Death.", difficulty: "Easy" },
  { text: "Arrange in logical order: 1. Table, 2. Tree, 3. Wood, 4. Seed, 5. Plant", options: ["4, 5, 2, 3, 1", "4, 5, 3, 2, 1", "1, 3, 2, 5, 4", "5, 4, 2, 3, 1"], correct: "4, 5, 2, 3, 1", explanation: "Sequence: Seed -> Plant -> Tree -> Wood -> Table.", difficulty: "Easy" }
]);

// Blood Relation Test
seedTopicQuestions("Blood Relation Test", [
  { text: "Pointing to a photograph, a man said, 'I have no brother or sister but that man's father is my father's son.' Whose photograph was it?", options: ["His own", "His son's", "His father's", "His nephew's"], correct: "His son's", explanation: "Since he has no brother or sister, 'my father's son' is himself. So, the man in the photo's father is himself. Thus, the photo is of his son.", difficulty: "Medium" },
  { text: "If A is the brother of B; B is the sister of C; and C is the father of D, how is A related to D?", options: ["Brother", "Uncle", "Grandfather", "Father"], correct: "Uncle", explanation: "A is brother of B and B is sister of C, so A is brother of C. C is father of D, so A is the uncle of D.", difficulty: "Easy" }
]);

// Syllogism
seedTopicQuestions("Syllogism", [
  { text: "Statements: All mangoes are golden in colour. No golden-coloured things are cheap. Conclusions: I) All mangoes are cheap. II) Golden-coloured mangoes are not cheap.", options: ["Only I follows", "Only II follows", "Either I or II follows", "Neither I nor II follows"], correct: "Only II follows", explanation: "All mangoes are golden. No golden is cheap. So, no mango is cheap. Conclusion II follows.", difficulty: "Easy" },
  { text: "Statements: Some actors are singers. All the singers are dancers. Conclusions: I) Some actors are dancers. II) No singer is actor.", options: ["Only I follows", "Only II follows", "Both I and II follow", "Neither I nor II follows"], correct: "Only I follows", explanation: "Some actors are singers + All singers are dancers => Some actors are dancers.", difficulty: "Medium" }
]);

// Series Completion
seedTopicQuestions("Series Completion", [
  { text: "Complete the series: 2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "46"], correct: "42", explanation: "The differences are 4, 6, 8, 10... so the next difference is 12. 30 + 12 = 42.", difficulty: "Easy" },
  { text: "Complete the series: SCD, TEF, UGH, ____, WKL", options: ["CMN", "UJI", "VIJ", "IJT"], correct: "VIJ", explanation: "The first letter follows S, T, U, V, W. The second and third letters follow CD, EF, GH, IJ, KL.", difficulty: "Easy" }
]);

// Cause and Effect
seedTopicQuestions("Cause and Effect", [
  { text: "Statement I: The price of petrol has risen sharply. Statement II: People are using more public transport. Which is the cause?", options: ["I is cause, II is effect", "II is cause, I is effect", "Both are independent causes", "Both are effects of some common cause"], correct: "I is cause, II is effect", explanation: "The rise in petrol prices (cause) leads people to use cheaper public transport (effect).", difficulty: "Medium" }
]);

// Dice
seedTopicQuestions("Dice", [
  { text: "Two positions of a dice are shown. Which number will be on the face opposite to 6? (Pos 1: 1, 3, 6; Pos 2: 1, 3, 5)", options: ["1", "3", "4", "5"], correct: "5", explanation: "Since 1 and 3 are common in both positions, the remaining faces 6 and 5 must be opposite to each other.", difficulty: "Medium" }
]);

// Venn Diagrams
seedTopicQuestions("Venn Diagrams", [
  { text: "Which diagram correctly represents the relationship between: Animals, Cows, Dogs?", options: ["Two separate circles inside a large circle", "Three separate circles", "Three intersecting circles", "One circle inside another inside another"], correct: "Two separate circles inside a large circle", explanation: "Cows and Dogs are both Animals, but they are distinct from each other.", difficulty: "Easy" }
]);

// Cube and Cuboid
seedTopicQuestions("Cube and Cuboid", [
  { text: "A cube is painted blue on all faces and then cut into 27 small cubes of equal size. How many small cubes will be painted on only one face?", options: ["6", "8", "12", "1"], correct: "6", explanation: "For a 3x3x3 cube, cubes with one face painted are at the center of each face. There are 6 faces, so 6 cubes.", difficulty: "Hard" }
]);

// Analogy
seedTopicQuestions("Analogy", [
  { text: "Moon : Satellite :: Earth : ?", options: ["Sun", "Planet", "Solar System", "Asteroid"], correct: "Planet", explanation: "Moon is a satellite, Earth is a planet.", difficulty: "Easy" },
  { text: "Clock : Time :: Thermometer : ?", options: ["Heat", "Radiation", "Energy", "Temperature"], correct: "Temperature", explanation: "Clock measures time, thermometer measures temperature.", difficulty: "Easy" }
]);

// Seating Arrangement
seedTopicQuestions("Seating Arrangement", [
  { text: "A, B, C, D and E are sitting on a bench. A is next to B, C is next to D, D is not sitting with E who is on the left end of the bench. C is on the second position from the right. A is to the right of B and E. A and C are sitting together. In which position A is sitting?", options: ["Between B and D", "Between B and C", "Between E and D", "Between C and E"], correct: "Between B and C", explanation: "Arrangement from left: E, B, A, C, D. A is between B and C.", difficulty: "Hard" }
]);

// Character Puzzles
seedTopicQuestions("Character Puzzles", [
  { text: "Find the missing character: (Circle with 3, 5, 8, 13, 22, ?)", options: ["35", "39", "40", "44"], correct: "39", explanation: "3*2-1=5, 5*2-2=8, 8*2-3=13, 13*2-4=22, 22*2-5=39.", difficulty: "Medium" }
]);

// Direction Sense Test
seedTopicQuestions("Direction Sense Test", [
  { text: "A man walks 5 km toward south and then turns to the right. After walking 3 km he turns to the left and walks 5 km. Now in which direction is he from the starting place?", options: ["West", "South", "North-East", "South-West"], correct: "South-West", explanation: "He moves South, then West, then South again. He is in the South-West direction from the start.", difficulty: "Medium" }
]);

// Classification
seedTopicQuestions("Classification", [
  { text: "Choose the odd one out:", options: ["Apple", "Orange", "Potato", "Grape"], correct: "Potato", explanation: "Apple, Orange, and Grape are fruits; Potato is a vegetable.", difficulty: "Easy" },
  { text: "Choose the odd one out:", options: ["35", "49", "63", "65"], correct: "65", explanation: "35, 49, and 63 are multiples of 7; 65 is not.", difficulty: "Easy" }
]);

// Data Sufficiency
seedTopicQuestions("Data Sufficiency", [
  { text: "Is X an even number? (1) X is a multiple of 2. (2) X is a multiple of 5.", options: ["(1) alone is sufficient", "(2) alone is sufficient", "Both together are needed", "Neither is sufficient"], correct: "(1) alone is sufficient", explanation: "Any multiple of 2 is even. So (1) alone answers the question.", difficulty: "Medium" }
]);

// Arithmetic Reasoning
seedTopicQuestions("Arithmetic Reasoning", [
  { text: "In a group of cows and hens, the number of legs are 14 more than twice the number of heads. The number of cows is:", options: ["5", "7", "10", "12"], correct: "7", explanation: "Let cows be C and hens be H. Legs = 4C + 2H. Heads = C + H. 4C + 2H = 2(C + H) + 14 => 4C + 2H = 2C + 2H + 14 => 2C = 14 => C = 7.", difficulty: "Medium" }
]);

// Spotting Errors
seedTopicQuestions("Spotting Errors", [
  { text: "Identify the part with error: 'Neither of the two (A) / candidates (B) / are fit (C) / for the post (D).'", options: ["A", "B", "C", "D"], correct: "C", explanation: "'Neither' is singular, so it should be 'is fit' instead of 'are fit'.", difficulty: "Medium" },
  { text: "Identify the error: 'The news (A) / are (B) / very (C) / exciting (D).'", options: ["A", "B", "C", "D"], correct: "B", explanation: "'News' is an uncountable noun and takes a singular verb 'is'.", difficulty: "Easy" }
]);

// Synonyms
seedTopicQuestions("Synonyms", [
  { text: "What is the synonym of 'ABANDON'?", options: ["Keep", "Forsake", "Hold", "Cherish"], correct: "Forsake", explanation: "Abandon means to leave or give up; forsake is a synonym.", difficulty: "Easy" },
  { text: "What is the synonym of 'DILIGENT'?", options: ["Lazy", "Hardworking", "Careless", "Slow"], correct: "Hardworking", explanation: "Diligent means showing care and effort; hardworking is a synonym.", difficulty: "Easy" }
]);

// Antonyms
seedTopicQuestions("Antonyms", [
  { text: "What is the antonym of 'ANCIENT'?", options: ["Old", "Modern", "Antique", "Historic"], correct: "Modern", explanation: "Ancient means very old; modern is the opposite.", difficulty: "Easy" },
  { text: "What is the antonym of 'FRUGAL'?", options: ["Economical", "Extravagant", "Miserly", "Thrifty"], correct: "Extravagant", explanation: "Frugal means sparing or economical; extravagant is the opposite.", difficulty: "Medium" }
]);

// Selecting Words
seedTopicQuestions("Selecting Words", [
  { text: "The police ______ the crowd to maintain order.", options: ["dispersed", "scattered", "collected", "gathered"], correct: "dispersed", explanation: "Police 'disperse' a crowd to break it up.", difficulty: "Medium" }
]);

// Spellings
seedTopicQuestions("Spellings", [
  { text: "Find the correctly spelled word:", options: ["Accomodation", "Accommodation", "Acomodation", "Accomodationn"], correct: "Accommodation", explanation: "The correct spelling is 'Accommodation' (double c, double m).", difficulty: "Medium" }
]);

// Sentence Formation
seedTopicQuestions("Sentence Formation", [
  { text: "Rearrange: (1) was (2) the (3) boy (4) crying", options: ["2,3,1,4", "1,2,3,4", "4,3,2,1", "3,2,1,4"], correct: "2,3,1,4", explanation: "The boy was crying.", difficulty: "Easy" }
]);

// Ordering of Words
seedTopicQuestions("Ordering of Words", [
  { text: "Arrange: (P) of the (Q) the leader (R) people (S) was", options: ["QSP R", "QPS R", "PRQS", "RQPS"], correct: "QPS R", explanation: "The leader of the people was...", difficulty: "Medium" }
]);

// Sentence Correction
seedTopicQuestions("Sentence Correction", [
  { text: "Correct the sentence: 'He don't know the answer.'", options: ["He doesn't know", "He not know", "He don't knows", "No correction"], correct: "He doesn't know", explanation: "Third-person singular 'He' takes 'doesn't'.", difficulty: "Easy" }
]);

// Sentence Improvement
seedTopicQuestions("Sentence Improvement", [
  { text: "Improve the underlined part: 'The teacher *has given* us many homeworks.'", options: ["has given us much homework", "gave us many homeworks", "had given us many homework", "No improvement"], correct: "has given us much homework", explanation: "'Homework' is uncountable; use 'much' instead of 'many'.", difficulty: "Medium" }
]);

// Completing Statements
seedTopicQuestions("Completing Statements", [
  { text: "Complete: 'Hardly had he reached the station ______ the train started.'", options: ["when", "then", "than", "while"], correct: "when", explanation: "'Hardly' is followed by 'when'.", difficulty: "Medium" }
]);

// Ordering of Sentences
seedTopicQuestions("Ordering of Sentences", [
  { text: "Arrange: (S1) A man is known by the company he keeps. (P) If he associates with good people (Q) he will be respected (R) but if he keeps bad company (S) he will be looked down upon. (S6) Thus, choose friends wisely.", options: ["PQRS", "PRQS", "QPSR", "RQPS"], correct: "PQRS", explanation: "Logical flow: Condition 1 -> Result 1 -> Condition 2 -> Result 2.", difficulty: "Hard" }
]);

// Paragraph Formation
seedTopicQuestions("Paragraph Formation", [
  { text: "Arrange to form a paragraph: (A) He opened the door. (B) He heard a knock. (C) He went to the door. (D) He was reading a book.", options: ["DBCA", "ABCD", "DCBA", "BACD"], correct: "DBCA", explanation: "Sequence: Reading -> Hearing knock -> Going to door -> Opening door.", difficulty: "Medium" }
]);

// Cloze Test
seedTopicQuestions("Cloze Test", [
  { text: "Fill in the blank: 'The sun ______ in the east.'", options: ["rise", "rises", "rising", "rose"], correct: "rises", explanation: "Universal truth takes simple present tense.", difficulty: "Easy" }
]);

// Comprehension
seedTopicQuestions("Comprehension", [
  { text: "Passage: 'The tiger is a powerful predator.' Question: What is the tiger described as?", options: ["Herbivore", "Predator", "Scavenger", "Prey"], correct: "Predator", explanation: "Directly stated in the passage.", difficulty: "Easy" }
]);

// One Word Substitutes
seedTopicQuestions("One Word Substitutes", [
  { text: "A person who believes in God:", options: ["Atheist", "Theist", "Agnostic", "Pagan"], correct: "Theist", explanation: "Theist is one who believes in the existence of a god or gods.", difficulty: "Easy" }
]);

// Idioms and Phrases
seedTopicQuestions("Idioms and Phrases", [
  { text: "Meaning of 'To cry wolf':", options: ["To listen carefully", "To give a false alarm", "To be very happy", "To work hard"], correct: "To give a false alarm", explanation: "To cry wolf means to raise a false alarm.", difficulty: "Medium" }
]);

// Change of Voice
seedTopicQuestions("Change of Voice", [
  { text: "Change to Passive: 'He opens the door.'", options: ["The door is opened by him", "The door was opened by him", "The door is being opened by him", "The door has been opened by him"], correct: "The door is opened by him", explanation: "Simple present active -> Simple present passive (is + V3).", difficulty: "Medium" }
]);

// Change of Speech
seedTopicQuestions("Change of Speech", [
  { text: "Change to Indirect: 'He said, \"I am happy.\"'", options: ["He said that he was happy", "He said that he is happy", "He says that he was happy", "He said he is happy"], correct: "He said that he was happy", explanation: "Direct speech in present becomes past in indirect speech.", difficulty: "Medium" }
]);

// Verbal Analogies
seedTopicQuestions("Verbal Analogies", [
  { text: "Doctor : Hospital :: Teacher : ?", options: ["Office", "School", "Market", "Park"], correct: "School", explanation: "Doctor works in a hospital; teacher works in a school.", difficulty: "Easy" }
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
