import GiveawayReveal from "./GiveawayReveal";

/** The Dec 7 email links here with ?e=<their address> so most people only tap the button. */
export default async function GiveawayPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const raw = sp.e ?? sp.email;
  const email = (Array.isArray(raw) ? raw[0] : raw ?? "").trim().slice(0, 254);
  return <GiveawayReveal initialEmail={email} />;
}
