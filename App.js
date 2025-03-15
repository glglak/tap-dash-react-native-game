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

// Get screen dimensions for proper positioning
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Game constants - ADJUSTED FOR BETTER PLAYABILITY
const GRAVITY = 1.0; // Reduced gravity
const JUMP_FORCE = -16; // Less strong jump
const CHARACTER_SIZE = { width: 60, height: 60 }; // Larger character for visibility
const FLOOR_HEIGHT = 50;
const OBSTACLE_WIDTH = 40; // Wider obstacles for visibility
const INITIAL_GAME_SPEED = 7; // Reduced initial speed
const MAX_GAME_SPEED = 15; // Reduced max speed
const SPEED_INCREASE_RATE = 0.2; // Slower speed increase
const MIN_OBSTACLE_SPACING = 250; // More spacing between obstacles
const OBSTACLE_SPACING_VARIATION = 100; // Less variation for more frequent obstacles

// Background color themes - simplified for performance
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

// Define game systems - OPTIMIZED FOR PERFORMANCE
// GameSystem: Combined system that handles everything for better performance
const GameSystem = (entities, { touches, time }) => {
  if (!entities.character || !entities.world) return entities;
  
  const character = entities.character;
  const world = entities.world;
  const score = entities.score || 0;
  
  // 1. PHYSICS HANDLING
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
  
  // 3. OBSTACLE HANDLING
  // Game speed increases with score - faster obstacles
  const gameSpeed = Math.min(INITIAL_GAME_SPEED + (score * SPEED_INCREASE_RATE), MAX_GAME_SPEED);
  
  // Get all obstacles
  const obstacles = Object.keys(entities).filter(key => key.includes('obstacle'));
  
  // Move all obstacles
  obstacles.forEach(obstacleKey => {
    const obstacle = entities[obstacleKey];
    if (obstacle) {
      // Move obstacle to the left
      obstacle.position.x -= gameSpeed;
      
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
        if (entities.dispatch) {
          entities.dispatch({ type: 'game-over' });
        }
      }
      
      // Add score when obstacle passes
      if (!obstacle.passed && obstacle.position.x < character.position.x - character.size.width/2) {
        obstacle.passed = true;
        entities.score = score + 1;
        
        // Dispatch score event
        if (entities.dispatch) {
          entities.dispatch({ type: 'score' });
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
  const minimumSpawnX = obstacles.length === 0 ? 
    world.width + 100 : // Start further from the screen edge
    rightmostX + MIN_OBSTACLE_SPACING + Math.random() * OBSTACLE_SPACING_VARIATION;
  
  // Only generate if it's time (based on spacing and speed)
  if ((world.lastObstacleTime === undefined || 
       time.current - world.lastObstacleTime > 800) && // Longer time between obstacles
      rightmostX < minimumSpawnX - MIN_OBSTACLE_SPACING) {
    
    // Spawn obstacle
    const obstacleId = `obstacle-${Date.now()}`;
    
    // Determine obstacle height - vary based on score
    // Higher score = potentially taller obstacles, but never too tall to jump over
    const minHeight = 30; // Shortest obstacle
    const maxHeight = Math.min(70, 30 + Math.floor(score/5) * 5); // Increase height every 5 points, cap at 70
    const obstacleHeight = minHeight + Math.floor(Math.random() * (maxHeight - minHeight) / 5) * 5;
    
    // Position it on the ground only
    const obstacleY = SCREEN_HEIGHT - FLOOR_HEIGHT - obstacleHeight/2;
    
    // Add new obstacle
    entities[obstacleId] = {
      position: { 
        x: minimumSpawnX,
        y: obstacleY
      },
      size: { width: OBSTACLE_WIDTH, height: obstacleHeight },
      type: 'ground', // Only ground obstacles
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
  if (entities.floor && entities.floor.themeIndex !== backgroundThemeIndex && score > 0 && score % 10 === 0) {
    entities.floor.themeIndex = backgroundThemeIndex;
    entities.floor.theme = BACKGROUND_THEMES[backgroundThemeIndex];
    
    // Dispatch theme change event
    if (entities.dispatch) {
      entities.dispatch({ type: 'theme-change' });
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
  
  // Use GameContext
  const { 
    highScore, 
    updateGameStats, 
    coins,
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
        lastObstacleTime: undefined,
        difficultyLevel: 1
      },
      character: {
        position: { x: SCREEN_WIDTH * 0.2, y: SCREEN_HEIGHT - FLOOR_HEIGHT - CHARACTER_SIZE.height/2 },
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
      score: 0,
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
          systems={[GameSystem]} // Single combined system for better performance
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