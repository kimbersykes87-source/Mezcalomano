import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/admin/auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Log in" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isLoggedIn()) redirect("/admin");
  return (
    <div className="adm-login">
      <p className="adm-brand" style={{ marginBottom: 16 }}>
        Mezcal<span>ó</span>mano <span>admin</span>
      </p>
      <LoginForm siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? ""} />
    </div>
  );
}
