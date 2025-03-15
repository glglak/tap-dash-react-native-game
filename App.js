import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Dimensions, StatusBar, Vibration } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import { Audio } from 'expo-av';

// Import GameContext
import { GameProvider, useGame } from './src/contexts/GameContext';

// Import game components
import Character from './components/Character';
import Obstacle from './components/Obstacle';
import Background from './components/Background';
import Coin from './components/Coin';
import PowerUp from './components/PowerUp';

// Get screen dimensions for proper positioning
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Game constants
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const CHARACTER_SIZE = { width: 50, height: 50 };
const FLOOR_HEIGHT = 50;
const OBSTACLE_WIDTH = 30;
const INITIAL_GAME_SPEED = 5;
const MAX_GAME_SPEED = 15; // Increased max speed
const SPEED_INCREASE_RATE = 0.2; // Increased speed increase rate
const MIN_OBSTACLE_SPACING = 300;
const OBSTACLE_SPACING_VARIATION = 150;
const COIN_SIZE = 30;
const COIN_VALUE = 5;
const POWERUP_SIZE = 40;
const POWERUP_DURATION = 5000; // 5 seconds of invincibility

// Entity types
const ENTITY_TYPES = {
  OBSTACLE: 'obstacle',
  COIN: 'coin',
  POWERUP: 'powerup'
};

// Obstacle types
const OBSTACLE_TYPES = {
  GROUND: 'ground',
  AIR: 'air'
};

// Background color themes
const BACKGROUND_THEMES = [
  { sky: '#87CEEB', ground: '#8B4513' }, // Default - Sky blue with brown ground
  { sky: '#FF7F50', ground: '#654321' }, // Sunset theme
  { sky: '#4B0082', ground: '#2F4F4F' }, // Night theme
  { sky: '#7CFC00', ground: '#006400' }, // Alien planet theme
  { sky: '#FFD700', ground: '#CD853F' }, // Desert theme
];

// Sound objects
let jumpSound = null;
let scoreSound = null;
let gameOverSound = null;
let backgroundMusic = null;
let milestone10Sound = null;
let coinSound = null;
let powerupSound = null;

// Define game systems
// Physics System: Handles character movement, gravity, and jumping
const Physics = (entities, { touches, time }) => {
  if (!entities.character) return entities;
  
  const character = entities.character;
  
  // Update character Y position based on velocity
  character.position.y += character.velocity.y;
  
  // Apply gravity to velocity
  character.velocity.y += GRAVITY;
  
  // Check for floor collision
  const floorY = SCREEN_HEIGHT - FLOOR_HEIGHT - character.size.height / 2;
  if (character.position.y > floorY) {
    character.position.y = floorY;
    character.velocity.y = 0;
    character.isJumping = false;
    character.doubleJumpAvailable = true;
  }
  
  // Check for ceiling collision
  const ceilingY = character.size.height / 2;
  if (character.position.y < ceilingY) {
    character.position.y = ceilingY;
    character.velocity.y = 0;
  }
  
  // Set jumping state for animations
  character.jumping = character.velocity.y < 0 || character.position.y < floorY;
  
  // Handle touch events for jumping
  let jump = false;
  if (touches.filter(t => t.type === 'press').length > 0) {
    jump = true;
  }
  
  if (jump) {
    if (!character.isJumping) {
      // First jump
      character.isJumping = true;
      character.velocity.y = JUMP_FORCE;
      
      // Play jump sound
      if (entities.dispatch) {
        entities.dispatch({ type: 'jump' });
      }
    } else if (character.doubleJumpAvailable) {
      // Second jump in air (double jump)
      character.velocity.y = JUMP_FORCE;
      character.doubleJumpAvailable = false;
      
      // Play double jump sound
      if (entities.dispatch) {
        entities.dispatch({ type: 'double-jump' });
      }
    }
  }
  
  // Handle invincibility timer
  if (character.isInvincible) {
    if (time.current - character.invincibilityStartTime > POWERUP_DURATION) {
      character.isInvincible = false;
      if (entities.dispatch) {
        entities.dispatch({ type: 'invincibility-end' });
      }
    }
  }
  
  return entities;
};

