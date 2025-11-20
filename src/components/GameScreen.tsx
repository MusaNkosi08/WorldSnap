import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ZoomIn, RotateCw, MapPin, X } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface GameScreenProps {
  onGuessLocation: () => void;
  onClose: () => void;
  imageUrl: string;
  round: number;
}

export function GameScreen({ onGuessLocation, onClose, imageUrl, round }: GameScreenProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [rotation, setRotation] = useState(0);

  const handleRotate = () => {
    setRotation((prev) => prev + 90);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-2xl px-4 py-2 shadow-glow"
        >
          <span className="text-sm">Round {round}/5</span>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="glass-card rounded-full p-2 shadow-glow"
        >
          <X className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Image Container */}
      <div className="flex-1 relative overflow-hidden">
        <motion.div
          className="w-full h-full"
          animate={{
            scale: isZoomed ? 1.5 : 1,
            rotate: rotation,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <ImageWithFallback
            src={imageUrl}
            alt="Location to guess"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>

      {/* Control Buttons */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 flex flex-col gap-3">
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsZoomed(!isZoomed)}
          className="glass-card rounded-2xl p-4 shadow-glow"
        >
          <ZoomIn className="w-6 h-6" style={{ color: isZoomed ? "#667eea" : "#000" }} />
        </motion.button>
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleRotate}
          className="glass-card rounded-2xl p-4 shadow-glow"
        >
          <RotateCw className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-0 left-0 right-0 p-6 z-20"
      >
        <Button
          onClick={onGuessLocation}
          className="w-full h-16 text-xl rounded-2xl shadow-glow-pink"
          style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "white",
          }}
        >
          <MapPin className="w-6 h-6 mr-2" />
          Guess Location
        </Button>
      </motion.div>
    </div>
  );
}
