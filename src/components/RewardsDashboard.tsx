import { motion } from "motion/react";
import { ArrowLeft, Coins, TrendingUp, Flame, Trophy, Gift, Calendar, Award } from "lucide-react";
import { Button } from "./ui/button";
import { TokenBadge } from "./TokenBadge";
import { Progress } from "./ui/progress";

interface RewardsDashboardProps {
  onBack: () => void;
  onClaimRewards: () => void;
  totalEarned: number;
  availableToClaim: number;
  dailyStreak: number;
  rank: number;
  gamesPlayed: number;
  unlockedBadges: number[];
}

export function RewardsDashboard({
  onBack,
  onClaimRewards,
  totalEarned,
  availableToClaim,
  dailyStreak,
  rank,
  gamesPlayed,
  unlockedBadges,
}: RewardsDashboardProps) {
  const badges = [
    { id: 1, name: "First Win", icon: "🎯", unlocked: unlockedBadges.includes(1) },
    { id: 2, name: "Explorer", icon: "🗺️", unlocked: unlockedBadges.includes(2) },
    { id: 3, name: "Streak Master", icon: "🔥", unlocked: unlockedBadges.includes(3) },
    { id: 4, name: "Top 10", icon: "👑", unlocked: unlockedBadges.includes(4) },
    { id: 5, name: "Perfect Score", icon: "💯", unlocked: unlockedBadges.includes(5) },
    { id: 6, name: "Globe Trotter", icon: "🌍", unlocked: unlockedBadges.includes(6) },
  ];

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
          <h2 className="text-3xl text-white">Rewards</h2>
          <p className="text-white/70 text-sm">Your earnings & achievements</p>
        </div>
        <Coins className="w-8 h-8 text-white" />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {/* Total Earned */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-6 mb-4 shadow-glow-gold text-center"
        >
          <div className="text-sm opacity-60 mb-2">Total Earned</div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="text-5xl mb-4"
            style={{ color: "#35D07F" }}
          >
            {totalEarned.toFixed(2)}
          </motion.div>
          <TokenBadge amount={totalEarned} size="lg" />
          
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-6" />
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl mb-1" style={{ color: "#FBCC5C" }}>{dailyStreak}</div>
              <div className="text-xs opacity-60">Day Streak</div>
            </div>
            <div>
              <div className="text-xl mb-1" style={{ color: "#35D07F" }}>#{rank}</div>
              <div className="text-xs opacity-60">Rank</div>
            </div>
            <div>
              <div className="text-xl mb-1" style={{ color: "#667eea" }}>{gamesPlayed}</div>
              <div className="text-xs opacity-60">Games</div>
            </div>
          </div>
        </motion.div>

        {/* Available to Claim */}
        {availableToClaim > 0 ? (
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-3xl p-6 mb-4 shadow-glow-celo"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm opacity-60 mb-1">Available to Claim</div>
                <div className="text-3xl" style={{ color: "#35D07F" }}>
                  {availableToClaim.toFixed(2)} cUSD
                </div>
              </div>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Gift className="w-12 h-12" style={{ color: "#FBCC5C" }} />
              </motion.div>
            </div>
            <Button
              onClick={onClaimRewards}
              className="w-full h-14 rounded-2xl shadow-glow-gold"
              style={{
                background: "linear-gradient(135deg, #FBCC5C 0%, #FFE5A1 100%)",
                color: "#2E7D5A",
              }}
            >
              <Coins className="w-5 h-5 mr-2" />
              Claim Rewards
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-3xl p-8 mb-4 shadow-glow text-center"
          >
            <div className="opacity-40 mb-2">
              <Coins className="w-12 h-12 mx-auto" />
            </div>
            <p className="opacity-60">No rewards to claim yet</p>
            <p className="text-sm opacity-40 mt-1">Play games to earn cUSD tokens!</p>
          </motion.div>
        )}

        {/* Daily Streak */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-3xl p-6 mb-4 shadow-glow"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl" style={{ background: "rgba(251, 204, 92, 0.2)" }}>
              <Flame className="w-6 h-6" style={{ color: "#f5576c" }} />
            </div>
            <div className="flex-1">
              <div className="mb-1">Daily Streak</div>
              <p className="text-sm opacity-60">Play daily to increase your multiplier</p>
            </div>
            <div className="text-2xl" style={{ color: "#f5576c" }}>
              {dailyStreak}🔥
            </div>
          </div>
          <Progress value={(dailyStreak / 7) * 100} className="h-2" />
          <div className="flex justify-between mt-2 text-xs opacity-60">
            <span>Current: {dailyStreak} days</span>
            <span>Next bonus: {7 - dailyStreak} days</span>
          </div>
        </motion.div>

        {/* Rank Progress */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-3xl p-6 mb-4 shadow-glow"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl" style={{ background: "rgba(102, 126, 234, 0.2)" }}>
              <TrendingUp className="w-6 h-6" style={{ color: "#667eea" }} />
            </div>
            <div className="flex-1">
              <div className="mb-1">Rank Progression</div>
              <p className="text-sm opacity-60">Gold Tier - Level 12</p>
            </div>
            <Trophy className="w-6 h-6" style={{ color: "#FFD700" }} />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)" }}
                initial={{ width: 0 }}
              animate={{ width: "68%" }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <span className="text-sm opacity-60">68%</span>
          </div>
          <div className="text-xs opacity-60">2,300 XP to Platinum</div>
        </motion.div>

        {/* Badges & Achievements */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-3xl p-6 shadow-glow"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-6 h-6" style={{ color: "#667eea" }} />
            <h3>Achievements</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {badges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.6 + index * 0.05, type: "spring" }}
                className={`rounded-2xl p-4 text-center ${
                  badge.unlocked ? "glass-card shadow-glow" : "bg-gray-100 opacity-50"
                }`}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <div className="text-xs">{badge.name}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Smart Contract Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-4 p-4 rounded-2xl border-2 border-dashed border-gray-300 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-sm opacity-60">
            <div className="w-2 h-2 rounded-full" style={{ background: "#35D07F" }} />
            <span>Smart Contract Connected</span>
          </div>
          <p className="text-xs opacity-40 mt-1">0x742d...4f2a on Celo Mainnet</p>
        </motion.div>
      </div>
    </div>
  );
}