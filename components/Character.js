import React from 'react';
import { View, StyleSheet } from 'react-native';

const Character = (props) => {
  const { position, size, jumping } = props || {};
  
  if (!position || !size) {
    return null;
  }
  
  // Character parts styling
  const characterStyles = StyleSheet.create({
    character: {
      position: 'absolute',
      left: position.x - size.width / 2,
      top: position.y - size.height / 2,
      width: size.width,
      height: size.height,
      borderRadius: size.width / 4,
      backgroundColor: '#FF5252',
      borderWidth: 2,
      borderColor: '#700000',
      zIndex: 999,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 10,
      justifyContent: 'center',
      alignItems: 'center',
      transform: [{ rotate: jumping ? '-10deg' : '0deg' }]
    },
    eyes: {
      position: 'absolute',
      top: size.height * 0.25,
      left: size.width * 0.55,
      width: size.width * 0.22,
      height: size.height * 0.22,
      borderRadius: 50,
      backgroundColor: 'white',
      borderWidth: 1,
      borderColor: '#333',
    },
    pupil: {
      position: 'absolute',
      top: size.height * 0.30,
      left: size.width * 0.63,
      width: size.width * 0.12,
      height: size.height * 0.12,
      borderRadius: 50,
      backgroundColor: '#333',
    },
    mouth: {
      position: 'absolute',
      top: size.height * 0.55,
      left: size.width * 0.53,
      width: size.width * 0.25,
      height: size.height * 0.12,
      borderBottomLeftRadius: 50,
      borderBottomRightRadius: 50,
      backgroundColor: jumping ? '#FF0000' : '#990000',
      borderWidth: 1,
      borderColor: '#700000',
      transform: [{ rotate: '10deg' }]
    },
    leg1: {
      position: 'absolute',
      left: size.width * 0.15,
      bottom: -size.height * 0.05,
      width: size.width * 0.18,
      height: size.height * 0.3,
      backgroundColor: '#FF5252',
      borderRadius: 10,
      borderWidth: 2,
      borderColor: '#700000',
      transform: [{ rotate: jumping ? '30deg' : '0deg' }]
    },
    leg2: {
      position: 'absolute',
      left: size.width * 0.55,
      bottom: -size.height * 0.05,
      width: size.width * 0.18,
      height: size.height * 0.3,
      backgroundColor: '#FF5252',
      borderRadius: 10,
      borderWidth: 2,
      borderColor: '#700000',
      transform: [{ rotate: jumping ? '-20deg' : '0deg' }]
    }
  });
  
  return (
    <View style={characterStyles.character}>
      <View style={characterStyles.leg1} />
      <View style={characterStyles.leg2} />
      <View style={characterStyles.eyes} />
      <View style={characterStyles.pupil} />
      <View style={characterStyles.mouth} />
    </View>
  );
};

export default Character;