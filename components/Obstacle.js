import React from 'react';
import { View } from 'react-native';

// Lightweight Obstacle Component - more visible but still performant
const Obstacle = (props) => {
  if (!props || !props.position || !props.size) {
    return null;
  }
  
  const { position, size, hit } = props;
  
  // Very simplified obstacle - just a colored rectangle with details for visibility
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
        borderWidth: 3, // Thicker border for visibility
        borderColor: '#000',
        // Add spikes for visibility
        alignItems: 'center',
        justifyContent: 'flex-start'
      }}
    >
      {/* Simple "spikes" on top of obstacle */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        position: 'absolute',
        top: -10
      }}>
        <View style={{
          width: 0,
          height: 0,
          borderLeftWidth: 6,
          borderRightWidth: 6,
          borderBottomWidth: 10,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: hit ? '#FF0000' : '#006400'
        }} />
        <View style={{
          width: 0,
          height: 0,
          borderLeftWidth: 6,
          borderRightWidth: 6,
          borderBottomWidth: 10,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: hit ? '#FF0000' : '#006400'
        }} />
      </View>
    </View>
  );
};

export default Obstacle;