import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteAnalytics from "@/components/SiteAnalytics";

/** Public site chrome: header, footer and visit counting. The admin area has its own layout. */
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <main className="page-content">{children}</main>
      <Footer />
      <SiteAnalytics />
    </>
  );
}
