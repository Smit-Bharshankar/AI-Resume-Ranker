export default function PrivacyPolicyPage() {
  return (
    <main className="px-6 py-16 md:px-10">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>

        <p className="text-muted-foreground">
          <strong>Last Updated:</strong> March 6, 2026
        </p>

        <p>
          This Privacy Policy explains how our platform collects, uses, and
          protects information when you use our AI-powered resume screening and
          candidate evaluation service.
        </p>

        <p>
          Our platform helps recruiters analyze resumes and job descriptions
          using artificial intelligence to generate candidate insights. We are
          committed to handling data responsibly and transparently.
        </p>

        <p>
          By using the platform, you agree to the practices described in this
          policy.
        </p>

        {/* Information We Collect */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Information We Collect</h2>

          <h3 className="font-medium">Account Information</h3>
          <p>
            When you create an account, we may collect your name, email address,
            and authentication information. Authentication may be provided
            through email/password login or third-party login providers such as
            Google.
          </p>

          <h3 className="font-medium">Job Descriptions</h3>
          <p>
            Users may paste or upload job descriptions to analyze candidate fit.
            These descriptions are stored and processed to generate insights and
            comparisons with candidate resumes.
          </p>

          <h3 className="font-medium">Resumes and Candidate Data</h3>
          <p>
            Recruiters may upload resumes or candidate documents. These files
            may contain personal information such as name, contact details,
            work history, education, skills, and other information included in
            the resume.
          </p>

          <p>
            This information is processed to extract structured data and provide
            candidate insights.
          </p>

          <h3 className="font-medium">Usage Data</h3>
          <p>
            We may collect information about how users interact with the
            platform, such as pages visited, features used, and interactions
            within the application. This helps us improve the product.
          </p>

          <h3 className="font-medium">Technical Information</h3>
          <p>
            We may automatically collect technical information including IP
            address, browser type, device information, operating system, and
            basic request logs to maintain system reliability and security.
          </p>
        </section>

        {/* How We Use Information */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            2. How We Use the Information
          </h2>

          <p>We use collected information to:</p>

          <ul className="list-disc space-y-1 pl-6">
            <li>
              Provide AI-powered resume analysis and candidate scoring
            </li>
            <li>
              Extract structured information from resumes and job descriptions
            </li>
            <li>
              Generate recruiter insights such as strengths, weaknesses, and
              suggested interview questions
            </li>
            <li>Improve platform functionality and performance</li>
            <li>Maintain platform security and prevent misuse</li>
            <li>Provide support to users when requested</li>
          </ul>

          <p>We do not sell user or candidate data.</p>
        </section>

        {/* AI Processing */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            3. AI Processing Disclosure
          </h2>

          <p>
            Our platform uses artificial intelligence to process resumes and job
            descriptions.
          </p>

          <p>During analysis, AI systems may:</p>

          <ul className="list-disc space-y-1 pl-6">
            <li>Extract structured candidate information</li>
            <li>Evaluate candidate skills relative to job descriptions</li>
            <li>Generate automated recruiter insights</li>
          </ul>

          <p>Generated insights may include:</p>

          <ul className="list-disc space-y-1 pl-6">
            <li>Candidate scoring</li>
            <li>Strengths and potential skill gaps</li>
            <li>Suggested interview questions</li>
          </ul>

          <p>
            The platform does not make hiring decisions. It is designed only as
            a decision-support tool for recruiters. Final hiring decisions
            remain the responsibility of the recruiter or organization using
            the platform.
          </p>
        </section>

        {/* Data Storage */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            4. Data Storage and Security
          </h2>

          <p>
            We implement reasonable security measures to protect user and
            candidate information.
          </p>

          <ul className="list-disc space-y-1 pl-6">
            <li>Secure storage of resume files</li>
            <li>Encrypted connections (HTTPS)</li>
            <li>Authentication and access controls</li>
            <li>Restricted access to production systems</li>
          </ul>

          <p>
            While we strive to protect information, no system can guarantee
            complete security.
          </p>
        </section>

        {/* Data Retention */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Data Retention</h2>

          <p>
            We retain information as long as necessary to provide our services.
          </p>

          <ul className="list-disc space-y-1 pl-6">
            <li>Account information is retained while accounts remain active</li>
            <li>
              Job descriptions and resumes remain stored until deleted by the
              user
            </li>
          </ul>

          <p>
            Users may delete job postings or candidate data from their account
            at any time.
          </p>
        </section>

        {/* Third Party */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Third-Party Services</h2>

          <p>
            Our platform relies on third-party services to operate
            infrastructure and provide functionality.
          </p>

          <p>These may include:</p>

          <ul className="list-disc space-y-1 pl-6">
            <li>Supabase (authentication and storage)</li>
            <li>Hosting providers</li>
            <li>AI model providers used for resume analysis</li>
            <li>Analytics tools used to improve the platform</li>
          </ul>

          <p>
            These providers process data only as necessary to deliver their
            services.
          </p>
        </section>

        {/* User Rights */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. User Rights</h2>

          <p>Users may:</p>

          <ul className="list-disc space-y-1 pl-6">
            <li>Access their account data</li>
            <li>Update their account information</li>
            <li>Delete uploaded resumes or job descriptions</li>
            <li>Request account deletion</li>
          </ul>
        </section>

        {/* Children */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">8. Children’s Privacy</h2>

          <p>
            Our services are intended for recruiters and businesses and are not
            designed for individuals under the age of 18.
          </p>

          <p>
            We do not knowingly collect personal information from children.
          </p>
        </section>

        {/* Changes */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            9. Changes to This Privacy Policy
          </h2>

          <p>
            We may update this Privacy Policy from time to time as our platform
            evolves. When changes occur, the updated version will be posted on
            this page with a revised “Last Updated” date.
          </p>
        </section>

        {/* Contact */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">10. Contact Information</h2>

          <p>
            If you have questions about this Privacy Policy or how your data is
            handled, please contact us at:
          </p>

          <p>
            <strong>Email:</strong> support@yourdomain.com
          </p>
        </section>
      </div>
    </main>
  );
}