import React from 'react';
import { 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Calendar, 
  Layers, 
  Bookmark, 
  Printer, 
  Flame,
  Star,
  BookOpen
} from 'lucide-react';
import { StudentStats, UserAnswerRecord, SkillCategory } from '../types/curriculum';
import { getAllQuestions, getDistinctLessons } from '../data/questionBank';
import { getBookmarks } from '../utils/storage';

interface StudentProgressViewProps {
  stats: StudentStats;
  savedAnswers?: Record<string, UserAnswerRecord>;
  onNavigateToQuestion?: (qId: string) => void;
}

export const StudentProgressView: React.FC<StudentProgressViewProps> = ({
  stats,
  savedAnswers = {},
  onNavigateToQuestion
}) => {
  const allQuestions = getAllQuestions();
  const distinctLessons = getDistinctLessons();
  const bookmarks = getBookmarks();

  const totalBankQuestions = allQuestions.length;
  const answeredCount = Object.keys(savedAnswers).length;
  const correctCount = Object.values(savedAnswers).filter(a => a.isCorrect).length;
  const incorrectCount = answeredCount - correctCount;
  const overallAccuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const curriculumCoverage = Math.round((answeredCount / totalBankQuestions) * 100);

  // Skill calculations
  const skillStats: Record<SkillCategory, { total: number; answered: number; correct: number }> = {
    grammar: { total: 0, answered: 0, correct: 0 },
    reading: { total: 0, answered: 0, correct: 0 },
    literature: { total: 0, answered: 0, correct: 0 },
    spelling: { total: 0, answered: 0, correct: 0 },
    listening: { total: 0, answered: 0, correct: 0 },
    writing: { total: 0, answered: 0, correct: 0 },
  };

  allQuestions.forEach(q => {
    if (!skillStats[q.skill]) {
      skillStats[q.skill] = { total: 0, answered: 0, correct: 0 };
    }
    skillStats[q.skill].total += 1;
    if (savedAnswers[q.id]) {
      skillStats[q.skill].answered += 1;
      if (savedAnswers[q.id].isCorrect) {
        skillStats[q.skill].correct += 1;
      }
    }
  });

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-8">
      
      {/* Header and Print Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-blue-950 flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-blue-900" />
            <span>لوحة نتائجي وتقدمي الدراسي</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            متابعة إحصائية ذكية لتحصيل الطالب في مادة اللغة العربية - الصف الثاني الإعدادي
          </p>
        </div>

        <button
          onClick={handlePrintReport}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs md:text-sm shadow-2xs flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>طباعة تقرير التحصيل الدراسي</span>
        </button>
      </div>

      {/* Primary KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">نسبة إنجاز المنهج</span>
            <BookOpen className="w-4 h-4 text-blue-900" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-950 font-mono">{curriculumCoverage}٪</span>
            <span className="text-xs text-slate-400 font-semibold font-mono">
              ({answeredCount} من {totalBankQuestions})
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-blue-900 h-full rounded-full" style={{ width: `${curriculumCoverage}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">نسبة الدقة العامة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 font-mono">{overallAccuracy}٪</span>
            <span className="text-xs text-slate-400 font-semibold font-mono">
              ({correctCount} صواب)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${overallAccuracy}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">مستوى الطالب وXP</span>
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 font-mono">مستوى {stats.level}</span>
            <span className="text-xs text-slate-400 font-semibold font-mono">
              ({stats.xp} XP)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${stats.xp % 100}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">الأسئلة المحفوظة</span>
            <Bookmark className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-950 font-mono">{bookmarks.length}</span>
            <span className="text-xs text-slate-400 font-semibold">سؤال للمراجعة</span>
          </div>
          <span className="text-[11px] text-purple-600 block font-semibold mt-3">
            يمكنك العودة إليها في أي وقت
          </span>
        </div>

      </div>

      {/* Skill Performance Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs">
        <h3 className="text-lg font-black text-blue-950 mb-6 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-900" />
          <span>مستوى الإتقان بحسب فروع اللغة العربية (Skills Matrix):</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(skillStats).map(([skill, stat]) => {
            const skillAccuracy = stat.answered > 0 ? Math.round((stat.correct / stat.answered) * 100) : 0;
            const skillLabel = 
              skill === 'grammar' ? 'النحو العربي والإعراب' :
              skill === 'reading' ? 'القراءة والفهم القرائي' :
              skill === 'literature' ? 'النصوص الشعرية والبلاغة' :
              skill === 'spelling' ? 'القواعد الإملائية والرسم' :
              skill === 'listening' ? 'نصوص الاستماع' : 'التعبير وفنون الكتابة';

            return (
              <div key={skill} className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-extrabold text-sm text-slate-900">{skillLabel}</h4>
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                    skillAccuracy >= 80 ? 'bg-emerald-100 text-emerald-800' :
                    skillAccuracy >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {skillAccuracy}٪ إتقان
                  </span>
                </div>

                <div className="text-xs text-slate-500 font-semibold flex items-center justify-between mb-3">
                  <span>تم حل: {stat.answered} من {stat.total}</span>
                  <span>{stat.correct} صواب</span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      skillAccuracy >= 80 ? 'bg-emerald-500' :
                      skillAccuracy >= 50 ? 'bg-amber-500' : 'bg-blue-900'
                    }`}
                    style={{ width: `${skillAccuracy}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges Showcase Cabinet */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-blue-950 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>خزانة الأوسمة والشارات التقديرية</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              تُمنح الأوسمة تكريماً لجهود الطالب واجتهاده الدؤوب في حل التدريبات
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.badges.map((b) => {
            const isUnlocked = !!b.unlockedAt;
            return (
              <div 
                key={b.id}
                className={`p-4 rounded-2xl border flex items-start gap-4 transition-all ${
                  isUnlocked 
                    ? 'bg-amber-50/40 border-amber-300/80 shadow-2xs' 
                    : 'bg-slate-50 border-slate-200 opacity-50'
                }`}
              >
                <div className="text-3xl shrink-0 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  {b.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-extrabold text-sm text-slate-900">{b.title}</h5>
                    {isUnlocked && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        مكتسب ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                    {b.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
