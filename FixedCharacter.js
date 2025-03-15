import React from 'react';
import { View } from 'react-native';

// This is a direct view component that doesn't rely on the game engine renderer
const FixedCharacter = ({ x, y, width, height, isJumping = false }) => {
  return (
    <View
      style={{
        position: 'absolute',
        left: x - width/2,
        top: y - height/2,
        width,
        height,
        backgroundColor: isJumping ? '#FF0000' : '#FF0000',
        borderWidth: 5,
        borderColor: 'black',
        zIndex: 9999
      }}
    />
  );
};

export default FixedCharacter;