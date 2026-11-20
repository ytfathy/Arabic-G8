import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  BookOpen, 
  Layers, 
  Sparkles, 
  HelpCircle,
  Eye,
  Filter,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Question, ExamMode, SkillCategory } from '../types/curriculum';
import { getQuestionsByWeek, getAllQuestions } from '../data/questionBank';
import { QuestionCard } from './QuestionCard';
import { toggleBookmark, getBookmarks } from '../utils/storage';

interface WeeklyAssessmentsViewProps {
  onQuestionAnswered?: (qId: string, ans: string, correct: boolean, skill: string) => void;
  savedAnswers?: Record<string, { userAnswer: string; isCorrect: boolean }>;
}

export const WeeklyAssessmentsView: React.FC<WeeklyAssessmentsViewProps> = ({
  onQuestionAnswered,
  savedAnswers = {}
}) => {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');
  const [mode, setMode] = useState<ExamMode>('practice');
  const [bookmarks, setBookmarks] = useState<string[]>(getBookmarks());

  const weekQuestions = getQuestionsByWeek(selectedWeek);

  // Available sections within this week
  const sections = Array.from(new Set(weekQuestions.map(q => q.section)));

  const filteredQuestions = selectedSectionFilter === 'all'
    ? weekQuestions
    : weekQuestions.filter(q => q.section === selectedSectionFilter);

  const handleBookmarkToggle = (qId: string) => {
    toggleBookmark(qId);
    setBookmarks(getBookmarks());
  };

  const weekList = [
    { num: 1, title: 'الأسبوع ١', subtitle: 'آمنة دهشان ومراجعة النحو', unit: 'الوحدة الأولى' },
    { num: 2, title: 'الأسبوع ٢', subtitle: 'العبور إلى المستقبل والمعرب والمبني', unit: 'الوحدة الأولى' },
    { num: 3, title: 'الأسبوع ٣', subtitle: 'الألف اللينة ووصف مكان ومحمد مبروك', unit: 'الوحدة الأولى' },
    { num: 4, title: 'الأسبوع ٤', subtitle: 'المعرب والمبني من الأفعال ومحمد مبروك', unit: 'الوحدة الأولى' },
    { num: 5, title: 'الأسبوع ٥', subtitle: 'مصر التي في خاطري ومراجعة الوحدة الأولى', unit: 'الوحدة الأولى' },
    { num: 6, title: 'الأسبوع ٦', subtitle: 'أقدم وديعة ومن أجل غد', unit: 'الوحدة الثانية' },
    { num: 7, title: 'الأسبوع ٧', subtitle: 'الضمائر البارزة والمستترة والألف اللينة', unit: 'الوحدة الثانية' },
    { num: 8, title: 'الأسبوع ٨', subtitle: 'الخطبة الإقناعية ومدينة الخارجة', unit: 'الوحدة الثانية' },
    { num: 9, title: 'الأسبوع ٩', subtitle: 'أسلوب الشرط: أدوات الشرط الجازمة', unit: 'الوحدة الثانية' },
    { num: 10, title: 'الأسبوع ١٠', subtitle: 'شعر ريفنا المصري ومراجعة الوحدة الثانية', unit: 'الوحدة الثانية' },
    { num: 11, title: 'الأسبوع ١١', subtitle: 'إنسان أم ظل إنسان؟ والخوارزمي', unit: 'الوحدة الثالثة' },
    { num: 12, title: 'الأسبوع ١٢', subtitle: 'أدوات الشرط غير الجازمة والتاء والهاء', unit: 'الوحدة الثالثة' },
    { num: 13, title: 'الأسبوع ١٣', subtitle: 'القراءة حياة ومقال وصف مكان', unit: 'الوحدة الثالثة' },
    { num: 14, title: 'الأسبوع ١٤', subtitle: 'شعر الكد سبيل المعالي والمراجعة النهائية', unit: 'الوحدة الثالثة' },
    { num: 15, title: 'الامتحان النهائي', subtitle: 'النموذج الوزاري الاسترشادي الشامل للفصل الأول', unit: 'نهاية الفصل الدراسي' },
  ];

  const currentWeekMeta = weekList.find(w => w.num === selectedWeek) || weekList[0];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-8">
      
      {/* View Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-amber-600 tracking-wide uppercase">النمط الأول (Mode A)</span>
          <h1 className="text-2xl md:text-3xl font-black text-blue-950 flex items-center gap-3 mt-1">
            <Calendar className="w-7 h-7 text-blue-900" />
            <span>التقييمات الأسبوعية الرسمية</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            استعراض وحل أسئلة كتاب التقييمات والأداءات طبقاً للتوزيع الزمني للأسابيع المدرسية
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
          <button
            onClick={() => setMode('practice')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'practice'
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            نمط التدريب الذاتي
          </button>
          <button
            onClick={() => setMode('revision')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'revision'
                ? 'bg-amber-500 text-slate-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            دليل الحلول والشروحات
          </button>
        </div>
      </div>

      {/* Week Selector Carousel Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {weekList.map((w) => {
            const isSelected = selectedWeek === w.num;
            return (
              <button
                key={w.num}
                onClick={() => {
                  setSelectedWeek(w.num);
                  setSelectedSectionFilter('all');
                }}
                className={`p-3 rounded-xl border text-right shrink-0 min-w-[150px] transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-900 text-white border-blue-900 shadow-xs' 
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={isSelected ? 'text-amber-300 font-bold' : 'text-slate-500 font-medium'}>
                    {w.unit}
                  </span>
                  <span className={`font-mono font-bold ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                    W{w.num}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm sm:text-base truncate">{w.title}</h4>
                <p className={`text-xs truncate mt-1 ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                  {w.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Week Active Banner */}
      <div className="bg-gradient-to-r from-blue-950 to-blue-900 text-white p-4 sm:p-6 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
            <span>{currentWeekMeta.unit}</span>
            <span aria-hidden="true">·</span>
            <span>{currentWeekMeta.title}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black">{currentWeekMeta.subtitle}</h2>
          <span className="text-xs text-blue-200 mt-1 block font-medium">
            يتضمن: الأداءات الصفية، الأداءات المنزلية، والتقييم الأسبوعي (المجموعات أ، ب، ج)
          </span>
        </div>

        {/* Section Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedSectionFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              selectedSectionFilter === 'all'
                ? 'bg-amber-400 text-slate-950 font-black'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            كافة أقسام الأسبوع ({weekQuestions.length})
          </button>
          {sections.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSectionFilter(sec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedSectionFilter === sec
                  ? 'bg-amber-400 text-slate-950 font-black'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Questions Feed */}
      <div className="space-y-6">
        {filteredQuestions.map((q, idx) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={idx}
            totalCount={filteredQuestions.length}
            mode={mode}
            userSavedAnswer={savedAnswers[q.id]?.userAnswer}
            onAnswerSubmit={(ans, isCorr) => onQuestionAnswered?.(q.id, ans, isCorr, q.skill)}
            isBookmarked={bookmarks.includes(q.id)}
            onToggleBookmark={() => handleBookmarkToggle(q.id)}
            showPassageByDefault={true}
          />
        ))}

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <h4 className="font-bold text-base text-slate-700">لا توجد أسئلة مسجلة في هذا القسم المختار</h4>
          </div>
        )}
      </div>

      {/* Navigation between weeks */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={() => setSelectedWeek(prev => Math.max(1, prev - 1))}
          disabled={selectedWeek === 1}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الأسبوع السابق</span>
        </button>

        <span className="text-xs font-bold text-slate-500">
          الأسبوع {selectedWeek} من {weekList.length}
        </span>

        <button
          onClick={() => setSelectedWeek(prev => Math.min(weekList.length, prev + 1))}
          disabled={selectedWeek === weekList.length}
          className="flex items-center gap-2 bg-blue-900 hover:bg-blue-950 disabled:opacity-40 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-xs cursor-pointer"
        >
          <span>الأسبوع القادم</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
