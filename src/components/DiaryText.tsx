import Link from "next/link";
import type { ReactNode } from "react";

const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

/** Renders **bold** and [label](href) inside a diary paragraph. Paths starting with / are internal links. */
export default function DiaryText({ text }: { text: string }) {
  const parts = text.split(TOKEN).filter(Boolean);
  const out: ReactNode[] = parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (m) {
      const [, label, href] = m;
      return href.startsWith("/") ? (
        <Link key={i} href={href} className="j-link">{label}</Link>
      ) : (
        <a key={i} href={href} className="j-link j-out" target="_blank" rel="noopener noreferrer">{label}</a>
      );
    }
    return part;
  });
  return <>{out}</>;
}
