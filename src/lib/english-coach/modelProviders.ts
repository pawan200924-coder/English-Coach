import { EnglishLevel, FeedbackAnalysis, TutorPersona } from '@/types/english-coach';
import { analyzeSpeechLocally, generateSmartTutorResponse } from './feedbackEngine';

export type AIProvider = 'offline' | 'groq' | 'gemini' | 'huggingface';

export interface AIResponsePayload {
  spokenReply: string;
  feedback: FeedbackAnalysis;
}

export interface ModelProviderConfig {
  provider: AIProvider;
  apiKey: string;
}

function buildSystemPrompt(level: EnglishLevel, persona: TutorPersona, scenarioContext?: string): string {
  const levelGuidelines = {
    basic: `LEARNER PROFICIENCY: CEFR A1-A2 (Beginner).
- Speak with simple everyday words and short, clear sentences.
- Speak warmly and encouragingly.
- Ask straightforward, easy-to-answer follow-up questions.
- Do NOT overcorrect natural expressions; only correct fundamental grammar errors.`,
    intermediate: `LEARNER PROFICIENCY: CEFR B1-B2 (Intermediate).
- Speak at a natural conversational tempo with everyday idioms and collocations.
- Prompt the learner to expand on their opinions, experiences, and stories.
- Suggest natural phrasing improvements and sentence connectives (e.g., "Furthermore", "In that case").`,
    pro: `LEARNER PROFICIENCY: CEFR C1-C2 (Executive & Advanced Impact).
- Speak with executive eloquence, rhetorical sharpness, and sophisticated vocabulary.
- Act as an executive coach, tough interviewer, or debate challenger.
- Rigorously flag speech fillers ("um", "like", "you know") and suggest executive-level phrasing substitutions.`
  };

  return `You are ${persona.name}, an expert English speaking tutor and coach.
Role: ${persona.role} (${persona.accent} Accent). Style: ${persona.description}.
${levelGuidelines[level]}
${scenarioContext ? `Current Practice Scenario: ${scenarioContext}` : 'Context: Open conversational fluency practice.'}

CRITICAL TASK:
You will receive the user's spoken utterance. Analyze their spoken English proficiency AND provide your natural spoken response.
Output STRICT JSON ONLY with this exact schema (no markdown, no backticks):
{
  "spokenReply": "Your direct conversational reply to the user (natural for spoken audio, 1-3 sentences max).",
  "proAlternative": "How a fluent native or executive speaker would express what the user said with high poise and natural rhythm.",
  "grammarTips": [
    {
      "original": "Mistaken phrase",
      "correction": "Correct phrase",
      "reason": "Clear explanation of the rule"
    }
  ],
  "vocabularyUpgrades": [
    {
      "original": "Basic word",
      "upgraded": "Advanced alternative",
      "explanation": "Why this word is stronger"
    }
  ],
  "fillerWords": ["um", "like"],
  "fluencyScore": 88,
  "grammarScore": 92,
  "vocabularyScore": 85,
  "overallImpression": "1-2 encouraging feedback sentences."
}`;
}

// 1. Call Groq Cloud (Free Llama 3.3 70B - OpenAI Compatible)
async function callGroq(
  userText: string,
  apiKey: string,
  systemPrompt: string,
  history: { role: 'user' | 'model'; parts: string }[]
): Promise<AIResponsePayload | null> {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(h => ({
      role: h.role === 'model' ? 'assistant' : 'user',
      content: h.parts
    })),
    { role: 'user', content: userText }
  ];

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) return null;
  const json = await res.json();
  const raw = json.choices?.[0]?.message?.content;
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  return {
    spokenReply: parsed.spokenReply,
    feedback: {
      transcript: userText,
      proAlternative: parsed.proAlternative || userText,
      grammarTips: parsed.grammarTips || [],
      vocabularyUpgrades: parsed.vocabularyUpgrades || [],
      fillerWords: parsed.fillerWords || [],
      fluencyScore: parsed.fluencyScore ?? 85,
      grammarScore: parsed.grammarScore ?? 90,
      vocabularyScore: parsed.vocabularyScore ?? 82,
      overallImpression: parsed.overallImpression || 'Great speaking turn!'
    }
  };
}

