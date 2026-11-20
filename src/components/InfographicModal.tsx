import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  CheckCircle2, 
  AlertTriangle, 
  Feather, 
  HelpCircle, 
  User, 
  Search, 
  Copy, 
  Check, 
  Printer, 
  ExternalLink,
  Layers,
  ArrowRight,
  Volume2,
  Square
} from 'lucide-react';
import { LessonInfographic, VocabularyItem } from '../types/infographics';
import { getInfographicByLessonName } from '../data/lessonInfographics';
import { speechReader } from '../utils/textSpeechReader';

interface InfographicModalProps {
  lessonName?: string;
  infographic?: LessonInfographic;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToFullStudy?: (lessonId: string) => void;
}

export const InfographicModal: React.FC<InfographicModalProps> = ({
  lessonName,
  infographic: initialInfographic,
  isOpen,
  onClose,
  onNavigateToFullStudy
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'vocab' | 'grammar' | 'poetry' | 'examQA'>('summary');
  const [vocabSearch, setVocabSearch] = useState('');
  const [copiedWord, setCopiedWord] = useState<string | null>(null);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = speechReader.subscribe((state) => {
      setActiveSpeechId(state.isReading ? state.currentId : null);
    });
    return () => {
      unsub();
      speechReader.stop();
    };
  }, []);

  const handleCloseModal = () => {
    speechReader.stop();
    onClose();
  };

  const handleToggleRead = (id: string, text: string) => {
    if (activeSpeechId === id) {
      speechReader.stop();
    } else {
      speechReader.read(id, text);
    }
  };

  if (!isOpen) return null;

  // Resolve infographic
  const info: LessonInfographic | undefined = initialInfographic || (lessonName ? getInfographicByLessonName(lessonName) : undefined);

  if (!info) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" dir="rtl">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center shadow-2xl">
          <p className="text-slate-700 font-bold mb-4">عذراً، لم يتوفر إنفوجرافيك لهذا الدرس حالياً.</p>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-900 text-white rounded-xl font-bold cursor-pointer hover:bg-blue-800"
          >
            إغلاق
          </button>
        </div>
      </div>
    );
  }

  const handleCopyWord = (word: string) => {
    navigator.clipboard?.writeText(word);
    setCopiedWord(word);
    setTimeout(() => setCopiedWord(null), 2000);
  };

  const filteredVocab = (info.vocabularies || []).filter(v => {
    if (!vocabSearch.trim()) return true;
    const s = vocabSearch.toLowerCase();
    return v.word.toLowerCase().includes(s) || 
           v.meaning.toLowerCase().includes(s) || 
           (v.antonym && v.antonym.toLowerCase().includes(s)) ||
           (v.pluralOrSingular && v.pluralOrSingular.toLowerCase().includes(s));
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6" dir="rtl">
      <div 
        className="relative bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-amber-200/80 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Decorative Banner */}
        <div className="bg-gradient-to-l from-blue-950 via-blue-900 to-indigo-950 text-white p-5 sm:p-6 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-blue-950 flex items-center justify-center font-black text-2xl shadow-md shrink-0 border border-amber-300">
                💡
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="bg-amber-400/25 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold shadow-xs">
                    ذاكر لي 💡 · إنفوجرافيك الدرس
                  </span>
                  <span className="text-slate-200 text-xs sm:text-sm font-semibold">
                    {info.unitTitle} · الأسبوع {info.week}
                  </span>
                  <span className="bg-blue-800/90 text-blue-100 px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-bold">
                    {info.skillLabel}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {info.lessonName}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => window.print()}
                title="طباعة إنفوجرافيك الدرس"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors cursor-pointer border border-white/15"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>طباعة</span>
              </button>
              <button
                onClick={handleCloseModal}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/15"
                aria-label="إغلاق النافذة"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-white/15 no-scrollbar">
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'summary' 
                  ? 'bg-amber-400 text-blue-950 shadow-sm font-black' 
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>ملخص الدرس والأفكار</span>
            </button>

            {info.vocabularies && info.vocabularies.length > 0 && (
              <button
                onClick={() => setActiveTab('vocab')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'vocab' 
                    ? 'bg-amber-400 text-blue-950 shadow-sm font-black' 
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>المفردات والأضداد ({info.vocabularies.length})</span>
              </button>
            )}

            {info.grammarRules && info.grammarRules.length > 0 && (
              <button
                onClick={() => setActiveTab('grammar')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'grammar' 
                    ? 'bg-amber-400 text-blue-950 shadow-sm font-black' 
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>القواعد النحوية والإعراب</span>
              </button>
            )}

            {info.poeticBeauties && info.poeticBeauties.length > 0 && (
              <button
                onClick={() => setActiveTab('poetry')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'poetry' 
                    ? 'bg-amber-400 text-blue-950 shadow-sm font-black' 
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                <Feather className="w-4 h-4" />
                <span>مواطن الجمال والبلاغة ({info.poeticBeauties.length})</span>
              </button>
            )}

            {info.examKeyQA && info.examKeyQA.length > 0 && (
              <button
                onClick={() => setActiveTab('examQA')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'examQA' 
                    ? 'bg-amber-400 text-blue-950 shadow-sm font-black' 
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>أسئلة الامتحانات المتكررة ({info.examKeyQA.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">

          {/* TAB 1: SUMMARY & CORE IDEAS */}
          {activeTab === 'summary' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Synopsis Hero Card */}
              <div className={`border-2 rounded-3xl p-5 sm:p-6 shadow-xs transition-all ${
                activeSpeechId === `modal_synopsis_${info.id}`
                  ? 'bg-amber-100/90 border-amber-400 ring-2 ring-amber-300'
                  : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 text-amber-950 font-black text-base sm:text-lg">
                    <span className="p-1.5 rounded-lg bg-amber-400 text-blue-950">📌</span>
                    <span>عما يتحدث هذا الدرس؟ (ملخص شامل ومكثف)</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleRead(`modal_synopsis_${info.id}`, info.synopsis)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-2xs active:scale-95 ${
                      activeSpeechId === `modal_synopsis_${info.id}`
                        ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-md ring-2 ring-rose-300'
                        : 'bg-amber-400 hover:bg-amber-500 text-blue-950 border border-amber-300 btn-glow-gold'
                    }`}
                    title="استمع إلى ملخص الدرس بصوت فصيح وواضح"
                  >
                    {activeSpeechId === `modal_synopsis_${info.id}` ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-white text-white" />
                        <span>إيقاف القراءة</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-blue-950" />
                        <span>اقرأ لي 🔊</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-slate-900 leading-relaxed font-medium text-lg sm:text-xl">
                  {info.synopsis}
                </p>
              </div>

              {/* Author / Figure Bio if available */}
              {info.authorBio && (
                <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-950 text-amber-300 flex items-center justify-center shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-blue-950 text-lg sm:text-xl">
                      {info.authorBio.name} {info.authorBio.title ? `(${info.authorBio.title})` : ''}
                    </h4>
                    {info.authorBio.era && (
                      <span className="text-sm sm:text-base text-blue-800 font-bold block mb-1">
                        العصر: {info.authorBio.era}
                      </span>
                    )}
                    <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
                      {info.authorBio.brief}
                    </p>
                  </div>
                </div>
              )}

              {/* Key Ideas Infographic Grid */}
              <div>
                <h3 className="font-extrabold text-slate-900 text-xl mb-4 flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-blue-950" />
                  <span>أهم الأفكار الرئيسة التي يدور حولها الدرس</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {info.keyIdeas.map((idea, idx) => (
                    <div 
                      key={idx}
                      className="bg-white border border-slate-200 hover:border-blue-400 p-4 sm:p-5 rounded-2xl flex items-start gap-3.5 shadow-2xs hover:shadow-xs transition-all"
                    >
                      <span className="w-8 h-8 rounded-xl bg-blue-950 text-amber-300 font-extrabold text-sm sm:text-base flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">
                        {idea}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Values & Takeaways */}
              {info.takeaways && info.takeaways.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5">
                  <h4 className="font-extrabold text-emerald-950 text-base mb-2.5 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>القيم والدروس المستفادة:</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-sm sm:text-base text-emerald-900 font-medium leading-relaxed">
                    {info.takeaways.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VOCABULARY & ANTONYMS */}
          {activeTab === 'vocab' && info.vocabularies && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Search in Vocab */}
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                <Search className="w-5 h-5 text-slate-400 mr-1" />
                <input 
                  type="text"
                  placeholder="ابحث عن كلمة، معنى، مضاد أو جمع في معجم الدرس..."
                  value={vocabSearch}
                  onChange={(e) => setVocabSearch(e.target.value)}
                  className="bg-transparent border-none text-sm sm:text-base text-slate-800 focus:outline-hidden w-full font-medium"
                />
                {vocabSearch && (
                  <button onClick={() => setVocabSearch('')} className="text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
                    مسح
                  </button>
                )}
              </div>

              {/* Vocab Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
                <table className="w-full text-right text-base">
                  <thead className="bg-blue-950 text-white font-extrabold text-sm sm:text-base">
                    <tr>
                      <th className="p-4">الكلمة</th>
                      <th className="p-4">المعنى والشرح</th>
                      <th className="p-4">المضاد والعكس</th>
                      <th className="p-4">الجمع أو المفرد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVocab.map((v, i) => (
                      <tr key={i} className="hover:bg-amber-50/70 transition-colors">
                        <td className="p-4 font-black text-blue-950 whitespace-nowrap text-lg sm:text-xl">
                          <div className="flex items-center gap-2">
                            <span>{v.word}</span>
                            <button
                              onClick={() => handleCopyWord(v.word)}
                              className="text-slate-400 hover:text-blue-900 transition-colors cursor-pointer"
                              title="نسخ الكلمة"
                            >
                              {copiedWord === v.word ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-slate-800 text-base sm:text-lg leading-relaxed">
                          {v.meaning}
                        </td>
                        <td className="p-4 text-rose-700 font-bold text-base sm:text-lg">
                          {v.antonym || <span className="text-slate-300">-</span>}
                        </td>
                        <td className="p-4 text-indigo-700 font-bold text-base sm:text-lg">
                          {v.pluralOrSingular || <span className="text-slate-300">-</span>}
                        </td>
                      </tr>
                    ))}
                    {filteredVocab.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500 font-bold text-base">
                          لم يتم العثور على كلمات مطابقة لبحثك.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: GRAMMAR RULES & PARSING */}
          {activeTab === 'grammar' && info.grammarRules && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {info.grammarRules.map((rule, idx) => (
                <div key={idx} className="bg-white border-2 border-blue-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                  {/* Rule Header & Formula */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-blue-950 text-amber-300 font-extrabold text-sm flex items-center justify-center shadow-xs">
                        ق {idx + 1}
                      </span>
                      <h4 className="font-extrabold text-blue-950 text-lg sm:text-xl">
                        {rule.title}
                      </h4>
                    </div>
                    <p className="text-base sm:text-lg font-medium text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed">
                      {rule.ruleExplanation}
                    </p>
                  </div>

                  {/* Formula banner if available */}
                  {rule.structureFormula && (
                    <div className="bg-amber-100/80 border border-amber-300 rounded-2xl p-4 flex flex-wrap items-center gap-3">
                      <span className="text-xs sm:text-sm font-black text-amber-950 bg-amber-400 px-3 py-1 rounded-lg shrink-0 shadow-2xs">
                        معادلة القاعدة
                      </span>
                      <span className="font-extrabold text-blue-950 text-sm sm:text-base">
                        {rule.structureFormula}
                      </span>
                    </div>
                  )}

                  {/* Examples Table */}
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-sm sm:text-base mb-2.5">
                      أمثلة نموذجية مع الإعراب الكامل:
                    </h5>
                    <div className="space-y-2.5">
                      {rule.examples.map((ex, exIdx) => (
                        <div key={exIdx} className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="font-extrabold text-blue-950 text-base sm:text-lg">
                            «{ex.sentence}»
                          </div>
                          <div className="text-sm font-bold text-indigo-950 bg-white border border-indigo-200 px-3.5 py-1.5 rounded-xl shadow-2xs">
                            {ex.parsing}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Warning / Common Pitfall */}
                  {rule.warningNotice && (
                    <div className="bg-rose-50 border-r-4 border-rose-500 p-4 rounded-2xl flex items-start gap-3 shadow-2xs">
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-rose-900 text-sm block mb-1">
                          انتبه ولا تخلط! (فارق إعرابي هام)
                        </span>
                        <p className="text-sm sm:text-base text-rose-950 font-medium leading-relaxed">
                          {rule.warningNotice}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: POETIC BEAUTIES */}
          {activeTab === 'poetry' && info.poeticBeauties && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 gap-3.5">
                {info.poeticBeauties.map((beauty, idx) => {
                  const speechId = `modal_verse_${info.id}_${idx}`;
                  const isVerseSpeaking = activeSpeechId === speechId;

                  return (
                    <div key={idx} className={`bg-white border rounded-2xl p-5 shadow-2xs hover:border-amber-400 transition-all ${
                      isVerseSpeaking ? 'border-amber-400 ring-2 ring-amber-300 bg-amber-50/50' : 'border-slate-200'
                    }`}>
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                        <span className="font-extrabold text-blue-950 text-base sm:text-lg">
                          «{beauty.verseExcerpt}»
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleRead(speechId, beauty.verseExcerpt)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isVerseSpeaking
                                ? 'bg-rose-600 text-white animate-pulse'
                                : 'bg-amber-100 hover:bg-amber-200 text-amber-950'
                            }`}
                            title="استمع لنطق البيت الشعري"
                          >
                            {isVerseSpeaking ? (
                              <>
                                <Square className="w-3 h-3 fill-white text-white" />
                                <span>إيقاف</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-amber-900" />
                                <span>اقرأ لي 🔊</span>
                              </>
                            )}
                          </button>
                          <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                            {beauty.deviceType}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                        {beauty.analysis}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: EXAM KEY Q&A */}
          {activeTab === 'examQA' && info.examKeyQA && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {info.examKeyQA.map((qa, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-md bg-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      س{idx + 1}
                    </span>
                    <h5 className="font-black text-blue-950 text-sm">
                      {qa.question}
                    </h5>
                  </div>
                  <div className="pr-8 text-xs sm:text-sm text-slate-800 font-medium leading-relaxed bg-white border border-slate-100 p-3 rounded-xl">
                    <span className="font-bold text-emerald-700 ml-1">ج:</span>
                    {qa.answer}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-bold text-slate-500 hidden sm:block">
            International Education Egypt · منصة تقييمات لغتي
          </div>
          <div className="flex items-center gap-2 mr-auto">
            {onNavigateToFullStudy && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToFullStudy(info.id);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                <span>فتح في قسم ذاكر لي الكامل</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
