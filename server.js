import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

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
      from: "Obscuron Void Labs <onboarding@resend.dev>",
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

app.use(express.static(".")); // serve your HTML

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));