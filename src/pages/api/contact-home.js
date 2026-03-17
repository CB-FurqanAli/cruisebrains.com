import nodemailer from 'nodemailer'

export default async function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).end()
    }

    const { name, email, captcha } = req.body

    if (!captcha) {
        return res.status(400).send('Captcha required')
    }

    // Verify captcha with Google
    const verify = await fetch(
        `https://www.google.com/recaptcha/api/siteverify`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captcha}`
        }
    )

    const data = await verify.json()

    if (!data.success) {
        return res.status(400).send('Captcha verification failed')
    }

    if (!name || !email) {
        return res.status(400).send('Missing fields')
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
            from: `"CruiseBrains Website" <${process.env.EMAIL_USER}>`,
            to: process.env.RECEIVER_EMAIL,
            subject: 'CruiseBrains Website Contact',
            html: `
        <h2>CruiseBrains Website Contact</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
      `,
        })

        return res.redirect(303, '/thank-you')

    } catch (error) {

        console.error(error)
        return res.status(500).send('Email sending failed')

    }
}