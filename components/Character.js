import React from 'react';
import { View, StyleSheet } from 'react-native';

// Improved Character Component - more visible but still lightweight
const Character = (props) => {
  if (!props || !props.position || !props.size) {
    return null;
  }
  
  const { position, size, jumping } = props;
  
  // Bright colors for visibility
  const characterColor = jumping ? '#FF0000' : '#FF0000'; // Always bright red
  
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
        borderWidth: 3, // Thicker border for visibility
        borderColor: '#000',
        // Simple face to make it more visible
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Simple eyes */}
      <View style={{
        width: size.width * 0.7,
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>
        <View style={{
          width: 10,
          height: 10,
          backgroundColor: 'white',
          borderRadius: 5,
        }} />
        <View style={{
          width: 10,
          height: 10,
          backgroundColor: 'white',
          borderRadius: 5,
        }} />
      </View>
      
      {/* Simple mouth */}
      <View style={{
        marginTop: 5,
        width: size.width * 0.5,
        height: 3,
        backgroundColor: 'white',
      }} />
    </View>
  );
};

export default Character;