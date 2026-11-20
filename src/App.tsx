import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { HomeDashboard } from './components/HomeDashboard';
import { WeeklyAssessmentsView } from './components/WeeklyAssessmentsView';
import { SkillPracticeView } from './components/SkillPracticeView';
import { SmartExamGenerator } from './components/SmartExamGenerator';
import { StudentProgressView } from './components/StudentProgressView';
import { AnswerKeyGuide } from './components/AnswerKeyGuide';
import { StudyInfographicsView } from './components/StudyInfographicsView';
import { StudentMascot } from './components/StudentMascot';
import { mascotService } from './utils/mascotService';
import { 
  getStoredStats, 
  getAllStoredAnswers, 
  addAnswerRecord 
} from './utils/storage';
import { StudentStats, UserAnswerRecord } from './types/curriculum';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [stats, setStats] = useState<StudentStats>(getStoredStats());
  const [savedAnswers, setSavedAnswers] = useState<Record<string, UserAnswerRecord>>({});

  useEffect(() => {
    setStats(getStoredStats());
    setSavedAnswers(getAllStoredAnswers());

    // Check query params for autostart
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' || params.get('tab')) {
      const tabParam = params.get('tab') as NavTab;
      if (['home', 'study', 'weekly', 'skills', 'exams', 'progress', 'answers'].includes(tabParam)) {
        setCurrentTab(tabParam);
      } else {
        setCurrentTab('weekly');
      }
    }
  }, []);

  const handleQuestionAnswered = (questionId: string, answer: string, isCorrect: boolean, skill: string) => {
    const prevBadges = stats.badges.filter(b => b.unlockedAt);
    const updatedStats = addAnswerRecord(questionId, answer, isCorrect, skill);
    const newlyUnlocked = updatedStats.badges.filter(b => b.unlockedAt && !prevBadges.some(pb => pb.id === b.id));

    setStats(updatedStats);
    setSavedAnswers(getAllStoredAnswers());

    // Mascot triggers
    if (newlyUnlocked.length > 0) {
      mascotService.notifyBadgeUnlocked(newlyUnlocked[0]);
    } else if (isCorrect) {
      mascotService.notifyCorrect();
    } else {
      mascotService.notifyWrong();
    }
  };

  const handleStatsUpdated = () => {
    const prevBadges = stats.badges.filter(b => b.unlockedAt);
    const updatedStats = getStoredStats();
    const newlyUnlocked = updatedStats.badges.filter(b => b.unlockedAt && !prevBadges.some(pb => pb.id === b.id));

    setStats(updatedStats);
    setSavedAnswers(getAllStoredAnswers());

    if (newlyUnlocked.length > 0) {
      mascotService.notifyBadgeUnlocked(newlyUnlocked[0]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-amber-200 selection:text-amber-900 w-full max-w-full overflow-x-hidden" dir="rtl">
      
      {/* Official Top Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        stats={stats}
        onOpenExamGenerator={() => setCurrentTab('exams')}
      />

      {/* Main Learning Views Content */}
      <main className="flex-1 pb-16">
        {currentTab === 'home' && (
          <HomeDashboard
            stats={stats}
            onNavigate={setCurrentTab}
            onOpenExamGenerator={() => setCurrentTab('exams')}
          />
        )}

        {currentTab === 'study' && (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-5 sm:pt-8">
            <StudyInfographicsView />
          </div>
        )}

        {currentTab === 'weekly' && (
          <WeeklyAssessmentsView
            onQuestionAnswered={handleQuestionAnswered}
            savedAnswers={savedAnswers}
          />
        )}

        {currentTab === 'skills' && (
          <SkillPracticeView
            onQuestionAnswered={handleQuestionAnswered}
            savedAnswers={savedAnswers}
          />
        )}

        {currentTab === 'exams' && (
          <SmartExamGenerator
            onBackToHome={() => setCurrentTab('home')}
            onStatsUpdated={handleStatsUpdated}
          />
        )}

        {currentTab === 'progress' && (
          <StudentProgressView
            stats={stats}
            savedAnswers={savedAnswers}
            onNavigateToQuestion={() => setCurrentTab('weekly')}
          />
        )}

        {currentTab === 'answers' && (
          <AnswerKeyGuide />
        )}
      </main>

      {/* Official Brand Footer */}
      <footer className="bg-white border-t border-slate-200/90 py-8 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="International Education Egypt" 
              className="w-8 h-8 rounded-full border border-amber-400"
            />
            <span className="font-bold text-slate-700">
              International Education Egypt · جميع الحقوق محفوظة © {new Date().getFullYear()}
            </span>
          </div>

          <div className="flex items-center gap-4 font-medium">
            <span>منهج اللغة العربية الرسمي · الصف الثاني الإعدادي (الفصل الدراسي الأول)</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-700 font-bold">بإشراف فريق الخبراء التربويين</span>
          </div>
        </div>
      </footer>

      {/* Interactive Mascot Companion */}
      <StudentMascot />

    </div>
  );
}