// Obstacle Generator: Creates and moves obstacles, coins and power-ups
const EntityGenerator = (entities, { time }) => {
  if (!entities.world || !entities.character) return entities;
  
  const world = entities.world;
  const character = entities.character;
  const score = entities.score || 0;
  
  // Game speed increases with score - faster obstacles
  const gameSpeed = Math.min(INITIAL_GAME_SPEED + (score * SPEED_INCREASE_RATE), MAX_GAME_SPEED);
  
  // Get all moving entities (obstacles, coins, power-ups)
  const obstacles = Object.keys(entities).filter(key => key.includes(ENTITY_TYPES.OBSTACLE));
  const coins = Object.keys(entities).filter(key => key.includes(ENTITY_TYPES.COIN));
  const powerups = Object.keys(entities).filter(key => key.includes(ENTITY_TYPES.POWERUP));
  const allEntities = [...obstacles, ...coins, ...powerups];
  
  // Move all entities
  allEntities.forEach(entityKey => {
    const entity = entities[entityKey];
    if (entity) {
      // Move entity to the left
      entity.position.x -= gameSpeed;
      
      // If entity is off-screen, remove it
      if (entity.position.x < -entity.size.width) {
        delete entities[entityKey];
        return;
      }
      
      // Check for collision with character
      if (checkCollision(character, entity)) {
        // Handle different entity types
        if (entityKey.includes(ENTITY_TYPES.OBSTACLE)) {
          if (!entity.hit && !character.isInvincible) {
            entity.hit = true;
            // Game over only if not invincible
            if (entities.dispatch) {
              entities.dispatch({ type: 'game-over' });
            }
          }
        } else if (entityKey.includes(ENTITY_TYPES.COIN)) {
          if (!entity.collected) {
            entity.collected = true;
            delete entities[entityKey];
            
            // Add coin value to score
            entities.score = score + COIN_VALUE;
            entities.coinsCollected = (entities.coinsCollected || 0) + 1;
            
            // Dispatch coin collection event
            if (entities.dispatch) {
              entities.dispatch({ type: 'coin-collected' });
            }
          }
        } else if (entityKey.includes(ENTITY_TYPES.POWERUP)) {
          if (!entity.collected) {
            entity.collected = true;
            delete entities[entityKey];
            
            // Activate invincibility
            character.isInvincible = true;
            character.invincibilityStartTime = time.current;
            
            // Dispatch power-up collection event
            if (entities.dispatch) {
              entities.dispatch({ type: 'powerup-collected' });
            }
          }
        }
      }
      
      // Add score when obstacle passes
      if (entityKey.includes(ENTITY_TYPES.OBSTACLE) && !entity.passed && entity.position.x < character.position.x - character.size.width/2) {
        entity.passed = true;
        entities.score = score + 1;
        
        // Dispatch score event
        if (entities.dispatch) {
          entities.dispatch({ type: 'score' });
        }
      }
    }
  });
  
  // Find the rightmost entity to maintain spacing
  let rightmostX = 0;
  allEntities.forEach(entityKey => {
    const entity = entities[entityKey];
    if (entity) {
      rightmostX = Math.max(rightmostX, entity.position.x);
    }
  });
  
  // Generate new entity with proper spacing
  const minimumSpawnX = allEntities.length === 0 ? 
    world.width + 100 : 
    rightmostX + MIN_OBSTACLE_SPACING + Math.random() * OBSTACLE_SPACING_VARIATION;
  
  // Only generate if it's time (based on spacing and speed)
  if (rightmostX < minimumSpawnX - MIN_OBSTACLE_SPACING) {
    // Decide what to spawn: obstacle (70%), coin (25%), or power-up (5%)
    const spawnRoll = Math.random();
    
    if (spawnRoll < 0.70) {
      // Spawn obstacle
      const obstacleId = `${ENTITY_TYPES.OBSTACLE}-${Date.now()}`;
      
      // Determine obstacle type: ground or air
      const obstacleType = Math.random() < 0.3 ? OBSTACLE_TYPES.AIR : OBSTACLE_TYPES.GROUND;
      
      // Determine obstacle height and position
      let obstacleHeight, obstacleY;
      
      if (obstacleType === OBSTACLE_TYPES.GROUND) {
        obstacleHeight = 50;
        obstacleY = SCREEN_HEIGHT - FLOOR_HEIGHT - obstacleHeight/2;
      } else {
        obstacleHeight = 40;
        obstacleY = character.size.height + obstacleHeight/2 + 20;
      }
      
      // Add new obstacle
      entities[obstacleId] = {
        position: { 
          x: minimumSpawnX,
          y: obstacleY
        },
        size: { width: OBSTACLE_WIDTH, height: obstacleHeight },
        type: obstacleType,
        hit: false,
        passed: false,
        renderer: Obstacle
      };
    } else if (spawnRoll < 0.95) {
      // Spawn coin
      const coinId = `${ENTITY_TYPES.COIN}-${Date.now()}`;
      
      // Determine coin position (mid-air)
      const coinY = SCREEN_HEIGHT - FLOOR_HEIGHT - 100 - Math.random() * 100;
      
      // Add new coin
      entities[coinId] = {
        position: {
          x: minimumSpawnX,
          y: coinY
        },
        size: { width: COIN_SIZE, height: COIN_SIZE },
        collected: false,
        renderer: Coin
      };
    } else {
      // Spawn power-up (invincibility)
      const powerupId = `${ENTITY_TYPES.POWERUP}-${Date.now()}`;
      
      // Determine power-up position (mid-air)
      const powerupY = SCREEN_HEIGHT - FLOOR_HEIGHT - 150;
      
      // Add new power-up
      entities[powerupId] = {
        position: {
          x: minimumSpawnX,
          y: powerupY
        },
        size: { width: POWERUP_SIZE, height: POWERUP_SIZE },
        collected: false,
        type: 'invincibility',
        renderer: PowerUp
      };
    }
    
    // Update last entity spawn time
    world.lastEntitySpawnTime = time.current;
  }
  
  return entities;
};

