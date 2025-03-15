import React from 'react';
import { View } from 'react-native';

// Lightweight Obstacle Component - stripped down for better performance
const Obstacle = (props) => {
  if (!props || !props.position || !props.size) {
    return null;
  }
  
  const { position, size, hit } = props;
  
  // Very simplified obstacle - just a colored rectangle
  return (
    <View
      style={{
        position: 'absolute',
        left: position.x - size.width / 2,
        top: position.y - size.height / 2,
        width: size.width,
        height: size.height,
        backgroundColor: hit ? '#FF6347' : '#228B22', // Red if hit, green otherwise
        borderRadius: 3,
        borderWidth: 1,
        borderColor: '#000'
      }}
    />
  );
};

export default Obstacle;
