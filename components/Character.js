import React from 'react';
import { View, StyleSheet } from 'react-native';

// Lightweight Character Component - stripped down for better performance
const Character = (props) => {
  if (!props || !props.position || !props.size) {
    return null;
  }
  
  const { position, size, jumping } = props;
  
  // Simple color change based on jumping state
  const characterColor = jumping ? '#FF6347' : '#FF0000';
  
  // Very simplified character - just a single colored rectangle with minimal styling
  return (
    <View
      style={{
        position: 'absolute',
        left: position.x - size.width / 2,
        top: position.y - size.height / 2,
        width: size.width,
        height: size.height,
        backgroundColor: characterColor,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#000',
        transform: jumping ? [{ rotate: '-5deg' }] : []
      }}
    />
  );
};

export default Character;
