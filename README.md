# Tap Dash Game - React Native with Expo

A simple mobile game where a character automatically moves forward, and the player taps the screen to make the character jump over obstacles. The game tracks the distance traveled and awards points.

## Key Components

1. **Character**: A simple animated sprite that moves horizontally across the screen
2. **Obstacles**: Simple shapes that appear from the right side and move left
3. **Background**: A scrolling parallax background to give a sense of movement
4. **Score Display**: Shows distance traveled and current score
5. **Game Over Screen**: Appears when the character collides with an obstacle

## Core Mechanics

1. Single tap to jump
2. Automatic forward movement
3. Obstacle generation at random intervals
4. Simple collision detection
5. Score based on distance traveled

## Getting Started

```
npm install
npx expo start
```