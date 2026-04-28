import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export async function analyzeProduceCondition(base64Image: string, produceType: string) {
  const model = "gemini-1.5-flash";
  
  const prompt = `Analyze this image of ${produceType}. 
  Identify the exact produce type seen in the image to verify against the label '${produceType}'.
  Provide a spoilage score from 0 to 10 (0 being perfectly fresh, 10 being completely spoiled/rotten).
  Estimate the remaining shelf life in days.
  Identify the risk level (Low, Medium, High).
  Provide brief analysis notes identifying any visible signs of spoilage (mold, bruising, discoloration, dehydration).
  Provide a specific 'reroutingDecision' based on the condition (e.g., 'Proceed to distant market', 'Reroute to nearest local market', 'Immediate salvage', 'Dispose').
  
  Return the result in JSON format.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: base64Image.split(',')[1] || base64Image,
              mimeType: "image/jpeg"
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          identifiedProduceType: { type: Type.STRING },
          spoilageScore: { type: Type.NUMBER },
          predictedShelfLife: { type: Type.STRING },
          riskLevel: { type: Type.STRING, description: "Low, Medium, or High" },
          analysisNotes: { type: Type.STRING },
          reroutingDecision: { type: Type.STRING }
        },
        required: ["identifiedProduceType", "spoilageScore", "predictedShelfLife", "riskLevel", "analysisNotes", "reroutingDecision"]
      }
    }
  });

  const resultText = response.text;
  if (!resultText) throw new Error("AI analysis failed: No response text.");
  
  return JSON.parse(resultText);
}

export async function predictSpoilage(data: {
  cropType: string,
  handoffPoint: string,
  temperature: number,
  humidity: number,
  hoursInTransit: number
}) {
  const model = "gemini-1.5-flash";
  
  const prompt = `Analyze the potential spoilage risk for a batch in the supply chain:
  Crop Type: ${data.cropType}
  Current Handoff Point: ${data.handoffPoint}
  Average Temperature: ${data.temperature}°C
  Humidity: ${data.humidity}%
  Hours already in Transit: ${data.hoursInTransit} hours

  Predict the spoilage risk percentage (0-100%).
  Estimate the monetary loss value in Indian Rupees (₹) if this trend continues (assume bulk volume).
  Identify the risk level (Low, Medium, High).
  Provide a specific strategic 'decision' (e.g., 'Expedite delivery', 'Switch to cold storage', 'Reroute to local market').
  Provide a unique 'biologicalInsight' - a technical or fun fact about why this specific crop is reacting this way to these specific conditions (e.g., 'Ethylene sensitivity in tomatoes increases 2x for every 5 degree rise').
  
  Return the result in JSON format.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          spoilageRate: { type: Type.NUMBER },
          estimatedLoss: { type: Type.STRING },
          riskLevel: { type: Type.STRING, description: "Low, Medium, or High" },
          decision: { type: Type.STRING },
          biologicalInsight: { type: Type.STRING }
        },
        required: ["spoilageRate", "estimatedLoss", "riskLevel", "decision", "biologicalInsight"]
      }
    }
  });

  const resultText = response.text;
  if (!resultText) throw new Error("AI prediction failed: No response text.");
  
  return JSON.parse(resultText);
}
