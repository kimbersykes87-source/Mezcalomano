import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shop" };

export default async function Page() {
  await requireAdmin("/shop");
  return (
    <div className="adm-wrap">
      <div className="adm-soon">
        <h1>Shop</h1>
        <p>Sessions, funnel, orders, sales, products, discount codes and where buyers came from.</p>
        <p>This page is being built. See the plan in the project docs.</p>
      </div>
    </div>
  );
}
