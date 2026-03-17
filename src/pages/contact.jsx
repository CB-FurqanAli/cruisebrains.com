import { Button } from '@/components/Button'
import Head from 'next/head'
import { useState } from "react"
import ReCAPTCHA from "react-google-recaptcha"

function MailIcon(props) {
  return (
      <svg
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          {...props}
      >
        <path
            d="M2.75 7.75a3 3 0 0 1 3-3h12.5a3 3 0 0 1 3 3v8.5a3 3 0 0 1-3 3H5.75a3 3 0 0 1-3-3v-8.5Z"
            className="fill-zinc-100 stroke-zinc-400 dark:fill-zinc-100/10 dark:stroke-zinc-500"
        />
        <path
            d="m4 6 6.024 5.479a2.915 2.915 0 0 0 3.952 0L20 6"
            className="stroke-zinc-400 dark:stroke-zinc-500"
        />
      </svg>
  )
}

export default function Contactus() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    summary: "",
  })
  const [captchaToken, setCaptchaToken] = useState("")
  const [captchaError, setCaptchaError] = useState("")
  const [formError, setFormError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token || "")
    setCaptchaError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setFormError("")
    setCaptchaError("")

    if (
        !formData.name.trim() ||
        !formData.email.trim() ||
        !formData.contact.trim() ||
        !formData.summary.trim()
    ) {
      setFormError("Please fill in all required fields.")
      return
    }

    if (!/^\d{10,15}$/.test(formData.contact)) {
      setFormError("Invalid phone number.")
      return
    }

    if (!captchaToken) {
      setCaptchaError("Please verify that you are not a robot.")
      return
    }

    try {
      setLoading(true)

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          contact: formData.contact,
          summary: formData.summary,
          captcha: captchaToken,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.field === "captcha") {
          setCaptchaError(data.message || "Captcha verification failed.")
        } else {
          setFormError(data.message || "Something went wrong.")
        }
        setLoading(false)
        return
      }

      window.location.href = "/thank-you"
    } catch (error) {
      setFormError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
      <>
        <Head>
          <title>Contact - CruiseBrains</title>
          <meta name="description" content="Contact CruiseBrains" />
        </Head>

        <div>
          <div className="mx-auto mt-10 max-w-2xl rounded-2xl lg:max-w-4xl xl:max-w-5xl">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
              Please get in touch and our expert support team will answer all your
              questions.
            </h1>
            <p className="text-base text-zinc-600 dark:text-zinc-400">
              Email us with any question or inquiries. We should be happy to answer
              your questions.
            </p>
          </div>

          <form
              onSubmit={handleSubmit}
              className="mx-auto mt-10 max-w-2xl rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40 lg:max-w-4xl xl:max-w-5xl"
          >
            <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              <MailIcon className="h-6 w-6 flex-none" />
              <span className="ml-3">Contact us</span>
            </h2>

            <p className="ml-2 pt-2 text-xs text-zinc-900 dark:text-zinc-100">
              If you require any further information, please feel free to contact
              us.
            </p>

            <div className="my-5 grid gap-6">
              <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  required
                  minLength={3}
                  value={formData.name}
                  onChange={handleChange}
                  className="min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/10 sm:text-sm"
              />

              <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/10 sm:text-sm"
              />

              <input
                  type="tel"
                  name="contact"
                  placeholder="Contact No"
                  pattern="[0-9]{10,15}"
                  required
                  value={formData.contact}
                  onChange={handleChange}
                  className="min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/10 sm:text-sm"
              />

              <textarea
                  name="summary"
                  placeholder="Summary / Message"
                  required
                  rows={4}
                  value={formData.summary}
                  onChange={handleChange}
                  className="min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-2 shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/10 sm:text-sm resize-none"
              />

              {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? (
                  <div>
                    <ReCAPTCHA
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                        onChange={handleCaptchaChange}
                    />
                    {captchaError && (
                        <p className="mt-2 text-sm text-red-600">{captchaError}</p>
                    )}
                  </div>
              ) : (
                  <p className="text-sm text-red-600">
                    reCAPTCHA site key is missing.
                  </p>
              )}

              {formError && (
                  <p className="text-sm text-red-600">{formError}</p>
              )}
            </div>

            <div className="ml-auto w-28">
              <Button type="submit" className="w-28" disabled={loading}>
                {loading ? "Sending..." : "Send"}
              </Button>
            </div>
          </form>
        </div>
      </>
  )
}