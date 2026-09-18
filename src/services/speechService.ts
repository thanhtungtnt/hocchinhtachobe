// Speech Synthesis Service for Vietnamese children's dictation

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  voiceURI?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
  onPause?: () => void;
  onResume?: () => void;
}

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingState: boolean = false;
  private isPausedState: boolean = false;
  private listeners: Set<(speaking: boolean, paused: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public isSupported(): boolean {
    return Boolean(this.synth);
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  public getVietnameseVoices(): SpeechSynthesisVoice[] {
    const all = this.getVoices();
    return all.filter((v) => v.lang.toLowerCase().startsWith('vi') || v.name.toLowerCase().includes('vietnam') || v.name.toLowerCase().includes('tiếng việt'));
  }

  public subscribeState(callback: (speaking: boolean, paused: boolean) => void) {
    this.listeners.add(callback);
    callback(this.isSpeakingState, this.isPausedState);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyState() {
    this.listeners.forEach((cb) => cb(this.isSpeakingState, this.isPausedState));
  }

  public speak(text: string, options: SpeechOptions = {}) {
    if (!this.synth) {
      if (options.onError) options.onError(new Error('Trình duyệt không hỗ trợ Web Speech API'));
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    // Clean text to avoid reading punctuation marks out loud awkwardly
    const cleanText = text.trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN';
    utterance.rate = options.rate ?? 0.85; // Default slow and clear for kids
    utterance.pitch = options.pitch ?? 1.05; // Slightly cheerful, friendly pitch

    // Choose voice
    const viVoices = this.getVietnameseVoices();
    if (options.voiceURI) {
      const chosen = this.getVoices().find((v) => v.voiceURI === options.voiceURI);
      if (chosen) utterance.voice = chosen;
    } else if (viVoices.length > 0) {
      // Pick best Vietnamese voice (Google Tiếng Việt or natural voice if present)
      const best = viVoices.find((v) => v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('mai')) || viVoices[0];
      utterance.voice = best;
    }

    utterance.onstart = () => {
      this.isSpeakingState = true;
      this.isPausedState = false;
      this.notifyState();
      options.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeakingState = false;
      this.isPausedState = false;
      this.currentUtterance = null;
      this.notifyState();
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.isSpeakingState = false;
      this.isPausedState = false;
      this.currentUtterance = null;
      this.notifyState();
      options.onError?.(e);
    };

    utterance.onpause = () => {
      this.isPausedState = true;
      this.notifyState();
      options.onPause?.();
    };

    utterance.onresume = () => {
      this.isPausedState = false;
      this.notifyState();
      options.onResume?.();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public pause() {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
      this.isPausedState = true;
      this.notifyState();
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.isPausedState = false;
      this.notifyState();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeakingState = false;
      this.isPausedState = false;
      this.currentUtterance = null;
      this.notifyState();
    }
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  public isPaused(): boolean {
    return this.isPausedState;
  }
}

export const speechService = new SpeechService();
