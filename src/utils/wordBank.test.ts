import test from 'node:test';
import assert from 'node:assert/strict';
import { getWordBankLessons, buildWordExam, parsePlural } from './wordBank';

test('word bank covers reading and literature lessons only, each with words', () => {
  const lessons = getWordBankLessons();
  assert.ok(lessons.length >= 13);
  assert.ok(lessons.every(l => l.words.length > 0));
  assert.ok(lessons.some(l => l.lessonName === 'أرض النخيل والواحات'));
  assert.ok(!lessons.some(l => l.lessonName === 'كتابة مقال وصفي'));
});

test('plural field is parsed into the asked form and answer', () => {
  assert.deepEqual(parsePlural('قَسِيمَة', 'جمع: قَسِيمَات'), { label: 'جمع', word: 'قَسِيمَة', answer: 'قَسِيمَات' });
  assert.deepEqual(parsePlural('حِمَاهَا', 'الحِمَى، جمع: أَحْمَاء'), { label: 'جمع', word: 'الحِمَى', answer: 'أَحْمَاء' });
  assert.deepEqual(parsePlural('سِيَّانِ', 'مفرد: سِيّ، جمع: أَسْوَاء'), { label: 'مفرد', word: 'سِيَّانِ', answer: 'سِيّ' });
  assert.equal(parsePlural('x', undefined), null);
});

test('exam uses only chosen lessons and kinds, 4 distinct options containing the answer', () => {
  const lesson = getWordBankLessons().find(l => l.id === 'info_ard_al_nakheel')!;
  const qs = buildWordExam([lesson.id], ['antonym', 'plural'], 100);
  assert.ok(qs.length > 0);
  for (const q of qs) {
    assert.equal(q.lessonName, lesson.lessonName);
    assert.ok(q.kind === 'antonym' || q.kind === 'plural');
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert.ok(q.options.includes(q.answer));
  }
  assert.equal(buildWordExam([lesson.id], ['meaning'], 3).length, 3);
});

test('word-only exam questions work with the exam generator and can be rebuilt by id', async () => {
  const { buildWordExamQuestions, getWordQuestionById, getWordBankLessonSummaries } = await import('./wordBank');
  const { gradeExam } = await import('./examGenerator');
  const ids = getWordBankLessonSummaries().slice(0, 3).map(l => l.id);
  const qs = buildWordExamQuestions(ids, 12);
  assert.equal(qs.length, 12);
  for (const q of qs) {
    assert.equal(q.type, 'mcq');
    assert.equal(q.options!.length, 4);
    const right = q.options!.find(o => o.id === q.correctAnswer)!;
    const again = getWordQuestionById(q.id)!;
    assert.equal(again.questionText, q.questionText);
    assert.equal(again.options!.find(o => o.id === again.correctAnswer)!.text, right.text);
    assert.deepEqual(again.options, q.options);
    assert.equal(again.correctAnswer, q.correctAnswer);
  }
  const answers = Object.fromEntries(qs.map((q, i) => [q.id, i % 2 ? String(q.correctAnswer) : 'zz']));
  const r = gradeExam({ title: 't', selectedLessonIds: ids, questionCount: 12, mode: 'formal', durationMinutes: 10, randomize: true }, qs, answers, 30);
  assert.equal(r.correctAnswers, 6);
});
