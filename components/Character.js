import React from 'react';
import { View, StyleSheet } from 'react-native';

const Character = (props) => {
  const { position, size, jumping } = props || {};
  
  if (!position || !size) {
    return null;
  }
  
  // Character parts styling
  const characterStyles = StyleSheet.create({
    // Main body - smaller and more streamlined for "dash" concept
    character: {
      position: 'absolute',
      left: position.x - size.width / 2,
      top: position.y - size.height / 2,
      width: size.width,
      height: size.height,
      borderRadius: size.width / 2, // Circular design for "dash"
      backgroundColor: '#3498db', // Bright blue to represent speed/dash
      borderWidth: 2,
      borderColor: '#2980b9',
      zIndex: 999,
      justifyContent: 'center',
      alignItems: 'center',
      transform: [
        { rotate: jumping ? '-15deg' : '0deg' }, // More dynamic leaning while jumping
        { scaleX: jumping ? 1.1 : 1 } // Stretch horizontally during jump
      ]
    },
    // Motion streaks to represent "dash"
    streak1: {
      position: 'absolute',
      right: size.width * 0.9,
      top: size.height * 0.3,
      width: size.width * 0.4,
      height: size.height * 0.1,
      backgroundColor: jumping ? '#E3F2FD' : '#90CAF9',
      borderRadius: 4,
      opacity: jumping ? 0.8 : 0.5
    },
    streak2: {
      position: 'absolute',
      right: size.width * 0.8,
      top: size.height * 0.5,
      width: size.width * 0.3,
      height: size.height * 0.1,
      backgroundColor: jumping ? '#E3F2FD' : '#90CAF9',
      borderRadius: 4,
      opacity: jumping ? 0.8 : 0.5
    },
    // Face elements
    eye: {
      position: 'absolute',
      top: size.height * 0.3,
      left: size.width * 0.6,
      width: size.width * 0.15,
      height: size.height * 0.15,
      borderRadius: 50,
      backgroundColor: 'white',
      borderWidth: 1,
      borderColor: '#333',
    },
    pupil: {
      position: 'absolute',
      top: size.height * 0.33,
      left: size.width * 0.63,
      width: size.width * 0.08,
      height: size.height * 0.08,
      borderRadius: 50,
      backgroundColor: '#333',
    },
    // Motion indicator - blur at the back
    motionBlur: {
      position: 'absolute',
      right: size.width * 1.1,
      top: 0,
      width: size.width * 0.6,
      height: size.height,
      borderRadius: size.width / 4,
      backgroundColor: '#3498db',
      opacity: 0.3,
      zIndex: 998,
    },
    // Highlight on top to give 3D look
    highlight: {
      position: 'absolute',
      top: size.height * 0.15,
      left: size.width * 0.25,
      width: size.width * 0.3,
      height: size.height * 0.2,
      borderRadius: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      transform: [{ rotate: '20deg' }]
    }
  });
  
  return (
    <>
      {/* Motion blur behind for fast movement effect */}
      <View style={characterStyles.motionBlur} />
      
      {/* Main character body */}
      <View style={characterStyles.character}>
        <View style={characterStyles.highlight} />
        <View style={characterStyles.eye} />
        <View style={characterStyles.pupil} />
      </View>
      
      {/* Motion streaks to visualize speed/dash */}
      <View style={characterStyles.streak1} />
      <View style={characterStyles.streak2} />
    </>
  );
};

export default Character;