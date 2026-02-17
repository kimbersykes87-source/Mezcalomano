export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-social">
          <a href="https://www.instagram.com/mezcalomano/" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
            <img src="/assets/icons/icon_instagram.svg" alt="" width={24} height={24} />
          </a>
          <a href="https://www.tiktok.com/@mezcalomano" aria-label="TikTok" target="_blank" rel="noopener noreferrer">
            <img src="/assets/icons/icon_tiktok.svg" alt="" width={24} height={24} />
          </a>
        </div>
        <p className="footer-copyright">&copy; 2026 Mezcalómano. All rights reserved.</p>
      </div>
    </footer>
  );
}
