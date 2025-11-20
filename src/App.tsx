import { useState, useEffect } from "react";
import { SplashScreen } from "./components/SplashScreen";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { HomeScreen } from "./components/HomeScreen";
import { GameScreen } from "./components/GameScreen";
import { MapGuessScreen } from "./components/MapGuessScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import { LeaderboardScreen } from "./components/LeaderboardScreen";
import { WalletConnectionScreen } from "./components/WalletConnectionScreen";
import { RewardsDashboard } from "./components/RewardsDashboard";
import { CeloTransactionModal } from "./components/CeloTransactionModal";
import { PredictionModeScreen } from "./components/PredictionModeScreen";
import { EducationalModeScreen } from "./components/EducationalModeScreen";
import { HackathonInfoPanel } from "./components/HackathonInfoPanel";

type Screen = 
  | "splash"
  | "onboarding"
  | "home" 
  | "game" 
  | "map" 
  | "results" 
  | "leaderboard" 
  | "wallet" 
  | "rewards" 
  | "prediction" 
  | "educational"
  | "hackathon";

interface Location {
  lat: number;
  lng: number;
  name: string;
  imageUrl: string;
}

interface UserProfile {
  name: string;
  avatarSeed: string;
}

interface UserStats {
  gamesPlayed: number;
  totalScore: number;
  bestScore: number;
  currentStreak: number;
  lastPlayedDate: string | null;
  currentXP: number;
  level: number;
  totalEarned: number;
  availableToClaim: number;
  unlockedBadges: number[];
}

