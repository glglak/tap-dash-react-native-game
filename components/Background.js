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
  
  // Generate unique decoration elements for each theme
  const generateDecorations = () => {
    const decorations = [];
    
    // Based on theme index, create different decorative elements
    switch (themeIndex) {
      case 0: // Default - Sky blue with brown ground - Add clouds
        for (let i = 0; i < 6; i++) {
          const left = i * (SCREEN_WIDTH / 3) + Math.random() * 50;
          const top = Math.random() * (SCREEN_HEIGHT * 0.4);
          const size = 20 + Math.random() * 60;
          
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
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                zIndex: 2
              }}
            />
          );
          
          // Additional cloud parts for fluffiness
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
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                zIndex: 2
              }}
            />
          );
        }
        break;
        
      case 1: // Sunset theme - Add sun and birds
        // Large sun
        decorations.push(
          <View 
            key="sun"
            style={{
              position: 'absolute',
              left: SCREEN_WIDTH * 0.7,
              top: SCREEN_HEIGHT * 0.2,
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: '#FFD700',
              zIndex: 2
            }}
          />
        );
        
        // Add birds silhouettes
        for (let i = 0; i < 5; i++) {
          const left = Math.random() * SCREEN_WIDTH;
          const top = 50 + Math.random() * (SCREEN_HEIGHT * 0.3);
          
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
        
      case 2: // Night theme - Add stars
        for (let i = 0; i < 20; i++) {
          const left = Math.random() * SCREEN_WIDTH;
          const top = Math.random() * (SCREEN_HEIGHT * 0.6);
          const size = 1 + Math.random() * 3;
          
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
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#E0E0E0',
              zIndex: 2
            }}
          />
        );
        break;
        
      case 3: // Alien planet theme - Add alien plants
        for (let i = 0; i < 8; i++) {
          const left = i * (SCREEN_WIDTH / 6) + Math.random() * 30;
          const height = 30 + Math.random() * 50;
          
          decorations.push(
            <View 
              key={`plant-${i}`}
              style={{
                position: 'absolute',
                left,
                bottom: size.height,
                width: 8,
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
                left: left - 12,
                bottom: size.height + height - 15,
                width: 30,
                height: 15,
                borderRadius: 15,
                backgroundColor: '#00AA00',
                zIndex: 3
              }}
            />
          );
        }
        break;
        
      case 4: // Desert theme - Add cacti and tumbleweeds
        for (let i = 0; i < 4; i++) {
          const left = i * (SCREEN_WIDTH / 3) + Math.random() * 100;
          
          // Distant cactus
          decorations.push(
            <View 
              key={`distant-cactus-${i}`}
              style={{
                position: 'absolute',
                left,
                bottom: size.height,
                width: 15,
                height: 40,
                backgroundColor: '#006400',
                borderRadius: 2,
                zIndex: 3
              }}
            />
          );
          
          // Distant cactus arm
          if (Math.random() > 0.5) {
            decorations.push(
              <View 
                key={`distant-cactus-arm-${i}`}
                style={{
                  position: 'absolute',
                  left: left + 5,
                  bottom: size.height + 25,
                  width: 20,
                  height: 8,
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
      
      {/* Decorative elements */}
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
      
      {/* Ground details - small bumps and texture */}
      <View style={{ 
        position: 'absolute', 
        bottom: size.height - 5, 
        left: 0, 
        width: SCREEN_WIDTH, 
        height: 5, 
        backgroundColor: themeIndex === 4 ? '#DAA520' : groundColor === '#006400' ? '#004D00' : (groundColor === '#8B4513' ? '#6B3513' : '#444444'),
        zIndex: 3
      }} />
    </>
  );
};

export default Background;