import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layers, 
  BookOpen, 
  Feather, 
  Edit3, 
  Headphones, 
  PenTool, 
  Sparkles, 
  Volume2, 
  Square,
  ChevronDown,
  ChevronUp,
  Lightbulb
} from 'lucide-react';
import { SkillCategory, Question, ExamMode } from '../types/curriculum';
import { getQuestionsBySkill } from '../data/questionBank';
import { getInfographicByLessonName } from '../data/lessonInfographics';
import { LessonInfographic } from '../types/infographics';
import { InfographicModal } from './InfographicModal';
import { QuestionCard } from './QuestionCard';
import { toggleBookmark, getBookmarks } from '../utils/storage';
import { speechReader } from '../utils/textSpeechReader';

interface SkillPracticeViewProps {
  onQuestionAnswered?: (qId: string, ans: string, correct: boolean, skill: string) => void;
  savedAnswers?: Record<string, { userAnswer: string; isCorrect: boolean }>;
}

export const SkillPracticeView: React.FC<SkillPracticeViewProps> = ({
  onQuestionAnswered,
  savedAnswers = {}
}) => {
  const [activeSkill, setActiveSkill] = useState<SkillCategory>('reading'); // Default to reading so user immediately sees it
  const [selectedLessonName, setSelectedLessonName] = useState<string>('all');
  const [mode, setMode] = useState<ExamMode>('practice');
  const [bookmarks, setBookmarks] = useState<string[]>(getBookmarks());
  const [isReadingMainPassage, setIsReadingMainPassage] = useState<boolean>(false);
  const [showPassageText, setShowPassageText] = useState<boolean>(true);
  const [activeModalLesson, setActiveModalLesson] = useState<LessonInfographic | null>(null);

  const skillTabs: { id: SkillCategory; label: string; icon: any; color: string; desc: string }[] = [
    { 
      id: 'reading', 
      label: 'القراءة والفهم', 
      icon: BookOpen, 
      color: 'emerald', 
      desc: 'العبور إلى المستقبل، محمد مبروك، من أجل غد، واحة الخارجة، والخوارزمي' 
    },
    { 
      id: 'grammar', 
      label: 'النحو العربي', 
      icon: Layers, 
      color: 'blue', 
      desc: 'المعرب والمبني، الضمائر البارزة والمستترة، وأسلوب الشرط الجازم وغير الجازم' 
    },
    { 
      id: 'literature', 
      label: 'النصوص والبلاغة', 
      icon: Feather, 
      color: 'purple', 
      desc: 'مصر التي في خاطري، ريفنا المصري، والكد سبيل المعالي للشافعي' 
    },
    { 
      id: 'spelling', 
      label: 'القواعد الإملائية', 
      icon: Edit3, 
      color: 'amber', 
      desc: 'رسم الألف اللينة في الأسماء والأفعال والحروف، والتاء المربوطة والمفتوحة والهاء' 
    },
    { 
      id: 'listening', 
      label: 'نصوص الاستماع', 
      icon: Headphones, 
      color: 'indigo', 
      desc: 'آمنة دهشان، أقدم وديعة، وإنسان أم ظل إنسان' 
    },
    { 
      id: 'writing', 
      label: 'التعبير وفنون الكتابة', 
      icon: PenTool, 
      color: 'teal', 
      desc: 'كتابة مقال وصف مكان وتطبيقات الخطبة الإقناعية' 
    }
  ];

  const currentQuestions = getQuestionsBySkill(activeSkill);
  
  // Extract distinct lessons for this active skill
  const skillLessons = Array.from(new Set(currentQuestions.map(q => q.lessonName)));

  const filteredQuestions = selectedLessonName === 'all'
    ? currentQuestions
    : currentQuestions.filter(q => q.lessonName === selectedLessonName);

  const handleBookmarkToggle = (qId: string) => {
    toggleBookmark(qId);
    setBookmarks(getBookmarks());
  };

  const currentTabMeta = skillTabs.find(t => t.id === activeSkill) || skillTabs[0];

  // Determine active passage for reading/listening/literature
  const activePassage = useMemo(() => {
    if (activeSkill !== 'reading' && activeSkill !== 'listening' && activeSkill !== 'literature') {
      return null;
    }

    if (selectedLessonName !== 'all') {
      const qWithPassage = currentQuestions.find(q => q.lessonName === selectedLessonName && q.passageText);
      if (qWithPassage && qWithPassage.passageText) {
        return {
          title: qWithPassage.passageTitle || `نص درس: ${selectedLessonName}`,
          lessonName: selectedLessonName,
          text: qWithPassage.passageText
        };
      }
    }

    // When 'all', pick the passage of the first available lesson in this branch
    const firstQWithPassage = currentQuestions.find(q => q.passageText);
    if (firstQWithPassage && firstQWithPassage.passageText) {
      return {
        title: firstQWithPassage.passageTitle || `نص درس: ${firstQWithPassage.lessonName}`,
        lessonName: firstQWithPassage.lessonName,
        text: firstQWithPassage.passageText
      };
    }

    return null;
  }, [activeSkill, selectedLessonName, currentQuestions]);

  const matchingInfographic = useMemo(() => {
    if (selectedLessonName !== 'all') {
      return getInfographicByLessonName(selectedLessonName);
    }
    return activePassage ? getInfographicByLessonName(activePassage.lessonName) : null;
  }, [selectedLessonName, activePassage]);

  const activePassageSpeechId = activePassage ? `skill_passage_${activeSkill}_${selectedLessonName}` : null;

  useEffect(() => {
    if (!activePassageSpeechId) return;
    const unsub = speechReader.subscribe((state) => {
      setIsReadingMainPassage(state.isReading && state.currentId === activePassageSpeechId);
    });
    return () => {
      unsub();
      speechReader.stop();
    };
  }, [activePassageSpeechId]);

  const handleToggleReadActivePassage = () => {
    if (!activePassage || !activePassageSpeechId) return;
    if (isReadingMainPassage) {
      speechReader.stop();
    } else {
      setShowPassageText(true);
      const textToSpeak = `${activePassage.title} . ${activePassage.text}`;
      speechReader.read(activePassageSpeechId, textToSpeak);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-8" dir="rtl">
      
      {/* View Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-emerald-600 tracking-wide uppercase">النمط الثاني (Mode B)</span>
          <h1 className="text-2xl md:text-3xl font-black text-blue-950 flex items-center gap-3 mt-1">
            <Layers className="w-7 h-7 text-emerald-600" />
            <span>التدريب التخصصي حسب المهارة</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
            جميع أسئلة المنهج مجمعة ومصنفة بحسب فروع اللغة والدروس التعليمية التخصصية مع ميزة القراءة الصوتية «اقرأ لي 🔊»
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200">
          <button
            onClick={() => setMode('practice')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              mode === 'practice'
                ? 'bg-blue-950 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            نمط التدريب الذاتي
          </button>
          <button
            onClick={() => setMode('revision')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              mode === 'revision'
                ? 'bg-amber-500 text-blue-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            دليل الحلول والأنشطة
          </button>
        </div>
      </div>

      {/* Main Skills Category Grid Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {skillTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSkill === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                speechReader.stop();
                setActiveSkill(tab.id);
                setSelectedLessonName('all');
              }}
              className={`p-3 sm:p-4 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                isActive 
                  ? 'bg-blue-950 text-white border-blue-950 shadow-md ring-2 ring-amber-400 scale-102' 
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-2xs ${
                isActive ? 'bg-amber-400 text-blue-950' : 'bg-slate-100 text-slate-700'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm sm:text-base mb-1">{tab.label}</h4>
              <span className={`text-xs font-semibold ${isActive ? 'text-amber-200' : 'text-slate-400'}`}>
                {getQuestionsBySkill(tab.id).length} أسئلة
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Skill Sub-Lessons Ribbon */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-extrabold text-blue-950 flex items-center gap-2.5">
              <span>فرع {currentTabMeta.label}</span>
              <span className="text-sm font-bold text-amber-700 bg-amber-50 px-3 py-0.5 rounded-full border border-amber-200">
                {filteredQuestions.length} سؤالاً متاحاً
              </span>
            </h3>
            <p className="text-sm text-slate-600 font-normal mt-1">{currentTabMeta.desc}</p>
          </div>
        </div>

        {/* Lesson Sub-Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              speechReader.stop();
              setSelectedLessonName('all');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedLessonName === 'all'
                ? 'bg-blue-950 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            جميع دروس الفرع ({currentQuestions.length})
          </button>
          {skillLessons.map((lesson) => {
            const count = currentQuestions.filter(q => q.lessonName === lesson).length;
            const isSelected = selectedLessonName === lesson;
            return (
              <button
                key={lesson}
                onClick={() => {
                  speechReader.stop();
                  setSelectedLessonName(lesson);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-950 text-white shadow-2xs ring-2 ring-amber-400'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{lesson}</span>
                <span className={`mr-1.5 font-mono text-xs ${isSelected ? 'text-amber-300 font-extrabold' : 'text-slate-400'}`}>
                  ({count})
                </span>
                {isSelected && <span className="mr-1 text-xs">🔊</span>}
              </button>
            );
          })}
        </div>

        {/* Selected Lesson Status & Action Bar with prominent "اقرأ لي" */}
        <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-100/60 p-4 sm:p-5 rounded-2xl border border-amber-300 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-amber-400 text-blue-950 font-black text-xl flex items-center justify-center shadow-xs shrink-0 border border-amber-300">
              📖
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-900 bg-amber-200/90 px-2.5 py-0.5 rounded-full inline-block border border-amber-300">
                  {selectedLessonName === 'all' ? 'عرض شامل' : 'الدرس المحدد حالياً'}
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  ({filteredQuestions.length} سؤال متاح)
                </span>
              </div>
              <h4 className="text-base sm:text-lg md:text-xl font-black text-blue-950 mt-1">
                {selectedLessonName === 'all' ? `جميع موضوعات فرع ${currentTabMeta.label}` : selectedLessonName}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {activePassage && (
              <button
                type="button"
                onClick={handleToggleReadActivePassage}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm sm:text-base font-black transition-all cursor-pointer shadow-md active:scale-95 border ${
                  isReadingMainPassage
                    ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700 ring-2 ring-rose-300 animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 hover:shadow-lg'
                }`}
                title="استمع إلى قراءة نص هذا الدرس بصوت واضح وفصيح"
              >
                {isReadingMainPassage ? (
                  <>
                    <Square className="w-4 h-4 fill-white" />
                    <span>إيقاف القراءة ⏹️</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5 text-white" />
                    <span>اقرأ لي نص الدرس 🔊</span>
                  </>
                )}
              </button>
            )}

            {matchingInfographic && (
              <button
                type="button"
                onClick={() => setActiveModalLesson(matchingInfographic)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-950 border border-amber-300 shadow-xs cursor-pointer active:scale-95 btn-glow-gold"
                title="عرض الإنفوجرافيك الشامل لهذا الدرس"
              >
                <Lightbulb className="w-4 h-4 text-blue-950 fill-blue-950" />
                <span>ذاكر لي إنفوجرافيك الدرس 💡</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DEDICATED READING PASSAGE CARD WITH "اقرأ لي 🔊" FOR THE READING BRANCH */}
      {(activeSkill === 'reading' || activeSkill === 'listening' || activeSkill === 'literature') && activePassage && (
        <div className={`border-2 rounded-3xl p-5 sm:p-7 shadow-sm transition-all ${
          isReadingMainPassage
            ? 'bg-amber-50/95 border-amber-400 ring-2 ring-amber-300 shadow-md'
            : 'bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 border-amber-300'
        }`}>
          {/* Card Top Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-amber-200/80">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-blue-950 flex items-center justify-center font-extrabold text-2xl shadow-xs shrink-0 border border-amber-300">
                📖
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full border border-amber-300 inline-block">
                    نص {activeSkill === 'literature' ? 'النصوص الشعرية' : 'القراءة والفهم'} المقرر
                  </span>
                  <span className="text-xs text-slate-500 font-bold">
                    درس: {activePassage.lessonName}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-blue-950">
                  {activePassage.title}
                </h2>
              </div>
            </div>

            {/* Prominent "اقرأ لي" Button */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={handleToggleReadActivePassage}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm sm:text-base font-extrabold transition-all cursor-pointer shadow-md active:scale-95 ${
                  isReadingMainPassage
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg ring-2 ring-rose-300 animate-pulse'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-950 border border-amber-300 btn-glow-gold'
                }`}
                title="استمع إلى قراءة النص كاملاً بصوت واضح وفصيح"
              >
                {isReadingMainPassage ? (
                  <>
                    <Square className="w-4 h-4 fill-white text-white" />
                    <span>إيقاف القراءة</span>
                    <span className="flex items-center gap-0.5 mr-1" aria-hidden="true">
                      <span className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5 text-blue-950" />
                    <span>اقرأ لي النص بالكامل 🔊</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowPassageText(!showPassageText)}
                className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold cursor-pointer transition-colors shadow-2xs"
              >
                {showPassageText ? 'إخفاء النص ∧' : 'إظهار النص ∨'}
              </button>
            </div>
          </div>

          {/* Reading text box */}
          {showPassageText && (
            <div className="relative text-slate-900 text-xl sm:text-2xl md:text-3xl leading-loose font-medium whitespace-pre-line p-5 sm:p-7 bg-white rounded-2xl border border-amber-200/70 shadow-inner">
              {isReadingMainPassage && (
                <div className="flex items-center justify-between bg-amber-100/90 px-4 py-2.5 rounded-xl mb-4 text-xs sm:text-sm font-extrabold text-amber-950 border border-amber-300">
                  <span className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-amber-800 animate-pulse" />
                    <span>جاري القراءة الصوتية للنص بالكامل... استمع وتابع الكلمات</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleReadActivePassage}
                    className="text-xs font-extrabold text-rose-700 hover:text-rose-900 bg-white px-3 py-1 rounded-lg border border-rose-200 cursor-pointer shadow-2xs"
                  >
                    إيقاف ⏹️
                  </button>
                </div>
              )}
              {activePassage.text}
            </div>
          )}
        </div>
      )}

      {/* Question List Feed */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>أسئلة وتطبيقات كتاب الوزارة للدرس</span>
            <span className="text-xs sm:text-sm font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              {filteredQuestions.length} سؤال
            </span>
          </h3>
        </div>

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
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 text-slate-400">
            <BookOpen className="w-14 h-14 mx-auto mb-3 opacity-40 text-slate-300" />
            <h4 className="font-extrabold text-lg text-slate-700">لا توجد أسئلة مسجلة في هذا الدرس المحدد</h4>
          </div>
        )}
      </div>

      {/* Lesson Infographic Modal */}
      {activeModalLesson && (
        <InfographicModal
          isOpen={true}
          infographic={activeModalLesson}
          lessonName={activeModalLesson.lessonName}
          onClose={() => setActiveModalLesson(null)}
        />
      )}

    </div>
  );
};
