import type { Metadata } from "next";
import { LegalPage, Section } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="[date]">
      <Section title="What we collect">
        <p>
          When you book a repair we collect your name, mobile number, optional
          email address, the address where the repair will happen, and details of
          the device and fault. If you create an account we also store a hashed
          version of your password — never the password itself.
        </p>
      </Section>

      <Section title="Why we collect it">
        <p>
          To carry out the repair you booked, to contact you about it on WhatsApp
          or by phone, to issue an invoice, and to honour your warranty. We do not
          sell your information to anyone.
        </p>
      </Section>

      <Section title="Who we share it with">
        <p>
          Only the technician assigned to your repair, and the service providers
          we use to run this website and send messages ([hosting provider],
          [messaging provider]). We share information with law enforcement only
          where required by law.
        </p>
      </Section>

      <Section title="WhatsApp messages">
        <p>
          We use your mobile number to send booking and repair updates on
          WhatsApp. You can ask us to stop at any time by replying to any message
          or contacting us at [support email].
        </p>
      </Section>

      <Section title="How long we keep it">
        <p>
          Booking records are kept for [number] years so we can honour warranty
          claims and meet tax record-keeping requirements. You can ask us to
          delete your account and personal details at any time, subject to those
          obligations.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          You can ask us for a copy of the information we hold about you, ask us
          to correct it, or ask us to delete it. Write to [support email] and we
          will respond within [number] days.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          [registered business name], [registered address]. Email [support email],
          phone [support phone].
        </p>
      </Section>
    </LegalPage>
  );
}
