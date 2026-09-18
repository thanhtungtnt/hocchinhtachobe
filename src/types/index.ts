export type Grade = 1 | 2 | 3 | 4 | 5;

export type Difficulty = 'easy' | 'medium' | 'hard';

export type ErrorType =
  | 'vowel_rhyme'        // Sai âm / vần (ví dụ: líu -> liếu)
  | 'initial_consonant'  // Sai phụ âm đầu (ví dụ: s/x, tr/ch, l/n, r/d/gi)
  | 'tone_mark'          // Sai dấu thanh (hỏi, ngã, sắc, huyền, nặng)
  | 'missing_letter'     // Thiếu chữ (trường -> trương)
  | 'extra_letter'       // Thừa chữ
  | 'missing_word'       // Thiếu từ trong câu
  | 'extra_word'         // Thừa từ trong câu
  | 'capitalization'     // Sai viết hoa (Hà Nội -> hà nội)
  | 'other';             // Khác

export interface SpellingError {
  expected: string;
  actual: string;
  type: ErrorType;
  position: number;
  explanation: string;
  friendlyTip: string;
}

export type TokenStatus = 'correct' | 'incorrect' | 'missing' | 'extra';

export interface TokenDiff {
  expected: string;
  actual: string;
  status: TokenStatus;
  error?: SpellingError;
}

export interface SentenceEvaluation {
  originalSentence: string;
  userSentence: string;
  isFullyCorrect: boolean;
  score: number;
  tokenDiffs: TokenDiff[];
  errors: SpellingError[];
  encouragement: string;
}

export interface SpellingExercise {
  id: string;
  title: string;
  grade: Grade;
  difficulty: Difficulty;
  topic: string;
  icon: string;
  sentences: string[];
  isCustom?: boolean;
  completed?: boolean;
  bestScore?: number;
  author?: string;
  createdAt?: string;
}

export interface WeakWordRecord {
  id: string;
  word: string;             // Từ đúng chuẩn (ví dụ: "líu")
  wrongSpellings: string[]; // Các cách bé viết sai (ví dụ: ["liếu"])
  count: number;            // Số lần viết sai
  lastEncountered: string;
  errorType: ErrorType;
  grade: Grade;
  mastered?: boolean;
}

export interface ExerciseHistoryRecord {
  id: string;
  exerciseId: string;
  exerciseTitle: string;
  grade: Grade;
  completedAt: string;
  score: number;
  maxScore: number;
  correctSentences: number;
  totalSentences: number;
  correctWords: number;
  totalWords: number;
  stars: 1 | 2 | 3;
}

export interface UserProfile {
  id: string;
  name: string;
  grade: Grade;
  avatar: string; // 'cat' | 'bear' | 'rabbit' | 'lion' | 'dog' | 'penguin'
  totalExercises: number;
  totalWordsPracticed: number;
  totalCorrectWords: number;
  highestScore: number;
  currentStreak: number;
  lastActiveDate: string;
  xp: number;
  unlockedBadges: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  category: 'practice' | 'accuracy' | 'streak' | 'mastery';
}

export interface AudioSettings {
  rate: number;          // 0.7 (chậm), 0.9 (bình thường), 1.0 (nhanh)
  voiceURI: string;      // Tên giọng đọc Web Speech
  autoRepeat: boolean;   // Đọc 2 lần
  repeatDelay: number;   // Khoảng nghỉ giữa 2 lần đọc (giây)
}
