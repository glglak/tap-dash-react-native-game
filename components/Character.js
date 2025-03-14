import React from 'react';
import { View, StyleSheet } from 'react-native';

const Character = (props) => {
  if (!props || !props.position || !props.size) {
    console.log("Missing props in Character component");
    return null;
  }
  
  const { position, size, jumping } = props;
  
  // Animation state based on jumping
  const characterStyle = jumping ? styles.jumping : styles.running;
  
  return (
    <View
      style={[
        styles.character,
        {
          position: 'absolute',
          left: position.x - size.width / 2,
          top: position.y - size.height / 2,
          width: size.width,
          height: size.height,
          backgroundColor: '#FF0000', // Bright red to make it more visible
          borderRadius: 8,
          borderWidth: 2,
          borderColor: '#000',
          elevation: 5, // For Android shadow
          shadowColor: '#000', // For iOS shadow
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 0.8,
          shadowRadius: 2,
        },
        characterStyle
      ]}
    >
      {/* Character face - simple representation */}
      <View style={styles.eye} />
      <View style={[styles.eye, { left: 30 }]} />
      <View style={styles.mouth} />
    </View>
  );
};

const styles = StyleSheet.create({
  character: {
    zIndex: 1000, // Make sure character is on top
  },
  running: {
    transform: [{ rotate: '0deg' }]
  },
  jumping: {
    transform: [{ rotate: '-10deg' }]
  },
  eye: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    top: 10,
    left: 10
  },
  mouth: {
    position: 'absolute',
    width: 20,
    height: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    bottom: 10,
    left: 15
  }
});

export default Character;