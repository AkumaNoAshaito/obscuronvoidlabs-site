import { Resend } from "resend";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "admin@obscuronvoidlabs.com",
      to: "admin@obscuronvoidlabs.com",
      subject: "New Waitlist Signup",
      html: `<strong>${email}</strong> joined the waitlist.`,
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Email failed" });
  }
}