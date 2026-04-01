const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Telegram credentials from Render environment
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// ✅ Multer setup for file uploads (Render safe folder)
const upload = multer({ dest: '/tmp/' });

// ✅ Serve static files (images, CSS)
app.use(express.static('public'));

// ✅ Handle form submissions
app.post('/apply', upload.single('resume'), async (req, res) => {
    try {
        const { name, email, position } = req.body;
        const file = req.file;

        // ✅ Telegram message
        const message = `
📩 New Job Application

👤 Name: ${name}
📧 Email: ${email}
💼 Position: ${position}
`;

        // Send text message to Telegram
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: message
        });

        // Send resume file to Telegram
        if (file) {
            const form = new FormData();
            form.append('chat_id', CHAT_ID);
            form.append('document', fs.createReadStream(file.path));

            await axios.post(
                `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
                form,
                { headers: form.getHeaders() }
            );

            fs.unlinkSync(file.path); // delete temp file
        }

        res.send("✅ Application submitted successfully!");
    } catch (error) {
        console.error("ERROR:", error.response?.data || error.message);
        res.status(500).send("❌ Failed to send application");
    }
});

// ✅ Serve homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ✅ Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));