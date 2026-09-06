export type EnglishLevel = 'basic' | 'intermediate' | 'pro';

export interface LevelConfig {
  id: EnglishLevel;
  name: string;
  tagline: string;
  cefr: string; // A1-A2, B1-B2, C1-C2
  color: string;
  accentColor: string;
  speed: number;
  description: string;
  focusAreas: string[];
}

export interface TutorPersona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  accent: 'US' | 'UK' | 'IN' | 'AU';
  voiceGender: 'female' | 'male';
  recommendedLevel: EnglishLevel;
  description: string;
  greeting: string;
}

export interface GrammarTip {
  original: string;
  correction: string;
  reason: string;
}

export interface FeedbackAnalysis {
  transcript: string;
  proAlternative: string;
  grammarTips: GrammarTip[];
  vocabularyUpgrades: { original: string; upgraded: string; explanation: string }[];
  fillerWords: string[];
  fluencyScore: number; // 0 - 100
  grammarScore: number; // 0 - 100
  vocabularyScore: number; // 0 - 100
  overallImpression: string;
}

export interface ConversationTurn {
  id: string;
  speaker: 'user' | 'tutor';
  text: string;
  timestamp: string;
  audioDuration?: number;
  feedback?: FeedbackAnalysis;
}

export interface PracticeScenario {
  id: string;
  title: string;
  level: EnglishLevel;
  category: 'daily' | 'workplace' | 'travel' | 'interview' | 'debate';
  description: string;
  icon: string;
  starterPrompt: string;
  targetKeywords: string[];
  tutorRole: string;
  userRole: string;
}

export interface UserProgressStats {
  totalMinutesSpoken: number;
  totalTurns: number;
  currentStreakDays: number;
  lastActiveDate: string;
  averageFluencyScore: number;
  wordsLearnedCount: number;
  savedVocabulary: {
    id: string;
    word: string;
    meaning: string;
    example: string;
    level: EnglishLevel;
    dateAdded: string;
  }[];
}
