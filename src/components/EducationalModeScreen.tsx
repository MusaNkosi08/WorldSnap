import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, BookOpen, Flame, Star, Zap, CheckCircle, XCircle } from "lucide-react";
import { Button } from "./ui/button";
import { TokenBadge } from "./TokenBadge";
import { Progress } from "./ui/progress";

interface EducationalModeScreenProps {
  onBack: () => void;
  onQuizComplete: (earnedAmount: number, xpGained: number) => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  fact: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: "Which country has the most islands in the world?",
    options: ["Philippines", "Indonesia", "Sweden", "Japan"],
    correctAnswer: 2,
    fact: "Sweden has over 267,000 islands, more than any other country!",
  },
  {
    id: 2,
    question: "What is the smallest country in the world?",
    options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
    correctAnswer: 1,
    fact: "Vatican City is only 0.44 km² in area!",
  },
  {
    id: 3,
    question: "Which desert is the largest in the world?",
    options: ["Sahara", "Arabian", "Gobi", "Antarctic"],
    correctAnswer: 3,
    fact: "The Antarctic desert is the largest, covering 14 million km²!",
  },
];

export function EducationalModeScreen({ onBack, onQuizComplete }: EducationalModeScreenProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [earnedToday, setEarnedToday] = useState(0);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const multiplier = Math.min(1 + (streak * 0.1), 3);

  const handleAnswerSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    setIsAnswered(true);
    const isCorrect = selectedAnswer === question.correctAnswer;
    
    if (isCorrect) {
      const points = 100 * multiplier;
      setScore(score + points);
      setStreak(streak + 1);
      setEarnedToday(earnedToday + 0.5);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Quiz completed
      onQuizComplete(earnedToday, score);
      onBack();
    }
  };

  return (
    <div className="min-h-screen gradient-celo flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-6 pb-4 flex items-center gap-4"
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="p-2 rounded-xl glass-card shadow-glow-celo"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        <div className="flex-1">
          <h2 className="text-3xl text-white">Geography Quiz</h2>
          <p className="text-white/70 text-sm">Learn & earn rewards</p>
        </div>
        <BookOpen className="w-8 h-8 text-white" />
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mx-6 mb-4 grid grid-cols-3 gap-3"
      >
        <div className="glass-card rounded-2xl p-3 text-center shadow-glow-gold">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame className="w-4 h-4" style={{ color: "#f5576c" }} />
            <span className="text-sm">Streak</span>
          </div>
          <div className="text-xl" style={{ color: "#f5576c" }}>{streak}</div>
        </div>
        <div className="glass-card rounded-2xl p-3 text-center shadow-glow-celo">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="w-4 h-4" style={{ color: "#FBCC5C" }} />
            <span className="text-sm">Score</span>
          </div>
          <div className="text-xl" style={{ color: "#35D07F" }}>{score}</div>
        </div>
        <div className="glass-card rounded-2xl p-3 text-center shadow-glow">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap className="w-4 h-4" style={{ color: "#667eea" }} />
            <span className="text-sm">Bonus</span>
          </div>
          <div className="text-xl" style={{ color: "#667eea" }}>{multiplier.toFixed(1)}x</div>
        </div>
      </motion.div>

      {/* Progress */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2 }}
        className="mx-6 mb-6"
      >
        <div className="glass-card rounded-2xl p-4 shadow-glow">
          <div className="flex justify-between text-sm mb-2 opacity-60">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </motion.div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          className="flex-1 px-6"
        >
          <div className="glass-card rounded-3xl p-6 shadow-glow-celo mb-6">
            <h3 className="text-xl mb-6">{question.question}</h3>
            
            <div className="space-y-3">
              {question.options.map((option, index) => {
                let bgColor = "bg-white";
                let borderColor = "border-gray-200";
                let icon = null;

                if (isAnswered) {
                  if (index === question.correctAnswer) {
                    bgColor = "bg-green-50";
                    borderColor = "border-green-400";
                    icon = <CheckCircle className="w-5 h-5 text-green-600" />;
                  } else if (index === selectedAnswer) {
                    bgColor = "bg-red-50";
                    borderColor = "border-red-400";
                    icon = <XCircle className="w-5 h-5 text-red-600" />;
                  }
                } else if (selectedAnswer === index) {
                  bgColor = "bg-purple-50";
                  borderColor = "border-purple-400";
                }

                return (
                  <motion.button
                    key={index}
                    whileTap={{ scale: isAnswered ? 1 : 0.98 }}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 rounded-2xl border-2 ${bgColor} ${borderColor} flex items-center justify-between transition-all`}
                    disabled={isAnswered}
                  >
                    <span className="text-left">{option}</span>
                    {icon}
                  </motion.button>
                );
              })}
            </div>

            {isAnswered && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`mt-6 p-4 rounded-2xl ${
                  selectedAnswer === question.correctAnswer
                    ? "bg-green-50 border-2 border-green-400"
                    : "bg-red-50 border-2 border-red-400"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {selectedAnswer === question.correctAnswer ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-700">Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-red-700">Not quite...</span>
                    </>
                  )}
                </div>
                <p className="text-sm opacity-80">{question.fact}</p>
                {selectedAnswer === question.correctAnswer && (
                  <div className="mt-3 flex items-center gap-2">
                    <TokenBadge amount={0.5} size="sm" />
                    <span className="text-xs opacity-60">earned!</span>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Today's Earnings */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-4 shadow-glow-gold text-center mb-6"
          >
            <div className="text-sm opacity-60 mb-2">Earned Today</div>
            <TokenBadge amount={earnedToday} size="md" />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Action Button */}
      <div className="px-6 pb-6">
        {!isAnswered ? (
          <Button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="w-full h-16 text-xl rounded-2xl shadow-glow-celo"
            style={{
              background: selectedAnswer !== null
                ? "linear-gradient(135deg, #35D07F 0%, #5AE49A 100%)"
                : "#e0e0e0",
              color: "white",
              opacity: selectedAnswer !== null ? 1 : 0.5,
            }}
          >
            Submit Answer
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="w-full h-16 text-xl rounded-2xl shadow-glow-celo"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Quiz"}
          </Button>
        )}
      </div>
    </div>
  );
}