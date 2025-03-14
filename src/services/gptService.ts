/**
 * GPT-4o Service
 * 
 * This service handles interactions with the OpenAI API for GPT-4o image analysis.
 * In a production environment, these API calls should be made from a backend server
 * to protect your API keys.
 */

import { ImageAnalysisResult } from '../types';

// Get the OpenAI API key from environment variables
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

/**
 * Analyzes a check image using GPT-4o to extract check number and payee name
 * 
 * @param imageFile The check image file to analyze
 * @returns Promise with the analysis result
 */
export const analyzeCheckImage = async (imageFile: File): Promise<ImageAnalysisResult> => {
  // Create a URL for the image to display in the UI
  const imageUrl = URL.createObjectURL(imageFile);
  
  try {
    // Convert image to base64 for the API
    const base64Image = await fileToBase64(imageFile);
    
    // Use the OpenAI API to analyze the image
    const result = await analyzeWithOpenAI(base64Image);
    
    return {
      ...result,
      imageUrl
    };
  } catch (error) {
    console.error('Error analyzing check image:', error);
    throw new Error('Failed to analyze check image: ' + (error instanceof Error ? error.message : String(error)));
  }
};

/**
 * Converts a File object to a base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Content = base64String.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Analyzes a check image using the OpenAI API with GPT-4o
 */
const analyzeWithOpenAI = async (base64Image: string): Promise<{ checkNumber: string, checkName: string }> => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is missing. Please add it to your .env file as VITE_OPENAI_API_KEY.');
    }

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
      throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    // Parse the JSON response
    const result = JSON.parse(data.choices[0].message.content);
    return { 
      checkNumber: result.checkNumber, 
      checkName: result.checkName 
    };
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error('Failed to analyze with OpenAI: ' + (error instanceof Error ? error.message : String(error)));
  }
};

export default {
  analyzeCheckImage
}; 