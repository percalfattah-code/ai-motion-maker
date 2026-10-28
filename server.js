const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Melayani file statis dari folder public secara eksplisit
app.use(express.static(path.join(__dirname, 'public')));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/generate', async (req, res) => {
    const userPrompt = req.body.prompt;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const systemInstruction = `Kamu adalah pembuat kode animasi HTML/CSS. 
        Ubah permintaan ini menjadi animasi menggunakan HTML murni dan CSS animasi (@keyframes).
        Permintaan: ${userPrompt}
        Aturan ketat:
        1. Jangan gunakan JavaScript.
        2. Output HARUS murni JSON: { "html": "<div class='x'></div>", "css": ".x { background: red; }" }
        3. Pastikan animasi berulang (infinite) dan terpusat.`;

        const result = await model.generateContent(systemInstruction);
        let responseText = result.response.text().trim();
        if (responseText.startsWith('```json')) responseText = responseText.replace(/```json/g, '');
        if (responseText.startsWith('```')) responseText = responseText.replace(/```/g, '');
        
        res.json(JSON.parse(responseText));
    } catch (error) {
        res.status(500).json({ error: "Gagal memproses animasi" });
    }
});

module.exports = app;
