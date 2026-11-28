import { LESSON_INFOGRAPHICS } from '../data/lessonInfographics';
import { VocabularyItem } from '../types/infographics';
import { Question, LessonSummary, SkillCategory } from '../types/curriculum';

// Word bank ("بنك الكلمات"): every vocabulary word of the reading, literature and listening lessons.
export interface WordBankLesson {
  id: string;
  lessonName: string;
  skillLabel: string;
  skill: SkillCategory;
  unit: number;
  unitTitle: string;
  week: number;
  words: VocabularyItem[];
}

export type WordQuestionKind = 'meaning' | 'antonym' | 'plural';

export interface WordQuestion {
  id: string;
  kind: WordQuestionKind;
  lessonName: string;
  prompt: string;
  options: string[];
  answer: string;
}

export const getWordBankLessons = (): WordBankLesson[] =>
  LESSON_INFOGRAPHICS
    .filter(i => (i.skill === 'reading' || i.skill === 'literature' || i.skill === 'listening') && i.vocabularies?.length)
    .map(i => ({
      id: i.id, lessonName: i.lessonName, skillLabel: i.skillLabel, skill: i.skill,
      unit: i.unit, unitTitle: i.unitTitle, week: i.week, words: i.vocabularies!
    }))
    .sort((a, b) => a.week - b.week);

/** "جمع: قَسِيمَات" / "مفرد: جَبْهَة" / "الحِمَى، جمع: أَحْمَاء" → which form is asked, about which word, and the answer. */
export function parsePlural(word: string, field?: string): { label: 'جمع' | 'مفرد'; word: string; answer: string } | null {
  const m = (field || '').match(/^(?:([^:،]+)،\s*)?(جمع|مفرد):\s*([^،]+)/);
  if (!m) return null;
  return { label: m[2] as 'جمع' | 'مفرد', word: (m[1] || word).trim(), answer: m[3].trim() };
}

const shuffle = <T,>(list: T[], rand: () => number): T[] => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const answerOf = (v: VocabularyItem, kind: WordQuestionKind): string | undefined =>
  kind === 'meaning' ? v.meaning : kind === 'antonym' ? v.antonym : parsePlural(v.word, v.pluralOrSingular)?.answer;

const KINDS: WordQuestionKind[] = ['meaning', 'antonym', 'plural'];

// Options are drawn from a generator seeded by the question id, so a saved exam reopens with the same options
// and old answers (a/b/c/d) still point at the same choice.
const seeded = (key: string): (() => number) => {
  let h = 2166136261;
  for (const ch of key) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
};

function makeQuestion(all: WordBankLesson[], lesson: WordBankLesson, i: number, kind: WordQuestionKind): WordQuestion | null {
  const v = lesson.words[i];
  const answer = v && answerOf(v, kind);
  if (!answer) return null;
  const plural = kind === 'plural' ? parsePlural(v.word, v.pluralOrSingular)! : null;
  const prompt =
    kind === 'meaning' ? `ما معنى كلمة «${v.word}»؟`
    : kind === 'antonym' ? `ما مضاد كلمة «${v.word}»؟`
    : `ما ${plural!.label} كلمة «${plural!.word}»؟`;
  const others = Array.from(new Set(
    all.flatMap(l => l.words).map(w => answerOf(w, kind)).filter((x): x is string => !!x && x !== answer)
  ));
  const id = `${lesson.id}_${i}_${kind}`;
  const rand = seeded(id);
  return {
    id,
    kind,
    lessonName: lesson.lessonName,
    prompt,
    answer,
    options: shuffle([answer, ...shuffle(others, rand).slice(0, 3)], rand)
  };
}

/** All possible questions for the chosen lessons; wrong options come from other words in the whole bank. */
export function buildWordExam(
  lessonIds: string[],
  kinds: WordQuestionKind[],
  count: number,
  rand: () => number = Math.random
): WordQuestion[] {
  const all = getWordBankLessons();
  const pool: WordQuestion[] = [];
  for (const lesson of all.filter(l => lessonIds.includes(l.id))) {
    lesson.words.forEach((_, i) => {
      for (const kind of kinds) {
        const q = makeQuestion(all, lesson, i, kind);
        if (q) pool.push(q);
      }
    });
  }
  return shuffle(pool, rand).slice(0, count);
}

// ---------- word bank inside the exam generator (منشئ الاختبارات) ----------

/** Word bank lessons in the exam generator's lesson format; questionCount = possible word questions. */
export const getWordBankLessonSummaries = (): LessonSummary[] =>
  getWordBankLessons().map(l => ({
    id: l.id, name: l.lessonName, skill: l.skill, skillLabel: l.skillLabel, unit: l.unit, unitTitle: l.unitTitle, week: l.week,
    questionCount: l.words.reduce((n, v) => n + KINDS.filter(k => answerOf(v, k)).length, 0)
  }));

function toExamQuestion(w: WordQuestion, lesson: WordBankLesson): Question {
  const letters = ['a', 'b', 'c', 'd'];
  return {
    id: w.id,
    unit: lesson.unit,
    unitTitle: lesson.unitTitle,
    week: lesson.week,
    section: 'بنك الكلمات',
    skill: lesson.skill,
    skillLabel: lesson.skillLabel,
    lessonName: lesson.lessonName,
    questionText: w.prompt,
    type: 'mcq',
    options: w.options.map((text, i) => ({ id: letters[i], text })),
    correctAnswer: letters[w.options.indexOf(w.answer)],
    explanation: `الإجابة الصحيحة: ${w.answer}`,
    difficulty: 'easy',
    tags: ['بنك الكلمات']
  };
}

const lessonOf = (all: WordBankLesson[], w: WordQuestion) => all.find(l => w.id.startsWith(l.id + '_'))!;

/** Word-only exam questions (all kinds) for the chosen lessons, ready for QuestionCard and gradeExam. */
export function buildWordExamQuestions(lessonIds: string[], count: number, rand: () => number = Math.random): Question[] {
  const all = getWordBankLessons();
  return buildWordExam(lessonIds, KINDS, count, rand).map(w => toExamQuestion(w, lessonOf(all, w)));
}

/** Rebuilds a saved word question from its id (same word, answer and options). */
export function getWordQuestionById(id: string): Question | undefined {
  const m = id.match(/^(.+)_(\d+)_(meaning|antonym|plural)$/);
  if (!m) return undefined;
  const all = getWordBankLessons();
  const lesson = all.find(l => l.id === m[1]);
  const w = lesson && makeQuestion(all, lesson, Number(m[2]), m[3] as WordQuestionKind);
  return w ? toExamQuestion(w, lesson!) : undefined;
}
