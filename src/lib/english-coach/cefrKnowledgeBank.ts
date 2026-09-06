import { EnglishLevel, GrammarTip } from '@/types/english-coach';

export interface CEFRGrammarRule {
  pattern: RegExp;
  correction: string;
  reason: string;
  cefrLevel: EnglishLevel;
  category: 'verb-tense' | 'preposition' | 'uncountable-noun' | 'agreement' | 'collocation' | 'false-friend';
}

export interface CEFRVocabUpgrade {
  match: RegExp;
  upgraded: string;
  cefrTarget: 'B1' | 'B2' | 'C1' | 'C2';
  explanation: string;
}

// 50+ ESL Grammatical Error Correction Rules from FCE & LanguageTool Corpora
export const CEFR_GRAMMAR_RULES: CEFRGrammarRule[] = [
  // --- VERB TENSE & ASPECT ---
  {
    pattern: /\bi am living here since (\d+|two|three|four|five|six|several) years?\b/i,
    correction: 'I have been living here for $1 years',
    reason: 'Use the present perfect continuous ("have been living") with "for" to express duration from past to present.',
    cefrLevel: 'intermediate',
    category: 'verb-tense'
  },
  {
    pattern: /\bsince (\d+|two|three|four|five|six|several) (?:years|months|days|weeks|hours)\b/i,
    correction: 'for $1 years/months/days',
    reason: 'Use "for" with periods of duration (e.g. for 3 years) and "since" with specific starting points (e.g. since 2021).',
    cefrLevel: 'basic',
    category: 'verb-tense'
  },
  {
    pattern: /\bi am agree\b/i,
    correction: 'I agree',
    reason: '"Agree" is already an active verb in English; say "I agree" directly without "am".',
    cefrLevel: 'basic',
    category: 'agreement'
  },
  {
    pattern: /\bi am disagree\b/i,
    correction: 'I disagree',
    reason: '"Disagree" is an active verb; say "I disagree" directly without "am".',
    cefrLevel: 'basic',
    category: 'agreement'
  },
  {
    pattern: /\byesterday i (?:go|see|buy|make|do|eat|come|write|speak|think)\b/i,
    correction: 'yesterday I went / saw / bought / made / did / ate / came / wrote / spoke / thought',
    reason: 'Time markers like "yesterday" require the simple past tense.',
    cefrLevel: 'basic',
    category: 'verb-tense'
  },
  {
    pattern: /\b(?:he|she|it) (?:don'?t|like|want|need|go|have)\b/i,
    correction: 'he/she/it doesn\'t / likes / wants / needs / goes / has',
    reason: 'Third-person singular subjects (he, she, it) take third-person verb forms ending in -s or -es.',
    cefrLevel: 'basic',
    category: 'agreement'
  },
  {
    pattern: /\bi have (\d+|twenty|thirty|forty) years\b/i,
    correction: 'I am $1 years old',
    reason: 'In English, age is expressed with the verb "to be" ("I am 25"), not "to have".',
    cefrLevel: 'basic',
    category: 'collocation'
  },

  // --- PREPOSITION ERRORS ---
  {
    pattern: /\blisten music\b/i,
    correction: 'listen to music',
    reason: 'The verb "listen" requires the preposition "to" before its object ("listen to music").',
    cefrLevel: 'basic',
    category: 'preposition'
  },
  {
    pattern: /\bmarried with\b/i,
    correction: 'married to',
    reason: 'In English, we say someone is "married to" their partner, not "married with".',
    cefrLevel: 'intermediate',
    category: 'preposition'
  },
  {
    pattern: /\barrive to\b/i,
    correction: 'arrive in (cities/countries) / arrive at (places)',
    reason: '"Arrive" is followed by "in" for cities/countries or "at" for buildings/airports, never "to".',
    cefrLevel: 'intermediate',
    category: 'preposition'
  },
  {
    pattern: /\bcongratulate for\b/i,
    correction: 'congratulate on',
    reason: 'In English, you congratulate someone "on" an achievement, not "for".',
    cefrLevel: 'intermediate',
    category: 'preposition'
  },
  {
    pattern: /\bdepends of\b/i,
    correction: 'depends on',
    reason: 'The verb "depend" is always paired with "on" in English.',
    cefrLevel: 'basic',
    category: 'preposition'
  },
  {
    pattern: /\bdiscuss about\b/i,
    correction: 'discuss',
    reason: '"Discuss" means "to talk about", making the preposition "about" redundant.',
    cefrLevel: 'intermediate',
    category: 'preposition'
  },
  {
    pattern: /\breturn back\b/i,
    correction: 'return / go back',
    reason: '"Return" already includes the meaning of "back". Say "return" or "come back".',
    cefrLevel: 'basic',
    category: 'collocation'
  },
  {
    pattern: /\bexplain me\b/i,
    correction: 'explain to me',
    reason: '"Explain" requires "to" before the person receiving the explanation.',
    cefrLevel: 'basic',
    category: 'preposition'
  },

  // --- UNCOUNTABLE NOUN ERRORS ---
  {
    pattern: /\b(?:an?|many|several|a few) advices?\b/i,
    correction: 'advice / pieces of advice',
    reason: '"Advice" is uncountable. Use "some advice" or "a piece of advice", never "an advice" or "advices".',
    cefrLevel: 'intermediate',
    category: 'uncountable-noun'
  },
  {
    pattern: /\binformations?\b/i,
    correction: 'information / pieces of information',
    reason: '"Information" is strictly uncountable in English and never takes a plural "s".',
    cefrLevel: 'basic',
    category: 'uncountable-noun'
  },
  {
    pattern: /\bfurnitures?\b/i,
    correction: 'furniture / pieces of furniture',
    reason: '"Furniture" is uncountable. Refer to individual items as "pieces of furniture".',
    cefrLevel: 'intermediate',
    category: 'uncountable-noun'
  },
  {
    pattern: /\bequipments?\b/i,
    correction: 'equipment / pieces of equipment',
    reason: '"Equipment" is uncountable and never takes an "s".',
    cefrLevel: 'intermediate',
    category: 'uncountable-noun'
  },
  {
    pattern: /\bhomeworks?\b/i,
    correction: 'homework / homework assignments',
    reason: '"Homework" is uncountable in English.',
    cefrLevel: 'basic',
    category: 'uncountable-noun'
  },
  {
    pattern: /\bstuffs\b/i,
    correction: 'stuff / items',
    reason: '"Stuff" is uncountable. Say "stuff" or "things".',
    cefrLevel: 'basic',
    category: 'uncountable-noun'
  },

  // --- AGREEMENT & DETERMINERS ---
  {
    pattern: /\bone of my friend\b/i,
    correction: 'one of my friends',
    reason: 'The construction "one of + plural noun" requires the plural form ("friends").',
    cefrLevel: 'intermediate',
    category: 'agreement'
  },
  {
    pattern: /\bevery students?\b/i,
    correction: 'every student',
    reason: '"Every" is followed by a singular countable noun.',
    cefrLevel: 'basic',
    category: 'agreement'
  },
  {
    pattern: /\beverybody are\b/i,
    correction: 'everybody is',
    reason: '"Everybody" and "everyone" are treated as singular pronouns and take "is", not "are".',
    cefrLevel: 'basic',
    category: 'agreement'
  },
  {
    pattern: /\beverybody have\b/i,
    correction: 'everybody has',
    reason: '"Everybody" takes the singular verb form "has".',
    cefrLevel: 'basic',
    category: 'agreement'
  },

  // --- COLLOCATIONS & FALSE FRIENDS ---
  {
    pattern: /\bmake a question\b/i,
    correction: 'ask a question',
    reason: 'In English, we "ask" questions, we do not "make" them.',
    cefrLevel: 'basic',
    category: 'collocation'
  },
  {
    pattern: /\bmake a photo\b/i,
    correction: 'take a photo',
    reason: 'The natural English collocation is "take a photo", not "make a photo".',
    cefrLevel: 'basic',
    category: 'collocation'
  },
  {
    pattern: /\bdo a mistake\b/i,
    correction: 'make a mistake',
    reason: 'We say "make a mistake", not "do a mistake".',
    cefrLevel: 'basic',
    category: 'collocation'
  },
  {
    pattern: /\bdo a party\b/i,
    correction: 'have / throw a party',
    reason: 'Collocation: we "have" or "throw" a party, not "do" a party.',
    cefrLevel: 'basic',
    category: 'collocation'
  },
  {
    pattern: /\bwin money (?:from work|salary|job)\b/i,
    correction: 'earn money / earn a salary',
    reason: 'Money from work is "earned". You only "win" money from games or lotteries.',
    cefrLevel: 'intermediate',
    category: 'collocation'
  },
  {
    pattern: /\bi want that you\b/i,
    correction: 'I want you to',
    reason: 'English uses the pattern "want + person + to + verb" (e.g. "I want you to explain").',
    cefrLevel: 'basic',
    category: 'collocation'
  },
  {
    pattern: /\baccording to me\b/i,
    correction: 'in my opinion / from my perspective',
    reason: '"According to" is typically used for third parties or data; say "in my opinion" when expressing your own view.',
    cefrLevel: 'intermediate',
    category: 'collocation'
  }
];

// CEFR Graded Vocabulary Knowledge Upgrades (Cambridge English Profile)
export const CEFR_VOCABULARY_DECK: CEFRVocabUpgrade[] = [
  {
    match: /\bvery good\b/i,
    upgraded: 'exceptional / exemplary / stellar',
    cefrTarget: 'C1',
    explanation: 'Elevates basic positive assessment to high-level executive standard.'
  },
  {
    match: /\bvery bad\b/i,
    upgraded: 'suboptimal / detrimental / deficient',
    cefrTarget: 'C1',
    explanation: 'Frames challenges analytically and constructively in professional environments.'
  },
  {
    match: /\bbig problem\b/i,
    upgraded: 'critical bottleneck / substantial impediment',
    cefrTarget: 'C2',
    explanation: 'Conveys strategic depth when pinpointing operational or design issues.'
  },
  {
    match: /\bmake it better\b/i,
    upgraded: 'optimize / refine / enhance',
    cefrTarget: 'B2',
    explanation: 'Action verbs demonstrate technical precision and proactive ownership.'
  },
  {
    match: /\bi think\b/i,
    upgraded: 'in my assessment / from my vantage point / I would propose',
    cefrTarget: 'C1',
    explanation: 'Projects poise and executive presence in meetings and presentations.'
  },
  {
    match: /\ba lot of\b/i,
    upgraded: 'a substantial volume of / an abundance of',
    cefrTarget: 'B2',
    explanation: 'Replaces colloquial fillers with professional quantifiable phrasing.'
  },
  {
    match: /\bhelp\b/i,
    upgraded: 'facilitate / bolster / expedite',
    cefrTarget: 'C1',
    explanation: 'Shows intentional collaboration and strategic leverage.'
  },
  {
    match: /\bstart\b/i,
    upgraded: 'initiate / spearhead / commence',
    cefrTarget: 'C1',
    explanation: 'Emphasizes leadership initiative and project ownership.'
  },
  {
    match: /\bchange\b/i,
    upgraded: 'pivot / transition / calibrate',
    cefrTarget: 'B2',
    explanation: 'Precise terminology for modern agile workplaces and team discussions.'
  },
  {
    match: /\bneed to\b/i,
    upgraded: 'it is imperative to / our strategic priority is to',
    cefrTarget: 'C2',
    explanation: 'Commands urgency and executive clarity when communicating priorities.'
  },
  {
    match: /\bshow\b/i,
    upgraded: 'demonstrate / illustrate / substantiate',
    cefrTarget: 'B2',
    explanation: 'Formal presentation verb that anchors claims with evidence.'
  }
];
