// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title WorldSnapGame
 * @dev Play-to-Earn GeoGuessr-style location guessing game on Celo blockchain
 * @notice This contract manages game rewards, player stats, achievements, and prediction pools
 */

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract WorldSnapGame {
    // ============ State Variables ============
    
    address public owner;
    IERC20 public cUSDToken; // Celo Dollar token
    
    uint256 public constant MAX_SCORE = 10000;
    uint256 public constant MAX_REWARD_PER_GAME = 0.5 ether; // 0.5 cUSD
    uint256 public constant PREDICTION_POOL_FEE = 0.1 ether; // 0.1 cUSD entry fee
    uint256 public constant DAILY_STREAK_BONUS = 0.05 ether; // 0.05 cUSD bonus
    
    uint256 public totalGamesPlayed;
    uint256 public totalRewardsDistributed;
    uint256 public activePredictionPools;
    
    // ============ Structs ============
    
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
    
    struct GameResult {
        address player;
        uint256 score;
        uint256 reward;
        uint256 timestamp;
        uint256 roundNumber;
    }
    
    struct Achievement {
        string name;
        string description;
        uint256 rewardAmount;
        bool exists;
    }
    
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
    
    // ============ Mappings ============
    
    mapping(address => Player) public players;
    mapping(uint256 => GameResult) public gameResults;
    mapping(uint256 => Achievement) public achievements;
    mapping(uint256 => PredictionPool) public predictionPools;
    
    address[] public leaderboard;
    
    // ============ Events ============
    
    event PlayerRegistered(address indexed player, uint256 timestamp);
    event GamePlayed(address indexed player, uint256 score, uint256 reward, uint256 timestamp);
    event RewardClaimed(address indexed player, uint256 amount, uint256 timestamp);
    event AchievementUnlocked(address indexed player, uint256 achievementId, uint256 reward);
    event DailyStreakMaintained(address indexed player, uint256 streakCount, uint256 bonus);
    event PredictionPoolCreated(uint256 indexed poolId, string locationName, uint256 deadline);
    event PredictionPoolJoined(uint256 indexed poolId, address indexed player, uint256 prediction);
    event PredictionPoolFinalized(uint256 indexed poolId, address[] winners, uint256 totalPayout);
    event LevelUp(address indexed player, uint256 newLevel);
    
    // ============ Modifiers ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier playerRegistered() {
        require(players[msg.sender].isRegistered, "Player not registered");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _cUSDTokenAddress) {
        owner = msg.sender;
        cUSDToken = IERC20(_cUSDTokenAddress);
        
        // Initialize default achievements
        _createAchievement(1, "First Game", "Play your first game", 0.01 ether);
        _createAchievement(2, "Perfect Score", "Get a perfect 10,000 score", 0.1 ether);
        _createAchievement(3, "10 Games", "Play 10 games", 0.05 ether);
        _createAchievement(4, "50 Games", "Play 50 games", 0.2 ether);
        _createAchievement(5, "100 Games", "Play 100 games", 0.5 ether);
        _createAchievement(6, "7 Day Streak", "Play 7 days in a row", 0.15 ether);
        _createAchievement(7, "30 Day Streak", "Play 30 days in a row", 0.5 ether);
        _createAchievement(8, "High Roller", "Score over 9000 five times", 0.25 ether);
    }
    
    // ============ Player Functions ============
    
    /**
     * @dev Register a new player
     */
    function registerPlayer() external {
        require(!players[msg.sender].isRegistered, "Player already registered");
        
        Player storage player = players[msg.sender];
        player.isRegistered = true;
        player.level = 1;
        
        leaderboard.push(msg.sender);
        
        emit PlayerRegistered(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Submit a game score and receive rewards
     * @param score The score achieved (0-10000)
     */
    function submitGameScore(uint256 score) external playerRegistered {
        require(score <= MAX_SCORE, "Invalid score");
        
        Player storage player = players[msg.sender];
        
        // Calculate reward based on score
        uint256 reward = (score * MAX_REWARD_PER_GAME) / MAX_SCORE;
        
        // Check for daily streak
        uint256 currentDay = block.timestamp / 1 days;
        if (player.lastPlayedDay == currentDay - 1) {
            player.currentStreak++;
            
            // Daily streak bonus
            if (player.currentStreak >= 7) {
                reward += DAILY_STREAK_BONUS;
                emit DailyStreakMaintained(msg.sender, player.currentStreak, DAILY_STREAK_BONUS);
            }
        } else if (player.lastPlayedDay != currentDay) {
            player.currentStreak = 1;
        }
        
        player.lastPlayedDay = currentDay;
        
        // Update player stats
        player.totalScore += score;
        player.gamesPlayed++;
        player.totalEarned += reward;
        
        // Add XP and check for level up
        uint256 xpGained = score / 100; // 1 XP per 100 score points
        player.xp += xpGained;
        _checkLevelUp(msg.sender);
        
        // Record game result
        gameResults[totalGamesPlayed] = GameResult({
            player: msg.sender,
            score: score,
            reward: reward,
            timestamp: block.timestamp,
            roundNumber: totalGamesPlayed
        });
        
        totalGamesPlayed++;
        totalRewardsDistributed += reward;
        
        // Check and unlock achievements
        _checkAchievements(msg.sender, score);
        
        // Transfer reward
        require(cUSDToken.transfer(msg.sender, reward), "Reward transfer failed");
        
        emit GamePlayed(msg.sender, score, reward, block.timestamp);
    }
    
    /**
     * @dev Get player statistics
     * @param playerAddress Address of the player
     */
    function getPlayerStats(address playerAddress) external view returns (
        uint256 totalScore,
        uint256 gamesPlayed,
        uint256 totalEarned,
        uint256 currentStreak,
        uint256 level,
        uint256 xp
    ) {
        Player storage player = players[playerAddress];
        return (
            player.totalScore,
            player.gamesPlayed,
            player.totalEarned,
            player.currentStreak,
            player.level,
            player.xp
        );
    }
    
    // ============ Achievement Functions ============
    
    /**
     * @dev Check and unlock achievements for a player
     * @param playerAddress Address of the player
     * @param latestScore Latest score achieved
     */
    function _checkAchievements(address playerAddress, uint256 latestScore) internal {
        Player storage player = players[playerAddress];
        
        // First Game
        if (player.gamesPlayed == 1 && !player.achievementsUnlocked[1]) {
            _unlockAchievement(playerAddress, 1);
        }
        
        // Perfect Score
        if (latestScore == MAX_SCORE && !player.achievementsUnlocked[2]) {
            _unlockAchievement(playerAddress, 2);
        }
        
        // 10 Games
        if (player.gamesPlayed == 10 && !player.achievementsUnlocked[3]) {
            _unlockAchievement(playerAddress, 3);
        }
        
        // 50 Games
        if (player.gamesPlayed == 50 && !player.achievementsUnlocked[4]) {
            _unlockAchievement(playerAddress, 4);
        }
        
        // 100 Games
        if (player.gamesPlayed == 100 && !player.achievementsUnlocked[5]) {
            _unlockAchievement(playerAddress, 5);
        }
        
        // 7 Day Streak
        if (player.currentStreak == 7 && !player.achievementsUnlocked[6]) {
            _unlockAchievement(playerAddress, 6);
        }
        
        // 30 Day Streak
        if (player.currentStreak == 30 && !player.achievementsUnlocked[7]) {
            _unlockAchievement(playerAddress, 7);
        }
    }
    
    /**
     * @dev Unlock an achievement for a player
     * @param playerAddress Address of the player
     * @param achievementId ID of the achievement
     */
    function _unlockAchievement(address playerAddress, uint256 achievementId) internal {
        Player storage player = players[playerAddress];
        Achievement storage achievement = achievements[achievementId];
        
        require(achievement.exists, "Achievement does not exist");
        require(!player.achievementsUnlocked[achievementId], "Achievement already unlocked");
        
        player.achievementsUnlocked[achievementId] = true;
        player.totalEarned += achievement.rewardAmount;
        
        // Transfer achievement reward
        if (achievement.rewardAmount > 0) {
            require(cUSDToken.transfer(playerAddress, achievement.rewardAmount), "Achievement reward transfer failed");
        }
        
        emit AchievementUnlocked(playerAddress, achievementId, achievement.rewardAmount);
    }
    
    /**
     * @dev Create a new achievement (owner only)
     */
    function _createAchievement(
        uint256 id,
        string memory name,
        string memory description,
        uint256 rewardAmount
    ) internal {
        achievements[id] = Achievement({
            name: name,
            description: description,
            rewardAmount: rewardAmount,
            exists: true
        });
    }
    
    // ============ Level System ============
    
    /**
     * @dev Check if player should level up
     * @param playerAddress Address of the player
     */
    function _checkLevelUp(address playerAddress) internal {
        Player storage player = players[playerAddress];
        uint256 requiredXP = player.level * 100; // 100 XP per level
        
        while (player.xp >= requiredXP) {
            player.level++;
            player.xp -= requiredXP;
            requiredXP = player.level * 100;
            
            emit LevelUp(playerAddress, player.level);
        }
    }
    
    // ============ Prediction Pool Functions ============
    
    /**
     * @dev Create a new prediction pool
     * @param poolId Unique pool ID
     * @param locationName Name of the location
     * @param deadline Timestamp when pool closes
     */
    function createPredictionPool(
        uint256 poolId,
        string memory locationName,
        uint256 deadline
    ) external onlyOwner {
        require(!predictionPools[poolId].isActive, "Pool already exists");
        require(deadline > block.timestamp, "Deadline must be in the future");
        
        PredictionPool storage pool = predictionPools[poolId];
        pool.locationName = locationName;
        pool.entryFee = PREDICTION_POOL_FEE;
        pool.deadline = deadline;
        pool.isActive = true;
        
        activePredictionPools++;
        
        emit PredictionPoolCreated(poolId, locationName, deadline);
    }
    
    /**
     * @dev Join a prediction pool and submit prediction
     * @param poolId ID of the pool
     * @param prediction Player's prediction (latitude/longitude encoded)
     */
    function joinPredictionPool(uint256 poolId, uint256 prediction) external playerRegistered {
        PredictionPool storage pool = predictionPools[poolId];
        
        require(pool.isActive, "Pool is not active");
        require(block.timestamp < pool.deadline, "Pool has closed");
        require(!pool.hasParticipated[msg.sender], "Already participated");
        
        // Transfer entry fee
        require(
            cUSDToken.transferFrom(msg.sender, address(this), pool.entryFee),
            "Entry fee transfer failed"
        );
        
        pool.participants.push(msg.sender);
        pool.predictions[msg.sender] = prediction;
        pool.hasParticipated[msg.sender] = true;
        pool.totalPool += pool.entryFee;
        
        emit PredictionPoolJoined(poolId, msg.sender, prediction);
    }
    
    /**
     * @dev Finalize prediction pool and distribute rewards (owner only)
     * @param poolId ID of the pool
     * @param correctAnswer The correct answer
     */
    function finalizePredictionPool(uint256 poolId, uint256 correctAnswer) external onlyOwner {
        PredictionPool storage pool = predictionPools[poolId];
        
        require(pool.isActive, "Pool is not active");
        require(block.timestamp >= pool.deadline, "Pool has not closed yet");
        require(!pool.isFinalized, "Pool already finalized");
        
        pool.correctAnswer = correctAnswer;
        pool.isFinalized = true;
        pool.isActive = false;
        activePredictionPools--;
        
        // Calculate winners (simplified - in production, use distance calculation)
        address[] memory winners = new address[](pool.participants.length);
        uint256 winnerCount = 0;
        
        // Find closest predictions (simplified logic)
        for (uint256 i = 0; i < pool.participants.length; i++) {
            address participant = pool.participants[i];
            uint256 prediction = pool.predictions[participant];
            
            // Simplified win condition (within 10% of correct answer)
            if (prediction >= (correctAnswer * 90) / 100 && prediction <= (correctAnswer * 110) / 100) {
                winners[winnerCount] = participant;
                winnerCount++;
            }
        }
        
        // Distribute rewards to winners
        if (winnerCount > 0) {
            uint256 rewardPerWinner = pool.totalPool / winnerCount;
            
            for (uint256 i = 0; i < winnerCount; i++) {
                address winner = winners[i];
                players[winner].totalEarned += rewardPerWinner;
                require(cUSDToken.transfer(winner, rewardPerWinner), "Winner payout failed");
            }
            
            emit PredictionPoolFinalized(poolId, winners, pool.totalPool);
        }
    }
    
    // ============ Leaderboard Functions ============
    
    /**
     * @dev Get top players by total score
     * @param count Number of top players to return
     */
    function getTopPlayers(uint256 count) external view returns (address[] memory, uint256[] memory) {
        uint256 length = count > leaderboard.length ? leaderboard.length : count;
        address[] memory topAddresses = new address[](length);
        uint256[] memory topScores = new uint256[](length);
        
        // Simple bubble sort for top players (in production, use off-chain indexing)
        address[] memory sortedLeaderboard = new address[](leaderboard.length);
        for (uint256 i = 0; i < leaderboard.length; i++) {
            sortedLeaderboard[i] = leaderboard[i];
        }
        
        for (uint256 i = 0; i < sortedLeaderboard.length && i < length; i++) {
            for (uint256 j = i + 1; j < sortedLeaderboard.length; j++) {
                if (players[sortedLeaderboard[j]].totalScore > players[sortedLeaderboard[i]].totalScore) {
                    address temp = sortedLeaderboard[i];
                    sortedLeaderboard[i] = sortedLeaderboard[j];
                    sortedLeaderboard[j] = temp;
                }
            }
            topAddresses[i] = sortedLeaderboard[i];
            topScores[i] = players[sortedLeaderboard[i]].totalScore;
        }
        
        return (topAddresses, topScores);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Withdraw contract balance (owner only)
     */
    function withdrawFunds(uint256 amount) external onlyOwner {
        require(cUSDToken.balanceOf(address(this)) >= amount, "Insufficient balance");
        require(cUSDToken.transfer(owner, amount), "Withdrawal failed");
    }
    
    /**
     * @dev Fund the contract with cUSD (anyone can fund)
     */
    function fundContract(uint256 amount) external {
        require(
            cUSDToken.transferFrom(msg.sender, address(this), amount),
            "Funding failed"
        );
    }
    
    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return cUSDToken.balanceOf(address(this));
    }
    
    /**
     * @dev Transfer ownership (owner only)
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
