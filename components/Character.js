import React from 'react';
import { View, Text } from 'react-native';

// Enhanced Character component with debugging
const Character = (props) => {
  const { position, size } = props || {};
  
  // Log render for debugging
  console.log('Character render:', { position, size });
  
  if (!position || !size) {
    console.log('Character missing position or size!');
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
        borderWidth: 4,
        borderColor: '#000000',
        elevation: 10,
        zIndex: 1000
      }}
    >
      {/* Add a text element to ensure visibility */}
      <Text style={{ color: 'white', textAlign: 'center' }}>C</Text>
    </View>
  );
};

export default Character;