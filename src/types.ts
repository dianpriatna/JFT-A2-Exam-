export type Category = 'script' | 'grammar' | 'reading' | 'listening';

export interface Question {
  id: string;
  category: Category;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  context?: string; // For reading/listening passages
  imageUrl?: string;
  audioUrl?: string;
}

export interface ExamState {
  currentQuestionIndex: number;
  answers: Record<string, number>;
  status: 'idle' | 'taking' | 'finished';
  score: number;
  startTime: number | null;
  endTime: number | null;
}
