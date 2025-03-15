#!/bin/bash
# Easy build script for Tap Dash game

# Color codes for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Tap Dash Game Build Helper ===${NC}"
echo ""

# Check for required tools
check_command() {
  command -v $1 >/dev/null 2>&1 || { 
    echo -e "${RED}$1 is required but not installed. Please install it first.${NC}" >&2
    exit 1
  }
}

check_command node
check_command npm

# Check if eas-cli is installed
if ! command -v eas >/dev/null 2>&1; then
  echo -e "${YELLOW}EAS CLI not found. Installing it globally...${NC}"
  npm install -g eas-cli
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
fi

# Make sure our enhanced patch script has been run
echo -e "${YELLOW}Running Gradle plugin patch...${NC}"
node ./gradle-plugin-patch.js

# Ensure gradlew is executable
if [ -f "android/gradlew" ]; then
  echo -e "${YELLOW}Making gradlew executable...${NC}"
  chmod +x android/gradlew
fi

echo ""
echo -e "${GREEN}Choose a build option:${NC}"
echo "1) Development Build (for local testing)"
echo "2) Preview Build (internal APK distribution)"
echo "3) Production Build (for Google Play)"
echo "4) Clean project and rebuild"
echo "5) Exit"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
  1)
    echo -e "${BLUE}Starting development build...${NC}"
    echo -e "${YELLOW}This will create a development build you can install and use with Expo Dev Client.${NC}"
    eas build --profile development --platform android
    ;;
  2)
    echo -e "${BLUE}Starting preview build...${NC}"
    echo -e "${YELLOW}This will create a standalone APK you can share with others.${NC}"
    eas build --profile preview --platform android
    ;;
  3)
    echo -e "${BLUE}Starting production build...${NC}"
    echo -e "${YELLOW}This will create a production-ready AAB for Google Play submission.${NC}"
    eas build --profile production --platform android
    ;;
  4)
    echo -e "${BLUE}Cleaning project...${NC}"
    # Clean node_modules
    echo -e "${YELLOW}Removing node_modules...${NC}"
    rm -rf node_modules
    
    # Clean Android build files if they exist
    if [ -d "android" ]; then
      echo -e "${YELLOW}Cleaning Android build files...${NC}"
      if [ -f "android/gradlew" ]; then
        cd android && ./gradlew clean && cd ..
      fi
    fi
    
    # Clean .expo directory
    if [ -d ".expo" ]; then
      echo -e "${YELLOW}Cleaning .expo directory...${NC}"
      rm -rf .expo
    fi
    
    # Reinstall
    echo -e "${YELLOW}Reinstalling dependencies...${NC}"
    npm install
    
    echo -e "${GREEN}Project cleaned. Now choose a build option:${NC}"
    echo "1) Development Build"
    echo "2) Preview Build"
    echo "3) Production Build"
    echo "4) Exit"
    
    read -p "Enter your choice (1-4): " rebuild_choice
    
    case $rebuild_choice in
      1)
        eas build --profile development --platform android
        ;;
      2)
        eas build --profile preview --platform android
        ;;
      3)
        eas build --profile production --platform android
        ;;
      *)
        echo -e "${GREEN}Exiting after cleanup.${NC}"
        ;;
    esac
    ;;
  *)
    echo -e "${GREEN}Exiting.${NC}"
    ;;
esac

echo -e "${GREEN}Build process complete!${NC}"
echo -e "${BLUE}If you encounter any issues, please check the setup-guide.md file.${NC}"
