import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  Bookmark, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Check,
  KeyRound,
  FileText,
  ThumbsUp,
  RefreshCw,
  Volume2,
  Square,
  Headphones
} from 'lucide-react';
import { Question, ExamMode } from '../types/curriculum';
import { evaluateStudentAnswer, EvaluationResult } from '../utils/arabicEvaluator';
import { InfographicModal } from './InfographicModal';
import { mascotService } from '../utils/mascotService';
import { speechReader } from '../utils/textSpeechReader';

interface QuestionCardProps {
  question: Question;
  index: number;
  totalCount?: number;
  mode?: ExamMode; // practice, formal, revision
  userSavedAnswer?: string;
  onAnswerSubmit?: (answer: string, isCorrect: boolean) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  showPassageByDefault?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  totalCount,
  mode = 'practice',
  userSavedAnswer,
  onAnswerSubmit,
  isBookmarked = false,
  onToggleBookmark,
  showPassageByDefault = false
}) => {
  const [selectedOption, setSelectedOption] = useState<string>(userSavedAnswer || '');
  const [textAnswer, setTextAnswer] = useState<string>(userSavedAnswer || '');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(!!userSavedAnswer || mode === 'revision');
  const [showExplanation, setShowExplanation] = useState<boolean>(mode === 'revision');
  const [showPassage, setShowPassage] = useState<boolean>(showPassageByDefault);
  const [showModelComparison, setShowModelComparison] = useState<boolean>(false);
  const [manualAccepted, setManualAccepted] = useState<boolean>(false);
  const [showInfographicModal, setShowInfographicModal] = useState<boolean>(false);
  const [isReadingPassage, setIsReadingPassage] = useState<boolean>(false);
  const [isReadingQuestion, setIsReadingQuestion] = useState<boolean>(false);

  // Subscribe to speech reader state
  useEffect(() => {
    const passageId = `passage_${question.id}`;
    const questionSpeechId = `question_${question.id}`;
    const unsub = speechReader.subscribe((state) => {
      setIsReadingPassage(state.isReading && state.currentId === passageId);
      setIsReadingQuestion(state.isReading && state.currentId === questionSpeechId);
    });
    return () => {
      unsub();
    };
  }, [question.id]);

  const handleToggleReadPassage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!question.passageText) return;
    const passageId = `passage_${question.id}`;
    if (isReadingPassage) {
      speechReader.stop();
    } else {
      setShowPassage(true);
      const textToRead = `${question.passageTitle ? question.passageTitle + ' . ' : ''} ${question.passageText}`;
      speechReader.read(passageId, textToRead);
    }
  };

  const handleToggleReadQuestion = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const questionSpeechId = `question_${question.id}`;
    if (isReadingQuestion) {
      speechReader.stop();
    } else {
      const optionsText = question.options 
        ? question.options.map(o => o.text).join(' ، ')
        : '';
      const fullText = `${question.questionText} ${optionsText ? ' . الخيارات: ' + optionsText : ''}`;
      speechReader.read(questionSpeechId, fullText);
    }
  };

  // Evaluate current answer
  const activeAnswer = (question.type === 'mcq' || question.type === 'true_false') 
    ? selectedOption 
    : textAnswer;

  const evalResult: EvaluationResult = evaluateStudentAnswer(question, activeAnswer);
  const isFinalCorrect = manualAccepted || evalResult.isCorrect;

  const handleSelectOption = (optId: string) => {
    if (isSubmitted && mode === 'practice') return;
    setSelectedOption(optId);

    if (mode === 'formal') {
      const isMatch = Array.isArray(question.correctAnswer)
        ? question.correctAnswer.includes(optId)
        : String(question.correctAnswer).trim() === optId.trim();
      onAnswerSubmit?.(optId, isMatch);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalAnswer = activeAnswer.trim();
    if (!finalAnswer) return;

    setIsSubmitted(true);
    setShowExplanation(true);
    setShowModelComparison(true);

    const res = evaluateStudentAnswer(question, finalAnswer);
    onAnswerSubmit?.(finalAnswer, res.isCorrect);
  };

  const handleManualAccept = () => {
    setManualAccepted(true);
    mascotService.notifyCorrect('أحسنت! 🌟 تم اعتماد صواب إجابتك وتحليلك اللغوي بنجاح');
    onAnswerSubmit?.(activeAnswer.trim(), true);
  };

  const handleResetAnswer = () => {
    setIsSubmitted(false);
    setShowModelComparison(false);
    setManualAccepted(false);
    mascotService.notifyTip('أحسنت على المحاولة مجدداً! اقرأ السؤال بتأنٍ وحاول مرة أخرى 💪');
    if (question.type === 'mcq' || question.type === 'true_false') {
      setSelectedOption('');
    } else {
      setTextAnswer('');
    }
  };

  const getDifficultyBadge = (diff: 'easy' | 'medium' | 'hard') => {
    switch (diff) {
      case 'easy':
        return <span className="text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold">تذكّري</span>;
      case 'medium':
        return <span className="text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold">تطبيقي</span>;
      case 'hard':
        return <span className="text-purple-800 bg-purple-50 border border-purple-300 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold">تحليلي وابتكاري</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'fill_blank':
        return <span className="text-blue-800 bg-blue-50 border border-blue-300 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold">أكمل الفراغ</span>;
      case 'text_input':
        return <span className="text-indigo-800 bg-indigo-50 border border-indigo-300 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold">مقالي وتعبير</span>;
      case 'true_false':
        return <span className="text-teal-800 bg-teal-50 border border-teal-300 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold">صواب وخطأ</span>;
      default:
        return <span className="text-slate-800 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold">اختيار من متعدد</span>;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden mb-6 card-interactive">
      
      {/* Question Header */}
      <div className="bg-slate-50/90 px-3.5 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-950 text-amber-300 font-extrabold text-xs sm:text-base flex items-center justify-center shadow-xs shrink-0">
            {index + 1}
          </span>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base text-slate-500 font-medium truncate">
              <span>{question.unitTitle}</span>
              <span aria-hidden="true">·</span>
              <span>الأسبوع {question.week}</span>
              <span aria-hidden="true">·</span>
              <span className="font-bold text-blue-950">{question.skillLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-600 font-semibold">{question.section}</span>
            </div>
            <span className="text-sm sm:text-base md:text-lg font-extrabold text-slate-800 mt-0.5 truncate">
              درس: {question.lessonName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
          {getTypeBadge(question.type)}
          {getDifficultyBadge(question.difficulty)}
          
          <button
            type="button"
            onClick={question.passageText ? handleToggleReadPassage : handleToggleReadQuestion}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-xs cursor-pointer active:scale-95 border ${
              (isReadingPassage || isReadingQuestion)
                ? 'bg-rose-600 text-white border-rose-700 animate-pulse ring-2 ring-rose-300'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-sm'
            }`}
            title={(isReadingPassage || isReadingQuestion) ? 'إيقاف القراءة الصوتية' : (question.passageText ? 'استمع إلى قراءة فقرة هذا الدرس بصوت واضح' : 'استمع إلى قراءة السؤال والخيارات')}
          >
            {(isReadingPassage || isReadingQuestion) ? (
              <>
                <Square className="w-3.5 h-3.5 fill-white text-white" />
                <span>إيقاف ⏹️</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-white" />
                <span>اقرأ لي 🔊</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowInfographicModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-950 border border-amber-300 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-xs cursor-pointer active:scale-95 btn-glow-gold"
            title="استعرض إنفوجرافيك هذا الدرس، معاني الكلمات والقواعد"
          >
            <Sparkles className="w-4 h-4 text-blue-950" />
            <span>ذاكر لي 💡</span>
          </button>

          {onToggleBookmark && (
            <button
              onClick={onToggleBookmark}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isBookmarked 
                  ? 'bg-amber-50 border-amber-300 text-amber-600 shadow-xs' 
                  : 'bg-white border-slate-200 text-slate-400 hover:text-amber-600'
              }`}
              title="حفظ السؤال للمراجعة"
              aria-label="حفظ السؤال"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Linked Reading Passage / Poetry Excerpt if available */}
      {question.passageText && (
        <div className="px-3 sm:px-6 pt-3 sm:pt-4">
          <div className={`border rounded-2xl sm:rounded-3xl overflow-hidden transition-all shadow-xs ${
            isReadingPassage 
              ? 'bg-amber-50/95 border-amber-400 ring-2 ring-amber-300 shadow-md' 
              : 'bg-amber-50/70 border-amber-200'
          }`}>
            {/* Passage Header Bar */}
            <div className="px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 bg-amber-100/60 border-b border-amber-200/80">
              <button
                type="button"
                onClick={() => setShowPassage(!showPassage)}
                className="flex items-center gap-2.5 font-extrabold text-sm sm:text-base text-blue-950 hover:text-amber-900 transition-colors cursor-pointer text-right flex-1 min-w-[200px]"
              >
                <BookOpen className="w-5 h-5 text-amber-700 shrink-0" />
                <span>الفقرة المقررة: {question.passageTitle || 'النص المرتبط بالسؤال'}</span>
                {showPassage ? <ChevronUp className="w-5 h-5 text-slate-500 mr-2" /> : <ChevronDown className="w-5 h-5 text-slate-500 mr-2" />}
              </button>

              {/* Prominent "اقرأ لي" button right beside the reading passage */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleToggleReadPassage}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-xs active:scale-95 ${
                    isReadingPassage
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md ring-2 ring-rose-300 animate-pulse'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-950 border border-amber-300 hover:shadow-md btn-glow-gold'
                  }`}
                  title={isReadingPassage ? 'إيقاف القراءة الصوتية' : 'استمع إلى قراءة الفقرة بصوت فصيح وواضح'}
                >
                  {isReadingPassage ? (
                    <>
                      <Square className="w-4 h-4 fill-white text-white" />
                      <span>إيقاف القراءة</span>
                      {/* Audio wave indicator */}
                      <span className="flex items-center gap-0.5 mr-1" aria-hidden="true">
                        <span className="w-1 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-950" />
                      <span>اقرأ لي 🔊</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Expanded Passage Content */}
            {showPassage && (
              <div className="p-5 sm:p-7 bg-white/95 text-slate-900 text-xl sm:text-2xl md:text-3xl leading-loose whitespace-pre-line font-medium border-dashed">
                {isReadingPassage && (
                  <div className="flex items-center justify-between bg-amber-100/70 px-4 py-2.5 rounded-xl mb-4 text-xs sm:text-sm font-extrabold text-amber-950 border border-amber-300">
                    <span className="flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-amber-800 animate-pulse" />
                      <span>جاري القراءة الصوتية للنص... استمع وتابع الكلمات</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleToggleReadPassage}
                      className="text-xs font-extrabold text-rose-700 hover:text-rose-900 bg-white px-3 py-1 rounded-lg border border-rose-200 cursor-pointer shadow-2xs"
                    >
                      إيقاف ⏹️
                    </button>
                  </div>
                )}
                {question.passageText}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Question Content Body */}
      <div className="p-4 sm:p-6 md:p-7">
        <div className="flex items-start justify-between gap-3 mb-5 sm:mb-6">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-relaxed whitespace-pre-line flex-1">
            {question.questionText}
          </h3>

          <button
            type="button"
            onClick={handleToggleReadQuestion}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-2xs active:scale-95 ${
              isReadingQuestion
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-xs ring-2 ring-rose-300'
                : 'bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-950 border border-slate-200 hover:border-amber-300'
            }`}
            title="استمع إلى قراءة السؤال والخيارات بصوت واضح"
          >
            {isReadingQuestion ? (
              <>
                <Square className="w-3.5 h-3.5 fill-white text-white" />
                <span>إيقاف</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-amber-700" />
                <span className="hidden sm:inline">اقرأ لي السؤال 🔊</span>
                <span className="sm:hidden">اقرأ لي 🔊</span>
              </>
            )}
          </button>
        </div>

        {/* 1. Format: MCQ & True/False */}
        {(question.type === 'mcq' || question.type === 'true_false') && question.options && (
          <div className="grid grid-cols-1 gap-3 mb-6">
            {question.options.map((option) => {
              const isSelected = selectedOption === option.id;
              let optionStyle = 'bg-slate-50/80 border-slate-200 hover:bg-blue-50/70 hover:border-blue-300 text-slate-800';

              if (mode === 'formal') {
                if (isSelected) {
                  optionStyle = 'bg-blue-950 text-white border-blue-950 shadow-sm';
                }
              } else if (isSubmitted || mode === 'revision') {
                const isThisCorrect = Array.isArray(question.correctAnswer)
                  ? question.correctAnswer.includes(option.id)
                  : String(question.correctAnswer).trim() === option.id;

                if (isThisCorrect) {
                  optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-2xs';
                } else if (isSelected && !isThisCorrect) {
                  optionStyle = 'bg-rose-50 border-rose-300 text-rose-950';
                } else {
                  optionStyle = 'opacity-60 border-slate-200 text-slate-600';
                }
              } else if (isSelected) {
                optionStyle = 'bg-blue-950 text-white border-blue-950 shadow-sm';
              }

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelectOption(option.id)}
                  disabled={isSubmitted && mode === 'practice'}
                  className={`w-full text-right p-4 sm:p-5 rounded-2xl border text-xl sm:text-2xl font-bold flex items-center justify-between transition-all cursor-pointer ${optionStyle}`}
                >
                  <span className="flex-1 leading-relaxed">{option.text}</span>
                  
                  <div className="shrink-0 mr-3">
                    {mode !== 'formal' && (isSubmitted || mode === 'revision') ? (
                      (Array.isArray(question.correctAnswer) 
                        ? question.correctAnswer.includes(option.id) 
                        : String(question.correctAnswer).trim() === option.id) ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : isSelected ? (
                        <XCircle className="w-5 h-5 text-rose-600" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300" />
                      )
                    ) : (
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected ? 'border-amber-400 bg-amber-400' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-950 stroke-[3]" />}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* 2. Format: Fill in the blank (أكمل الفراغ) */}
        {question.type === 'fill_blank' && (
          <div className="mb-6">
            <label className="block text-sm sm:text-base font-bold text-slate-800 mb-2.5">
              اكتب الكلمة أو العبارة المناسبة لإكمال الفراغ بدقة:
            </label>
            <div className="relative">
              <input
                type="text"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isSubmitted && mode === 'practice') {
                    handleSubmit();
                  }
                }}
                disabled={isSubmitted && mode === 'practice'}
                placeholder="اكتب التكملة الصحيحة هنا..."
                className={`w-full p-4 pr-5 pl-14 rounded-2xl border text-base sm:text-lg font-bold transition-all shadow-inner ${
                  isSubmitted && mode !== 'formal'
                    ? isFinalCorrect
                      ? 'border-emerald-500 bg-emerald-50/60 text-emerald-950'
                      : 'border-rose-400 bg-rose-50/60 text-rose-950'
                    : 'border-slate-300 focus:border-blue-900 focus:ring-2 focus:ring-blue-100 bg-white text-slate-900'
                }`}
              />
              {isSubmitted && mode !== 'formal' && (
                <div className="absolute left-4 top-4">
                  {isFinalCorrect ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  ) : (
                    <XCircle className="w-7 h-7 text-rose-600" />
                  )}
                </div>
              )}
            </div>
            
            {question.keywords && question.keywords.length > 0 && !isSubmitted && (
              <p className="text-sm text-slate-500 mt-2.5 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
                <span>مفتاح الإجابة: يراعي المصحح الآلي المفردات والكلمات المفتاحية المعتمدة في كتاب الوزارة.</span>
              </p>
            )}
          </div>
        )}

        {/* 3. Format: Essay & Short Answer & Writing (أسئلة مقالية وتعبير واستخراج) */}
        {question.type === 'text_input' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <label className="block text-sm sm:text-base font-bold text-slate-800">
                اكتب إجابتك أو تحليلك اللغوي هنا:
              </label>
              <span className="text-sm text-slate-400 font-semibold">
                {textAnswer.trim() ? `${textAnswer.trim().split(/\s+/).length} كلمة` : 'بانتظار كتابة الإجابة...'}
              </span>
            </div>
            <textarea
              rows={4}
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              disabled={isSubmitted && mode === 'practice'}
              placeholder="اكتب الإجابة باللغة العربية الفصحى مع مراعاة القواعد وعلامات الترقيم..."
              className={`w-full p-4 rounded-2xl border text-base sm:text-lg font-medium leading-relaxed transition-all shadow-inner ${
                isSubmitted && mode !== 'formal'
                  ? isFinalCorrect
                    ? 'border-emerald-400 bg-emerald-50/40 text-slate-900'
                    : 'border-amber-400 bg-amber-50/40 text-slate-900'
                  : 'border-slate-300 focus:border-blue-900 focus:ring-2 focus:ring-blue-100 bg-white text-slate-900'
              }`}
            />
          </div>
        )}

        {/* Action Controls for Practice Mode */}
        {mode === 'practice' && !isSubmitted && (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
            <span className="text-sm text-slate-600 font-medium">
              {question.type === 'fill_blank' || question.type === 'text_input'
                ? 'اكتب إجابتك ثم اضغط «تأكيد وتقييم الإجابة» للتحقق الآلي ومقارنتها بالنموذج'
                : 'اختر الإجابة ثم اضغط «تأكيد الإجابة» للحصول على التقييم الفوري'}
            </span>
            <button
              onClick={() => handleSubmit()}
              disabled={!selectedOption && !textAnswer.trim()}
              className="bg-blue-950 hover:bg-blue-900 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold px-7 py-3 rounded-2xl text-base transition-all shadow-md hover:shadow-lg cursor-pointer disabled:cursor-not-allowed flex items-center gap-2.5 transform active:scale-95"
            >
              <Check className="w-5 h-5 text-amber-400 stroke-[3]" />
              <span>تأكيد وتقييم الإجابة</span>
            </button>
          </div>
        )}

        {/* Feedback Alert & Model Answer Comparison (In Practice or Revision Mode) */}
        {mode !== 'formal' && (isSubmitted || mode === 'revision') && (
          <div className="mt-5 pt-5 border-t border-slate-200">
            {/* Feedback Banner */}
            {mode === 'practice' && (
              <div className={`p-4 sm:p-5 rounded-2xl mb-5 flex items-start gap-3.5 shadow-xs ${
                isFinalCorrect 
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-950' 
                  : 'bg-rose-50 border border-rose-200 text-rose-950'
              }`}>
                {isFinalCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-extrabold text-base sm:text-lg mb-1">
                      {isFinalCorrect ? 'أحسنت! إجابة دقيقة وصحيحة (+٢٠ نقطة)' : 'تحتاج إجابتك إلى مراجعة وتدقيق'}
                    </h4>
                    
                    {/* Retry button in practice mode */}
                    <button
                      onClick={handleResetAnswer}
                      className="text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-950 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-400 transition-colors shadow-2xs cursor-pointer"
                      title="إعادة المحاولة"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>إعادة المحاولة</span>
                    </button>
                  </div>

                  <p className="text-sm sm:text-base font-semibold leading-relaxed opacity-95 mt-1">
                    {evalResult.feedback}
                  </p>
                </div>
              </div>
            )}

            {/* Keyword Breakdown (For Fill-in-the-blank & Essay questions) */}
            {question.keywords && question.keywords.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5">
                <div className="flex items-center gap-2 mb-2.5 text-sm font-extrabold text-slate-800">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>التحليل الذكي للكلمات والمفاهيم المفتاحية المطلوبة:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {question.keywords.map((kw, i) => {
                    const isMatched = evalResult.matchedKeywords.includes(kw);
                    return (
                      <span
                        key={i}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border ${
                          isMatched 
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-950' 
                            : 'bg-slate-100 border-slate-300 text-slate-700'
                        }`}
                      >
                        {isMatched ? <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> : <span className="w-2 h-2 rounded-full bg-slate-400" />}
                        <span>{kw}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Direct Model Answer Comparison Section */}
            {(question.type === 'fill_blank' || question.type === 'text_input') && (
              <div className="bg-blue-50/50 border border-blue-200/80 rounded-xl p-4 mb-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 font-extrabold text-sm sm:text-base text-blue-950">
                    <FileText className="w-5 h-5 text-blue-700" />
                    <span>مقارنة إجابتك بالإجابة النموذجية المعتمدة:</span>
                  </div>
                  
                  {/* Manual Override Button if student wrote valid phrasing */}
                  {!isFinalCorrect && (
                    <button
                      type="button"
                      onClick={handleManualAccept}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-emerald-400 text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer"
                      title="اضغط هنا إذا كانت إجابتك تؤدي نفس المعنى بأسلوبك الخاص"
                    >
                      <ThumbsUp className="w-4 h-4 text-emerald-600" />
                      <span>اعتماد صياغتي كصحيحة</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="block text-xs sm:text-sm font-bold text-slate-500 mb-1.5">إجابتك:</span>
                    <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed whitespace-pre-line">
                      {textAnswer || 'لم يتم إدخال إجابة'}
                    </p>
                  </div>

                  <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 shadow-2xs">
                    <span className="block text-xs sm:text-sm font-bold text-emerald-800 mb-1.5">الإجابة النموذجية المعتمدة:</span>
                    <p className="text-sm sm:text-base font-extrabold text-emerald-950 leading-relaxed whitespace-pre-line">
                      {question.modelAnswer || (Array.isArray(question.correctAnswer) ? question.correctAnswer.join(' / ') : question.correctAnswer)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* For MCQ: Show Correct Answer Pill */}
            {(question.type === 'mcq' || question.type === 'true_false') && !isFinalCorrect && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 mb-5 text-sm sm:text-base font-semibold text-emerald-950 shadow-2xs">
                <span className="font-extrabold">الإجابة الصحيحة المعتمدة هي:{' '}</span>
                <span className="underline font-black">
                  {Array.isArray(question.correctAnswer)
                    ? question.correctAnswer.join(' أو ')
                    : question.options?.find(o => o.id === question.correctAnswer)?.text || question.correctAnswer}
                </span>
              </div>
            )}

            {/* Explanation & Pedagogical Rule Citation */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-2.5">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h5 className="font-extrabold text-sm sm:text-base text-slate-800">
                  التفسير اللغوي والتربوي والقاعدة المعتمدة:
                </h5>
              </div>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal mb-3.5">
                {question.explanation}
              </p>

              {question.ruleSummary && (
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-blue-950 font-semibold flex items-start gap-2.5">
                  <span className="text-amber-600 font-extrabold shrink-0">القاعدة المقررة:</span>
                  <span className="leading-relaxed">{question.ruleSummary}</span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Infographic 'ذاكر لي' Modal */}
      <InfographicModal
        lessonName={question.lessonName}
        isOpen={showInfographicModal}
        onClose={() => setShowInfographicModal(false)}
      />

    </div>
  );
};