// All available locations - we'll shuffle these
const allLocations: Location[] = [
  {
    lat: 48.8566,
    lng: 2.3522,
    name: "Paris, France",
    imageUrl: "https://images.unsplash.com/photo-1678002219434-c6738513037e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMGNpdHlzY2FwZSUyMHN0cmVldHxlbnwxfHx8fDE3NjMzMDkyOTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    lat: 46.8182,
    lng: 8.2275,
    name: "Swiss Alps, Switzerland",
    imageUrl: "https://images.unsplash.com/photo-1597434429739-2574d7e06807?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5kc2NhcGUlMjBtb3VudGFpbnMlMjBuYXR1cmV8ZW58MXx8fHwxNzYzMzgzNzEzfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    lat: -18.1416,
    lng: 178.4419,
    name: "Fiji Islands",
    imageUrl: "https://images.unsplash.com/photo-1660315247626-12267f8d68db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwcGFyYWRpc2V8ZW58MXx8fHwxNzYzMzM3MTM2fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    lat: 40.7128,
    lng: -74.0060,
    name: "New York City, USA",
    imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXclMjB5b3JrJTIwY2l0eXxlbnwxfHx8fDE3NjMzOTAyNzB8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    lat: 35.6762,
    lng: 139.6503,
    name: "Tokyo, Japan",
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2t5byUyMGNpdHl8ZW58MXx8fHwxNzYzMzkwMjcwfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    lat: 51.5074,
    lng: -0.1278,
    name: "London, UK",
    imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb25kb24lMjBjaXR5fGVufDF8fHx8MTc2MzM5MDI3MHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    lat: -33.8688,
    lng: 151.2093,
    name: "Sydney, Australia",
    imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzeWRuZXklMjBvcGVyYSUyMGhvdXNlfGVufDF8fHx8MTc2MzM5MDI3MHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    lat: 41.9028,
    lng: 12.4964,
    name: "Rome, Italy",
    imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21lJTIwY29sb3NzZXVtfGVufDF8fHx8MTc2MzM5MDI3MHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    lat: 27.1751,
    lng: 78.0421,
    name: "Taj Mahal, India",
    imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWolMjBtYWhhbHxlbnwxfHx8fDE3NjMzOTAyNzB8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    lat: -22.9068,
    lng: -43.1729,
    name: "Rio de Janeiro, Brazil",
    imageUrl: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaW8lMjBkZSUyMGphbmVpcm98ZW58MXx8fHwxNzYzMzkwMjcwfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

// Shuffle array helper
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const INITIAL_USER_STATS: UserStats = {
  gamesPlayed: 0,
  totalScore: 0,
  bestScore: 0,
  currentStreak: 0,
  lastPlayedDate: null,
  currentXP: 0,
  level: 1,
  totalEarned: 0,
  availableToClaim: 0,
  unlockedBadges: [],
};

function App() {
  // Check if user has completed onboarding
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("worldSnapUserProfile");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    try {
      const last = localStorage.getItem('worldSnapLastScreen');
      const savedProfile = localStorage.getItem('worldSnapUserProfile');
      if (last && savedProfile) return last as Screen;
    } catch {}
    return 'splash';
  });

  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return !localStorage.getItem('worldSnapUserProfile');
    } catch {
      return true;
    }
  });
  const [currentRound, setCurrentRound] = useState(0);
  const [playerGuess, setPlayerGuess] = useState<{ lat: number; lng: number } | null>(null);
  const [currentGameScore, setCurrentGameScore] = useState(0);
  
  // Shuffled locations for current game
  const [gameLocations, setGameLocations] = useState<Location[]>([]);
  
  // Load user stats from localStorage or initialize
  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem("worldSnapUserStats");
    return saved ? JSON.parse(saved) : INITIAL_USER_STATS;
  });
  
  // Wallet state
  const [isWalletConnected, setIsWalletConnected] = useState(() => {
    const saved = localStorage.getItem("worldSnapWalletConnected");
    return saved === "true";
  });
  
  // Transaction modal state
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState(0);
  const [transactionType, setTransactionType] = useState<"claim" | "reward">("claim");

  const currentLocation = gameLocations[currentRound] || allLocations[0];

  // Save user profile to localStorage
  useEffect(() => {
    try {
      if (userProfile) {
        // Save single current profile pointer
        localStorage.setItem("worldSnapUserProfile", JSON.stringify(userProfile));
        // Also maintain a directory of profiles keyed by name for resume
        const mapRaw = localStorage.getItem('worldSnapUserProfiles');
        const map = mapRaw ? JSON.parse(mapRaw) : {};
        map[userProfile.name] = userProfile;
        localStorage.setItem('worldSnapUserProfiles', JSON.stringify(map));
      }
    } catch (err) {
      console.error('Failed to persist user profile', err);
    }
  }, [userProfile]);

  // Save user stats to localStorage whenever they change
  useEffect(() => {
    try {
      // Persist stats per-user if we have a profile, otherwise fall back to global
      if (userProfile && userProfile.name) {
        localStorage.setItem(`worldSnapUserStats_${userProfile.name}`, JSON.stringify(userStats));
      }
      localStorage.setItem("worldSnapUserStats", JSON.stringify(userStats));
    } catch (err) {
      console.error('Failed to persist user stats', err);
    }
  }, [userStats]);

  useEffect(() => {
    try {
      localStorage.setItem("worldSnapWalletConnected", isWalletConnected.toString());
    } catch {}
  }, [isWalletConnected]);

  // Persist last visited screen so returning users resume where they left off
  useEffect(() => {
    try {
      localStorage.setItem('worldSnapLastScreen', currentScreen);
    } catch {}
  }, [currentScreen]);

  // On mount: if there is a saved profile, try to load its stats
  useEffect(() => {
    try {
      const saved = localStorage.getItem('worldSnapUserProfile');
      if (saved) {
        const prof: UserProfile = JSON.parse(saved);
        setUserProfile(prof);
        // Try to load stats for this user
        const statsRaw = localStorage.getItem(`worldSnapUserStats_${prof.name}`) || localStorage.getItem('worldSnapUserStats');
        if (statsRaw) {
          setUserStats(JSON.parse(statsRaw));
        }
        setShowOnboarding(false);
      }
    } catch (err) {
      console.error('Failed to initialize saved profile', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnboardingComplete = (name: string, avatarSeed: string) => {
    const profile = { name, avatarSeed };
    setUserProfile(profile);
    try {
      const savedStats = localStorage.getItem(`worldSnapUserStats_${name}`);
      if (savedStats) {
        setUserStats(JSON.parse(savedStats));
      } else {
        // New user: start fresh
        setUserStats(INITIAL_USER_STATS);
      }
    } catch (err) {
      console.error('Failed to load saved stats for user', err);
      setUserStats(INITIAL_USER_STATS);
    }
    setCurrentScreen("home");
    setShowOnboarding(false);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  const calculateScore = (distance: number): number => {
    // Score calculation: max 1000 points, decreases with distance
    if (distance < 10) return 1000;
    if (distance < 50) return 900;
    if (distance < 100) return 800;
    if (distance < 200) return 700;
    if (distance < 500) return 500;
    if (distance < 1000) return 300;
    if (distance < 2000) return 150;
    return 50;
  };

  const calculateXPGain = (score: number): number => {
    // XP gain based on score
    return Math.floor(score / 2);
  };

  const calculateLevelFromXP = (xp: number): number => {
    // Simple level formula: level = floor(sqrt(xp/100)) + 1
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  };

  const checkAndUnlockBadges = (stats: UserStats, score: number): number[] => {
    const newBadges: number[] = [];
    
    // Badge 1: First Win (play first game)
    if (stats.gamesPlayed === 1 && !stats.unlockedBadges.includes(1)) {
      newBadges.push(1);
    }
    
    // Badge 2: Explorer (play 10 games)
    if (stats.gamesPlayed >= 10 && !stats.unlockedBadges.includes(2)) {
      newBadges.push(2);
    }
    
    // Badge 3: Streak Master (5 day streak)
    if (stats.currentStreak >= 5 && !stats.unlockedBadges.includes(3)) {
      newBadges.push(3);
    }
    
    // Badge 5: Perfect Score (score 1000 in a game)
    if (score === 1000 && !stats.unlockedBadges.includes(5)) {
      newBadges.push(5);
    }
    
    // Badge 6: Globe Trotter (play 50 games)
    if (stats.gamesPlayed >= 50 && !stats.unlockedBadges.includes(6)) {
      newBadges.push(6);
    }
    
    return newBadges;
  };

  const updateStreak = (lastPlayed: string | null): number => {
    if (!lastPlayed) return 1;
    
    const today = new Date().toDateString();
    const lastDate = new Date(lastPlayed).toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (lastDate === today) {
      return userStats.currentStreak; // Same day, no change
    } else if (lastDate === yesterday) {
      return userStats.currentStreak + 1; // Consecutive day
    } else {
      return 1; // Streak broken, restart
    }
  };

  const handlePlayClick = () => {
    // Shuffle locations for a new game
    const shuffled = shuffleArray(allLocations).slice(0, 5);
    setGameLocations(shuffled);
    setCurrentRound(0);
    setCurrentGameScore(0);
    setCurrentScreen("game");
  };

  const handleGuessLocation = () => {
    setCurrentScreen("map");
  };

  const handleConfirmGuess = (lat: number, lng: number) => {
    setPlayerGuess({ lat, lng });
    const distance = calculateDistance(currentLocation.lat, currentLocation.lng, lat, lng);
    const score = calculateScore(distance);
    
    // Update game score
    setCurrentGameScore(currentGameScore + score);
    
    // Calculate rewards and XP
    const xpGain = calculateXPGain(score);
    const newXP = userStats.currentXP + xpGain;
    const newLevel = calculateLevelFromXP(newXP);
    
    // Token reward based on score (only if wallet connected)
    let tokenReward = 0;
    if (isWalletConnected) {
      tokenReward = (score / 1000) * 0.5; // Up to 0.5 cUSD per round
    }
    
    // Update streak
    const newStreak = updateStreak(userStats.lastPlayedDate);
    
    // Check if this is the final round
    const isFinalRound = currentRound === 4;
    
    // Update user stats
    const updatedStats: UserStats = {
      ...userStats,
      gamesPlayed: isFinalRound ? userStats.gamesPlayed + 1 : userStats.gamesPlayed,
      totalScore: userStats.totalScore + score,
      bestScore: Math.max(userStats.bestScore, score),
      currentStreak: newStreak,
      lastPlayedDate: new Date().toISOString(),
      currentXP: newXP,
      level: newLevel,
      totalEarned: userStats.totalEarned + tokenReward,
      availableToClaim: userStats.availableToClaim + tokenReward,
      unlockedBadges: userStats.unlockedBadges,
    };
    
    // Check for new badges
    const newBadges = checkAndUnlockBadges(updatedStats, score);
    if (newBadges.length > 0) {
      updatedStats.unlockedBadges = [...userStats.unlockedBadges, ...newBadges];
    }
    
    setUserStats(updatedStats);
    setCurrentScreen("results");
  };

  const handleNextRound = () => {
    if (currentRound < 4) {
      setCurrentRound(currentRound + 1);
      setPlayerGuess(null);
      setCurrentScreen("game");
    } else {
      // Game completed
      setCurrentScreen("home");
      setCurrentRound(0);
      setPlayerGuess(null);
      setCurrentGameScore(0);
    }
  };

  const handleBackToHome = () => {
    setCurrentScreen("home");
    setCurrentRound(0);
    setPlayerGuess(null);
    setCurrentGameScore(0);
  };

  const handleWalletConnect = (walletType: "minipay" | "celo" | "metamask") => {
    setIsWalletConnected(true);
    setCurrentScreen("home");
  };

  const handleAdjustBalance = (delta: number) => {
    setUserStats((prev) => ({
      ...prev,
      totalEarned: Math.max(0, +(prev.totalEarned + delta)),
    }));
  };

  const handleClaimRewards = () => {
    if (userStats.availableToClaim > 0) {
      setTransactionAmount(userStats.availableToClaim);
      setTransactionType("claim");
      setShowTransactionModal(true);
      
      // Simulate successful claim after modal closes
      setTimeout(() => {
        setUserStats({
          ...userStats,
          availableToClaim: 0,
        });
      }, 5000);
    }
  };

  const handleEnterPredictionPool = (amount: number) => {
    setTransactionAmount(amount);
    setTransactionType("reward");
    setShowTransactionModal(true);
    // After transaction, go to map guess
    setTimeout(() => {
      setCurrentScreen("map");
    }, 5000);
  };

  const distance = playerGuess
    ? calculateDistance(currentLocation.lat, currentLocation.lng, playerGuess.lat, playerGuess.lng)
    : 0;
  const score = calculateScore(distance);

  // Calculate accuracy percentage
  const accuracy = userStats.gamesPlayed > 0 
    ? Math.round((userStats.totalScore / (userStats.gamesPlayed * 5000)) * 100) 
    : 0;

  // Calculate rank based on total score (simplified)
  const rank = Math.max(1, 1000 - Math.floor(userStats.totalScore / 100));

  // Calculate max XP for current level
  const maxXP = (userStats.level * userStats.level) * 100;

  // Show splash screen first
  if (currentScreen === "splash") {
    return (
      <SplashScreen
        onComplete={() => {
          setCurrentScreen(showOnboarding ? "onboarding" : "home");
        }}
      />
    );
  }

  // Show onboarding if user hasn't completed it
  if (currentScreen === "onboarding" || !userProfile) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen">
      {currentScreen === "home" && (
        <HomeScreen
          onPlayClick={handlePlayClick}
          onProfileClick={() => setCurrentScreen("hackathon")}
          onLeaderboardClick={() => setCurrentScreen("leaderboard")}
          onWalletClick={() => setCurrentScreen("wallet")}
          onRewardsClick={() => setCurrentScreen("rewards")}
          onPredictionClick={() => setCurrentScreen("prediction")}
          onEducationalClick={() => setCurrentScreen("educational")}
          isWalletConnected={isWalletConnected}
          totalEarned={userStats.totalEarned}
          gamesPlayed={userStats.gamesPlayed}
          accuracy={accuracy}
          currentStreak={userStats.currentStreak}
          currentXP={userStats.currentXP}
          maxXP={maxXP}
          level={userStats.level}
        />
      )}

      {currentScreen === "game" && (
        <GameScreen
          onGuessLocation={handleGuessLocation}
          onClose={handleBackToHome}
          imageUrl={currentLocation.imageUrl}
          round={currentRound + 1}
        />
      )}

      {currentScreen === "map" && (
        <MapGuessScreen
          onConfirm={handleConfirmGuess}
          onBack={() => setCurrentScreen("game")}
        />
      )}

      {currentScreen === "results" && playerGuess && (
        <ResultsScreen
          correctLocation={currentLocation}
          playerGuess={playerGuess}
          distance={distance}
          score={score}
          onNextRound={handleNextRound}
        />
      )}

      {currentScreen === "leaderboard" && (
        <LeaderboardScreen 
          onBack={handleBackToHome} 
          currentUserScore={userStats.totalScore}
          currentUserName={userProfile.name}
          currentUserAvatar={userProfile.avatarSeed}
        />
      )}

      {currentScreen === "wallet" && (
        <WalletConnectionScreen
          onConnect={handleWalletConnect}
          onBack={handleBackToHome}
          isConnected={isWalletConnected}
          walletBalance={userStats.totalEarned}
          onAdjustBalance={handleAdjustBalance}
        />
      )}

      {currentScreen === "rewards" && (
        <RewardsDashboard
          onBack={handleBackToHome}
          onClaimRewards={handleClaimRewards}
          totalEarned={userStats.totalEarned}
          availableToClaim={userStats.availableToClaim}
          dailyStreak={userStats.currentStreak}
          rank={rank}
          gamesPlayed={userStats.gamesPlayed}
          unlockedBadges={userStats.unlockedBadges}
        />
      )}

      {currentScreen === "prediction" && (
        <PredictionModeScreen
          onBack={handleBackToHome}
          onEnterPool={handleEnterPredictionPool}
          imageUrl={currentLocation.imageUrl}
        />
      )}

      {currentScreen === "educational" && (
        <EducationalModeScreen 
          onBack={handleBackToHome}
          onQuizComplete={(earnedAmount: number, xpGained: number) => {
            setUserStats({
              ...userStats,
              totalEarned: userStats.totalEarned + earnedAmount,
              availableToClaim: userStats.availableToClaim + earnedAmount,
              currentXP: userStats.currentXP + xpGained,
              level: calculateLevelFromXP(userStats.currentXP + xpGained),
            });
          }}
        />
      )}

      {currentScreen === "hackathon" && (
        <div className="min-h-screen bg-white">
          <HackathonInfoPanel />
          <div className="p-6">
            <button
              onClick={handleBackToHome}
              className="w-full p-4 rounded-2xl glass-card shadow-glow font-bold"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}

      <CeloTransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        amount={transactionAmount}
        transactionType={transactionType}
      />
    </div>
  );
}

export default App;