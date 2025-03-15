import React from 'react';
import { View, StyleSheet } from 'react-native';

// Obstacle colors based on difficulty/height
const OBSTACLE_COLORS = {
  easy: '#228B22',    // Forest Green
  medium: '#FF8C00',  // Dark Orange
  hard: '#DC143C',    // Crimson
  expert: '#800080'   // Purple
};

const Obstacle = (props) => {
  if (!props || !props.position || !props.size) {
    console.log("Missing props in Obstacle component");
    return null;
  }
  
  const { position, size, hit } = props;
  
  // Determine obstacle color based on height
  let difficultyColor = OBSTACLE_COLORS.easy;
  if (size.height > 70) {
    difficultyColor = OBSTACLE_COLORS.expert;
  } else if (size.height > 60) {
    difficultyColor = OBSTACLE_COLORS.hard;
  } else if (size.height > 50) {
    difficultyColor = OBSTACLE_COLORS.medium;
  }
  
  const obstacleColor = hit ? '#FF6347' : difficultyColor; // Red if hit, difficulty color otherwise
  
  // Determine the number of spikes based on difficulty
  const numberOfSpikes = Math.ceil(size.height / 15);
  
  return (
    <View
      style={[
        styles.obstacle,
        {
          position: 'absolute',
          left: position.x - size.width / 2,
          top: position.y - size.height / 2,
          width: size.width,
          height: size.height,
          backgroundColor: obstacleColor,
          borderRadius: 5,
          borderWidth: 2,
          borderColor: '#000',
          elevation: 3, // For Android shadow
          shadowColor: '#000', // For iOS shadow
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 0.6,
          shadowRadius: 1,
        }
      ]}
    >
      {/* Generate spikes based on difficulty */}
      {Array.from({ length: numberOfSpikes }).map((_, index) => (
        <View 
          key={index} 
          style={[
            styles.spike, 
            { 
              left: size.width / 2 - 5, 
              top: -(10 + index * 5 % 20)
            }
          ]} 
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  obstacle: {
    zIndex: 990, // Below character but above background
  },
  spike: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#000',
  }
});

export default Obstacle;