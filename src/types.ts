export interface Topic {
  id: number;
  category: string;
  name: string;
  description: string;
}

export interface Question {
  id: number;
  topic_id: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface User {
  id: number;
  name: string;
  xp: number;
  level: number;
}

export interface WeakArea {
  topic: string;
  reason: string;
  suggestion: string;
}
