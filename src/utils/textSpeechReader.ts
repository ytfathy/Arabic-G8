/**
 * Text Speech Reader Utility for Egyptian Curriculum Passages
 * Provides crystal-clear spoken Arabic text-to-speech for reading passages,
 * poetry excerpts, and lesson synopses using the Web Speech API.
 */

type ReaderStateListener = (state: { isReading: boolean; isPaused: boolean; currentId: string | null }) => void;

class TextSpeechReader {
  private utterance: SpeechSynthesisUtterance | null = null;
  private currentTextId: string | null = null;
  private isReading: boolean = false;
  private isPaused: boolean = false;
  private speechRate: number = 0.88; // Slightly relaxed for educational clarity
  private listeners: Set<ReaderStateListener> = new Set();
  private isSpeechSupported: boolean = typeof window !== 'undefined' && 'speechSynthesis' in window;

  constructor() {
    if (typeof window !== 'undefined' && this.isSpeechSupported) {
      // Clean up on page unload
      window.addEventListener('beforeunload', () => {
        this.stop();
      });
    }
  }

  public subscribe(listener: ReaderStateListener): () => void {
    this.listeners.add(listener);
    listener({
      isReading: this.isReading,
      isPaused: this.isPaused,
      currentId: this.currentTextId
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => {
      try {
        listener({
          isReading: this.isReading,
          isPaused: this.isPaused,
          currentId: this.currentTextId
        });
      } catch (e) {
        console.error('Error notifying speech listener', e);
      }
    });
  }

  /**
   * Preprocesses Arabic text to make speech flow naturally:
   * Strips decorative quotes, resolves pauses at line breaks, and smooths punctuation.
   */
  private prepareText(rawText: string): string {
    return rawText
      .replace(/[«»""'']/g, '') // remove decorative quotes
      .replace(/[\r\n]+/g, ' . ') // replace linebreaks with slight pauses
      .replace(/[-–—]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Finds the best Arabic voice available in the browser
   */
  private getArabicVoice(): SpeechSynthesisVoice | null {
    if (!this.isSpeechSupported) return null;
    const voices = window.speechSynthesis.getVoices();
    
    // Preference order: Arabic Egyptian, Saudi, or any Arabic
    const arVoices = voices.filter(v => v.lang.startsWith('ar'));
    if (arVoices.length === 0) return null;

    const preferred = arVoices.find(v => v.lang.includes('EG') || v.lang.includes('SA') || v.name.toLowerCase().includes('arabic') || v.name.toLowerCase().includes('hoda') || v.name.toLowerCase().includes('maged') || v.name.toLowerCase().includes('tarik') || v.name.toLowerCase().includes('naayf'));
    return preferred || arVoices[0];
  }

  /**
   * Reads the given text aloud
   * @param id Unique identifier of the text (e.g. questionId, lessonId)
   * @param text Raw Arabic text to speak
   * @param onComplete Optional completion callback
   */
  public read(id: string, text: string, onComplete?: () => void) {
    if (!this.isSpeechSupported) {
      alert('ميزة القراءة الصوتية غير مدعومة في هذا المتصفح.');
      return;
    }

    // If currently reading this exact text, toggle stop
    if (this.isReading && this.currentTextId === id) {
      this.stop();
      return;
    }

    // Stop any ongoing speech first
    this.stop();

    const cleanText = this.prepareText(text);
    if (!cleanText) return;

    try {
      const utter = new SpeechSynthesisUtterance(cleanText);
      utter.lang = 'ar-SA';
      utter.rate = this.speechRate;
      utter.pitch = 1.0;
      utter.volume = 1.0;

      const voice = this.getArabicVoice();
      if (voice) {
        utter.voice = voice;
      }

      utter.onstart = () => {
        this.isReading = true;
        this.isPaused = false;
        this.currentTextId = id;
        this.notify();
      };

      utter.onend = () => {
        this.isReading = false;
        this.isPaused = false;
        this.currentTextId = null;
        this.notify();
        onComplete?.();
      };

      utter.onerror = (e) => {
        // 'interrupted' or 'canceled' are normal when user clicks stop
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('Speech synthesis notification:', e.error);
        }
        this.isReading = false;
        this.isPaused = false;
        this.currentTextId = null;
        this.notify();
      };

      this.utterance = utter;
      this.currentTextId = id;
      this.isReading = true;
      this.notify();

      window.speechSynthesis.speak(utter);
    } catch (err) {
      console.error('Failed to initiate speech:', err);
      this.isReading = false;
      this.currentTextId = null;
      this.notify();
    }
  }

  /**
   * Stops current speech
   */
  public stop() {
    if (this.isSpeechSupported) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    this.isReading = false;
    this.isPaused = false;
    this.currentTextId = null;
    this.notify();
  }

  /**
   * Pauses speech
   */
  public pause() {
    if (this.isSpeechSupported && this.isReading && !this.isPaused) {
      window.speechSynthesis.pause();
      this.isPaused = true;
      this.notify();
    }
  }

  /**
   * Resumes paused speech
   */
  public resume() {
    if (this.isSpeechSupported && this.isPaused) {
      window.speechSynthesis.resume();
      this.isPaused = false;
      this.notify();
    }
  }

  /**
   * Sets reading speed
   * @param rate 0.75 (slow), 0.88 (normal educational), 1.0 (fast)
   */
  public setRate(rate: number) {
    this.speechRate = rate;
  }

  public getRate(): number {
    return this.speechRate;
  }

  public isSupported(): boolean {
    return this.isSpeechSupported;
  }

  public getCurrentId(): string | null {
    return this.currentTextId;
  }

  public isCurrentlyReading(id: string): boolean {
    return this.isReading && this.currentTextId === id;
  }
}

export const speechReader = new TextSpeechReader();
