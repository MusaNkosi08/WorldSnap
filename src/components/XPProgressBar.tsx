import { motion } from "motion/react";
import { Trophy } from "lucide-react";

interface XPProgressBarProps {
  currentXP: number;
  maxXP: number;
  level: number;
}

export function XPProgressBar({ currentXP, maxXP, level }: XPProgressBarProps) {
  const progress = (currentXP / maxXP) * 100;

  return (
    <div className="w-full px-6 py-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4" style={{ color: "#667eea" }} />
          <span className="text-sm opacity-70">Level {level}</span>
        </div>
        <span className="text-sm opacity-70 ml-auto">
          {currentXP} / {maxXP} XP
        </span>
      </div>
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
