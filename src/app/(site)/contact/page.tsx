import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact",
  description:
    "Get in touch with Mezcalómano. Need help with an order, a shipping question, or anything else? We'll reply within 1 to 2 business days.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <section className="c-main">
      <div className="s-wrap">
        <div>
          <p className="s-eyebrow">Say hola</p>
          <h1>Get in Touch</h1>
          <p>
            Need help with an order, a shipping question, or anything else? Use the form and
            we&apos;ll take it from there.
          </p>
          <div className="c-note">
            <i aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </i>
            <span>We&apos;ll reply within 1 to 2 business days.</span>
          </div>
        </div>
        <div className="c-form">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
