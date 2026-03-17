import { Injectable } from '@angular/core';
import { GoogleGenAI, Modality } from '@google/genai';

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  private basePersona = `You are Cyril, an Assistant Catechist for the OCIA, representing Catholic.Work. 
  You have technical mastery of the Order of Christian Initiation of Adults and the National Statutes.
  Maintain a friendly, kind, pastoral, and professional tone. Communicate the Gospel in a way that motivates and inspires.
  Always reference the OCIA text or National Statutes when possible, including section/paragraph/norm numbers.`;

  private knowledgeBaseDocs: {title: string, content: string, instructions?: string}[] = [];

  setKnowledgeBase(docs: {title: string, content: string, instructions?: string}[]) {
    this.knowledgeBaseDocs = docs;
  }

  private getSystemInstruction(): string {
    let instruction = this.basePersona;
    if (this.knowledgeBaseDocs.length > 0) {
      instruction += '\n\n--- KNOWLEDGE BASE ---\n';
      instruction += 'Use the following documents to answer questions when relevant:\n\n';
      for (const doc of this.knowledgeBaseDocs) {
        instruction += `Document Title: ${doc.title}\n`;
        if (doc.instructions) {
          instruction += `AI Instructions for this document: ${doc.instructions}\n`;
        }
        instruction += `Content:\n${doc.content}\n\n`;
      }
    }
    return instruction;
  }

  async chat(prompt: string) {
    const chat = this.ai.chats.create({
      model: 'gemini-3.1-pro-preview',
      config: { systemInstruction: this.getSystemInstruction() },
    });
    return await chat.sendMessage({ message: prompt });
  }

  async analyzeImage(prompt: string, base64Image: string, mimeType: string) {
    return await this.ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: prompt },
        ],
      },
      config: { systemInstruction: this.getSystemInstruction() },
    });
  }

  async generateSpeech(text: string) {
    return await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });
  }
}
