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

