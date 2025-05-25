const dialogflow = require("@google-cloud/dialogflow");
const { WebhookClient } = require("dialogflow-fulfillment");
const { google } = require("googleapis");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// Load Google Sheets credentials
const GOOGLE_SHEET_ID = GOOGLE_ID;
let CREDENTIALS;

try {
  CREDENTIALS = JSON.parse(fs.readFileSync(JSON_FILE, "utf8"));
} catch (error) {
  console.error("Error loading Google Sheets credentials file:", error.message);
  process.exit(1);
}

const auth = new google.auth.GoogleAuth({
  credentials: CREDENTIALS,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "muheebaidev2024@gmail.com",
    pass: APP_PASSWORD
  }
});

app.get("/", (req, res) => {
  res.send("Hello from Replit!");
});

app.post("/webhook", async (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });

  function hi(agent) {
    console.log("Intent => hi");
    agent.add("Hi! I am the virtual assistant of Saylani Roti Bank. Could you please tell me your name?");
  }

  async function lead(agent) {
    const { person, email, phone, courseName } = agent.parameters;
    const userName = person.name;
    const userEmail = email;
    const userPhone = phone;

    try {
      const appendResponse = await sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: "Sheet1!A:C",
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [[userName, userEmail, userPhone]],
        },
      });
      console.log("Data appended:", appendResponse.data.updates.updatedCells);
    } catch (error) {
      console.error("Sheet append error:", error.message);
      agent.add("There was an error saving your information.");
      return;
    }

    const mailOptions = {
      from: "muheebaidev2024@gmail.com",
      to: userEmail,
      subject: "Saylani Roti Bank: Confirmation Received",
      html: `
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .card {
              max-width: 280px;
              height: 490px;
              margin: 20px auto;
              background: #ffffff !important;
              border: 1px solid #ddd;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .card-header {
              background: url('https://theazb.com/wp-content/uploads/2022/10/Saylani-Welfare.jpg') no-repeat center center;
              background-size: cover;
              height: 100px;
              position: relative;
            }
            .card-header::after {
              content: "";
              display: block;
              height: 100%;
              width: 100%;
              position: absolute;
              top: 0;
              left: 0;
            }
            .card img {
              width: 170px;
              height: auto;
              margin: 16px auto;
              display: block;
              border-radius: 8px;
            }
            .card-content {
              padding: 16px;
              text-align: center;
            }
            .card-content h3 {
              margin: 8px 0;
              font-size: 1.2rem;
              color: #333;
            }
            .card-content p {
              margin: 4px 0;
              font-size: 1rem;
              color: #555;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="card-header"></div>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQljYSrXL1AK2EzLXxKDtbl3hrFbLphwvqzmw&s" alt="Student Image" />
            <div class="card-content">
              <h3>${userName}</h3>
              <p><strong>Roll Number:</strong> AIC-2745</p>
              <p><strong>Course Name:</strong> ${courseName || "N/A"}</p>
              <p><strong>Contact no:</strong> ${userPhone}</p>
              <p><strong>Email:</strong> ${userEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email error:", error.message);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    agent.add(`Thanks, ${userName}. We'll contact you at ${userEmail}.`);
  }

  function bookAppointment(agent) {
    const calendlyLink = "https://calendly.com/muheebaidev2024";
    agent.add(`Book here: ${calendlyLink}`);
  }

  let intentMap = new Map();
  intentMap.set("hi", hi);
  intentMap.set("lead", lead);
  intentMap.set("bookAppointment", bookAppointment);
  agent.handleRequest(intentMap);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
