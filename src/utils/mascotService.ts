import { Badge } from '../types/curriculum';
import { MascotMessage, MascotMood } from '../types/mascot';

type MascotListener = (message: MascotMessage) => void;
type SpeakingListener = (isSpeaking: boolean) => void;

const VOICE_CLIPS: Record<'correct' | 'wrong' | 'badge' | 'welcome' | 'tip', string[]> = {
  correct: [
    '/assets/audio/faseeh/ahsant_1.mp3',
    '/assets/audio/faseeh/ahsant_2.mp3',
    '/assets/audio/faseeh/ahsant_3.mp3'
  ],
  wrong: [
    '/assets/audio/faseeh/try_again_1.mp3',
    '/assets/audio/faseeh/try_again_2.mp3',
    '/assets/audio/faseeh/try_again_3.mp3'
  ],
  badge: [
    '/assets/audio/faseeh/awesome_1.mp3',
    '/assets/audio/faseeh/awesome_2.mp3'
  ],
  welcome: [
    '/assets/audio/faseeh/welcome.mp3'
  ],
  tip: [
    '/assets/audio/faseeh/tip_1.mp3',
    '/assets/audio/faseeh/tip_2.mp3'
  ]
};

class MascotService {
  private listeners: Set<MascotListener> = new Set();
  private speakingListeners: Set<SpeakingListener> = new Set();
  private soundEnabled: boolean = true;
  private audioCtx: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private isSpeaking: boolean = false;
  private arabicVoices: SpeechSynthesisVoice[] = [];
  private lastMessage: MascotMessage | null = null;
  private isUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('iee_mascot_sound');
      if (saved !== null) {
        this.soundEnabled = saved === 'true';
      }

