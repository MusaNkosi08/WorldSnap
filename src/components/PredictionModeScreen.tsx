import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, MapPin, Users, Coins, TrendingUp, Clock, Award, Target, Sparkles, Trophy, Star, X } from "lucide-react";
import { Button } from "./ui/button";
import { TokenBadge } from "./TokenBadge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Progress } from "./ui/progress";

interface PredictionModeScreenProps {
  onBack: () => void;
  onEnterPool: (amount: number) => void;
  imageUrl: string;
}

interface PredictionPool {
  id: number;
  locationName: string;
  imageUrl: string;
  prizePool: number;
  participants: number;
  timeRemaining: string;
  difficulty: "Easy" | "Medium" | "Hard";
  hints: string[];
  region: string;
  yourOdds: number;
}

export function PredictionModeScreen({ onBack, onEnterPool, imageUrl }: PredictionModeScreenProps) {
  const [selectedAmount, setSelectedAmount] = useState(1);
  const [selectedPool, setSelectedPool] = useState<PredictionPool | null>(null);
  const [showPoolDetails, setShowPoolDetails] = useState(false);

  const predictionPools: PredictionPool[] = [
    {
      id: 1,
      locationName: "Mystery Location #1",
      imageUrl: imageUrl,
      prizePool: 45.5,
      participants: 127,
      timeRemaining: "2h 34m",
      difficulty: "Medium",
      hints: [
        "🌍 Continent: Europe",
        "🏛️ Famous landmark nearby",
        "🗣️ Romance language spoken",
      ],
      region: "Europe",
      yourOdds: 12,
    },
    {
      id: 2,
      locationName: "Mystery Location #2",
      imageUrl: imageUrl,
      prizePool: 89.2,
      participants: 234,
      timeRemaining: "5h 12m",
      difficulty: "Hard",
      hints: [
        "🌏 Continent: Asia",
        "🏙️ Metropolitan area",
        "🍜 Famous for street food",
      ],
      region: "Asia",
      yourOdds: 8,
    },
    {
      id: 3,
      locationName: "Mystery Location #3",
      imageUrl: imageUrl,
      prizePool: 23.8,
      participants: 67,
      timeRemaining: "45m",
      difficulty: "Easy",
      hints: [
        "🌎 Continent: North America",
        "🏖️ Coastal area",
        "☀️ Tropical climate",
      ],
      region: "North America",
      yourOdds: 18,
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "#35D07F";
      case "Medium": return "#FBCC5C";
      case "Hard": return "#f5576c";
      default: return "#667eea";
    }
  };

  const handlePoolSelect = (pool: PredictionPool) => {
    setSelectedPool(pool);
    setShowPoolDetails(true);
  };

  if (showPoolDetails && selectedPool) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-6 pb-4 flex items-center gap-4 gradient-celo"
        >
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowPoolDetails(false)}
            className="p-2 rounded-xl glass-card shadow-glow"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </motion.button>
          <div className="flex-1">
            <h2 className="text-2xl text-white">{selectedPool.locationName}</h2>
            <p className="text-sm text-white/80">Make your prediction!</p>
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Trophy className="w-6 h-6 text-yellow-300" />
          </motion.div>
        </motion.div>

        {/* Image Preview with overlay info */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mx-6 mb-4 rounded-3xl overflow-hidden shadow-2xl relative h-72"
        >
          <ImageWithFallback
            src={selectedPool.imageUrl}
            alt="Prediction location"
            className="w-full h-full object-cover"
          />
          
          {/* Floating badges */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="glass-card rounded-2xl px-4 py-2 shadow-glow flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-400" />
              <span className="text-sm text-white">{selectedPool.timeRemaining}</span>
            </div>
            
            <div className="glass-card rounded-2xl px-4 py-2 shadow-glow">
              <span 
                className="text-sm font-semibold"
                style={{ color: getDifficultyColor(selectedPool.difficulty) }}
              >
                {selectedPool.difficulty}
              </span>
            </div>
          </div>

          {/* Prize pool badge at bottom */}
          <div className="absolute bottom-4 left-4 right-4">
            <motion.div 
              className="glass-card rounded-2xl p-4 shadow-glow-gold backdrop-blur-xl"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/80 mb-1">Prize Pool</div>
                  <div className="text-2xl font-bold text-yellow-300 flex items-center gap-2">
                    <Coins className="w-5 h-5" />
                    {selectedPool.prizePool.toFixed(2)} cUSD
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/80 mb-1">Players</div>
                  <div className="text-xl text-white flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {selectedPool.participants}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Hints Section - Enhanced */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mx-6 mb-4"
        >
          <div className="glass-card rounded-3xl p-6 shadow-glow border-2 border-purple-100">
            <div className="flex items-center gap-2 mb-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Target className="w-5 h-5" style={{ color: "#667eea" }} />
              </motion.div>
              <h3 className="text-lg">Location Clues</h3>
              <Sparkles className="w-4 h-4 ml-auto text-yellow-500" />
            </div>
            <div className="space-y-3">
              {selectedPool.hints.map((hint, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3 p-4 rounded-2xl"
                  style={{ 
                    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                    border: "2px solid rgba(102, 126, 234, 0.1)"
                  }}
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <motion.div 
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  >
                    {index + 1}
                  </motion.div>
                  <span className="text-sm flex-1">{hint}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mx-6 mb-4"
        >
          <div className="grid grid-cols-3 gap-3">
            <motion.div 
              className="glass-card rounded-2xl p-4 text-center shadow-glow"
              whileHover={{ scale: 1.05 }}
            >
              <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-lg font-bold" style={{ color: "#35D07F" }}>
                {(selectedPool.prizePool / selectedPool.participants).toFixed(2)}
              </div>
              <div className="text-xs opacity-60">Avg Entry</div>
            </motion.div>

            <motion.div 
              className="glass-card rounded-2xl p-4 text-center shadow-glow"
              whileHover={{ scale: 1.05 }}
            >
              <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-lg font-bold" style={{ color: "#667eea" }}>
                {selectedPool.yourOdds}%
              </div>
              <div className="text-xs opacity-60">Your Odds</div>
            </motion.div>

            <motion.div 
              className="glass-card rounded-2xl p-4 text-center shadow-glow"
              whileHover={{ scale: 1.05 }}
            >
              <MapPin className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <div className="text-lg font-bold">100km</div>
              <div className="text-xs opacity-60">Win Range</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Entry Amount Selection */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mx-6 mb-4"
        >
          <div className="glass-card rounded-3xl p-6 shadow-glow-gold border-2 border-green-100">
            <h3 className="mb-4 flex items-center gap-2">
              <Coins className="w-5 h-5 text-green-600" />
              Select Entry Amount
            </h3>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[0.5, 1, 2, 5].map((amount) => (
                <motion.button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`p-4 rounded-2xl transition-all border-2 ${
                    selectedAmount === amount
                      ? "shadow-glow-celo border-green-400"
                      : "bg-gray-50 border-gray-200"
                  }`}
                  style={
                    selectedAmount === amount
                      ? { background: "linear-gradient(135deg, #35D07F 0%, #5AE49A 100%)" }
                      : {}
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-xl font-bold" style={{ color: selectedAmount === amount ? "white" : "#000" }}>
                    {amount}
                  </div>
                  <div className="text-xs opacity-60" style={{ color: selectedAmount === amount ? "white" : "#666" }}>
                    cUSD
                  </div>
                </motion.button>
              ))}
            </div>

            <motion.div 
              className="p-4 rounded-2xl"
              style={{ 
                background: "linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%)",
                border: "2px solid rgba(79, 172, 254, 0.2)"
              }}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 mt-1" style={{ color: "#4facfe" }} />
                <div>
                  <p className="text-sm font-semibold mb-1">How Prediction Pools Work</p>
                  <p className="text-xs opacity-70">
                    📍 Pin your guess on the map<br/>
                    🎯 Within 100km = Winner!<br/>
                    💰 Prize split among all winners<br/>
                    ⏱️ Prediction closes when timer ends
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Enter Pool Button */}
        <div className="px-6 pb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => onEnterPool(selectedAmount)}
              className="w-full h-16 text-xl rounded-2xl shadow-glow-celo border-2 border-white/40 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #35D07F 0%, #5AE49A 100%)",
                color: "white",
              }}
            >
              <motion.div
                className="absolute inset-0 opacity-30"
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)",
                  backgroundSize: "200% 200%",
                }}
              />
              <Coins className="w-6 h-6 mr-2" />
              Enter Pool ({selectedAmount} cUSD)
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-6 pb-4 flex items-center gap-4 gradient-celo"
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="p-2 rounded-xl glass-card shadow-glow"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </motion.button>
        <div className="flex-1">
          <h2 className="text-2xl text-white">Prediction Pools 🎯</h2>
          <p className="text-sm text-white/80">Choose your challenge & win prizes!</p>
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <TrendingUp className="w-6 h-6 text-yellow-300" />
        </motion.div>
      </motion.div>

      {/* Total Stats Banner */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mx-6 mb-6"
      >
        <div 
          className="glass-card rounded-3xl p-6 shadow-glow-gold"
          style={{ 
            background: "linear-gradient(135deg, rgba(251, 204, 92, 0.1) 0%, rgba(247, 147, 26, 0.1) 100%)",
            border: "2px solid rgba(251, 204, 92, 0.3)"
          }}
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <motion.div 
                className="text-3xl mb-1 font-bold"
                style={{ color: "#35D07F" }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                3
              </motion.div>
              <div className="text-xs opacity-60">Active Pools</div>
            </div>
            <div>
              <motion.div 
                className="text-3xl mb-1 font-bold"
                style={{ color: "#FBCC5C" }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              >
                158.5
              </motion.div>
              <div className="text-xs opacity-60">Total cUSD</div>
            </div>
            <div>
              <motion.div 
                className="text-3xl mb-1 font-bold"
                style={{ color: "#667eea" }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
              >
                428
              </motion.div>
              <div className="text-xs opacity-60">Players</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Prediction Pools Grid */}
      <div className="px-6 pb-6 space-y-4 flex-1 overflow-auto">
        {predictionPools.map((pool, index) => (
          <motion.div
            key={pool.id}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePoolSelect(pool)}
            className="glass-card rounded-3xl overflow-hidden shadow-glow cursor-pointer border-2 border-transparent hover:border-green-200 transition-all"
          >
            {/* Pool Image Header */}
            <div className="relative h-48">
              <ImageWithFallback
                src={pool.imageUrl}
                alt={pool.locationName}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Top badges */}
              <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                <motion.div 
                  className="glass-card rounded-xl px-3 py-1.5 shadow-glow flex items-center gap-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Clock className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-white font-semibold">{pool.timeRemaining}</span>
                </motion.div>
                
                <div 
                  className="glass-card rounded-xl px-3 py-1.5 shadow-glow"
                  style={{ 
                    background: `linear-gradient(135deg, ${getDifficultyColor(pool.difficulty)}22 0%, ${getDifficultyColor(pool.difficulty)}44 100%)`,
                    border: `2px solid ${getDifficultyColor(pool.difficulty)}88`
                  }}
                >
                  <span 
                    className="text-xs font-bold"
                    style={{ color: getDifficultyColor(pool.difficulty) }}
                  >
                    {pool.difficulty}
                  </span>
                </div>
              </div>
              
              {/* Bottom info */}
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-xl font-bold text-white mb-1">{pool.locationName}</h3>
                <div className="flex items-center gap-2 text-white/90">
                  <MapPin className="w-3 h-3" />
                  <span className="text-xs">{pool.region}</span>
                </div>
              </div>
            </div>

            {/* Pool Details */}
            <div className="p-5">
              {/* Prize and Players */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs opacity-60 mb-1">Prize Pool</div>
                  <motion.div 
                    className="text-2xl font-bold flex items-center gap-2"
                    style={{ color: "#35D07F" }}
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Coins className="w-5 h-5" />
                    {pool.prizePool.toFixed(2)} cUSD
                  </motion.div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-60 mb-1">Players</div>
                  <div className="text-xl flex items-center gap-2">
                    <Users className="w-4 h-4" style={{ color: "#667eea" }} />
                    {pool.participants}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="p-3 bg-yellow-50 rounded-xl text-center">
                  <div className="text-sm font-bold" style={{ color: "#FBCC5C" }}>
                    {(pool.prizePool / pool.participants).toFixed(2)}
                  </div>
                  <div className="text-xs opacity-60">Avg Entry</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl text-center">
                  <div className="text-sm font-bold" style={{ color: "#667eea" }}>
                    {pool.yourOdds}%
                  </div>
                  <div className="text-xs opacity-60">Your Odds</div>
                </div>
                <div className="p-3 bg-red-50 rounded-xl text-center">
                  <div className="text-sm font-bold" style={{ color: "#f5576c" }}>
                    100km
                  </div>
                  <div className="text-xs opacity-60">Range</div>
                </div>
              </div>

              {/* Hints Preview */}
              <div className="mb-4">
                <div className="text-xs opacity-60 mb-2">Quick Hints:</div>
                <div className="space-y-1">
                  {pool.hints.slice(0, 2).map((hint, i) => (
                    <div key={i} className="text-xs opacity-80 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#667eea" }} />
                      {hint}
                    </div>
                  ))}
                </div>
              </div>

              {/* Enter Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="w-full h-12 rounded-2xl shadow-glow-celo border-2 border-white/40 relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #35D07F 0%, #5AE49A 100%)",
                    color: "white",
                  }}
                >
                  <motion.div
                    className="absolute inset-0 opacity-20"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      background: "linear-gradient(90deg, transparent, white, transparent)",
                    }}
                  />
                  <Target className="w-5 h-5 mr-2" />
                  Join This Pool
                </Button>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}