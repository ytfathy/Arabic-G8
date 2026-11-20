/**
 * Arabic Text Normalization & Intelligent Keyword Evaluator
 * International Education Egypt Assessment Engine
 */
import { Question } from '../types/curriculum';

export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    // Remove diacritics / Tashkeel
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize Alef variations
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Ta Marbuta and Haa
    .replace(/ة/g, 'ه')
    // Normalize Yaa variations
    .replace(/ى/g, 'ي')
    // Remove tatweel / kashida
    .replace(/\u0640/g, '')
    // Replace punctuation with space
    .replace(/[.,/#!$%^&*;:{}=\-_`~()؟،؛«»"']/g, ' ')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export interface KeywordCheckResult {
  matchedKeywords: string[];
  missingKeywords: string[];
  matchRatio: number;
}

export function checkKeywords(studentText: string, keywords: string[] = []): KeywordCheckResult {
  if (!keywords || keywords.length === 0) {
    return {
      matchedKeywords: [],
      missingKeywords: [],
      matchRatio: 1
    };
  }

  const normalizedStudent = normalizeArabic(studentText);
  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of keywords) {
    const normalizedKw = normalizeArabic(kw);
    if (!normalizedKw) continue;
    
    // Check if the keyword or any part of it is in the student's text
    if (normalizedStudent.includes(normalizedKw)) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const matchRatio = keywords.length > 0 ? matched.length / keywords.length : 1;

  return {
    matchedKeywords: matched,
    missingKeywords: missing,
    matchRatio
  };
}

export interface EvaluationResult {
  isCorrect: boolean;
  scoreRatio: number; // 0 to 1
  feedback: string;
  matchedKeywords: string[];
  missingKeywords: string[];
}

export function evaluateStudentAnswer(question: Question, userAnswer: string): EvaluationResult {
  const trimmed = (userAnswer || '').trim();
  if (!trimmed) {
    return {
      isCorrect: false,
      scoreRatio: 0,
      feedback: 'لم يتم إدخال إجابة بعد.',
      matchedKeywords: [],
      missingKeywords: question.keywords || []
    };
  }

  // 1. MCQ & True/False
  if (question.type === 'mcq' || question.type === 'true_false') {
    const isMatch = Array.isArray(question.correctAnswer)
      ? question.correctAnswer.includes(trimmed)
      : String(question.correctAnswer).trim() === trimmed;

    return {
      isCorrect: isMatch,
      scoreRatio: isMatch ? 1 : 0,
      feedback: isMatch ? 'إجابة صحيحة ومطابقة.' : 'إجابة غير صحيحة.',
      matchedKeywords: [],
      missingKeywords: []
    };
  }

  // 2. Fill in the blank (أكمل الفراغ)
  if (question.type === 'fill_blank') {
    const normalizedUser = normalizeArabic(trimmed);
    const answers = Array.isArray(question.correctAnswer) 
      ? question.correctAnswer 
      : [question.correctAnswer];

    // Check direct match with correct answers
    const exactMatch = answers.some(ans => {
      const normalizedAns = normalizeArabic(String(ans));
      return normalizedUser === normalizedAns || 
             normalizedUser.includes(normalizedAns) || 
             normalizedAns.includes(normalizedUser);
    });

    if (exactMatch) {
      return {
        isCorrect: true,
        scoreRatio: 1,
        feedback: 'أحسنت! إجابة دقيقة وصحيحة ومطابقة للنموذج.',
        matchedKeywords: question.keywords || [],
        missingKeywords: []
      };
    }

    // Check keywords if direct match failed
    if (question.keywords && question.keywords.length > 0) {
      const kwResult = checkKeywords(trimmed, question.keywords);
      if (kwResult.matchRatio >= 0.5 || kwResult.matchedKeywords.length >= 1) {
        return {
          isCorrect: true,
          scoreRatio: Math.max(0.7, kwResult.matchRatio),
          feedback: 'إجابة صحيحة تضمنت المفاهيم الأساسية المطلوبة.',
          matchedKeywords: kwResult.matchedKeywords,
          missingKeywords: kwResult.missingKeywords
        };
      }

      return {
        isCorrect: false,
        scoreRatio: kwResult.matchRatio,
        feedback: 'إجابة غير مكتملة، يرجى مراجعة الكلمات المفتاحية والإجابة النموذجية.',
        matchedKeywords: kwResult.matchedKeywords,
        missingKeywords: kwResult.missingKeywords
      };
    }

    return {
      isCorrect: false,
      scoreRatio: 0,
      feedback: 'إجابة غير مطابقة، قارن إجابتك بالإجابة النموذجية أدناه.',
      matchedKeywords: [],
      missingKeywords: []
    };
  }

  // 3. Essay, Short Answer & Creative Writing (مقالي، تعبير، تحليل، استخراج)
  const kwResult = checkKeywords(trimmed, question.keywords || []);
  const answers = Array.isArray(question.correctAnswer) 
    ? question.correctAnswer 
    : [question.correctAnswer];

  const normalizedUser = normalizeArabic(trimmed);
  const matchedAnyAnswer = answers.some(ans => {
    const norm = normalizeArabic(String(ans));
    return norm && (normalizedUser.includes(norm) || norm.includes(normalizedUser));
  });

  if (matchedAnyAnswer || kwResult.matchRatio >= 0.5) {
    return {
      isCorrect: true,
      scoreRatio: Math.max(0.75, kwResult.matchRatio),
      feedback: `إجابة ممتازة! تضمنت إجابتك ${kwResult.matchedKeywords.length} من أصل ${question.keywords?.length || kwResult.matchedKeywords.length} من الكلمات المفتاحية.`,
      matchedKeywords: kwResult.matchedKeywords,
      missingKeywords: kwResult.missingKeywords
    };
  }

  if (kwResult.matchedKeywords.length > 0) {
    return {
      isCorrect: true, // give credit for partial match in essay
      scoreRatio: kwResult.matchRatio,
      feedback: `إجابة مقبولة تضمنت بعض الأفكار الأساسية (${kwResult.matchedKeywords.length} كلمات مفتاحية). اطّلع على النموذج لاكتمال الفائدة.`,
      matchedKeywords: kwResult.matchedKeywords,
      missingKeywords: kwResult.missingKeywords
    };
  }

  return {
    isCorrect: false,
    scoreRatio: 0,
    feedback: 'الإجابة تحتاج إلى تفصيل واحتواء المفاهيم الأساسية الواردة في الإجابة النموذجية.',
    matchedKeywords: [],
    missingKeywords: question.keywords || []
  };
}
