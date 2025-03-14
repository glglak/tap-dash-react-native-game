import React from 'react';
import { View } from 'react-native';

const Obstacle = (props) => {
  const { position, size, type } = props;
  
  // Different obstacle types
  const colors = {
    small: '#4CAF50',
    medium: '#8BC34A',
    large: '#009688'
  };
  
  return (
    <View
      style={{
        position: 'absolute',
        left: position.x - size.width / 2,
        top: position.y - size.height / 2,
        width: size.width,
        height: size.height,
        backgroundColor: colors[type] || colors.small,
        borderRadius: type === 'small' ? 0 : 5,
      }}
    />
  );
};

export default Obstacle;