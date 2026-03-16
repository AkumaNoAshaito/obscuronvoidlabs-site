const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Resend } = require("resend");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/api/waitlist", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    await resend.emails.send({
      from: "OBSCURON VOID LABS <onboarding@resend.dev>",
      to: ["admin@obscuronvoidlabs.com"],
      subject: "New Waitlist Signup 🚀",
      html: `<p><strong>${email}</strong> joined the waitlist.</p>`,
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Mail failed" });
  }
});

function buildEmailHtml(type, data) {
  const escape = (s) => (s || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const row = (label, value) => value ? `<p><strong>${escape(label)}:</strong> ${escape(String(value))}</p>` : "";
  switch (type) {
    case "contact":
      return [
        row("Name", data.name),
        row("Email", data.email),
        row("Organization", data.organization),
        row("Message", data.message),
      ].filter(Boolean).join("");
    case "demo_request":
      return [
        row("College Name", data.collegeName),
        row("City", data.city),
        row("Number of Students", data.students),
        row("IT Administrator Email", data.email),
        row("Contact Number", data.phone),
        row("Additional Notes", data.notes),
      ].filter(Boolean).join("");
    case "partnership":
      return [
        row("Name", data.name),
        row("Organization", data.organization),
        row("Email", data.email),
        row("Partnership Type", data.partnershipType),
        row("Message", data.message),
      ].filter(Boolean).join("");
    default:
      return Object.entries(data).map(([k, v]) => row(k, v)).filter(Boolean).join("");
  }
}

app.post("/api/send-email", async (req, res) => {
  try {
    const data = req.body;
    const type = data.type || "contact";

    const email = (data.email || "").trim();
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email required" });
    }

    const subjectByType = {
      contact: "Contact form submission",
      demo_request: "Campus Demo Request",
      partnership: "Partnership inquiry",
    };
    const subject = subjectByType[type] || "Website form submission";
    const html = buildEmailHtml(type, data) || "<p>No content.</p>";

    await resend.emails.send({
      from: "OBSCURON VOID LABS <onboarding@resend.dev>",
      to: ["admin@obscuronvoidlabs.com"],
      subject,
      html: `<div style="font-family: sans-serif;">${html}</div>`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Mail failed" });
  }
});

app.use(express.static(".")); // serve your HTML

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));

module.exports = app;