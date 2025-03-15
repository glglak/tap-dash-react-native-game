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

// Game constants
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const SUPER_JUMP_FORCE = -20; // Force for long press jump
const CHARACTER_SIZE = { width: 50, height: 50 };
const FLOOR_HEIGHT = 50;
const OBSTACLE_WIDTH = 30;
const INITIAL_GAME_SPEED = 5;
const MAX_GAME_SPEED = 10;
const SPEED_INCREASE_RATE = 0.1; // How much to increase speed per point

// Sound objects
let jumpSound = null;
let scoreSound = null;
let gameOverSound = null;
let backgroundMusic = null;
let milestone5Sound = null;

// Define game systems
// Physics System: Handles character movement, gravity, and jumping
const Physics = (entities, { touches, time }) => {
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
    
    // Set jumping state for animations
    character.jumping = character.velocity.y < 0 || character.position.y < floorY;
    
    return entities;
};

// Obstacle Generator: Creates and moves obstacles
const ObstacleGenerator = (entities, { time }) => {
    const world = entities.world;
    const character = entities.character;
    const obstacles = Object.keys(entities).filter(key => key.includes('obstacle'));
    
    // Game speed increases with score
    const gameSpeed = Math.min(INITIAL_GAME_SPEED + (entities.score || 0) * SPEED_INCREASE_RATE, MAX_GAME_SPEED);
    
    // Move existing obstacles
    obstacles.forEach(obstacleKey => {
        const obstacle = entities[obstacleKey];
        
        // Move obstacle to the left
        obstacle.position.x -= gameSpeed;
        
        // If obstacle is off-screen, remove it
        if (obstacle.position.x < -OBSTACLE_WIDTH) {
            delete entities[obstacleKey];
            
            // Add score when obstacle passes successfully
            if (!obstacle.passed && !obstacle.hit) {
                obstacle.passed = true;
                entities.score = (entities.score || 0) + 1;
                
                // Dispatch score event
                if (entities.dispatch) {
                    entities.dispatch({ type: 'score' });
                }
            }
        }
        
        // Check for collision with character
        if (!obstacle.hit && checkCollision(character, obstacle)) {
            obstacle.hit = true;
            
            // Dispatch game over event
            if (entities.dispatch) {
                entities.dispatch({ type: 'game-over' });
            }
        }
    });
    
    // Generate new obstacle based on time and randomness
    if (world.lastObstacleTime === undefined || 
        time.current - world.lastObstacleTime > (1500 + Math.random() * 1000) / gameSpeed) {
        
        // Create obstacle ID
        const newObstacleId = `obstacle-${Date.now()}`;
        
        // Add new obstacle
        entities[newObstacleId] = {
            position: { 
                x: world.width + OBSTACLE_WIDTH,
                y: SCREEN_HEIGHT - FLOOR_HEIGHT - 25 // 25 is half obstacle height
            },
            size: { width: OBSTACLE_WIDTH, height: 50 },
            hit: false,
            passed: false,
            renderer: Obstacle
        };
        
        // Update last obstacle time
        world.lastObstacleTime = time.current;
    }
    
    return entities;
};

// Difficulty System: Adjusts game difficulty based on score
const DifficultySystem = (entities, { time }) => {
    // This could include:
    // - Adjusting obstacle generation frequency
    // - Adding different types of obstacles
    // - Changing game speed beyond the basic formula
    
    return entities;
};

// Helper function to check collisions
const checkCollision = (character, obstacle) => {
    if (!character || !obstacle) return false;
    
    const characterLeft = character.position.x - character.size.width / 2;
    const characterRight = character.position.x + character.size.width / 2;
    const characterTop = character.position.y - character.size.height / 2;
    const characterBottom = character.position.y + character.size.height / 2;
    
    const obstacleLeft = obstacle.position.x - obstacle.size.width / 2;
    const obstacleRight = obstacle.position.x + obstacle.size.width / 2;
    const obstacleTop = obstacle.position.y - obstacle.size.height / 2;
    const obstacleBottom = obstacle.position.y + obstacle.size.height / 2;
    
    // Allow some collision forgiveness (70% of the full box) for better game feel
    const forgiveX = character.size.width * 0.15;
    const forgiveY = character.size.height * 0.15;
    
    return (
        characterRight - forgiveX > obstacleLeft &&
        characterLeft + forgiveX < obstacleRight &&
        characterBottom - forgiveY > obstacleTop &&
        characterTop + forgiveY < obstacleBottom
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
    
    // Load the special milestone sound for every 5 points
    const { sound: milestone } = await Audio.Sound.createAsync(
      require('./assets/sounds/milestone5.mp3')
    );
    milestone5Sound = milestone;
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
      if (milestone5Sound) milestone5Sound.unloadAsync();
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
        lastObstacleTime: undefined
      },
      character: {
        position: { x: SCREEN_WIDTH * 0.2, y: SCREEN_HEIGHT - FLOOR_HEIGHT - 25 },
        velocity: { x: 0, y: 0 },
        size: { width: 50, height: 50 },
        isJumping: false,
        doubleJumpAvailable: true,
        jumping: false,
        renderer: Character
      },
      floor: {
        position: { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT - FLOOR_HEIGHT / 2 },
        size: { width: SCREEN_WIDTH, height: FLOOR_HEIGHT },
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
  
  // Handle tap for jump
  const handleTap = () => {
    if (gameOver) {
      resetGame();
      return;
    }
    
    if (!running) {
      resetGame();
      return;
    }
    
    // If game is running, make the character jump
    if (gameEngine && gameEngine.entities && gameEngine.entities.character) {
      const character = gameEngine.entities.character;
      
      // Handle jumping logic
      if (!character.isJumping) {
        // First jump
        character.isJumping = true;
        character.velocity.y = JUMP_FORCE;
        playSound(jumpSound);
      } else if (character.doubleJumpAvailable) {
        // Double jump
        character.velocity.y = JUMP_FORCE * 1.2;
        character.doubleJumpAvailable = false;
        
        // Extra haptic feedback for double jump
        Vibration.vibrate(50);
        playSound(jumpSound);
      }
    }
  };
  
  // Handle game events
  const onEvent = (e) => {
    if (!e) return;
    
    if (e.type === 'game-over') {
      console.log("Game over event");
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
      
      // Check if we hit a multiple of 5 - play special milestone sound
      if (newScore % 5 === 0) {
        // Play special milestone sound
        playSound(milestone5Sound);
        
        // Add additional feedback for milestone
        Vibration.vibrate([0, 70, 50, 70]);
      }
      
      // Update the score in game entities
      if (gameEngine && gameEngine.entities) {
        gameEngine.entities.score = newScore;
      }
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
          systems={[Physics, ObstacleGenerator, DifficultySystem]}
          entities={setupEntities()}
          running={running}
          onEvent={onEvent}
        />
        
        {!running && !gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.titleText}>Tap Dash</Text>
            <Text style={styles.startText}>Tap to Start</Text>
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionText}>• Tap to jump</Text>
              <Text style={styles.instructionText}>• Hold for higher jump</Text>
              <Text style={styles.instructionText}>• Double tap for double jump</Text>
              <Text style={styles.instructionText}>• Every 5 points gives special bonus!</Text>
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
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 100,
  }
});