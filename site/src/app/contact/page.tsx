import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ContactPage() {
  return (
    <main className="px-6 py-16 md:px-10">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Card className="border-border/70 bg-background/90">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl tracking-tight sm:text-4xl">Contact Us</CardTitle>
            <p className="text-muted-foreground">
              We&apos;re happy to help with questions, feedback, or support requests.
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If you have questions about the platform, need technical assistance, or want to learn more about how our
              AI-powered resume screening works, please reach out using the information below or send us a message through
              the contact form.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/90">
          <CardHeader>
            <CardTitle className="text-xl">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              For general inquiries, support requests, or questions about privacy and AI transparency, please email us at:
            </p>
            <p>
              <strong>Email:</strong> support@yourdomain.com
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/90">
          <CardHeader>
            <CardTitle className="text-xl">Send Us a Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input type="text" placeholder="Your name" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="you@example.com" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <textarea
                  rows={5}
                  placeholder="How can we help?"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </div>

              <Button type="submit">Send Message</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-background/90">
          <CardHeader>
            <CardTitle className="text-xl">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We typically respond to inquiries within 1-2 business days. For urgent technical issues, please include
              relevant details such as screenshots or error messages to help us assist you faster.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
