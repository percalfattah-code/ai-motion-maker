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
        const systemInstruction = `Kamu adalah pembuat kode animasi HTML/CSS. 
        Ubah permintaan ini menjadi animasi menggunakan HTML murni dan CSS animasi (@keyframes).
        Permintaan: ${userPrompt}
        Aturan ketat:
        1. Jangan gunakan JavaScript.
        2. Output HARUS murni JSON valid tanpa teks lain: { "html": "<div class='x'>div</div>", "css": ".x { background: red; }" }
        3. Pastikan animasi berulang (infinite) dan terpusat.`;

        const result = await model.generateContent(systemInstruction);
        let responseText = result.response.text().trim();
        
        // Membersihkan format markdown block dengan regex agar aman
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // Mengambil teks mulai dari kurung kurawal pertama sampai terakhir
        const jsonStart = responseText.indexOf('{');
        const jsonEnd = responseText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            responseText = responseText.substring(jsonStart, jsonEnd + 1);
        }

        const parsedData = JSON.parse(responseText);
        res.json(parsedData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Gagal memproses animasi" });
    }
});

module.exports = app;
