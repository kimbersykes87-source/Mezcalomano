import GiveawayReveal from "./GiveawayReveal";

/**
 * The 7 Dec email links here with ?c=<their code>, so nobody types an address and a link only ever opens its own
 * result. The address is no longer accepted on the URL: it used to ride in ?e=, which put it in browser history and
 * in the referrer on the way out to the directory, and let anyone read anyone else's result by editing it.
 */
export default async function GiveawayPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v ?? "").trim();
  // ?preview=<signature> is the rehearsal flag. It is verified server side on every lookup, so an invalid one simply
  // does nothing, and it is left in the URL on purpose so a tester can reload.
  return <GiveawayReveal initialCode={one(sp.c).slice(0, 32)} preview={one(sp.preview).slice(0, 64)} />;
}
