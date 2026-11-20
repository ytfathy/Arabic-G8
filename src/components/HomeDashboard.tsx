import React, { useState } from 'react';
import { 
  Calendar, 
  Layers, 
  Sparkles, 
  Award, 
  TrendingUp, 
  BookOpen, 
  CheckCircle, 
  ArrowLeft, 
  Flame, 
  Star, 
  Compass, 
  FileCheck2, 
  Lightbulb, 
  Zap, 
  GraduationCap,
  Volume2,
  Play
} from 'lucide-react';
import { StudentStats, Badge } from '../types/curriculum';
import { NavTab } from './Navbar';
import { getAllQuestions } from '../data/questionBank';
import { mascotService } from '../utils/mascotService';

interface HomeDashboardProps {
  stats: StudentStats;
  onNavigate: (tab: NavTab) => void;
  onOpenExamGenerator: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  stats,
  onNavigate,
  onOpenExamGenerator
}) => {
  const allQuestions = getAllQuestions();
  const totalQuestionsInBank = allQuestions.length;
  const accuracyPercentage = stats.totalAnswered > 0 
    ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) 
    : 0;

  const unlockedBadgesCount = stats.badges.filter(b => b.unlockedAt).length;

  const [mascotTip, setMascotTip] = useState<string>(
    'مرحباً بك يا بطل! أنا فصيح 🦉، جاهز لمساعدتك خطوة بخطوة لتحقيق المركز الأول في تقييمات الوزارة!'
  );
  const [isMascotTalking, setIsMascotTalking] = useState<boolean>(false);

  const handleAskMascot = () => {
    const tips = [
      'أحسنت يا بطل! تذكر أن أسئلة القراءة تعتمد على الفهم والتطبيق الدقيق 🌟',
      'قواعد النحو سهلة وممتعة! دقق دائماً في موقع الكلمة الإعرابي وعلامتها 💪',
      'راجع معاني الكلمات ومواطن الجمال في قسم «ذاكر لي 💡» قبل أن تبدأ أي تقييم!',
      'كل خطأ في التدريب هو خطوة حقيقية لضمان الدرجة النهائية في الامتحان! 🚀',
      'أنت طالب متميز ومجتهد، وستحصد أعلى الأوسمة بإذن الله! 🏆'
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setMascotTip(randomTip);
    setIsMascotTalking(true);
    mascotService.notifyTip(randomTip);
    setTimeout(() => setIsMascotTalking(false), 4500);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-10" dir="rtl">
      
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 text-white p-5 sm:p-8 md:p-10 lg:p-12 overflow-hidden shadow-2xl border-2 border-amber-400/50">
        
        {/* Animated Background Glow Orbs & Twinkling Stars */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* Twinkling ambient stars */}
        <span className="absolute top-6 left-1/4 text-amber-300 text-lg animate-twinkle pointer-events-none select-none">✦</span>
        <span className="absolute top-1/3 left-12 text-amber-200 text-sm animate-twinkle pointer-events-none select-none" style={{ animationDelay: '1.2s' }}>★</span>
        <span className="absolute bottom-8 left-1/3 text-amber-300 text-base animate-twinkle pointer-events-none select-none" style={{ animationDelay: '0.6s' }}>✦</span>
        <span className="absolute top-10 right-1/3 text-amber-200 text-xs animate-twinkle pointer-events-none select-none" style={{ animationDelay: '1.8s' }}>★</span>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-10">
          
          {/* Right Column: Inspiring Text & Action Buttons */}
          <div className="max-w-2xl text-right flex-1">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black mb-4 backdrop-blur-xs shadow-xs animate-float-soft">
              <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              <span>International Education Egypt · منصة التقييمات الرسمية</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4 text-white">
              تعلّم لغة الضاد بإتقان، وتميّز في تقييماتك المدرسية
            </h1>
            
            <p className="text-blue-100 text-sm sm:text-base md:text-lg leading-relaxed font-medium">
              منصة تفاعلية مبنية بالكامل على كتاب التقييمات والأداءات الصفية والمنزلية الخاص بوزارة التربية والتعليم للصف الثاني الإعدادي (الفصل الدراسي الأول). استعد لاختباراتك بحل نصوص القراءة، تدريبات النحو، الإملاء، والنصوص الشعرية مع التصحيح الفوري والشرح النموذجي لكل سؤال.
            </p>
          </div>

          {/* Left Column: Interactive Animated Student Mascot Card */}
          <div className="w-full lg:w-auto shrink-0 flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md bg-white/10 backdrop-blur-md border border-white/25 rounded-3xl p-5 sm:p-6 shadow-2xl text-center overflow-hidden">
              
              {/* Floating Mini-Badge (Top Right) */}
              <div className="absolute top-3 right-3 bg-amber-400 text-blue-950 font-black text-xs px-3 py-1 rounded-full shadow-md animate-float-soft flex items-center gap-1 border border-amber-300">
                <Star className="w-3.5 h-3.5 fill-blue-950 text-blue-950" />
                <span>المستوى {stats.level}</span>
              </div>

              {/* Floating Mini-Badge (Top Left) */}
              <div className="absolute top-3 left-3 bg-emerald-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-md animate-float-delay flex items-center gap-1">
                <span>{accuracyPercentage}٪ دقة</span>
              </div>

              {/* Central Mascot Character & Glowing Aura */}
              <div className="relative my-4 flex justify-center">
                <div 
                  onClick={handleAskMascot}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 text-blue-950 flex items-center justify-center font-black text-5xl sm:text-6xl shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-transform animate-float-slow border-4 border-white/40 group"
                  title="اضغط هنا لتستمع لنصيحة فصيح بصوته 🦉"
                >
                  <span className="transform group-hover:rotate-6 transition-transform">🦉</span>
                  <div className="absolute inset-0 rounded-full border-2 border-amber-300 animate-ping opacity-30 pointer-events-none" />
                </div>
              </div>

              {/* Speech / Tip Balloon (Clickable to hear tip) */}
              <div 
                onClick={handleAskMascot}
                className="bg-blue-950/80 hover:bg-blue-900/90 border border-amber-400/40 rounded-2xl p-3.5 mb-2 text-xs sm:text-sm text-amber-100 font-semibold leading-relaxed shadow-inner cursor-pointer transition-colors group"
                title="اضغط على فصيح أو النصيحة للاستماع لصوته 🦉"
              >
                <p className="line-clamp-3">
                  {mascotTip}
                </p>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-amber-300 font-bold mt-2 pt-1.5 border-t border-white/10">
                  <Volume2 className={`w-3.5 h-3.5 text-amber-300 ${isMascotTalking ? 'animate-bounce' : ''}`} />
                  <span>{isMascotTalking ? 'فصيح يتحدث الآن...' : 'انقر هنا للاستماع لنصيحة فصيح 🔊'}</span>
                </div>
              </div>

              {/* Quick XP Progress Indicator */}
              <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-blue-200">
                <span className="font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{stats.xp} نقطة XP</span>
                </span>
                <span className="font-medium text-slate-300">
                  {stats.totalCorrect} إجابة صحيحة
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Gamification Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex items-center gap-4 card-interactive">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 border border-blue-100">
            <CheckCircle className="w-7 h-7 text-blue-900" />
          </div>
          <div>
            <span className="text-xs sm:text-sm text-slate-500 font-bold block mb-0.5">الأسئلة المحلولة</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {stats.totalAnswered} <span className="text-sm sm:text-base font-bold text-slate-400">/ {totalQuestionsInBank}</span>
            </span>
            <span className="text-xs text-emerald-700 block font-bold mt-0.5">٣٧٦ سؤالاً من كتاب تقييمات الوزارة</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex items-center gap-4 card-interactive">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <TrendingUp className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <span className="text-xs sm:text-sm text-slate-500 font-bold block mb-0.5">نسبة الدقة</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
              {accuracyPercentage}٪
            </span>
            <span className="text-xs text-slate-500 block font-bold mt-0.5">{stats.totalCorrect} إجابة صحيحة</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex items-center gap-4 card-interactive">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Award className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <span className="text-xs sm:text-sm text-slate-500 font-bold block mb-0.5">المستوى والأوسمة</span>
            <span className="text-2xl sm:text-3xl font-black text-purple-900 font-mono">
              المستوى {stats.level}
            </span>
            <span className="text-xs text-slate-500 block font-bold mt-0.5">{unlockedBadgesCount} من ٧ أوسمة</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex items-center gap-4 card-interactive">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Flame className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <span className="text-xs sm:text-sm text-slate-500 font-bold block mb-0.5">نقاط التميز XP</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
              {stats.xp} XP
            </span>
            <span className="text-xs text-slate-500 block font-bold mt-0.5">نشاط دراسي متواصل</span>
          </div>
        </div>

      </div>

      {/* Animated Daily Rapid Challenge Hook */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-950 to-blue-900 border-2 border-amber-400/60 p-5 sm:p-7 shadow-xl overflow-hidden card-interactive">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        <span className="absolute top-3 left-10 text-amber-300 text-lg animate-twinkle pointer-events-none select-none">✦</span>
        <span className="absolute bottom-3 right-1/4 text-amber-200 text-sm animate-twinkle pointer-events-none select-none" style={{ animationDelay: '1s' }}>★</span>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 text-white">
          <div className="flex items-center gap-4 text-right">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-blue-950 flex items-center justify-center text-3xl shrink-0 shadow-lg border-2 border-amber-300 animate-float-soft">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-amber-400 text-blue-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                  تحدي سريع ⏱️
                </span>
                <span className="text-xs text-amber-300 font-bold">
                  محاكاة اختبارات الوزارة الشهرية
                </span>
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-white">
                تحدي الـ ٥ أسئلة السريع لليوم
              </h3>
              <p className="text-xs sm:text-sm text-blue-200 font-medium mt-0.5 max-w-xl leading-relaxed">
                اختبر معلوماتك في ٣ دقائق عبر أسئلة منتقاة من بنك أسئلة الوزارة مع التصحيح الفوري والشرح النموذجي!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
            <button
              type="button"
              onClick={onOpenExamGenerator}
              className="w-full md:w-auto bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-950 font-black px-6 py-3.5 rounded-2xl text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer transform active:scale-95 border border-amber-300 btn-glow-gold"
            >
              <Play className="w-4 h-4 text-blue-950 fill-blue-950" />
              <span>ابدأ التحدي السريع الآن 🚀</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Learning Modes Hub */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-blue-950">
              مسارات التعلم وحل تقييمات الوزارة
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
              اختر المسار الأنسب لطريقتك في المذاكرة والمراجعة
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          
          {/* Card 1: Mode A - Weekly Assessments (Royal Indigo Blue) */}
          <div 
            onClick={() => onNavigate('weekly')}
            className="group bg-gradient-to-br from-blue-50/95 via-indigo-50/50 to-white rounded-3xl border-2 border-blue-200/90 hover:border-blue-500 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:shadow-blue-500/10 transition-all cursor-pointer flex flex-col justify-between card-interactive relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-800 to-indigo-900 text-amber-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md border border-blue-700">
                <Calendar className="w-7 h-7" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-black bg-blue-100 text-blue-900 border border-blue-300 mb-2">
                النمط الأول (Mode A)
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-blue-950 mb-2.5">
                التقييمات الأسبوعية
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                حل كتاب الأداءات أسبوعاً بأسبوع طبقاً لترتيب كتاب الوزارة (الأسابيع ١ - ١٤) مع التصحيح الفوري ونقاط التميز.
              </p>
            </div>

            <div className="relative z-10 pt-5 mt-5 border-t border-blue-200/70 flex items-center justify-between text-sm sm:text-base font-black text-blue-950 group-hover:text-blue-700 transition-colors">
              <span className="bg-blue-100/80 px-3.5 py-1.5 rounded-xl border border-blue-200">تصفح الأسابيع (١٤ أسبوعاً)</span>
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform text-blue-800" />
            </div>
          </div>

          {/* Card 2: Mode B - Skill Practice (Emerald Green) */}
          <div 
            onClick={() => onNavigate('skills')}
            className="group bg-gradient-to-br from-emerald-50/95 via-teal-50/50 to-white rounded-3xl border-2 border-emerald-200/90 hover:border-emerald-500 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:shadow-emerald-500/10 transition-all cursor-pointer flex flex-col justify-between card-interactive relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md border border-emerald-500">
                <Layers className="w-7 h-7" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-black bg-emerald-100 text-emerald-950 border border-emerald-300 mb-2">
                النمط الثاني (Mode B)
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-950 mb-2.5">
                التدريب حسب المهارة
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                تجميع أسئلة الكتاب حسب الفروع: النحو، القراءة والفهم، النصوص الشعرية، الإملاء، مع خاصية «اقرأ لي 🔊».
              </p>
            </div>

            <div className="relative z-10 pt-5 mt-5 border-t border-emerald-200/70 flex items-center justify-between text-sm sm:text-base font-black text-emerald-950 group-hover:text-emerald-700 transition-colors">
              <span className="bg-emerald-100/80 px-3.5 py-1.5 rounded-xl border border-emerald-200">اختر المهارة وتدرب</span>
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform text-emerald-800" />
            </div>
          </div>

          {/* Card 3: Mode C - 'ذاكر لي' Infographics (Royal Purple) */}
          <div 
            onClick={() => onNavigate('study')}
            className="group bg-gradient-to-br from-purple-50/95 via-fuchsia-50/50 to-white rounded-3xl border-2 border-purple-200/90 hover:border-purple-500 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:shadow-purple-500/10 transition-all cursor-pointer flex flex-col justify-between card-interactive relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-800 text-amber-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md border border-purple-600">
                <Lightbulb className="w-7 h-7 fill-amber-300 text-amber-300" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-black bg-purple-100 text-purple-950 border border-purple-300 mb-2">
                خاص وحصري 💡
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-purple-950 mb-2.5">
                ذاكر لي (الإنفوجرافيك)
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                ملخص شامل لكل درس، معجم المفردات والمضاد، القواعد النحوية مع الإعراب، ومواطن الجمال البلاغي للمذاكرة السريعة.
              </p>
            </div>

            <div className="relative z-10 pt-5 mt-5 border-t border-purple-200/70 flex items-center justify-between text-sm sm:text-base font-black text-purple-950 group-hover:text-purple-700 transition-colors">
              <span className="bg-purple-100/80 px-3.5 py-1.5 rounded-xl border border-purple-200">استعرض الإنفوجرافيك</span>
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform text-purple-800" />
            </div>
          </div>

          {/* Card 4: Mode D - Smart Exam Generator (Warm Amber & Gold) */}
          <div 
            onClick={onOpenExamGenerator}
            className="group bg-gradient-to-br from-amber-50 via-orange-50/60 to-yellow-50/90 rounded-3xl border-2 border-amber-300 hover:border-amber-500 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:shadow-amber-500/15 transition-all cursor-pointer flex flex-col justify-between card-interactive relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-blue-950 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md border border-amber-300 btn-glow-gold">
                <Sparkles className="w-7 h-7 text-blue-950 fill-blue-950" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-black bg-amber-200 text-amber-950 border border-amber-400 mb-2">
                تخصيص ذكي ⚡
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-amber-950 mb-2.5">
                منشئ الامتحانات الذكي
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                صمم اختبارك بنفسك؛ حدد الدروس والفروع وعدد الأسئلة والوقت لمحاكاة امتحانات الشهور ونصف العام بدقة.
              </p>
            </div>

            <div className="relative z-10 pt-5 mt-5 border-t border-amber-300/70 flex items-center justify-between text-sm sm:text-base font-black text-amber-950 group-hover:text-amber-800 transition-colors">
              <span className="bg-amber-200/80 px-3.5 py-1.5 rounded-xl border border-amber-300">توليد وبدء الامتحان</span>
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform text-amber-900" />
            </div>
          </div>

        </div>
      </div>

      {/* Curriculum Units Overview */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 md:p-10 shadow-xs">
        <h3 className="text-xl sm:text-2xl font-extrabold text-blue-950 mb-2">
          وحدات المنهج الدراسي المقرر (الصف الثاني الإعدادي)
        </h3>
        <p className="text-sm sm:text-base text-slate-500 font-medium mb-6">
          استكشف موضوعات كل وحدة ومصادر الفهم المرتبطة بها
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-blue-50/60 border border-blue-200 card-interactive">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs sm:text-sm font-extrabold text-blue-950 bg-white px-3 py-1 rounded-lg border border-blue-200 shadow-2xs">
                الوحدة الأولى
              </span>
              <span className="text-xs sm:text-sm text-slate-500 font-bold">الأسابيع ١ - ٥</span>
            </div>
            <h4 className="font-extrabold text-lg text-blue-950 mb-2.5">«انتمائي قُوَّتي»</h4>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              آمنة دهشان · العبور إلى المستقبل · الشهيد محمد مبروك · مصر التي في خاطري · المعرب والمبني · الألف اللينة.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200 card-interactive">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs sm:text-sm font-extrabold text-emerald-950 bg-white px-3 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                الوحدة الثانية
              </span>
              <span className="text-xs sm:text-sm text-slate-500 font-bold">الأسابيع ٦ - ١٠</span>
            </div>
            <h4 className="font-extrabold text-lg text-emerald-950 mb-2.5">«بيئتي مَسْئُولِيَّتِي»</h4>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              أقدم وديعة · من أجل غد · في حب مصر · الضمائر البارزة والمستترة · النعت وأنواعه · أدوات الشرط الجازمة.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200 card-interactive">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs sm:text-sm font-extrabold text-amber-950 bg-white px-3 py-1 rounded-lg border border-amber-200 shadow-2xs">
                الوحدة الثالثة
              </span>
              <span className="text-xs sm:text-sm text-slate-500 font-bold">الأسابيع ١١ - ١٤</span>
            </div>
            <h4 className="font-extrabold text-lg text-amber-950 mb-2.5">«طموحي وبناء وطني»</h4>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              الخوارزمي رائد الحاسوب · العلم والأخلاق · أسلوب الشرط · حروف العطف · التوكيد بأنواعه · التاء والهاء.
            </p>
          </div>

        </div>
      </div>

      {/* Badges & Achievements Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl border border-blue-800/40">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Award className="w-7 h-7 text-amber-400" />
            <h3 className="font-extrabold text-xl sm:text-2xl text-white">أوسمة الإنجاز والتميز</h3>
          </div>
          <span className="text-xs sm:text-sm text-blue-200 font-bold bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10">
            {unlockedBadgesCount} / {stats.badges.length} وسام مكتسب
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
          {stats.badges.map((badge) => {
            const isUnlocked = !!badge.unlockedAt;
            return (
              <div 
                key={badge.id}
                className={`p-4 rounded-2xl border text-center transition-all card-interactive ${
                  isUnlocked 
                    ? 'bg-white/15 border-amber-400/60 shadow-md ring-1 ring-amber-400/30' 
                    : 'bg-white/5 border-white/5 opacity-40'
                }`}
                title={badge.description}
              >
                <div className="text-3xl sm:text-4xl mb-2">{badge.icon}</div>
                <h5 className="font-extrabold text-xs sm:text-sm truncate text-amber-200">{badge.title}</h5>
                <span className="text-xs text-blue-200 block truncate mt-1 font-bold">
                  {isUnlocked ? 'مكتمل ✓' : 'مقفل'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
