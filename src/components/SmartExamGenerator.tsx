import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckSquare, 
  Square, 
  Play, 
  RotateCcw, 
  Clock, 
  Award, 
  TrendingUp, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Search,
  Filter,
  History,
  BookOpen,
  HelpCircle,
  BarChart3,
  Calendar,
  Layers,
  Flag
} from 'lucide-react';
import { 
  Question, 
  ExamConfig, 
  ExamResult, 
  SkillCategory, 
  LessonSummary,
  ExamMode 
} from '../types/curriculum';
import { getDistinctLessons, getAllQuestions } from '../data/questionBank';
import { filterQuestionsForExam, gradeExam, getRecommendedRevisionTopics } from '../utils/examGenerator';
import { saveExamResult, getStoredExams } from '../utils/storage';
import { QuestionCard } from './QuestionCard';
import { mascotService } from '../utils/mascotService';

interface SmartExamGeneratorProps {
  onBackToHome?: () => void;
  onStatsUpdated?: () => void;
}

type GeneratorStep = 'dashboard' | 'preview' | 'taking' | 'results' | 'history';

export const SmartExamGenerator: React.FC<SmartExamGeneratorProps> = ({
  onBackToHome,
  onStatsUpdated
}) => {
  const [step, setStep] = useState<GeneratorStep>('dashboard');
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSkillFilter, setActiveSkillFilter] = useState<SkillCategory | 'all'>('all');

  // Exam Configuration State
  const [examTitle, setExamTitle] = useState('امتحان لغتي التقييمي الذكي');
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [examMode, setExamMode] = useState<ExamMode>('formal');
  const [durationMinutes, setDurationMinutes] = useState<number>(20);
  const [randomizeOrder, setRandomizeOrder] = useState<boolean>(true);

  // Active Exam State
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<Set<string>>(new Set());
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);
  const [examStartTime, setExamStartTime] = useState<number>(0);

  // Results & History
  const [currentResult, setCurrentResult] = useState<ExamResult | null>(null);
  const [examHistory, setExamHistory] = useState<ExamResult[]>([]);

  useEffect(() => {
    const list = getDistinctLessons();
    setLessons(list);
    // Pre-select first 3 lessons by default for convenience
    if (list.length > 0 && selectedLessonIds.length === 0) {
      setSelectedLessonIds(list.slice(0, 3).map(l => l.id));
    }
    setExamHistory(getStoredExams());
  }, []);

  // Timer Effect for Formal Exam
  useEffect(() => {
    if (step !== 'taking' || examMode !== 'formal') return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, examMode]);

  // Lessons selection helpers
  const handleToggleLesson = (lessonId: string) => {
    setSelectedLessonIds(prev => 
      prev.includes(lessonId) 
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const handleSelectAll = () => {
    setSelectedLessonIds(lessons.map(l => l.id));
  };

  const handleClearSelection = () => {
    setSelectedLessonIds([]);
  };

  const handleSelectSkillLessons = (skill: SkillCategory) => {
    const skillLessons = lessons.filter(l => l.skill === skill).map(l => l.id);
    setSelectedLessonIds(prev => Array.from(new Set([...prev, ...skillLessons])));
  };

  // Available questions in selected lessons
  const totalAvailableQuestions = lessons
    .filter(l => selectedLessonIds.includes(l.id))
    .reduce((sum, l) => sum + l.questionCount, 0);

  // Prepare and Preview
  const handleProceedToPreview = () => {
    if (selectedLessonIds.length === 0) return;
    setStep('preview');
  };

  const handleStartExam = () => {
    const config: ExamConfig = {
      title: examTitle || 'امتحان تقييمي ذكي',
      selectedLessonIds,
      questionCount: Math.min(questionCount, totalAvailableQuestions),
      mode: examMode,
      durationMinutes,
      randomize: randomizeOrder
    };

    const questions = filterQuestionsForExam(config);
    if (questions.length === 0) return;

    setActiveQuestions(questions);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setFlaggedQuestionIds(new Set());
    setTimeRemainingSeconds(durationMinutes * 60);
    setExamStartTime(Date.now());
    setStep('taking');
  };

  const handleRecordAnswer = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleToggleFlag = (questionId: string) => {
    setFlaggedQuestionIds(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const handleFinishExam = () => {
    const timeSpent = Math.max(1, Math.round((Date.now() - examStartTime) / 1000));
    const config: ExamConfig = {
      title: examTitle,
      selectedLessonIds,
      questionCount: activeQuestions.length,
      mode: examMode,
      durationMinutes,
      randomize: randomizeOrder
    };

    const result = gradeExam(config, activeQuestions, userAnswers, timeSpent);
    saveExamResult(result);
    setCurrentResult(result);
    setExamHistory(getStoredExams());
    onStatsUpdated?.();

    if (result.scorePercentage >= 85) {
      mascotService.notifyCorrect(`هذا رائع! 🎉 أحرزت ${result.scorePercentage}٪ في الامتحان! أحسنت صنعاً يا بطل!`);
    } else if (result.scorePercentage >= 50) {
      mascotService.notifyTip(`أحسنت! حققت ${result.scorePercentage}٪، راجع الأسئلة التي تحتاج تدقيقاً وستصل للعلامة الكاملة 💪`);
    } else {
      mascotService.notifyWrong(`حاول مرة أخرى! راجع ملخصات «ذاكر لي» ثم أعد المحاولة، أنت قادر على التفوق 💪`);
    }

    setStep('results');
  };

  const handleRetakeExam = () => {
    if (!currentResult) return;
    handleStartExam();
  };

  // Filtered lessons for selection
  const filteredLessons = lessons.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        l.unitTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSkill = activeSkillFilter === 'all' || l.skill === activeSkillFilter;
    return matchSearch && matchSkill;
  });

  const skillTabs: { id: SkillCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'كافة المهارات' },
    { id: 'grammar', label: 'النحو' },
    { id: 'reading', label: 'القراءة' },
    { id: 'literature', label: 'النصوص' },
    { id: 'spelling', label: 'الإملاء' },
    { id: 'listening', label: 'الاستماع' },
    { id: 'writing', label: 'التعبير' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-5 sm:py-8">
      
      {/* View Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-blue-950 flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-amber-500 fill-amber-500" />
            <span>منشئ الامتحانات الذكي</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            صمم اختبارك المخصص واختبر إتقانك بدقة من أسئلة كتاب التقييمات والأداءات الرسمية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStep('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
              step === 'dashboard' || step === 'preview'
                ? 'bg-blue-900 text-white shadow-xs' 
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            إنشاء امتحان جديد
          </button>
          
          <button
            onClick={() => {
              setExamHistory(getStoredExams());
              setStep('history');
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
              step === 'history'
                ? 'bg-blue-900 text-white shadow-xs' 
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4 text-amber-500" />
            <span>سجل الاختبارات ({examHistory.length})</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* STEP 1: DASHBOARD - SELECTION & CUSTOMIZATION */}
      {/* ======================================================== */}
      {step === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column: Lesson Selection */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-lg font-extrabold text-blue-950">
                    أولاً: تحديد الدروس المستهدفة في الامتحان
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    اختر درساً واحداً أو عدة دروس من مهارات مختلفة
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-xs font-bold text-blue-900 hover:text-blue-950 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200/60"
                  >
                    تحديد الكل
                  </button>
                  <button
                    onClick={handleClearSelection}
                    className="text-xs font-bold text-slate-600 hover:text-rose-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200"
                  >
                    إلغاء التحديد
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث باسم الدرس أو الوحدة..."
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                  />
                </div>

                {/* Skill Quick Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {skillTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSkillFilter(tab.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        activeSkillFilter === tab.id
                          ? 'bg-amber-500 text-slate-950 shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lessons Grid Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                {filteredLessons.map((lesson) => {
                  const isSelected = selectedLessonIds.includes(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => handleToggleLesson(lesson.id)}
                      className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer flex items-start gap-3 select-none ${
                        isSelected 
                          ? 'bg-blue-50/70 border-blue-400 shadow-2xs' 
                          : 'bg-slate-50/40 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="mt-0.5 text-blue-900 shrink-0">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-blue-900" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                            {lesson.skillLabel}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {lesson.questionCount} أسئلة
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 truncate">
                          {lesson.name}
                        </h4>
                        <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                          {lesson.unitTitle} · الأسبوع {lesson.week}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredLessons.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-sm">لم يتم العثور على دروس تطابق البحث</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Column: Exam Customization */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs sticky top-24">
              <h3 className="text-lg font-extrabold text-blue-950 mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                <span>ثانياً: إعدادات الامتحان</span>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  {selectedLessonIds.length} دروس مختارة
                </span>
              </h3>

              {/* Exam Title */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان الاختبار:</label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 font-semibold"
                />
              </div>

              {/* Exam Mode Selector */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">نمط الاختبار:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setExamMode('formal')}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      examMode === 'formal'
                        ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    رسمي ومؤقت
                  </button>
                  <button
                    type="button"
                    onClick={() => setExamMode('practice')}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      examMode === 'practice'
                        ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    تدريب وتصحيح
                  </button>
                  <button
                    type="button"
                    onClick={() => setExamMode('revision')}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      examMode === 'revision'
                        ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    مراجعة بالحل
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  {examMode === 'formal' && 'لا تظهر الإجابات إلا بعد تسليم الامتحان بالكامل مع عداد الوقت.'}
                  {examMode === 'practice' && 'تصحيح فوري وتغذية راجعة بعد كل إجابة مباشرة.'}
                  {examMode === 'revision' && 'عرض الأسئلة مصحوبة بالإجابات النموذجية والشروح.'}
                </p>
              </div>

              {/* Number of Questions */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">عدد الأسئلة:</label>
                  <span className="text-xs font-extrabold text-blue-900 font-mono">
                    {questionCount} سؤال
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max={Math.max(3, totalAvailableQuestions)}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full accent-blue-900 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-semibold mt-1">
                  <span>٣ أسئلة</span>
                  <span>المتاح: {totalAvailableQuestions} سؤال</span>
                </div>
              </div>

              {/* Duration Minutes */}
              {examMode === 'formal' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">مدة الامتحان:</label>
                    <span className="text-xs font-extrabold text-blue-900 font-mono">
                      {durationMinutes} دقيقة
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Randomize Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 mb-6">
                <span className="text-xs font-bold text-slate-700">ترتيب عشوائي للأسئلة</span>
                <input
                  type="checkbox"
                  checked={randomizeOrder}
                  onChange={(e) => setRandomizeOrder(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-900 accent-blue-900 cursor-pointer"
                />
              </div>

              {/* Primary Action Button */}
              <button
                onClick={handleProceedToPreview}
                disabled={selectedLessonIds.length === 0}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-slate-200 disabled:to-slate-200 text-slate-950 font-black py-3 rounded-xl text-sm transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>معاينة وتأكيد الامتحان</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>

              {selectedLessonIds.length === 0 && (
                <p className="text-xs text-rose-600 text-center font-bold mt-2">
                  يرجى تحديد درس واحد على الأقل للمتابعة
                </p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 2: EXAM PREVIEW (E) */}
      {/* ======================================================== */}
      {step === 'preview' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-blue-950">{examTitle}</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">معاينة بطاقة الامتحان قبل البدء</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-semibold">عدد الدروس المختارة:</span>
              <span className="font-bold text-slate-900">{selectedLessonIds.length} دروس</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-semibold">إجمالي أسئلة الامتحان:</span>
              <span className="font-extrabold text-blue-950 font-mono">{Math.min(questionCount, totalAvailableQuestions)} سؤال</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-semibold">زمن الامتحان المقدر:</span>
              <span className="font-bold text-slate-900">{durationMinutes} دقيقة</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-semibold">نمط الامتحان:</span>
              <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/60">
                {examMode === 'formal' ? 'رسمي (نتائج بعد التسليم)' : examMode === 'practice' ? 'تدريبي (تصحيح فوري)' : 'مراجعة بالحلول'}
              </span>
            </div>
          </div>

          {/* Selected Lessons Badges */}
          <div className="mb-8">
            <h4 className="text-xs font-bold text-slate-600 mb-2">قائمة الدروس المضمنة في هذا الاختبار:</h4>
            <div className="flex flex-wrap gap-2">
              {lessons.filter(l => selectedLessonIds.includes(l.id)).map(l => (
                <span key={l.id} className="text-xs font-semibold bg-blue-50 text-blue-950 border border-blue-200 px-3 py-1 rounded-lg">
                  {l.name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep('dashboard')}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer"
            >
              تعديل الاختيارات
            </button>
            <button
              onClick={handleStartExam}
              className="flex-2 bg-gradient-to-r from-blue-900 to-blue-950 hover:from-blue-950 hover:to-slate-900 text-white font-extrabold py-3 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>بدء الاختبار الآن</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 3: EXAM TAKING INTERFACE (E) */}
      {/* ======================================================== */}
      {step === 'taking' && activeQuestions.length > 0 && (
        <div className="space-y-6">
          
          {/* Top Bar with Timer and Progress */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 sticky top-24 z-30">
            <div className="flex items-center gap-4">
              <span className="font-extrabold text-sm md:text-base text-blue-950">
                السؤال {currentQuestionIdx + 1} من {activeQuestions.length}
              </span>
              <div className="w-32 md:w-48 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-900 h-full rounded-full transition-all"
                  style={{ width: `${((currentQuestionIdx + 1) / activeQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Timer if formal */}
            {examMode === 'formal' && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm ${
                timeRemainingSeconds < 180 
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse' 
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                <Clock className="w-4 h-4" />
                <span>
                  {Math.floor(timeRemainingSeconds / 60)}:{String(timeRemainingSeconds % 60).padStart(2, '0')}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleFlag(activeQuestions[currentQuestionIdx].id)}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  flaggedQuestionIds.has(activeQuestions[currentQuestionIdx].id)
                    ? 'bg-amber-100 border-amber-300 text-amber-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Flag className="w-4 h-4" />
                <span className="hidden sm:inline">تمييز للمراجعة</span>
              </button>

              <button
                onClick={handleFinishExam}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2 rounded-xl text-xs md:text-sm shadow-xs transition-colors cursor-pointer"
              >
                تسليم الامتحان
              </button>
            </div>
          </div>

          {/* Question Navigator Numbers Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-1.5 overflow-x-auto">
            {activeQuestions.map((q, idx) => {
              const isAnswered = !!userAnswers[q.id];
              const isFlagged = flaggedQuestionIds.has(q.id);
              const isCurrent = currentQuestionIdx === idx;

              let style = 'bg-slate-100 text-slate-700 border-slate-200';
              if (isCurrent) {
                style = 'bg-blue-900 text-white border-blue-900 ring-2 ring-blue-300';
              } else if (isFlagged) {
                style = 'bg-amber-100 text-amber-900 border-amber-400';
              } else if (isAnswered) {
                style = 'bg-emerald-100 text-emerald-900 border-emerald-300';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIdx(idx)}
                  className={`w-9 h-9 rounded-lg font-bold text-xs shrink-0 border transition-all cursor-pointer flex items-center justify-center relative ${style}`}
                >
                  {idx + 1}
                  {isFlagged && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 absolute -top-1 -right-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Current Question Display */}
          <QuestionCard
            key={activeQuestions[currentQuestionIdx].id}
            question={activeQuestions[currentQuestionIdx]}
            index={currentQuestionIdx}
            totalCount={activeQuestions.length}
            mode={examMode}
            userSavedAnswer={userAnswers[activeQuestions[currentQuestionIdx].id]}
            onAnswerSubmit={(ans) => handleRecordAnswer(activeQuestions[currentQuestionIdx].id, ans)}
            showPassageByDefault={true}
          />

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIdx === 0}
              className="bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-bold px-6 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
            >
              السابق
            </button>

            {currentQuestionIdx < activeQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx(prev => Math.min(activeQuestions.length - 1, prev + 1))}
                className="bg-blue-900 hover:bg-blue-950 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-xs cursor-pointer"
              >
                التالي
              </button>
            ) : (
              <button
                onClick={handleFinishExam}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-2.5 rounded-xl text-sm transition-colors shadow-xs cursor-pointer"
              >
                إنهاء وتسليم
              </button>
            )}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 4: RESULTS & ANALYTICS (F) */}
      {/* ======================================================== */}
      {step === 'results' && currentResult && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Hero Result Card */}
          <div className="bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 rounded-3xl p-8 text-white text-center shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-amber-400 text-xs font-black bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30">
                نتيجة التقييم المعتمد
              </span>
              <h2 className="text-3xl md:text-4xl font-black mt-3 mb-2">{currentResult.title}</h2>
              <p className="text-blue-200 text-sm font-medium">تم التحقق من الإجابات وفق المعايير الوزارية لكتاب الأداءات</p>

              <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[130px]">
                  <span className="text-xs text-blue-200 font-semibold block">النسبة المئوية</span>
                  <span className="text-3xl font-black text-amber-300 font-mono">{currentResult.scorePercentage}٪</span>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[130px]">
                  <span className="text-xs text-blue-200 font-semibold block">الدرجة النهائية</span>
                  <span className="text-3xl font-black text-white font-mono">
                    {currentResult.correctAnswers} / {currentResult.totalQuestions}
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[130px]">
                  <span className="text-xs text-blue-200 font-semibold block">الزمن المستغرق</span>
                  <span className="text-3xl font-black text-blue-200 font-mono">
                    {Math.floor(currentResult.timeSpentSeconds / 60)} د {currentResult.timeSpentSeconds % 60} ث
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                <button
                  onClick={handleRetakeExam}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 py-2.5 rounded-xl text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>إعادة الامتحان</span>
                </button>
                <button
                  onClick={() => setStep('dashboard')}
                  className="bg-white/15 hover:bg-white/25 text-white font-bold px-6 py-2.5 rounded-xl text-sm border border-white/20 transition-all cursor-pointer"
                >
                  إنشاء امتحان جديد
                </button>
              </div>
            </div>
          </div>

          {/* Recommendations for Revision */}
          {getRecommendedRevisionTopics(currentResult).length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-base mb-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span>موضوعات يُوصى بمراجعتها لرفع مستوى الإتقان:</span>
              </div>
              <p className="text-xs text-amber-800 font-medium mb-4">
                بناءً على تحليلك في هذا الاختبار، ننصح بإعادة قراءة وشرح الدروس التالية من كتاب الطالب:
              </p>
              <div className="flex flex-wrap gap-2">
                {getRecommendedRevisionTopics(currentResult).map((topic, i) => (
                  <span key={i} className="bg-white text-slate-900 border border-amber-300/80 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs">
                    📖 درس: {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Performance Breakdown by Skill & Lesson */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Skill Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="font-extrabold text-base text-blue-950 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-900" />
                <span>التحليل حسب فروع المادة (المهارات):</span>
              </h3>
              <div className="space-y-4">
                {Object.entries(currentResult.skillBreakdown)
                  .filter(([_, stat]) => stat.total > 0)
                  .map(([skill, stat]) => {
                    const percent = Math.round((stat.correct / stat.total) * 100);
                    return (
                      <div key={skill} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>{skill === 'grammar' ? 'النحو العربي' : skill === 'reading' ? 'القراءة والفهم' : skill === 'literature' ? 'النصوص والبلاغة' : skill === 'spelling' ? 'الإملاء' : skill === 'listening' ? 'الاستماع' : 'التعبير'}</span>
                          <span className="font-mono">{stat.correct} من {stat.total} ({percent}٪)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              percent >= 80 ? 'bg-emerald-500' : percent >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Lesson Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="font-extrabold text-base text-blue-950 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-900" />
                <span>التحليل حسب الدروس:</span>
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {Object.entries(currentResult.lessonBreakdown).map(([lesson, stat]) => {
                  const percent = Math.round((stat.correct / stat.total) * 100);
                  return (
                    <div key={lesson} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                      <span className="font-bold text-slate-800 truncate max-w-[200px]">{lesson}</span>
                      <span className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                        percent >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {stat.correct}/{stat.total} ({percent}٪)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Full Question-by-Question Solution Review */}
          <div className="mt-8">
            <h3 className="text-xl font-extrabold text-blue-950 mb-4">
              مراجعة الأسئلة مع الحلول والشروح المعتمدة:
            </h3>
            {activeQuestions.map((q, idx) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={idx}
                mode="revision"
                userSavedAnswer={userAnswers[q.id]}
                showPassageByDefault={false}
              />
            ))}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 5: EXAM HISTORY (G) */}
      {/* ======================================================== */}
      {step === 'history' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-blue-950 flex items-center gap-2">
                <History className="w-5 h-5 text-amber-500" />
                <span>سجل الاختبارات المنجزة سابقاً</span>
              </h2>
              <button
                onClick={() => setStep('dashboard')}
                className="bg-blue-900 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                إنشاء امتحان جديد
              </button>
            </div>

            {examHistory.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <h4 className="font-bold text-base text-slate-600 mb-1">لا يوجد اختبارات سابقة مسجلة</h4>
                <p className="text-xs">ابدأ بإنشاء أول اختبار لك لتتبع سجل إنجازاتك وتقدمك الدراسي.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {examHistory.map((exam) => (
                  <div key={exam.id} className="py-4 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm md:text-base text-slate-900">{exam.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>{new Date(exam.timestamp).toLocaleDateString('ar-EG')}</span>
                        <span aria-hidden="true">·</span>
                        <span>{exam.totalQuestions} أسئلة</span>
                        <span aria-hidden="true">·</span>
                        <span>نمط: {exam.config.mode === 'formal' ? 'رسمي' : 'تدريبي'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-left font-mono">
                        <span className={`text-lg font-black ${
                          exam.scorePercentage >= 85 ? 'text-emerald-600' : exam.scorePercentage >= 60 ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          {exam.scorePercentage}٪
                        </span>
                        <span className="text-xs text-slate-400 block">
                          {exam.correctAnswers}/{exam.totalQuestions}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setCurrentResult(exam);
                          setStep('results');
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs transition-colors"
                      >
                        عرض التفاصيل
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
