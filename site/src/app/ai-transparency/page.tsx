export default function AITransparencyPage() {
  return (
    <main className="px-6 py-16 md:px-10">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          AI Transparency & Responsible Use
        </h1>

        <p className="text-muted-foreground">
          <strong>Last Updated:</strong> March 6, 2026
        </p>

        <p>
          Our platform uses artificial intelligence to assist recruiters in
          reviewing resumes and evaluating potential candidates. This page
          explains how the AI system works, what data it processes, and the role
          it plays in the recruitment workflow.
        </p>

        <p>
          We believe AI tools should be transparent, responsible, and designed
          to support — not replace — human decision-making.
        </p>

        {/* What AI Does */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. What the AI System Does</h2>

          <p>
            Our platform analyzes resumes and job descriptions using AI models
            to help recruiters quickly understand candidate qualifications.
          </p>

          <p>The system may perform tasks such as:</p>

          <ul className="list-disc space-y-1 pl-6">
            <li>Extracting structured information from resumes</li>
            <li>Identifying relevant skills and experience</li>
            <li>Comparing candidate qualifications with job requirements</li>
            <li>Generating summaries and insights for recruiters</li>
          </ul>

          <p>
            These tools are designed to assist recruiters in reviewing
            candidates more efficiently.
          </p>
        </section>

        {/* Data AI Processes */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            2. What Data the AI Processes
          </h2>

          <p>
            The AI system processes information contained within job
            descriptions and candidate resumes uploaded by users.
          </p>

          <p>This may include information such as:</p>

          <ul className="list-disc space-y-1 pl-6">
            <li>Skills listed in resumes</li>
            <li>Work experience and job history</li>
            <li>Education background</li>
            <li>Certifications and professional credentials</li>
            <li>Job requirements and role descriptions</li>
          </ul>

          <p>
            The system only processes the information provided by users during
            resume analysis.
          </p>
        </section>

        {/* How Insights Generated */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            3. How AI Insights Are Generated
          </h2>

          <p>
            The platform extracts structured information from resumes and
            compares it with the requirements described in the job posting.
          </p>

          <p>Based on this comparison, the system may generate outputs such as:</p>

          <ul className="list-disc space-y-1 pl-6">
            <li>Candidate summaries</li>
            <li>Strengths and potential skill gaps</li>
            <li>Candidate–job fit scores</li>
            <li>Suggested interview questions</li>
          </ul>

          <p>
            These outputs are generated automatically by AI models to assist
            recruiters during candidate evaluation.
          </p>
        </section>

        {/* What AI Does NOT Do */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. What the AI Does NOT Do</h2>

          <p>Our AI system has clear limitations.</p>

          <ul className="list-disc space-y-1 pl-6">
            <li>The system does not make hiring decisions.</li>
            <li>The system does not replace human judgment.</li>
            <li>It does not automatically approve or reject candidates.</li>
          </ul>

          <p>
            Recruiters and organizations remain fully responsible for evaluating
            candidates and making final hiring decisions.
          </p>
        </section>

        {/* Limitations */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Limitations of AI</h2>

          <p>
            AI-generated insights are based on automated analysis and may not
            always be perfectly accurate.
          </p>

          <p>
            Results may occasionally contain errors, incomplete interpretations,
            or miss context within a resume.
          </p>

          <p>
            For this reason, recruiters should review AI-generated insights and
            use them as guidance rather than definitive conclusions.
          </p>
        </section>

        {/* Human Oversight */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Human Oversight</h2>

          <p>
            The platform is designed as a decision-support tool for recruiters.
          </p>

          <p>
            Human review is expected at every stage of the recruitment process.
            AI-generated insights should be used to support recruiter workflows,
            not replace professional judgment.
          </p>
        </section>

        {/* Responsible Use */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. Responsible Use</h2>

          <p>Users of the platform are responsible for ensuring that:</p>

          <ul className="list-disc space-y-1 pl-6">
            <li>
              They have permission to upload and process candidate resumes
            </li>
            <li>
              Candidate data is handled in compliance with employment and
              privacy laws
            </li>
            <li>
              The platform is used ethically and responsibly in recruitment
              workflows
            </li>
          </ul>
        </section>

        {/* Continuous Improvement */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            8. Continuous Improvement
          </h2>

          <p>
            As the platform evolves, the AI systems may improve over time
            through updates and refinements to our technology.
          </p>

          <p>
            Our goal is to continually improve the usefulness, reliability, and
            transparency of the AI tools provided to recruiters.
          </p>
        </section>

        {/* Contact */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">9. Contact</h2>

          <p>
            If you have questions about how AI is used on our platform, please
            contact us.
          </p>

          <p>
            <strong>Email:</strong> support@yourdomain.com
          </p>
        </section>
      </div>
    </main>
  );
}