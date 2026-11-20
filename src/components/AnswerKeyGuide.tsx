import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Calendar,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { Question, SkillCategory } from '../types/curriculum';
import { getAllQuestions } from '../data/questionBank';

export const AnswerKeyGuide: React.FC = () => {
  const allQuestions = getAllQuestions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<SkillCategory | 'all'>('all');
  const [selectedUnit, setSelectedUnit] = useState<number | 'all'>('all');

  const filteredQuestions = allQuestions.filter(q => {
    const matchSearch = q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        q.lessonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        q.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSkill = selectedSkill === 'all' || q.skill === selectedSkill;
    const matchUnit = selectedUnit === 'all' || q.unit === selectedUnit;
    return matchSearch && matchSkill && matchUnit;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold mb-2">
          <FileCheck className="w-3.5 h-3.5" />
          <span>المرجع التربوي المعتمد</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-blue-950 flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-amber-500" />
          <span>دليل الإجابات النموذجية والشروح</span>
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          حلول نموذجية معتمدة ومحققة لجميع أسئلة كتاب التقييمات والأداءات طبقاً لمنهج وزارة التربية والتعليم
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-2.5 sm:gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم السؤال، نص السؤال، أو اسم الدرس..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          {/* Skill Filter */}
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value as SkillCategory | 'all')}
            className="w-full sm:w-auto px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:border-blue-900 cursor-pointer"
          >
            <option value="all">كافة الفروع والمهارات</option>
            <option value="grammar">النحو العربي</option>
            <option value="reading">القراءة والفهم</option>
            <option value="literature">النصوص والبلاغة</option>
            <option value="spelling">القواعد الإملائية</option>
            <option value="listening">الاستماع</option>
            <option value="writing">التعبير والكتابة</option>
          </select>

          {/* Unit Filter */}
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="w-full sm:w-auto px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:border-blue-900 cursor-pointer"
          >
            <option value="all">كافة الوحدات الدراسية</option>
            <option value={1}>الوحدة الأولى: انتمائي قوتي</option>
            <option value={2}>الوحدة الثانية: بيئتي مسئوليتي</option>
            <option value={3}>الوحدة الثالثة: علم وقيم</option>
          </select>
        </div>
      </div>

      {/* Answer Cards List */}
      <div className="space-y-6">
        {filteredQuestions.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="w-6 h-6 rounded-md bg-blue-900 text-amber-300 flex items-center justify-center font-mono">
                  {idx + 1}
                </span>
                <span className="text-blue-950">{q.unitTitle}</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500">الأسبوع {q.week}</span>
                <span className="text-slate-300">·</span>
                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                  {q.skillLabel}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-700">درس: {q.lessonName}</span>
            </div>

            <h3 className="font-bold text-base text-slate-900 leading-relaxed mb-4 whitespace-pre-line">
              {q.questionText}
            </h3>

            {/* Answer Display */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>الإجابة النموذجية المعتمدة:</span>
              </div>
              <p className="text-sm font-black text-emerald-950">
                {Array.isArray(q.correctAnswer)
                  ? q.correctAnswer.join(' أو ')
                  : q.options?.find(o => o.id === q.correctAnswer)?.text || q.correctAnswer}
              </p>
            </div>

            {/* Explanation & Rule */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-xs mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>الشرح والتحليل اللغوي:</span>
              </div>
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
                {q.explanation}
              </p>

              {q.ruleSummary && (
                <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs text-blue-900 font-semibold flex items-center gap-2">
                  <span className="text-amber-600 font-bold">القاعدة المقررة:</span>
                  <span>{q.ruleSummary}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 text-slate-400">
            <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <h4 className="font-bold text-base text-slate-700">لم يتم العثور على نتائج تطابق معايير البحث</h4>
          </div>
        )}
      </div>

    </div>
  );
};