// Background System: Changes background based on score
const BackgroundSystem = (entities, { time }) => {
  if (!entities.floor) return entities;
  
  const currentScore = entities.score || 0;
  const backgroundThemeIndex = Math.floor(currentScore / 10) % BACKGROUND_THEMES.length;
  
  // Only update if theme has changed and we're at a multiple of 10
  if (entities.floor.themeIndex !== backgroundThemeIndex && currentScore > 0 && currentScore % 10 === 0) {
    entities.floor.themeIndex = backgroundThemeIndex;
    entities.floor.theme = BACKGROUND_THEMES[backgroundThemeIndex];
    
    // Dispatch theme change event
    if (entities.dispatch) {
      entities.dispatch({ type: 'theme-change' });
    }
  }
  
  return entities;
};

// Difficulty System: Adjusts game difficulty based on score
const DifficultySystem = (entities, { time }) => {
  if (!entities.world) return entities;
  
  const currentScore = entities.score || 0;
  
  // Update difficulty level (used by other systems)
  entities.world.difficultyLevel = Math.floor(currentScore / 10) + 1;
  
  return entities;
};

// Helper function to check collisions
const checkCollision = (character, entity) => {
  if (!character || !entity) return false;
  
  const characterLeft = character.position.x - character.size.width / 2;
  const characterRight = character.position.x + character.size.width / 2;
  const characterTop = character.position.y - character.size.height / 2;
  const characterBottom = character.position.y + character.size.height / 2;
  
  const entityLeft = entity.position.x - entity.size.width / 2;
  const entityRight = entity.position.x + entity.size.width / 2;
  const entityTop = entity.position.y - entity.size.height / 2;
  const entityBottom = entity.position.y + entity.size.height / 2;
  
  // Allow some collision forgiveness (70% of the full box) for better game feel
  const forgiveX = character.size.width * 0.15;
  const forgiveY = character.size.height * 0.15;
  
  return (
    characterRight - forgiveX > entityLeft &&
    characterLeft + forgiveX < entityRight &&
    characterBottom - forgiveY > entityTop &&
    characterTop + forgiveY < entityBottom
  );
};

