import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

interface OnboardingScreenProps {
  onComplete: (name: string, avatarSeed: string) => void;
}

const avatarSeeds = [
  "player1",
  "player2",
  "player3",
  "player4",
  "player5",
  "player6",
  "player7",
  "player8",
  "player9",
  "player10",
  "player11",
  "player12",
];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(avatarSeeds[0]);
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (name.trim().length > 0) {
      onComplete(name.trim(), selectedAvatar);
    }
  };

  return (
    <div className="min-h-screen gradient-celo flex flex-col p-6 justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md mx-auto w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="text-6xl mb-4"
          >
            🌍
          </motion.div>
          <h1 className="text-4xl text-white mb-2">Welcome to WorldSnap</h1>
          <p className="text-white/80">Create your player profile to start</p>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-3xl p-6 shadow-glow-celo mb-6"
        >
          {/* Avatar Selection */}
          <div className="mb-6">
            <label className="text-sm opacity-80 mb-3 block font-semibold">Choose Your Avatar</label>
            <div className="grid grid-cols-4 gap-3">
              {avatarSeeds.map((seed) => (
                <motion.button
                  key={seed}
                  onClick={() => setSelectedAvatar(seed)}
                  whileTap={{ scale: 0.9 }}
                  className={`relative rounded-2xl p-1 transition-all ${
                    selectedAvatar === seed
                      ? "ring-4 ring-white shadow-glow-gold"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <Avatar className="w-full h-full">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} />
                    <AvatarFallback>{seed[0]}</AvatarFallback>
                  </Avatar>
                  {selectedAvatar === seed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: "#35D07F" }}
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="text-sm opacity-80 mb-2 block font-semibold">Your Name</label>
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="h-14 text-lg rounded-2xl border-2 border-gray-200 focus:border-white"
            />
            <p className="text-xs opacity-60 mt-2">
              This name will appear on the leaderboard
            </p>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleSubmit}
            disabled={name.trim().length === 0}
            className="w-full h-16 text-xl rounded-2xl shadow-glow-gold font-bold"
            style={{
              background: name.trim().length > 0
                ? "linear-gradient(135deg, #FBCC5C 0%, #FFE5A1 100%)"
                : "#e0e0e0",
              color: name.trim().length > 0 ? "#2E7D5A" : "#999",
            }}
          >
            Start Playing
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
