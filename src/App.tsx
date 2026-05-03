import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  RotateCcw, 
  Trophy, 
  AlertCircle,
  BrainCircuit,
  Languages
} from 'lucide-react';
import { QUESTIONS } from './data';
import { ExamState, Question } from './types';
import { getExplanation } from './services/gemini';

export default function App() {
  const [state, setState] = useState<ExamState>({
    currentQuestionIndex: 0,
    answers: {},
    status: 'idle',
    score: 0,
    startTime: null,
    endTime: null,
  });

  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const startExam = () => {
    setState({
      currentQuestionIndex: 0,
      answers: {},
      status: 'taking',
      score: 0,
      startTime: Date.now(),
      endTime: null,
    });
  };

  const handleAnswer = (questionId: string, answerIndex: number) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answerIndex }
    }));
  };

  const nextQuestion = () => {
    if (state.currentQuestionIndex < QUESTIONS.length - 1) {
      setState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 }));
    } else {
      finishExam();
    }
  };

  const finishExam = () => {
    let finalScore = 0;
    QUESTIONS.forEach(q => {
      if (state.answers[q.id] === q.correctAnswer) {
        finalScore++;
      }
    });

    setState(prev => ({
      ...prev,
      status: 'finished',
      score: finalScore,
      endTime: Date.now(),
    }));
  };

  const requestExplanation = async (question: Question, selectedIndex: number) => {
    setIsExplaining(true);
    const expl = await getExplanation(
      question.question,
      question.options[selectedIndex],
      question.options[question.correctAnswer],
      question.context
    );
    setAiExplanation(expl);
    setIsExplaining(false);
  };

  const currentQuestion = QUESTIONS[state.currentQuestionIndex];
  const progress = ((state.currentQuestionIndex + 1) / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <header className="w-full flex justify-between items-center mb-12">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Languages className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">JFT-A2 <span className="text-indigo-600">MASTER</span></h1>
        </div>
        {state.status === 'taking' && state.startTime && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-500 font-mono text-sm">
              <Clock className="w-4 h-4" />
              <span>Running...</span>
            </div>
          </div>
        )}
      </header>

      <main className="w-full flex-grow flex flex-col">
        <AnimatePresence mode="wait">
          {state.status === 'idle' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center py-20"
            >
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-8">
                <BookOpen className="text-indigo-600 w-12 h-12" />
              </div>
              <h2 className="text-4xl font-bold mb-4">Master Your JFT-A2</h2>
              <p className="text-slate-500 max-w-md mb-12 leading-relaxed">
                Practice vocabulary, grammar, and reading with our simulated exam. 
                Get AI explanations for every answer to accelerate your learning.
              </p>
              <button
                id="start-exam-button"
                onClick={startExam}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold transition-all shadow-lg hover:shadow-indigo-200/50 flex items-center gap-2 group"
              >
                Start Practice Exam
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {state.status === 'taking' && (
            <motion.div
              key="exam"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <div className="mb-8 w-full">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-slate-400">Question {state.currentQuestionIndex + 1} of {QUESTIONS.length}</span>
                  <span className="text-sm font-bold text-indigo-600">{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-indigo-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div id="question-card" className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm">
                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md uppercase tracking-wider mb-6">
                  {currentQuestion.category}
                </span>
                
                {currentQuestion.context && (
                  <div className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-xl jp-text leading-loose whitespace-pre-wrap">
                    {currentQuestion.context}
                  </div>
                )}

                <h3 className="text-2xl font-medium jp-text mb-10 leading-relaxed">
                  {currentQuestion.question}
                </h3>

                <div className="grid gap-3">
                  {currentQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      id={`option-${idx}`}
                      onClick={() => handleAnswer(currentQuestion.id, idx)}
                      className={`
                        w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between group
                        ${state.answers[currentQuestion.id] === idx 
                          ? 'border-indigo-600 bg-indigo-50/50' 
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}
                      `}
                    >
                      <span className="jp-text text-lg">{option}</span>
                      <div className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                        ${state.answers[currentQuestion.id] === idx 
                          ? 'border-indigo-600 bg-indigo-600' 
                          : 'border-slate-200'}
                      `}>
                        {state.answers[currentQuestion.id] === idx && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  id="next-question-button"
                  disabled={state.answers[currentQuestion.id] === undefined}
                  onClick={nextQuestion}
                  className={`
                    px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 transition-all
                    ${state.answers[currentQuestion.id] !== undefined
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                  `}
                >
                  {state.currentQuestionIndex === QUESTIONS.length - 1 ? 'Finish Exam' : 'Next Question'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {state.status === 'finished' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full pb-20"
            >
              <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm text-center mb-8">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Exam Performance</h2>
                <p className="text-slate-500 mb-8">You answered {state.score} out of {QUESTIONS.length} correctly.</p>
                
                <div className="flex justify-center gap-4 mb-8">
                  <div className="px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 min-w-[120px]">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1 text-center">Score</div>
                    <div className="text-3xl font-bold text-slate-800">{Math.round((state.score / QUESTIONS.length) * 100)}%</div>
                  </div>
                  <div className="px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 min-w-[120px]">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1 text-center">Completion</div>
                    <div className="text-3xl font-bold text-slate-800">100%</div>
                  </div>
                </div>

                <button
                  id="restart-button"
                  onClick={startExam}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-slate-400 text-sm uppercase tracking-widest px-1">Review & AI Insights</h4>
                {QUESTIONS.map((q, idx) => (
                  <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-300">#{idx + 1}</span>
                        {state.answers[q.id] === q.correctAnswer ? (
                          <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                        ) : (
                          <AlertCircle className="text-rose-500 w-5 h-5" />
                        )}
                      </div>
                      <button 
                         id={`explain-btn-${idx}`}
                         onClick={() => requestExplanation(q, state.answers[q.id])}
                         className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline flex items-center gap-1"
                      >
                        <BrainCircuit className="w-3.5 h-3.5" />
                        AI Explain
                      </button>
                    </div>
                    <p className="jp-text text-lg mb-4">{q.question}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className={`p-3 rounded-xl border ${state.answers[q.id] === q.correctAnswer ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                        <span className="text-[10px] uppercase font-black block opacity-50 mb-1">Your Answer</span>
                        <span className="jp-text font-medium">{q.options[state.answers[q.id]]}</span>
                      </div>
                      <div className="p-3 rounded-xl border bg-slate-50 border-slate-100 text-slate-700">
                        <span className="text-[10px] uppercase font-black block opacity-50 mb-1">Correct Answer</span>
                        <span className="jp-text font-medium">{q.options[q.correctAnswer]}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-4 bg-indigo-50/30 rounded-xl text-slate-600 text-sm border border-indigo-100/50">
                      <p className="jp-text leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* AI Modal */}
      <AnimatePresence>
        {(isExplaining || aiExplanation) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isExplaining && setAiExplanation(null)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-6 text-indigo-600">
                <BrainCircuit className="w-8 h-8" />
                <h3 className="text-xl font-bold">AI Sensei Explanation</h3>
              </div>

              {isExplaining ? (
                <div className="py-12 flex flex-col items-center gap-4">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ height: [8, 24, 8] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                        className="w-1.5 bg-indigo-600 rounded-full"
                      />
                    ))}
                  </div>
                  <p className="text-slate-400 font-medium animate-pulse">Analyzing language patterns...</p>
                </div>
              ) : (
                <div className="prose prose-slate max-w-none">
                  <p className="whitespace-pre-wrap text-slate-600 leading-relaxed font-medium">{aiExplanation}</p>
                  <button
                    id="close-ai-modal"
                    onClick={() => setAiExplanation(null)}
                    className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors"
                  >
                    Got it, thanks!
                  </button>
                </div>
              )}
              
              <div className="absolute top-0 right-0 p-12 -mr-12 -mt-12 bg-indigo-50 rounded-full opacity-30 z-[-1]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="w-full py-8 mt-12 border-t border-slate-100 text-center">
        <p className="text-slate-400 text-sm">Designed for JFT-A2 Proficiency & Basic Japanese Mastery</p>
      </footer>
    </div>
  );
}
