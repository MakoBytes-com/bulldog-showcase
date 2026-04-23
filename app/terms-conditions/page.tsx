import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms &amp; Conditions",
  description:
    "Legal terms of use for bulldogsecurityservice.com — the legally binding agreement between you and Bulldog Security Services, LLC.",
  alternates: { canonical: "/terms-conditions" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms & Conditions" updated="April 22, 2026">
      <h2>Agreement To Terms</h2>
      <p>
        These terms of use constitute a legally binding agreement made between you,
        whether personally or on behalf of an entity (&ldquo;you&rdquo;), and Bulldog
        Security Services, LLC (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo;
        or &ldquo;our&rdquo;), concerning your access to and use of the
        bulldogsecurityservice.com website as well as any other media form, media
        channel, mobile website or mobile application related, linked, or otherwise
        connected thereto (collectively, the &ldquo;Site&rdquo;).
      </p>

      <h2>Intellectual Property Rights</h2>
      <p>
        Unless otherwise indicated, the Site is our proprietary property and all source
        code, databases, functionality, software, website designs, audio, video, text,
        photographs and graphics on the Site (collectively, the &ldquo;Content&rdquo;)
        and the trademarks, service marks and logos contained therein (the
        &ldquo;Marks&rdquo;) are owned or controlled by us or licensed to us.
      </p>

      <h2>User Representations</h2>
      <p>
        By using the Site, you represent and warrant that: (1) you have the legal
        capacity and you agree to comply with these Terms of Use; (2) you are not a
        minor in the jurisdiction in which you reside; (3) you will not access the Site
        through automated or non-human means; (4) you will not use the Site for any
        illegal or unauthorized purpose; and (5) your use of the Site will not violate
        any applicable law or regulation.
      </p>

      <h2>Prohibited Activities</h2>
      <p>
        You may not access or use the Site for any purpose other than that for which we
        make the Site available. Prohibited activities include systematic data
        retrieval, unauthorized account creation, selling goods or services without
        permission, circumventing security features, impersonating another user, or
        using automated systems such as bots or scrapers.
      </p>

      <h2>Submissions</h2>
      <p>
        Any questions, comments, suggestions, ideas, feedback, or other information
        regarding the Site (&ldquo;Submissions&rdquo;) provided by you to us are
        non-confidential and shall become our sole property.
      </p>

      <h2>Third-Party Websites And Content</h2>
      <p>
        The Site may contain links to third-party websites and content. Third-party
        websites and content are not investigated, monitored or checked for accuracy,
        appropriateness or completeness by us, and we are not responsible for any
        third-party content.
      </p>

      <h2>Site Management</h2>
      <p>
        We reserve the right to monitor the Site for violations of these Terms of Use,
        take appropriate legal action against anyone who violates these terms, refuse
        or restrict access to the Site, and otherwise manage the Site in a manner
        designed to protect our rights and property.
      </p>

      <h2>SMS Terms &amp; Conditions</h2>
      <p>
        By opting in to receive SMS messages from Bulldog Security Services, you agree
        to receive up to 10 messages per month related to your account, service
        appointments, and promotional offers. Message and data rates may apply. You may
        reply <strong>STOP</strong> at any time to unsubscribe, or <strong>HELP</strong> for assistance.
        Carriers are not liable for delayed or undelivered messages.
      </p>

      <h2>Privacy Policy</h2>
      <p>
        We care about data privacy and security. Please review our Privacy Policy. By
        using the Site, you agree to be bound by our Privacy Policy, which is
        incorporated into these Terms of Use. Please be advised the Site is hosted in
        the United States.
      </p>

      <h2>Term And Termination</h2>
      <p>
        We reserve the right to, in our sole discretion and without notice or liability,
        deny access to and use of the Site to any person for any reason, including
        without limitation for breach of any representation, warranty or covenant
        contained in these Terms of Use.
      </p>

      <h2>Modifications And Interruptions</h2>
      <p>
        We reserve the right to change, modify or remove the contents of the Site at
        any time or for any reason at our sole discretion without notice. We cannot
        guarantee the Site will be available at all times.
      </p>

      <h2>Disclaimer</h2>
      <p>
        The Site is provided on an as-is and as-available basis. You agree that your use
        of the Site and our services will be at your sole risk. To the fullest extent
        permitted by law, we disclaim all warranties, express or implied, in connection
        with the Site and your use thereof.
      </p>

      <h2>Limitation Of Liability</h2>
      <p>
        In no event shall Bulldog Security Services, LLC or any of its officers,
        directors or employees be liable to any entity for any direct, indirect,
        special, consequential or other damages arising out of the use of the Site or
        our services.
      </p>

      <h2>Indemnification</h2>
      <p>
        You agree to defend, indemnify, and hold us harmless from and against any loss,
        damage, liability, claim, or demand made by any third party due to or arising
        out of your use of the Site, breach of these Terms of Use, or violation of the
        rights of a third party.
      </p>

      <h2>Governing Law</h2>
      <p>
        These Terms of Use and your use of the Site are governed by and construed in
        accordance with the laws of the State of Texas, without regard to its conflict
        of law principles.
      </p>

      <h2>Contact Information</h2>
      <p>
        Bulldog Security Services, LLC<br />
        14340 Torrey Chase Blvd, Ste. 250<br />
        Houston, TX 77014<br />
        Phone: <a href="tel:+18325850725">(832) 585-0725</a><br />
        Email: <a href="mailto:info@bdsnation.com">info@bdsnation.com</a>
      </p>
    </LegalPage>
  );
}
