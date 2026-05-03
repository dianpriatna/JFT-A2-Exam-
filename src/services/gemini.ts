import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || "");

export async function getExplanation(question: string, selectedAnswer: string, correctAnswer: string, context?: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    You are a Japanese language teacher specializing in JFT-A2 exams.
    A student answered a question incorrectly or wants more details.
    
    Context: ${context || 'N/A'}
    Question: ${question}
    Selected Answer: ${selectedAnswer}
    Correct Answer: ${correctAnswer}
    
    Provide a clear, encouraging explanation in English about why the correct answer is right and why the other options (especially the selected one) might be wrong or used in different contexts. 
    Focus on A2 level grammar and vocabulary.
    Keep it concise but helpful.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not fetch AI explanation at this time.";
  }
}
