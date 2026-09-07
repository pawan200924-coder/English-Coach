"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechSynthesisOptions {
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
}

export function useSpeechSynthesis({ onSpeakStart, onSpeakEnd }: UseSpeechSynthesisOptions = {}) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const onSpeakStartRef = useRef(onSpeakStart);
  useEffect(() => {
    onSpeakStartRef.current = onSpeakStart;
  }, [onSpeakStart]);

  const onSpeakEndRef = useRef(onSpeakEnd);
  useEffect(() => {
    onSpeakEndRef.current = onSpeakEnd;
  }, [onSpeakEnd]);

  // Load and filter voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      // Filter for English voices
      const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'));
      setVoices(englishVoices.length > 0 ? englishVoices : availableVoices);

      if (!selectedVoice && englishVoices.length > 0) {
        // Prefer Natural/Google/Microsoft English voices
        const preferred = englishVoices.find(
          v => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')
        ) || englishVoices[0];
        setSelectedVoice(preferred);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedVoice]);

  const speak = useCallback(
    (text: string, customRate?: number, customVoice?: SpeechSynthesisVoice) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      window.speechSynthesis.cancel(); // Stop any currently speaking audio

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      const voiceToUse = customVoice || selectedVoice;
      if (voiceToUse) {
        utterance.voice = voiceToUse;
      }

      utterance.rate = customRate || rate;
      utterance.pitch = pitch;

      utterance.onstart = () => {
        setIsSpeaking(true);
        if (onSpeakStartRef.current) onSpeakStartRef.current();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onSpeakEndRef.current) onSpeakEndRef.current();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        setIsSpeaking(false);
        if (onSpeakEndRef.current) onSpeakEndRef.current();
      };

      window.speechSynthesis.speak(utterance);
    },
    [selectedVoice, rate, pitch]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // Pick suitable voice by accent code
  const setVoiceByAccent = useCallback(
    (accent: 'US' | 'UK' | 'IN' | 'AU', gender?: 'female' | 'male') => {
      const match = voices.find(v => {
        const langMatch =
          accent === 'US' ? v.lang.includes('US') || v.lang.includes('en-US') :
          accent === 'UK' ? v.lang.includes('GB') || v.lang.includes('en-GB') :
          accent === 'IN' ? v.lang.includes('IN') || v.lang.includes('en-IN') :
          v.lang.includes('AU') || v.lang.includes('en-AU');

        if (gender === 'male') {
          return langMatch && (v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('daniel'));
        }
        return langMatch;
      });

      if (match) {
        setSelectedVoice(match);
      }
    },
    [voices]
  );

  return {
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    pitch,
    setPitch,
    isSpeaking,
    speak,
    stopSpeaking,
    setVoiceByAccent
  };
}
