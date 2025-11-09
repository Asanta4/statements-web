// Test script to validate OpenAI API key
import fetch from 'node-fetch';

// Get the API key from Netlify environment
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function testAPIKey() {
  console.log('Testing OpenAI API key...\n');

  if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable is not set!');
    process.exit(1);
  }

  // Mask the API key for display
  const maskedKey = OPENAI_API_KEY.substring(0, 7) + '...' + OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 4);
  console.log(`🔑 API Key found: ${maskedKey}\n`);

  try {
    // Test the API key with a simple models list request
    console.log('Testing API key with OpenAI models endpoint...');
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Key is VALID!\n');
      console.log(`📊 Available models: ${data.data.length}`);

      // Check if GPT-4o is available
      const hasGPT4o = data.data.some(model => model.id.includes('gpt-4o'));
      if (hasGPT4o) {
        console.log('✅ GPT-4o model is available!');
      } else {
        console.log('⚠️  GPT-4o model not found in available models');
        console.log('Available GPT models:', data.data
          .filter(m => m.id.includes('gpt'))
          .map(m => m.id)
          .slice(0, 5)
          .join(', '));
      }

      // Test with a simple completion
      console.log('\nTesting GPT-4o with a simple request...');
      const testResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: 'Say "API test successful" if you can read this.'
            }
          ],
          max_tokens: 10
        })
      });

      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('✅ GPT-4o test successful!');
        console.log(`Response: ${testData.choices[0].message.content}`);
      } else {
        const error = await testResponse.json();
        console.error('❌ GPT-4o test failed:', error);
      }

    } else {
      const error = await response.json();
      console.error('❌ API Key is INVALID!\n');
      console.error('Error:', error.error?.message || error);

      if (response.status === 401) {
        console.error('\n🔒 This usually means:');
        console.error('  - The API key is incorrect');
        console.error('  - The API key has been revoked');
        console.error('  - The API key format is wrong');
      }
    }

  } catch (error) {
    console.error('❌ Failed to test API key:', error.message);
  }
}

testAPIKey();