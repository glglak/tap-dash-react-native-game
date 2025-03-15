import React from 'react';
import { View, StyleSheet } from 'react-native';

const Coin = (props) => {
  if (!props || !props.position || !props.size) {
    console.log("Missing props in Coin component");
    return null;
  }
  
  const { position, size, collected } = props;
  
  // Don't render if collected
  if (collected) {
    return null;
  }
  
  return (
    <View
      style={[
        styles.coin,
        {
          position: 'absolute',
          left: position.x - size.width / 2,
          top: position.y - size.height / 2,
          width: size.width,
          height: size.height,
        }
      ]}
    >
      {/* Outer coin circle */}
      <View style={[styles.coinOuter, { width: size.width, height: size.height }]} />
      
      {/* Inner coin circle */}
      <View style={[
        styles.coinInner, 
        { 
          width: size.width * 0.7, 
          height: size.height * 0.7,
          top: size.height * 0.15,
          left: size.width * 0.15
        }
      ]} />
      
      {/* Dollar sign */}
      <View style={[
        styles.dollarSignVertical,
        {
          height: size.height * 0.5,
          top: size.height * 0.25,
          left: size.width * 0.45,
        }
      ]} />
      <View style={[
        styles.dollarSignTop,
        {
          width: size.width * 0.3,
          top: size.height * 0.25,
          left: size.width * 0.35,
        }
      ]} />
      <View style={[
        styles.dollarSignMiddle,
        {
          width: size.width * 0.3,
          top: size.height * 0.45,
          left: size.width * 0.35,
        }
      ]} />
      <View style={[
        styles.dollarSignBottom,
        {
          width: size.width * 0.3,
          top: size.height * 0.65,
          left: size.width * 0.35,
        }
      ]} />
    </View>
  );
};

const styles = StyleSheet.create({
  coin: {
    zIndex: 900,
  },
  coinOuter: {
    borderRadius: 50,
    backgroundColor: '#FFD700', // Gold
    borderWidth: 2,
    borderColor: '#B8860B', // Dark golden rod
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 4,
  },
  coinInner: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: '#FFEC8B', // Light golden rod
  },
  dollarSignVertical: {
    position: 'absolute',
    width: 3,
    backgroundColor: '#B8860B', // Dark golden rod
  },
  dollarSignTop: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#B8860B', // Dark golden rod
  },
  dollarSignMiddle: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#B8860B', // Dark golden rod
  },
  dollarSignBottom: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#B8860B', // Dark golden rod
  }
});

export default Coin;