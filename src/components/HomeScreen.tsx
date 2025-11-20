import { motion } from "motion/react";
import { Play, User, Trophy, MapPin, Sparkles, Wallet, BookOpen, TrendingUp, Gift } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { XPProgressBar } from "./XPProgressBar";
import { TokenBadge } from "./TokenBadge";

interface HomeScreenProps {
  onPlayClick: () => void;
  onProfileClick: () => void;
  onLeaderboardClick: () => void;
  onWalletClick: () => void;
  onRewardsClick: () => void;
  onPredictionClick: () => void;
  onEducationalClick: () => void;
  isWalletConnected: boolean;
  totalEarned: number;
  gamesPlayed: number;
  accuracy: number;
  currentStreak: number;
  currentXP: number;
  maxXP: number;
  level: number;
}

export function HomeScreen({ 
  onPlayClick, 
  onProfileClick, 
  onLeaderboardClick,
  onWalletClick,
  onRewardsClick,
  onPredictionClick,
  onEducationalClick,
  isWalletConnected,
  totalEarned,
  gamesPlayed,
  accuracy,
  currentStreak,
  currentXP,
  maxXP,
  level,
}: HomeScreenProps) {
  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center p-6 pb-8 relative overflow-y-auto">
      {/* Animated background elements */}
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)" }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-32 right-10 w-48 h-48 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)" }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center z-10 mb-6">
        <motion.button
          onClick={onLeaderboardClick}
          className="p-3 rounded-2xl glass-card shadow-glow"
          whileTap={{ scale: 0.95 }}
        >
          <Trophy className="w-6 h-6" style={{ color: "#667eea" }} />
        </motion.button>
        
        {isWalletConnected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <TokenBadge amount={totalEarned} size="sm" />
          </motion.div>
        )}
        
        <motion.button
          onClick={onProfileClick}
          className="p-1 rounded-2xl glass-card shadow-glow"
          whileTap={{ scale: 0.95 }}
        >
          <Avatar>
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=player1" />
            <AvatarFallback>
              <User className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-1 z-10 w-full max-w-md">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <motion.div
            className="mb-4 flex justify-center"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <MapPin className="w-16 h-16 text-white drop-shadow-lg" />
          </motion.div>
          <h1 className="text-6xl text-white mb-3 tracking-tight">WorldSnap</h1>
          <p className="text-white/80 text-lg">Guess locations, and earn</p>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full space-y-3"
        >
          <Button
            onClick={onPlayClick}
            className="w-full h-16 text-xl rounded-2xl glass-card shadow-glow-pink transition-all duration-300 border-2 border-white/40"
            style={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
            }}
          >
            <Play className="w-6 h-6 mr-2" fill="white" />
            Play Classic
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={onPredictionClick}
              className="h-14 rounded-2xl glass-card shadow-glow border-2 border-white/40"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Prediction
            </Button>
            
            <Button
              onClick={onEducationalClick}
              className="h-14 rounded-2xl glass-card shadow-glow-celo border-2 border-white/40"
              style={{
                background: "linear-gradient(135deg, #35D07F 0%, #FBCC5C 100%)",
                color: "white",
              }}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Quiz
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-3 gap-3 mt-6 w-full"
        >
          <div className="glass-card rounded-2xl p-4 text-center shadow-glow">
            <div className="text-2xl mb-1" style={{ color: "#667eea" }}>{gamesPlayed}</div>
            <div className="text-xs text-gray-600">Games</div>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center shadow-glow">
            <div className="text-2xl mb-1" style={{ color: "#f5576c" }}>{accuracy}%</div>
            <div className="text-xs text-gray-600">Accuracy</div>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center shadow-glow">
            <div className="text-2xl mb-1" style={{ color: "#00f2fe" }}>{currentStreak}</div>
            <div className="text-xs text-gray-600">Streak</div>
          </div>
        </motion.div>
      </div>

      {/* XP Progress & Wallet Section */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="w-full max-w-md z-10 space-y-3"
      >
        <div className="glass-card rounded-3xl shadow-glow">
          <XPProgressBar currentXP={currentXP} maxXP={maxXP} level={level} />
        </div>

        {/* Wallet & Rewards Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onWalletClick}
            className="h-14 rounded-2xl glass-card shadow-glow-celo border-2 border-gray-200 font-bold text-base"
          >
            <Wallet className="w-5 h-5 mr-2" style={{ color: "#35D07F" }} />
            <span className="text-gray-900">{isWalletConnected ? "Wallet" : "Connect"}</span>
          </Button>
          
          <Button
            onClick={onRewardsClick}
            className="h-14 rounded-2xl glass-card shadow-glow-gold border-2 border-gray-200 font-bold text-base"
          >
            <Gift className="w-5 h-5 mr-2" style={{ color: "#FBCC5C" }} />
            <span className="text-gray-900">Rewards</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}