// Load sounds
const loadSounds = async () => {
  try {
    // Load background music
    const { sound: music } = await Audio.Sound.createAsync(
      require('./assets/sounds/background.mp3'),
      { isLooping: true, volume: 0.5 }
    );
    backgroundMusic = music;

    // Load sound effects
    const { sound: jump } = await Audio.Sound.createAsync(
      require('./assets/sounds/jump.mp3')
    );
    jumpSound = jump;

    const { sound: score } = await Audio.Sound.createAsync(
      require('./assets/sounds/score.mp3')
    );
    scoreSound = score;

    const { sound: gameOver } = await Audio.Sound.createAsync(
      require('./assets/sounds/game-over.mp3')
    );
    gameOverSound = gameOver;
    
    // Load the special milestone sound for every 10 points
    const { sound: milestone } = await Audio.Sound.createAsync(
      require('./assets/sounds/milestone5.mp3')
    );
    milestone10Sound = milestone;
    
    // Try to load coin and powerup sounds (use existing sounds if files don't exist)
    try {
      const { sound: coin } = await Audio.Sound.createAsync(
        require('./assets/sounds/coin.mp3')
      );
      coinSound = coin;
    } catch (e) {
      // Fallback to score sound
      coinSound = scoreSound;
    }
    
    try {
      const { sound: powerup } = await Audio.Sound.createAsync(
        require('./assets/sounds/powerup.mp3')
      );
      powerupSound = powerup;
    } catch (e) {
      // Fallback to milestone sound
      powerupSound = milestone10Sound;
    }
  } catch (error) {
    console.log("Error loading sounds:", error);
  }
};

// Helper to play sound with error handling
const playSound = async (sound) => {
  try {
    if (sound) {
      await sound.replayAsync();
    }
  } catch (error) {
    console.log("Error playing sound:", error);
  }
};

