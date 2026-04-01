app.post("/apply", upload.single("resume"), async (req, res) => {
    console.log("FORM SUBMITTED"); // 👈 VERY IMPORTANT

    const { name, email, position } = req.body;

    console.log(name, email, position); // 👈 see values

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "katesteward34@gmail.com",
            pass: "aolh tfpk vvbt dyis"
        }
    });

    try {
        const info = await transporter.sendMail({
            from: "Job Portal <YOUR_GMAIL@gmail.com>",
            to: "YOUR_GMAIL@gmail.com",
            subject: "New Job Application",
            text: `
Name: ${name}
Email: ${email}
Position: ${position}
            `,
            attachments: [
                {
                    filename: req.file.originalname,
                    path: req.file.path
                }
            ]
        });

        console.log("EMAIL SENT:", info.response); // 👈 IMPORTANT

        res.send("Application sent successfully!");

    } catch (err) {
        console.log("EMAIL ERROR:", err); // 👈 IMPORTANT
        res.send("Error sending email");
    }
});