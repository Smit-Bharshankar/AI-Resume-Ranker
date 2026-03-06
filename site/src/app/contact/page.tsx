export default function ContactPage() {
  return (
    <main className="px-6 py-16 md:px-10">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Contact Us
        </h1>

        <p className="text-muted-foreground">
          We're happy to help with questions, feedback, or support requests.
        </p>

        <p>
          If you have questions about the platform, need technical assistance,
          or want to learn more about how our AI-powered resume screening works,
          please reach out using the information below or send us a message
          through the contact form.
        </p>

        {/* Contact Info */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Contact Information</h2>

          <p>
            For general inquiries, support requests, or questions about privacy
            and AI transparency, please email us at:
          </p>

          <p>
            <strong>Email:</strong> support@yourdomain.com
          </p>
        </section>

        {/* Contact Form */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Send Us a Message</h2>

          <form className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Message</label>
              <textarea
                  rows={5}
                  placeholder="How can we help?"
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            <button
              type="submit"
              className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Send Message
            </button>
          </form>
        </section>

        {/* Additional note */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Response Time</h2>

          <p>
            We typically respond to inquiries within 1–2 business days. For
            urgent technical issues, please include relevant details such as
            screenshots or error messages to help us assist you faster.
          </p>
        </section>
      </div>
    </main>
  );
}