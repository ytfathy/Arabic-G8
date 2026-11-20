export type SkillCategory = 'grammar' | 'reading' | 'literature' | 'spelling' | 'listening' | 'writing';

export type QuestionType = 
  | 'mcq' 
  | 'true_false' 
  | 'fill_blank' 
  | 'classification' 
  | 'matching' 
  | 'text_input' 
  | 'correction';

export type ExamMode = 'practice' | 'formal' | 'revision';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  unit: number; // 1, 2, 3, or 0 for comprehensive
  unitTitle: string;
  week: number; // 1 to 14, 0 for general reviews
  weekTitle?: string;
  section: string; // e.g. "الأداءات الصفية", "الأداءات المنزلية", "التقييم الأسبوعي - مجموعة أ"
  skill: SkillCategory;
  skillLabel: string; // "النحو", "القراءة", "النصوص", "الإملاء", "الاستماع", "التعبير"
  lessonName: string; // Exact lesson name e.g. "المعرب والمبني من الأسماء والحروف"
  passageTitle?: string; // e.g. "العبور إلى المستقبل", "آمنة دهشان"
  passageText?: string; // Original reading/listening/poetry text
  questionText: string;
  subQuestions?: string[];
  type: QuestionType;
  options?: QuestionOption[];
  correctAnswer: string | string[]; // Answer key
  modelAnswer?: string; // Certified detailed model answer for comparison
  keywords?: string[]; // Essential keywords for automated grading/checking
  explanation: string; // Pedagogical explanation referencing grammar/spelling rule or passage
  ruleSummary?: string; // Grammar/spelling rule excerpt
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

export interface LessonSummary {
  id: string;
  name: string;
  skill: SkillCategory;
  skillLabel: string;
  unit: number;
  unitTitle: string;
  week: number;
  questionCount: number;
}

export interface UserAnswerRecord {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timestamp: number;
}

export interface ExamConfig {
  title: string;
  selectedLessonIds: string[];
  questionCount: number;
  mode: ExamMode;
  durationMinutes: number;
  randomize: boolean;
  filterSkill?: SkillCategory | 'all';
}

export interface ExamResult {
  id: string;
  title: string;
  timestamp: number;
  config: ExamConfig;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  timeSpentSeconds: number;
  userAnswers: Record<string, string>;
  questionResults: {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    lessonName: string;
    skill: SkillCategory;
  }[];
  skillBreakdown: Record<SkillCategory, { total: number; correct: number }>;
  lessonBreakdown: Record<string, { total: number; correct: number }>;
}

export interface StudentStats {
  xp: number;
  level: number;
  totalAnswered: number;
  totalCorrect: number;
  streakDays: number;
  completedWeeks: number[];
  completedLessons: string[];
  badges: Badge[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}
