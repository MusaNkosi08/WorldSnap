import { motion } from "motion/react";
import { CheckCircle, Smartphone, Coins, Code, Zap, Globe } from "lucide-react";

export function HackathonInfoPanel() {
  const features = [
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Celo Blockchain",
      description: "Built on Celo for fast, low-cost transactions",
      color: "#35D07F",
    },
    {
      icon: <Smartphone className="w-5 h-5" />,
      title: "MiniPay Wallet",
      description: "Seamless mobile-first wallet integration",
      color: "#FBCC5C",
    },
    {
      icon: <Code className="w-5 h-5" />,
      title: "Solidity Smart Contracts",
      description: "Automated reward distribution on-chain",
      color: "#667eea",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Mobile-First UX",
      description: "Optimized for touch and responsive design",
      color: "#4facfe",
    },
    {
      icon: <Coins className="w-5 h-5" />,
      title: "Play-to-Earn Mechanics",
      description: "Earn cUSD tokens for gameplay accuracy",
      color: "#f5576c",
    },
  ];

  return (
    <div className="p-6">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card rounded-3xl p-6 shadow-glow"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl" style={{ background: "var(--gradient-celo)" }}>
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl">Hackathon Features</h3>
            <p className="text-sm opacity-60">Built for Celo</p>
          </div>
        </div>

        <div className="space-y-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50"
            >
              <div
                className="p-2 rounded-xl shrink-0"
                style={{ background: `${feature.color}20` }}
              >
                <div style={{ color: feature.color }}>{feature.icon}</div>
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span>{feature.title}</span>
                  <CheckCircle className="w-4 h-4" style={{ color: feature.color }} />
                </div>
                <p className="text-sm opacity-60">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-2xl" style={{ background: "var(--gradient-celo)" }}>
          <div className="text-center text-white">
            <p className="text-sm mb-1">Decentralized Gaming on Celo</p>
            <p className="text-xs opacity-80">
              WorldSnap combines geolocation gaming with blockchain rewards, creating an engaging Play-to-Earn experience on mobile.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
