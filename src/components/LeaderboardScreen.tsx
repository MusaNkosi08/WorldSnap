import { motion } from "motion/react";
import { Trophy, ArrowLeft, Crown, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface LeaderboardScreenProps {
  onBack: () => void;
  currentUserScore: number;
  currentUserName: string;
  currentUserAvatar: string;
}

interface Player {
  id: number;
  name: string;
  score: number;
  avatar: string;
  isCurrentUser?: boolean;
}

export function LeaderboardScreen({ onBack, currentUserScore, currentUserName, currentUserAvatar }: LeaderboardScreenProps) {
  // Generate leaderboard with current user
  const generateLeaderboard = (): Player[] => {
    const players: Player[] = [];
    
    // Add current user
    players.push({
      id: 0,
      name: currentUserName,
      score: currentUserScore,
      avatar: currentUserAvatar,
      isCurrentUser: true,
    });

    // Sort by score descending
    return players.sort((a, b) => b.score - a.score);
  };

  const leaderboardData = generateLeaderboard();
  
  const getPositionColor = (position: number) => {
    if (position === 1) return "#FFD700";
    if (position === 2) return "#C0C0C0";
    if (position === 3) return "#CD7F32";
    return "#667eea";
  };

  const getBadge = (position: number) => {
    if (position === 1) return "👑";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    return undefined;
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-6 pb-4 flex items-center gap-4"
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="p-2 rounded-xl glass-card shadow-glow"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        <div className="flex-1">
          <h2 className="text-3xl text-white">Leaderboard</h2>
          <p className="text-white/70 text-sm">Your global ranking</p>
        </div>
        <Trophy className="w-8 h-8 text-white" />
      </motion.div>

      {/* Your Ranking Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-6 pb-6"
      >
        <div className="glass-card rounded-3xl p-6 shadow-glow text-center">
          <div className="text-sm opacity-60 mb-2">Your Rank</div>
          <div className="flex items-center justify-center gap-4 mb-4">
            <Avatar className="w-20 h-20 border-4" style={{ borderColor: "#667eea" }}>
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserAvatar}`} />
              <AvatarFallback>{currentUserName[0]}</AvatarFallback>
            </Avatar>
          </div>
          <div className="text-2xl mb-1">{currentUserName}</div>
          <div className="text-4xl mb-2" style={{ color: "#667eea" }}>#{leaderboardData.findIndex(p => p.isCurrentUser) + 1}</div>
          <div className="text-sm opacity-60">{currentUserScore.toLocaleString()} points</div>
          
          {currentUserScore === 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 p-4 bg-purple-50 rounded-2xl"
            >
              <p className="text-sm">🎮 Play games to climb the leaderboard!</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Info Section */}
      <div className="flex-1 px-6 pb-6">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-8 shadow-glow text-center"
        >
          <Crown className="w-16 h-16 mx-auto mb-4" style={{ color: "#FFD700" }} />
          <h3 className="text-xl mb-2">Become a Champion</h3>
          <p className="text-sm opacity-60 mb-6">
            The leaderboard will fill up as more players join WorldSnap. Keep playing to improve your rank and earn more rewards!
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-yellow-50 rounded-2xl">
              <div className="text-3xl mb-1">🥇</div>
              <div className="text-xs opacity-60">Gold Tier</div>
            </div>
            <div className="p-4 bg-gray-100 rounded-2xl">
              <div className="text-3xl mb-1">🥈</div>
              <div className="text-xs opacity-60">Silver Tier</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-2xl">
              <div className="text-3xl mb-1">🥉</div>
              <div className="text-xs opacity-60">Bronze Tier</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
