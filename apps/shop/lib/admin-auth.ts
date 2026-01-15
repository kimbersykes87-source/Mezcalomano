import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/sessions";

const ADMIN_COOKIE = "admin_session";

export const getAdminSession = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return getSession("admin", token);
};

export const requireAdmin = async () => {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
};
