import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

// Initialize Gemini client with telemetry header as required
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // AI Design Assistant Endpoint
  app.post('/api/gemini/command', async (req, res) => {
    try {
      const { prompt, sceneContext } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Missing prompt string' });
      }

      const systemInstruction = `You are the AI 3D Design Assistant for Structura 3D, a SketchUp-style 3D architectural and spatial modelling studio.
You translate natural language architectural and interior design requests into a sequence of precise, validated, structured 3D modelling commands.

Coordinate System:
- Ground plane is X-Z (horizontal): X is Width (positive = right, negative = left), Z is Depth (positive = front, negative = back).
- Y is Height (vertical): 0 is ground level, positive Y is upwards.
- Units are internally in millimeters (mm). 1 meter = 1000mm.
- Rotation is in degrees around the Y axis (0 to 360).

Available Command Types and their expected payload parameters:
1. "createRoom": { width: number, length: number, wallHeight: number, wallThickness: number, centerX?: number, centerZ?: number, flooringMaterial?: string, wallMaterial?: string }
   - Generates 4 walls and a floor slab.
2. "createWall": { startX: number, startZ: number, endX: number, endZ: number, height: number, thickness: number, material?: string }
3. "createBox": { width: number, height: number, depth: number, x: number, y: number, z: number, material?: string, name?: string }
4. "createDoor": { wallId?: string, x: number, z: number, y?: number, width?: number, height?: number, rotation?: number, style?: string }
5. "createWindow": { wallId?: string, x: number, z: number, y?: number, width?: number, height?: number, sillHeight?: number, rotation?: number }
6. "createObject": { objectType: string, x: number, y?: number, z: number, width?: number, height?: number, depth?: number, rotation?: number, material?: string, name?: string }
   - Valid objectTypes: "queenBed", "singleBed", "diningTable", "diningChair", "coffeeTable", "officeDesk", "officeChair", "armchair", "sofa3Seat", "sofaSectional", "kitchenBaseCabinet", "kitchenUpperCabinet", "kitchenIsland", "kitchenCounterSink", "refrigerator", "cooktopStove", "wardrobe", "bookshelf", "tvUnit", "bathroomVanity", "toilet", "bathtub", "showerStall", "pottedPlant", "pendantLight", "rug"
7. "moveObject": { id: string, deltaX: number, deltaY: number, deltaZ: number }
8. "rotateObject": { id: string, angleDelta: number }
9. "resizeObject": { id: string, scaleX?: number, scaleY?: number, scaleZ?: number, newWidth?: number, newHeight?: number, newDepth?: number }
10. "deleteObject": { id: string }
11. "duplicateObject": { id: string, offsetX?: number, offsetZ?: number }
12. "changeMaterial": { id: string, material: string, color?: string }
13. "extrudeFace": { faceId?: string, objectId?: string, distance: number }
14. "clearScene": {}

Guidelines:
- All dimensions MUST be in millimeters (mm) (e.g. 4m = 4000, 900mm = 900, 2.4m = 2400).
- If the user asks for a complete room layout (e.g. "Create a 6m x 8m open-plan living space with kitchen, island, dining table, sofa"), break it down systematically into:
  1) createRoom
  2) add appropriate architectural elements (doors, windows)
  3) place furniture logically with realistic spacing, ergonomics, and orientations.
- When referencing existing objects from the provided scene context, use their exact IDs.
- Provide a clear, natural English summary explanation of what you created or modified in the "explanation" field.
- If the user request lacks minor details, make intelligent aesthetic design decisions instead of failing.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Current Scene State:\n${JSON.stringify(sceneContext || {}, null, 2)}\n\nUser Design Request: "${prompt}"\n\nPlease output the structured modelling commands in JSON.`
              }
            ]
          }
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              explanation: {
                type: Type.STRING,
                description: 'Brief, friendly summary of what was built or changed in the 3D model.'
              },
              commands: {
                type: Type.ARRAY,
                description: 'Ordered list of 3D operations to execute.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: {
                      type: Type.STRING,
                      description: 'Command type name'
                    },
                    params: {
                      type: Type.OBJECT,
                      description: 'Parameters for the command'
                    }
                  },
                  required: ['type', 'params']
                }
              }
            },
            required: ['explanation', 'commands']
          }
        }
      });

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);
      return res.json(parsedData);
    } catch (err: any) {
      console.error('Gemini command error:', err);
      return res.status(500).json({
        error: err.message || 'Failed to process AI design command',
        explanation: 'Sorry, I encountered an issue processing that design request. Please try again or refine your prompt.'
      });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Structura 3D server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
