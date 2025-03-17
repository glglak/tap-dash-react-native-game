import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Alert, Platform } from 'react-native';

// Import Share directly from react-native
// This is more reliable than expo-sharing for this case
import { Share } from 'react-native';

// Initial Achievements
const INITIAL_ACHIEVEMENTS = [
  { id: 'first_run', title: '🏁 First Run', description: 'Complete your first game', unlocked: false },
  { id: 'distance_100', title: '🏆 Marathon Starter', description: 'Travel 100 meters', unlocked: false },
  { id: 'distance_500', title: '🚀 Distance Master', description: 'Travel 500 meters', unlocked: false },
  { id: 'no_obstacle', title: '🛡️ Perfect Run', description: 'Complete a run without hitting obstacles', unlocked: false },
];

// Skins
const INITIAL_SKINS = [
  { id: 'default', name: 'Default Runner', unlocked: true },
  { id: 'ninja', name: 'Ninja Runner', unlocked: false, cost: 500 },
  { id: 'astronaut', name: 'Space Runner', unlocked: false, cost: 1000 },
];

export const GameContext = React.createContext();

export const GameProvider = ({ children }) => {
  // Game State
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [playStreak, setPlayStreak] = useState(0);
  const [achievements, setAchievements] = useState(INITIAL_ACHIEVEMENTS);
  const [coins, setCoins] = useState(0);
  const [skins, setSkins] = useState(INITIAL_SKINS);
  const [currentSkin, setCurrentSkin] = useState('default');

  // Load Progress
  useEffect(() => {
    loadGameProgress();
  }, []);

  // Save Progress on Changes
  useEffect(() => {
    saveGameProgress();
  }, [score, highScore, playStreak, achievements, coins, skins, currentSkin]);

  // Load Game Progress
  const loadGameProgress = async () => {
    try {
      const savedProgress = await AsyncStorage.getItem('gameProgress');
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setHighScore(progress.highScore || 0);
        setPlayStreak(progress.playStreak || 0);
        setAchievements(progress.achievements || INITIAL_ACHIEVEMENTS);
        setCoins(progress.coins || 0);
        setSkins(progress.skins || INITIAL_SKINS);
        setCurrentSkin(progress.currentSkin || 'default');
      }
    } catch (error) {
      console.error('Error loading game progress', error);
    }
  };

  // Save Game Progress
  const saveGameProgress = async () => {
    try {
      await AsyncStorage.setItem('gameProgress', JSON.stringify({
        highScore,
        playStreak,
        achievements,
        coins,
        skins,
        currentSkin
      }));
    } catch (error) {
      console.error('Error saving game progress', error);
    }
  };

  // Update Score and Game Stats
  const updateGameStats = (newScore, hitObstacle = false) => {
    // Haptic Feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    // Update High Score
    if (newScore > highScore) {
      setHighScore(newScore);
    }

    // Coin Calculation
    const coinsEarned = Math.floor(newScore / 10);
    setCoins(prev => prev + coinsEarned);

    // Achievement Checks
    const updatedAchievements = achievements.map(achievement => {
      switch (achievement.id) {
        case 'first_run':
          return { ...achievement, unlocked: true };
        case 'distance_100':
          return newScore >= 100 ? { ...achievement, unlocked: true } : achievement;
        case 'distance_500':
          return newScore >= 500 ? { ...achievement, unlocked: true } : achievement;
        case 'no_obstacle':
          return !hitObstacle ? { ...achievement, unlocked: true } : achievement;
        default:
          return achievement;
      }
    });

    setAchievements(updatedAchievements);
  };

  // Share Score - Using React Native's Share API directly
  const shareScore = async (scoreToShare = null) => {
    try {
      // Use provided score or fall back to high score
      const finalScore = scoreToShare !== null ? scoreToShare : highScore;
      
      // Create share message
      let message = `I just scored ${finalScore} points in Tap Dash! Can you beat my record? 🏆🎮`;
      
      // Add high score message if current score isn't the high score
      if (scoreToShare !== null && scoreToShare < highScore) {
        message += `\n(My high score is ${highScore} points!)`;
      }
      
      // Share using React Native's built-in Share API
      const result = await Share.share({
        message: message,
        title: 'Share Your Tap Dash Score'
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
          console.log(`Shared with: ${result.activityType}`);
        } else {
          // Shared
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing score', error);
      
      // Show a fallback alert if sharing fails
      Alert.alert(
        'Sharing Failed',
        'Unable to share your score. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Unlock Skin
  const unlockSkin = (skinId) => {
    const skinToUnlock = skins.find(skin => skin.id === skinId);
    
    if (skinToUnlock && coins >= skinToUnlock.cost) {
      const updatedSkins = skins.map(skin => 
        skin.id === skinId ? { ...skin, unlocked: true } : skin
      );
      
      setSkins(updatedSkins);
      setCoins(prev => prev - skinToUnlock.cost);
      setCurrentSkin(skinId);
      
      return true;
    }
    
    return false;
  };

  // Change Skin
  const changeSkin = (skinId) => {
    const skin = skins.find(s => s.id === skinId);
    if (skin && skin.unlocked) {
      setCurrentSkin(skinId);
      return true;
    }
    return false;
  };

  // Exposed Context Value
  const contextValue = {
    score,
    setScore,
    highScore,
    playStreak,
    achievements,
    coins,
    skins,
    currentSkin,
    updateGameStats,
    shareScore,
    unlockSkin,
    changeSkin
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = React.useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};