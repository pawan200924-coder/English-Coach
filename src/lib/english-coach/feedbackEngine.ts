import { FeedbackAnalysis, GrammarTip, EnglishLevel } from '@/types/english-coach';

// ESL Common Grammar & Usage Rules
interface GrammarPatternRule {
  pattern: RegExp;
  correction: string;
  reason: string;
}

const GRAMMAR_RULES: GrammarPatternRule[] = [
  {
    pattern: /\bi am agree\b/i,
    correction: 'I agree',
    reason: '"Agree" is already a verb in English; you do not need "am". Say "I agree" or "I disagree".'
  },
  {
    pattern: /\bi am disagree\b/i,
    correction: 'I disagree',
    reason: '"Disagree" is a verb, so say "I disagree" directly without "am".'
  },
  {
    pattern: /\byesterday i (?:go|see|buy|make|do|eat|come)\b/i,
    correction: 'yesterday I went / saw / bought / made / did / ate / came',
    reason: 'When referring to a completed past time like "yesterday", use the simple past tense.'
  },
  {
    pattern: /\b(?:he|she|it) don'?t\b/i,
    correction: 'he/she/it doesn\'t',
    reason: 'Third-person singular subjects (he, she, it) take "doesn\'t" instead of "don\'t".'
  },
  {
    pattern: /\bi have (\d+|twenty|thirty|forty) years\b/i,
    correction: 'I am $1 years old',
    reason: 'In English, age is described with the verb "to be" ("I am 25"), not "to have".'
  },
  {
    pattern: /\bdiscuss about\b/i,
    correction: 'discuss',
    reason: '"Discuss" already means "to talk about", so the preposition "about" is redundant.'
  },
  {
    pattern: /\breturn back\b/i,
    correction: 'return / go back',
    reason: '"Return" already includes the meaning of "back". Say "return" or "come back".'
  },
  {
    pattern: /\binformations\b/i,
    correction: 'information / pieces of information',
    reason: '"Information" is an uncountable noun in English and never takes a plural "s".'
  },
  {
    pattern: /\bstuffs\b/i,
    correction: 'stuff / items',
    reason: '"Stuff" is uncountable. Use "stuff" or "things/items".'
  },
  {
    pattern: /\bevery students\b/i,
    correction: 'every student',
    reason: '"Every" is followed by a singular countable noun.'
  },
  {
    pattern: /\bexplain me\b/i,
    correction: 'explain to me',
    reason: 'The verb "explain" requires the preposition "to" before the indirect object.'
  },
  {
    pattern: /\bdepends of\b/i,
    correction: 'depends on',
    reason: 'In English, the preposition used with "depend" is always "on", not "of".'
  },
  {
    pattern: /\bi want that you\b/i,
    correction: 'I want you to',
    reason: 'English uses the structure "want + object + to-infinitive" (e.g., "I want you to come").'
  }
];

// Vocabulary Upgrade Library
interface VocabReplacement {
  match: RegExp;
  upgraded: string;
  explanation: string;
}

const VOCAB_UPGRADES: VocabReplacement[] = [
  {
    match: /\bvery good\b/i,
    upgraded: 'exceptional / exemplary / stellar',
    explanation: 'Elevates basic positive praise to executive standard.'
  },
  {
    match: /\bvery bad\b/i,
    upgraded: 'suboptimal / detrimental / deficient',
    explanation: 'Sounds more analytical and constructive in professional settings.'
  },
  {
    match: /\bbig problem\b/i,
    upgraded: 'critical challenge / major bottleneck',
    explanation: 'Frames difficulties strategically rather than casually.'
  },
  {
    match: /\bmake it better\b/i,
    upgraded: 'refine / optimize / enhance',
    explanation: 'Precise action verbs convey expertise and intention.'
  },
  {
    match: /\bi think\b/i,
    upgraded: 'in my assessment / from my vantage point / I would propose',
    explanation: 'Adds rhetorical weight and presence during meetings and interviews.'
  },
  {
    match: /\ba lot of\b/i,
    upgraded: 'a substantial volume of / an abundance of / extensive',
    explanation: 'Sounds polished and avoids informal colloquial phrasing.'
  },
  {
    match: /\bhelp\b/i,
    upgraded: 'facilitate / assist / bolster',
    explanation: 'Professional verbs demonstrate leadership and teamwork capability.'
  },
  {
    match: /\bstart\b/i,
    upgraded: 'initiate / spearhead / commence',
    explanation: 'Showcases initiative and proactive ownership.'
  },
  {
    match: /\btalk about\b/i,
    upgraded: 'address / delve into / articulate',
    explanation: 'Stronger verbal presentation in workplace and interview discussions.'
  },
  {
    match: /\bneed to\b/i,
    upgraded: 'it is imperative to / our priority is to',
    explanation: 'Creates urgency and executive authority in conversation.'
  }
];

const FILLER_WORDS = ['um', 'uh', 'er', 'ah', 'like', 'you know', 'basically', 'actually', 'sort of', 'kind of'];

