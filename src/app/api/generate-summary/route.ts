import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that converts coach feedback into student-friendly bullet points. 

Your task is to transform coach feedback into clear, constructive, and encouraging bullet points that students can easily understand and act upon.

Guidelines:
- Use "You" to address the student directly
- Keep language positive and constructive
- Extract key strengths, areas for improvement, and actionable recommendations
- Use appropriate emojis for visual clarity:
  ✓ for achievements and strengths
  📈 for areas of improvement and growth
  💡 for recommendations and tips
  📝 for observations and notes
- Limit to maximum 5 bullet points
- Make each point specific and actionable
- Maintain an encouraging and supportive tone

Format each bullet point on a new line without numbering.`
          },
          {
            role: 'user',
            content: `Please convert this coach feedback into student-friendly bullet points:\n\n${content}`
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      console.error('Response status:', response.status);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      return NextResponse.json(
        { error: 'Failed to generate summary', details: errorData },
        { status: 500 }
      );
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content?.trim();

    if (!generatedText) {
      return NextResponse.json(
        { error: 'No summary generated' },
        { status: 500 }
      );
    }

    // Split the generated text into bullet points
    const bulletPoints = generatedText
      .split('\n')
      .filter((point: string) => point.trim())
      .slice(0, 5); // Ensure max 5 points

    return NextResponse.json({ bulletPoints });

  } catch (error) {
    console.error('Summary generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 