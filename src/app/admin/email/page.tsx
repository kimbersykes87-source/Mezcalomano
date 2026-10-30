import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Email" };

export default async function Page() {
  await requireAdmin("/email");
  return (
    <div className="adm-wrap">
      <div className="adm-soon">
        <h1>Email</h1>
        <p>List size, new subscribers and where they came from, unsubscribes and campaign results.</p>
        <p>This page is being built. See the plan in the project docs.</p>
      </div>
    </div>
  );
}
