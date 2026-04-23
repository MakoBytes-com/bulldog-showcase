import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Bulldog Security Services, LLC collects, uses and protects your personal data.",
  alternates: { canonical: "/privacy-policy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" updated="April 22, 2026">
      <h2>Who We Are</h2>
      <p>
        Bulldog Security Services, LLC is a National ADT Authorized Dealer. Our dealer
        number is 7451432. Our corporate headquarters is located at 14340 Torrey Chase
        Blvd. Suite 250, Houston TX 77014.
      </p>

      <h2>What Personal Data We Collect And Why</h2>
      <h3>Comments</h3>
      <p>
        When visitors leave comments on the site, we collect the data shown in the
        comments form, the visitor&rsquo;s IP address and browser user-agent string.
      </p>
      <h3>Contact Forms</h3>
      <p>
        When you submit our contact form, we collect your name, email address, phone
        number, and message. This information is used solely to respond to your inquiry.
      </p>
      <h3>Home Inspection Requests</h3>
      <p>
        When you request a home security inspection, we collect your name, phone number
        and ZIP code so we can schedule and confirm your consult.
      </p>
      <h3>Analytics</h3>
      <p>
        We use Google Analytics (or equivalent privacy-friendly tooling) to understand
        aggregate traffic patterns on this site. Analytics cookies help us improve the
        site; they do not personally identify you.
      </p>

      <h2>How Long We Retain Your Data</h2>
      <ul>
        <li>Contact-form submissions: up to 6 months.</li>
        <li>Home inspection requests: up to 3 months.</li>
        <li>Comments and metadata: retained indefinitely so we can recognize and approve follow-up comments automatically.</li>
        <li>Analytics data: up to 2 years.</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        If you leave a comment, you may opt-in to saving your name, email address and
        website in cookies — these are for your convenience and last for one year. When
        you log in, we use temporary cookies for session management (cleared when you
        close your browser) plus a login cookie that persists for two days (or two weeks
        if you select &ldquo;Remember Me&rdquo;). Screen-option preferences last for one year.
      </p>

      <h2>Who We Share Your Data With</h2>
      <p>
        <strong>Bulldog Security Services does NOT share your data with anyone.</strong> We do not sell,
        rent, or trade your personal information to third parties.
      </p>

      <h2>SMS Messaging</h2>
      <p>
        We do not share mobile opt-in information or consent with third parties for
        marketing purposes. You may reply <strong>STOP</strong> to any message to
        unsubscribe from SMS communications.
      </p>

      <h2>Your Rights Over Your Data</h2>
      <p>
        You can request an exported file of the personal data we hold about you,
        including any data you have provided to us. You can also request that we erase
        any personal data we hold about you. This does not include any data we are
        obliged to keep for administrative, legal, or security purposes.
      </p>

      <h2>Contact</h2>
      <p>
        If you have questions about this policy, please contact us at{" "}
        <a href="mailto:info@bdsnation.com">info@bdsnation.com</a>.
      </p>
    </LegalPage>
  );
}
