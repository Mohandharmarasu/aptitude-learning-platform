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
  ["Quantitative", "Percentages", "Understanding fractions of a whole."],
  ["Quantitative", "Time and Work", "Calculating efficiency and duration."],
  ["Quantitative", "Speed and Distance", "Relative motion and travel time."],
  ["Quantitative", "Ratios", "Comparing quantities and proportions."],
  ["Quantitative", "Profit and Loss", "Calculating gains and losses in trade."],
  ["Quantitative", "Permutation and Combination", "Arrangements and selections."],
  ["Quantitative", "Probability", "Likelihood of events occurring."],
  ["Quantitative", "Logarithm", "Inverse operations of exponentiation."],
  ["Quantitative", "Surds and Indices", "Powers and roots of numbers."],
  ["Quantitative", "Area", "Measuring 2D surfaces."],
  ["Quantitative", "Volume and Surface Area", "Measuring 3D shapes."],
  ["Quantitative", "Height and Distance", "Trigonometric applications."],
  ["Quantitative", "Numbers", "Properties and types of numbers."],
  ["Quantitative", "Races and Games", "Competitive math scenarios."],
  ["Quantitative", "Stocks and Shares", "Financial math and investments."],
  ["Quantitative", "True Discount", "Present value calculations."],
  ["Quantitative", "Banker’s Discount", "Banking interest and discounts."],
  ["Quantitative", "Calendar", "Date and day calculations."],
  ["Quantitative", "Clock", "Time and angle calculations."],
  ["Quantitative", "Odd Man Out and Series", "Pattern recognition and logic."],
  ["Logical", "Syllogisms", "Deductive reasoning from premises."],
  ["Verbal", "Reading Comprehension", "Analyzing and interpreting text."]
];

topicsToSeed.forEach(([category, name, description]) => {
  const existing = checkTopic.get(name);
  if (!existing) {
    insertTopic.run(category, name, description);
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

// Percentages
seedTopicQuestions("Percentages", [
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

// Speed and Distance
seedTopicQuestions("Speed and Distance", [
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

// Ratios
seedTopicQuestions("Ratios", [
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

// Numbers
seedTopicQuestions("Numbers", [
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

// Odd Man Out and Series
seedTopicQuestions("Odd Man Out and Series", [
  { text: "Find the odd man out: 3, 5, 7, 12, 17, 19", options: ["12", "17", "19", "7"], correct: "12", explanation: "All others are prime numbers.", difficulty: "Easy" },
  { text: "Complete the series: 1, 4, 9, 16, 25, ?", options: ["30", "36", "48", "49"], correct: "36", explanation: "The series is squares of natural numbers: 1², 2², 3², 4², 5², 6² = 36.", difficulty: "Easy" },
  { text: "Find the odd man out: 10, 25, 45, 54, 60, 75, 80", options: ["10", "45", "54", "75"], correct: "54", explanation: "All others are multiples of 5.", difficulty: "Easy" }
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
