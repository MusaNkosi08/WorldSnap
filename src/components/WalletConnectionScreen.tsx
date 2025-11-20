import { motion } from "motion/react";
import { Wallet, Smartphone, ArrowLeft, Shield, Coins, Zap, Send, Download, LogOut, Copy, QrCode, X, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

interface WalletConnectionScreenProps {
  onConnect: (walletType: "minipay" | "celo" | "metamask") => void;
  onBack: () => void;
  isConnected?: boolean;
  walletBalance?: number;
  onAdjustBalance?: (delta: number) => void;
}

export function WalletConnectionScreen({ onConnect, onBack, isConnected, walletBalance = 0, onAdjustBalance }: WalletConnectionScreenProps) {
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [sendAddress, setSendAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [metaMaskConnected, setMetaMaskConnected] = useState(false);
  const [metaMaskAddress, setMetaMaskAddress] = useState("");
  const [connectingMetaMask, setConnectingMetaMask] = useState(false);
  
  const walletAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8";
  // Normalize/checksum the platform wallet address for ethers v6 strict validation
  let platformAddress = walletAddress;
  try {
    platformAddress = ethers.getAddress(walletAddress);
  } catch (e) {
    // fallback: use lowercased address and continue (some providers accept lowercase)
    platformAddress = walletAddress.toLowerCase();
  }
  const [txStatusMessage, setTxStatusMessage] = useState<string | null>(null);
  const [txInProgress, setTxInProgress] = useState(false);
  const [transactions, setTransactions] = useState<Array<any>>(() => {
    try {
      const saved = localStorage.getItem('worldSnapTxHistory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [provider, setProvider] = useState<any | null>(null);
  const [signer, setSigner] = useState<any | null>(null);
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);
  const [tokenSymbol, setTokenSymbol] = useState<string>("cUSD");
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);
  const [onChainBalance, setOnChainBalance] = useState<number | null>(null);
  const [lastCheckedBlock, setLastCheckedBlock] = useState<number | null>(null);
  const [platformTokenBalanceBN, setPlatformTokenBalanceBN] = useState<any | null>(null);
  const [platformNativeBalanceBN, setPlatformNativeBalanceBN] = useState<any | null>(null);

  const ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function transfer(address to, uint256 amount) returns (bool)"
  ];

  useEffect(() => {
    if (provider && signer && tokenContract && metaMaskAddress) {
      fetchTokenBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, signer, tokenContract, metaMaskAddress]);

  // Setup block listener to detect incoming transfers (token and native)
  useEffect(() => {
    if (!provider) return;

    let mounted = true;

    const setup = async () => {
      try {
        const startBlock = await provider.getBlockNumber();
        if (!mounted) return;
        setLastCheckedBlock(startBlock);

        // fetch initial platform balances
        if (tokenContract) {
          try {
            const raw = await tokenContract.balanceOf(platformAddress);
            setPlatformTokenBalanceBN(raw);
          } catch (err) {
            // ignore
          }
        }
        try {
          const native = await provider.getBalance(platformAddress);
          setPlatformNativeBalanceBN(native);
        } catch (err) {
          // ignore
        }
      } catch (err) {
        console.error('Failed to initialize block watcher', err);
      }
    };

    setup();

    const onBlock = async (blockNumber: number) => {
      console.log('[Wallet] new block', blockNumber);
      try {
        const fromBlock = (lastCheckedBlock || blockNumber - 1) + 1;
        // token transfers to platform (if a token contract is loaded)
        if (tokenContract) {
          try {
            const filter = tokenContract.filters.Transfer(null, platformAddress);
            const events = await tokenContract.queryFilter(filter, fromBlock, blockNumber);
            for (const ev of events) {
              const rawAmount: ethers.BigNumber = ev.args?.[2] || ev.args?.value || ev.args?.amount || ev.args?._value;
              const amount = Number(ethers.formatUnits(rawAmount, tokenDecimals));
              // record receive and update app balance
              pushTransaction({ type: 'receive', amount, txHash: ev.transactionHash });
              if (typeof onAdjustBalance === 'function') {
                onAdjustBalance(amount);
              }
            }
            // update platform token balance
            try {
              const newBal = await tokenContract.balanceOf(platformAddress);
              setPlatformTokenBalanceBN(newBal);
              setOnChainBalance(Number(ethers.formatUnits(newBal, tokenDecimals)));
            } catch {}
          } catch (err) {
            console.error('Error querying token transfer events', err);
          }
        }

        // If no specific token contract is loaded, scan logs for any ERC-20 Transfer events
        // that target our platform address. This lets us detect cUSD/sCELO transfers
        // without requiring the user to manually load the token contract.
        try {
          if (!tokenContract && provider) {
            const iface = new ethers.Interface(ERC20_ABI);
            const transferTopic = iface.getEventTopic('Transfer');
            const addrHexSmall = platformAddress.replace(/^0x/, '').toLowerCase();
            const toTopicSmall = '0x' + addrHexSmall.padStart(64, '0');
            const logs = await provider.getLogs({ fromBlock, toBlock: blockNumber, topics: [transferTopic, null, toTopicSmall] });
            for (const log of logs) {
              try {
                const parsed = iface.parseLog(log);
                const raw = parsed.args?.[2] || parsed.args?.value || parsed.args?._value;
                const amount = Number(ethers.formatUnits(raw, tokenDecimals || 18));
                // avoid duplicate entries (pushTransaction de-dupes by txHash)
                pushTransaction({ type: 'receive', amount, txHash: log.transactionHash });
                if (typeof onAdjustBalance === 'function') onAdjustBalance(amount);
              } catch (e) {
                console.error('Failed to decode ERC20 transfer log', e);
              }
            }
          }
        } catch (err) {
          console.error('Error scanning logs for ERC-20 transfers', err);
        }

        // native balance changes
        try {
          const newNative = await provider.getBalance(platformAddress);
          const prev = platformNativeBalanceBN;
          if (prev && newNative.gt(prev)) {
            const diff = newNative.sub(prev);
            const human = Number(ethers.formatEther(diff));
            pushTransaction({ type: 'receive', amount: human, note: 'native', txHash: undefined });
            if (typeof onAdjustBalance === 'function') onAdjustBalance(human);
          }
          setPlatformNativeBalanceBN(newNative);
        } catch (err) {
          console.error('Native balance check failed', err);
        }

        setLastCheckedBlock(blockNumber);
      } catch (err) {
        console.error('Error in block handler', err);
      }
    };

    provider.on('block', onBlock);

    return () => {
      mounted = false;
      try { provider.off('block', onBlock); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, tokenContract, lastCheckedBlock, tokenDecimals, tokenSymbol, platformNativeBalanceBN, platformTokenBalanceBN]);

  // Polling fallback: query recent events every 15s if provider exists
  useEffect(() => {
    if (!provider) return;
    let mounted = true;
    const interval = setInterval(async () => {
      try {
        if (!mounted) return;
        const latest = await provider.getBlockNumber();
        console.log('[Wallet] polling latest block', latest);
        // reuse resync logic: check token events and native balance
        if (tokenContract) {
          const fromBlock = Math.max((lastCheckedBlock || latest - 50), latest - 200);
          try {
            const events = await tokenContract.queryFilter(tokenContract.filters.Transfer(null, platformAddress), fromBlock, latest);
            for (const ev of events) {
              const rawAmount: ethers.BigNumber = ev.args?.[2] || ev.args?.value || ev.args?.amount || ev.args?._value;
              const amount = Number(ethers.formatUnits(rawAmount, tokenDecimals));
              pushTransaction({ type: 'receive', amount, txHash: ev.transactionHash });
              if (typeof onAdjustBalance === 'function') onAdjustBalance(amount);
            }
          } catch (err) {
            console.error('Polling token events failed', err);
          }
        } else {
          // scan logs for ERC20 Transfer events to our platform address
          try {
            const fromBlock = Math.max((lastCheckedBlock || latest - 50), latest - 200);
            const iface = new ethers.Interface(ERC20_ABI);
            const transferTopic = iface.getEventTopic('Transfer');
            // topic for address: left-pad address (without 0x) to 32 bytes
            const addrHex = platformAddress.replace(/^0x/, '').toLowerCase();
            const toTopic = '0x' + addrHex.padStart(64, '0');
            const logs = await provider.getLogs({ fromBlock, toBlock: latest, topics: [transferTopic, null, toTopic] });
            for (const log of logs) {
              try {
                const parsed = iface.parseLog(log);
                const raw = parsed.args?.[2] || parsed.args?.value || parsed.args?._value;
                const amount = Number(ethers.formatUnits(raw, tokenDecimals || 18));
                pushTransaction({ type: 'receive', amount, txHash: log.transactionHash });
                if (typeof onAdjustBalance === 'function') onAdjustBalance(amount);
              } catch (e) {
                console.error('Failed to decode log in polling', e);
              }
            }
          } catch (err) {
            console.error('Polling log scan failed', err);
          }
        }
        try {
          const newNative = await provider.getBalance(platformAddress);
          if (platformNativeBalanceBN && newNative.gt(platformNativeBalanceBN)) {
            const diff = newNative.sub(platformNativeBalanceBN);
            const human = Number(ethers.formatEther(diff));
            pushTransaction({ type: 'receive', amount: human, note: 'native' });
            if (typeof onAdjustBalance === 'function') onAdjustBalance(human);
          }
          setPlatformNativeBalanceBN(newNative);
        } catch (err) {
          console.error('Polling native balance failed', err);
        }
        setLastCheckedBlock(latest);
      } catch (err) {
        console.error('Polling failed', err);
      }
    }, 15000);

    return () => { mounted = false; clearInterval(interval); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, tokenContract, lastCheckedBlock, platformNativeBalanceBN]);

  const initProviderAndSigner = async () => {
    try {
      console.debug('[Wallet] initProviderAndSigner called');
      const eth = (window as any).ethereum;
      if (!eth) {
        console.warn('[Wallet] no window.ethereum available at init');
        return;
      }
      // ethers v6: use BrowserProvider
      const web3Provider = new (ethers as any).BrowserProvider(eth);
      setProvider(web3Provider);
      try {
        const _signer = await web3Provider.getSigner();
        setSigner(_signer);
      } catch (e) {
        try { setSigner(web3Provider.getSigner()); } catch (e2) { console.warn('[Wallet] getSigner failed', e2); }
      }
      try {
        const net = await web3Provider.getNetwork();
        console.debug('[Wallet] provider network', net);
      } catch (e) {
        console.error('[Wallet] failed to read provider network', e);
      }
    } catch (e) {
      console.error('Failed to init provider', e);
    }
  };

  const scanChainNow = async () => {
    console.debug('[Wallet] scanChainNow called');
    if (!provider) {
      console.warn('[Wallet] no provider available — initializing now');
      try {
        await initProviderAndSigner();
      } catch (e) {
        console.error('[Wallet] initProviderAndSigner failed during scan', e);
      }
      if (!provider) {
        console.warn('[Wallet] provider still not available after init');
        return;
      }
    }
    try {
      const network = await provider.getNetwork();
      console.debug('[Wallet SCAN] network', network);
      const latest = await provider.getBlockNumber();
      console.debug('[Wallet SCAN] latest block', latest);
      try {
        const native = await provider.getBalance(platformAddress);
        console.debug('[Wallet SCAN] platform native balance (wei)', native.toString(), 'human', ethers.formatEther(native));
      } catch (e) { console.error('[Wallet SCAN] native balance read failed', e); }

      // scan last 100 blocks for Transfer events to our address
      const fromBlock = Math.max(latest - 100, 0);
      const iface = new ethers.Interface(ERC20_ABI);
      const transferTopic = iface.getEventTopic('Transfer');
      const addrHex = platformAddress.replace(/^0x/, '').toLowerCase();
      const toTopic = '0x' + addrHex.padStart(64, '0');
      console.debug('[Wallet SCAN] scanning logs', { fromBlock, toBlock: latest });
      let logs: any[] = [];
      try {
        if (typeof provider.getLogs === 'function') {
          logs = await provider.getLogs({ fromBlock, toBlock: latest, topics: [transferTopic, null, toTopic] });
        } else if (typeof provider.send === 'function') {
          // BrowserProvider supports send(method, params)
          const params = [{ fromBlock: `0x${fromBlock.toString(16)}`, toBlock: `0x${latest.toString(16)}`, topics: [transferTopic, null, toTopic] }];
          logs = await provider.send('eth_getLogs', params);
        } else {
          console.warn('[Wallet SCAN] provider does not support getLogs or send');
        }
      } catch (e) {
        console.error('[Wallet SCAN] getLogs/send failed', e);
      }
      console.debug('[Wallet SCAN] logs found count', logs.length);
      for (const l of logs) console.debug('[Wallet SCAN] log', l.transactionHash, l.address, l.topics);
    } catch (err) {
      console.error('[Wallet SCAN] failed', err);
    }
  };

  const loadTokenContract = async (address: string) => {
    if (!provider) initProviderAndSigner();
    const web3Provider = provider || new (ethers as any).BrowserProvider((window as any).ethereum);
    try {
      const contract = new ethers.Contract(address, ERC20_ABI, web3Provider);
      const decimals = await contract.decimals();
      const symbol = await contract.symbol();
      setTokenContract(contract);
      setTokenDecimals(Number(decimals));
      setTokenSymbol(symbol);
      setTokenAddress(address);
      // if signer available, fetch balance
      if (metaMaskAddress) {
        try {
          const signerObj = await web3Provider.getSigner();
          fetchTokenBalance(contract, signerObj);
        } catch (e) {
          try { fetchTokenBalance(contract, web3Provider.getSigner()); } catch {}
        }
      }
    } catch (err) {
      console.error('Failed to load token contract', err);
      setTxStatusMessage('Failed to load token contract: ' + (err as any)?.message);
      clearTxMessageLater();
    }
  };

  const fetchTokenBalance = async (contractParam?: ethers.Contract, signerParam?: ethers.Signer) => {
    try {
      const contract = contractParam || tokenContract;
      if (!contract) return;
      const address = metaMaskAddress;
      const raw = await contract.balanceOf(address);
      const decimals = tokenDecimals;
      const human = Number(ethers.formatUnits(raw, decimals));
      setOnChainBalance(human);
    } catch (err) {
      console.error('Failed to fetch token balance', err);
    }
  };
  
  const handleConnectMetaMask = async () => {
    console.debug('[Wallet] handleConnectMetaMask called');
    setConnectingMetaMask(true);
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        // Switch to Celo network (Chain ID: 42220)
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xA4EC' }], // 42220 in hex
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xA4EC',
                  chainName: 'Celo Mainnet',
                  nativeCurrency: {
                    name: 'CELO',
                    symbol: 'CELO',
                    decimals: 18
                  },
                  rpcUrls: ['https://forno.celo.org'],
                  blockExplorerUrls: ['https://explorer.celo.org']
                }]
              });
            } catch (addError) {
              console.error('Failed to add Celo network:', addError);
            }
          }
        }
        
        setMetaMaskAddress(accounts[0]);
        setMetaMaskConnected(true);
        // initialize ethers provider and signer
        initProviderAndSigner();
        console.log('MetaMask connected:', accounts[0]);
      } else {
        alert('MetaMask is not installed. Please install MetaMask to continue.');
        window.open('https://metamask.io/download/', '_blank');
      }
    } catch (error) {
      console.error('Failed to connect MetaMask:', error);
      alert('Failed to connect to MetaMask. Please try again.');
    } finally {
      setConnectingMetaMask(false);
    }
  };
  
  const handleCopyAddress = () => {
    console.debug('[Wallet] handleCopyAddress called');
    navigator.clipboard.writeText(walletAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleReceive = (amount: string) => {
    console.debug('[Wallet] handleReceive called with amount=', amount);
    // Receive: prompt MetaMask to send funds FROM the connected MetaMask account
    // TO the platform receiving address (`walletAddress`). On success we'll
    // credit the app-side balance. This aligns with "receive funds from MetaMask".
    if (!metaMaskConnected || !metaMaskAddress) {
      setTxStatusMessage('Please connect MetaMask first');
      clearTxMessageLater();
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setTxStatusMessage('Enter a valid amount to receive');
      clearTxMessageLater();
      return;
    }

    (async () => {
      try {
        setTxInProgress(true);
        // If a token contract is loaded, use ERC-20 transfer via signer
        if (tokenContract && signer) {
          const amountUnits = ethers.parseUnits(amount, tokenDecimals);
          const contractWithSigner = tokenContract.connect(signer);
          const tx = await contractWithSigner.transfer(platformAddress, amountUnits);
          // tx is a TransactionResponse
          setTxStatusMessage(`Transfer submitted — tx: ${tx.hash}`);
          // record pending receive (will be finalized by block watcher)
          pushTransaction({ type: 'receive', amount: Number(amount), txHash: tx.hash, note: 'pending' });
        } else {
          // Fallback to native send (eth_sendTransaction)
          const ethereum = (window as any).ethereum;
          if (!ethereum) throw new Error('MetaMask not available');
          const value = amountToWeiHex(amount);
          const txParams = {
            from: metaMaskAddress,
            to: platformAddress,
            value,
          } as any;
          const txHash = await ethereum.request({ method: 'eth_sendTransaction', params: [txParams] });
          setTxStatusMessage(`Transfer submitted — tx: ${txHash}`);
          pushTransaction({ type: 'receive', amount: Number(amount), txHash, note: 'pending' });
        }
      } catch (err: any) {
        console.error('Receive failed', err);
        setTxStatusMessage('Receive failed: ' + (err?.message || 'unknown error'));
      } finally {
        setTxInProgress(false);
        clearTxMessageLater();
        setShowReceiveModal(false);
        setReceiveAmount('');
      }
    })();
  };

  const clearTxMessageLater = (ms = 5000) => {
    setTimeout(() => setTxStatusMessage(null), ms);
  };

  const pushTransaction = (tx: { type: string; amount: number; txHash?: string; note?: string; timestamp?: string }) => {
    console.debug('[Wallet] pushTransaction', tx.type, tx.amount, tx.txHash || tx.note || 'no-tx');
    const entry = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      timestamp: tx.timestamp || new Date().toISOString(),
      ...tx,
    };
    setTransactions((prev) => {
      // if txHash exists and we already have an entry with same txHash, update it
      if (tx.txHash) {
        const idx = prev.findIndex((p) => p.txHash === tx.txHash);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...entry };
          try { localStorage.setItem('worldSnapTxHistory', JSON.stringify(updated)); } catch {}
          return updated;
        }
      }
      const next = [entry, ...prev].slice(0, 20);
      try { localStorage.setItem('worldSnapTxHistory', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const amountToWeiHex = (amount: string) => {
    // Convert decimal string to wei hex string without losing precision
    const [intPart, fracPart = ""] = (amount || "0").split('.');
    const whole = BigInt(intPart || '0');
    const frac = (fracPart + '0'.repeat(18)).slice(0, 18); // 18 decimals
    const wei = whole * 10n ** 18n + BigInt(frac);
    return '0x' + wei.toString(16);
  };
  
  const handleSend = () => {
    console.debug('[Wallet] handleSend called with sendAmount=', sendAmount, 'sendAddress=', sendAddress);
    // Send: transfer app-held funds TO the connected MetaMask address
    if (!metaMaskAddress) {
      setTxStatusMessage('Please connect MetaMask first');
      clearTxMessageLater();
      return;
    }

    if (!sendAmount || Number(sendAmount) <= 0) {
      setTxStatusMessage('Enter a valid amount to send to MetaMask');
      clearTxMessageLater();
      return;
    }

    // We cannot sign a transaction from the app/platform wallet in the browser
    // without a backend or private key. So we simulate the app sending funds
    // to the connected MetaMask address by deducting the app-side balance
    // and showing a confirmation message. To perform a real on-chain transfer
    // the server or a contract would need to execute the transaction.
    if (typeof onAdjustBalance === 'function') {
      onAdjustBalance(-Number(sendAmount));
    }
    pushTransaction({ type: 'send', amount: Number(sendAmount), note: `to ${metaMaskAddress}` });
    setTxStatusMessage(`Sent ${sendAmount} cUSD to ${metaMaskAddress} (simulated)`);
    clearTxMessageLater();
    setShowSendModal(false);
    setSendAddress('');
    setSendAmount('');
  };
  
  const handleWithdraw = (amount: string) => {
    console.debug('[Wallet] handleWithdraw called with amount=', amount);
    // Withdraw: transfer app-held funds TO the connected MetaMask account.
    // This cannot be executed from the browser without the app/platform
    // signing a transaction (server or contract). We'll simulate the
    // withdrawal locally by deducting the app-side balance and showing a status
    // message. For a real on-chain withdraw the backend or a contract must
    // send the funds to `metaMaskAddress`.
    if (!metaMaskAddress) {
      setTxStatusMessage('Please connect MetaMask first');
      clearTxMessageLater();
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setTxStatusMessage('Enter a valid amount to withdraw');
      clearTxMessageLater();
      return;
    }

    // Simulate immediate withdraw
    if (typeof onAdjustBalance === 'function') {
      onAdjustBalance(-Number(amount));
    }
    pushTransaction({ type: 'withdraw', amount: Number(amount), note: `to ${metaMaskAddress}` });
    setTxStatusMessage(`Withdrawal of ${amount} cUSD to ${metaMaskAddress} initiated (simulated)`);
    clearTxMessageLater();
    setShowWithdrawModal(false);
  };
  
  // If wallet is connected, show wallet dashboard
  if (isConnected) {
    return (
      <>
        <div className="min-h-screen gradient-celo flex flex-col p-6 relative overflow-hidden">
          {/* Animated background elements */}
          <motion.div
            className="absolute top-20 right-10 w-48 h-48 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)" }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Header */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-4 mb-8"
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="p-3 rounded-2xl glass-card shadow-glow-celo"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
            <div className="flex-1">
              <h2 className="text-2xl text-white">My Wallet 💰</h2>
              <p className="text-white/70 text-sm">Manage your rewards</p>
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Wallet className="w-8 h-8 text-white" />
            </motion.div>
          </motion.div>

          {/* Transaction toast */}
          {txStatusMessage && (
            <div className="fixed top-6 right-6 z-50">
              <div className="px-4 py-3 rounded-xl shadow-lg bg-white/95 text-sm">
                {txStatusMessage}
              </div>
            </div>
          )}

          {/* Balance Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-3xl p-8 mb-6 shadow-2xl text-center"
            style={{ 
              background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)",
              border: "3px solid rgba(255,255,255,0.5)"
            }}
          >
            <div className="text-sm opacity-60 mb-2">Your Balance</div>
            <motion.div 
              className="text-5xl mb-3"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ 
                background: 'linear-gradient(135deg, #35D07F 0%, #5AE49A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {walletBalance.toFixed(3)} cUSD
            </motion.div>
            <div className="text-xs opacity-50">≈ ${(walletBalance * 1.0).toFixed(2)} USD</div>
            
            {/* Connected to MetaMask Badge */}
            {metaMaskConnected ? (
              <motion.div 
                className="mt-4 inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm shadow-lg"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(246, 133, 27, 0.1) 0%, rgba(246, 133, 27, 0.05) 100%)',
                  border: '2px solid rgba(246, 133, 27, 0.3)'
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Wallet className="w-5 h-5" style={{ color: '#F6851B' }} />
                <div className="flex flex-col items-start">
                  <span style={{ color: '#F6851B' }} className="font-semibold">Connected to MetaMask</span>
                  <span className="text-xs opacity-60" style={{ color: '#F6851B' }}>
                    {metaMaskAddress.slice(0, 6)}...{metaMaskAddress.slice(-4)}
                  </span>
                </div>
                <CheckCircle className="w-5 h-5 animate-pulse" style={{ color: '#35D07F' }} />
              </motion.div>
            ) : (
              <motion.button
                onClick={handleConnectMetaMask}
                disabled={connectingMetaMask}
                className="mt-4 inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm shadow-lg cursor-pointer"
                style={{ 
                  background: connectingMetaMask 
                    ? 'linear-gradient(135deg, rgba(200, 200, 200, 0.1) 0%, rgba(200, 200, 200, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(246, 133, 27, 0.1) 0%, rgba(246, 133, 27, 0.05) 100%)',
                  border: '2px solid rgba(246, 133, 27, 0.3)'
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Wallet className="w-5 h-5" style={{ color: '#F6851B' }} />
                <span style={{ color: '#F6851B' }} className="font-semibold">
                  {connectingMetaMask ? 'Connecting...' : 'Connect to MetaMask'}
                </span>
              </motion.button>
            )}
            {/* Token selector UI (connected only) */}
            {metaMaskConnected && (
              <div className="mt-3 text-center">
                {onChainBalance !== null && (
                  <div className="text-sm text-white/90">On-chain: {onChainBalance.toFixed(6)} {tokenSymbol}</div>
                )}
                <div className="text-sm text-white/90 mt-2">Platform address: <span className="px-3 py-1 rounded bg-white/10">{walletAddress.slice(0,6)}...{walletAddress.slice(-4)}</span> <button className="text-xs underline" onClick={() => { navigator.clipboard.writeText(walletAddress); setTxStatusMessage('Platform address copied'); clearTxMessageLater(); }}>Copy</button></div>
                <div className="mt-3">
                  <Button onClick={scanChainNow} className="h-10">Scan (debug)</Button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            {/* Send Button */}
            <motion.div
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              className="flex-1"
            >
              <Button
                className="w-full h-28 rounded-2xl glass-card shadow-lg flex flex-col items-center justify-center gap-3 border-2 border-white/50 p-0"
                style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
                onClick={() => setShowSendModal(true)}
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Send className="w-7 h-7 text-white" />
                </motion.div>
                <span className="text-sm text-white">Send</span>
              </Button>
            </motion.div>

            {/* Receive Button */}
            <motion.div
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              className="flex-1"
            >
              <Button
                className="w-full h-28 rounded-2xl glass-card shadow-lg flex flex-col items-center justify-center gap-3 border-2 border-white/50 p-0"
                style={{ background: 'linear-gradient(135deg, #35D07F 0%, #5AE49A 100%)' }}
                onClick={() => setShowReceiveModal(true)}
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                >
                  <Download className="w-7 h-7 text-white" />
                </motion.div>
                <span className="text-sm text-white">Receive</span>
              </Button>
            </motion.div>

            {/* Withdraw Button */}
            <motion.div
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              className="flex-1"
            >
              <Button
                className="w-full h-28 rounded-2xl glass-card shadow-lg flex flex-col items-center justify-center gap-3 border-2 border-white/50 p-0"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                onClick={() => setShowWithdrawModal(true)}
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                >
                  <LogOut className="w-7 h-7 text-white" />
                </motion.div>
                <span className="text-sm text-white">Withdraw</span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Transaction History */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-3xl p-6 mb-6 shadow-glow-celo flex-1"
          >
            <h3 className="mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" style={{ color: '#FBCC5C' }} />
              Recent Activity
            </h3>
            
            <div className="space-y-3">
              {transactions.length === 0 && (
                <div className="text-center py-8 opacity-60">
                  <Coins className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No transactions yet</p>
                  <p className="text-xs mt-1">Play games to earn rewards!</p>
                </div>
              )}

              {transactions.map((t) => (
                <motion.div
                  key={t.id}
                  className="flex items-center justify-between p-4 rounded-2xl"
                  style={{ background: t.type === 'receive' ? 'rgba(53, 208, 127, 0.05)' : t.type === 'send' ? 'rgba(245, 87, 108, 0.04)' : 'rgba(100, 116, 255, 0.04)' }}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: t.type === 'receive' ? 'linear-gradient(135deg, #35D07F 0%, #5AE49A 100%)' : t.type === 'send' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    >
                      <Coins className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm">{t.type === 'receive' ? 'Received' : t.type === 'send' ? 'Sent' : 'Withdraw'}</div>
                      <div className="text-xs opacity-60">{new Date(t.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm" style={{ color: t.type === 'receive' ? '#35D07F' : '#f5576c' }}>{t.type === 'receive' ? `+${Number(t.amount).toFixed(3)} cUSD` : `${t.type === 'send' ? '-' : '-'}${Number(t.amount).toFixed(3)} cUSD`}</div>
                    <div className="text-xs opacity-60">{t.txHash ? `tx: ${t.txHash.slice(0, 10)}...` : (t.note || '')}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Info Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-sm text-white/70"
          >
            <p className="mb-2">Powered by Celo Blockchain 🌱</p>
            <div className="flex items-center justify-center gap-2 text-xs">
              <Shield className="w-4 h-4" />
              <span>Secure • Fast • Low Fees</span>
            </div>
          </motion.div>
        </div>

        {/* Send Modal */}
        {showSendModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-96">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Send cUSD</h3>
                <button onClick={() => setShowSendModal(false)} className="text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Recipient Address</label>
                  <input
                    type="text"
                    value={sendAddress}
                    onChange={(e) => setSendAddress(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount (cUSD)</label>
                  <input
                    type="number"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <Button
                  className="w-full h-10 rounded-2xl shadow-glow-celo border-2 border-white/40"
                  style={{
                    background: "linear-gradient(135deg, #35D07F 0%, #5AE49A 100%)",
                    color: "white",
                  }}
                  onClick={handleSend}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Receive Modal */}
        {showReceiveModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-96">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Receive cUSD</h3>
                <button onClick={() => setShowReceiveModal(false)} className="text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Your Address</label>
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    {walletAddress}
                    <button
                      className="ml-2 text-gray-500"
                      onClick={handleCopyAddress}
                    >
                      {copiedAddress ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <QrCode className="w-20 h-20 mx-auto" />
                    <p className="text-sm mt-2">Scan to receive</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount to receive (cUSD)</label>
                    <input
                      type="number"
                      value={receiveAmount}
                      onChange={(e) => setReceiveAmount(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <Button
                      className="mt-3 w-full h-10 rounded-2xl shadow-glow-celo border-2 border-white/40"
                      style={{ background: "linear-gradient(135deg, #35D07F 0%, #5AE49A 100%)", color: "white" }}
                      onClick={() => handleReceive(receiveAmount)}
                    >
                      Receive (from MetaMask)
                    </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-96">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Withdraw cUSD</h3>
                <button onClick={() => setShowWithdrawModal(false)} className="text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount (cUSD)</label>
                  <input
                    type="number"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <Button
                  className="w-full h-10 rounded-2xl shadow-glow-celo border-2 border-white/40"
                  style={{
                    background: "linear-gradient(135deg, #35D07F 0%, #5AE49A 100%)",
                    color: "white",
                  }}
                  onClick={() => handleWithdraw(sendAmount)}
                >
                  Withdraw
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Original connection screen for when wallet is NOT connected
  return (
    <div className="min-h-screen gradient-celo flex flex-col p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute top-20 right-10 w-48 h-48 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)" }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-4 mb-8"
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="p-2 rounded-xl glass-card shadow-glow-celo"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        <div>
          <h2 className="text-2xl text-white">Connect Wallet</h2>
          <p className="text-white/70 text-sm">Start earning rewards</p>
        </div>
      </motion.div>

      {/* Illustration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center mb-8"
      >
        <div className="relative">
          <motion.div
            className="w-32 h-32 rounded-full glass-card shadow-glow-gold flex items-center justify-center"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Wallet className="w-16 h-16" style={{ color: "#35D07F" }} />
          </motion.div>
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Coins className="w-8 h-8" style={{ color: "#FBCC5C" }} />
          </motion.div>
        </div>
      </motion.div>

      {/* Info Section */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-3xl p-6 mb-6 shadow-glow-celo"
      >
        <h3 className="mb-4 text-center">Why Connect Your Wallet?</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl" style={{ background: "rgba(53, 208, 127, 0.1)" }}>
              <Coins className="w-5 h-5" style={{ color: "#35D07F" }} />
            </div>
            <div>
              <div className="mb-1">Earn Real Rewards</div>
              <p className="text-sm opacity-60">Get cUSD tokens for accurate guesses</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl" style={{ background: "rgba(251, 204, 92, 0.1)" }}>
              <Shield className="w-5 h-5" style={{ color: "#FBCC5C" }} />
            </div>
            <div>
              <div className="mb-1">Secure & Private</div>
              <p className="text-sm opacity-60">Your data stays on the blockchain</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl" style={{ background: "rgba(53, 208, 127, 0.1)" }}>
              <Zap className="w-5 h-5" style={{ color: "#35D07F" }} />
            </div>
            <div>
              <div className="mb-1">Instant Payouts</div>
              <p className="text-sm opacity-60">Claim rewards immediately after playing</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Wallet Options */}
      <div className="flex-1 flex flex-col justify-end gap-4">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={() => onConnect("minipay")}
            className="w-full h-16 rounded-2xl shadow-glow-celo border-2 border-white/40"
            style={{
              background: "linear-gradient(135deg, #35D07F 0%, #5AE49A 100%)",
              color: "white",
            }}
          >
            <Smartphone className="w-6 h-6 mr-3" />
            <div className="flex flex-col items-start">
              <span className="text-lg">Connect MiniPay</span>
              <span className="text-xs opacity-80">Recommended for mobile</span>
            </div>
          </Button>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={handleConnectMetaMask}
            className="w-full h-16 rounded-2xl glass-card shadow-glow border-2 border-gray-200 font-bold"
          >
            <Wallet className="w-6 h-6 mr-3" style={{ color: "#F6851B" }} />
            <div className="flex flex-col items-start">
              <span className="text-lg text-gray-900">Connect MetaMask</span>
              <span className="text-xs opacity-60">Popular web3 wallet</span>
            </div>
          </Button>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={() => onConnect("celo")}
            className="w-full h-16 rounded-2xl glass-card shadow-glow border-2 border-gray-200 font-bold"
          >
            <Wallet className="w-6 h-6 mr-3" style={{ color: "#35D07F" }} />
            <div className="flex flex-col items-start">
              <span className="text-lg text-gray-900">Connect Celo Wallet</span>
              <span className="text-xs opacity-60">Valora, etc.</span>
            </div>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-sm text-white/70 mt-2"
        >
          <p>No wallet? No problem!</p>
          <button onClick={onBack} className="underline opacity-80">Play without wallet</button>
        </motion.div>
      </div>
    </div>
  );
}