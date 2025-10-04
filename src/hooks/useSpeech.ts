import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Cross-platform speech-to-text:
 * - Web: Web Speech API (Chrome, Edge). Falls back to unsupported on other browsers.
 * - Native: react-native-voice (requires dev client build).
 */
export function useSpeech(onResult: (t: string) => void) {
  const [supported, setSupported] = useState<boolean>(false);
  const [listening, setListening] = useState<boolean>(false);

  // --- Web implementation ---
  if (Platform.OS === 'web') {
    const recRef = useRef<any>(null);
    const SR: any =
      (typeof window !== 'undefined' &&
        ((window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition)) ||
      null;

    useEffect(() => {
      setSupported(!!SR);
      return () => {
        try {
          recRef.current?.stop?.();
        } catch {}
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function start() {
      if (!SR) return;
      try {
        recRef.current = new SR();
        recRef.current.lang = 'en-US';
        recRef.current.continuous = false;
        recRef.current.interimResults = false;
        recRef.current.onresult = (e: any) => {
          const text = e.results?.[0]?.[0]?.transcript ?? '';
          if (text) onResult(text);
        };
        recRef.current.onend = () => setListening(false);
        recRef.current.onerror = () => setListening(false);
        setListening(true);
        recRef.current.start();
      } catch {
        setListening(false);
      }
    }

    async function stop() {
      try {
        recRef.current?.stop?.();
      } finally {
        setListening(false);
      }
    }

    return { supported: !!SR, listening, start, stop };
  }

  // --- Native implementation (react-native-voice) ---
  const Voice = require('react-native-voice').default;

  useEffect(() => {
    setSupported(true);
    Voice.onSpeechResults = (e: any) => {
      const text = e.value?.[0] ?? '';
      if (text) onResult(text);
    };
    Voice.onSpeechEnd = () => setListening(false);
    Voice.onSpeechError = () => setListening(false);
    return () => {
      try {
        Voice.destroy().then(Voice.removeAllListeners);
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function start() {
    try {
      setListening(true);
      await Voice.start('en-US');
    } catch {
      setListening(false);
    }
  }

  async function stop() {
    try {
      await Voice.stop();
    } finally {
      setListening(false);
    }
  }

  return { supported: true, listening, start, stop };
}