import { Question, ExamConfig, ExamResult, SkillCategory } from '../types/curriculum';
import { getAllQuestions, getDistinctLessons } from '../data/questionBank';
import { evaluateStudentAnswer } from './arabicEvaluator';

export function filterQuestionsForExam(config: ExamConfig): Question[] {
  const allQuestions = getAllQuestions();
  const distinctLessons = getDistinctLessons();

  // Find lesson names matching selected IDs
  const targetLessonNames = new Set<string>();
  for (const lesson of distinctLessons) {
    if (config.selectedLessonIds.includes(lesson.id) || config.selectedLessonIds.includes(lesson.name)) {
      targetLessonNames.add(lesson.name);
    }
  }

  // Filter questions belonging ONLY to the selected lessons
  let pool = allQuestions.filter(q => targetLessonNames.has(q.lessonName));

  // If skill filter specified
  if (config.filterSkill && config.filterSkill !== 'all') {
    pool = pool.filter(q => q.skill === config.filterSkill);
  }

  // Randomize if requested
  if (config.randomize) {
    pool = [...pool].sort(() => Math.random() - 0.5);
  }

  // Restrict to requested question count (or max available)
  const finalCount = Math.min(config.questionCount, pool.length);
  return pool.slice(0, finalCount);
}

export function gradeExam(
  config: ExamConfig,
  questions: Question[],
  userAnswers: Record<string, string>,
  timeSpentSeconds: number
): ExamResult {
  let correctCount = 0;

  const skillBreakdown: Record<SkillCategory, { total: number; correct: number }> = {
    grammar: { total: 0, correct: 0 },
    reading: { total: 0, correct: 0 },
    literature: { total: 0, correct: 0 },
    spelling: { total: 0, correct: 0 },
    listening: { total: 0, correct: 0 },
    writing: { total: 0, correct: 0 }
  };

  const lessonBreakdown: Record<string, { total: number; correct: number }> = {};

  const questionResults = questions.map(q => {
    const userAnswer = userAnswers[q.id] || '';
    const evalRes = evaluateStudentAnswer(q, userAnswer);
    const isCorrect = evalRes.isCorrect;

    if (isCorrect) {
      correctCount += 1;
    }

    // Skill breakdown
    if (!skillBreakdown[q.skill]) {
      skillBreakdown[q.skill] = { total: 0, correct: 0 };
    }
    skillBreakdown[q.skill].total += 1;
    if (isCorrect) {
      skillBreakdown[q.skill].correct += 1;
    }

    // Lesson breakdown
    if (!lessonBreakdown[q.lessonName]) {
      lessonBreakdown[q.lessonName] = { total: 0, correct: 0 };
    }
    lessonBreakdown[q.lessonName].total += 1;
    if (isCorrect) {
      lessonBreakdown[q.lessonName].correct += 1;
    }

    return {
      questionId: q.id,
      userAnswer,
      isCorrect,
      lessonName: q.lessonName,
      skill: q.skill
    };
  });

  const total = questions.length;
  const scorePercentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return {
    id: 'exam_' + Date.now(),
    title: config.title || 'امتحان تقييمي ذكي',
    timestamp: Date.now(),
    config,
    totalQuestions: total,
    correctAnswers: correctCount,
    scorePercentage,
    timeSpentSeconds,
    userAnswers,
    questionResults,
    skillBreakdown,
    lessonBreakdown
  };
}

export function getRecommendedRevisionTopics(result: ExamResult): string[] {
  const recommendations: string[] = [];

  for (const [lesson, stat] of Object.entries(result.lessonBreakdown)) {
    if (stat.total > 0 && stat.correct / stat.total < 0.7) {
      recommendations.push(lesson);
    }
  }

  return recommendations;
}
