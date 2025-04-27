import { OPENROUTER_CONFIG } from '../utils/constants';

// Function to recognize expense from text using OpenRouter API
export const recognizeExpenseFromText = async (text, apiKey) => {
  try {
    if (!text || !apiKey) {
      throw new Error('Text and API key are required');
    }

    const response = await fetch(OPENROUTER_CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://finance-ai-app.com', // Replace with your actual domain in production
        'X-Title': 'Finance AI App'
      },
      body: JSON.stringify({
        model: OPENROUTER_CONFIG.MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that extracts expense information from text. 
            Extract the following information:
            1. Amount (in numbers)
            2. Category (one of: Food, Transport, Shopping, Entertainment, Bills, Health, Education, Other)
            3. Description (brief description of the expense)
            
            Respond in JSON format only with these fields: amount, category, description.
            If any field cannot be determined, use null for that field.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to recognize expense');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in response');
    }

    // Parse the JSON response
    try {
      const parsedContent = JSON.parse(content);
      return {
        amount: parsedContent.amount,
        category: parsedContent.category,
        description: parsedContent.description
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid response format from AI');
    }
  } catch (error) {
    console.error('Error recognizing expense:', error);
    throw error;
  }
};
