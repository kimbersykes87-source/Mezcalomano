import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/sessions";

const CUSTOMER_COOKIE = "customer_session";

export const getCustomerSession = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  return getSession("customer", token);
};

export const requireCustomer = async () => {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/account/login");
  }
  return session;
};
