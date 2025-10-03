/**
 * GPT-4o Service
 *
 * This service handles interactions with the OpenAI API for GPT-4o image analysis.
 * API calls are routed through a Netlify Function to protect the API key.
 */

import { ImageAnalysisResult } from '../types';

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
    // Remove API key from error message before logging
    const errorMessage = error instanceof Error ? error.message : String(error);
    const safeErrorMessage = errorMessage.replace(/sk-[a-zA-Z0-9_-]+/g, 'sk-***');
    console.error('Error analyzing check image:', safeErrorMessage);
    throw new Error('Failed to analyze check image: ' + safeErrorMessage);
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
 * Analyzes a check image using the Netlify Function (which calls OpenAI API securely)
 */
const analyzeWithOpenAI = async (base64Image: string): Promise<{ checkNumber: string, checkName: string }> => {
  try {
    // Determine the API endpoint based on environment
    const functionEndpoint = process.env.NODE_ENV === 'development'
      ? 'http://localhost:8888/.netlify/functions/analyze-check'
      : '/.netlify/functions/analyze-check';

    const response = await fetch(functionEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Image
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Analysis failed: ${errorData.message || errorData.error || 'Unknown error'}`);
    }

    const result = await response.json();
    return {
      checkNumber: result.checkNumber,
      checkName: result.checkName
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error calling analysis function:', errorMessage);
    throw new Error('Failed to analyze check image: ' + errorMessage);
  }
};

export default {
  analyzeCheckImage
}; 