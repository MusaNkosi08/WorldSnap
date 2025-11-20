# WorldSnap Game Smart Contract 🌍

A comprehensive Play-to-Earn smart contract for the WorldSnap location guessing game on the Celo blockchain.

## Features

### 🎮 Core Game Mechanics
- **Score-based Rewards**: Earn cUSD based on game score (0-10,000 points)
- **Maximum Reward**: Up to 0.5 cUSD per game for perfect scores
- **Player Registration**: Register once, play forever
- **Game History**: Complete on-chain record of all games played

### 🏆 Achievement System
Built-in achievements with automatic rewards:
- **First Game**: 0.01 cUSD
- **Perfect Score**: 0.1 cUSD
- **10 Games**: 0.05 cUSD
- **50 Games**: 0.2 cUSD
- **100 Games**: 0.5 cUSD
- **7 Day Streak**: 0.15 cUSD
- **30 Day Streak**: 0.5 cUSD
- **High Roller**: 0.25 cUSD (score over 9000 five times)

### 🔥 Daily Streak System
- Track consecutive days of gameplay
- Earn bonus rewards for maintaining streaks
- 7+ day streaks earn 0.05 cUSD bonus per game

### 📊 Level & XP System
- Earn XP based on game scores (1 XP per 100 points)
- Level up with XP progression
- 100 XP per level required

### 🎯 Prediction Pools
- Create location prediction competitions
- Entry fee: 0.1 cUSD per pool
- Winners split the entire pool
- Time-limited challenges

### 🏅 Leaderboard
- Global ranking by total score
- On-chain leaderboard queries
- Transparent and tamper-proof

## Contract Architecture

```
WorldSnapGame.sol
├── Player Management
│   ├── registerPlayer()
│   ├── submitGameScore()
│   └── getPlayerStats()
├── Achievement System
│   ├── _checkAchievements()
│   └── _unlockAchievement()
├── Level System
│   └── _checkLevelUp()
├── Prediction Pools
│   ├── createPredictionPool()
│   ├── joinPredictionPool()
│   └── finalizePredictionPool()
├── Leaderboard
│   └── getTopPlayers()
└── Admin Functions
    ├── withdrawFunds()
    ├── fundContract()
    └── transferOwnership()
```

## Smart Contract Data Structures

### Player Struct
```solidity
struct Player {
    uint256 totalScore;
    uint256 gamesPlayed;
    uint256 totalEarned;
    uint256 currentStreak;
    uint256 lastPlayedDay;
    uint256 level;
    uint256 xp;
    bool isRegistered;
    mapping(uint256 => bool) achievementsUnlocked;
}
```

### GameResult Struct
```solidity
struct GameResult {
    address player;
    uint256 score;
    uint256 reward;
    uint256 timestamp;
    uint256 roundNumber;
}
```

### PredictionPool Struct
```solidity
struct PredictionPool {
    string locationName;
    uint256 totalPool;
    uint256 entryFee;
    uint256 deadline;
    address[] participants;
    mapping(address => uint256) predictions;
    mapping(address => bool) hasParticipated;
    uint256 correctAnswer;
    bool isActive;
    bool isFinalized;
}
```

## Deployment

### Prerequisites
```bash
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers
```

### Hardhat Configuration
Create `hardhat.config.js`:

```javascript
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.19",
  networks: {
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 44787
    },
    celo: {
      url: "https://forno.celo.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 42220
    }
  }
};
```

### Deploy to Alfajores Testnet
```bash
npx hardhat run contracts/deploy.js --network alfajores
```

### Deploy to Celo Mainnet
```bash
npx hardhat run contracts/deploy.js --network celo
```

### Verify Contract
```bash
npx hardhat verify --network alfajores <CONTRACT_ADDRESS> <cUSD_ADDRESS>
```

## Token Addresses

### Celo Mainnet
- **cUSD**: `0x765DE816845861e75A25fCA122bb6898B8B1282a`

### Alfajores Testnet
- **cUSD**: `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`

## Usage Examples

