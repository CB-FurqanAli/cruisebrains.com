import nodemailer from 'nodemailer'

export const config = {
    runtime: 'nodejs',
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end()
    }

    const { name, email, contact, summary } = req.body

    // ✅ Validation
    if (!name || !email || !contact) {
        return res.status(400).send('All fields are required')
    }

    if (!/^\d{10,15}$/.test(contact)) {
        return res.status(400).send('Invalid phone number')
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    })

    try {
        await transporter.sendMail({
            from: `"CruiseBrains Contact Form" <${process.env.EMAIL_USER}>`,
            to: process.env.RECEIVER_EMAIL,
            subject: 'CruiseBrains Contact Request',
            html: `
        <h2>CruiseBrains Contact Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Contact:</strong> ${contact}</p>
        <p><strong>Summary:</strong> ${summary}</p>
      `,
        })

        return res.redirect(303, '/thank-you')
    } catch (error) {
        console.error(error)
        return res.status(500).send('Email not sent')
    }
}