export function analyzeSpeechLocally(text: string, level: EnglishLevel): FeedbackAnalysis {
  const lower = text.toLowerCase();
  const words = text.trim().split(/\s+/).filter(Boolean);

  // 1. Check Grammar Rules
  const grammarTips: GrammarTip[] = [];
  for (const rule of GRAMMAR_RULES) {
    if (rule.pattern.test(text)) {
      const match = text.match(rule.pattern);
      grammarTips.push({
        original: match ? match[0] : 'Error',
        correction: rule.correction,
        reason: rule.reason
      });
    }
  }

  // 2. Detect Filler Words
  const detectedFillers: string[] = [];
  for (const filler of FILLER_WORDS) {
    const reg = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = text.match(reg);
    if (matches) {
      detectedFillers.push(...matches.map(m => m.toLowerCase()));
    }
  }

  // 3. Find Vocabulary Upgrades
  const vocabularyUpgrades: { original: string; upgraded: string; explanation: string }[] = [];
  for (const item of VOCAB_UPGRADES) {
    if (item.match.test(text)) {
      const match = text.match(item.match);
      if (match) {
        vocabularyUpgrades.push({
          original: match[0],
          upgraded: item.upgraded,
          explanation: item.explanation
        });
      }
    }
  }

  // 4. Generate Pro Alternative
  let proAlternative = text;
  // Apply grammar fixes
  if (grammarTips.length > 0) {
    grammarTips.forEach(tip => {
      proAlternative = proAlternative.replace(new RegExp(tip.original, 'i'), tip.correction.split('/')[0].trim());
    });
  }
  // Apply vocab upgrades
  if (vocabularyUpgrades.length > 0) {
    vocabularyUpgrades.forEach(u => {
      const topPick = u.upgraded.split('/')[0].trim();
      proAlternative = proAlternative.replace(new RegExp(u.original, 'i'), topPick);
    });
  }
  // If no changes needed, produce a natural enhanced sentence
  if (proAlternative === text && text.length > 5) {
    if (level === 'basic') {
      proAlternative = `That's very clear! You could also say: "${text.charAt(0).toUpperCase() + text.slice(1)}."`;
    } else if (level === 'intermediate') {
      proAlternative = `To sound more natural: "Naturally, ${text.charAt(0).toLowerCase() + text.slice(1)}"`;
    } else {
      proAlternative = `For executive impact: "Precisely speaking, ${text.charAt(0).toLowerCase() + text.slice(1)}"`;
    }
  }

  // 5. Calculate Scores (0-100)
  const baseScore = Math.min(95, 60 + words.length * 2);
  const grammarPenalty = grammarTips.length * 15;
  const fillerPenalty = detectedFillers.length * 5;
  const vocabBonus = vocabularyUpgrades.length * 10;

  const grammarScore = Math.max(30, Math.min(100, 95 - grammarPenalty));
  const fluencyScore = Math.max(40, Math.min(100, baseScore - fillerPenalty));
  const vocabularyScore = Math.max(45, Math.min(100, 70 + vocabBonus - (words.length < 5 ? 20 : 0)));

  let overallImpression = 'Great effort! Keep expressing yourself freely.';
  if (grammarTips.length > 0) {
    overallImpression = `Good message! Pay attention to ${grammarTips[0].correction} to polish your sentence.`;
  } else if (detectedFillers.length > 2) {
    overallImpression = `Smooth ideas, but try pausing silently instead of using filler words like "${detectedFillers[0]}".`;
  } else if (words.length > 15) {
    overallImpression = 'Fantastic sentence complexity and confident delivery!';
  }

  return {
    transcript: text,
    proAlternative,
    grammarTips,
    vocabularyUpgrades,
    fillerWords: detectedFillers,
    fluencyScore,
    grammarScore,
    vocabularyScore,
    overallImpression
  };
}

// Generate intelligent contextual response when offline or without Gemini API key
export function generateSmartTutorResponse(
  userText: string,
  level: EnglishLevel,
  personaName: string,
  scenarioPrompt?: string
): string {
  const lower = userText.toLowerCase();

  // Basic Level Greetings & Common questions
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    if (level === 'basic') {
      return "Hello! It is wonderful to speak with you today. How is your day going so far?";
    }
    if (level === 'intermediate') {
      return "Hey there! Great to connect with you. What exciting projects or plans have you got going on this week?";
    }
    return "Greetings. A pleasure to dialogue with you. What strategic topic or discussion point would you like to examine today?";
  }

  // Self introduction
  if (lower.includes('my name is') || lower.includes("i'm ") || lower.includes('i am ')) {
    if (level === 'basic') {
      return "Nice to meet you! Where do you live, and what is your favorite thing to do in your free time?";
    }
    return "It's fantastic to meet you! Tell me more about your professional background and the goals you are targeting right now.";
  }

  // Asking for advice or English help
  if (lower.includes('english') || lower.includes('improve') || lower.includes('practice')) {
    return "You are in the right place! Consistency is the secret. Speak aloud, don't worry about minor errors, and let's keep having two-way voice conversations. What is the most challenging part of English for you?";
  }

  // Scenario context continuation
  if (scenarioPrompt && scenarioPrompt.length > 0) {
    if (scenarioPrompt.includes('Coffee') || lower.includes('coffee') || lower.includes('tea')) {
      return "Got it! Would you like that hot or iced? And will you be having any pastries with your order today?";
    }
    if (scenarioPrompt.includes('Interview') || lower.includes('experience') || lower.includes('job')) {
      return "That sounds like a solid foundation. Can you give me a specific example of a difficult problem you encountered and how you resolved it with your team?";
    }
    if (scenarioPrompt.includes('Pitch') || lower.includes('proposal') || lower.includes('budget')) {
      return "Those metrics are promising, but what safeguards have you established should the market conditions shift? Walk me through your contingency framework.";
    }
  }

  // Dynamic responses based on user utterance length and level
  if (level === 'basic') {
    return `I understand you said: "${userText.slice(0, 50)}...". That makes a lot of sense! Could you tell me a little more about why that is important to you?`;
  }
  if (level === 'intermediate') {
    return `That's an interesting perspective on that. When you look back at that experience, what do you feel was the most valuable lesson you took away?`;
  }
  // Pro level response
  return `That argument carries substantive weight. However, how would you address potential skepticism from stakeholders who prioritize short-term ROI over that long-term vision?`;
}