      this.initVoiceEngine();
      this.setupUserInteractionUnlock();
    }
  }

  /**
   * Initializes browser SpeechSynthesis voices and caches available Arabic voices
   */
  private initVoiceEngine() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      try {
        const allVoices = window.speechSynthesis.getVoices();
        this.arabicVoices = allVoices.filter(v => v.lang.toLowerCase().startsWith('ar'));
      } catch {
        // ignore
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  /**
   * Unlock AudioContext and Audio on first user interaction to bypass browser autoplay restrictions
   */
  private setupUserInteractionUnlock() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      if (this.isUnlocked) return;
      this.isUnlocked = true;

      // Unlock AudioContext
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          if (!this.audioCtx) {
            this.audioCtx = new AudioContextClass();
          }
          if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
          }
        }
      } catch {
        // ignore
      }

      // Unlock SpeechSynthesis
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.resume();
        } catch {
          // ignore
        }
      }

      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
  }

  public subscribe(listener: MascotListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeSpeaking(listener: SpeakingListener): () => void {
    this.speakingListeners.add(listener);
    listener(this.isSpeaking);
    return () => {
      this.speakingListeners.delete(listener);
    };
  }

  private setSpeakingState(speaking: boolean) {
    this.isSpeaking = speaking;
    this.speakingListeners.forEach(fn => fn(speaking));
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('iee_mascot_sound', String(enabled));
      if (!enabled) {
        if (this.currentAudio) {
          this.currentAudio.pause();
          this.currentAudio = null;
        }
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        this.setSpeakingState(false);
      }
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Cleans text to extract pure Arabic spoken text (removes emojis, symbols)
   */
  private cleanTextForSpeech(raw: string): string {
    return raw
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '')
      .replace(/[*_~`#@«»]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Plays harmonic melodic chimes via Web Audio API
   */
  private playChime(type: 'correct' | 'wrong' | 'badge' | 'tip') {
    if (!this.soundEnabled || typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx || this.audioCtx.state === 'suspended') {
        this.audioCtx = new AudioContextClass();
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      if (type === 'correct') {
        // Cheerful ascending harmonic chime
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.connect(gain);
          gain.connect(ctx.destination);

          const start = now + idx * 0.08;
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.12, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

          osc.start(start);
          osc.stop(start + 0.35);
        });
      } else if (type === 'wrong') {
        // Gentle encouraging harmonic chord
        [329.63, 261.63].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.connect(gain);
          gain.connect(ctx.destination);

          const start = now + idx * 0.1;
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.1, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

          osc.start(start);
          osc.stop(start + 0.3);
        });
      } else if (type === 'badge') {
        // Triumphant Fanfare
        [392.00, 523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.connect(gain);
          gain.connect(ctx.destination);

          const start = now + idx * 0.12;
          const dur = idx === 3 ? 0.6 : 0.18;
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.18, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

          osc.start(start);
          osc.stop(start + dur);
        });
      } else if (type === 'tip') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880.00, now + 0.08);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch {
      // Audio fails silently if blocked
    }
  }

  /**
   * Plays authentic recorded Arabic voice MP3 of Faseeh
   */
  public playVoiceAudio(type: 'correct' | 'wrong' | 'badge' | 'welcome' | 'tip'): Promise<boolean> {
    if (!this.soundEnabled || typeof window === 'undefined') return Promise.resolve(false);

    return new Promise((resolve) => {
      try {
        if (this.currentAudio) {
          this.currentAudio.pause();
          this.currentAudio.currentTime = 0;
          this.currentAudio = null;
        }

        const clips = VOICE_CLIPS[type];
        if (!clips || clips.length === 0) {
          resolve(false);
          return;
        }

        const chosenClip = clips[Math.floor(Math.random() * clips.length)];
        const audio = new Audio(chosenClip);
        this.currentAudio = audio;
        audio.volume = 1.0;

        audio.onplay = () => {
          this.setSpeakingState(true);
        };

        audio.onended = () => {
          this.setSpeakingState(false);
          this.currentAudio = null;
          resolve(true);
        };

        audio.onerror = () => {
          this.setSpeakingState(false);
          this.currentAudio = null;
          resolve(false);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Successfully started playback
            })
            .catch(() => {
              this.setSpeakingState(false);
              this.currentAudio = null;
              resolve(false);
            });
        }
      } catch {
        this.setSpeakingState(false);
        resolve(false);
      }
    });
  }

  /**
   * Speaks the Arabic text aloud using recorded voice MP3s, falling back to Web Speech API
   */
  public speak(text: string, mood?: MascotMood) {
    if (!this.soundEnabled || typeof window === 'undefined') return;

    const voiceType: 'correct' | 'wrong' | 'badge' | 'tip' = 
      mood === 'happy' ? 'correct' :
      mood === 'encouraging' ? 'wrong' :
      mood === 'celebrating' ? 'badge' : 'tip';

    // 1. Play musical chime first
    this.playChime(voiceType);

    // 2. Play the authentic spoken Arabic MP3 clip
    this.playVoiceAudio(voiceType).then((playedSuccessfully) => {
      // If MP3 played successfully, we are good!
      if (playedSuccessfully) return;

      // 3. Fallback: If MP3 could not play (e.g. offline asset failure), use browser SpeechSynthesis
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          window.speechSynthesis.resume();

          const cleanText = this.cleanTextForSpeech(text);
          if (!cleanText) return;

          const utterance = new SpeechSynthesisUtterance(cleanText);

          if (this.arabicVoices.length === 0) {
            this.initVoiceEngine();
          }

          const arabicVoice = 
            this.arabicVoices.find(v => v.lang.toLowerCase() === 'ar-eg') ||
            this.arabicVoices.find(v => v.lang.toLowerCase() === 'ar-sa') ||
            this.arabicVoices.find(v => v.lang.toLowerCase().startsWith('ar')) ||
            null;

          if (arabicVoice) {
            utterance.voice = arabicVoice;
            utterance.lang = arabicVoice.lang;
          } else {
            utterance.lang = 'ar-EG';
          }

          utterance.pitch = 1.15;
          utterance.rate = 0.95;
          utterance.volume = 1.0;

          utterance.onstart = () => this.setSpeakingState(true);
          utterance.onend = () => this.setSpeakingState(false);
          utterance.onerror = () => this.setSpeakingState(false);

          window.speechSynthesis.speak(utterance);
        } catch {
          this.setSpeakingState(false);
        }
      }
    });
  }

  /**
   * Replays the voice of the current message or plays an encouraging phrase
   */
  public repeatLastMessage() {
    if (this.lastMessage) {
      this.speak(this.lastMessage.spokenText || this.lastMessage.text, this.lastMessage.mood);
    } else {
      this.playVoiceAudio('welcome');
    }
  }

  /**
   * Plays welcome voice
   */
  public playWelcomeVoice() {
    this.playVoiceAudio('welcome');
  }

  /**
   * Test voice button handler
   */
  public testVoice() {
    this.playVoiceAudio('welcome');
  }

  public emit(message: Omit<MascotMessage, 'id'>) {
    const fullMsg: MascotMessage = {
      ...message,
      id: Math.random().toString(36).substring(2, 9)
    };

    this.lastMessage = fullMsg;

    // Trigger voice speak automatically
    const textToSpeak = fullMsg.spokenText || fullMsg.text;
    this.speak(textToSpeak, fullMsg.mood);

    this.listeners.forEach(fn => fn(fullMsg));
  }

  // Quick action helpers
  public notifyCorrect(customText?: string) {
    const positivePhrases = [
      'أحسنت! 🌟 إجابة نموذجية ورائعة.',
      'أحسنت يا بطل! 👏 بارك الله في تميزك.',
      'أحسنت! ✨ استمر في هذا التألق اللغوي.',
      'ممتاز! إجابة صحيحة +٢٠ نقطة تميز 🎯'
    ];
    const text = customText || positivePhrases[Math.floor(Math.random() * positivePhrases.length)];
    this.emit({
      text,
      spokenText: 'أحسنت يا بطل! إجابة ممتازة.',
      mood: 'happy',
      duration: 4000
    });
  }

  public notifyWrong(customText?: string) {
    const encouragePhrases = [
      'حاول مرة أخرى! 💪 أنت قادر على تجاوزها.',
      'حاول مرة أخرى! 💡 الخطأ خطوة أولى نحو التعلم.',
      'حاول مرة أخرى! راجع القاعدة وركز جيداً 📖',
      'لا تيأس، حاول مرة أخرى وستصل للإجابة الصحيحة! 🌟'
    ];
    const text = customText || encouragePhrases[Math.floor(Math.random() * encouragePhrases.length)];
    this.emit({
      text,
      spokenText: 'حاول مرة أخرى! ركز في القاعدة وستصل للإجابة.',
      mood: 'encouraging',
      duration: 4500
    });
  }

  public notifyBadgeUnlocked(badge: Badge) {
    this.emit({
      text: 'هذا رائع! 🎉 لقد فتحت وساماً جديداً!',
      subText: `وسام «${badge.title}» - استحققت التميز والتألق!`,
      spokenText: `هذا رائع! إنجاز متميز جديد! لقد فتحت وسام ${badge.title}.`,
      mood: 'celebrating',
      badge,
      duration: 8000
    });
  }

  public notifyTip(tipText: string) {
    this.emit({
      text: tipText,
      spokenText: tipText,
      mood: 'thinking',
      duration: 5000
    });
  }
}

export const mascotService = new MascotService();
