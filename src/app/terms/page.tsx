import type { Metadata } from "next";
import { LegalPage, Section } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service" updated="[date]">
      <Section title="Who we are">
        <p>
          This website is operated by [registered business name], [registered
          address], GSTIN [GSTIN], trading as Flying Dev. You can reach us at
          [support email] or [support phone].
        </p>
      </Section>

      <Section title="What we do">
        <p>
          We repair mobile phones at your address or by collecting and returning
          the device, within the Delhi NCR pincodes listed during booking.
        </p>
      </Section>

      <Section title="Prices and estimates">
        <p>
          Prices shown on this website are estimates based on the model and fault
          you select. The final price is confirmed by our technician after
          inspecting the device. If the confirmed price differs from the estimate,
          we will tell you before starting work, and you may cancel at no charge.
        </p>
        <p>
          Water damage and motherboard-level faults are always quoted after
          diagnosis. A diagnosis fee of [amount] may apply where the device
          requires workshop inspection and you choose not to proceed.
        </p>
      </Section>

      <Section title="Payment">
        <p>
          Payment is due to the technician once the repair is complete and you
          have tested the device. We do not collect payment through this website.
          We accept [cash / UPI / card]. A GST invoice is issued for every repair.
        </p>
      </Section>

      <Section title="Warranty">
        <p>
          Repairs carry a six-month warranty covering the replaced part and our
          workmanship, starting on the day the device is returned to you. The
          warranty does not cover new physical damage, liquid damage occurring
          after the repair, damage caused by a repair carried out by someone
          else, or faults unrelated to the original repair.
        </p>
        <p>
          To make a warranty claim, contact us with your booking reference. We
          will inspect the device and repair or replace the part at no cost where
          the claim is valid.
        </p>
      </Section>

      <Section title="Your device and your data">
        <p>
          Please back up your data before any repair. We are not responsible for
          data loss occurring during a repair. Remove any screen lock, or share
          it with the technician, where the repair requires the device to be
          tested. Do not hand over SIM cards, memory cards or accessories unless
          asked.
        </p>
        <p>
          Devices left with us for more than [number] days after we notify you
          that a repair is complete may attract a storage charge of [amount] per
          day.
        </p>
      </Section>

      <Section title="Cancellations">
        <p>
          You may cancel a booking at any time before the technician begins work,
          at no charge. If a technician has already travelled to your address, a
          visit charge of [amount] may apply.
        </p>
      </Section>

      <Section title="Liability">
        <p>
          Our liability for any claim relating to a repair is limited to the
          amount you paid for that repair. Nothing in these terms limits any
          right you have under the Consumer Protection Act, 2019.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These terms are governed by the laws of India, and the courts at [city]
          have exclusive jurisdiction.
        </p>
      </Section>
    </LegalPage>
  );
}
