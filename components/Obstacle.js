import React from 'react';
import { View } from 'react-native';

const Obstacle = (props) => {
  const { position, size, hit } = props || {};
  
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
        backgroundColor: hit ? '#FF0000' : '#00FF00',
        borderWidth: 2,
        borderColor: '#000000',
        zIndex: 998
      }}
    />
  );
};

export default Obstacle;