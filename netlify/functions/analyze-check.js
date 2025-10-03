/**
 * Netlify Function: analyze-check
 *
 * This serverless function securely handles OpenAI API calls for check image analysis.
 * The API key is stored in environment variables and never exposed to the client.
 */

export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Enable CORS for your domain
  const headers = {
    'Access-Control-Allow-Origin': '*', // In production, replace with your specific domain
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const { base64Image } = JSON.parse(event.body);

    if (!base64Image) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No image provided' }),
      };
    }

    // Get API key from environment variable (set in Netlify dashboard)
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    // Make the OpenAI API call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant specialized in analyzing check images.
            Your task is to carefully extract two key pieces of information:
            1. The check number (usually found in the top-right corner)
            2. The payee name (text that appears after "Pay to the order of")

            Analyze the image thoroughly, looking for these specific elements.
            If the check number is unclear, look for other identifying numbers on the check.
            If the payee name is partially visible, extract what you can see clearly.

            Return ONLY the extracted information in JSON format:
            {
              "checkNumber": "1234",
              "checkName": "John Smith"
            }`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract the check number and payee name from this check image.' },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);

      // Don't expose the actual error details to the client
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: 'Failed to analyze image',
          message: response.status === 401 ? 'API authentication failed' : 'OpenAI service error'
        }),
      };
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        checkNumber: result.checkNumber,
        checkName: result.checkName,
      }),
    };

  } catch (error) {
    console.error('Function error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process the request'
      }),
    };
  }
};