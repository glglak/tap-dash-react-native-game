import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Dimensions, StatusBar, Vibration } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import { Audio } from 'expo-av';

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

// Physics system
const Physics = (entities, { touches, dispatch, time }) => {
  if (!entities || !entities.character || !entities.character.position) {
    console.log("Missing entities in Physics system");
    return entities || {};
  }

  const character = entities.character;
  const gameSpeed = entities.gameSpeed || INITIAL_GAME_SPEED;
  
  // Handle touch (jump)
  if (touches && Array.isArray(touches)) {
    // Process touch
    touches.filter(t => t.type === 'start').forEach(() => {
      if (character.position.y >= SCREEN_HEIGHT - FLOOR_HEIGHT - CHARACTER_SIZE.height / 2) {
        // Register press start time for long press detection
        character.pressStartTime = Date.now();
      }
    });

    // Process release - determine jump force based on press duration
    touches.filter(t => t.type === 'end').forEach(() => {
      if (character.position.y >= SCREEN_HEIGHT - FLOOR_HEIGHT - CHARACTER_SIZE.height / 2) {
        const pressDuration = Date.now() - (character.pressStartTime || Date.now());
        
        // Long press for higher jump
        if (pressDuration > 250) {
          character.velocity.y = SUPER_JUMP_FORCE;
          character.jumping = true;
          character.superJump = true;
          // Provide haptic feedback for super jump
          Vibration.vibrate(50);
        } else {
          character.velocity.y = JUMP_FORCE;
          character.jumping = true;
          character.superJump = false;
        }
        
        // Play jump sound
        playSound(jumpSound);
      }
    });

    // Double tap detection
    if (character.doubleTapTimer && character.jumping && !character.doubleJumped) {
      touches.filter(t => t.type === 'press').forEach(() => {
        // Allow double jump if already jumping
        character.velocity.y = JUMP_FORCE * 0.8; // Slightly less powerful second jump
        character.doubleJumped = true;
        Vibration.vibrate(30);
        playSound(jumpSound);
      });
    }
  }
  
  // Apply gravity to character
  character.velocity.y += GRAVITY;
  
  // Update character position
  character.position.y += character.velocity.y;
  
  // Keep character above the floor
  if (character.position.y > SCREEN_HEIGHT - FLOOR_HEIGHT - CHARACTER_SIZE.height / 2) {
    character.position.y = SCREEN_HEIGHT - FLOOR_HEIGHT - CHARACTER_SIZE.height / 2;
    character.velocity.y = 0;
    character.jumping = false;
    character.doubleJumped = false; // Reset double jump when landing
    character.doubleTapTimer = null;
  }
  
  // If character just started jumping, start double tap timer
  if (character.jumping && !character.doubleTapTimer) {
    character.doubleTapTimer = setTimeout(() => {
      character.doubleTapTimer = null;
    }, 300); // Window for double jump
  }
  
  // Move obstacles
  if (entities) {
    Object.keys(entities).forEach(key => {
      if (key.includes('obstacle') && entities[key] && entities[key].position) {
        entities[key].position.x -= gameSpeed;
        
        // Check if obstacle has gone off screen
        if (entities[key].position.x < -OBSTACLE_WIDTH) {
          delete entities[key];
          if (dispatch) {
            dispatch({ type: 'score' });
            playSound(scoreSound);
          }
        }
        
        // Check for collision with character
        if (checkCollision(character, entities[key])) {
          if (dispatch) {
            dispatch({ type: 'game-over' });
            playSound(gameOverSound);
            Vibration.vibrate(300);
          }
        }
      }
    });
  }
  
  return entities;
};

// Obstacle generator system - simplified for reliability
const ObstacleGenerator = (entities, { time }) => {
  if (!entities) {
    return entities || {};
  }
  
  // Create a counter if it doesn't exist
  if (!entities.obstacleTimer) {
    entities.obstacleTimer = 0;
  }
  
  // Increment timer
  entities.obstacleTimer += 1;
  
  // Get current score to adjust difficulty
  const score = entities.score || 0;
  const gameSpeed = entities.gameSpeed || INITIAL_GAME_SPEED;
  
  // Generate new obstacle with timing based on score/speed
  // Higher scores = more frequent obstacles
  const spawnInterval = Math.max(80, 120 - score * 2);
  
  if (entities.obstacleTimer >= spawnInterval) {
    // Randomize obstacle type based on score (more variety at higher scores)
    const obstacleTypes = ['small', 'medium', 'large'];
    const typeIndex = Math.min(Math.floor(Math.random() * (2 + Math.floor(score / 5))), 2);
    const type = obstacleTypes[typeIndex];
    
    // Determine height based on type
    let obstacleHeight;
    switch (type) {
      case 'small':
        obstacleHeight = 40;
        break;
      case 'medium':
        obstacleHeight = 70;
        break;
      case 'large':
        obstacleHeight = 90;
        break;
      default:
        obstacleHeight = 40;
    }
    
    const newObstacleId = `obstacle-${Math.floor(Math.random() * 1000000)}`;
    
    // Create the obstacle entity
    entities[newObstacleId] = {
      position: { 
        x: SCREEN_WIDTH + OBSTACLE_WIDTH,
        y: SCREEN_HEIGHT - FLOOR_HEIGHT - obstacleHeight / 2 
      },
      size: { width: OBSTACLE_WIDTH, height: obstacleHeight },
      type,
      renderer: Obstacle
    };
    
    // Reset timer with some randomness to make pattern less predictable
    entities.obstacleTimer = Math.floor(Math.random() * 10);
  }
  
  return entities;
};

