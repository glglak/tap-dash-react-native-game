import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Dimensions, StatusBar, Vibration, TouchableOpacity } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import { Audio } from 'expo-av';

// Import GameContext
import { GameProvider, useGame } from './src/contexts/GameContext';

// Import game components
import Character from './components/Character';
import Obstacle from './components/Obstacle';
import Background from './components/Background';

// Get screen dimensions for proper positioning
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Game constants
const GRAVITY = 1.0;
const JUMP_FORCE = -16;
const CHARACTER_SIZE = { width: 45, height: 45 }; // Smaller character
const FLOOR_HEIGHT = 50;
const OBSTACLE_WIDTH = 40;
const INITIAL_GAME_SPEED = 5; // Base speed
const MAX_GAME_SPEED = 12;
const SPEED_INCREASE_RATE = 0.1; // How much to increase per score
const MIN_OBSTACLE_SPACING = 250;
const MAX_OBSTACLE_SPACING = 450;
const OBSTACLE_TYPES = ['cactus', 'rock'];

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
let wesopesoSound = null;

// Game System that handles everything
const GameSystem = (entities, { touches, time, dispatch }) => {
  if (!entities.character || !entities.world) return entities;
  
  const character = entities.character;
  const world = entities.world;
  const score = entities.score || 0;
  
  // Get delta time (time since last frame) to ensure consistent speed regardless of frame rate
  const delta = time.delta / 16.67; // normalize to expected 60fps (16.67ms per frame)
  
  // 1. PHYSICS HANDLING
  // Update character Y position based on velocity (adjusted by delta time)
  character.position.y += character.velocity.y * delta;
  
  // Apply gravity to velocity (adjusted by delta time)
  character.velocity.y += GRAVITY * delta;
  
  // Check for floor collision
  const floorY = SCREEN_HEIGHT - FLOOR_HEIGHT - character.size.height / 2;
  if (character.position.y > floorY) {
    character.position.y = floorY;
    character.velocity.y = 0;
    character.isJumping = false;
    character.doubleJumpAvailable = true;
    character.jumping = false;
  } else {
    // Set jumping state for animations
    character.jumping = character.velocity.y < 0 || character.position.y < floorY;
  }
  
  // Check for ceiling collision
  const ceilingY = character.size.height / 2;
  if (character.position.y < ceilingY) {
    character.position.y = ceilingY;
    character.velocity.y = 0;
  }
  
  // 2. JUMP HANDLING
  // Handle touch events for jumping
  let jump = false;
  if (touches.filter(t => t.type === 'press').length > 0) {
    jump = true;
  }
  
  if (jump) {
    if (!character.isJumping) {
      // First jump
      character.isJumping = true;
      character.jumping = true;
      character.velocity.y = JUMP_FORCE;
      
      // Play jump sound
      if (dispatch) {
        dispatch({ type: 'jump' });
      }
    } else if (character.doubleJumpAvailable) {
      // Second jump in air (double jump)
      character.velocity.y = JUMP_FORCE;
      character.doubleJumpAvailable = false;
      
      // Play double jump sound
      if (dispatch) {
        dispatch({ type: 'double-jump' });
      }
    }
  }
  
  // Get current game speed
  // Store game speed in world to ensure consistent speed between frames
  if (world.gameSpeed === undefined) {
    world.gameSpeed = INITIAL_GAME_SPEED;
  }
  
  // Smoothly adjust game speed toward target (prevents sudden speed changes)
  const targetGameSpeed = Math.min(INITIAL_GAME_SPEED + (score * SPEED_INCREASE_RATE), MAX_GAME_SPEED);
  
  // Gradually adjust speed with smoothing (important for consistent feeling)
  world.gameSpeed = world.gameSpeed * 0.95 + targetGameSpeed * 0.05;
  
  // Use the delta time to ensure consistent speed regardless of frame rate
  const moveAmount = world.gameSpeed * delta;
  
  // 3. OBSTACLE HANDLING
  // Get all obstacles
  const obstacles = Object.keys(entities).filter(key => key.includes('obstacle'));
  
  // Move all obstacles
  obstacles.forEach(obstacleKey => {
    const obstacle = entities[obstacleKey];
    if (obstacle) {
      // Move obstacle to the left with delta-time adjusted speed
      obstacle.position.x -= moveAmount;
      
      // If obstacle is off-screen, remove it
      if (obstacle.position.x < -obstacle.size.width) {
        delete entities[obstacleKey];
        return;
      }
      
      // Check for collision with character
      if (!obstacle.hit && 
          character.position.x + character.size.width/3 > obstacle.position.x - obstacle.size.width/2 &&
          character.position.x - character.size.width/3 < obstacle.position.x + obstacle.size.width/2 &&
          character.position.y + character.size.height/3 > obstacle.position.y - obstacle.size.height/2 &&
          character.position.y - character.size.height/3 < obstacle.position.y + obstacle.size.height/2) {
        
        obstacle.hit = true;
        // Game over
        if (dispatch) {
          dispatch({ type: 'game-over' });
        }
      }
      
      // Add score when obstacle passes
      if (!obstacle.passed && obstacle.position.x < character.position.x - character.size.width/2) {
        obstacle.passed = true;
        entities.score = score + 1;
        
        // Dispatch score event
        if (dispatch) {
          dispatch({ type: 'score' });
        }
      }
    }
  });
  
  // Generate new obstacle with proper spacing
  // Find the rightmost obstacle to maintain spacing
  let rightmostX = 0;
  obstacles.forEach(obstacleKey => {
    const obstacle = entities[obstacleKey];
    if (obstacle) {
      rightmostX = Math.max(rightmostX, obstacle.position.x);
    }
  });
  
  // Generate new obstacle with proper spacing
  const nextObstacleSpacing = MIN_OBSTACLE_SPACING + Math.random() * (MAX_OBSTACLE_SPACING - MIN_OBSTACLE_SPACING);
  const minimumSpawnX = obstacles.length === 0 ? 
    world.width + 100 : // Start further from the screen edge
    rightmostX + nextObstacleSpacing;
  
  // Only generate if it's time (based on spacing and speed)
  // Use elapsed time instead of counter to ensure consistent behavior
  if ((world.lastObstacleTime === undefined || 
       time.current - world.lastObstacleTime > 800) && // Longer time between obstacles
      rightmostX < minimumSpawnX - MIN_OBSTACLE_SPACING) {
    
    // Spawn obstacle
    const obstacleId = `obstacle-${Date.now()}`;
    
    // Determine obstacle height - vary based on score but make it easier at the start
    // First few obstacles are much smaller
    let minHeight, maxHeight;
    if (score < 5) {
      minHeight = 20 + Math.floor(Math.random() * 15); // Smaller obstacles (20-35) for beginners
      maxHeight = 45; // Cap at 45 for beginners
    } else {
      minHeight = 25 + Math.floor(Math.random() * 20); // Regular min height (25-45)
      maxHeight = Math.min(75, 40 + Math.floor(score/5) * 5); // Gradual increase, cap at 75
    }
    
    const obstacleHeight = minHeight + Math.floor(Math.random() * (maxHeight - minHeight));
    
    // Choose obstacle type - more variety
    const obstacleType = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    
    // Position it on the ground
    const obstacleY = SCREEN_HEIGHT - FLOOR_HEIGHT - obstacleHeight/2;
    
    // Randomize obstacle width slightly for more variety
    const obstacleWidth = OBSTACLE_WIDTH + Math.floor(Math.random() * 10) - 5; // 35-45 width
    
    // Add new obstacle
    entities[obstacleId] = {
      position: { 
        x: minimumSpawnX,
        y: obstacleY
      },
      size: { width: obstacleWidth, height: obstacleHeight },
      type: obstacleType,
      hit: false,
      passed: false,
      renderer: Obstacle
    };
    
    // Update last entity spawn time
    world.lastObstacleTime = time.current;
  }
  
  // 4. BACKGROUND CHANGES
  // Only update if we're at a multiple of 10
  const backgroundThemeIndex = Math.floor(score / 10) % BACKGROUND_THEMES.length;
  if (entities.floor && entities.floor.themeIndex !== backgroundThemeIndex) {
    // More restrictive condition removed so theme changes will happen
    entities.floor.themeIndex = backgroundThemeIndex;
    entities.floor.theme = BACKGROUND_THEMES[backgroundThemeIndex];
    
    // Dispatch theme change event
    if (dispatch && score > 0 && score % 10 === 0) {
      dispatch({ type: 'theme-change' });
    }
  }
  
  // 5. DIFFICULTY SYSTEM
  // Update difficulty level
  if (entities.world) {
    entities.world.difficultyLevel = Math.floor(score / 10) + 1;
  }
  
  return entities;
};

