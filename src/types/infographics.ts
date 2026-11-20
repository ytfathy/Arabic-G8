export interface VocabularyItem {
  word: string;
  meaning: string;
  antonym?: string;
  pluralOrSingular?: string;
  contextSentence?: string;
}

export interface GrammarExample {
  sentence: string;
  parsing: string;
  highlightWord?: string;
}

export interface GrammarRuleBlock {
  title: string;
  ruleExplanation: string;
  structureFormula?: string;
  examples: GrammarExample[];
  warningNotice?: string; // تنبيه هام أو خطأ شائع تجنبه
}

export interface PoeticBeautyItem {
  verseExcerpt: string;
  deviceType: 'تشبيه' | 'استعارة' | 'تضاد' | 'ترادف' | 'أسلوب إنشائي' | 'إيحاء دلالي';
  analysis: string;
}

export interface KeyQuestionAnswer {
  question: string;
  answer: string;
}

export interface LessonInfographic {
  id: string;
  lessonName: string;
  unit: number;
  unitTitle: string;
  week: number;
  skill: 'reading' | 'listening' | 'grammar' | 'literature' | 'spelling' | 'writing';
  skillLabel: string;
  synopsis: string; // ملخص الدرس الشامل وعما يتحدث
  keyIdeas: string[]; // أهم الأفكار الرئيسية
  vocabularies?: VocabularyItem[]; // المفردات: الكلمة، المعنى، العكس، الجمع
  grammarRules?: GrammarRuleBlock[]; // القواعد النحوية والأمثلة والإعراب
  poeticBeauties?: PoeticBeautyItem[]; // مواطن الجمال والبلاغة
  authorBio?: {
    name: string;
    era?: string;
    title?: string;
    brief: string;
  };
  examKeyQA?: KeyQuestionAnswer[]; // أسئلة وأجوبة امتحانات هامة
  takeaways?: string[]; // القيم والدروس المستفادة
}
