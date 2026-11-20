import { Badge } from './curriculum';

export type MascotMood = 'idle' | 'happy' | 'encouraging' | 'celebrating' | 'thinking';

export interface MascotMessage {
  id: string;
  text: string;
  mood: MascotMood;
  subText?: string;
  spokenText?: string;
  duration?: number; // duration in ms to show before returning to idle
  badge?: Badge;
}
