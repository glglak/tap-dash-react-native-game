import React from 'react';
import { View, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Lightweight Background Component - stripped down for better performance
const Background = (props) => {
  if (!props || !props.position || !props.size) {
    return null;
  }
  
  const { position, size, theme } = props;
  
  // Use theme colors or default to sky blue and brown
  const skyColor = theme ? theme.sky : '#87CEEB';
  const groundColor = theme ? theme.ground : '#8B4513';
  
  // Very simplified background - just two colored rectangles
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
      {/* Sky */}
      <View style={{ 
        position: 'absolute',
        top: 0, 
        left: 0, 
        width: SCREEN_WIDTH, 
        height: SCREEN_HEIGHT, 
        backgroundColor: skyColor 
      }} />
      
      {/* Ground */}
      <View style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        width: SCREEN_WIDTH, 
        height: size.height, 
        backgroundColor: groundColor 
      }} />
    </View>
  );
};

export default Background;