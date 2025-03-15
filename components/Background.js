import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const Background = (props) => {
  const { position, size, theme, themeIndex = 0 } = props || {};
  
  if (!position || !size) {
    return null;
  }
  
  const skyColor = theme ? theme.sky : '#87CEEB';
  const groundColor = theme ? theme.ground : '#8B4513';
  
  // Generate unique decoration elements for each theme - with less movement and distraction
  const generateDecorations = () => {
    const decorations = [];
    
    // Based on theme index, create different decorative elements
    switch (themeIndex) {
      case 0: // Default - Sky blue with brown ground - Add fewer stationary clouds
        for (let i = 0; i < 4; i++) { // Reduced number of clouds
          // Position clouds at fixed locations
          const left = (i * (SCREEN_WIDTH / 3)) + 50;
          const top = 40 + (i % 2) * 40; // Alternating heights, higher in the sky
          const size = 30 + (i % 3) * 15; // Varied but smaller sizes
          
          decorations.push(
            <View 
              key={`cloud-${i}`}
              style={{
                position: 'absolute',
                left,
                top,
                width: size,
                height: size / 2,
                borderRadius: size / 2,
                backgroundColor: 'rgba(255, 255, 255, 0.7)', // More transparent
                zIndex: 2
              }}
            />
          );
          
          // Simpler cloud parts
          decorations.push(
            <View 
              key={`cloud-part-${i}`}
              style={{
                position: 'absolute',
                left: left + size * 0.3,
                top: top - size * 0.1,
                width: size * 0.7,
                height: size / 2,
                borderRadius: size / 2,
                backgroundColor: 'rgba(255, 255, 255, 0.7)', // More transparent
                zIndex: 2
              }}
            />
          );
        }
        break;
        
      case 1: // Sunset theme - Add sun
        // Large sun, more static
        decorations.push(
          <View 
            key="sun"
            style={{
              position: 'absolute',
              left: SCREEN_WIDTH * 0.75,
              top: SCREEN_HEIGHT * 0.15,
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#FFD700',
              zIndex: 2
            }}
          />
        );
        
        // Add just a couple of birds
        for (let i = 0; i < 3; i++) {
          const left = 50 + i * (SCREEN_WIDTH / 3);
          const top = 80 + (i % 2) * 40;
          
          decorations.push(
            <View 
              key={`bird-${i}`}
              style={{
                position: 'absolute',
                left,
                top,
                width: 10,
                height: 3,
                borderRadius: 5,
                backgroundColor: '#000000',
                transform: [{ rotate: '30deg' }],
                zIndex: 2
              }}
            />
          );
          
          decorations.push(
            <View 
              key={`bird-wing-${i}`}
              style={{
                position: 'absolute',
                left: left - 5,
                top: top - 3,
                width: 10,
                height: 3,
                borderRadius: 5,
                backgroundColor: '#000000',
                transform: [{ rotate: '-30deg' }],
                zIndex: 2
              }}
            />
          );
        }
        break;
        
      case 2: // Night theme - Add stars and moon (reduced quantity)
        // Just a few stars
        for (let i = 0; i < 12; i++) {
          const left = (i * (SCREEN_WIDTH / 10)) + (i % 3) * 15;
          const top = 20 + (i % 4) * 30;
          const size = 1 + (i % 3);
          
          decorations.push(
            <View 
              key={`star-${i}`}
              style={{
                position: 'absolute',
                left,
                top,
                width: size,
                height: size,
                borderRadius: size,
                backgroundColor: '#FFFFFF',
                zIndex: 2
              }}
            />
          );
        }
        
        // Add moon
        decorations.push(
          <View 
            key="moon"
            style={{
              position: 'absolute',
              left: SCREEN_WIDTH * 0.8,
              top: SCREEN_HEIGHT * 0.1,
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: '#E0E0E0',
              zIndex: 2
            }}
          />
        );
        break;
        
      case 3: // Alien planet theme - Add a few alien plants
        for (let i = 0; i < 4; i++) {
          const left = 50 + i * (SCREEN_WIDTH / 4);
          const height = 20 + (i % 3) * 15;
          
          decorations.push(
            <View 
              key={`plant-${i}`}
              style={{
                position: 'absolute',
                left,
                bottom: size.height,
                width: 6,
                height: height,
                backgroundColor: '#00FF00',
                zIndex: 3
              }}
            />
          );
          
          // Plant top
          decorations.push(
            <View 
              key={`plant-top-${i}`}
              style={{
                position: 'absolute',
                left: left - 7,
                bottom: size.height + height - 10,
                width: 20,
                height: 10,
                borderRadius: 10,
                backgroundColor: '#00AA00',
                zIndex: 3
              }}
            />
          );
        }
        break;
        
      case 4: // Desert theme - Add cacti (fewer and static)
        for (let i = 0; i < 3; i++) {
          const left = 75 + i * (SCREEN_WIDTH / 3);
          
          // Distant cactus
          decorations.push(
            <View 
              key={`distant-cactus-${i}`}
              style={{
                position: 'absolute',
                left,
                bottom: size.height,
                width: 12,
                height: 30,
                backgroundColor: '#006400',
                borderRadius: 2,
                zIndex: 3
              }}
            />
          );
          
          // Some cacti have arms
          if (i % 2 === 0) {
            decorations.push(
              <View 
                key={`distant-cactus-arm-${i}`}
                style={{
                  position: 'absolute',
                  left: left + 5,
                  bottom: size.height + 20,
                  width: 15,
                  height: 6,
                  backgroundColor: '#006400',
                  borderRadius: 2,
                  zIndex: 3
                }}
              />
            );
          }
        }
        break;
    }
    
    return decorations;
  };
  
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
      
      {/* Decorative elements - stationary, not moving with game speed */}
      {generateDecorations()}
      
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
      
      {/* Ground details - simple line */}
      <View style={{ 
        position: 'absolute', 
        bottom: size.height - 5, 
        left: 0, 
        width: SCREEN_WIDTH, 
        height: 3, 
        backgroundColor: themeIndex === 4 ? '#DAA520' : groundColor === '#006400' ? '#004D00' : (groundColor === '#8B4513' ? '#6B3513' : '#444444'),
        zIndex: 3
      }} />
    </>
  );
};

export default Background;