// Load sounds - simplified error handling
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
    
    // Load the wesopeso sound for 30, 40, 50 points
    try {
      const { sound: wesopeso } = await Audio.Sound.createAsync(
        require('./assets/sounds/wesopeso.mp3')
      );
      wesopesoSound = wesopeso;
    } catch (error) {
      console.log("Error loading wesopeso sound, will fallback to milestone sound:", error);
    }
  } catch (error) {
    console.log("Error loading sounds:", error);
  }
};

// Helper to play sound with minimal error handling
const playSound = async (sound) => {
  if (sound) {
    try {
      await sound.replayAsync();
    } catch (error) {}
  }
};

function GameApp() {
  // Game state
  const [running, setRunning] = useState(false);
  const [gameEngine, setGameEngine] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const [entities, setEntities] = useState(null);
  const entitiesInitialized = useRef(false);
  
  // Use GameContext
  const { 
    highScore, 
    updateGameStats, 
    coins,
    shareScore
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
      if (wesopesoSound) wesopesoSound.unloadAsync();
    };
  }, []);

  // Update game stats when score changes
  useEffect(() => {
    if (score > 0) {
      updateGameStats(score);
    }
  }, [score]);
  
  // Initialize entities once
  useEffect(() => {
    if (!entitiesInitialized.current) {
      setEntities(setupEntities());
      entitiesInitialized.current = true;
    }
  }, []);
  
  // Setup game entities
  const setupEntities = () => {
    const characterX = SCREEN_WIDTH * 0.2;
    const characterY = SCREEN_HEIGHT - FLOOR_HEIGHT - CHARACTER_SIZE.height/2;
    
    return {
      world: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        lastObstacleTime: undefined,
        difficultyLevel: 1,
        gameSpeed: INITIAL_GAME_SPEED  // Initialize game speed here
      },
      character: {
        position: { x: characterX, y: characterY },
        velocity: { x: 0, y: 0 },
        size: CHARACTER_SIZE,
        isJumping: false,
        doubleJumpAvailable: true,
        jumping: false,
        renderer: Character
      },
      floor: {
        position: { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT - FLOOR_HEIGHT / 2 },
        size: { width: SCREEN_WIDTH, height: FLOOR_HEIGHT },
        themeIndex: 0,
        theme: BACKGROUND_THEMES[0],
        renderer: Background
      },
      score: 0
    };
  };
  
  // Reset game state for new game
  const resetGame = () => {
    setScore(0);
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
      setRunning(false);
      setGameOver(true);
      
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
      
      // Check if we hit exactly a multiple of 10 - play milestone music
      if (newScore > 0 && newScore % 10 === 0) {
        // Play different sounds based on the score milestone:
        // - For scores 30, 40, 50, etc. play wesopeso
        // - For scores 10, 20, etc. play milestone5
        
        if (newScore >= 30 && newScore % 10 === 0) {
          // Play wesopeso sound at 30, 40, 50, etc. (if available)
          if (wesopesoSound) {
            playSound(wesopesoSound);
          } else {
            // Fallback to milestone sound if wesopeso isn't available
            playSound(milestone10Sound);
          }
        } else {
          // Play regular milestone sound at 10, 20
          playSound(milestone10Sound);
        }
        
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
    } else if (e.type === 'theme-change') {
      // Special effect for theme change
      Vibration.vibrate(100);
    }
  };
  
  // Handle share button press - explicitly pass the current score 
  const handleShare = () => {
    shareScore(score);
    Vibration.vibrate(50);
  };
  
  // Show loading screen if sounds aren't loaded or entities aren't initialized
  if (!soundsLoaded || !entities) {
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
          systems={[GameSystem]} 
          entities={entities}
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
              <Text style={styles.instructionText}>• Game gets faster as you score!</Text>
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
            {score >= highScore && score > 0 && (
              <Text style={styles.newHighScoreText}>New High Score!</Text>
            )}
            <Text style={styles.highScoreText}>High Score: {highScore}</Text>
            
            {/* Share Button */}
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Text style={styles.shareButtonText}>📱 Share Score</Text>
            </TouchableOpacity>
            
            <Text style={styles.restartText}>Tap to Restart</Text>
          </View>
        )}
        
        {running && (
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreDisplay}>Score: {score}</Text>
            <Text style={styles.coinDisplay}>Coins: {coins}</Text>
            <Text style={styles.levelDisplay}>Level: {Math.floor(score / 10) + 1}</Text>
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
  shareButton: {
    backgroundColor: '#4267B2', // Facebook blue
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
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
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 100,
  }
});