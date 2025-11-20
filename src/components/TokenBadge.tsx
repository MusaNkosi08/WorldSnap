import { motion } from "motion/react";
import { Coins } from "lucide-react";

interface TokenBadgeProps {
  amount: number;
  symbol?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export function TokenBadge({ amount, symbol = "cUSD", size = "md", animated = false }: TokenBadgeProps) {
  const sizeClasses = {
    sm: "text-sm px-3 py-1",
    md: "text-base px-4 py-2",
    lg: "text-lg px-5 py-3",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const badge = (
    <div
      className={`inline-flex items-center gap-2 rounded-full ${sizeClasses[size]} shadow-glow-gold`}
      style={{ background: "var(--gradient-reward)" }}
    >
      <Coins className={iconSizes[size]} style={{ color: "#2E7D5A" }} />
      <span style={{ color: "#2E7D5A" }}>
        {amount.toFixed(2)} {symbol}
      </span>
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        {badge}
      </motion.div>
    );
  }

  return badge;
}
