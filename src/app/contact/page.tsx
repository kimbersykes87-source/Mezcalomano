import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact",
  description:
    "Contact Mezcalómano about the Discovery Deck, our agave directory, or anything else on your mind.",
};

export default function ContactPage() {
  return (
    <div className="contact-page">
      <p className="contact-intro">Have a question? Get in touch.</p>
      <div className="contact-page-form">
        <ContactForm />
      </div>
    </div>
  );
}
