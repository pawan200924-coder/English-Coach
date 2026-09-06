import { EnglishLevel, LevelConfig } from '@/types/english-coach';

export const LEVEL_CONFIGS: Record<EnglishLevel, LevelConfig> = {
  basic: {
    id: 'basic',
    name: 'Basic (Beginner)',
    tagline: 'Speak clearly & build foundational confidence',
    cefr: 'A1 - A2',
    color: '#10B981', // Emerald green
    accentColor: 'rgba(16, 185, 129, 0.15)',
    speed: 0.85, // Slower, clearer speech
    description: 'Perfect if you hesitate, search for common words, or feel nervous speaking. The AI speaks slowly, uses simple clear vocabulary, and gently fixes basic grammar.',
    focusAreas: [
      'Simple present, past & future sentences',
      'Daily greetings & personal introductions',
      'Ordering food & asking for directions',
      'Pronunciation of key vowel & consonant sounds',
      'Overcoming hesitation & building confidence'
    ]
  },
  intermediate: {
    id: 'intermediate',
    name: 'Intermediate (Conversational)',
    tagline: 'Flow naturally & expand your expressions',
    cefr: 'B1 - B2',
    color: '#3B82F6', // Royal blue
    accentColor: 'rgba(59, 130, 246, 0.15)',
    speed: 1.0, // Normal natural pace
    description: 'For those who can hold a conversation but want to sound more natural, eliminate pauses, use natural idioms, and handle everyday workplace discussions smoothly.',
    focusAreas: [
      'Storytelling and expressing personal opinions',
      'Natural idioms and everyday collocations',
      'Job interview preparation & workplace dialogue',
      'Complex sentence linking (Although, Whereas, In addition)',
      'Smooth conversational transitions'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro (Executive & Advanced)',
    tagline: 'High-impact eloquence, debates & executive presence',
    cefr: 'C1 - C2',
    color: '#FF6A00', // Electric Orange
    accentColor: 'rgba(255, 106, 0, 0.15)',
    speed: 1.1, // Fast, natural native tempo
    description: 'For ambitious professionals, managers, and public speakers. Focuses on rhetorical power, eliminating filler words, executive negotiation, and high-caliber vocabulary.',
    focusAreas: [
      'Executive presentations & pitch delivery',
      'Tough contract & salary negotiations',
      'Eliminating filler words ("um", "like", "you know")',
      'Sophisticated vocabulary upgrades & nuances',
      'Persuasive rhetoric, debate & spontaneous wit'
    ]
  }
};
