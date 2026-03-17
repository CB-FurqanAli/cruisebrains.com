import nodemailer from "nodemailer"

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" })
    }

    const { name, email, captcha } = req.body

    if (!name || !email) {
        return res.status(400).json({
            message: "Missing required fields.",
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
            from: `"CruiseBrains Website" <${process.env.EMAIL_USER}>`,
            to: process.env.RECEIVER_EMAIL,
            subject: "CruiseBrains Website Contact",
            html: `
        <h2>CruiseBrains Website Contact</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
      `,
        })

        return res.status(200).json({
            message: "Email sent successfully.",
        })
    } catch (error) {
        console.error("Contact form error:", error)

        return res.status(500).json({
            message: "Email sending failed.",
            field: "form",
        })
    }
}