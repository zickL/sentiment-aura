const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 3001;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});


const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  'https://sentiment-aura.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/process_text', async (req, res) => {
  const { text } = req.body;
  
  console.log('received text:', text);
  
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'text cannot be empty' });
  }

  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set');
    return res.status(500).json({ error: 'GROQ_API_KEY is not configured' });
  }
  
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a sentiment analysis assistant. Please strictly output in the following JSON format, without any other text. Analyze the sentiment and keywords of the given text. The sentiment is represented by a float number between -1 (very negative) and 1 (very positive). The keywords are returned as an array of strings. \nFormat: {\"sentiment\": <number>, \"keywords\": [\"word1\", \"word2\", ...]}"
        },
        {
          role: "user",
          content: text
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      max_tokens: 100
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content;
    console.log('Groq original response:', aiResponse);

    let result;
    try {
      result = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      result = {
        sentiment: 0,
        keywords: []
      };
    }

    if (typeof result.sentiment !== 'number' || !Array.isArray(result.keywords)) {
      console.warn('AI returned format is incorrect, using default value');
      result = {
        sentiment: result.sentiment || 0,
        keywords: result.keywords || []
      };
    }

    console.log('analysis result:', result);
    res.json(result);
    
  } catch (error) {
    console.error('Groq API call failed:', error);
    res.status(500).json({ 
      error: 'sentiment analysis failed',
      details: error.message 
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

