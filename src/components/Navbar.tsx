import React, { useState } from 'react';
import { 
  Home, 
  Calendar, 
  Layers, 
  FileCheck, 
  TrendingUp, 
  BookOpen, 
  Menu, 
  X, 
  Award,
  Zap,
  Sparkles
} from 'lucide-react';
import { StudentStats } from '../types/curriculum';

export type NavTab = 'home' | 'study' | 'weekly' | 'skills' | 'exams' | 'progress' | 'answers';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  stats: StudentStats;
  onOpenExamGenerator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  stats,
  onOpenExamGenerator
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home' as NavTab, label: 'الصفحة الرئيسية', icon: Home },
    { id: 'study' as NavTab, label: 'ذاكر لي 💡', icon: Sparkles, isHighlight: true },
    { id: 'weekly' as NavTab, label: 'التقييمات الأسبوعية', icon: Calendar },
    { id: 'skills' as NavTab, label: 'التدريب حسب المهارة', icon: Layers },
    { id: 'exams' as NavTab, label: 'منشئ الاختبارات', icon: FileCheck },
    { id: 'progress' as NavTab, label: 'نتائجي وتقدمي', icon: TrendingUp },
    { id: 'answers' as NavTab, label: 'دليل الإجابات', icon: BookOpen },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Zone 1: Official Brand Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 sm:flex-initial cursor-pointer" onClick={() => handleNavClick('home')}>
            <div className="relative w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full overflow-hidden shadow-xs border-2 border-amber-400 bg-white p-0.5 shrink-0 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="شعار International Education Egypt" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-black text-sm sm:text-base md:text-lg text-blue-950 tracking-tight leading-tight truncate sm:whitespace-normal">
                International Education Egypt
              </span>
              <span className="text-xs sm:text-sm font-bold text-amber-600 flex items-center gap-1.5 truncate">
                <span>منصة تقييمات لغتي</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-600">الصف الثاني الإعدادي</span>
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const isStudy = item.id === 'study';

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-sm xl:text-base font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? 'bg-blue-950 text-white shadow-sm ring-2 ring-blue-950/20' 
                      : isStudy
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-blue-950 border border-amber-300 hover:from-amber-500 hover:to-amber-600 shadow-sm font-black btn-glow-gold'
                        : 'text-slate-700 hover:text-blue-950 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-amber-400' : isStudy ? 'text-blue-950 fill-blue-950' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Gamification & Action CTA */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {/* Level & XP Capsule */}
            <div className="flex items-center gap-2.5 bg-gradient-to-r from-blue-50 to-amber-50 border border-blue-200 rounded-2xl px-3.5 py-2 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-blue-950 text-amber-300 font-black text-xs sm:text-sm flex items-center justify-center shadow-xs">
                م {stats.level}
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{stats.xp} XP</span>
                </span>
                <div className="w-18 bg-slate-200 h-2 rounded-full overflow-hidden mt-0.5">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(stats.xp % 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* CTA: Smart Exam Generator */}
            <button
              onClick={onOpenExamGenerator}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-950 font-black px-4.5 py-2.5 rounded-2xl text-sm md:text-base shadow-sm hover:shadow transition-all transform active:scale-95 cursor-pointer whitespace-nowrap border border-amber-300 btn-glow-gold"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-950" />
              <span>إنشاء امتحان</span>
            </button>
          </div>

          {/* Mobile Menu & Quick Action Button */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={onOpenExamGenerator}
              className="sm:hidden flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-950 font-black px-3 py-2 rounded-xl text-xs shadow-xs cursor-pointer active:scale-95 min-h-[40px] border border-amber-300"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-950 fill-blue-950" />
              <span>امتحان</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 sm:p-2.5 rounded-xl text-slate-700 hover:text-blue-950 hover:bg-slate-100 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center border border-slate-200/80 bg-slate-50/50"
              aria-label="القائمة الرئيسية"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-blue-950" /> : <Menu className="w-6 h-6 text-blue-950" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between p-3 bg-blue-50/70 rounded-xl mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-bold text-blue-900">المستوى {stats.level}</span>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              {stats.xp} نقطة تميز
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-right transition-colors ${
                    isActive 
                      ? 'bg-blue-900 text-white' 
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
