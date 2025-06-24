# PeakPlay AI Scorecard Analysis Setup

## Overview

The PeakPlay PWA includes an AI-powered scorecard analysis feature that allows athletes to upload cricket scorecard images and automatically extract match statistics using OpenAI's Vision API.

## Features

- **Smart Player Detection**: Automatically identifies all players in the scorecard
- **Player Verification**: Two-step verification system to ensure correct player identification
- **Comprehensive Stats Extraction**: Batting, bowling, and fielding statistics
- **Confidence Scoring**: AI provides confidence levels for extracted data
- **Multiple Player Support**: Handles scorecards with multiple players
- **Beautiful PWA Interface**: Mobile-optimized with smooth animations

## Setup Instructions

### 1. OpenAI API Key Configuration

To enable the scorecard analysis feature, you need an OpenAI API key:

1. **Get an OpenAI API Key**:
   - Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Sign up or log in to your account
   - Create a new API key
   - Copy the key (starts with `sk-...`)

2. **Add to Environment Variables**:
   Create or update your `.env.local` file in the project root:
   ```env
   OPENAI_API_KEY="sk-your-actual-api-key-here"
   ```

3. **Restart the Development Server**:
   ```bash
   npm run dev
   ```

### 2. Testing the Feature

1. **Sign in as an athlete** to the PeakPlay dashboard
2. **Navigate to Recent Match Scores** section
3. **Click the "Add Match" dropdown** and select "Upload Scorecard"
4. **Upload a cricket scorecard image** (JPG, PNG, up to 10MB)
5. **Click "Analyze Scorecard with AI"**

### 3. User Flow

#### Single Player Scorecard
1. Upload image → AI analyzes → Results displayed → Use results

#### Multiple Players Scorecard
1. Upload image → AI analyzes → Player selection modal → Choose player → Results displayed → Use results

#### Player Verification
1. Upload image → AI analyzes → Player verification modal → Confirm identity → Results displayed → Use results

## Supported Scorecard Types

- **Digital scorecards** from cricket apps (CricHQ, CricketStatz, etc.)
- **Printed scorecards** with clear text
- **Tournament scorecards** with detailed statistics
- **Practice match scorecards**

## Error Handling

The system gracefully handles various scenarios:

- **No API Key**: Shows helpful message to contact administrator
- **Network Issues**: Suggests checking internet connection
- **Invalid Images**: Prompts for valid image files
- **Large Files**: Enforces 10MB limit
- **AI Analysis Failure**: Provides manual entry option

## Technical Details

- **AI Model**: GPT-4o-mini with vision capabilities
- **Image Processing**: Base64 encoding for API transmission
- **Response Format**: Structured JSON with validation
- **Confidence Scoring**: 0-100% based on image clarity
- **Player Detection**: Fuzzy matching for name variations

## Troubleshooting

### Common Issues

1. **"AI analysis is not configured"**
   - Check that `OPENAI_API_KEY` is set in `.env.local`
   - Restart the development server

2. **"Network error"**
   - Check internet connection
   - Verify OpenAI API key is valid

3. **"Analysis Failed" (0% confidence)**
   - Try a clearer image
   - Ensure the image contains a cricket scorecard
   - Check if image is rotated correctly

4. **Wrong player detected**
   - Use the player verification system
   - Select different player from available options
   - Upload a clearer image with better name visibility

### Best Practices for Scorecard Images

- **High resolution** images work better
- **Good lighting** and contrast
- **Straight orientation** (not rotated)
- **Clear text** without blur or distortion
- **Full scorecard** visible in the frame

## Manual Fallback

If AI analysis fails, users can always:
1. Click "Cancel" or "Use Manual Entry"
2. Enter match statistics manually
3. Save the match normally

## Security

- API keys are server-side only
- Images are processed temporarily and not stored
- All data validation happens on both client and server
- User authentication required for all operations

## Cost Considerations

- OpenAI Vision API charges per image analysis
- Typical cost: ~$0.01-0.02 per scorecard
- Consider usage limits for production deployment
- Monitor API usage through OpenAI dashboard

## Future Enhancements

- Support for video scorecard analysis
- Batch upload for multiple matches
- Integration with popular cricket apps
- Offline analysis capabilities
- Custom model training for better accuracy

---

**Note**: This feature enhances the user experience but is completely optional. The entire PeakPlay application works perfectly without the AI scorecard analysis feature. 