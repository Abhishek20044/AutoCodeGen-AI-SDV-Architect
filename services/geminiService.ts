
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedAsset } from "../types";

/**
 * Enhanced Gemini Service for Automotive SoA Generation.
 * This function acts as the core "backend" logic, leveraging Gemini 3 Pro
 * with a deep reasoning budget to ensure safety-critical code quality.
 */
export const generateAutomotiveSoA = async (prompt: string): Promise<GeneratedAsset> => {
  // Initialize AI client inside the call to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const systemInstruction = `You are a world-class Senior Automotive Systems Architect and Safety Engineer (ISO 26262 expert).
Your specialty is Software-Defined Vehicles (SDV) and Service-Oriented Architectures (SoA).

When generating content:
1. Adhere strictly to ISO 26262 ASIL-D requirements.
2. For C++, follow MISRA C++:2023 and AUTOSAR Adaptive guidelines (ara::com).
3. For Rust, utilize safety-critical patterns and the 'no_std' environment where applicable for embedded targets.
4. Architecture should assume a modern middleware like Zenoh, DDS, or SOME/IP.
5. UML diagrams must be syntactically perfect Mermaid.js code.
6. Requirements must follow the EARS (Easy Approach to Requirements Syntax) patterns.

Reason deeply about the safety implications, potential race conditions in distributed vehicle services, and memory safety before providing the final architecture and code.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        {
          role: 'user',
          parts: [{ text: `Generate a comprehensive automotive SoA asset bundle for: "${prompt}"` }]
        }
      ],
      config: {
        systemInstruction: systemInstruction,
        // Using a high thinking budget for complex architectural and safety reasoning
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            requirements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of functional, safety, and non-functional requirements in EARS syntax."
            },
            systemDesign: {
              type: Type.STRING,
              description: "Detailed description of the service-oriented design, middleware selection, and safety concept."
            },
            classDiagram: {
              type: Type.STRING,
              description: "Mermaid.js class diagram including visibility, types, and method signatures."
            },
            sequenceDiagram: {
              type: Type.STRING,
              description: "Mermaid.js sequence diagram showing service discovery and data exchange (e.g., Some/IP or DDS)."
            },
            sourceCode: {
              type: Type.OBJECT,
              properties: {
                cpp: { 
                  type: Type.STRING, 
                  description: "C++ implementation using Adaptive AUTOSAR (ara::com) or a modern SoA framework." 
                },
                rust: { 
                  type: Type.STRING, 
                  description: "Memory-safe Rust implementation for the high-integrity service component." 
                },
                java: { 
                  type: Type.STRING, 
                  description: "Java/Kotlin implementation for Android Automotive (AAOS) integration." 
                }
              },
              required: ["cpp", "rust", "java"]
            },
            testCases: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Requirements-based test cases for SIL (Software-in-the-Loop) validation."
            },
            complianceScore: {
              type: Type.NUMBER,
              description: "Calculated compliance percentage based on ISO 26262 and MISRA."
            },
            standardsCompliance: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Detailed list of applied standards (e.g., ISO 26262-6, MISRA C++:2023)."
            },
            simData: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING, description: "Simulation verdict: 'success' or 'failure'." },
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
      throw new Error("The AI backend returned an empty response. This may be due to safety filters or token limits.");
    }

    // Clean potential markdown artifacts
    const cleanedText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    const result = JSON.parse(cleanedText);

    // Basic validation of the parsed object
    if (!result.sourceCode || !result.classDiagram) {
      throw new Error("The generated asset is incomplete. Retrying might improve the result.");
    }

    return result;
  } catch (error: any) {
    console.error("Backend logic error in Gemini Service:", error);
    
    // Provide user-friendly messaging for common API errors
    if (error.message?.includes('429')) {
      throw new Error("Rate limit exceeded. Please wait a moment before synthesizing new software.");
    }
    
    throw new Error(error.message || "A critical error occurred while communicating with the AI backend.");
  }
};