### Register Player
```javascript
const tx = await worldSnapGame.registerPlayer();
await tx.wait();
```

### Submit Game Score
```javascript
const score = 8500; // Score out of 10,000
const tx = await worldSnapGame.submitGameScore(score);
await tx.wait();
```

### Get Player Stats
```javascript
const stats = await worldSnapGame.getPlayerStats(playerAddress);
console.log({
  totalScore: stats.totalScore.toString(),
  gamesPlayed: stats.gamesPlayed.toString(),
  totalEarned: ethers.utils.formatEther(stats.totalEarned),
  currentStreak: stats.currentStreak.toString(),
  level: stats.level.toString(),
  xp: stats.xp.toString()
});
```

### Create Prediction Pool
```javascript
const poolId = 1;
const locationName = "Eiffel Tower, Paris";
const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now

const tx = await worldSnapGame.createPredictionPool(
  poolId,
  locationName,
  deadline
);
await tx.wait();
```

### Join Prediction Pool
```javascript
// First approve cUSD spending
const cUSDToken = new ethers.Contract(cUSDAddress, cUSDTokenABI, signer);
await cUSDToken.approve(contractAddress, ethers.utils.parseEther("0.1"));

// Join pool with prediction
const prediction = 48858370; // Encoded lat/long
const tx = await worldSnapGame.joinPredictionPool(poolId, prediction);
await tx.wait();
```

### Get Leaderboard
```javascript
const [addresses, scores] = await worldSnapGame.getTopPlayers(10);
console.log("Top 10 Players:");
addresses.forEach((addr, i) => {
  console.log(`${i + 1}. ${addr}: ${scores[i]} points`);
});
```

### Fund Contract
```javascript
const amount = ethers.utils.parseEther("100"); // 100 cUSD
await cUSDToken.approve(contractAddress, amount);
await worldSnapGame.fundContract(amount);
```

## Events

The contract emits the following events for frontend integration:

- `PlayerRegistered(address player, uint256 timestamp)`
- `GamePlayed(address player, uint256 score, uint256 reward, uint256 timestamp)`
- `RewardClaimed(address player, uint256 amount, uint256 timestamp)`
- `AchievementUnlocked(address player, uint256 achievementId, uint256 reward)`
- `DailyStreakMaintained(address player, uint256 streakCount, uint256 bonus)`
- `PredictionPoolCreated(uint256 poolId, string locationName, uint256 deadline)`
- `PredictionPoolJoined(uint256 poolId, address player, uint256 prediction)`
- `PredictionPoolFinalized(uint256 poolId, address[] winners, uint256 totalPayout)`
- `LevelUp(address player, uint256 newLevel)`

## Security Features

✅ **Owner-Only Functions**: Critical functions restricted to contract owner
✅ **Reentrancy Protection**: Safe token transfers
✅ **Input Validation**: All inputs validated before processing
✅ **Score Limits**: Maximum score capped at 10,000
✅ **Time-Based Logic**: Daily streaks use block timestamps
✅ **Pool Management**: Prediction pools have clear lifecycle states

## Gas Optimization

- Events used for off-chain indexing instead of storing all data
- Mappings used for O(1) lookups
- Array operations minimized
- Simple sorting for small datasets

## Future Enhancements

- [ ] Add distance-based prediction pool scoring
- [ ] Implement NFT badges for achievements
- [ ] Add tournament modes with larger prize pools
- [ ] Multi-token support (CELO, cEUR, etc.)
- [ ] Oracle integration for verified location data
- [ ] Governance token for community voting
- [ ] Seasonal leaderboards with resets

## Testing

Create comprehensive tests in `test/WorldSnapGame.test.js`:

```bash
npx hardhat test
```

## License

MIT License - See LICENSE file for details

## Support

For questions or issues:
- GitHub Issues: [Create Issue]
- Discord: [Join Community]
- Documentation: [Read Docs]

## Acknowledgments

Built for the Celo Hackathon Challenge
- Powered by Celo blockchain
- cUSD stablecoin integration
- MiniPay wallet support
