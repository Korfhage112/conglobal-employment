const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const multer = require("multer");
const session = require("express-session");

const app = express();

app.use(session({
    secret: "conglobal-secret",
    resave: false,
    saveUninitialized: true
}));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("uploads"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/apply", upload.single("resume"), (req, res) => {
    const { name, email, position } = req.body;
    const resume = req.file.filename;

    const data = `Name: ${name}, Email: ${email}, Position: ${position}, Resume: ${resume}\n`;

    fs.appendFile("applications.txt", data, (err) => {
        if (err) throw err;

        res.send(`
            <h2>Application Submitted ✅</h2>
            <a href="/">Go Back</a>
        `);
    });
});

app.get("/login", (req, res) => {
    res.send(`
        <h2>Admin Login</h2>
        <form method="POST" action="/login">
            <input name="username" placeholder="Username" required/><br><br>
            <input type="password" name="password" placeholder="Password" required/><br><br>
            <button type="submit">Login</button>
        </form>
    `);
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === "admin" && password === "1234") {
        req.session.loggedIn = true;
        res.redirect("/admin");
    } else {
        res.send("Invalid login");
    }
});

app.get("/admin", (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect("/login");
    }

    fs.readFile("applications.txt", "utf8", (err, data) => {
        if (err) return res.send("No applications yet");

        const lines = data.split("\n");

        let html = "<h1>Applications</h1>";

        lines.forEach(line => {
            if (line.trim() !== "") {
                const resume = line.split("Resume: ")[1];

                html += `
                    <p>${line}<br>
                    <a href="/${resume}" target="_blank">Download Resume</a>
                    </p><hr>
                `;
            }
        });

        res.send(html);
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});