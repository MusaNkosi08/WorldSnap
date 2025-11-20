import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2, CheckCircle, Coins, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

interface CeloTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  transactionType: "claim" | "reward";
}

type TransactionState = "confirming" | "processing" | "success" | "error";

export function CeloTransactionModal({
  isOpen,
  onClose,
  amount,
  transactionType,
}: CeloTransactionModalProps) {
  const [state, setState] = useState<TransactionState>("confirming");
  const [txHash, setTxHash] = useState("");

  useEffect(() => {
    if (isOpen && state === "confirming") {
      // Simulate transaction flow
      const timer1 = setTimeout(() => {
        setState("processing");
        setTxHash("0x" + Math.random().toString(16).substr(2, 64));
      }, 1500);

      const timer2 = setTimeout(() => {
        setState("success");
      }, 4500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen, state]);

  const handleClose = () => {
    setState("confirming");
    setTxHash("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card rounded-3xl shadow-glow-celo max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-200/50">
            <h3>
              {state === "confirming" && "Confirm Transaction"}
              {state === "processing" && "Processing..."}
              {state === "success" && "Transaction Successful!"}
              {state === "error" && "Transaction Failed"}
            </h3>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {state === "confirming" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mb-6"
                >
                  <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-glow-gold" style={{ background: "var(--gradient-reward)" }}>
                    <Coins className="w-10 h-10" style={{ color: "#2E7D5A" }} />
                  </div>
                </motion.div>
                <p className="text-sm opacity-60 mb-2">You're about to {transactionType}</p>
                <div className="text-4xl mb-6" style={{ color: "#35D07F" }}>
                  {amount.toFixed(2)} cUSD
                </div>
                <div className="space-y-2 text-left mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="opacity-60">Network</span>
                    <span>Celo Mainnet</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-60">Gas Fee</span>
                    <span>~0.001 CELO</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-60">Total</span>
                    <span>{amount.toFixed(2)} cUSD</span>
                  </div>
                </div>
              </motion.div>
            )}

            {state === "processing" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mb-6"
                >
                  <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center" style={{ background: "var(--gradient-celo)" }}>
                    <Loader2 className="w-10 h-10 text-white" />
                  </div>
                </motion.div>
                <p className="mb-4">Awaiting Blockchain Confirmation</p>
                <p className="text-sm opacity-60 mb-4">This may take a few seconds...</p>
                {txHash && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs opacity-60 mb-1">Transaction Hash</p>
                    <p className="text-xs font-mono break-all">{txHash.substring(0, 20)}...</p>
                  </div>
                )}
              </motion.div>
            )}

            {state === "success" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="mb-6"
                >
                  <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center" style={{ background: "var(--gradient-earn)" }}>
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                </motion.div>
                <p className="text-sm opacity-60 mb-2">Successfully {transactionType === "claim" ? "claimed" : "received"}</p>
                <div className="text-4xl mb-6" style={{ color: "#35D07F" }}>
                  {amount.toFixed(2)} cUSD
                </div>
                <div className="p-4 bg-green-50 rounded-2xl mb-4">
                  <p className="text-sm">Your tokens have been transferred to your wallet!</p>
                </div>
                {txHash && (
                  <button className="flex items-center gap-2 text-sm mx-auto opacity-60 hover:opacity-100 transition-opacity">
                    <span>View on Explorer</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 pt-0">
            {state === "confirming" && (
              <div className="flex gap-3">
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1 rounded-2xl h-12"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setState("processing")}
                  className="flex-1 rounded-2xl h-12 shadow-glow-celo"
                  style={{
                    background: "linear-gradient(135deg, #35D07F 0%, #5AE49A 100%)",
                    color: "white",
                  }}
                >
                  Confirm
                </Button>
              </div>
            )}

            {state === "success" && (
              <Button
                onClick={handleClose}
                className="w-full rounded-2xl h-12 shadow-glow-celo"
                style={{
                  background: "linear-gradient(135deg, #35D07F 0%, #5AE49A 100%)",
                  color: "white",
                }}
              >
                Done
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
