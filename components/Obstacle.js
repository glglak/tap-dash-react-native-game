import React from 'react';
import { View, StyleSheet } from 'react-native';

const Obstacle = (props) => {
  if (!props || !props.position || !props.size) {
    console.log("Missing props in Obstacle component");
    return null;
  }
  
  const { position, size, hit } = props;
  
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
          backgroundColor: hit ? '#FF6347' : '#228B22', // Red if hit, green otherwise
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
      {/* Optional: Add spikes or details to make obstacles more interesting */}
      <View style={styles.spike} />
      <View style={[styles.spike, { left: 10 }]} />
      <View style={[styles.spike, { left: 20 }]} />
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
    top: -8,
    left: 0,
  }
});

export default Obstacle;