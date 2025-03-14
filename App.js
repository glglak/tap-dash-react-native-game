import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Dimensions, StatusBar } from 'react-native';
import { GameEngine } from 'react-native-game-engine';

// Import game components
import Character from './components/Character';
import Obstacle from './components/Obstacle';
import Background from './components/Background';

// Get screen dimensions for proper positioning
const { width, height } = Dimensions.get('window');

// Game constants
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const CHARACTER_SIZE = { width: 50, height: 50 };
const FLOOR_HEIGHT = 50;
const OBSTACLE_WIDTH = 30;
const GAME_SPEED = 5;

// Physics system
const Physics = (entities, { touches, dispatch, time }) => {
  const character = entities.character;
  
  // Handle jump
  touches.filter(t => t.type === 'press').forEach(() => {
    if (character.position.y >= height - FLOOR_HEIGHT - CHARACTER_SIZE.height) {
      character.velocity.y = JUMP_FORCE;
      character.jumping = true;
    }
  });
  
  // Apply gravity to character
  character.velocity.y += GRAVITY;
  
  // Update character position
  character.position.y += character.velocity.y;
  
  // Keep character above the floor
  if (character.position.y > height - FLOOR_HEIGHT - CHARACTER_SIZE.height / 2) {
    character.position.y = height - FLOOR_HEIGHT - CHARACTER_SIZE.height / 2;
    character.velocity.y = 0;
    character.jumping = false;
  }
  
  // Move obstacles
  Object.keys(entities).forEach(key => {
    if (key.includes('obstacle')) {
      entities[key].position.x -= GAME_SPEED;
      
      // Check if obstacle has gone off screen
      if (entities[key].position.x < -OBSTACLE_WIDTH) {
        delete entities[key];
        dispatch({ type: 'score' });
      }
      
      // Check for collision with character
      if (checkCollision(character, entities[key])) {
        dispatch({ type: 'game-over' });
      }
    }
  });
  
  return entities;
};

// Obstacle generator system
const ObstacleGenerator = (entities, { time, dispatch }) => {
  // Generate new obstacle every ~2 seconds
  if (time.current % 120 === 0) {
    const height = Math.random() > 0.7 ? 90 : 40; // Two types of obstacles
    const type = height === 90 ? 'large' : 'small';
    
    const newObstacleId = \`obstacle-\${Math.floor(Math.random() * 1000000)}\`;
    
    entities[newObstacleId] = {
      position: { 
        x: width + OBSTACLE_WIDTH,
        y: height - FLOOR_HEIGHT - height / 2 
      },
      size: { width: OBSTACLE_WIDTH, height },
      type,
      renderer: Obstacle
    };
  }
  
  return entities;
};

// Collision detection helper
const checkCollision = (character, obstacle) => {
  if (!obstacle) return false;
  
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
  
  // Set up initial game entities
  const setupEntities = () => {
    return {
      physics: { engine: Physics },
      obstacleGenerator: { engine: ObstacleGenerator },
      character: {
        position: { x: width / 4, y: height - FLOOR_HEIGHT - CHARACTER_SIZE.height / 2 },
        size: CHARACTER_SIZE,
        velocity: { y: 0 },
        jumping: false,
        renderer: Character
      },
      background: {
        position: { x: 0, y: 0 },
        size: { width, height },
        renderer: Background
      },
      floor: {
        position: { x: width / 2, y: height - FLOOR_HEIGHT / 2 },
        size: { width, height: FLOOR_HEIGHT },
        renderer: (props) => {
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
    setScore(0);
    setGameOver(false);
    setRunning(true);
    if (gameEngine) {
      gameEngine.swap(setupEntities());
    }
  };
  
  // Handle screen tap for character jump
  const handleTap = () => {
    if (gameOver) {
      resetGame();
    } else if (!running) {
      setRunning(true);
    }
  };
  
  // Handle game events
  const onEvent = (e) => {
    if (e.type === 'game-over') {
      setRunning(false);
      setGameOver(true);
    } else if (e.type === 'score') {
      setScore(prevScore => prevScore + 1);
    }
  };
  
  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <GameEngine
          ref={(ref) => { setGameEngine(ref) }}
          style={styles.gameContainer}
          systems={[Physics, ObstacleGenerator]}
          entities={setupEntities()}
          running={running}
          onEvent={onEvent}
        />
        
        {!running && !gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.startText}>Tap to Start</Text>
          </View>
        )}
        
        {gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.gameOverText}>Game Over</Text>
            <Text style={styles.scoreText}>Score: {score}</Text>
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
    alignItems: 'center'
  },
  startText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2
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
  restartText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2
  },
  scoreContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  scoreDisplay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1
  }
});