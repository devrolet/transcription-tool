const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

// Config Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Serve static files (HTML form);
app.use(express.static('public'));

// File upload endpoint
app.post('/upload', upload.single('audioFile'), async(req, res) => {
    try {
        const filePath = path.join(__dirname, req.file.path);

        // Send the file to OpenAI Whisper API for transcriptin
        const transcript = await transscribeAudio(filePath);

        // Delete the uploaded file after transcription
        fs.unlinkSync(filePath);

        res.json({ transcript });
    } catch(error) {
        console.error('Error during transcription: ', error);
        res.status(500).send('An error occurred during transcription');
    }
});

// Function to transcribe audio using OpenAI Whisper API
async function transcribeAudio(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const apiKey = process.env.OPEN_API_KEY;

    const formData = new FormData();
    formData.append('file', fileStream);
    formData.append('model', 'whisper-1');

    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            ...formData.getHeaders(),
        },
    });

    return response.data.text;
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
