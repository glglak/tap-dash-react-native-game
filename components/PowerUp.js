import React from 'react';
import { View, StyleSheet } from 'react-native';

const PowerUp = (props) => {
  if (!props || !props.position || !props.size) {
    console.log("Missing props in PowerUp component");
    return null;
  }
  
  const { position, size, type, collected } = props;
  
  // Don't render if collected
  if (collected) {
    return null;
  }
  
  // Determine color based on power-up type
  const powerupColor = '#FFD700'; // Gold for invincibility
  
  return (
    <View
      style={[
        styles.powerup,
        {
          position: 'absolute',
          left: position.x - size.width / 2,
          top: position.y - size.height / 2,
          width: size.width,
          height: size.height,
        }
      ]}
    >
      {/* Base star shape (rendered as a circle with points) */}
      <View style={[
        styles.starBase, 
        { 
          width: size.width, 
          height: size.height,
          backgroundColor: powerupColor
        }
      ]} />
      
      {/* Star points */}
      {Array.from({ length: 5 }).map((_, index) => (
        <View 
          key={index} 
          style={[
            styles.starPoint,
            {
              width: size.width * 0.3,
              height: size.height * 0.3,
              top: size.height * 0.5 - size.height * 0.15 + Math.sin(index * Math.PI * 2 / 5) * size.height * 0.3,
              left: size.width * 0.5 - size.width * 0.15 + Math.cos(index * Math.PI * 2 / 5) * size.width * 0.3,
              transform: [{ rotate: `${index * 72}deg` }],
              backgroundColor: powerupColor
            }
          ]}
        />
      ))}
      
      {/* Glow effect */}
      <View style={[
        styles.glow,
        {
          width: size.width * 1.2,
          height: size.height * 1.2,
          top: -size.height * 0.1,
          left: -size.width * 0.1
        }
      ]} />
    </View>
  );
};

const styles = StyleSheet.create({
  powerup: {
    zIndex: 900,
  },
  starBase: {
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#8B4513', // Saddle brown
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 6,
  },
  starPoint: {
    position: 'absolute',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#8B4513', // Saddle brown
  },
  glow: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 215, 0, 0.3)', // Transparent gold
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 1,
  }
});

export default PowerUp;