import { StudentStats, UserAnswerRecord, ExamResult, ExamConfig, Badge } from '../types/curriculum';

const STATS_KEY = 'iee_arabic_stats_v1';
const ANSWERS_KEY = 'iee_arabic_answers_v1';
const EXAMS_KEY = 'iee_arabic_exams_v1';
const BOOKMARKS_KEY = 'iee_arabic_bookmarks_v1';
const SAVED_EXAMS_KEY = 'iee_arabic_saved_exams_v1';

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge_first_step',
    title: 'خطوة أولى نحو القمة',
    description: 'أجبت عن أول سؤال تقييمي في المنصة بنجاح.',
    icon: '🎯'
  },
  {
    id: 'badge_grammar_master',
    title: 'فارس النحو العربي',
    description: 'حققت 5 إجابات صحيحة في قواعد النحو والإعراب.',
    icon: '📜'
  },
  {
    id: 'badge_reading_explorer',
    title: 'مستكشف نصوص القراءة',
    description: 'أتقنت أسئلة الفهم القرائي لنصوص القراءة الوطنية.',
    icon: '📖'
  },
  {
    id: 'badge_poetry_connoisseur',
    title: 'متذوق الشعر والبلاغة',
    description: 'أجبت ببراعة عن أسئلة النصوص الشعرية والجماليات.',
    icon: '🪶'
  },
  {
    id: 'badge_spelling_shield',
    title: 'حارس الإملاء والرسم',
    description: 'أتقنت كتابة الألف اللينة والتاء والهاء دون خطأ.',
    icon: '✍️'
  },
  {
    id: 'badge_exam_champion',
    title: 'بطل منشئ الامتحانات',
    description: 'أنجزت امتحاناً في منشئ الامتحانات بنسبة تفوق ٨٥٪.',
    icon: '🏆'
  },
  {
    id: 'badge_perfect_score',
    title: 'العلامة الكاملة ١٠٠٪',
    description: 'أحرزت الدرجة النهائية الكاملة في اختبار رسمي.',
    icon: '⭐'
  }
];

export function getStoredStats(): StudentStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading stats:', e);
  }

  return {
    xp: 0,
    level: 1,
    totalAnswered: 0,
    totalCorrect: 0,
    streakDays: 1,
    completedWeeks: [],
    completedLessons: [],
    badges: INITIAL_BADGES
  };
}

export function saveStoredStats(stats: StudentStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Error saving stats:', e);
  }
}

export function addAnswerRecord(questionId: string, answer: string, isCorrect: boolean, skill?: string): StudentStats {
  const stats = getStoredStats();
  const allAnswers = getAllStoredAnswers();

  allAnswers[questionId] = {
    questionId,
    userAnswer: answer,
    isCorrect,
    timestamp: Date.now()
  };

  try {
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(allAnswers));
  } catch (e) {
    console.error('Error saving answers:', e);
  }

  // Update Stats & XP
  stats.totalAnswered += 1;
  if (isCorrect) {
    stats.totalCorrect += 1;
    stats.xp += 20; // 20 XP per correct answer
  } else {
    stats.xp += 5; // 5 XP for attempting
  }

  // Calculate Level (Level up every 100 XP)
  stats.level = Math.floor(stats.xp / 100) + 1;

  // Check Badges
  // 1. First step
  if (stats.totalAnswered >= 1 && !stats.badges.find(b => b.id === 'badge_first_step')?.unlockedAt) {
    unlockBadge(stats, 'badge_first_step');
  }

  // 2. Grammar Master
  const correctGrammarCount = Object.values(allAnswers).filter(a => a.isCorrect && a.questionId.startsWith('w') && (skill === 'grammar' || a.questionId.includes('q5') || a.questionId.includes('q6') || a.questionId.includes('q7'))).length;
  if (correctGrammarCount >= 5 && !stats.badges.find(b => b.id === 'badge_grammar_master')?.unlockedAt) {
    unlockBadge(stats, 'badge_grammar_master');
  }

  saveStoredStats(stats);
  return stats;
}

export function unlockBadge(stats: StudentStats, badgeId: string): void {
  const badge = stats.badges.find(b => b.id === badgeId);
  if (badge && !badge.unlockedAt) {
    badge.unlockedAt = Date.now();
    stats.xp += 50; // Bonus XP for unlocking badge
  }
}

export function getAllStoredAnswers(): Record<string, UserAnswerRecord> {
  try {
    const raw = localStorage.getItem(ANSWERS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading answers:', e);
  }
  return {};
}

export function getStoredExams(): ExamResult[] {
  try {
    const raw = localStorage.getItem(EXAMS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading exams:', e);
  }
  return [];
}

// Exams the student saved by name ("امتحاناتي"): the exact question set, so it can be re-solved later.
export interface SavedExam {
  id: string;
  title: string;
  createdAt: number;
  config: ExamConfig;
  questionIds: string[];
}

export function getSavedExams(): SavedExam[] {
  try {
    const raw = localStorage.getItem(SAVED_EXAMS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading saved exams:', e);
  }
  return [];
}

function writeSavedExams(exams: SavedExam[]): void {
  try {
    localStorage.setItem(SAVED_EXAMS_KEY, JSON.stringify(exams));
  } catch (e) {
    console.error('Error saving exams:', e);
  }
}

export function addSavedExam(exam: SavedExam): void {
  writeSavedExams([exam, ...getSavedExams()]);
}

export function deleteSavedExam(id: string): void {
  writeSavedExams(getSavedExams().filter(e => e.id !== id));
}

export function saveExamResult(result: ExamResult): void {
  const exams = getStoredExams();
  exams.unshift(result);
  try {
    localStorage.setItem(EXAMS_KEY, JSON.stringify(exams.slice(0, 30))); // Keep last 30
  } catch (e) {
    console.error('Error saving exam:', e);
  }

  // Reward XP
  const stats = getStoredStats();
  stats.xp += result.correctAnswers * 25;
  stats.level = Math.floor(stats.xp / 100) + 1;

  if (result.scorePercentage >= 85) {
    unlockBadge(stats, 'badge_exam_champion');
  }
  if (result.scorePercentage === 100) {
    unlockBadge(stats, 'badge_perfect_score');
  }

  saveStoredStats(stats);
}

export function getBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading bookmarks:', e);
  }
  return [];
}

export function toggleBookmark(questionId: string): boolean {
  const bookmarks = getBookmarks();
  const index = bookmarks.indexOf(questionId);
  let isBookmarked = false;

  if (index >= 0) {
    bookmarks.splice(index, 1);
    isBookmarked = false;
  } else {
    bookmarks.push(questionId);
    isBookmarked = true;
  }

  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch (e) {
    console.error('Error updating bookmarks:', e);
  }

  return isBookmarked;
}
