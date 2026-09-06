import { EnglishLevel, FeedbackAnalysis, TutorPersona } from '@/types/english-coach';
import { analyzeSpeechLocally, generateSmartTutorResponse } from './feedbackEngine';

export interface AIResponsePayload {
  spokenReply: string;
  feedback: FeedbackAnalysis;
}

export async function processConversationTurn(
  userText: string,
  level: EnglishLevel,
  persona: TutorPersona,
  apiKey?: string,
  scenarioContext?: string,
  history: { role: 'user' | 'model'; parts: string }[] = []
): Promise<AIResponsePayload> {
  const effectiveApiKey = apiKey?.trim() || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  // If no API key is provided, use the smart local engine
  if (!effectiveApiKey) {
    const feedback = analyzeSpeechLocally(userText, level);
    const spokenReply = generateSmartTutorResponse(userText, level, persona.name, scenarioContext);
    return { spokenReply, feedback };
  }

  // Define level-specific persona instructions
  const levelDirectives = {
    basic: `Level: BASIC (A1-A2).
- Speak with simple words and short, clear sentences.
- Speak warmly and encouragingly.
- Ask easy, friendly follow-up questions.`,
    intermediate: `Level: INTERMEDIATE (B1-B2).
- Use natural everyday phrasing and conversational idioms.
- Keep the conversation flowing smoothly.
- Encourage the speaker to elaborate on their thoughts and opinions.`,
    pro: `Level: PRO (C1-C2 Executive/Advanced).
- Speak with sophisticated vocabulary, rhetorical sharpness, and professional poise.
- Act as an executive mentor, challenger, or debate partner.
- Challenge assumptions and ask thought-provoking, high-stakes questions.`
  };

  const systemInstruction = `You are ${persona.name}, an expert English speaking partner and coach.
Persona details: ${persona.role}, Accent tone: ${persona.accent}, Description: ${persona.description}.
${levelDirectives[level]}
${scenarioContext ? `Current Practice Scenario: ${scenarioContext}` : 'Context: Open conversational fluency practice.'}

CRITICAL TASK:
You will receive the user's spoken transcript. You must analyze their English AND provide your natural spoken reply.
Output ONLY a strict JSON object with this exact structure (no markdown formatting, no code blocks):
{
  "spokenReply": "Your direct conversational reply to the user (as ${persona.name}), natural for spoken audio. Do not include meta text or lists.",
  "proAlternative": "How a native or executive pro would rephrase what the user said with high eloquence and natural rhythm.",
  "grammarTips": [
    {
      "original": "The mistaken phrase or word",
      "correction": "The correct phrase",
      "reason": "Clear, friendly explanation of the grammar rule"
    }
  ],
  "vocabularyUpgrades": [
    {
      "original": "basic word used",
      "upgraded": "professional / advanced alternative",
      "explanation": "why this word is stronger in context"
    }
  ],
  "fillerWords": ["list", "of", "filler", "words"],
  "fluencyScore": 85,
  "grammarScore": 90,
  "vocabularyScore": 80,
  "overallImpression": "1-2 encouraging sentences evaluating this speaking turn."
}`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveApiKey}`;

    const promptText = `User spoken utterance: "${userText}"`;

    const contents = [
      ...history.map(h => ({
        role: h.role,
        parts: [{ text: h.parts }]
      })),
      {
        role: 'user',
        parts: [{ text: `${systemInstruction}\n\n${promptText}` }]
      }
    ];

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      console.warn(`Gemini API returned status ${response.status}. Falling back to local engine.`);
      return {
        spokenReply: generateSmartTutorResponse(userText, level, persona.name, scenarioContext),
        feedback: analyzeSpeechLocally(userText, level)
      };
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('No content returned from Gemini');
    }

    const parsed = JSON.parse(candidateText.trim());

    return {
      spokenReply: parsed.spokenReply || generateSmartTutorResponse(userText, level, persona.name, scenarioContext),
      feedback: {
        transcript: userText,
        proAlternative: parsed.proAlternative || userText,
        grammarTips: parsed.grammarTips || [],
        vocabularyUpgrades: parsed.vocabularyUpgrades || [],
        fillerWords: parsed.fillerWords || [],
        fluencyScore: typeof parsed.fluencyScore === 'number' ? parsed.fluencyScore : 85,
        grammarScore: typeof parsed.grammarScore === 'number' ? parsed.grammarScore : 90,
        vocabularyScore: typeof parsed.vocabularyScore === 'number' ? parsed.vocabularyScore : 80,
        overallImpression: parsed.overallImpression || 'Excellent speaking turn!'
      }
    };
  } catch (error) {
    console.warn('Failed to call Gemini API, using local analyzer fallback:', error);
    return {
      spokenReply: generateSmartTutorResponse(userText, level, persona.name, scenarioContext),
      feedback: analyzeSpeechLocally(userText, level)
    };
  }
}
