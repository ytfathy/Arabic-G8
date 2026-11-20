import test from 'node:test';
import assert from 'node:assert/strict';
import { filterQuestionsForExam, gradeExam, getRecommendedRevisionTopics } from './examGenerator';
import { getDistinctLessons, getAllQuestions } from '../data/questionBank';
import { ExamConfig, Question } from '../types/curriculum';

test('exam generator selects only from selected lessons', () => {
  const lessons = getDistinctLessons();
  assert.ok(lessons.length > 0, 'Lessons should exist');

  const selectedLesson = lessons[0];
  const config: ExamConfig = {
    title: 'اختبار تجريبي في ' + selectedLesson.name,
    selectedLessonIds: [selectedLesson.id],
    questionCount: 3,
    mode: 'practice',
    durationMinutes: 10,
    randomize: false
  };

  const questions = filterQuestionsForExam(config);
  assert.ok(questions.length > 0, 'Questions should be found');
  assert.ok(questions.length <= config.questionCount, 'Should not exceed requested count');

  for (const q of questions) {
    assert.equal(q.lessonName, selectedLesson.name, 'Question must match selected lesson');
  }
});

test('exam generator handles empty selection gracefully', () => {
  const config: ExamConfig = {
    title: 'اختبار فارغ',
    selectedLessonIds: [],
    questionCount: 5,
    mode: 'formal',
    durationMinutes: 15,
    randomize: true
  };

  const questions = filterQuestionsForExam(config);
  assert.equal(questions.length, 0, 'Should return empty array when no lessons selected');
});

test('grading calculates exact score and breakdown', () => {
  const allQuestions = getAllQuestions();
  assert.ok(allQuestions.length >= 2, 'Need at least 2 questions');

  const sampleQuestions: Question[] = [
    allQuestions[0],
    allQuestions[1]
  ];

  const userAnswers: Record<string, string> = {
    [sampleQuestions[0].id]: Array.isArray(sampleQuestions[0].correctAnswer) 
      ? sampleQuestions[0].correctAnswer[0] 
      : sampleQuestions[0].correctAnswer,
    [sampleQuestions[1].id]: 'wrong_answer_test'
  };

  const config: ExamConfig = {
    title: 'امتحان تجربة الدرجات',
    selectedLessonIds: [sampleQuestions[0].lessonName],
    questionCount: 2,
    mode: 'practice',
    durationMinutes: 10,
    randomize: false
  };

  const result = gradeExam(config, sampleQuestions, userAnswers, 45);

  assert.equal(result.totalQuestions, 2);
  assert.equal(result.correctAnswers, 1);
  assert.equal(result.scorePercentage, 50);
  assert.equal(result.timeSpentSeconds, 45);

  const revisions = getRecommendedRevisionTopics(result);
  assert.ok(Array.isArray(revisions), 'Revisions should be an array');
});
