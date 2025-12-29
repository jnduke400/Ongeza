
import { GoogleGenAI } from "@google/genai";
import { LoanApplication } from '../types';

// FIX: Initialized GoogleGenAI with process.env.API_KEY directly as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePortfolioSummary = async (loans: LoanApplication[]): Promise<string> => {
  // FIX: Removed manual API_KEY check to rely on the environment as a hard requirement.

  const prompt = `
    Analyze the following loan portfolio for a micro-lending platform in Tanzania. Provide a concise summary for a platform administrator.

    The portfolio consists of these loan applications:
    ${JSON.stringify(loans, null, 2)}

    Your summary should cover these points:
    1.  **Overall Portfolio Health:** A brief, one-sentence assessment.
    2.  **Total Amount Requested:** Sum of all loan amounts.
    3.  **Funding Status Breakdown:** Count of loans that are 'Pending', 'Funded', and 'Rejected'.
    4.  **Credit Score Analysis:** Mention the average credit score and any potential risks associated with low-scoring applications.
    5.  **Key Recommendation:** Suggest one strategic action for the administrator (e.g., "Focus on funding high-credit-score business loans," or "Review rejected applications for potential.").

    Present the output as a clean, readable text summary. Do not use markdown formatting.
  `;

  try {
    // FIX: Updated model to 'gemini-3-flash-preview' for basic text tasks and accessed .text property directly.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "No summary was generated.";
  } catch (error) {
    console.error("Error generating portfolio summary with Gemini:", error);
    return "An error occurred while generating the portfolio summary. Please check the console for details.";
  }
};
