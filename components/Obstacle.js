import React from 'react';
import { View, StyleSheet } from 'react-native';

// Obstacle types
const OBSTACLE_TYPES = {
  GROUND: 'ground',
  AIR: 'air'
};

// Obstacle colors based on type and difficulty
const OBSTACLE_COLORS = {
  ground: '#228B22',  // Forest Green for ground obstacles
  air: '#FF4500',     // OrangeRed for air obstacles
  hit: '#FF6347'      // Tomato for hit obstacles
};

const Obstacle = (props) => {
  if (!props || !props.position || !props.size) {
    console.log("Missing props in Obstacle component");
    return null;
  }
  
  const { position, size, hit, type = OBSTACLE_TYPES.GROUND } = props;
  
  // Determine obstacle color based on type and hit state
  const obstacleColor = hit ? 
    OBSTACLE_COLORS.hit : 
    (type === OBSTACLE_TYPES.GROUND ? OBSTACLE_COLORS.ground : OBSTACLE_COLORS.air);
  
  // For air obstacles, add some visual indicators to make them distinct
  const isAirObstacle = type === OBSTACLE_TYPES.AIR;
  
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
          borderRadius: isAirObstacle ? 0 : 5,
          borderWidth: 2,
          borderColor: '#000',
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 0.6,
          shadowRadius: 1,
        }
      ]}
    >
      {/* Air obstacles have spikes pointing downward */}
      {isAirObstacle && (
        <View style={styles.airObstacleContainer}>
          {Array.from({ length: 3 }).map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.spikeDown, 
                { left: size.width / 4 + (index * size.width / 3 - 5) }
              ]} 
            />
          ))}
        </View>
      )}
      
      {/* Ground obstacles have spikes pointing upward */}
      {!isAirObstacle && (
        <View style={styles.groundObstacleContainer}>
          {Array.from({ length: 3 }).map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.spikeUp, 
                { left: size.width / 4 + (index * size.width / 3 - 5) }
              ]} 
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  obstacle: {
    zIndex: 990, // Below character but above background
  },
  airObstacleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 10,
  },
  groundObstacleContainer: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    height: 10,
  },
  spikeDown: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#000',
    bottom: 0,
  },
  spikeUp: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#000',
    top: 0,
  }
});

export default Obstacle;