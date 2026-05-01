const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"; // free vision model

async function callGroq(messages: object[]) {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      response_format: { type: "json_object" },
      max_tokens: 1000
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Groq API error");
  return data.choices[0].message.content;
}

export async function analyzeProduceCondition(base64Image: string, produceType: string) {
  const prompt = `Analyze this image of ${produceType}. 
  Identify the exact produce type seen in the image to verify against the label '${produceType}'.
  Provide a spoilage score from 0 to 10 (0 being perfectly fresh, 10 being completely spoiled/rotten).
  Estimate the remaining shelf life in days.
  Identify the risk level (Low, Medium, High).
  Provide brief analysis notes identifying any visible signs of spoilage (mold, bruising, discoloration, dehydration).
  Provide a specific 'reroutingDecision' based on the condition (e.g., 'Proceed to distant market', 'Reroute to nearest local market', 'Immediate salvage', 'Dispose').
  
  Return ONLY a JSON object with these exact keys:
  identifiedProduceType, spoilageScore, predictedShelfLife, riskLevel, analysisNotes, reroutingDecision`;

  const messages = [
    {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: {
            url: base64Image.startsWith("data:")
              ? base64Image
              : `data:image/jpeg;base64,${base64Image}`
          }
        },
        { type: "text", text: prompt }
      ]
    }
  ];

  const resultText = await callGroq(messages);
  return JSON.parse(resultText);
}

export async function predictSpoilage(data: {
  cropType: string;
  handoffPoint: string;
  temperature: number;
  humidity: number;
  hoursInTransit: number;
}) {
  const prompt = `Analyze the potential spoilage risk for a batch in the supply chain:
  Crop Type: ${data.cropType}
  Current Handoff Point: ${data.handoffPoint}
  Average Temperature: ${data.temperature}°C
  Humidity: ${data.humidity}%
  Hours already in Transit: ${data.hoursInTransit} hours

  Return ONLY a JSON object with these exact keys:
  spoilageRate (number 0-100), estimatedLoss (string in Indian Rupees ₹), 
  riskLevel (Low/Medium/High), decision (string), biologicalInsight (string)`;

  const messages = [
    { role: "user", content: prompt }
  ];

  const resultText = await callGroq(messages);
  return JSON.parse(resultText);
}
