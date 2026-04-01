const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Render will provide these
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// ✅ Upload folder (Render safe)
const upload = multer({ dest: '/tmp/' });

// ✅ Static files
app.use(express.static('public'));

// ✅ Form route
app.post('/apply', upload.single('resume'), async (req, res) => {
    try {
        console.log("Application received");

        const { name, email, position } = req.body;
        const file = req.file;

        const message = `
New Job Application

Name: ${name}
Email: ${email}
Position: ${position}
`;

        // Send text
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: message
        });

        // Send file
        if (file) {
            const form = new FormData();
            form.append('chat_id', CHAT_ID);
            form.append('document', fs.createReadStream(file.path));

            await axios.post(
                `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
                form,
                { headers: form.getHeaders() }
            );

            fs.unlinkSync(file.path);
        }

        res.send("Application sent successfully");
    } catch (error) {
        console.error("ERROR:", error.response?.data || error.message);
        res.status(500).send("Error sending application");
    }
});

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});