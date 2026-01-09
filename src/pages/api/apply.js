import nodemailer from 'nodemailer'
import { IncomingForm } from 'formidable'

export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end()

    const form = new IncomingForm({ keepExtensions: true })

    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).send('Form parsing failed')

        const { name, email, summary } = fields
        const resume = files.resume

        if (!name || !email || !summary || !resume)
            return res.status(400).send('All fields are required')

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER, // Gmail account
                pass: process.env.EMAIL_PASS, // App Password
            },
        })

        try {
            await transporter.sendMail({
                from: `"Internship Request" <${process.env.EMAIL_USER}>`,
                to: process.env.RECEIVER_EMAIL, // where you want to receive applications
                subject: 'Internship Request Received',
                html: `
          <h2>Internship Request Received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Summary:</strong><br/>${summary}</p>
        `,
                attachments: [
                    {
                        filename: resume.originalFilename,
                        path: resume.filepath, // use path, not content
                    },
                ],
            })

            return res.redirect(303, '/thank-you')
        } catch (error) {
            console.error('Email send error:', error)
            return res.status(500).send('Email sending failed')
        }
    })
}
