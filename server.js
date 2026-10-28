const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/generate', async (req, res) => {
    const userPrompt = req.body.prompt;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const promptText = `Bertindaklah sebagai generator kode HTML dan CSS. Berdasarkan permintaan user: "${userPrompt}", buatkan kodenya.
        Kamu WAJIB mengembalikan balasan HANYA berupa objek JSON murni dengan format persis seperti ini, tanpa markdown, tanpa teks lain:
        {"html": "<div class='spinner'></div>", "css": ".spinner { width: 40px; height: 40px; border: 4px solid red; border-radius: 50%; animation: spin 1s infinite linear; } @keyframes spin { 100% { transform: rotate(360deg); } }"}`;

        const result = await model.generateContent(promptText);
        let rawText = result.response.text();
        
        // Membersihkan format markdown jika ada
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstOpen = rawText.indexOf('{');
        const lastClose = rawText.lastIndexOf('}');
        
        if (firstOpen !== -1 && lastClose !== -1) {
            rawText = rawText.substring(firstOpen, lastClose + 1);
        }

        const jsonResponse = JSON.parse(rawText);
        res.json(jsonResponse);
    } catch (error) {
        console.error("Error API:", error);
        res.status(500).json({ 
            html: "<div style='color:red;'>Gagal memproses AI</div>", 
            css: "body { display:flex; justify-content:center; align-items:center; }" 
        });
    }
});

module.exports = app;
