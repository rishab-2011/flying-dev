import type { Metadata } from "next";
import { LegalPage, Section } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "The terms on which Flying Dev repairs your phone: pricing, payment, the six-month warranty, cancellations, your data, and liability.",
};

export default function TermsPage() {
  const phone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+91 85879 49104";

  return (
    <LegalPage title="Terms of service" updated="14 September 2026">
      <Section title="1. Who we are and what these terms cover">
        <p>
          This website is operated by [registered business name] ("Flying Dev",
          "we", "us"), a [proprietorship / partnership / private limited
          company] with its place of business at [registered address],
          GSTIN [GSTIN]. You can reach us on {phone} or at [support email].
        </p>
        <p>
          These terms apply whenever you book a repair through this website, by
          phone, or on WhatsApp. By booking, you accept them. If you do not
          accept them, please do not book.
        </p>
      </Section>

      <Section title="2. What we do">
        <p>
          We repair mobile phones, either at an address you give us
          ("doorstep repair") or by collecting the device, repairing it at our
          workshop and returning it ("pickup and drop"). We work within the
          Delhi NCR pincodes listed on our booking form. That list changes as we
          expand; the list shown at the time you book is the one that applies.
        </p>
        <p>
          We are an independent repair service. We are not an authorised service
          centre for, and are not affiliated with, Apple, Samsung, Xiaomi,
          OnePlus, Realme, Vivo, Oppo, Google, Motorola, Nothing, or any other
          manufacturer. Brand names appear on this site only to identify the
          devices we repair. Having a device repaired by an independent
          provider may affect any remaining manufacturer warranty, and that is
          your decision to make.
        </p>
      </Section>

      <Section title="3. Prices and estimates">
        <p>
          Prices shown on this website are estimates for the model and fault you
          select. They are not a binding quotation. The final price is confirmed
          by our technician after inspecting the device, because the visible
          symptom is not always the whole fault — a cracked screen can sit on
          top of a damaged display connector, and a phone that will not charge
          may need a port or a board-level repair.
        </p>
        <p>
          If the confirmed price differs from the estimate, we will tell you
          before starting any work. You may then proceed, or cancel at no
          charge.
        </p>
        <p>
          Water damage and motherboard faults are always quoted after diagnosis.
          Where such a device must come to our workshop and you choose not to
          proceed after the diagnosis, a diagnostic fee of [amount, or "no fee"]
          applies.
        </p>
      </Section>

      <Section title="4. Payment">
        <p>
          Payment is due once the repair is complete and you have tested the
          device. We do not take payment through this website and never ask for
          an advance to confirm a booking. We accept [cash / UPI / card].
        </p>
        <p>
          A GST invoice is issued for every repair. Prices shown on this site
          are inclusive of GST unless stated otherwise.
        </p>
        <p>
          If anyone contacts you asking for an advance payment, an OTP, or a
          transfer to a personal account in our name, it is not us. Call us on
          {" "}{phone} before paying anything.
        </p>
      </Section>

      <Section title="5. The six-month warranty">
        <p>
          Every repair carries a six-month warranty on the replaced part and on
          our workmanship, starting the day the device is returned to you. Your
          booking reference is your warranty record.
        </p>
        <p>The warranty does not cover:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>new physical damage, including a fresh drop or crack;</li>
          <li>liquid damage occurring after the repair;</li>
          <li>
            damage caused by anyone else opening the device, including another
            repair provider;
          </li>
          <li>
            faults unrelated to the part we replaced, or pre-existing faults we
            told you about at the time of repair;
          </li>
          <li>
            removal of the warranty seal or tampering with it, where one is
            applied;
          </li>
          <li>normal wear, or loss and theft of the device.</li>
        </ul>
        <p>
          To claim, contact us with your booking reference. We will inspect the
          device and, where the claim is valid, repair or replace the part at no
          cost. If we cannot repair it, we will refund what you paid for that
          repair.
        </p>
      </Section>

      <Section title="6. Parts we use">
        <p>
          We use new replacement parts. Where a part is offered in more than one
          grade, we tell you which grade is quoted before you agree, and the
          price reflects it. Replaced parts become our property unless you ask
          for them back at the time of the repair.
        </p>
      </Section>

      <Section title="7. Your device and your data">
        <p>
          <strong>Back up your data before any repair.</strong> Repairs can
          require a device to be reset, and some faults make data unrecoverable
          before we ever touch the phone. We are not responsible for data lost
          during a repair, and we do not offer a data recovery service.
        </p>
        <p>
          Remove your SIM card, memory card and any case or accessory before
          handing the device over, unless we ask for them. Where a repair must
          be tested — a screen, a camera, a speaker — we will need the device
          unlocked, either by you being present or by you sharing the passcode.
          We do not access your photos, messages, accounts or files beyond what
          testing the repair requires.
        </p>
        <p>
          You confirm that the device is yours or that you have the owner's
          permission to have it repaired. We may decline a device we have reason
          to believe is stolen, and may report it.
        </p>
        <p>
          Devices left with us after we notify you that a repair is complete may
          attract a storage charge of [amount] per day after [number] days. We
          will contact you at the number you gave us before any device is held
          for longer than [number] days.
        </p>
      </Section>

      <Section title="8. Appointments and cancellations">
        <p>
          You may cancel or reschedule at any time before the technician begins
          work, free of charge — call or message us on {phone}.
        </p>
        <p>
          If our technician has already travelled to your address and the repair
          does not go ahead for a reason within your control — nobody present,
          the device unavailable, or you decline the confirmed price — a visit
          charge of [amount, or "no charge"] applies.
        </p>
        <p>
          We will tell you as soon as we can if we need to reschedule. Slots are
          two-hour windows and we call before arriving; traffic and earlier jobs
          occasionally move them.
        </p>
      </Section>

      <Section title="9. When we cannot repair a device">
        <p>
          Some devices cannot be repaired economically or at all. If we find
          that after opening the device, we will reassemble it and return it to
          you in the condition we received it, so far as that is possible, and
          you pay nothing beyond any diagnostic fee agreed in advance. Opening a
          damaged device sometimes reveals further damage that we could not see
          beforehand, and we will explain anything we find.
        </p>
      </Section>

      <Section title="10. Liability">
        <p>
          Our liability for any claim arising from a repair is limited to the
          amount you paid for that repair. We are not liable for indirect or
          consequential loss, including lost income, lost data, or the cost of a
          replacement device while yours is with us.
        </p>
        <p>
          Nothing in these terms limits your rights under the Consumer
          Protection Act, 2019, or any other law that cannot be excluded by
          agreement.
        </p>
      </Section>

      <Section title="11. Complaints">
        <p>
          Tell us first — most problems are quickest to fix directly. Call or
          message {phone}, or write to [support email] with your booking
          reference. We aim to respond within [number] working days.
        </p>
        <p>
          Grievance Officer: [name], [email], [phone]. If you are not satisfied
          with our response you may approach the consumer forum with
          jurisdiction over your area.
        </p>
      </Section>

      <Section title="12. Changes to these terms">
        <p>
          We may update these terms. The version published on this page when you
          book is the version that applies to that booking.
        </p>
      </Section>

      <Section title="13. Governing law">
        <p>
          These terms are governed by the laws of India. Subject to the Consumer
          Protection Act, 2019, the courts at [city] have jurisdiction.
        </p>
      </Section>
    </LegalPage>
  );
}
