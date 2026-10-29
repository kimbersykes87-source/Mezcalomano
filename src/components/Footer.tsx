import Link from "next/link";
import MailingListForm from "@/components/MailingListForm";

/** Newsletter band and footer line, on every public page. */
export default function Footer() {
  return (
    <footer>
      <section className="s-news" aria-labelledby="s-news-title">
        <div>
          <h2 id="s-news-title" className="s-news-h">Spot your next agave crush</h2>
          <p>Discovery Deck news, new releases and agave guides. We&apos;re obsessed, and you will be too.</p>
        </div>
        <MailingListForm variant="band" source="footer" />
      </section>
      <div className="s-foot">
        <span>&copy; 2026 Mezcalómano · Explore agave, sip mezcal.</span>
        <nav aria-label="Footer">
          <a href="https://www.instagram.com/mezcalomano/" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://www.tiktok.com/@mezcalomano" target="_blank" rel="noopener noreferrer">TikTok</a>
          <Link href="/press">Press</Link>
          <Link href="/sources">Sources</Link>
        </nav>
      </div>
    </footer>
  );
}
