import React from 'react';
import { View, StyleSheet } from 'react-native';

const Obstacle = (props) => {
  if (!props || !props.position || !props.size) {
    console.log("Missing props in Obstacle component");
    return null;
  }
  
  const { position, size, type } = props;
  
  // Different obstacle types with more vibrant colors
  const colors = {
    small: '#FF5722', // Bright orange
    medium: '#9C27B0', // Purple
    large: '#F44336'  // Red
  };
  
  return (
    <View
      style={[
        styles.obstacle,
        {
          position: 'absolute',
          left: position.x - size.width / 2,
          top: position.y - size.height / 2,
          width: size.width,
          height: size.height,
          backgroundColor: colors[type] || colors.small,
          borderRadius: type === 'small' ? 0 : 5,
          borderWidth: 2,
          borderColor: '#000',
          elevation: 4, // Android shadow
          shadowColor: '#000', // iOS shadow
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 0.5,
          shadowRadius: 2,
        }
      ]}
    >
      {/* Add some internal details to make obstacles more visible */}
      <View 
        style={{
          position: 'absolute',
          top: '20%',
          left: '20%',
          width: '60%',
          height: '10%',
          backgroundColor: '#FFF',
          opacity: 0.7
        }} 
      />
      <View 
        style={{
          position: 'absolute',
          top: '40%',
          left: '20%',
          width: '60%',
          height: '10%',
          backgroundColor: '#FFF',
          opacity: 0.7
        }} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  obstacle: {
    zIndex: 100, // Make sure obstacles are above the background
  }
});

export default Obstacle;