import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const generationConfig = {
  temperature: 0.2,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Helper to convert file to base64
async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

export async function analyzeAbgReport(file: File) {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  if (!API_KEY) {
    throw new Error("Gemini API key is not configured. This feature is unavailable.");
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  
  const filePart = await fileToGenerativePart(file);
  
  const prompt = `
    Analyze the provided Arterial Blood Gas (ABG) report image or text.
    Extract the following values and return them in a single, flat JSON object:
    - ph (number)
    - paco2 (number)
    - hco3 (number)
    - pao2 (number)
    - fio2 (number, default to 0.21 if not present)
    - na (number, for sodium)
    - cl (number, for chloride)
    - name (string, for patient name)
    - age (string)
    - mrn (string, for medical record number)
    - hospital (string)

    If a value is not present in the report, omit it from the JSON object, except for fio2.
    The JSON keys must be exactly as listed above (e.g., "paco2", not "PaCO2").
    Do not include any other text, explanations, or markdown formatting in your response.
    Only return the JSON object.
  `;

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [filePart, { text: prompt }] }],
        generationConfig,
        safetySettings,
      });

      const responseText = result.response.text();
      try {
        const jsonString = responseText.replace(/```json\n?|```/g, '').trim();
        return JSON.parse(jsonString); // Success!
      } catch (e) {
        console.error("Failed to parse Gemini response:", responseText);
        throw new Error("AI failed to return a valid report. The format might be unsupported.");
      }
    } catch (error: any) {
      const isOverloaded = error.message && (error.message.includes('503') || error.message.includes('overloaded'));
      
      if (isOverloaded && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 500; // 1s, 2s
        console.warn(`AI model is overloaded. Retrying in ${delay / 1000}s... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        if (isOverloaded) {
          throw new Error("The AI model is still overloaded after several retries. Please try again later.");
        }
        throw error;
      }
    }
  }
  throw new Error("AI analysis failed after multiple attempts.");
}