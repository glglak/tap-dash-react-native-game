import React from 'react';
import { View, StyleSheet } from 'react-native';

const Obstacle = (props) => {
  const { position, size, hit, type = 'cactus' } = props || {};
  
  if (!position || !size) {
    return null;
  }
  
  // Obstacle styling
  const getObstacleStyles = () => {
    // Create a unique visual style based on the obstacle's height
    // This gives variety to obstacles based on their procedurally generated height
    const isShort = size.height < 50;
    const isTall = size.height > 60;
    
    // Base styles for the obstacle
    const baseStyles = {
      position: 'absolute',
      left: position.x - size.width / 2,
      top: position.y - size.height / 2,
      width: size.width,
      height: size.height,
      zIndex: 998,
      shadowColor: "#000",
      shadowOffset: { width: 2, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
    };
    
    // Different styles based on obstacle type
    if (type === 'rock') {
      return StyleSheet.create({
        main: {
          ...baseStyles,
          backgroundColor: hit ? '#833333' : '#666666',
          borderRadius: size.height / 3,
          borderWidth: 2,
          borderColor: '#444444',
        },
        detail1: {
          position: 'absolute',
          top: size.height * 0.2,
          left: size.width * 0.25,
          width: size.width * 0.3,
          height: size.height * 0.15,
          backgroundColor: hit ? '#622222' : '#555555',
          borderRadius: 5,
        },
        detail2: {
          position: 'absolute',
          bottom: size.height * 0.3,
          right: size.width * 0.2,
          width: size.width * 0.35,
          height: size.height * 0.2,
          backgroundColor: hit ? '#622222' : '#555555',
          borderRadius: 7,
        }
      });
    } else {
      // Default cactus style
      return StyleSheet.create({
        main: {
          ...baseStyles,
          backgroundColor: hit ? '#993333' : '#2E8B57',
          borderRadius: isShort ? 5 : 8,
          borderWidth: 2,
          borderColor: hit ? '#661111' : '#006400',
        },
        spike1: {
          position: 'absolute',
          top: size.height * 0.2,
          left: -size.width * 0.15,
          width: size.width * 0.3,
          height: size.width * 0.1,
          backgroundColor: hit ? '#993333' : '#2E8B57',
          borderRadius: 3,
          borderWidth: 1,
          borderColor: hit ? '#661111' : '#006400',
        },
        spike2: {
          position: 'absolute',
          top: size.height * 0.5,
          right: -size.width * 0.15,
          width: size.width * 0.3,
          height: size.width * 0.1,
          backgroundColor: hit ? '#993333' : '#2E8B57',
          borderRadius: 3,
          borderWidth: 1,
          borderColor: hit ? '#661111' : '#006400',
        },
        arm: isTall ? {
          position: 'absolute',
          top: size.height * 0.3,
          right: size.width * 0.1,
          width: size.width * 0.7,
          height: size.width * 0.25,
          backgroundColor: hit ? '#993333' : '#2E8B57',
          borderRadius: 5,
          borderWidth: 1,
          borderColor: hit ? '#661111' : '#006400',
        } : null
      });
    }
  };
  
  const styles = getObstacleStyles();
  const obstacleType = Math.abs(position.x) % 2 === 0 ? 'cactus' : 'rock';
  
  return (
    <View style={styles.main}>
      {obstacleType === 'cactus' && (
        <>
          <View style={styles.spike1} />
          <View style={styles.spike2} />
          {styles.arm && <View style={styles.arm} />}
        </>
      )}
      {obstacleType === 'rock' && (
        <>
          <View style={styles.detail1} />
          <View style={styles.detail2} />
        </>
      )}
    </View>
  );
};

export default Obstacle;