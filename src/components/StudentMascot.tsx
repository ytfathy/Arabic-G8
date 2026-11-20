import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  X, 
  Minimize2, 
  Award, 
  Star, 
  Lightbulb, 
  CheckCircle, 
  Trophy,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { MascotMessage, MascotMood } from '../types/mascot';
import { mascotService } from '../utils/mascotService';

export const StudentMascot: React.FC = () => {
  const [mood, setMood] = useState<MascotMood>('idle');
  const [currentMessage, setCurrentMessage] = useState<MascotMessage>({
    id: 'initial',
    text: 'مرحباً بك يا بطل! أنا رفيقك «فصيح» 🦉، سأرافقك خطوة بخطوة في رحلتك!',
    mood: 'idle'
  });
  const [isBubbleVisible, setIsBubbleVisible] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(mascotService.isSoundEnabled());
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showBadgeModal, setShowBadgeModal] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubMsg = mascotService.subscribe((msg: MascotMessage) => {
      setMood(msg.mood);
      setCurrentMessage(msg);
      setIsBubbleVisible(true);

      // If badge unlocked, show the celebratory modal
      if (msg.mood === 'celebrating' && msg.badge) {
        setShowBadgeModal(true);
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Revert to idle after duration
      const duration = msg.duration || 4500;
      timerRef.current = setTimeout(() => {
        setMood('idle');
        // keep bubble visible but softly fade after extra delay
        setTimeout(() => {
          setIsBubbleVisible(false);
        }, 4000);
      }, duration);
    });

    const unsubSpeaking = mascotService.subscribeSpeaking((speaking: boolean) => {
      setIsSpeaking(speaking);
    });

    return () => {
      unsubMsg();
      unsubSpeaking();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !soundEnabled;
    setSoundEnabled(next);
    mascotService.setSoundEnabled(next);
  };

  const handleMascotClick = () => {
    setIsBubbleVisible(true);
    const friendlyTips = [
      'أنا معك دائماً! ركز في كل سؤال وستحقق أعلى الدرجات بإذن الله 🌟',
      'تذكر: أسئلة الأكمل والنحو تعتمد على الفهم والتطبيق الدقيق! 💡',
      'إذا واجهت كلمة صعبة، اضغط على زر «ذاكر لي» في السؤال وراجع معجم الدرس! 📖',
      'أنت رائع ومجتهد! استمر في التقدم لحصد أوسمة التميز 🏆',
      'كل خطأ تتعلم منه يقربك خطوة جديدة نحو قمة التفوق! 🚀'
    ];
    const text = friendlyTips[Math.floor(Math.random() * friendlyTips.length)];
    // notifyTip automatically speaks it aloud
    mascotService.notifyTip(text);
  };

  const handleReplayVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    mascotService.repeatLastMessage();
  };

  const handleTestVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    mascotService.testVoice();
  };

  // Render SVG Mascot Character with dynamic mood and talking mouth
  const renderMascotSvg = () => {
    const isHappy = mood === 'happy' || mood === 'celebrating';
    const isEncouraging = mood === 'encouraging';

    return (
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 filter drop-shadow-md cursor-pointer select-none">
        {/* Speaking badge overlay */}
        {isSpeaking && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-blue-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 animate-pulse z-20 whitespace-nowrap border border-amber-300">
            <Volume2 className="w-3 h-3 fill-blue-950" />
            <span>يتحدث...</span>
          </div>
        )}

        <svg 
          viewBox="0 0 120 120" 
          className={`w-full h-full transform transition-transform duration-300 ${
            mood === 'happy' ? 'scale-110 animate-bounce' : 
            mood === 'celebrating' ? 'scale-115 animate-pulse' : 
            mood === 'encouraging' ? 'scale-105' : 'hover:scale-105'
          }`}
        >
          {/* Aura glow in celebratory / happy mood */}
          {isHappy && (
            <circle cx="60" cy="65" r="48" fill="#FDE047" opacity="0.35" className="animate-ping" />
          )}

          {/* Main Body (Friendly Owl Scholar) */}
          <ellipse cx="60" cy="72" rx="36" ry="38" fill="#1E3A8A" stroke="#172554" strokeWidth="2.5" />
          
          {/* Belly Feather Pattern */}
          <ellipse cx="60" cy="78" rx="24" ry="26" fill="#F8FAFC" />
          <path d="M 50 72 Q 60 76 70 72" stroke="#CBD5E1" strokeWidth="2" fill="none" />
          <path d="M 48 80 Q 60 84 72 80" stroke="#CBD5E1" strokeWidth="2" fill="none" />
          <path d="M 52 88 Q 60 92 68 88" stroke="#CBD5E1" strokeWidth="2" fill="none" />

          {/* Wings */}
          {isHappy ? (
            <>
              {/* Joyfully raised wings */}
              <path d="M 26 70 C 14 55 12 40 28 45 C 32 55 35 65 32 75 Z" fill="#2563EB" stroke="#1E3A8A" strokeWidth="2" />
              <path d="M 94 70 C 106 55 108 40 92 45 C 88 55 85 65 88 75 Z" fill="#2563EB" stroke="#1E3A8A" strokeWidth="2" />
            </>
          ) : isEncouraging ? (
            <>
              {/* One wing on hip, one pointing supportively */}
              <path d="M 26 70 C 18 75 16 85 28 88 Z" fill="#2563EB" />
              <path d="M 94 68 C 106 60 110 50 100 52 C 92 60 90 70 94 75 Z" fill="#2563EB" />
            </>
          ) : (
            <>
              {/* Relaxed resting wings */}
              <ellipse cx="28" cy="74" rx="8" ry="18" fill="#2563EB" transform="rotate(-15 28 74)" />
              <ellipse cx="92" cy="74" rx="8" ry="18" fill="#2563EB" transform="rotate(15 92 74)" />
            </>
          )}

          {/* Cute Little Feet */}
          <ellipse cx="48" cy="108" rx="7" ry="4" fill="#F59E0B" />
          <ellipse cx="72" cy="108" rx="7" ry="4" fill="#F59E0B" />

          {/* Face Rings & Eyes */}
          <circle cx="47" cy="56" r="14" fill="#FFFFFF" stroke="#DBEAFE" strokeWidth="2" />
          <circle cx="73" cy="56" r="14" fill="#FFFFFF" stroke="#DBEAFE" strokeWidth="2" />

          {/* Eye Pupils / Mood Expression */}
          {isHappy ? (
            <>
              {/* Happy Arcs (smiling eyes) */}
              <path d="M 40 56 Q 47 48 54 56" stroke="#1E3A8A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d="M 66 56 Q 73 48 80 56" stroke="#1E3A8A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            </>
          ) : isEncouraging ? (
            <>
              {/* Determined focused eyes */}
              <circle cx="48" cy="56" r="7" fill="#1E3A8A" />
              <circle cx="72" cy="56" r="7" fill="#1E3A8A" />
              <circle cx="50" cy="54" r="2.5" fill="#FFFFFF" />
              <circle cx="74" cy="54" r="2.5" fill="#FFFFFF" />
              {/* Encouraging eyebrow slant */}
              <path d="M 38 46 L 54 48" stroke="#1E3A8A" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 82 46 L 66 48" stroke="#1E3A8A" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Normal bright open eyes with sparkling highlights */}
              <circle cx="47" cy="56" r="7" fill="#1E3A8A" />
              <circle cx="73" cy="56" r="7" fill="#1E3A8A" />
              <circle cx="49" cy="54" r="2.5" fill="#FFFFFF" />
              <circle cx="75" cy="54" r="2.5" fill="#FFFFFF" />
            </>
          )}

          {/* Blushing Cheeks */}
          <circle cx="36" cy="66" r="4.5" fill="#FDA4AF" opacity="0.6" />
          <circle cx="84" cy="66" r="4.5" fill="#FDA4AF" opacity="0.6" />

          {/* Golden Beak with animated talking motion */}
          {isSpeaking ? (
            <g className="animate-pulse">
              <polygon points="60,57 53,72 67,72" fill="#F59E0B" />
              <line x1="55" y1="65" x2="65" y2="65" stroke="#B45309" strokeWidth="1.5" />
            </g>
          ) : (
            <polygon points="60,59 55,68 65,68" fill="#F59E0B" />
          )}

          {/* Official Graduation Cap (From International Education Egypt identity) */}
          <g transform="translate(60, 28)">
            {/* Skull cap base */}
            <path d="M -16 6 Q 0 10 16 6 L 14 12 Q 0 16 -14 12 Z" fill="#172554" />
            {/* Diamond Mortarboard */}
            <polygon points="0,-10 32,0 0,10 -32,0" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="1" />
            {/* Golden Button & Tassel */}
            <circle cx="0" cy="0" r="3" fill="#F59E0B" />
            <path d="M 0 0 C 14 4 18 10 18 20" stroke="#F59E0B" strokeWidth="2" fill="none" />
            <rect x="15" y="20" width="6" height="7" rx="1.5" fill="#D97706" />
          </g>

          {/* Accessory in Hand based on mood */}
          {mood === 'celebrating' && (
            <g transform="translate(86, 32)">
              <polygon points="10,0 13,7 20,8 15,13 16,20 10,16 4,20 5,13 0,8 7,7" fill="#F59E0B" />
            </g>
          )}
          {mood === 'encouraging' && (
            <g transform="translate(94, 38)">
              {/* Lightbulb */}
              <circle cx="8" cy="8" r="6" fill="#FBBF24" />
              <rect x="6" y="14" width="4" height="3" fill="#71717A" />
            </g>
          )}
        </svg>
      </div>
    );
  };

  return (
    <>
      {/* Docked Floating Mascot (Bottom Left) */}
      <div 
        className="fixed bottom-3 left-3 sm:bottom-4 sm:left-4 z-40 flex flex-col items-start select-none no-print transition-all max-w-[calc(100vw-1.5rem)] sm:max-w-sm"
        dir="rtl"
      >
        {/* Minimized Pill View */}
        {isMinimized ? (
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2 bg-white/95 backdrop-blur-md border-2 border-amber-400 p-1.5 sm:p-2 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer group"
            title="افتح رفيقك فصيح 🦉"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-900 text-amber-300 flex items-center justify-center font-black text-sm">
              🦉
            </div>
            <span className="text-xs font-black text-blue-950 pl-2">
              فصيح
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
          </button>
        ) : (
          <div className="flex flex-col items-start w-full max-w-[calc(100vw-1.5rem)] sm:max-w-sm">

            {/* Speech Bubble */}
            {isBubbleVisible && (
              <div 
                className={`relative mb-2.5 p-3.5 sm:p-4 rounded-2xl shadow-xl border-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
                  mood === 'happy'
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-300'
                    : mood === 'encouraging'
                    ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 border-amber-300'
                    : mood === 'celebrating'
                    ? 'bg-gradient-to-br from-indigo-900 to-purple-900 text-white border-amber-400 ring-2 ring-amber-300/60'
                    : 'bg-white/95 backdrop-blur-md text-slate-800 border-blue-200'
                }`}
              >
                {/* Speech Bubble Tail */}
                <div 
                  className={`absolute -bottom-2 right-8 w-4 h-4 rotate-45 border-r-2 border-b-2 ${
                    mood === 'happy' ? 'bg-teal-600 border-emerald-300' :
                    mood === 'encouraging' ? 'bg-amber-600 border-amber-300' :
                    mood === 'celebrating' ? 'bg-purple-900 border-amber-400' :
                    'bg-white border-blue-200'
                  }`}
                />

                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 font-black text-xs">
                    <span className="text-base">
                      {mood === 'happy' ? '🌟' : mood === 'encouraging' ? '💪' : mood === 'celebrating' ? '🎉' : '🦉'}
                    </span>
                    <span>
                      {mood === 'happy' ? 'أحسنت يا بطل!' : 
                       mood === 'encouraging' ? 'لا بأس، حاول مجدداً!' : 
                       mood === 'celebrating' ? 'إنجاز رائع!' : 
                       'فصيح يقول لك:'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Replay Voice Button */}
                    <button
                      onClick={handleReplayVoice}
                      className="p-1 rounded-md opacity-80 hover:opacity-100 hover:bg-black/10 transition-colors"
                      title="استمع لصوت فصيح 🔊"
                      aria-label="استمع للصوت"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-bounce text-amber-300' : ''}`} />
                    </button>

                    <button 
                      onClick={() => {
                        setIsMinimized(true);
                        setIsBubbleVisible(false);
                      }}
                      className="p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-black/10 transition-opacity"
                      title="تصغير فصيح إلى أيقونة جانبية"
                      aria-label="تصغير فصيح"
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                    </button>

                    <button 
                      onClick={() => setIsBubbleVisible(false)}
                      className="p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-black/10 transition-opacity"
                      aria-label="إخفاء الفقاعة"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-bold leading-relaxed whitespace-pre-line">
                  {currentMessage.text}
                </p>

                {currentMessage.subText && (
                  <p className="text-[11px] opacity-90 font-medium mt-1">
                    {currentMessage.subText}
                  </p>
                )}

                {/* Voice listen action pill */}
                <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between">
                  <button
                    onClick={handleReplayVoice}
                    className="inline-flex items-center gap-1 text-[11px] font-black bg-white/25 hover:bg-white/40 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <Volume2 className={`w-3 h-3 ${isSpeaking ? 'animate-pulse' : ''}`} />
                    <span>{isSpeaking ? 'فصيح يتحدث...' : 'استمع للصوت 🔊'}</span>
                  </button>

                  <span className="text-[10px] opacity-80 font-bold">
                    انقر على فصيح لنصيحة 💡
                  </span>
                </div>
              </div>
            )}

            {/* Mascot Character and Quick Controls Bar */}
            <div className="flex items-end gap-2">
              
              {/* Mascot Character Avatar */}
              <div 
                onClick={handleMascotClick}
                className="relative group cursor-pointer"
                title="اضغط للتحدث مع فصيح وسماع نصيحة بصوته 🦉"
              >
                {renderMascotSvg()}

                {/* Mood Badge Pill */}
                <span className={`absolute -bottom-1 right-2 px-2 py-0.5 rounded-full text-[10px] font-black shadow-xs border ${
                  mood === 'happy' ? 'bg-emerald-500 text-white border-emerald-300' :
                  mood === 'encouraging' ? 'bg-amber-500 text-slate-950 border-amber-300' :
                  mood === 'celebrating' ? 'bg-purple-700 text-amber-300 border-amber-400' :
                  'bg-blue-900 text-amber-300 border-blue-800'
                }`}>
                  {isSpeaking ? 'يتكلم 🔊' : 
                   mood === 'happy' ? 'أحسنت!' :
                   mood === 'encouraging' ? 'حاول ثانية!' :
                   mood === 'celebrating' ? 'رائع جداً!' :
                   'فصيح 🦉'}
                </span>
              </div>

              {/* Action Controls */}
              <div className="bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-2xl p-1 shadow-md flex flex-col gap-1">
                {/* Sound On/Off Toggle */}
                <button
                  onClick={handleToggleSound}
                  className={`p-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    soundEnabled ? 'text-amber-600 hover:bg-amber-50' : 'text-slate-400 hover:bg-slate-100'
                  }`}
                  title={soundEnabled ? 'كتم صوت فصيح' : 'تفعيل صوت فصيح 🔊'}
                  aria-label="تبديل الصوت"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Test Voice Button */}
                <button
                  onClick={handleTestVoice}
                  className="p-1.5 rounded-xl text-xs font-bold text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                  title="جرب صوت فصيح الآن 🗣️"
                  aria-label="جرب الصوت"
                >
                  <span className="text-xs">🗣️</span>
                </button>

                {/* Minimize Button */}
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 rounded-xl text-xs text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="تصغير الماسكوت"
                  aria-label="تصغير"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        )}
      </div>

      {/* FULL SCREEN CELEBRATION MODAL ON BADGE UNLOCKED ("هذا رائع!") */}
      {showBadgeModal && currentMessage.badge && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300 select-none"
          dir="rtl"
        >
          {/* Confetti Particle Fall Canvas / Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-sm animate-bounce"
                style={{
                  top: `${Math.random() * 90}%`,
                  left: `${Math.random() * 95}%`,
                  backgroundColor: ['#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6'][i % 5],
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animationDuration: `${1.5 + (i % 5) * 0.5}s`,
                  opacity: 0.85
                }}
              />
            ))}
          </div>

          {/* Modal Container */}
          <div className="relative bg-gradient-to-b from-blue-950 via-blue-900 to-indigo-950 border-4 border-amber-400 rounded-3xl p-5 sm:p-8 md:p-10 max-w-lg w-full max-h-[90vh] overflow-y-auto text-center shadow-2xl text-white animate-in zoom-in-90 duration-300">
            {/* Top Glowing Sunburst */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setShowBadgeModal(false)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Mascot Center Animated Celebration */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                {renderMascotSvg()}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-amber-400 text-blue-950 flex items-center justify-center font-black text-lg shadow-lg animate-bounce">
                  🏆
                </div>
              </div>
            </div>

            {/* "هذا رائع!" Header Banner */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400 text-blue-950 text-sm font-black mb-3 shadow-md">
              <Sparkles className="w-4 h-4 fill-blue-950" />
              <span>هذا رائع! إنجاز متميز جديد!</span>
              <Sparkles className="w-4 h-4 fill-blue-950" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-2">
              وسام «{currentMessage.badge.title}»
            </h2>

            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 text-blue-950 flex items-center justify-center text-4xl shadow-xl mx-auto my-4 border-2 border-amber-200">
              {currentMessage.badge.icon}
            </div>

            <p className="text-sm sm:text-base text-blue-100 font-bold leading-relaxed mb-6 max-w-sm mx-auto">
              {currentMessage.badge.description}
            </p>

            <div className="bg-white/10 border border-white/20 rounded-2xl p-3 mb-6 inline-flex items-center gap-3">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-sm font-extrabold text-amber-300">+٥٠ نقطة تميز إضافية لحسابك!</span>
              <button
                onClick={handleReplayVoice}
                className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-xs px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                title="استمع للتهنئة بصوت فصيح"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>اسمع التهنئة</span>
              </button>
            </div>

            {/* Continue Button */}
            <div>
              <button
                onClick={() => setShowBadgeModal(false)}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-950 font-black py-3.5 px-6 rounded-2xl text-base shadow-lg hover:shadow-xl transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>متابعة التعلم والتفوق 🚀</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
