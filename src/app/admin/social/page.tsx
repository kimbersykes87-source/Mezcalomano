import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Social Media" };

export default async function Page() {
  await requireAdmin("/social");
  return (
    <div className="adm-wrap">
      <div className="adm-soon">
        <h1>Social Media</h1>
        <p>Instagram and TikTok growth, posts and clicks through to the site.</p>
        <p>This page is being built. See the plan in the project docs.</p>
      </div>
    </div>
  );
}
