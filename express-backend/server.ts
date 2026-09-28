import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import * as admin from 'firebase-admin';

dotenv.config();

// Initialize Firebase Admin to verify ID tokens from the Angular app
admin.initializeApp({
  projectId: 'cyril-ce65c'
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Middleware to verify Firebase Auth Token
const authenticate = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying auth token', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

app.post('/api/chat', authenticate, async (req, res) => {
  try {
    const { prompt, useDeepThink, systemInstruction } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const chatSession = ai.chats.create({
      model: useDeepThink ? 'gemini-3.1-pro-preview' : 'gemini-3.1-flash-lite-preview',
      config: { 
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }] 
      },
    });

    const response = await chatSession.sendMessage({ message: prompt });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/searchParishes', authenticate, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const chatSession = ai.chats.create({
      model: 'gemini-3.1-pro-preview',
      config: { 
        tools: [{ googleSearch: {} }],
        temperature: 0.1
      },
    });
    const response = await chatSession.sendMessage({ message: prompt });
    res.json({ text: response.text || '[]' });
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/analyzeImage', authenticate, async (req, res) => {
  try {
    const { prompt, base64Image, mimeType, systemInstruction } = req.body;
    if (!prompt || !base64Image || !mimeType) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: prompt },
        ],
      },
      config: { systemInstruction: systemInstruction },
    });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Image analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generateSpeech', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: { parts: [{ text }] },
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });
    
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    res.json({ audioData });
  } catch (error: any) {
    console.error('Speech generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