// Difficulty system - increases game speed as score increases
const DifficultySystem = (entities) => {
  if (!entities) return entities;
  
  const score = entities.score || 0;
  
  // Calculate game speed based on score
  const gameSpeed = Math.min(
    INITIAL_GAME_SPEED + (score * SPEED_INCREASE_RATE),
    MAX_GAME_SPEED
  );
  
  // Update game speed entity
  entities.gameSpeed = gameSpeed;
  
  return entities;
};

// Collision detection helper
const checkCollision = (character, obstacle) => {
  if (!obstacle || !obstacle.position || !obstacle.size || 
      !character || !character.position || !character.size) {
    return false;
  }
  
  const characterX = character.position.x - character.size.width / 2;
  const characterY = character.position.y - character.size.height / 2;
  const obstacleX = obstacle.position.x - obstacle.size.width / 2;
  const obstacleY = obstacle.position.y - obstacle.size.height / 2;
  
  return (
    characterX < obstacleX + obstacle.size.width &&
    characterX + character.size.width > obstacleX &&
    characterY < obstacleY + obstacle.size.height &&
    characterY + character.size.height > obstacleY
  );
};

export default function App() {
  // Game state
  const [running, setRunning] = useState(false);
  const [gameEngine, setGameEngine] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const [highScore, setHighScore] = useState(0);
  
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
    };
  }, []);
  
  // Function to create entities
  const setupEntities = () => {
    return {
      physics: { engine: Physics },
      obstacleGenerator: { engine: ObstacleGenerator },
      difficultySystem: { engine: DifficultySystem },
      obstacleTimer: 0,
      score: 0,
      gameSpeed: INITIAL_GAME_SPEED,
      character: {
        position: { x: SCREEN_WIDTH / 4, y: SCREEN_HEIGHT - FLOOR_HEIGHT - CHARACTER_SIZE.height / 2 },
        size: CHARACTER_SIZE,
        velocity: { y: 0 },
        jumping: false,
        doubleJumped: false,
        superJump: false,
        renderer: Character
      },
      background: {
        position: { x: 0, y: 0 },
        size: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
        renderer: Background
      },
      floor: {
        position: { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT - FLOOR_HEIGHT / 2 },
        size: { width: SCREEN_WIDTH, height: FLOOR_HEIGHT },
        renderer: (props) => {
          if (!props || !props.position || !props.size) {
            return null;
          }
          const { position, size } = props;
          return (
            <View style={{
              position: 'absolute',
              left: position.x - size.width / 2,
              top: position.y - size.height / 2,
              width: size.width,
              height: size.height,
              backgroundColor: '#3a9b3e'
            }} />
          );
        }
      }
    };
  };
  
  // Reset game state
  const resetGame = () => {
    console.log("Resetting game");
    setScore(0);
    setGameOver(false);
    setRunning(true);
    
    // Play background music when game starts
    if (backgroundMusic) {
      backgroundMusic.playAsync();
    }
    
    if (gameEngine) {
      try {
        gameEngine.swap(setupEntities());
      } catch (error) {
        console.log("Error resetting game:", error);
      }
    }
  };
  
  // Handle screen tap for character jump
  const handleTap = () => {
    if (gameOver) {
      resetGame();
    } else if (!running) {
      console.log("Starting game");
      setRunning(true);
      
      // Play background music when game starts
      if (backgroundMusic) {
        backgroundMusic.playAsync();
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
      
      // Update high score if needed
      if (score > highScore) {
        setHighScore(score);
      }
      
      // Stop background music on game over
      if (backgroundMusic) {
        backgroundMusic.stopAsync();
      }
    } else if (e.type === 'score') {
      const newScore = score + 1;
      setScore(newScore);
      
      // Update the score in game entities
      if (gameEngine && gameEngine.entities) {
        gameEngine.entities.score = newScore;
      }
    }
  };
  
  // Start/stop game based on running state
  useEffect(() => {
    if (gameEngine) {
      try {
        if (!running) {
          console.log("Stopping game engine");
          gameEngine.stop();
          
          // Pause background music when game stops
          if (backgroundMusic) {
            backgroundMusic.pauseAsync();
          }
        } else {
          console.log("Starting game engine");
          gameEngine.start();
        }
      } catch (error) {
        console.log("Error controlling game engine:", error);
      }
    }
  }, [running, gameEngine]);
  
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
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB'
  },
  gameContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  titleText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3
  },
  startText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2
  },
  instructionsContainer: {
    marginTop: 30,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 10
  },
  instructionText: {
    fontSize: 18,
    color: '#fff',
    marginVertical: 5,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1
  },
  gameOverText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ff0000',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2
  },
  scoreText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2
  },
  highScoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFEB3B',
    marginTop: 10,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2
  },
  newHighScoreText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFEB3B',
    marginTop: 10,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2
  },
  restartText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 30,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2
  },
  scoreContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20
  },
  scoreDisplay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 100,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1
  }
});