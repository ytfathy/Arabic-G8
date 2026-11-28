import React, { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, ClipboardList, Play, RotateCcw, Search, XCircle } from 'lucide-react';
import { getWordBankLessons, buildWordExam, parsePlural, WordQuestion, WordQuestionKind } from '../utils/wordBank';

const KINDS: { id: WordQuestionKind; label: string }[] = [
  { id: 'meaning', label: 'المعنى' },
  { id: 'antonym', label: 'المضاد' },
  { id: 'plural', label: 'الجمع والمفرد' }
];

const chip = (active: boolean) =>
  `px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
    active ? 'bg-blue-950 text-white border-blue-950 shadow-2xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
  }`;

export const WordBankView: React.FC = () => {
  const lessons = useMemo(getWordBankLessons, []);
  const totalWords = lessons.reduce((n, l) => n + l.words.length, 0);
  const [tab, setTab] = useState<'study' | 'exam'>('study');

  // Study
  const [studyLessonId, setStudyLessonId] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Exam
  const [examLessonIds, setExamLessonIds] = useState<string[]>([]);
  const [kinds, setKinds] = useState<WordQuestionKind[]>(['meaning', 'antonym', 'plural']);
  const [count, setCount] = useState(10);
  const [questions, setQuestions] = useState<WordQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const shownLessons = lessons
    .filter(l => studyLessonId === 'all' || l.id === studyLessonId)
    .map(l => ({
      ...l,
      words: l.words.filter(w => !search.trim() || [w.word, w.meaning, w.antonym, w.pluralOrSingular].some(x => x?.includes(search.trim())))
    }))
    .filter(l => l.words.length > 0);

  const startExam = (qs: WordQuestion[]) => {
    if (qs.length === 0) return;
    setQuestions(qs);
    setAnswers({});
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const wrong = questions.filter(q => answers[q.id] !== q.answer);
  const score = questions.length - wrong.length;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-blue-950 flex items-center gap-2">📚 بنك الكلمات</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {totalWords} كلمة من {lessons.length} درساً في القراءة والنصوص: المعنى، والمضاد، والجمع والمفرد.
          </p>
        </div>
        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200">
          <button onClick={() => setTab('study')} className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer ${tab === 'study' ? 'bg-amber-500 text-blue-950 shadow-2xs' : 'text-slate-600'}`}>
            ذاكر لي الكلمات 💡
          </button>
          <button onClick={() => setTab('exam')} className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer ${tab === 'exam' ? 'bg-blue-950 text-white shadow-2xs' : 'text-slate-600'}`}>
            امتحان الكلمات 📝
          </button>
        </div>
      </div>

      {/* ================= STUDY ================= */}
      {tab === 'study' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setStudyLessonId('all')} className={chip(studyLessonId === 'all')}>كل الدروس</button>
            {lessons.map(l => (
              <button key={l.id} onClick={() => setStudyLessonId(l.id)} className={chip(studyLessonId === l.id)}>
                {l.lessonName} <span className="opacity-60 font-mono">({l.words.length})</span>
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 border border-slate-300 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-900">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث عن كلمة أو معنى أو مضاد أو جمع..."
              className="w-full outline-none text-sm font-bold bg-transparent"
            />
          </label>

          {shownLessons.length === 0 && <p className="text-center text-slate-400 py-10 font-bold">لا توجد كلمات مطابقة.</p>}

          {shownLessons.map(l => (
            <section key={l.id} className="space-y-2">
              <h3 className="font-extrabold text-blue-950 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <span>{l.lessonName}</span>
                <span className="text-xs text-slate-400 font-bold">({l.skillLabel} · الأسبوع {l.week})</span>
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-sm text-right min-w-[560px]">
                  <thead className="bg-blue-950 text-white">
                    <tr>
                      <th className="p-3 font-extrabold">الكلمة</th>
                      <th className="p-3 font-extrabold">المعنى</th>
                      <th className="p-3 font-extrabold">المضاد</th>
                      <th className="p-3 font-extrabold">الجمع أو المفرد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {l.words.map(w => {
                      const p = parsePlural(w.word, w.pluralOrSingular);
                      return (
                        <tr key={w.word} className="even:bg-slate-50/60">
                          <td className="p-3 font-black text-blue-950 text-base">{w.word}</td>
                          <td className="p-3 font-semibold text-slate-700">{w.meaning}</td>
                          <td className="p-3 font-bold text-rose-700">{w.antonym || <span className="text-slate-300">-</span>}</td>
                          <td className="p-3 font-bold text-blue-800">{p ? `${p.label} (${p.word}): ${p.answer}` : <span className="text-slate-300">-</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* ================= EXAM SETUP ================= */}
      {tab === 'exam' && questions.length === 0 && (
        <div className="space-y-5">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className="font-extrabold text-blue-950">١- اختر الدروس:</h3>
              <div className="flex gap-2">
                <button onClick={() => setExamLessonIds(lessons.map(l => l.id))} className="text-xs font-bold text-blue-900 underline cursor-pointer">تحديد الكل</button>
                <button onClick={() => setExamLessonIds([])} className="text-xs font-bold text-slate-500 underline cursor-pointer">إلغاء التحديد</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {lessons.map(l => {
                const on = examLessonIds.includes(l.id);
                return (
                  <button
                    key={l.id}
                    aria-pressed={on}
                    onClick={() => setExamLessonIds(ids => (on ? ids.filter(x => x !== l.id) : [...ids, l.id]))}
                    className={chip(on)}
                  >
                    {on ? '✓ ' : ''}{l.lessonName}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-extrabold text-blue-950 mb-2">٢- نوع الأسئلة:</h3>
            <div className="flex flex-wrap gap-2">
              {KINDS.map(k => {
                const on = kinds.includes(k.id);
                return (
                  <button
                    key={k.id}
                    aria-pressed={on}
                    onClick={() => setKinds(ks => (on ? ks.filter(x => x !== k.id) : [...ks, k.id]))}
                    className={chip(on)}
                  >
                    {on ? '✓ ' : ''}{k.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-extrabold text-blue-950 mb-2">٣- عدد الأسئلة:</h3>
            <div className="flex flex-wrap gap-2">
              {[5, 10, 15, 20, 30].map(n => (
                <button key={n} onClick={() => setCount(n)} className={chip(count === n)}>{n}</button>
              ))}
            </div>
          </div>

          <button
            disabled={examLessonIds.length === 0 || kinds.length === 0}
            onClick={() => startExam(buildWordExam(examLessonIds, kinds, count))}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-900 to-blue-950 text-white font-extrabold px-8 py-3 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>ابدأ امتحان الكلمات</span>
          </button>
          {examLessonIds.length === 0 && <p className="text-xs text-slate-500 font-bold">اختر درساً واحداً على الأقل.</p>}
        </div>
      )}

      {/* ================= EXAM TAKING / RESULTS ================= */}
      {tab === 'exam' && questions.length > 0 && (
        <div className="space-y-4">
          {submitted && (
            <div className="bg-gradient-to-br from-blue-900 to-blue-950 text-white rounded-2xl p-5 text-center space-y-3">
              <p className="text-sm text-blue-200 font-bold">نتيجتك في امتحان الكلمات</p>
              <p className="text-4xl font-black text-amber-300 font-mono">{score} / {questions.length}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button onClick={() => startExam(questions)} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 cursor-pointer">
                  <RotateCcw className="w-4 h-4" /> إعادة الامتحان
                </button>
                {wrong.length > 0 && wrong.length < questions.length && (
                  <button onClick={() => startExam(wrong)} className="bg-rose-500 hover:bg-rose-600 text-white font-black px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 cursor-pointer">
                    <XCircle className="w-4 h-4" /> إعادة حل الأخطاء فقط ({wrong.length})
                  </button>
                )}
                <button onClick={() => setQuestions([])} className="bg-white/15 hover:bg-white/25 text-white font-bold px-5 py-2.5 rounded-xl text-sm border border-white/20 cursor-pointer">
                  امتحان جديد
                </button>
              </div>
            </div>
          )}

          {questions.map((q, i) => {
            const picked = answers[q.id];
            return (
              <div key={q.id} className="border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-extrabold text-blue-950 text-base sm:text-lg">
                    <span className="text-amber-600 font-mono ml-2">{i + 1}.</span>{q.prompt}
                  </h4>
                  <span className="text-xs text-slate-400 font-bold shrink-0">{q.lessonName}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map(opt => {
                    const isPicked = picked === opt;
                    const state = !submitted
                      ? isPicked ? 'bg-blue-950 text-white border-blue-950' : 'bg-white border-slate-200 hover:bg-slate-50'
                      : opt === q.answer ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                      : isPicked ? 'bg-rose-50 border-rose-400 text-rose-800' : 'bg-white border-slate-200 opacity-60';
                    return (
                      <button
                        key={opt}
                        disabled={submitted}
                        onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                        className={`text-right p-3 rounded-xl border-2 text-sm font-bold transition-all cursor-pointer disabled:cursor-default ${state}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <p className={`text-sm font-bold flex items-center gap-1.5 ${picked === q.answer ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {picked === q.answer ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {picked === q.answer ? 'إجابة صحيحة' : `الإجابة الصحيحة: ${q.answer}`}
                  </p>
                )}
              </div>
            );
          })}

          {!submitted && (
            <button
              onClick={() => { setSubmitted(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <ClipboardList className="w-4 h-4" />
              <span>تسليم الامتحان ({Object.keys(answers).length} / {questions.length} مجاب)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
