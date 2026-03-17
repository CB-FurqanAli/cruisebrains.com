import React from 'react'
import { Button } from '@/components/Button'

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
import { useState } from "react"
import ReCAPTCHA from "react-google-recaptcha"

export default function ApplyForm() {
  const [captchaToken, setCaptchaToken] = useState("")
  const [captchaError, setCaptchaError] = useState("")
  const [formError, setFormError] = useState("")
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState("")

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token || "")
    setCaptchaError("")
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    setFileName(file ? file.name : "")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setFormError("")
    setCaptchaError("")

    const form = e.currentTarget
    const formData = new FormData(form)

    const name = formData.get("name")?.toString().trim()
    const email = formData.get("email")?.toString().trim()
    const summary = formData.get("summary")?.toString().trim()
    const resume = formData.get("resume")

    if (!name || !email || !summary || !resume || !(resume instanceof File) || resume.size === 0) {
      setFormError("All fields are required.")
      return
    }

    if (!captchaToken) {
      setCaptchaError("Please verify that you are not a robot.")
      return
    }

    formData.append("captcha", captchaToken)

    try {
      setLoading(true)

      const response = await fetch("/api/apply", {
        method: "POST",
        body: formData,
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
      <div className="order-last grid grid-flow-col lg:grid-flow-row lg:pl-20">
        <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="mt-10 rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40"
        >
          <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            <MailIcon className="h-6 w-6 flex-none" />
            <span className="ml-2">Apply Now</span>
          </h2>

          <p className="pt-2 text-xs text-zinc-900 dark:text-zinc-100">
            Fill up required information asking in the form.
          </p>

          <div className="my-5 grid gap-6">
            <div>
              <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  required
                  minLength={3}
                  className="w-full rounded-md border border-zinc-900/10 bg-white px-3 py-2 shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/10 sm:text-sm"
              />
            </div>

            <div>
              <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  className="w-full rounded-md border border-zinc-900/10 bg-white px-3 py-2 shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/10 sm:text-sm"
              />
            </div>

            <div>
            <textarea
                name="summary"
                placeholder="Summary"
                required
                rows={4}
                className="w-full resize-none rounded-md border border-zinc-900/10 bg-white px-3 py-3 shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/10 sm:text-sm"
            />
            </div>

            <div>
              <label
                  htmlFor="resume"
                  className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white hover:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 dark:bg-zinc-700/20"
              >
              <span className="text-teal-500">
                {fileName ? fileName : "Click to upload your resume"}
              </span>
                <input
                    type="file"
                    id="resume"
                    name="resume"
                    accept=".pdf,.doc,.docx"
                    required
                    onChange={handleFileChange}
                    className="hidden"
                />
              </label>
            </div>

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

          <div className="mt-4">
            <Button type="submit" className="w-24" disabled={loading}>
              {loading ? "Sending..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
  )
}

// import React from 'react'
// import {Button} from '@/components/Button'
//
// function MailIcon(props) {
//   return (
//       <svg
//           viewBox="0 0 24 24"
//           fill="none"
//           strokeWidth="1.5"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           aria-hidden="true"
//           {...props}
//       >
//         <path
//             d="M2.75 7.75a3 3 0 0 1 3-3h12.5a3 3 0 0 1 3 3v8.5a3 3 0 0 1-3 3H5.75a3 3 0 0 1-3-3v-8.5Z"
//             className="fill-zinc-100 stroke-zinc-400 dark:fill-zinc-100/10 dark:stroke-zinc-500"
//         />
//         <path
//             d="m4 6 6.024 5.479a2.915 2.915 0 0 0 3.952 0L20 6"
//             className="stroke-zinc-400 dark:stroke-zinc-500"
//         />
//       </svg>
//   )
// }
// function Form() {
//   return (
//       <div className="order-last grid grid-flow-col lg:grid-flow-row lg:pl-20">
//         <form
//             action="/thank-you"
//             className="mx-auto mt-10 w-full rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40"
//         >
//           <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
//             <MailIcon className="h-6 w-6 flex-none" />
//             <span className="ml-2">Apply Now</span>
//           </h2>
//           <p className=" pt-2 text-xs text-zinc-900 dark:text-zinc-100">
//             Fill up required information asking in the form.
//           </p>
//
//           <div className="my-5 grid grid-cols-1 gap-6">
//             <div className="w-full">
//             <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
//               Name:
//             </span>
//               <input
//                   type="text"
//                   placeholder="Name"
//                   aria-label="Name"
//                   required
//                   className="mt-2 w-full flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/10 sm:text-sm"
//               />
//             </div>
//
//             <div className="w-full">
//             <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
//               Email:
//             </span>
//               <input
//                   type="email"
//                   placeholder="Email address"
//                   aria-label="Email address"
//                   required
//                   className="mt-2 w-full flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/10 sm:text-sm"
//               />
//             </div>
//
//             <div className="w-full">
//             <span className="py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
//               Summary:
//             </span>
//               <textarea
//                   type="text"
//                   placeholder="Summary"
//                   aria-label="Summary"
//                   required
//                   className="mt-2 w-full flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-5 shadow-md shadow-zinc-800/5 placeholder:text-zinc-400  focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/10 sm:text-sm"
//               />
//             </div>
//
//             <div className="w-full">
//             <span className="my-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
//               Resume:
//             </span>
//               <label
//                   for="dropzone-file"
//                   class="mx-auto mt-2 flex w-full cursor-pointer flex-col items-center rounded-xl border-zinc-900/10 bg-white px-3 py-10 shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 hover:border-teal-500 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/10 sm:text-sm"
//               >
//                 <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     class="h-10 w-10 text-teal-500"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                     stroke-width="2"
//                 >
//                   <path
//                       stroke-linecap="round"
//                       stroke-linejoin="round"
//                       d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
//                   />
//                 </svg>
//                 <h2 class="mt-4 text-xl font-medium tracking-wide text-zinc-900 dark:text-zinc-100">
//                   Upload Resume
//                 </h2>
//                 <input id="dropzone-file" type="file" class="hidden " />
//               </label>
//             </div>
//           </div>
//           <div className="ml-auto w-24 justify-start">
//             <Button type="submit" className={`w-20`}>
//               Send
//             </Button>
//           </div>
//         </form>
//       </div>
//   )
// }
//
// export default Form


