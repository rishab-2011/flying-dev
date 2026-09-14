import type { Metadata } from "next";
import { LegalPage, Section } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What Flying Dev collects when you book a repair, why we collect it, who sees it, how long we keep it, and how to have it deleted.",
};

export default function PrivacyPage() {
  const phone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+91 85879 49104";

  return (
    <LegalPage title="Privacy policy" updated="14 September 2026">
      <Section title="1. Who is responsible for your information">
        <p>
          [registered business name], trading as Flying Dev, of [registered
          address], decides how and why your information is used. Contact us on
          {" "}{phone} or at [support email].
        </p>
      </Section>

      <Section title="2. What we collect">
        <p>When you book a repair:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>your name and mobile number;</li>
          <li>your email address, if you give one;</li>
          <li>
            the address where the repair happens, including pincode and any
            landmark;
          </li>
          <li>your device, the fault, and anything you tell us about it;</li>
          <li>your chosen slot, and the notes our team adds while working.</li>
        </ul>
        <p>
          If you create an account we also store a one-way scrambled version of
          your password, never the password itself — we cannot read it, and
          nobody here can tell you what it is.
        </p>
        <p>
          Our servers record the internet address a request comes from, briefly,
          to limit abuse of the booking and login forms. We do not use
          advertising trackers or third-party analytics cookies on this site.
        </p>
        <p>
          <strong>We do not collect anything from your device itself.</strong>{" "}
          Repairing a phone sometimes requires unlocking it to test the work.
          Our technicians do not open your photos, messages, accounts or files,
          and we do not copy anything off your device.
        </p>
      </Section>

      <Section title="3. Why we use it, and on what basis">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>To carry out the repair you booked</strong> — reaching your
            address, quoting the right price, doing the work. Without this
            information we cannot provide the service.
          </li>
          <li>
            <strong>To contact you about that repair</strong> — confirming a
            slot, telling you it is ready, answering questions, by phone or
            WhatsApp.
          </li>
          <li>
            <strong>To honour your six-month warranty</strong> — a claim needs
            the record of what we replaced and when.
          </li>
          <li>
            <strong>To issue a GST invoice and keep tax records</strong>, as the
            law requires.
          </li>
          <li>
            <strong>To protect the service</strong> from automated abuse of our
            forms.
          </li>
        </ul>
        <p>
          We do not sell your information, rent it, or share it for anyone
          else's marketing. We do not send promotional messages unless you ask
          us to.
        </p>
      </Section>

      <Section title="4. Who else sees it">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>the technician assigned to your repair — name, number, address;</li>
          <li>
            the companies that run this website and its database on our behalf
            ([hosting provider], [database provider]), which store the data
            under contract and may not use it for anything else;
          </li>
          <li>
            WhatsApp, when you or we message you there — that conversation is
            subject to WhatsApp's own privacy terms;
          </li>
          <li>our accountant, for invoicing and tax filing;</li>
          <li>law enforcement or a court, where the law requires it.</li>
        </ul>
        <p>
          Some of these providers store data on servers outside India. We choose
          providers that protect it to a comparable standard.
        </p>
      </Section>

      <Section title="5. WhatsApp and calls">
        <p>
          We use the mobile number you give us to contact you about your repair,
          by call or WhatsApp. That is part of providing the service, not
          marketing. Tell us at any time if you would rather we only called, or
          only messaged, and we will note it against your booking.
        </p>
      </Section>

      <Section title="6. How long we keep it">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Booking and repair records:</strong> [number] years — long
            enough to cover the warranty period and the record-keeping that tax
            law requires.
          </li>
          <li>
            <strong>Your account:</strong> until you ask us to delete it.
          </li>
          <li>
            <strong>Abuse-prevention records:</strong> cleared automatically
            within hours.
          </li>
        </ul>
      </Section>

      <Section title="7. Keeping it safe">
        <p>
          Access to bookings is limited to people who need it, behind an
          individual login. Passwords are stored scrambled and one-way. Traffic
          between your browser and this site is encrypted. No system is
          perfectly secure, but if a breach ever affected your information we
          would tell you and the authorities promptly.
        </p>
      </Section>

      <Section title="8. Your rights">
        <p>You can ask us to:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>give you a copy of what we hold about you;</li>
          <li>correct anything that is wrong;</li>
          <li>
            delete your account and personal details — though we must keep
            invoice records for the period tax law requires;
          </li>
          <li>stop contacting you, other than about a repair in progress.</li>
        </ul>
        <p>
          Write to [support email] or call {phone}. We will respond within
          [number] days. We may ask you to confirm your identity first, so that
          nobody else can make a request in your name.
        </p>
      </Section>

      <Section title="9. Children">
        <p>
          This service is for adults. We do not knowingly take bookings from
          anyone under 18. If a device belongs to a child, the booking should be
          made by a parent or guardian.
        </p>
      </Section>

      <Section title="10. Changes and contact">
        <p>
          If we change this policy we will update the date at the top of this
          page. For anything about your information, including a complaint,
          contact our Grievance Officer: [name], [email], [phone].
        </p>
      </Section>
    </LegalPage>
  );
}
