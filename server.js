const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// File upload
const upload = multer({ dest: "uploads/" });

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "YOUR_EMAIL@gmail.com",
    pass: "YOUR_APP_PASSWORD"
  }
});

// Route
app.post("/apply", upload.single("resume"), async (req, res) => {
  const { name, email, position } = req.body;

  const mailOptions = {
    from: email,
    to: "YOUR_EMAIL@gmail.com",
    subject: `New Job Application - ${position}`,
    text: `
New application received:

Name: ${name}
Email: ${email}
Position: ${position}
    `,
    attachments: req.file
      ? [
          {
            filename: req.file.originalname,
            path: req.file.path
          }
        ]
      : []
  };

  try {
    await transporter.sendMail(mailOptions);
    res.send("Application submitted successfully!");
  } catch (error) {
    console.error(error);
    res.send("Error sending application.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});