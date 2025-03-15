import React from 'react';
import { View, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const Background = (props) => {
  const { position, size, theme } = props || {};
  
  if (!position || !size) {
    return null;
  }
  
  const skyColor = theme ? theme.sky : '#87CEEB';
  const groundColor = theme ? theme.ground : '#8B4513';
  
  return (
    <>
      {/* Sky */}
      <View style={{ 
        position: 'absolute',
        top: 0, 
        left: 0, 
        width: SCREEN_WIDTH, 
        height: SCREEN_HEIGHT, 
        backgroundColor: skyColor,
        zIndex: 1
      }} />
      
      {/* Ground */}
      <View style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        width: SCREEN_WIDTH, 
        height: size.height, 
        backgroundColor: groundColor,
        zIndex: 2
      }} />
    </>
  );
};

export default Background;