import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Acquisition / Press" };

export default async function Page() {
  await requireAdmin("/acquisition");
  return (
    <div className="adm-wrap">
      <div className="adm-soon">
        <h1>Acquisition / Press</h1>
        <p>Where visitors and buyers come from: referrers, campaigns, press outlets and creators, with tracked links.</p>
        <p>This page is being built. See the plan in the project docs.</p>
      </div>
    </div>
  );
}
