import { useState } from "react";
import { motion } from "motion/react";
import { MapPin, ArrowLeft, Check } from "lucide-react";
import { Button } from "./ui/button";
import worldMapImage from "../assets/05b487743abd150d463645e5230b15f74858766c.png";

interface MapGuessScreenProps {
  onConfirm: (lat: number, lng: number) => void;
  onBack: () => void;
}

export function MapGuessScreen({ onConfirm, onBack }: MapGuessScreenProps) {
  const [markerPosition, setMarkerPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert pixel position to lat/lng
    // Map dimensions: width = full, height = full
    const lng = ((x / rect.width) * 360) - 180; // -180 to 180
    const lat = 90 - ((y / rect.height) * 180); // 90 to -90

    setMarkerPosition({ x, y });
    setSelectedLat(lat);
    setSelectedLng(lng);
  };

  const handleConfirm = () => {
    if (selectedLat !== null && selectedLng !== null) {
      onConfirm(selectedLat, selectedLng);
    }
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-6 bg-white shadow-2xl flex items-center gap-4 z-10"
        style={{ borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}
      >
        <motion.button
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.05 }}
          onClick={onBack}
          className="p-3 rounded-2xl shadow-lg"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </motion.button>
        <div className="flex-1">
          <h2 className="text-2xl mb-1" style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Where is this? 🌍</h2>
          <p className="text-sm opacity-60">Tap the map to place your guess</p>
        </div>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <MapPin className="w-8 h-8" style={{ color: "#f5576c" }} />
        </motion.div>
      </motion.div>

      {/* Map Container with Better Spacing */}
      <div className="flex-1 relative overflow-hidden m-4 rounded-3xl shadow-2xl" style={{ border: '4px solid white' }}>
        <div
          onClick={handleMapClick}
          className="w-full h-full relative cursor-crosshair"
        >
          {/* World Map Image */}
          <img 
            src={worldMapImage}
            alt="World Map"
            className="w-full h-full object-cover pointer-events-none absolute inset-0"
          />

          {/* Coordinate overlay with better positioning */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
            <motion.div 
              className="px-6 py-4 rounded-2xl shadow-xl"
              style={{ 
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)',
                backdropFilter: 'blur(10px)'
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="mb-2 text-white/90 text-sm">📍 Your Guess</div>
              {markerPosition ? (
                <div className="space-y-1 text-white">
                  <div className="text-lg">Lat: {selectedLat?.toFixed(2)}°</div>
                  <div className="text-lg">Lng: {selectedLng?.toFixed(2)}°</div>
                </div>
              ) : (
                <div className="text-white/80 text-sm">Tap to select location</div>
              )}
            </motion.div>
          </div>

          {/* Latitude/Longitude reference lines - less intrusive */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Equator */}
            <div className="absolute left-0 right-0 border-t-2 border-dashed border-yellow-400/40" style={{ top: '50%' }} />
            
            {/* Tropics */}
            <div className="absolute left-0 right-0 border-t border-dashed border-yellow-400/25" style={{ top: '25%' }} />
            <div className="absolute left-0 right-0 border-t border-dashed border-yellow-400/25" style={{ top: '75%' }} />
            
            {/* Prime Meridian */}
            <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-yellow-400/40" style={{ left: '50%' }} />
            
            {/* Other meridians */}
            <div className="absolute top-0 bottom-0 border-l border-dashed border-yellow-400/25" style={{ left: '25%' }} />
            <div className="absolute top-0 bottom-0 border-l border-dashed border-yellow-400/25" style={{ left: '75%' }} />
          </div>

          {/* User's marker - BIGGER and MORE EXCITING */}
          {markerPosition && (
            <motion.div
              initial={{ scale: 0, y: -100, rotate: -180 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="absolute pointer-events-none"
              style={{
                left: markerPosition.x,
                top: markerPosition.y,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div className="relative">
                {/* Pin shadow - bigger */}
                <div 
                  className="absolute w-10 h-10 rounded-full bg-black/40 blur-md"
                  style={{
                    left: '50%',
                    top: '100%',
                    transform: 'translate(-50%, -8px)',
                  }}
                />
                
                {/* Pin - MUCH BIGGER */}
                <MapPin
                  className="w-16 h-16 drop-shadow-2xl"
                  style={{ color: "#f5576c" }}
                  fill="#f5576c"
                />
                
                {/* Checkmark badge - bigger */}
                <motion.div 
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-xl"
                  style={{ background: "linear-gradient(135deg, #35D07F 0%, #28a745 100%)" }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                >
                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                </motion.div>

                {/* Multiple pulse effects - MORE EXCITING */}
                <motion.div
                  className="absolute rounded-full border-4"
                  style={{
                    borderColor: '#f5576c',
                    left: '50%',
                    top: '50%',
                    width: '32px',
                    height: '32px',
                    transform: 'translate(-50%, -50%)',
                  }}
                  animate={{
                    scale: [1, 2.5, 1],
                    opacity: [0.9, 0, 0.9],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
                <motion.div
                  className="absolute rounded-full border-4"
                  style={{
                    borderColor: '#35D07F',
                    left: '50%',
                    top: '50%',
                    width: '32px',
                    height: '32px',
                    transform: 'translate(-50%, -50%)',
                  }}
                  animate={{
                    scale: [1, 3, 1],
                    opacity: [0.8, 0, 0.8],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: 0.3,
                  }}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Confirm Button - MORE SPACE AND EXCITEMENT */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="p-6 pb-8"
      >
        <motion.div
          whileHover={markerPosition ? { scale: 1.02 } : {}}
          whileTap={markerPosition ? { scale: 0.98 } : {}}
        >
          <Button
            onClick={handleConfirm}
            disabled={!markerPosition}
            className="w-full h-16 text-xl rounded-3xl shadow-2xl font-bold relative overflow-hidden"
            style={{
              background: markerPosition
                ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                : "#d0d0d0",
              color: "white",
              border: markerPosition ? '3px solid white' : 'none',
            }}
          >
            {markerPosition && (
              <motion.div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                }}
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-3">
              {markerPosition ? (
                <>
                  <Check className="w-6 h-6" strokeWidth={3} />
                  <span>CONFIRM MY GUESS!</span>
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    🎯
                  </motion.span>
                </>
              ) : (
                <>
                  <MapPin className="w-6 h-6" />
                  <span>TAP MAP TO PLACE PIN</span>
                </>
              )}
            </span>
          </Button>
        </motion.div>
        
        {markerPosition && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm mt-4 px-6 py-3 rounded-2xl mx-auto max-w-sm"
            style={{ 
              background: 'rgba(255, 255, 255, 0.9)',
              color: '#667eea',
              fontWeight: 600
            }}
          >
            📍 Your guess: {selectedLat?.toFixed(2)}°, {selectedLng?.toFixed(2)}°
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}