import nodemailer from "nodemailer"
import { IncomingForm } from "formidable"

export const config = {
    api: {
        bodyParser: false,
    },
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" })
    }

    const form = new IncomingForm({ keepExtensions: true })

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({
                message: "Form parsing failed.",
                field: "form",
            })
        }

        const name = Array.isArray(fields.name) ? fields.name[0] : fields.name
        const email = Array.isArray(fields.email) ? fields.email[0] : fields.email
        const summary = Array.isArray(fields.summary) ? fields.summary[0] : fields.summary
        const captcha = Array.isArray(fields.captcha) ? fields.captcha[0] : fields.captcha

        const resumeFile = Array.isArray(files.resume) ? files.resume[0] : files.resume

        if (!name || !email || !summary || !resumeFile) {
            return res.status(400).json({
                message: "All fields are required.",
                field: "form",
            })
        }

        if (!captcha) {
            return res.status(400).json({
                message: "Please verify that you are not a robot.",
                field: "captcha",
            })
        }

        try {
            const params = new URLSearchParams()
            params.append("secret", process.env.RECAPTCHA_SECRET_KEY)
            params.append("response", captcha)

            const captchaResponse = await fetch(
                "https://www.google.com/recaptcha/api/siteverify",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: params.toString(),
                }
            )

            const captchaData = await captchaResponse.json()

            if (!captchaData.success) {
                return res.status(400).json({
                    message: "Captcha verification failed. Please try again.",
                    field: "captcha",
                })
            }

            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            })

            await transporter.sendMail({
                from: `"Internship Request" <${process.env.EMAIL_USER}>`,
                to: process.env.RECEIVER_EMAIL,
                subject: "Internship Request Received",
                html: `
          <h2>Internship Request Received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Summary:</strong><br/>${summary}</p>
        `,
                attachments: [
                    {
                        filename: resumeFile.originalFilename,
                        path: resumeFile.filepath,
                    },
                ],
            })

            return res.status(200).json({
                message: "Application submitted successfully.",
            })
        } catch (error) {
            console.error("Email send error:", error)

            return res.status(500).json({
                message: "Email sending failed.",
                field: "form",
            })
        }
    })
}