import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact",
  description:
    "Get in touch with Mezcalómano. Need help with an order, a shipping question, or anything else? We'll reply within 1 to 2 business days.",
};

export default function ContactPage() {
  return (
    <div className="contact-page">
      <header className="contact-intro">
        <h1 className="contact-heading">Get in touch</h1>
        <p>Need help with an order, a shipping question, or anything else? Use the form below.</p>
        <p>We&apos;ll reply within 1 to 2 business days.</p>
      </header>
      <div className="contact-page-form">
        <ContactForm />
      </div>
    </div>
  );
}
