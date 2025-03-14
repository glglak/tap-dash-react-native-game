# Publishing Tap Dash to Google Play Store

This guide will walk you through the process of publishing your Tap Dash game to the Google Play Store.

## Prerequisites

1. A Google Play Developer account ($25 one-time fee)
2. A completed, tested, and ready-to-publish game
3. Graphic assets for store listing
4. Privacy policy (required even for free games)

## Step 1: Prepare Your Game Assets

Before publishing, prepare the following assets:

### Required Graphics
- **Icon**: High-resolution app icon (512x512px PNG)
- **Feature Graphic**: Used for Play Store feature section (1024x500px JPG/PNG)
- **Screenshots**: At least 2 screenshots of gameplay (16:9 recommended)
- **Promo Video**: Optional but recommended (YouTube link)

### Required Documents
- **Privacy Policy**: Create a privacy policy for your game (can host on GitHub Pages)
- **Content Rating Questionnaire**: Be prepared to answer questions about your game's content

## Step 2: Generate a Signed APK/AAB

1. **Update app.json**:
   - Change `"package": "com.yourusername.tapdash"` to your own package name
   - Increment `"versionCode"` each time you publish an update

2. **Generate Keystore** (if not already done):
   ```bash
   keytool -genkeypair -v -keystore tapdash-key.keystore -alias tapdash-alias -keyalg RSA -keysize 2048 -validity 10000
   ```
   - KEEP YOUR KEYSTORE SAFE! You cannot update your app without it.

3. **Create a build configuration**:
   Create a file called `eas.json` at the root of your project:
   ```json
   {
     "build": {
       "production": {
         "android": {
           "buildType": "app-bundle"
         }
       }
     }
   }
   ```

4. **Build the app bundle**:
   ```bash
   npx eas build --platform android
   ```

   Alternatively, using classic Expo build:
   ```bash
   expo build:android --type app-bundle
   ```

## Step 3: Create Your Google Play Listing

1. **Sign in** to your [Google Play Console](https://play.google.com/apps/publish/)
2. Click **Create app**
3. Enter basic details:
   - App name: "Tap Dash"
   - Default language
   - Free or paid
   - App or game: "Game"
   - Category: "Arcade" or "Casual"
4. Fill out **Store listing**:
   - Short description (80 chars max)
   - Full description (up to 4000 chars)
   - Upload graphics assets
   - Add contact details
5. Set up **Content rating**:
   - Complete the questionnaire
6. Set up **Pricing & distribution**:
   - Choose countries to distribute in
   - Confirm compliance with US export laws
   - Confirm app adheres to Play policies

## Step 4: Upload Your App Bundle

1. Go to **Release > Production**
2. Click **Create new release**
3. **Upload** the AAB file you generated
4. Fill out release notes
5. Review and rollout

## Step 5: Publish!

1. After completing all sections, your app will be ready for review
2. Click **Submit for review**
3. Wait for Google to review your submission (typically 1-3 days)
4. Once approved, your game will be live on the Play Store!

## Updating Your Game

When you need to update your game:

1. Make changes to your code
2. Increment the `versionCode` in app.json
3. Generate a new build
4. Create a new release in the Play Console
5. Upload the new AAB file
6. Add release notes describing what's new
7. Submit for review

## Tips for Success

- **Optimize your store listing** with good screenshots and an engaging description
- **Respond to user feedback** and fix bugs promptly
- **Regular updates** keep your game relevant and improve store ranking
- **Consider monetization** options like ads or in-app purchases
- **Promote your game** on social media and gaming forums

## Sound Files

For this game to work properly, you need to add sound files in the `assets/sounds/` directory:

1. `background.mp3` - Background music for the game
2. `jump.mp3` - Sound effect when the character jumps
3. `score.mp3` - Sound effect when scoring points
4. `game-over.mp3` - Sound effect when the game ends

**Free sound resources**:
- [Freesound](https://freesound.org/)
- [Pixabay](https://pixabay.com/sound-effects/)
- [OpenGameArt](https://opengameart.org/)

## Need Help?

If you encounter issues during the publishing process, you can:
- Check the [Expo documentation](https://docs.expo.dev/distribution/uploading-apps/)
- Search the [React Native community forums](https://reactnative.dev/community)
- Check [Google Play Console Help](https://support.google.com/googleplay/android-developer/)