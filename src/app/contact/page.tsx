import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact",
  description: "Get in touch with Mezcalómano",
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