// 2. Call Google Gemini Flash API (Free Tier)
async function callGemini(
  userText: string,
  apiKey: string,
  systemPrompt: string,
  history: { role: 'user' | 'model'; parts: string }[]
): Promise<AIResponsePayload | null> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
  const contents = [
    ...history.map(h => ({ role: h.role, parts: [{ text: h.parts }] })),
    { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser: "${userText}"` }] }
  ];

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.7, responseMimeType: 'application/json' }
    })
  });

  if (!res.ok) return null;
  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) return null;
  const parsed = JSON.parse(raw.trim());
  return {
    spokenReply: parsed.spokenReply,
    feedback: {
      transcript: userText,
      proAlternative: parsed.proAlternative || userText,
      grammarTips: parsed.grammarTips || [],
      vocabularyUpgrades: parsed.vocabularyUpgrades || [],
      fillerWords: parsed.fillerWords || [],
      fluencyScore: parsed.fluencyScore ?? 85,
      grammarScore: parsed.grammarScore ?? 90,
      vocabularyScore: parsed.vocabularyScore ?? 80,
      overallImpression: parsed.overallImpression || 'Excellent delivery!'
    }
  };
}

// 3. Call Hugging Face Free Serverless Inference
async function callHuggingFace(
  userText: string,
  token: string,
  systemPrompt: string
): Promise<AIResponsePayload | null> {
  const endpoint = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3';
  const prompt = `<s>[INST] ${systemPrompt}\n\nUser spoken sentence: "${userText}"\nRespond ONLY with strict JSON: [/INST]`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.trim()}`
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 500, return_full_text: false, temperature: 0.7 }
    })
  });

  if (!res.ok) return null;
  const data = await res.json();
  const generatedText = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
  if (!generatedText) return null;

  // Extract JSON from response
  const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  const parsed = JSON.parse(jsonMatch[0]);

  return {
    spokenReply: parsed.spokenReply,
    feedback: {
      transcript: userText,
      proAlternative: parsed.proAlternative || userText,
      grammarTips: parsed.grammarTips || [],
      vocabularyUpgrades: parsed.vocabularyUpgrades || [],
      fillerWords: parsed.fillerWords || [],
      fluencyScore: parsed.fluencyScore ?? 85,
      grammarScore: parsed.grammarScore ?? 90,
      vocabularyScore: parsed.vocabularyScore ?? 80,
      overallImpression: parsed.overallImpression || 'Solid speaking turn!'
    }
  };
}

// Main Multi-Model AI Router
export async function executeConversationTurn(
  userText: string,
  level: EnglishLevel,
  persona: TutorPersona,
  providerConfig: ModelProviderConfig,
  scenarioContext?: string,
  history: { role: 'user' | 'model'; parts: string }[] = []
): Promise<AIResponsePayload> {
  const systemPrompt = buildSystemPrompt(level, persona, scenarioContext);

  try {
    if (providerConfig.provider === 'groq' && providerConfig.apiKey) {
      const result = await callGroq(userText, providerConfig.apiKey, systemPrompt, history);
      if (result) return result;
    } else if (providerConfig.provider === 'gemini' && providerConfig.apiKey) {
      const result = await callGemini(userText, providerConfig.apiKey, systemPrompt, history);
      if (result) return result;
    } else if (providerConfig.provider === 'huggingface' && providerConfig.apiKey) {
      const result = await callHuggingFace(userText, providerConfig.apiKey, systemPrompt);
      if (result) return result;
    }
  } catch (err) {
    console.warn(`Error connecting to ${providerConfig.provider}, falling back to smart local engine:`, err);
  }

  // Smart Offline ESL Engine fallback (100% free, trained with CEFR Knowledge Bank)
  return {
    spokenReply: generateSmartTutorResponse(userText, level, persona.name, scenarioContext),
    feedback: analyzeSpeechLocally(userText, level)
  };
}
