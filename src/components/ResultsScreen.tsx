import { motion } from "motion/react";
import { MapPin, Trophy, ArrowRight, Target } from "lucide-react";
import { Button } from "./ui/button";

interface ResultsScreenProps {
  correctLocation: { lat: number; lng: number; name: string };
  playerGuess: { lat: number; lng: number };
  distance: number;
  score: number;
  onNextRound: () => void;
}

export function ResultsScreen({
  correctLocation,
  playerGuess,
  distance,
  score,
  onNextRound,
}: ResultsScreenProps) {
  // Calculate score tier
  const getScoreTier = (dist: number) => {
    if (dist < 50) return { tier: "Perfect!", color: "#4facfe" };
    if (dist < 200) return { tier: "Excellent!", color: "#00f2fe" };
    if (dist < 500) return { tier: "Great!", color: "#667eea" };
    if (dist < 1000) return { tier: "Good!", color: "#f093fb" };
    return { tier: "Keep trying!", color: "#f5576c" };
  };

  const scoreTier = getScoreTier(distance);

  return (
    <div className="min-h-screen gradient-bg flex flex-col p-6 overflow-hidden relative">
      {/* Animated background */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full opacity-20"
        initial={{ scale: 0 }}
        animate={{ scale: 2 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div className="w-64 h-64 rounded-full absolute top-1/4 left-1/4" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)" }} />
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8 z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-4"
        >
          <Trophy className="w-20 h-20 mx-auto text-white drop-shadow-lg" />
        </motion.div>
        <h2 className="text-3xl text-white mb-2">{scoreTier.tier}</h2>
        <p className="text-white/80">You earned {score} points</p>
      </motion.div>

      {/* Score Display */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-3xl p-8 mb-6 shadow-glow z-10 text-center"
      >
        <div className="mb-2 text-sm opacity-60">Score</div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
          className="text-6xl mb-4"
          style={{ color: scoreTier.color }}
        >
          {score}
        </motion.div>
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4" />
        <div className="flex items-center justify-center gap-2">
          <Target className="w-5 h-5 opacity-60" />
          <span className="text-sm opacity-60">Distance: {distance.toFixed(0)} km</span>
        </div>
      </motion.div>

      {/* Location Comparison */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-3 mb-8 z-10"
      >
        {/* Correct Location */}
        <div className="glass-card rounded-2xl p-4 shadow-glow">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl" style={{ background: "rgba(74, 172, 254, 0.1)" }}>
              <MapPin className="w-5 h-5" style={{ color: "#4facfe" }} />
            </div>
            <div className="flex-1">
              <div className="text-sm opacity-60 mb-1">Correct Location</div>
              <div className="mb-1">{correctLocation.name}</div>
              <div className="text-xs opacity-40">
                {correctLocation.lat.toFixed(2)}°, {correctLocation.lng.toFixed(2)}°
              </div>
            </div>
          </div>
        </div>

        {/* Player Guess */}
        <div className="glass-card rounded-2xl p-4 shadow-glow">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl" style={{ background: "rgba(245, 87, 108, 0.1)" }}>
              <MapPin className="w-5 h-5" style={{ color: "#f5576c" }} />
            </div>
            <div className="flex-1">
              <div className="text-sm opacity-60 mb-1">Your Guess</div>
              <div className="text-xs opacity-40">
                {playerGuess.lat.toFixed(2)}°, {playerGuess.lng.toFixed(2)}°
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Map Preview */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-3xl overflow-hidden shadow-glow mb-6 z-10 h-48"
      >
        <div className="w-full h-full bg-gradient-to-br from-blue-100 via-green-50 to-yellow-50 relative">
          {/* Grid */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(8)].map((_, i) => (
              <div key={`h-${i}`} className="absolute w-full border-t border-gray-400" style={{ top: `${i * 12.5}%` }} />
            ))}
            {[...Array(8)].map((_, i) => (
              <div key={`v-${i}`} className="absolute h-full border-l border-gray-400" style={{ left: `${i * 12.5}%` }} />
            ))}
          </div>

          {/* Pins */}
          <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-full">
            <MapPin className="w-8 h-8" style={{ color: "#4facfe", fill: "#4facfe" }} />
          </div>
          <div className="absolute top-2/3 right-1/3 transform -translate-x-1/2 -translate-y-full">
            <MapPin className="w-8 h-8" style={{ color: "#f5576c", fill: "#f5576c" }} />
          </div>

          {/* Distance Line */}
          <svg className="absolute inset-0 w-full h-full">
            <line
              x1="33%"
              y1="50%"
              x2="67%"
              y2="67%"
              stroke="#667eea"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </svg>
        </div>
      </motion.div>

      {/* Next Round Button */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="z-10"
      >
        <Button
          onClick={onNextRound}
          className="w-full h-16 text-xl rounded-2xl shadow-glow-pink"
          style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "white",
          }}
        >
          Next Round
          <ArrowRight className="w-6 h-6 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
