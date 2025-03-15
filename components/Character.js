import React from 'react';
import { View, StyleSheet } from 'react-native';

const Character = (props) => {
  if (!props || !props.position || !props.size) {
    console.log("Missing props in Character component");
    return null;
  }
  
  const { position, size, jumping } = props;
  
  // Animation state based on jumping - change the appearance when jumping
  const characterStyle = jumping ? styles.jumping : styles.running;
  const characterColor = jumping ? '#FF6347' : '#FF0000'; // Brighter red when jumping
  
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
          backgroundColor: characterColor,
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
      
      {/* Mouth changes with state - smile when jumping, neutral when running */}
      {jumping ? (
        <View style={styles.smileMouth} />
      ) : (
        <View style={styles.neutralMouth} />
      )}
      
      {/* Add arms */}
      <View style={[styles.arm, styles.leftArm, jumping ? styles.armRaised : styles.armLowered]} />
      <View style={[styles.arm, styles.rightArm, jumping ? styles.armRaised : styles.armLowered]} />
      
      {/* Add legs */}
      <View style={[styles.leg, styles.leftLeg, jumping ? styles.legBent : styles.legStraight]} />
      <View style={[styles.leg, styles.rightLeg, jumping ? styles.legBent : styles.legStraight]} />
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
    transform: [{ rotate: '-5deg' }]
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
  neutralMouth: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: 'white',
    borderRadius: 1,
    bottom: 15,
    left: 15
  },
  smileMouth: {
    position: 'absolute',
    width: 20,
    height: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'white',
    borderLeftWidth: 2,
    borderLeftColor: 'white',
    borderRightWidth: 2,
    borderRightColor: 'white',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    bottom: 10,
    left: 15
  },
  arm: {
    position: 'absolute',
    width: 6,
    height: 20,
    backgroundColor: '#D02020',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 3,
  },
  leftArm: {
    left: -2,
    top: 15,
  },
  rightArm: {
    right: -2,
    top: 15,
  },
  armRaised: {
    transform: [{ rotate: '-45deg' }]
  },
  armLowered: {
    transform: [{ rotate: '0deg' }]
  },
  leg: {
    position: 'absolute',
    width: 8,
    height: 25,
    backgroundColor: '#D02020',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 3,
  },
  leftLeg: {
    left: 10,
    bottom: -15,
  },
  rightLeg: {
    right: 10,
    bottom: -15,
  },
  legBent: {
    height: 15,
    transform: [{ rotate: '45deg' }]
  },
  legStraight: {
    transform: [{ rotate: '0deg' }]
  }
});

export default Character;