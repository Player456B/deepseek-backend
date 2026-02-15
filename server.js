const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced CORS configuration
app.use(cors({
    origin: '*', // Allow all origins for testing
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// DeepSeek API configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint - helpful for debugging
app.get('/', (req, res) => {
    res.json({ 
        message: 'DeepSeek Backend is running',
        endpoints: ['/health', '/api/chat'],
        status: 'active'
    });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log('Received message:', message);
        console.log('Using API key:', DEEPSEEK_API_KEY ? 'Key exists' : 'Key missing');

        if (!DEEPSEEK_API_KEY) {
            throw new Error('DeepSeek API key is not configured');
        }

        const response = await axios.post(
            DEEPSEEK_ENDPOINT,
            {
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: message }],
                max_tokens: 500,
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 second timeout
            }
        );
        
        console.log('DeepSeek API response received');
        
        res.json({ 
            response: response.data.choices[0].message.content 
        });
        
    } catch (error) {
        console.error('API Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        
        // Send appropriate error message to frontend
        if (error.response) {
            res.status(error.response.status).json({ 
                error: `DeepSeek API error: ${error.response.data.error?.message || 'Unknown error'}`
            });
        } else if (error.request) {
            res.status(503).json({ 
                error: 'Cannot reach DeepSeek API. Please try again.'
            });
        } else {
            res.status(500).json({ 
                error: 'Server error: ' + error.message 
            });
        }
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Chat endpoint: http://localhost:${PORT}/api/chat`);
});
