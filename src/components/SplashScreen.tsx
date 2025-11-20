import { motion } from "motion/react";
import { Globe, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // Auto-complete after animation
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
      }}
    >
      {/* Animated background particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-white"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Spinning World */}
      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: 1, rotate: 360 }}
        transition={{
          scale: { duration: 1, ease: "easeOut" },
          rotate: { duration: 3, ease: "linear", repeat: Infinity },
        }}
        className="relative mb-8"
      >
        <motion.div
          className="w-48 h-48 rounded-full flex items-center justify-center relative"
          style={{
            background: "linear-gradient(135deg, #35D07F 0%, #5AE49A 100%)",
            boxShadow: "0 0 80px rgba(53, 208, 127, 0.6)",
          }}
        >
          <Globe className="w-24 h-24 text-white" />
          
          {/* Orbiting sparkles */}
          <motion.div
            className="absolute"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, ease: "linear", repeat: Infinity }}
          >
            <Sparkles 
              className="w-8 h-8 text-yellow-300" 
              style={{ 
                filter: "drop-shadow(0 0 10px rgba(251, 204, 92, 0.8))",
                position: "absolute",
                top: "-60px",
              }} 
            />
          </motion.div>
          
          <motion.div
            className="absolute"
            animate={{ rotate: -360 }}
            transition={{ duration: 3, ease: "linear", repeat: Infinity }}
          >
            <Sparkles 
              className="w-6 h-6 text-yellow-200" 
              style={{ 
                filter: "drop-shadow(0 0 8px rgba(251, 204, 92, 0.6))",
                position: "absolute",
                right: "-70px",
                top: "20px",
              }} 
            />
          </motion.div>
          
          <motion.div
            className="absolute"
            animate={{ rotate: 360 }}
            transition={{ duration: 2.5, ease: "linear", repeat: Infinity }}
          >
            <Sparkles 
              className="w-7 h-7 text-white" 
              style={{ 
                filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))",
                position: "absolute",
                bottom: "-60px",
                left: "10px",
              }} 
            />
          </motion.div>

          {/* Pulsing glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(53, 208, 127, 0.4) 0%, transparent 70%)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </motion.div>

      {/* Logo Text */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-center mb-12"
      >
        <motion.h1
          className="text-6xl mb-3 text-white"
          style={{
            textShadow: "0 0 30px rgba(255, 255, 255, 0.5)",
          }}
          animate={{
            textShadow: [
              "0 0 30px rgba(255, 255, 255, 0.5)",
              "0 0 50px rgba(255, 255, 255, 0.8)",
              "0 0 30px rgba(255, 255, 255, 0.5)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          WorldSnap
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xl text-white/90"
        >
          Explore • Guess • Earn
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="flex items-center justify-center gap-2 mt-3"
        >
          <div className="px-4 py-2 rounded-full glass-card">
            <span className="text-sm text-white">Powered by Celo 🌱</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Loading Bar */}
      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: "80%" }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="max-w-md mx-auto"
      >
        <div className="glass-card rounded-full h-2 overflow-hidden mb-3"
          style={{ background: "rgba(255, 255, 255, 0.2)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #35D07F 0%, #FBCC5C 100%)",
              boxShadow: "0 0 20px rgba(53, 208, 127, 0.6)",
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        <motion.p
          className="text-center text-white/80 text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading your adventure...
        </motion.p>
      </motion.div>

      {/* Skip button (appears after 2 seconds) */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={onComplete}
        className="absolute bottom-10 text-white/60 text-sm underline"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        Skip intro
      </motion.button>

      {/* Floating coins animation */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`coin-${i}`}
          className="absolute"
          style={{
            left: `${20 + i * 15}%`,
            bottom: "-50px",
          }}
          animate={{
            y: [0, -800],
            rotate: [0, 360],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 4,
            delay: 2 + i * 0.3,
            ease: "easeOut",
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #FBCC5C 0%, #F7931A 100%)",
              boxShadow: "0 0 20px rgba(251, 204, 92, 0.6)",
            }}
          >
            <span className="text-white text-xs">$</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
