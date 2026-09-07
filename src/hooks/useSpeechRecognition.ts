"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechRecognitionOptions {
  onTranscriptComplete?: (finalTranscript: string) => void;
  lang?: string;
  continuous?: boolean;
}

export function useSpeechRecognition({
  onTranscriptComplete,
  lang = 'en-US',
  continuous = false
}: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isAudioDetected, setIsAudioDetected] = useState(false);

  // Stable callback ref prevents useEffect recreation and recognition abort loops on re-renders
  const onTranscriptCompleteRef = useRef(onTranscriptComplete);
  useEffect(() => {
    onTranscriptCompleteRef.current = onTranscriptComplete;
  }, [onTranscriptComplete]);

  const langRef = useRef(lang);
  useEffect(() => {
    langRef.current = lang;
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
    }
  }, [lang]);

  const continuousRef = useRef(continuous);
  useEffect(() => {
    continuousRef.current = continuous;
  }, [continuous]);

  // Audio & Web Speech references
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastVolumeUpdateRef = useRef<number>(0);

  // Transcript state tracking
  const latestTranscriptRef = useRef<string>('');
  const hasSubmittedRef = useRef<boolean>(false);
  const isListeningRef = useRef<boolean>(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Internal helper to safely submit captured speech
  const dispatchTranscript = useCallback((textToSubmit: string) => {
    const clean = textToSubmit.trim();
    if (!clean || hasSubmittedRef.current) return;

    hasSubmittedRef.current = true;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (onTranscriptCompleteRef.current) {
      onTranscriptCompleteRef.current(clean);
    }
    setInterimTranscript('');
    latestTranscriptRef.current = '';
  }, []);

  // Stop audio monitoring tracks
  const stopAudioMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      } catch (e) {}
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close().catch(() => {});
      } catch (e) {}
      audioContextRef.current = null;
    }
    setVolumeLevel(0);
    setIsAudioDetected(false);
  }, []);

  // Start audio waveform monitoring
  const startAudioMonitoring = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const currentLevel = Math.min(100, Math.round((avg / 128) * 100));

        // Throttle React state updates to ~15 FPS to avoid re-render choke
        const now = performance.now();
        if (now - lastVolumeUpdateRef.current > 70) {
          lastVolumeUpdateRef.current = now;
          setVolumeLevel(prev => (Math.abs(prev - currentLevel) > 3 ? currentLevel : prev));
          setIsAudioDetected(currentLevel > 8);
        }

        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.warn('Could not initialize audio visualizer context:', err);
    }
  }, []);

  // Initialize SpeechRecognition instance ONCE on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Your browser does not support voice recognition. Please use Google Chrome, Microsoft Edge, or Safari.');
      return;
    }

    let recognition: any = null;
    try {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = langRef.current;
      recognition.maxAlternatives = 1;
    } catch (e: any) {
      console.error('Failed to create SpeechRecognition instance:', e);
      setIsSupported(false);
      return;
    }

    recognition.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let finalString = '';
      let interimString = '';

      for (let i = 0; i < event.results.length; ++i) {
        const item = event.results[i];
        const phrase = item[0].transcript;
        if (item.isFinal) {
          finalString += phrase + ' ';
        } else {
          interimString += phrase;
        }
      }

      const combinedText = (finalString + interimString).trim();
      if (combinedText) {
        setInterimTranscript(combinedText);
        latestTranscriptRef.current = combinedText;
        hasSubmittedRef.current = false;

        // Reset silence detection timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // Auto-submit after 1.6s of silence after speaking
        silenceTimerRef.current = setTimeout(() => {
          if (isListeningRef.current && latestTranscriptRef.current.trim() && !hasSubmittedRef.current) {
            const captured = latestTranscriptRef.current.trim();
            dispatchTranscript(captured);
            if (!continuousRef.current) {
              stopListening();
            }
          }
        }, 1600);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        return;
      }
      if (event.error === 'aborted') {
        return;
      }

      console.warn('Speech recognition error event:', event.error);

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setPermissionState('denied');
        setError('Microphone permission blocked. Click the lock icon in your browser URL bar, set Microphone to Allow, and refresh.');
      } else if (event.error === 'network') {
        setError('Speech recognition network error. Please check your internet connection or use text input.');
      } else if (event.error === 'audio-capture') {
        setError('No audio captured. Please verify your microphone is plugged in and not in use by another app.');
      } else {
        setError('Microphone notice: ' + event.error);
      }

      setIsListening(false);
      isListeningRef.current = false;
      stopAudioMonitoring();
    };

    recognition.onend = () => {
      if (latestTranscriptRef.current.trim() && !hasSubmittedRef.current) {
        dispatchTranscript(latestTranscriptRef.current.trim());
      }

      if (isListeningRef.current) {
        try {
          recognition.start();
          return;
        } catch (err) {}
      }

      setIsListening(false);
      isListeningRef.current = false;
      stopAudioMonitoring();
    };

    recognitionRef.current = recognition;

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.abort();
        } catch (e) {}
      }
      stopAudioMonitoring();
    };
  }, [dispatchTranscript, stopAudioMonitoring]);

  // Start listening with mic permission guarantee
  const startListening = useCallback(async () => {
    setError(null);
    hasSubmittedRef.current = false;
    latestTranscriptRef.current = '';
    setInterimTranscript('');

    if (typeof window === 'undefined') return;

    // Step 1: Request & verify microphone permission first
    let userStream: MediaStream | null = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = userStream;
        setPermissionState('granted');
        startAudioMonitoring(userStream);
      } catch (err: any) {
        console.warn('Microphone permission error:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setPermissionState('denied');
          setError('Microphone permission is blocked in your browser. Click the lock icon in your address bar to Allow microphone access.');
          setIsListening(false);
          isListeningRef.current = false;
          return;
        }
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No microphone found on your computer. Please connect a microphone or headset.');
          setIsListening(false);
          isListeningRef.current = false;
          return;
        }
      }
    }

    // Step 2: Start Web Speech Recognition
    const recognition = recognitionRef.current;
    if (!recognition) {
      setError('Voice recognition is not initialized or unsupported in this browser.');
      return;
    }

    try {
      isListeningRef.current = true;
      setIsListening(true);
      recognition.lang = langRef.current;
      recognition.start();
    } catch (err: any) {
      if (err.name === 'InvalidStateError') {
        setIsListening(true);
        isListeningRef.current = true;
      } else {
        console.error('Failed to start recognition:', err);
        setError('Could not activate microphone: ' + (err.message || err.name));
        setIsListening(false);
        isListeningRef.current = false;
        stopAudioMonitoring();
      }
    }
  }, [startAudioMonitoring, stopAudioMonitoring]);

  // Stop listening and immediately submit any captured speech
  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (latestTranscriptRef.current.trim() && !hasSubmittedRef.current) {
      dispatchTranscript(latestTranscriptRef.current.trim());
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }

    stopAudioMonitoring();
  }, [dispatchTranscript, stopAudioMonitoring]);

  // Force immediate submission of whatever the user spoke
  const submitNow = useCallback(() => {
    if (latestTranscriptRef.current.trim()) {
      dispatchTranscript(latestTranscriptRef.current.trim());
    }
    stopListening();
  }, [dispatchTranscript, stopListening]);

  const clearTranscript = useCallback(() => {
    setInterimTranscript('');
    latestTranscriptRef.current = '';
  }, []);

  return {
    isListening,
    interimTranscript,
    volumeLevel,
    isSupported,
    error,
    permissionState,
    isAudioDetected,
    startListening,
    stopListening,
    submitNow,
    clearTranscript
  };
}