function GameApp() {
  // Game state
  const [running, setRunning] = useState(false);
  const [gameEngine, setGameEngine] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [isInvincible, setIsInvincible] = useState(false);
  
  // Use GameContext
  const { 
    highScore, 
    updateGameStats, 
    shareScore,
    coins,
    achievements
  } = useGame();
  
  // Load sounds on component mount
  useEffect(() => {
    async function initSounds() {
      await loadSounds();
      setSoundsLoaded(true);
    }
    initSounds();
    
    // Cleanup sounds on unmount
    return () => {
      if (backgroundMusic) backgroundMusic.unloadAsync();
      if (jumpSound) jumpSound.unloadAsync();
      if (scoreSound) scoreSound.unloadAsync();
      if (gameOverSound) gameOverSound.unloadAsync();
      if (milestone10Sound) milestone10Sound.unloadAsync();
      if (coinSound) coinSound.unloadAsync();
      if (powerupSound) powerupSound.unloadAsync();
    };
  }, []);

  // Update game stats when score changes
  useEffect(() => {
    if (score > 0) {
      updateGameStats(score);
    }
  }, [score]);
  
  // Setup game entities
  const setupEntities = () => {
    return {
      world: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        lastEntitySpawnTime: undefined,
        difficultyLevel: 1
      },
      character: {
        position: { x: SCREEN_WIDTH * 0.2, y: SCREEN_HEIGHT - FLOOR_HEIGHT - 25 },
        velocity: { x: 0, y: 0 },
        size: { width: 50, height: 50 },
        isJumping: false,
        doubleJumpAvailable: true,
        jumping: false,
        isInvincible: false,
        invincibilityStartTime: 0,
        renderer: Character
      },
      floor: {
        position: { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT - FLOOR_HEIGHT / 2 },
        size: { width: SCREEN_WIDTH, height: FLOOR_HEIGHT },
        themeIndex: 0,
        theme: BACKGROUND_THEMES[0],
        renderer: Background
      },
      score: 0,
      coinsCollected: 0,
      dispatch: (action) => {
        if (gameEngine) {
          gameEngine.dispatch(action);
        }
      }
    };
  };
  
  // Reset game state for new game
  const resetGame = () => {
    setScore(0);
    setCoinsCollected(0);
    setIsInvincible(false);
    setGameOver(false);
    
    if (gameEngine) {
      gameEngine.swap(setupEntities());
    }
    
    // Start the game
    setRunning(true);
    
    // Play background music
    if (backgroundMusic) {
      backgroundMusic.setPositionAsync(0);
      backgroundMusic.playAsync();
    }
  };
  
  // Handle tap for jump (only used for starting game or restarting after game over)
  const handleTap = () => {
    if (gameOver) {
      resetGame();
      return;
    }
    
    if (!running) {
      resetGame();
      return;
    }
  };
  
  // Handle game events
  const onEvent = (e) => {
    if (!e) return;
    
    if (e.type === 'game-over') {
      console.log("Game over event");
      setRunning(false);
      setGameOver(true);
      setIsInvincible(false);
      
      // Play game over sound
      playSound(gameOverSound);
      
      // Stop background music on game over
      if (backgroundMusic) {
        backgroundMusic.stopAsync();
      }
    } else if (e.type === 'score') {
      const newScore = score + 1;
      setScore(newScore);
      
      // Play normal score sound
      playSound(scoreSound);
      
      // Check if we hit exactly a multiple of 10 - play special milestone sound
      if (newScore > 0 && newScore % 10 === 0) {
        // Play special milestone sound
        playSound(milestone10Sound);
        
        // Add additional feedback for milestone
        Vibration.vibrate([0, 100, 50, 100, 50, 100]);
      }
      
      // Update the score in game entities
      if (gameEngine && gameEngine.entities) {
        gameEngine.entities.score = newScore;
      }
    } else if (e.type === 'jump' || e.type === 'double-jump') {
      // Play jump sound
      playSound(jumpSound);
    } else if (e.type === 'coin-collected') {
      // Play coin sound
      playSound(coinSound);
      
      // Update coins collected
      const newCoinsCollected = coinsCollected + 1;
      setCoinsCollected(newCoinsCollected);
      
      // Update score
      const newScore = score + COIN_VALUE;
      setScore(newScore);
      
      // Update game entities
      if (gameEngine && gameEngine.entities) {
        gameEngine.entities.score = newScore;
        gameEngine.entities.coinsCollected = newCoinsCollected;
      }
    } else if (e.type === 'powerup-collected') {
      // Play powerup sound
      playSound(powerupSound);
      
      // Activate invincibility
      setIsInvincible(true);
      
      // Add feedback for powerup
      Vibration.vibrate([0, 100, 50, 100]);
    } else if (e.type === 'invincibility-end') {
      // End invincibility
      setIsInvincible(false);
      
      // Feedback for end of invincibility
      Vibration.vibrate(50);
    }
  };
  
  // Show loading screen if sounds aren't loaded
  if (!soundsLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }
  
  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <GameEngine
          ref={(ref) => { setGameEngine(ref) }}
          style={styles.gameContainer}
          systems={[Physics, EntityGenerator, BackgroundSystem, DifficultySystem]}
          entities={setupEntities()}
          running={running}
          onEvent={onEvent}
        />
        
        {!running && !gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.titleText}>Tap Dash</Text>
            <Text style={styles.startText}>Tap to Start</Text>
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionText}>• Tap to jump over obstacles</Text>
              <Text style={styles.instructionText}>• Double tap for a second jump in the air</Text>
              <Text style={styles.instructionText}>• Collect coins for bonus points</Text>
              <Text style={styles.instructionText}>• Get the star power-up for invincibility</Text>
              <Text style={styles.instructionText}>• Every 10 points changes the background!</Text>
            </View>
            {highScore > 0 && (
              <Text style={styles.highScoreText}>High Score: {highScore}</Text>
            )}
          </View>
        )}
        
        {gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.gameOverText}>Game Over</Text>
            <Text style={styles.scoreText}>Score: {score}</Text>
            <Text style={styles.coinsText}>Coins Collected: {coinsCollected}</Text>
            {score >= highScore && score > 0 && (
              <Text style={styles.newHighScoreText}>New High Score!</Text>
            )}
            <Text style={styles.highScoreText}>High Score: {highScore}</Text>
            <Text style={styles.restartText}>Tap to Restart</Text>
          </View>
        )}
        
        {running && (
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreDisplay}>Score: {score}</Text>
            <Text style={styles.coinDisplay}>Coins: {coins + coinsCollected}</Text>
            <Text style={styles.levelDisplay}>Level: {Math.floor(score / 10) + 1}</Text>
            {isInvincible && <Text style={styles.invincibleText}>INVINCIBLE!</Text>}
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

// Main app component wrapped with GameProvider
export default function App() {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gameContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  titleText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  startText: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 30,
  },
  instructionsContainer: {
    marginBottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 10,
  },
  instructionText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  gameOverText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF0000',
    marginBottom: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  scoreText: {
    fontSize: 32,
    color: '#fff',
    marginBottom: 10,
  },
  coinsText: {
    fontSize: 28,
    color: 'gold',
    marginBottom: 20,
  },
  newHighScoreText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  highScoreText: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 30,
  },
  restartText: {
    fontSize: 20,
    color: '#fff',
  },
  scoreContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
  },
  scoreDisplay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  coinDisplay: {
    fontSize: 18,
    color: 'gold',
    marginTop: 5
  },
  levelDisplay: {
    fontSize: 18,
    color: '#00FFFF',
    marginTop: 5
  },
  invincibleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF00FF',
    marginTop: 5
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 100,
  }
});