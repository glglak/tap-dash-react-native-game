import React, { useState, useEffect, useRef } from 'react';
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

// Existing game system functions remain the same 
// (Physics, ObstacleGenerator, DifficultySystem, checkCollision)

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
  
  // Existing game functions remain the same
  // (setupEntities, resetGame, handleTap, onEvent)

  // Modify onEvent to use context high score
  const onEvent = (e) => {
    if (!e) return;
    
    if (e.type === 'game-over') {
      console.log("Game over event");
      setRunning(false);
      setGameOver(true);
      
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
  
  // Rest of the component remains similar to original
  
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

export default function App() {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  );
}

// Styles remain the same, with slight additions
const styles = StyleSheet.create({
  // ... existing styles
  coinDisplay: {
    fontSize: 18,
    color: 'gold',
    marginTop: 5
  }
});