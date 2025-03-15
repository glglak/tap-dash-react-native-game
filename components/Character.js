import React from 'react';
import { View } from 'react-native';

// Ultra-simple Character - just a red box
const Character = (props) => {
  const { position, size } = props || {};
  
  if (!position || !size) {
    return null;
  }
  
  return (
    <View
      style={{
        position: 'absolute',
        left: position.x - size.width / 2,
        top: position.y - size.height / 2,
        width: size.width,
        height: size.height,
        backgroundColor: '#FF0000',
        borderWidth: 2,
        borderColor: '#000000'
      }}
    />
  );
};

export default Character;