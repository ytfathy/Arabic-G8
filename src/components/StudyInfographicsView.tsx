import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Search, 
  Lightbulb, 
  Layers, 
  Feather, 
  CheckCircle2, 
  Printer, 
  ChevronLeft, 
  Eye, 
  BookMarked,
  ArrowRight,
  GraduationCap,
  List,
  LayoutGrid,
  Zap,
  Bookmark,
  Volume2,
  Square
} from 'lucide-react';
import { getAllInfographics, getInfographicById } from '../data/lessonInfographics';
import { LessonInfographic } from '../types/infographics';
import { InfographicModal } from './InfographicModal';
import { speechReader } from '../utils/textSpeechReader';

interface StudyInfographicsViewProps {
  initialLessonId?: string;
  onSelectLessonForExam?: (lessonName: string) => void;
}

export const StudyInfographicsView: React.FC<StudyInfographicsViewProps> = ({
  initialLessonId,
  onSelectLessonForExam
}) => {
  const allInfographics = useMemo(() => getAllInfographics(), []);

  const [selectedUnit, setSelectedUnit] = useState<number | 'all'>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [readingLessonId, setReadingLessonId] = useState<string | null>(null);
  const [activeModalLesson, setActiveModalLesson] = useState<LessonInfographic | null>(() => {
    if (initialLessonId) {
      return getInfographicById(initialLessonId) || null;
    }
    return null;
  });

  useEffect(() => {
    const unsub = speechReader.subscribe((state) => {
      setReadingLessonId(state.isReading ? state.currentId : null);
    });
    return () => {
      unsub();
      speechReader.stop();
    };
  }, []);

  const handleToggleReadLesson = (lessonId: string, textToRead: string) => {
    const speechId = `lesson_${lessonId}`;
    if (readingLessonId === speechId) {
      speechReader.stop();
    } else {
      speechReader.read(speechId, textToRead);
    }
  };

  // Filtered infographics
  const filteredInfographics = useMemo(() => {
    return allInfographics.filter(info => {
      // Unit filter
      if (selectedUnit !== 'all' && info.unit !== selectedUnit) return false;

      // Skill filter
      if (selectedSkill !== 'all' && info.skill !== selectedSkill) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = info.lessonName.toLowerCase().includes(q);
        const matchesSynopsis = info.synopsis.toLowerCase().includes(q);
        const matchesIdea = info.keyIdeas.some(i => i.toLowerCase().includes(q));
        const matchesVocab = (info.vocabularies || []).some(v => 
          v.word.toLowerCase().includes(q) || 
          v.meaning.toLowerCase().includes(q) ||
          (v.antonym && v.antonym.toLowerCase().includes(q))
        );
        const matchesGrammar = (info.grammarRules || []).some(g =>
          g.title.toLowerCase().includes(q) || g.ruleExplanation.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesSynopsis && !matchesIdea && !matchesVocab && !matchesGrammar) {
          return false;
        }
      }

      return true;
    });
  }, [allInfographics, selectedUnit, selectedSkill, searchQuery]);

  // Grouped by unit for the structured list view
  const groupedByUnit = useMemo(() => {
    const unitsMap: { [unit: number]: LessonInfographic[] } = {};
    filteredInfographics.forEach(info => {
      if (!unitsMap[info.unit]) {
        unitsMap[info.unit] = [];
      }
      unitsMap[info.unit].push(info);
    });
    return unitsMap;
  }, [filteredInfographics]);

  const unitTitles: { [unit: number]: { title: string; subtitle: string; badgeColor: string } } = {
    1: { 
      title: 'الوحدة الأولى: انتمائي قوتي', 
      subtitle: 'سيدة المقاومة آمنة دهشان، المعرب والمبني، مصر في خاطري، الألف اللينة', 
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300' 
    },
    2: { 
      title: 'الوحدة الثانية: بيئتي ومستقبلي', 
      subtitle: 'العبور إلى المستقبل، شهيد الواجب محمد مبروك، من أجل غد، في حب مصر، الضمائر والنعت', 
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300' 
    },
    3: { 
      title: 'الوحدة الثالثة: طموحي وبناء وطني', 
      subtitle: 'الخوارزمي رائد الحاسوب، أقدم وديعة، العلم والأخلاق، أسلوب الشرط، العطف، التوكيد، التاء المربوطة', 
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300' 
    }
  };

  const getSkillBadge = (skill: string, skillLabel: string) => {
    switch (skill) {
      case 'grammar':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{skillLabel}</span>
          </span>
        );
      case 'reading':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>{skillLabel}</span>
          </span>
        );
      case 'literature':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-900 border border-purple-200">
            <Feather className="w-3.5 h-3.5 text-purple-600" />
            <span>{skillLabel}</span>
          </span>
        );
      case 'spelling':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-teal-50 text-teal-900 border border-teal-200">
            <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
            <span>{skillLabel}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
            <span>{skillLabel}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300" dir="rtl">
      
      {/* Hero Banner: "ذاكر لي 💡" */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-6 sm:p-9 md:p-12 overflow-hidden shadow-xl border-2 border-amber-400/40">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-amber-400/25 border border-amber-300 text-amber-300 text-sm font-bold mb-4 shadow-sm backdrop-blur-xs">
            <Lightbulb className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
            <span>بوابة المذاكرة الذكية والإنفوجرافيك الشامل للدروس</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            قسم <span className="text-amber-400">«ذاكر لي 💡»</span> — إنفوجرافيك لكل درس
          </h1>
          
          <p className="text-blue-100 text-sm sm:text-base md:text-lg leading-relaxed font-normal mb-8 max-w-3xl">
            ستجد هنا جميع دروس منهج اللغة العربية للصف الثاني الإعدادي مرتبة بالتفصيل. وبجوار كل درس ستجد زراً مباشراً لفتح <strong className="text-amber-300">الإنفوجرافيك الشامل</strong> الذي يحتوي على: معاني المفردات والجمع والمضاد، أهم أفكار الدرس، القواعد النحوية بمعادلات تركيبية وأمثلة معربة، ومواطن الجمال البلاغي.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/15">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 text-center border border-white/15 shadow-sm">
              <span className="block text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">{allInfographics.length}</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-200 mt-1 block">درساً مزوداً بإنفوجرافيك شامل</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 text-center border border-white/15 shadow-sm">
              <span className="block text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">١٢٠+</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-200 mt-1 block">مفردة ومضاد وجمع</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 text-center border border-white/15 shadow-sm">
              <span className="block text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">٢٥+</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-200 mt-1 block">قاعدة نحوية ومعادلة معربة</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 text-center border border-white/15 shadow-sm">
              <span className="block text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">٣</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-200 mt-1 block">وحدات دراسية متكاملة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & View Toggle */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="ابحث باسم الدرس، أو مفردة لغوية، أو قاعدة نحوية (مثال: آمنة دهشان، توكيد، نعت، خوارزمي، الألف اللينة)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-2xl pr-12 pl-4 py-3.5 text-base font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-700 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-inner"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500 hover:text-slate-800 bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-lg transition-colors cursor-pointer"
            >
              مسح البحث
            </button>
          )}
        </div>

        {/* Filters and Layout Mode Toggle */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-3 border-t border-slate-100">
          
          {/* Unit Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-sm font-bold text-slate-600 shrink-0 ml-1">تصفية الوحدة:</span>
            {[
              { id: 'all', label: 'جميع الوحدات (الكل)' },
              { id: 1, label: 'الوحدة الأولى: انتمائي' },
              { id: 2, label: 'الوحدة الثانية: بيئتي' },
              { id: 3, label: 'الوحدة الثالثة: طموحي' }
            ].map(unit => (
              <button
                key={unit.id}
                onClick={() => setSelectedUnit(unit.id as any)}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedUnit === unit.id
                    ? 'bg-blue-950 text-white shadow-sm ring-2 ring-blue-950/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {unit.label}
              </button>
            ))}
          </div>

          {/* View Mode Toggle: List vs Grid */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            <span className="text-sm font-bold text-slate-600">طريقة العرض:</span>
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="عرض القائمة (كل درس بجواره زر إنفوجرافيك)"
              >
                <List className="w-4 h-4 text-blue-900" />
                <span>قائمة منظمة</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="عرض البطاقات والشبكة"
              >
                <LayoutGrid className="w-4 h-4 text-blue-900" />
                <span>شبكة بطاقات</span>
              </button>
            </div>
          </div>

        </div>

        {/* Skill Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-slate-100 pt-3 no-scrollbar">
          <span className="text-sm font-bold text-slate-600 shrink-0 ml-1">الفرع الدراسي:</span>
          {[
            { id: 'all', label: 'جميع الفروع' },
            { id: 'reading', label: 'القراءة والفهم' },
            { id: 'grammar', label: 'النحو والقواعد' },
            { id: 'literature', label: 'النصوص والبلاغة' },
            { id: 'spelling', label: 'قواعد الإملاء' }
          ].map(skill => (
            <button
              key={skill.id}
              onClick={() => setSelectedSkill(skill.id)}
              className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedSkill === skill.id
                  ? 'bg-amber-500 text-blue-950 font-extrabold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {skill.label}
            </button>
          ))}
        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-3">
          <span>قائمة دروس المنهج والإنفوجرافيك التفاعلي</span>
          <span className="px-3 py-0.5 rounded-full text-xs sm:text-sm font-bold bg-amber-100 text-amber-900 border border-amber-300">
            {filteredInfographics.length} درساً
          </span>
        </h2>
      </div>

      {/* VIEW MODE 1: STRUCTURED LIST (Each lesson with button beside it) */}
      {viewMode === 'list' && (
        <div className="space-y-8">
          {[1, 2, 3].map((unitNum) => {
            const lessonsInUnit = groupedByUnit[unitNum] || [];
            if (lessonsInUnit.length === 0) return null;
            const meta = unitTitles[unitNum];

            return (
              <div key={unitNum} className="space-y-4">
                {/* Unit Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-2xl p-4 sm:p-5 border-r-4 border-r-blue-900 border border-slate-200 shadow-xs gap-2">
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-blue-950">
                      {meta?.title || `الوحدة ${unitNum}`}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                      {meta?.subtitle}
                    </p>
                  </div>
                  <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
                    {lessonsInUnit.length} دروس بإنفوجرافيك
                  </span>
                </div>

                {/* Lessons List in Unit */}
                <div className="space-y-3.5">
                  {lessonsInUnit.map((info) => {
                    const vocabCount = (info.vocabularies || []).length;
                    const grammarCount = (info.grammarRules || []).length;
                    const poetryCount = (info.poeticBeauties || []).length;

                    return (
                      <div 
                        key={info.id}
                        className="bg-white rounded-2xl border border-slate-200 hover:border-amber-400 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 card-interactive"
                      >
                        {/* Right Column: Lesson Info */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {getSkillBadge(info.skill, info.skillLabel)}
                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                              الأسبوع {info.week}
                            </span>
                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                              {info.unitTitle}
                            </span>
                          </div>

                          <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 hover:text-blue-950 transition-colors">
                            {info.lessonName}
                          </h4>

                          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal line-clamp-2">
                            {info.synopsis}
                          </p>

                          {/* Quick summary chips */}
                          <div className="flex flex-wrap gap-2 pt-1">
                            {vocabCount > 0 && (
                              <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                                <span>{vocabCount} مفردات ومضادات وجموع</span>
                              </span>
                            )}
                            {grammarCount > 0 && (
                              <span className="bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                <span>{grammarCount} قواعد نحوية معربة</span>
                              </span>
                            )}
                            {poetryCount > 0 && (
                              <span className="bg-purple-50 text-purple-900 border border-purple-200 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5">
                                <Feather className="w-3.5 h-3.5 text-purple-600" />
                                <span>{poetryCount} مواطن جمال بلاغي</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Left Column: Dedicated Prominent Buttons Beside the Lesson */}
                        <div className="shrink-0 flex flex-wrap sm:flex-nowrap items-center justify-end gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleToggleReadLesson(info.id, `درس: ${info.lessonName}. ${info.synopsis}. ${(info.keyIdeas || []).length > 0 ? 'أهم المحاور: ' + info.keyIdeas.join('، ') : ''}`)}
                            className={`px-4 py-3 rounded-2xl text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                              readingLessonId === `lesson_${info.id}`
                                ? 'bg-red-500 text-white border-red-600 shadow-md animate-pulse ring-2 ring-red-300'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 hover:border-emerald-400 shadow-xs'
                            }`}
                            title={readingLessonId === `lesson_${info.id}` ? 'إيقاف الاستماع' : `استمع إلى ملخص درس ${info.lessonName}`}
                          >
                            {readingLessonId === `lesson_${info.id}` ? (
                              <>
                                <Square className="w-4 h-4 fill-white" />
                                <span>إيقاف ⏹️</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-4 h-4 text-emerald-700" />
                                <span>اقرأ لي 🔊</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveModalLesson(info)}
                            className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-950 font-extrabold px-5 py-3 rounded-2xl text-sm sm:text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer transform active:scale-95 border border-amber-300 btn-glow-gold"
                            title={`فتح الإنفوجرافيك الشامل لدرس ${info.lessonName}`}
                          >
                            <Lightbulb className="w-5 h-5 text-blue-950 fill-blue-950" />
                            <span>عرض الإنفوجرافيك الشامل 💡</span>
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: GRID CARDS VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInfographics.map((info) => {
            const vocabCount = (info.vocabularies || []).length;
            const grammarCount = (info.grammarRules || []).length;
            const poetryCount = (info.poeticBeauties || []).length;

            return (
              <div 
                key={info.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group card-interactive"
              >
                <div className="p-5 sm:p-6 space-y-3">
                  {/* Card Top Meta */}
                  <div className="flex items-center justify-between gap-2">
                    {getSkillBadge(info.skill, info.skillLabel)}
                    <span className="text-xs font-bold text-slate-500">
                      الأسبوع {info.week} · و {info.unit}
                    </span>
                  </div>

                  {/* Lesson Name */}
                  <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 group-hover:text-blue-950 transition-colors leading-snug">
                    {info.lessonName}
                  </h3>

                  {/* Synopsis Excerpt */}
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal line-clamp-3">
                    {info.synopsis}
                  </p>

                  {/* Inside Chips */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {vocabCount > 0 && (
                      <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-amber-600" />
                        <span>{vocabCount} مفردات</span>
                      </span>
                    )}
                    {grammarCount > 0 && (
                      <span className="bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-600" />
                        <span>{grammarCount} قواعد</span>
                      </span>
                    )}
                    {poetryCount > 0 && (
                      <span className="bg-purple-50 text-purple-900 border border-purple-200 px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1">
                        <Feather className="w-3 h-3 text-purple-600" />
                        <span>{poetryCount} جماليات</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Button Beside/Bottom */}
                <div className="p-4 sm:p-5 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleReadLesson(info.id, `درس: ${info.lessonName}. ${info.synopsis}. ${(info.keyIdeas || []).length > 0 ? 'أهم المحاور: ' + info.keyIdeas.join('، ') : ''}`)}
                    className={`shrink-0 px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                      readingLessonId === `lesson_${info.id}`
                        ? 'bg-red-500 text-white border-red-600 shadow-md animate-pulse ring-2 ring-red-300'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 hover:border-emerald-400 shadow-xs'
                    }`}
                    title={readingLessonId === `lesson_${info.id}` ? 'إيقاف الاستماع' : `استمع إلى ملخص درس ${info.lessonName}`}
                  >
                    {readingLessonId === `lesson_${info.id}` ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-white" />
                        <span>إيقاف ⏹️</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>اقرأ لي 🔊</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModalLesson(info)}
                    className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-950 font-extrabold px-3 py-3 rounded-2xl text-xs sm:text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer transform active:scale-95 border border-amber-300 btn-glow-gold"
                  >
                    <Lightbulb className="w-4 h-4 text-blue-950 fill-blue-950" />
                    <span>عرض الإنفوجرافيك 💡</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredInfographics.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <BookMarked className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">لم يتم العثور على دروس مطابقة لبحثك</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            تأكد من كتابة الكلمة بشكل صحيح أو قم بإعادة ضبط معايير التصفية والوحدات
          </p>
          <button 
            onClick={() => {
              setSelectedUnit('all');
              setSelectedSkill('all');
              setSearchQuery('');
            }}
            className="px-6 py-3 bg-blue-950 text-white rounded-2xl text-sm font-bold shadow-md hover:bg-blue-900 transition-all cursor-pointer"
          >
            إعادة تعيين جميع الفلاتر
          </button>
        </div>
      )}

      {/* Active Modal */}
      {activeModalLesson && (
        <InfographicModal 
          infographic={activeModalLesson}
          isOpen={true}
          onClose={() => setActiveModalLesson(null)}
        />
      )}

    </div>
  );
};
