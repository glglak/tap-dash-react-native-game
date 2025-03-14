import React from 'react';
import { View, StyleSheet } from 'react-native';

const Background = (props) => {
  const { position, size } = props;
  
  return (
    <View style={styles.container}>
      {/* Sky */}
      <View style={styles.sky} />
      
      {/* Cloud layer - we'll add a few static clouds */}
      <View style={[styles.cloud, { left: '10%', top: '15%' }]} />
      <View style={[styles.cloud, { left: '40%', top: '25%' }]} />
      <View style={[styles.cloud, { left: '70%', top: '10%' }]} />
      
      {/* Mountains in background */}
      <View style={styles.mountain1} />
      <View style={styles.mountain2} />
      
      {/* Sun */}
      <View style={styles.sun} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#87CEEB', // Sky blue
  },
  sky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: '#87CEEB', // Sky blue
  },
  cloud: {
    position: 'absolute',
    width: 100,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  mountain1: {
    position: 'absolute',
    bottom: '40%',
    left: '10%',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 150,
    borderRightWidth: 150,
    borderBottomWidth: 200,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#7E7E7E', // Gray mountain
  },
  mountain2: {
    position: 'absolute',
    bottom: '40%',
    right: '10%',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 130,
    borderRightWidth: 130,
    borderBottomWidth: 180,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#5A5A5A', // Darker gray mountain
  },
  sun: {
    position: 'absolute',
    top: '10%',
    right: '10%',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD700', // Gold color
  },
});

export default Background;