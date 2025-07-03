import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is an athlete
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user || session.user.role !== "ATHLETE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("scorecard") as File;
    const targetPlayerName = formData.get("targetPlayerName") as string | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: "Please upload an image file" }, { status: 400 });
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size too large. Please upload an image under 10MB" }, { status: 400 });
    }

    // Convert file to base64 for AI analysis
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Analyze the scorecard using OpenAI Vision API
    const analysisResult = await analyzeScorecard(base64Image, targetPlayerName || undefined);
    
    return NextResponse.json(analysisResult, { status: 200 });
  } catch (error) {
    console.error("Error analyzing scorecard:", error);
    return NextResponse.json(
      { error: "Failed to analyze scorecard. Please try again." },
      { status: 500 }
    );
  }
}

async function analyzeScorecard(base64Image: string, targetPlayerName?: string) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not configured");
      return createFallbackResponse("OpenAI API key not configured. Please check your environment variables.");
    }

    // Enhanced prompt for cricket scorecard analysis
    const playerIdentificationPrompt = targetPlayerName 
      ? `Focus specifically on extracting statistics for the player named "${targetPlayerName}". If this exact player is not found, look for similar names or variations.`
      : `First, identify ALL player names visible in this scorecard. Then extract statistics for the player with the most complete batting, bowling, or fielding statistics.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are an expert cricket scorecard analyzer. Analyze this cricket scorecard image and extract detailed information in JSON format.

                ${playerIdentificationPrompt}

                CRICKET SCORECARD ANALYSIS GUIDELINES:
                - Look for batting statistics: runs, balls faced, 4s, 6s, strike rate, not out status
                - Look for bowling statistics: overs bowled, maidens, runs conceded, wickets taken, economy rate, wides, no-balls
                - Look for fielding statistics: catches, run-outs, stumpings
                - Identify team names, match details, venue, date if visible
                - Look for player names in batting order, bowling figures, or fielding positions

                Return the data in this EXACT JSON format (no additional text):
                {
                  "availablePlayers": ["player1", "player2", "player3"],
                  "selectedPlayer": "string",
                  "matchDetails": {
                    "matchName": "string",
                    "opponent": "string", 
                    "venue": "string",
                    "matchDate": "YYYY-MM-DD",
                    "matchType": "PRACTICE|TOURNAMENT|FRIENDLY",
                    "result": "WIN|LOSS|DRAW|ABANDONED"
                  },
                  "playerStats": {
                    "batting": {
                      "runs": number,
                      "balls": number,
                      "fours": number,
                      "sixes": number,
                      "dots": number,
                      "notOut": boolean,
                      "strikeRate": number
                    },
                    "bowling": {
                      "wickets": number,
                      "overs": number,
                      "maidens": number,
                      "runs": number,
                      "wides": number,
                      "noBalls": number,
                      "economyRate": number
                    },
                    "fielding": {
                      "catches": number,
                      "runOuts": number,
                      "stumpings": number
                    }
                  },
                  "confidence": number,
                  "notes": "string"
                }
                
                IMPORTANT RULES:
                1. List ALL visible player names in "availablePlayers" array
                2. Set "selectedPlayer" to the name of the player whose stats you extracted
                3. If batting stats are present, calculate strike rate as (runs/balls)*100
                4. If bowling stats are present, calculate economy rate as runs/overs
                5. Set confidence based on how clearly you can read the scorecard (0-100)
                6. Use 0 for missing numeric values, false for missing boolean values
                7. Be specific about which player's stats you're extracting in the notes
                8. If the image is unclear or not a cricket scorecard, set confidence to 0`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorText}`);
      return createFallbackResponse(`OpenAI API error: ${response.status}. Please try again.`);
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content;
    
    if (!content) {
      console.error("No content received from OpenAI");
      return createFallbackResponse("No response received from AI. Please try again.");
    }

    // Clean the content to extract JSON
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    // Parse the JSON response
    let parsedData;
    try {
      parsedData = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.error("Raw content:", content);
      return createFallbackResponse("Failed to parse AI response. Please try again with a clearer image.");
    }
    
    // Validate and clean the data
    return validateAndCleanData(parsedData);
    
  } catch (error) {
    console.error("Error in AI analysis:", error);
    return createFallbackResponse("AI analysis failed. Please check your internet connection and try again.");
  }
}

function createFallbackResponse(errorMessage: string) {
  return {
    availablePlayers: [],
    selectedPlayer: "Unknown Player",
    matchDetails: {
      matchName: "Uploaded Scorecard Match",
      opponent: "Unknown Opponent",
      venue: "Unknown Venue",
      matchDate: new Date().toISOString().split('T')[0],
      matchType: "PRACTICE",
      result: "WIN"
    },
    playerStats: {
      batting: {
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        dots: 0,
        notOut: false,
        strikeRate: 0
      },
      bowling: {
        wickets: 0,
        overs: 0,
        maidens: 0,
        runs: 0,
        wides: 0,
        noBalls: 0,
        economyRate: 0
      },
      fielding: {
        catches: 0,
        runOuts: 0,
        stumpings: 0
      }
    },
    confidence: 0,
    notes: errorMessage,
    error: errorMessage
  };
}

function validateAndCleanData(data: any) {
  // Ensure all required fields exist with proper defaults
  const cleanData = {
    availablePlayers: Array.isArray(data.availablePlayers) ? data.availablePlayers : [],
    selectedPlayer: data.selectedPlayer || "Unknown Player",
    matchDetails: {
      matchName: data.matchDetails?.matchName || "Scorecard Match",
      opponent: data.matchDetails?.opponent || "Unknown Opponent", 
      venue: data.matchDetails?.venue || "Unknown Venue",
      matchDate: data.matchDetails?.matchDate || new Date().toISOString().split('T')[0],
      matchType: data.matchDetails?.matchType || "PRACTICE",
      result: data.matchDetails?.result || "WIN"
    },
    playerStats: {
      batting: {
        runs: Math.max(0, Number(data.playerStats?.batting?.runs) || 0),
        balls: Math.max(0, Number(data.playerStats?.batting?.balls) || 0),
        fours: Math.max(0, Number(data.playerStats?.batting?.fours) || 0),
        sixes: Math.max(0, Number(data.playerStats?.batting?.sixes) || 0),
        dots: Math.max(0, Number(data.playerStats?.batting?.dots) || 0),
        notOut: Boolean(data.playerStats?.batting?.notOut),
        strikeRate: Math.max(0, Number(data.playerStats?.batting?.strikeRate) || 0)
      },
      bowling: {
        wickets: Math.max(0, Number(data.playerStats?.bowling?.wickets) || 0),
        overs: Math.max(0, Number(data.playerStats?.bowling?.overs) || 0),
        maidens: Math.max(0, Number(data.playerStats?.bowling?.maidens) || 0),
        runs: Math.max(0, Number(data.playerStats?.bowling?.runs) || 0),
        wides: Math.max(0, Number(data.playerStats?.bowling?.wides) || 0),
        noBalls: Math.max(0, Number(data.playerStats?.bowling?.noBalls) || 0),
        economyRate: Math.max(0, Number(data.playerStats?.bowling?.economyRate) || 0)
      },
      fielding: {
        catches: Math.max(0, Number(data.playerStats?.fielding?.catches) || 0),
        runOuts: Math.max(0, Number(data.playerStats?.fielding?.runOuts) || 0),
        stumpings: Math.max(0, Number(data.playerStats?.fielding?.stumpings) || 0)
      }
    },
    confidence: Math.min(100, Math.max(0, Number(data.confidence) || 0)),
    notes: data.notes || "Scorecard analyzed successfully"
  };

  // Calculate strike rate if not provided and we have runs and balls
  if (cleanData.playerStats.batting.runs > 0 && cleanData.playerStats.batting.balls > 0 && cleanData.playerStats.batting.strikeRate === 0) {
    cleanData.playerStats.batting.strikeRate = Math.round((cleanData.playerStats.batting.runs / cleanData.playerStats.batting.balls) * 100 * 100) / 100;
  }

  // Calculate economy rate if not provided and we have runs and overs
  if (cleanData.playerStats.bowling.runs > 0 && cleanData.playerStats.bowling.overs > 0 && cleanData.playerStats.bowling.economyRate === 0) {
    cleanData.playerStats.bowling.economyRate = Math.round((cleanData.playerStats.bowling.runs / cleanData.playerStats.bowling.overs) * 100) / 100;
  }

  return cleanData;
} 