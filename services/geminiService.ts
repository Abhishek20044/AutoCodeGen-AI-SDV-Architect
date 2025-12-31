
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedAsset } from "../types";

export const generateAutomotiveSoA = async (prompt: string): Promise<GeneratedAsset> => {
  // Always create a new instance inside the function as per best practices for up-to-date API keys
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a complete automotive Service-Oriented Architecture (SoA) asset for the following feature: "${prompt}". 
      The output must comply with ISO 26262 and MISRA standards. 
      Include:
      1. Detailed functional and safety requirements.
      2. Architectural system design.
      3. A DETAILED Mermaid.js Class Diagram. 
         - Use visibility modifiers: + (public), - (private), # (protected).
         - Include attribute types (e.g., -speed: float).
         - Include full method signatures with parameters and return types (e.g., +calculateBrakingForce(distance: float): float).
         - Show relationships like inheritance, composition, and dependency.
      4. A Mermaid.js Sequence Diagram representing the message/signal flow between services.
      5. Production-ready source code (C++ and Rust).
      6. Test cases.
      7. Mock simulation metrics.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            requirements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Detailed functional and safety requirements."
            },
            systemDesign: {
              type: Type.STRING,
              description: "High-level architectural description."
            },
            classDiagram: {
              type: Type.STRING,
              description: "Mermaid-formatted detailed class diagram string."
            },
            sequenceDiagram: {
              type: Type.STRING,
              description: "Mermaid-formatted sequence diagram string."
            },
            sourceCode: {
              type: Type.OBJECT,
              properties: {
                cpp: { type: Type.STRING, description: "MISRA-compliant C++ code." },
                rust: { type: Type.STRING, description: "Safety-critical Rust code." },
                java: { type: Type.STRING, description: "Android Automotive compatible Java code." }
              },
              required: ["cpp", "rust", "java"]
            },
            testCases: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Unit and integration test scenarios."
            },
            complianceScore: {
              type: Type.NUMBER,
              description: "A score from 0-100 indicating standard compliance."
            },
            standardsCompliance: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of standards the code adheres to."
            },
            simData: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING },
                metrics: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      value: { type: Type.NUMBER }
                    },
                    required: ["name", "value"]
                  }
                }
              },
              required: ["status", "metrics"]
            }
          },
          required: [
            "requirements", 
            "systemDesign", 
            "classDiagram", 
            "sequenceDiagram", 
            "sourceCode", 
            "testCases", 
            "complianceScore", 
            "standardsCompliance", 
            "simData"
          ],
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("The model returned an empty response.");
    }

    // Clean potential markdown formatting from the response
    const cleanedText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(cleanedText);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate automotive assets. Please try again.");
  }
};
