import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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

  // Share Score
  const shareScore = async () => {
    try {
      const message = `I just scored ${highScore} points in Tap Dash! Can you beat my record? 🏆🎮`;
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(message, {
          dialogTitle: 'Share Your Tap Dash Score',
          mimeType: 'text/plain'
        });
      }
    } catch (error) {
      console.error('Error sharing score', error);
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